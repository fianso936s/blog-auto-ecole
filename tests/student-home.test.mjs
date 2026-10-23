import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {JSDOM} from 'jsdom';import React,{act} from 'react';import {createRoot} from 'react-dom/client';import {unlink} from 'node:fs/promises';
test('student welcome keeps two direct actions, all secondary destinations, and a dismissible per-user guide',async()=>{
 const file=new URL('./.student-home-build.mjs',import.meta.url);await build({entryPoints:['src/StudentHome.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:file.pathname});
 const dom=new JSDOM('<div id="root"></div>',{url:'https://fixture.invalid'}),prior={window:globalThis.window,document:globalThis.document,localStorage:globalThis.localStorage};Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true});
 const {StudentHome}=await import(file.href);const root=createRoot(document.getElementById('root')),routes=[];const Dialog=({title,onClose,children})=>React.createElement('section',{role:'dialog','aria-label':title},children,React.createElement('button',{onClick:onClose},'Fermer'));
 const render=user=>root.render(React.createElement(StudentHome,{user,name:'Soufiane Élève',go:id=>routes.push(id),Dialog}));const click=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.includes(text)).click();
 try{
  await act(async()=>render('student-a'));assert.ok(document.querySelector('[role="dialog"]'));assert.equal(document.querySelectorAll('.student-action').length,2);
  await act(async()=>click('Suivant'));assert.match(document.querySelector('[role="dialog"]').textContent,/Street View/);await act(async()=>click('Précédent'));assert.equal(document.querySelector('[role="dialog"]').getAttribute('aria-label'),'Bienvenue au Repère');
  await act(async()=>click('Passer la visite'));assert.equal(document.querySelector('[role="dialog"]'),null);assert.equal(localStorage.getItem('repere.guide.v1.student-a'),'seen');
  await act(async()=>click('Revoir un parcours'));await act(async()=>click('Apprendre et faire un quiz'));document.querySelector('details').open=true;await act(async()=>click('Vidéos et directs'));await act(async()=>click('Mon espace'));assert.deepEqual(routes,['map','pedagogy','videos','account']);
  await act(async()=>click('Découvrir les fonctionnalités'));assert.ok(document.querySelector('[role="dialog"]'));await act(async()=>click('Fermer'));await act(async()=>render('student-b'));assert.ok(document.querySelector('[role="dialog"]'),'another student has their own introduction');
 }finally{await act(async()=>root.unmount());dom.window.close();Object.assign(globalThis,prior);delete globalThis.IS_REACT_ACT_ENVIRONMENT;await unlink(file);}
});
