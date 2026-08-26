// Legacy FLAT-SLUG geo URL resolver (Search Console 404 remediation, 2026-08-18).
//
// The pre-2026 site published geographic pages under a single hyphen-joined
// /services/ segment instead of today's nested routes:
//
//   /services/<service>-<state>[-<city>]  e.g. /services/vocational-expert-texas-san-antonio
//   /services/state-<state>               e.g. /services/state-georgia
//   /services/city-<state>[-<city>]       e.g. /services/city-michigan-livonia
//   /services/cred-<cred>[-<state>]       e.g. /services/cred-clcp-florida
//   /services/<case-type>/<state>         e.g. /services/wrongful-death/north-dakota
//
// GSC still samples ~112 live 404s of these shapes. Parsing is ambiguous
// because service, state, and city slugs all contain hyphens, so we resolve by
// LONGEST-KNOWN-SLUG matching: longest service (or credential) slug prefix
// first, then the longest state slug, remainder = city slug (handles
// northern-mariana-islands, colorado-springs, etc.).
//
// The slug vocabularies and the page-existence checks both come straight from
// the prerendered dist/ tree - scripts/prerender.mjs writes
// dist/<route>/index.html for every REAL page from the same src/data files the
// React routes use, and server.js 404s anything without one - so a target
// returned here can never be a 404, and the vocabulary can never drift from
// the dataset (no generated slug lists to keep in sync). Every non-hub target
// is verified with hasPage() before it is returned; when a specific page does
// not exist we fall UP the hierarchy (city -> state -> pillar -> hub).
//
// Dependency-free plain ESM (like lib/intake-schema.mjs) - imported by
// server.js, which ships with only dist/ + lib/ in the Docker image.

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Subdirectory names of `root` that contain a prerendered index.html. */
function pageSlugs(root) {
  try {
    return readdirSync(root, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(join(root, e.name, "index.html")))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/**
 * Longest slug in `slugs` that `rest` equals or starts with as a full
 * hyphen-delimited prefix ("<slug>-..."). Returns null when nothing matches.
 */
export function longestSlugMatch(rest, slugs) {
  let best = null;
  for (const slug of slugs) {
    if (rest === slug || rest.startsWith(slug + "-")) {
      if (!best || slug.length > best.length) best = slug;
    }
  }
  return best;
}

/**
 * Build a resolver over the prerendered dist/ tree. Returns
 * `resolve(pathname) -> "/target" | null` (null = not a legacy flat-geo URL;
 * the caller's other redirect rules / static resolution proceed as usual).
 * Trailing slashes and case are normalized so `/services/state-georgia/`
 * resolves in ONE hop (before the generic trailing-slash 301).
 */
export function createLegacyGeoResolver({ distDir }) {
  const services = pageSlugs(join(distDir, "services"));
  const states = pageSlugs(join(distDir, "locations"));
  const credentials = pageSlugs(join(distDir, "credentials"));
  const caseTypes = pageSlugs(join(distDir, "case-types"));
  const serviceSet = new Set(services);
  const caseTypeSet = new Set(caseTypes);

  const hasPage = (...segs) => existsSync(join(distDir, ...segs, "index.html"));

  // Without a prerendered dist/ tree (should never happen in production -
  // server.js cannot even boot without dist/index.html) there is no slug
  // vocabulary to parse against, so decline everything rather than emit
  // hub-fallback redirects for URLs we cannot actually classify.
  const enabled = services.length > 0 && states.length > 0;

  return function resolveLegacyFlatGeo(pathname) {
    if (!enabled) return null;
    const p = pathname.toLowerCase().replace(/\/+$/, "");

    // ---- /services/<case-type>/<state> (old case-type-as-service trees) ----
    // Only when the first segment is a case type that is NOT also a live
    // service slug (matrimonial is both - /services/matrimonial/<state> is a
    // real page) and the second segment is a known state. Deeper children
    // (/services/wrongful-death/forensic-economist) stay with the existing
    // REDIRECT_PREFIXES entries in server.js.
    const two = p.match(/^\/services\/([a-z0-9-]+)\/([a-z0-9-]+)$/);
    if (two && caseTypeSet.has(two[1]) && !serviceSet.has(two[1]) && states.includes(two[2])) {
      const [, ct, state] = two;
      if (hasPage("case-types", ct, state)) return `/case-types/${ct}/${state}`;
      if (hasPage("case-types", ct)) return `/case-types/${ct}`;
      return "/case-types";
    }

    const one = p.match(/^\/services\/([a-z0-9-]+)$/);
    if (!one) return null;
    const seg = one[1];

    // ---- /services/state-<state> -> /locations/<state> ----
    if (seg.startsWith("state-")) {
      const state = longestSlugMatch(seg.slice("state-".length), states);
      return state && hasPage("locations", state) ? `/locations/${state}` : "/locations";
    }

    // ---- /services/city-<state>[-<city>] -> /locations/<state>[/<city>] ----
    if (seg.startsWith("city-")) {
      const rest = seg.slice("city-".length);
      const state = longestSlugMatch(rest, states);
      if (!state || !hasPage("locations", state)) return "/locations";
      const city = rest.length > state.length ? rest.slice(state.length + 1) : "";
      if (city && hasPage("locations", state, city)) return `/locations/${state}/${city}`;
      return `/locations/${state}`;
    }

    // ---- /services/cred-<cred>[-<state>] -> /credentials/<cred>[/<state>] ----
    if (seg.startsWith("cred-")) {
      const rest = seg.slice("cred-".length);
      const cred = longestSlugMatch(rest, credentials);
      if (!cred || !hasPage("credentials", cred)) return "/credentials";
      const stateRest = rest.length > cred.length ? rest.slice(cred.length + 1) : "";
      const state = stateRest ? longestSlugMatch(stateRest, states) : null;
      if (state && hasPage("credentials", cred, state)) return `/credentials/${cred}/${state}`;
      return `/credentials/${cred}`;
    }

    // ---- /services/<service>-<state>[-<city>] ----
    // Exact service slug = the live pillar (never redirected). An unknown geo
    // tail (e.g. the old /services/vocational-expert-newark-nj) keeps the
    // pre-existing collapse onto the service pillar.
    const svc = longestSlugMatch(seg, services);
    if (!svc || seg === svc) return null;
    const rest = seg.slice(svc.length + 1);
    const state = longestSlugMatch(rest, states);
    if (!state) return `/services/${svc}`;
    const city = rest.length > state.length ? rest.slice(state.length + 1) : "";
    if (city && hasPage("services", svc, state, city)) return `/services/${svc}/${state}/${city}`;
    if (hasPage("services", svc, state)) return `/services/${svc}/${state}`;
    return `/services/${svc}`;
  };
}
