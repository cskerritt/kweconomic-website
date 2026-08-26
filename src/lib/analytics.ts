// Env-driven Google Analytics 4 loader. Activates ONLY when VITE_GA_MEASUREMENT_ID
// is set to a real `G-XXXX` id at build time (a public value, like the Turnstile
// SITE key). When unset/placeholder, every function is a no-op - the site ships
// analytics-ready but dormant until the id is provided, so no broken/placeholder
// gtag calls ever fire. SPA route changes are tracked manually via trackPageView.

const PLACEHOLDER = "G-XXXXXXXXXX";

/** A real GA4 id: `G-` followed by >= 4 alphanumerics, and not the all-X placeholder. */
export function isValidMeasurementId(id: string | undefined): boolean {
  return !!id && id !== PLACEHOLDER && /^G-[A-Z0-9]{4,}$/.test(id);
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** Inject gtag.js once (no-op if the id is unset/invalid or off-DOM). */
export function initAnalytics(): void {
  if (initialized || !isValidMeasurementId(GA_ID) || typeof document === "undefined") return;
  initialized = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // Manual page_view per SPA route change, so disable the automatic first one.
  window.gtag("config", GA_ID!, { send_page_view: false });
}

/** Send a GA4 page_view for an SPA navigation (no-op when analytics is dormant). */
export function trackPageView(path: string): void {
  if (!isValidMeasurementId(GA_ID) || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
