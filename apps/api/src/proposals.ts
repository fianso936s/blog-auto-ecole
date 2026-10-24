import type {Hono} from 'hono';
import {z} from 'zod';
import {categories} from '@repere/core';
import {pool} from './db.js';
import {ApiError,writer,type Env} from './security.js';
import {sendMail} from './mailer.js';
const proposalSchema=z.object({
 id:z.uuid(),name:z.string().trim().min(1).max(120),category:z.enum(categories),
 lat:z.number().min(-90).max(90),lng:z.number().min(-180).max(180),
 remark:z.string().trim().max(1000).default(''),
 routeId:z.uuid().nullable().default(null),examCenter:z.string().trim().min(1).max(80).nullable().default(null),
}).strict();
const columns=`p.id,p.student_id AS "studentId",u.name AS "studentName",p.name,p.category,p.lat,p.lng,p.remark,p.route_id AS "routeId",r.name AS "routeName",COALESCE(p.exam_center,r.exam_center) AS "examCenter",p.status,p.created_at AS "createdAt",p.spot_id AS "spotId"`;
const from=`FROM spot_proposals p JOIN users u ON u.id=p.student_id LEFT JOIN routes r ON r.id=p.route_id`;
/** Who reviews a student's proposals: the director, or a teacher of that student. */
const reviewable=`($1='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=p.student_id AND ts.teacher_id=$2))`;
export function installProposals(app:Hono<Env>){
 // A student proposes a repère on the map, tied to a route or an exam centre.
 app.post('/v1/proposals',async c=>{
  const p=c.get('profile');if(p.role!=='student')throw new ApiError(403,'Les enseignants ajoutent directement leurs repères.');
  const data=proposalSchema.parse(await c.req.json());
  if(!data.routeId&&!data.examCenter)throw new ApiError(400,'Indiquez le parcours ou le centre d’examen concerné.');
  if(data.routeId){const visible=await pool.query("SELECT 1 FROM routes r WHERE r.id=$1 AND (r.status='published' OR EXISTS(SELECT 1 FROM assignments a WHERE a.route_id=r.id AND a.student_id=$2))",[data.routeId,p.id]);if(!visible.rows.length)throw new ApiError(404,'Parcours introuvable.');}
  const pending=await pool.query("SELECT count(*)::int AS n FROM spot_proposals WHERE student_id=$1 AND status='pending'",[p.id]);
  if(pending.rows[0].n>=30)throw new ApiError(429,'Vous avez déjà 30 propositions en attente : attendez qu’elles soient relues.');
  const saved=await pool.query(`INSERT INTO spot_proposals(id,student_id,name,category,lat,lng,remark,route_id,exam_center) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING RETURNING id`,[data.id,p.id,data.name,data.category,data.lat,data.lng,data.remark,data.routeId,data.examCenter]);
  const row=(await pool.query(`SELECT ${columns} ${from} WHERE p.id=$1 AND p.student_id=$2`,[data.id,p.id])).rows[0];
  if(!row)throw new ApiError(409,'Cette proposition existe déjà.');
  if(saved.rows.length){
   // Tell the reviewers: the student's teachers, or the directors when the student has none.
   const reviewers=await pool.query(`SELECT DISTINCT u.email,u.name FROM users u WHERE u.email IS NOT NULL AND (u.id IN (SELECT teacher_id FROM teacher_students WHERE student_id=$1) OR (u.role='admin' AND NOT EXISTS(SELECT 1 FROM teacher_students WHERE student_id=$1)))`,[p.id]);
   const where=row.routeName?`parcours « ${row.routeName} »`:`centre d’examen de ${row.examCenter}`;
   await Promise.all(reviewers.rows.map((r:any)=>sendMail({to:r.email,subject:`Nouveau repère proposé par ${p.name||'un élève'} : ${row.name}`,
    text:`Bonjour ${r.name||''},\n${p.name||'Un élève'} propose un repère sur le ${where}.\nRepère : ${row.name} (${row.category})${row.remark?`\nSa remarque : ${row.remark}`:''}\nOuvrez la carte puis « Propositions » pour compléter le commentaire et le publier.`})));
  }
  return c.json({proposal:row},201);
 });
 // Students see their own proposals; reviewers see the ones to review (pending by default).
 app.get('/v1/proposals',async c=>{
  const p=c.get('profile'),status=z.enum(['pending','accepted','rejected','all']).catch('pending').parse(c.req.query('status')||'pending');
  if(p.role==='student'){const rows=await pool.query(`SELECT ${columns} ${from} WHERE p.student_id=$1 ORDER BY p.created_at DESC LIMIT 200`,[p.id]);return c.json({proposals:rows.rows});}
  writer(p);
  const rows=await pool.query(`SELECT ${columns} ${from} WHERE ${reviewable} AND ($3='all' OR p.status=$3) ORDER BY p.created_at ${status==='pending'?'ASC':'DESC'} LIMIT 300`,[p.role,p.id,status]);
  return c.json({proposals:rows.rows});
 });
 // The reviewer published the completed repère (accepted, with its spot) or turned the proposal down.
 app.post('/v1/proposals/:id/resolve',async c=>{
  const p=c.get('profile');writer(p);const id=z.uuid().parse(c.req.param('id'));
  const data=z.object({status:z.enum(['accepted','rejected']),spotId:z.uuid().optional()}).strict().parse(await c.req.json());
  if(data.status==='accepted'&&!data.spotId)throw new ApiError(400,'Repère publié manquant.');
  const updated=await pool.query(`UPDATE spot_proposals p SET status=$4,spot_id=$5,reviewed_by=$2,reviewed_at=now() WHERE p.id=$3 AND p.status='pending' AND ${reviewable} RETURNING p.student_id`,[p.role,p.id,id,data.status,data.spotId||null]);
  if(!updated.rows.length)throw new ApiError(404,'Proposition introuvable ou déjà traitée.');
  return c.json({ok:true});
 });
}
