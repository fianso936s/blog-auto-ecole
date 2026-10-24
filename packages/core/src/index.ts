import { z } from "zod";
import { XMLParser, XMLValidator } from "fast-xml-parser";
export const categories = [
  "Intersection",
  "Priorité",
  "Giratoire",
  "Placement",
  "Manœuvre",
  "Vitesse",
  "Observation",
  "Autre",
] as const;
export const difficulties = ["Facile", "Intermédiaire", "Avancé"] as const;
export type Role = "student" | "teacher" | "admin";
export type Profile = { id: string; email: string; name: string; role: Role };
export const fixSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  accuracy: z.number().finite().min(0).max(100000),
  time: z.number().finite().positive().max(Number.MAX_SAFE_INTEGER).transform(Math.round).pipe(z.number().int().positive()),
  segment: z.number().int().nonnegative(),
  timeKnown: z.boolean().optional(),
});
export type Fix = z.infer<typeof fixSchema>;
export const photoSchema = z.object({
  id: z.uuid(),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  caption: z.string().trim().max(300).optional(),
  dataUrl: z
    .string()
    .max(1_400_000)
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
});
export const pointSchema = z.object({
  shareWithStudents: z.boolean().optional(),
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  category: z.enum(categories),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  fixIndex: z.number().int().min(0),
  question: z.string().trim().max(1000).default(""),
  options: z
    .array(z.string().trim().min(1).max(300))
    .min(2)
    .max(6)
    .default(["Oui", "Non"]),
  answer: z.number().int().min(0).max(5).optional(),
  explanation: z.string().trim().max(3000).optional(),
  validated: z.boolean().default(false),
  photos: z.array(photoSchema).max(6).default([]),
});
export type Point = z.infer<typeof pointSchema>;
export const routeSchema = z
  .object({
    id: z.uuid(),
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(3000).default(""),
    examCenter: z.string().trim().max(100).optional(),
    difficulty: z.enum(difficulties).default("Facile"),
    status: z.enum(["private", "published"]).default("private"),
    source: z.enum(["gps", "gpx"]),
    duration: z.number().int().min(0).max(864000),
    fixes: z.array(fixSchema).min(2).max(50000),
    points: z.array(pointSchema).max(300).default([]),
    version: z.number().int().nonnegative().default(0),
  })
  .superRefine((r, c) => {
    let prev: Fix | undefined;
    for (const f of r.fixes) {
      if (prev && (f.time <= prev.time || f.segment < prev.segment))
        c.addIssue({ code: "custom", message: "Chronologie GPS invalide" });
      if (r.source === "gps" && f.accuracy > 60)
        c.addIssue({ code: "custom", message: "Précision GPS insuffisante" });
      if (
        r.source === "gps" &&
        prev &&
        prev.segment === f.segment &&
        (f.time - prev.time > 20000 ||
          distance(prev, f) / ((f.time - prev.time) / 1000) > 55)
      )
        c.addIssue({ code: "custom", message: "Segment GPS incohérent" });
      prev = f;
    }
    for (const p of r.points) {
      if (p.fixIndex >= r.fixes.length)
        c.addIssue({ code: "custom", message: "Point hors du parcours" });
      if (
        p.validated &&
        (!p.question ||
          p.answer === undefined ||
          p.answer >= p.options.length ||
          !p.explanation)
      )
        c.addIssue({ code: "custom", message: "Quiz validé incomplet" });
    }
    if (new Set(r.points.map((p) => p.id)).size !== r.points.length)
      c.addIssue({ code: "custom", message: "Points dupliqués" });
  });
export type RouteInput = z.infer<typeof routeSchema>;
export type Route = RouteInput & {
  authorId: string;
  authorName: string;
  createdAt: string;
  distance: number;
  favorite: boolean;
  progress: number;
  updatedAt: string;
};
export type RouteSummary = Omit<Route, "fixes" | "points"> & {
  pointCount: number;
  categories: string[];
};
export const spotQuizSchema = z
  .object({
    question: z.string().trim().min(1).max(1000),
    options: z.array(z.string().trim().min(1).max(300)).min(2).max(6),
    answer: z.number().int().min(0).max(5).optional(),
    explanation: z.string().trim().max(3000).optional(),
  })
  .superRefine((q, c) => {
    if (q.answer !== undefined && q.answer >= q.options.length)
      c.addIssue({
        code: "custom",
        message: "La bonne réponse doit figurer dans la liste.",
      });
    if (
      new Set(q.options.map((o) => o.toLocaleLowerCase("fr"))).size !==
      q.options.length
    )
      c.addIssue({
        code: "custom",
        message: "Chaque réponse doit être différente.",
      });
  });
export type SpotQuiz = z.infer<typeof spotQuizSchema>;
export const spotSchema = z.object({
  quiz: spotQuizSchema.nullable().optional(),
  quizVersion: z.number().int().nonnegative().optional(),
  photoCount: z.number().int().nonnegative().optional(),
  sourceRouteId: z.uuid().optional(),
  id: z.uuid(),
  name: z.string().trim().min(1).max(120),
  category: z.enum(categories),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  note: z.string().trim().max(3000).default(""),
  photos: z.array(photoSchema).max(6).optional(),
  shareWithStudents: z.boolean().optional(),
  status: z.enum(["private", "published"]).default("private"),
});
export type MapSpot = z.infer<typeof spotSchema> & { authorId: string };
export function distance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const rad = Math.PI / 180,
    dlat = (b.lat - a.lat) * rad,
    dlng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dlng / 2) ** 2;
  return (
    6371000 *
    2 *
    Math.atan2(Math.sqrt(Math.min(1, h)), Math.sqrt(Math.max(0, 1 - h)))
  );
}
export function totalDistance(fixes: Fix[]) {
  return fixes.reduce(
    (s, f, i) =>
      s +
      (i && f.segment === fixes[i - 1]!.segment
        ? distance(fixes[i - 1]!, f)
        : 0),
    0,
  );
}
export function geometry(fixes: Fix[]) {
  const lines: number[][][] = [];
  let seg = -1;
  for (const f of fixes) {
    if (f.segment !== seg) {
      lines.push([]);
      seg = f.segment;
    }
    lines.at(-1)!.push([f.lng, f.lat]);
  }
  return {
    type: "MultiLineString" as const,
    coordinates: lines.filter((l) => l.length >= 2),
  };
}
export function heading(a: Fix, b: Fix) {
  const r = Math.PI / 180,
    dl = (b.lng - a.lng) * r;
  return (
    ((Math.atan2(
      Math.sin(dl) * Math.cos(b.lat * r),
      Math.cos(a.lat * r) * Math.sin(b.lat * r) -
        Math.sin(a.lat * r) * Math.cos(b.lat * r) * Math.cos(dl),
    ) *
      180) /
      Math.PI +
      360) %
    360
  );
}
export type NativeLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  mocked?: boolean;
};
export function acceptFix(
  last: Fix | undefined,
  location: NativeLocation,
  segment: number,
  now = Date.now(),
): { fix?: Fix; reason?: string } {
  const { latitude: lat, longitude: lng, accuracy } = location;
  const time = Math.round(location.timestamp);
  if (location.mocked) return { reason: "Position simulée refusée" };
  if (
    ![lat, lng, time].every(Number.isFinite) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180 ||
    time <= 0
  )
    return { reason: "Coordonnées invalides" };
  if (
    accuracy === null ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 60
  )
    return { reason: "Précision GPS insuffisante" };
  if (time > now + 5000 || now - time > 120000)
    return { reason: "Position GPS trop ancienne" };
  if (last && time <= last.time) return { reason: "Position déjà reçue" };
  const gap = last ? time - last.time : 0;
  if (
    last &&
    last.segment === segment &&
    gap <= 20000 &&
    distance(last, { lat, lng }) / (gap / 1000) > 55
  )
    return { reason: "Saut GPS ignoré" };
  if (
    last &&
    distance(last, { lat, lng }) <
      Math.max(2, Math.min(accuracy, last.accuracy) / 3) &&
    gap < 10000
  )
    return { reason: "Position inchangée" };
  return {
    fix: {
      lat,
      lng,
      accuracy,
      time,
      segment:
        last && gap > 20000 ? Math.max(segment, last.segment + 1) : segment,
    },
  };
}
export function nearestFix(
  fixes: Fix[],
  coordinate: { lat: number; lng: number },
) {
  let index = 0,
    min = Infinity;
  fixes.forEach((f, i) => {
    const d = distance(f, coordinate);
    if (d < min) {
      index = i;
      min = d;
    }
  });
  return index;
}
export function replayIndices(fixes: Fix[], stepMeters = 12) {
  const indices: number[] = [];
  let previous: Fix | undefined;
  for (let i = 0; i < fixes.length; i++) {
    const f = fixes[i]!;
    if (
      !previous ||
      f.segment !== previous.segment ||
      distance(previous, f) >= stepMeters ||
      i === fixes.length - 1
    ) {
      indices.push(i);
      previous = f;
    }
  }
  return indices;
}
export function crossedPoints(
  points: Point[],
  from: number,
  to: number,
  seen: Set<string>,
) {
  return points
    .filter(
      (p) =>
        p.validated &&
        p.question &&
        p.fixIndex > from &&
        p.fixIndex <= to &&
        !seen.has(p.id),
    )
    .sort((a, b) => a.fixIndex - b.fixIndex);
}
const escape = (s: string) =>
  s.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
export function exportGpx(r: Pick<RouteInput, "name" | "fixes" | "points">) {
  let segment = -1;
  let trk = "";
  for (const f of r.fixes) {
    if (segment !== f.segment) {
      if (segment >= 0) trk += "</trkseg>";
      trk += "<trkseg>";
      segment = f.segment;
    }
    trk += `<trkpt lat="${f.lat}" lon="${f.lng}">${f.timeKnown === false ? "" : `<time>${new Date(f.time).toISOString()}</time>`}</trkpt>`;
  }
  if (segment >= 0) trk += "</trkseg>";
  return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="LE REPERE SPOT" xmlns="http://www.topografix.com/GPX/1/1">${r.points.map((p) => `<wpt lat="${p.lat}" lon="${p.lng}"><name>${escape(p.name)}</name><type>${escape(p.category)}</type></wpt>`).join("")}<trk><name>${escape(r.name)}</name>${trk}</trk></gpx>`;
}
export function importGpx(
  xml: string,
  id: string,
  now = Date.now(),
): RouteInput {
  if (
    xml.length > 8_000_000 ||
    /<!DOCTYPE|<!ENTITY/i.test(xml) ||
    XMLValidator.validate(xml) !== true
  )
    throw new Error("Fichier GPX invalide");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    removeNSPrefix: true,
    processEntities: true,
  });
  const doc = parser.parse(xml);
  if (!doc.gpx) throw new Error("Ce fichier ne contient pas de GPX");
  const array = (v: any): any[] =>
    v === undefined ? [] : Array.isArray(v) ? v : [v];
  const fixes: Fix[] = [];
  let segment = 0;
  let time: number | undefined;
  for (const trk of array(doc.gpx.trk))
    for (const seg of array(trk.trkseg)) {
      for (const p of array(seg.trkpt)) {
        const parsed = Date.parse(String(p.time));
        const timeKnown =
          Number.isFinite(parsed) &&
          parsed > 0 &&
          (time === undefined || parsed > time);
        time = timeKnown ? parsed : (time ?? now) + 1;
        fixes.push({
          lat: Number(p.lat),
          lng: Number(p.lon),
          accuracy: 0,
          time,
          timeKnown,
          segment,
        });
      }
      segment++;
    }
  if (!fixes.length)
    for (const rte of array(doc.gpx.rte)) {
      for (const p of array(rte.rtept))
        fixes.push({
          lat: Number(p.lat),
          lng: Number(p.lon),
          accuracy: 0,
          time: (time = (time ?? now) + 1),
          timeKnown: false,
          segment,
        });
      segment++;
    }
  // GPX is explicitly an import; never label these coordinates as a device recording.
  const points: Point[] = array(doc.gpx.wpt)
    .slice(0, 300)
    .map((p, i) => ({
      id: uuidFrom(id, i),
      name: String(p.name || "Point importé"),
      category: categories.includes(p.type) ? p.type : "Autre",
      lat: Number(p.lat),
      lng: Number(p.lon),
      fixIndex: nearestFix(fixes, { lat: Number(p.lat), lng: Number(p.lon) }),
      question: "",
      options: ["Oui", "Non"],
      validated: false,
      photos: [],
    }));
  return routeSchema.parse({
    id,
    name: String(array(doc.gpx.trk)[0]?.name || "Parcours importé"),
    source: "gpx",
    duration: fixes.some((f) => f.timeKnown === false)
      ? 0
      : Math.max(
          0,
          Math.round(
            ((fixes.at(-1)?.time || now) - (fixes[0]?.time || now)) / 1000,
          ),
        ),
    fixes,
    points,
  });
}
function uuidFrom(base: string, n: number) {
  return base.slice(0, 24) + n.toString(16).padStart(12, "0");
}
export function canEdit(role: Role, own: boolean) {
  return role === "admin" || (role === "teacher" && own);
}
export function formatDuration(seconds: number) {
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    Math.floor(seconds) % 60,
  ]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
export function routeDuration(r: { source: string; duration: number }) {
  return r.source === "gpx" && r.duration === 0
    ? "durée non renseignée"
    : formatDuration(r.duration);
}
export function formatDistance(m: number) {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
}
export { RecordingController } from "./controller";
export {replayAnchor,panoramaOnReplay,validReplayCoordinate,type ReplayAnchor,type ReplayCoordinate} from './street-replay';

export {
  quizFingerprint,
  publicQuiz,
  canReadSpot,
  csvCell,
  type LearningCounts,
  type LearningStats,
} from "./learning";
export {cumulativeDistance,upcomingPoint,positionOnRoute,guideLabel,GUIDE_HERE_METERS,GUIDE_SOON_METERS,type RouteGuide,type GuideState} from "./route-guide";
