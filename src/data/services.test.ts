import { describe, expect, it } from "vitest";
import { services, pillarServices, getServiceBySlug, getAllServiceSlugs } from "./services";

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
    expect(fe?.externalUrl).toBe("https://kwvrs.com/services/forensic-economics");
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
      expect(s.description).not.toMatch(/KWVRS|Kincaid Wolstein/);
    }
  });
  it("no service text names the parent brand or cites statutes/regulations", () => {
    const brand = /KWVRS|Kincaid Wolstein/;
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
  it("uses only the LCP credential set and lucide icon names from the brief", () => {
    const creds = new Set(["CLCP","CNLCP","MSCC","CDMS","CRC","MD","RN","PhD"]);
    const icons = new Set(["HeartPulse","Baby","Activity","Calculator","HardHat","RefreshCcw","Scale","ShieldCheck","Home","Gavel","TrendingUp"]);
    for (const s of services) {
      for (const c of s.relevantCredentials) expect(creds.has(c), `${s.slug} -> ${c}`).toBe(true);
      expect(icons.has(s.icon), `${s.slug} -> ${s.icon}`).toBe(true);
    }
  });
});
