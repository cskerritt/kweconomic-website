import { useEffect, useRef } from "react";

/** True only on hover-capable, fine-pointer devices that don't prefer reduced motion. */
function fancyPointerEnabled(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * 3D tilt toward the cursor plus a glow that tracks the pointer. Attach the
 * returned ref to an element carrying the `kw-tilt` class (and, for the glow,
 * containing a `.kw-tilt-glow` child). No-ops on touch / reduced-motion.
 *
 * @param max maximum tilt in degrees (default 7)
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(max = 7) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !fancyPointerEnabled()) return;

    let raf = 0;
    let pending: { rx: number; ry: number; gx: number; gy: number } | null = null;

    const apply = () => {
      raf = 0;
      if (!pending) return;
      el.style.setProperty("--kw-rx", `${pending.rx.toFixed(2)}deg`);
      el.style.setProperty("--kw-ry", `${pending.ry.toFixed(2)}deg`);
      el.style.setProperty("--kw-gx", `${pending.gx.toFixed(1)}%`);
      el.style.setProperty("--kw-gy", `${pending.gy.toFixed(1)}%`);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      pending = {
        ry: (px - 0.5) * 2 * max,
        rx: -(py - 0.5) * 2 * max,
        gx: px * 100,
        gy: py * 100,
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.setProperty("--kw-rx", "0deg");
      el.style.setProperty("--kw-ry", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max]);

  return ref;
}

/**
 * Magnetic pull: the element drifts a few pixels toward the cursor while it is
 * near/over it, then springs back on leave. No-ops on touch / reduced-motion.
 *
 * @param strength fraction of the offset-from-center to follow (default 0.3)
 */
export function useMagnetic<T extends HTMLElement = HTMLAnchorElement>(strength = 0.3) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !fancyPointerEnabled()) return;

    let raf = 0;
    let pending: { x: number; y: number } | null = null;

    const apply = () => {
      raf = 0;
      if (pending) el.style.transform = `translate(${pending.x.toFixed(1)}px, ${pending.y.toFixed(1)}px)`;
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pending = {
        x: (e.clientX - (r.left + r.width / 2)) * strength,
        y: (e.clientY - (r.top + r.height / 2)) * strength,
      };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.transform = "";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [strength]);

  return ref;
}
