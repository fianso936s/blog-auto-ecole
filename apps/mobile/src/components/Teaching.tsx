import React,{useState} from 'react';
import {Text,View,ScrollView,Pressable,Alert} from 'react-native';
import {useStudentDashboard,useTeacherSchedule} from '../../../../packages/product/src/hooks';
import {studentStatistics,teachingWeek,addDays,parisDay} from '../../../../packages/product/src/teaching';
import {courses} from '../pedagogy/courses';
import {productClient} from '../services/product-client';
import {Button,Chip,Dropdown,Segmented} from './UI';
import {colors,styles as s} from '../theme';
export function StudentDashboard(){
 const model=useStudentDashboard(productClient),stats=studentStatistics(model.detail,courses.length);
 return <View style={{gap:16}}><Text style={s.heading}>Statistiques par élève</Text>{!!model.error&&<Text style={s.error} accessibilityRole="alert">{model.error}</Text>}<Text style={s.body}>{model.students.length} élèves · suivi synchronisé</Text>{model.students.map(student=><Chip key={student.id} label={student.name} active={student.id===model.selected} onPress={()=>model.setSelected(student.id)}/>)}{model.detail&&<View style={s.card}><Text style={s.heading}>{model.detail.student.name}</Text><Text style={s.heading}>Progression théorique · {stats.theoryPercent} %</Text><Text style={s.body}>{stats.read}/{courses.length} fiches lues · {stats.passed}/{courses.length} quiz réussis</Text><Text style={s.body}>{stats.attempts} essais · meilleur score {stats.bestScorePercent===null?'—':stats.bestScorePercent+' %'}</Text><Text style={s.body}>{stats.validated}/{stats.assigned} objectifs validés en leçon</Text><Text style={s.body}>{stats.routes} parcours consultés · {stats.completedRoutes} replays terminés</Text>{courses.map(c=>{const q=model.detail.quizzes.find((q:any)=>q.courseId===c.id),read=model.detail.reading.find((r:any)=>r.courseId===c.id)?.read;return <View key={c.id} style={{paddingVertical:8,borderTopWidth:1,borderColor:colors.line}}><Text style={s.body}>{c.code} · {c.title}</Text><Text style={s.caption}>{read?'Lue':'Non lue'} · {q?`${q.bestScore}/${q.total} · ${q.attempts} essai(s)`:'Quiz non commencé'}</Text></View>;})}{model.detail.routes.map((r:any)=><View key={r.id}><Text style={s.body}>{r.name}</Text><Text style={s.caption}>{Math.round(Math.min(r.fixIndex/Math.max(1,r.fixCount-1),1)*100)} % du replay parcouru</Text></View>)}<Text style={s.caption}>Les replays et quiz ne remplacent pas l’évaluation de conduite.</Text></View>}</View>;
}
export function TeacherSchedule({userId}:{userId:string}){
 const model=useTeacherSchedule(productClient,userId),[day,setDay]=useState(()=>parisDay()),[mode,setMode]=useState<'availability'|'booking'>('availability'),week=teachingWeek(model.week),active=week.find(d=>d.date===day)||week[0];
 const own=model.teacherId===userId,teacherName=model.teachers.find(t=>t.id===model.teacherId)?.name;
 function press(slot:{start:string;end:string;hour:number},saved:any){
  if(mode==='availability'){void model.toggle(slot);return;}
  if(saved?.studentId){Alert.alert('Annuler la leçon ?',`${saved.studentName||'Cet élève'} · ${slot.hour} h – ${slot.hour+1} h. L’enseignant et l’élève seront prévenus.`,[{text:'Garder',style:'cancel'},{text:'Annuler la leçon',style:'destructive',onPress:()=>void model.book(slot,null)}]);return;}
  if(!model.student){model.setNotice('Choisissez d’abord un élève dans la liste.');return;}
  void model.book(slot,model.student);
 }
 return <View style={{gap:14}}><Text style={s.heading}>{own?'Mon planning':`Planning de ${teacherName||'l’enseignant'}`}</Text><Text style={s.body}>{mode==='availability'?'Un appui pour ouvrir ou fermer un créneau':'Choisissez un élève, puis l’heure de la leçon'} · heures de Paris</Text>
 {model.teachers.length>1&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>{model.teachers.map(t=><Chip key={t.id} label={t.id===userId?`${t.name} (moi)`:t.name} active={model.teacherId===t.id} onPress={()=>model.setTeacherId(t.id)}/>)}</ScrollView>}
 <Segmented label="Mode du planning" value={mode} onChange={next=>{setMode(next);model.setNotice('');}} options={[{id:'availability',label:'Disponibilités'},{id:'booking',label:'Réserver un élève'}]}/>
 {mode==='booking'&&<View style={{gap:6}}>
  {model.students.length?<Dropdown label="Élève" value={model.student} onChange={id=>{model.setStudent(id);model.setNotice('');}} options={[{id:'',label:'Choisir un élève inscrit…'},...model.students.map(st=>({id:st.id,label:st.name}))]}/>
   :<Text style={s.caption}>{model.emails===null?'La réservation sera disponible après la mise à jour du serveur.':'Aucun élève inscrit à réserver pour cet enseignant.'}</Text>}
  <Text style={s.caption}>Les heures en vert sont les disponibilités : ce sont les heures recommandées. Une heure fermée peut aussi être réservée. {model.emails?'Un e-mail part automatiquement à l’enseignant et à l’élève.':model.emails===false?'E-mails automatiques non activés sur le serveur.':''}</Text>
 </View>}
 <View style={s.between}><Button compact secondary label="←" onPress={()=>model.setWeek(addDays(model.week,-7))}/><Text style={s.body}>{new Date(model.week+'T12:00Z').toLocaleDateString('fr-FR')}</Text><Button compact secondary label="→" onPress={()=>model.setWeek(addDays(model.week,7))}/></View>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>{week.map(d=>{const count=model.slots.filter(x=>x.studentId&&d.slots.some(y=>y.start===x.start)).length;return <Chip key={d.date} label={new Date(d.date+'T12:00Z').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric'})+(count?` · ${count}`:'')} active={active.date===d.date} onPress={()=>setDay(d.date)}/>;})}</ScrollView>
 {!!model.error&&<Text style={s.error} accessibilityRole="alert">{model.error}</Text>}
 {!!model.notice&&<Text accessibilityLiveRegion="polite" style={[s.body,{backgroundColor:colors.greenSoft,padding:10,borderRadius:12,fontWeight:'600'}]}>{model.notice}</Text>}
 <View style={{flexDirection:'row',flexWrap:'wrap',gap:10}}>{active.slots.map(slot=>{const saved=model.slots.find(x=>x.start===slot.start),open=!!saved?.open,booked=!!saved?.studentId,past=Date.parse(slot.start)<Date.now();
  const state=model.busy===slot.start?'Enregistrement…':past?(booked?`Leçon · ${saved!.studentName||'élève'}`:'Passé'):booked?`Réservé · ${saved!.studentName||'élève'}`:mode==='booking'?(open?'Recommandé · libre':'Fermé · réservable'):open?'Ouvert':'Fermé';
  const disabled=past||model.loading||!!model.busy||(mode==='availability'&&booked);
  return <Pressable key={slot.start} accessibilityRole="button" accessibilityLabel={`${slot.hour} heures à ${slot.hour+1} heures, ${state}`} accessibilityState={{selected:mode==='availability'?open:booked,disabled}} disabled={disabled} onPress={()=>press(slot,saved)} style={{width:'47%',minHeight:76,padding:14,borderWidth:mode==='booking'&&open&&!booked?2:1,borderColor:booked?colors.wine:open?colors.green:colors.line,backgroundColor:booked?colors.wine:open?colors.greenSoft:colors.paper,borderRadius:12,opacity:past ? 0.4 : 1,gap:5}}><Text style={[s.body,{fontWeight:'600',color:booked?colors.paper:colors.ink}]}>{slot.hour}:00 – {slot.hour+1}:00</Text><Text numberOfLines={2} style={[s.caption,{color:booked?colors.paper:open?colors.green:colors.muted}]}>{state}</Text></Pressable>;})}</View>
 <Text style={s.caption}>{mode==='availability'?'Vert : disponible. Gris : fermé. Bordeaux : leçon réservée (annulez-la depuis « Réserver un élève »).':'Appuyez sur une leçon réservée pour l’annuler.'}</Text></View>;
}
