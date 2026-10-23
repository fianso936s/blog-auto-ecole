import type { Hono } from "hono";
import { z } from "zod";
import catalog from "./course-catalog.json";
import { pool, type DB } from "./db.js";
import { ApiError, writer, type Env } from "./security.js";

export const courseCatalog = catalog;
const revisions = JSON.stringify(catalog.map(({id,revision})=>({id,revision})));
function course(id: string) {
  const found=catalog.find(c=>c.id===id);
  if(!found)throw new ApiError(404,"Fiche introuvable.");
  return found;
}
export function gradeCourse(id: string, revision: string, answers: Record<string,number>) {
  const lesson=course(id);
  if(revision!==lesson.revision)throw new ApiError(409,"Cette fiche a été mise à jour. Rechargez le quiz.");
  if(Object.keys(answers).length!==lesson.questions.length || lesson.questions.some(q=>!Number.isInteger(answers[q.id]) || answers[q.id]<0 || answers[q.id]>=q.options.length))
    throw new ApiError(400,"Répondez à chaque question du quiz.");
  const corrections=lesson.questions.map(q=>({id:q.id,correct:answers[q.id]===q.answer,answer:q.answer,explanation:q.explanation}));
  return {score:corrections.filter(q=>q.correct).length,total:corrections.length,corrections};
}
async function learner(db:DB, actor:{id:string;role:string}, id:string) {
  writer(actor as any);
  const result=await db.query("SELECT id,name,email FROM users u WHERE id=$1 AND role='student' AND ($2='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=u.id AND ts.teacher_id=$3))",[id,actor.role,actor.id]);
  if(!result.rows[0])throw new ApiError(404,"Élève introuvable dans votre groupe.");
  return result.rows[0];
}
async function progress(db:DB,id:string) {
  const [reading,attempts,plans]=await Promise.all([
    db.query('SELECT course_id AS "courseId",is_read AS read,review,read_at AS "readAt",updated_at AS "updatedAt" FROM course_progress WHERE student_id=$1',[id]),
    db.query(`SELECT a.course_id AS "courseId",count(*)::int attempts,max(a.score)::int AS "bestScore",max(a.total)::int total,max(a.created_at) AS "lastAttempt" FROM course_attempts a JOIN jsonb_to_recordset($2::jsonb) c(id text,revision text) ON c.id=a.course_id AND c.revision=a.revision WHERE student_id=$1 GROUP BY a.course_id`,[id,revisions]),
    db.query('SELECT course_id AS "courseId",level,note,active,updated_at AS "updatedAt" FROM course_plans WHERE student_id=$1',[id]),
  ]);
  return {reading:reading.rows,quizzes:attempts.rows,plan:plans.rows};
}
export function installCourses(app:Hono<Env>,db:DB=pool) {
  app.get('/v1/courses',c=>c.json({courses:catalog.map(({id,code,title,group,revision})=>({id,code,title,group,revision}))}));
  app.get('/v1/courses/me',async c=>c.json(await progress(db,c.get('profile').id)));
  app.put('/v1/courses/:id/progress',async c=>{
    const lesson=course(c.req.param('id')),p=c.get('profile');
    const data=z.object({read:z.boolean().optional(),review:z.boolean().optional()}).strict().refine(x=>x.read!==undefined||x.review!==undefined).parse(await c.req.json());
    const result=await db.query(`INSERT INTO course_progress(student_id,course_id,is_read,review,read_at) VALUES($1,$2,COALESCE($3,false),COALESCE($4,false),CASE WHEN $3 THEN now() ELSE NULL END)
      ON CONFLICT(student_id,course_id) DO UPDATE SET is_read=COALESCE($3,course_progress.is_read),review=COALESCE($4,course_progress.review),read_at=CASE WHEN $3=false THEN NULL WHEN $3=true THEN COALESCE(course_progress.read_at,now()) ELSE course_progress.read_at END,updated_at=now()
      RETURNING course_id AS "courseId",is_read AS read,review,read_at AS "readAt",updated_at AS "updatedAt"`,[p.id,lesson.id,data.read??null,data.review??null]);
    return c.json(result.rows[0]);
  });
  app.get('/v1/courses/:id/quiz',c=>{
    const lesson=course(c.req.param('id'));
    return c.json({courseId:lesson.id,revision:lesson.revision,questions:lesson.questions.map(({id,question,options})=>({id,question,options}))});
  });
  app.post('/v1/courses/:id/quiz',async c=>{
    const p=c.get('profile'),lesson=course(c.req.param('id'));
    const data=z.object({attemptId:z.uuid(),revision:z.string().max(64),answers:z.record(z.string().max(120),z.number().int().min(0).max(5))}).strict().parse(await c.req.json());
    const result=gradeCourse(lesson.id,data.revision,data.answers);
    const inserted=await db.query(`INSERT INTO course_attempts(id,student_id,course_id,revision,answers,score,total) VALUES($1,$2,$3,$4,$5::jsonb,$6,$7) ON CONFLICT(id) DO NOTHING RETURNING id`,[data.attemptId,p.id,lesson.id,data.revision,JSON.stringify(data.answers),result.score,result.total]);
    if(!inserted.rows[0]) {
      const prior=await db.query('SELECT course_id,revision,answers FROM course_attempts WHERE id=$1 AND student_id=$2',[data.attemptId,p.id]);
      const row=prior.rows[0];
      if(!row||row.course_id!==lesson.id||row.revision!==data.revision||lesson.questions.some(q=>row.answers[q.id]!==data.answers[q.id]))throw new ApiError(409,"Cet essai a déjà été utilisé. Recommencez le quiz.");
    }
    return c.json({...result,passed:result.score===result.total,attemptId:data.attemptId});
  });
  app.get('/v1/courses/students',async c=>{
    const p=c.get('profile');writer(p);
    const people=await db.query("SELECT id,name,email FROM users u WHERE role='student' AND ($1='admin' OR EXISTS(SELECT 1 FROM teacher_students ts WHERE ts.student_id=u.id AND ts.teacher_id=$2)) ORDER BY name LIMIT 300",[p.role,p.id]);
    const ids=people.rows.map(r=>r.id);
    if(!ids.length)return c.json({students:[]});
    const [reads,attempts,plans]=await Promise.all([
      db.query('SELECT student_id,count(*) FILTER(WHERE is_read)::int AS read,max(updated_at) AS updated FROM course_progress WHERE student_id=ANY($1::text[]) GROUP BY student_id',[ids]),
      db.query(`SELECT a.student_id,count(DISTINCT a.course_id) FILTER(WHERE a.score=a.total)::int passed,count(*)::int attempts,max(a.created_at) AS updated FROM course_attempts a JOIN jsonb_to_recordset($2::jsonb) c(id text,revision text) ON c.id=a.course_id AND c.revision=a.revision WHERE a.student_id=ANY($1::text[]) GROUP BY a.student_id`,[ids,revisions]),
      db.query("SELECT student_id,count(*) FILTER(WHERE active)::int assigned,count(*) FILTER(WHERE active AND level='validated')::int validated FROM course_plans WHERE student_id=ANY($1::text[]) GROUP BY student_id",[ids]),
    ]);
    return c.json({students:people.rows.map(person=>({ ...person,
      reading:reads.rows.find(r=>r.student_id===person.id)||{read:0},
      quizzes:attempts.rows.find(r=>r.student_id===person.id)||{passed:0,attempts:0},
      plan:plans.rows.find(r=>r.student_id===person.id)||{assigned:0,validated:0},
    }))});
  });
  app.get('/v1/courses/students/:studentId',async c=>{
    const p=c.get('profile'),id=z.string().min(1).max(200).parse(c.req.param('studentId'));
    const person=await learner(db,p,id);
    const [data,routes]=await Promise.all([
      progress(db,id),
      db.query(`SELECT r.id,r.name,r.exam_center AS "examCenter",p.fix_index AS "fixIndex",p.updated_at AS "updatedAt",(SELECT count(*)::int FROM gps_coordinates g WHERE g.route_id=r.id) AS "fixCount" FROM progress p JOIN routes r ON r.id=p.route_id WHERE p.student_id=$1 AND ($2='admin' OR r.author_id=$3) ORDER BY p.updated_at DESC LIMIT 100`,[id,p.role,p.id]),
    ]);
    return c.json({student:person,...data,routes:routes.rows});
  });
  app.put('/v1/courses/students/:studentId/plan/:id',async c=>{
    const p=c.get('profile'),id=z.string().min(1).max(200).parse(c.req.param('studentId')),lesson=course(c.req.param('id'));
    await learner(db,p,id);
    const data=z.object({active:z.boolean(),level:z.enum(['working','validated']),note:z.string().trim().max(1000)}).strict().parse(await c.req.json());
    const result=await db.query(`INSERT INTO course_plans(student_id,course_id,teacher_id,active,level,note) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(student_id,course_id) DO UPDATE SET teacher_id=$3,active=$4,level=$5,note=$6,updated_at=now() RETURNING course_id AS "courseId",active,level,note`,[id,lesson.id,p.id,data.active,data.level,data.note]);
    return c.json(result.rows[0]);
  });
}
