import test from 'node:test';import assert from 'node:assert/strict';import {PGlite} from '@electric-sql/pglite';import {Hono} from 'hono';
import {setTestPool} from '../../apps/api/src/db.ts';import {installRoutes} from '../../apps/api/src/routes.ts';import type {Env} from '../../apps/api/src/security.ts';
test('catalog queries leave photo bytes and route geometry in Postgres while preserving details and permissions',async()=>{
 process.env.NODE_ENV='test';const db=new PGlite();await db.exec(`
 CREATE TABLE users(id text,name text);
 CREATE TABLE routes(id uuid,name text,description text,exam_center text,difficulty text,status text,source text,duration int,distance float,created_at timestamptz DEFAULT now(),updated_at timestamptz DEFAULT now(),author_id text,version int,geometry jsonb);
 CREATE TABLE pedagogical_points(route_id uuid,category text);
 CREATE TABLE favorites(route_id uuid,user_id text);
 CREATE TABLE progress(route_id uuid,student_id text,fix_index int);
 CREATE TABLE assignments(route_id uuid,student_id text);
 CREATE TABLE teacher_students(teacher_id text,student_id text);
 CREATE TABLE blocked_authors(user_id text,author_id text);
 CREATE TABLE hidden_content(kind text,resource_id uuid);
 CREATE TABLE map_spots(id uuid,author_id text,name text,category text,lat float,lng float,note text,status text,share_with_students bool DEFAULT false,quiz jsonb,quiz_version int DEFAULT 0,source_route_id uuid,photos jsonb,created_at timestamptz DEFAULT now(),archived_at timestamptz);
 INSERT INTO users VALUES('t','Prof'),('other','Autre');`);
 const id='70000000-0000-4000-8000-000000000001',hidden='70000000-0000-4000-8000-000000000002';
 const photos=[{id:'photo',dataUrl:'data:image/jpeg;base64,'+'A'.repeat(300000)}];
 await db.query("INSERT INTO map_spots(id,author_id,name,category,lat,lng,note,status,photos) VALUES($1,'t','Repère','Priorité',48,2,'Conseil','private',$2)",[id,JSON.stringify(photos)]);
 await db.query("INSERT INTO map_spots(id,author_id,name,category,lat,lng,note,status,photos) VALUES($1,'other','Privé','Priorité',48,2,'Secret','private',$2)",[hidden,JSON.stringify(photos)]);
 await db.query("INSERT INTO routes(id,name,description,exam_center,difficulty,status,source,duration,distance,author_id,version,geometry) VALUES($1,'Parcours','','Nanterre','Facile','published','gps',60,10,'t',1,$2)",[id,JSON.stringify({coordinates:'A'.repeat(300000)})]);
 let returned=0;setTestPool({query:async(sql:string,args:any[])=>{const r=await db.query(sql,args);returned+=Buffer.byteLength(JSON.stringify(r.rows));return {...r,rowCount:r.rows.length};}} as any);
 const app=new Hono<Env>();app.use('*',async(c,next)=>{c.set('profile',{id:'t',name:'Prof',role:'teacher',email:'t@example.invalid'});await next();});installRoutes(app);
 try{
  const summary=await (await app.request('/v1/spots?summary=1')).json();assert.equal(summary.spots.length,1);assert.equal(summary.spots[0].photoCount,1);assert.deepEqual(summary.spots[0].photos,[]);assert.ok(returned<4000,'no photo bytes cross the database connection');
  const detail=await(await app.request('/v1/spots/'+id)).json();assert.equal(detail.photos[0].dataUrl,photos[0].dataUrl,'opening a marker still loads its photos');
  returned=0;const routes=await(await app.request('/v1/routes')).json();assert.equal(routes.routes[0].name,'Parcours');assert.ok(returned<4000,'route summaries do not fetch unused geometry');
 }finally{await db.close();}
});
