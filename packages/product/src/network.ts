import {useEffect,useRef} from 'react';
export const networkPolicy={contentCheckMs:300000,contentFallbackMs:60000,contentSafetyMs:300000,learningMs:60000,statisticsMs:30000,scheduleMs:15000};
let active=()=>typeof document==='undefined'||document.visibilityState!=='hidden';
export function setActivityCheck(check:()=>boolean){active=check;}
export const isProductActive=()=>active();
/** One request at a time; no background polling. Errors back off rather than retrying in a loop. */
export function useActivePolling(refresh:()=>unknown|Promise<unknown>,ms:number){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{let disposed=false,timer:ReturnType<typeof setTimeout>,failures=0;
 const tick=async()=>{if(disposed)return;if(active()){try{await latest.current();failures=0;}catch{failures=Math.min(failures+1,4);}}if(!disposed)timer=setTimeout(()=>void tick(),ms*2**failures);};
 timer=setTimeout(()=>void tick(),ms);return()=>{disposed=true;clearTimeout(timer);};},[ms]);
}
