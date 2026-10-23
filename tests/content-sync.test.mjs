import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {unlink} from 'node:fs/promises';
test('server publication events refresh a mounted catalog, coalesce bursts and close on unmount',async()=>{
 const file=new URL('./.content-sync-test.mjs',import.meta.url);
 await build({entryPoints:['src/shared/content-sync.ts'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file.pathname});
 const {useContentSync}=await import(file.href);const dom=new JSDOM('<div id="root"></div>',{pretendToBeVisual:true});
 const prior={window:globalThis.window,document:globalThis.document,EventSource:globalThis.EventSource};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 let source,refreshes=0;
 globalThis.EventSource=class extends dom.window.EventTarget{constructor(url){super();assert.equal(url,'/v1/content/events');source=this;}close(){this.closed=true;}};
 const root=createRoot(document.getElementById('root'));const Sample=()=>{useContentSync(()=>{refreshes++;});return null;};
 try {await act(()=>root.render(React.createElement(Sample)));
  await act(async()=>{for(let i=0;i<4;i++)source.dispatchEvent(new dom.window.Event('content'));await new Promise(r=>setTimeout(r,160));});
  assert.equal(refreshes,1,'one refresh per publication burst');
  await act(async()=>{window.dispatchEvent(new dom.window.Event('online'));await new Promise(r=>setTimeout(r,160));});assert.equal(refreshes,2);
  await act(()=>root.unmount());assert.equal(source.closed,true);
  source.dispatchEvent(new dom.window.Event('content'));await new Promise(r=>setTimeout(r,160));assert.equal(refreshes,2);
 }finally{Object.assign(globalThis,prior);delete globalThis.IS_REACT_ACT_ENVIRONMENT;dom.window.close();await unlink(file);}
});
