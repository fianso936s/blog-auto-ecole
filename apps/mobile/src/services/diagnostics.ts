import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Constants from 'expo-constants';
import {request} from './auth';
import {metaBridge} from './meta-live';
import {diagnosticEvent,type DiagnosticEvent} from './diagnostic-data';

const events:DiagnosticEvent[]=[];
let loaded=false;
function loadJournal(){
  if(loaded)return;loaded=true;
  try{
    const file=new File(Paths.document,'connection-journal.json');
    if(!file.exists)return;
    const stored=JSON.parse(file.textSync());
    if(!Array.isArray(stored))return;
    for(const item of stored.slice(-100)){
      try{
        const safe=diagnosticEvent(item.step,item.ok,item.value);
        if(typeof item.at==='string'&&/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(item.at))safe.at=item.at;
        events.push(safe);
      }catch{}
    }
  }catch{}
}
export function trace(step:string,ok:boolean,value?:number) {
  loadJournal();
  events.push(diagnosticEvent(step,ok,value));
  if(events.length>100)events.splice(0,events.length-100);
  try{new File(Paths.document,'connection-journal.json').write(JSON.stringify(events));}catch{}
}
export async function testProductionChain() {
  const checks:{name:string;ok:boolean;detail:string}[]=[];
  for(const [name,path,step] of [['Serveur','/health','api'],['Repères','/v1/spots','catalog'],['Vidéos','/v1/videos','videos'],['Direct','/v1/webrtc/config','livekit']] as const) {
    try {
      const result=await request<Record<string,unknown>>(path);
      const ok=step!=='livekit'||result.enabled===true;
      trace(step,ok);
      checks.push({name,ok,detail:ok?'Accessible':"Service non configuré"});
    }catch{trace(step,false);checks.push({name,ok:false,detail:'Vérifier la connexion et réessayer'});}
  }
  const native=metaBridge();
  if(native){
    try {
      const state=await native.deviceStatus();
      trace('association',state.registered);trace('connection',state.connected);trace('frames',state.framesRecent,state.frames);
      trace('width',state.width>0,state.width);trace('height',state.height>0,state.height);
      checks.push({name:'Résolution reçue',ok:state.width>0&&state.height>0,detail:state.width>0?`${state.width} × ${state.height} pixels`:'Démarrer une capture pour mesurer'});
      checks.push({name:'Lunettes',ok:state.registered,detail:state.registered?'Association confirmée':'Non associées'});
      checks.push({name:'Images caméra',ok:state.framesRecent,detail:state.framesRecent?'Images reçues récemment':'Démarrer une capture pour tester'});
    }catch{checks.push({name:'Caméra',ok:false,detail:'Diagnostic natif indisponible'});}
  }
  return checks;
}
export async function exportDiagnostics() {
  loadJournal();
  const file=new File(Paths.cache,'le-repere-diagnostic.json');
  file.write(JSON.stringify({version:Constants.expoConfig?.version||'1.5.2',createdAt:new Date().toISOString(),events},null,2));
  if(!await Sharing.isAvailableAsync())throw new Error('Le partage est indisponible sur cet appareil.');
  await Sharing.shareAsync(file.uri,{mimeType:'application/json',dialogTitle:'Partager le diagnostic'});
}
