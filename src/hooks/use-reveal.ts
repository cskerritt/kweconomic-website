import { useEffect, useRef } from "react";

/**
 * Scroll-reveal hook. Returns a ref to attach to an element that carries the
 * `kw-reveal` class. When the element scrolls into view, `is-visible` is added
 * once (then the observer disconnects, so it never re-hides).
 *
 * SEO/no-JS safe: the hidden state is `.is-armed`, which only this effect adds
 * and only below the viewport, so prerendered HTML is visible before, during
 * and after hydration. If IntersectionObserver is missing or the user prefers
 * reduced motion, we reveal immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // The prerendered markup is visible before hydration (the hidden state is
    // .is-armed, which only this effect adds). An element already on screen
    // when the effect runs is left visible and marked at once, so nothing that
    // was painted blinks or fades; only an element below the viewport is
    // armed for the scroll reveal. The 0.92 mirrors the observer's -8% margin.
    const rect = el.getBoundingClientRect();
    const onScreen = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (prefersReduced || typeof IntersectionObserver === "undefined" || onScreen) {
      el.classList.add("is-visible");
      return;
    }

    el.classList.add("is-armed");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
