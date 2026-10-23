import { test } from "node:test";
import assert from "node:assert/strict";
import {
  acceptFix,
  fixSchema,
  distance,
  totalDistance,
  geometry,
  exportGpx,
  importGpx,
  routeSchema,
  heading,
  replayIndices,
  crossedPoints,
  RecordingController,
  type Fix,
  type Point,
} from "@repere/core";
const now = Date.now(),
  fix: Fix = {
    lat: 48.9,
    lng: 2.3,
    accuracy: 5,
    time: now - 10000,
    segment: 0,
  };
test("real GPS: invalid, mocked, stale, inaccurate and duplicated fixes are rejected", () => {
  const l = {
    latitude: 48.9001,
    longitude: 2.3001,
    accuracy: 5,
    timestamp: now,
  };
  assert.ok(acceptFix(fix, l, 0, now).fix);
  assert.ok(acceptFix(fix, { ...l, mocked: true }, 0, now).reason);
  assert.ok(acceptFix(fix, { ...l, accuracy: 95 }, 0, now).reason);
  assert.ok(acceptFix(fix, { ...l, latitude: 120 }, 0, now).reason);
  assert.ok(acceptFix(fix, { ...l, timestamp: now - 300000 }, 0, now).reason);
  assert.ok(acceptFix(fix, { ...l, timestamp: fix.time }, 0, now).reason);
  assert.ok(acceptFix(fix, { ...l, latitude: 49.5 }, 0, now).reason);
});
test("signal gaps start separate segments without adding a straight line or distance", () => {
  const result = acceptFix(
    fix,
    { latitude: 48.92, longitude: 2.32, accuracy: 5, timestamp: now + 15000 },
    0,
    now + 15000,
  ).fix!;
  assert.equal(result.segment, 1);
  assert.equal(totalDistance([fix, result]), 0);
  assert.equal(geometry([fix, result]).coordinates.length, 0);
});
test("pause/resume segments do not bridge pauses", () => {
  const b = { ...fix, lat: 48.9001, time: now },
    c = { ...fix, lat: 48.901, time: now + 5000, segment: 1 },
    d = { ...c, lat: 48.9011, time: now + 10000 };
  assert.ok(totalDistance([fix, b, c, d]) < 30);
  assert.equal(geometry([fix, b, c, d]).coordinates.length, 2);
});
test("GPX roundtrip preserves segments, names and manually positioned waypoints", () => {
  const p: Point = {
    id: "21111111-1111-4111-8111-111111111111",
    name: "Priorité & <angle>",
    category: "Priorité",
    lat: 48.9002,
    lng: 2.3002,
    fixIndex: 1,
    question: "",
    options: ["A", "B"],
    validated: false,
    photos: [],
  };
  const r = {
    name: "A & B <test>",
    fixes: [
      fix,
      { ...fix, lat: 48.9001, time: now },
      { ...fix, segment: 1, time: now + 10000 },
      { ...fix, segment: 1, lat: 48.9002, time: now + 20000 },
    ],
    points: [p],
  };
  const xml = exportGpx(r);
  assert.ok(xml.includes("&amp;"));
  const parsed = importGpx(
    xml,
    "11111111-1111-4111-8111-111111111111",
    now - 30000,
  );
  assert.equal(parsed.name, r.name);
  assert.equal(parsed.source, "gpx");
  assert.equal(parsed.points[0]!.name, p.name);
  assert.equal(parsed.points[0]!.lat, p.lat);
  assert.equal(geometry(parsed.fixes).coordinates.length, 2);
});
test("GPX entity declarations and malformed coordinates are rejected", () => {
  assert.throws(() =>
    importGpx("<!DOCTYPE x><gpx/>", "11111111-1111-4111-8111-111111111111"),
  );
  assert.throws(() =>
    importGpx(
      '<gpx><trk><trkseg><trkpt lat="123" lon="2"/><trkpt lat="48" lon="2"/></trkseg></trk></gpx>',
      "11111111-1111-4111-8111-111111111111",
    ),
  );
});
test("server validation rejects invented jumps even if the client bypasses its filter", () => {
  const r = {
    id: "11111111-1111-4111-8111-111111111111",
    name: "TEST ONLY",
    source: "gps",
    duration: 10,
    fixes: [fix, { ...fix, lat: 49.8, time: now }],
  };
  assert.equal(routeSchema.safeParse(r).success, false);
});
test("replay follows recorded order and pauses for every validated crossed point", () => {
  const fixes = Array.from({ length: 10 }, (_, i) => ({
    ...fix,
    lng: fix.lng + i * 0.0002,
    time: now + i * 5000,
  }));
  const ids = replayIndices(fixes);
  assert.equal(ids[0], 0);
  assert.equal(ids.at(-1), 9);
  const point = {
    id: "p",
    fixIndex: 4,
    validated: true,
    question: "Q",
  } as Point;
  assert.equal(crossedPoints([point], 1, 8, new Set())[0], point);
  assert.equal(crossedPoints([point], 1, 8, new Set(["p"])).length, 0);
  assert.ok(Math.abs(heading(fix, { ...fix, lng: 2.4 }) - 90) < 1);
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}
test("Stop returns before a pending GPS permission and discards the late activation", async () => {
  const controller = new RecordingController(),
    permission = deferred<void>();
  let stopped = false,
    closed = 0;
  const start = controller.start(
    async () => 1,
    async () => {
      await permission.promise;
      return () => {
        closed++;
      };
    },
    async () => {},
  );
  await new Promise((r) => setImmediate(r));
  await controller.stop(async () => {
    stopped = true;
  });
  assert.equal(stopped, true);
  permission.resolve();
  await start;
  assert.equal(closed, 1);
});
test("Stop during local preparation finalizes the draft without starting GPS", async () => {
  const controller = new RecordingController(),
    draft = deferred<number>();
  let activated = false,
    cancelled = false;
  const start = controller.start(
    () => draft.promise,
    async () => {
      activated = true;
      return () => {};
    },
    async () => {
      cancelled = true;
    },
  );
  await new Promise((r) => setImmediate(r));
  await controller.stop(async () => {});
  draft.resolve(1);
  await start;
  assert.equal(activated, false);
  assert.equal(cancelled, true);
});
test("Restart waits for the cancelled native subscription to close", async () => {
  const c = new RecordingController(),
    permission = deferred<void>();
  const events: string[] = [];
  const a = c.start(
    async () => 1,
    async () => {
      await permission.promise;
      return () => {
        events.push("old closed");
      };
    },
    async () => {},
  );
  await new Promise((r) => setImmediate(r));
  await c.stop(async () => {});
  const b = c.start(
    async () => 2,
    async () => {
      events.push("new activated");
      return () => {};
    },
    async () => {},
  );
  permission.resolve();
  await Promise.all([a, b]);
  assert.deepEqual(events, ["old closed", "new activated"]);
});
test("Historical GPX timestamps are preserved; untimed GPX has no invented duration or exported timestamp", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const known = importGpx(
    '<gpx><trk><trkseg><trkpt lat="48" lon="2"><time>2023-01-01T10:00:00Z</time></trkpt><trkpt lat="48.001" lon="2"><time>2023-01-01T10:02:00Z</time></trkpt></trkseg></trk></gpx>',
    id,
  );
  assert.equal(known.fixes[0]!.time, Date.parse("2023-01-01T10:00:00Z"));
  assert.equal(known.duration, 120);
  const unknown = importGpx(
    '<gpx><trk><trkseg><trkpt lat="48" lon="2"/><trkpt lat="48.001" lon="2"/></trkseg></trk></gpx>',
    id,
  );
  assert.equal(unknown.duration, 0);
  assert.equal(unknown.fixes[0]!.timeKnown, false);
  assert.equal(exportGpx(unknown).includes("<time>"), false);
});

test("fractional iOS GPS milliseconds normalize for old drafts and fresh recordings", () => {
  const input = { lat: 48.9, lng: 2.3, accuracy: 5, time: now + 0.25, segment: 0 };
  const parsed = fixSchema.parse(input);
  assert.equal(parsed.time, now);
  assert.equal(acceptFix(undefined, { latitude: input.lat, longitude: input.lng, accuracy: 5, timestamp: input.time }, 0, now).fix?.time, now);
  for (const time of [NaN, Infinity, -1, Number.MAX_SAFE_INTEGER + 1]) assert.equal(fixSchema.safeParse({...input, time}).success, false);
});
