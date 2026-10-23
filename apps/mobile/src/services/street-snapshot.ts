import { validReplayCoordinate, type ReplayCoordinate } from "@repere/core";
export type SnapshotPosition = ReplayCoordinate & {
  heading?: number;
  corridor?: ReplayCoordinate[];
};
export type StreetSnapshot = SnapshotPosition & {
  kind: "point" | "route";
  title: string;
};
// Copy only the selected position. Later replay ticks or edits cannot move this window.
export function captureStreetSnapshot(
  position: SnapshotPosition,
  kind: StreetSnapshot["kind"],
  title: string,
): StreetSnapshot | null {
  if (!validReplayCoordinate(position)) return null;
  return {
    lat: position.lat,
    lng: position.lng,
    heading: Number.isFinite(position.heading) ? position.heading : 0,
    kind,
    title,
    ...(kind === "route" && position.corridor?.length
      ? {
          corridor: position.corridor
            .slice(0, 121)
            .filter(validReplayCoordinate)
            .map((p) => ({ lat: p.lat, lng: p.lng })),
        }
      : {}),
  };
}
export function streetSnapshotRequest(
  target: StreetSnapshot,
  requestId: number,
) {
  return {
    type: "snapshot",
    kind: target.kind,
    lat: target.lat,
    lng: target.lng,
    heading: target.heading,
    index: 0,
    requestId,
    ...(target.kind === "route" && target.corridor
      ? { corridor: target.corridor }
      : {}),
    paths: [target.corridor || [{ lat: target.lat, lng: target.lng }]],
  };
}
