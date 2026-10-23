import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { build } from "esbuild";
import { writeFile, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
const raw = new DatabaseSync(":memory:");
let queue = Promise.resolve();
function adapter() {
  return {
    execAsync: async (sql: string) => {
      raw.exec(sql);
    },
    runAsync: async (sql: string, ...params: any[]) =>
      raw.prepare(sql).run(...params),
    getFirstAsync: async (sql: string, ...params: any[]) =>
      raw.prepare(sql).get(...params) || null,
    getAllAsync: async (sql: string, ...params: any[]) =>
      raw.prepare(sql).all(...params),
    withExclusiveTransactionAsync: async (fn: (tx: any) => Promise<void>) => {
      const run = queue.then(async () => {
        raw.exec("BEGIN IMMEDIATE");
        try {
          await fn(adapter());
          raw.exec("COMMIT");
        } catch (e) {
          raw.exec("ROLLBACK");
          throw e;
        }
      });
      queue = run.catch(() => {});
      return run;
    },
  };
}
(globalThis as any).__repereTestDatabase = adapter();
const bundled = await build({
  entryPoints: ["apps/mobile/src/services/local.ts"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  plugins: [
    {
      name: "native-adapters-for-sql-tests",
      setup(build) {
        build.onResolve({ filter: /^expo-sqlite$/ }, () => ({
          path: "sqlite",
          namespace: "test",
        }));
        build.onResolve({ filter: /^expo-crypto$/ }, () => ({
          path: "crypto",
          namespace: "test",
        }));
        build.onLoad({ filter: /.*/, namespace: "test" }, (args) => ({
          contents:
            args.path === "sqlite"
              ? "export async function openDatabaseAsync(){return globalThis.__repereTestDatabase;}"
              : "export {randomUUID} from 'node:crypto';",
          loader: "js",
        }));
      },
    },
  ],
});
const temp = await mkdtemp(join(tmpdir(), "repere-sqlite-test-"));
const file = join(temp, "local.mjs");
await writeFile(file, bundled.outputFiles[0]!.text);
const local = await import(file);
mock.timers.enable({ apis: ["Date"], now: 2000000000000 });
test("SQLite survives stop before the first location, without inventing fixes", async () => {
  const r = await local.createLocal("test-A");
  await local.changeState(r.id, "finished");
  const loaded = await local.getLocal(r.id);
  assert.equal(loaded.state, "finished");
  assert.equal(loaded.fixes.length, 0);
  assert.equal(loaded.distance, 0);
});
test("SQLite persists accepted GPS fixes and excludes every point received during pause/after Stop", async () => {
  const r = await local.createLocal("test-A");
  let time = Date.now();
  await local.ingestLocations([
    { latitude: 48.9, longitude: 2.3, accuracy: 5, timestamp: time },
  ]);
  mock.timers.tick(10000);
  time = Date.now();
  await local.ingestLocations([
    { latitude: 48.9001, longitude: 2.3001, accuracy: 5, timestamp: time },
  ]);
  await local.changeState(r.id, "paused");
  mock.timers.tick(5000);
  await local.ingestLocations([
    {
      latitude: 48.9002,
      longitude: 2.3002,
      accuracy: 5,
      timestamp: Date.now(),
    },
  ]);
  let reloaded = await local.getLocal(r.id);
  assert.equal(reloaded.fixes.length, 2);
  assert.ok(reloaded.distance > 10);
  await local.changeState(r.id, "recording");
  mock.timers.tick(5000);
  await local.ingestLocations([
    { latitude: 48.901, longitude: 2.301, accuracy: 5, timestamp: Date.now() },
  ]);
  await local.changeState(r.id, "finished");
  mock.timers.tick(5000);
  await local.ingestLocations([
    {
      latitude: 48.9011,
      longitude: 2.3011,
      accuracy: 5,
      timestamp: Date.now(),
    },
  ]);
  reloaded = await local.getLocal(r.id);
  assert.equal(reloaded.fixes.length, 3);
  assert.equal(reloaded.fixes[2].segment, 1);
  assert.ok(reloaded.distance < 20);
  assert.equal(reloaded.activeMs, 15000);
});
test("Queued stale position from before Resume cannot contaminate the new segment", async () => {
  const r = await local.createLocal("test-A");
  await local.changeState(r.id, "paused");
  const old = Date.now();
  mock.timers.tick(10000);
  await local.changeState(r.id, "recording");
  await local.ingestLocations([
    { latitude: 48.9, longitude: 2.3, accuracy: 5, timestamp: old },
  ]);
  assert.equal((await local.getLocal(r.id)).fixes.length, 0);
  await local.changeState(r.id, "finished");
});
test("Rejected GPS jumps and mocked coordinates cannot move the live map marker", async () => {
  const r = await local.createLocal("test-A");
  const initial = {
    latitude: 48.9,
    longitude: 2.3,
    accuracy: 5,
    timestamp: Date.now(),
  };
  await local.ingestLocations([initial]);
  mock.timers.tick(1000);
  await local.ingestLocations([
    { ...initial, latitude: 49.9, timestamp: Date.now() },
    { ...initial, longitude: 3.3, mocked: true, timestamp: Date.now() },
  ]);
  const loaded = await local.getLocal(r.id);
  assert.equal(loaded.fixes.length, 1);
  assert.deepEqual(loaded.lastPosition, initial);
  await local.changeState(r.id, "finished");
});
test("A manual teaching point is attached to the nearest completed GPS position", () => {
  const fixes = [
    { lat: 48.9, lng: 2.3, accuracy: 5, time: 1000, segment: 0 },
    { lat: 48.901, lng: 2.301, accuracy: 5, time: 11000, segment: 0 },
  ];
  const point = { id: randomUUID(), lat: 48.901, lng: 2.301, fixIndex: 0 };
  const saved = local.routeInput({
    fixes,
    points: [point],
    activeMs: 10000,
    state: "finished",
    resumedAt: null,
  });
  assert.equal(saved.points[0].fixIndex, 1);
  assert.equal(saved.points[0].lat, point.lat);
  assert.equal(saved.points[0].lng, point.lng);
});
test("Manual tap remains at its exact map coordinate and survives database reload", async () => {
  const id = randomUUID();
  const point = {
    id,
    name: "TEST point manuel",
    category: "Observation",
    lat: 48.912345,
    lng: 2.234567,
    note: "TEST",
    status: "private",
    authorId: "test-B",
  };
  await local.upsertPoint("test-B", point);
  const read = await local.localSpots("test-B");
  assert.equal(read[0].lat, 48.912345);
  assert.equal(read[0].lng, 2.234567);
  assert.equal((await local.localSpots("test-A")).length, 0);
});
test("A sync acknowledgement cannot clear an edit made after the uploaded snapshot", async () => {
  const r = await local.createLocal("test-A");
  await local.changeState(r.id, "finished");
  const before = await local.getLocal(r.id);
  await local.updateLocal(r.id, { name: "Updated after request" });
  await local.markSynced(r.id, before.revision, 1);
  const after = await local.getLocal(r.id);
  assert.ok(after.revision > after.syncedRevision);
  assert.equal(after.name, "Updated after request");
  assert.equal(after.version, 1);
});
test("Deleting one account’s local data preserves another account’s recording and points", async () => {
  await local.clearUserData("test-A");
  assert.equal((await local.listLocal("test-A")).length, 0);
  assert.equal((await local.localSpots("test-B")).length, 1);
});
test("Deleting a server-only marker creates a durable account-scoped deletion", async () => {
  const point = {
    id: randomUUID(),
    name: "Server marker",
    lat: 48.9,
    lng: 2.3,
    category: "Priorité",
    note: "",
    status: "published",
    authorId: "delete-test",
  };
  await local.deletePoint("delete-test", point);
  const row = raw
    .prepare("SELECT user_id,dirty,deleted FROM local_points WHERE id=?")
    .get(point.id);
  assert.deepEqual(
    { ...row },
    { user_id: "delete-test", dirty: 1, deleted: 1 },
  );
  assert.equal((await local.localSpots("delete-test")).length, 0);
  await local.deletePoint("different-user", point);
  assert.equal(
    raw.prepare("SELECT user_id FROM local_points WHERE id=?").get(point.id)!
      .user_id,
    "delete-test",
  );
});
test("Deleting a route marker removes it from the assembled route and advances its revision", async () => {
  const route = await local.createLocal("delete-route-test");
  const point = {
    id: randomUUID(),
    name: "Route marker",
    lat: 48.9,
    lng: 2.3,
    category: "Priorité",
    fixIndex: 0,
    question: "",
    options: ["A", "B"],
    answer: 0,
    explanation: "",
    validated: false,
    photos: [],
  };
  await local.upsertPoint("delete-route-test", point, route.id);
  const before = await local.getLocal(route.id);
  await local.deletePoint("delete-route-test", point, route.id);
  const after = await local.getLocal(route.id);
  assert.equal(after.points.length, 0);
  assert.equal(after.revision, before.revision + 1);
});

test("legacy fractional draft uploads normalized timestamps without mutating its local points", async () => {
  const r = await local.createLocal("test-legacy-fraction");
  const fixes = [
    {lat:48.9,lng:2.3,accuracy:5,time:Date.now()-10000+0.125,segment:0},
    {lat:48.9001,lng:2.3001,accuracy:5,time:Date.now()+0.25,segment:0},
  ];
  await local.putLocalRoute("test-legacy-fraction", {...local.routeInput(r), fixes});
  const loaded = await local.getLocal(r.id);
  const wire = local.routeInput(loaded);
  assert.ok(wire.fixes.every((f:any) => Number.isInteger(f.time)));
  assert.equal(loaded.fixes[0].time, fixes[0].time);
  assert.equal(wire.fixes[0].lat, fixes[0].lat);
});
