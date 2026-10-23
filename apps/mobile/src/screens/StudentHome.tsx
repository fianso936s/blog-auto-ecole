import React,{useState} from 'react';
import {ScrollView,View,Text,Pressable,Image,Modal} from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import {studentActions,studentGuide,useStudentGuide,type GuideStorage} from '../../../../packages/product/src/student-experience';
import {Button} from '../components/UI';
import {colors,fonts,radius,shadow,styles as s} from '../theme';
import {Icon} from '../components/UI';
const storage:GuideStorage={get:key=>Storage.getItem(key),set:(key,value)=>Storage.setItem(key,value)};
export function StudentHome({user,name,go}:{user:string;name:string;go:(tab:string)=>void}){
 const guide=useStudentGuide(user,storage),item=guide.step===null?null:studentGuide[guide.step];const [more,setMore]=useState(false);
 return <><ScrollView contentContainerStyle={[s.content,{gap:20}]}>
  <Image source={require('../../assets/logo.png')} resizeMode="contain" style={{width:150,height:66,alignSelf:'flex-start'}} accessibilityLabel="Le Repère Auto-école"/>
  <View style={{gap:10}}><Text style={s.eyebrow}>TON AUTO-ÉCOLE · ASNIÈRES-SUR-SEINE</Text><Text style={s.title}>Bonjour {name.split(' ')[0] || 'à toi'}.</Text><Text style={[s.heading,{fontSize:22,color:colors.wine}]}>Un repère entre deux leçons.</Text><Text style={s.subtitle}>Revois tes parcours, comprends les situations et prépare ta prochaine séance avec ton enseignant.</Text></View>
  <Text style={s.heading}>Qu’est-ce qu’on travaille ?</Text>
  {studentActions.map((action,i)=><Pressable key={action.id} accessibilityRole="button" onPress={()=>go(action.id)} style={({pressed})=>[s.card,{padding:24,gap:10,borderRadius:radius.xl,backgroundColor:i===0?colors.night:colors.paper,borderColor:i===0?colors.night:colors.line,transform:[{scale:pressed?.98:1}]},i===0&&shadow.lg]}><View style={s.between}><Text style={{fontFamily:fonts.display,fontSize:13,color:i===0?colors.blush:colors.muted}}>{String(i+1).padStart(2,'0')}</Text><Icon name="arrow-up-outline" size={18} color={i===0?colors.blush:colors.wine}/></View><Text style={[s.heading,{color:i===0?colors.paper:colors.ink,fontSize:22}]}>{action.title}</Text><Text style={[s.body,{color:i===0?colors.blush:colors.muted}]}>{action.description}</Text></Pressable>)}
  <View style={[s.card,{padding:18,gap:12}]}><Pressable accessibilityRole="button" accessibilityState={{expanded:more}} onPress={()=>setMore(!more)} style={[s.between,{minHeight:48}]}><Text style={[s.heading,{fontSize:17,flex:1}]}>Vidéos, directs et mon espace</Text><Icon name={more?'chevron-up':'chevron-down'} size={20}/></Pressable>{more&&<><Button label="Vidéos et directs" secondary onPress={()=>go('videos')}/><Button label="Mon espace" secondary onPress={()=>go('account')}/></>}</View>
  <Text style={s.caption}>Les fiches et les replays complètent tes leçons en voiture.</Text><Button label="Découvrir les fonctionnalités" secondary onPress={guide.restart}/>
 </ScrollView>{item&&<Modal visible transparent animationType="fade" onRequestClose={guide.close}><View style={{flex:1,justifyContent:"center",padding:20,backgroundColor:"rgba(28,18,22,0.45)"}}><View accessibilityViewIsModal style={{maxHeight:"85%",backgroundColor:colors.paper,borderRadius:28,paddingTop:24}}><Text accessibilityRole="header" style={[s.heading,{paddingHorizontal:22}]}>{item.title}</Text><ScrollView contentContainerStyle={{padding:22,gap:22}}><Text style={s.eyebrow}>PETITE VISITE · {(guide.step??0)+1} / {studentGuide.length}</Text><Text style={[s.body,{fontSize:18,lineHeight:28}]}>{item.text}</Text><Button label={guide.step===studentGuide.length-1?'C’est parti':'Suivant'} onPress={guide.next}/>{(guide.step??0)>0&&<Button label="Précédent" secondary onPress={guide.back}/>}<Button label="Passer la visite" secondary onPress={guide.close}/></ScrollView></View></View></Modal>}</>;
}
