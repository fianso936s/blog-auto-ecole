import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { routeBounds } from "../../apps/mobile/src/services/route-viewport.ts";

function cameraActions(follow: boolean) {
  const calls: { method: string; args: any[] }[] = [];
  const effects: (() => void)[] = [];
  const camera = Object.fromEntries(["fitBounds", "easeTo", "setStop"].map(method =>
    [method, (...args: any[]) => { calls.push({ method, args }); }],
  ));
  let refs = 0, states = 0;
  const react = {
    createElement: () => null,
    useRef: (initial: unknown) => ({ current: refs++ === 0 ? camera : initial }),
    useState: (initial: unknown) => [states++ === 0 ? true : initial, () => {}],
    useMemo: (fn: () => unknown) => fn(),
    useEffect: (fn: () => void) => effects.push(fn),
  };
  const mocks: Record<string, unknown> = {
    react: { __esModule: true, default: react, ...react },
    "react-native": {},
    "@maplibre/maplibre-react-native": {},
    "@repere/core": { geometry: () => ({ type: "LineString", coordinates: [[2,48],[4,50]] }) },
    "../theme": { colors: {} },
    "./UI": {},
    "../services/route-viewport": { routeBounds },
    "react-native-reanimated": { useReducedMotion: () => false },
  };
  const module = { exports: {} as any };
  const js = ts.transpileModule(readFileSync(new URL("../../apps/mobile/src/components/RouteMap.tsx", import.meta.url), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(js, { exports: module.exports, module, require: (name: string) => {
    if (!(name in mocks)) throw new Error("Unexpected module " + name);
    return mocks[name];
  } });
  module.exports.RouteMap({
    fixes: [{ lng: 2, lat: 48, time: 1 }, { lng: 4, lat: 50, time: 2 }],
    routeKey: "imported-gpx", follow,
    position: { longitude: -1, latitude: 43, timestamp: 3 },
  });
  effects.forEach(effect => effect());
  return calls;
}

test("opening an imported GPX frames its full route despite a distant GPS position", () => {
  const calls = cameraActions(false);
  assert.equal(calls.length, 1, "pitch must not issue a second competing camera command");
  assert.equal(calls[0]!.method, "fitBounds");
  assert.deepEqual(calls[0]!.args[0], [2,48,4,50]);
  assert.equal(calls[0]!.args[1].pitch, 0);
});
test("explicit GPS following remains available without an extra pitch command", () => {
  const calls = cameraActions(true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.method, "easeTo");
  assert.deepEqual(Array.from(calls[0]!.args[0].center), [-1,43]);
});
