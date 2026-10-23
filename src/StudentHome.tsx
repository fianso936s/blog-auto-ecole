import React from 'react';
import {studentActions,studentGuide,useStudentGuide,type GuideStorage} from '../packages/product/src/student-experience';
const storage:GuideStorage={async get(key){return localStorage.getItem(key);},async set(key,value){localStorage.setItem(key,value);}};
export function StudentHome({user,name,go,Dialog}:{user:string;name:string;go:(tab:string)=>void;Dialog:React.ComponentType<{title:string;onClose:()=>void;children:React.ReactNode}>}){
 const guide=useStudentGuide(user,storage),item=guide.step===null?null:studentGuide[guide.step];
 return <div className="page student-home">
  <header className="student-welcome"><img src="/assets/le-repere-logo.svg" alt="Le Repère Auto-école"/><span className="eyebrow">TON AUTO-ÉCOLE · ASNIÈRES-SUR-SEINE</span><h1>Bonjour {name.split(' ')[0] || 'à toi'}.</h1><p>Un repère entre deux leçons.</p><p className="student-intro">Revois tes parcours, comprends les situations et prépare ta prochaine séance avec ton enseignant.</p></header>
  <section className="student-shortcuts" aria-label="Commencer"><h2>Qu’est-ce qu’on travaille ?</h2><div>{studentActions.map((action,i)=><button key={action.id} className={`student-action ${i===0?'primary':''}`} onClick={()=>go(action.id)}><span className="student-action-number" aria-hidden="true">0{i+1}</span><span><strong>{action.title}</strong><small>{action.description}</small></span><span aria-hidden="true">↗</span></button>)}</div></section>
  <details className="student-more"><summary>Vidéos, directs et mon espace</summary><div><button onClick={()=>go('videos')}>Vidéos et directs <span>Les contenus de ton enseignant</span></button><button onClick={()=>go('account')}>Mon espace <span>Mon compte et mon auto-école</span></button></div></details>
  <div className="student-help"><p>Les fiches et les replays complètent tes leçons en voiture.</p><button className="text-btn" onClick={guide.restart}>Découvrir les fonctionnalités</button></div>
  {item&&<Dialog title={item.title} onClose={guide.close}><div className="student-tour"><span className="eyebrow">PETITE VISITE · {(guide.step??0)+1} / {studentGuide.length}</span><p>{item.text}</p><div className="student-tour-actions"><button className="text-btn" onClick={guide.close}>Passer la visite</button><div>{(guide.step??0)>0&&<button className="btn secondary" onClick={guide.back}>Précédent</button>}<button className="btn" onClick={guide.next}>{guide.step===studentGuide.length-1?'C’est parti':'Suivant'}</button></div></div></div></Dialog>}
 </div>;
}
