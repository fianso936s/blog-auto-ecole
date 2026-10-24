import {useId,useRef,useState} from 'react';
export function videoTime(seconds:number) {
  const value=Math.max(0,Math.floor(Number.isFinite(seconds)?seconds:0));
  const hours=Math.floor(value/3600),minutes=Math.floor(value/60)%60;
  return `${hours?hours+':':''}${hours?String(minutes).padStart(2,'0'):minutes}:${String(value%60).padStart(2,'0')}`;
}
/** `renew` returns a fresh signed link: playback links expire, a long lesson resumes where it stopped. */
export function VideoPlayer({src,onError,renew}:{src:string;onError:()=>void;renew?:()=>Promise<string>}) {
  const video=useRef<HTMLVideoElement>(null),id=useId();
  const [current,setCurrent]=useState(src),renewals=useRef(0),resume=useRef<{at:number;play:boolean}|null>(null);
  const failed=async()=>{
    const el=video.current;
    if(!renew||renewals.current>=3){onError();return;}
    renewals.current++;
    resume.current={at:el&&Number.isFinite(el.currentTime)?el.currentTime:0,play:!!el&&!el.paused};
    try{setCurrent(await renew());}catch{onError();}
  };
  const loaded=()=>{
    const el=video.current,r=resume.current;
    if(el&&r){resume.current=null;try{el.currentTime=r.at;}catch{}if(r.play)void el.play().catch(()=>{});}
    sync();
  };
  const [duration,setDuration]=useState(0),[position,setPosition]=useState(0);
  const sync=()=>{
    const el=video.current;if(!el)return;
    const end=Number.isFinite(el.duration)&&el.duration>0?el.duration:el.seekable.length?el.seekable.end(el.seekable.length-1):0;
    setDuration(end);setPosition(Number.isFinite(el.currentTime)?el.currentTime:0);
  };
  const seek=(seconds:number)=>{
    const el=video.current;if(!el||!duration)return;
    try {el.currentTime=Math.max(0,Math.min(duration,seconds));setPosition(el.currentTime);}
    catch {sync();}
  };
  return <div className="recorded-video">
    <video ref={video} className="video-player" src={current} controls autoPlay playsInline preload="metadata" controlsList="nodownload"
      onLoadedMetadata={loaded} onPlaying={()=>{renewals.current=0;}} onDurationChange={sync} onTimeUpdate={sync} onProgress={sync} onEmptied={()=>{setDuration(0);setPosition(0);}} onError={()=>void failed()}/>
    <div className="video-seek">
      <label htmlFor={id}>Position dans la vidéo <span>{videoTime(position)} / {duration?videoTime(duration):'—:—'}</span></label>
      <input id={id} type="range" min={0} max={duration||1} step={0.1} value={Math.min(position,duration||0)} disabled={!duration}
        aria-label="Position dans la vidéo" aria-valuetext={`${videoTime(position)} sur ${videoTime(duration)}`} onChange={e=>seek(Number(e.target.value))}/>
      <div className="video-seek-actions">
        <button className="btn secondary" type="button" disabled={!duration} onClick={()=>{video.current?.pause();seek(0);}}>Retour au début</button>
        <button className="btn secondary" type="button" disabled={!duration} aria-label="Reculer de 10 secondes" onClick={()=>seek(position-10)}>−10 s</button>
        <button className="btn secondary" type="button" disabled={!duration} aria-label="Avancer de 10 secondes" onClick={()=>seek(position+10)}>+10 s</button>
      </div>
    </div>
  </div>;
}
