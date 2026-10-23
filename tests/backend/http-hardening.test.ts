import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../../apps/api/src/index.ts';
import {Hono} from 'hono';
import {installAuth} from '../../apps/api/src/auth.ts';
import {ApiError,type Env} from '../../apps/api/src/security.ts';
test('account pages prohibit foreign scripts and framing while allowing local SDK modules',async()=>{
 const app=createApp();for(const path of ['/auth','/reset-password','/privacy','/support']){
  const r=await app.request(path);assert.equal(r.status,200);
  const csp=r.headers.get('Content-Security-Policy')!;assert.match(csp,/script-src 'self'/);assert.match(csp,/frame-ancestors 'none'/);assert.match(csp,/base-uri 'none'/);assert.equal(r.headers.get('Cache-Control'),'no-store');
 }
 const street=await app.request('/streetview');assert.equal(street.status,200);assert.equal(street.headers.get('Content-Security-Policy'),"frame-ancestors 'self' https://blog-auto-ecole.vercel.app",'only the published web app may embed Street View');assert.equal(street.headers.get('X-Frame-Options'),null);
});
test('oversized authentication requests are refused before any database or provider request',async()=>{
 const app=createApp();for(const path of ['/v1/auth/start','/api/auth/sign-up/email']){
  const r=await app.request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({padding:'x'.repeat(17000)})});assert.equal(r.status,413);
 }
});
test('oversized managed bearer never reaches identity verification',async()=>{
 let reached=false;const app=new Hono<Env>();app.onError((e,c)=>c.json({error:e.message},e instanceof ApiError?e.status as 401:500));
 installAuth(app,async()=>{reached=true;throw Error('Must not be reached')});
 const r=await app.request('/v1/auth/authorize',{method:'POST',headers:{Authorization:'Bearer '+'a'.repeat(8200),'Content-Type':'application/json'},body:JSON.stringify({request:'c9929653-e8de-46e7-9b48-e46b075aceea'})});assert.equal(r.status,401);assert.equal(reached,false);
});

test('simultaneous public health probes share one database query',async()=>{
 process.env.NODE_ENV='test';const {setTestPool}=await import('../../apps/api/src/db.ts');let reads=0;
 setTestPool({query:async()=>{reads++;await new Promise(r=>setTimeout(r,0));return {rows:[],rowCount:1}}} as any);
 const app=createApp();const results=await Promise.all(Array.from({length:8},()=>app.request('/health')));
 assert.ok(results.every(r=>r.status===200));assert.equal(reads,1);
 assert.equal((await app.request('/health')).status,200);assert.equal(reads,1);
});
