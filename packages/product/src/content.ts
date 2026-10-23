import {useEffect,useSyncExternalStore} from 'react';
import {courses,type Course} from './courses';
import type {Transport} from './contracts';
let version=0,revision='';const listeners=new Set<()=>void>();
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
const strings=(value:unknown):value is string[]=>Array.isArray(value)&&value.every(v=>typeof v==='string');
/** Accept declarative content only; executable code and quiz corrections are never part of this feed. */
export function applyPublishedContent(value:any){
 if(!value||typeof value.release?.revision!=='string'||!Array.isArray(value.courses)||!value.courses.length||value.courses.length>300)throw Error('Catalogue pédagogique invalide.');
 if(value.release.revision===revision)return false;
 const ids=new Set<string>();
 for(const c of value.courses){if(!c||typeof c.id!=='string'||ids.has(c.id)||!['C1','C2','Manœuvres','Sécurité'].includes(c.group)||!['code','title','intro','objective','example','safety','takeaway','sourcePages'].every(k=>typeof c[k]==='string')||!Number.isFinite(c.minutes)||!Array.isArray(c.steps)||!c.steps.every((s:any)=>s&&['title','explanation','why'].every(k=>typeof s[k]==='string'))||!strings(c.tags)||!strings(c.traps)||!strings(c.references)||!c.video||typeof c.video.title!=='string'||typeof c.video.channel!=='string'||!/^https:\/\//.test(c.video.url)||c.questions||c.answers)throw Error('Fiche pédagogique invalide.');ids.add(c.id);}
 courses.splice(0,courses.length,...value.courses as Course[]);revision=value.release.revision;version++;listeners.forEach(fn=>fn());return true;
}
export function usePublishedCourses(send:Transport,enabled:boolean){
 useSyncExternalStore(subscribe,()=>version,()=>0);
 useEffect(()=>{if(!enabled)return;let alive=true,busy=false;const refresh=async()=>{if(busy)return;busy=true;try{const data=await send('/v1/product/content');if(alive)applyPublishedContent(data);}catch{/* Keep the bundled, reviewed course content while offline. */}finally{busy=false;}};void refresh();const timer=setInterval(()=>void refresh(),30000);return()=>{alive=false;clearInterval(timer);};},[send,enabled]);
 return courses;
}
