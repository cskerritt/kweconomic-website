import { describe, expect, it } from "vitest";
import { services, pillarServices, getServiceBySlug, getAllServiceSlugs, isPillarService, servicesForCaseType } from "./services";
import { caseTypes, getCaseType } from "./caseTypes";
import { guides } from "./guides";
import { methods } from "./methods";
import { comparisons } from "./comparisons";
import { ICONS } from "@/lib/icons";
import { VOC_SITE_URL, LCP_SITE_URL, VOC_SERVICE_URL, LCP_SERVICE_URL, LEGACY_BRAND_PATTERN } from "@/lib/brand";
import { DOUBLED_WORD, MIS_ARTICLE, excerpt } from "@/test-utils/markup";

const PILLARS = ["lost-earnings-and-earning-capacity","wrongful-death-economic-loss","personal-injury-economic-damages","household-services-valuation","life-care-plan-cost-projection","employment-and-wage-loss-damages","business-valuation","lost-profits-and-commercial-damages","fraud-and-asset-tracing","divorce-and-marital-financial-analysis","expert-rebuttal-and-report-review"];
const CASE_TYPES = new Set(["personal-injury","wrongful-death","medical-malpractice","motor-vehicle-accident","traumatic-brain-injury","spinal-cord-injury","workers-compensation","employment-discrimination","wrongful-termination","commercial-contract-dispute","partnership-and-shareholder-dispute","divorce-and-marital-dissolution","fraud-and-embezzlement","product-liability"]);

// House rules shared with caseTypes.test.ts and credentials.test.ts: no
// sister-brand forms, no LCP or vocational vocabulary outside the carve-out
// (the life-care-plan-cost-projection entry may name the plan's author), no
// statute or rule cites, hyphens only.
const OFF_BRAND = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i;
const CITE = /\b(C\.F\.R\.|CFR|U\.S\.C\.|USC|§|Fed\. R\.|Rule \d+)\b/;
const STAT_CLAIM = /\d+\+ (cases|years|firms)/i;

/** Every prose string a pillar carries, including the page content added for the service templates. */
function pillarText(s: (typeof services)[number]): string[] {
  return [
    s.name, s.shortName, s.description, ...s.keywords,
    s.cost?.range ?? "", s.cost?.billingStructure ?? "", ...(s.cost?.drivers ?? []),
    ...(s.process ?? []).flatMap((p) => [p.step, p.description]),
    ...(s.timeline ?? []).flatMap((t) => [t.phase, t.duration]),
    s.metaDescription ?? "",
    s.handoff?.text ?? "", s.handoff?.linkLabel ?? "",
    ...(s.faqs ?? []).flatMap((f) => [f.question, f.answer]),
    ...(s.related ?? []).map((r) => r.title),
    ...Object.values(s.caseTypeNotes ?? {}).flatMap((n) => [n.summary, ...n.faqs.flatMap((f) => [f.question, f.answer])]),
  ];
}

describe("economics services taxonomy", () => {
  it("has 13 entries, 11 pillars in canonical order", () => {
    expect(services.length).toBe(13);
    expect(pillarServices().map((s) => s.slug)).toEqual(PILLARS);
    expect(getAllServiceSlugs()).toEqual(PILLARS);
  });
  it("vocational and life care planning are external cross-sells, not pillars, linking the verified sister service pages", () => {
    const v = getServiceBySlug("vocational-evaluation");
    expect(v?.pillar).toBe(false);
    // The vocational site's /services/vocational-evaluation alias answers 404
    // (checked 2026-09-05); the live canonical is /services/vocational-expert (brand.ts).
    expect(v?.externalUrl).toBe(VOC_SERVICE_URL);
    expect(v?.externalUrl).toBe(`${VOC_SITE_URL}/services/vocational-expert`);
    const l = getServiceBySlug("life-care-planning");
    expect(l?.pillar).toBe(false);
    expect(l?.externalUrl).toBe(LCP_SERVICE_URL);
    expect(l?.externalUrl).toBe(`${LCP_SITE_URL}/services/life-care-planning`);
  });
  it("the explained hand-offs name the discipline, link a verified sister service page, and sit on the pillars whose work depends on one", () => {
    const withHandoff = services.filter((s) => s.handoff).map((s) => s.slug).sort();
    expect(withHandoff).toEqual([
      "divorce-and-marital-financial-analysis",
      "household-services-valuation",
      "life-care-plan-cost-projection",
      "lost-earnings-and-earning-capacity",
    ]);
    for (const s of services) {
      if (!s.handoff) continue;
      expect([VOC_SERVICE_URL, LCP_SERVICE_URL], s.slug).toContain(s.handoff.href);
      expect(s.handoff.text, s.slug).toMatch(/affiliated (vocational|life care planning) practice/);
      expect(s.handoff.text.length, s.slug).toBeGreaterThan(120);
      expect(s.handoff.linkLabel, s.slug).toMatch(/at the affiliated practice$/);
      expect(s.handoff.linkLabel, s.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(excerpt(s.handoff.text, DOUBLED_WORD), s.slug).toBeUndefined();
      expect(excerpt(s.handoff.text, MIS_ARTICLE), s.slug).toBeUndefined();
    }
    expect(getServiceBySlug("life-care-plan-cost-projection")!.handoff!.href).toBe(LCP_SERVICE_URL);
    expect(getServiceBySlug("divorce-and-marital-financial-analysis")!.handoff!.text).toMatch(/vocational discipline/);
    // The divorce pillar also answers the earning-capacity question in its FAQ.
    expect(getServiceBySlug("divorce-and-marital-financial-analysis")!.faqs!.map((f) => f.question)).toContain(
      "Who addresses what a spouse could earn in other work?",
    );
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
      expect(new Set(s.caseTypes).size, `${s.slug} declares a case type twice`).toBe(s.caseTypes.length);
    }
  });
  it("no service text names a sister brand, cites statutes/regulations, claims a statistic, or uses a dash", () => {
    for (const s of services) {
      const text = pillarText(s).join("\n");
      expect(text, s.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, s.slug).not.toMatch(CITE);
      expect(text, s.slug).not.toMatch(STAT_CLAIM);
      expect(text, s.slug).not.toMatch(/[–—§]/);
      if (s.slug !== "life-care-plan-cost-projection") expect(text, s.slug).not.toMatch(OFF_BRAND);
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

describe("pillar page content (PillarContent)", () => {
  const editorialHrefs = new Set([
    ...guides.map((g) => `/guides/${g.slug}`),
    ...methods.map((m) => `/methods/${m.slug}`),
    ...comparisons.map((c) => `/compare/${c.slug}`),
  ]);

  it("isPillarService() is exactly the pillar flag and pillarServices() returns typed pillars", () => {
    for (const s of services) expect(isPillarService(s)).toBe(s.pillar);
    expect(pillarServices().every((s) => s.metaDescription && s.faqs && s.related && s.sources && s.caseTypeNotes)).toBe(true);
  });

  it("cross-sells carry no page content", () => {
    for (const s of services.filter((x) => !x.pillar)) {
      expect(s.metaDescription, s.slug).toBeUndefined();
      expect(s.faqs, s.slug).toBeUndefined();
      expect(s.caseTypeNotes, s.slug).toBeUndefined();
    }
  });

  for (const s of pillarServices()) {
    describe(s.slug, () => {
      it("meta description is 140-160 characters, states the audience and reach, and reads as prose", () => {
        expect(s.metaDescription.length).toBeGreaterThanOrEqual(140);
        expect(s.metaDescription.length).toBeLessThanOrEqual(160);
        expect(s.metaDescription).toMatch(/plaintiff and defense|either spouse/);
        expect(s.metaDescription).toContain("nationwide");
        expect(s.metaDescription).not.toContain("&");
        expect(excerpt(s.metaDescription, DOUBLED_WORD)).toBeUndefined();
        expect(excerpt(s.metaDescription, MIS_ARTICLE)).toBeUndefined();
      });

      it("dateModified is an ISO date", () => {
        expect(s.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Number.isNaN(Date.parse(s.dateModified))).toBe(false);
      });

      it("carries at least four hand-authored FAQs that are specific to the service", () => {
        expect(s.faqs.length).toBeGreaterThanOrEqual(4);
        for (const f of s.faqs) {
          expect(f.question.endsWith("?"), f.question).toBe(true);
          expect(f.answer.length, f.question).toBeGreaterThan(120);
          expect(f.answer, f.question).not.toContain("linked below");
          for (const t of [f.question, f.answer]) {
            expect(t).not.toContain("&");
            expect(excerpt(t, DOUBLED_WORD)).toBeUndefined();
            expect(excerpt(t, MIS_ARTICLE)).toBeUndefined();
          }
        }
        // Never the old templated firm-process set.
        expect(s.faqs.map((f) => f.question)).not.toContain("Does KW Economics work for both plaintiff and defense?");
      });

      it("related links resolve to existing guides, methods, or comparisons and never repeat", () => {
        expect(s.related.length).toBeGreaterThanOrEqual(3);
        for (const r of s.related) {
          expect(editorialHrefs.has(r.href), `${s.slug} -> ${r.href}`).toBe(true);
          expect(r.title.length).toBeGreaterThan(5);
        }
        expect(new Set(s.related.map((r) => r.href)).size).toBe(s.related.length);
      });

      it("sources come from the registry (every entry carries an APA string and an https URL)", () => {
        expect(s.sources.length).toBeGreaterThanOrEqual(3);
        for (const src of s.sources) {
          expect(src.apa, `${s.slug} source ${src.url}`).toBeTruthy();
          expect(src.url).toMatch(/^https:\/\//);
        }
      });

      it("carries one pair note with two FAQs for every declared case type, and none for undeclared ones", () => {
        expect(Object.keys(s.caseTypeNotes).sort()).toEqual([...s.caseTypes].sort());
        for (const [ct, note] of Object.entries(s.caseTypeNotes)) {
          expect(getCaseType(ct), `${s.slug} note for unknown case type ${ct}`).toBeDefined();
          expect(note.summary.length, `${s.slug} x ${ct}`).toBeGreaterThan(300);
          expect(note.faqs.length, `${s.slug} x ${ct}`).toBe(2);
          for (const f of note.faqs) {
            expect(f.question.endsWith("?"), f.question).toBe(true);
            expect(f.answer.length, f.question).toBeGreaterThan(100);
          }
          for (const t of [note.summary, ...note.faqs.flatMap((f) => [f.question, f.answer])]) {
            expect(t, `${s.slug} x ${ct}`).not.toContain("&");
            expect(excerpt(t, DOUBLED_WORD), `${s.slug} x ${ct}`).toBeUndefined();
            expect(excerpt(t, MIS_ARTICLE), `${s.slug} x ${ct}`).toBeUndefined();
          }
        }
      });

      it("pair notes differ from each other and from the case type's own copy", () => {
        const summaries = Object.values(s.caseTypeNotes).map((n) => n.summary);
        expect(new Set(summaries).size).toBe(summaries.length);
        for (const [ct, note] of Object.entries(s.caseTypeNotes)) {
          const hub = getCaseType(ct)!;
          expect(note.summary).not.toBe(hub.lossComponents);
          expect(note.summary).not.toBe(s.description);
          for (const f of note.faqs) expect(hub.faqs.map((h) => h.question)).not.toContain(f.question);
        }
      });
    });
  }
});

// The two sides of the service x case-type relationship: the pillars declare
// case types (service.caseTypes, the source for pair pages and pair links) and
// the case-type hubs list relevant pillars (caseType.relevantServices, the
// source for the hub's related-services cards). Every declared pair should be
// listed by its hub; the rebuttal pillar is the one exception the hubs list
// selectively. Hub references to pairs the pillar does not declare are the
// known set below (a caseTypes.ts content decision: drop the reference or
// declare the pair); the set may only shrink.
describe("service x case-type declarations agree with the case-type hubs", () => {
  const KNOWN_UNDECLARED_HUB_REFERENCES = new Set([
    "lost-earnings-and-earning-capacity x employment-discrimination",
    "lost-earnings-and-earning-capacity x wrongful-termination",
    "business-valuation x fraud-and-embezzlement",
  ]);

  it("every declared pair (rebuttal aside) is listed by the case type's hub", () => {
    for (const s of pillarServices().filter((x) => x.slug !== "expert-rebuttal-and-report-review")) {
      for (const ct of s.caseTypes) {
        expect(getCaseType(ct)!.relevantServices, `${s.slug} x ${ct}`).toContain(s.slug);
      }
    }
  });

  it("hub references to undeclared pairs are limited to the known set", () => {
    const undeclared: string[] = [];
    for (const ct of caseTypes) {
      for (const slug of ct.relevantServices) {
        const s = getServiceBySlug(slug)!;
        if (!s.caseTypes.includes(ct.slug)) undeclared.push(`${slug} x ${ct.slug}`);
      }
    }
    for (const pair of undeclared) expect(KNOWN_UNDECLARED_HUB_REFERENCES.has(pair), pair).toBe(true);
  });

  it("servicesForCaseType() enumerates the declared side in canonical order", () => {
    expect(servicesForCaseType("wrongful-death").map((s) => s.slug)).toEqual([
      "lost-earnings-and-earning-capacity",
      "wrongful-death-economic-loss",
      "household-services-valuation",
      "expert-rebuttal-and-report-review",
    ]);
    expect(servicesForCaseType("workers-compensation").map((s) => s.slug)).toEqual([
      "lost-earnings-and-earning-capacity",
      "personal-injury-economic-damages",
      "household-services-valuation",
      "expert-rebuttal-and-report-review",
    ]);
    expect(servicesForCaseType("no-such-type")).toEqual([]);
  });
});
