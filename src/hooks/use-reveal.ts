import { useEffect, useRef } from "react";

/**
 * Scroll-reveal hook. Returns a ref to attach to an element that carries the
 * `kw-reveal` class. When the element scrolls into view, `is-visible` is added
 * once (then the observer disconnects, so it never re-hides).
 *
 * SEO/no-JS safe: the `kw-reveal` hidden state is gated behind `.js` in CSS, so
 * static/prerendered HTML stays visible. If IntersectionObserver is missing or
 * the user prefers reduced motion, we reveal immediately.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

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
