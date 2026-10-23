import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
const config = JSON.parse(await readFile(".test-runtime.json", "utf8"));
let checks = 0;
const id = randomUUID();
const token = config.accounts.teacher.token;
const base = config.baseUrl;
async function call(path, method = "GET", body, headers = {}) {
  const r = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(45000),
  });
  return { status: r.status, body: await r.json() };
}
function check(a, b, label) {
  assert.deepEqual(a, b, label);
  checks++;
  console.log("PASS " + label);
}
const payload = {
  id,
  name: "TEST ISOLÉ synchronisation",
  source: "gpx",
  duration: 0,
  version: 0,
  fixes: [
    {
      lat: 48.9,
      lng: 2.3,
      accuracy: 0,
      time: 1000,
      segment: 0,
      timeKnown: false,
    },
    {
      lat: 48.9001,
      lng: 2.3001,
      accuracy: 0,
      time: 1001,
      segment: 0,
      timeKnown: false,
    },
  ],
  points: [],
};
const key = id + ":1";
try {
  const first = await call("/v1/routes/" + id, "PUT", payload, {
    "Idempotency-Key": key,
  });
  check(first.status, 200, "Initial snapshot saved");
  check(
    first.body.fixes[0].timeKnown,
    false,
    "Unknown GPX time survives PostgreSQL roundtrip",
  );
  check(first.body.duration, 0, "Unknown recording duration remains unknown");
  const retry = await call("/v1/routes/" + id, "PUT", payload, {
    "Idempotency-Key": key,
  });
  check(retry.status, 200, "Lost-response retry succeeds with same snapshot");
  check(
    retry.body.version,
    first.body.version,
    "Retry does not create another version",
  );
  const conflict = await call(
    "/v1/routes/" + id,
    "PUT",
    { ...payload, name: "Different edit" },
    { "Idempotency-Key": key },
  );
  check(
    conflict.status,
    409,
    "Different edit cannot reuse acknowledged snapshot key",
  );
  const proxy = await fetch(base + "/api/auth/get-session", {
    signal: AbortSignal.timeout(45000),
  });
  check(proxy.status, 200, "Same-origin managed auth proxy responds");
  const page = await fetch(base + "/auth?request=" + randomUUID(), {
    signal: AbortSignal.timeout(45000),
  });
  const html = await page.text();
  check(
    html.includes('data-auth-url="' + base + '/api/auth"'),
    true,
    "Browser form uses first-party cookie origin",
  );
  await writeFile(
    "docs/sync-regression-result.json",
    JSON.stringify(
      { date: new Date().toISOString(), checks, passed: true },
      null,
      2,
    ),
  );
} finally {
  await call("/v1/routes/" + id, "DELETE");
}
