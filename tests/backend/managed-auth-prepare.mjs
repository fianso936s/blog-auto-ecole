// This fixture never sends an e-mail; the dedicated test directory has verification disabled.
import {createAuthClient} from '@neondatabase/auth';
import {BetterAuthVanillaAdapter} from '@neondatabase/auth/vanilla/adapters';
import {randomBytes} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
const config=JSON.parse(await readFile('.test-runtime.json','utf8'));
if(config.branch!=='br-fragrant-lake-b9utxdv6')throw Error('Isolated beta branch required');
const url='https://ep-dry-mountain-b92pylhm.neonauth.c-7.eu-central-1.aws.neon.tech/repere_spot/auth';
const cookies=new Map();
const auth=createAuthClient(url,{adapter:BetterAuthVanillaAdapter({fetchOptions:{onRequest(ctx){ctx.headers.set('Origin',config.baseUrl);if(cookies.size)ctx.headers.set('Cookie',[...cookies].map(([a,b])=>`${a}=${b}`).join('; '));},onSuccess(ctx){for(const raw of ctx.response.headers.getSetCookie()){const first=raw.split(';')[0],at=first.indexOf('=');cookies.set(first.slice(0,at),first.slice(at+1));}}}})});
const email=`auth.${config.run}@example.invalid`,password=randomBytes(30).toString('base64url');
const {data,error}=await auth.signUp.email({email,password,name:'TEST ISOLÉ auth native',callbackURL:config.baseUrl+'/auth'});
if(error||!data?.user?.id)throw Error(error?.message||'Managed signup failed');
const tokenResult=await auth.token();if(tokenResult.error||!tokenResult.data?.token)throw Error(tokenResult.error?.message||'Managed JWT failed');
await writeFile('.auth-test-runtime.json',JSON.stringify({id:data.user.id,email,token:tokenResult.data.token}),{mode:0o600});
console.log('Managed Neon signup + session cookie + JWT issued (isolated fixture).');
