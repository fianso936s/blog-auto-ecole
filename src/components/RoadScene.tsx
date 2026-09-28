import { useEffect, useRef } from "react";

// Lightweight perspective illustration: Canvas2D, not a WebGL scene.
export default function RoadScene({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0, tick = 0, previous = 0, visible = true;
    const canAnimate = () => !paused && visible && !document.hidden;
    const draw = () => {
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (!width || !height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const pixelsW = Math.round(width * dpr), pixelsH = Math.round(height * dpr);
      if (canvas.width !== pixelsW || canvas.height !== pixelsH) { canvas.width = pixelsW; canvas.height = pixelsH; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const background = ctx.createLinearGradient(0, 0, 0, height);
      background.addColorStop(0, "#153D58"); background.addColorStop(1, "#092435");
      ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#0B2433"; ctx.beginPath();
      ctx.moveTo(width * .04, height); ctx.lineTo(width * .43, height * .38);
      ctx.lineTo(width * .57, height * .38); ctx.lineTo(width * .96, height); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#D7B98E"; ctx.lineWidth = 3; ctx.setLineDash([22, 24]); ctx.lineDashOffset = -(tick % 46);
      ctx.beginPath(); ctx.moveTo(width * .5, height); ctx.lineTo(width * .5, height * .4); ctx.stroke(); ctx.setLineDash([]);
    };
    const loop = (now: number) => {
      frame = 0;
      if (!canAnimate()) return;
      if (!previous || now - previous >= 1000 / 30) { tick += previous ? Math.min(now - previous, 60) * .027 : 0; previous = now; draw(); }
      frame = requestAnimationFrame(loop);
    };
    const refresh = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0; draw();
      if (canAnimate()) frame = requestAnimationFrame(loop);
    };
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refresh(); }) : null;
    const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(refresh) : null;
    observer?.observe(canvas); resize?.observe(canvas);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("resize", refresh, { passive: true });
    refresh();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); resize?.disconnect(); document.removeEventListener("visibilitychange", refresh); window.removeEventListener("resize", refresh); };
  }, [paused]);
  return <canvas ref={ref} className="wd-canvas" aria-hidden="true" />;
}
