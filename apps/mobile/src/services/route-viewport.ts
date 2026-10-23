import type { Fix } from "@repere/core";
export function routeBounds(fixes: Pick<Fix, "lat" | "lng">[]): [number, number, number, number] | null {
  if (!fixes.length) return null;
  return fixes.reduce<[number, number, number, number]>((bounds, fix) => [
    Math.min(bounds[0], fix.lng), Math.min(bounds[1], fix.lat),
    Math.max(bounds[2], fix.lng), Math.max(bounds[3], fix.lat),
  ], [Infinity, Infinity, -Infinity, -Infinity]);
}

/** Forward course over a short recorded baseline; never bridge a GPS segment break. */
export function replayBearing(fixes: Pick<Fix,"lat"|"lng"|"segment">[], index: number): number | null {
  const origin=fixes[index];if(!origin)return null;
  let a=origin,b=origin;
  for(let i=index+1;i<fixes.length&&i<=index+60;i++){
    const next=fixes[i];if(next.segment!==origin.segment)break;b=next;
    if(Math.hypot((b.lng-a.lng)*Math.cos(a.lat*Math.PI/180),b.lat-a.lat)>0.00005)break;
  }
  if(a===b||Math.hypot(b.lng-a.lng,b.lat-a.lat)<0.000001){
    b=origin;for(let i=index-1;i>=0&&i>=index-60;i--){const prev=fixes[i];if(prev.segment!==origin.segment)break;a=prev;if(Math.hypot((b.lng-a.lng)*Math.cos(a.lat*Math.PI/180),b.lat-a.lat)>0.00005)break;}
  }
  if(Math.hypot(b.lng-a.lng,b.lat-a.lat)<0.000001)return null;
  const rad=Math.PI/180,lat1=a.lat*rad,lat2=b.lat*rad,delta=(b.lng-a.lng)*rad;
  return (Math.atan2(Math.sin(delta)*Math.cos(lat2),Math.cos(lat1)*Math.sin(lat2)-Math.sin(lat1)*Math.cos(lat2)*Math.cos(delta))/rad+360)%360;
}
