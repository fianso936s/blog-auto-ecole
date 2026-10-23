// Same production backend as the iPhone app. No infrastructure secrets are embedded.
export const API =
  "https://br-fragrant-lake-b9utxdv6-spotapi.compute.c-7.eu-central-1.aws.neon.tech";
const cookieName = "repere_web_session";
const providerCookiePrefix = "repere_identity_";
const authPaths = new Set([
  "sign-in/email",
  "sign-up/email",
  "get-session",
  "token",
  "sign-out",
  "update-user",
  "email-otp/send-verification-otp",
  "email-otp/verify-email",
  "email-otp/request-password-reset",
  "email-otp/reset-password",
]);
const encoder = new TextEncoder();
const b64 = (value) =>
  btoa(String.fromCharCode(...value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
const tokenOf = (request) =>
  (request.headers.get("cookie") || "")
    .split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
function copyCookies(source, target) {
  for (const value of source.getSetCookie())
    target.append(
      "set-cookie",
      value
        .replace(
          /^([^=]+)=/,
          (_, name) => providerCookiePrefix + encodeURIComponent(name) + "=",
        )
        .replace(/;\s*Domain=[^;]+/gi, "")
        .replace(/;\s*Path=[^;]+/gi, "; Path=/"),
    );
}
async function upstream(
  path,
  request,
  { body, method = request.method, token, cookies = true } = {},
) {
  const headers = new Headers({ origin: API, accept: "application/json" });
  for (const k of ["content-type", "idempotency-key"])
    if (request.headers.has(k)) headers.set(k, request.headers.get(k));
  if (cookies && request.headers.has("cookie"))
    headers.set(
      "cookie",
      request.headers
        .get("cookie")
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.startsWith(providerCookiePrefix))
        .map((s) => {
          const index = s.indexOf("=");
          return (
            decodeURIComponent(s.slice(providerCookiePrefix.length, index)) +
            s.slice(index)
          );
        })
        .join(";"),
    );
  if (token) headers.set("authorization", "Bearer " + token);
  return fetch(API + path, {
    method,
    headers,
    redirect: "manual",
    signal: AbortSignal.timeout(45000),
    ...(["GET", "HEAD"].includes(method)
      ? {}
      : { body: body ?? request.body, duplex: "half" }),
  });
}
export function createWorker(assets) {
  return {
    async fetch(request) {
      const url = new URL(request.url),
        path = url.pathname;
      try {
        if (
          !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"].includes(
            request.method,
          )
        )
          return json({ error: "Méthode refusée." }, 405);
        if (!["GET", "HEAD"].includes(request.method)) {
          const origin = request.headers.get("origin");
          if (origin !== url.origin)
            return json({ error: "Origine refusée." }, 403);
          if (
            Number(request.headers.get("content-length") || 0) >
            12 * 1024 * 1024
          )
            return json({ error: "Demande trop volumineuse." }, 413);
        }
        if (path === "/session/finish" && request.method === "POST") {
          const managed = await upstream("/api/auth/token", request, {
            method: "GET",
          });
          const managedBody = await managed.json();
          const identity =
            managedBody.token || managed.headers.get("set-auth-jwt");
          if (!managed.ok || !identity)
            return json(
              {
                error:
                  "Connexion non confirmée. Vérifiez votre adresse e-mail puis reconnectez-vous.",
              },
              401,
            );
          const verifier = b64(crypto.getRandomValues(new Uint8Array(32)));
          const challenge = b64(
            new Uint8Array(
              await crypto.subtle.digest("SHA-256", encoder.encode(verifier)),
            ),
          );
          const start = await upstream("/v1/auth/start", request, {
            method: "POST",
            body: JSON.stringify({ challenge }),
            cookies: false,
          });
          const startBody = await start.json();
          if (!start.ok) return json(startBody, start.status);
          const authorize = await upstream("/v1/auth/authorize", request, {
            method: "POST",
            token: identity,
            body: JSON.stringify({ request: startBody.request }),
            cookies: false,
          });
          const authorized = await authorize.json();
          if (!authorize.ok) return json(authorized, authorize.status);
          const redirect = new URL(authorized.redirect);
          if (
            redirect.protocol !== "reperespot:" ||
            redirect.hostname !== "auth"
          )
            return json({ error: "Réponse de connexion invalide." }, 502);
          const exchange = await upstream("/v1/auth/exchange", request, {
            method: "POST",
            body: JSON.stringify({
              code: redirect.searchParams.get("code"),
              verifier,
            }),
            cookies: false,
          });
          const data = await exchange.json();
          if (!exchange.ok) return json(data, exchange.status);
          const headers = new Headers({
            "content-type": "application/json",
            "cache-control": "no-store",
          });
          headers.append(
            "set-cookie",
            `${cookieName}=${data.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${data.expiresIn || 2592000}`,
          );
          return new Response(JSON.stringify({ profile: data.profile }), {
            headers,
          });
        }
        if (path === "/session/logout" && request.method === "POST") {
          const token = tokenOf(request);
          if (token) {
            const r = await upstream("/v1/logout", request, {
              method: "POST",
              token,
              body: "{}",
            });
            if (!r.ok && r.status !== 401)
              return new Response(r.body, {
                status: r.status,
                headers: { "content-type": "application/json" },
              });
          }
          await upstream("/api/auth/sign-out", request, {
            method: "POST",
            body: "{}",
          }).catch(() => {});
          return json({ ok: true }, 200, {
            "set-cookie": `${cookieName}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`,
          });
        }
        if (path.startsWith("/api/auth/")) {
          if (!authPaths.has(path.slice(10)))
            return json({ error: "Fonction introuvable." }, 404);
          if (path === "/api/auth/token")
            return json({ error: "Utilisez la connexion sécurisée." }, 404);
          const r = await upstream(path + url.search, request);
          const headers = new Headers({
            "content-type": "application/json",
            "cache-control": "no-store",
          });
          copyCookies(r.headers, headers);
          // Provider tokens remain server-side. Return only the form's non-secret outcome.
          const data = await r.json();
          if (data && typeof data === "object") {
            delete data.token;
            if (data.session && typeof data.session === "object")
              delete data.session.token;
          }
          return new Response(JSON.stringify(data), {
            status: r.status,
            headers,
          });
        }
        if (path.startsWith("/v1/")) {
          const token = tokenOf(request);
          if (!token)
            return json(
              { error: "Connectez-vous pour ouvrir votre espace." },
              401,
            );
          const r = await upstream(path + url.search, request, {
            token,
            cookies: false,
          });
          return new Response(r.body, {
            status: r.status,
            headers: {
              "content-type":
                r.headers.get("content-type") || "application/json",
              "cache-control": "no-store",
            },
          });
        }
        if (
          [
            "/privacy",
            "/terms",
            "/support",
            "/reset-password",
            "/assets/reset.js",
          ].includes(path)
        ) {
          const r = await upstream(path + url.search, request, {
            cookies: false,
          });
          return new Response(r.body, {
            status: r.status,
            headers: {
              "content-type": r.headers.get("content-type") || "text/html",
              "cache-control": "no-store",
              "x-content-type-options": "nosniff",
            },
          });
        }
        const entry =
          assets[path] || (path === "/" ? assets["/index.html"] : null);
        if (!entry) return json({ error: "Page introuvable." }, 404);
        const body =
          entry.encoding === "base64"
            ? Uint8Array.from(atob(entry.body), (c) => c.charCodeAt(0))
            : entry.body;
        return new Response(request.method === "HEAD" ? null : body, {
          headers: {
            "content-type": entry.type,
            "cache-control": path.startsWith("/assets/")
              ? "public, max-age=300"
              : "no-cache",
            "x-content-type-options": "nosniff",
            "referrer-policy": "strict-origin-when-cross-origin",
            "x-frame-options": "DENY",
            "permissions-policy":
              "geolocation=(self), camera=(self), microphone=(self)",
            "content-security-policy":
              "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; worker-src 'self' blob:; media-src 'self' blob: https:; frame-src https://www.google.com https://maps.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
        });
      } catch (e) {
        return json(
          {
            error:
              e.name === "TimeoutError"
                ? "Le serveur met trop de temps à répondre. Réessayez."
                : "Connexion au service interrompue. Votre travail local est conservé.",
          },
          503,
        );
      }
    },
  };
}
