import {AppState} from 'react-native';
import {createProductClient} from '../../../../packages/product/src/contracts';
import type {ReadingStorage} from '../../../../packages/product/src/hooks';
import {request} from './auth';
import {loadReading,saveReading} from '../pedagogy/reading';
export const productTransport:import('../../../../packages/product/src/contracts').Transport=(path,method='GET',body)=>request(path,{method,...(body===undefined?{}:{body:JSON.stringify(body)})});
export const productClient=createProductClient(productTransport);
export const nativeReadingStorage:ReadingStorage={
 load:loadReading,
 async save(user,reading){for(const [id,value] of Object.entries(reading))await saveReading(user,id,{read:!!value.read,review:!!value.review});},
 subscribe(refresh){const listener=AppState.addEventListener('change',state=>{if(state==='active')refresh();});const timer=setInterval(()=>{if(AppState.currentState==='active')refresh();},10000);return()=>{listener.remove();clearInterval(timer);};}
};
