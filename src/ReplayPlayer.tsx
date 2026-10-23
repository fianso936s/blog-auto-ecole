import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { api } from "./shared/api";
import { geometry, type Route, type Point } from "./shared/core";
import { replayAnchor } from "./shared/street-replay";

export const STREET_ORIGIN = "https://br-fragrant-lake-b9utxdv6-spotapi.compute.c-7.eu-central-1.aws.neon.tech";
const noRecording: never[] = [];
type Mode = "map" | "street";
type Target = { lat: number; lng: number; name?: string };

export function StreetPane({request, onState, active = true}: {
  request: Record<string, unknown>;
  onState: (state: "loading" | "ready" | "error") => void;
  active?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null), generation = useRef(0),
    pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined),
    sentPaths = useRef<unknown>(undefined), state = useRef(onState);
  state.current = onState;
  const [ready, setReady] = useState(false), [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0), [retry, setRetry] = useState(0);
  const connect = () => frame.current?.contentWindow?.postMessage(JSON.stringify({type:"connect"}), STREET_ORIGIN);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== STREET_ORIGIN || event.source !== frame.current?.contentWindow) return;
      let data: any;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.type === "ready") { setReady(true); return; }
      if (data.requestId !== undefined && data.requestId !== generation.current) return;
      if (data.type === "panorama" || data.type === "unavailable") {
        clearTimeout(pending.current);
        const ok = data.type === "panorama";
        setError(ok ? "" : data.message || "Aucune vue disponible ici. Continuez sur la carte.");
        state.current(ok ? "ready" : "error");
      }
    };
    window.addEventListener("message", receive);
    return () => { window.removeEventListener("message", receive); clearTimeout(pending.current); };
  }, []);
  // A cached iframe can announce itself before the parent's listener is installed.
  // Repeat only the lightweight handshake, never a Google panorama lookup.
  useEffect(() => {
    if (!active || ready) return;
    setError(""); state.current("loading"); connect();
    const handshake = setInterval(connect, 750);
    const timeout = setTimeout(() => {
      clearInterval(handshake); setError("Street View prend trop de temps à démarrer. Réessayez."); state.current("error");
    }, 30000);
    return () => {clearInterval(handshake);clearTimeout(timeout);};
  }, [active,ready,attempt]);
  useEffect(() => {
    clearTimeout(pending.current);
    if (!active || !ready) return;
    setError(""); state.current("loading");
    const {paths, ...position} = request;
    // Send the route geometry once per iframe, not at every GPS position.
    const payload = {...position, ...(paths !== sentPaths.current ? {paths} : {}), requestId: ++generation.current};
    sentPaths.current = paths;
    frame.current?.contentWindow?.postMessage(JSON.stringify(payload), STREET_ORIGIN);
    pending.current = setTimeout(() => {
      setError("Cette vue ne répond pas. Réessayez ou continuez sur la carte."); state.current("error");
    }, 20000);
    return () => clearTimeout(pending.current);
  }, [ready,request,attempt,retry,active]);
  useEffect(() => {
    const resume = () => {if (active && document.visibilityState === "visible") setRetry(n=>n+1);};
    window.addEventListener("online",resume);
    document.addEventListener("visibilitychange",resume);
    return () => {window.removeEventListener("online",resume);document.removeEventListener("visibilitychange",resume);};
  }, [active]);
  function retryView() {
    if (ready) setRetry(n=>n+1);
    else {sentPaths.current=undefined;setAttempt(n=>n+1);}
  }
  return <div className="street-pane">
    <iframe key={attempt} ref={frame} title="Street View intégré au parcours" src={`${STREET_ORIGIN}/streetview`}
      referrerPolicy="strict-origin-when-cross-origin" allow="fullscreen" sandbox="allow-scripts allow-same-origin"
      onLoad={connect} />
    {error && <div className="player-notice" role="status"><span>{error}</span><button onClick={retryView}>Réessayer</button></div>}
  </div>;
}

export function ReplayPlayer({route, target, initialIndex = 0, initialMode = "map", autoplay = false, MapView, onClose, onPoint, onProgress, notify}: {
  route?: Route; target?: Target; initialIndex?: number; initialMode?: Mode; autoplay?: boolean;
  MapView: React.ComponentType<any>; onClose: () => void; onPoint?: (point: Point) => void;
  onProgress?: (index: number) => void; notify: (message: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null), map = useRef<any>({map:null, focus:()=>{}}),
    currentIndex = useRef(initialIndex), lastSaved = useRef(-1), saving = useRef(false), queuedSave = useRef(false),
    close = useRef(onClose), progress = useRef(onProgress), note = useRef(notify);
  close.current = onClose; progress.current = onProgress; note.current = notify;
  const [index, setIndex] = useState(Math.min(Math.max(0, initialIndex), (route?.fixes.length || 1)-1)),
    [playing, setPlaying] = useState(autoplay), [mode, setMode] = useState<Mode>(initialMode),
    [pitch, setPitch] = useState(75), [streetState, setStreetState] = useState("loading"),
    [mapReady, setMapReady] = useState(false), [streetOpened, setStreetOpened] = useState(initialMode === "street");
  const onMapReady = useCallback(() => setMapReady(true), []);
  currentIndex.current = index;
  const paths = useMemo(() => route ? geometry(route.fixes).coordinates.map(path => path.map(([lng,lat])=>({lat,lng}))) : undefined, [route]);
  const request = useMemo(() => route
    ? {type:"fix", ...replayAnchor(route.fixes,index), paths, index}
    : {type:"snapshot", kind:"point", lat:target?.lat, lng:target?.lng, heading:0, index:0}, [route, target, index, paths]);
  const activePoint = route?.points.find(p => p.fixIndex === index);
  const save = async () => {
    if (!route || lastSaved.current === currentIndex.current) return;
    if (saving.current) {queuedSave.current=true; return;}
    const at = currentIndex.current; saving.current = true;
    try {await api(`/v1/routes/${route.id}/progress`, "POST", {fixIndex:at}); lastSaved.current=at; progress.current?.(at);}
    catch(error) {note.current((error as Error).message);}
    finally {saving.current=false; if(queuedSave.current){queuedSave.current=false;void save();}}
  };
  useLayoutEffect(() => {
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const visibility = () => { if (document.hidden) {setPlaying(false); void save();} };
    document.addEventListener("visibilitychange", visibility);
    return () => { document.body.style.overflow=overflow; document.removeEventListener("visibilitychange",visibility); void save(); };
  }, []);
  useEffect(() => {
    if (!playing || !route || (mode === "map" && !mapReady) || (mode === "street" && streetState !== "ready")) return;
    const timer = setTimeout(() => {
      if (index >= route.fixes.length-1) { setPlaying(false); return; }
      if (mode === "street") setStreetState("loading");
      setIndex(i=>i+1);
    }, mode === "street" ? 1800 : 700);
    return () => clearTimeout(timer);
  }, [playing,index,mode,streetState,route,mapReady]);
  useEffect(() => { if (!playing) void save(); }, [playing]);
  useEffect(() => {
    if (!playing) return;
    const timer=setInterval(()=>void save(),10000); return ()=>clearInterval(timer);
  }, [playing]);
  useEffect(() => {
    if (mode === "street" && streetState === "error") setPlaying(false);
  }, [mode,streetState]);
  useEffect(() => {
    if (!route || mode !== "map" || !mapReady) return;
    const anchor = replayAnchor(route.fixes,index);
    if (anchor) map.current.map?.easeTo({center:[anchor.lng,anchor.lat],bearing:anchor.heading,zoom:17,pitch: pitch ? 75 : 0,duration:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650});
  }, [index,mode,pitch,mapReady]);
  function seek(value: number) {setPlaying(false);currentIndex.current=value;setIndex(value);}
  function restart() {
    seek(0);
    if (route && mapReady && mode === "map") {
      const anchor = replayAnchor(route.fixes,0);
      if (anchor) map.current.map?.easeTo({center:[anchor.lng,anchor.lat],bearing:anchor.heading,zoom:17,pitch,duration:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650});
    }
    void save();
  }
  return <dialog ref={dialog} className="route-player" aria-label={route ? `Lecture du parcours ${route.name}` : "Street View du repère"} onCancel={e=>{e.preventDefault();close.current();}}>
    <header className="player-header">
      <button className="player-back" onClick={onClose}>← Retour</button>
      <div className="player-title"><strong>{route?.name || target?.name || "Street View"}</strong><span>{route?.examCenter || "Le Repère Permis"}</span></div>
      {route && <div className="player-modes" aria-label="Affichage du parcours">
        <button aria-pressed={mode==="map"} onClick={()=>{if(mode!=="map"){setMapReady(false);setMode("map");setPlaying(false);}}}>Carte</button>
        <button aria-pressed={mode==="street"} onClick={()=>{if(mode!=="street"){setStreetState("loading");setStreetOpened(true);setMode("street");setPlaying(false);}}}>Street View</button>
      </div>}
    </header>
    <div className="player-stage">
      {mode === "map" && route ? <>
        <MapView spots={noRecording} route={route} recording={noRecording} index={index} pitch={pitch} navigationMode={!!pitch} handle={map} onReady={onMapReady} onPosition={()=>{}} onSpot={(p:Point)=>{setPlaying(false);onPoint?.(p);}} />
        <button className="player-dimension" onClick={()=>setPitch(p=>p?0:75)}>{pitch?"2D":"3D"}</button>
      </> : null}
      {streetOpened && <div className="player-street-layer" aria-hidden={mode !== "street"} data-active={mode === "street"} inert={mode !== "street"}><StreetPane request={request} onState={setStreetState} active={mode === "street"} /></div>}
      {mode === "map" && !mapReady && <div className="player-loading" role="status">Préparation de la carte…</div>}
      {activePoint && <button className="player-point" onClick={()=>{setPlaying(false);onPoint?.(activePoint);}}><span>{activePoint.category}</span><strong>{activePoint.name}</strong><span>Lire le repère →</span></button>}
    </div>
    {route && <footer className="player-controls">
      <button className="player-play" aria-label={playing?"Mettre en pause":"Lire le parcours"} onClick={()=>{if(index>=route.fixes.length-1) seek(0);setPlaying(p=>!p);}}>{playing?"Ⅱ":"▶"}</button>
      <div className="player-timeline"><label htmlFor="player-position">{mode==="street" && streetState==="loading" ? "Chargement de la vue…" : playing ? "Lecture du parcours" : "Parcours en pause"}<span>{Math.round(index/Math.max(1,route.fixes.length-1)*100)} %</span></label>
        <input id="player-position" aria-label="Position dans le parcours" type="range" min={0} max={route.fixes.length-1} value={index} onChange={e=>seek(Number(e.target.value))} onPointerUp={()=>void save()} onKeyUp={()=>void save()} />
      </div>
      <div className="player-actions"><button className="player-restart" onClick={restart}>Retour au départ</button>
      <button className="player-next" disabled={!route.points.some(p=>p.fixIndex>index)} onClick={()=>{const next=route.points.filter(p=>p.fixIndex>index).sort((a,b)=>a.fixIndex-b.fixIndex)[0];if(next)seek(next.fixIndex);}}>Repère suivant</button></div>
    </footer>}
  </dialog>;
}
