import {
  distance,
  panoramaOnReplay,
  validReplayCoordinate,
  type ReplayAnchor,
  type ReplayCoordinate,
} from "@repere/core";
export type StreetRequest = ReplayAnchor & {
  pointSnapshot?: boolean;
  index: number;
  requestId?: number;
  paths?: ReplayCoordinate[][];
};
export type StreetPanorama = {
  id: string;
  position: ReplayCoordinate;
  date?: string;
};
export function createStreetReplay(deps: {
  find: (
    position: ReplayCoordinate,
    radius?: number,
  ) => Promise<StreetPanorama | null>;
  route: (data: StreetRequest) => void;
  show: (panorama: StreetPanorama, heading: number) => Promise<void>;
  hide: () => void;
  send: (data: Record<string, unknown>) => void;
}) {
  let generation = 0;
  return {
    cancel() {
      generation++;
      deps.hide();
    },
    async move(data: StreetRequest) {
      if (
        !Number.isInteger(data?.index) ||
        data.index < 0 ||
        !validReplayCoordinate(data) ||
        !Number.isFinite(data.heading)
      )
        return;
      const n = ++generation;
      const reply = { index: data.index, requestId: data.requestId };
      // Keep the last accepted view while the next position is being resolved.
      deps.route(data);
      try {
        const panorama = await deps.find(
          data,
          data.pointSnapshot === true ? 30 : 8,
        );
        if (n !== generation) return;
        // Older app builds have no corridor: restrict them to the exact anchor.
        const anchor = {
          ...data,
          corridor:
            Array.isArray(data.corridor) && data.corridor.length
              ? data.corridor
              : [{ lat: data.lat, lng: data.lng }],
        };
        const pointMode = data.pointSnapshot === true;
        const nearby =
          panorama && validReplayCoordinate(panorama.position)
            ? distance(data, panorama.position)
            : Infinity;
        if (
          !panorama ||
          (pointMode
            ? nearby > 30
            : !panoramaOnReplay(anchor, panorama.position))
        ) {
          deps.hide();
          deps.send({
            type: "unavailable",
            reason: "coverage",
            ...reply,
            message:
              "Aucune vue alignée sur cette portion. Le replay reste sur le tracé.",
          });
          return;
        }
        let heading = data.heading;
        if (pointMode && nearby > 1) {
          const rad = Math.PI / 180;
          heading =
            (Math.atan2(
              (data.lng - panorama.position.lng) * Math.cos(data.lat * rad),
              data.lat - panorama.position.lat,
            ) /
              rad +
              360) %
            360;
        }
        await deps.show(panorama, heading);
        if (n !== generation) return;
        deps.send({
          type: "panorama",
          ...reply,
          date: panorama.date || "",
          ...(pointMode ? { distanceMeters: Math.round(nearby) } : {}),
        });
      } catch {
        if (n !== generation) return;
        deps.hide();
        deps.send({
          type: "unavailable",
          reason: "service",
          ...reply,
          message:
            "Street View ne répond pas. Réessayez ou continuez sur la carte.",
        });
      }
    },
  };
}
