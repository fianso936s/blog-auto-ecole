import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View, Linking, Pressable, AppState } from "react-native";
import * as Sharing from "expo-sharing";
import {requireNativeViewManager} from "expo-modules-core";
import {connectionLabel} from "../services/diagnostic-data";
import {trace} from "../services/diagnostics";
import type {DeviceStatus} from "../services/meta-live";
import {DiagnosticsPanel} from "./DiagnosticsPanel";
import { WebView } from "react-native-webview";
import { Directory, Paths } from "expo-file-system";
import { useApp } from "../state";
import { Button, Icon } from "./UI";
import { colors, styles as s } from "../theme";
import {
  beginLive,finishLive,getLiveSettings,loadPlaylist,metaBridge,recordPending,uploadPending,listLocalSegments,recoverLocalSegments,recoverLocalRecordings,
  type SavedRecording,type MetaState,type Playlist,type LiveSettings,
} from "../services/meta-live";
import { saveCapturedVideo, uploadPrivateVideo, saveGrants, fetchGrants } from "../services/private-videos";
import { InstantLivePlayer } from "./InstantLivePlayer";
import {getRTCConfig,startRTC,joinRTC,stopRTC,rtcHeartbeat,changeRTCAudience,type RTCConfig} from "../services/webrtc";

const PhonePreview = requireNativeViewManager<{style?:object}>("RepereMeta");
type Student={id:string;name:string;email:string};
function PrivateLivePlayer({videoId}:{videoId:string}) {
  const [playlist,setPlaylist]=useState<Playlist|null>(null);
  const [current,setCurrent]=useState(0);
  const [source,setSource]=useState<{index:number;url:string}|null>(null);
  const [error,setError]=useState("");
  const [sourceVersion,setSourceVersion]=useState(0);
  useEffect(()=>{
    let running=true;
    const refresh=async()=>{
      try {
        // Re-fetch signed URLs rather than caching expired R2 URLs.
        const p=await loadPlaylist(videoId,Math.max(0,current));
        if(running){setPlaylist(p);setError("");}
      }catch(e){if(running)setError(e instanceof Error?e.message:"Lecture impossible.");}
    };
    void refresh();
    const timer=setInterval(()=>void refresh(),5000);
    return()=>{running=false;clearInterval(timer);};
  },[videoId,current]);
  useEffect(()=>{setPlaylist(null);setSource(null);setCurrent(0);},[videoId]);
  const segment=playlist?.segments.find(x=>x.index===current);
  useEffect(()=>{
    if(segment && source?.index!==segment.index)setSource({index:segment.index,url:segment.url});
  },[segment?.index,segment?.url,current]);
  async function refreshLink() {
    try {
      const p=await loadPlaylist(videoId,current);
      setPlaylist(p);
      const chosen=p.segments.find(x=>x.index===current);
      if(chosen)setSource({index:chosen.index,url:chosen.url});
      setSourceVersion(n=>n+1);
      setError("");
    }catch(e){setError(e instanceof Error?e.message:"Impossible de renouveler l'accès.");}
  }
  // Do not place the temporary signed URL in the HTML attribute; give it to the
  // video element through a JSON-escaped script literal to avoid quote injection.
  const signedSource=JSON.stringify(source?.index===current?source.url:"").replace(/</g,"\\u003c");
  const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
    <body style="margin:0;background:#141414"><video id="v" controls autoplay muted playsinline webkit-playsinline
      style="width:100%;height:100%"></video>
    <script>var v=document.getElementById('v');v.src=${signedSource};
    v.onended=function(){window.ReactNativeWebView.postMessage('next')};
    v.onerror=function(){window.ReactNativeWebView.postMessage('error')};
    v.play().catch(function(){window.ReactNativeWebView.postMessage('tap-to-play')});</script></body></html>`;
  return <View style={{gap:9}}>
    <Text style={s.heading}>Direct privé {playlist?.status==="live"?"— EN COURS":playlist?.status==="ended"?"— TERMINÉ":""}</Text>
    <Text style={s.caption}>Diffusion légèrement différée, réservée aux élèves sélectionnés. La séance complète reste enregistrée dans un seul fichier sur l’iPhone.</Text>
    {error?<Text style={s.muted}>{error}</Text>:null}
    {segment?<>
      <WebView key={`${source?.index ?? current}:${sourceVersion}`} source={{html}} originWhitelist={["*"]} allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false} style={{height:220,backgroundColor:"#141414"}}
        onMessage={e=>{
          if(e.nativeEvent.data==="next"){setCurrent(n=>n+1);setSource(null);}
          if(e.nativeEvent.data==="error")setError("Le passage vidéo est indisponible. Renouvelez l’accès ou continuez le direct.");
          if(e.nativeEvent.data==="tap-to-play")setError("Touchez ▶ dans le lecteur pour autoriser la lecture sur iPhone.");
        }}/>
      <Text style={s.caption}>Passage en direct n°{segment.index+1}. Les liens de lecture expirent automatiquement.</Text>
      <Button label="Actualiser le lien de lecture" secondary onPress={()=>void refreshLink()} />
      <Button label="Continuer le direct" secondary onPress={()=>{setCurrent(x=>x+1);setSource(null);}} />
    </>:<View style={s.card}><ActivityIndicator color={colors.wine}/><Text style={s.muted}>
      {playlist?.status==="ended"?"Fin du replay : plus de fragments disponibles.":"En attente des prochaines images depuis l’iPhone…"}
    </Text></View>}
  </View>;
}
export function MetaLivePanel({videoId,liveStatus,webRTCUsed,videoReady,students,onUpdated}:{videoId:string;liveStatus:"idle"|"live"|"ended";webRTCUsed:boolean;videoReady:boolean;students:Student[];onUpdated:()=>Promise<void>}) {
  const app=useApp();
  const teacher=app.profile?.role!=="student";
  const [settings,setSettings]=useState<LiveSettings|null>(null);
  const [rtcConfig,setRTCConfig]=useState<RTCConfig|null>(null);
  const [instantActive,setInstantActive]=useState(false);
  const [realStreamStarted,setRealStreamStarted]=useState(false);
  const [audience,setAudience]=useState<string[]>([]);
  const [source,setSource]=useState<"iphone"|"meta">("iphone");
  const [device,setDevice]=useState<DeviceStatus|null>(null);
  const [details,setDetails]=useState(false);
  const [state,setState]=useState<MetaState>({state:"idle"});
  const [active,setActive]=useState(false);
  const [busy,setBusy]=useState(false);
  const [pending,setPending]=useState(0);
  const [localSegments,setLocalSegments]=useState<{uri:string;segment_index:number;state:string}[]>([]);
  const [localRecordings,setLocalRecordings]=useState<SavedRecording[]>([]);
  const [published,setPublished]=useState(false);
  const [error,setError]=useState("");
  const video=app.profile?.id||"";
  const liveSession=useRef<string|null>(null);
  const remotePublishing=useRef(false);
  const instantPublishing=useRef(false);
  const interrupted=useRef(false);
  const sending=useRef<Promise<unknown>>(Promise.resolve());
  const native=metaBridge();
  const updateError=(e:unknown)=>{trace('camera',false);setError(e instanceof Error?e.message:"Échec du direct.");};
  useEffect(()=>{
    if(!native||!teacher)return;
    let mounted=true,checking=false;
    const check=async()=>{
      if(checking)return;checking=true;
      try {const status=await native.deviceStatus();if(mounted)setDevice(status);}
      catch{}finally{checking=false;}
    };
    void check();const timer=setInterval(()=>{if(AppState.currentState==='active')void check();},2000);
    return()=>{mounted=false;clearInterval(timer);};
  },[native,teacher]);
  async function reloadLocal() {
    if(!teacher||!video)return;
    const segments=await listLocalSegments(videoId,video);
    setLocalSegments(segments);
    setPending(segments.filter(s=>s.state==='pending').length);
    const recordings=await recoverLocalRecordings(videoId,video);
    setLocalRecordings(recordings);
  }
  useEffect(() => {
    if (!teacher) return;
    let alive = true;
    void fetchGrants(videoId).then(result => {
      if (alive) setAudience(result.students.slice(0, 10));
    }).catch(updateError);
    return () => { alive = false; };
  }, [videoId, teacher]);
  useEffect(()=>{
    void getLiveSettings().then(setSettings).catch(updateError);
    void getRTCConfig().then(setRTCConfig).catch(updateError);
    if(teacher && video) {
      void recoverLocalSegments(videoId,video).then(reloadLocal).catch(updateError);
    }
  },[videoId,video]);
  // Recover a Meta capture when the user returns from another app tab.
  useEffect(()=>{
    if(!native || !video || !teacher)return;
    let mounted=true;
    void native.captureStatus().then(s=>{
      if(!mounted || !s.active)return;
      const dir=new Directory(Paths.document,"meta-live",videoId);
      if(s.directory===dir.uri){
        liveSession.current=videoId;
        remotePublishing.current=liveStatus==="live" && !webRTCUsed;
        if(webRTCUsed){instantPublishing.current=true;setInstantActive(true);setRealStreamStarted(false);}
        setActive(true);
        void native.deviceStatus().then(status=>setSource(status.source==="iphone"?"iphone":"meta")).catch(()=>{});
        setState({state:"recording"});
      }
    }).catch(updateError);
    return()=>{mounted=false;};
  },[native,videoId,video,liveStatus,webRTCUsed]);
  useEffect(()=>{
    if(!native)return;
    async function recoverInterruption() {
      if(interrupted.current || !liveSession.current || !app.profile?.id)return;
      interrupted.current=true;
      const vid=liveSession.current;
      const who=app.profile.id;
      try {
        await sending.current.catch(()=>{});
        await recoverLocalRecordings(vid,who);
        await recoverLocalSegments(vid,who);
        if(remotePublishing.current){
          try { await uploadPending(vid,who); } catch(e){updateError(e);}
          try { await finishLive(vid); } catch(e){updateError(e);}
        }
        if(instantPublishing.current){
          try {await native?.stopRealtime();}catch(e){updateError(e);}
          try {await stopRTC(vid);}catch(e){updateError(e);}
        }
        remotePublishing.current=false;instantPublishing.current=false;setInstantActive(false);setRealStreamStarted(false);
        liveSession.current=null;
        setActive(false);
        await reloadLocal();
        await onUpdated();
      }catch(e){updateError(e);}finally{interrupted.current=false;}
    }
    const subs=[
      native.addListener("onState",s=>{
        setState(s);
        if(s.state==="error")void recoverInterruption();
      }),
      native.addListener("onError",e=>setError(e.message)),
      native.addListener("onRecordingSaved",saved=>{
        const vid=liveSession.current;
        if(!vid || !app.profile?.id)return;
        sending.current=sending.current.catch(()=>{}).then(async()=>{
          await saveCapturedVideo(vid,app.profile!.id,saved);
          await reloadLocal();
        });
      }),
      native.addListener("onSegment",s=>{
        const vid=liveSession.current;
        if(!vid || !app.profile?.id)return;
        // Never lose a chunk if the network fails. Later events are serialized.
        sending.current=sending.current.catch(()=>{}).then(async()=>{
          await recordPending(vid,app.profile!.id,s);
          if(remotePublishing.current){try {await uploadPending(vid,app.profile!.id);} catch(e){updateError(e);}}
          await reloadLocal();
        });
      }),
    ];
    const appStateListener=AppState.addEventListener("change",(next:string)=>{
      if(next==="active")void native.captureStatus().then(status=>{
        if(!status.active && liveSession.current)void recoverInterruption();
      }).catch(updateError);
    });
    return()=>{subs.forEach(x=>x.remove());appStateListener.remove();};
  },[native,app.profile?.id,videoId]);
  // A heartbeat does not keep a stale room open if native capture disappeared.
  // Students also poll the authenticated backend, so revocation terminates their view.
  useEffect(()=>{
    if(!instantActive || !teacher || !native)return;
    let running=true;
    const tick=async()=>{
      try {
        const [capture,room]=await Promise.all([native.captureStatus(),native.realtimeStatus()]);
        if(running && room.published)setRealStreamStarted(true);
        if(!capture.active || !room.publishing || !room.framesRecent){
          setError(room.message || "Le direct s’est interrompu. Le direct doit être arrêté.");
          setInstantActive(false);setRealStreamStarted(false);
          try{await stopRTC(videoId);}catch{}
          instantPublishing.current=false;
          return;
        }
        await rtcHeartbeat(videoId);
      }catch(e){if(running)updateError(e);}
    };
    void tick();
    const timer=setInterval(()=>void tick(),12000);
    return()=>{running=false;clearInterval(timer);};
  },[instantActive,videoId,teacher,native]);
  async function startInstant() {
    if(!native || !video) return setError("Le module caméra Meta n’est pas présent dans ce build iOS.");
    if(!rtcConfig?.enabled)return setError("Configurez LiveKit côté serveur avant de démarrer le direct instantané.");
    if(!audience.length || audience.length>10)return setError("Sélectionnez entre 1 et 10 élèves autorisés.");
    setBusy(true);setError("");
    let startedOnServer=false,connected=false;
    try {
      const current=await native.captureStatus();
      if(current.active)throw new Error("Une autre capture est déjà en cours sur l’iPhone.");
      if(source==="meta"){await native.connect();await native.authorizeCamera();}
      trace("connection",true);
      await startRTC(videoId,audience);startedOnServer=true;
      const join=await joinRTC(videoId);
      if(!join.publisher)throw new Error("Droits de diffusion insuffisants.");
      await native.startRealtime(join.url,join.token);connected=true;
      const dir=new Directory(Paths.document,"meta-live",videoId);
      if(!dir.exists)dir.create({idempotent:true,intermediates:true});
      liveSession.current=videoId;
      // false => NO 12-second MP4 transport fragments. One original MOV file only.
      if(source==="iphone")await native.startPhoneCapture(dir.uri);
      else await native.startCapture(dir.uri,false);
      trace("start",true);
      instantPublishing.current=true;remotePublishing.current=false;
      setActive(true);setInstantActive(true);setRealStreamStarted(false);
      await onUpdated();
    }catch(e){
      if(connected)try{await native.stopRealtime();}catch{}
      if(startedOnServer)try{await stopRTC(videoId);}catch{}
      instantPublishing.current=false;liveSession.current=null;
      updateError(e);
    }finally{setBusy(false);}
  }
  async function updateLiveAudience() {
    setBusy(true);setError("");
    try {await changeRTCAudience(videoId,audience);await onUpdated();}
    catch(e){updateError(e);}finally{setBusy(false);}
  }
  async function register() {
    if(!native)return setError("Connecteur Meta iOS absent : une compilation native est nécessaire.");
    setBusy(true);setError("");
    try {await native.register();const status=await native.deviceStatus();trace("association",status.registered);setDevice(status);}
    catch(e){updateError(e);}finally{setBusy(false);}
  }
  async function connect() {
    if(!native)return setError("Connecteur Meta iOS non compilé dans ce build.");
    setBusy(true);setError("");
    try {await native.connect();trace("connection",true);setState({state:"connected"});setDevice(await native.deviceStatus());}
    catch(e){updateError(e);}finally{setBusy(false);}
  }
  useEffect(()=>{
    if(!native)return;
    const handle=(url:string)=>{
      if(url.includes("metaWearablesAction"))void native.handleUrl(url).then(()=>{trace("callback",true);return native.deviceStatus();}).then(setDevice).catch(updateError);
    };
    const sub=Linking.addEventListener("url",e=>handle(e.url));
    // The Meta callback might cold-start the app instead of using the live listener.
    void Linking.getInitialURL().then(url=>{if(url)handle(url);}).catch(updateError);
    return()=>sub.remove();
  },[native]);
  async function authorize() {
    if(!native)return;
    setBusy(true);setError("");
    try {await native.authorizeCamera();trace("camera",true);}
    catch(e){updateError(e);}finally{setBusy(false);}
  }
  async function start(remote:boolean) {
    if(!native || !video)throw new Error("Connecteur Meta ou session utilisateur indisponible.");
    if(remote && source==="iphone")throw new Error("Choisissez le direct instantané pour la caméra iPhone.");
    if(remote && !settings?.enabled)throw new Error("Le stockage vidéo distant n’est pas disponible. Enregistrement local disponible.");
    if(remote && !audience.length)throw new Error("Choisissez au moins un élève avant de démarrer un live.");
    // The same video session must not be started twice from a different navigation tab.
    const status=await native.captureStatus();
    if(status.active)throw new Error("Une capture est déjà active sur cet iPhone. Revenez à sa séance pour l'arrêter.");
    setBusy(true);setError("");
    try {
      // The Démarrer button connects and requests permission from the PHONE.
      // First registration still needs the Meta AI one-time onboarding button.
      if(source==="meta"){await native.connect();await native.authorizeCamera();}
      trace("connection",true);
      // In case camera startup fails, stop the remote live immediately.
      if(remote)await beginLive(videoId,audience);
      liveSession.current=videoId;remotePublishing.current=remote;interrupted.current=false;
      try {
        const dir=new Directory(Paths.document,"meta-live",videoId);
        if(!dir.exists)dir.create({idempotent:true,intermediates:true});
        if(source==="iphone")await native.startPhoneCapture(dir.uri);
        else await native.startCapture(dir.uri,remote);
        trace("start",true);
      }catch(e){if(remote)await finishLive(videoId).catch(()=>{});liveSession.current=null;remotePublishing.current=false;throw e;}
      setActive(true);await onUpdated();
    }catch(e){updateError(e);}finally{setBusy(false);}
  }
  async function stop() {
    if(!native)return;
    setBusy(true);
    try {
      const last=await native.stopCapture();trace("stop",!!last);
      if(last){await saveCapturedVideo(videoId,video,last);}
      else setError("Aucune vidéo finalisée : vérifiez que la caméra a transmis des images.");
      await sending.current.catch(()=>{});
      // Catch finalizations whose event arrived while the app was paused.
      await recoverLocalRecordings(videoId,video);
      await recoverLocalSegments(videoId,video);
      if(remotePublishing.current){
        try{await uploadPending(videoId,video);}catch(e){updateError(e);}
        await finishLive(videoId);
      }
      if(instantPublishing.current){
        await native.stopRealtime();
        await stopRTC(videoId);
      }
      liveSession.current=null;remotePublishing.current=false;instantPublishing.current=false;setInstantActive(false);setRealStreamStarted(false);setActive(false);
      await reloadLocal();await onUpdated();
    }catch(e){updateError(e);}finally{setBusy(false);}
  }
  async function publishFullRecording() {
    if(!localRecordings.length || !audience.length || !settings?.enabled)return;
    setBusy(true);setError("");
    try {
      await uploadPrivateVideo(videoId,video);
      await saveGrants(videoId,audience,true);
      setPublished(true);
      await onUpdated();
    } catch(e) {updateError(e);}finally{setBusy(false);}
  }
  // Owner controls are the only way to begin publishing a stream.
  return <View style={[s.card,{gap:12}]}>
    <Text style={s.heading}>{teacher?"Caméra & direct":"Votre direct"}</Text>
    {!teacher ? (videoReady ? <Text style={s.caption}>La vidéo intégrale est disponible via « Voir le replay sécurisé ».</Text> :
      webRTCUsed ? (liveStatus==="live" ? <InstantLivePlayer videoId={videoId}/> :
        <Text style={s.caption}>Le direct est terminé. Aucun enregistrement cloud automatique : seul l’enseignant peut publier un replay autorisé.</Text>) :
      <PrivateLivePlayer videoId={videoId}/>) : <>
      <View style={[s.row,{backgroundColor:colors.soft,padding:4,borderRadius:16}]}>
        {([['iphone','iPhone'],['meta','Lunettes Meta']] as const).map(([id,label])=><Pressable key={id} disabled={active||busy} onPress={()=>{setSource(id);setError('');}} accessibilityRole="button" accessibilityState={{selected:source===id,disabled:active||busy}} style={{flex:1,minHeight:44,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:source===id?colors.paper:'transparent'}}><Text style={[s.body,{fontWeight:source===id?'600':'400'}]}>{label}</Text></Pressable>)}
      </View>
      {source==='meta'&&<>
        <View accessibilityRole="text" accessibilityLiveRegion="polite" style={s.row}><Icon name={device?.registered?'checkmark-circle':'ellipse-outline'} color={device?.registered?colors.green:colors.muted}/><Text style={[s.body,{flex:1}]}>{connectionLabel(device)}</Text></View>
        {!device?.registered&&<Button label="Associer mes lunettes" secondary disabled={!native||active} busy={busy} onPress={()=>void register()}/>}
        {!!device?.registered&&!device.connected&&<Button label="Connecter les lunettes" secondary disabled={!native||active} busy={busy} onPress={()=>void connect()}/>}
        {!!device?.registered&&<Button label="Autoriser la caméra" secondary disabled={!native||active} busy={busy} onPress={()=>void authorize()}/>}
      </>}
      {source==='meta'&&<Text style={s.caption}>Haute définition · jusqu’à 720 × 1280, 24 i/s. Le flux des lunettes est distinct de leur enregistrement interne 3K. Pour conserver la qualité originale, importez la vidéo depuis l’iPhone.</Text>}
      {!!device?.width&&!!device?.height&&<Text style={s.caption}>Flux reçu : {device.width} × {device.height} pixels</Text>}
      {source==='iphone'&&<Text style={s.muted}>Filmez avec la caméra arrière de votre iPhone, sans lunettes. Vidéo uniquement, sans microphone.</Text>}
      {source==='iphone'&&active&&<PhonePreview style={{height:240,width:'100%',borderRadius:16,overflow:'hidden'}}/>}
      <Text style={s.caption} accessibilityLiveRegion="polite">{active ? (device?.framesRecent?'● Images reçues':'En attente des premières images…') : state.state==='connecting' ? state.message||'Connexion en cours…' : 'Prêt à démarrer'}</Text>
      {!active && liveStatus==="idle" && <>
        <Button label="Enregistrer une vidéo" secondary={!!audience.length} disabled={!native||!!localRecordings.length||!!localSegments.length} busy={busy} onPress={()=>void start(false)} />
        <Text style={s.label}>Élèves autorisés (live ou publication différée)</Text>
        {students.map(st=><Pressable key={st.id} onPress={()=>setAudience(a=>a.includes(st.id)?a.filter(x=>x!==st.id):a.length<10?[...a,st.id]:a)}
          accessibilityRole="checkbox" accessibilityState={{checked:audience.includes(st.id)}} style={[s.row,{paddingVertical:6}]}>
          <Icon name={audience.includes(st.id)?"checkbox":"square-outline"} color={colors.wine}/><Text style={s.body}>{st.name}</Text>
        </Pressable>)}
        <Button label="Démarrer le direct" disabled={!rtcConfig?.enabled||!native||!audience.length||audience.length>10||!!localRecordings.length||!!localSegments.length} busy={busy} onPress={()=>void startInstant()}/>

        {details&&source==="meta"&&<Button label="Ancien live différé (optionnel)" secondary disabled={!settings?.enabled||!native||!audience.length||!!localRecordings.length||!!localSegments.length} busy={busy} onPress={()=>void start(true)}/> }
        {!!localRecordings.length && <Button label="Partager la vidéo intégrale avec les élèves choisis" secondary
          disabled={!settings?.enabled||!audience.length||published} busy={busy} onPress={()=>void publishFullRecording()}/>}
      </>}
      {active && <>
        {instantActive && <Text style={s.heading}>{realStreamStarted ? "● LIVE · Vidéo Meta transmise aux élèves" : "Connexion en cours · Attente des premières images Meta…"}</Text>}
        {instantActive && <Button label="Mettre à jour les élèves autorisés" secondary busy={busy} onPress={()=>void updateLiveAudience()}/>}
        <Button label="Terminer le direct et sauvegarder la vidéo" busy={busy} onPress={()=>void stop()}/>
      </>}
      {liveStatus==="live" && webRTCUsed && !active && <Button label="Fermer le direct resté actif" secondary busy={busy} onPress={()=>void (async()=>{
        setBusy(true);try{await stopRTC(videoId);await onUpdated();}catch(e){updateError(e);}finally{setBusy(false);}
      })()}/>}
      {liveStatus==="ended" && <Text style={s.caption}>Séance terminée. Ouvrez une nouvelle séance pour reprendre l'enregistrement.</Text>}
      {!!localRecordings.length && <View style={{gap:8}}>
        <Text style={s.heading}>Vidéo complète sur cet iPhone</Text>
        <Text style={s.caption}>Un fichier MOV/HEVC enregistré sans découpage en petits clips. Il reste privé tant que vous ne choisissez pas des élèves.</Text>
        {localRecordings.map(r=><Pressable key={r.uri}
          onPress={()=>void Sharing.shareAsync(r.uri,{mimeType:"video/quicktime",UTI:"com.apple.quicktime-movie"}).catch(updateError)}
          style={[s.row,{paddingVertical:6}]}><Icon name="play-circle-outline" color={colors.wine}/>
          <Text style={s.body}>Vidéo intégrale · {Math.round(r.durationMs/60000)} min · Voir / Exporter</Text>
        </Pressable>)}
      </View>}
      {pending>0 && <Text style={s.caption}>{pending} élément(s) de transport live en attente d'envoi. Le fichier MOV intégral reste sur ton iPhone.</Text>}
      {!!error && <Text style={s.muted}>{error}</Text>}
      <Pressable accessibilityRole="button" onPress={()=>setDetails(v=>!v)} style={{minHeight:44,justifyContent:'center'}}><Text style={s.caption}>{details?'Masquer les détails':'Aide & diagnostic'}</Text></Pressable>
      {details&&<DiagnosticsPanel/>}
    </>}
  </View>;
}
