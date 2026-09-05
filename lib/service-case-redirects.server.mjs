// 301 for a service x case-type address the pillar does not declare.
//
// Only the pairs a pillar declares in src/data/services.ts (`caseTypes`) are
// pages: scripts/prerender.mjs writes a shell and scripts/generate-sitemap.mjs
// advertises a URL for exactly those pairs (serviceCaseTypePairs()), and
// ServiceCaseType.tsx sends an undeclared pair to the pillar. The all-pairs
// grid that used to be prerendered (every pillar x every case type) left
// addresses that nothing linked; each now resolves to its pillar page so a
// previously indexed URL never answers 404 (2026-09-05 site audit, T06/T09).
//
// Runtime-only, like lib/legacy-redirects.server.mjs: the Docker image carries
// server.js + lib/ and never src/ or scripts/, so the pair set is not read
// from the data module. `exists` answers whether a route has a prerendered
// shell in dist/ (server.js passes a filesystem check; tests pass a Set), and
// the shells say what is real: the pair is live when its own shell exists,
// and a pillar or case type is real when /services/<pillar> or
// /case-types/<case-type> has one. Anything else falls through to the 404.
const PAIR_ROUTE = /^\/services\/([a-z0-9-]+)\/case\/([a-z0-9-]+)$/;

/**
 * Resolve /services/<pillar>/case/<case-type> to `/services/<pillar>` when the
 * pair has no shell but both the pillar and the case type do. Null for a live
 * pair, for an unknown pillar or case type, and for every other path.
 */
export function resolveUndeclaredPairRedirect(pathname, exists) {
  const match = PAIR_ROUTE.exec(pathname.replace(/\/+$/, ""));
  if (!match) return null;
  const [path, pillarSlug, caseTypeSlug] = match;
  if (exists(path)) return null;
  const pillar = `/services/${pillarSlug}`;
  if (!exists(pillar) || !exists(`/case-types/${caseTypeSlug}`)) return null;
  return pillar;
}
