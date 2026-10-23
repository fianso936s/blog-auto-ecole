import {
  createStreetReplay,
  type StreetRequest,
  type StreetPanorama,
} from "./streetview-controller";
declare const google: any;
declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (data: string) => void };
    initReplay: () => void;
    gm_authFailure: () => void;
  }
}
// Only the published web app can drive this public viewer. No account tokens cross this bridge.
const webOrigin = "https://blog-auto-ecole.vercel.app";
const embedded = !window.ReactNativeWebView && !!window.parent && window.parent !== window;
const send = (data: Record<string, unknown>) => {
  const message = JSON.stringify(data);
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
  else if (embedded) window.parent.postMessage(message, webOrigin);
};
const status = document.getElementById("status")!;
const imageDate = document.getElementById("image-date")!;
const diagnostic = document.getElementById("diagnostic") as HTMLButtonElement;
let diagnosticStart = 0;
let pano: any,
  service: any,
  map: any,
  marker: any,
  lines: any[] = [];
let lockedPano = "",
  ready = false,
  showGeneration = 0;
let awaiting: ((ok: boolean) => void) | undefined;
let lastPaths = "";
const miniMap = document.getElementById("mini-map") as HTMLButtonElement;
function resize() {
  if (!map || !pano) return;
  google.maps.event.trigger(map, "resize");
  google.maps.event.trigger(pano, "resize");
}
miniMap.addEventListener("click", () => {
  const expanded = document.body.classList.toggle("mini-map");
  miniMap.setAttribute("aria-pressed", String(expanded));
  if (map) google.maps.event.trigger(map, "resize");
});
window.addEventListener("resize", resize);
function hide() {
  const changed = !document.body.classList.contains("map-only");
  document.body.classList.add("map-only");
  showGeneration++;
  awaiting?.(false);
  awaiting = undefined;
  lockedPano = "";
  pano?.setVisible(false);
  imageDate.textContent = "";
  if (map && changed) google.maps.event.trigger(map, "resize");
}
const replay = createStreetReplay({
  hide,
  route(data) {
    const point = { lat: data.lat, lng: data.lng };
    marker.setPosition(point);
    map.panTo(point);
    const paths = JSON.stringify(data.paths || []);
    if (data.paths && paths !== lastPaths) {
      lastPaths = paths;
      lines.forEach((l) => l.setMap(null));
      lines = (data.paths || []).map(
        (path) =>
          new google.maps.Polyline({
            map,
            path,
            strokeColor: "#672C3B",
            strokeWeight: 4,
            clickable: false,
          }),
      );
    }
    status.textContent = lockedPano
      ? "Vue précédente · chargement de la suivante…"
      : "Recherche d’une vue sur le tracé…";
  },
  async find(position, radius = 8) {
    let result;
    try {
      result = await service.getPanorama({
        location: { lat: position.lat, lng: position.lng },
        radius,
        preference: google.maps.StreetViewPreference.NEAREST,
        source: google.maps.StreetViewSource.OUTDOOR,
      });
    } catch (error) {
      if ((error as { code?: string })?.code === "ZERO_RESULTS") return null;
      throw error;
    }
    const location = result.data?.location,
      point = location?.latLng;
    return location?.pano && point
      ? {
          id: location.pano,
          position: { lat: point.lat(), lng: point.lng() },
          date: result.data.imageDate,
        }
      : null;
  },
  show(view: StreetPanorama, heading: number) {
    const changed = document.body.classList.contains("map-only");
    document.body.classList.remove("map-only");
    if (changed) resize();
    const n = ++showGeneration;
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => done(false), 10000);
      function done(ok: boolean) {
        clearTimeout(timer);
        if (n === showGeneration) awaiting = undefined;
        ok ? resolve() : reject(Error("Panorama unavailable"));
      }
      const repeated = pano.getPano() === view.id;
      awaiting = done;
      lockedPano = view.id;
      // Do not reset the GPU renderer for repeated panoramas. Let Google's own transition run.
      if (!repeated) pano.setPano(view.id);
      pano.setPov({ heading, pitch: 0 });
      if (!pano.getVisible()) pano.setVisible(true);
      imageDate.textContent = view.date
        ? "Images : " + view.date
        : "Images d’archive Google";
      // Repeated panoramas may not emit a new status event.
      if (
        repeated &&
        pano.getPano() === lockedPano &&
        pano.getStatus() === google.maps.StreetViewStatus.OK
      )
        done(true);
    });
  },
  send(data) {
    status.textContent =
      data.type === "panorama" ? "" : String(data.message || "");
    if (diagnosticStart) {
      diagnostic.textContent =
        data.type === "panorama"
          ? `Vue affichée · ${Date.now() - diagnosticStart} ms · Refaire le test`
          : "Réessayer le diagnostic";
      diagnostic.disabled = false;
      diagnostic.dataset.result = String(data.type);
      diagnosticStart = 0;
    }
    send(data);
  },
});
window.gm_authFailure = () => {
  ready = false;
  replay.cancel();
  status.textContent = "Street View non activé pour cette application.";
  send({
    type: "unavailable",
    reason: "configuration",
    message: "La configuration Google Maps doit être activée.",
  });
};
window.initReplay = () => {
  pano = new google.maps.StreetViewPanorama(
    document.getElementById("panorama"),
    {
      addressControl: false,
      fullscreenControl: false,
      linksControl: false,
      clickToGo: false,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      motionTracking: false,
      motionTrackingControl: false,
      showRoadLabels: true,
      visible: false,
      zoom: 1,
      zoomControl: true,
      panControl: false,
    },
  );
  service = new google.maps.StreetViewService();
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 48.9, lng: 2.3 },
    zoom: 17,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    gestureHandling: "none",
    keyboardShortcuts: false,
  });
  marker = new google.maps.Marker({ map });
  pano.addListener("pano_changed", () => {
    // Google navigation must never move the player away from its accepted frame.
    if (pano.getPano() !== lockedPano) {
      pano.setVisible(false);
      if (lockedPano) pano.setPano(lockedPano);
    }
  });
  pano.addListener("status_changed", () => {
    if (pano.getPano() === lockedPano)
      awaiting?.(pano.getStatus() === google.maps.StreetViewStatus.OK);
  });
  ready = true;
  send({ type: "ready" });
  // A visible browser-only test uses a public Paris location, never an account or stored route.
  // The mobile player continues to accept only its recorded route messages.
  if (!window.ReactNativeWebView && !embedded) diagnostic.hidden = false;
};
function receive(event: MessageEvent) {
  if (embedded) {
    if (event.source !== window.parent || event.origin !== webOrigin) return;
  } else if (event.origin && event.origin !== "null" && event.origin !== location.origin) return;
  try {
    const data = JSON.parse(event.data);
    if (data.type === "connect") { if (ready) send({ type: "ready" }); return; }
    if (data.type === "fix" && ready)
      void replay.move({ ...data, pointSnapshot: false } as StreetRequest);
    if (data.type === "snapshot" && ready)
      void replay.move({
        ...data,
        pointSnapshot: data.kind === "point",
      } as StreetRequest);
    if (data.type === "cancel") replay.cancel();
  } catch {}
}
window.addEventListener("message", receive);
document.addEventListener("message", receive as EventListener);
window.addEventListener("pagehide", () => replay.cancel());
document.addEventListener(
  "keydown",
  (event) => {
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
      ].includes(event.key)
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true,
);

diagnostic.addEventListener("click", async () => {
  if (!ready || window.ReactNativeWebView) return;
  diagnostic.disabled = true;
  diagnostic.textContent = "Test de chargement…";
  diagnosticStart = Date.now();
  try {
    const result = await service.getPanorama({
      location: { lat: 48.8698, lng: 2.3076 },
      radius: 30,
      source: google.maps.StreetViewSource.OUTDOOR,
    });
    const point = result.data?.location?.latLng;
    if (!point) throw Error("No coverage");
    const lat = point.lat(),
      lng = point.lng();
    // Synthetic anchor exactly at Google's public panorama; this tests delivery, not a user's route.
    await replay.move({
      lat,
      lng,
      heading: 90,
      corridor: [{ lat, lng }],
      paths: [[{ lat, lng }]],
      index: 0,
      requestId: 0,
    });
  } catch {
    diagnosticStart = 0;
    diagnostic.disabled = false;
    diagnostic.textContent = "Test indisponible · réessayer";
    diagnostic.dataset.result = "unavailable";
    status.textContent = "Google Street View ne répond pas au diagnostic.";
  }
});
