import { describe, expect, it } from "vitest";
import {
  caseTypes,
  getCaseType,
  caseTypeHubHeading,
  caseTypeHubDescription,
  caseTypeStateHeading,
  caseTypeStateDescription,
  caseTypeStateLead,
  caseTypeStateStepsIntro,
  caseTypeStateFramework,
  caseTypeStateFrameworkQuestion,
  caseTypeStateServiceDescription,
  caseTypeSectionHeadings,
} from "./caseTypes";
import { getAllServiceSlugs, pillarServices } from "./services";
import { states } from "./states";
import { placeName } from "./geo-prose.mjs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { caseTypeHubTitle, caseTypeStateTitle, serviceTitleLabels } from "@/lib/page-titles.mjs";

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
      // A framing entry (the family-law matter) supplies its own stems in
      // place of titleBase and "<shortName> Economist".
      const stems = c.framing?.stateTitleStems ?? [c.titleBase, `${c.shortName} Economist`];
      for (const s of states) {
        const label = `${c.slug}/${s.slug}`;
        const title = caseTypeStateTitle(c, s, ORG_NAME);
        expect(title.length, label).toBeLessThanOrEqual(60);
        const place = placeName(s.name);
        const ladder = [
          ...stems.map((stem) => `${stem} in ${place}`),
          ...stems.map((stem) => `${stem} in ${s.abbreviation}`),
        ].map((body) => `${body} | ${ORG_NAME}`);
        expect(title, label).toBe(ladder.find((t) => t.length <= 60));
        if (title.includes(` in ${s.abbreviation} |`)) rungs.abbreviated++;
        else if (title.startsWith(`${stems[0]} in `)) rungs.fullStem++;
        else rungs.shortStem++;
      }
    }
    // 14 case types x 56 places: the full stem beside the full place name on
    // most pages; the short stem on the long-named families only; the
    // abbreviation only for the District, the territories, and the two-word
    // states beside the longest stems. The divorce entry's own stem fits
    // beside every place but the District, the U.S. Virgin Islands, and the
    // Northern Mariana Islands.
    expect(rungs).toEqual({ fullStem: 516, shortStem: 205, abbreviated: 63 });
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

// The divorce matter is an income, valuation, and tracing assignment, not a
// damages claim (site audit 2026-09-05, F08: "Divorce case metadata uses
// generic economic-loss/damages framing"). Its copy describes that assignment
// in neutral family-law language, and its `framing` block carries the page
// strings the case-type templates substitute for the shared damages framing
// through the helpers at the bottom of caseTypes.ts (pinned below and, as
// rendered, in src/pages/templates/CaseTypeFraming.render.test.tsx).
describe("divorce case type: family-law framing", () => {
  const divorce = getCaseType("divorce-and-marital-dissolution")!;
  const longText = [divorce.summary, divorce.summaryShort, ...divorce.inShort, ...divorce.steps, divorce.lossComponents, divorce.damagesExposure, divorce.economicImpact, ...divorce.faqs.map((f) => `${f.question} ${f.answer}`)].join(" ");
  const framing = divorce.framing!;
  const framingText = [
    framing.titleStem,
    ...framing.stateTitleStems,
    framing.hubHeading,
    framing.hubDescription,
    framing.stateHeadingStem,
    framing.stateDescription,
    framing.stateLead,
    framing.stateStepsIntro,
    framing.stateFramework,
    framing.stateFrameworkQuestion,
    ...Object.values(framing.sections),
  ].join(" ");
  const ADVOCACY = /maximi[sz]e|minimi[sz]e|fight for|win your case|winning|aggressive|leverage|protect your|hide|hidden assets/i;
  const longestPlace = states.map((s) => placeName(s.name)).sort((a, b) => b.length - a.length)[0];

  it("describes the income, valuation, and tracing assignment rather than an economic loss", () => {
    for (const phrase of ["income available for support", "business or professional practice", "separate and marital property", "present value of pensions", "normalized"]) {
      expect(longText.toLowerCase(), phrase).toContain(phrase);
    }
    expect(longText).toMatch(/cash flow/);
    expect(longText).toMatch(/personal and enterprise goodwill/);
    expect(longText).toMatch(/equitable distribution or community property/);
    // The lead names the damages claim only to say the matter is not one.
    expect(longText).not.toMatch(/economic damages|economic loss|lost earnings|worklife/i);
    expect(longText.match(/damages/gi)).toHaveLength(1);
    expect(divorce.summary).toMatch(/rather than a damages claim/);
  });

  it("uses neutral family-law language for either spouse or the court", () => {
    expect(longText).not.toMatch(ADVOCACY);
    expect(longText).toMatch(/either spouse or the court/);
    expect(divorce.faqs.some((f) => /joint or court-appointed/.test(f.question))).toBe(true);
  });

  it("hands the earning-capacity question to the affiliated vocational practice without sister-site vocabulary", () => {
    expect(divorce.economicImpact).toMatch(/vocational discipline/);
    expect(divorce.economicImpact).toMatch(/affiliated vocational practice/);
    const faq = divorce.faqs.find((f) => /earning capacity/.test(f.question))!;
    expect(faq).toBeDefined();
    expect(faq.answer).toMatch(/affiliated vocational practice/);
    expect(longText).not.toMatch(SISTER_VOCABULARY);
    expect(longText).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(longText).not.toMatch(/[–—§]/);
    expect(longText).not.toMatch(FIGURES);
  });

  it("keeps the titleBase the shared title builder expects, inside the 60-character tag", () => {
    expect(divorce.titleBase).toBe("Divorce and Marital Dissolution Economist");
    expect(`${divorce.titleBase} | ${ORG_NAME}`.length).toBeLessThanOrEqual(60);
    expect(divorce.shortName).toBe("Divorce");
    expect(divorce.dateModified >= "2026-09-05").toBe(true);
    expect(divorce.relevantServices).toEqual(["divorce-and-marital-financial-analysis", "business-valuation", "fraud-and-asset-tracing", "expert-rebuttal-and-report-review"]);
  });

  it("carries page framing that replaces the damages strings and fits the SERP windows", () => {
    // The audit's proposed metadata (kwe-brief.md "Pages with proposed
    // metadata changes"), title stems aside (see the next test).
    expect(framing.hubHeading).toBe("Financial Analysis for Divorce and Marital Dissolution");
    expect(framing.stateHeadingStem).toBe("Financial Analysis for Divorce and Marital Dissolution");
    expect(framing.hubDescription.length).toBeGreaterThanOrEqual(110);
    expect(framing.hubDescription.length).toBeLessThanOrEqual(160);
    expect(framing.hubDescription).toMatch(/\.$/);
    expect(framing.hubDescription).toMatch(/^Income analysis, business valuation, and funds tracing/);
    expect(framing.stateDescription.match(/\{place\}/g)).toHaveLength(1);
    expect(framing.stateDescription).not.toMatch(/\{org\}/);
    const longestStateDescription = framing.stateDescription.replace("{place}", longestPlace);
    expect(longestStateDescription.length, longestStateDescription).toBeLessThanOrEqual(160);
    expect(longestStateDescription.length).toBeGreaterThanOrEqual(110);
    expect(framing.stateLead).toMatch(/\{org\}/);
    expect(framing.stateLead).toMatch(/\{place\}/);
    expect(framing.stateLead).not.toMatch(/\{(?!org\}|place\})/);
    for (const slotted of [framing.stateStepsIntro, framing.stateFramework, framing.stateFrameworkQuestion]) {
      expect(slotted).toMatch(/\{place\}/);
      expect(slotted).not.toMatch(/\{(?!place\})/);
    }
    expect(framing.stateFrameworkQuestion).toMatch(/\?$/);
    expect(`${framing.stateHeadingStem} in ${longestPlace}`.length).toBeLessThanOrEqual(90);
    expect(new Set(Object.values(framing.sections)).size).toBe(4);
    expect(framingText).not.toMatch(/damages|economic claim|loss components/i);
    expect(framingText).not.toMatch(/[–—§]/);
    expect(framingText).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(framingText).not.toMatch(SISTER_VOCABULARY);
    expect(framingText).not.toMatch(ADVOCACY);
  });

  it("supplies title stems that fit the SERP window and collide with no service pillar title", () => {
    expect(framing.titleStem).toBe("Divorce Financial Analysis");
    expect(caseTypeHubTitle(divorce, ORG_NAME)).toBe(`Divorce Financial Analysis | ${ORG_NAME}`);
    // The state tier cannot reuse "Divorce Financial Analysis in <place>":
    // the service pillar's state pages already carry that title, and no two
    // routes may advertise the same title (src/lib/page-titles.test.ts).
    expect(framing.stateTitleStems).toEqual(["Divorce Financial Expert"]);
    const pillarLabels = new Set(pillarServices().flatMap(serviceTitleLabels));
    for (const stem of framing.stateTitleStems) expect(pillarLabels.has(stem), stem).toBe(false);
    expect(caseTypeStateTitle(divorce, stateBySlug("texas"), ORG_NAME)).toBe(`Divorce Financial Expert in Texas | ${ORG_NAME}`);
    expect(caseTypeStateTitle(divorce, stateBySlug("north-carolina"), ORG_NAME)).toBe(`Divorce Financial Expert in North Carolina | ${ORG_NAME}`);
    expect(caseTypeStateTitle(divorce, stateBySlug("district-of-columbia"), ORG_NAME)).toBe(`Divorce Financial Expert in DC | ${ORG_NAME}`);
    // Every other case type keeps the titleBase hub title.
    for (const c of caseTypes.filter((x) => !x.framing)) expect(caseTypeHubTitle(c, ORG_NAME)).toBe(`${c.titleBase} | ${ORG_NAME}`);
  });

  it("the page helpers substitute the framing strings for the divorce entry and keep the damages strings elsewhere", () => {
    const place = placeName(stateBySlug("district-of-columbia").name);
    expect(caseTypeHubHeading(divorce)).toBe(framing.hubHeading);
    expect(caseTypeHubDescription(divorce)).toBe(framing.hubDescription);
    expect(caseTypeStateHeading(divorce, place)).toBe(`${framing.stateHeadingStem} in ${place}`);
    expect(caseTypeStateDescription(divorce, place)).toBe(framing.stateDescription.replace("{place}", place));
    expect(caseTypeStateServiceDescription(divorce, place)).toBe(caseTypeStateDescription(divorce, place));
    expect(caseTypeStateLead(divorce, ORG_NAME, place)).toBe(framing.stateLead.replace("{org}", ORG_NAME).replace("{place}", place));
    expect(caseTypeStateStepsIntro(divorce, place)).toBe(framing.stateStepsIntro.replace(/\{place\}/g, place));
    expect(caseTypeStateFramework(divorce, place, "fault text")).toBe(framing.stateFramework.replace("{place}", place));
    expect(caseTypeStateFrameworkQuestion(divorce, place)).toBe(framing.stateFrameworkQuestion.replace("{place}", place));
    expect(caseTypeSectionHeadings(divorce)).toEqual(framing.sections);
    for (const fn of [caseTypeStateLead(divorce, ORG_NAME, place), caseTypeStateStepsIntro(divorce, place), caseTypeStateFramework(divorce, place, "")]) {
      expect(fn).not.toMatch(/\{(org|place)\}/);
      expect(fn).not.toMatch(/a the |the the /);
    }

    const wd = getCaseType("wrongful-death")!;
    expect(caseTypeHubHeading(wd)).toBe("Wrongful Death Economic Damages Analysis");
    expect(caseTypeHubDescription(wd)).toBe(
      "Wrongful Death economic damages: loss components, the records that drive them, and how the present value is built. Plaintiff and defense.",
    );
    expect(caseTypeStateHeading(wd, "New Jersey")).toBe("Wrongful Death Economic Damages Expert in New Jersey");
    expect(caseTypeStateDescription(wd, "New Jersey")).toBe(
      "Wrongful Death economic damages in New Jersey: loss components, state damages rules and venues, and how the number is built.",
    );
    expect(caseTypeStateServiceDescription(wd, "New Jersey")).toBe("Economic damages analysis for wrongful death matters in New Jersey.");
    expect(caseTypeStateLead(wd, ORG_NAME, "New Jersey")).toMatch(/^KW Economics prepares economic damages analyses for wrongful death cases venued in New Jersey:/);
    expect(caseTypeStateStepsIntro(wd, "New Jersey")).toBe(
      "The same four steps apply to a wrongful death case venued in New Jersey; the damages framework above decides which components enter the total.",
    );
    expect(caseTypeStateFramework(wd, "New Jersey", "fault text")).toBe("fault text");
    expect(caseTypeStateFrameworkQuestion(wd, "New Jersey")).toBe("How does New Jersey's damages framework shape the economic analysis?");
    expect(caseTypeSectionHeadings(wd)).toEqual({
      components: "What the economic claim consists of",
      concentration: "Where the damages concentrate",
      method: "How the analysis is built",
      framework: "Damages framework",
    });
  });

  it("is the only case type that overrides the shared framing, and only a family matter may", () => {
    for (const c of caseTypes) {
      if (c.framing) expect(c.category, c.slug).toBe("family");
    }
    expect(caseTypes.filter((c) => c.framing).map((c) => c.slug)).toEqual(["divorce-and-marital-dissolution"]);
  });
});
