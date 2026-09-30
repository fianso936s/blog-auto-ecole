import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  const visibleRef = useRef(false);
  const statusRef = useRef<Status>("poster");
  const launchRef = useRef(0);
  const [status, setStatus] = useState<Status>("poster");
  const [retryUsed, setRetryUsed] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [saveData, setSaveData] = useState(() => saveDataEnabled());
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 1023px)").matches);

  const setViewStatus = (next: Status) => {
    statusRef.current = next;
    setStatus(next);
  };
  const blockedNow = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || saveDataEnabled();

  const cleanupScene = (invalidatePending = true) => {
    if (invalidatePending) launchRef.current += 1;
    visibleRef.current = false;
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
      setRetryUsed(false);
      setViewStatus("poster");
    }
  }, [reduced, saveData]);

  useEffect(() => () => cleanupScene(), []);

  const start = async () => {
    if (statusRef.current === "loading" || statusRef.current === "active" || reduced || saveData || blockedNow() || !mountRef.current) return;
    if (!webgl2Available()) {
      setViewStatus("error");
      return;
    }
    const launchId = ++launchRef.current;
    setViewStatus("loading");
    try {
      const runtime = await Promise.race([
        loadRuntimeModules(),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("3D runtime timeout")), 8000)),
      ]);
      if (!mountRef.current || launchId !== launchRef.current || blockedNow()) {
        if (launchId === launchRef.current && blockedNow()) {
          setRetryUsed(false);
          setViewStatus("poster");
        }
        return;
      }
      cleanupScene(false);
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

      const observer = new IntersectionObserver(([entry]) => {
        visibleRef.current = entry.isIntersecting;
        controller.setVisible(entry.isIntersecting && !document.hidden);
      }, { rootMargin: "120px" });
      if (visual) observer.observe(visual);
      const resize = new ResizeObserver(() => controller.resize());
      resize.observe(mountRef.current);

      const canvas = mountRef.current.querySelector("canvas");
      const onContextLost = (event: Event) => {
        event.preventDefault();
        observer.disconnect();
        resize.disconnect();
        cleanupScene();
        setViewStatus("error");
      };
      canvas?.addEventListener("webglcontextlost", onContextLost, { once: true });

      const onVisibility = () => controller.setVisible(!document.hidden && visibleRef.current);
      document.addEventListener("visibilitychange", onVisibility);
      const originalDispose = controller.dispose;
      controller.dispose = () => {
        document.removeEventListener("visibilitychange", onVisibility);
        observer.disconnect();
        resize.disconnect();
        canvas?.removeEventListener("webglcontextlost", onContextLost);
        originalDispose();
      };

      setRetryUsed(false);
      setViewStatus("active");
      runtime.ScrollTrigger.refresh();
    } catch {
      cleanupScene();
      setViewStatus("error");
    }
  };

  useEffect(() => {
    if (mobile || reduced || saveData) return;
    return scheduleAfterLoad(() => { void start(); });
  }, [mobile, reduced, saveData]);

  const animationBlocked = reduced || saveData;
  const label = reduced ? "Animation désactivée selon vos préférences de mouvement." : saveData ? "Animation désactivée pour économiser les données." : null;
  const viewMode = animationBlocked ? "blocked" : status;
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
    <div id="wd-experience-stage" className="wd-experience-stage" data-status={status} aria-busy={status === "loading"}>
      <ExperiencePoster variant={mobile ? "mobile" : "desktop"} />
      <div ref={mountRef} className="wd-experience-webgl" aria-hidden="true" />
    </div>
    <div className="wd-experience-toolbar" data-status={status} data-mode={viewMode}>
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
          aria-controls="wd-experience-stage"
          disabled={status === "loading" || (status === "error" && retryUsed)}
        >
          {status === "loading" ? "Chargement de la 3D…" : status === "error" ? (retryUsed ? "Animation indisponible" : "Réessayer la 3D") : "Explorer en 3D"}
        </button>}
        {status === "active" && <button type="button" className="wd-experience-toggle" aria-controls="wd-experience-stage" onClick={() => { cleanupScene(); setRetryUsed(false); setViewStatus("poster"); }}>Désactiver l’animation</button>}
      </div>
    </div>
    <nav className="wd-experience-journey-nav" aria-label="Les trois étapes du parcours">
      <ol className="wd-experience-journey-rail">
        <li><Link to="/#experience" aria-label="Aller à l’étape Comprendre"><span>01</span><strong>Comprendre</strong></Link></li>
        <li><Link to="/#organiser" aria-label="Aller à l’étape Organiser"><span>02</span><strong>Organiser</strong></Link></li>
        <li><Link to="/#avancer" aria-label="Aller à l’étape Avancer"><span>03</span><strong>Avancer</strong></Link></li>
      </ol>
    </nav>
  </div>;
}
