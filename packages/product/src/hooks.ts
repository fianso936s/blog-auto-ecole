import {useActivePolling,networkPolicy} from "./network";
import {monday,schoolTime,addDays,type TeacherSlot} from "./teaching";
import {useCallback,useEffect,useRef,useState} from 'react';
import {courses} from './courses';
import type {Learning,Plan,ProductClient,Quiz,QuizResult,QuizStat,Reading} from './contracts';
export type ReadingStorage={load:(user:string)=>Promise<Reading>;save:(user:string,reading:Reading)=>Promise<void>;subscribe:(refresh:()=>void)=>()=>void};
/** Same server-first learning state on both platforms, with device-only storage behind an adapter. */
export function useProductLearning(userId:string|null,client:ProductClient,storage:ReadingStorage){
 const [reading,setReading]=useState<Reading>({}),[quizzes,setQuizzes]=useState<QuizStat[]>([]),[plan,setPlan]=useState<Plan[]>([]),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const generation=useRef(0),saving=useRef(false),marks=useRef(reading);marks.current=reading;
 const refresh=useCallback(async()=>{
  const current=++generation.current;setError('');let local:Reading={};
  try{local=await storage.load(userId||'guest');}catch{}
  if(current!==generation.current)return;
  if(!userId){setReading(local);setLoading(false);return;}
  try {
   let data:Learning=await client.learning();
   const existing=new Set(data.reading.map(r=>r.courseId));
   for(const c of courses){if(current!==generation.current)return;if(!existing.has(c.id)&&(local[c.id]?.read||local[c.id]?.review))await client.read(c.id,{read:!!local[c.id].read,review:!!local[c.id].review});}
   if(courses.some(c=>!existing.has(c.id)&&(local[c.id]?.read||local[c.id]?.review)))data=await client.learning();
   if(current!==generation.current)return;
   const value=Object.fromEntries(data.reading.map(({courseId,read,review})=>[courseId,{read,review}]));
   setReading(value);setQuizzes(data.quizzes);setPlan(data.plan);await storage.save(userId,value).catch(()=>{});
  }catch(e){if(current===generation.current){setError((e as Error).message);setReading(local);}}
  finally{if(current===generation.current)setLoading(false);}
 },[userId,client,storage]);
 useEffect(()=>{setReading({});setQuizzes([]);setPlan([]);setLoading(true);void refresh();const unsubscribe=storage.subscribe(()=>void refresh());return()=>{generation.current++;unsubscribe();};},[refresh,storage]);
 async function update(id:string,patch:{read?:boolean;review?:boolean}){
  if(saving.current)return;saving.current=true;const current=generation.current;setBusy(true);setError('');
  try{if(userId)await client.read(id,patch);if(current!==generation.current)return;const value={...marks.current,[id]:{...marks.current[id],...patch}};marks.current=value;setReading(value);await storage.save(userId||'guest',value).catch(()=>{});}
  catch(e){if(current===generation.current)setError((e as Error).message);}finally{saving.current=false;setBusy(false);}
 }
 return {reading,quizzes,plan,busy,loading,error,refresh,update};
}
/** Questions and scoring stay on the server; a retry keeps its idempotency key on every platform. */
export function useProductQuiz(id:string,client:ProductClient,newId:()=>string,onChanged:()=>void){
 const [quiz,setQuiz]=useState<Quiz|null>(null),[answers,setAnswers]=useState<Record<string,number>>({}),[result,setResult]=useState<QuizResult|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const attempt=useRef(''),active=useRef(true),working=useRef(false);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 async function start(){if(working.current)return;working.current=true;setBusy(true);setError('');try{const q=await client.quiz(id);if(!active.current)return;attempt.current=newId();setQuiz(q);setAnswers({});setResult(null);}catch(e){if(active.current)setError((e as Error).message);}finally{working.current=false;if(active.current)setBusy(false);}}
 async function submit(){if(!quiz||working.current||result||quiz.questions.some(q=>answers[q.id]===undefined))return;working.current=true;setBusy(true);setError('');try{const response=await client.answer(id,{revision:quiz.revision,attemptId:attempt.current,answers});if(active.current){setResult(response);onChanged();}}catch(e){if(active.current)setError((e as Error).message);}finally{working.current=false;if(active.current)setBusy(false);}}
 return {quiz,answers,result,error,busy,start,submit,choose:(question:string,value:number)=>setAnswers(a=>({...a,[question]:value})),answered:quiz?.questions.filter(q=>answers[q.id]!==undefined).length||0};
}

export function useStudentDashboard(client:ProductClient){
 const [students,setStudents]=useState<any[]>([]),[selected,setSelected]=useState(''),[detail,setDetail]=useState<any>(null),[error,setError]=useState('');
 const generation=useRef(0);
 const refresh=useCallback(async()=>{try{const result=await client.students();setStudents(result.students);setSelected(id=>result.students.some(s=>s.id===id)?id:result.students[0]?.id||'');}catch(e){setError((e as Error).message);}},[client]);
 useEffect(()=>{void refresh();},[refresh]);
 const loadDetail=useCallback(async()=>{if(!selected)return;const current=++generation.current;try{const result=await client.student(selected);if(current===generation.current){setDetail(result);setError('');}}catch(e){if(current===generation.current)setError((e as Error).message);}},[selected,client]);
 useEffect(()=>{setDetail(null);void loadDetail();return()=>{generation.current++;};},[loadDetail]);
 useActivePolling(loadDetail,networkPolicy.statisticsMs);
 return {students,selected,setSelected,detail,error,refresh};
}
export function useTeacherSchedule(client:ProductClient,userId:string){
 const [teachers,setTeachers]=useState<{id:string;name:string}[]>([]),[teacherId,setTeacherId]=useState(userId),[week,setWeek]=useState(()=>monday()),[slots,setSlots]=useState<TeacherSlot[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(''),[error,setError]=useState('');
 const scope=useRef(''),working=useRef(false);scope.current=teacherId+week;
 useEffect(()=>{let alive=true;void client.teachers().then(r=>{if(alive){setTeachers(r.teachers);if(!r.teachers.some(t=>t.id===userId))setTeacherId(r.teachers[0]?.id||userId);}}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};},[client,userId]);
 const refresh=useCallback(async()=>{const key=teacherId+week;try{const result=await client.slots(teacherId,schoolTime(week,0),schoolTime(addDays(week,7),0));if(scope.current===key)setSlots(result.slots);}catch(e){if(scope.current===key)setError((e as Error).message);}finally{if(scope.current===key)setLoading(false);}},[client,teacherId,week]);
 useEffect(()=>{setSlots([]);setLoading(true);setError('');void refresh();},[refresh]);
 useActivePolling(refresh,networkPolicy.scheduleMs);
 async function toggle(slot:{start:string;end:string}){
  if(working.current||loading)return;working.current=true;setBusy(slot.start);setError('');const key=scope.current,previous=slots.find(s=>s.start===slot.start),open=!previous?.open;
  setSlots(values=>[...values.filter(s=>s.start!==slot.start),{id:previous?.id||slot.start,teacherId,start:slot.start,end:slot.end,open,version:previous?.version||0}]);
  try{const result=await client.slot({teacherId,start:slot.start,end:slot.end,open,expectedVersion:previous?.version||0});if(scope.current===key)setSlots(values=>[...values.filter(s=>s.start!==slot.start),result.slot]);}
  catch(e){if(scope.current===key){await refresh();setError((e as Error).message);}}
  finally{working.current=false;setBusy('');}
 }
 // Booking: pick a registered student, then the hour; open hours are the recommended ones.
 const [students,setStudents]=useState<import('./teaching').BookableStudent[]>([]),[student,setStudent]=useState(''),[emails,setEmails]=useState<boolean|null>(null),[notice,setNotice]=useState('');
 useEffect(()=>{let alive=true;setStudents([]);void client.bookableStudents(teacherId).then(r=>{if(!alive)return;setStudents(r.students);setEmails(r.emails);setStudent(id=>r.students.some(s=>s.id===id)?id:'');}).catch(()=>{if(alive){setStudents([]);setEmails(null);}});return()=>{alive=false;};},[client,teacherId]);
 async function book(slot:{start:string;end:string},studentId:string|null){
  if(working.current||loading)return false;working.current=true;setBusy(slot.start);setError('');setNotice('');const key=scope.current,previous=slots.find(s=>s.start===slot.start);
  try{const result=await client.book({teacherId,start:slot.start,end:slot.end,studentId,expectedVersion:previous?.version||0});
   if(scope.current===key)setSlots(values=>[...values.filter(s=>s.start!==slot.start),result.slot]);
   const who=studentId?students.find(s=>s.id===studentId)?.name||'L’élève':'';const sent=[result.emails.teacher&&'l’enseignant',result.emails.student&&'l’élève'].filter(Boolean);
   setNotice((studentId?`${who} est réservé(e).`:'Réservation annulée.')+(sent.length?` E-mail envoyé à ${sent.join(' et ')}.`:result.emails.teacher===null&&result.emails.student===null?' (E-mails automatiques non activés.)':' L’e-mail n’a pas pu partir.'));
   return true;}
  catch(e){if(scope.current===key){await refresh();setError((e as Error).message);}return false;}
  finally{working.current=false;setBusy('');}
 }
 return {teachers,teacherId,setTeacherId,week,setWeek,slots,loading,busy,error,toggle,refresh,students,student,setStudent,emails,book,notice,setNotice};
}
