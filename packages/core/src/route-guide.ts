import type { Fix } from "./index";

// Local copy: importing values from ./index would create a runtime cycle.
function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const rad = Math.PI / 180, dlat = (b.lat - a.lat) * rad, dlng = (b.lng - a.lng) * rad;
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dlng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)));
}
function nearestFix(fixes: Fix[], c: { lat: number; lng: number }) {
  let index = 0, min = Infinity;
  fixes.forEach((f, i) => { const d = distance(f, c); if (d < min) { index = i; min = d; } });
  return index;
}

/** Distance travelled along the route at each fix, in metres (segment breaks count as a straight line). */
export function cumulativeDistance(fixes: Fix[]): number[] {
  const out: number[] = new Array(fixes.length);
  let total = 0;
  for (let i = 0; i < fixes.length; i++) {
    if (i) total += distance(fixes[i - 1]!, fixes[i]!);
    out[i] = total;
  }
  return out;
}

export type GuideState = "here" | "soon" | "ahead";
export type RouteGuide<P> = { point: P; meters: number; state: GuideState };

/** Below this distance the repère is announced as reached. */
export const GUIDE_HERE_METERS = 40;
/** Below this distance the repère is announced as close. */
export const GUIDE_SOON_METERS = 200;
/** A repère stays shown this far after it has been passed. */
const GUIDE_KEEP_AFTER_METERS = 30;

/**
 * The repère the driver should have in mind now: the one just reached (kept
 * a few metres after passing it) or the next one ahead on the route.
 */
export function upcomingPoint<P extends { fixIndex: number }>(
  points: P[],
  index: number,
  along: number[],
): RouteGuide<P> | null {
  if (!points.length || !along.length) return null;
  const at = Math.max(0, Math.min(along.length - 1, index));
  const here = along[at]!;
  const sorted = [...points]
    .filter((p) => p.fixIndex >= 0 && p.fixIndex < along.length)
    .sort((a, b) => a.fixIndex - b.fixIndex);
  for (const point of sorted) {
    const meters = along[point.fixIndex]! - here;
    if (meters < -GUIDE_KEEP_AFTER_METERS) continue;
    const ahead = Math.max(0, meters);
    return {
      point,
      meters: ahead,
      state: ahead <= GUIDE_HERE_METERS ? "here" : ahead <= GUIDE_SOON_METERS ? "soon" : "ahead",
    };
  }
  return null;
}

/** Live GPS: where the driver is on the route, or null when too far from it. */
export function positionOnRoute(
  fixes: Fix[],
  position: { lat: number; lng: number },
  maxMeters = 150,
): number | null {
  if (!fixes.length) return null;
  const index = nearestFix(fixes, position);
  return distance(fixes[index]!, position) <= maxMeters ? index : null;
}

export function guideLabel(guide: { meters: number; state: GuideState }) {
  if (guide.state === "here") return "Vous y êtes";
  const m = guide.meters;
  return `Dans ${m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`}`;
}

/** The teacher's comment on a repère: a spot's note, or a route repère's text. */
export function pointComment(p: { note?: string; question?: string; explanation?: string }) {
  return (p.note || p.question || p.explanation || "").trim();
}
