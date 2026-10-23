import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
for (const surface of ["native", "web"]) test(`Google viewer remains mounted and rejects untrusted messages (${surface})`, async () => {
  const result = await build({
    entryPoints: ["apps/api/src/streetview-client.ts"],
    bundle: true,
    write: false,
    format: "iife",
    platform: "browser",
  });
  const listeners: Record<string, Function> = {},
    sent: any[] = [],
    elements = new Map<string, any>(),
    classes = new Set(["map-only"]);
  const classList = {
    add: (s: string) => classes.add(s),
    remove: (s: string) => classes.delete(s),
    contains: (s: string) => classes.has(s),
    toggle(s: string) {
      if (classes.has(s)) {
        classes.delete(s);
        return false;
      }
      classes.add(s);
      return true;
    },
  };
  const element = (id: string) => {
    if (!elements.has(id))
      elements.set(id, {
        textContent: "",
        dataset: {},
        addEventListener() {},
        setAttribute() {},
      });
    return elements.get(id);
  };
  let current = "",
    visible = false,
    resizes = 0,
    sets = 0,
    hides = 0,
    resolveFind!: (x: any) => void;
  const radii: number[] = [];
  const panoramaListeners: Record<string, Function> = {};
  class Panorama {
    addListener(name: string, fn: Function) {
      panoramaListeners[name] = fn;
    }
    getPano() {
      return current;
    }
    getStatus() {
      return "OK";
    }
    getVisible() {
      return visible;
    }
    setPano(id: string) {
      current = id;
      sets++;
      panoramaListeners.pano_changed?.();
      panoramaListeners.status_changed?.();
    }
    setVisible(value: boolean) {
      visible = value;
      if (!value) hides++;
    }
    setPov() {}
  }
  class MapView {
    panTo() {}
  }
  class Marker {
    setPosition() {}
  }
  class Service {
    getPanorama(options: { radius: number }) {
      radii.push(options.radius);
      return new Promise((resolve) => {
        resolveFind = resolve;
      });
    }
  }
  const parent = {postMessage: (s: string, origin: string) => { assert.equal(origin, "https://blog-auto-ecole.vercel.app"); sent.push(JSON.parse(s)); }};
  const window = {
    ...(surface === "native" ? { ReactNativeWebView: {postMessage: (s: string) => sent.push(JSON.parse(s))}} : {parent}),
    addEventListener: (s: string, f: Function) => {
      listeners[s] = f;
    },
  } as any;
  const google = {
    maps: {
      StreetViewPanorama: Panorama,
      Map: MapView,
      Marker,
      StreetViewService: Service,
      StreetViewPreference: { NEAREST: "NEAREST" },
      StreetViewSource: { OUTDOOR: "OUTDOOR" },
      StreetViewStatus: { OK: "OK" },
      event: {
        trigger() {
          resizes++;
        },
      },
    },
  };
  vm.runInNewContext(result.outputFiles[0]!.text, {
    window,
    document: {
      getElementById: element,
      body: { classList },
      addEventListener() {},
    },
    google,
    location: { origin: "https://repere.example" },
    setTimeout,
    clearTimeout,
    Date,
  });
  window.initReplay();
  const move = (requestId: number) =>
    listeners.message!({
      origin: surface === "web" ? "https://blog-auto-ecole.vercel.app" : "https://repere.example",
      source: parent,
      data: JSON.stringify({
        type: "fix",
        lat: 48.9,
        lng: 2.3,
        heading: 90,
        corridor: [{ lat: 48.9, lng: 2.3 }],
        index: 0,
        requestId,
      }),
    });
  const finish = () =>
    resolveFind({
      data: {
        location: { pano: "same", latLng: { lat: () => 48.9, lng: () => 2.3 } },
        imageDate: "2024-06",
      },
    });
  listeners.message!({ origin: "https://untrusted.example", source: parent, data: JSON.stringify({type:"fix",lat:48.9,lng:2.3,heading:0,index:0}) });
  assert.equal(radii.length,0,"untrusted origins cannot drive the viewer");
  if (surface === "web") {
    listeners.message!({origin:"https://blog-auto-ecole.vercel.app",source:{},data:JSON.stringify({type:"connect"})});
    assert.equal(sent.length,1,"other windows cannot receive readiness");
  }
  move(1);
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(visible, true);
  assert.equal(sets, 1);
  const firstResizes = resizes;
  move(2);
  assert.equal(visible, true);
  assert.equal(hides, 0);
  finish();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(sets, 1, "same panorama must not call setPano again");
  assert.equal(
    resizes,
    firstResizes,
    "same layout must not resize GPU renderer",
  );
  assert.equal(sent.at(-1).requestId, 2);
  assert.equal(sent.at(-1).type, "panorama");
  const nearPoint = () =>
    resolveFind({
      data: {
        location: {
          pano: "near-point",
          latLng: { lat: () => 48.90018, lng: () => 2.3 },
        },
      },
    });
  listeners.message!({
    origin: surface === "web" ? "https://blog-auto-ecole.vercel.app" : "https://repere.example",
      source: parent,
    data: JSON.stringify({
      type: "snapshot",
      kind: "point",
      lat: 48.9,
      lng: 2.3,
      heading: 0,
      index: 0,
      requestId: 3,
    }),
  });
  nearPoint();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(radii.at(-1), 30);
  assert.equal(sent.at(-1).type, "panorama");
  assert.equal(sent.at(-1).distanceMeters, 20);
  listeners.message!({
    origin: surface === "web" ? "https://blog-auto-ecole.vercel.app" : "https://repere.example",
      source: parent,
    data: JSON.stringify({
      type: "fix",
      pointSnapshot: true,
      lat: 48.9,
      lng: 2.3,
      heading: 0,
      index: 0,
      requestId: 4,
    }),
  });
  nearPoint();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(radii.at(-1), 8);
  assert.equal(
    sent.at(-1).reason,
    "coverage",
    "legacy replay never inherits the wider point search",
  );
});
