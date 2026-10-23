import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mergeCatalog,
  type PointChange,
} from "../../apps/mobile/src/services/catalog";
import type { MapSpot } from "@repere/core";
const spot = (id: string, name = id): MapSpot => ({
  id,
  name,
  category: "Priorité",
  lat: 48.9,
  lng: 2.3,
  note: "",
  authorId: "teacher",
  status: "published",
});
test("pending creation appears immediately and a local deletion masks a stale server snapshot", () => {
  const changes: PointChange[] = [
    {
      id: "old",
      data: JSON.stringify(spot("old")),
      deleted: 1,
      route_id: null,
    },
    {
      id: "new",
      data: JSON.stringify(spot("new")),
      deleted: 0,
      route_id: null,
    },
  ];
  assert.deepEqual(
    mergeCatalog(
      { spots: [spot("old"), spot("unchanged")] },
      changes,
    ).spots.map((p) => p.id),
    ["unchanged", "new"],
  );
});
test("server archive defeats offline edits and hides cached route copies", () => {
  const merged = mergeCatalog({ spots: [], archivedIds: ["deleted"] }, [
    {
      id: "deleted",
      data: JSON.stringify(spot("deleted", "Offline old copy")),
      deleted: 0,
      route_id: null,
    },
  ]);
  assert.equal(merged.spots.length, 0);
  assert.deepEqual(merged.archivedIds, ["deleted"]);
});
test("acknowledged deletion stays hidden while a server response is still in flight", () => {
  const merged = mergeCatalog({ spots: [spot("deleted")] }, [
    { id: "deleted", data: "{}", deleted: 1, route_id: "cached-route" },
  ]);
  assert.equal(merged.spots.length, 0);
  assert.deepEqual(merged.archivedIds, ["deleted"]);
});
