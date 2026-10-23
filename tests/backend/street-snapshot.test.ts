import { test } from "node:test";
import assert from "node:assert/strict";
import {
  captureStreetSnapshot,
  streetSnapshotRequest,
} from "../../apps/mobile/src/services/street-snapshot";
import {
  createStreetReplay,
  type StreetRequest,
} from "../../apps/api/src/streetview-controller";
test("manual window captures its location and cannot follow later route ticks or edits", () => {
  const position = {
    lat: 48.9,
    lng: 2.3,
    heading: 90,
    corridor: [{ lat: 48.9, lng: 2.3 }],
  };
  const selected = captureStreetSnapshot(position, "route", "Parcours")!;
  position.lat = 49;
  position.corridor[0]!.lat = 49;
  const sent = streetSnapshotRequest(selected, 7);
  assert.equal(sent.lat, 48.9);
  assert.equal(sent.corridor?.[0]?.lat, 48.9);
  assert.equal(sent.requestId, 7);
  assert.equal(sent.type, "snapshot");
});
test("manual point request strips lesson photos, account metadata and title from Google payload", () => {
  const selected = captureStreetSnapshot(
    { lat: 48.9, lng: 2.3, photos: ["private"], authorId: "private" } as any,
    "point",
    "Private title",
  )!;
  const sent = JSON.stringify(streetSnapshotRequest(selected, 1));
  assert.ok(!sent.includes("private") && !sent.includes("Private title"));
  assert.equal(
    captureStreetSnapshot({ lat: NaN, lng: 2.3 }, "point", ""),
    null,
  );
});
test("nearby point snapshot is explicit, bounded to 30m, and does not loosen the recorded-route gate", async () => {
  const radii: number[] = [],
    shown: number[] = [],
    sent: any[] = [];
  let offset = 20;
  const player = createStreetReplay({
    find: async (_p, radius) => {
      radii.push(radius!);
      return {
        id: "road",
        position: { lat: 48.9 + offset / 111195, lng: 2.3 },
      };
    },
    route() {},
    hide() {},
    show: async (_p, heading) => {
      shown.push(heading);
    },
    send: (data) => sent.push(data),
  });
  const request: StreetRequest = {
    lat: 48.9,
    lng: 2.3,
    heading: 90,
    corridor: [{ lat: 48.9, lng: 2.3 }],
    index: 0,
    requestId: 1,
  };
  await player.move(request);
  assert.equal(sent.at(-1).reason, "coverage");
  assert.equal(shown.length, 0);
  await player.move({ ...request, pointSnapshot: true, requestId: 2 });
  assert.equal(sent.at(-1).type, "panorama");
  assert.equal(sent.at(-1).distanceMeters, 20);
  assert.ok(Math.abs(shown[0]! - 180) < 1);
  offset = 31;
  await player.move({ ...request, pointSnapshot: true, requestId: 3 });
  assert.equal(sent.at(-1).reason, "coverage");
  assert.equal(shown.length, 1);
  assert.deepEqual(radii, [8, 30, 30]);
});
