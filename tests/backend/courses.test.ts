import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {Hono} from 'hono';
import {ZodError} from 'zod';
import {installCourses,courseCatalog} from '../../apps/api/src/courses.ts';
import {ApiError,type Env} from '../../apps/api/src/security.ts';

test('course learning persists, grades on the server, isolates learners and restricts teaching decisions',async()=>{
 const db=new PGlite();
 await db.exec(`CREATE ROLE repere_runtime; CREATE TABLE users(id text PRIMARY KEY,name text,email text,role text);
 CREATE TABLE teacher_students(teacher_id text,student_id text);
 CREATE TABLE routes(id uuid PRIMARY KEY,name text,exam_center text,author_id text);
 CREATE TABLE progress(student_id text,route_id uuid,fix_index int,updated_at timestamptz DEFAULT now());
 CREATE TABLE gps_coordinates(route_id uuid);
 INSERT INTO users VALUES ('s','Élève','s@example.invalid','student'),('other','Autre','o@example.invalid','student'),('t','Enseignant','t@example.invalid','teacher'),('a','Admin','a@example.invalid','admin');
 INSERT INTO teacher_students VALUES ('t','s');`);
 await db.exec(await readFile('db/migrations/015-course-progress.sql','utf8'));
 const app=new Hono<Env>();
 app.use('*',async(c,next)=>{const id=c.req.header('x-fixture-user')||'s';const r=await db.query('SELECT * FROM users WHERE id=$1',[id]);c.set('profile',r.rows[0] as any);await next();});
 app.onError((error,c)=>c.json({error:error.message},error instanceof ApiError?error.status as 400:error instanceof ZodError?400:500));
 installCourses(app,db as any);
 const call=async(path:string,user='s',method='GET',body?:unknown)=>{const r=await app.request('https://fixture.invalid'+path,{method,headers:{'x-fixture-user':user,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json() as any};};
 try {
  for(const c of courseCatalog){assert.ok(c.questions.length>=2);assert.ok(c.questions.every(q=>q.options[q.answer]&&q.explanation));}
  const lesson=courseCatalog[0]!,path='/v1/courses/'+lesson.id;
  assert.equal((await call(path+'/progress','s','PUT',{read:true,review:true})).status,200);
  assert.equal((await call('/v1/courses/me')).body.reading[0].read,true);
  assert.equal((await call('/v1/courses/me','other')).body.reading.length,0);
  assert.equal((await call(path+'/progress','s','PUT',{read:true,studentId:'other'})).status,400);
  const quiz=(await call(path+'/quiz')).body;
  assert.equal(quiz.questions[0].answer,undefined);assert.equal(quiz.questions[0].explanation,undefined);
  const answers=Object.fromEntries(lesson.questions.map(q=>[q.id,q.answer]));
  const body={attemptId:'25a49da0-3e5f-40f8-92ee-6a371d06e9f0',revision:quiz.revision,answers};
  const result=await call(path+'/quiz','s','POST',body);assert.equal(result.status,200);assert.equal(result.body.score,2);assert.equal(result.body.passed,true);assert.ok(result.body.corrections[0].explanation);
  assert.equal((await call(path+'/quiz','s','POST',body)).status,200);
  assert.equal((await call('/v1/courses/me')).body.quizzes[0].attempts,1,'retries are idempotent');
  assert.equal((await call(path+'/quiz','other','POST',body)).status,409);
  assert.equal((await call(path+'/quiz','s','POST',{...body,revision:'old'})).status,409);
  assert.equal((await call(path+'/quiz','s','POST',{...body,answers:{}})).status,400);
  assert.equal((await call('/v1/courses/students','s')).status,403);
  assert.equal((await call('/v1/courses/students','t')).body.students.length,1);
  assert.equal((await call('/v1/courses/students/other','t')).status,404);
  const plan={active:true,level:'validated',note:'Objectif travaillé en leçon.'};
  const endpoint='/v1/courses/students/s/plan/'+lesson.id;
  assert.equal((await call(endpoint,'s','PUT',plan)).status,403);
  assert.equal((await call(endpoint,'t','PUT',plan)).status,200);
  assert.equal((await call('/v1/courses/me')).body.plan[0].level,'validated');
  const detail=await call('/v1/courses/students/s','t');assert.equal(detail.status,200);assert.equal(detail.body.quizzes[0].bestScore,2);
  const stats=(await call('/v1/courses/students','a')).body.students.find((s:any)=>s.id==='s');assert.equal(stats.reading.read,1);assert.equal(stats.quizzes.passed,1);assert.equal(stats.plan.validated,1);
 } finally {await db.close();}
});
