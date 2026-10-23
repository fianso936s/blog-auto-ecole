// Synthetic fixtures are restricted to the dedicated native beta branch and deleted afterwards.
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
const config = JSON.parse(await readFile(".test-runtime.json", "utf8"));
if (
  config.branch !== "br-fragrant-lake-b9utxdv6" ||
  !config.baseUrl.includes(config.branch)
)
  throw Error(
    "Dedicated beta branch required. Never run these fixtures on main.",
  );
const { accounts, baseUrl } = config;
let checks = 0;
async function call(
  path: string,
  role: string | null = null,
  method = "GET",
  body?: unknown,
  headers: Record<string, string> = {},
) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(role
        ? { Authorization: `Bearer ${accounts[role].token}` }
        : { ...{} }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });
  return { status: response.status, body: await response.json() };
}
function check(actual: unknown, expected: unknown, label: string) {
  assert.deepEqual(actual, expected, label);
  checks++;
  console.log(`PASS ${label}`);
}
const routeId = randomUUID(),
  pointId = randomUUID(),
  spotId = randomUUID();
let duplicateId: string | null = null;
const now = Date.now(),
  input = {
    id: routeId,
    version: 0,
    name: "TEST ISOLÉ — pas un parcours réel",
    description: "Fixture technique supprimée après vérification.",
    difficulty: "Facile",
    status: "private",
    source: "gps",
    duration: 10,
    fixes: [
      { lat: 48.9, lng: 2.3, accuracy: 5, time: now - 10000, segment: 0 },
      { lat: 48.9001, lng: 2.3001, accuracy: 5, time: now, segment: 0 },
    ],
    points: [
      {
        id: pointId,
        name: "TEST Point",
        category: "Priorité",
        lat: 48.9002,
        lng: 2.3002,
        fixIndex: 1,
        question: "TEST : bonne réponse ?",
        options: ["A", "B"],
        answer: 1,
        explanation: "TEST : explication validée.",
        validated: true,
        photos: [
          {
            id: randomUUID(),
            dataUrl:
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJngAAAAASUVORK5CYII=",
          },
        ],
      },
    ],
  };
try {
  check(
    (await call("/health")).body.ok,
    true,
    "Deployed API connects to real Neon",
  );
  check(
    (await call("/v1/routes")).status,
    401,
    "Unauthenticated requests denied",
  );
  check(
    (await call(`/v1/routes/${routeId}`, "student", "PUT", input)).status,
    403,
    "Student cannot record server routes",
  );
  const saved = await call(`/v1/routes/${routeId}`, "teacher", "PUT", input);
  if (saved.status !== 200) console.log(saved.body);
  check(saved.status, 200, "Teacher route saved in real Neon");
  let route = saved.body;
  check(route.fixes.length, 2, "GPS fixes persist");
  check(route.points[0].lat, 48.9002, "Manual map tap keeps exact latitude");
  check(route.points[0].photos.length, 1, "Point photograph persists");
  check(route.version, 1, "Server version assigned");
  check(
    route.distance > 10 && route.distance < 20,
    true,
    "Server recomputes distance",
  );
  check(
    (await call(`/v1/routes/${routeId}`, "student")).status,
    404,
    "Private route hidden from unassigned student",
  );
  check(
    (await call(`/v1/routes/${routeId}`, "other")).status,
    404,
    "Private route hidden from other teacher",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/assignments`, "teacher", "PUT", {
        students: [accounts.student.id],
      })
    ).status,
    403,
    "Unlinked student assignment denied",
  );
  const invitation = await call("/v1/invitations", "teacher", "POST");
  check(invitation.status, 201, "Teacher invitation created");
  check(
    (
      await call("/v1/invitations/claim", "student", "POST", {
        code: invitation.body.code,
      })
    ).status,
    200,
    "Student can accept invitation",
  );
  check(
    (
      await call("/v1/invitations/claim", "student", "POST", {
        code: invitation.body.code,
      })
    ).status,
    400,
    "Invitation is single use",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/assignments`, "teacher", "PUT", {
        students: [accounts.student.id],
      })
    ).status,
    200,
    "Linked student assignment saved",
  );
  const read = await call(`/v1/routes/${routeId}`, "student");
  check(read.status, 200, "Assigned student reads route");
  check("answer" in read.body.points[0], false, "Correct quiz answer hidden");
  check(
    "explanation" in read.body.points[0],
    false,
    "Teacher explanation hidden before attempt",
  );
  const attemptId = randomUUID(),
    answer = await call(`/v1/routes/${routeId}/quiz`, "student", "POST", {
      attemptId,
      pointId,
      answer: 1,
    });
  check(answer.body.correct, true, "Quiz graded on server");
  check(
    answer.body.explanation,
    input.points[0].explanation,
    "Validated explanation returned",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/quiz`, "student", "POST", {
        attemptId,
        pointId,
        answer: 1,
      })
    ).status,
    200,
    "Quiz retry is idempotent",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/quiz`, "other", "POST", {
        attemptId: randomUUID(),
        pointId,
        answer: 1,
      })
    ).status,
    404,
    "Unauthorized quiz denied",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/progress`, "student", "POST", {
        fixIndex: 1,
      })
    ).status,
    200,
    "Progress saved",
  );
  check(
    (await call(`/v1/routes/${routeId}`, "student")).body.progress,
    1,
    "Progress restored on next request",
  );
  const stats = await call("/v1/progress", "student");
  check(stats.body.progress[0].attempts, 1, "Retry did not duplicate attempt");
  check(
    (await call(`/v1/routes/${routeId}`, "teacher", "PUT", input)).status,
    409,
    "Stale version rejected without overwriting",
  );
  const hostile = {
    ...input,
    id: randomUUID(),
    points: [],
    fixes: [input.fixes[0], { ...input.fixes[1], lat: 49.9 }],
  };
  check(
    (await call(`/v1/routes/${hostile.id}`, "teacher", "PUT", hostile)).status,
    400,
    "Outlier GPS rejected by server",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/assignments`, "teacher", "PUT", {
        students: [],
      })
    ).status,
    200,
    "Assignment removed",
  );
  check(
    (await call(`/v1/routes/${routeId}`, "student")).status,
    404,
    "Revoked student access denied immediately",
  );
  route = { ...route, status: "published" };
  const published = await call(
    `/v1/routes/${routeId}`,
    "teacher",
    "PUT",
    route,
  );
  check(published.status, 200, "Teacher publishes route");
  route = published.body;
  check(
    (await call(`/v1/routes/${routeId}`, "student")).status,
    200,
    "Published route accessible",
  );
  check(
    (
      await call(`/v1/routes/${routeId}/favorite`, "student", "POST", {
        active: true,
      })
    ).status,
    200,
    "Favorite saved",
  );
  check(
    (await call(`/v1/routes/${routeId}`, "student")).body.favorite,
    true,
    "Favorite restored",
  );
  const duplicate = await call(
    `/v1/routes/${routeId}/duplicate`,
    "teacher",
    "POST",
  );
  check(duplicate.status, 201, "Route duplication works");
  duplicateId = duplicate.body.id;
  check(duplicate.body.status, "private", "Duplicate is private");
  check(
    duplicate.body.points[0].id !== pointId,
    true,
    "Duplicate has independent points",
  );
  const spot = {
    id: spotId,
    name: "TEST ISOLÉ repère libre",
    category: "Observation",
    lat: 48.91,
    lng: 2.29,
    note: "Fixture",
    status: "private",
  };
  check(
    (await call(`/v1/spots/${spotId}`, "teacher", "PUT", spot)).status,
    200,
    "Independent map tap saved without route",
  );
  check(
    (await call("/v1/spots", "student")).body.spots.some(
      (s: any) => s.id === spotId,
    ),
    false,
    "Private point hidden",
  );
  check(
    (await call(`/v1/spots/${spotId}`, "student", "PUT", spot)).status,
    403,
    "Student cannot edit independent point",
  );
  check(
    (
      await call(`/v1/routes/${routeId}`, "teacher", "PUT", {
        ...route,
        status: "private",
      })
    ).status,
    200,
    "Teacher returns route to private",
  );
  check(
    (await call("/v1/me", "admin")).body.role,
    "admin",
    "Administrator session is read from database",
  );
  check(
    (await call("/v1/logout", "other", "POST")).status,
    200,
    "Logout revokes native session",
  );
  check((await call("/v1/me", "other")).status, 401, "Revoked session denied");
  check(
    (await call(`/v1/routes/${routeId}`, "teacher")).body.fixes.length,
    2,
    "Route stays accessible after independent API requests",
  );
  console.log(
    `Integration passed: ${checks} checks against deployed API / isolated Neon branch.`,
  );
  await writeFile(
    "docs/integration-result.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        branch: config.branch,
        checks,
        passed: true,
      },
      null,
      2,
    ),
  );
} finally {
  if (duplicateId) await call(`/v1/routes/${duplicateId}`, "teacher", "DELETE");
  await call(`/v1/routes/${routeId}`, "teacher", "DELETE");
  await call(`/v1/spots/${spotId}`, "teacher", "DELETE");
}
