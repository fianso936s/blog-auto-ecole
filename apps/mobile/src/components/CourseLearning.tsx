import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Pressable,Text,View,TextInput,Switch} from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import {courses,type Course} from '../pedagogy/courses';
import {useProductQuiz} from '../../../../packages/product/src/hooks';
import {studyProgress,type Reading,type Plan,type QuizStat} from '../../../../packages/product/src/contracts';
import {productClient} from '../services/product-client';
import {Button,Disclosure,Dropdown} from './UI';
import {colors,fonts,radius,styles as s} from '../theme';

/** Thin progress bar, same look as the website's <progress>. */
export function ProgressBar({value,max,label}:{value:number;max:number;label:string}){
 const pct=Math.max(0,Math.min(1,max?value/max:0));
 return <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{min:0,max:100,now:Math.round(pct*100)}} style={{height:8,borderRadius:4,backgroundColor:colors.soft,overflow:'hidden'}}><View style={{height:8,borderRadius:4,width:`${pct*100}%`,backgroundColor:colors.wine}}/></View>;
}

/** Mirrors the website's StudyOverview. */
export function StudyOverview({reading,quizzes,plan,choose}:{reading:Reading;quizzes:QuizStat[];plan:Plan[];choose:(id:string)=>void}){
 const {path:ids,read,passed,percent}=studyProgress(courses.map(c=>c.id),reading,quizzes,plan);
 const assigned=plan.filter(p=>p.active),path=courses.filter(c=>ids.includes(c.id));
 return <View style={{gap:10}} accessibilityLabel="Mon parcours pédagogique">
  <View style={s.between}><Text style={{fontFamily:fonts.bodySemi,fontSize:15,color:colors.ink}}>Mon parcours pédagogique</Text><Text style={s.muted}>{percent} %</Text></View>
  <ProgressBar value={read+passed} max={path.length*2} label="Avancement théorique"/>
  <Text style={s.muted}>{read} / {path.length} fiches lues · {passed} / {path.length} quiz réussis</Text>
  <Disclosure card={false} title={assigned.length?'Mes objectifs donnés par l’enseignant':'Voir les étapes de mon parcours'} tone={colors.wine}>
   {path.map(c=>{const quiz=quizzes.find(q=>q.courseId===c.id),assignment=plan.find(p=>p.courseId===c.id&&p.active);return <Pressable key={c.id} accessibilityRole="button" onPress={()=>choose(c.id)} style={({pressed})=>({minHeight:56,padding:14,borderRadius:radius.md,borderWidth:1,borderColor:colors.line,backgroundColor:colors.paper,gap:4,transform:[{scale:pressed?0.98:1}]})}>
    <Text style={{fontFamily:fonts.bodySemi,fontSize:15,color:colors.ink}}>{c.code} · {c.title}</Text>
    <Text style={s.caption}>{assignment?.level==='validated'?'Validé par l’enseignant':quiz&&quiz.bestScore===quiz.total?'Quiz réussi':reading[c.id]?.read?'À vérifier par le quiz':'À travailler'}</Text>
    {!!assignment?.note&&<Text style={s.caption}>{assignment.note}</Text>}
   </Pressable>;})}
  </Disclosure>
  <Text style={s.caption}>Les quiz vérifient la compréhension. La maîtrise de la conduite se valide en leçon.</Text>
 </View>;
}

/** Mirrors the website's LessonQuiz. */
export function LessonQuiz({course,onChanged,signedIn=true,onLogin}:{course:Course;onChanged:()=>void;signedIn?:boolean;onLogin?:()=>void}){
 const {quiz,answers,result,error,busy,start,submit,choose,answered}=useProductQuiz(course.id,productClient,()=>Crypto.randomUUID(),onChanged);
 useEffect(()=>{if(result)void Haptics.notificationAsync(result.passed?Haptics.NotificationFeedbackType.Success:Haptics.NotificationFeedbackType.Warning);},[result]);
 return <View style={{backgroundColor:colors.cream,borderRadius:radius.lg,padding:20,gap:12}} accessibilityLabel="Quiz de compréhension">
  <Text style={[s.heading,{fontSize:22}]}>As-tu compris cette fiche ?</Text>
  <Text style={s.muted}>Deux questions sur « {course.title} », avec une explication après tes réponses.</Text>
  {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}
  {!signedIn?<Button secondary label="Me connecter pour faire le quiz" onPress={()=>onLogin?.()}/>:!quiz?<Button label={busy?'Chargement…':'Faire le quiz'} onPress={()=>void start()} busy={busy}/>:<>
   {quiz.questions.map((q,index)=>{const correction=result?.corrections.find(c=>c.id===q.id);return <View key={q.id} style={{gap:8,marginVertical:6}}>
    <Text style={{fontFamily:fonts.displayBold,fontSize:17,lineHeight:24,color:colors.ink}}>{index+1}. {q.question}</Text>
    {q.options.map((option,i)=>{const on=answers[q.id]===i;return <Pressable key={i} accessibilityRole="radio" accessibilityLabel={option} accessibilityState={{checked:on,disabled:busy||!!result}} disabled={busy||!!result} onPress={()=>{void Haptics.selectionAsync();choose(q.id,i);}} style={({pressed})=>({minHeight:56,padding:16,borderWidth:1.5,borderColor:on?colors.wine:colors.line,borderRadius:radius.md,backgroundColor:on?colors.soft:colors.paper,flexDirection:'row',gap:12,alignItems:'flex-start',transform:[{scale:pressed?0.99:1}]})}>
     <View style={{width:20,height:20,borderRadius:10,borderWidth:2,borderColor:on?colors.wine:colors.muted,alignItems:'center',justifyContent:'center',marginTop:2}}>{on&&<View style={{width:10,height:10,borderRadius:5,backgroundColor:colors.wine}}/>}</View>
     <Text style={[s.body,{flex:1,flexShrink:1}]}>{option}</Text>
    </Pressable>;})}
    {correction&&<View style={{padding:16,borderRadius:radius.md,backgroundColor:correction.correct?colors.greenSoft:colors.redSoft,gap:6}}>
     <Text style={{fontFamily:fonts.bodySemi,fontSize:15,color:colors.ink}}>{correction.correct?'Bonne réponse':'À reprendre'}</Text>
     <Text style={s.body}>{correction.explanation}</Text>
     <Text style={s.body}>Réponse attendue : {q.options[correction.answer]}</Text>
    </View>}
   </View>;})}
   {result?<View accessibilityRole="summary" style={{gap:10,padding:result.passed?18:0,borderRadius:radius.lg,backgroundColor:result.passed?colors.greenSoft:'transparent'}}>
    <Text style={{fontFamily:fonts.display,fontSize:17,color:result.passed?colors.green:colors.ink}}>{result.score} / {result.total} · {result.passed?'Quiz réussi':'Relis la fiche puis réessaie'}</Text>
    <Text style={s.muted}>Ton résultat est enregistré dans ton espace et visible par ton enseignant.</Text>
    <Button label="Recommencer" secondary busy={busy} onPress={()=>void start()}/>
   </View>:<>
    <Text accessibilityLiveRegion="polite" style={s.caption}>{answered} / {quiz.questions.length} réponses sélectionnées</Text>
    <Button label={busy?'Enregistrement…':'Vérifier mes réponses'} busy={busy} disabled={answered!==quiz.questions.length} onPress={()=>void submit()}/>
   </>}
  </>}
 </View>;
}

/** Mirrors the website's TeacherLessons ("Suivi des élèves"). */
export function TeacherLessons(){
 const [students,setStudents]=useState<any[]>([]),[studentId,setStudentId]=useState(''),[detail,setDetail]=useState<any>(null),[courseId,setCourseId]=useState(courses[0]!.id),[note,setNote]=useState(''),[active,setActive]=useState(false),[level,setLevel]=useState('working'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const version=useRef(0);
 const load=useCallback(async()=>{try{setError('');const r=await productClient.students();setStudents(r.students);setStudentId(id=>id||r.students[0]?.id||'');}catch(e){setError((e as Error).message);}},[]);
 useEffect(()=>{void load();},[load]);
 const loadStudent=useCallback(async()=>{if(!studentId){setDetail(null);return;}const n=++version.current;setDetail(null);try{const r=await productClient.student(studentId);if(n===version.current)setDetail(r);}catch(e){if(n===version.current)setError((e as Error).message);}},[studentId]);
 useEffect(()=>{void loadStudent();return()=>{version.current++;};},[loadStudent]);
 useEffect(()=>{const p=detail?.plan.find((p:Plan)=>p.courseId===courseId);setNote(p?.note||'');setActive(!!p?.active);setLevel(p?.level||'working');},[detail,courseId]);
 const lesson=courses.find(c=>c.id===courseId)!,quiz=detail?.quizzes.find((q:QuizStat)=>q.courseId===courseId),read=detail?.reading.find((r:any)=>r.courseId===courseId)?.read;
 async function save(){if(!studentId)return;setBusy(true);setError('');try{await productClient.plan(studentId,courseId,{active,level:level as any,note});await Promise.all([loadStudent(),load()]);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <View style={{gap:14}} accessibilityLabel="Suivi pédagogique des élèves">
  <View style={s.between}><Text style={[s.heading,{fontSize:24}]}>Mes élèves</Text><Pressable accessibilityRole="button" onPress={()=>{void load();void loadStudent();}} style={{minHeight:44,justifyContent:'center'}}><Text style={{fontFamily:fonts.bodySemi,fontSize:14,color:colors.wine}}>Actualiser</Text></Pressable></View>
  {!!error&&<Text style={s.error} accessibilityRole="alert">{error}</Text>}
  {!students.length?<Text style={s.body}>Aucun élève rattaché pour le moment. Les invitations et les comptes se gèrent dans Mon espace.</Text>:<>
   <Dropdown label="Élève" value={studentId} options={students.map(st=>({id:st.id as string,label:`${st.name}${st.reading?` · ${st.reading.read} fiches lues · ${st.quizzes?.passed??0} quiz réussis`:''}`}))} onChange={id=>{setError('');setStudentId(id);}}/>
   {!detail?<Text style={s.muted} accessibilityRole="text">Chargement de la progression…</Text>:<>
    <View style={{flexDirection:'row',gap:12}}>
     {[[`${detail.reading.filter((r:any)=>r.read).length} / ${courses.length}`,'fiches lues'],[`${detail.quizzes.filter((q:QuizStat)=>q.bestScore===q.total).length} / ${courses.length}`,'quiz réussis']].map(([n,l])=><View key={l} style={[s.card,{flex:1,padding:16,gap:4}]}><Text style={{fontFamily:fonts.display,fontSize:24,color:colors.wine}}>{n}</Text><Text style={s.caption}>{l}</Text></View>)}
    </View>
    <View style={{gap:14,paddingTop:16,borderTopWidth:1,borderColor:colors.line}}>
     <Dropdown label="Objectif à suivre" value={courseId} options={courses.map(c=>({id:c.id,label:`${c.code} · ${c.title}`}))} onChange={setCourseId}/>
     <Text style={s.muted}>{read?'Fiche lue':'Fiche non lue'} · {quiz?`Meilleur score : ${quiz.bestScore}/${quiz.total} · ${quiz.attempts} essai(s)`:'Quiz non commencé'}</Text>
     <View style={[s.between,{minHeight:48}]}><Text style={[s.body,{flex:1}]}>Ajouter cet objectif au parcours de l’élève</Text><Switch accessibilityLabel="Ajouter cet objectif au parcours de l’élève" value={active} onValueChange={setActive} trackColor={{true:colors.wine,false:colors.line}}/></View>
     <Dropdown label="Évaluation en leçon" value={level} options={[{id:'working',label:'À travailler'},{id:'validated',label:'Validé par l’enseignant'}]} onChange={v=>{setLevel(v);setActive(true);}}/>
     <View style={{gap:8}}><Text style={s.label}>Consigne pour l’élève</Text><TextInput accessibilityLabel="Consigne pour l’élève" placeholder={`Conseil pour : ${lesson.title}`} placeholderTextColor={colors.muted} value={note} onChangeText={setNote} multiline maxLength={1000} style={[s.field,{minHeight:96,textAlignVertical:'top'}]}/></View>
     <Button label={busy?'Enregistrement…':'Enregistrer le suivi'} busy={busy} onPress={()=>void save()}/>
    </View>
    <Disclosure title={`Parcours sur la carte · ${detail.routes.length}`}>
     {detail.routes.length?detail.routes.map((r:any)=><View key={r.id} style={{gap:6,paddingVertical:10,borderBottomWidth:1,borderColor:colors.line}}><Text style={{fontFamily:fonts.bodySemi,fontSize:15,color:colors.ink}}>{r.name}</Text><Text style={s.caption}>{r.examCenter||'Centre non précisé'}</Text><ProgressBar value={Math.min(r.fixIndex,Math.max(1,r.fixCount-1))} max={Math.max(1,r.fixCount-1)} label={`Progression sur ${r.name}`}/><Text style={s.caption}>{Math.round(Math.min(r.fixIndex/Math.max(1,r.fixCount-1),1)*100)} % du replay parcouru</Text></View>):<Text style={s.muted}>Aucune progression de replay enregistrée pour cet élève.</Text>}
    </Disclosure>
   </>}
  </>}
 </View>;
}
