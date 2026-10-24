import React,{useState} from 'react';
import {ScrollView,View,Text,Pressable,Image,Modal} from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import {studentActions,studentGuide,useStudentGuide,type GuideStorage} from '../../../../packages/product/src/student-experience';
import {Button,Disclosure,Icon} from '../components/UI';
import {colors,fonts,radius,shadow,styles as s} from '../theme';
const storage:GuideStorage={get:key=>Storage.getItem(key),set:(key,value)=>Storage.setItem(key,value)};

/** Mirrors the website's student home: greeting, two priorities, secondary tools, guided tour. */
export function StudentHome({user,name,go}:{user:string;name:string;go:(tab:string)=>void}){
 const guide=useStudentGuide(user,storage),item=guide.step===null?null:studentGuide[guide.step];
 return <><ScrollView contentContainerStyle={[s.content,{gap:20}]}>
  <View style={{gap:10}}>
   <Image source={require('../../assets/logo.png')} resizeMode="contain" style={{width:140,height:62,alignSelf:'flex-start',marginBottom:8}} accessibilityLabel="Le Repère Auto-école"/>
   <Text style={s.eyebrow}>TON AUTO-ÉCOLE · ASNIÈRES-SUR-SEINE</Text>
   <Text style={s.title} accessibilityRole="header">Bonjour {name.split(' ')[0] || 'à toi'}.</Text>
   <Text style={[s.heading,{fontSize:21,color:colors.wine}]}>Un repère entre deux leçons.</Text>
   <Text style={s.subtitle}>Revois tes parcours, comprends les situations et prépare ta prochaine séance avec ton enseignant.</Text>
  </View>
  <View style={{gap:12}} accessibilityLabel="Commencer">
   <Text style={[s.heading,{fontSize:18}]}>Qu’est-ce qu’on travaille ?</Text>
   {studentActions.map((action,i)=><Pressable key={action.id} accessibilityRole="button" onPress={()=>go(action.id)} style={({pressed})=>[s.card,{padding:22,gap:10,borderRadius:radius.xl,backgroundColor:i===0?colors.night:colors.paper,borderColor:i===0?colors.night:colors.line,transform:[{scale:pressed?.98:1}]},i===0&&shadow.lg]}>
    <View style={{flexDirection:'row',gap:12,alignItems:'flex-start'}}>
     <Text style={{fontFamily:fonts.display,fontSize:13,color:i===0?colors.blush:colors.muted,paddingTop:5}}>0{i+1}</Text>
     <View style={{flex:1,gap:8}}>
      <Text style={[s.heading,{color:i===0?colors.paper:colors.ink,fontSize:21}]}>{action.title}</Text>
      <Text style={[s.body,{color:i===0?colors.blush:colors.muted}]}>{action.description}</Text>
     </View>
     <Icon name="arrow-up-outline" size={18} color={i===0?colors.blush:colors.wine}/>
    </View>
   </Pressable>)}
  </View>
  <Disclosure title="Vidéos, directs et mon espace">
   {[['videos','Vidéos et directs','Les contenus de ton enseignant'],['account','Mon espace','Mon compte et mon auto-école']].map(([id,title,sub])=><Pressable key={id} accessibilityRole="button" onPress={()=>go(id!)} style={({pressed})=>({padding:16,minHeight:64,borderRadius:radius.md,backgroundColor:colors.cream,gap:4,transform:[{scale:pressed?.97:1}]})}>
    <Text style={{fontFamily:fonts.bodySemi,fontSize:15,color:colors.ink}}>{title}</Text>
    <Text style={s.caption}>{sub}</Text>
   </Pressable>)}
  </Disclosure>
  <View style={{gap:4}}>
   <Text style={s.muted}>Les fiches et les replays complètent tes leçons en voiture.</Text>
   <Pressable accessibilityRole="button" onPress={guide.restart} style={{minHeight:44,justifyContent:'center'}}><Text style={{fontFamily:fonts.bodySemi,fontSize:14,color:colors.wine}}>Découvrir les fonctionnalités</Text></Pressable>
  </View>
 </ScrollView>
 {item&&<Modal visible transparent animationType="fade" onRequestClose={guide.close}><View style={{flex:1,justifyContent:"flex-end",backgroundColor:"rgba(28,18,22,0.45)"}}><View accessibilityViewIsModal style={{maxHeight:"85%",backgroundColor:colors.paper,borderTopLeftRadius:28,borderTopRightRadius:28,paddingTop:22,paddingBottom:24}}>
  <Text accessibilityRole="header" style={[s.heading,{paddingHorizontal:22}]}>{item.title}</Text>
  <ScrollView contentContainerStyle={{padding:22,gap:20}}>
   <Text style={s.eyebrow}>PETITE VISITE · {(guide.step??0)+1} / {studentGuide.length}</Text>
   <Text style={[s.body,{fontSize:17,lineHeight:27}]}>{item.text}</Text>
   <View style={{flexDirection:'row',gap:10}}>{(guide.step??0)>0&&<View style={{flex:1}}><Button label="Précédent" secondary onPress={guide.back}/></View>}<View style={{flex:1}}><Button label={guide.step===studentGuide.length-1?'C’est parti':'Suivant'} onPress={guide.next}/></View></View>
   <Pressable accessibilityRole="button" onPress={guide.close} style={{minHeight:44,alignItems:'center',justifyContent:'center'}}><Text style={{fontFamily:fonts.bodySemi,fontSize:14,color:colors.wine}}>Passer la visite</Text></Pressable>
  </ScrollView>
 </View></View></Modal>}</>;
}
