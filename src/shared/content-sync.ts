import {useEffect,useRef} from 'react';
import {networkPolicy} from '../../packages/product/src/network';
/** Events drive updates. Polling only recovers broken connections or missed events. */
export function useContentSync(refresh:()=>void|Promise<void>){
 const latest=useRef(refresh);latest.current=refresh;
 useEffect(()=>{
  let disposed=false,busy=false,queued=false,source:EventSource|null=null;
  let debounce:ReturnType<typeof setTimeout>|undefined,reconnect:ReturnType<typeof setTimeout>|undefined;
  let lastSignal=0,lastRefresh=Date.now(),failures=0;
  const visible=()=>document.visibilityState!=='hidden';
  const update=()=>{if(disposed||!visible())return;clearTimeout(debounce);debounce=setTimeout(()=>void run(),120);};
  const run=async()=>{if(disposed||!visible())return;if(busy){queued=true;return;}busy=true;try{await latest.current();lastRefresh=Date.now();}catch{/* The screen owns its error state; fallback retries remain bounded. */}finally{busy=false;if(queued){queued=false;update();}}};
  const open=()=>{
   if(disposed||!visible()||source||typeof EventSource==='undefined')return;
   const next=new EventSource('/v1/content/events');source=next;
   const signal=()=>{lastSignal=Date.now();failures=0;};
   next.addEventListener('open',signal);next.addEventListener('ping',signal);
   next.addEventListener('content',()=>{signal();update();});
   next.addEventListener('error',()=>{if(source!==next)return;next.close();source=null;if(disposed||!visible())return;reconnect=setTimeout(open,Math.min(60000,5000*2**Math.min(failures++,4)));});
  };
  const resume=()=>{if(visible()){open();update();}else{clearTimeout(debounce);clearTimeout(reconnect);source?.close();source=null;}};
  open();window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);
  const fallback=setInterval(()=>{if(Date.now()-lastSignal>=networkPolicy.contentFallbackMs||Date.now()-lastRefresh>=networkPolicy.contentSafetyMs)update();},networkPolicy.contentFallbackMs);
  return()=>{disposed=true;clearTimeout(debounce);clearTimeout(reconnect);clearInterval(fallback);source?.close();window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);};
 },[]);
}
