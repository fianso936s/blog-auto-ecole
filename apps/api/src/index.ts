import {installMetaDevices} from "./meta-devices.js";
import {installTeaching} from "./teaching.js";
import {installProposals} from "./proposals.js";
import productContent from "./product-content.json";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { pool, transaction } from "./db.js";
import { installModeration, visibleContent } from "./moderation.js";
import { installAuth } from "./auth.js";
import { installRoutes } from "./routes.js";
import { installContentEvents } from "./content-events.js";
import { installCourses } from "./courses.js";
import { storageReady } from "./video-storage.js";
import { installVideos } from "./videos.js";
import { installLive } from "./live.js";
import { installRealtime, stopModeratedRTC, realtimeHealth } from "./webrtc.js";
import {
  anonymousQuota,
  ApiError,
  authenticate,
  quota,
  hash,
  writer,
  type Env,
} from "./security.js";
import { authPage, legalPage, replayPage, supportPage, resetPasswordPage } from "./pages.js";
import { authBundle } from "./generated-auth.js";
import { resetBundle } from "./generated-reset.js";
export function createApp() {
  const app = new Hono<Env>();
  app.use(
    "*",
    secureHeaders({
      referrerPolicy: false,
      xFrameOptions: false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use("*", async (c, next) => {
    c.header("Referrer-Policy", c.req.path === "/streetview" ? "strict-origin-when-cross-origin" : "no-referrer");
    if (c.req.path === "/streetview") {
      c.header("Content-Security-Policy", "frame-ancestors 'self' https://blog-auto-ecole.vercel.app");
    } else c.header("X-Frame-Options", "DENY");
    c.header("Cache-Control", "no-store");
    c.header("X-Content-Type-Options", "nosniff");
    if(['/auth','/reset-password','/privacy','/terms','/support','/meta/callback'].includes(c.req.path))
      c.header("Content-Security-Policy","default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    const origin = c.req.header("origin");
    const own = new URL(c.req.url).origin;
    if (origin && origin !== own && origin !== "reperespot://")
      throw new ApiError(403, "Origine refusée.");
    await next();
  });
  app.use("*", async(c,next)=>{
    if(c.req.path.startsWith('/v1/auth/')||c.req.path.startsWith('/api/auth/')){
      return bodyLimit({maxSize:16*1024,onError:c=>c.json({error:"Demande de connexion trop volumineuse."},413)})(c,next);
    }
    return next();
  });
  app.use(
    "*",
    bodyLimit({
      maxSize: 12 * 1024 * 1024,
      onError: (c) =>
        c.json({ error: "Le fichier dépasse la taille autorisée." }, 413),
    }),
  );
  app.onError((e, c) => {
    if (e instanceof z.ZodError)
      return c.json(
        { error: e.issues[0]?.code === "custom" ? e.issues[0].message : "Certaines données du parcours sont invalides. Réessayez la synchronisation ou ouvrez le diagnostic." },
        400,
      );
    if (e instanceof ApiError) {
      if (e.status === 429) c.header("Retry-After", "60");
      return c.json({ error: e.message }, e.status as 400);
    }
    console.error("api_error", {
      name: e.name,
      message: e instanceof SyntaxError ? "Invalid JSON" : "Unexpected error",
    });
    return c.json(
      {
        error:
          "Le service est temporairement indisponible. Vos données locales sont conservées.",
      },
      e instanceof SyntaxError ? 400 : 503,
    );
  });
  app.notFound((c) => c.json({ error: "Ressource introuvable." }, 404));
  // Authentication payloads never need the photo-upload allowance.
  // Apple fetches this public document at installation to verify Meta callbacks.
  app.get("/.well-known/apple-app-site-association", (c) =>
    c.json({
      applinks: {
        apps: [],
        details: [{ appID: "LK3VLK532C.fr.lerepere.spot", paths: ["/meta/callback", "/meta/callback/*"] }],
      },
    }),
  );
  // A browser fallback never echoes or forwards the registration query/token.
  app.get("/meta/callback", (c) =>
    c.html('<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Le Repère Permis</title><h1>Le Repère Permis</h1><p>Ouvrez ce lien sur l’iPhone où Le Repère Permis est installé pour terminer la connexion aux lunettes Meta.</p></html>'),
  );
  // Share only a short-lived public connectivity result, never account data.
  let healthyUntil=0;
  let pendingHealth:Promise<void>|null=null;
  app.get("/health", async (c) => {
    if(Date.now()>=healthyUntil){
      pendingHealth ??= pool.query("SELECT 1").then(()=>{healthyUntil=Date.now()+10000;}).finally(()=>{pendingHealth=null;});
      await pendingHealth;
    }
    return c.json({ ok: true, service: "LE REPERE SPOT", version: productContent.release.version, revision: productContent.release.revision, videoUpload: storageReady(), live: await realtimeHealth() });
  });
  app.use("/v1/auth/*", async(c,next)=>{
    await anonymousQuota(pool,"native:"+(c.req.header("x-forwarded-for")?.split(",")[0] || "unknown"));
    await next();
  });
  app.get("/auth", (c) =>
    c.html(authPage(`${new URL(c.req.url).origin}/api/auth`)),
  );
  app.get("/reset-password", (c) =>
    c.html(resetPasswordPage(`${new URL(c.req.url).origin}/api/auth`)),
  );
  app.get("/assets/reset.js", (c) => {
    c.header("Content-Type", "text/javascript; charset=utf-8");
    return c.body(resetBundle);
  });
  app.all("/api/auth/*", async (c) => {
    const base =
      process.env.APP_AUTH_BASE_URL || process.env.NEON_AUTH_BASE_URL;
    if (!base)
      throw new ApiError(503, "Authentification en cours de configuration.");
    const suffix = c.req.path.slice("/api/auth/".length);
    const allowed=new Set(["sign-in/email","sign-up/email","get-session","token","sign-out","update-user","email-otp/send-verification-otp","email-otp/verify-email","email-otp/request-password-reset","email-otp/reset-password"]);
    if(!allowed.has(suffix))throw new ApiError(404,"Fonction de connexion indisponible.");
    if(c.req.method!=="GET" && c.req.method!=="POST")throw new ApiError(405,"Méthode refusée.");
    await anonymousQuota(pool,"managed:"+(c.req.header("x-forwarded-for")?.split(",")[0] || "unknown"));
    if (!/^[a-zA-Z0-9/_-]+$/.test(suffix))
      throw new ApiError(400, "Chemin de connexion invalide.");
    if (suffix === "sign-in/email-otp")
      throw new ApiError(403, "Connectez-vous avec votre adresse e-mail et votre mot de passe.");
    if (suffix === "email-otp/send-verification-otp" && c.req.method === "POST") {
      const payload = await c.req.raw.clone().json();
      if (payload.type === "sign-in")
        throw new ApiError(403, "La connexion par code n’est plus disponible.");
    }
    const target = new URL(`${base}/${suffix}`);
    target.search = new URL(c.req.url).search;
    const headers = new Headers();
    for (const name of [
      "content-type",
      "cookie",
      "authorization",
      "x-neon-client-info",
      "x-force-fetch",
    ]) {
      const value = c.req.header(name);
      if (value) headers.set(name, value);
    }
    headers.set("Origin", new URL(c.req.url).origin);
    const resetEmail=suffix==='email-otp/reset-password'&&c.req.method==='POST'
      ? z.email().parse((await c.req.raw.clone().json()).email).toLowerCase():null;
    const upstream = await fetch(target, {
      method: c.req.method,
      signal: AbortSignal.timeout(30000),
      headers,
      redirect: "manual",
      ...(["GET", "HEAD"].includes(c.req.method)
        ? {}
        : { body: await c.req.arrayBuffer() }),
    });
    if(resetEmail&&upstream.ok){
      const result=await upstream.clone().json() as {status?:boolean;success?:boolean};
      if(result.status===true||result.success===true){
        // Provider verified the OTP; revoke both active sessions and outstanding native codes.
        await transaction(async db=>{
          await db.query("DELETE FROM mobile_auth_codes WHERE user_id IN (SELECT id FROM users WHERE lower(email)=$1)",[resetEmail]);
          await db.query("DELETE FROM mobile_sessions WHERE user_id IN (SELECT id FROM users WHERE lower(email)=$1)",[resetEmail]);
        });
      }
    }
    const output = new Headers(upstream.headers);
    output.delete("set-cookie");
    output.delete("content-length");
    for (const cookie of upstream.headers.getSetCookie())
      output.append(
        "Set-Cookie",
        cookie
          .replace(/;\s*Domain=[^;]+/gi, "")
          .replace(/;\s*Path=[^;]+/gi, "; Path=/api/auth"),
      );
    const location = output.get("location");
    if (location?.startsWith(base))
      output.set(
        "location",
        location.replace(base, `${new URL(c.req.url).origin}/api/auth`),
      );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: output,
    });
  });
  app.get("/assets/auth.js", (c) => {
    c.header("Content-Type", "text/javascript; charset=utf-8");
    return c.body(authBundle);
  });
  app.get("/privacy", (c) => c.html(legalPage("privacy")));
  app.get("/support", (c) => c.html(supportPage(process.env.SUPPORT_EMAIL || "Soufiane936s@gmail.com")));
  app.get("/terms", (c) => c.html(legalPage("terms")));
  app.get("/streetview", (c) => {
    // A restricted browser key needs this origin as Google's HTTP referrer.
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    const key = process.env.GOOGLE_MAPS_BROWSER_KEY || "";
    return c.html(replayPage(key));
  });
  installAuth(app);
  app.use("/v1/*", async (c, next) => {
    if (c.req.path.startsWith("/v1/auth/")) return next();
    const p = await authenticate(c, pool);
    await quota(pool, p);
    await next();
  });
  installModeration(app);
  app.get("/v1/product",c=>c.json(productContent.release));
  app.get("/v1/product/content",c=>c.json(productContent));
  installMetaDevices(app);
  installTeaching(app);
  installProposals(app);
  installCourses(app);
  app.get("/v1/me", (c) => c.json(c.get("profile")));
  app.patch("/v1/me", async (c) => {
    const { name } = z
      .object({ name: z.string().trim().min(1).max(100) })
      .parse(await c.req.json());
    const { rows } = await pool.query(
      "UPDATE users SET name=$2 WHERE id=$1 RETURNING id,email,name,role",
      [c.get("profile").id, name],
    );
    return c.json(rows[0]);
  });
  app.post("/v1/logout", async (c) => {
    await pool.query("DELETE FROM mobile_sessions WHERE token_hash=$1", [
      c.get("sessionHash"),
    ]);
    return c.json({ ok: true });
  });
  app.get("/v1/config", async (c) =>
    c.json({
      mapStyleUrl: process.env.MAP_STYLE_URL || null,
      spotPhotosEnabled: true,
      learningEnabled: true,
      streetViewEnabled: !!process.env.GOOGLE_MAPS_BROWSER_KEY,
      privacyUrl: `${new URL(c.req.url).origin}/privacy`,
      termsUrl: `${new URL(c.req.url).origin}/terms`,
    }),
  );
  app.post("/v1/users", async (c) => {
    const actor=c.get("profile");writer(actor);
    const data=z.object({name:z.string().trim().min(1).max(100),email:z.email().trim().toLowerCase().max(254),role:z.enum(["student","teacher"])}).parse(await c.req.json());
    if(data.role==='teacher'&&actor.role!=='admin')throw new ApiError(403,"Seul un administrateur peut créer un enseignant.");
    const user=await transaction(async db=>{
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))",[data.email]);
      const existing=await db.query("SELECT id FROM users WHERE lower(email)=$1",[data.email]);
      if(existing.rowCount)throw new ApiError(409,"Cette adresse possède déjà un espace. Utilisez une invitation pour rattacher un élève existant.");
      const result=await db.query("INSERT INTO users(id,email,name,role) VALUES($1,$2,$3,$4) RETURNING id,email,name,role",['prepared:'+randomBytes(16).toString('hex'),data.email,data.name,data.role]);
      if(data.role==='student')await db.query("INSERT INTO teacher_students(teacher_id,student_id) VALUES($1,$2)",[actor.id,result.rows[0].id]);
      return result.rows[0];
    });
    return c.json({user,activationRequired:true},201);
  });
  app.get("/v1/users", async (c) => {
    if (c.get("profile").role !== "admin") throw new ApiError(403, "Accès administrateur requis.");
    const { rows } = await pool.query("SELECT id,name,email,role FROM users ORDER BY name LIMIT 300");
    return c.json({ students: rows });
  });
  app.get("/v1/students", async (c) => {
    const p = c.get("profile");
    writer(p);
    const { rows } = await pool.query(
      "SELECT u.id,u.name,u.email,u.role FROM users u WHERE u.role='student' AND ($1='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=u.id AND ts.teacher_id=$2)) ORDER BY u.name LIMIT 300",
      [p.role, p.id],
    );
    return c.json({ students: rows });
  });
  app.post("/v1/invitations", async (c) => {
    const p = c.get("profile");
    writer(p);
    const code = randomBytes(8).toString("hex").toUpperCase();
    await pool.query(
      "INSERT INTO student_invitations(code_hash,teacher_id) VALUES($1,$2)",
      [hash(code), p.id],
    );
    return c.json({ code, expiresInDays: 7 }, 201);
  });
  app.post("/v1/invitations/claim", async (c) => {
    const p = c.get("profile");
    if (p.role !== "student")
      throw new ApiError(403, "Cette invitation est destinée à un élève.");
    const { code } = z
      .object({ code: z.string().trim().min(12).max(30) })
      .parse(await c.req.json());
    await transaction(async (db) => {
      const { rows } = await db.query(
        "UPDATE student_invitations SET claimed_by=$2 WHERE code_hash=$1 AND claimed_by IS NULL AND expires_at>now() RETURNING teacher_id",
        [hash(code.toUpperCase()), p.id],
      );
      if (!rows[0])
        throw new ApiError(400, "Invitation expirée ou déjà utilisée.");
      await db.query(
        "INSERT INTO teacher_students(teacher_id,student_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [rows[0].teacher_id, p.id],
      );
    });
    return c.json({ ok: true });
  });
  app.patch("/v1/users/:id/role", async (c) => {
    const p = c.get("profile");
    if (p.role !== "admin")
      throw new ApiError(403, "Accès administrateur nécessaire.");
    const { role } = z
      .object({ role: z.enum(["student", "teacher", "admin"]) })
      .parse(await c.req.json());
    const id = c.req.param("id");
    if (id === p.id)
      throw new ApiError(400, "Vous ne pouvez pas modifier votre propre rôle.");
    const changed=await transaction(async db=>{
      const current=await db.query("SELECT role FROM users WHERE id=$1 FOR UPDATE",[id]);
      if(!current.rowCount)throw new ApiError(404,"Compte introuvable.");
      if(current.rows[0].role===role)return false;
      await db.query("UPDATE users SET role=$2 WHERE id=$1",[id,role]);
      await db.query("DELETE FROM mobile_sessions WHERE user_id=$1",[id]);
      return true;
    });
    if(changed&&role==='student'){
      const live=await pool.query("SELECT id FROM video_sessions WHERE author_id=$1 AND live_status='live'",[id]);
      for(const video of live.rows)await stopModeratedRTC(video.id);
    }
    return c.json({ ok: true, reconnectRequired:changed });
  });
  app.get("/v1/progress", async (c) => {
    const p = c.get("profile");
    const { rows } = await pool.query(
      `SELECT r.id,r.name,p.fix_index,(SELECT count(*) FROM gps_coordinates WHERE route_id=r.id)::int fixes,COALESCE((SELECT count(*) FROM quiz_attempts q JOIN pedagogical_points pp ON pp.id=q.point_id WHERE pp.route_id=r.id AND q.student_id=$1),0)::int attempts,COALESCE((SELECT count(*) FROM quiz_attempts q JOIN pedagogical_points pp ON pp.id=q.point_id WHERE pp.route_id=r.id AND q.student_id=$1 AND q.correct),0)::int correct FROM progress p JOIN routes r ON r.id=p.route_id WHERE p.student_id=$1 AND (r.status='published' OR r.author_id=$1 OR $2='admin' OR EXISTS(SELECT 1 FROM assignments a WHERE a.route_id=r.id AND a.student_id=$1)) AND ${visibleContent('r','route')} ORDER BY p.updated_at DESC`,
      [p.id, p.role],
    );
    return c.json({ progress: rows });
  });
  app.delete("/v1/me", async (c) => {
    const p = c.get("profile");
    const { confirmation } = z
      .object({ confirmation: z.literal("SUPPRIMER") })
      .parse(await c.req.json());
    void confirmation;
    const videos=await pool.query("SELECT id,live_status FROM video_sessions WHERE author_id=$1",[p.id]);
    for(const video of videos.rows){
      if(video.live_status==='live'){ const stopped=await app.request(`/v1/videos/${video.id}/webrtc/stop`,{method:"POST",headers:{Authorization:c.req.header("authorization")!}});if(!stopped.ok)throw new ApiError(503,"Impossible de fermer le direct. Réessayez la suppression."); }
      const removed=await app.request(`/v1/videos/${video.id}`,{method:"DELETE",headers:{Authorization:c.req.header("authorization")!}});
      if(!removed.ok)throw new ApiError(503,"Suppression vidéo en attente. Réessayez avant de supprimer votre compte.");
    }
    await transaction(async (db) => {
      await db.query("DELETE FROM routes WHERE author_id=$1", [p.id]);
      await db.query("DELETE FROM map_spots WHERE author_id=$1", [p.id]);
      await db.query(
        "UPDATE pedagogical_points SET validated_by=NULL WHERE validated_by=$1",
        [p.id],
      );
      await db.query(
        "DELETE FROM photographs WHERE point_id IN (SELECT id FROM pedagogical_points WHERE validated_by=$1)",
        [p.id],
      );
      for (const table of ["quiz_attempts", "progress"])
        await db.query(`DELETE FROM ${table} WHERE student_id=$1`, [p.id]);
      await db.query("DELETE FROM assignments WHERE assigned_by=$1", [p.id]);
      await db.query("DELETE FROM app_settings WHERE updated_by=$1", [p.id]);
      await db.query("DELETE FROM student_invitations WHERE claimed_by=$1", [
        p.id,
      ]);
      await db.query("SELECT public.delete_own_neon_identity($1)", [
        c.get("sessionHash"),
      ]);
      await db.query("DELETE FROM users WHERE id=$1", [p.id]);
    });
    return c.json({
      ok: true,
      message: "Votre profil applicatif et vos données ont été supprimés.",
    });
  });
  installRoutes(app);
  installContentEvents(app);
  installVideos(app);
  installLive(app);
  installRealtime(app);
  return app;
}
export default createApp();
