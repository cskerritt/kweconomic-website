// Build-time generator for workflow/lib/intake-geo.mjs — the committed,
// pre-projected US map geometry the /admin/intake-map page paints server-side.
// Run with Node 22 (the default Node 25 on this Mac is broken):
//
//   npm i --no-save d3-geo topojson-client us-atlas   # NOT committed to any package.json
//   node scripts/build-intake-geo.mjs [path/to/2023_Gaz_place_national.txt]
//
// The one-off dev deps (d3-geo, topojson-client, us-atlas) are installed ad-hoc
// and never committed — only this script's OUTPUT (workflow/lib/intake-geo.mjs)
// is committed, so the workflow service ships zero runtime map deps.
//
// DATA SOURCES (both US-Government / open, safe to redistribute the derived asset):
//   • State polygons — us-atlas `states-10m.json` (ISC-licensed TopoJSON; the
//     underlying geometry is US Census Bureau cartographic boundary files,
//     public domain, 17 U.S.C. §105). Loaded from the installed `us-atlas` pkg.
//   • City points — US Census Bureau 2023 National Places Gazetteer,
//     `2023_Gaz_place_national.txt` (public domain). Download + unzip once:
//     https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_place_national.zip
//     and pass the .txt path as argv[2]. If omitted/unreadable, the script still
//     writes a valid asset with EMPTY PLACE_XY (state-centroid tier still works)
//     and prints a warning to re-run with the gazetteer for city-level dots.
//   • Town/township points (OPTIONAL, gap-fill) — US Census Bureau 2023 National
//     County Subdivisions Gazetteer, `2023_Gaz_cousubs_national.txt` (public
//     domain), passed as argv[3]. The place file OMITS the municipal MCDs that
//     ARE the functional towns/townships across the Northeast (New England towns
//     are 100% MCDs; several major NJ townships — Edison, Cherry Hill, Hamilton —
//     are absent from the place file too). To cover KWVRS's core service area
//     without doubling the asset with plains-state "Township 12 N" noise, cousub
//     rows are merged ONLY for the Northeast MCD states (NJ + the 6 New England
//     states) and ONLY as a GAP-FILL: a place-file key always wins over a cousub
//     key. Omitting argv[3] just yields place-only coverage (towns fall to the
//     page's state-centroid tier, never dropped).
//     https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_cousubs_national.zip
//
// PROJECTION ALIGNMENT (the load-bearing detail):
//   us-atlas `states-10m.json` is in GEOGRAPHIC coordinates (its TopoJSON
//   `transform.translate` is lon/lat, ~[-179, -14.5]) — NOT pre-projected. So
//   BOTH the state polygons AND every Census place are run through the SAME live
//   `geoAlbersUsa().scale(1300).translate([487.5, 305])` projection (the us-atlas
//   975×610 convention). Using one projection object for both GUARANTEES a place
//   at [lon,lat] inside a state's polygon lands inside that state's projected
//   `<path>` — with no runtime projection math at all. (The design's note about
//   `geoPath(null)` identity applies to the pre-projected `states-albers-10m.json`;
//   we deliberately use the geographic file + a live projection instead, which is
//   more robust — alignment cannot drift from whatever params the albers file was
//   baked with.) geoAlbersUsa covers the 50 states + DC only; PR/GU/VI/AS/MP
//   project to null and are intentionally skipped (surfaced as a "Territories"
//   tier on the page, never plotted).
//
// Idempotent; re-runnable when the Census releases a new vintage.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import usStates from "us-atlas/states-10m.json" with { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "workflow", "lib", "intake-geo.mjs");
const VIEWBOX = "0 0 975 610";

// 2-digit state FIPS (us-atlas geometry `id`) -> USPS. Includes the 5 territories
// so they can be recognized and skipped (geoAlbersUsa returns null for them).
const FIPS_TO_USPS = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT",
  "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL",
  "18": "IN", "19": "IA", "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO", "30": "MT", "31": "NE",
  "32": "NV", "33": "NH", "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND",
  "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA", "54": "WV",
  "55": "WI", "56": "WY",
  // Territories (geoAlbersUsa has no position for these — skipped below).
  "60": "AS", "66": "GU", "69": "MP", "72": "PR", "78": "VI",
};

// City-name normalizer. MUST stay byte-for-byte identical to `normCity` in
// workflow/lib/intake-map-data.js so a user-typed city ("Chicago") matches the
// generated key ("chicago|il"). Lowercase, strip periods, collapse whitespace,
// then repeatedly strip a trailing statistical/legal suffix word (Census NAME
// carries "city"/"town"/"CDP"/… ; consolidated-government names stack several).
const CITY_SUFFIX =
  /\s+(city|town|village|borough|cdp|municipality|township|comunidad|zona urbana|metropolitan government|metro government|unified government|consolidated government|\(balance\))$/;
function normCity(s) {
  let v = String(s || "").toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
  let prev;
  do {
    prev = v;
    v = v.replace(CITY_SUFFIX, "").trim();
  } while (v !== prev);
  return v.replace(/\s+/g, " ").trim();
}

const round1 = (n) => Math.round(n * 10) / 10;

// --- State polygons -> pre-projected <path d> + centroid ---------------------
const projection = geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = geoPath(projection).digits(1); // 0.1px precision keeps the asset tight
const centroidPath = geoPath(projection); // separate instance for numeric centroids

const fc = feature(usStates, usStates.objects.states); // FeatureCollection (geographic)
const STATE_PATHS = {};
let skippedStates = 0;
for (const f of fc.features) {
  const usps = FIPS_TO_USPS[String(f.id)];
  const name = (f.properties && f.properties.name) || usps || String(f.id);
  const d = path(f);
  const centroid = centroidPath.centroid(f);
  // geoAlbersUsa returns null for territory coordinates -> empty path + NaN
  // centroid. Skip those: the page surfaces them as a "Territories" tier.
  if (!usps || !d || !Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1])) {
    skippedStates++;
    continue;
  }
  const labelXY = [round1(centroid[0]), round1(centroid[1])];
  STATE_PATHS[usps] = { name, d, labelXY, centroidXY: labelXY };
}

// --- Census places (+ Northeast MCD gap-fill) -> pre-projected [x,y] ---------
const gazPath = process.argv[2] || "";
const cousubPath = process.argv[3] || "";
// Northeast states where municipalities are MCDs the place file under-covers.
const MCD_STATES = new Set(["NJ", "CT", "ME", "MA", "NH", "RI", "VT"]);
const PLACE_XY = {};
const placeKeys = new Set(); // keys sourced from the PLACE file — always win
const stat = { placeRows: 0, placeNull: 0, placeAdded: 0, cousubRows: 0, cousubNull: 0, cousubAdded: 0 };

// Ingest one gazetteer file into PLACE_XY. `onlyStates` (a Set) restricts which
// USPS to read; `gapFillOnly` skips any key already owned by the place file
// (so cousub towns never override a real place). Same-key collisions inside a
// single ingest keep the larger place by ALAND (deterministic).
function ingest(path, { onlyStates = null, gapFillOnly = false, tag = "place" } = {}) {
  let text = "";
  try {
    text = readFileSync(path, "utf-8");
  } catch (err) {
    console.warn(`WARN: could not read ${tag} gazetteer at ${path} (${err.message}).`);
    return;
  }
  const lines = text.split(/\r?\n/);
  const header = lines[0].split("\t").map((h) => h.trim());
  const iUsps = header.indexOf("USPS");
  const iName = header.indexOf("NAME");
  const iLat = header.indexOf("INTPTLAT");
  const iLon = header.indexOf("INTPTLONG");
  const iAland = header.indexOf("ALAND");
  const landOf = new Map(); // key -> ALAND, only for keys THIS ingest added
  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    if (!line.trim()) continue;
    const cells = line.split("\t");
    const usps = String(cells[iUsps] || "").trim();
    if (!usps || (onlyStates && !onlyStates.has(usps.toUpperCase()))) continue;
    const rawName = String(cells[iName] || "").trim();
    const lat = Number(String(cells[iLat] || "").trim());
    const lon = Number(String(cells[iLon] || "").trim());
    if (!rawName || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (tag === "place") stat.placeRows++;
    else stat.cousubRows++;
    const xy = projection([lon, lat]);
    if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1])) {
      if (tag === "place") stat.placeNull++;
      else stat.cousubNull++;
      continue; // territory / unprojectable
    }
    const key = `${normCity(rawName)}|${usps.toLowerCase()}`;
    if (gapFillOnly && placeKeys.has(key)) continue; // a real place already owns it
    const aland = Number(String(cells[iAland] || "0").trim()) || 0;
    if (PLACE_XY[key] && (landOf.get(key) || 0) >= aland) continue; // keep larger within this ingest
    const isNew = !PLACE_XY[key];
    PLACE_XY[key] = [round1(xy[0]), round1(xy[1])];
    landOf.set(key, aland);
    if (tag === "place") {
      placeKeys.add(key);
      if (isNew) stat.placeAdded++;
    } else if (isNew) {
      stat.cousubAdded++;
    }
  }
}

if (gazPath) {
  ingest(gazPath, { tag: "place" });
} else {
  console.warn("WARN: no place gazetteer passed as argv[2]. Writing asset with EMPTY PLACE_XY (state-centroid tier still works). Re-run with 2023_Gaz_place_national.txt for city-level dots.");
}
if (cousubPath) {
  ingest(cousubPath, { onlyStates: MCD_STATES, gapFillOnly: true, tag: "cousub" });
} else if (gazPath) {
  console.warn("NOTE: no county-subdivisions gazetteer passed as argv[3]; Northeast MCD towns (New England towns, some NJ townships) will fall to the state-centroid tier. Re-run with 2023_Gaz_cousubs_national.txt to add them.");
}

// --- Hand-curated aliases (metro nicknames + NYC boroughs, which are counties,
// not Census "places"). Point each at its parent place's already-projected XY so
// common intake spellings still resolve to a city dot. Applied only when the
// target place exists in PLACE_XY. ------------------------------------------
// NOTE: normCity loop-collapses trailing suffix words, so a place whose PROPER
// name ends in a classifier (e.g. "Jersey City city" -> "jersey", "Oklahoma City
// city" -> "oklahoma") is keyed by its collapsed form; user input runs through the
// SAME normCity, so it still matches. Aliases below cover only names normCity
// canNOT reconcile: PREFIX-form places (Census "Urban Honolulu CDP"), NYC boroughs
// (which are counties, not Census "places"), and common "Saint"/"St" spellings.
const ALIAS = {
  // NYC boroughs -> the projected New York city point.
  "manhattan|ny": "new york|ny",
  "brooklyn|ny": "new york|ny",
  "queens|ny": "new york|ny",
  "bronx|ny": "new york|ny",
  "the bronx|ny": "new york|ny",
  "staten island|ny": "new york|ny",
  "nyc|ny": "new york|ny",
  // Prefix / consolidated-government names normCity leaves in a non-obvious form.
  "honolulu|hi": "urban honolulu|hi",
  "nashville|tn": "nashville-davidson|tn",
  "louisville|ky": "louisville/jefferson county|ky",
  "washington dc|dc": "washington|dc",
  // "Saint" spelled out -> the Census "St" form.
  "saint louis|mo": "st louis|mo",
  "saint paul|mn": "st paul|mn",
  "saint petersburg|fl": "st petersburg|fl",
};
let aliasApplied = 0;
for (const [from, to] of Object.entries(ALIAS)) {
  if (PLACE_XY[from]) continue; // a real place already owns this key
  if (PLACE_XY[to]) {
    PLACE_XY[from] = PLACE_XY[to];
    aliasApplied++;
  }
}

// --- Emit the committed ES module -------------------------------------------
const nStates = Object.keys(STATE_PATHS).length;
const nPlaces = Object.keys(PLACE_XY).length;
const stateEntries = Object.keys(STATE_PATHS)
  .sort()
  .map((abbr) => {
    const s = STATE_PATHS[abbr];
    return `  ${abbr}: ${JSON.stringify({ name: s.name, d: s.d, labelXY: s.labelXY, centroidXY: s.centroidXY })},`;
  })
  .join("\n");
// Places on one line each, sorted for a stable diff.
const placeEntries = Object.keys(PLACE_XY)
  .sort()
  .map((k) => `  ${JSON.stringify(k)}: [${PLACE_XY[k][0]}, ${PLACE_XY[k][1]}],`)
  .join("\n");

const generated = {
  at: new Date().toISOString(),
  stateSource: "us-atlas states-10m",
  placeSource: gazPath ? "Census 2023 Gaz place_national" : "(none — empty PLACE_XY)",
  cousubSource: cousubPath ? "Census 2023 Gaz cousubs_national (NJ + New England gap-fill)" : "(none)",
  projection: "geoAlbersUsa().scale(1300).translate([487.5,305])",
  n: { states: nStates, places: nPlaces },
};

const out = `// GENERATED — do not edit by hand. Regenerate via scripts/build-intake-geo.mjs
// (see that script's header for data sources, license, and the projection used).
//
// Pre-projected US map geometry for GET /admin/intake-map. State <path d>
// strings AND every Census place [x,y] live in the SAME geoAlbersUsa screen
// space (viewBox "${VIEWBOX}"), so the intake-map page paints dots onto states
// with zero runtime projection math. geoAlbersUsa covers 50 states + DC only;
// US territories (PR/GU/VI/AS/MP) have no position here and are surfaced as a
// "Territories" tier by lib/intake-map-data.js, never plotted.

export const VIEWBOX = ${JSON.stringify(VIEWBOX)};

// USPS -> { name, d (SVG path), labelXY, centroidXY } in the ${VIEWBOX} canvas.
export const STATE_PATHS = {
${stateEntries}
};

// "normcity|usps" -> [x, y] in the same canvas. Key uses the same normCity()
// as lib/intake-map-data.js (lowercase, periods stripped, whitespace collapsed,
// trailing statistical/legal suffix removed).
export const PLACE_XY = {
${placeEntries}
};

export const GENERATED = ${JSON.stringify(generated, null, 2)};
`;

writeFileSync(OUT_PATH, out, "utf-8");
console.log(`Wrote ${OUT_PATH}`);
console.log(
  `  states: ${nStates} (skipped ${skippedStates} territory/unprojectable)\n` +
    `  places: ${nPlaces} total = ${stat.placeAdded} from place file (${stat.placeRows} rows, ${stat.placeNull} null) ` +
    `+ ${stat.cousubAdded} MCD gap-fill (${stat.cousubRows} NE rows, ${stat.cousubNull} null) + ${aliasApplied} aliases`,
);
