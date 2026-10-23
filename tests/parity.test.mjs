import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
const r = await build({
  stdin: {
    contents:
      "export * from './src/shared/core';export * from './src/shared/courses';export * from './src/shared/route-directory';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const core = await import(
  `data:text/javascript;base64,${Buffer.from(r.outputFiles[0].contents).toString("base64")}`
);
test("the complete pedagogical module contains the iOS 19 lessons and 58 steps", () => {
  assert.equal(core.courses.length, 19);
  assert.equal(
    core.courses.reduce((n, c) => n + c.steps.length, 0),
    58,
  );
  for (const c of core.courses) {
    assert.ok(c.objective && c.example && c.safety && c.takeaway);
    assert.ok(c.steps.every((s) => s.explanation && s.why));
  }
});
test("exam centre filtering supports accent-insensitive lookup and existing permissions payloads", () => {
  const r = {
    name: "Ville",
    examCenter: "Évry",
    difficulty: "Facile",
    categories: ["Priorité"],
    favorite: true,
  };
  assert.equal(
    core.matchesRoute(r, {
      search: "evry",
      center: "evry",
      difficulty: "Tous",
      category: "Toutes",
      favorites: true,
    }),
    true,
  );
  assert.equal(
    core.matchesRoute(r, {
      search: "",
      center: "Bobigny",
      difficulty: "Tous",
      category: "Toutes",
      favorites: false,
    }),
    false,
  );
});
test("GPS quality guards reject inaccurate points and preserve paused route segments", () => {
  const now = Date.now();
  assert.ok(
    !core.acceptFix(
      undefined,
      { latitude: 48, longitude: 2, accuracy: 500, timestamp: now },
      0,
    ).fix,
  );
  const a = { lat: 48, lng: 2, accuracy: 5, time: now, segment: 0 };
  const b = { lat: 48.1, lng: 2.1, accuracy: 5, time: now + 10000, segment: 1 };
  assert.equal(core.totalDistance([a, b]), 0);
});
test("GPX import/export roundtrips through the same parser as the native app", () => {
  const r = {
    name: "Gennevilliers",
    fixes: [
      { lat: 48, lng: 2, accuracy: 0, time: 1700000000000, segment: 0 },
      { lat: 48.001, lng: 2.001, accuracy: 0, time: 1700000010000, segment: 0 },
    ],
    points: [],
  };
  const text = core.exportGpx(r);
  const result = core.importGpx(text, "e44ddebb-8aa7-4983-8c7e-7915f739075e");
  assert.equal(result.name, r.name);
  assert.equal(result.fixes.length, 2);
  assert.equal(result.source, "gpx");
});
test("GPX entity expansion and XML injection are rejected", () => {
  assert.throws(() =>
    core.importGpx(
      '<!DOCTYPE x [<!ENTITY a "secret">]><gpx/>',
      "e44ddebb-8aa7-4983-8c7e-7915f739075e",
    ),
  );
});
test("the built browser bundle contains no database or deployment private credentials", async () => {
  const bundle = await readFile("dist/server/index.js", "utf8");
  assert.ok(!/postgres(?:ql)?:\/\/[^\s"']+:[^\s"']+@/.test(bundle));
  assert.ok(!/BEGIN (?:EC |RSA )?PRIVATE KEY/.test(bundle));
  assert.ok(!/art_v2_/.test(bundle));
  assert.ok(!/LIVEKIT_API_SECRET\s*[:=]\s*["'][^"']/.test(bundle));
});
