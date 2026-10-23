import { visibleContent } from "./moderation.js";
import { randomUUID } from "node:crypto";
import type { Hono } from "hono";
import { z } from "zod";
import type { Env } from "./security.js";
import { ApiError, writer } from "./security.js";
import { pool, transaction, type DB } from "./db.js";
import { storageDelete, storageHead, storageReady, storageSign } from "./video-storage.js";
import { deleteLiveSegments } from "./live.js";

const idParam = z.string().uuid();
// Keep beneath free 10 GB-month in ordinary usage, not a provider-enforced spend cap.
const MAX_FILE = 500 * 1024 * 1024; // 500 MiB per clip; long lessons can be segmented.
const MAX_TOTAL = 7 * 1024 * 1024 * 1024; // Reserve 3 GiB of R2 headroom.
const OWNER_LIMIT = 200;
const allowedMime = z.enum(["video/mp4", "video/quicktime"]);

async function owned(db: DB, person: { id: string }, id: string) {
  const { rows } = await db.query("SELECT * FROM video_sessions WHERE id=$1 AND author_id=$2", [id, person.id]);
  if (!rows[0]) throw new ApiError(404, "Vidéo introuvable.");
  return rows[0];
}
async function readableVideo(db: DB, person: { id: string; role: string }, id: string) {
  const { rows } = await db.query(`
    SELECT v.* FROM video_sessions v WHERE v.id=$1 AND (
      v.author_id=$2 OR (
        $3='student' AND v.visibility='students' AND (v.state='ready' OR v.live_status IN ('live','ended'))
        AND EXISTS(SELECT 1 FROM video_grants g WHERE g.video_id=v.id AND g.student_id=$2)
        AND (EXISTS(SELECT 1 FROM users owner WHERE owner.id=v.author_id AND owner.role='admin') OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.teacher_id=v.author_id AND ts.student_id=$2))
      )
    )`, [id, person.id, person.role]);
  if (!rows[0]) throw new ApiError(404, "Vidéo introuvable ou accès retiré.");
  return rows[0];
}
export function installVideos(app: Hono<Env>) {
  app.get("/v1/videos/config", async c => c.json({
    uploadEnabled: storageReady(),
    maxFileBytes: MAX_FILE,
    freeStorageBudgetBytes: MAX_TOTAL,
    defaultVisibility: "private",
    message: storageReady() ? "Partage privé activé." : "Vidéo locale uniquement. Le stockage vidéo distant doit être activé.",
  }));
  app.get("/v1/videos", async c => {
    const p = c.get("profile");
    const { rows } = await pool.query(`
      SELECT v.id,v.author_id,v.route_id,v.title,v.state,v.visibility,v.mime_type,v.bytes,
        v.duration_ms,v.created_at,v.live_status,v.webrtc_started_at,r.name route_name,u.name author_name
      FROM video_sessions v JOIN users u ON u.id=v.author_id
      LEFT JOIN routes r ON r.id=v.route_id
      WHERE ${visibleContent('v','video')} AND (v.author_id=$1 OR ($2='student' AND v.visibility='students' AND (v.state='ready' OR v.live_status IN ('live','ended'))
        AND EXISTS(SELECT 1 FROM video_grants g WHERE g.video_id=v.id AND g.student_id=$1)
        AND (EXISTS(SELECT 1 FROM users owner WHERE owner.id=v.author_id AND owner.role='admin') OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.teacher_id=v.author_id AND ts.student_id=$1))))
      ORDER BY v.created_at DESC LIMIT 150`, [p.id, p.role]);
    return c.json({ videos: rows });
  });
  app.get("/v1/videos/:id", async c => {
    const v=await readableVideo(pool,c.get("profile"),idParam.parse(c.req.param("id")));
    return c.json({id:v.id,authorId:v.author_id,title:v.title,state:v.state,visibility:v.visibility});
  });
  app.post("/v1/videos", async c => {
    const p = c.get("profile"); writer(p);
    const { title, routeId, captureStartedAt, durationMs } = z.object({
      title: z.string().trim().min(1).max(120),
      routeId: z.string().uuid().nullable().optional(),
      captureStartedAt: z.string().datetime().nullable().optional(),
      durationMs: z.number().int().min(0).max(86400000).nullable().optional(),
    }).parse(await c.req.json());
    if (routeId) {
      const owns = await pool.query("SELECT id FROM routes WHERE id=$1 AND author_id=$2", [routeId,p.id]);
      if (!owns.rowCount) throw new ApiError(403, "Ce parcours ne vous appartient pas.");
    }
    const count = await pool.query("SELECT count(*)::int n FROM video_sessions WHERE author_id=$1", [p.id]);
    if (count.rows[0].n >= OWNER_LIMIT) throw new ApiError(409, "Limite de 200 sessions. Archivez d’anciennes vidéos.");
    const id = randomUUID();
    await pool.query(`INSERT INTO video_sessions(id,author_id,route_id,title,duration_ms,capture_started_at)
      VALUES($1,$2,$3,$4,$5,$6)`, [id,p.id,routeId || null,title,durationMs || null,captureStartedAt || null]);
    return c.json({ id, state: "local", visibility: "private" }, 201);
  });
  app.post("/v1/videos/:id/upload", async c => {
    const p = c.get("profile"); writer(p);
    const id = idParam.parse(c.req.param("id"));
    const { bytes, mimeType } = z.object({ bytes: z.number().int().min(1).max(MAX_FILE), mimeType: allowedMime }).parse(await c.req.json());
    // Atomic reserve: prevent concurrent uploads on a single video and avoid accidentally hitting free-tier.
    return c.json(await transaction(async db => {
      const v = await owned(db,p,id);
      const locked = await db.query("SELECT id,state,storage_key FROM video_sessions WHERE id=$1 FOR UPDATE", [id]);
      if (locked.rows[0].state === "ready") throw new ApiError(409,"Cette vidéo est déjà sauvegardée.");
      if (locked.rows[0].state === "uploading") throw new ApiError(409,"Un téléversement est déjà en cours. Réessayez plus tard.");
      // Count both finished videos AND reserved uploads.
      await db.query("SELECT pg_advisory_xact_lock(48172391)"); // serialize reservations across different videos
      const usage = await db.query("SELECT COALESCE(SUM(bytes),0)::text total FROM video_sessions WHERE state IN ('uploading','ready')");
      if (Number(usage.rows[0].total) + bytes > MAX_TOTAL) throw new ApiError(507,"Budget gratuit presque atteint. Libérez de l'espace avant de publier.");
      const key = `${randomUUID()}.mp4`;
      const signed = storageSign("PUT", key, mimeType, 600, new Date(), bytes);
      await db.query(`UPDATE video_sessions SET state='uploading',storage_key=$2,bytes=$3,mime_type=$4,
        visibility='private',updated_at=now() WHERE id=$1`, [id,key,bytes,mimeType]);
      void v;
      return { uploadUrl: signed.url, headers: signed.headers, expiresIn: signed.expiresIn, maxBytes: MAX_FILE };
    }));
  });
  app.post("/v1/videos/:id/retry", async c => {
    const p = c.get("profile"); writer(p);
    const id = idParam.parse(c.req.param("id"));
    const v = await owned(pool, p, id);
    if (v.state !== "uploading") throw new ApiError(409, "Aucun envoi interrompu.");
    // First delete partial or complete remote upload to prevent orphaned billing.
    if (v.storage_key) await storageDelete(v.storage_key);
    await pool.query(`UPDATE video_sessions SET state='local', storage_key=NULL,bytes=0,
      visibility='private',updated_at=now() WHERE id=$1 AND author_id=$2 AND state='uploading'`,[id,p.id]);
    return c.json({ ok: true, state: "local" });
  });
  app.post("/v1/videos/:id/complete", async c => {
    const p = c.get("profile");writer(p);
    const id = idParam.parse(c.req.param("id"));
    const v = await owned(pool,p,id);
    if (v.state === "ready") return c.json({ ok: true, alreadyComplete: true });
    if (v.state !== "uploading" || !v.storage_key) throw new ApiError(409,"Aucun envoi en cours.");
    const file = await storageHead(v.storage_key);
    if (!Number.isFinite(file.bytes) || file.bytes !== Number(v.bytes) || file.bytes > MAX_FILE || file.bytes === 0)
      throw new ApiError(409,"Taille de vidéo incohérente. Publication impossible.");
    if (file.mime.split(";")[0].trim().toLowerCase() !== v.mime_type)
      throw new ApiError(409,"Format du fichier incohérent. Publication impossible.");
    await pool.query("UPDATE video_sessions SET state='ready',updated_at=now() WHERE id=$1 AND author_id=$2 AND state='uploading'",[id,p.id]);
    return c.json({ ok: true, state: "ready", visibility: "private" });
  });
  app.get("/v1/videos/:id/grants", async c => {
    const p = c.get("profile");writer(p);
    const id = idParam.parse(c.req.param("id"));await owned(pool,p,id);
    const { rows }=await pool.query("SELECT student_id FROM video_grants WHERE video_id=$1 ORDER BY student_id",[id]);
    const video = await owned(pool,p,id);
    return c.json({ students: rows.map(r=>r.student_id), published: video.visibility === "students" });
  });
  app.put("/v1/videos/:id/grants", async c => {
    const p=c.get("profile");writer(p);
    const id=idParam.parse(c.req.param("id"));
    const { students, published } = z.object({ students: z.array(z.string().max(120)).max(100).refine(a=>new Set(a).size===a.length,"Élève en double."), published: z.boolean() }).parse(await c.req.json());
    await transaction(async db => {
      const v = await owned(db,p,id);
      await db.query("SELECT id FROM video_sessions WHERE id=$1 FOR UPDATE",[id]);
      if (published && v.state!=="ready") throw new ApiError(409,"Enregistrez d’abord la vidéo dans le stockage privé.");
      const { rows }=await db.query(`SELECT u.id FROM users u WHERE u.id=ANY($1::text[]) AND u.role='student'
        AND ($3='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=u.id AND ts.teacher_id=$2))`, [students,p.id,p.role]);
      if (rows.length!==students.length) throw new ApiError(403,"Sélectionnez uniquement vos élèves liés à votre compte.");
      await db.query("DELETE FROM video_grants WHERE video_id=$1",[id]);
      for (const studentId of students) await db.query("INSERT INTO video_grants(video_id,student_id,granted_by) VALUES($1,$2,$3)",[id,studentId,p.id]);
      await db.query("UPDATE video_sessions SET visibility=$2,updated_at=now() WHERE id=$1",[id,published&&students.length?"students":"private"]);
    });
    return c.json({ ok: true });
  });
  app.get("/v1/videos/:id/playback", async c => {
    const p=c.get("profile");
    const v=await readableVideo(pool,p,idParam.parse(c.req.param("id")));
    if (v.state!=="ready"||!v.storage_key)throw new ApiError(404,"Aucun replay distant disponible.");
    const signed=storageSign("GET",v.storage_key,undefined,300);
    return c.json({ url:signed.url,expiresIn:signed.expiresIn,mimeType:v.mime_type,
      durationMs:v.duration_ms,routeId:v.route_id });
  });
  app.delete("/v1/videos/:id", async c => {
    const p=c.get("profile");writer(p);
    const id=idParam.parse(c.req.param("id"));
    const v=await owned(pool,p,id);
    // Revoke grants and visibility before external deletion; do not leave playable new URLs on failure.
    await pool.query("UPDATE video_sessions SET visibility='private' WHERE id=$1 AND author_id=$2",[id,p.id]);
    await deleteLiveSegments(id);
    if (v.storage_key)await storageDelete(v.storage_key);
    await pool.query("DELETE FROM video_sessions WHERE id=$1 AND author_id=$2",[id,p.id]);
    return c.json({ ok:true });
  });
}
