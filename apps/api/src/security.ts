import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Profile } from "@repere/core";
import type { Context } from "hono";
import type { DB } from "./db.js";
export type Env = { Variables: { profile: Profile; sessionHash: string } };
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const challengeOf = (s: string) =>
  createHash("sha256").update(s).digest("base64url");
export const randomToken = () => randomBytes(32).toString("base64url");
export function equal(a: string, b: string) {
  const left=Buffer.from(a),right=Buffer.from(b);
  return left.length===right.length && timingSafeEqual(left,right);
}
export function writer(p: Profile) {
  if (p.role !== "teacher" && p.role !== "admin")
    throw new ApiError(403, "Un compte enseignant est nécessaire.");
}
export function owner(p: Profile, author: string) {
  writer(p);
  if (p.role !== "admin" && p.id !== author)
    throw new ApiError(403, "Ce parcours appartient à un autre enseignant.");
}
export function canRead(
  p: Profile,
  r: { author_id: string; status: string; assigned?: boolean },
) {
  return (
    p.role === "admin" ||
    p.id === r.author_id ||
    r.status === "published" ||
    !!r.assigned
  );
}
export async function authenticate(c: Context<Env>, db: DB) {
  const auth = c.req.header("authorization");
  if (!auth?.startsWith("Bearer ") || auth.length > 200)
    throw new ApiError(401, "Reconnectez-vous pour continuer.");
  const tokenHash = hash(auth.slice(7));
  const { rows } = await db.query(
    "SELECT u.id,u.email,u.name,u.role FROM mobile_sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()",
    [tokenHash],
  );
  if (!rows[0]) throw new ApiError(401, "Votre session a expiré.");
  c.set("profile", rows[0]);
  c.set("sessionHash", tokenHash);
  return rows[0] as Profile;
}
export async function readable(db: DB, p: Profile, id: string, lock = false) {
  const { rows } = await db.query(
    `SELECT r.*,u.name author_name,EXISTS(SELECT 1 FROM assignments a WHERE a.route_id=r.id AND a.student_id=$2) assigned FROM routes r JOIN users u ON u.id=r.author_id WHERE r.id=$1${lock ? " FOR UPDATE OF r" : ""}`,
    [id, p.id],
  );
  const r = rows[0];
  if (!r || !canRead(p, r))
    throw new ApiError(404, "Parcours introuvable ou accès retiré.");
  return r;
}
export async function quota(db: DB, p: Profile) {
  const { rows } = await db.query(
    "INSERT INTO mobile_rate_limits(user_id,bucket) VALUES($1,date_trunc('minute',now())) ON CONFLICT(user_id,bucket) DO UPDATE SET count=mobile_rate_limits.count+1 RETURNING count",
    [p.id],
  );
  if(rows[0].count===1)await db.query("DELETE FROM mobile_rate_limits WHERE user_id=$1 AND bucket<now()-interval '1 day'",[p.id]);
  if (rows[0].count > 120)
    throw new ApiError(429, "Trop de demandes. Réessayez dans une minute.");
}

export async function anonymousQuota(db: DB, client: string) {
  const global=await db.query("INSERT INTO auth_rate_limits(key,bucket) VALUES('global',date_trunc('minute',now())) ON CONFLICT(key,bucket) DO UPDATE SET count=auth_rate_limits.count+1 RETURNING count");
  if(global.rows[0].count>1000)throw new ApiError(429,"Service de connexion occupé. Réessayez dans une minute.");
  if(global.rows[0].count===1){
    await db.query("DELETE FROM auth_rate_limits WHERE bucket<now()-interval '1 hour'");
    await db.query("DELETE FROM mobile_auth_requests WHERE expires_at<now()-interval '1 hour'");
    await db.query("DELETE FROM mobile_auth_codes WHERE expires_at<now()-interval '1 hour'");
  }
  const key=hash(client.slice(0,300));
  const r=await db.query("INSERT INTO auth_rate_limits(key,bucket) VALUES($1,date_trunc('minute',now())) ON CONFLICT(key,bucket) DO UPDATE SET count=auth_rate_limits.count+1 RETURNING count",[key]);
  if(r.rows[0].count>60)throw new ApiError(429,"Trop de tentatives. Réessayez dans une minute.");
}
