import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID, randomBytes, createHash } from "node:crypto";
process.env.NODE_ENV = "test";
const config = JSON.parse(await readFile(".learning-test-env.json", "utf8"));
if (!config.databaseUrl.includes("ep-holy-paper-b9pqkd2b-pooler."))
  throw Error("Isolated branch required");
// Fixtures use Neon's HTTP SQL transport; application requests use the deployed
// isolated function, whose normal pg transactions remain enabled.
const host = new URL(config.databaseUrl).hostname.replace("-pooler", "");
const db = {
  async query(query: string, params: unknown[] = []) {
    const r = await fetch("https://" + host + "/sql", {
      method: "POST",
      headers: {
        "Neon-Connection-String": config.databaseUrl,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, params }),
    });
    const result = (await r.json()) as any;
    if (!r.ok) throw Error(result.message || JSON.stringify(result));
    return result;
  },
  async end() {},
};
const base =
  "https://br-snowy-cake-b9yjhlqz-learningtest.compute.c-7.eu-central-1.aws.neon.tech";
const tokens: Record<string, string> = {},
  ids: Record<string, string> = {};
let checks = 0;
for (const role of ["teacher", "student", "other"]) {
  const id = randomUUID(),
    token = randomBytes(32).toString("hex");
  ids[role] = id;
  tokens[role] = token;
  await db.query("INSERT INTO users(id,email,name,role) VALUES($1,$2,$3,$4)", [
    id,
    `${id}@fixture.invalid`,
    "TEST LEARNING",
    role === "teacher" ? "teacher" : "student",
  ]);
  await db.query(
    "INSERT INTO mobile_sessions(token_hash,user_id) VALUES($1,$2)",
    [createHash("sha256").update(token).digest("hex"), id],
  );
}
async function call(
  path: string,
  role = "student",
  method = "GET",
  body?: unknown,
) {
  const r = await fetch(base + path, {
    method,
    headers: {
      authorization: "Bearer " + tokens[role],
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: r.status, body: (await r.json()) as any };
}
function eq(actual: unknown, expected: unknown, label: string) {
  assert.deepEqual(actual, expected, label);
  checks++;
  console.log("PASS " + label);
}
const routeId = randomUUID(),
  pointId = randomUUID();
const time = Date.now();
const point = {
  id: pointId,
  name: "TEST route shared",
  category: "Priorité",
  lat: 48.9,
  lng: 2.3,
  fixIndex: 0,
  question: "Qui passe ?",
  options: ["A", "B"],
  answer: 1,
  explanation: "B passe.",
  validated: true,
  shareWithStudents: true,
  photos: [],
};
const mirror = {
  id: pointId,
  authorId: ids.teacher,
  name: point.name,
  category: point.category,
  lat: point.lat,
  lng: point.lng,
  note: point.explanation,
  status: "published",
  shareWithStudents: true,
  sourceRouteId: routeId,
  photos: [],
  quiz: {
    question: point.question,
    options: point.options,
    answer: point.answer,
    explanation: point.explanation,
  },
};
let route: any = {
  id: routeId,
  version: 0,
  name: "TEST Learning route",
  description: "Synthetic fixture",
  difficulty: "Facile",
  status: "published",
  source: "gps",
  duration: 10,
  fixes: [
    { lat: 48.9, lng: 2.3, accuracy: 5, time: time - 10000, segment: 0 },
    { lat: 48.9001, lng: 2.3001, accuracy: 5, time, segment: 0 },
  ],
  points: [point],
};
try {
  eq(
    (await call("/v1/spots/" + pointId + "/save", "teacher", "POST", mirror))
      .status,
    200,
    "active unsaved route marker published",
  );
  eq(
    (await call("/v1/spots/" + pointId)).status,
    200,
    "active route marker visible to student",
  );
  let r = await call("/v1/routes/" + routeId, "teacher", "PUT", route);
  eq(r.status, 200, "route saved with shared quiz");
  r = await call("/v1/spots/" + pointId, "teacher");
  eq(r.body.quizVersion, 1, "route save preserves equivalent quiz version");
  const attempt = { pointId, attemptId: randomUUID(), answer: 1 };
  eq(
    (await call("/v1/routes/" + routeId + "/quiz", "student", "POST", attempt))
      .body.correct,
    true,
    "replay server correction",
  );
  eq(
    (await call("/v1/routes/" + routeId + "/quiz", "student", "POST", attempt))
      .status,
    200,
    "replay idempotency",
  );
  r = await call("/v1/learning/stats?spotId=" + pointId, "teacher");
  eq(r.body.totals.attempts, 1, "replay counted once in catalog stats");
  route = (await call("/v1/routes/" + routeId, "teacher")).body;
  route.points[0].shareWithStudents = false;
  eq(
    (await call("/v1/routes/" + routeId, "teacher", "PUT", route)).status,
    200,
    "route unshare saved",
  );
  eq(
    (await call("/v1/spots/" + pointId)).status,
    404,
    "unshared route marker hidden",
  );
  route = (await call("/v1/routes/" + routeId, "teacher")).body;
  eq(
    (await call("/v1/spots/" + pointId, "teacher", "DELETE")).status,
    200,
    "delete mirrored route marker",
  );
  const catalog = await call("/v1/spots?summary=1", "student");
  eq(
    catalog.body.archivedIds.includes(pointId),
    true,
    "student receives deletion for cached route marker",
  );
  eq(
    (await call("/v1/routes/" + routeId)).body.points.length,
    0,
    "deleted marker absent from route detail",
  );
  eq(
    (await call("/v1/routes/" + routeId, "teacher", "PUT", route)).status,
    200,
    "stale route sync succeeds without resurrection",
  );
  eq(
    (await call("/v1/spots/" + pointId)).status,
    404,
    "stale route did not restore deleted marker",
  );
  eq(
    (await call("/v1/learning/stats?spotId=" + pointId, "teacher")).body.totals
      .attempts,
    1,
    "deletion preserves normalized learning history",
  );
  const unsaved = { ...mirror, id: randomUUID(), sourceRouteId: randomUUID() };
  eq(
    (
      await call("/v1/spots/" + unsaved.id + "/archive", "teacher", "POST", {
        spot: unsaved,
      })
    ).status,
    200,
    "delete before first upload creates tombstone",
  );
  eq(
    (
      await call(
        "/v1/spots/" + unsaved.id + "/save",
        "teacher",
        "POST",
        unsaved,
      )
    ).status,
    409,
    "late queued creation cannot resurrect marker",
  );
  eq(
    (await call("/v1/spots/" + pointId, "teacher", "DELETE")).status,
    200,
    "repeat delete remains idempotent",
  );
  console.log(checks + " route learning integration checks passed");
} finally {
  await db.end();
}
