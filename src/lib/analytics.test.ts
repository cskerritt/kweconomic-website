import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { isValidMeasurementId } from "./analytics";

describe("isValidMeasurementId", () => {
  it("accepts a well-formed GA4 measurement id", () => {
    expect(isValidMeasurementId("G-ABC123XYZ")).toBe(true);
    expect(isValidMeasurementId("G-1A2B3C")).toBe(true);
  });

  it("rejects empty or undefined", () => {
    expect(isValidMeasurementId("")).toBe(false);
    expect(isValidMeasurementId(undefined)).toBe(false);
  });

  it("rejects the all-X placeholder so a dormant deploy never sends data", () => {
    expect(isValidMeasurementId("G-XXXXXXXXXX")).toBe(false);
  });

  it("rejects malformed / legacy ids", () => {
    expect(isValidMeasurementId("UA-12345-1")).toBe(false);
    expect(isValidMeasurementId("ABC")).toBe(false);
    expect(isValidMeasurementId("G-")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Privacy gate. The suite runs in the node environment, so a minimal browser
// (window, document, navigator, localStorage) is stubbed per test and the module
// is re-imported so GA_ID picks up the stubbed build env.
// ---------------------------------------------------------------------------

const ID = "G-TEST1234";
const DISABLE_FLAG = `ga-disable-${ID}`;

interface FakeBrowser {
  win: Record<string, unknown> & { dataLayer?: ArrayLike<unknown>[]; gtag?: (...a: unknown[]) => void };
  scripts: { src: string }[];
  cookieWrites: string[];
  store: Map<string, string>;
  nav: { globalPrivacyControl?: boolean; doNotTrack?: string | null };
}

function installBrowser(opts: { pathname?: string; hostname?: string; cookie?: string; storageThrows?: boolean } = {}): FakeBrowser {
  const scripts: { src: string }[] = [];
  const cookieWrites: string[] = [];
  const store = new Map<string, string>();
  const nav: FakeBrowser["nav"] = {};
  const win: FakeBrowser["win"] = {
    location: {
      pathname: opts.pathname ?? "/",
      hostname: opts.hostname ?? "www.kweconomics.com",
      href: `https://kweconomics.com${opts.pathname ?? "/"}`,
    },
  };
  const doc = {
    title: "Test page",
    createElement: () => ({ src: "", async: false }),
    head: { appendChild: (el: { src: string }) => scripts.push(el) },
  };
  Object.defineProperty(doc, "cookie", {
    get: () => opts.cookie ?? "",
    set: (v: string) => cookieWrites.push(v),
  });
  const storage = {
    getItem: (k: string) => {
      if (opts.storageThrows) throw new Error("blocked");
      return store.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (opts.storageThrows) throw new Error("blocked");
      store.set(k, v);
    },
    removeItem: (k: string) => {
      if (opts.storageThrows) throw new Error("blocked");
      store.delete(k);
    },
  };
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", doc);
  vi.stubGlobal("navigator", nav);
  vi.stubGlobal("localStorage", storage);
  return { win, scripts, cookieWrites, store, nav };
}

async function loadModule(id: string | undefined = ID) {
  vi.resetModules();
  vi.stubEnv("VITE_GA_MEASUREMENT_ID", id ?? "");
  return import("./analytics");
}

/** dataLayer entries as plain arrays: [command, ...args]. */
const commands = (b: FakeBrowser) => (b.win.dataLayer ?? []).map((e) => Array.from(e as unknown[]));

describe("analytics privacy gate", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("isAnalyticsConfigured follows the build's measurement id", async () => {
    expect((await loadModule(ID)).isAnalyticsConfigured()).toBe(true);
    expect((await loadModule("")).isAnalyticsConfigured()).toBe(false);
    expect((await loadModule("G-XXXXXXXXXX")).isAnalyticsConfigured()).toBe(false);
  });

  it("loads nothing when the build has no measurement id", async () => {
    const b = installBrowser();
    const a = await loadModule("");
    a.initAnalytics();
    a.trackPageView("/about");
    expect(b.scripts).toHaveLength(0);
    expect(b.win.gtag).toBeUndefined();
  });

  it("hasPrivacySignal is false off-DOM (SSR / prerender) and with no signal", async () => {
    const a = await loadModule();
    vi.stubGlobal("navigator", undefined);
    expect(a.hasPrivacySignal()).toBe(false);
    installBrowser();
    expect(a.hasPrivacySignal()).toBe(false);
  });

  it("does not load analytics for a browser sending Global Privacy Control", async () => {
    const b = installBrowser();
    b.nav.globalPrivacyControl = true;
    const a = await loadModule();
    expect(a.hasPrivacySignal()).toBe(true);
    a.initAnalytics();
    a.trackPageView("/about");
    expect(b.scripts).toHaveLength(0);
    expect(b.win.gtag).toBeUndefined();
    expect(b.win[DISABLE_FLAG]).toBe(true);
  });

  it("does not load analytics for Do Not Track, on navigator or the legacy window flag", async () => {
    let b = installBrowser();
    b.nav.doNotTrack = "1";
    let a = await loadModule();
    expect(a.hasPrivacySignal()).toBe(true);
    a.initAnalytics();
    expect(b.scripts).toHaveLength(0);

    b = installBrowser();
    b.win.doNotTrack = "1";
    a = await loadModule();
    expect(a.hasPrivacySignal()).toBe(true);
    a.initAnalytics();
    expect(b.scripts).toHaveLength(0);

    b = installBrowser();
    b.nav.doNotTrack = "0";
    a = await loadModule();
    expect(a.hasPrivacySignal()).toBe(false);
  });

  it("does not load analytics once the visitor has opted out", async () => {
    const b = installBrowser();
    b.store.set("kw:analytics-optout", "1");
    const a = await loadModule();
    expect(a.ANALYTICS_OPT_OUT_KEY).toBe("kw:analytics-optout");
    expect(a.isAnalyticsOptedOut()).toBe(true);
    a.initAnalytics();
    a.trackPageView("/about");
    expect(b.scripts).toHaveLength(0);
    expect(b.win.gtag).toBeUndefined();
  });

  it("isAnalyticsOptedOut is false when storage throws", async () => {
    installBrowser({ storageThrows: true });
    const a = await loadModule();
    expect(a.isAnalyticsOptedOut()).toBe(false);
    expect(() => a.setAnalyticsOptOut(true)).not.toThrow();
  });

  it("setAnalyticsOptOut writes the key, sets the ga-disable flag, and expires the _ga cookies on the host and its parent", async () => {
    const b = installBrowser({ cookie: "_ga=GA1.1.1.1; theme=dark; _ga_TEST1234=GS1.1.2.3" });
    const a = await loadModule();
    a.setAnalyticsOptOut(true);
    expect(b.store.get("kw:analytics-optout")).toBe("1");
    expect(b.win[DISABLE_FLAG]).toBe(true);
    const expired = b.cookieWrites.join("\n");
    for (const name of ["_ga", "_ga_TEST1234"]) {
      expect(expired).toContain(`${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/\n`);
      expect(expired).toContain(`${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/; domain=www.kweconomics.com`);
      expect(expired).toContain(`${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/; domain=.kweconomics.com`);
    }
    expect(expired).not.toContain("theme=");

    a.setAnalyticsOptOut(false);
    expect(b.store.has("kw:analytics-optout")).toBe(false);
    expect(b.win[DISABLE_FLAG]).toBe(false);
  });

  it("pushes the consent default before the config call, with advertising denied", async () => {
    const b = installBrowser();
    const a = await loadModule();
    a.initAnalytics();
    expect(b.scripts).toHaveLength(1);
    expect(b.scripts[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${ID}`);
    const cmds = commands(b);
    const consentAt = cmds.findIndex((c) => c[0] === "consent");
    const configAt = cmds.findIndex((c) => c[0] === "config");
    expect(consentAt).toBe(0);
    expect(configAt).toBeGreaterThan(consentAt);
    expect(cmds[consentAt]).toEqual([
      "consent",
      "default",
      { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" },
    ]);
  });

  it("queues Arguments objects, not arrays: gtag.js ignores array entries on the dataLayer", async () => {
    const b = installBrowser();
    const a = await loadModule();
    a.initAnalytics();
    a.trackPageView("/about");
    expect(b.win.dataLayer!.length).toBeGreaterThanOrEqual(4);
    for (const entry of b.win.dataLayer!) {
      expect(Array.isArray(entry)).toBe(false);
      expect(Object.prototype.toString.call(entry)).toBe("[object Arguments]");
    }
  });

  it("configures with no automatic page_view, no Google signals, and no ad personalization", async () => {
    const b = installBrowser();
    const a = await loadModule();
    a.initAnalytics();
    a.initAnalytics();
    expect(b.scripts).toHaveLength(1);
    const config = commands(b).filter((c) => c[0] === "config");
    expect(config).toEqual([
      ["config", ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false }],
    ]);
  });

  it("sends a manual page_view on a measurable path", async () => {
    const b = installBrowser();
    const a = await loadModule();
    a.initAnalytics();
    a.trackPageView("/services");
    const views = commands(b).filter((c) => c[0] === "event");
    expect(views).toEqual([
      ["event", "page_view", { page_path: "/services", page_location: "https://kweconomics.com/", page_title: "Test page" }],
    ]);
    expect(b.win[DISABLE_FLAG]).toBe(false);
  });

  it("excludes no path on this site, and the mechanism matches a path and everything under it", async () => {
    const a = await loadModule();
    expect(a.ANALYTICS_EXCLUDED_PATHS).toEqual([]);
    for (const p of ["/", "/contact", "/schedule-consultation", "/white-papers", "/privacy"]) {
      expect(a.isAnalyticsExcludedPath(p)).toBe(false);
    }
    a.ANALYTICS_EXCLUDED_PATHS.push("/intake");
    expect(a.isAnalyticsExcludedPath("/intake")).toBe(true);
    expect(a.isAnalyticsExcludedPath("/intake/")).toBe(true);
    expect(a.isAnalyticsExcludedPath("/intake/step-2")).toBe(true);
    expect(a.isAnalyticsExcludedPath("/intake-guide")).toBe(false);
  });

  it("does not load gtag when the session starts on an excluded path, then loads lazily on the first measurable path", async () => {
    const b = installBrowser({ pathname: "/intake" });
    const a = await loadModule();
    a.ANALYTICS_EXCLUDED_PATHS.push("/intake");
    a.initAnalytics();
    a.trackPageView("/intake");
    expect(b.scripts).toHaveLength(0);
    expect(b.win.gtag).toBeUndefined();
    expect(b.win[DISABLE_FLAG]).toBe(true);

    a.trackPageView("/about");
    expect(b.scripts).toHaveLength(1);
    expect(b.win[DISABLE_FLAG]).toBe(false);
    const cmds = commands(b);
    expect(cmds[0][0]).toBe("consent");
    expect(cmds.filter((c) => c[0] === "event")).toHaveLength(1);

    a.trackPageView("/intake/step-2");
    expect(b.win[DISABLE_FLAG]).toBe(true);
    expect(commands(b).filter((c) => c[0] === "event")).toHaveLength(1);
  });
});
