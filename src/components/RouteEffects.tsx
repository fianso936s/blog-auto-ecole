import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function RouteEffects() {
  const location = useLocation();
  const navigation = useNavigationType();
  useEffect(() => {
    // Preserve browser history restoration; a PUSH between layouts still receives focus.
    if (!location.hash && navigation === "POP") return;
    const frame = requestAnimationFrame(() => {
      let target: HTMLElement | null = null;
      if (location.hash) {
        try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
        target = document.querySelector<HTMLElement>("#site-content");
      }
      if (!target) return;
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (location.hash) target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.hash, navigation]);
  return null;
}
