import {api} from './api';
import {createProductClient} from '../../packages/product/src/contracts';
import type {ReadingStorage} from '../../packages/product/src/hooks';
export const productClient=createProductClient(api);
export const webReadingStorage:ReadingStorage={
 async load(user){try{return JSON.parse(localStorage.getItem(`repere.reading.web.${user}`)||'{}');}catch{return {}; }},
 async save(user,reading){localStorage.setItem(`repere.reading.web.${user}`,JSON.stringify(reading));},
 subscribe(refresh){const resume=()=>{if(document.visibilityState==='visible')refresh();};window.addEventListener('online',resume);document.addEventListener('visibilitychange',resume);return()=>{window.removeEventListener('online',resume);document.removeEventListener('visibilitychange',resume);};}
};
