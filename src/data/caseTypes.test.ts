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
  caseTypePairStateLead,
  caseTypeStateCourts,
  caseTypeHubLinkLabel,
  caseTypeExpertStandard,
  caseTypePairStateFrameworkTail,
  caseTypeCourtSelection,
  caseTypeVenuesHeading,
  caseTypeStateCourtsQuestion,
  caseTypePairStateExpertQuestion,
  caseTypeStateForums,
} from "./caseTypes";
import { stateRegulations, expertInquiryOf } from "./regulations/state-regs";
import { circuitOfState } from "./courts/federal-districts";
import { getCourtsByState, selectTrialCourts } from "./courts/state-courts";
import { getAllServiceSlugs, pillarServices } from "./services";
import { states } from "./states";
import { placeName } from "./geo-prose.mjs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { caseTypeHubTitle, caseTypeStateTitle, serviceTitleLabels } from "@/lib/page-titles.mjs";

const SLUGS = ["commercial-contract-dispute","divorce-and-marital-dissolution","employment-discrimination","fraud-and-embezzlement","medical-malpractice","motor-vehicle-accident","partnership-and-shareholder-dispute","personal-injury","product-liability","spinal-cord-injury","tax-and-transfer-pricing-dispute","traumatic-brain-injury","workers-compensation","wrongful-death","wrongful-termination"];

describe("economics case types", () => {
  it("has the 15 case types", () => {
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
  it("commercial, family, and tax matters point at valuation/accounting pillars", () => {
    expect(getCaseType("partnership-and-shareholder-dispute")!.relevantServices).toContain("business-valuation");
    expect(getCaseType("fraud-and-embezzlement")!.relevantServices).toContain("fraud-and-asset-tracing");
    expect(getCaseType("divorce-and-marital-dissolution")!.relevantServices).toContain("divorce-and-marital-financial-analysis");
    expect(getCaseType("tax-and-transfer-pricing-dispute")!.relevantServices[0]).toBe("transfer-pricing-expert-witness");
    // The transfer pricing pillar declares the two commercial matters and the divorce matter too, so their hubs list it.
    expect(getCaseType("commercial-contract-dispute")!.relevantServices).toContain("transfer-pricing-expert-witness");
    expect(getCaseType("partnership-and-shareholder-dispute")!.relevantServices).toContain("transfer-pricing-expert-witness");
    expect(getCaseType("divorce-and-marital-dissolution")!.relevantServices).toContain("transfer-pricing-expert-witness");
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
  // "Transfer Pricing", the run of words that fits, is the pillar's own
  // label, and the pair titles would read "Transfer Pricing Expert for
  // Transfer Pricing"; the matter's standard short form keeps them distinct.
  "tax-and-transfer-pricing-dispute": "Tax Dispute",
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
    // 15 case types x 56 places: the full stem beside the full place name on
    // most pages; the short stem on the long-named families only; the
    // abbreviation only for the District, the territories, and the two-word
    // states beside the longest stems. The divorce entry's own stem, and the
    // tax entry's ("Transfer Pricing Economist", added 2026-10-05: 53 full
    // stems and 3 abbreviations over the 14-type counts of 516, 205, 63), fit
    // beside every place but the District, the U.S. Virgin Islands, and the
    // Northern Mariana Islands.
    expect(rungs).toEqual({ fullStem: 569, shortStem: 205, abbreviated: 66 });
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
    framing.pairStateLead,
    framing.expertStandard,
    framing.pairStateFrameworkTail,
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
    // The transfer pricing pillar declares the divorce matter (a spouse's
    // business that trades with affiliates the same owner controls), so the
    // hub lists it beside the valuation and tracing pillars.
    expect(divorce.relevantServices).toEqual(["divorce-and-marital-financial-analysis", "business-valuation", "fraud-and-asset-tracing", "transfer-pricing-expert-witness", "expert-rebuttal-and-report-review"]);
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

  it("only the family-law matter and the tax matter override the shared framing", () => {
    // The framing block is reserved for matters that are not damages claims:
    // the family-law matter (an income, valuation, and tracing assignment)
    // and the tax and transfer pricing dispute (an arm's length or valuation
    // question), identified by their categories.
    for (const c of caseTypes) {
      if (c.framing) expect(["family", "tax"], c.slug).toContain(c.category);
    }
    expect(caseTypes.filter((c) => c.framing).map((c) => c.slug)).toEqual(["divorce-and-marital-dissolution", "tax-and-transfer-pricing-dispute"]);
  });
});

// The tax and transfer pricing dispute (owner request 2026-10-05) is an arm's
// length or valuation question, not a damages claim: what one company in a
// group charged another, measured against what unrelated parties would have
// agreed to. Its `framing` block carries the page strings the case-type
// templates substitute for the shared damages framing, the service x case
// type x state lead, and a courts sentence that names the federal tax forums
// before the state's trial courts (pinned below and, as rendered, in
// src/pages/templates/CaseTypeFraming.render.test.tsx).
describe("tax and transfer pricing dispute case type: arm's length framing", () => {
  const tax = getCaseType("tax-and-transfer-pricing-dispute")!;
  const framing = tax.framing!;
  const longText = [tax.summary, tax.summaryShort, ...tax.inShort, ...tax.steps, tax.lossComponents, tax.damagesExposure, tax.economicImpact, ...tax.faqs.map((f) => `${f.question} ${f.answer}`)].join(" ");
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
    framing.pairStateLead,
    framing.courtsSentence ?? "",
    framing.expertStandard,
    framing.pairStateFrameworkTail,
    framing.circuitNote ?? "",
    framing.forums?.noun ?? "",
    framing.forums?.courtsQuestion ?? "",
    framing.forums?.expertQuestion ?? "",
    ...(framing.forums?.list ?? []).flatMap((f) => [f.label, f.description]),
    ...Object.values(framing.sections),
  ].join(" ");
  const ADVOCACY = /maximi[sz]e|minimi[sz]e|fight for|win your case|winning|aggressive|leverage|protect your|avoid tax|tax shelter/i;
  const CITATION = /\bSection \d|\bRule \d|U\.S\.C\.|C\.F\.R\.|[–—§]/;
  const longestPlace = states.map((s) => placeName(s.name)).sort((a, b) => b.length - a.length)[0];

  it("describes the arm's length and valuation assignment, neutrally, rather than an economic loss", () => {
    for (const phrase of ["arm's length", "controlled transaction", "functional analysis", "comparables", "best method rule", "Tax Court", "valuation"]) {
      expect(longText, phrase).toContain(phrase);
    }
    expect(longText).not.toMatch(/economic damages|economic loss|lost earnings|worklife|personal consumption|household services/i);
    expect(longText).not.toMatch(ADVOCACY);
    expect(longText).not.toMatch(CITATION);
    expect(longText).not.toMatch(FIGURES);
    expect(longText).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(longText).not.toMatch(SISTER_VOCABULARY);
  });

  it("keeps the titleBase the shared builders expect, takes the Tax Dispute short form, and lists the pillars that declare it", () => {
    expect(tax.titleBase).toBe("Tax and Transfer Pricing Dispute Economist");
    expect(caseTypeHubTitle(tax, ORG_NAME)).toBe(`Tax and Transfer Pricing Dispute Economist | ${ORG_NAME}`);
    expect(tax.shortName).toBe("Tax Dispute");
    expect(tax.category).toBe("tax");
    expect(tax.relevantServices).toEqual(["transfer-pricing-expert-witness", "business-valuation", "expert-rebuttal-and-report-review"]);
    expect(tax.datePublished).toBe("2026-10-05");
  });

  it("carries page framing that replaces the damages strings and fits the SERP windows", () => {
    expect(framing.hubHeading).toBe("Economic Analysis for Tax and Transfer Pricing Disputes");
    expect(framing.hubDescription.length).toBeGreaterThanOrEqual(110);
    expect(framing.hubDescription.length).toBeLessThanOrEqual(160);
    expect(framing.hubDescription).toMatch(/\.$/);
    expect(framing.stateDescription.match(/\{place\}/g)).toHaveLength(1);
    expect(framing.stateDescription).not.toMatch(/\{org\}/);
    const longestStateDescription = framing.stateDescription.replace("{place}", longestPlace);
    expect(longestStateDescription.length, longestStateDescription).toBeLessThanOrEqual(160);
    expect(longestStateDescription.length).toBeGreaterThanOrEqual(110);
    expect(framing.stateLead).toMatch(/\{org\}/);
    expect(framing.stateLead).toMatch(/\{place\}/);
    expect(framing.stateLead).not.toMatch(/\{(?!org\}|place\})/);
    for (const slotted of [framing.stateStepsIntro, framing.stateFrameworkQuestion]) {
      expect(slotted).toMatch(/\{place\}/);
      expect(slotted).not.toMatch(/\{(?!place\})/);
    }
    expect(framing.stateFramework).toMatch(/\{place\}/);
    expect(framing.stateFramework).toMatch(/\{circuitNote\}/);
    expect(framing.stateFramework).not.toMatch(/\{(?!place\}|circuitNote\})/);
    expect(framing.circuitNote).not.toMatch(/\{(?!place\}|circuit\})/);
    expect(framing.pairStateLead).not.toMatch(/\{(?!org\}|work\}|matter\}|place\}|attr\})/);
    // The courts answer is complete sentences that carry the appeals of the
    // federal forums and of the state, and send a divorce to the court that
    // hears divorce in the state.
    expect(framing.courtsSentence).toMatch(/\.$/);
    expect(framing.courtsSentence).toMatch(/\{courts\}, with final appeals to the \{supremeCourt\}/);
    expect(framing.courtsSentence).toContain("[[/case-types/divorce-and-marital-dissolution/{stateSlug}|");
    expect(framing.courtsSentence).toContain("the Federal Circuit");
    expect(framing.courtsSentence).not.toMatch(/\{(?!place\}|courts\}|supremeCourt\}|stateSlug\})/);
    expect(framing.expertStandard).toMatch(/\{inquiry\}/);
    expect(framing.expertStandard).not.toMatch(/\{(?!place\}|inquiry\})/);
    expect(framing.forums!.courtsQuestion).toMatch(/\?$/);
    expect(framing.forums!.expertQuestion).toMatch(/\?$/);
    expect(framing.stateFrameworkQuestion).toMatch(/\?$/);
    expect(`${framing.stateHeadingStem} in ${longestPlace}`.length).toBeLessThanOrEqual(90);
    expect(new Set(Object.values(framing.sections)).size).toBe(4);
    expect(framingText).not.toMatch(/damages|economic claim|loss components/i);
    expect(framingText).not.toMatch(CITATION);
    expect(framingText).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(framingText).not.toMatch(SISTER_VOCABULARY);
    expect(framingText).not.toMatch(ADVOCACY);
  });

  it("supplies a state title stem that fits the SERP window and collides with no service pillar title", () => {
    expect(framing.titleStem).toBe(tax.titleBase);
    expect(framing.stateTitleStems).toEqual(["Transfer Pricing Economist"]);
    const pillarLabels = new Set(pillarServices().flatMap(serviceTitleLabels));
    for (const stem of framing.stateTitleStems) expect(pillarLabels.has(stem), stem).toBe(false);
    expect(caseTypeStateTitle(tax, stateBySlug("texas"), ORG_NAME)).toBe(`Transfer Pricing Economist in Texas | ${ORG_NAME}`);
    expect(caseTypeStateTitle(tax, stateBySlug("north-carolina"), ORG_NAME)).toBe(`Transfer Pricing Economist in North Carolina | ${ORG_NAME}`);
    expect(caseTypeStateTitle(tax, stateBySlug("district-of-columbia"), ORG_NAME)).toBe(`Transfer Pricing Economist in DC | ${ORG_NAME}`);
  });

  it("the page helpers substitute the framing strings for the tax entry and keep the shared and divorce strings elsewhere", () => {
    const dc = placeName(stateBySlug("district-of-columbia").name);
    expect(caseTypeHubHeading(tax)).toBe(framing.hubHeading);
    expect(caseTypeHubDescription(tax)).toBe(framing.hubDescription);
    expect(caseTypeStateHeading(tax, "Texas")).toBe("Economic Analysis for Tax and Transfer Pricing Disputes in Texas");
    expect(caseTypeSectionHeadings(tax)).toEqual(framing.sections);
    // The framework paragraph names the circuit whose appellate decisions
    // govern a business based in the place, and none where there is none.
    const txFramework = caseTypeStateFramework(tax, "Texas", "fault text", circuitOfState("texas"));
    expect(txFramework).toContain("for the circuit where a corporation has its principal place of business (for a business based in Texas, the Fifth Circuit), whose precedent the Tax Court follows");
    expect(txFramework).not.toMatch(/same federal arm's length rules|\{[a-zA-Z]+\}/);
    expect(caseTypeStateFramework(tax, "Texas", "fault text")).toBe(
      framing.stateFramework.replace(/\{place\}/g, "Texas").replace("{circuitNote}", ""),
    );
    expect(caseTypeStateFramework(tax, dc, "", circuitOfState("district-of-columbia"))).toContain("(for a business based in the District of Columbia, the D.C. Circuit)");
    expect(circuitOfState("american-samoa")).toBeUndefined();
    expect(caseTypeStateServiceDescription(tax, "Texas")).toBe(caseTypeStateDescription(tax, "Texas"));

    const lead = caseTypePairStateLead(tax, ORG_NAME, "transfer pricing analysis", "Texas", "Texas");
    expect(lead).toBe(
      "KW Economics prepares transfer pricing analysis for tax and transfer pricing dispute matters involving businesses in Texas: the controlled transactions and prices at issue, the records and comparables that test them, and a report written for the forum that decides the dispute. Either side.",
    );
    expect(lead).not.toMatch(/loss claim|present value|damages rules|Plaintiff and defense/);
    const tx = { place: "Texas", courtList: "the District Court (General jurisdiction)", supremeCourt: "Supreme Court of Texas", stateSlug: "texas" };
    const courts = caseTypeStateCourts(tax, tx, "sentence");
    expect(courts.startsWith("Federal income tax disputes over related-party prices are heard in the United States Tax Court")).toBe(true);
    expect(courts).toContain("appeals from the Tax Court and the district courts ordinarily go to the federal court of appeals for the circuit where the business is based, and appeals from the Court of Federal Claims to the Federal Circuit.");
    expect(courts).toContain("A dispute over Texas's own tax follows its administrative and appeal process.");
    expect(courts).toContain(
      "Commercial and shareholder claims in Texas that turn on an intercompany price are heard in the District Court (General jurisdiction), with final appeals to the Supreme Court of Texas,",
    );
    expect(courts).toContain("[[/case-types/divorce-and-marital-dissolution/texas|the court that hears divorce in Texas]].");
    // The entry carries its own appeals, so both appeal forms read the same,
    // and no sentence sends a federal tax appeal to the state's high court.
    expect(caseTypeStateCourts(tax, tx, "clause")).toBe(courts);
    expect(courts).not.toMatch(/Final appeals run to|matrimonial claims in Texas/);
    for (const t of [
      caseTypeStateLead(tax, ORG_NAME, dc),
      caseTypeStateStepsIntro(tax, dc),
      caseTypeStateFramework(tax, dc, "", circuitOfState("district-of-columbia")),
      caseTypeStateFrameworkQuestion(tax, dc),
      caseTypePairStateLead(tax, ORG_NAME, "rebuttal analysis", dc, "District of Columbia"),
      caseTypeStateCourts(tax, { place: dc, courtList: "the Superior Court of the District of Columbia (General jurisdiction)", supremeCourt: "District of Columbia Court of Appeals", stateSlug: "district-of-columbia" }, "sentence"),
      caseTypeStateCourtsQuestion(tax, "District of Columbia", dc),
      caseTypePairStateExpertQuestion(tax, "District of Columbia", dc, "rebuttal analysis"),
      ...caseTypeStateForums(tax, dc, "District of Columbia").flatMap((f) => [f.name, f.description]),
    ]) {
      expect(t).not.toMatch(/\{[a-zA-Z]+\}/);
      expect(t).not.toMatch(/a the |the the |in District of Columbia/);
    }

    // The shared damages strings and the divorce entry's own strings are
    // unchanged by the helpers.
    const wd = getCaseType("wrongful-death")!;
    const nj = { place: "New Jersey", courtList: "the Superior Court", supremeCourt: "Supreme Court of New Jersey", stateSlug: "new-jersey" };
    expect(caseTypeStateCourts(wd, nj, "sentence")).toBe(
      "Wrongful Death cases venued in New Jersey are heard in the Superior Court. Final appeals run to the Supreme Court of New Jersey.",
    );
    expect(caseTypeStateCourts(wd, nj, "clause")).toBe(
      "Wrongful Death cases venued in New Jersey are heard in the Superior Court, with final appeals to the Supreme Court of New Jersey.",
    );
    expect(caseTypePairStateLead(wd, ORG_NAME, "lost earnings analysis", "New Jersey", "New Jersey")).toBe(
      "KW Economics prepares lost earnings analysis for wrongful death cases venued in New Jersey: what the loss claim consists of, the records that drive it, and a present value built to New Jersey damages rules and venues. Plaintiff and defense.",
    );
    const divorce = getCaseType("divorce-and-marital-dissolution")!;
    expect(divorce.framing!.courtsSentence).toBeUndefined();
    expect(
      caseTypeStateCourts(divorce, { place: "Florida", courtList: "the Circuit Court", supremeCourt: "Supreme Court of Florida", stateSlug: "florida" }, "sentence"),
    ).toBe("Divorce and Marital Dissolution cases venued in Florida are heard in the Circuit Court. Final appeals run to the Supreme Court of Florida.");
    expect(caseTypePairStateLead(divorce, ORG_NAME, "business valuation", "Florida", "Florida")).toBe(
      "KW Economics prepares business valuation for divorce and marital dissolution matters venued in Florida: the income, valuation, and tracing questions the matter raises, the records that answer them, and a presentation built to the way Florida courts decide them. Either party.",
    );
    expect(caseTypeHubLinkLabel(wd)).toBe("Wrongful Death: the economic claim, where the damages concentrate, and how the analysis is built");
    expect(caseTypeHubLinkLabel(divorce)).toBe(
      "Divorce and Marital Dissolution: what the financial analysis consists of, which figures move the result, and how the analysis is built",
    );
    expect(caseTypeHubLinkLabel(tax)).toBe(
      "Tax and Transfer Pricing Dispute: what the economic analysis consists of, which choices move the result, and how the analysis is built",
    );
  });
});

// Review fixes (2026-10-05): the framing entries' state pages carried the
// state's expert standard, whose closing sentence speaks of a damages report
// ("Forensic economic methods for lost earnings, household services, and
// present value ..."), and the tax pages listed only the state's trial courts
// (the Court of Claims among them) for a dispute most often heard in the
// federal tax forums. The helpers below replace both on the framing entries
// and leave every other entry's strings untouched.
describe("framing entries: expert standard, forums, and court selection", () => {
  const tax = getCaseType("tax-and-transfer-pricing-dispute")!;
  const divorce = getCaseType("divorce-and-marital-dissolution")!;
  const wd = getCaseType("wrongful-death")!;
  const DAMAGES_REPORT = /damages|lost earnings|household services|present value|worklife/i;

  it("every state entry states its inquiry first, and the inquiry alone names no damages opinion", () => {
    for (const r of stateRegulations) {
      const inquiry = expertInquiryOf(r);
      expect(inquiry, r.stateSlug).toMatch(/\.$/);
      expect(inquiry, r.stateSlug).not.toMatch(DAMAGES_REPORT);
      expect(inquiry.length, r.stateSlug).toBeGreaterThan(100);
      if (!r.expertInquiry) expect(r.expertStandard.startsWith(inquiry), r.stateSlug).toBe(true);
    }
    // The two entries whose first sentence names a damages opinion carry the inquiry on its own.
    expect(stateRegulations.filter((r) => r.expertInquiry).map((r) => r.stateSlug)).toEqual(["alabama", "indiana"]);
  });

  it("the tax and divorce state pages print the state's inquiry with their own close, never the damages-report sentence", () => {
    for (const r of stateRegulations) {
      const st = states.find((s) => s.slug === r.stateSlug)!;
      const place = placeName(st.name);
      const taxStandard = caseTypeExpertStandard(tax, place, r);
      expect(taxStandard, r.stateSlug).toMatch(/^Federal tax forums test expert testimony under the federal rules of evidence, which the Tax Court applies by statute/);
      expect(taxStandard, r.stateSlug).toContain(`heard in ${place}'s courts are tested under its own standard`);
      expect(taxStandard, r.stateSlug).toContain(expertInquiryOf(r));
      expect(taxStandard.endsWith("A transfer pricing report meets each of these inquiries by stating every method choice and naming the data behind every comparable."), r.stateSlug).toBe(true);
      const divorceStandard = caseTypeExpertStandard(divorce, place, r);
      expect(divorceStandard.startsWith(expertInquiryOf(r)), r.stateSlug).toBe(true);
      for (const text of [taxStandard, divorceStandard]) {
        expect(text, r.stateSlug).not.toMatch(DAMAGES_REPORT);
        expect(text, r.stateSlug).not.toMatch(/\{[a-zA-Z]+\}|a the |the the /);
      }
      // Every other entry keeps the state's own text.
      expect(caseTypeExpertStandard(wd, place, r)).toBe(r.expertStandard);
    }
  });

  it("the pair x state framework FAQ closes on the entry's own sentence on the framing entries", () => {
    expect(caseTypePairStateFrameworkTail(tax, "Texas")).toBe(tax.framing!.pairStateFrameworkTail);
    expect(caseTypePairStateFrameworkTail(divorce, "Florida")).toContain("so counsel can apply the Florida rules to a documented figure");
    for (const c of [tax, divorce]) expect(caseTypePairStateFrameworkTail(c, "Texas")).not.toMatch(/past and future amounts|every rate and table/);
    expect(caseTypePairStateFrameworkTail(wd, "New Jersey")).toBe(
      "The report presents past and future amounts separately, states every rate and table with its source, and shows the result under the alternatives the other side is likely to argue, so counsel can apply the New Jersey rules to a documented figure.",
    );
  });

  it("the tax pages name their forums: the heading, the two questions, and the federal forums ahead of the state's trial courts", () => {
    expect(caseTypeVenuesHeading(tax, "New York")).toBe("New York forums and expert standards");
    expect(caseTypeVenuesHeading(wd, "New York")).toBe("New York courts and expert standards");
    expect(caseTypeStateCourtsQuestion(tax, "Texas", "Texas")).toBe("Which forums hear a tax or transfer pricing dispute involving Texas?");
    expect(caseTypeStateCourtsQuestion(wd, "Texas", "Texas")).toBe("Which Texas courts hear wrongful death cases?");
    expect(caseTypePairStateExpertQuestion(tax, "Texas", "Texas", "transfer pricing analysis")).toBe(
      "What do the forums that hear a tax or transfer pricing dispute involving Texas ask of transfer pricing analysis?",
    );
    expect(caseTypePairStateExpertQuestion(wd, "Texas", "Texas", "lost earnings analysis")).toBe(
      "What do Texas courts ask of lost earnings analysis before it reaches the fact finder?",
    );
    expect(caseTypeStateForums(tax, "New York", "New York").map((f) => f.name)).toEqual([
      "United States Tax Court",
      "United States District Courts",
      "United States Court of Federal Claims",
      "New York tax appeals",
    ]);
    expect(caseTypeStateForums(divorce, "New York", "New York")).toEqual([]);
    expect(caseTypeStateForums(wd, "New York", "New York")).toEqual([]);
    // Commercial and shareholder claims take the business selection (the
    // chancery, business, and general-jurisdiction courts alone), two courts
    // deep after the forums; every other category keeps its own.
    expect(caseTypeCourtSelection(tax)).toEqual({ kind: "business", limit: 2 });
    expect(caseTypeCourtSelection(getCaseType("commercial-contract-dispute")!)).toEqual({ kind: "commercial", limit: undefined });
    expect(caseTypeCourtSelection(divorce)).toEqual({ kind: "family", limit: undefined });
    expect(caseTypeCourtSelection(wd)).toEqual({ kind: "general", limit: undefined });
  });

  it("the business selection lists only chancery, business, and general-jurisdiction courts for the tax matter's civil claims", () => {
    for (const st of states) {
      const courts = getCourtsByState(st.slug);
      if (!courts) continue;
      const { kind, limit } = caseTypeCourtSelection(tax);
      const picked = selectTrialCourts(courts, kind, limit);
      expect(picked.length, st.slug).toBeGreaterThan(0);
      for (const c of picked) {
        expect(`${c.name} ${c.description}`, st.slug).toMatch(/general jurisdiction|general civil|chancery|business|commercial/i);
        expect(`${c.name} ${c.description}`, st.slug).not.toMatch(/claims against|limited jurisdiction|smaller civil|mid-sized|minor civil/i);
      }
    }
    expect(selectTrialCourts(getCourtsByState("new-york")!, "business", 2).map((c) => c.name)).toEqual(["Supreme Court"]);
    expect(selectTrialCourts(getCourtsByState("ohio")!, "business", 2).map((c) => c.name)).toEqual(["Court of Common Pleas"]);
    expect(selectTrialCourts(getCourtsByState("delaware")!, "business", 2).map((c) => c.name)).toEqual(["Court of Chancery", "Superior Court"]);
  });

  it("the tax state descriptions sit inside the 140-160 band in every state and territory", () => {
    for (const st of states) {
      const d = caseTypeStateDescription(tax, placeName(st.name));
      expect(d.length, `${st.slug}: ${d}`).toBeGreaterThanOrEqual(140);
      expect(d.length, `${st.slug}: ${d}`).toBeLessThanOrEqual(160);
    }
  });

  it("the tax matter's penalty answer covers the transactional penalty as well as the net adjustment penalty", () => {
    const faq = tax.faqs.find((f) => f.question === "When does a transfer pricing adjustment carry a penalty?")!;
    expect(faq.answer).toContain("A large net transfer pricing adjustment can carry a penalty");
    expect(faq.answer).toContain("A separate penalty can apply to a single transaction whose price on the return is far from the arm's length price");
    expect(faq.answer).toContain("reasonable cause and good faith");
    expect(faq.answer).not.toMatch(/\d/);
  });

  it("the journey short form keeps the query term on the tax journeys and nowhere else", () => {
    expect(tax.journeyShortName).toBe("Transfer Pricing");
    expect(caseTypes.filter((c) => c.journeyShortName).map((c) => c.slug)).toEqual(["tax-and-transfer-pricing-dispute"]);
    expect(tax.journeyShortName!.length).toBeLessThanOrEqual(20);
  });
});
