// Reuse the existing Apple API credential, supplied outside the source tree.
import {readFile} from 'node:fs/promises';
import {SignJWT,importPKCS8} from 'jose';
const keyPath=process.env.REPERE_ASC_KEY_PATH;
if(!keyPath)throw Error('REPERE_ASC_KEY_PATH required');
const key=await importPKCS8(await readFile(keyPath,'utf8'),'ES256');
const jwt=await new SignJWT({}).setProtectedHeader({alg:'ES256',kid:'6P47VVH96W',typ:'JWT'})
  .setIssuer('88eb4e5e-2993-4285-8137-e76de9f45b19').setAudience('appstoreconnect-v1').setIssuedAt().setExpirationTime('5m').sign(key);
async function call(path,method='GET',body){
  const response=await fetch('https://api.appstoreconnect.apple.com'+path,{method,headers:{Authorization:'Bearer '+jwt,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(25000)});
  const result=response.status===204?null:await response.json();
  if(!response.ok)throw Error('Apple '+response.status+': '+(result?.errors?.map(e=>e.code).join(',')||'Request failed'));
  return result;
}
const version=process.argv[2]||'23';
const result=await call('/v1/builds?filter[app]=6824949641&filter[version]='+encodeURIComponent(version)+'&include=buildBetaDetail');
const builds=result.data.map(b=>({id:b.id,version:b.attributes.version,processingState:b.attributes.processingState,usesNonExemptEncryption:b.attributes.usesNonExemptEncryption,beta:result.included?.find(d=>d.id===b.relationships?.buildBetaDetail?.data?.id)?.attributes}));
console.log(JSON.stringify({builds}));
if(process.argv.includes('--enable-internal')||process.argv.includes('--verify-internal')){
  if(builds.length!==1||builds[0].processingState!=='VALID')throw Error('Exactly one valid build required');
  const group='add2109e-f13e-4e98-ad74-20d3c20c789f';
  // Existing group and existing testers only; no public link or invitations.
  if(process.argv.includes('--enable-internal'))await call('/v1/betaGroups/'+group+'/relationships/builds','POST',{data:[{type:'builds',id:builds[0].id}]});
  const current=await call('/v1/betaGroups/'+group+'/builds?limit=200');
  console.log(JSON.stringify({internalGroupEnabled:current.data.some(b=>b.id===builds[0].id)}));
}
if(process.argv.includes('--set-notes')){
  if(version!=='32'||builds.length!==1||builds[0].processingState!=='VALID')throw Error('Build 32 valid required for the 1.6.0 notes');
  const notes=(await readFile(new URL('../docs/BETA_WHATS_NEW_1_6_0.txt',import.meta.url),'utf8')).trim();
  const current=await call('/v1/betaBuildLocalizations?filter[build]='+encodeURIComponent(builds[0].id));
  const existing=current.data.find(x=>x.attributes.locale==='fr-FR');
  let localization;
  if(existing)localization=await call('/v1/betaBuildLocalizations/'+existing.id,'PATCH',{data:{type:'betaBuildLocalizations',id:existing.id,attributes:{whatsNew:notes}}});
  else localization=await call('/v1/betaBuildLocalizations','POST',{data:{type:'betaBuildLocalizations',attributes:{locale:'fr-FR',whatsNew:notes},relationships:{build:{data:{type:'builds',id:builds[0].id}}}}});
  const verified=await call('/v1/betaBuildLocalizations/'+localization.data.id);
  if(verified.data.attributes.whatsNew!==notes)throw Error('French beta notes not confirmed');
  console.log(JSON.stringify({betaFrenchNotesVerified:true}));
}
