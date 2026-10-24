import React,{useState} from 'react';
import {courses} from './shared/courses';
import {productClient} from './shared/product-client';
import {useStudentDashboard,useTeacherSchedule} from '../packages/product/src/hooks';
import {studentStatistics,teachingWeek,addDays,parisDay} from '../packages/product/src/teaching';
const number=(value:number)=>new Intl.NumberFormat('fr-FR').format(value);
export function StudentDashboard(){
 const {students,selected,setSelected,detail,error,refresh}=useStudentDashboard(productClient);
 const stats=studentStatistics(detail,courses.length);
 return <section className="student-dashboard" aria-label="Statistiques par élève"><div className="section-heading"><div><h2>Mes élèves</h2><p>{students.length} élèves · suivi synchronisé</p></div><button className="btn secondary" onClick={()=>void refresh()}>Actualiser</button></div>{error&&<p className="error" role="alert">{error}</p>}
 <div className="teaching-metrics"><div><strong>{number(students.reduce((n,s)=>n+Number(s.reading.read||0),0))}</strong><span>Fiches lues</span></div><div><strong>{number(students.reduce((n,s)=>n+Number(s.quizzes.passed||0),0))}</strong><span>Quiz réussis</span></div><div><strong>{number(students.reduce((n,s)=>n+Number(s.plan.validated||0),0))}</strong><span>Objectifs validés en leçon</span></div></div>
 {!students.length?<p>Aucun élève dans votre groupe.</p>:<><label className="course-field">Élève<select value={selected} onChange={e=>setSelected(e.target.value)}>{students.map(s=><option value={s.id} key={s.id}>{s.name} · {s.email}</option>)}</select></label>{!detail?<p role="status">Chargement de la progression…</p>:<>
 <div className="student-progress"><div><h3>{detail.student.name}</h3><p>Progression théorique</p></div><strong>{stats.theoryPercent} %</strong><progress value={stats.theoryPercent} max={100} aria-label="Progression théorique de l’élève"/></div>
 <div className="teaching-metrics"><div><strong>{stats.read} / {courses.length}</strong><span>Fiches lues</span></div><div><strong>{stats.passed} / {courses.length}</strong><span>Quiz réussis · {stats.attempts} essais</span></div><div><strong>{stats.bestScorePercent===null?'—':stats.bestScorePercent+' %'}</strong><span>Score sur les meilleurs essais</span></div><div><strong>{stats.validated} / {stats.assigned}</strong><span>Objectifs validés en leçon</span></div><div><strong>{stats.routes}</strong><span>Parcours consultés · {stats.completedRoutes} replays terminés</span></div></div>
 <p className="caption">{stats.lastActivity?'Dernière activité enregistrée : '+new Date(stats.lastActivity).toLocaleString('fr-FR'):'Aucune activité enregistrée.'} Les replays et quiz ne remplacent pas l’évaluation de conduite.</p>
 <details open className="student-detail"><summary>Cours et quiz</summary><div className="student-lessons">{courses.map(c=>{const read=detail.reading.find((r:any)=>r.courseId===c.id),quiz=detail.quizzes.find((q:any)=>q.courseId===c.id),plan=detail.plan.find((p:any)=>p.courseId===c.id&&p.active);return <article key={c.id}><strong>{c.code} · {c.title}</strong><span>{read?.read?'Lue':'Non lue'} · {quiz?`${quiz.bestScore}/${quiz.total} · ${quiz.attempts} essai(s)`:'Quiz non commencé'}</span>{plan&&<small>{plan.level==='validated'?'Validé par l’enseignant':'À travailler'}{plan.note?' · '+plan.note:''}</small>}</article>;})}</div></details>
 <details className="student-detail"><summary>Parcours et progression</summary>{detail.routes.length?detail.routes.map((r:any)=>{const percent=Math.round(Math.min(r.fixIndex/Math.max(1,r.fixCount-1),1)*100);return <article className="study-route" key={r.id}><strong>{r.name}</strong><span>{r.examCenter||'Centre non précisé'} · {percent} %</span><progress value={percent} max={100} aria-label={'Progression sur '+r.name}/></article>;}):<p>Aucun replay commencé.</p>}</details>
 </>}</>}
 </section>;
}
export function TeacherSchedule({userId}:{userId:string}){
 const schedule=useTeacherSchedule(productClient,userId),[day,setDay]=useState(()=>parisDay()),[mode,setMode]=useState<'availability'|'booking'>('availability');
 const week=teachingWeek(schedule.week),active=week.find(d=>d.date===day)||week[0];
 const teacherName=schedule.teachers.find(t=>t.id===schedule.teacherId)?.name;
 const own=schedule.teacherId===userId;
 function press(slot:{start:string;end:string;hour:number},saved:any){
  if(mode==='availability'){void schedule.toggle(slot);return;}
  if(saved?.studentId){if(window.confirm(`Annuler la leçon de ${saved.studentName||'cet élève'} (${slot.hour} h – ${slot.hour+1} h) ? L’enseignant et l’élève seront prévenus.`))void schedule.book(slot,null);return;}
  if(!schedule.student){schedule.setNotice('Choisissez d’abord un élève dans la liste.');return;}
  void schedule.book(slot,schedule.student);
 }
 return <section className="teacher-schedule" aria-label="Planning enseignant"><div className="section-heading"><div><h2>{own?'Mon planning':`Planning de ${teacherName||'l’enseignant'}`}</h2><p>{mode==='availability'?'Un appui pour ouvrir ou fermer un créneau':'Choisissez un élève, puis l’heure de la leçon'} · heures de Paris</p></div></div>
 {schedule.teachers.length>1&&<label className="course-field">Enseignant<select value={schedule.teacherId} onChange={e=>schedule.setTeacherId(e.target.value)}>{schedule.teachers.map(t=><option value={t.id} key={t.id}>{t.name}{t.id===userId?' (moi)':''}</option>)}</select></label>}
 <div className="schedule-mode" role="group" aria-label="Mode du planning"><button aria-pressed={mode==='availability'} onClick={()=>{setMode('availability');schedule.setNotice('');}}>Disponibilités</button><button aria-pressed={mode==='booking'} onClick={()=>{setMode('booking');schedule.setNotice('');}}>Réserver un élève</button></div>
 {mode==='booking'&&<div className="schedule-booking">
  {schedule.students.length?<label className="course-field">Élève<select value={schedule.student} onChange={e=>{schedule.setStudent(e.target.value);schedule.setNotice('');}}><option value="">Choisir un élève inscrit…</option>{schedule.students.map(s=><option value={s.id} key={s.id}>{s.name}{s.email?' · '+s.email:''}</option>)}</select></label>
   :<p className="caption">{schedule.emails===null?'La réservation sera disponible après la mise à jour du serveur.':'Aucun élève inscrit à réserver pour cet enseignant.'}</p>}
  <p className="caption">Les heures en vert sont les disponibilités : ce sont les heures recommandées. Une heure fermée peut aussi être réservée, elle s’ouvre alors. {schedule.emails?'Un e-mail part automatiquement à l’enseignant et à l’élève.':schedule.emails===false?'E-mails automatiques non activés sur le serveur.':''}</p>
 </div>}
 <div className="schedule-week"><button className="btn secondary" aria-label="Semaine précédente" onClick={()=>schedule.setWeek(addDays(schedule.week,-7))}>←</button><strong>{new Date(schedule.week+'T12:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} – {new Date(addDays(schedule.week,6)+'T12:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}</strong><button className="btn secondary" aria-label="Semaine suivante" onClick={()=>schedule.setWeek(addDays(schedule.week,7))}>→</button></div>
 <div className="schedule-days" role="group" aria-label="Jour du planning">{week.map(d=>{const count=schedule.slots.filter(s=>s.studentId&&d.slots.some(x=>x.start===s.start)).length;return <button key={d.date} aria-pressed={active.date===d.date} onClick={()=>setDay(d.date)}>{new Date(d.date+'T12:00Z').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'})}{count?<small className="day-count" aria-label={`${count} leçon(s)`}>{count}</small>:null}</button>;})}</div>
 {schedule.error&&<p className="error" role="alert">{schedule.error}</p>}{schedule.notice&&<p className="schedule-notice" role="status">{schedule.notice}</p>}{schedule.loading&&<p role="status">Chargement du planning…</p>}
 <div className="schedule-slots">{active.slots.map(slot=>{const saved=schedule.slots.find(s=>s.start===slot.start),open=!!saved?.open,booked=!!saved?.studentId,past=Date.parse(slot.start)<Date.now();
  const state=schedule.busy===slot.start?'Enregistrement…':past?(booked?`Leçon · ${saved!.studentName||'élève'}`:'Passé'):booked?`Réservé · ${saved!.studentName||'élève'}`:mode==='booking'?(open?'Recommandé · libre':'Fermé · réservable'):open?'Ouvert':'Fermé';
  const label=`${slot.hour} h à ${slot.hour+1} h, ${state}${mode==='availability'?(booked?'':open?', fermer':', ouvrir'):booked?', annuler la réservation':', réserver'}`;
  return <button key={slot.start} className="schedule-slot" data-open={open} data-booked={booked} data-recommended={mode==='booking'&&open&&!booked} aria-pressed={mode==='availability'?open:booked} aria-label={label} disabled={schedule.loading||!!schedule.busy||past||(mode==='availability'&&booked)} onClick={()=>press(slot,saved)}><strong>{slot.hour}:00 – {slot.hour+1}:00</strong><span>{state}</span></button>;})}</div>
 <p className="caption">{mode==='availability'?'Vert : disponible. Gris : fermé. Bordeaux : leçon réservée (annulez-la depuis « Réserver un élève »).':'Appuyez sur une leçon réservée pour l’annuler.'}</p></section>;
}
