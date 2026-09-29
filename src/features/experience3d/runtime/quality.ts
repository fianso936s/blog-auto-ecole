export type ExperienceQuality = "desktopFull" | "desktopLite" | "mobileActivated";

export type ExperienceEligibility = {
  quality: ExperienceQuality;
  mobile: boolean;
  maxDpr: number;
  dynamicShadows: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

export function saveDataEnabled() {
  return Boolean((navigator as NavigatorWithConnection).connection?.saveData);
}

export function chooseExperienceQuality(): ExperienceEligibility {
  const mobile = window.matchMedia("(max-width: 1023px)").matches;
  if (mobile) {
    return { quality: "mobileActivated", mobile: true, maxDpr: 1, dynamicShadows: false };
  }
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const cores = navigator.hardwareConcurrency || 4;
  const lite = (typeof memory === "number" && memory <= 4) || cores <= 4;
  return lite
    ? { quality: "desktopLite", mobile: false, maxDpr: 1, dynamicShadows: false }
    : { quality: "desktopFull", mobile: false, maxDpr: 1.5, dynamicShadows: true };
}

export function webgl2Available() {
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }));
}
