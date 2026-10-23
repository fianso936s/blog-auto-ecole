import { createWorker } from "../src/worker.js";

const backend = createWorker({});
const legal = new Set([
  "/privacy",
  "/terms",
  "/support",
  "/reset-password",
  "/assets/reset.js",
]);
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.searchParams.get("__repere_path");
    if (
      !path ||
      path.startsWith("//") ||
      !(
        path.startsWith("/v1/") ||
        path.startsWith("/session/") ||
        path.startsWith("/api/auth/") ||
        legal.has(path)
      )
    ) {
      return Response.json(
        { error: "Ressource introuvable." },
        { status: 404, headers: { "cache-control": "no-store" } },
      );
    }
    url.pathname = path;
    url.searchParams.delete("__repere_path");
    try {
      return await backend.fetch(new Request(url, request));
    } catch (error) {
      console.error("repere_vercel_handler_error", { name: error.name });
      return Response.json(
        { error: "Service temporairement indisponible." },
        { status: 503, headers: { "cache-control": "no-store" } },
      );
    }
  },
};
