import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { unlink } from "node:fs/promises";

test("the live repère follows the driver along the route, web and iOS share it", async () => {
  const file = new URL("./.route-guide-build.mjs", import.meta.url);
  await build({entryPoints:["packages/core/src/route-guide.ts"],bundle:true,platform:"node",format:"esm",outfile:file.pathname});
  try {
    const {cumulativeDistance, upcomingPoint, positionOnRoute, guideLabel} = await import(file.href + "?test");
    // ~11 m between fixes, northwards.
    const fixes = Array.from({length: 60}, (_, i) => ({lat: 48.9 + i * 0.0001, lng: 2.28, time: i * 1000, segment: 0}));
    const along = cumulativeDistance(fixes);
    assert.equal(along[0], 0);
    assert.ok(Math.abs(along[10] - 111) < 2);
    const points = [{id: "b", name: "Giratoire", fixIndex: 40}, {id: "a", name: "Stop", fixIndex: 20}];

    const start = upcomingPoint(points, 0, along);
    assert.equal(start.point.id, "a", "the closest repère ahead comes first, whatever the list order");
    assert.equal(start.state, "ahead");
    assert.equal(upcomingPoint(points, 5, along).state, "soon");
    assert.equal(guideLabel(start), "Dans 220 m");

    assert.equal(upcomingPoint(points, 18, along).state, "here");
    assert.equal(upcomingPoint(points, 22, along).point.id, "a", "still shown just after passing it");
    assert.equal(upcomingPoint(points, 25, along).point.id, "b", "then the next one");
    assert.equal(upcomingPoint(points, 59, along), null, "none left at the end");
    assert.equal(upcomingPoint([], 0, along), null);

    assert.equal(positionOnRoute(fixes, {lat: 48.9030, lng: 2.2801}), 30);
    assert.equal(positionOnRoute(fixes, {lat: 48.95, lng: 2.35}), null, "off the route");
  } finally {
    await unlink(file).catch(() => {});
  }
});

test("the player shows every repère of the base lying on the route, not only the route's own", async () => {
  const file = new URL("./.route-guide-build2.mjs", import.meta.url);
  await build({entryPoints:["packages/core/src/route-guide.ts"],bundle:true,platform:"node",format:"esm",outfile:file.pathname});
  try {
    const {pointsAlongRoute, upcomingPoint, cumulativeDistance} = await import(file.href + "?test2");
    const fixes = Array.from({length: 60}, (_, i) => ({lat: 48.9 + i * 0.0001, lng: 2.28, time: i * 1000, segment: 0}));
    const own = [{id: "own", name: "Mon stop", fixIndex: 40, lat: 48.904, lng: 2.28}];
    const spots = [
      {id: "own", name: "Mon stop", lat: 48.904, lng: 2.28},              // same repère, not duplicated
      {id: "other", name: "Repère d'un autre parcours", lat: 48.902, lng: 2.2802}, // ~15 m off the track
      {id: "far", name: "Loin", lat: 48.902, lng: 2.29},                  // ~730 m away
    ];
    const all = pointsAlongRoute(fixes, own, spots);
    assert.deepEqual(all.map(p => p.id), ["other", "own"]);
    assert.equal(all[0].fixIndex, 20);
    assert.equal(upcomingPoint(all, 0, cumulativeDistance(fixes)).point.id, "other");
  } finally {
    await unlink(file).catch(() => {});
  }
});
