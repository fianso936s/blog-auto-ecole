import test from "node:test";
import assert from "node:assert/strict";
import { createWorker, API } from "../src/worker.js";
const origin = "https://repere.example";
const assets = { "/index.html": { body: "Le Repère", type: "text/html" } };
const worker = createWorker(assets);
const request = (path, init = {}) =>
  new Request(origin + path, { ...init, headers: { origin, ...init.headers } });
test("private data is denied before any upstream fetch when disconnected", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw Error("Should not call");
  };
  try {
    const r = await worker.fetch(request("/v1/routes"));
    assert.equal(r.status, 401);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
  }
});
test("cross-origin writes are refused before reaching the production API", async () => {
  const r = await worker.fetch(
    request("/v1/me", {
      method: "PATCH",
      headers: { origin: "https://evil.example" },
      body: "{}",
    }),
  );
  assert.equal(r.status, 403);
  const noOrigin = await worker.fetch(
    new Request(origin + "/session/finish", { method: "POST" }),
  );
  assert.equal(noOrigin.status, 403);
});
test("the authenticated proxy only injects its own session and keeps the API origin", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, API + "/v1/routes?examCenter=Bobigny");
    assert.equal(init.headers.get("authorization"), "Bearer own-session");
    assert.equal(init.headers.get("origin"), API);
    assert.equal(init.headers.get("cookie"), null);
    return Response.json({ routes: [] });
  };
  try {
    const r = await worker.fetch(
      request("/v1/routes?examCenter=Bobigny", {
        headers: {
          cookie: "repere_web_session=own-session",
          authorization: "Bearer attacker",
        },
      }),
    );
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { routes: [] });
  } finally {
    globalThis.fetch = original;
  }
});
test("the existing PKCE flow produces an HTTP-only session and no frontend token", async () => {
  const original = globalThis.fetch;
  let challenge,
    verifier,
    calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push(url);
    assert.ok(url.startsWith(API));
    const path = new URL(url).pathname;
    if (path === "/api/auth/token")
      return Response.json({ token: "managed-identity" });
    if (path === "/v1/auth/start") {
      challenge = JSON.parse(init.body).challenge;
      assert.match(challenge, /^[\w-]{43}$/);
      return Response.json({ request: "request-id" });
    }
    if (path === "/v1/auth/authorize") {
      assert.equal(
        init.headers.get("authorization"),
        "Bearer managed-identity",
      );
      return Response.json({
        redirect: "reperespot://auth?code=verified-code",
      });
    }
    if (path === "/v1/auth/exchange") {
      verifier = JSON.parse(init.body).verifier;
      assert.equal(JSON.parse(init.body).code, "verified-code");
      return Response.json({
        token: "private-session",
        profile: { id: "1", role: "student" },
        expiresIn: 100,
      });
    }
    throw Error("Unexpected API call");
  };
  try {
    const r = await worker.fetch(
      request("/session/finish", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: "managed=session",
        },
        body: "{}",
      }),
    );
    assert.equal(r.status, 200);
    assert.equal(calls.length, 4);
    const cookie = r.headers.get("set-cookie");
    assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
    assert.match(cookie, /private-session/);
    assert.equal((await r.json()).token, undefined);
    const { createHash } = await import("node:crypto");
    assert.equal(
      createHash("sha256").update(verifier).digest("base64url"),
      challenge,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("provider cookies are scoped to this host without dropping HttpOnly", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json(
      { user: { id: "1" } },
      {
        headers: {
          "set-cookie":
            "auth=value; Domain=upstream.test; Path=/api/auth; Secure; HttpOnly; SameSite=Lax",
        },
      },
    );
  try {
    const r = await worker.fetch(
      request("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      }),
    );
    const c = r.headers.get("set-cookie");
    assert.ok(!c.includes("Domain="));
    assert.match(c, /Path=\//);
    assert.match(c, /HttpOnly/);
  } finally {
    globalThis.fetch = original;
  }
});
test("unknown authentication endpoints and third-party URLs cannot be used as a proxy", async () => {
  const r = await worker.fetch(request("/api/auth/admin/users"));
  assert.equal(r.status, 404);
  assert.equal(
    (await worker.fetch(request("/https://evil.example"))).status,
    404,
  );
});
test("platform and unrelated cookies never leave the Site", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(
      init.headers.get("cookie"),
      "__Secure-neon-auth.session_token=provider-value",
    );
    return Response.json({
      user: { id: "1" },
      token: "must-remain-private",
      session: { token: "private-too" },
    });
  };
  try {
    const r = await worker.fetch(
      request("/api/auth/get-session", {
        headers: {
          cookie:
            "sites_private=platform-secret; unrelated=secret; repere_web_session=private; repere_identity___Secure-neon-auth.session_token=provider-value",
        },
      }),
    );
    const data = await r.json();
    assert.equal(data.token, undefined);
    assert.equal(data.session.token, undefined);
  } finally {
    globalThis.fetch = original;
  }
});
test("public assets provide framing, MIME and browser security protections", async () => {
  const r = await worker.fetch(request("/"));
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.match(r.headers.get("content-security-policy"), /object-src 'none'/);
});
