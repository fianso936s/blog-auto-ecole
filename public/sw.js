const OWNED_CACHE_PREFIXES = ["auto-blog-", "webedrive-migration-"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => OWNED_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
