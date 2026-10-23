// Loading time is part of the cadence, rather than added after every frame.
// One frame at a time: no speculative Google image requests or skipped quiz points.
export function replayDelay(speed: number, elapsed: number) {
  const safeSpeed = speed === 0.5 || speed === 2 ? speed : 1;
  return Math.max(200, 1500 / safeSpeed - Math.max(0, elapsed));
}
