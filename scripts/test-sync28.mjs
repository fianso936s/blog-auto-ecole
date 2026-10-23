// Isolated synthetic accounts; fixture remains outside source and reports contain no tokens or coordinates.
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const f=JSON.parse(await readFile(process.argv[2],'utf8'));
if(!f.prefix.startsWith('qa-sync28-'))throw Error('Synthetic fixture required');
const checks=[];const id=randomUUID(),pointId=randomUUID();
async function call(path,role='teacher',method='GET',body,key){const r=await fetch(f.baseUrl+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+f.accounts[role].token,...(key?{'Idempotency-Key':key}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});return {status:r.status,body:await r.json()};}
function check(ok,name){checks.push({name,ok});assert.ok(ok,name);console.log('PASS '+name);}
try{
const now=Date.now();const route={id,name:'QA sync regression',description:'Synthetic fixture',source:'gps',status:'private',difficulty:'Facile',duration:10,version:0,fixes:[{lat:48.9,lng:2.3,accuracy:5,time:now-10000+0.125,segment:0},{lat:48.9001,lng:2.3001,accuracy:5,time:now+0.25,segment:0}],points:[{id:pointId,name:'QA exact point',category:'Observation',lat:48.90005,lng:2.30005,fixIndex:0,question:'',options:['Oui','Non'],validated:false,photos:[]}]};
let r=await call('/v1/routes/'+id,'teacher','PUT',route,id+':1');check(r.status===200,'Old fractional GPS draft saves on deployed API');check(r.body.fixes.every(x=>Number.isSafeInteger(x.time)),'Server returns integer GPS milliseconds');check(r.body.version===1,'First save acknowledges server version');const saved=r.body;
r=await call('/v1/routes/'+id,'teacher','PUT',route,id+':1');check(r.status===200&&r.body.version===1,'Retry remains idempotent');
check((await call('/v1/routes/'+id,'outsider')).status===404,'Private route hidden from outsider');
check((await call('/v1/routes/'+id+'/assignments','teacher','PUT',{students:[f.accounts.student.id]})).status===200,'Teacher assigns route to linked student');
r=await call('/v1/routes/'+id,'student');check(r.status===200&&r.body.points.some(p=>p.id===pointId),'Assigned student receives route marker');check(r.body.points[0].lat===route.points[0].lat&&r.body.points[0].lng===route.points[0].lng,'Manual marker retains exact selected location');
r=await call('/v1/routes/'+id,'student','PUT',{...route,version:1},id+':2');check(r.status===403,'Student cannot overwrite teacher route');
r=await call('/v1/routes/'+id,'teacher','PUT',{...route,version:1,name:'QA revised'},id+':2');check(r.status===200&&r.body.version===2,'Next revision synchronizes');
r=await call('/v1/routes/'+id,'teacher','PUT',{...route,version:2,fixes:[...route.fixes].reverse()},id+':3');check(r.status===400&&r.body.error==='Chronologie GPS invalide','GPS chronology validation remains enforced');
}finally{
check((await call('/v1/routes/'+id,'teacher','DELETE')).status===200,'Synthetic route removed');
for(const role of ['teacher','student','outsider'])check((await call('/v1/me',role,'DELETE',{confirmation:'SUPPRIMER'})).status===200,'Synthetic '+role+' account removed');
await writeFile('docs/SYNC_28_RESULT.json',JSON.stringify({at:new Date().toISOString(),checks,passed:checks.every(x=>x.ok),scope:'Deployed API with isolated synthetic teacher and students',physicalIPhoneTested:false},null,2));
}
