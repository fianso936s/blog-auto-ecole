import {useEffect,useState} from 'react';
export const studentActions=[
 {id:'map',title:'Revoir un parcours',description:'Choisis ton centre d’examen, puis découvre le trajet et ses repères.',icon:'map'},
 {id:'pedagogy',title:'Apprendre et faire un quiz',description:'Une fiche claire, puis quelques questions pour vérifier ta compréhension.',icon:'book'},
] as const;
export const studentGuide=[
 {title:'Bienvenue au Repère',text:'Ton auto-école à Asnières-sur-Seine t’accompagne entre deux leçons. Ici, tu peux revoir, comprendre et préparer ta prochaine séance.'},
 {title:'Les parcours et leurs repères',text:'Ouvre Carte, choisis un centre d’examen puis un parcours partagé. Lance la lecture ou Street View et touche les repères pour lire les conseils.'},
 {title:'Les fiches et les quiz',text:'Dans Fiches, choisis un objectif dans le menu. Lis les étapes, fais le quiz et retrouve tes objectifs et ta progression dans « Mon suivi ».'},
 {title:'Les vidéos et les directs',text:'Dans Vidéos, retrouve les contenus que ton enseignant partage avec toi. Les directs disponibles apparaissent au même endroit.'},
 {title:'Ton espace, simplement',text:'Les quatre rubriques restent en bas de l’écran sur téléphone. Le bouton Accueil te ramène ici. Tu peux relancer cette visite à tout moment.'},
] as const;
export type GuideStorage={get:(key:string)=>Promise<string|null>;set:(key:string,value:string)=>Promise<void>};
export function useStudentGuide(user:string,storage:GuideStorage){
 const [step,setStep]=useState<number|null>(null);
 useEffect(()=>{let live=true;setStep(null);storage.get('repere.guide.v1.'+user).then(value=>{if(live&&!value)setStep(0);}).catch(()=>{});return()=>{live=false;};},[user,storage]);
 const close=()=>{setStep(null);void storage.set('repere.guide.v1.'+user,'seen').catch(()=>{});};
 return {step,restart:()=>setStep(0),close,next:()=>{if(step===studentGuide.length-1)close();else setStep(n=>n===null?null:n+1);},back:()=>setStep(n=>n===null?null:Math.max(0,n-1))};
}
// Both renderers keep manual exploration free, then resume after this delay.
export const MAP_RECENTER_DELAY=8000;
