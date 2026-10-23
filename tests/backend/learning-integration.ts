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
const id = randomUUID(),
  photoId = randomUUID(),
  path = "/v1/spots/" + id;
let spot: any = {
  id,
  authorId: ids.teacher,
  name: "TEST Quiz partagé",
  category: "Priorité",
  lat: 48.9,
  lng: 2.3,
  note: "Correction cachée",
  status: "published",
  shareWithStudents: true,
  photos: [
    {
      id: photoId,
      dataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJngAAAAASUVORK5CYII=",
    },
  ],
  quiz: {
    question: "Qui passe ?",
    options: ["A", "B"],
    answer: 1,
    explanation: "B est prioritaire.",
  },
};
try {
  eq(
    (await call(path, "student", "PUT", spot)).status,
    403,
    "student cannot publish",
  );
  let r = await call(path, "teacher", "PUT", spot);
  eq(r.status, 200, "teacher creates global quiz");
  spot = r.body;
  eq(spot.quizVersion, 1, "initial immutable version");
  r = await call(path, "other");
  eq(r.status, 200, "unlinked student can read global marker");
  eq(r.body.photos.length, 1, "detail contains photos");
  eq(r.body.quiz.answer, undefined, "correct answer hidden");
  eq(r.body.note, "", "correction hidden");
  r = await call("/v1/spots?summary=1");
  eq(
    r.body.spots.find((s: any) => s.id === id).photos.length,
    0,
    "catalog excludes photo payload",
  );
  const eventId = randomUUID();
  for (let i = 0; i < 2; i++)
    eq(
      (
        await call(path + "/activity", "student", "POST", {
          eventId,
          kind: "opened",
        })
      ).status,
      200,
      "idempotent opening",
    );
  eq(
    (
      await call(path + "/activity", "student", "POST", {
        eventId: randomUUID(),
        kind: "photo_viewed",
        photoId: randomUUID(),
      })
    ).status,
    400,
    "unknown photo rejected",
  );
  eq(
    (
      await call(path + "/activity", "student", "POST", {
        eventId: randomUUID(),
        kind: "photo_viewed",
        photoId,
      })
    ).status,
    200,
    "photo view recorded",
  );
  const first = { attemptId: randomUUID(), version: 1, answer: 0 };
  eq(
    (await call(path + "/quiz", "student", "POST", first)).body.correct,
    false,
    "server grades wrong answer",
  );
  eq(
    (
      await call(path + "/quiz", "student", "POST", {
        attemptId: randomUUID(),
        version: 1,
        answer: 1,
      })
    ).body.correct,
    true,
    "retry graded",
  );
  eq(
    (await call(path + "/quiz", "student", "POST", { ...first, answer: 1 }))
      .status,
    409,
    "attempt identifier cannot change",
  );
  r = await call("/v1/learning/stats?spotId=" + id, "teacher");
  eq(r.status, 200, "stats query executes");
  eq(
    r.body.totals,
    {
      views: 1,
      photoViews: 1,
      attempts: 2,
      firstAttempts: 1,
      firstCorrect: 0,
      students: 1,
    },
    "first answer distinct from retry",
  );
  spot.quiz = { ...spot.quiz, answer: 0, explanation: "Nouvelle correction." };
  r = await call(path, "teacher", "PUT", spot);
  eq(r.body.quizVersion, 2, "edit creates new version");
  spot = r.body;
  eq(
    (await call(path + "/quiz", "student", "POST", first)).body.answer,
    1,
    "historical retry preserves old correction",
  );
  eq(
    (
      await call(path + "/quiz", "student", "POST", {
        attemptId: randomUUID(),
        version: 1,
        answer: 0,
      })
    ).status,
    409,
    "new stale attempt rejected",
  );
  eq(
    (await call("/v1/learning/stats?studentId=" + ids.other)).status,
    403,
    "student cannot read another history",
  );
  eq(
    (await call("/v1/learning/stats?spotId=" + id, "other")).body.totals
      .attempts,
    0,
    "other student sees no results",
  );
  eq(
    (
      await call(path, "teacher", "PUT", {
        ...spot,
        status: "private",
        shareWithStudents: false,
      })
    ).status,
    200,
    "unshare",
  );
  eq((await call(path)).status, 404, "private marker inaccessible");
  eq((await call(path, "teacher", "DELETE")).status, 200, "archive");
  r = await call("/v1/learning/stats?spotId=" + id, "teacher");
  eq(r.body.totals.attempts, 2, "archive retains history");
  eq(r.body.spots[0].archived, true, "archive identified");
  console.log(`${checks} learning integration checks passed`);
} finally {
  await db.end();
}
