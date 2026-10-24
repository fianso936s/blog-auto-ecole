import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { api } from "./shared/api";
import { geometry, cumulativeDistance, upcomingPoint, guideLabel, type Route, type Point } from "./shared/core";
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
    [pitch, setPitch] = useState(80), [overview,setOverview] = useState(false), [zoom,setZoom] = useState(18), [streetState, setStreetState] = useState("loading"),
    [mapReady, setMapReady] = useState(false), [streetOpened, setStreetOpened] = useState(initialMode === "street");
  const onMapReady = useCallback(() => setMapReady(true), []);
  currentIndex.current = index;
  const paths = useMemo(() => route ? geometry(route.fixes).coordinates.map(path => path.map(([lng,lat])=>({lat,lng}))) : undefined, [route]);
  const request = useMemo(() => route
    ? {type:"fix", ...replayAnchor(route.fixes,index), paths, index}
    : {type:"snapshot", kind:"point", lat:target?.lat, lng:target?.lng, heading:0, index:0}, [route, target, index, paths]);
  const along = useMemo(() => route ? cumulativeDistance(route.fixes) : [], [route?.id, route?.version]);
  // Live repère: the one reached or the next one ahead, with its distance along the route.
  const guide = useMemo(() => route ? upcomingPoint(route.points, index, along) : null, [route, index, along]);
  const overviewRef = useRef(false); overviewRef.current = overview;
  const minZoom = 10, maxZoom = 22;
  function zoomBy(delta: number) {
    const m = map.current.map;
    if (overview) { m?.easeTo({zoom: Math.max(minZoom, Math.min(maxZoom, m.getZoom() + delta)), duration: 250}); return; }
    setZoom(z => Math.max(minZoom, Math.min(maxZoom, z + delta)));
  }
  // A pinch, the wheel or the map's own +/− keeps its zoom while following, even during playback:
  // the camera never moves while a finger is on the map, then keeps the zoom the driver chose.
  const touching = useRef(false), userZoom = useRef(zoom);
  userZoom.current = zoom;
  useEffect(() => {
    const m = map.current.map;
    if (!mapReady || typeof m?.on !== "function") return;
    const live = (e: any) => { if (e.originalEvent && !overviewRef.current) userZoom.current = Math.max(minZoom, Math.min(maxZoom, m.getZoom())); };
    const keep = (e: any) => { if (e.originalEvent && !overviewRef.current) setZoom(Math.max(minZoom, Math.min(maxZoom, Math.round(m.getZoom() * 4) / 4))); };
    const down = () => { touching.current = true; };
    const up = (e: any) => { if (!e.originalEvent?.touches?.length) { touching.current = false; keep({originalEvent: true}); } };
    m.on("zoom", live); m.on("zoomend", keep);
    m.on("touchstart", down); m.on("touchend", up); m.on("touchcancel", up);
    return () => { m.off("zoom", live); m.off("zoomend", keep); m.off("touchstart", down); m.off("touchend", up); m.off("touchcancel", up); };
  }, [mapReady]);
  // Free exploration: Google's own Street View with its arrows, from the current place on the route.
  const [explore, setExplore] = useState(false);
  const freePosition = useMemo(() => {
    const r = request as { lat?: number; lng?: number; heading?: number };
    const lat = Number(r.lat), lng = Number(r.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng, heading: Number(r.heading) || 0 } : null;
  }, [request]);
  useEffect(() => { if (mode !== "street") setExplore(false); }, [mode]);
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
    if (!route || mode !== "map" || !mapReady || overview) return;
    const anchor = replayAnchor(route.fixes,index);
    if (anchor && !touching.current) map.current.map?.easeTo({center:[anchor.lng,anchor.lat],bearing:anchor.heading,zoom:userZoom.current,pitch: pitch ? 80 : 0,duration:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650});
  }, [index,mode,pitch,mapReady,overview,zoom]);
  useEffect(()=>{if(!route||!mapReady||mode!=="map"||!overview)return;map.current.focus(route.fixes);map.current.map?.easeTo({pitch:0,bearing:0,duration:650});},[overview,mapReady,mode,route?.id]);
  function seek(value: number) {setPlaying(false);currentIndex.current=value;setIndex(value);}
  function restart() {
    seek(0);
    if (route && mapReady && mode === "map") {
      const anchor = replayAnchor(route.fixes,0);
      if (anchor) map.current.map?.easeTo({center:[anchor.lng,anchor.lat],bearing:anchor.heading,zoom,pitch: pitch ? 80 : 0,duration:window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650});
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
        <MapView spots={noRecording} route={route} recording={noRecording} index={index} pitch={overview?0:pitch} navigationMode={!overview && !!pitch} previewMode={overview} highlightId={guide?.point.id} handle={map} onReady={onMapReady} onPosition={()=>{}} onSpot={(p:Point)=>{setPlaying(false);onPoint?.(p);}} />
        <div className="player-dimension" role="group" aria-label="Vue du parcours" style={{display:"flex",gap:6,alignItems:"center"}}>
          <button aria-pressed={!overview&&!!pitch} onClick={()=>{setOverview(false);setPitch(80);}}>3D</button>
          <button aria-pressed={!overview&&!pitch} onClick={()=>{setOverview(false);setPitch(0);}}>2D</button>
          <button aria-pressed={overview} onClick={()=>{if(overview)setOverview(false);else{setOverview(true);setPlaying(false);}}}>{overview ? "← Quitter l’aperçu" : "Aperçu"}</button>
          <button aria-label="Zoom arrière" onClick={()=>zoomBy(-1)}>−</button>
          <button aria-label="Zoom avant" onClick={()=>zoomBy(1)}>+</button>
        </div>
      </> : null}
      {mode === "street" && explore && freePosition && <div className="player-explore">
        <iframe key={`${freePosition.lat},${freePosition.lng}`} title="Street View libre : flèches pour avancer, reculer et tourner" allowFullScreen
          src={`https://www.google.com/maps?layer=c&cbll=${freePosition.lat},${freePosition.lng}&cbp=11,${Math.round(freePosition.heading)},0,0,0&output=svembed`} />
      </div>}
      {mode === "street" && freePosition && <button className={`player-explore-toggle ${explore ? "active" : ""}`} onClick={()=>{setPlaying(false);setExplore(v=>!v);}}>{explore ? "← Revenir au parcours" : "Explorer librement"}</button>}
      {streetOpened && <div className="player-street-layer" aria-hidden={mode !== "street"} data-active={mode === "street"} inert={mode !== "street"}><StreetPane request={request} onState={setStreetState} active={mode === "street"} /></div>}
      {mode === "map" && !mapReady && <div className="player-loading" role="status">Préparation de la carte…</div>}
      {guide && !explore && <button className="player-point" data-state={guide.state} aria-live="polite" onClick={()=>{setPlaying(false);onPoint?.(guide.point);}}>
        <span className="guide-badge">{guide.point.category}</span>
        <span className="guide-text"><small>{guide.state === "here" ? "Repère" : "Prochain repère"} · {guideLabel(guide)}</small><strong>{guide.point.name}</strong></span>
        <span className="guide-open">Lire →</span>
      </button>}
    </div>
    {route && <footer className="player-controls">
      <button className="player-play" aria-label={playing?"Mettre en pause":"Lire le parcours"} onClick={()=>{if(overview){setOverview(false);setPitch(80);}if(index>=route.fixes.length-1) seek(0);setPlaying(p=>!p);}}>{playing?"Ⅱ":"▶"}</button>
      <div className="player-timeline"><label htmlFor="player-position">{mode==="street" && streetState==="loading" ? "Chargement de la vue…" : playing ? "Lecture du parcours" : "Parcours en pause"}<span>{Math.round(index/Math.max(1,route.fixes.length-1)*100)} %</span></label>
        <input id="player-position" aria-label="Position dans le parcours" type="range" min={0} max={route.fixes.length-1} value={index} onChange={e=>seek(Number(e.target.value))} onPointerUp={()=>void save()} onKeyUp={()=>void save()} />
      </div>
      <div className="player-actions"><button className="player-restart" onClick={restart}>Retour au départ</button>
      <button className="player-next" disabled={!route.points.some(p=>p.fixIndex>index)} onClick={()=>{const next=route.points.filter(p=>p.fixIndex>index).sort((a,b)=>a.fixIndex-b.fixIndex)[0];if(next)seek(next.fixIndex);}}>Repère suivant</button></div>
    </footer>}
  </dialog>;
}
