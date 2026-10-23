/** LiveKit WebRTC SFU: teacher publishes 1 Meta track; at most 10 selected students subscribe.
 * Private, authenticated, server-signed grants. Never put LiveKit secrets in the iOS binary.
 *  Video bytes are NOT stored by Neon and are NOT recorded by the SFU.
 */
import { createHash } from "node:crypto";
import type { Hono } from "hono";
import { SignJWT } from "jose";
import { z } from "zod";
import { pool, transaction, type DB } from "./db.js";
import { ApiError, writer, type Env } from "./security.js";

const uuid = z.string().uuid();
const MAX_STUDENTS = 10;
const MAX_ROOM_PARTICIPANTS = MAX_STUDENTS + 2; // publisher + one owner monitor
const FRESH_MS = 45_000;
const roomName = (videoId: string) => `repere-${videoId}`;
const cfg = () => {
  const url = process.env.LIVEKIT_URL || "";
  const key = process.env.LIVEKIT_API_KEY || "";
  const secret = process.env.LIVEKIT_API_SECRET || "";
  if (!/^wss:\/\/[a-z0-9.-]+(?::\d+)?\/?$/i.test(url) || !key || secret.length < 16) return null;
  return { url, key, secret };
};
const hashIdentity = (role: "teacher" | "student", subject: string, secret: string) =>
  `${role === "teacher" ? "t" : "s"}-${createHash("sha256").update(secret + ":" + subject).digest("hex").slice(0,30)}`;

async function issueToken(
  config: NonNullable<ReturnType<typeof cfg>>,
  identity: string,
  room: string,
  canPublish: boolean,
  admin: boolean = false,
) {
  const video: Record<string, unknown> = {
    room, roomJoin: !admin, roomAdmin: admin, roomCreate: admin, roomList: admin,
    canPublish: canPublish && !admin, canSubscribe: !admin, canPublishData: false,
  };
  return new SignJWT({ video, metadata: "" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(config.key)
    .setSubject(identity)
    .setIssuedAt()
    .setNotBefore("0s")
    .setExpirationTime("60s")
    .sign(new TextEncoder().encode(config.secret));
}
async function roomCommand(config: NonNullable<ReturnType<typeof cfg>>, method: "CreateRoom" | "DeleteRoom" | "RemoveParticipant" | "ListParticipants" | "ListRooms", body: object, room: string) {
  const adminToken = await issueToken(config, "repere-backend", room, false, true);
  const base = config.url.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/$/, "");
  const response = await fetch(`${base}/twirp/livekit.RoomService/${method}`, {
    method: "POST", headers: { Authorization: `Bearer ${adminToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
  });
  const result = await response.json().catch(() => ({})) as {code?:string;msg?:string;participants?:unknown[]};
  if (!response.ok) throw new ApiError(503, `Service live indisponible (${method} : ${response.status}).`);
  return result;
}
async function owned(db: DB, videoId: string, teacherId: string) {
  const r = await db.query("SELECT id,author_id,live_status FROM video_sessions WHERE id=$1 AND author_id=$2", [videoId, teacherId]);
  if (!r.rows[0]) throw new ApiError(404, "Séance introuvable.");
  return r.rows[0];
}
async function authorized(db: DB, videoId: string, p: { id: string; role: string }) {
  const r = await db.query(`SELECT v.id,v.author_id,v.live_status,v.visibility,v.webrtc_last_heartbeat_at
    FROM video_sessions v WHERE v.id=$1 AND (
      v.author_id=$2 OR ($3='student' AND v.visibility='students'
       AND EXISTS (SELECT 1 FROM video_grants g WHERE g.video_id=v.id AND g.student_id=$2)
       AND (EXISTS(SELECT 1 FROM users owner WHERE owner.id=v.author_id AND owner.role='admin') OR EXISTS (SELECT 1 FROM teacher_students t WHERE t.teacher_id=v.author_id AND t.student_id=$2)))
    )`, [videoId,p.id,p.role]);
  if (!r.rows[0]) throw new ApiError(404,"Live privé introuvable ou accès retiré.");
  return r.rows[0];
}
function liveFresh(video: {live_status:string;webrtc_last_heartbeat_at:string|null}) {
  const time = video.webrtc_last_heartbeat_at ? new Date(video.webrtc_last_heartbeat_at).getTime() : 0;
  return video.live_status === "live" && Number.isFinite(time) && Date.now() - time < FRESH_MS;
}
// Moderation must end an existing SFU room as well as denying future API access.
export async function stopModeratedRTC(videoId: string) {
  const result=await pool.query("UPDATE video_sessions SET live_status='ended',live_ended_at=now(),webrtc_last_heartbeat_at=NULL,updated_at=now() WHERE id=$1 AND live_status='live' RETURNING webrtc_started_at",[videoId]);
  const config=cfg();
  if(result.rows[0]?.webrtc_started_at && config){
    try{await roomCommand(config,"DeleteRoom",{room:roomName(videoId)},roomName(videoId));}
    catch{return false;}
  }
  return true;
}
let healthyUntil=0, lastHealth={configured:false,reachable:false};
export async function realtimeHealth() {
  if(Date.now()<healthyUntil)return lastHealth;
  const config=cfg();
  lastHealth={configured:!!config,reachable:false};
  if(config)try {await roomCommand(config,"ListRooms",{},"repere-health");lastHealth.reachable=true;}catch{}
  healthyUntil=Date.now()+60000;
  return lastHealth;
}
export function installRealtime(app: Hono<Env>) {
  app.get("/v1/webrtc/config", c => c.json({
    enabled: !!cfg(), mode: "webrtc-sfu", maxStudents: MAX_STUDENTS,
    message: cfg() ? "WebRTC prêt côté serveur." : "LiveKit non configuré : enregistrement local toujours disponible.",
  }));

  app.post("/v1/videos/:videoId/webrtc/start", async c => {
    const p = c.get("profile"); writer(p);
    const config = cfg(); if (!config) throw new ApiError(503,"Configurez LiveKit côté serveur avant de diffuser.");
    const videoId = uuid.parse(c.req.param("videoId"));
    const {students} = z.object({ students: z.array(z.string().min(1).max(120)).min(1).max(MAX_STUDENTS)
      .refine(ids => ids.length === new Set(ids).size,"Élève sélectionné plusieurs fois.") }).parse(await c.req.json());
    // Ensure remote room is configured with an actual SFU participant ceiling.
    // A room may remain from a previous crash: reuse the same configured room name.
    const room = roomName(videoId);
    await transaction(async db => {
      await db.query("SELECT pg_advisory_xact_lock(59338877)");
      const video = await owned(db,videoId,p.id);
      await db.query("SELECT id FROM video_sessions WHERE id=$1 FOR UPDATE",[videoId]);
      if (video.live_status !== "idle") throw new ApiError(409,"Cette séance a déjà un direct. Créez une nouvelle séance.");
      const r=await db.query(`SELECT u.id FROM users u WHERE u.id=ANY($1::text[]) AND u.role='student'
        AND ($3='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.teacher_id=$2 AND ts.student_id=u.id))`,[students,p.id,p.role]);
      if (r.rows.length!==students.length) throw new ApiError(403,"Seuls vos élèves liés peuvent regarder ce direct.");
      await roomCommand(config,"CreateRoom",{name:room,max_participants:MAX_ROOM_PARTICIPANTS,empty_timeout:60},room);
      await db.query("DELETE FROM video_grants WHERE video_id=$1",[videoId]);
      for (const studentId of students) await db.query("INSERT INTO video_grants(video_id,student_id,granted_by) VALUES($1,$2,$3)",[videoId,studentId,p.id]);
      await db.query(`UPDATE video_sessions SET live_status='live',visibility='students',
        live_started_at=now(),webrtc_started_at=now(),webrtc_last_heartbeat_at=now(),updated_at=now() WHERE id=$1`,[videoId]);
    });
    return c.json({ok:true,mode:"webrtc",maxStudents:MAX_STUDENTS});
  });

  app.post("/v1/videos/:videoId/webrtc/join", async c => {
    const p=c.get("profile");
    const config=cfg(); if(!config) throw new ApiError(503,"Le live WebRTC n'est pas configuré.");
    const videoId=uuid.parse(c.req.param("videoId"));
    const video=await authorized(pool,videoId,p);
    if(!liveFresh(video)) throw new ApiError(409,"Ce direct n'est pas actif ou la caméra ne répond plus.");
    const {mode}=z.object({mode:z.enum(['publish','watch']).default('publish')}).parse(await c.req.json());
    const owner=video.author_id===p.id,publisher=owner&&mode==='publish';
    if(!publisher && !owner && p.role!=="student") throw new ApiError(403,"Accès étudiant nécessaire.");
    const token=await issueToken(config,hashIdentity(publisher?"teacher":"student",owner&&!publisher?p.id+":monitor":p.id,config.secret),roomName(videoId),publisher);
    return c.json({url:config.url,token,expiresIn:60,publisher,roomId:videoId,maxStudents:MAX_STUDENTS});
  });

  app.get("/v1/videos/:videoId/webrtc/status", async c => {
    const p=c.get("profile");
    const videoId=uuid.parse(c.req.param("videoId"));
    const video=await authorized(pool,videoId,p);
    return c.json({active:liveFresh(video),status:video.live_status,maxStudents:MAX_STUDENTS});
  });

  app.post("/v1/videos/:videoId/webrtc/heartbeat", async c => {
    const p=c.get("profile");writer(p);
    const videoId=uuid.parse(c.req.param("videoId"));
    const result=await pool.query(`UPDATE video_sessions SET webrtc_last_heartbeat_at=now()
      WHERE id=$1 AND author_id=$2 AND live_status='live' RETURNING id`,[videoId,p.id]);
    if(!result.rowCount) throw new ApiError(409,"Le direct est terminé.");
    return c.json({ok:true});
  });

  app.put("/v1/videos/:videoId/webrtc/grants", async c => {
    const p=c.get("profile");writer(p);
    const videoId=uuid.parse(c.req.param("videoId"));
    const {students}=z.object({students:z.array(z.string().min(1).max(120)).max(MAX_STUDENTS)
      .refine(ids=>ids.length===new Set(ids).size,"Doublons interdits.")}).parse(await c.req.json());
    const config=cfg();if(!config)throw new ApiError(503,"LiveKit non configuré.");
    let revoked:string[]=[];
    await transaction(async db=>{
      const video=await owned(db,videoId,p.id);
      if(video.live_status!=="live")throw new ApiError(409,"Aucun live en cours.");
      const check=await db.query(`SELECT id FROM users WHERE id=ANY($1::text[]) AND role='student'
        AND ($3='admin' OR EXISTS(SELECT 1 FROM teacher_students t WHERE t.student_id=users.id AND t.teacher_id=$2))`,[students,p.id,p.role]);
      if(check.rows.length!==students.length)throw new ApiError(403,"Un élève n'est plus autorisé.");
      const previous=await db.query("SELECT student_id FROM video_grants WHERE video_id=$1",[videoId]);
      revoked=previous.rows.map(r=>r.student_id).filter(id=>!students.includes(id));
      await db.query("DELETE FROM video_grants WHERE video_id=$1",[videoId]);
      for(const id of students)await db.query("INSERT INTO video_grants(video_id,student_id,granted_by) VALUES($1,$2,$3)",[videoId,id,p.id]);
      await db.query("UPDATE video_sessions SET visibility=$2,updated_at=now() WHERE id=$1",[videoId,students.length?"students":"private"]);
    });
    let pendingKick=0;
    for(const id of revoked){
      try {await roomCommand(config,"RemoveParticipant",{room:roomName(videoId),identity:hashIdentity("student",id,config.secret)},roomName(videoId));}
      catch {pendingKick++;} // Client also checks status every 5s and disconnects on revocation.
    }
    return c.json({ok:true,selected:students.length,pendingKick});
  });

  app.post("/v1/videos/:videoId/webrtc/stop", async c => {
    const p=c.get("profile");writer(p);
    const videoId=uuid.parse(c.req.param("videoId"));
    const video=await owned(pool,videoId,p.id);
    if(video.live_status!=="live")throw new ApiError(409,"Le direct est déjà terminé.");
    // Fail closed on status, then disconnect participants from SFU.
    await pool.query("UPDATE video_sessions SET live_status='ended',live_ended_at=now(),webrtc_last_heartbeat_at=NULL,updated_at=now() WHERE id=$1 AND author_id=$2",[videoId,p.id]);
    const config=cfg();
    if(config) {
      try{await roomCommand(config,"DeleteRoom",{room:roomName(videoId)},roomName(videoId));}
      catch{ return c.json({ok:true,closedOnApp:true,warning:"Serveur SFU non joignable : fermeture côté élèves sous quelques secondes."}); }
    }
    return c.json({ok:true});
  });
}
