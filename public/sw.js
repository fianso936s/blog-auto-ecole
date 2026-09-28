const OWNED_CACHE_PREFIXES = ["auto-blog-", "webedrive-migration-"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.allSettled(
        keys
          .filter((key) => OWNED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
          .map((key) => caches.delete(key))
      ))
      // A browser may deny cache access; keep the network-only worker usable.
      .catch(() => undefined)
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
