// 301 map from the retired kweconomics.com routes (the cskerritt/kweconomics
// site: 22,418 sitemap URLs across 22 old service slugs, 56 states, and the
// old city lists) to the closest page on this site. Runtime-only: the Docker
// image carries server.js + lib/ and never scripts/ or src/, so the state
// slugs and the old service slugs are spelled here. `exists` answers whether
// a route has a prerendered shell in dist/ (server.js passes a filesystem
// check; tests pass a Set), so a redirect never lands on a 404.
const KWVRS = "https://kwvrs.com/";
const KWLCP = "https://kwlcp.com/";

export const STATE_SLUGS = new Set([
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware",
  "district-of-columbia", "florida", "georgia", "hawaii", "idaho", "illinois", "indiana", "iowa",
  "kansas", "kentucky", "louisiana", "maine", "maryland", "massachusetts", "michigan", "minnesota",
  "mississippi", "missouri", "montana", "nebraska", "nevada", "new-hampshire", "new-jersey",
  "new-mexico", "new-york", "north-carolina", "north-dakota", "ohio", "oklahoma", "oregon",
  "pennsylvania", "rhode-island", "south-carolina", "south-dakota", "tennessee", "texas", "utah",
  "vermont", "virginia", "washington", "west-virginia", "wisconsin", "wyoming",
  "puerto-rico", "guam", "us-virgin-islands", "u-s-virgin-islands", "virgin-islands",
  "american-samoa", "northern-mariana-islands",
]);

// Old service slug -> pillar slug, null (no equivalent; send to /services),
// or a sister-practice URL.
export const OLD_SERVICE_TARGETS = {
  "economic-loss-assessment": "lost-earnings-and-earning-capacity",
  "expert-testimony": "lost-earnings-and-earning-capacity",
  "labor-economics-consulting": "lost-earnings-and-earning-capacity",
  "labor-market-employment-studies": "lost-earnings-and-earning-capacity",
  "econometrics-data-science": "lost-earnings-and-earning-capacity",
  "finance-investment-economics": "lost-earnings-and-earning-capacity",
  "business-valuation": "business-valuation",
  "business-consulting": "lost-profits-and-commercial-damages",
  "cost-benefit-roi-analysis": "lost-profits-and-commercial-damages",
  "pricing-strategy": "lost-profits-and-commercial-damages",
  "market-analysis-forecasting": "lost-profits-and-commercial-damages",
  "economic-impact-studies": "lost-profits-and-commercial-damages",
  "health-economics": "life-care-plan-cost-projection",
  "public-policy-analysis": null,
  "program-evaluation": null,
  "regulatory-impact-assessments": null,
  "education-economics": null,
  "international-development-economics": null,
  "vocational-evaluation": KWVRS,
  "disability-evaluation": KWVRS,
  "life-care-planning": KWLCP,
};

// Retired top-level prefixes -> target. Matched as the whole path or as a
// prefix followed by "/".
const PREFIX_TARGETS = [
  ["/vocational-expert", KWVRS],
  ["/disability-evaluation", KWVRS],
  ["/life-care-planner", KWLCP],
  ["/lost-earnings", "/services/lost-earnings-and-earning-capacity"],
  ["/present-value", "/services/lost-earnings-and-earning-capacity"],
  ["/wrongful-death-damages", "/services/wrongful-death-economic-loss"],
  ["/business-valuation", "/services/business-valuation"],
  ["/business-damages", "/services/lost-profits-and-commercial-damages"],
  ["/commercial-damages", "/services/lost-profits-and-commercial-damages"],
  ["/personal-injury-economist", "/services/personal-injury-economic-damages"],
  ["/forensic-economist", "/services"],
  ["/expert-witness", "/services"],
  ["/practice-areas", "/services"],
  ["/economic-damages", "/services"],
  ["/vendor", "/services"],
  ["/tools", "/services"],
  ["/calculators", "/services"],
  ["/advisory", "/services"],
  ["/blog", "/insights"],
  ["/experience", "/team"],
  ["/emergency-consultation", "/contact"],
  ["/search", "/"],
];

const isSlug = (s) => /^[a-z0-9-]+$/.test(s);

/**
 * Resolve a legacy pathname to its 301 target: an absolute path on this site,
 * an absolute https URL on a sister site, or null when the path is not a
 * legacy route (the caller then serves it normally).
 */
export function resolveLegacyRedirect(pathname, exists) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path.startsWith("/api/") || path.startsWith("/assets/")) return null;
  const parts = path.split("/").slice(1);

  // /services/<old>[/<state>[/<city>]]
  if (parts[0] === "services" && parts.length >= 2 && Object.hasOwn(OLD_SERVICE_TARGETS, parts[1])) {
    const target = OLD_SERVICE_TARGETS[parts[1]];
    if (target === null) return "/services";
    if (target.startsWith("https://")) return target;
    const [, , state, city] = parts;
    if (target === parts[1]) {
      // The slug survived the rebuild (business-valuation): the pillar, its
      // cost/process/timeline and case routes, and every prerendered state or
      // city page are live and must not redirect. Only an old city that was
      // not carried over falls back to the state page.
      if (!state || !STATE_SLUGS.has(state)) return null;
      if (exists(path)) return null;
      if (city && exists(`/services/${target}/${state}`)) return `/services/${target}/${state}`;
      return `/services/${target}`;
    }
    if (state && STATE_SLUGS.has(state)) {
      if (city && isSlug(city) && exists(`/services/${target}/${state}/${city}`)) {
        return `/services/${target}/${state}/${city}`;
      }
      if (exists(`/services/${target}/${state}`)) return `/services/${target}/${state}`;
    }
    return `/services/${target}`;
  }

  // /<state>[/<city>]
  if (STATE_SLUGS.has(parts[0]) && parts.length <= 2) {
    const [state, city] = parts;
    if (city && isSlug(city) && exists(`/locations/${state}/${city}`)) return `/locations/${state}/${city}`;
    if (exists(`/locations/${state}`)) return `/locations/${state}`;
    return "/locations";
  }

  for (const [prefix, target] of PREFIX_TARGETS) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return target;
  }
  return null;
}
