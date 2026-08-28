import { describe, expect, it } from "vitest";
import { services, pillarServices, getServiceBySlug, getAllServiceSlugs } from "./services";
import { ICONS } from "@/lib/icons";
import { VOC_SITE_URL, LCP_SITE_URL, LEGACY_BRAND_PATTERN } from "@/lib/brand";

const PILLARS = ["lost-earnings-and-earning-capacity","wrongful-death-economic-loss","personal-injury-economic-damages","household-services-valuation","life-care-plan-cost-projection","employment-and-wage-loss-damages","business-valuation","lost-profits-and-commercial-damages","fraud-and-asset-tracing","divorce-and-marital-financial-analysis","expert-rebuttal-and-report-review"];
const CASE_TYPES = new Set(["personal-injury","wrongful-death","medical-malpractice","motor-vehicle-accident","traumatic-brain-injury","spinal-cord-injury","workers-compensation","employment-discrimination","wrongful-termination","commercial-contract-dispute","partnership-and-shareholder-dispute","divorce-and-marital-dissolution","fraud-and-embezzlement","product-liability"]);

describe("economics services taxonomy", () => {
  it("has 13 entries, 11 pillars in canonical order", () => {
    expect(services.length).toBe(13);
    expect(pillarServices().map((s) => s.slug)).toEqual(PILLARS);
    expect(getAllServiceSlugs()).toEqual(PILLARS);
  });
  it("vocational and life care planning are external cross-sells, not pillars", () => {
    const v = getServiceBySlug("vocational-evaluation");
    expect(v?.pillar).toBe(false);
    expect(v?.externalUrl).toBe(`${VOC_SITE_URL}/services/vocational-evaluation`);
    const l = getServiceBySlug("life-care-planning");
    expect(l?.pillar).toBe(false);
    expect(l?.externalUrl).toBe(`${LCP_SITE_URL}/services/life-care-planning`);
  });
  it("has no LCP pillars", () => {
    for (const s of ["pediatric-life-care-planning","medical-cost-projection","medicare-set-aside","life-care-plan-rebuttal","forensic-economics"]) expect(getServiceBySlug(s)).toBeUndefined();
  });
  it("every entry carries cost, process (>=4 steps), timeline (>=3 phases), keywords, known case types", () => {
    for (const s of services) {
      expect(s.cost?.drivers.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.cost?.range.length, s.slug).toBeGreaterThan(80);
      expect(s.cost?.billingStructure.length, s.slug).toBeGreaterThan(80);
      expect(s.process?.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.timeline?.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.keywords.length, s.slug).toBeGreaterThanOrEqual(3);
      for (const c of s.caseTypes) expect(CASE_TYPES.has(c), `${s.slug} -> ${c}`).toBe(true);
    }
  });
  it("no service text names a sister brand or cites statutes/regulations", () => {
    const cite = /\b(C\.F\.R\.|CFR|U\.S\.C\.|USC|§|Fed\. R\.|Rule \d+)\b/;
    for (const s of services) {
      const text = [s.name, s.shortName, s.description, ...s.keywords, s.cost?.range ?? "", s.cost?.billingStructure ?? "", ...(s.cost?.drivers ?? []), ...(s.process ?? []).flatMap((p) => [p.step, p.description]), ...(s.timeline ?? []).flatMap((t) => [t.phase, t.duration])].join("\n");
      expect(text, s.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, s.slug).not.toMatch(cite);
      expect(text, s.slug).not.toMatch(/[–—]/);
    }
  });
  it("uses only the economics credential set and icons that resolve", () => {
    const creds = new Set(["Forensic Economist","NAFE","AAEFE","MBA","M.Ed.","PhD"]);
    for (const s of services) {
      for (const c of s.relevantCredentials) expect(creds.has(c), `${s.slug} -> ${c}`).toBe(true);
      expect(ICONS[s.icon], `${s.slug} -> ${s.icon} not in src/lib/icons.ts`).toBeDefined();
    }
  });
});
