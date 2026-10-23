import React,{useCallback,useEffect,useState} from 'react';
import {api} from './shared/api';
export function MetaConnection(){
 const [state,setState]=useState<any>(null),[error,setError]=useState('');
 const refresh=useCallback(async()=>{try{setState(await api('/v1/meta/device'));setError('');}catch(e){setError((e as Error).message);}},[]);
 useEffect(()=>{void refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')void refresh();},5000);return()=>clearInterval(timer);},[refresh]);
 const device=state?.device;
 return <section className="meta-connection" aria-label="Connexion lunettes Meta"><div><span className="eyebrow">LUNETTES META</span><h2>Ton iPhone diffuse. Le site reçoit.</h2><p>Ouvre Le Repère Permis sur l’iPhone connecté aux lunettes, avec le même compte enseignant. Choisis la source Meta et les élèves, puis lance le direct.</p></div>
 <p className="meta-device-status" role="status">{!state?'Vérification de la liaison…':!state.online?'En attente de l’app iPhone. Ouvre la rubrique Vidéos dans l’app.':!device.modulePresent?'Le module Meta manque dans cette version iOS. Installe une version compilée avec le module natif.':!device.registered?'App iPhone connectée · autorise la connexion dans Meta AI.':!device.connected?'Module Meta présent · lunettes non connectées.':device.framesRecent?'Lunettes connectées · images reçues sur l’iPhone.':'Lunettes connectées · prêtes pour la capture.'}</p>
 {error&&<p className="error" role="alert">{error}</p>}
 <div className="row wrap"><a className="btn" href="reperespot://meta-live">Ouvrir l’app iPhone</a><button className="btn secondary" onClick={()=>void refresh()}>Vérifier la connexion</button></div><p className="caption">Le module caméra Meta s’exécute dans l’app iPhone. Une fois le direct lancé, il apparaît dans la vidéothèque des élèves autorisés. Ouvrir ce direct sur le site permet de le regarder sans reprendre la caméra.</p></section>;
}
