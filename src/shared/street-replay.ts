import type { Fix } from './index';

export type ReplayCoordinate = {lat:number;lng:number};
export type ReplayAnchor = ReplayCoordinate & {heading:number;corridor:ReplayCoordinate[]};
const radius=6371000;
const radians=(n:number)=>n*Math.PI/180;
export function validReplayCoordinate(p:ReplayCoordinate):boolean {
  return Number.isFinite(p?.lat)&&Number.isFinite(p?.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180;
}
function meters(a:ReplayCoordinate,b:ReplayCoordinate){
  const x=radians(b.lng-a.lng)*Math.cos(radians((a.lat+b.lat)/2));
  const y=radians(b.lat-a.lat);return Math.hypot(x,y)*radius;
}
function segmentDistance(p:ReplayCoordinate,a:ReplayCoordinate,b:ReplayCoordinate){
  const scale=radius*Math.PI/180,cos=Math.cos(radians(p.lat));
  const ax=(a.lng-p.lng)*scale*cos,ay=(a.lat-p.lat)*scale;
  const bx=(b.lng-p.lng)*scale*cos,by=(b.lat-p.lat)*scale;
  const dx=bx-ax,dy=by-ay;
  const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(ax+t*dx,ay+t*dy);
}
// Conservative geometry gate: never widen the search to another road.
// Google/GPS locations are estimates; ambiguous or uncovered points are skipped.
export function panoramaOnReplay(anchor:ReplayAnchor,candidate:ReplayCoordinate):boolean {
  if(!validReplayCoordinate(anchor)||!validReplayCoordinate(candidate)||meters(anchor,candidate)>10)return false;
  const path=anchor.corridor;
  if(!path.length||path.some(p=>!validReplayCoordinate(p)))return false;
  if(path.length===1)return meters(path[0]!,candidate)<=6;
  let closest=Infinity;
  for(let i=1;i<path.length;i++)closest=Math.min(closest,segmentDistance(candidate,path[i-1]!,path[i]!));
  return closest<=6;
}
export function replayAnchor(fixes:Fix[],index:number):ReplayAnchor|null {
  const fix=fixes[index];if(!fix||!validReplayCoordinate(fix))return null;
  let first=index,last=index;
  // Only the local recorded segment is eligible, even at crossings/loops/gaps.
  while(first>0&&index-first<60&&fixes[first-1]!.segment===fix.segment&&meters(fix,fixes[first-1]!)<=20&&meters(fixes[first]!,fixes[first-1]!)<=30)first--;
  while(last+1<fixes.length&&last-index<60&&fixes[last+1]!.segment===fix.segment&&meters(fix,fixes[last+1]!)<=20&&meters(fixes[last]!,fixes[last+1]!)<=30)last++;
  const target=fixes.slice(index+1,last+1).find(p=>meters(fix,p)>=3)||fixes[last]!;
  const from=target===fix?(fixes[Math.max(first,index-1)]||fix):fix;
  const to=target;
  const lat1=radians(from.lat),lat2=radians(to.lat),delta=radians(to.lng-from.lng);
  const heading=(Math.atan2(Math.sin(delta)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(delta))*180/Math.PI+360)%360;
  return {lat:fix.lat,lng:fix.lng,heading,corridor:fixes.slice(first,last+1).map(p=>({lat:p.lat,lng:p.lng}))};
}
