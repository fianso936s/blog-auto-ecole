import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {Hono} from 'hono';
import {decodeJwt} from 'jose';
import {setTestPool} from '../../apps/api/src/db.ts';
import {installVideos} from '../../apps/api/src/videos.ts';
import {installRealtime} from '../../apps/api/src/webrtc.ts';
import {ApiError,type Env} from '../../apps/api/src/security.ts';

test('admin can share recordings and start a direct with an unlinked student; other teachers cannot, and revocation denies join',async()=>{
 process.env.NODE_ENV='test';process.env.LIVEKIT_URL='wss://fixture.invalid';process.env.LIVEKIT_API_KEY='fixture';process.env.LIVEKIT_API_SECRET='fixture-secret-not-production';
 const db=new PGlite();
 await db.exec(`CREATE TABLE users(id text primary key,name text,role text);
 CREATE TABLE teacher_students(teacher_id text,student_id text);
 CREATE TABLE video_sessions(id uuid primary key,author_id text,title text,state text default 'local',visibility text default 'private',live_status text default 'idle',webrtc_last_heartbeat_at timestamptz,webrtc_started_at timestamptz,live_started_at timestamptz,live_ended_at timestamptz,updated_at timestamptz);
 CREATE TABLE video_grants(video_id uuid,student_id text,granted_by text);
 INSERT INTO users VALUES('a','Admin','admin'),('t','Prof','teacher'),('s','Élève','student'),('o','Autre','student');
 INSERT INTO video_sessions(id,author_id,title,state) VALUES('11111111-1111-4111-8111-111111111111','a','Film','ready'),('22222222-2222-4222-8222-222222222222','a','Live','local'),('33333333-3333-4333-8333-333333333333','t','Prof live','local');`);
 const adapter={query:async(sql:string,args:any[])=>{if(sql.includes('pg_advisory_xact_lock'))return {rows:[],rowCount:0};const r=await db.query(sql,args);return {...r,rowCount:r.affectedRows??r.rows.length};},connect:async()=>({...adapter,release(){}})};
 setTestPool(adapter as any);
 const oldFetch=globalThis.fetch;const commands:any[]=[];
 globalThis.fetch=async(input,init)=>{commands.push({url:String(input),body:JSON.parse(String(init?.body))});return Response.json({});};
 const app=new Hono<Env>();app.use('*',async(c,next)=>{const user=c.req.header('x-fixture-user')||'s';c.set('profile',(await db.query('SELECT * FROM users WHERE id=$1',[user])).rows[0] as any);await next();});
 app.onError((e,c)=>c.json({error:e.message},e instanceof ApiError?e.status as 400:500));
 installVideos(app);installRealtime(app);
 const call=async(path:string,user='s',method='GET',body?:unknown)=>{const r=await app.request('https://fixture.invalid/v1/videos/'+path,{method,headers:{'x-fixture-user':user,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json() as any};};
 const film='11111111-1111-4111-8111-111111111111',live='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
 try {
  assert.equal((await call(film)).status,404);
  assert.equal((await call(film+'/grants','a','PUT',{students:['s'],published:true})).status,200);
  assert.equal((await call(film)).status,200,'administrator recordings are visible without a redundant teacher relationship');
  const grants=await call(film+'/grants','a');assert.equal(grants.body.published,true);assert.deepEqual(grants.body.students,['s']);
  assert.equal((await call(film,'o')).status,404,'unselected student cannot read');
  assert.equal((await call(film+'/grants','a','PUT',{students:['s'],published:false})).status,200);
  assert.equal((await call(film)).status,404,'private removes access');
  assert.equal((await call(other+'/webrtc/start','t','POST',{students:['s']})).status,403);
  assert.equal((await call(live+'/webrtc/start','a','POST',{students:['s']})).status,200);
  assert.equal(commands.filter(c=>c.url.endsWith('/CreateRoom')).length,1);
  const publisher=await call(live+'/webrtc/join','a','POST',{});assert.equal(publisher.status,200);assert.equal((decodeJwt(publisher.body.token).video as any).canPublish,true);
  const monitor=await call(live+'/webrtc/join','a','POST',{mode:'watch'});assert.equal(monitor.status,200);assert.equal(monitor.body.publisher,false);assert.equal((decodeJwt(monitor.body.token).video as any).canPublish,false);assert.notEqual(decodeJwt(monitor.body.token).sub,decodeJwt(publisher.body.token).sub,'owner monitor must not replace the Meta publisher');
  const viewer=await call(live+'/webrtc/join','s','POST',{});assert.equal(viewer.status,200);assert.equal((decodeJwt(viewer.body.token).video as any).canPublish,false);
  assert.equal((await call(live+'/webrtc/join','o','POST',{})).status,404);
  assert.equal((await call(live+'/webrtc/grants','a','PUT',{students:[]})).status,200);
  assert.equal((await call(live+'/webrtc/join','s','POST',{})).status,404);
  assert.ok(commands.some(c=>c.url.endsWith('/RemoveParticipant')),'revoked viewer is disconnected at the SFU');
 } finally {globalThis.fetch=oldFetch;await db.close();}
});
