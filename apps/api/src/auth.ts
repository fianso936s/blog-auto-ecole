import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Hono } from "hono";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { pool, transaction } from "./db.js";
import {
  ApiError,
  challengeOf,
  equal,
  hash,
  randomToken,
  type Env,
} from "./security.js";
export type VerifiedIdentity = {
  sub: string;
  email: string;
  name: string;
  verified: boolean;
};
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
export async function verifyManagedToken(
  token: string,
): Promise<VerifiedIdentity> {
  const base = process.env.APP_AUTH_BASE_URL || process.env.NEON_AUTH_BASE_URL,
    keys = process.env.APP_AUTH_JWKS_URL || process.env.NEON_AUTH_JWKS_URL;
  if (!base || !keys)
    throw new ApiError(503, "Authentification en cours de configuration.");
  jwks ??= createRemoteJWKSet(new URL(keys));
  const { payload } = await jwtVerify(token, jwks, {
    issuer: new URL(base).origin,
    algorithms: ["EdDSA"],
  });
  if (!payload.sub) throw new ApiError(401, "Identité invalide.");
  // Identity is read from the directory, never from caller-provided email/name/role.
  const { rows } = await pool.query(
    'SELECT id,email,name,"emailVerified" verified FROM neon_auth."user" WHERE id=$1',
    [payload.sub],
  );
  const user = rows[0];
  if (!user) throw new ApiError(401, "Identité invalide.");
  return {
    sub: String(user.id),
    email: String(user.email).toLowerCase(),
    name: String(user.name || user.email),
    verified: Boolean(user.verified),
  };
}
export function installAuth(app: Hono<Env>, verify = verifyManagedToken) {
  app.post("/v1/auth/start", async (c) => {
    const { challenge } = z
      .object({ challenge: z.string().regex(/^[\w-]{43}$/) })
      .parse(await c.req.json());
    const id = randomUUID();
    await pool.query(
      "INSERT INTO mobile_auth_requests(id,challenge) VALUES($1,$2)",
      [id, challenge],
    );
    return c.json({
      url: `${new URL(c.req.url).origin}/auth?request=${id}`,
      request: id,
    });
  });
  app.post("/v1/auth/authorize", async (c) => {
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ") || auth.length>8192)
      throw new ApiError(401, "Identité nécessaire.");
    const { request } = z
      .object({ request: z.uuid() })
      .parse(await c.req.json());
    let identity: VerifiedIdentity;
    try {
      identity = await verify(auth.slice(7));
    } catch (e) {
      if (e instanceof ApiError) throw e;
      console.warn("managed_auth_rejected", {
        code: (e as { code?: string }).code || (e as Error).name,
      });
      throw new ApiError(401, "Session de connexion invalide.");
    }
    if (!identity.verified) throw new ApiError(403, "Vérifiez votre adresse e-mail avant d’ouvrir votre espace.");
    const code = randomToken();
    await transaction(async (db) => {
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [identity.email]);
      const { rows: reqs } = await db.query(
        "DELETE FROM mobile_auth_requests WHERE id=$1 AND expires_at>now() RETURNING challenge",
        [request],
      );
      if (!reqs[0])
        throw new ApiError(
          400,
          "Connexion expirée. Recommencez depuis l’application.",
        );
      const blocked = await db.query(
        "SELECT 1 FROM deleted_auth_subjects WHERE subject=$1",
        [identity.sub],
      );
      if (blocked.rowCount)
        throw new ApiError(
          403,
          "Ce compte a été supprimé. Contactez votre enseignant.",
        );
      const linked = await db.query(
        "SELECT u.* FROM mobile_identities m JOIN users u ON u.id=m.user_id WHERE m.auth_subject=$1",
        [identity.sub],
      );
      let profile = linked.rows[0];
      if (!profile) {
        const existing = await db.query(
          "SELECT * FROM users WHERE lower(email)=$1 ORDER BY created_at LIMIT 1",
          [identity.email],
        );
        const id = existing.rows[0]?.id || `neon:${identity.sub}`;
        const isOwner =
          identity.email === process.env.ADMIN_EMAIL?.toLowerCase();
        const result = await db.query(
          "INSERT INTO users(id,email,name,role) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET email=excluded.email,role=CASE WHEN $5 THEN 'admin' ELSE users.role END RETURNING *",
          [
            id,
            identity.email,
            identity.name,
            isOwner ? "admin" : "student",
            isOwner,
          ],
        );
        profile = result.rows[0];
        await db.query(
          "INSERT INTO mobile_identities(auth_subject,user_id) VALUES($1,$2)",
          [identity.sub, id],
        );
      }
      await db.query(
        "INSERT INTO mobile_auth_codes(code_hash,challenge,user_id) VALUES($1,$2,$3)",
        [hash(code), reqs[0].challenge, profile.id],
      );
    });
    return c.json({
      redirect: `reperespot://auth?code=${encodeURIComponent(code)}`,
    });
  });
  app.post("/v1/auth/exchange", async (c) => {
    const { code, verifier } = z
      .object({
        code: z.string().regex(/^[\w-]{43}$/),
        verifier: z.string().regex(/^[\w-]{43,128}$/),
      })
      .parse(await c.req.json());
    const token = randomToken();
    const profile = await transaction(async (db) => {
      const { rows } = await db.query(
        "SELECT * FROM mobile_auth_codes WHERE code_hash=$1 AND expires_at>now() FOR UPDATE",
        [hash(code)],
      );
      const row = rows[0];
      if (!row || !equal(row.challenge, challengeOf(verifier)))
        throw new ApiError(401, "Connexion invalide ou expirée.");
      await db.query("DELETE FROM mobile_auth_codes WHERE code_hash=$1", [
        hash(code),
      ]);
      await db.query(
        "INSERT INTO mobile_sessions(token_hash,user_id) VALUES($1,$2)",
        [hash(token), row.user_id],
      );
      return (
        await db.query("SELECT id,email,name,role FROM users WHERE id=$1", [
          row.user_id,
        ])
      ).rows[0];
    });
    return c.json({ token, profile, expiresIn: 30 * 86400 });
  });
}
