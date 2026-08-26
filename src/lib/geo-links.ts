import { getServiceBySlug } from "@/data/services";
import type { City, Service } from "@/types";

/**
 * Shared helpers for the geographic internal-linking mesh. The service x state
 * x city pages exist only for a fixed window of each state's city file, so
 * every React component that links into that tier must agree with the build
 * scripts about which pages exist. Linking outside the window would target
 * URLs that are neither prerendered nor in the sitemap.
 */

// Number of cities per state that receive /services/<service>/<state>/<city>
// pages. MUST match `SERVICE_CITY_TOP` in scripts/prerender.mjs and
// `SERVICE_CITY_PRERENDER_TOP` in src/data/contentReadiness.ts - all slice
// each state's city file to its first N entries in file order. (The sitemap
// advertises a readiness-gated subset of these pages; the rest stay live,
// prerendered, and discovered through this link mesh.) Guarded by a parity
// test in geo-links.test.ts. contentReadiness.ts is deliberately NOT imported
// here: it eagerly pulls metro-labor data into whatever imports it.
export const SERVICE_CITY_TOP = 10;

// Only pillar services take part in the service x state x city cross-product.
// A `pillar: false` cross-sell (forensic economics) has no geographic tier at
// all; mirrors scripts/lib/service-slugs.mjs, which the build scripts use.

/** Services that have /services/<service>/<state>/<city> pages. */
export function serviceCityServices(all: Service[]): Service[] {
  return all.filter((s) => s.pillar);
}

/** True when the service has a city tier at all (non-pillar cross-sells do not). */
export function serviceHasCityPages(serviceSlug: string): boolean {
  return getServiceBySlug(serviceSlug)?.pillar === true;
}

/**
 * The cities in one state (in file order) that have service x city pages.
 * `cities` must be the full state city list from useStateCities/loadStateCities.
 */
export function serviceCityCities(cities: City[]): City[] {
  return cities.slice(0, SERVICE_CITY_TOP);
}

/** True when /services/<service>/<state>/<citySlug> pages exist for this city. */
export function hasServiceCityPages(cities: City[], citySlug: string): boolean {
  return serviceCityCities(cities).some((c) => c.slug === citySlug);
}

/** Great-circle distance in kilometers between two cities (haversine). */
function distanceKm(a: City, b: City): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h)); // 2 * mean Earth radius (6371 km)
}

/**
 * The `n` cities nearest to `citySlug` (excluding itself), by great-circle
 * distance. Falls back to file order when the origin city is not in the list.
 */
export function nearestCities(cities: City[], citySlug: string, n: number): City[] {
  const origin = cities.find((c) => c.slug === citySlug);
  const rest = cities.filter((c) => c.slug !== citySlug);
  if (!origin) return rest.slice(0, n);
  return [...rest]
    .sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b))
    .slice(0, n);
}
