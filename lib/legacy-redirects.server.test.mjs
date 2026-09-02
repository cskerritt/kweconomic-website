import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveLegacyRedirect, OLD_SERVICE_TARGETS } from "./legacy-redirects.server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");

// Prerendered routes stand in for dist/ so the suite runs without a build.
const PRERENDERED = new Set([
  "/services/lost-earnings-and-earning-capacity",
  "/services/lost-earnings-and-earning-capacity/new-jersey",
  "/services/lost-earnings-and-earning-capacity/new-jersey/hackensack",
  "/services/business-valuation",
  "/services/business-valuation/texas",
  "/services/lost-profits-and-commercial-damages",
  "/services/lost-profits-and-commercial-damages/ohio",
  "/services/life-care-plan-cost-projection",
  "/locations/new-jersey",
  "/locations/new-jersey/hackensack",
  "/locations/ohio",
  "/case-types/wrongful-death",
]);
const exists = (p) => PRERENDERED.has(p);

describe("resolveLegacyRedirect", () => {
  it("maps old service x state x city to the pillar page for that city when it exists", () => {
    expect(resolveLegacyRedirect("/services/economic-loss-assessment/new-jersey/hackensack", exists))
      .toBe("/services/lost-earnings-and-earning-capacity/new-jersey/hackensack");
  });
  it("falls back to the pillar x state page when the city is not prerendered", () => {
    expect(resolveLegacyRedirect("/services/economic-loss-assessment/new-jersey/kearny", exists))
      .toBe("/services/lost-earnings-and-earning-capacity/new-jersey");
  });
  it("falls back to the pillar hub when the state page is not prerendered", () => {
    expect(resolveLegacyRedirect("/services/economic-loss-assessment/ohio/akron", exists)).toBe("/services/lost-earnings-and-earning-capacity");
  });
  it("keeps the surviving business-valuation slug live and only redirects dropped cities", () => {
    expect(resolveLegacyRedirect("/services/business-valuation/texas/houston", exists)).toBe("/services/business-valuation/texas");
    expect(resolveLegacyRedirect("/services/business-valuation/ohio/akron", exists)).toBe("/services/business-valuation");
    expect(resolveLegacyRedirect("/services/business-valuation/texas", exists)).toBeNull();
    expect(resolveLegacyRedirect("/services/business-valuation/process", exists)).toBeNull();
  });
  it("maps old service hubs to pillars and unmapped old services to /services", () => {
    expect(resolveLegacyRedirect("/services/business-consulting", exists)).toBe("/services/lost-profits-and-commercial-damages");
    expect(resolveLegacyRedirect("/services/public-policy-analysis/ohio/akron", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/services/health-economics", exists)).toBe("/services/life-care-plan-cost-projection");
  });
  it("sends the sister-practice services to the sister sites", () => {
    expect(resolveLegacyRedirect("/services/vocational-evaluation/texas/houston", exists)).toBe("https://kwvrs.com/");
    expect(resolveLegacyRedirect("/services/disability-evaluation", exists)).toBe("https://kwvrs.com/");
    expect(resolveLegacyRedirect("/services/life-care-planning", exists)).toBe("https://kwlcp.com/");
    expect(resolveLegacyRedirect("/vocational-expert/anything", exists)).toBe("https://kwvrs.com/");
    expect(resolveLegacyRedirect("/life-care-planner", exists)).toBe("https://kwlcp.com/");
  });
  it("maps bare state and state/city routes into /locations", () => {
    expect(resolveLegacyRedirect("/new-jersey", exists)).toBe("/locations/new-jersey");
    expect(resolveLegacyRedirect("/new-jersey/", exists)).toBe("/locations/new-jersey");
    expect(resolveLegacyRedirect("/new-jersey/hackensack", exists)).toBe("/locations/new-jersey/hackensack");
    expect(resolveLegacyRedirect("/ohio/akron", exists)).toBe("/locations/ohio");
    expect(resolveLegacyRedirect("/wyoming/cheyenne", exists)).toBe("/locations");
  });
  it("maps the retired core routes", () => {
    expect(resolveLegacyRedirect("/experience", exists)).toBe("/team");
    expect(resolveLegacyRedirect("/advisory", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/calculators", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/calculators/present-value", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/tools/anything", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/emergency-consultation", exists)).toBe("/contact");
    expect(resolveLegacyRedirect("/search", exists)).toBe("/");
    expect(resolveLegacyRedirect("/blog/some-post", exists)).toBe("/insights");
    expect(resolveLegacyRedirect("/economic-damages/foo", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/lost-earnings/bar", exists)).toBe("/services/lost-earnings-and-earning-capacity");
    expect(resolveLegacyRedirect("/business-valuation/new-york", exists)).toBe("/services/business-valuation");
  });
  it("leaves live routes alone", () => {
    for (const p of [
      "/", "/about", "/team", "/contact", "/services", "/services/business-valuation",
      "/services/business-valuation/texas", "/services/business-valuation/cost",
      "/services/business-valuation/case/divorce-and-marital-dissolution",
      "/locations/ohio", "/case-types/wrongful-death", "/guides/what-is-a-forensic-economist",
      "/jurisdictions", "/attorneys/trial/wrongful-death", "/api/contact", "/healthz",
      "/assets/index-abc.js", "/sitemap.xml", "/llms.txt", "/searching-for-something",
    ]) {
      expect(resolveLegacyRedirect(p, exists), p).toBeNull();
    }
  });
  it("covers all 21 old service slugs", () => {
    expect(Object.keys(OLD_SERVICE_TARGETS).length).toBe(21);
  });
  it("resolves every sampled old sitemap URL to a live target or a sister site", () => {
    const sample = readFileSync(join(ROOT, "test/fixtures/legacy-sitemap-sample.txt"), "utf8")
      .split("\n").filter(Boolean);
    expect(sample.length).toBeGreaterThan(250);
    // Routes that exist on the new site (fixed routes plus the pillar x state tier).
    const LIVE_FIXED = new Set(["/", "/services", "/contact", "/team", "/about", "/insights", "/knowledge",
      "/locations", "/case-studies", "/schedule-consultation", "/case-types"]);
    const liveExists = (p) =>
      LIVE_FIXED.has(p) || /^\/services\/[a-z-]+(\/[a-z-]+)?$/.test(p) || /^\/locations\/[a-z-]+$/.test(p);
    for (const old of sample) {
      const target = resolveLegacyRedirect(old, liveExists);
      if (target === null) {
        expect(liveExists(old), `${old} is neither redirected nor live`).toBe(true);
        continue;
      }
      expect(target.startsWith("https://") || liveExists(target), `${old} -> ${target}`).toBe(true);
    }
  });
});
