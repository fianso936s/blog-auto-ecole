export const STORY_ANCHORS = Object.freeze([
  Object.freeze({ p: 0.00, u: 0.12, camera: Object.freeze([8, 5, 11]), target: Object.freeze([0, 0.6, 0]), fov: 32 }),
  Object.freeze({ p: 0.25, u: 0.29, camera: Object.freeze([9, 8, 12]), target: Object.freeze([0, 0.6, 0.8]), fov: 34 }),
  Object.freeze({ p: 0.50, u: 0.50, camera: Object.freeze([8.5, 13, 10]), target: Object.freeze([0, 0.6, 1]), fov: 36 }),
  Object.freeze({ p: 0.75, u: 0.69, camera: Object.freeze([1.5, 8, 13]), target: Object.freeze([0, 0.65, 1]), fov: 34 }),
  Object.freeze({ p: 1.00, u: 0.86, camera: Object.freeze([-7, 4, 12]), target: Object.freeze([0, 0.65, 1]), fov: 32 }),
]);

export function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVector(a, b, t) {
  return a.map((value, index) => lerp(value, b[index], t));
}

export function sampleStory(progress, anchors = STORY_ANCHORS) {
  const p = clamp01(progress);
  if (!Array.isArray(anchors) || anchors.length < 2) throw new Error("At least two anchors are required.");
  if (p <= anchors[0].p) return { ...anchors[0], camera: [...anchors[0].camera], target: [...anchors[0].target] };
  if (p >= anchors[anchors.length - 1].p) {
    const last = anchors[anchors.length - 1];
    return { ...last, camera: [...last.camera], target: [...last.target] };
  }

  let left = anchors[0], right = anchors[1];
  for (let index = 0; index < anchors.length - 1; index += 1) {
    if (p >= anchors[index].p && p <= anchors[index + 1].p) {
      left = anchors[index];
      right = anchors[index + 1];
      break;
    }
  }

  const span = Math.max(1e-9, right.p - left.p);
  const t = smoothstep01((p - left.p) / span);
  return {
    p,
    u: lerp(left.u, right.u, t),
    camera: lerpVector(left.camera, right.camera, t),
    target: lerpVector(left.target, right.target, t),
    fov: lerp(left.fov, right.fov, t),
  };
}
