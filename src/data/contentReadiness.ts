import { getMetroLabor } from "./labor/metro-labor";

/**
 * Content-readiness gate for sitemap inclusion (crawl-budget concentration).
 *
 * Background: the Service x State x City combo pages are the thinnest tier of
 * the geographic coverage - most cities share state-level labor data, so the
 * combos differ mainly by name substitution. Advertising all of them in the
 * sitemap spreads Google's crawl budget so thin that thousands of URLs sit in
 * "Discovered - currently not indexed" and never get crawled at all.
 *
 * This module decides which combos are "sitemap-ready". Gated pages are NOT
 * removed, noindexed, or unlinked - they stay live, prerendered, and reachable
 * through the Service x State "Cities" grid; they are simply not advertised in
 * the sitemap, so the crawler spends its budget on the pages with the deepest
 * unique content first. Widen the gate (or add metro labor data) as combo
 * content deepens.
 *
 * Readiness signal, per state, in city-file order (src/data/cities/<state>.ts,
 * curated roughly by metro size):
 *   1. the first SERVICE_CITY_SITEMAP_TOP cities are always ready, and
 *   2. any other PRERENDERED city (first SERVICE_CITY_PRERENDER_TOP in file
 *      order) with dedicated metro-level labor data (metro-labor.ts) is ready -
 *      those pages render metro-specific content, e.g. Hackensack (HQ), Buffalo,
 *      Albany.
 * Everything past the prerender cut is never ready: only prerendered combos
 * may ride the sitemap (a sitemap URL must resolve to a static dist/ page).
 *
 * T08 decision (site audit 2026-09-05). The audit listed the 2,772 combo pages
 * the "Cities" grid links but the sitemap leaves out and asked whether to
 * advertise them all. Decision, for all three KW sites: the gate stays. Those
 * pages remain prerendered, internally linked, self-canonical, and indexable;
 * they are unadvertised until Search Console evidence supports widening.
 * Widening = set SERVICE_CITY_SITEMAP_TOP to SERVICE_CITY_PRERENDER_TOP (10)
 * and raise the services child ceiling in scripts/sitemap-index.test.mjs
 * (4,000 to 7,000) in the same change. Evidence needed first: Search Console
 * page-indexing coverage and impressions for gated vs advertised combos over
 * 4-6 weeks (README, "Facts to confirm").
 *
 * Consumed by scripts/generate-sitemap.mjs (via vite ssrLoadModule, like
 * scripts/generate-llms.mjs loads data modules). Not imported by the app
 * bundle - keep it that way, or the eager import graph grows.
 */

/**
 * Cities per state that get a prerendered Service x State x City page.
 * Must match SERVICE_CITY_TOP in scripts/prerender.mjs (same file-order
 * slice); scripts/sitemap-index.test.mjs pins the two constants together.
 */
export const SERVICE_CITY_PRERENDER_TOP = 10;

/**
 * File-order rank (0-based) below which a prerendered combo city is always
 * sitemap-ready, regardless of metro labor coverage. Kept at 5 by the T08
 * decision above; contentReadiness.test.ts pins it.
 */
export const SERVICE_CITY_SITEMAP_TOP = 5;

/**
 * The sitemap-ready subset of a state's cities for Service x State x City
 * combo pages, in file order. `orderedCitySlugs` is the state's full city
 * slug list in src/data/cities/<state>.ts file order.
 */
export function sitemapReadyCitySlugs(
  stateSlug: string,
  orderedCitySlugs: readonly string[],
): string[] {
  return orderedCitySlugs
    .slice(0, SERVICE_CITY_PRERENDER_TOP)
    .filter(
      (citySlug, rank) =>
        rank < SERVICE_CITY_SITEMAP_TOP ||
        getMetroLabor(stateSlug, citySlug) !== undefined,
    );
}

/** Whether one Service x State x City combo page is sitemap-ready. */
export function isServiceCitySitemapReady(
  stateSlug: string,
  citySlug: string,
  orderedCitySlugs: readonly string[],
): boolean {
  return sitemapReadyCitySlugs(stateSlug, orderedCitySlugs).includes(citySlug);
}
