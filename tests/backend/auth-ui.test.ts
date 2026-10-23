import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as helpers from '../../apps/api/src/auth-ui.js';
function page(file: string, client: any, review = false) {
 const ids=['auth-form','reset-form','email','otp','password','confirmation','name','name-field','otp-field','password-field','reset-fields','submit','resend','password-mode','message','return'];
 const nodes:any=Object.fromEntries(ids.map(id=>[id,{value:'',hidden:false,disabled:false,validity:{valid:true},dataset:{},attrs:{},setAttribute(k:string,v:string){this.attrs[k]=v},addEventListener(e:string,f:any){this[e]=f},focus(){}}]));
 const source=readFileSync(new URL('../../apps/api/src/'+file,import.meta.url),'utf8').replace(/^import .*;\n/gm,'');
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 vm.runInNewContext(js,{...helpers,URL,AbortSignal,Error,TypeError,location:{href:'https://example.test/auth'+(review?'?review=1':'')},document:{documentElement:{dataset:{authUrl:'https://example.test/api/auth'}},querySelector:(s:string)=>nodes[s.slice(1)]},createAuthClient:()=>client});
 return {nodes,submit:()=>nodes[file==='reset-client.ts'?'reset-form':'auth-form'].submit({preventDefault(){}})};
}
test('auth errors are explicit and do not reveal whether an account exists',()=>{
 assert.match(helpers.authError({code:'INVALID_EMAIL_OR_PASSWORD'}),/incorrect/);
 assert.equal(helpers.authError({code:'USER_NOT_FOUND'}),helpers.authError({code:'INVALID_PASSWORD'}));
 assert.match(helpers.authError({code:'OTP_EXPIRED'}),/expiré/);
 assert.throws(()=>helpers.validatePasswords('1234567','1234567'));
 assert.throws(()=>helpers.validatePasswords('12345678','87654321'));
 helpers.validateOtp('1234 5678');
});
test('incorrect password keeps form open and restores controls',async()=>{
 const {nodes:n,submit}=page('auth-client.ts',{signIn:{email:async()=>({error:{code:'INVALID_EMAIL_OR_PASSWORD'}})}});
 n.email.value='review@example.test';  n.password.value='fake-password'; await submit();
 assert.match(n.message.textContent,/incorrect/); assert.equal(n.message.attrs.role,'alert'); assert.equal(n['auth-form'].hidden,false); assert.equal(n.submit.disabled,false); assert.equal(n['password-mode'].disabled,false);
});
test('standalone password login succeeds without a native redirect request',async()=>{
 const {nodes:n,submit}=page('auth-client.ts',{signIn:{email:async()=>({data:{user:{id:'test',emailVerified:true}}})}});
 n.email.value='review@example.test';n.password.value='fake-password';await submit();
 assert.equal(n['auth-form'].hidden,true);assert.match(n.message.textContent,/Connexion réussie/);assert.equal(n.password.value,'');
});
test('double submit starts one request only',async()=>{
 let calls=0;let resolve:any;
 const {nodes:n,submit}=page('auth-client.ts',{signIn:{email:()=>{calls++;return new Promise(r=>resolve=r)}}});
 n.email.value='review@example.test';n.password.value='fake-password';const pending=submit();await submit();assert.equal(calls,1);resolve({data:{success:true}});await pending;assert.equal(n.submit.disabled,false);
});
test('reset validates confirmation, normalizes codes and shows provider errors',async()=>{
 let payload:any;let fail=true;
 const {nodes:n,submit}=page('reset-client.ts',{emailOtp:{requestPasswordReset:async()=>({data:{success:true}}),resetPassword:async(p:any)=>{payload=p;return fail?{error:{code:'INVALID_OTP'}}:{data:{success:true}}}}},true);
 await submit();n.otp.value='1234 5678';n.password.value='fake-password';n.confirmation.value='wrong';await submit();assert.equal(payload,undefined);assert.match(n.message.textContent,/identiques/);
 n.confirmation.value=n.password.value;await submit();assert.equal(payload.otp,'12345678');assert.match(n.message.textContent,/incorrect ou expiré/);assert.equal(n['reset-form'].hidden,false);
 fail=false;await submit();assert.equal(n['reset-form'].hidden,true);assert.equal(n.password.value,'');assert.match(n.message.textContent,/est défini/);
});
test('password account connects without requesting any email code',async()=>{
 let sent=0;
 const {nodes:n,submit}=page('auth-client.ts',{signIn:{email:async()=>({data:{user:{id:'test',emailVerified:true}}})},emailOtp:{sendVerificationOtp:async()=>{sent++;throw new Error('OTP must not be used')}}});
 n.email.value='review@example.test';n.password.value='fake-password';await submit();
 assert.equal(sent,0);assert.equal(n['auth-form'].hidden,true);assert.match(n.message.textContent,/Connexion réussie/);
});
test('verified password signup completes without sending an unnecessary verification code',async()=>{
 let calls=0;
 const {nodes:n,submit}=page('auth-client.ts',{signUp:{email:async(p:any)=>{assert.equal(p.name,'Test');calls++;return {data:{user:{id:'new',emailVerified:true}}}}}});
 n['password-mode'].click();n.name.value='Test';n.email.value='new@example.test';n.password.value='fake-password';await submit();
 assert.equal(calls,1);assert.equal(n['auth-form'].hidden,true);
});

test('unverified account must verify before native authorization; invalid OTP never completes login',async()=>{
 let sent=0,verified=0;const {nodes:n,submit}=page('auth-client.ts',{signUp:{email:async()=>({data:{user:{id:'new',emailVerified:false}}})},emailOtp:{sendVerificationOtp:async(p:any)=>{assert.equal(p.type,'email-verification');sent++;return {data:{success:true}}},verifyEmail:async()=>{verified++;return {error:{code:'INVALID_OTP'}}}}});
 n['password-mode'].click();n.name.value='Élève';n.email.value='new@example.test';n.password.value='fake-password';await submit();assert.equal(sent,1);assert.equal(n['otp-field'].hidden,false);assert.equal(n['auth-form'].hidden,false);assert.equal(n.password.value,'');n.otp.value='123456';await submit();assert.equal(verified,1);assert.match(n.message.textContent,/incorrect/);assert.equal(n['auth-form'].hidden,false);
});

test('successful email verification completes signup and clears the code',async()=>{
 let verified=0;const {nodes:n,submit}=page('auth-client.ts',{signUp:{email:async()=>({data:{user:{id:'new',emailVerified:false}}})},emailOtp:{sendVerificationOtp:async()=>({data:{success:true}}),verifyEmail:async(p:any)=>{assert.equal(p.otp,'123456');verified++;return {data:{status:true}}}}});
 n['password-mode'].click();n.name.value='Élève';n.email.value='new@example.test';n.password.value='fake-password';await submit();n.otp.value='123456';await submit();assert.equal(verified,1);assert.equal(n['auth-form'].hidden,true);assert.equal(n.otp.value,'');assert.match(n.message.textContent,/Connexion réussie/);
});
