/** Private student-only WebRTC viewer. Only subscribes to teacher's Meta camera.
 *  This never activates the student's phone camera or microphone.
 */
import React, {useEffect, useState} from "react";
import {ActivityIndicator, Text, View} from "react-native";
import {LiveKitRoom, useTracks, VideoTrack, isTrackReference} from "@livekit/react-native";
import {Track} from "livekit-client";
import {joinRTC,rtcStatus,type RTCJoin} from "../services/webrtc";
import {Button} from "./UI";
import {colors,styles as s} from "../theme";

function TeacherCamera() {
  const tracks=useTracks([Track.Source.Camera]);
  const track=tracks.find(t=>isTrackReference(t) && t.participant.identity.startsWith("t-"));
  return <View style={{gap:8}}>
    {track && isTrackReference(track) ? (
      <VideoTrack trackRef={track} style={{height:230,width:"100%",backgroundColor:"#161214",borderRadius:12}} />
    ) : <View style={[s.card,{height:160,alignItems:"center",justifyContent:"center"}]}>
      <ActivityIndicator color={colors.wine}/>
      <Text style={s.caption}>En attente des images de votre enseignant…</Text>
    </View>}
    <Text style={s.caption}>Direct privé · Caméra et micro de votre iPhone désactivés.</Text>
  </View>;
}
export function InstantLivePlayer({videoId}:{videoId:string}) {
  const [join,setJoin]=useState<RTCJoin|null>(null);
  const [error,setError]=useState("");
  const [enabled,setEnabled]=useState(true);
  const [connecting,setConnecting]=useState(false);
  async function enter() {
    setConnecting(true);setError("");
    try { const t=await joinRTC(videoId);if(t.publisher)throw new Error("Accès élève attendu.");setJoin(t);setEnabled(true); }
    catch(e){setError(e instanceof Error?e.message:"Direct indisponible.");setJoin(null);}
    finally{setConnecting(false);}
  }
  useEffect(()=>{void enter();return()=>setEnabled(false);},[videoId]);
  useEffect(()=>{
    if(!join)return;
    // An already joined participant must be disconnected after grant revocation:
    // LiveKit join tokens expire only on NEW joins, not while viewing.
    let mounted=true;
    const check=async()=>{
      try {const status=await rtcStatus(videoId);if(mounted && !status.active){setError("Le direct est terminé.");setEnabled(false);setJoin(null);}}
      catch {if(mounted){setError("Accès au live retiré ou session expirée.");setEnabled(false);setJoin(null);}}
    };
    const timer=setInterval(()=>void check(),5000);
    return()=>{mounted=false;clearInterval(timer);};
  },[videoId,join?.token]);
  return <View style={{gap:9}}>
    <Text style={s.heading}>En direct</Text>
    {error?<Text style={s.muted}>{error}</Text>:null}
    {connecting?<ActivityIndicator color={colors.wine}/>:null}
    {join && enabled ? <LiveKitRoom key={join.roomId} serverUrl={join.url} token={join.token} connect={true}
      audio={false} video={false} options={{adaptiveStream:true}}
      onDisconnected={()=>{setError("Connexion au direct perdue. Rejoignez pour vous reconnecter.");setEnabled(false);setJoin(null);}}
      onError={e=>{setError("Connexion interrompue. Réessayez.");setEnabled(false);setJoin(null);}}
    ><TeacherCamera/></LiveKitRoom> :
      <Button label="Rejoindre le direct privé" secondary busy={connecting} onPress={()=>void enter()}/>}
  </View>;
}
