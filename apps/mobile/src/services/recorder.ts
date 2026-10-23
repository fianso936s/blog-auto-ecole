import * as Location from "expo-location";
import { RecordingController } from "@repere/core";
import {
  createLocal,
  changeState,
  updateLocal,
  getLocal,
  type LocalRoute,
} from "./local";
import { LOCATION_TASK, normalize } from "./location-task";
const controller = new RecordingController();
let activeId: string | undefined;
let foreground: Location.LocationSubscription | undefined;
let changed = () => {};
export const setRecorderListener = (listener: () => void) => {
  changed = listener;
};
async function closeNative() {
  foreground?.remove();
  foreground = undefined;
  const running = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK,
  ).catch(() => false);
  if (running)
    await Location.stopLocationUpdatesAsync(LOCATION_TASK).catch(() => {});
}
async function activate(r: LocalRoute, current: () => boolean) {
  activeId = r.id;
  changed();
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!current()) return closeNative;
  if (fg.status !== "granted") {
    await changeState(r.id, "paused");
    await updateLocal(r.id, {
      error:
        "Autorisez la localisation dans les réglages de l’iPhone pour enregistrer.",
    });
    changed();
    return closeNative;
  }
  let background = false;
  try {
    const permission = await Location.requestBackgroundPermissionsAsync();
    if (!current()) return closeNative;
    background = permission.status === "granted";
  } catch {}
  if (!current()) return closeNative;
  try {
    if (background) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3,
        timeInterval: 1000,
        deferredUpdatesInterval: 2000,
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.AutomotiveNavigation,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "LE REPÈRE PERMIS",
          notificationBody: "Enregistrement GPS en cours",
          killServiceOnDestroy: false,
        },
      });
    } else {
      const { ingestLocations } = await import("./local");
      foreground = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 3,
          timeInterval: 1000,
        },
        async (location) => {
          if (current()) {
            await ingestLocations([normalize(location)]);
            changed();
          }
        },
      );
    }
    if (!current()) {
      await closeNative();
      return closeNative;
    }
    await updateLocal(r.id, {
      background,
      error: background
        ? ""
        : "Gardez Le Repère Permis ouvert : la localisation en arrière-plan n’est pas autorisée.",
    });
    changed();
  } catch {
    await changeState(r.id, "paused");
    await updateLocal(r.id, {
      error:
        "GPS indisponible. Votre brouillon est conservé. Vous pouvez reprendre.",
    });
    changed();
  }
  return closeNative;
}
export async function startRecording(userId: string) {
  await controller.start(
    () => createLocal(userId),
    activate,
    async (r) => {
      activeId = r.id;
      await changeState(r.id, "finished");
      changed();
    },
  );
}
export async function pauseRecording(id: string) {
  await controller.stop(async () => {
    await changeState(id, "paused");
    changed();
  });
}
export async function resumeRecording(id: string) {
  await controller.stop(async () => {});
  await controller.start(
    async () => {
      const r = await changeState(id, "recording");
      if (!r) throw new Error("Brouillon introuvable.");
      return r;
    },
    activate,
    async (r) => {
      await changeState(r.id, "paused");
    },
  );
}
export async function stopRecording(id?: string) {
  await controller.stop(async () => {
    const target = id || activeId;
    if (target) await changeState(target, "finished");
    changed();
  });
  activeId = undefined;
  await closeNative();
}
export async function locate() {
  const p = await Location.requestForegroundPermissionsAsync();
  if (p.status !== "granted")
    throw new Error(
      "Activez la localisation de Le Repère Permis dans les réglages de l’iPhone.",
    );
  const result = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  if (result.mocked) throw new Error("Position simulée refusée.");
  return normalize(result);
}
export async function recoverRecording(id: string) {
  activeId = id;
  const running = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK,
  ).catch(() => false);
  const r = await getLocal(id);
  if (r?.state === "recording" && !running) {
    await changeState(id, "paused");
    await updateLocal(id, {
      error:
        "L’enregistrement a été interrompu. Reprenez pour créer un nouveau segment.",
    });
  }
  changed();
}
