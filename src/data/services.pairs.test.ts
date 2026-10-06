import { describe, expect, it } from "vitest";
import { pillarServices, serviceCaseTypePairs, servicesForCaseType } from "./services";
import { caseTypes, getCaseType } from "./caseTypes";

// serviceCaseTypePairs() is the route set for /services/<service>/case/<case>:
// scripts/prerender.mjs writes a shell and scripts/generate-sitemap.mjs
// advertises a URL for exactly these pairs, ServiceCaseType.tsx resolves only
// these, and server.js 301s every other pillar x case-type address to the
// pillar (2026-09-05 audit, T06/T09: the undeclared pairs of the former
// all-pairs grid were prerendered pages that nothing linked).

// Pairs the audit brief listed as unreachable (T06/T09) and that no pillar declares.
const UNDECLARED_EXAMPLES = [
  "/services/business-valuation/case/medical-malpractice",
  "/services/divorce-and-marital-financial-analysis/case/personal-injury",
  "/services/employment-and-wage-loss-damages/case/wrongful-death",
];

describe("serviceCaseTypePairs()", () => {
  const pairs = serviceCaseTypePairs();
  const declared = new Set(pairs.map((p) => p.path));

  it("lists every declared pair once, in pillar order then the pillar's own caseTypes order", () => {
    const expected = pillarServices().flatMap((s) => s.caseTypes.map((ct) => `/services/${s.slug}/case/${ct}`));
    expect(pairs.map((p) => p.path)).toEqual(expected);
    expect(declared.size).toBe(pairs.length);
    for (const p of pairs) {
      expect(p.path).toBe(`/services/${p.service.slug}/case/${p.caseTypeSlug}`);
      expect(p.service.caseTypes).toContain(p.caseTypeSlug);
    }
  });

  it("names only real case types and agrees with servicesForCaseType() in both directions", () => {
    for (const p of pairs) {
      expect(getCaseType(p.caseTypeSlug), p.path).toBeDefined();
      expect(servicesForCaseType(p.caseTypeSlug).map((s) => s.slug), p.path).toContain(p.service.slug);
    }
    for (const c of caseTypes) {
      for (const s of servicesForCaseType(c.slug)) {
        expect(declared.has(`/services/${s.slug}/case/${c.slug}`), `${s.slug} x ${c.slug}`).toBe(true);
      }
    }
  });

  it("is the declared subset of the all-pairs grid: 72 of the 208 pillar x case-type combinations, never the 136 undeclared", () => {
    // The 136 undeclared pairs are the 91 the audit found unreachable, the
    // three the case-type hubs reference through caseType.relevantServices
    // (services.test.ts, KNOWN_UNDECLARED_HUB_REFERENCES), the 20 the
    // transfer pricing pillar and the tax and transfer pricing dispute added
    // on 2026-10-05 (12 pillars x 15 case types = 180, less the 60 earlier
    // pairs and the 6 new ones: transfer pricing x tax, commercial contract,
    // shareholder dispute, and divorce; business valuation x tax; rebuttal x
    // tax), and the 22 the intellectual property damages pillar and the
    // intellectual property infringement matter added on 2026-10-06 (13
    // pillars x 16 case types = 208, less the 66 earlier pairs and the 6 new
    // ones: IP damages x IP infringement, commercial contract, and
    // shareholder dispute; lost profits, business valuation, and rebuttal x
    // IP infringement). A change to a pillar's caseTypes moves pages in or
    // out of the site: revisit the sitemap ceiling comment in
    // scripts/sitemap-index.test.mjs when it does.
    const grid = pillarServices().length * caseTypes.length;
    expect(grid).toBe(208);
    expect(pairs).toHaveLength(72);
    expect(grid - pairs.length).toBe(136);
    expect(declared.has("/services/transfer-pricing-expert-witness/case/divorce-and-marital-dissolution")).toBe(true);
    for (const path of [
      "/services/intellectual-property-damages/case/intellectual-property-infringement",
      "/services/intellectual-property-damages/case/commercial-contract-dispute",
      "/services/intellectual-property-damages/case/partnership-and-shareholder-dispute",
      "/services/lost-profits-and-commercial-damages/case/intellectual-property-infringement",
      "/services/business-valuation/case/intellectual-property-infringement",
      "/services/expert-rebuttal-and-report-review/case/intellectual-property-infringement",
    ]) {
      expect(declared.has(path), path).toBe(true);
    }
    // The IP matter is not paired with the injury, death, employment, or
    // family pillars, and the IP pillar with no injury or family matter.
    expect(declared.has("/services/lost-earnings-and-earning-capacity/case/intellectual-property-infringement")).toBe(false);
    expect(declared.has("/services/intellectual-property-damages/case/divorce-and-marital-dissolution")).toBe(false);
    for (const path of UNDECLARED_EXAMPLES) expect(declared.has(path), path).toBe(false);
  });
});
