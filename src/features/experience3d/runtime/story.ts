export type StoryAnchor = {
  p: number;
  u: number;
  camera: readonly [number, number, number];
  target: readonly [number, number, number];
  fov: number;
};

export type StorySample = {
  p: number;
  u: number;
  camera: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export const STORY_ANCHORS: readonly StoryAnchor[] = Object.freeze([
  { p: 0.00, u: 0.12, camera: [8, 5, 11], target: [0, 0.6, 0], fov: 32 },
  { p: 0.25, u: 0.29, camera: [9, 8, 12], target: [0, 0.6, 0.8], fov: 34 },
  { p: 0.50, u: 0.50, camera: [8.5, 13, 10], target: [0, 0.6, 1], fov: 36 },
  { p: 0.75, u: 0.69, camera: [1.5, 8, 13], target: [0, 0.65, 1], fov: 34 },
  { p: 1.00, u: 0.86, camera: [-7, 4, 12], target: [0, 0.65, 1], fov: 32 },
]);

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function smoothstep01(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerp3(a: readonly number[], b: readonly number[], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function sampleStory(progress: number, anchors: readonly StoryAnchor[] = STORY_ANCHORS): StorySample {
  const p = clamp01(progress);
  if (p <= anchors[0].p) {
    const a = anchors[0];
    return { p, u: a.u, camera: [...a.camera], target: [...a.target], fov: a.fov };
  }
  if (p >= anchors[anchors.length - 1].p) {
    const a = anchors[anchors.length - 1];
    return { p, u: a.u, camera: [...a.camera], target: [...a.target], fov: a.fov };
  }
  let left = anchors[0];
  let right = anchors[1];
  for (let i = 0; i < anchors.length - 1; i += 1) {
    if (p >= anchors[i].p && p <= anchors[i + 1].p) {
      left = anchors[i];
      right = anchors[i + 1];
      break;
    }
  }
  const t = smoothstep01((p - left.p) / Math.max(1e-9, right.p - left.p));
  return {
    p,
    u: lerp(left.u, right.u, t),
    camera: lerp3(left.camera, right.camera, t),
    target: lerp3(left.target, right.target, t),
    fov: lerp(left.fov, right.fov, t),
  };
}
