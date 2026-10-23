import { test } from "node:test";
import assert from "node:assert/strict";
import { discoverPoints } from "../../apps/mobile/src/services/discovery";
import type { MapSpot } from "@repere/core";
const spot = (
  id: string,
  name: string,
  category: MapSpot["category"] = "Priorité",
): MapSpot => ({
  id,
  name,
  category,
  lat: 48.9,
  lng: 2.3,
  note: "Attention à droite",
  status: "private",
  authorId: "teacher",
});
test("discovery combines category and accent-insensitive multiword search", () => {
  const spots = [
    spot("a", "École Voltaire"),
    spot("b", "École Voltaire", "Giratoire"),
    spot("c", "Gare"),
  ];
  assert.deepEqual(
    discoverPoints(spots, [], "  ECOLE droite ", "Priorité").map((p) => p.id),
    ["a"],
  );
  assert.equal(discoverPoints(spots, [], "introuvable").length, 0);
  assert.equal(discoverPoints(spots, [], "", "Tous").length, 3);
});
test("newer route point replaces the same map id before filtering without changing inputs", () => {
  const spots = [spot("a", "Ancien nom")];
  const points = [spot("a", "Nouveau nom", "Manœuvre")];
  assert.deepEqual(
    discoverPoints(spots, points, "nouveau", "Manœuvre"),
    points,
  );
  assert.equal(discoverPoints(spots, points, "ancien").length, 0);
  assert.equal(spots[0].name, "Ancien nom");
});
