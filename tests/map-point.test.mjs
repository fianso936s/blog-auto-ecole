import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import {readFile,unlink} from 'node:fs/promises';

test('teacher chooses an exact map position, saves a marker, and sees it after server refresh',async()=>{
 const file=new URL('./.map-point-build.mjs',import.meta.url);
 const dom=new JSDOM('<div id="root"></div>',{url:'https://blog-auto-ecole.vercel.app',pretendToBeVisual:true});
 const prior={window:globalThis.window,document:globalThis.document,localStorage:globalThis.localStorage,fetch:globalThis.fetch,ResizeObserver:globalThis.ResizeObserver};
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,localStorage:dom.window.localStorage,IS_REACT_ACT_ENVIRONMENT:true});
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
 dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 dom.window.matchMedia=()=>({matches:false});
 const React=await import('react');const {act}=React;
 const saved=[];
 globalThis.fetch=async(path,init)=>{
  if(path==='/v1/me')return Response.json({id:'teacher',name:'Enseignant',email:'teacher@example.invalid',role:'teacher'});
  if(path==='/v1/courses/me')return Response.json({reading:[],quizzes:[],plan:[]});
  if(path==='/v1/spots?summary=1')return Response.json({spots:saved});
  if(path==='/v1/routes')return Response.json({routes:[]});
  if(path.startsWith('/v1/spots/')&&init.method==='PUT'){const body=JSON.parse(init.body);saved.push({...body,authorId:'teacher'});return Response.json(saved.at(-1));}
  throw Error('Unexpected API request '+path);
 };
 await build({entryPoints:['src/app.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',outfile:file.pathname,plugins:[{
  name:'map-fixture',setup(b){
   b.onResolve({filter:/\.css$/},()=>({path:'empty-css',namespace:'fixture'}));
   b.onLoad({filter:/src\/app\.tsx$/},async args=>({loader:'tsx',contents:(await readFile(args.path,'utf8')).replace('createRoot(document.getElementById("root")!).render(','(globalThis.__pointRoot = createRoot(document.getElementById("root")!)).render(')}));
   b.onResolve({filter:/^maplibre-gl$/},()=>({path:'map-fixture',namespace:'fixture'}));
   b.onLoad({filter:/.*/,namespace:'fixture'},args=>({loader:'js',contents:args.path==='empty-css'?'':`
    class MapView {constructor(options){this.container=options.container;this.handlers={};globalThis.__pointMap=this;} on(name,fn){this.handlers[name]=fn;if(name==='load')fn();} addControl(){} addSource(){} addLayer(){} getSource(){return {setData(){}}} isStyleLoaded(){return true} resize(){} easeTo(){} fitBounds(){} getCenter(){return {lat:48,lng:2}} remove(){} }
    class Marker{constructor(options={}){this.element=options.element;}setLngLat(){return this}addTo(map){if(this.element)map.container.append(this.element);return this}remove(){this.element?.remove();}}
    class Bounds{extend(){return this}}
    export default {Map:MapView,Marker,LngLatBounds:Bounds,NavigationControl:class{}};
   `}));
  }
 }]});
 const button=name=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===name||b.getAttribute('aria-label')===name);
 try{
  await act(()=>import(file.href));
  await act(()=>button('Carte et parcours').click());
  await act(()=>button('Ajouter un repère').click());
  assert.match(document.querySelector('.map-placement').textContent,/Touchez la carte/);
  await act(()=>globalThis.__pointMap.handlers.click({lngLat:{lat:48.91427,lng:2.28231}}));
  const modal=document.querySelector('dialog[open]');assert.ok(modal);
  const name=modal.querySelector('input[maxlength="120"]');
  await act(()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(name,'Priorité à droite');name.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  await act(()=>modal.querySelector('form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(saved.length,1);assert.equal(saved[0].name,'Priorité à droite');assert.equal(saved[0].lat,48.91427);assert.equal(saved[0].lng,2.28231);
  assert.equal(saved[0].status,'private','creation must not silently publish a marker');
  assert.equal(document.querySelector('dialog[open]'),null);
  assert.equal(document.querySelectorAll('.map-pin').length,1);
 }finally{
  if(globalThis.__pointRoot)await act(()=>globalThis.__pointRoot.unmount());
  delete globalThis.__pointRoot;delete globalThis.__pointMap;delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  dom.window.close();Object.assign(globalThis,prior);
  await unlink(file);await unlink(file.pathname.replace(/\.mjs$/,'.css')).catch(()=>{});
 }
});
