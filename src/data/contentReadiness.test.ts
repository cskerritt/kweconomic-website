import { describe, expect, it } from "vitest";
import {
  SERVICE_CITY_PRERENDER_TOP,
  SERVICE_CITY_SITEMAP_TOP,
  isServiceCitySitemapReady,
  sitemapReadyCitySlugs,
} from "./contentReadiness";
import { newJerseyCities } from "./cities/new-jersey";
import { newYorkCities } from "./cities/new-york";
import { texasCities } from "./cities/texas";

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

  // T08 decision (site audit 2026-09-05): the crawl-budget gate stays on all
  // three KW sites. Five cities per state are always advertised, the rest of
  // the ten prerendered cities only with metro labor data. Widening is a
  // deliberate change to SERVICE_CITY_SITEMAP_TOP (with the services child
  // ceiling in scripts/sitemap-index.test.mjs), made on Search Console
  // evidence, not a drift this test lets through.
  it("T08: the gate is pinned at 5 advertised of 10 prerendered cities per state", () => {
    expect(SERVICE_CITY_PRERENDER_TOP).toBe(10);
    expect(SERVICE_CITY_SITEMAP_TOP).toBe(5);
  });

  it("T08: the combos the audit listed as linked but unadvertised are gated by this function, inside the prerender window", () => {
    const nj = newJerseyCities.map((c) => c.slug);
    const ny = newYorkCities.map((c) => c.slug);
    const tx = texasCities.map((c) => c.slug);
    // Rank 5-9 cities without metro labor data: prerendered and linked from
    // the Service x State "Cities" grid, not in the sitemap.
    const gated: Array<[string, string, string[]]> = [
      ["new-jersey", "camden", nj],
      ["new-jersey", "morristown", nj],
      ["new-york", "rochester", ny],
      ["texas", "el-paso", tx],
      ["texas", "plano", tx],
    ];
    for (const [state, city, ordered] of gated) {
      const rank = ordered.indexOf(city);
      expect(rank, `${state}/${city} is in the prerender window past the top slice`).toBeGreaterThanOrEqual(SERVICE_CITY_SITEMAP_TOP);
      expect(rank, `${state}/${city} is prerendered`).toBeLessThan(SERVICE_CITY_PRERENDER_TOP);
      expect(isServiceCitySitemapReady(state, city, ordered), `${state}/${city} is gated`).toBe(false);
    }
    // The metro-labor exception still advertises the prerendered metro cities
    // past the top slice (Hackensack HQ, Buffalo, Albany).
    for (const [state, city, ordered] of [
      ["new-jersey", "hackensack", nj],
      ["new-york", "buffalo", ny],
      ["new-york", "albany", ny],
    ] as Array<[string, string, string[]]>) {
      expect(ordered.indexOf(city)).toBeGreaterThanOrEqual(SERVICE_CITY_SITEMAP_TOP);
      expect(isServiceCitySitemapReady(state, city, ordered), `${state}/${city} is ready`).toBe(true);
    }
  });
});
