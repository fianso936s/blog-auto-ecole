// Dialogs and Safari's browser bars can change the container without a window resize.
export function observeMapSize(container: HTMLElement, map: {resize: () => unknown}) {
  let frame = 0, width = -1, height = -1, disposed = false;
  const measure = () => {
    frame = 0;
    if (disposed) return;
    const w = container.clientWidth, h = container.clientHeight;
    if (w > 0 && h > 0 && (w !== width || h !== height)) {
      width = w; height = h;
      map.resize();
    }
  };
  const schedule = () => {
    if (!frame && !disposed) frame = window.requestAnimationFrame(measure);
  };
  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
  observer?.observe(container);
  window.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("resize", schedule);
  schedule();
  return () => {
    disposed = true; observer?.disconnect(); window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("resize", schedule);
  };
}
