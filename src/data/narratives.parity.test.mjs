// src/data/narratives.parity.test.mjs
// Pins the prerendered geo prose (scripts/prerender.mjs: regex-extracted
// inputs -> src/data/geo-prose.mjs) to the hydrated React prose
// (src/data/narratives.ts + geographicFaqs.ts: typed data -> the same
// geo-prose.mjs). The templates are shared, so what this test really guards is
// the two data-join paths: if an extractor in scripts/lib/geo-inputs.mjs drifts
// from the TS data shape, the shells and the pages diverge and this fails.
// Loads the TS side through vite's ssrLoadModule (as generate-sitemap.mjs does).
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ORG_NAME } from "../../scripts/lib/site.mjs";
import * as geoProse from "./geo-prose.mjs";
import {
  extractCityRows,
  extractMetroMap,
  extractStateCourtsMap,
  extractStateFacts,
  extractStateRegsMap,
} from "../../scripts/lib/geo-inputs.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const srcData = join(root, "src", "data");

// Same list the runtime test uses; both sides must be free of it.
const BANNED = /labor market|unemployment|median hourly wage|median household income|employers|earning capacity|transferable skills|vocational rehabilitation|KWVRS|Kincaid Wolstein/i;
const CARE = /attendant care|home health|provider|cost of care/i;

let server;
let ts;
beforeAll(async () => {
  server = await createServer({
    root,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@": join(root, "src") } },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  const [narratives, faqs, states, nj, tx] = await Promise.all([
    server.ssrLoadModule("/src/data/narratives.ts"),
    server.ssrLoadModule("/src/data/geographicFaqs.ts"),
    server.ssrLoadModule("/src/data/states.ts"),
    server.ssrLoadModule("/src/data/cities/new-jersey.ts"),
    server.ssrLoadModule("/src/data/cities/texas.ts"),
  ]);
  ts = { narratives, faqs, states, cities: { "new-jersey": nj.newJerseyCities, texas: tx.texasCities } };
}, 60_000);
afterAll(async () => {
  await server?.close();
});

// Prerender-side joins, copied verbatim from scripts/prerender.mjs.
const facts = extractStateFacts(srcData);
const courts = extractStateCourtsMap(srcData);
const regs = extractStateRegsMap(srcData);
const metros = extractMetroMap(srcData);
function prerenderState(state) {
  const f = facts[state.slug] ?? {};
  return geoProse.buildStateNarrative({
    orgName: ORG_NAME,
    stateName: state.name,
    region: f.region,
    population: f.population,
    trialCourtName: courts[state.slug]?.trialCourtName,
    supremeCourt: courts[state.slug]?.supremeCourt,
    federalDistrictCount: courts[state.slug]?.federalDistrictCount ?? 0,
    careOversightAgency: regs[state.slug]?.careOversightAgency,
  });
}
function prerenderCity(state, city) {
  const metro = metros[`${state.slug}/${city.slug}`];
  return geoProse.buildCityNarrative({
    orgName: ORG_NAME,
    stateName: state.name,
    cityName: city.name,
    county: city.county,
    msaName: city.msaName,
    medicalCenters: geoProse.careMedicalCenters(metro?.topEmployers),
    hasMetroData: metro !== undefined,
    trialCourtName: courts[state.slug]?.trialCourtName,
  });
}

describe("geo prose parity: prerender shells vs React runtime", () => {
  it("state narrative is identical for every state", () => {
    for (const state of ts.states.states) {
      const runtime = ts.narratives.getStateNarrative(state);
      expect(prerenderState(state), state.slug).toEqual(runtime);
      const text = Object.values(runtime).join(" ");
      expect(text, state.slug).toMatch(CARE);
      expect(text, state.slug).not.toMatch(BANNED);
    }
  });

  it("city narrative is identical for a metro city (Houston) and a non-metro city", () => {
    const texas = ts.states.getStateBySlug("texas");
    const nj = ts.states.getStateBySlug("new-jersey");
    const houston = ts.cities.texas.find((c) => c.slug === "houston");
    const nonMetro = ts.cities["new-jersey"].find((c) => !metros[`new-jersey/${c.slug}`]);
    expect(houston).toBeTruthy();
    expect(nonMetro).toBeTruthy();
    for (const [state, city] of [
      [texas, houston],
      [nj, nonMetro],
    ]) {
      const runtime = ts.narratives.getCityNarrative(state, city.name, city.slug, city.county, {
        msaName: city.msaName,
      });
      expect(prerenderCity(state, city), city.slug).toEqual(runtime);
      const text = `${runtime.directAnswer} ${runtime.blurb}`;
      expect(text, city.slug).toMatch(CARE);
      expect(text, city.slug).not.toMatch(BANNED);
    }
    // The regex extractor must see the same optional msaName the TS module has.
    const rows = extractCityRows(srcData, "texas");
    expect(rows.find((r) => r.slug === "houston")?.msaName).toBe(houston.msaName);
    expect(rows.map((r) => r.slug)).toEqual(ts.cities.texas.map((c) => c.slug));
  });

  it("FAQ blocks are identical on all four geo templates", () => {
    const svc = "Life Care Planning";
    expect(geoProse.stateGeographicFaqs(ORG_NAME, "Texas")).toEqual(ts.faqs.stateGeographicFaqs("Texas"));
    expect(geoProse.cityGeographicFaqs(ORG_NAME, "Texas", "Houston")).toEqual(
      ts.faqs.cityGeographicFaqs("Texas", "Houston"),
    );
    expect(geoProse.serviceStateGeographicFaqs(ORG_NAME, svc, "Texas")).toEqual(
      ts.faqs.serviceStateGeographicFaqs(svc, "Texas"),
    );
    expect(geoProse.serviceCityGeographicFaqs(ORG_NAME, svc, "Texas", "Houston")).toEqual(
      ts.faqs.serviceCityGeographicFaqs(svc, "Texas", "Houston"),
    );
  });

  it("regulation extractor sees every state with both renamed fields", () => {
    for (const state of ts.states.states) {
      expect(regs[state.slug]?.careOversightAgency, state.slug).toBeTruthy();
      expect(regs[state.slug]?.practiceContext, state.slug).toBeTruthy();
    }
  });
});
