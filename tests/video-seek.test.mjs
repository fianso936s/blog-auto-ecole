import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {unlink} from 'node:fs/promises';
test('recorded video can seek in both directions, preserves playback while scrubbing, and clamps skip controls',async()=>{
 const file=new URL('./.video-seek-build.mjs',import.meta.url);
 await build({entryPoints:['src/VideoPlayer.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:file.pathname});
 const dom=new JSDOM('<div id="root"></div>');const prior={window:globalThis.window,document:globalThis.document};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');const {VideoPlayer,videoTime}=await import(file.href);
 const root=createRoot(document.getElementById('root'));let pauses=0;
 const click=async(label)=>act(()=>document.querySelector(`[aria-label="${label}"]`).click());
 try {
  await act(()=>root.render(React.createElement(VideoPlayer,{src:'https://fixture.invalid/film.mp4',onError:()=>assert.fail('media error')})));
  const media=document.querySelector('video'),range=document.querySelector('input[type="range"]');
  assert.equal(range.disabled,true,'cannot seek until metadata arrives');
  Object.defineProperty(media,'duration',{value:120,configurable:true});media.pause=()=>{pauses++;};
  await act(()=>media.dispatchEvent(new dom.window.Event('loadedmetadata')));
  assert.equal(range.disabled,false);assert.equal(range.max,'120');
  const setValue=Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set;
  const seek=async(value)=>act(()=>{setValue.call(range,String(value));range.dispatchEvent(new dom.window.Event('input',{bubbles:true}));range.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
  await seek(75.5);assert.equal(media.currentTime,75.5);assert.equal(pauses,0,'scrubbing must not pause a playing video');
  await seek(12);assert.equal(media.currentTime,12,'can scrub backwards');
  await click('Reculer de 10 secondes');assert.equal(media.currentTime,2);
  await click('Reculer de 10 secondes');assert.equal(media.currentTime,0);
  await seek(117);await click('Avancer de 10 secondes');assert.equal(media.currentTime,120);
  await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Retour au début').click());assert.equal(media.currentTime,0);assert.equal(pauses,1);
  assert.equal(videoTime(3661),'1:01:01');assert.equal(videoTime(Infinity),'0:00');
 }finally{await act(()=>root.unmount());Object.assign(globalThis,prior);delete globalThis.IS_REACT_ACT_ENVIRONMENT;dom.window.close();await unlink(file);}
});
