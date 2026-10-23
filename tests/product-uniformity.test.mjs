import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const compiled=await build({stdin:{contents:"export * from './packages/product/src/contracts';export * from './packages/product/src/content';export * from './packages/product/src/courses';",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',packages:'external'});
// External React is imported via a file to preserve regular Node module resolution.
const moduleFile=new URL('./.product-contract.mjs',import.meta.url);const {writeFile,unlink}=await import('node:fs/promises');await writeFile(moduleFile,compiled.outputFiles[0].contents);
const product=await import(moduleFile.href);await unlink(moduleFile);
test('a web and native transport send the same quiz, reading and visibility contracts',async()=>{
 const web=[],ios=[];const a=product.createProductClient(async(...args)=>web.push(args)),b=product.createProductClient(async(...args)=>ios.push(args));
 for(const c of [a,b]){await c.read('c1-verifications',{read:true});await c.quiz('c1-verifications');await c.answer('c1-verifications',{revision:'same',attemptId:'attempt',answers:{q1:0}});await c.shareVideo('film',['student'],true);await c.routeProgress('route',0);}
 assert.deepEqual(web,ios);assert.deepEqual(web.at(-1),['/v1/routes/route/progress','POST',{fixIndex:0}]);
});
test('published course data updates the shared catalog, retains its reference and refuses embedded quiz corrections',async()=>{
 const original=product.courses,feed=JSON.parse(await readFile('apps/api/src/product-content.json','utf8'));
 assert.ok(feed.courses.every(c=>!('questions' in c)&&!('answers' in c)));
 const next=structuredClone(feed);next.release.revision='changed';next.courses[0].title='Cours actualisé';
 assert.equal(product.applyPublishedContent(next),true);assert.equal(product.courses,original);assert.equal(product.courses[0].title,'Cours actualisé');assert.equal(product.applyPublishedContent(next),false);
 const bad=structuredClone(next);bad.release.revision='bad';bad.courses[0].questions=[{answer:0}];assert.throws(()=>product.applyPublishedContent(bad));assert.equal(product.courses[0].title,'Cours actualisé');
});
test('the iOS embedded player uses the same timeline and protects its HTML source interpolation',async()=>{
 const r=await build({entryPoints:['apps/mobile/src/generated/video-player.ts'],bundle:true,write:false,platform:'node',format:'esm'});const player=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].contents).toString('base64'));
 const html=player.recordedVideoHtml('https://fixture.invalid/</script><script>bad()</script>.mp4');
 const dom=new JSDOM(html,{runScripts:"dangerously",pretendToBeVisual:true});await new Promise(r=>setTimeout(r,50));assert.equal(dom.window.document.querySelectorAll('script').length,2,'a URL cannot inject a script');
 assert.ok(dom.window.document.querySelector('input[aria-label="Position dans la vidéo"]'));assert.ok(dom.window.document.body.textContent.includes('Retour au début'));dom.window.close();
});
