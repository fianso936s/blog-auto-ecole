// Uses short-lived synthetic accounts from a private fixture OUTSIDE the source tree.
// Never prints tokens, user records or returned media URLs.
import {readFile,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const config=JSON.parse(await readFile(process.argv[2],'utf8'));
if(!config.prefix.startsWith('qa-')||!config.baseUrl.includes('br-fragrant-lake-b9utxdv6'))throw Error('Dedicated beta fixtures required');
const results=[];let videoId;const spotId=randomUUID();
async function call(path,role='teacher',method='GET',body){
  const response=await fetch(config.baseUrl+path,{method,headers:{'Content-Type':'application/json',...(role?{Authorization:'Bearer '+config.accounts[role].token}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
  return {status:response.status,body:await response.json()};
}
function check(ok,name){results.push({name,ok});assert.ok(ok,name);console.log('PASS '+name);}
try{
  check((await call('/health',null)).status===200,'Deployed API health');
  check((await call('/v1/me','teacher')).body.id===config.accounts.teacher.id,'Teacher synthetic session');
  check((await call('/v1/me','student')).body.id===config.accounts.student.id,'Student synthetic session');
  const spot={id:spotId,name:'QA production chain',category:'Observation',lat:48.9,lng:2.28,note:'Synthetic test, no real lesson',status:'private',shareWithStudents:true,photos:[],quiz:null};
  check((await call('/v1/spots/'+spotId,'teacher','PUT',spot)).status===200,'Teacher creates shared point');
  let r=await call('/v1/spots?summary=1','student');
  check(r.status===200&&r.body.spots.some(s=>s.id===spotId),'Linked student receives point in catalog');
  check((await call('/v1/spots/'+spotId,'outsider')).status===404,'Unlinked student cannot read private shared point');
  check((await call('/v1/spots/'+spotId,'student','PUT',spot)).status===403,'Student cannot change teacher point');
  check((await call('/v1/spots/'+spotId,'teacher','PUT',{...spot,name:'QA updated'})).status===200,'Teacher edits point');
  check((await call('/v1/spots/'+spotId,'student')).body.name==='QA updated','Student receives latest point version');
  const created=await call('/v1/videos','teacher','POST',{title:'QA production live',routeId:null});
  check(created.status===200||created.status===201,'Teacher creates private session');videoId=created.body.id;
  check((await call('/v1/webrtc/config','teacher')).body.enabled===true,'LiveKit configured');
  const base='/v1/videos/'+videoId+'/webrtc';
  check((await call(base+'/start','teacher','POST',{students:[config.accounts.student.id]})).status===200,'Real LiveKit room creation and grant');
  check((await call('/v1/videos','student')).body.videos.some(v=>v.id===videoId&&v.live_status==='live'),'Live appears in student list');
  const viewer=await call(base+'/join','student','POST',{});
  check(viewer.status===200&&viewer.body.publisher===false,'Student joins as viewer');
  const grant=JSON.parse(Buffer.from(viewer.body.token.split('.')[1],'base64url'));
  check(grant.video.canPublish===false&&grant.video.canSubscribe===true,'Viewer token cannot publish camera or microphone');
  check((await call(base+'/join','outsider','POST',{})).status===404,'Uninvited viewer denied');
  check((await call(base+'/heartbeat','teacher','POST',{})).status===200,'Teacher heartbeat accepted');
  check((await call(base+'/grants','teacher','PUT',{students:[]})).status===200,'Revoke viewer and request SFU removal');
  check((await call(base+'/join','student','POST',{})).status===404,'Revoked viewer cannot rejoin');
  check((await call(base+'/stop','teacher','POST',{})).status===200,'Stop real LiveKit room');
}finally{
  if(videoId){await call('/v1/videos/'+videoId+'/webrtc/stop','teacher','POST',{}).catch(()=>{});await call('/v1/videos/'+videoId,'teacher','DELETE').catch(()=>{});}
  await call('/v1/spots/'+spotId,'teacher','DELETE').catch(()=>{});
  await writeFile('docs/PRODUCTION_CHAIN_RESULT.json',JSON.stringify({at:new Date().toISOString(),checks:results,passed:results.length>=18&&results.every(x=>x.ok),physicalCameraTested:false,scope:'Deployed API + real SFU room + isolated synthetic teacher/student accounts'},null,2));
}
