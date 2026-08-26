import type { City } from "@/types";

// Each US state/territory's cities live in its own file (e.g. ./california.ts,
// with a single `export const <state>Cities: City[]`). They are loaded LAZILY
// per visited state via import.meta.glob, so a geo page ships only the one
// state's cities it renders - not all 56 (~177 KB) at once. Vite code-splits
// each state file into its own chunk.
//
// NOTE: the build scripts (scripts/prerender.mjs, scripts/generate-sitemap.mjs)
// read these source files directly with readFileSync and do NOT import this
// module, so this Vite-only glob does not affect the build pipeline.
const stateModules = import.meta.glob(["./*.ts", "!./index.ts", "!./*.test.ts"]) as Record<
  string,
  () => Promise<Record<string, City[]>>
>;

/** Slugs of all states/territories that have a city file (no data loaded). */
export function getStatesWithCities(): string[] {
  return Object.keys(stateModules).map((p) => p.slice(2, -3)); // "./x.ts" -> "x"
}

/** Lazily load one state's cities (empty array for an unknown slug). */
export async function loadStateCities(stateSlug: string): Promise<City[]> {
  const loader = stateModules[`./${stateSlug}.ts`];
  if (!loader) return [];
  const mod = await loader();
  // Each file has exactly one export (the cities array).
  return (Object.values(mod)[0] as City[] | undefined) ?? [];
}

/** Lazily resolve one city within a state. */
export async function loadCityBySlug(
  stateSlug: string,
  citySlug: string,
): Promise<City | undefined> {
  const cities = await loadStateCities(stateSlug);
  return cities.find((c) => c.slug === citySlug);
}
