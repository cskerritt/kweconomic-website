import { states } from "@/data/states";

/**
 * The /locations finder (Chris, 2026-11-25): a ZIP code, a state, or a city with its state, resolved to the page
 * that covers it. The same file ships on all three KW practice sites.
 *
 * A ZIP code resolves to its state through the first three digits (the USPS sectional center), so no ZIP table ships
 * to the browser; a city needs its state ("Hackensack, NJ" or "Hackensack New Jersey"), whose city list loads on
 * demand, and opens its city page when the site has one and the state page when it does not.
 */

export type LocationMatch =
  | { kind: "state"; stateSlug: string }
  | { kind: "city"; stateSlug: string; cityName: string }
  | { kind: "needs-state"; text: string }
  | { kind: "unknown-zip"; zip: string }
  | { kind: "none" };

type Range = [from: number, to: number, abbreviation: string];

// First-three-digit ranges, inclusive. Military (APO/FPO) prefixes 090-099, 340 and 962-966 are left out on purpose,
// as are the Freely Associated States (9694x), which the site has no page for.
const ZIP3: Range[] = [
  [5, 5, "NY"],
  [6, 7, "PR"],
  [8, 8, "VI"],
  [9, 9, "PR"],
  [10, 27, "MA"],
  [28, 29, "RI"],
  [30, 38, "NH"],
  [39, 49, "ME"],
  [50, 54, "VT"],
  [55, 55, "MA"],
  [56, 59, "VT"],
  [60, 69, "CT"],
  [70, 89, "NJ"],
  [100, 149, "NY"],
  [150, 196, "PA"],
  [197, 199, "DE"],
  [200, 200, "DC"],
  [201, 201, "VA"],
  [202, 205, "DC"],
  [206, 219, "MD"],
  [220, 246, "VA"],
  [247, 268, "WV"],
  [270, 289, "NC"],
  [290, 299, "SC"],
  [300, 319, "GA"],
  [320, 339, "FL"],
  [341, 349, "FL"],
  [350, 369, "AL"],
  [370, 385, "TN"],
  [386, 397, "MS"],
  [398, 399, "GA"],
  [400, 427, "KY"],
  [430, 459, "OH"],
  [460, 479, "IN"],
  [480, 499, "MI"],
  [500, 528, "IA"],
  [530, 549, "WI"],
  [550, 567, "MN"],
  [569, 569, "DC"],
  [570, 577, "SD"],
  [580, 588, "ND"],
  [590, 599, "MT"],
  [600, 629, "IL"],
  [630, 658, "MO"],
  [660, 679, "KS"],
  [680, 693, "NE"],
  [700, 715, "LA"],
  [716, 729, "AR"],
  [730, 732, "OK"],
  [733, 733, "TX"],
  [734, 749, "OK"],
  [750, 799, "TX"],
  [800, 816, "CO"],
  [820, 831, "WY"],
  [832, 838, "ID"],
  [840, 847, "UT"],
  [850, 865, "AZ"],
  [870, 884, "NM"],
  [885, 885, "TX"],
  [889, 898, "NV"],
  [900, 961, "CA"],
  [967, 968, "HI"],
  [970, 979, "OR"],
  [980, 994, "WA"],
  [995, 999, "AK"],
];

/** The state abbreviation for a five-digit ZIP code (ZIP+4 accepted), or undefined. */
export function stateForZip(zip: string): string | undefined {
  const m = /^(\d{5})(?:-?\d{4})?$/.exec(zip.trim());
  if (!m) return undefined;
  const five = Number(m[1]);
  // The one five-digit exception the ranges cannot hold: American Samoa shares Hawaii's 967.
  if (five === 96799) return "AS";
  const three = Math.floor(five / 100);
  if (three === 969) {
    const four = Math.floor(five / 10);
    if (four >= 9691 && four <= 9693 && five !== 96939) return "GU"; // 96939 is Palau
    if (four === 9695) return "MP";
    return undefined;
  }
  return ZIP3.find(([from, to]) => three >= from && three <= to)?.[2];
}

/** Lowercase, "st." and "saint" read alike, punctuation other than the comma dropped, spaces collapsed. */
export function normalizePlace(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\bst\.?(?=\s)/g, "saint")
    .replace(/\bft\.?(?=\s)/g, "fort")
    .replace(/\bmt\.?(?=\s)/g, "mount")
    .replace(/[^a-z0-9,\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const bySlug = new Map(states.map((s) => [s.slug, s]));
const byAbbreviation = new Map(states.map((s) => [s.abbreviation.toLowerCase(), s]));
const byName = new Map(states.map((s) => [normalizePlace(s.name), s]));
byName.set("washington dc", bySlug.get("district-of-columbia")!);
byName.set("washington d c", bySlug.get("district-of-columbia")!);
byName.set("dc", bySlug.get("district-of-columbia")!);
// Longest first, so "west virginia" wins over "virginia".
const namesLongestFirst = [...byName.keys()].sort((a, b) => b.length - a.length);

/**
 * Resolves what was typed without loading anything: a ZIP or a state alone is final; "city, state" names the state
 * and the city, which {@link findCitySlug} then checks against that state's city list.
 */
export function parseLocationQuery(raw: string): LocationMatch {
  const text = raw.trim();
  if (!text) return { kind: "none" };
  if (/^\d{5}(?:-?\d{4})?$/.test(text)) {
    const abbreviation = stateForZip(text);
    const state = abbreviation ? byAbbreviation.get(abbreviation.toLowerCase()) : undefined;
    return state ? { kind: "state", stateSlug: state.slug } : { kind: "unknown-zip", zip: text.slice(0, 5) };
  }
  if (/^\d+$/.test(text)) return { kind: "none" };

  // "Hackensack, NJ 07601": the city and state decide; a trailing ZIP adds nothing.
  const q = normalizePlace(text.replace(/[\s,]+\d{5}(?:-?\d{4})?$/, ""));
  const whole = q.replace(/,/g, "").trim();
  const alone = byName.get(whole) ?? byAbbreviation.get(whole);
  if (alone) return { kind: "state", stateSlug: alone.slug };

  // "City, ST" / "City, State": the part after the last comma is the state.
  const comma = q.lastIndexOf(",");
  if (comma > 0) {
    const tail = q.slice(comma + 1).trim();
    const city = q.slice(0, comma).replace(/,/g, " ").trim();
    const state = byName.get(tail) ?? byAbbreviation.get(tail);
    if (state && city) return { kind: "city", stateSlug: state.slug, cityName: city };
  }

  // "City ST" / "City State Name" with no comma: a state name or a two-letter abbreviation as the last word(s).
  const flat = whole;
  for (const name of namesLongestFirst) {
    if (flat.endsWith(` ${name}`)) {
      const city = flat.slice(0, -name.length - 1).trim();
      if (city) return { kind: "city", stateSlug: byName.get(name)!.slug, cityName: city };
    }
  }
  const last = flat.split(" ");
  if (last.length > 1) {
    const state = byAbbreviation.get(last[last.length - 1]);
    if (state) return { kind: "city", stateSlug: state.slug, cityName: last.slice(0, -1).join(" ") };
  }
  return { kind: "needs-state", text };
}

/** The city's slug in a state's list, matched on its normalized name, or undefined. */
// Names people type for a city the site files under another name.
const CITY_ALIASES: Record<string, string> = { "new york": "new york city", nyc: "new york city" };

export function findCitySlug(cities: { slug: string; name: string }[], cityName: string): string | undefined {
  const typed = normalizePlace(cityName);
  const want = CITY_ALIASES[typed] && cities.some((c) => normalizePlace(c.name) === CITY_ALIASES[typed]) && !cities.some((c) => normalizePlace(c.name) === typed) ? CITY_ALIASES[typed] : typed;
  return (
    cities.find((c) => normalizePlace(c.name) === want)?.slug ??
    cities.find((c) => c.slug === want.replace(/\s+/g, "-"))?.slug
  );
}

export function stateName(stateSlug: string): string {
  return bySlug.get(stateSlug)?.name ?? stateSlug;
}

/**
 * What a search does: the page to open, or the message to show. `loadCities` is the state's city list loader
 * (src/data/cities, loadStateCities); a load that fails opens the state page.
 */
export async function resolveLocation(
  query: string,
  loadCities: (stateSlug: string) => Promise<{ slug: string; name: string }[]>,
): Promise<{ path: string } | { message: string }> {
  const match = parseLocationQuery(query);
  switch (match.kind) {
    case "none":
      return { message: "Enter a ZIP code, or a city and state such as Hackensack, NJ." };
    case "unknown-zip":
      return { message: `We could not place ZIP code ${match.zip}. Try the city and state, or pick a state on the map.` };
    case "needs-state":
      return { message: `Add the state after "${match.text}", as in Hackensack, NJ, or pick a state on the map.` };
    case "state":
      return { path: `/locations/${match.stateSlug}` };
    case "city": {
      try {
        const citySlug = findCitySlug(await loadCities(match.stateSlug), match.cityName);
        // No page for that city: the state page lists every city the site covers there.
        return { path: citySlug ? `/locations/${match.stateSlug}/${citySlug}` : `/locations/${match.stateSlug}` };
      } catch {
        return { path: `/locations/${match.stateSlug}` };
      }
    }
  }
}
