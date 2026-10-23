import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Hono} from 'hono';
import {installAuth} from '../../apps/api/src/auth.ts';
import {ApiError,equal,type Env} from '../../apps/api/src/security.ts';
import {visibleContent} from '../../apps/api/src/moderation.ts';

test('unverified managed identity cannot attach to any local account or mint a mobile authorization code',async()=>{
 const app=new Hono<Env>();app.onError((e,c)=>c.json({error:e.message},e instanceof ApiError?e.status as 403:500));
 installAuth(app,async()=>({sub:'new-subject',email:'existing@example.invalid',name:'Impersonator',verified:false}));
 const r=await app.request('/v1/auth/authorize',{method:'POST',headers:{Authorization:'Bearer fake-test-token','Content-Type':'application/json'},body:JSON.stringify({request:'c9929653-e8de-46e7-9b48-e46b075aceea'})});
 assert.equal(r.status,403);assert.match((await r.json()).error,/Vérifiez/);
});
test('constant time comparison rejects equal-length Unicode encodings without throwing',()=>{assert.equal(equal('a','é'),false);assert.equal(equal('é','é'),true);});
test('catalog safety predicates bind caller identity and apply both author block and moderator removal',()=>{
 for(const k of ['route','spot','video'] as const){const sql=visibleContent('r',k);assert.match(sql,/blocked_authors/);assert.match(sql,/hidden_content/);assert.ok(sql.includes("h.kind='"+k+"'"));assert.ok(sql.includes('b.user_id=$1'));}
});
