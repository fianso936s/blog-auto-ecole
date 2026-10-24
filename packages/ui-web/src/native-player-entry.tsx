import React from 'react';
import {createRoot} from 'react-dom/client';
import {VideoPlayer} from './VideoPlayer';
const src=(window as any).__REPERE_VIDEO_SRC__ as string;
const post=(m:object)=>(window as any).ReactNativeWebView?.postMessage(JSON.stringify(m));
// The app answers {type:'renew'} by calling window.__repereRenew(newUrl).
const renew=()=>new Promise<string>((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('timeout')),15000);
  (window as any).__repereRenew=(url:string)=>{clearTimeout(timer);resolve(url);};
  post({type:'renew'});
});
createRoot(document.getElementById('root')!).render(<VideoPlayer src={src} renew={renew} onError={()=>post({type:'media-error'})}/>);
