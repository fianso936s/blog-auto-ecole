import { test } from "node:test";
import assert from "node:assert/strict";
import { replayAnchor, panoramaOnReplay, type Fix } from "@repere/core";
import {
  createStreetReplay,
  type StreetRequest,
  type StreetPanorama,
} from "../../apps/api/src/streetview-controller";
const p = (east: number, north = 0, segment = 0): Fix => ({
  lat: 48.9 + north / 111195,
  lng: 2.3 + east / (111195 * Math.cos((48.9 * Math.PI) / 180)),
  accuracy: 5,
  time: 1700000000000 + east * 1000,
  segment,
});
const route = Array.from({ length: 21 }, (_, i) => p(i * 5));
const anchor = () => replayAnchor(route, 10)!;
test("accept a panorama on the recorded road and reject a nearby parallel road", () => {
  assert.equal(panoramaOnReplay(anchor(), p(51, 2)), true);
  assert.equal(panoramaOnReplay(anchor(), p(50, 7)), false);
  assert.equal(panoramaOnReplay(anchor(), p(80, 0)), false);
  assert.equal(panoramaOnReplay(anchor(), { lat: NaN, lng: 2.3 }), false);
});
test("a crossing street is rejected away from the actual local turn", () => {
  const a = replayAnchor([p(-20), p(-10), p(0), p(0, 10), p(0, 20)], 2)!;
  assert.ok(a.heading < 5 || a.heading > 355);
  assert.equal(panoramaOnReplay(a, p(8, 0)), false);
  assert.equal(panoramaOnReplay(a, p(0, 5)), true);
});
test("never draw a corridor across GPS segment breaks or long missing sections", () => {
  const fixes = [p(0), p(5), p(10, 0, 1), p(15, 0, 1)];
  const a = replayAnchor(fixes, 1)!;
  assert.equal(a.corridor.length, 2);
  assert.equal(panoramaOnReplay(a, p(15, 0)), false);
  assert.equal(replayAnchor([p(0), p(100)], 0)!.corridor.length, 1);
  assert.equal(replayAnchor([], 0), null);
});
test("geometry gate uses the current recorded leg, not another leg of a loop", () => {
  const fixes = [p(0), p(10), p(20), p(20, 15), p(10, 15), p(0, 15)];
  const a = replayAnchor(fixes, 1)!;
  assert.equal(panoramaOnReplay(a, p(10, 8)), false);
});
function fixture(find: (r: StreetRequest) => Promise<StreetPanorama | null>) {
  const sent: Record<string, unknown>[] = [],
    shown: string[] = [],
    visited: number[] = [];
  const replay = createStreetReplay({
    find: find as any,
    route: (d) => visited.push(d.index),
    hide() {},
    show: async (d) => {
      shown.push(d.id);
    },
    send: (d) => sent.push(d),
  });
  return { replay, sent, shown, visited };
}
const request = (id: number, index = 10): StreetRequest => ({
  ...anchor(),
  index,
  requestId: id,
});
test("off-route imagery is never shown; a missing frame reports coverage without inventing a detour", async () => {
  const f = fixture(async () => ({ id: "wrong-road", position: p(50, 9) }));
  await f.replay.move(request(1));
  assert.deepEqual(f.shown, []);
  assert.equal(f.sent[0]?.reason, "coverage");
  assert.deepEqual(f.visited, [10]);
});
test("stale panorama responses cannot replace a newer recorded position", async () => {
  const resolvers: ((v: StreetPanorama) => void)[] = [];
  const f = fixture(() => new Promise((resolve) => resolvers.push(resolve)));
  const one = f.replay.move(request(1));
  const two = f.replay.move(request(2, 11));
  resolvers[1]!({ id: "current", position: p(50) });
  await two;
  resolvers[0]!({ id: "stale", position: p(50) });
  await one;
  assert.deepEqual(f.shown, ["current"]);
  assert.deepEqual(
    f.sent.map((d) => d.requestId),
    [2],
  );
});
test("cancel hides the player and discards an in-flight response", async () => {
  let finish!: (v: StreetPanorama) => void;
  const f = fixture(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const task = f.replay.move(request(1));
  f.replay.cancel();
  finish({ id: "late", position: p(50) });
  await task;
  assert.deepEqual(f.shown, []);
  assert.deepEqual(f.sent, []);
});
test("render failure and service failure pause rather than claiming a valid panorama", async () => {
  const f = fixture(async () => {
    throw Error("service error");
  });
  await f.replay.move(request(4));
  assert.equal(f.sent[0]?.reason, "service");
  assert.deepEqual(f.shown, []);
  const g = createStreetReplay({
    find: async () => ({ id: "view", position: p(50) }),
    route() {},
    hide() {},
    show: async () => {
      throw Error("no tiles");
    },
    send: (d) => f.sent.push(d),
  });
  await g.move(request(5));
  assert.equal(f.sent[1]?.reason, "service");
});
test("invalid requests never query Google or move the marker", async () => {
  const f = fixture(async () => {
    throw Error("should not query");
  });
  await f.replay.move({ ...request(1), lat: Infinity });
  assert.deepEqual(f.sent, []);
  assert.deepEqual(f.visited, []);
});

test("Street View page keeps the restricted-key referrer scoped to this page and disables caching", async () => {
  const { createApp } = await import("../../apps/api/src/index");
  const { pool } = await import("../../apps/api/src/db");
  const app = createApp();
  const result = await app.request("https://repere.example/streetview");
  assert.equal(result.status, 200);
  assert.equal(
    result.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.equal(result.headers.get("cache-control"), "no-store");
  const legal = await app.request("https://repere.example/privacy");
  assert.equal(legal.headers.get("referrer-policy"), "no-referrer");
  await pool.end();
});

test("accepted image stays visible during the next lookup, rejected coverage hides it", async () => {
  let finish!: (value: StreetPanorama | null) => void;
  let hidden = 0;
  const replay = createStreetReplay({
    find: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    route() {},
    hide() {
      hidden++;
    },
    show: async () => {},
    send() {},
  });
  const one = replay.move(request(1));
  assert.equal(hidden, 0, "starting a query must not blank the panorama");
  finish({ id: "accepted", position: p(50) });
  await one;
  const two = replay.move(request(2));
  assert.equal(hidden, 0, "hold last accepted frame while resolving");
  finish({ id: "other-road", position: p(50, 9) });
  await two;
  assert.equal(hidden, 1, "coverage gate still removes a rejected frame");
});
test("replay cadence includes time spent loading without overlapping requests", async () => {
  const { replayDelay } =
    await import("../../apps/mobile/src/services/replay-clock");
  assert.equal(replayDelay(1, 0), 1500);
  assert.equal(replayDelay(1, 1000), 500);
  assert.equal(replayDelay(1, 3000), 200);
  assert.equal(replayDelay(2, 300), 450);
  assert.equal(replayDelay(0.5, 1000), 2000);
});
