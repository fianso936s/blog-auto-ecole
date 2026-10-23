import { test } from "node:test";
import assert from "node:assert/strict";
import type { RouteSummary } from "../../packages/core/src/index";
import {
  directoryCenters,
  matchesRoute,
} from "../../apps/mobile/src/services/route-directory";
const route = (name: string, examCenter?: string): RouteSummary =>
  ({
    name,
    examCenter,
    difficulty: "Facile",
    categories: ["Priorité"],
    favorite: true,
  }) as RouteSummary;
test("Un centre saisi avec des accents ou une casse différente reste un seul choix", () => {
  const catalog = [
    route("Parcours A", " Créteil "),
    route("Parcours B", "CRETEIL"),
    route("Parcours C"),
  ];
  assert.deepEqual(directoryCenters(catalog), ["Créteil", "À classer"]);
  const filters = {
    search: "parcours",
    center: "CRETEIL",
    difficulty: "Facile",
    category: "Priorité",
    favorites: true,
  };
  assert.deepEqual(
    catalog.filter((r) => matchesRoute(r, filters)).map((r) => r.name),
    ["Parcours A", "Parcours B"],
  );
  assert.equal(
    matchesRoute(catalog[0]!, { ...filters, category: "Giratoire" }),
    false,
  );
});
test("Un parcours sans centre reste retrouvable dans À classer", () => {
  const filters = {
    search: "",
    center: "À classer",
    difficulty: "Tous",
    category: "Toutes",
    favorites: false,
  };
  assert.equal(matchesRoute(route("Ancien parcours"), filters), true);
  assert.equal(matchesRoute(route("Autre centre", "Nanterre"), filters), false);
});
