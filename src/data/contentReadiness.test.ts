import { describe, expect, it } from "vitest";
import {
  SERVICE_CITY_PRERENDER_TOP,
  SERVICE_CITY_SITEMAP_TOP,
  isServiceCitySitemapReady,
  sitemapReadyCitySlugs,
} from "./contentReadiness";
import { newJerseyCities } from "./cities/new-jersey";

// Synthetic orderings exercise the policy; c0..c14 have no metro labor data.
const plain = Array.from({ length: 15 }, (_, i) => `c${i}`);

describe("sitemapReadyCitySlugs", () => {
  it("always keeps the first SERVICE_CITY_SITEMAP_TOP cities, in file order", () => {
    expect(sitemapReadyCitySlugs("alabama", plain)).toEqual(
      plain.slice(0, SERVICE_CITY_SITEMAP_TOP),
    );
  });

  it("keeps a metro-labor city ranked past the top slice but inside the prerender cut", () => {
    // hackensack has metro labor data for new-jersey; rank 7 here.
    const ordered = [...plain.slice(0, 7), "hackensack", ...plain.slice(7, 9)];
    const ready = sitemapReadyCitySlugs("new-jersey", ordered);
    expect(ready).toContain("hackensack");
    // Order preserved: hackensack stays at its file-order position.
    expect(ready).toEqual([...plain.slice(0, SERVICE_CITY_SITEMAP_TOP), "hackensack"]);
  });

  it("never reaches past the prerender cut, even for a metro-labor city", () => {
    const ordered = [...plain.slice(0, SERVICE_CITY_PRERENDER_TOP), "hackensack"];
    expect(sitemapReadyCitySlugs("new-jersey", ordered)).not.toContain("hackensack");
  });

  it("does not keep a non-metro city ranked past the top slice", () => {
    expect(sitemapReadyCitySlugs("alabama", plain)).not.toContain(
      plain[SERVICE_CITY_SITEMAP_TOP],
    );
  });

  it("metro membership is state-scoped (hackensack is not a texas metro)", () => {
    const ordered = [...plain.slice(0, 7), "hackensack", ...plain.slice(7, 9)];
    expect(sitemapReadyCitySlugs("texas", ordered)).not.toContain("hackensack");
  });

  it("handles states with fewer cities than the top slice", () => {
    expect(sitemapReadyCitySlugs("guam", plain.slice(0, 3))).toEqual(plain.slice(0, 3));
  });
});

describe("isServiceCitySitemapReady", () => {
  it("agrees with sitemapReadyCitySlugs", () => {
    const ordered = [...plain.slice(0, 7), "hackensack", ...plain.slice(7, 9)];
    expect(isServiceCitySitemapReady("new-jersey", "hackensack", ordered)).toBe(true);
    expect(isServiceCitySitemapReady("new-jersey", plain[6], ordered)).toBe(false);
  });
});

describe("real data invariants", () => {
  it("Hackensack (HQ) is sitemap-ready under the committed new-jersey city order", () => {
    const ordered = newJerseyCities.map((c) => c.slug);
    expect(isServiceCitySitemapReady("new-jersey", "hackensack", ordered)).toBe(true);
  });

  it("constants stay coherent", () => {
    expect(SERVICE_CITY_SITEMAP_TOP).toBeGreaterThan(0);
    expect(SERVICE_CITY_SITEMAP_TOP).toBeLessThanOrEqual(SERVICE_CITY_PRERENDER_TOP);
  });
});
