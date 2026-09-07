import { stateCourts } from "./state-courts";

/**
 * The federal district courts, one entry per `federalDistricts` row in
 * state-courts.ts (the single source of the district names and reporter
 * abbreviations), each assigned to its circuit. Rendered at
 * /jurisdictions/federal/<slug> by src/pages/templates/FederalDistrict.tsx and
 * grouped by circuit on the jurisdictions hub. scripts/prerender.mjs and
 * scripts/generate-sitemap.mjs load this module for the same list.
 */
export interface FederalDistrict {
  slug: string;
  name: string;
  abbreviation: string;
  stateSlug: string;
  circuit: string;
}

/** The regional circuits in numeric order, the D.C. Circuit last. */
export const CIRCUIT_ORDER = [
  "First", "Second", "Third", "Fourth", "Fifth", "Sixth",
  "Seventh", "Eighth", "Ninth", "Tenth", "Eleventh", "D.C.",
] as const;

// Circuit assignment by state slug (src/data/states.ts). The District of
// Columbia sits in the D.C. Circuit; American Samoa has no district court.
const CIRCUIT_BY_STATE: Record<string, string> = {
  maine: "First", massachusetts: "First", "new-hampshire": "First", "rhode-island": "First", "puerto-rico": "First",
  connecticut: "Second", "new-york": "Second", vermont: "Second",
  delaware: "Third", "new-jersey": "Third", pennsylvania: "Third", "us-virgin-islands": "Third",
  maryland: "Fourth", "north-carolina": "Fourth", "south-carolina": "Fourth", virginia: "Fourth", "west-virginia": "Fourth",
  louisiana: "Fifth", mississippi: "Fifth", texas: "Fifth",
  kentucky: "Sixth", michigan: "Sixth", ohio: "Sixth", tennessee: "Sixth",
  illinois: "Seventh", indiana: "Seventh", wisconsin: "Seventh",
  arkansas: "Eighth", iowa: "Eighth", minnesota: "Eighth", missouri: "Eighth", nebraska: "Eighth", "north-dakota": "Eighth", "south-dakota": "Eighth",
  alaska: "Ninth", arizona: "Ninth", california: "Ninth", hawaii: "Ninth", idaho: "Ninth", montana: "Ninth", nevada: "Ninth", oregon: "Ninth", washington: "Ninth", guam: "Ninth", "northern-mariana-islands": "Ninth",
  colorado: "Tenth", kansas: "Tenth", "new-mexico": "Tenth", oklahoma: "Tenth", utah: "Tenth", wyoming: "Tenth",
  alabama: "Eleventh", florida: "Eleventh", georgia: "Eleventh",
  "district-of-columbia": "D.C.",
};

/** "Northern District of Alabama" -> "northern-district-of-alabama". */
export function districtSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the /, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const federalDistricts: FederalDistrict[] = stateCourts.flatMap((s) =>
  s.federalDistricts.map((d) => {
    const circuit = CIRCUIT_BY_STATE[s.stateSlug];
    if (!circuit) throw new Error(`federal-districts: no circuit for state ${s.stateSlug}`);
    return { slug: districtSlug(d.name), name: d.name, abbreviation: d.abbreviation, stateSlug: s.stateSlug, circuit };
  }),
);

export function getFederalDistrict(slug: string): FederalDistrict | undefined {
  return federalDistricts.find((d) => d.slug === slug);
}

/** Districts grouped by circuit, circuits in CIRCUIT_ORDER, districts in state-courts.ts order. */
export function districtsByCircuit(): Record<string, FederalDistrict[]> {
  const out: Record<string, FederalDistrict[]> = {};
  for (const c of CIRCUIT_ORDER) out[c] = [];
  for (const d of federalDistricts) out[d.circuit].push(d);
  return out;
}

/** The pillars most often retained in federal civil matters, in services.ts order. */
export const FEDERAL_SERVICE_SLUGS = [
  "lost-earnings-and-earning-capacity",
  "employment-and-wage-loss-damages",
  "lost-profits-and-commercial-damages",
  "business-valuation",
  "expert-rebuttal-and-report-review",
] as const;

/**
 * "the United States District Court for the District of New Jersey". The
 * territorial districts are named "District Court of Guam" and "District Court
 * for the Northern Mariana Islands", so the prefix is not repeated for them
 * (the same rule CaseTypeState.tsx applies to its venue sentence).
 */
export function federalCourtName(name: string): string {
  return /^District Court\b/.test(name) ? `the United States ${name}` : `the United States District Court for the ${name}`;
}

/** The other districts in the same state, for the "Related venues" list. */
export function siblingDistricts(district: FederalDistrict): FederalDistrict[] {
  return federalDistricts.filter((d) => d.stateSlug === district.stateSlug && d.slug !== district.slug);
}
