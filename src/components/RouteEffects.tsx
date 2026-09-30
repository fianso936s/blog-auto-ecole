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
      const scrollTarget = target.classList.contains("wd-anchor-alias")
        ? target.closest<HTMLElement>("section") ?? target
        : target;
      const focusTarget = target.id === "site-content"
        ? target
        : scrollTarget.matches("section")
          ? scrollTarget.querySelector<HTMLElement>("h1, h2, h3") ?? scrollTarget
          : target;
      document.querySelector<HTMLElement>('[data-route-focus-target="true"]')?.removeAttribute("data-route-focus-target");
      focusTarget.setAttribute("tabindex", "-1");
      if (focusTarget.id !== "site-content") focusTarget.setAttribute("data-route-focus-target", "true");
      focusTarget.focus({ preventScroll: true });
      if (location.hash) scrollTarget.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.hash, navigation]);
  return null;
}
