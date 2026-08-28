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
import { LEGACY_BRAND_PATTERN } from "../lib/brand.ts";
import * as geoProse from "./geo-prose.mjs";
import { createGeoNarrators, extractCityRows, extractStateFacts } from "../../scripts/lib/geo-inputs.mjs";
import { pillarServiceEntries } from "../../scripts/lib/service-slugs.mjs";
import { readFileSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const srcData = join(root, "src", "data");

// Same lists the runtime test uses; both sides must satisfy them. Care-cost
// framing and vocational vocabulary are out; so are printed rates and figures.
const BANNED = new RegExp(
  `attendant care|home health|skilled nursing|life care planner|vocational expert|CLCP|unemployment rate|median hourly wage|\\d+(\\.\\d+)?\\s?%|\\$\\d|${LEGACY_BRAND_PATTERN.source}`,
  "i",
);
const ECON = /wage|earnings|cost of living|damages|present value/i;

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
  const [narratives, faqs, states, nj, tx, services] = await Promise.all([
    server.ssrLoadModule("/src/data/narratives.ts"),
    server.ssrLoadModule("/src/data/geographicFaqs.ts"),
    server.ssrLoadModule("/src/data/states.ts"),
    server.ssrLoadModule("/src/data/cities/new-jersey.ts"),
    server.ssrLoadModule("/src/data/cities/texas.ts"),
    server.ssrLoadModule("/src/data/services.ts"),
  ]);
  ts = { narratives, faqs, states, services, cities: { "new-jersey": nj.newJerseyCities, texas: tx.texasCities } };
}, 60_000);
afterAll(async () => {
  await server?.close();
});

// The real prerender-side join path (scripts/prerender.mjs calls this factory).
const { buildStateNarrative: prerenderState, buildCityNarrative: prerenderCity, stateRegsMap: regs, metroMap: metros } =
  createGeoNarrators(srcData, ORG_NAME);
const facts = extractStateFacts(srcData);

describe("geo prose parity: prerender shells vs React runtime", () => {
  it("state narrative is identical for every state", () => {
    expect(Object.keys(facts)).toHaveLength(ts.states.states.length);
    for (const state of ts.states.states) {
      const runtime = ts.narratives.getStateNarrative(state);
      expect(prerenderState(state), state.slug).toEqual(runtime);
      const text = Object.values(runtime).join(" ");
      expect(text, state.slug).toMatch(ECON);
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
      expect(text, city.slug).toMatch(ECON);
      expect(text, city.slug).not.toMatch(BANNED);
    }
    // Houston is a metro city: the shared employer list reaches both sides as
    // context (first names in data order), never as a rate or a wage.
    expect(prerenderCity(texas, houston).directAnswer).toMatch(/Memorial Hermann Health System/);
    // The regex extractor must see the same optional msaName the TS module has.
    const rows = extractCityRows(srcData, "texas");
    expect(rows.find((r) => r.slug === "houston")?.msaName).toBe(houston.msaName);
    expect(rows.map((r) => r.slug)).toEqual(ts.cities.texas.map((c) => c.slug));
  });

  it("FAQ blocks are identical on all four geo templates", () => {
    const svc = "Household Services Valuation";
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

  it("service x state / city hero sentences match ServiceState.tsx and ServiceStateCity.tsx", () => {
    // Prerender reads shortName by regex; the pages read it from the TS module.
    const svcRows = pillarServiceEntries(readFileSync(join(srcData, "services.ts"), "utf-8"));
    const tsPillars = ts.services.pillarServices();
    expect(svcRows.map((s) => [s.slug, s.shortName])).toEqual(tsPillars.map((s) => [s.slug, s.shortName]));
    const hsv = svcRows.find((s) => s.slug === "household-services-valuation");
    expect(hsv).toBeTruthy();
    const texas = ts.states.getStateBySlug("texas");
    const houston = ts.cities.texas.find((c) => c.slug === "houston");
    const stateSentence = geoProse.serviceStateDirectAnswer(ORG_NAME, hsv.shortName, texas.name, prerenderState(texas));
    expect(stateSentence).toBe(
      ts.narratives.serviceStateDirectAnswer(ORG_NAME, "Household Services", texas.name, ts.narratives.getStateNarrative(texas)),
    );
    expect(stateSentence.startsWith("Household Services from KW Economics for matters venued in Texas.")).toBe(true);
    const citySentence = geoProse.serviceCityDirectAnswer(ORG_NAME, hsv.shortName, texas.name, houston.name, prerenderCity(texas, houston));
    expect(citySentence).toBe(
      ts.narratives.serviceCityDirectAnswer(
        ORG_NAME, "Household Services", texas.name, houston.name,
        ts.narratives.getCityNarrative(texas, houston.name, houston.slug, houston.county, { msaName: houston.msaName }),
      ),
    );
    // FAQ templates keep proper nouns in the service name (never lowercased).
    expect(JSON.stringify(ts.faqs.serviceStateGeographicFaqs("Household Services Valuation", "Texas"))).not.toMatch(/household services valuation/);
  });

  it("regulation extractor sees every state with both renamed fields", () => {
    for (const state of ts.states.states) {
      expect(regs[state.slug]?.compensationForum, state.slug).toBeTruthy();
      expect(regs[state.slug]?.damagesContext, state.slug).toBeTruthy();
    }
  });
});
