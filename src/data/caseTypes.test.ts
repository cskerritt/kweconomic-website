import { describe, expect, it } from "vitest";
import { caseTypes, getCaseType } from "./caseTypes";
import { getAllServiceSlugs } from "./services";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

const SLUGS = ["commercial-contract-dispute","divorce-and-marital-dissolution","employment-discrimination","fraud-and-embezzlement","medical-malpractice","motor-vehicle-accident","partnership-and-shareholder-dispute","personal-injury","product-liability","spinal-cord-injury","traumatic-brain-injury","workers-compensation","wrongful-death","wrongful-termination"];

describe("economics case types", () => {
  it("has the 14 case types", () => {
    expect(caseTypes.map((c) => c.slug).sort()).toEqual(SLUGS);
    expect(getCaseType("business-valuation")).toBeUndefined();
  });
  it("references only pillar services and carries economic-loss copy", () => {
    const pillars = new Set(getAllServiceSlugs());
    for (const c of caseTypes) {
      expect(c.relevantServices.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const s of c.relevantServices) expect(pillars.has(s), `${c.slug} -> ${s}`).toBe(true);
      expect(c.lossComponents.length, c.slug).toBeGreaterThan(150);
      expect(c.damagesExposure.length, c.slug).toBeGreaterThan(150);
      expect(c.economicImpact.length, c.slug).toBeGreaterThan(200);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.sources.length, c.slug).toBeGreaterThanOrEqual(1);
      const text = `${c.summary} ${c.lossComponents} ${c.damagesExposure} ${c.economicImpact} ${c.faqs.map((f) => f.question + f.answer).join(" ")}`;
      expect(text, c.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, c.slug).not.toMatch(/life care planner|vocational expert|CLCP/i);
      expect(text, c.slug).not.toMatch(/[–—§]/);
    }
  });
  it("commercial and family matters point at valuation/accounting pillars", () => {
    expect(getCaseType("partnership-and-shareholder-dispute")!.relevantServices).toContain("business-valuation");
    expect(getCaseType("fraud-and-embezzlement")!.relevantServices).toContain("fraud-and-asset-tracing");
    expect(getCaseType("divorce-and-marital-dissolution")!.relevantServices).toContain("divorce-and-marital-financial-analysis");
  });
});
