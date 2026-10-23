import { readFile, writeFile } from "node:fs/promises";
import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
const cfg = JSON.parse(await readFile(".test-runtime.json", "utf8")),
  fixture = JSON.parse(await readFile(".auth-proxy-runtime.json", "utf8"));
let checks = 0;
const verifier = randomBytes(32).toString("base64url"),
  challenge = createHash("sha256").update(verifier).digest("base64url");
async function call(path, body, token, method = "POST") {
  const r = await fetch(cfg.baseUrl + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
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
const start = await call("/v1/auth/start", { challenge });
const authorize = await call(
  "/v1/auth/authorize",
  { request: start.body.request },
  fixture.token,
);
assert.equal(authorize.status, 200);
const code = new URL(authorize.body.redirect).searchParams.get("code");
const exchange = await call("/v1/auth/exchange", { code, verifier });
assert.equal(exchange.status, 200);
const token = exchange.body.token;
const deleted = await call(
  "/v1/me",
  { confirmation: "SUPPRIMER" },
  token,
  "DELETE",
);
if (deleted.status !== 200) console.log(deleted.body);
check(
  deleted.status,
  200,
  "Native account and managed identity can be deleted atomically",
);
check(
  (await call("/v1/me", undefined, token, "GET")).status,
  401,
  "Deleted account session cannot be reused",
);
const student = await call(
  "/v1/me",
  { confirmation: "SUPPRIMER" },
  cfg.accounts.student.token,
  "DELETE",
);
if (student.status !== 200) console.log(student.body);
check(
  student.status,
  200,
  "Student with a claimed invitation can delete account",
);
check(
  (await call("/v1/me", undefined, cfg.accounts.student.token, "GET")).status,
  401,
  "Student session revoked by account deletion",
);
await writeFile(
  "docs/account-deletion-result.json",
  JSON.stringify(
    { date: new Date().toISOString(), checks, passed: true },
    null,
    2,
  ),
);
