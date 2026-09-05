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

  it("is the declared subset of the all-pairs grid: 60 of the 154 pillar x case-type combinations, never the 94 undeclared", () => {
    // The 94 undeclared pairs are the 91 the audit found unreachable plus the
    // three the case-type hubs reference through caseType.relevantServices
    // (services.test.ts, KNOWN_UNDECLARED_HUB_REFERENCES). A change to a
    // pillar's caseTypes moves pages in or out of the site: revisit the
    // sitemap ceiling comment in scripts/sitemap-index.test.mjs when it does.
    const grid = pillarServices().length * caseTypes.length;
    expect(grid).toBe(154);
    expect(pairs).toHaveLength(60);
    expect(grid - pairs.length).toBe(94);
    for (const path of UNDECLARED_EXAMPLES) expect(declared.has(path), path).toBe(false);
  });
});
