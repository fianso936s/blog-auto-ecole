// Real PostgreSQL engine in local WASM; no production data or network credentials.
import {PGlite} from '@electric-sql/pglite';
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID,createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {Hono} from 'hono';
process.env.NODE_ENV='test';
process.env.APP_AUTH_BASE_URL='https://auth.example.invalid';
const db=new PGlite();
for(const f of ['db/001-base.sql','db/002-map-spots.sql',...['003-native','004-idempotent-sync','005-gpx-time','007-spot-photos-sharing','008-learning-catalog','009-private-videos','010-live-private-segments','011-webrtc-livekit','012-commercial-safety','014-route-exam-centers'].map(n=>'db/migrations/'+n+'.sql')]){
 let sql=await readFile(f,'utf8');sql=sql.replace(/^GRANT .*$/gm,'');await db.exec(sql);
}
await db.exec(`CREATE SCHEMA neon_auth;CREATE TABLE neon_auth."user"(id text PRIMARY KEY,email text,name text,"emailVerified" boolean);CREATE FUNCTION public.delete_own_neon_identity(text) RETURNS void LANGUAGE sql AS 'SELECT';`);
const pg={query:async(sql,params=[])=>{const r=await db.query(sql,params);return {...r,rowCount:Math.max(r.affectedRows||0,r.rows.length)}},connect:async()=>({...pg,release(){}}),on(){},end(){}};
const {setTestPool}=await import('../../apps/api/src/db.ts');setTestPool(pg);
const {createApp}=await import('../../apps/api/src/index.ts');const app=createApp();
const hash=s=>createHash('sha256').update(s).digest('hex');
for(const [id,role] of [['teacher','teacher'],['other','teacher'],['student','student'],['outsider','student'],['admin','admin']]){await pg.query('INSERT INTO users(id,email,name,role) VALUES($1,$2,$1,$3)',[id,id+'@example.invalid',role]);await pg.query('INSERT INTO mobile_sessions(token_hash,user_id) VALUES($1,$2)',[hash(id+'-token'),id]);}
await pg.query("INSERT INTO teacher_students VALUES('teacher','student')");
const checks=[];
async function call(path,user='teacher',method='GET',body){const r=await app.request(path,{method,headers:{...(user?{Authorization:'Bearer '+user+'-token'}:{}),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return{status:r.status,body:await r.json()};}
function check(ok,name){checks.push({name,ok});assert.ok(ok,name);console.log('PASS '+name);}
const routeId=randomUUID(),spotId=randomUUID(),now=Date.now();const route={id:routeId,name:'Parcours test',source:'gps',status:'private',duration:10,version:0,fixes:[{lat:48.9,lng:2.3,time:now-10000,accuracy:5,segment:0},{lat:48.9001,lng:2.3001,time:now,accuracy:5,segment:0}],points:[]};
try{
 check((await call('/v1/routes',null)).status===401,'Unauthenticated routes rejected');
 const create=(name,email,role)=>({name,email,role});
 check((await call('/v1/users','student','POST',create('Élève','created1@example.invalid','student'))).status===403,'Student cannot create accounts');
 check((await call('/v1/users','teacher','POST',create('Enseignant','created2@example.invalid','teacher'))).status===403,'Teacher cannot create teachers');
 check((await call('/v1/users','admin','POST',create('Admin','created3@example.invalid','admin'))).status===400,'Account creation cannot mint administrator role');
 const prepared=await call('/v1/users','teacher','POST',create('Nouvel élève','created4@example.invalid','student'));
 check(prepared.status===201&&prepared.body.activationRequired,'Teacher prepares student access without a password');
 check((await pg.query("SELECT 1 FROM teacher_students WHERE teacher_id='teacher' AND student_id=$1",[prepared.body.user.id])).rowCount===1,'Prepared student linked only to creator');
 check((await call('/v1/users','other','POST',create('Duplicata','CREATED4@example.invalid','student'))).status===409,'Existing account cannot be silently claimed');
 const teacherPrepared=await call('/v1/users','admin','POST',create('Nouvel enseignant','created5@example.invalid','teacher'));
 check(teacherPrepared.status===201,'Administrator creates teacher access');
 const {installAuth}=await import('../../apps/api/src/auth.ts');
 for(const [record,role,email] of [[prepared,'student','created4@example.invalid'],[teacherPrepared,'teacher','created5@example.invalid']]){
   const authApp=new Hono();installAuth(authApp,async()=>({sub:'managed-'+role,email,name:'Verified identity',verified:true}));
   const verifier='v'.repeat(43),challenge=createHash('sha256').update(verifier).digest('base64url');
   const req=await (await authApp.request('/v1/auth/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({challenge})})).json();
   const auth=await (await authApp.request('/v1/auth/authorize',{method:'POST',headers:{Authorization:'Bearer synthetic','Content-Type':'application/json'},body:JSON.stringify({request:req.request})})).json();
   const code=new URL(auth.redirect).searchParams.get('code');
   const session=await (await authApp.request('/v1/auth/exchange',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,verifier})})).json();
   check(session.profile.id===record.body.user.id,'Verified '+role+' activation preserves prepared identity');
   check(session.profile.role===role,'Verified '+role+' activation receives intended role');
 }

 await pg.query('DELETE FROM users WHERE id=$1',[prepared.body.user.id]);
 await pg.query("DELETE FROM users WHERE email='created5@example.invalid'");

 check((await call('/v1/users','student')).status===403,'Student cannot list all accounts');
 check((await call('/v1/users','teacher')).status===403,'Teacher cannot list all accounts');
 check((await call('/v1/users','admin')).body.students.length===5,'Administrator retains account management');
 const pupils=(await call('/v1/students','teacher')).body.students;
 check(pupils.length===1&&pupils[0].id==='student','Teacher sees only own linked students');
 check((await call('/v1/routes/'+routeId,'teacher','PUT',route)).status===200,'Teacher saves private route');
 check((await call('/v1/routes/'+routeId,'outsider')).status===404,'UUID does not reveal private GPS');
 check((await call('/v1/routes/'+routeId,'other','PUT',{...route,version:1})).status===403,'Another teacher cannot overwrite route');
 const publicationBase=(await call('/v1/routes/'+routeId)).body;
 check((await call('/v1/routes/'+routeId,'student','PUT',{...publicationBase,status:'published'})).status===403,'A learner cannot publish a route');
 check((await call('/v1/routes/'+routeId,'other','PUT',{...publicationBase,status:'published'})).status===403,'Another teacher cannot publish a private route');
 check((await call('/v1/routes/'+routeId,'teacher','PUT',{...publicationBase,status:'published',examCenter:'Nanterre'})).status===200,'Author explicitly publishes with an exam centre');
 check((await call('/v1/routes/'+routeId,'outsider')).status===200,'Published route readable by another authenticated learner');
 check((await call('/v1/routes?examCenter=Nanterre','outsider')).body.routes.some(r=>r.id===routeId&&r.examCenter==='Nanterre'),'Centre filter returns published learner route');
 check(!(await call('/v1/routes?examCenter=Gennevilliers','outsider')).body.routes.some(r=>r.id===routeId),'Other centre excludes route');
 const oldClient=(await call('/v1/routes/'+routeId)).body;delete oldClient.examCenter;
 check((await call('/v1/routes/'+routeId,'teacher','PUT',{...oldClient,name:'Legacy save'})).status===200,'Old client can still save after centre migration');
 check((await call('/v1/routes/'+routeId,'teacher')).body.examCenter==='Nanterre','Old client does not erase centre');
 const back=(await call('/v1/routes/'+routeId)).body;
 check((await call('/v1/routes/'+routeId,'teacher','PUT',{...back,status:'private'})).status===200,'Author can remove publication');
 check((await call('/v1/routes/'+routeId,'outsider')).status===404,'Unpublishing removes unassigned learner access');
 check(!(await call('/v1/routes','outsider')).body.routes.some(r=>r.id===routeId),'Unpublished route removed from learner catalog');

 check((await call('/v1/users/student/role','student','PATCH',{role:'admin'})).status===403,'Student cannot elevate role');
 const assignment=await call('/v1/routes/'+routeId+'/assignments','teacher','PUT',{students:['student']});if(assignment.status!==200)console.log(assignment);check(assignment.status===200,'Teacher assigns own route');
 check((await call('/v1/routes/'+routeId,'student')).status===200,'Assigned student reads route');
 const beforeRename=(await call('/v1/routes/'+routeId)).body;
 check((await call('/v1/routes/'+routeId,'teacher','PUT',{...beforeRename,name:'Parcours renommé'})).status===200,'Owner renames route without replacing identity');
 check((await call('/v1/routes/'+routeId,'student')).body.name==='Parcours renommé','Assigned student sees renamed route');

 await pg.query("INSERT INTO progress(student_id,route_id,fix_index) VALUES('student',$1,0)",[routeId]);
 check((await call('/v1/progress','student')).body.progress.some(r=>r.id===routeId),'Assigned route appears in own progress');
 const spot={id:spotId,name:'Repère',category:'Observation',lat:48.9,lng:2.3,note:'Observer',status:'private',shareWithStudents:true,photos:[],quiz:null};
 check((await call('/v1/spots/'+spotId,'teacher','PUT',spot)).status===200,'Teacher saves shared point');
 check((await call('/v1/spots/'+spotId,'outsider')).status===404,'Unlinked student cannot read shared point');
 check((await call('/v1/reports','outsider','POST',{kind:'route',resourceId:routeId,reason:'other'})).status===404,'Reporting does not disclose inaccessible resources');
 const report=await call('/v1/reports','student','POST',{kind:'spot',resourceId:spotId,reason:'privacy'});check(report.status===201,'Student can report readable point');
 check((await call('/v1/moderation/reports','student')).status===403,'Reports confidential to administrator');
 check((await call('/v1/moderation/reports/'+report.body.id+'/content','admin')).status===200,'Administrator can inspect reported content');
 check((await call('/v1/moderation/reports/'+report.body.id+'/resolve','admin','POST',{action:'hide'})).status===200,'Administrator hides reported content');
 check((await call('/v1/spots/'+spotId,'student')).status===404,'Hidden point denied by direct endpoint');
 check(!(await call('/v1/spots','student')).body.spots.some(s=>s.id===spotId),'Hidden point omitted from catalog');
 check((await call('/v1/blocked-authors/teacher','student','PUT',{kind:'route',resourceId:routeId})).status===200,'Student blocks author of readable route');
 check((await call('/v1/routes/'+routeId,'student')).status===404,'Blocked route inaccessible directly');
 check(!(await call('/v1/routes','student')).body.routes.some(r=>r.id===routeId),'Blocked route omitted from catalog');
 check(!(await call('/v1/progress','student')).body.progress.some(r=>r.id===routeId),'Blocked route title omitted from progress');
 check((await call('/v1/blocked-authors/teacher','student','DELETE')).status===200,'User can undo block');
 check((await call('/v1/routes/'+routeId,'student')).status===200,'Unblock restores assigned access');
 check((await call('/v1/progress','student')).body.progress.some(r=>r.id===routeId),'Unblock restores own route progress');
 const video=(await call('/v1/videos','teacher','POST',{title:'Private local video'})).body.id;
 check((await call('/v1/videos/'+video,'outsider')).status===404,'Private video metadata protected');
 check((await call('/v1/videos/'+video+'/playback','outsider')).status===404,'Private video signing endpoint protected');
 await pg.query("UPDATE video_sessions SET visibility='students',live_status='live',webrtc_started_at=now(),webrtc_last_heartbeat_at=now() WHERE id=$1",[video]);
 await pg.query("INSERT INTO video_grants(video_id,student_id,granted_by) VALUES($1,'student','teacher')",[video]);
 check((await call('/v1/videos/'+video,'student')).status===200,'Invited student reads video metadata');
 const vr=await call('/v1/reports','student','POST',{kind:'video',resourceId:video,reason:'inappropriate'});
 check(vr.status===201,'Invited student reports video');
 check((await call('/v1/moderation/reports/'+vr.body.id+'/resolve','admin','POST',{action:'hide'})).status===200,'Administrator removes live video');
 check((await pg.query('SELECT live_status FROM video_sessions WHERE id=$1',[video])).rows[0].live_status==='ended','Video moderation ends live state');
 check((await call('/v1/videos/'+video+'/webrtc/status','student')).status===404,'Removed live status denied to student');

 check((await call('/v1/logout','student','POST',{})).status===200,'Logout succeeds');check((await call('/v1/me','student')).status===401,'Revoked session rejected');
 check((await call('/v1/me','teacher','DELETE',{confirmation:'SUPPRIMER'})).status===200,'Account deletion includes videos and routes');
 check((await pg.query("SELECT id FROM routes WHERE author_id='teacher'")).rowCount===0,'Account GPS deleted');
 check((await pg.query("SELECT id FROM video_sessions WHERE author_id='teacher'")).rowCount===0,'Account video metadata deleted');
 const {anonymousQuota}=await import('../../apps/api/src/security.ts');
 for(let i=0;i<60;i++)await anonymousQuota(pg,'isolated-quota-test');
 let limited=false;try{await anonymousQuota(pg,'isolated-quota-test')}catch(e){limited=e.status===429}
 check(limited,'Repeated anonymous authentication requests are rate limited');
 check((await call('/api/auth/delete-user',null,'POST',{})).status===404,'Unlisted managed auth operations are refused');
 const origin=await app.request('/v1/me',{headers:{Authorization:'Bearer admin-token',Origin:'https://foreign.invalid'}});
 check(origin.status===403,'Foreign browser origin refused');
 check((await call('/v1/users/admin/role','admin','PATCH',{role:'student'})).status===400,'Administrator cannot demote own account');
 check((await call('/v1/users/other/role','admin','PATCH',{role:'student'})).status===200,'Administrator changes another account role');
 check((await call('/v1/me','other')).status===401,'Role change revokes old sessions');
 await pg.query("INSERT INTO users(id,email,name,role) VALUES('password-fixture','password-fixture@example.invalid','Password fixture','student')");
 await pg.query("INSERT INTO mobile_sessions(token_hash,user_id) VALUES($1,'password-fixture')",[hash('password-fixture-token')]);
 await pg.query("INSERT INTO mobile_auth_codes(code_hash,challenge,user_id) VALUES($1,$2,'password-fixture')",[hash('pending-code'),'v'.repeat(43)]);
 const originalFetch=globalThis.fetch;let accepted=false;
 globalThis.fetch=async url=>{assert.ok(String(url).endsWith('/email-otp/reset-password'));return new Response(JSON.stringify(accepted?{status:true}:{error:'invalid OTP'}),{status:accepted?200:400,headers:{'Content-Type':'application/json'}})};
 try{
  const reset={email:'password-fixture@example.invalid',otp:'000000',password:'synthetic-password-only'};
  check((await call('/api/auth/email-otp/reset-password',null,'POST',reset)).status===400,'Failed reset is refused');
  check((await call('/v1/me','password-fixture')).status===200,'Failed reset cannot log someone else out');
  accepted=true;check((await call('/api/auth/email-otp/reset-password',null,'POST',reset)).status===200,'Verified provider reset completes');
  check((await call('/v1/me','password-fixture')).status===401,'Successful reset revokes native sessions');
  check((await pg.query("SELECT 1 FROM mobile_auth_codes WHERE user_id='password-fixture'")).rowCount===0,'Successful reset revokes pending native codes');
 }finally{globalThis.fetch=originalFetch;}



}finally{await writeFile('docs/SECURITY_LOCAL_API_TEST.json',JSON.stringify({at:new Date().toISOString(),checks,passed:checks.length>=64&&checks.every(x=>x.ok),scope:'Exam-centre compatibility and publication permissions + real local PostgreSQL engine + Hono API; synthetic sessions; no production writes',realManagedEmailTested:false,physicalDeviceTested:false},null,2));await db.close();}
