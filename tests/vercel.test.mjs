import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import handler from "../api/site.js";
import { API } from "../src/worker.js";
test("Vercel adapter restores the original protected API path and query", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, API + "/v1/routes?examCenter=Bobigny");
    assert.equal(init.headers.get("authorization"), "Bearer own-session");
    return Response.json({ routes: [] });
  };
  try {
    const r = await handler.fetch(
      new Request(
        "https://repere.vercel.app/api/site?__repere_path=/v1/routes&examCenter=Bobigny",
        { headers: { cookie: "repere_web_session=own-session" } },
      ),
    );
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { routes: [] });
  } finally {
    globalThis.fetch = original;
  }
});
test("Vercel adapter rejects arbitrary destinations and unauthenticated records", async () => {
  for (const path of ["https://evil.example", "//evil.example", "/unrelated"]) {
    const r = await handler.fetch(
      new Request(
        "https://repere.vercel.app/api/site?__repere_path=" +
          encodeURIComponent(path),
      ),
    );
    assert.equal(r.status, 404);
  }
  const r = await handler.fetch(
    new Request("https://repere.vercel.app/api/site?__repere_path=/v1/routes"),
  );
  assert.equal(r.status, 401);
});
test("Vercel adapter preserves origin protection for JSON writes", async () => {
  const r = await handler.fetch(
    new Request("https://repere.vercel.app/api/site?__repere_path=/v1/me", {
      method: "PATCH",
      headers: {
        origin: "https://evil.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "Example" }),
    }),
  );
  assert.equal(r.status, 403);
});
test("the production build serves the transparent vector logo", async () => {
  const supplied = await readFile("src/assets/le-repere-logo.svg");
  const published = await readFile("public/assets/le-repere-logo.svg");
  assert.deepEqual(published, supplied);
  const js = await readFile("public/assets/app.js", "utf8");
  assert.ok(js.includes("/assets/le-repere-logo.svg"));
});
test("deployment config routes private APIs to a Node function and keeps security headers", async () => {
  const config = JSON.parse(await readFile("vercel.json", "utf8"));
  assert.equal(config.outputDirectory, "public");
  assert.equal(config.framework, null);
  assert.equal(config.functions["api/site.js"].maxDuration, 60);
  assert.ok(config.rewrites.some((r) => r.source === "/api/auth/:path*"));
  assert.ok(
    config.headers[0].headers.some((h) => h.key === "Content-Security-Policy"),
  );
  assert.ok(!JSON.stringify(config).includes("ssoProtection"));
});
