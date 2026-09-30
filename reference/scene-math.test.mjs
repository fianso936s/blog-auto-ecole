import test from "node:test";
import assert from "node:assert/strict";
import { STORY_ANCHORS, clamp01, smoothstep01, sampleStory } from "./scene-math.mjs";

const close = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} !== ${expected}`);

test("clamp and smoothstep remain deterministic", () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  close(smoothstep01(0.5), 0.5);
});

test("story endpoints preserve the contractual anchors", () => {
  assert.deepEqual(sampleStory(0), { ...STORY_ANCHORS[0], camera: [8, 5, 11], target: [0, 0.6, 0] });
  assert.deepEqual(sampleStory(1), { ...STORY_ANCHORS[4], camera: [-7, 4, 12], target: [0, 0.65, 1] });
});

test("halfway inside the first segment uses smoothstep interpolation", () => {
  const value = sampleStory(0.125);
  close(value.u, 0.205);
  assert.deepEqual(value.camera.map(v => Number(v.toFixed(3))), [8.5, 6.5, 11.5]);
  assert.deepEqual(value.target.map(v => Number(v.toFixed(3))), [0, 0.6, 0.4]);
  close(value.fov, 33);
});

test("the contractual middle anchor is preserved exactly", () => {
  const value = sampleStory(0.5);
  close(value.u, 0.5);
  assert.deepEqual(value.camera, [8.5, 13, 10]);
  assert.deepEqual(value.target, [0, 0.6, 1]);
  assert.equal(value.fov, 36);
});
