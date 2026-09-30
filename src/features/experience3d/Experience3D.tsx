import { useEffect, useRef, useState } from "react";
import ExperiencePoster from "./ExperiencePoster";
import { createScene } from "./runtime/createScene";
import { chooseExperienceQuality, saveDataEnabled, webgl2Available } from "./runtime/quality";
import { loadRuntimeModules } from "./runtime/loadAssets";

type SceneController = ReturnType<typeof createScene>;
type Status = "poster" | "loading" | "active" | "error";

function scheduleAfterLoad(callback: () => void) {
  let cancelled = false;
  let idleId: number | undefined;
  const run = () => {
    const requestIdle = window.requestIdleCallback;
    if (requestIdle) {
      idleId = requestIdle(() => { if (!cancelled) callback(); }, { timeout: 1200 });
    } else {
      window.setTimeout(() => { if (!cancelled) callback(); }, 160);
    }
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", run);
    if (idleId !== undefined && window.cancelIdleCallback) window.cancelIdleCallback(idleId);
  };
}

export default function Experience3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SceneController | null>(null);
  const triggerRef = useRef<{ kill: () => void } | null>(null);
  const [status, setStatus] = useState<Status>("poster");
  const [retryUsed, setRetryUsed] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [saveData, setSaveData] = useState(() => saveDataEnabled());
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);

  const cleanupScene = () => {
    triggerRef.current?.kill();
    triggerRef.current = null;
    controllerRef.current?.dispose();
    controllerRef.current = null;
    mountRef.current?.replaceChildren();
  };

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const width = window.matchMedia("(max-width: 1023px)");
    const syncMotion = () => setReduced(motion.matches);
    const syncWidth = () => setMobile(width.matches);
    motion.addEventListener("change", syncMotion);
    width.addEventListener("change", syncWidth);
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const syncConnection = () => setSaveData(Boolean(connection?.saveData));
    connection?.addEventListener?.("change", syncConnection);
    return () => {
      motion.removeEventListener("change", syncMotion);
      width.removeEventListener("change", syncWidth);
      connection?.removeEventListener?.("change", syncConnection);
    };
  }, []);

  useEffect(() => {
    if (reduced || saveData) {
      cleanupScene();
      setStatus("poster");
    }
  }, [reduced, saveData]);

  useEffect(() => () => cleanupScene(), []);

  const start = async () => {
    if (status === "loading" || reduced || saveData || !mountRef.current) return;
    if (!webgl2Available()) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const runtime = await Promise.race([
        loadRuntimeModules(),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("3D runtime timeout")), 8000)),
      ]);
      if (!mountRef.current || reduced || saveData) return;
      cleanupScene();
      const quality = chooseExperienceQuality();
      const controller = createScene(runtime.THREE, mountRef.current, quality);
      controllerRef.current = controller;

      const visual = mountRef.current.closest(".wd-experience-visual");
      const story = document.getElementById("experience");
      const trigger = runtime.ScrollTrigger.create(quality.mobile ? {
        trigger: visual,
        start: "top bottom",
        end: "bottom top",
        scrub: false,
        onUpdate: (self: { progress: number }) => controller.setProgress(self.progress),
      } : {
        trigger: story,
        start: "top top+=72",
        end: "bottom bottom",
        scrub: false,
        onUpdate: (self: { progress: number }) => controller.setProgress(self.progress),
      });
      triggerRef.current = trigger;

      const observer = new IntersectionObserver(([entry]) => controller.setVisible(entry.isIntersecting), { rootMargin: "120px" });
      if (visual) observer.observe(visual);
      const resize = new ResizeObserver(() => controller.resize());
      resize.observe(mountRef.current);

      const canvas = mountRef.current.querySelector("canvas");
      const onContextLost = (event: Event) => {
        event.preventDefault();
        observer.disconnect();
        resize.disconnect();
        cleanupScene();
        setStatus("error");
      };
      canvas?.addEventListener("webglcontextlost", onContextLost, { once: true });

      const onVisibility = () => controller.setVisible(!document.hidden && Boolean(visual?.getBoundingClientRect()));
      document.addEventListener("visibilitychange", onVisibility);
      const originalDispose = controller.dispose;
      controller.dispose = () => {
        document.removeEventListener("visibilitychange", onVisibility);
        observer.disconnect();
        resize.disconnect();
        canvas?.removeEventListener("webglcontextlost", onContextLost);
        originalDispose();
      };

      setStatus("active");
      runtime.ScrollTrigger.refresh();
    } catch {
      cleanupScene();
      setStatus("error");
    }
  };

  useEffect(() => {
    if (mobile || reduced || saveData) return;
    return scheduleAfterLoad(() => { void start(); });
  }, [mobile, reduced, saveData]);

  const animationBlocked = reduced || saveData;
  const label = reduced ? "Animation désactivée selon vos préférences de mouvement." : saveData ? "Animation désactivée pour économiser les données." : null;
  const viewState = reduced
    ? "Vue fixe · mouvement réduit"
    : saveData
      ? "Vue fixe · économie de données"
      : status === "active"
        ? "3D interactive activée"
        : status === "loading"
          ? "Chargement de la vue 3D"
          : status === "error"
            ? "Vue fixe disponible"
            : "Aperçu illustré";

  return <div className="wd-experience-shell">
    <div className="wd-experience-stage" data-status={status} aria-busy={status === "loading"}>
      <ExperiencePoster variant={mobile ? "mobile" : "desktop"} />
      <div ref={mountRef} className="wd-experience-webgl" aria-hidden="true" />
    </div>
    <div className="wd-experience-toolbar" data-status={status}>
      <div className="wd-experience-toolbar-copy">
        <span>Vue du parcours</span>
        <strong aria-live="polite">{viewState}</strong>
      </div>
      <div className="wd-experience-controls">
        {label && <span className="wd-experience-disabled-note">{label}</span>}
        {!animationBlocked && status !== "active" && <button
          type="button"
          className="wd-experience-toggle"
          onClick={() => {
            if (status === "error") setRetryUsed(true);
            void start();
          }}
          disabled={status === "loading" || (status === "error" && retryUsed)}
        >
          {status === "loading" ? "Chargement de la 3D…" : status === "error" ? (retryUsed ? "Animation indisponible" : "Réessayer la 3D") : "Explorer en 3D"}
        </button>}
        {status === "active" && <button type="button" className="wd-experience-toggle" onClick={() => { cleanupScene(); setStatus("poster"); }}>Désactiver l’animation</button>}
      </div>
    </div>
    <ol className="wd-experience-journey-rail" aria-label="Les trois étapes du parcours">
      <li><span>01</span><strong>Comprendre</strong></li>
      <li><span>02</span><strong>Organiser</strong></li>
      <li><span>03</span><strong>Avancer</strong></li>
    </ol>
  </div>;
}
