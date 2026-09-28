import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import App from "./App";
import "./index.css";

const LEGACY_SERVICE_WORKER_PATHS = new Set(["/sw.js", "/service-worker.js"]);
const LEGACY_CACHE_PREFIXES = ["auto-blog-", "webedrive-migration-"];

function isWebedriveServiceWorker(registration: ServiceWorkerRegistration): boolean {
  const worker = registration.active || registration.waiting || registration.installing;
  if (!worker) return false;

  try {
    const script = new URL(worker.scriptURL);
    return script.origin === window.location.origin && LEGACY_SERVICE_WORKER_PATHS.has(script.pathname);
  } catch {
    return false;
  }
}

// WEBEDRIVE migration: retire only the service worker and caches owned by this site.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(
        registrations
          .filter(isWebedriveServiceWorker)
          .map((registration) => registration.unregister())
      );

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.allSettled(
          keys
            .filter((key) => LEGACY_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)))
            .map((key) => caches.delete(key))
        );
      }
    } catch {
      // Browser storage can be denied. Migration is best-effort, never a page failure.
    }
  }, { once: true });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
