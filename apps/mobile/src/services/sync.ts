import { request, getToken } from "./auth";
import {
  listLocal,
  routeInput,
  markSynced,
  updateLocal,
  db,
  cacheRoute,
  type LocalRoute,
} from "./local";
import type { Route } from "@repere/core";
let syncPromise: Promise<{ saved: number; errors: string[] }> | undefined;
let syncOwner: string | undefined;
export async function syncAll(userId: string) {
  if (syncPromise) {
    if(syncOwner !== userId) throw new Error("La synchronisation précédente se termine. Réessayez dans un instant.");
    return syncPromise;
  }
  syncOwner=userId;
  syncPromise = performSync(userId).finally(() => {
    syncPromise = undefined;
    syncOwner=undefined;
  });
  return syncPromise;
}
async function performSync(userId: string) {
  const token = getToken();
  if (!token) throw new Error("Reconnectez-vous avant la synchronisation.");
  const headers = { Authorization: `Bearer ${token}` };
  let saved = 0;
  const errors: string[] = [];
  const routes = await listLocal(userId);
  for (const r of routes) {
    if (
      r.state !== "finished" ||
      r.fixes.length < 2 ||
      r.revision === r.syncedRevision
    )
      continue;
    try {
      const result = await request<Route>(`/v1/routes/${r.id}`, {
        method: "PUT",
        headers: { ...headers, "Idempotency-Key": `${r.id}:${r.revision}` },
        body: JSON.stringify(routeInput(r)),
      });
      await markSynced(r.id, r.revision, result.version);
      await cacheRoute(userId, result);
      saved++;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Synchronisation en attente.";
      await updateLocal(r.id, { error: message });
      errors.push(message);
    }
  }
  const database = await db();
  const spots = await database.getAllAsync<{
    id: string;
    data: string;
    deleted: number;
  }>(
    "SELECT id,data,deleted FROM local_points WHERE user_id=? AND route_id IS NULL AND dirty=1",
    userId,
  );
  for (const spot of spots) {
    try {
      await request(`/v1/spots/${spot.id}`, {
        method: spot.deleted ? "DELETE" : "PUT",
        headers,
        ...(spot.deleted ? {} : { body: spot.data }),
      });
      await database.runAsync(
        "UPDATE local_points SET dirty=0 WHERE id=? AND data=? AND deleted=?",
        spot.id,
        spot.data,
        spot.deleted,
      );
      saved++;
    } catch (e) {
      errors.push(
        e instanceof Error
          ? e.message
          : "Repère en attente de synchronisation.",
      );
    }
  }
  const actions = await database.getAllAsync<{
    id: string;
    path: string;
    body: string;
  }>("SELECT * FROM pending_actions WHERE user_id=? ORDER BY rowid", userId);
  for (const action of actions) {
    try {
      await request(action.path, { method: "POST", body: action.body, headers });
      await database.runAsync(
        "DELETE FROM pending_actions WHERE id=?",
        action.id,
      );
      saved++;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Progression en attente.");
    }
  }
  return { saved, errors };
}
export function localSummary(r: LocalRoute) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    examCenter: r.examCenter,
    difficulty: r.difficulty,
    status: r.status,
    source: r.source,
    duration: Math.floor(r.activeMs / 1000),
    distance: r.distance,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    authorId: r.userId,
    authorName: "Vous",
    version: r.version,
    favorite: false,
    progress: 0,
    pointCount: r.points.length,
    categories: [...new Set(r.points.map((p) => p.category))],
  };
}
