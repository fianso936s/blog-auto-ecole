import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {Hono} from 'hono';
import {ZodError} from 'zod';
import {setTestPool} from '../../apps/api/src/db.ts';
import {installTeaching} from '../../apps/api/src/teaching.ts';
import {installMetaDevices} from '../../apps/api/src/meta-devices.ts';
import {ApiError,type Env} from '../../apps/api/src/security.ts';
test('teacher slots persist with version protection, scoped permissions and device reports isolated to their owner',async()=>{
 process.env.NODE_ENV='test';const db=new PGlite();await db.exec("CREATE ROLE repere_runtime;CREATE TABLE users(id text PRIMARY KEY,name text,role text);INSERT INTO users VALUES('a','Admin','admin'),('t','Prof','teacher'),('o','Autre','teacher'),('s','Élève','student');");await db.exec(await readFile('db/migrations/017-teacher-slots.sql','utf8'));
 const adapter={query:async(sql:string,args:any[])=>{if(sql.includes('pg_advisory_xact_lock'))return {rows:[],rowCount:0};const r=await db.query(sql,args);return {...r,rowCount:r.affectedRows??r.rows.length};},connect:async()=>({...adapter,release(){}})};setTestPool(adapter as any);
 const app=new Hono<Env>();app.use('*',async(c,next)=>{c.set('profile',(await db.query('SELECT * FROM users WHERE id=$1',[c.req.header('x-fixture-user')||'t'])).rows[0] as any);await next();});app.onError((e,c)=>c.json({error:e.message},e instanceof ApiError?e.status as 400:e instanceof ZodError?400:500));installTeaching(app);installMetaDevices(app);
 const call=async(path:string,user='t',method='GET',body?:unknown)=>{const r=await app.request('https://fixture.invalid/v1/'+path,{method,headers:{'x-fixture-user':user,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,body:await r.json() as any};};
 try {
  assert.equal((await call('teaching/teachers','s')).status,403);assert.equal((await call('teaching/teachers')).body.teachers.length,1);assert.equal((await call('teaching/teachers','a')).body.teachers.length,3);
  const start=new Date(Date.now()+86400000).toISOString(),end=new Date(Date.parse(start)+3600000).toISOString(),body={teacherId:'t',start,end,open:true,expectedVersion:0};
  assert.equal((await call('teaching/slots','s','PUT',body)).status,403);assert.equal((await call('teaching/slots','o','PUT',body)).status,403);
  const opened=await call('teaching/slots','t','PUT',body);assert.equal(opened.status,200);assert.equal(opened.body.slot.open,true);assert.equal(opened.body.slot.version,1);
  assert.equal((await call('teaching/slots','t','PUT',body)).status,409,'stale version cannot overwrite another device');
  const from=new Date(Date.parse(start)-3600000).toISOString(),to=new Date(Date.parse(end)+3600000).toISOString();const path='teaching/slots?teacherId=t&from='+encodeURIComponent(from)+'&to='+encodeURIComponent(to);
  assert.equal((await call(path)).body.slots.length,1);assert.equal((await call(path,'o')).status,403);assert.equal((await call(path,'a')).status,200);
  assert.equal((await call('teaching/slots','a','PUT',{...body,expectedVersion:1,open:false})).body.slot.open,false);
  assert.equal((await call(path)).body.slots[0].version,2);
  assert.equal((await call('teaching/slots','t','PUT',{...body,start:new Date(Date.parse(start)+1000).toISOString(),end:new Date(Date.parse(start)+1001).toISOString()})).status,400);
  const device={modulePresent:true,available:true,connected:true,registered:true,framesRecent:false,source:'meta',appVersion:'1.7.0'};
  assert.equal((await call('meta/device','s','PUT',device)).status,403);assert.equal((await call('meta/device','t','PUT',device)).status,200);assert.equal((await call('meta/device')).body.device.connected,true);assert.equal((await call('meta/device','o')).body.device,null);
 }finally{await db.close();}
});
