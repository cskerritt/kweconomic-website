import { pillarServices, serviceCaseTypePairs } from "./services";

/**
 * Release plan for the service x case type x state family
 * (/services/<service>/case/<case-type>/<state>, ServiceCaseTypeState.tsx).
 *
 * The pairs are the ones each pillar declares in services.ts
 * (serviceCaseTypePairs()); the states ship in four batches of 14, largest
 * metros first, one batch per weekly wave (plan Task 2). The React route
 * renders any declared pair in any state so the hub tier's links can be
 * tested; scripts/prerender.mjs and scripts/generate-sitemap.mjs write and
 * advertise only the released states, and the "By state" grids on the pair
 * and case-type x state pages link only those. Flip `released` in the wave
 * that ships the batch and nothing else has to change.
 */
export interface StateBatch {
  id: "A" | "B" | "C" | "D";
  released: boolean;
  states: string[];
}

export const STATE_BATCHES: StateBatch[] = [
  {
    id: "A",
    released: true, // wave 2, 2026-09-14
    states: ["california", "texas", "florida", "new-york", "pennsylvania", "illinois", "ohio", "georgia", "north-carolina", "michigan", "new-jersey", "virginia", "washington", "arizona"],
  },
  {
    id: "B",
    released: false,
    states: ["massachusetts", "tennessee", "indiana", "maryland", "missouri", "wisconsin", "colorado", "minnesota", "south-carolina", "alabama", "louisiana", "kentucky", "oregon", "oklahoma"],
  },
  {
    id: "C",
    released: false,
    states: ["connecticut", "utah", "iowa", "nevada", "arkansas", "mississippi", "kansas", "new-mexico", "nebraska", "idaho", "west-virginia", "hawaii", "new-hampshire", "maine"],
  },
  {
    id: "D",
    released: false,
    states: ["montana", "rhode-island", "delaware", "south-dakota", "north-dakota", "alaska", "vermont", "wyoming", "district-of-columbia", "puerto-rico", "guam", "us-virgin-islands", "american-samoa", "northern-mariana-islands"],
  },
];

/** The state slugs whose pages exist, in batch order. */
export function releasedStates(): string[] {
  return STATE_BATCHES.filter((b) => b.released).flatMap((b) => b.states);
}

/** Every declared service x case-type pair, in canonical order. */
export function declaredPairs(): { serviceSlug: string; typeSlug: string }[] {
  return serviceCaseTypePairs().map((p) => ({ serviceSlug: p.service.slug, typeSlug: p.caseTypeSlug }));
}

/** True when the pair is declared and the state's batch has shipped. */
export function isReleased(serviceSlug: string, typeSlug: string, stateSlug: string): boolean {
  if (!releasedStates().includes(stateSlug)) return false;
  const service = pillarServices().find((s) => s.slug === serviceSlug);
  return Boolean(service && service.caseTypes.includes(typeSlug));
}

/** The route of a service x case type x state page. */
export function serviceCaseStatePath(serviceSlug: string, typeSlug: string, stateSlug: string): string {
  return `/services/${serviceSlug}/case/${typeSlug}/${stateSlug}`;
}
