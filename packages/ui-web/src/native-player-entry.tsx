import React from 'react';
import {createRoot} from 'react-dom/client';
import {VideoPlayer} from './VideoPlayer';
const src=(window as any).__REPERE_VIDEO_SRC__ as string;
createRoot(document.getElementById('root')!).render(<VideoPlayer src={src} onError={()=>{(window as any).ReactNativeWebView?.postMessage(JSON.stringify({type:'media-error'}));}}/>);
