/** Private, delayed live: upload HEVC MP4 fragments to an R2 PRIVATE bucket, no SFU bill.
 *  Every request is authenticated by /v1/* middleware, student access requires BOTH
 *  an explicit video_grant and a current teacher_students relationship.
 */
import { randomUUID } from "node:crypto";
import type { Hono } from "hono";
import { z } from "zod";
import { pool, transaction, type DB } from "./db.js";
import { ApiError, writer, type Env } from "./security.js";
import { storageDelete, storageHead, storageReady, storageSign } from "./video-storage.js";

const id = z.string().uuid();
const MAX_SEGMENT = 60 * 1024 * 1024; // ≤60 MiB; 15-60-second compressed HEVC chunks.
const BUDGET = 7 * 1024 * 1024 * 1024; // shared with private-video uploads; guardrail, not R2 hard cap.
const SEGMENT_LIMIT = 10000;
const playbackPage = z.coerce.number().int().min(0).max(100000);
export type LiveAccess = { id: string; role: string };
export async function assertLiveRead(db: DB, p: LiveAccess, videoId: string) {
  const r = await db.query(`SELECT v.id,v.author_id,v.title,v.live_status,v.visibility,v.route_id
      FROM video_sessions v
      WHERE v.id=$1 AND (v.author_id=$2 OR (
        $3='student' AND v.visibility='students' AND v.live_status IN ('live','ended')
        AND EXISTS(SELECT 1 FROM video_grants g WHERE g.video_id=v.id AND g.student_id=$2)
        AND (EXISTS(SELECT 1 FROM users owner WHERE owner.id=v.author_id AND owner.role='admin') OR EXISTS(SELECT 1 FROM teacher_students t WHERE t.teacher_id=v.author_id AND t.student_id=$2))
      ))`,[videoId,p.id,p.role]);
  if (!r.rows[0]) throw new ApiError(404,"Direct introuvable ou accès retiré.");
  return r.rows[0];
}
async function assertOwner(db: DB, author: string, videoId: string) {
  const r=await db.query("SELECT * FROM video_sessions WHERE id=$1 AND author_id=$2",[videoId,author]);
  if(!r.rows[0]) throw new ApiError(404,"Session introuvable.");
  return r.rows[0];
}
export function installLive(app: Hono<Env>) {
  app.get("/v1/live/config", c => c.json({
    enabled:storageReady(), mode:"delayed-segments", maximumSegmentBytes:MAX_SEGMENT,
    targetLatencySeconds:20, // indicative, depends on capture segment duration and network.
    message:storageReady()?"Live privé différé disponible.":"Live distant inactif tant que R2 privé n'est pas configuré.",
  }));
  // Teacher explicitly chooses the audience; no public, 'all students', or implicit admin access.
  app.post("/v1/videos/:videoId/live/start", async c => {
    const p=c.get("profile");writer(p);
    if(!storageReady()) throw new ApiError(503,"Stockage privé non configuré : le direct reste désactivé.");
    const videoId=id.parse(c.req.param("videoId"));
    const payload=z.object({students:z.array(z.string().min(1).max(120)).min(1).max(100)
      .refine(a=>a.length===new Set(a).size,"Élèves en double.")}).parse(await c.req.json());
    await transaction(async db=>{
      await db.query("SELECT pg_advisory_xact_lock(48172391)");
      const v=await assertOwner(db,p.id,videoId);
      const locked=await db.query("SELECT live_status FROM video_sessions WHERE id=$1 FOR UPDATE",[videoId]);
      if(locked.rows[0].live_status!=='idle')throw new ApiError(409,"Cette diffusion a déjà été démarrée.");
      if(v.state==='uploading')throw new ApiError(409,"Finissez d'abord l'envoi de la vidéo.");
      const allowed=await db.query(`SELECT u.id FROM users u WHERE u.id=ANY($1::text[]) AND u.role='student'
        AND ($3='admin' OR EXISTS(SELECT 1 FROM teacher_students t WHERE t.teacher_id=$2 AND t.student_id=u.id))`,[payload.students,p.id,p.role]);
      if(allowed.rows.length!==payload.students.length)throw new ApiError(403,"Seuls vos élèves liés peuvent recevoir le direct.");
      await db.query("DELETE FROM video_grants WHERE video_id=$1",[videoId]);
      for(const s of payload.students)await db.query("INSERT INTO video_grants(video_id,student_id,granted_by) VALUES($1,$2,$3)",[videoId,s,p.id]);
      await db.query(`UPDATE video_sessions SET visibility='students', live_status='live',
        live_started_at=now(),updated_at=now() WHERE id=$1`,[videoId]);
    });
    return c.json({ok:true,status:"live",audienceCount:payload.students.length});
  });
  // A signed PUT is bound to EXACT byte length. No public upload credentials on iPhone.
  app.post("/v1/videos/:videoId/live/segments",async c=>{
    const p=c.get("profile");writer(p);
    const videoId=id.parse(c.req.param("videoId"));
    const data=z.object({index:z.number().int().min(0).max(SEGMENT_LIMIT-1),
      bytes:z.number().int().min(1).max(MAX_SEGMENT),mimeType:z.literal("video/mp4"),
      startOffsetMs:z.number().int().min(0).max(604800000),
      durationMs:z.number().int().min(250).max(120000),
    }).parse(await c.req.json());
    return c.json(await transaction(async db=>{
      await db.query("SELECT pg_advisory_xact_lock(48172391)");
      const video=await assertOwner(db,p.id,videoId);
      if(!['live','ended'].includes(video.live_status))throw new ApiError(409,"La séance vidéo n'a pas commencé.");
      const v=await db.query("SELECT segment_index FROM video_segments WHERE video_id=$1 AND segment_index=$2",[videoId,data.index]);
      if(v.rowCount)throw new ApiError(409,"Ce segment existe déjà : demandez sa confirmation, sans le réécrire.");
      // Reserve quota across completed/pending single videos AND all live segments.
      const usage=await db.query(`SELECT
        (SELECT COALESCE(SUM(bytes),0) FROM video_sessions WHERE state IN ('uploading','ready'))
        + (SELECT COALESCE(SUM(bytes),0) FROM video_segments) AS total`);
      if(Number(usage.rows[0].total)+data.bytes>BUDGET)throw new ApiError(507,"Budget de stockage gratuit atteint : direct interrompu.");
      const key=`${randomUUID()}.mp4`;
      const ticket=storageSign("PUT",key,data.mimeType,300,new Date(),data.bytes);
      await db.query(`INSERT INTO video_segments(video_id,segment_index,storage_key,bytes,mime_type,start_offset_ms,duration_ms)
        VALUES($1,$2,$3,$4,$5,$6,$7)`,[videoId,data.index,key,data.bytes,data.mimeType,data.startOffsetMs,data.durationMs]);
      return {uploadUrl:ticket.url,headers:ticket.headers,expiresIn:ticket.expiresIn,index:data.index};
    }));
  });
  // Reissue a signed PUT for a reserved chunk after a network failure. Strictly the
  // same object key and byte length, with no second quota reservation.
  app.post("/v1/videos/:videoId/live/segments/:index/retry", async c=>{
    const p=c.get("profile");writer(p);
    const videoId=id.parse(c.req.param("videoId"));
    const index=playbackPage.parse(c.req.param("index"));
    const video=await assertOwner(pool,p.id,videoId);
    if(!['live','ended'].includes(video.live_status))throw new ApiError(409,"Cette séance n'a pas commencé.");
    const r=await pool.query("SELECT * FROM video_segments WHERE video_id=$1 AND segment_index=$2",[videoId,index]);
    const seg=r.rows[0];
    if(!seg || seg.state!=='uploading')throw new ApiError(409,"Segment introuvable ou déjà finalisé.");
    // R2 PUT on the SAME key is safe; the verification endpoint checks final length.
    const sign=storageSign("PUT",seg.storage_key,seg.mime_type,300,new Date(),Number(seg.bytes));
    return c.json({uploadUrl:sign.url,headers:sign.headers,expiresIn:sign.expiresIn,index});
  });
  app.post("/v1/videos/:videoId/live/segments/:index/complete",async c=>{
    const p=c.get("profile");writer(p);
    const videoId=id.parse(c.req.param("videoId"));
    const index=playbackPage.parse(c.req.param("index"));
    await assertOwner(pool,p.id,videoId);
    const r=await pool.query("SELECT * FROM video_segments WHERE video_id=$1 AND segment_index=$2",[videoId,index]);
    const segment=r.rows[0];
    if(!segment)throw new ApiError(404,"Segment inconnu.");
    if(segment.state==='ready')return c.json({ok:true,alreadyComplete:true});
    const file=await storageHead(segment.storage_key);
    if(file.bytes!==Number(segment.bytes)||file.mime.split(';')[0].trim()!=='video/mp4')
      throw new ApiError(409,"Fichier incomplet ou format invalide. Non publié.");
    await pool.query("UPDATE video_segments SET state='ready',uploaded_at=now() WHERE video_id=$1 AND segment_index=$2 AND state='uploading'",[videoId,index]);
    return c.json({ok:true});
  });
  // Client polls for next segments. Individual R2 links expire after 60 seconds;
  // access can be revoked for future polls. Segment bytes never transit via Neon.
  app.get("/v1/videos/:videoId/live/playlist",async c=>{
    const p=c.get("profile");
    const videoId=id.parse(c.req.param("videoId"));
    const from=playbackPage.parse(c.req.query("from")??"0");
    const video=await assertLiveRead(pool,p,videoId);
    const r=await pool.query(`SELECT segment_index,storage_key,duration_ms,start_offset_ms,bytes
      FROM video_segments WHERE video_id=$1 AND state='ready' AND segment_index >= $2
      ORDER BY segment_index LIMIT 30`,[videoId,from]);
    return c.json({id:videoId,title:video.title,status:video.live_status,routeId:video.route_id,
      segments:r.rows.map(s=>({index:s.segment_index,startOffsetMs:Number(s.start_offset_ms),
        durationMs:s.duration_ms,bytes:Number(s.bytes),url:storageSign("GET",s.storage_key,undefined,60).url})),
      nextFrom:r.rows.length?Number(r.rows[r.rows.length-1].segment_index)+1:from,
      pollAfterMs:5000});
  });
  app.post("/v1/videos/:videoId/live/stop",async c=>{
    const p=c.get("profile");writer(p);
    const videoId=id.parse(c.req.param("videoId"));
    const v=await assertOwner(pool,p.id,videoId);
    if(v.live_status!=='live')throw new ApiError(409,"Cette session n'est pas en direct.");
    await pool.query("UPDATE video_sessions SET live_status='ended',live_ended_at=now(),updated_at=now() WHERE id=$1 AND author_id=$2 AND live_status='live'",[videoId,p.id]);
    return c.json({ok:true,status:"ended"});
  });
  // Housekeeping explicit: reclaim objects when an entire live session is deleted.
  // The private video DELETE handler invokes this. A partial failure is retried later.
}
export async function deleteLiveSegments(videoId:string) {
  const rows=await pool.query("SELECT storage_key FROM video_segments WHERE video_id=$1",[videoId]);
  for(const row of rows.rows)await storageDelete(row.storage_key);
}
