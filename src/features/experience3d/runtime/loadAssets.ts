const THREE_MODULE_URL = "https://esm.sh/three@0.186.1";
const GSAP_MODULE_URL = "https://esm.sh/gsap@3.15.0";
const SCROLL_TRIGGER_URL = "https://esm.sh/gsap@3.15.0/ScrollTrigger";

export type RuntimeModules = {
  THREE: any;
  gsap: any;
  ScrollTrigger: any;
};

let runtimePromise: Promise<RuntimeModules> | null = null;

export function loadRuntimeModules(): Promise<RuntimeModules> {
  if (runtimePromise) return runtimePromise;
  runtimePromise = Promise.all([
    import(/* @vite-ignore */ THREE_MODULE_URL),
    import(/* @vite-ignore */ GSAP_MODULE_URL),
    import(/* @vite-ignore */ SCROLL_TRIGGER_URL),
  ]).then(([THREE, gsapModule, scrollModule]) => {
    const gsap = gsapModule.gsap ?? gsapModule.default ?? gsapModule;
    const ScrollTrigger = scrollModule.ScrollTrigger ?? scrollModule.default;
    gsap.registerPlugin(ScrollTrigger);
    return { THREE, gsap, ScrollTrigger };
  });
  return runtimePromise;
}
