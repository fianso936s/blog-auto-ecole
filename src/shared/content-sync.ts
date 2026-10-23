import { useEffect, useRef } from 'react';
/** Live server notifications; fallback polling also recovers missed events after sleep/network loss. */
export function useContentSync(refresh:()=>void|Promise<void>) {
  const latest=useRef(refresh);latest.current=refresh;
  useEffect(()=>{
    let disposed=false, timer:ReturnType<typeof setTimeout>|undefined;
    const update=()=>{
      if(disposed||document.visibilityState==='hidden')return;
      clearTimeout(timer);
      timer=setTimeout(()=>{if(!disposed)void latest.current();},120);
    };
    const source=typeof EventSource!=='undefined' ? new EventSource('/v1/content/events') : null;
    source?.addEventListener('content',update);
    window.addEventListener('online',update);
    document.addEventListener('visibilitychange',update);
    // A bounded fallback, including browsers/proxies that cannot keep SSE open.
    const fallback=setInterval(update,10000);
    return()=>{disposed=true;clearTimeout(timer);clearInterval(fallback);source?.close();window.removeEventListener('online',update);document.removeEventListener('visibilitychange',update);};
  },[]);
}
