import {randomUUID} from 'node:crypto';
import type {Hono} from 'hono';
import {z} from 'zod';
import {pool,transaction} from './db.js';
import {ApiError,writer,type Env} from './security.js';
import {mailConfigured,sendMail} from './mailer.js';
const date=z.string().datetime();
export function installTeaching(app:Hono<Env>){
 async function teacher(p:{id:string;role:string},id:string){writer(p as any);if(p.role!=='admin'&&id!==p.id)throw new ApiError(403,'Vous pouvez modifier uniquement votre planning.');const r=await pool.query("SELECT id FROM users WHERE id=$1 AND role IN ('teacher','admin')",[id]);if(!r.rows.length)throw new ApiError(404,'Enseignant introuvable.');}
 app.get('/v1/teaching/teachers',async c=>{const p=c.get('profile');writer(p);const result=await pool.query("SELECT id,name FROM users WHERE role IN ('teacher','admin') AND ($1='admin' OR id=$2) ORDER BY name",[p.role,p.id]);return c.json({teachers:result.rows});});
 app.get('/v1/teaching/slots',async c=>{const p=c.get('profile'),id=c.req.query('teacherId')||p.id;await teacher(p,id);const from=date.parse(c.req.query('from')),to=date.parse(c.req.query('to'));if(Date.parse(to)<=Date.parse(from)||Date.parse(to)-Date.parse(from)>31*86400000)throw new ApiError(400,'Choisissez une période de 31 jours maximum.');const result=await pool.query(`SELECT s.id,s.teacher_id AS "teacherId",s.starts_at AS start,s.ends_at AS end,s.is_open AS open,s.version,s.student_id AS "studentId",u.name AS "studentName" FROM teacher_slots s LEFT JOIN users u ON u.id=s.student_id WHERE s.teacher_id=$1 AND s.starts_at >= $2 AND s.starts_at < $3 ORDER BY s.starts_at`,[id,from,to]);return c.json({slots:result.rows,timeZone:'Europe/Paris',emails:mailConfigured()});});
 app.put('/v1/teaching/slots',async c=>{const p=c.get('profile');writer(p);const data=z.object({teacherId:z.string().min(1).max(200),start:date,end:date,open:z.boolean(),expectedVersion:z.number().int().nonnegative()}).strict().parse(await c.req.json());await teacher(p,data.teacherId);const length=Date.parse(data.end)-Date.parse(data.start);if(length<15*60000||length>120*60000||Date.parse(data.start)<Date.now()-60000||Date.parse(data.start)>Date.now()+180*86400000)throw new ApiError(400,'Créneau invalide : 15 à 120 minutes, dans les 180 prochains jours.');
  const result=await transaction(async db=>{
   await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[data.teacherId]);
   const previous=await db.query('SELECT version,student_id FROM teacher_slots WHERE teacher_id=$1 AND starts_at=$2 FOR UPDATE',[data.teacherId,data.start]);
   if((previous.rows[0]?.version||0)!==data.expectedVersion)throw new ApiError(409,'Ce créneau a changé sur un autre appareil. Le planning va être actualisé.');
   if(!data.open&&previous.rows[0]?.student_id)throw new ApiError(409,'Ce créneau est réservé : annulez d’abord la réservation de l’élève.');
   if(data.open){const overlap=await db.query('SELECT id FROM teacher_slots WHERE teacher_id=$1 AND starts_at<>$2 AND is_open AND starts_at < $3 AND ends_at > $2',[data.teacherId,data.start,data.end]);if(overlap.rows.length)throw new ApiError(409,'Ce créneau chevauche une disponibilité déjà ouverte.');}
   const saved=await db.query(`INSERT INTO teacher_slots(id,teacher_id,starts_at,ends_at,is_open,version) VALUES($1,$2,$3,$4,$5,1) ON CONFLICT(teacher_id,starts_at) DO UPDATE SET ends_at=$4,is_open=$5,version=teacher_slots.version+1,updated_at=now() RETURNING id,teacher_id AS "teacherId",starts_at AS start,ends_at AS end,is_open AS open,version,student_id AS "studentId"`,[randomUUID(),data.teacherId,data.start,data.end,data.open]);return saved.rows[0];
  });return c.json({slot:result});
 });
 // Students who can be booked on this teacher's planning: every registered student for the director, the teacher's own group otherwise.
 app.get('/v1/teaching/students',async c=>{const p=c.get('profile'),id=c.req.query('teacherId')||p.id;await teacher(p,id);
  const result=await pool.query(`SELECT u.id,u.name,u.email FROM users u WHERE u.role='student' AND ($1='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=u.id AND ts.teacher_id=$2)) ORDER BY u.name LIMIT 500`,[p.role,id]);
  return c.json({students:result.rows,emails:mailConfigured()});
 });
 // Book a student on a slot (the slot opens if needed), or cancel with studentId null. E-mails the teacher and the student.
 app.put('/v1/teaching/bookings',async c=>{const p=c.get('profile');writer(p);
  const data=z.object({teacherId:z.string().min(1).max(200),start:date,end:date,studentId:z.string().min(1).max(200).nullable(),expectedVersion:z.number().int().nonnegative()}).strict().parse(await c.req.json());
  await teacher(p,data.teacherId);const length=Date.parse(data.end)-Date.parse(data.start);
  if(length<15*60000||length>120*60000||Date.parse(data.start)<Date.now()-60000||Date.parse(data.start)>Date.now()+180*86400000)throw new ApiError(400,'Créneau invalide : 15 à 120 minutes, dans les 180 prochains jours.');
  if(data.studentId){
   const student=await pool.query("SELECT id FROM users WHERE id=$1 AND role='student'",[data.studentId]);if(!student.rows.length)throw new ApiError(404,'Élève introuvable.');
   if(p.role!=='admin'){const linked=await pool.query('SELECT 1 FROM teacher_students WHERE teacher_id=$1 AND student_id=$2',[data.teacherId,data.studentId]);if(!linked.rows.length)throw new ApiError(403,'Cet élève ne fait pas partie de votre groupe.');}
  }
  const outcome=await transaction(async db=>{
   await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[data.teacherId]);
   const previous=await db.query('SELECT version,student_id FROM teacher_slots WHERE teacher_id=$1 AND starts_at=$2 FOR UPDATE',[data.teacherId,data.start]);
   if((previous.rows[0]?.version||0)!==data.expectedVersion)throw new ApiError(409,'Ce créneau a changé sur un autre appareil. Le planning va être actualisé.');
   const before:string|null=previous.rows[0]?.student_id||null;
   if(data.studentId){
    if(before&&before!==data.studentId)throw new ApiError(409,'Ce créneau est déjà réservé par un autre élève.');
    const busy=await db.query('SELECT 1 FROM teacher_slots WHERE student_id=$1 AND NOT(teacher_id=$2 AND starts_at=$3) AND starts_at < $4 AND ends_at > $3',[data.studentId,data.teacherId,data.start,data.end]);
    if(busy.rows.length)throw new ApiError(409,'Cet élève a déjà une leçon à cette heure.');
    const overlap=await db.query('SELECT 1 FROM teacher_slots WHERE teacher_id=$1 AND starts_at<>$2 AND is_open AND starts_at < $3 AND ends_at > $2',[data.teacherId,data.start,data.end]);
    if(overlap.rows.length)throw new ApiError(409,'Ce créneau chevauche une autre disponibilité.');
    if(p.role==='admin')await db.query('INSERT INTO teacher_students(teacher_id,student_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[data.teacherId,data.studentId]);
   }else if(!before)throw new ApiError(409,'Ce créneau n’a pas de réservation à annuler.');
   const saved=await db.query(`INSERT INTO teacher_slots(id,teacher_id,starts_at,ends_at,is_open,version,student_id,booked_by,booked_at) VALUES($1,$2,$3,$4,true,1,$5,$6,CASE WHEN $5::text IS NULL THEN NULL ELSE now() END)
    ON CONFLICT(teacher_id,starts_at) DO UPDATE SET ends_at=$4,is_open=true,student_id=$5,booked_by=$6,booked_at=CASE WHEN $5::text IS NULL THEN NULL ELSE now() END,notified_at=NULL,version=teacher_slots.version+1,updated_at=now()
    RETURNING id,teacher_id AS "teacherId",starts_at AS start,ends_at AS end,is_open AS open,version,student_id AS "studentId"`,[randomUUID(),data.teacherId,data.start,data.end,data.studentId,data.studentId?p.id:null]);
   return {slot:saved.rows[0],before};
  });
  const people=await pool.query('SELECT id,name,email FROM users WHERE id = ANY($1::text[])',[[data.teacherId,data.studentId||outcome.before].filter(Boolean)]);
  const who=(id:string|null)=>people.rows.find((r:any)=>r.id===id);
  const teacherRow=who(data.teacherId),studentRow=who(data.studentId||outcome.before);
  const slot={...outcome.slot,studentName:data.studentId?studentRow?.name||null:null};
  const when=lessonTime(data.start,data.end),booked=!!data.studentId;
  const [teacherMail,studentMail]=await Promise.all([
   teacherRow?.email?sendMail({to:teacherRow.email,subject:booked?`Nouvelle réservation : ${studentRow?.name||'un élève'} · ${when}`:`Leçon annulée : ${studentRow?.name||'un élève'} · ${when}`,
    text:booked?`Bonjour ${teacherRow.name||''},\nUne leçon de conduite vient d’être réservée dans votre planning.\nÉlève : ${studentRow?.name||'—'}${studentRow?.email?' ('+studentRow.email+')':''}\nQuand : ${when}\nRéservée par : ${p.name||'l’auto-école'}`
     :`Bonjour ${teacherRow.name||''},\nLa leçon de ${studentRow?.name||'l’élève'} du ${when} a été annulée. Le créneau reste ouvert dans votre planning.`}):Promise.resolve(null),
   studentRow?.email?sendMail({to:studentRow.email,subject:booked?`Ta leçon de conduite est réservée · ${when}`:`Leçon de conduite annulée · ${when}`,
    text:booked?`Bonjour ${studentRow.name||''},\nTa leçon de conduite est réservée.\nQuand : ${when}\nAvec : ${teacherRow?.name||'ton enseignant'}\nEn cas d’empêchement, préviens l’auto-école au plus tôt.`
     :`Bonjour ${studentRow.name||''},\nTa leçon de conduite du ${when} avec ${teacherRow?.name||'ton enseignant'} a été annulée. Contacte l’auto-école pour en reprogrammer une.`}):Promise.resolve(null),
  ]);
  if(teacherMail||studentMail)await pool.query('UPDATE teacher_slots SET notified_at=now() WHERE id=$1',[slot.id]).catch(()=>{});
  return c.json({slot,emails:{teacher:teacherMail,student:studentMail}});
 });
}
/** "samedi 25 octobre de 10 h 00 à 11 h 00", Paris time. */
export function lessonTime(start:string,end:string){
 const day=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',weekday:'long',day:'numeric',month:'long'}).format(new Date(start));
 const hour=(d:string)=>new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit'}).format(new Date(d)).replace(':',' h ');
 return `${day} de ${hour(start)} à ${hour(end)}`;
}
