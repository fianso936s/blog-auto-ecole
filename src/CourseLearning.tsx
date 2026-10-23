import React, {useCallback,useEffect,useRef,useState} from "react";
import {api} from "./shared/api";
import {courses,type Course} from "./shared/courses";
import type {Profile} from "./shared/core";
export type Reading=Record<string,{read?:boolean;review?:boolean}>;
type QuizStat={courseId:string;bestScore:number;total:number;attempts:number};
type Plan={courseId:string;active:boolean;level:string;note:string};
type Learning={reading:({courseId:string;read:boolean;review:boolean})[];quizzes:QuizStat[];plan:Plan[]};

export function useCourseProgress(profile:Profile|null) {
 const key=`repere.reading.web.${profile?.id||"guest"}`;
 const [reading,setReading]=useState<Reading>({}),[quizzes,setQuizzes]=useState<QuizStat[]>([]),[plan,setPlan]=useState<Plan[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const generation=useRef(0);
 const refresh=useCallback(async()=>{
  const current=++generation.current;setError("");
  let local:Reading={};try{local=JSON.parse(localStorage.getItem(key)||"{}");}catch{}
  if(!profile){setReading(local);setQuizzes([]);setPlan([]);return;}
  try {
   let data=await api<Learning>("/v1/courses/me");
   // Import older browser-only marks only when the server has no entry for that lesson.
   const existing=new Set(data.reading.map(r=>r.courseId));
   const missing=courses.filter(c=>!existing.has(c.id)&&(local[c.id]?.read||local[c.id]?.review));
   if(missing.length){
    for(const c of missing){if(current!==generation.current)return;await api(`/v1/courses/${c.id}/progress`,"PUT",{read:!!local[c.id].read,review:!!local[c.id].review});}
    if(current!==generation.current)return;
    data=await api<Learning>("/v1/courses/me");
   }
   if(current!==generation.current)return;
   const value=Object.fromEntries(data.reading.map(({courseId,read,review})=>[courseId,{read,review}]));
   setReading(value);setQuizzes(data.quizzes);setPlan(data.plan);
   try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  }catch(e){if(current===generation.current){setError((e as Error).message);setReading(local);}}
 },[profile?.id,key]);
 useEffect(()=>{
  setReading({});setQuizzes([]);setPlan([]);void refresh();
  const resume=()=>{if(document.visibilityState==="visible")void refresh();};
  window.addEventListener("online",resume);document.addEventListener("visibilitychange",resume);
  return()=>{generation.current++;window.removeEventListener("online",resume);document.removeEventListener("visibilitychange",resume);};
 },[refresh]);
 async function update(id:string,patch:{read?:boolean;review?:boolean}) {
  if(busy)return;const current=generation.current;setBusy(true);setError("");
  try {
   if(profile)await api(`/v1/courses/${id}/progress`,"PUT",patch);
   if(current!==generation.current)return;
   const value={...reading,[id]:{...reading[id],...patch}};
   setReading(value);try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 return {reading,quizzes,plan,busy,error,refresh,update};
}

export function StudyOverview({reading,quizzes,plan,choose}: {reading:Reading;quizzes:QuizStat[];plan:Plan[];choose:(id:string)=>void}) {
 const assigned=plan.filter(p=>p.active),path=assigned.length?courses.filter(c=>assigned.some(p=>p.courseId===c.id)):courses;
 const read=path.filter(c=>reading[c.id]?.read).length,passed=path.filter(c=>quizzes.some(q=>q.courseId===c.id&&q.bestScore===q.total)).length;
 const percent=Math.round((read+passed)/(path.length*2)*100);
 return <section className="study-overview" aria-label="Mon parcours pédagogique">
  <div className="spread"><strong>Mon parcours pédagogique</strong><span>{percent} %</span></div>
  <progress value={read+passed} max={path.length*2} aria-label="Avancement théorique" />
  <p>{read} / {path.length} fiches lues · {passed} / {path.length} quiz réussis</p>
  <details><summary>{assigned.length?"Mes objectifs donnés par l’enseignant":"Voir les étapes de mon parcours"}</summary>
   <div className="study-path">{path.map(c=>{const quiz=quizzes.find(q=>q.courseId===c.id),assignment=plan.find(p=>p.courseId===c.id&&p.active);return <button key={c.id} onClick={()=>choose(c.id)}><span>{c.code} · {c.title}</span><small>{assignment?.level==="validated"?"Validé par l’enseignant":quiz?.bestScore===quiz?.total&&quiz?"Quiz réussi":reading[c.id]?.read?"À vérifier par le quiz":"À travailler"}</small>{assignment?.note&&<small>{assignment.note}</small>}</button>;})}</div>
  </details>
  <small>Les quiz vérifient la compréhension. La maîtrise de la conduite se valide en leçon.</small>
 </section>;
}

type Quiz={revision:string;questions:{id:string;question:string;options:string[]}[]};
export function LessonQuiz({course,profile,onChanged,onLogin}:{course:Course;profile:Profile|null;onChanged:()=>void;onLogin:()=>void}) {
 const [quiz,setQuiz]=useState<Quiz|null>(null),[answers,setAnswers]=useState<Record<string,number>>({}),[result,setResult]=useState<any>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const attempt=useRef("");
 async function start(){setBusy(true);setError("");try{const q=await api<Quiz>(`/v1/courses/${course.id}/quiz`);attempt.current=crypto.randomUUID();setQuiz(q);setAnswers({});setResult(null);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function submit(e:React.FormEvent){e.preventDefault();if(!quiz)return;setBusy(true);setError("");try{setResult(await api(`/v1/courses/${course.id}/quiz`,"POST",{revision:quiz.revision,attemptId:attempt.current,answers}));onChanged();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="lesson-quiz" aria-label="Quiz de compréhension">
  <h3>As-tu compris cette fiche ?</h3><p>Deux questions sur « {course.title} », avec une explication après tes réponses.</p>
  {error&&<p className="error" role="alert">{error}</p>}
  {!profile?<button className="btn secondary" onClick={onLogin}>Me connecter pour faire le quiz</button>:!quiz?<button className="btn" disabled={busy} onClick={start}>{busy?"Chargement…":"Faire le quiz"}</button>:<form onSubmit={submit}>
   {quiz.questions.map((q,index)=>{const correction=result?.corrections.find((c:any)=>c.id===q.id);return <fieldset key={q.id} disabled={busy||!!result}><legend>{index+1}. {q.question}</legend>{q.options.map((option,i)=><label className="quiz-choice" key={i}><input type="radio" name={q.id} checked={answers[q.id]===i} onChange={()=>setAnswers(a=>({...a,[q.id]:i}))}/><span>{option}</span></label>)}{correction&&<div className={correction.correct?"quiz-correction correct":"quiz-correction"}><strong>{correction.correct?"Bonne réponse":"À reprendre"}</strong><p>{correction.explanation}</p><p>Réponse attendue : {q.options[correction.answer]}</p></div>}</fieldset>;})}
   {result?<div className="quiz-result" role="status"><strong>{result.score} / {result.total} · {result.passed?"Quiz réussi":"Relis la fiche puis réessaie"}</strong><p>Ton résultat est enregistré dans ton espace et visible par ton enseignant.</p><button className="btn secondary" type="button" onClick={start} disabled={busy}>Recommencer</button></div>:<button className="btn" type="submit" disabled={busy||quiz.questions.some(q=>answers[q.id]===undefined)}>{busy?"Enregistrement…":"Vérifier mes réponses"}</button>}
  </form>}
 </section>;
}

export function TeacherLessons() {
 const [students,setStudents]=useState<any[]>([]),[studentId,setStudentId]=useState(""),[detail,setDetail]=useState<any>(null),[courseId,setCourseId]=useState(courses[0].id),[error,setError]=useState(""),[busy,setBusy]=useState(false),[level,setLevel]=useState("working"),[note,setNote]=useState(""),[active,setActive]=useState(false);
 const version=useRef(0);
 const load=useCallback(async()=>{try{setError("");const data=await api("/v1/courses/students");setStudents(data.students);setStudentId(id=>id||data.students[0]?.id||"");}catch(e){setError((e as Error).message);}},[]);
 useEffect(()=>{void load();},[load]);
 const loadStudent=useCallback(async()=>{if(!studentId){setDetail(null);return;}const n=++version.current;setDetail(null);try{const data=await api(`/v1/courses/students/${encodeURIComponent(studentId)}`);if(n===version.current)setDetail(data);}catch(e){if(n===version.current)setError((e as Error).message);}},[studentId]);
 useEffect(()=>{void loadStudent();return()=>{version.current++;};},[loadStudent]);
 useEffect(()=>{const p=detail?.plan.find((p:Plan)=>p.courseId===courseId);setLevel(p?.level||"working");setNote(p?.note||"");setActive(!!p?.active);},[detail,courseId]);
 const lesson=courses.find(c=>c.id===courseId)!,quiz=detail?.quizzes.find((q:QuizStat)=>q.courseId===courseId),read=detail?.reading.find((r:any)=>r.courseId===courseId)?.read;
 async function save(e:React.FormEvent){e.preventDefault();if(!studentId)return;setBusy(true);setError("");try{await api(`/v1/courses/students/${encodeURIComponent(studentId)}/plan/${courseId}`,"PUT",{active,level,note});await Promise.all([loadStudent(),load()]);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <section className="teacher-learning" aria-label="Suivi pédagogique des élèves">
  <div className="spread"><h2>Mes élèves</h2><button className="text-btn" onClick={()=>{void load();void loadStudent();}}>Actualiser</button></div>
  {error&&<p className="error" role="alert">{error}</p>}
  {!students.length?<p>Aucun élève rattaché pour le moment. Les invitations et les comptes se gèrent dans Mon espace.</p>:<>
   <label className="course-field">Élève<select value={studentId} onChange={e=>{setError("");setStudentId(e.target.value);}}>{students.map(s=><option key={s.id} value={s.id}>{s.name} · {s.reading.read} fiches lues · {s.quizzes.passed} quiz réussis</option>)}</select></label>
   {!detail?<p role="status">Chargement de la progression…</p>:<>
    <div className="course-metrics"><span><strong>{detail.reading.filter((r:any)=>r.read).length} / {courses.length}</strong> fiches lues</span><span><strong>{detail.quizzes.filter((q:QuizStat)=>q.bestScore===q.total).length} / {courses.length}</strong> quiz réussis</span></div>
    <form className="course-plan-form" onSubmit={save}>
     <label className="course-field">Objectif à suivre<select value={courseId} onChange={e=>setCourseId(e.target.value)}>{courses.map(c=><option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}</select></label>
     <p>{read?"Fiche lue":"Fiche non lue"} · {quiz?`Meilleur score : ${quiz.bestScore}/${quiz.total} · ${quiz.attempts} essai(s)`:"Quiz non commencé"}</p>
     <label className="checkline"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>Ajouter cet objectif au parcours de l’élève</label>
     <label className="course-field">Évaluation en leçon<select value={level} onChange={e=>{setLevel(e.target.value);setActive(true);}}><option value="working">À travailler</option><option value="validated">Validé par l’enseignant</option></select></label>
     <label className="course-field">Consigne pour l’élève<textarea rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder={`Conseil pour : ${lesson.title}`}/></label>
     <button className="btn" disabled={busy}>{busy?"Enregistrement…":"Enregistrer le suivi"}</button>
    </form>
    <details className="course-routes"><summary>Parcours sur la carte · {detail.routes.length}</summary>{detail.routes.length?detail.routes.map((r:any)=><div className="study-route" key={r.id}><strong>{r.name}</strong><span>{r.examCenter||"Centre non précisé"}</span><progress value={Math.min(r.fixIndex,Math.max(1,r.fixCount-1))} max={Math.max(1,r.fixCount-1)} aria-label={`Progression sur ${r.name}`}/><small>{Math.round(Math.min(r.fixIndex/Math.max(1,r.fixCount-1),1)*100)} % du replay parcouru</small></div>):<p>Aucune progression de replay enregistrée pour cet élève.</p>}</details>
   </>}
  </>}
 </section>;
}
