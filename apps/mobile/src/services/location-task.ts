import * as TaskManager from "expo-task-manager";
import type { LocationObject } from "expo-location";
import { ingestLocations } from "./local";
export const LOCATION_TASK = "repere-real-gps-v1";
export const normalize = (l: LocationObject) => ({
  latitude: l.coords.latitude,
  longitude: l.coords.longitude,
  accuracy: l.coords.accuracy,
  timestamp: Math.round(l.timestamp),
  mocked: l.mocked,
});
TaskManager.defineTask<{ locations: LocationObject[] }>(
  LOCATION_TASK,
  async ({ data, error }) => {
    if (error) return; // Preserve the draft; the UI detects stale timestamps and offers resume.
    if (data?.locations) await ingestLocations(data.locations.map(normalize));
  },
);
