export type DiagnosticEvent = {at:string;step:string;ok:boolean;value?:number};
// Accept explicit event names and scalar results only, never error objects, URLs,
// tokens, user identifiers, GPS coordinates or API response payloads.
const names = new Set(['association','availability','connection','camera','frames','api','livekit','catalog','videos','start','stop','callback','width','height','streetview_ms','streetview_coverage']);
export function diagnosticEvent(step:string,ok:boolean,value?:number):DiagnosticEvent {
  if(!names.has(step))throw new Error('Événement de diagnostic inconnu.');
  if(typeof ok!=='boolean')throw new Error('Résultat de diagnostic invalide.');
  return {at:new Date().toISOString(),step,ok,...(typeof value==='number'&&Number.isFinite(value)?{value}:{})};
}
export function connectionLabel(status:{registered:boolean;available:boolean;connected:boolean}|null) {
  if(!status)return 'Vérification des lunettes…';
  if(!status.registered)return 'Lunettes non associées';
  if(status.connected)return 'Lunettes associées · connectées';
  if(status.available)return 'Lunettes associées · disponibles';
  return 'Lunettes associées · connexion en attente';
}
