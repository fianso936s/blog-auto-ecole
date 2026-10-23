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
const result=await call('/v1/apps/6824949641/buildUploads?filter[cfBundleVersion]=32&filter[cfBundleShortVersionString]=1.6.0&include=build&limit=10');
await (await import('node:fs/promises')).writeFile('/tmp/repere-apple32-upload-status.json',JSON.stringify(result));
console.log(JSON.stringify({uploads:result.data.map(x=>({id:x.id,...x.attributes,buildId:x.relationships?.build?.data?.id})),builds:result.included?.filter(x=>x.type==='builds').map(x=>({id:x.id,...x.attributes}))}));
