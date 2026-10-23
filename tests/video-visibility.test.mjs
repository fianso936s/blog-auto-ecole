import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {readFile,unlink} from 'node:fs/promises';
test('video publication selects all students explicitly and can immediately be made private again',async()=>{
 const file=new URL('./.video-visibility-build.mjs',import.meta.url);
 const dom=new JSDOM('<div id="root"></div>',{url:'https://blog-auto-ecole.vercel.app',pretendToBeVisual:true});
 const prior={window:globalThis.window,document:globalThis.document,localStorage:globalThis.localStorage,fetch:globalThis.fetch};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true});
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};dom.window.matchMedia=()=>({matches:false});
 const {act}=await import('react');const writes=[];let published=false;
 const video={id:'film',author_id:'admin',title:'Parcours filmé',state:'ready',live_status:'idle',created_at:'2026-10-23',author_name:'Admin'};
 globalThis.fetch=async(path,init)=>{
  if(path==='/v1/me')return Response.json({id:'admin',name:'Admin',email:'a@example.invalid',role:'admin'});
  if(path==='/v1/courses/me')return Response.json({reading:[],quizzes:[],plan:[]});
  if(path==='/v1/videos')return Response.json({videos:[{...video,visibility:published?'students':'private'}]});
  if(path==='/v1/videos/config')return Response.json({uploadEnabled:true});
  if(path==='/v1/students')return Response.json({students:[{id:'s',name:'Un'},{id:'o',name:'Deux'}]});
  if(path==='/v1/videos/film/grants'){
   if(init.method==='PUT'){const body=JSON.parse(init.body);writes.push(body);published=body.published;return Response.json({ok:true});}
   return Response.json({students:published?['s','o']:[],published});
  }
  throw Error('Unexpected '+path);
 };
 await build({entryPoints:['src/app.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:file.pathname,plugins:[{name:'ui-fixture',setup(b){
  b.onResolve({filter:/^maplibre-gl$/},()=>({path:'map-stub',namespace:'map-stub'}));b.onLoad({filter:/.*/,namespace:'map-stub'},()=>({loader:'js',contents:'export default {};'}));
  b.onResolve({filter:/\.css$/},()=>({path:'empty',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'js',contents:''}));
  b.onLoad({filter:/src\/app\.tsx$/},async args=>({loader:'tsx',contents:(await readFile(args.path,'utf8')).replace('createRoot(document.getElementById("root")!).render(','(globalThis.__videoRoot = createRoot(document.getElementById("root")!)).render(')}));
 }}]});
 const click=async(el)=>{assert.ok(el);await act(async()=>{el.dispatchEvent(new dom.window.MouseEvent('click',{bubbles:true}));await new Promise(r=>setTimeout(r,30));});};
 const button=text=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===text);
 try {
  await act(async()=>{await import(file.href);await new Promise(r=>setTimeout(r,60));});
  await click(button('Vidéos'));
  await click(button('Publier pour les élèves'));
  const select=document.querySelector('dialog select');assert.equal(select.value,'private','opening controls must preserve private status');
  await act(()=>{select.value='all';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});
  await click(button('Enregistrer les accès'));
  assert.deepEqual(writes[0],{students:['s','o'],published:true});
  assert.ok(document.body.textContent.includes('Visible par les élèves autorisés'));
  await click(button('Passer en privé'));
  assert.equal(writes.at(-1).published,false);assert.equal(published,false);
 }finally{await act(()=>globalThis.__videoRoot?.unmount());delete globalThis.__videoRoot;Object.assign(globalThis,prior);delete globalThis.IS_REACT_ACT_ENVIRONMENT;dom.window.close();await unlink(file);}
});
