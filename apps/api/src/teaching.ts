import {randomUUID} from 'node:crypto';
import type {Hono} from 'hono';
import {z} from 'zod';
import {pool,transaction} from './db.js';
import {ApiError,writer,type Env} from './security.js';
const date=z.string().datetime();
export function installTeaching(app:Hono<Env>){
 async function teacher(p:{id:string;role:string},id:string){writer(p as any);if(p.role!=='admin'&&id!==p.id)throw new ApiError(403,'Vous pouvez modifier uniquement votre planning.');const r=await pool.query("SELECT id FROM users WHERE id=$1 AND role IN ('teacher','admin')",[id]);if(!r.rows.length)throw new ApiError(404,'Enseignant introuvable.');}
 app.get('/v1/teaching/teachers',async c=>{const p=c.get('profile');writer(p);const result=await pool.query("SELECT id,name FROM users WHERE role IN ('teacher','admin') AND ($1='admin' OR id=$2) ORDER BY name",[p.role,p.id]);return c.json({teachers:result.rows});});
 app.get('/v1/teaching/slots',async c=>{const p=c.get('profile'),id=c.req.query('teacherId')||p.id;await teacher(p,id);const from=date.parse(c.req.query('from')),to=date.parse(c.req.query('to'));if(Date.parse(to)<=Date.parse(from)||Date.parse(to)-Date.parse(from)>31*86400000)throw new ApiError(400,'Choisissez une période de 31 jours maximum.');const result=await pool.query('SELECT id,teacher_id AS "teacherId",starts_at AS start,ends_at AS end,is_open AS open,version FROM teacher_slots WHERE teacher_id=$1 AND starts_at >= $2 AND starts_at < $3 ORDER BY starts_at',[id,from,to]);return c.json({slots:result.rows,timeZone:'Europe/Paris'});});
 app.put('/v1/teaching/slots',async c=>{const p=c.get('profile');writer(p);const data=z.object({teacherId:z.string().min(1).max(200),start:date,end:date,open:z.boolean(),expectedVersion:z.number().int().nonnegative()}).strict().parse(await c.req.json());await teacher(p,data.teacherId);const length=Date.parse(data.end)-Date.parse(data.start);if(length<15*60000||length>120*60000||Date.parse(data.start)<Date.now()-60000||Date.parse(data.start)>Date.now()+180*86400000)throw new ApiError(400,'Créneau invalide : 15 à 120 minutes, dans les 180 prochains jours.');
  const result=await transaction(async db=>{
   await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[data.teacherId]);
   const previous=await db.query('SELECT version FROM teacher_slots WHERE teacher_id=$1 AND starts_at=$2 FOR UPDATE',[data.teacherId,data.start]);
   if((previous.rows[0]?.version||0)!==data.expectedVersion)throw new ApiError(409,'Ce créneau a changé sur un autre appareil. Le planning va être actualisé.');
   if(data.open){const overlap=await db.query('SELECT id FROM teacher_slots WHERE teacher_id=$1 AND starts_at<>$2 AND is_open AND starts_at < $3 AND ends_at > $2',[data.teacherId,data.start,data.end]);if(overlap.rows.length)throw new ApiError(409,'Ce créneau chevauche une disponibilité déjà ouverte.');}
   const saved=await db.query(`INSERT INTO teacher_slots(id,teacher_id,starts_at,ends_at,is_open,version) VALUES($1,$2,$3,$4,$5,1) ON CONFLICT(teacher_id,starts_at) DO UPDATE SET ends_at=$4,is_open=$5,version=teacher_slots.version+1,updated_at=now() RETURNING id,teacher_id AS "teacherId",starts_at AS start,ends_at AS end,is_open AS open,version`,[randomUUID(),data.teacherId,data.start,data.end,data.open]);return saved.rows[0];
  });return c.json({slot:result});
 });
}
