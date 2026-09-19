// Env-driven Google Analytics 4 loader. Activates ONLY when VITE_GA_MEASUREMENT_ID
// is set to a real `G-XXXX` id at build time (a public value, like the Turnstile
// SITE key). When unset/placeholder, every function is a no-op - the site ships
// analytics-ready but dormant until the id is provided, so no broken/placeholder
// gtag calls ever fire. SPA route changes are tracked manually via trackPageView.
//
// Privacy gate (2026-09-18): even with an id set, gtag.js is never loaded for a
// browser sending Global Privacy Control or Do Not Track, for a browser that has
// used the opt-out control on /privacy, or on an excluded path. The gate ships
// while analytics is dormant so it can never switch on un-gated. /privacy reads
// isAnalyticsConfigured() to describe what the build actually does.

const PLACEHOLDER = "G-XXXXXXXXXX";

/** A real GA4 id: `G-` followed by >= 4 alphanumerics, and not the all-X placeholder. */
export function isValidMeasurementId(id: string | undefined): boolean {
  return !!id && id !== PLACEHOLDER && /^G-[A-Z0-9]{4,}$/.test(id);
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

/** localStorage key holding the visitor's analytics opt-out (value "1"). */
export const ANALYTICS_OPT_OUT_KEY = "kw:analytics-optout";

// Sensitive routes where analytics must not run (the path itself and anything
// under it). Empty on this site: the contact and consultation pages stay
// measurable. The list and its mechanism are kept so the file has the same
// shape across the sister sites. Exported so the unit tests can exercise the
// mechanism with a sample path.
export const ANALYTICS_EXCLUDED_PATHS: string[] = [];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

/** True when this build carries a valid GA4 measurement id. */
export function isAnalyticsConfigured(): boolean {
  return isValidMeasurementId(GA_ID);
}

/** True when the browser sends Global Privacy Control or Do Not Track. False off-DOM (SSR/prerender). */
export function hasPrivacySignal(): boolean {
  if (typeof navigator !== "undefined") {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string | null };
    if (nav.globalPrivacyControl === true || nav.doNotTrack === "1") return true;
  }
  if (typeof window !== "undefined") {
    // Legacy location of the DNT flag (older Safari / IE / Edge).
    if ((window as unknown as { doNotTrack?: string }).doNotTrack === "1") return true;
  }
  return false;
}

/** True when this browser has stored the analytics opt-out. False on any storage error. */
export function isAnalyticsOptedOut(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/** The GA-documented kill switch: while `window["ga-disable-<id>"]` is true, gtag.js sends no hit at all. */
function setGaDisabled(disabled: boolean): void {
  if (typeof window === "undefined" || !isValidMeasurementId(GA_ID)) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = disabled;
}

/** Expire the first-party `_ga` and `_ga_*` cookies for this hostname and its registrable parent. */
function expireGaCookies(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const names = (document.cookie || "")
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((n) => n === "_ga" || n.startsWith("_ga_"));
  if (names.length === 0) return;
  const host = window.location.hostname;
  const labels = host.split(".");
  const domains = ["", `; domain=${host}`];
  if (labels.length >= 2) domains.push(`; domain=.${labels.slice(-2).join(".")}`);
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domain}`;
    }
  }
}

/** Store or clear the opt-out for this browser. Opting out also stops every GA hit and expires GA's cookies. */
export function setAnalyticsOptOut(optOut: boolean): void {
  try {
    if (optOut) localStorage.setItem(ANALYTICS_OPT_OUT_KEY, "1");
    else localStorage.removeItem(ANALYTICS_OPT_OUT_KEY);
  } catch {
    // Storage blocked (private mode, cookie settings): the in-page flag below still applies to this visit.
  }
  setGaDisabled(optOut);
  if (optOut) expireGaCookies();
}

/** True for a sensitive route where analytics must not run: an excluded path or anything under it. */
export function isAnalyticsExcludedPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return ANALYTICS_EXCLUDED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

/** Analytics may load at all: configured, in a browser, no GPC/DNT signal, not opted out. */
function analyticsAllowed(): boolean {
  return (
    isValidMeasurementId(GA_ID) &&
    typeof document !== "undefined" &&
    typeof window !== "undefined" &&
    !hasPrivacySignal() &&
    !isAnalyticsOptedOut()
  );
}

function loadGtag(): void {
  if (initialized) return;
  initialized = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  // The canonical shim: gtag.js only processes `arguments` objects on the
  // dataLayer. A rest-parameter array is silently ignored, which would drop the
  // consent defaults and the config flags below.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- gtag.js requires the Arguments object itself
    window.dataLayer!.push(arguments);
  };
  // Consent defaults go in BEFORE the config call: measurement only, every
  // advertising purpose denied.
  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  window.gtag("js", new Date());
  // Manual page_view per SPA route change, so disable the automatic first one.
  // Google signals and ad personalization stay off.
  window.gtag("config", GA_ID!, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

/**
 * Inject gtag.js once. No-op when the id is unset/invalid, off-DOM, when the
 * browser sends GPC/DNT, when the visitor opted out, or when the first route is
 * an excluded path (trackPageView then loads it on the first measurable route).
 */
export function initAnalytics(): void {
  if (initialized || !analyticsAllowed()) return;
  if (isAnalyticsExcludedPath(window.location.pathname)) return;
  loadGtag();
}

/** Send a GA4 page_view for an SPA navigation (no-op when analytics is dormant, signalled off, or opted out). */
export function trackPageView(path: string): void {
  if (!isValidMeasurementId(GA_ID) || typeof window === "undefined") return;
  // GA4 enhanced measurement can emit history-change page_views on its own; the
  // ga-disable flag is the only client-side switch that stops every hit.
  if (isAnalyticsExcludedPath(path)) {
    setGaDisabled(true);
    return;
  }
  if (!analyticsAllowed()) {
    setGaDisabled(true);
    return;
  }
  setGaDisabled(false);
  // The session started on an excluded path: load on the first measurable route.
  if (!initialized) loadGtag();
  if (!window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}
