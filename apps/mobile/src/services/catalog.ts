import type { MapSpot } from "@repere/core";

export type Catalog = { spots: MapSpot[]; archivedIds?: string[] };
export type PointChange = {
  id: string;
  data: string;
  deleted: number;
  route_id: string | null;
};

/** Local deletions stay hidden until and after acknowledgement; server archives win. */
export function mergeCatalog(remote: Catalog, changes: PointChange[]) {
  const archived = new Set(remote.archivedIds || []);
  const hidden = new Set([
    ...archived,
    ...changes.filter((p) => p.deleted).map((p) => p.id),
  ]);
  const pending = new Map(
    changes.filter((p) => p.route_id === null).map((p) => [p.id, p]),
  );
  return {
    spots: [
      ...remote.spots.filter((p) => !hidden.has(p.id) && !pending.has(p.id)),
      ...[...pending.values()]
        .filter((p) => !hidden.has(p.id) && !p.deleted)
        .map((p) => JSON.parse(p.data) as MapSpot),
    ],
    archivedIds: [...hidden],
  };
}
