import {networkPolicy,isProductActive,useActivePolling} from "./network";
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
 for(const c of value.courses){if(!c||typeof c.id!=='string'||ids.has(c.id)||!['C1','C2','C3','Manœuvres','Sécurité'].includes(c.group)||!['code','title','intro','objective','example','safety','takeaway','sourcePages'].every(k=>typeof c[k]==='string')||!Number.isFinite(c.minutes)||!Array.isArray(c.steps)||!c.steps.every((s:any)=>s&&['title','explanation','why'].every(k=>typeof s[k]==='string')&&(s.figure===undefined||(s.figure&&['svg','caption','alt'].every(k=>typeof s.figure[k]==='string')&&/^<svg /.test(s.figure.svg)&&!/<script|on\w+=|href=/i.test(s.figure.svg))))||!strings(c.tags)||!strings(c.traps)||!strings(c.references)||!c.video||typeof c.video.title!=='string'||typeof c.video.channel!=='string'||!/^https:\/\//.test(c.video.url)||c.questions||c.answers)throw Error('Fiche pédagogique invalide.');ids.add(c.id);}
 courses.splice(0,courses.length,...value.courses as Course[]);revision=value.release.revision;version++;listeners.forEach(fn=>fn());return true;
}
const checks=new WeakMap<Transport,Promise<void>>();
export function refreshPublishedCourses(send:Transport):Promise<void>{
 const pending=checks.get(send);if(pending)return pending;
 const work=(async()=>{const release=await send('/v1/product');if(release.revision===revision)return;const data=await send('/v1/product/content');applyPublishedContent(data);})();
 checks.set(send,work);void work.finally(()=>{if(checks.get(send)===work)checks.delete(send);}).catch(()=>{});return work;
}
export function usePublishedCourses(send:Transport,enabled:boolean){
 useSyncExternalStore(subscribe,()=>version,()=>0);
 const refresh=async()=>{if(enabled&&isProductActive())await refreshPublishedCourses(send);};
 useEffect(()=>{void refresh().catch(()=>{});},[send,enabled]);
 useActivePolling(refresh,networkPolicy.contentCheckMs);
 return courses;
}
