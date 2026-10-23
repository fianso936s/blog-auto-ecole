import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import {
  acceptFix,
  nearestFix,
  totalDistance,
  type Fix,
  type NativeLocation,
  type RouteInput,
  type Route,
  type Point,
  type MapSpot,
} from "@repere/core";
export type RecordingState = "recording" | "paused" | "finished";
export type LocalRoute = {
  id: string;
  userId: string;
  name: string;
  description: string;
  examCenter?: string;
  difficulty: RouteInput["difficulty"];
  status: RouteInput["status"];
  source: "gps" | "gpx";
  state: RecordingState;
  activeMs: number;
  resumedAt: number | null;
  segment: number;
  distance: number;
  version: number;
  revision: number;
  syncedRevision: number;
  error: string;
  createdAt: string;
  updatedAt: string;
  fixes: Fix[];
  points: Point[];
  lastPosition?: NativeLocation;
  background: boolean;
};
let connection: Promise<SQLite.SQLiteDatabase> | undefined;
export async function db() {
  return (connection ??= SQLite.openDatabaseAsync("repere-spot-v1.db").then(
    async (d) => {
      await d.execAsync(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS recordings(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS fixes(route_id TEXT NOT NULL REFERENCES recordings(id) ON DELETE CASCADE,seq INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(route_id,seq));
CREATE TABLE IF NOT EXISTS local_points(id TEXT PRIMARY KEY,route_id TEXT REFERENCES recordings(id) ON DELETE CASCADE,user_id TEXT NOT NULL,data TEXT NOT NULL,dirty INTEGER NOT NULL DEFAULT 1,deleted INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS route_cache(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS pedagogy_reading(user_id TEXT NOT NULL,course_id TEXT NOT NULL,has_read INTEGER NOT NULL DEFAULT 0,review INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(user_id,course_id));
CREATE TABLE IF NOT EXISTS pending_actions(id TEXT PRIMARY KEY,user_id TEXT NOT NULL,path TEXT NOT NULL,body TEXT NOT NULL);
`);
      return d;
    },
  ));
}
const parse = (row: { data: string } | null) =>
  row ? JSON.parse(row.data) : null;
const localCache = new Map<string, { serialized: string; route: LocalRoute }>();
async function assemble(
  d: Pick<SQLite.SQLiteDatabase, "getFirstAsync" | "getAllAsync">,
  id: string,
): Promise<LocalRoute | null> {
  const row = await d.getFirstAsync<{ data: string }>(
    "SELECT data FROM recordings WHERE id=?",
    id,
  );
  if (!row) {
    localCache.delete(id);
    return null;
  }
  const cached = localCache.get(id);
  if (cached?.serialized === row.data) return { ...cached.route };
  const data = parse(row);
  const fixes = await d.getAllAsync<{ data: string }>(
    "SELECT data FROM fixes WHERE route_id=? ORDER BY seq",
    id,
  );
  const points = await d.getAllAsync<{ data: string }>(
    "SELECT data FROM local_points WHERE route_id=? AND deleted=0",
    id,
  );
  const route: LocalRoute = {
    ...data,
    fixes: fixes.map((f) => parse(f)),
    points: points.map((p) => parse(p)),
  };
  localCache.set(id, { serialized: row.data, route });
  return { ...route };
}
async function storeMetadata(
  d: Pick<SQLite.SQLiteDatabase, "runAsync">,
  r: LocalRoute,
) {
  const { fixes, points, ...data } = r;
  void fixes;
  void points;
  await d.runAsync(
    "UPDATE recordings SET data=? WHERE id=?",
    JSON.stringify(data),
    r.id,
  );
}
export const getLocal = async (id: string) => assemble(await db(), id);
export async function listLocal(userId: string) {
  const d = await db(),
    rows = await d.getAllAsync<{ id: string }>(
      "SELECT id FROM recordings WHERE user_id=?",
      userId,
    );
  const result = await Promise.all(rows.map((r) => assemble(d, r.id)));
  return result.filter(Boolean) as LocalRoute[];
}
export async function createLocal(userId: string) {
  const d = await db();
  const now = Date.now();
  const r: LocalRoute = {
    id: Crypto.randomUUID(),
    userId,
    name: `Parcours du ${new Date(now).toLocaleDateString("fr-FR")}`,
    description: "",
    difficulty: "Facile",
    status: "private",
    source: "gps",
    state: "recording",
    activeMs: 0,
    resumedAt: now,
    segment: 0,
    distance: 0,
    version: 0,
    revision: 1,
    syncedRevision: 0,
    error: "En attente d’une position GPS précise…",
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    fixes: [],
    points: [],
    background: false,
  };
  const { fixes, points, ...data } = r;
  await d.runAsync(
    "INSERT INTO recordings(id,user_id,data) VALUES(?,?,?)",
    r.id,
    userId,
    JSON.stringify(data),
  );
  return r;
}
export async function ingestLocations(locations: NativeLocation[]) {
  const d = await db();
  await d.withExclusiveTransactionAsync(async (tx) => {
    const rows = await tx.getAllAsync<{ id: string; data: string }>(
      "SELECT id,data FROM recordings",
    );
    for (const row of rows) {
      const r = {
        ...JSON.parse(row.data),
        fixes: [],
        points: [],
      } as LocalRoute;
      if (r.state !== "recording") continue;
      const tail = await tx.getFirstAsync<{ seq: number; data: string }>(
        "SELECT seq,data FROM fixes WHERE route_id=? ORDER BY seq DESC LIMIT 1",
        r.id,
      );
      let seq = tail ? tail.seq + 1 : 0;
      let last: Fix | undefined = tail ? JSON.parse(tail.data) : undefined;
      for (const position of [...locations].sort(
        (a, b) => a.timestamp - b.timestamp,
      )) {
        if (r.resumedAt && position.timestamp < r.resumedAt) continue;
        const result = acceptFix(last, position, r.segment);
        if (result.fix || result.reason === "Position inchangée")
          r.lastPosition = position;
        if (result.fix) {
          r.distance +=
            last && last.segment === result.fix.segment
              ? totalDistance([last, result.fix])
              : 0;
          r.segment = result.fix.segment;
          r.revision++;
          r.error = "";
          await tx.runAsync(
            "INSERT INTO fixes(route_id,seq,data) VALUES(?,?,?)",
            r.id,
            seq++,
            JSON.stringify(result.fix),
          );
          last = result.fix;
        } else if (
          result.reason !== "Position inchangée" &&
          result.reason !== "Position déjà reçue"
        )
          r.error = result.reason || "";
      }
      r.updatedAt = new Date().toISOString();
      await storeMetadata(tx, r);
    }
  });
}
export async function changeState(id: string, state: RecordingState) {
  const d = await db();
  let output: LocalRoute | null = null;
  await d.withExclusiveTransactionAsync(async (tx) => {
    const r = await assemble(tx, id);
    if (!r) return;
    const now = Date.now();
    if (r.state === "recording" && r.resumedAt !== null)
      r.activeMs += Math.max(0, now - r.resumedAt);
    if (state === "recording" && r.state !== "recording") r.segment++;
    r.resumedAt = state === "recording" ? now : null;
    r.state = state;
    r.revision++;
    r.updatedAt = new Date(now).toISOString();
    await storeMetadata(tx, r);
    output = r;
  });
  return output;
}
export async function updateLocal(
  id: string,
  patch: Partial<
    Pick<
      LocalRoute,
      "name" | "description" | "examCenter" | "difficulty" | "status" | "error" | "background"
    >
  >,
) {
  const d = await db();
  await d.withExclusiveTransactionAsync(async (tx) => {
    const r = await assemble(tx, id);
    if (!r) return;
    Object.assign(r, patch);
    if (Object.keys(patch).some((k) => !["error", "background"].includes(k)))
      r.revision++;
    r.updatedAt = new Date().toISOString();
    await storeMetadata(tx, r);
  });
}
export function duration(r: LocalRoute, now = Date.now()) {
  return Math.max(
    0,
    Math.round(
      (r.activeMs +
        (r.state === "recording" && r.resumedAt ? now - r.resumedAt : 0)) /
        1000,
    ),
  );
}
export function routeInput(r: LocalRoute): RouteInput {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    examCenter: r.examCenter,
    difficulty: r.difficulty,
    status: r.status,
    source: r.source,
    duration: duration(r),
    fixes: r.fixes.map((fix) => ({ ...fix, time: Math.round(fix.time) })),
    points: r.points.map((point) => ({
      ...point,
      fixIndex: nearestFix(r.fixes, point),
    })),
    version: r.version,
  };
}
export async function putLocalRoute(userId: string, input: RouteInput) {
  const d = await db();
  const r: LocalRoute = {
    ...input,
    userId,
    state: "finished",
    activeMs: input.duration * 1000,
    resumedAt: null,
    segment: input.fixes.at(-1)?.segment || 0,
    distance: totalDistance(input.fixes),
    version: input.version,
    revision: 1,
    syncedRevision: 0,
    error: "",
    background: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await d.withExclusiveTransactionAsync(async (tx) => {
    const { fixes, points, ...data } = r;
    await tx.runAsync(
      "INSERT OR REPLACE INTO recordings(id,user_id,data) VALUES(?,?,?)",
      r.id,
      userId,
      JSON.stringify(data),
    );
    for (let seq = 0; seq < fixes.length; seq++)
      await tx.runAsync(
        "INSERT INTO fixes(route_id,seq,data) VALUES(?,?,?)",
        r.id,
        seq,
        JSON.stringify(fixes[seq]),
      );
    for (const p of points)
      await tx.runAsync(
        "INSERT INTO local_points(id,route_id,user_id,data) VALUES(?,?,?,?)",
        p.id,
        r.id,
        userId,
        JSON.stringify(p),
      );
  });
  return r;
}
export async function upsertPoint(
  userId: string,
  point: Point | MapSpot,
  routeId?: string,
) {
  const d = await db();
  await d.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "INSERT INTO local_points(id,route_id,user_id,data,dirty,deleted) VALUES(?,?,?,?,1,0) ON CONFLICT(id) DO UPDATE SET data=excluded.data,dirty=1,deleted=0",
      point.id,
      routeId || null,
      userId,
      JSON.stringify(point),
    );
    if (routeId) {
      const r = await assemble(tx, routeId);
      if (r) {
        r.revision++;
        await storeMetadata(tx, r);
      }
    }
  });
}
export async function deletePoint(
  userId: string,
  point: Point | MapSpot,
  routeId?: string,
) {
  const d = await db();
  await d.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync(
      "INSERT INTO local_points(id,route_id,user_id,data,dirty,deleted) VALUES(?,?,?,?,1,1) ON CONFLICT(id) DO UPDATE SET deleted=1,dirty=1 WHERE local_points.user_id=excluded.user_id",
      point.id,
      routeId || null,
      userId,
      JSON.stringify(point),
    );
    if (routeId) {
      const r = await assemble(tx, routeId);
      if (r) {
        r.revision++;
        await storeMetadata(tx, r);
      }
    }
  });
}
export async function localSpots(userId: string) {
  const rows = await (
    await db()
  ).getAllAsync<{ data: string }>(
    "SELECT data FROM local_points WHERE user_id=? AND route_id IS NULL AND deleted=0",
    userId,
  );
  return rows.map((r) => parse(r)) as MapSpot[];
}
export async function markSynced(
  id: string,
  revision: number,
  version: number,
) {
  const d = await db();
  await d.withExclusiveTransactionAsync(async (tx) => {
    const r = await assemble(tx, id);
    if (r) {
      r.syncedRevision = Math.max(r.syncedRevision, revision);
      r.version = version;
      r.error = "";
      await storeMetadata(tx, r);
    }
  });
}
export async function removeLocal(id: string) {
  await (await db()).runAsync("DELETE FROM recordings WHERE id=?", id);
}
export async function cacheRoute(userId: string, r: Route) {
  await (
    await db()
  ).runAsync(
    "INSERT INTO route_cache(id,user_id,data) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET user_id=excluded.user_id,data=excluded.data",
    r.id,
    userId,
    JSON.stringify(r),
  );
}
export async function clearUserData(userId: string) {
  const d = await db();
  await d.withExclusiveTransactionAsync(async (tx) => {
    await tx.runAsync("DELETE FROM recordings WHERE user_id=?", userId);
    await tx.runAsync("DELETE FROM local_points WHERE user_id=?", userId);
    await tx.runAsync("DELETE FROM route_cache WHERE user_id=?", userId);
    await tx.runAsync("DELETE FROM pending_actions WHERE user_id=?", userId);
    await tx.runAsync("DELETE FROM pedagogy_reading WHERE user_id=?", userId);
  });
}
export async function pendingAction(
  userId: string,
  path: string,
  body: unknown,
  id = Crypto.randomUUID(),
) {
  await (
    await db()
  ).runAsync(
    "INSERT OR IGNORE INTO pending_actions(id,user_id,path,body) VALUES(?,?,?,?)",
    id,
    userId,
    path,
    JSON.stringify(body),
  );
  return id;
}
