import type { Hono } from "hono";
import { z } from "zod";
import { pool, transaction } from "./db.js";
import { stopModeratedRTC } from "./webrtc.js";
import { ApiError, type Env } from "./security.js";

const kind = z.enum(["route", "spot", "video"]);
const tables = {route:"routes",spot:"map_spots",video:"video_sessions"} as const;
export function visibleContent(alias: string, type: "route"|"spot"|"video", user = "$1", role = "$2") {
  // All arguments come from constants in server source, never from request input.
  return `(${role}='admin' OR (NOT EXISTS(SELECT 1 FROM blocked_authors b WHERE b.user_id=${user} AND b.author_id=${alias}.author_id) AND NOT EXISTS(SELECT 1 FROM hidden_content h WHERE h.kind='${type}' AND h.resource_id=${alias}.id)))`;
}
export function installModeration(app: Hono<Env>) {
  app.use("/v1/*", async(c,next)=>{
    const match=/^\/v1\/(routes|spots|videos)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})(?:\/|$)/i.exec(c.req.path);
    if(match){
      const type=({routes:"route",spots:"spot",videos:"video"} as const)[match[1] as "routes"|"spots"|"videos"];
      const p=c.get("profile");
      const r=await pool.query(`SELECT id FROM ${tables[type]} x WHERE id=$1 AND NOT ${visibleContent("x",type,"$2","$3")} AND NOT ($4 AND x.author_id=$2)`, [match[2],p.id,p.role,c.req.method==='DELETE']);
      if(r.rowCount)throw new ApiError(404,"Contenu indisponible.");
    }
    return next();
  });
  app.post("/v1/reports",async c=>{
    const p=c.get("profile");
    const data=z.object({kind,resourceId:z.uuid(),reason:z.enum(["inappropriate","privacy","dangerous","other"]),details:z.string().trim().max(1000).default("")}).parse(await c.req.json());
    // A reporter must be able to read the resource; UUID knowledge is not permission.
    const path={route:"routes",spot:"spots",video:"videos"}[data.kind];
    const access=await app.request(`/v1/${path}/${data.resourceId}`,{headers:{Authorization:c.req.header("authorization")!}});
    if(!access.ok)throw new ApiError(404,"Contenu introuvable ou accès retiré.");
    const r=await pool.query(`INSERT INTO content_reports(reporter_id,kind,resource_id,reason,details) VALUES($1,$2,$3,$4,$5) ON CONFLICT(reporter_id,kind,resource_id) DO UPDATE SET reason=excluded.reason,details=excluded.details,status='open',updated_at=now() RETURNING id`,[p.id,data.kind,data.resourceId,data.reason,data.details]);
    return c.json({id:r.rows[0].id,ok:true},201);
  });
  app.get("/v1/blocked-authors",async c=>{
    const r=await pool.query("SELECT b.author_id AS id,u.name FROM blocked_authors b JOIN users u ON u.id=b.author_id WHERE b.user_id=$1 ORDER BY b.created_at DESC",[c.get("profile").id]);return c.json({authors:r.rows});
  });
  app.put("/v1/blocked-authors/:id",async c=>{
    const p=c.get("profile"),id=z.string().min(1).max(200).parse(c.req.param("id"));
    if(id===p.id)throw new ApiError(400,"Vous ne pouvez pas bloquer votre propre compte.");
    // Only authors of content already readable to this account can be blocked.
    const {resourceId,kind:resourceKind}=z.object({resourceId:z.uuid(),kind}).parse(await c.req.json());
    const table=tables[resourceKind];const path={route:"routes",spot:"spots",video:"videos"}[resourceKind];
    const check=await app.request(`/v1/${path}/${resourceId}`,{headers:{Authorization:c.req.header("authorization")!}});
    if(!check.ok)throw new ApiError(404,"Contenu indisponible.");
    const target=await pool.query(`SELECT id FROM ${table} WHERE id=$1 AND author_id=$2`,[resourceId,id]);
    if(!target.rowCount)throw new ApiError(404,"Auteur introuvable.");
    await pool.query("INSERT INTO blocked_authors(user_id,author_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[p.id,id]);
    return c.json({ok:true});
  });
  app.delete("/v1/blocked-authors/:id",async c=>{
    await pool.query("DELETE FROM blocked_authors WHERE user_id=$1 AND author_id=$2",[c.get("profile").id,c.req.param("id")]);return c.json({ok:true});
  });
  app.get("/v1/moderation/reports",async c=>{
    if(c.get("profile").role!=="admin")throw new ApiError(403,"Accès administrateur nécessaire.");
    const r=await pool.query("SELECT id,kind,resource_id,reason,details,status,created_at FROM content_reports WHERE status='open' ORDER BY created_at LIMIT 200");return c.json({reports:r.rows});
  });
  app.get("/v1/moderation/reports/:id/content",async c=>{
    const p=c.get("profile");if(p.role!=="admin")throw new ApiError(403,"Accès administrateur nécessaire.");
    const r=await pool.query("SELECT kind,resource_id FROM content_reports WHERE id=$1",[z.uuid().parse(c.req.param("id"))]);if(!r.rows[0])throw new ApiError(404,"Signalement introuvable.");
    const type=kind.parse(r.rows[0].kind);const content=await pool.query(`SELECT * FROM ${tables[type]} WHERE id=$1`,[r.rows[0].resource_id]);
    if(!content.rows[0])throw new ApiError(404,"Contenu déjà supprimé.");const item=content.rows[0];
    const points=type==='route'?await pool.query("SELECT name,question,explanation FROM pedagogical_points WHERE route_id=$1",[item.id]):null;
    const photos=type==='route'?(await pool.query("SELECT ph.data_url AS \"dataUrl\" FROM photographs ph JOIN pedagogical_points p ON p.id=ph.point_id WHERE p.route_id=$1 LIMIT 30",[item.id])).rows:item.photos||[];
    return c.json({title:item.name||item.title,text:item.note||item.description||'',photos,points:points?.rows||[],video:type==='video'});
  });
  app.post("/v1/moderation/reports/:id/resolve",async c=>{
    const p=c.get("profile");if(p.role!=="admin")throw new ApiError(403,"Accès administrateur nécessaire.");
    const {action}=z.object({action:z.enum(["dismiss","hide"])}).parse(await c.req.json());
    const r=await pool.query("SELECT kind,resource_id FROM content_reports WHERE id=$1",[z.uuid().parse(c.req.param("id"))]);
    if(!r.rows[0])throw new ApiError(404,"Signalement introuvable.");
    await transaction(async db=>{
      if(action==='hide')await db.query("INSERT INTO hidden_content(kind,resource_id,moderated_by) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",[r.rows[0].kind,r.rows[0].resource_id,p.id]);
      await db.query("UPDATE content_reports SET status=$2,updated_at=now() WHERE id=$1",[c.req.param("id"),action==='hide'?'removed':'dismissed']);
    });
    const roomClosed=action==='hide' && r.rows[0].kind==='video'?await stopModeratedRTC(r.rows[0].resource_id):true;
    return c.json({ok:true,roomClosed});
  });
}
