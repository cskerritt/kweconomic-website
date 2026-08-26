import { describe, expect, it } from "vitest";
import { services, pillarServices, getServiceBySlug, getAllServiceSlugs } from "./services";
import { ICONS } from "@/lib/icons";
import { VOC_SITE_URL, LEGACY_BRAND_PATTERN } from "@/lib/brand";

const PILLARS = ["life-care-planning","pediatric-life-care-planning","catastrophic-injury-planning","medical-cost-projection","workers-compensation-lcp","plan-update-and-review","life-care-plan-rebuttal","medicare-set-aside","elder-and-long-term-care-planning","expert-witness-testimony"];

describe("LCP services taxonomy", () => {
  it("has 11 entries, 10 pillars", () => {
    expect(services.length).toBe(11);
    expect(pillarServices().map((s) => s.slug)).toEqual(PILLARS);
    expect(getAllServiceSlugs()).toEqual(PILLARS);
  });
  it("forensic economics is an external cross-sell, not a pillar", () => {
    const fe = getServiceBySlug("forensic-economics");
    expect(fe?.pillar).toBe(false);
    expect(fe?.externalUrl).toBe(`${VOC_SITE_URL}/services/forensic-economics`);
  });
  it("has no vocational/economic pillars", () => {
    for (const s of ["vocational-expert","loss-of-household-services","matrimonial","standard-of-care","expert-disclosure"]) expect(getServiceBySlug(s)).toBeUndefined();
  });
  it("every entry carries cost, process (>=4 steps) and timeline (>=3 phases)", () => {
    for (const s of services) {
      expect(s.cost?.drivers.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.cost?.range.length, s.slug).toBeGreaterThan(80);
      expect(s.cost?.billingStructure.length, s.slug).toBeGreaterThan(80);
      expect(s.process?.length, s.slug).toBeGreaterThanOrEqual(4);
      expect(s.timeline?.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.keywords.length, s.slug).toBeGreaterThanOrEqual(3);
      expect(s.description).not.toMatch(LEGACY_BRAND_PATTERN);
    }
  });
  it("no service text names the parent brand or cites statutes/regulations", () => {
    const brand = LEGACY_BRAND_PATTERN;
    const cite = /\b(C\.F\.R\.|CFR|U\.S\.C\.|USC|§|Fed\. R\.|Rule \d+)\b/;
    for (const s of services) {
      const text = [
        s.name, s.shortName, s.description,
        ...s.keywords, ...s.caseTypes,
        s.cost?.range ?? "", s.cost?.billingStructure ?? "", ...(s.cost?.drivers ?? []),
        ...(s.process ?? []).flatMap((p) => [p.step, p.description]),
        ...(s.timeline ?? []).flatMap((t) => [t.phase, t.duration]),
      ].join("\n");
      expect(text, s.slug).not.toMatch(brand);
      expect(text, s.slug).not.toMatch(cite);
    }
  });
  it("uses only the LCP credential set, and every icon resolves in the ICONS registry", () => {
    const creds = new Set(["CLCP","CNLCP","MSCC","CDMS","CRC","MD","RN","PhD"]);
    for (const s of services) {
      for (const c of s.relevantCredentials) expect(creds.has(c), `${s.slug} -> ${c}`).toBe(true);
      // A missing key silently falls back to Briefcase in ServiceCard/ServiceState/ServiceStateCity.
      expect(ICONS[s.icon], `${s.slug} -> ${s.icon} not in src/lib/icons.ts`).toBeDefined();
    }
  });
});
