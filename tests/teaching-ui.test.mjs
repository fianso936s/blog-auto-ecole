import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {unlink} from 'node:fs/promises';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';
test('teacher opens and closes a slot with one click and the student dashboard shows actual returned progress',async()=>{
 const file=new URL('./.teaching-ui-build.mjs',import.meta.url);await build({entryPoints:['src/Teaching.tsx'],bundle:true,write:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:file.pathname});const {TeacherSchedule,StudentDashboard}=await import(file.href);
 const dom=new JSDOM('<div id="root"></div>',{url:'https://blog-auto-ecole.vercel.app'}),prior={window:globalThis.window,document:globalThis.document,fetch:globalThis.fetch};Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});let slots=[];const writes=[];
 globalThis.fetch=async(path,init)=>{
  if(path==='/v1/teaching/teachers')return Response.json({teachers:[{id:'t',name:'Enseignant'}]});
  if(path.startsWith('/v1/teaching/slots?'))return Response.json({slots});
  if(path==='/v1/teaching/slots'&&init.method==='PUT'){const body=JSON.parse(init.body);writes.push(body);const slot={id:'slot',teacherId:'t',start:body.start,end:body.end,open:body.open,version:body.expectedVersion+1};slots=[slot];return Response.json({slot});}
  if(path==='/v1/courses/students')return Response.json({students:[{id:'s',name:'Élève test',email:'s@example.invalid',reading:{read:1},quizzes:{passed:1},plan:{validated:1}}]});
  if(path==='/v1/courses/students/s')return Response.json({student:{name:'Élève test'},reading:[{courseId:'c1-verifications',read:true}],quizzes:[{courseId:'c1-verifications',bestScore:2,total:2,attempts:3}],plan:[{courseId:'c1-verifications',active:true,level:'validated'}],routes:[]});
  throw Error(path);
 };
 const root=createRoot(document.getElementById('root'));const click=async(el)=>act(async()=>{assert.ok(el);el.click();await new Promise(r=>setTimeout(r,20));});
 try{await act(()=>root.render(React.createElement(TeacherSchedule,{userId:'t'})));await click(document.querySelector('[aria-label="Semaine suivante"]'));let slot=document.querySelector('.schedule-slot');assert.equal(slot.disabled,false);await click(slot);assert.equal(writes.length,1);assert.equal(writes[0].open,true);assert.equal(slot.dataset.open,'true');await click(slot);assert.equal(writes[1].open,false);assert.equal(writes[1].expectedVersion,1);assert.equal(slot.dataset.open,'false');
  await act(()=>root.render(React.createElement(StudentDashboard)));assert.match(document.body.textContent,/Élève test/);assert.match(document.body.textContent,/3 essais/);assert.match(document.body.textContent,/100 %/);assert.match(document.body.textContent,/Progression théorique/);
 }finally{await act(()=>root.unmount());Object.assign(globalThis,prior);delete globalThis.IS_REACT_ACT_ENVIRONMENT;dom.window.close();await unlink(file);}
});
