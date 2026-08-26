// Regex extractors that turn the TypeScript geo data files into the plain
// inputs src/data/geo-prose.mjs expects. Used by scripts/prerender.mjs (which
// cannot import TypeScript) and by src/data/narratives.parity.test.mjs, which
// pins these extractions to the real TS modules so the prerendered shells and
// the hydrated React pages carry identical prose.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/** Split a `[{ stateSlug: "..." , ...}, ...]` data file into per-entry blocks. */
function blocksBy(content, key) {
  return content.split(new RegExp(`(?=\\n\\s*\\{\\s*\\n\\s*${key}:\\s*")`));
}

/** states.ts -> { [slug]: { name, region, population } } */
export function extractStateFacts(srcData) {
  const content = readFileSync(join(srcData, "states.ts"), "utf-8");
  const map = {};
  for (const block of blocksBy(content, "slug")) {
    const slug = block.match(/\bslug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const population = block.match(/population:\s*(\d+)/)?.[1];
    map[slug] = {
      name: block.match(/\bname:\s*"([^"]+)"/)?.[1] ?? slug,
      region: block.match(/region:\s*"([^"]+)"/)?.[1],
      population: population ? parseInt(population, 10) : undefined,
    };
  }
  return map;
}

/** courts/state-courts.ts -> { [slug]: { trialCourtName, supremeCourt, federalDistrictCount } } */
export function extractStateCourtsMap(srcData) {
  const content = readFileSync(join(srcData, "courts", "state-courts.ts"), "utf-8");
  const map = {};
  for (const block of blocksBy(content, "stateSlug")) {
    const slug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const federalDistricts =
      (block.match(/federalDistricts:\s*\[([\s\S]*?)\]/)?.[1] ?? "").match(/\bname:\s*"/g)?.length ?? 0;
    map[slug] = {
      supremeCourt: block.match(/supremeCourt:\s*"([^"]+)"/)?.[1],
      trialCourtName: block.match(/trialCourts:\s*\[\s*\{\s*name:\s*"([^"]+)"/)?.[1],
      federalDistrictCount: federalDistricts,
    };
  }
  return map;
}

/** regulations/state-regs.ts -> { [slug]: { careOversightAgency, practiceContext } } */
export function extractStateRegsMap(srcData) {
  const content = readFileSync(join(srcData, "regulations", "state-regs.ts"), "utf-8");
  const map = {};
  for (const block of blocksBy(content, "stateSlug")) {
    const slug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    map[slug] = {
      careOversightAgency: block.match(/careOversightAgency:\s*"([^"]+)"/)?.[1],
      practiceContext: block.match(/practiceContext:\s*"([^"]+)"/)?.[1],
    };
  }
  return map;
}

/** labor/metro-labor.ts -> { ["state/city"]: { topEmployers } } (employer names feed the medical-center filter only). */
export function extractMetroMap(srcData) {
  const content = readFileSync(join(srcData, "labor", "metro-labor.ts"), "utf-8");
  const map = {};
  for (const block of blocksBy(content, "citySlug")) {
    const citySlug = block.match(/citySlug:\s*"([^"]+)"/)?.[1];
    const stateSlug = block.match(/stateSlug:\s*"([^"]+)"/)?.[1];
    if (!citySlug || !stateSlug) continue;
    const employersBlock = block.match(/topEmployers:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    map[`${stateSlug}/${citySlug}`] = {
      topEmployers: [...employersBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]),
    };
  }
  return map;
}

/** cities/<state>.ts -> [{ slug, name, county, msaName }] in file order. */
export function extractCityRows(srcData, stateSlug) {
  const content = readFileSync(join(srcData, "cities", `${stateSlug}.ts`), "utf-8");
  const rows = [];
  for (const block of blocksBy(content, "slug")) {
    const slug = block.match(/\bslug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    rows.push({
      slug,
      name: block.match(/\bname:\s*"([^"]+)"/)?.[1] ?? slug,
      county: block.match(/county:\s*"([^"]+)"/)?.[1],
      msaName: block.match(/msaName:\s*"([^"]+)"/)?.[1],
    });
  }
  return rows;
}

/** All city files -> { [stateSlug]: rows } */
export function extractCityDataByState(srcData) {
  const map = {};
  for (const file of readdirSync(join(srcData, "cities"))) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const stateSlug = file.replace(".ts", "");
    map[stateSlug] = extractCityRows(srcData, stateSlug);
  }
  return map;
}
