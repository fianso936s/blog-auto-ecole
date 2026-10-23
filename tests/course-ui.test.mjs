import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {unlink} from 'node:fs/promises';

test('course quiz keeps its attempt on network failure and displays server corrections',async()=>{
 const file=new URL('./.course-ui-build.mjs',import.meta.url);
 await build({entryPoints:['src/CourseLearning.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:file.pathname});
 const {LessonQuiz,useCourseProgress}=await import(file.href);
 const dom=new JSDOM('<div id="root"></div>',{url:'https://blog-auto-ecole.vercel.app'});
 const prior={window:globalThis.window,document:globalThis.document,localStorage:globalThis.localStorage,fetch:globalThis.fetch};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true});
 const quiz={revision:'current',questions:[{id:'q1',question:'Que prépares-tu ?',options:['Mon observation','Mon itinéraire seulement']},{id:'q2',question:'Quand contrôles-tu ?',options:['Avant d’agir','Après seulement']}]};
 const attempts=[];let fail=true,changed=0;
 globalThis.fetch=async(path,init)=>{
  if(init.method==='GET')return Response.json(quiz);
  attempts.push(JSON.parse(init.body));if(fail){fail=false;throw Error('offline');}
  return Response.json({score:1,total:2,passed:false,corrections:[{id:'q1',correct:true,answer:0,explanation:'Observer prépare la décision.'},{id:'q2',correct:false,answer:0,explanation:'On contrôle avant d’agir.'}]});
 };
 const root=createRoot(document.getElementById('root'));
 try {
  await act(()=>root.render(React.createElement(LessonQuiz,{course:{id:'c1-controles',title:'Les contrôles'},profile:{id:'s',role:'student'},onChanged:()=>changed++,onLogin:()=>assert.fail('login not needed')})));
  await act(()=>document.querySelector('button').click());
  const radios=[...document.querySelectorAll('input[type="radio"]')];
  await act(()=>{radios[0].click();radios[3].click();});
  await act(()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
  assert.match(document.querySelector('[role="alert"]').textContent,/Connexion interrompue/);
  assert.equal(document.querySelector('.quiz-result'),null,'failure must not invent a score');
  await act(()=>document.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(attempts.length,2);assert.equal(attempts[0].attemptId,attempts[1].attemptId);
  assert.deepEqual(attempts[1].answers,{q1:0,q2:1});assert.equal(changed,1);
  assert.match(document.querySelector('.quiz-result').textContent,/1 \/ 2/);
  assert.match(document.querySelectorAll('.quiz-correction')[1].textContent,/On contrôle avant/);
  // Re-entering from another device/profile must load the server, not the prior user's marks.
  globalThis.fetch=async()=>Response.json({reading:[{courseId:'c1-controles',read:true,review:false}],quizzes:[],plan:[]});
  function Probe({profile}){const state=useCourseProgress(profile);return React.createElement('output',null,JSON.stringify(state.reading));}
  await act(()=>root.render(React.createElement(Probe,{profile:{id:'s',role:'student'}})));
  assert.equal(JSON.parse(document.querySelector('output').textContent)['c1-controles'].read,true);
  globalThis.fetch=async()=>Response.json({reading:[],quizzes:[],plan:[]});
  await act(()=>root.render(React.createElement(Probe,{profile:{id:'other',role:'student'}})));
  assert.deepEqual(JSON.parse(document.querySelector('output').textContent),{});
 }finally{await act(()=>root.unmount());dom.window.close();Object.assign(globalThis,prior);delete globalThis.IS_REACT_ACT_ENVIRONMENT;await unlink(file);}
});
