import { describe, expect, it } from "vitest";
import { caseTypes, getCaseType } from "./caseTypes";
import { getAllServiceSlugs } from "./services";
import { states } from "./states";
import { placeName } from "./geo-prose.mjs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { caseTypeStateTitle } from "@/lib/page-titles.mjs";

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

// The SERP and answer-block fields added for the case-type hub and state
// pages: titleBase keeps the geo modifier early in the state title, and
// summaryShort / inShort / steps are the liftable units the templates render
// (definition block, "In short" list, numbered method). Same house rules as
// the long fields, plus the citation and figure guards credentials.test.ts
// applies.
const RULE_CITE = /\b(Rule|Fed\. R\.|U\.S\.C\.|F\.3d|F\. Supp)\b/;
const FIGURES = /\$\d|\d+(\.\d+)?\s?%/;
const SISTER_VOCABULARY = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// The short forms that are a standard abbreviation of the name rather than a
// whole-word part of it. Every other shortName is the name itself or a
// contiguous run of its words ("Shareholder Dispute", "Discrimination").
const STANDARD_SHORT_FORMS: Record<string, string> = {
  "motor-vehicle-accident": "Auto Accident",
  "workers-compensation": "Workers' Comp",
};
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stateBySlug = (slug: string) => states.find((s) => s.slug === slug)!;

describe("case-type SERP fields", () => {
  it("titleBase is the full name plus Economist and keeps every hub title at or under 60 characters", () => {
    for (const c of caseTypes) {
      // The hub (/case-types/<slug>) publishes the stem as is, so the full
      // case-type keyword stays on the highest-value page of the family.
      expect(c.titleBase, c.slug).toBe(`${c.name} Economist`);
      expect(c.titleBase.length, c.slug).toBeLessThanOrEqual(45);
      expect(`${c.titleBase} | ${ORG_NAME}`.length, c.slug).toBeLessThanOrEqual(60);
    }
    expect(getCaseType("motor-vehicle-accident")!.titleBase).toBe("Motor Vehicle Accident Economist");
    expect(getCaseType("traumatic-brain-injury")!.titleBase).toBe("Traumatic Brain Injury Economist");
    expect(getCaseType("employment-discrimination")!.titleBase).toBe("Employment Discrimination Economist");
    expect(getCaseType("partnership-and-shareholder-dispute")!.titleBase).toBe("Partnership and Shareholder Dispute Economist");
  });

  it("shortName is the name where it fits the 20-character journey budget, else a whole-word part of the name or a standard short form", () => {
    for (const c of caseTypes) {
      expect(c.shortName.length, c.slug).toBeLessThanOrEqual(20);
      expect(c.shortName, c.slug).not.toMatch(/[–—§&]/);
      const standard = STANDARD_SHORT_FORMS[c.slug];
      if (standard) expect(c.shortName, c.slug).toBe(standard);
      else expect(c.name, `${c.slug}: "${c.shortName}" is not a whole-word part of "${c.name}"`).toMatch(new RegExp(`(^|\\s)${escapeRegExp(c.shortName)}(\\s|$)`));
      if (c.name.length <= 20) expect(c.shortName, c.slug).toBe(c.name);
    }
    expect(getCaseType("employment-discrimination")!.shortName).toBe("Discrimination");
    expect(getCaseType("partnership-and-shareholder-dispute")!.shortName).toBe("Shareholder Dispute");
    expect(getCaseType("wrongful-death")!.shortName).toBe("Wrongful Death");
  });

  it("the state tier keeps the full stem and the full place wherever they fit, then the short stem, and abbreviates the state only where no stem fits beside the full place name", () => {
    const rungs = { fullStem: 0, shortStem: 0, abbreviated: 0 };
    for (const c of caseTypes) {
      for (const s of states) {
        const label = `${c.slug}/${s.slug}`;
        const title = caseTypeStateTitle(c, s, ORG_NAME);
        expect(title.length, label).toBeLessThanOrEqual(60);
        const place = placeName(s.name);
        const ladder = [
          `${c.titleBase} in ${place}`,
          `${c.shortName} Economist in ${place}`,
          `${c.titleBase} in ${s.abbreviation}`,
          `${c.shortName} Economist in ${s.abbreviation}`,
        ].map((body) => `${body} | ${ORG_NAME}`);
        expect(title, label).toBe(ladder.find((t) => t.length <= 60));
        if (title.includes(` in ${s.abbreviation} |`)) rungs.abbreviated++;
        else if (title.startsWith(`${c.titleBase} in `)) rungs.fullStem++;
        else rungs.shortStem++;
      }
    }
    // 14 case types x 56 places: the full stem beside the full place name on
    // most pages; the short stem on the long-named families only; the
    // abbreviation only for the District, the territories, and the two-word
    // states beside the longest stems.
    expect(rungs).toEqual({ fullStem: 463, shortStem: 261, abbreviated: 60 });
    const ed = getCaseType("employment-discrimination")!;
    expect(caseTypeStateTitle(ed, stateBySlug("texas"), ORG_NAME)).toBe(`Employment Discrimination Economist in Texas | ${ORG_NAME}`);
    expect(caseTypeStateTitle(ed, stateBySlug("north-carolina"), ORG_NAME)).toBe(`Discrimination Economist in North Carolina | ${ORG_NAME}`);
    expect(caseTypeStateTitle(ed, stateBySlug("district-of-columbia"), ORG_NAME)).toBe(`Employment Discrimination Economist in DC | ${ORG_NAME}`);
    expect(caseTypeStateTitle(getCaseType("partnership-and-shareholder-dispute")!, stateBySlug("texas"), ORG_NAME)).toBe(
      `Shareholder Dispute Economist in Texas | ${ORG_NAME}`,
    );
    expect(caseTypeStateTitle(getCaseType("partnership-and-shareholder-dispute")!, stateBySlug("north-carolina"), ORG_NAME)).toBe(
      `Shareholder Dispute Economist in NC | ${ORG_NAME}`,
    );
    expect(caseTypeStateTitle(getCaseType("wrongful-death")!, stateBySlug("new-jersey"), ORG_NAME)).toBe(`Wrongful Death Economist in New Jersey | ${ORG_NAME}`);
    expect(caseTypeStateTitle(getCaseType("wrongful-death")!, stateBySlug("district-of-columbia"), ORG_NAME)).toBe(`Wrongful Death Economist in DC | ${ORG_NAME}`);
  });

  it("carries ISO publication dates for the byline and the Article node", () => {
    for (const c of caseTypes) {
      expect(c.datePublished, c.slug).toMatch(ISO_DATE);
      expect(c.dateModified, c.slug).toMatch(ISO_DATE);
      expect(c.dateModified >= c.datePublished, c.slug).toBe(true);
    }
  });
});

describe("case-type answer-block fields", () => {
  it("summaryShort is one or two sentences in the house style", () => {
    for (const c of caseTypes) {
      expect(c.summaryShort.length, c.slug).toBeGreaterThan(120);
      expect(c.summaryShort.length, c.slug).toBeLessThan(400);
      expect(c.summaryShort, c.slug).toMatch(/\.$/);
      expect(c.summaryShort.split(/\.\s+(?=[A-Z])/).length, c.slug).toBeLessThanOrEqual(2);
      // Not a prefix of the long summary: it is authored, not derived.
      expect(c.summary.startsWith(c.summaryShort), c.slug).toBe(false);
    }
  });

  it("inShort has three lines and steps has four, each a complete sentence", () => {
    for (const c of caseTypes) {
      expect(c.inShort, c.slug).toHaveLength(3);
      expect(c.steps, c.slug).toHaveLength(4);
      for (const line of [...c.inShort, ...c.steps]) {
        expect(line, `${c.slug}: ${line}`).toMatch(/^[A-Z].*\.$/);
        expect(line.length, `${c.slug}: ${line}`).toBeGreaterThan(60);
      }
      expect(new Set(c.steps).size, c.slug).toBe(4);
    }
    expect(getCaseType("wrongful-death")!.steps[0]).toBe(
      "Establish the decedent's earnings and fringe benefit base from the tax, wage, and benefit records.",
    );
  });

  it("new copy is citation-free, figure-free, hyphen-only, and economics-framed", () => {
    for (const c of caseTypes) {
      const text = [c.titleBase, c.summaryShort, ...c.inShort, ...c.steps].join(" ");
      expect(text, c.slug).not.toMatch(/[–—§]/);
      expect(text, c.slug).not.toMatch(RULE_CITE);
      expect(text, c.slug).not.toMatch(FIGURES);
      expect(text, c.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, c.slug).not.toMatch(SISTER_VOCABULARY);
      expect(text, c.slug).not.toMatch(/maximi[sz]e|fight for|win your case/i);
    }
  });
});
