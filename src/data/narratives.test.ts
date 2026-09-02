import { describe, expect, it } from "vitest";
import {
  credentialPagePath,
  geoSources,
  getCityNarrative,
  getStateNarrative,
  serviceCityContextParagraph,
  serviceCityDirectAnswer,
  serviceStateDirectAnswer,
  serviceStateVenueParagraph,
} from "./narratives";
import {
  cityGeographicFaqs,
  serviceCityGeographicFaqs,
  serviceStateGeographicFaqs,
  stateGeographicFaqs,
} from "./geographicFaqs";
import { majorEmployers } from "./geo-prose.mjs";
import { getServiceBySlug, pillarServices } from "./services";
import { getStateBySlug, states } from "./states";
import { getRegulationsByState, stateRegulations } from "./regulations/state-regs";
import { REFERENCES } from "./references";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { workPhrase } from "@/lib/service-prose.mjs";
import type { City } from "../types";

// Adapted from the task brief: the runtime helpers take a State object (and
// return a sectioned narrative) rather than slugs, so the test joins the
// sections before asserting on the prose.
const ECON = /wage|earnings|cost of living|damages/i;
const CARE_COST = /attendant care|home health|skilled nursing|life care planner|labor market survey|vocational expert|CLCP/i;
// Hyphens only (no em/en dashes) and no section symbols anywhere in geo prose.
const TYPOGRAPHY = /[–—§]/;
// Figures the geo prose must never print: rates, percentages, dollar amounts.
const FIGURES = /unemployment rate|median hourly wage|\d+(\.\d+)?\s?%|\$\d/i;
// Doubled articles ("a the District of Columbia", "the The Bronx") and an
// indefinite article in front of a capitalized vowel-initial name ("a Alabama
// case", "a Employment ... engagement"): the template slots are worded so that
// neither can be rendered for any state, city, or pillar service.
const DOUBLED_ARTICLE = /\b(a|an|the) (a|an|the)\b/i;
const MISARTICLED = /\ba [AEIO]\w|\ban [B-DF-HJ-NP-TV-Z]\w/;

const stateText = (slug: string, serviceSlug = "lost-earnings-and-earning-capacity") => {
  const state = getStateBySlug(slug)!;
  const service = getServiceBySlug(serviceSlug)!;
  const n = getStateNarrative(state);
  return [
    serviceStateDirectAnswer(ORG_NAME, service.shortName, state.name, n),
    n.directAnswer,
    n.economicContext,
    n.legalContext,
  ].join(" ");
};

describe("economics geo narratives", () => {
  it("state narrative talks about wages, cost of living and damages venue, not care costs", () => {
    const text = stateText("new-jersey", "lost-earnings-and-earning-capacity");
    expect(text).toMatch(ECON);
    expect(text).not.toMatch(CARE_COST);
    expect(text).not.toMatch(TYPOGRAPHY);
    expect(text).not.toMatch(FIGURES);
    expect(text).toContain(ORG_NAME);
    expect(text).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(text.startsWith("KW Economics provides lost earnings analysis for matters venued in New Jersey.")).toBe(true);
  });

  it("service x geo templates render the work the pillar performs, never a loss subject as the thing supplied", () => {
    const tx = getStateBySlug("texas")!;
    const n = getStateNarrative(tx);
    const c = getCityNarrative(tx, "Houston", "houston", "Harris County");
    for (const s of pillarServices()) {
      const work = workPhrase(s.shortName);
      const stateHero = serviceStateDirectAnswer(ORG_NAME, s.shortName, tx.name, n);
      const cityHero = serviceCityDirectAnswer(ORG_NAME, s.shortName, tx.name, "Houston", c);
      expect(stateHero.startsWith(`${ORG_NAME} provides ${work} for matters venued in Texas.`), s.slug).toBe(true);
      expect(cityHero.startsWith(`${ORG_NAME} provides ${work} for cases venued in Houston, Texas.`), s.slug).toBe(true);
      const stateFaqs = serviceStateGeographicFaqs(s, tx.name);
      const cityFaqs = serviceCityGeographicFaqs(s, tx.name, "Houston");
      expect(stateFaqs[0].question, s.slug).toBe(`Does ${ORG_NAME} provide ${work} in Texas?`);
      expect(stateFaqs[0].answer.startsWith(`Yes. ${ORG_NAME} provides ${work} for attorneys handling matters venued in Texas,`), s.slug).toBe(true);
      expect(cityFaqs[0].question, s.slug).toBe(`Does ${ORG_NAME} provide ${work} in Houston, Texas?`);
      expect(cityFaqs[0].answer.startsWith(`Yes. ${ORG_NAME} provides ${work} for attorneys handling matters venued in Houston, Texas,`), s.slug).toBe(true);
      // The engagement question keeps the full name as a proper noun.
      expect(stateFaqs[1].question, s.slug).toContain(`${s.name} engagement look like`);
      for (const text of [stateHero, cityHero, JSON.stringify(stateFaqs), JSON.stringify(cityFaqs)]) {
        expect(text, s.slug).not.toContain("&");
        expect(text, s.slug).not.toContain(`provide ${s.name}`);
        expect(text, s.slug).not.toContain(`provides ${s.name}`);
        expect(text, s.slug).not.toContain(`provide ${s.shortName}`);
        expect(text, s.slug).not.toContain(`provides ${s.shortName}`);
        expect(text, s.slug).not.toContain(`${s.shortName} from ${ORG_NAME}`);
        expect(text, s.slug).not.toMatch(/\b([a-z]{3,}) \1\b/i);
      }
    }
    // The pillars the seam was reported on, pinned word for word.
    const wd = getServiceBySlug("wrongful-death-economic-loss")!;
    const fraud = getServiceBySlug("fraud-and-asset-tracing")!;
    expect(serviceStateDirectAnswer(ORG_NAME, wd.shortName, tx.name, n)).toContain(
      "KW Economics provides wrongful death analysis for matters venued in Texas.",
    );
    expect(serviceStateDirectAnswer(ORG_NAME, fraud.shortName, tx.name, n)).toContain(
      "KW Economics provides fraud and tracing analysis for matters venued in Texas.",
    );
    expect(serviceCityDirectAnswer(ORG_NAME, fraud.shortName, tx.name, "Austin", c)).toContain(
      "KW Economics provides fraud and tracing analysis for cases venued in Austin, Texas.",
    );
    expect(serviceStateGeographicFaqs(wd, tx.name)[0]).toEqual({
      question: "Does KW Economics provide wrongful death analysis in Texas?",
      answer:
        "Yes. KW Economics provides wrongful death analysis for attorneys handling matters venued in Texas, for plaintiff and defense counsel, with the analysis sized to the engagement scope and built from the records that drive the claim and from data for the Texas market rather than from national averages.",
    });
    expect(serviceCityGeographicFaqs(wd, tx.name, "Houston")[0]).toEqual({
      question: "Does KW Economics provide wrongful death analysis in Houston, Texas?",
      answer:
        "Yes. KW Economics provides wrongful death analysis for attorneys handling matters venued in Houston, Texas, for plaintiff and defense counsel across the case mix common to Houston matters.",
    });
  });

  it("every state narrative is economics-framed and names the state's trial forum", () => {
    for (const st of states) {
      const text = stateText(st.slug);
      expect(text, st.slug).toMatch(ECON);
      expect(text, st.slug).toMatch(/court/i);
      expect(text, st.slug).not.toMatch(CARE_COST);
      expect(text, st.slug).not.toMatch(TYPOGRAPHY);
      expect(text, st.slug).not.toMatch(FIGURES);
    }
  });

  it("island wording is gated on real islands, not on region = territory", () => {
    const dc = stateText("district-of-columbia");
    expect(dc).not.toMatch(/island|mainland/i);
    expect(dc).toContain("venued in the District of Columbia");
    expect(dc).not.toMatch(/in District of Columbia|, District of Columbia is/);
    expect(stateText("puerto-rico")).toMatch(/mainland/i);
    expect(stateText("wyoming")).not.toMatch(/most expensive|highest in the nation/i);
    expect(stateText("california")).not.toMatch(/most expensive|highest in the nation/i);
  });

  it("District of Columbia FAQs keep the article off attributive slots on all four templates", () => {
    const dc = getStateBySlug("district-of-columbia")!;
    const svc = getServiceBySlug("wrongful-death-economic-loss")!;
    const sets = {
      state: stateGeographicFaqs(dc.name),
      city: cityGeographicFaqs(dc.name, "Washington"),
      serviceState: serviceStateGeographicFaqs(svc, dc.name),
      serviceCity: serviceCityGeographicFaqs(svc, dc.name, "Washington"),
    };
    for (const [label, faqs] of Object.entries(sets)) {
      const json = JSON.stringify(faqs);
      expect(json, label).not.toMatch(DOUBLED_ARTICLE);
      expect(json, label).not.toMatch(MISARTICLED);
      expect(json, label).not.toMatch(/in District of Columbia|, District of Columbia is/);
    }
    const state = JSON.stringify(sets.state);
    expect(state).toContain("for District of Columbia cases?");
    expect(state).toContain("account for District of Columbia wage levels");
    expect(state).toContain("for a wrongful death claim in the District of Columbia?");
    expect(state).toContain("a question of District of Columbia law");
    expect(state).toContain("Which courts in the District of Columbia hear");
    const serviceState = JSON.stringify(sets.serviceState);
    expect(serviceState).toContain("data for the District of Columbia market");
    expect(serviceState).toContain("engagement look like for a case venued in the District of Columbia?");
    expect(JSON.stringify(sets.city)).toContain("Do you testify in Washington, the District of Columbia?");
    expect(JSON.stringify(sets.serviceCity)).toContain("data for the District of Columbia as a whole");
    // The court's own name already names the district: no "sitting in District of Columbia".
    const n = getCityNarrative(dc, "Washington", "washington", "District of Columbia", {
      msaName: "Washington-Arlington-Alexandria, DC-VA-MD-WV",
    });
    expect(n.blurb).toContain("heard in the Superior Court of the District of Columbia.");
    expect(n.blurb).not.toMatch(/sitting in District of Columbia/);
    expect(`${n.directAnswer} ${n.blurb}`).not.toMatch(DOUBLED_ARTICLE);
    // One form of the venue on the city pages: the narrative sentence and the
    // service-city hero both read "Washington, the District of Columbia".
    expect(n.directAnswer).toContain("for cases venued in Washington, the District of Columbia.");
    expect(n.directAnswer).not.toContain("Washington, District of Columbia");
    expect(serviceCityDirectAnswer(ORG_NAME, svc.shortName, dc.name, "Washington", n)).toContain(
      "for cases venued in Washington, the District of Columbia.",
    );
  });

  it("no geo template mis-articles a state, city, or service name (every state, largest city, every pillar)", () => {
    const pillars = pillarServices();
    for (const st of states) {
      const city = st.largestCity;
      const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const n = getStateNarrative(st);
      const c = getCityNarrative(st, city, citySlug, `${city} County`);
      const texts = [
        Object.values(n).join(" "),
        `${c.directAnswer} ${c.blurb}`,
        JSON.stringify(stateGeographicFaqs(st.name)),
        JSON.stringify(cityGeographicFaqs(st.name, city)),
        ...pillars.flatMap((s) => [
          serviceStateDirectAnswer(ORG_NAME, s.shortName, st.name, n),
          serviceCityDirectAnswer(ORG_NAME, s.shortName, st.name, city, c),
          JSON.stringify(serviceStateGeographicFaqs(s, st.name)),
          JSON.stringify(serviceCityGeographicFaqs(s, st.name, city)),
        ]),
      ];
      for (const text of texts) {
        expect(text, `${st.slug}/${citySlug}`).not.toMatch(DOUBLED_ARTICLE);
        expect(text, `${st.slug}/${citySlug}`).not.toMatch(MISARTICLED);
      }
    }
    // A city that carries its own article, and vowel-initial names, are the
    // cases the slots were worded around.
    const bronx = JSON.stringify(cityGeographicFaqs("New York", "The Bronx"));
    expect(bronx).not.toMatch(DOUBLED_ARTICLE);
    expect(bronx).toContain("wage data for the Bronx area");
    expect(bronx).toContain("account for Bronx wage levels");
    expect(bronx).toContain("Do you testify in The Bronx, New York?");
    const bv = { name: "Business Valuation", shortName: "Business Valuation" };
    expect(JSON.stringify(serviceCityGeographicFaqs(bv, "New York", "The Bronx"))).toContain(
      "What deliverables are available for a case venued in The Bronx?",
    );
    expect(JSON.stringify(stateGeographicFaqs("Alabama"))).toContain("for a wrongful death claim in Alabama?");
    expect(
      JSON.stringify(
        serviceStateGeographicFaqs({ name: "Employment and Wage Loss Damages", shortName: "Employment Damages" }, "Alabama"),
      ),
    ).toContain("What does an Employment and Wage Loss Damages engagement look like for a case venued in Alabama?");
    expect(JSON.stringify(serviceStateGeographicFaqs(bv, "Ohio"))).toContain(
      "What does a Business Valuation engagement look like for a case venued in Ohio?",
    );
  });

  it("city narrative and FAQs are economics-framed for every state's largest city", () => {
    for (const st of states) {
      const city = st.largestCity.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const n = getCityNarrative(st, st.largestCity, city, `${st.largestCity} County`);
      const text = `${n.directAnswer} ${n.blurb}`;
      expect(text, `${st.slug}/${city}`).toMatch(ECON);
      expect(text, `${st.slug}/${city}`).not.toMatch(CARE_COST);
      expect(text, `${st.slug}/${city}`).not.toMatch(TYPOGRAPHY);
      expect(text, `${st.slug}/${city}`).not.toMatch(FIGURES);
      expect(text, `${st.slug}/${city}`).not.toMatch(LEGACY_BRAND_PATTERN);
    }
    const faqs = serviceCityGeographicFaqs(
      getServiceBySlug("lost-earnings-and-earning-capacity")!,
      states[0].name,
      "Sample City",
    );
    expect(faqs.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(faqs)).toMatch(/earnings|wage|present value|economist/i);
    expect(JSON.stringify(faqs)).not.toMatch(/life care planner|vocational expert|CLCP/i);
  });

  it("metro cities name major employers as context, never wages or unemployment", () => {
    const ny = getStateBySlug("new-york")!;
    const n = getCityNarrative(ny, "New York City", "new-york-city", "New York County", {
      msaName: "New York-Newark-Jersey City, NY-NJ-PA",
    });
    const text = `${n.directAnswer} ${n.blurb}`;
    expect(text).toMatch(/JP Morgan Chase|Northwell Health|Health \+ Hospitals/);
    expect(text).not.toMatch(FIGURES);
    expect(text).not.toMatch(CARE_COST);
    // Employer names are context for the local earnings picture, never a claim
    // about a party: the sentence that names them says so.
    expect(text).toMatch(/plaintiff's own/i);
  });

  it("majorEmployers keeps the first five names in data order", () => {
    expect(majorEmployers(["a", "b", "c", "d", "e", "f"])).toEqual(["a", "b", "c", "d", "e"]);
    expect(majorEmployers(undefined)).toEqual([]);
  });

  it("FAQs are economics-framed on every geo template", () => {
    const nj = getStateBySlug("new-jersey")!;
    const svc = getServiceBySlug("wrongful-death-economic-loss")!;
    const sets = [
      stateGeographicFaqs(nj.name),
      cityGeographicFaqs(nj.name, "Sample City"),
      serviceStateGeographicFaqs(svc, nj.name),
      serviceCityGeographicFaqs(svc, nj.name, "Sample City"),
    ];
    for (const faqs of sets) {
      expect(faqs.length).toBeGreaterThanOrEqual(3);
      const json = JSON.stringify(faqs);
      expect(json).toMatch(/earnings|wage|present value|economist/i);
      expect(json).not.toMatch(CARE_COST);
      expect(json).not.toMatch(TYPOGRAPHY);
      expect(json).not.toMatch(FIGURES);
      expect(json).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(json).toContain(ORG_NAME);
    }
    // The plan's question set: wage levels, damages venue, testimony, present value.
    const stateJson = JSON.stringify(stateGeographicFaqs(nj.name));
    expect(stateJson).toMatch(/wage levels/i);
    expect(stateJson).toMatch(/Which courts in New Jersey hear/);
    expect(stateJson).toMatch(/present value/i);
    expect(JSON.stringify(cityGeographicFaqs(nj.name, "Sample City"))).toMatch(/Do you testify in Sample City, New Jersey\?/);
  });

  it("state regulations carry a compensation forum and citation-free damages context", () => {
    expect(stateRegulations).toHaveLength(states.length);
    for (const r of stateRegulations) {
      expect(r.compensationForum, r.stateSlug).toMatch(/\w{3,}/);
      expect(r.damagesContext, r.stateSlug).toMatch(/wrongful death|survival|collateral|interest/i);
      // No statute or rule numbers, no rates, no caps, no years: no digits at all.
      expect(r.damagesContext, r.stateSlug).not.toMatch(/\d/);
      expect(r.damagesContext, r.stateSlug).not.toMatch(/§|\bsec\.|\brule \d|\bv\.\s/i);
      expect(r.damagesContext, r.stateSlug).not.toMatch(CARE_COST);
      expect(r.damagesContext, r.stateSlug).not.toMatch(TYPOGRAPHY);
      expect(r.damagesContext, r.stateSlug).not.toMatch(LEGACY_BRAND_PATTERN);
    }
  });
});

// ---------------------------------------------------------------------------
// Pillar angles. The service x state and service x city templates once
// appended the shared state or city narrative to every pillar; each pillar now
// carries its own angle, records list, forum paragraph, and, where wage levels
// are not its subject, its own second city FAQ.
// ---------------------------------------------------------------------------

const TORT_FRAMEWORK_PILLARS = new Set([
  "lost-earnings-and-earning-capacity",
  "wrongful-death-economic-loss",
  "personal-injury-economic-damages",
  "household-services-valuation",
  "life-care-plan-cost-projection",
]);
const WAGE_FAQ_PILLARS = new Set([...TORT_FRAMEWORK_PILLARS, "employment-and-wage-loss-damages"]);
const COMMERCIAL_AND_REBUTTAL = [
  "business-valuation",
  "lost-profits-and-commercial-damages",
  "fraud-and-asset-tracing",
  "divorce-and-marital-financial-analysis",
  "expert-rebuttal-and-report-review",
];

const cityRow = (name: string, county: string, stateSlug: string, stateAbbreviation: string): City => ({
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  stateSlug,
  stateAbbreviation,
  county,
  population: 0,
  latitude: 0,
  longitude: 0,
  isStateCapital: false,
});

describe("pillar angles on the service x geo templates", () => {
  const tx = getStateBySlug("texas")!;
  const nj = getStateBySlug("new-jersey")!;
  const n = getStateNarrative(tx);
  const c = getCityNarrative(tx, "Houston", "houston", "Harris County");
  const pillars = pillarServices();

  it("gives every pillar its own state and city angle; the shared narrative no longer rides along on any of them", () => {
    const stateHeroes = pillars.map((s) => serviceStateDirectAnswer(ORG_NAME, s.shortName, tx.name, n));
    const cityHeroes = pillars.map((s) => serviceCityDirectAnswer(ORG_NAME, s.shortName, tx.name, "Houston", c));
    expect(new Set(stateHeroes).size).toBe(pillars.length);
    expect(new Set(cityHeroes).size).toBe(pillars.length);
    for (const hero of stateHeroes) {
      expect(hero).not.toContain(n.economicContext);
      expect(hero.endsWith(" Plaintiff and defense.")).toBe(true);
    }
    for (const hero of cityHeroes) {
      expect(hero).not.toContain("The report documents the source behind every wage, benefit, and growth figure");
      expect(hero.endsWith("Deposition and trial testimony are available for Houston matters, in person or by remote appearance where the forum allows.")).toBe(true);
    }
    for (const slug of COMMERCIAL_AND_REBUTTAL) {
      const s = getServiceBySlug(slug)!;
      expect(serviceStateDirectAnswer(ORG_NAME, s.shortName, tx.name, n), slug).not.toMatch(
        /fringe benefits|household services|Bureau of Labor Statistics/,
      );
      expect(serviceCityDirectAnswer(ORG_NAME, s.shortName, tx.name, "Houston", c), slug).not.toMatch(
        /fringe benefits|household services/,
      );
    }
    expect(serviceStateDirectAnswer(ORG_NAME, "Business Valuation", nj.name, getStateNarrative(nj))).toBe(
      "KW Economics provides business valuation for matters venued in New Jersey. The business is valued from its own financial statements, tax returns, and governing agreements under the income, market, and asset approaches, with the standard of value, the valuation date, and any discounts for lack of control or marketability set by the matter and by New Jersey law as counsel confirms it. Every input is documented so the conclusion can be tested at deposition, and no wage or household data enters the number. Plaintiff and defense.",
    );
    expect(serviceStateDirectAnswer(ORG_NAME, "Lost Earnings", tx.name, n)).toContain(
      "tests it against occupational wage data from the Bureau of Labor Statistics for the metropolitan or nonmetropolitan area of Texas where the plaintiff worked",
    );
    expect(serviceStateDirectAnswer(ORG_NAME, "Fraud & Tracing", tx.name, n)).toContain(
      "No wage or market data drives the number; the entity's own records do.",
    );
  });

  it("orders the city hero as subject, then venue, then testimony, so the shells' 160-character description names the pillar", () => {
    const hero = serviceCityDirectAnswer(ORG_NAME, "Business Valuation", tx.name, "Houston", c);
    expect(
      hero.startsWith(
        "KW Economics provides business valuation for cases venued in Houston, Texas. For a business based in Houston, the Houston-area market for its goods and services, comparable transactions, and the company's own history each enter the analysis,",
      ),
    ).toBe(true);
    const venue = c.blurb.slice(0, c.blurb.indexOf(". ") + 1);
    expect(venue).toMatch(/^Civil claims arising in Houston are typically heard in /);
    expect(hero).toContain(venue);
    expect(hero.indexOf("For a business based in Houston")).toBeLessThan(hero.indexOf(venue));
    // A city with no county carries no venue sentence and the hero still reads.
    const noCounty = getCityNarrative(tx, "Sample City", "sample-city");
    expect(serviceCityDirectAnswer(ORG_NAME, "Lost Profits", tx.name, "Sample City", noCounty)).toBe(
      "KW Economics provides lost profits analysis for cases venued in Sample City, Texas. For a business operating in Sample City, the but-for path reflects the Sample City-area market the company sells into and its own financial history, and each claimed loss is tied to the conduct at issue and to the period over which it plausibly ran. Deposition and trial testimony are available for Sample City matters, in person or by remote appearance where the forum allows.",
    );
  });

  it("falls back to the shared narrative for a short name without an angle", () => {
    expect(serviceStateDirectAnswer(ORG_NAME, "Widget Review", tx.name, n)).toBe(
      `KW Economics provides widget review analysis for matters venued in Texas. ${n.economicContext} Plaintiff and defense.`,
    );
    expect(serviceCityDirectAnswer(ORG_NAME, "Widget Review", tx.name, "Houston", c)).toContain(
      "trace each component of the loss to Houston-area data or to the records that drive the claim.",
    );
    const faqs = serviceStateGeographicFaqs({ name: "Widget Review", shortName: "Widget Review" }, tx.name);
    expect(faqs[1].answer).toContain("(tax returns, pay and benefit records, and business financial statements as applicable)");
    expect(serviceCityGeographicFaqs({ name: "Widget Review", shortName: "Widget Review" }, tx.name, "Houston")[1].question).toBe(
      "How are Houston wage levels and cost of living handled in the analysis?",
    );
  });

  it("answers the disclosure FAQ on every pillar, and reads the District and the territories as their own trial courts", () => {
    for (const s of pillars) {
      const faq = serviceStateGeographicFaqs(s, tx.name)[2];
      expect(faq.question, s.slug).toBe("When is expert disclosure due for a case venued in Texas?");
      expect(faq.answer, s.slug).toBe(
        "Expert disclosure in Texas is scheduled case by case: in the Texas trial courts by the case management or scheduling order, and in the federal district courts serving Texas by the federal expert-disclosure framework, under which the written report, the materials considered, and the testimony history are served together. KW Economics confirms the disclosure date at retention and sizes the records request and turnaround to it; counsel confirms the governing deadline for the case.",
      );
    }
    const dc = serviceStateGeographicFaqs(getServiceBySlug("wrongful-death-economic-loss")!, "District of Columbia")[2];
    expect(dc.question).toBe("When is expert disclosure due for a case venued in the District of Columbia?");
    expect(dc.answer).toContain(
      "in the District of Columbia trial courts by the case management or scheduling order, and in the federal district courts serving the District of Columbia",
    );
    expect(dc.answer).not.toMatch(/state court|in District of Columbia/);
    expect(serviceStateGeographicFaqs(getServiceBySlug("business-valuation")!, "Puerto Rico")[2].answer).toContain(
      "in the Puerto Rico trial courts",
    );
  });

  it("names the records that drive each pillar in the engagement FAQ", () => {
    const answers = pillars.map((s) => serviceStateGeographicFaqs(s, tx.name)[1].answer);
    expect(new Set(answers).size).toBe(pillars.length);
    expect(serviceStateGeographicFaqs(getServiceBySlug("business-valuation")!, tx.name)[1].answer).toContain(
      "(financial statements, tax returns, the general ledger, and the governing agreements)",
    );
    expect(serviceStateGeographicFaqs(getServiceBySlug("lost-earnings-and-earning-capacity")!, tx.name)[1].answer).toContain(
      "(tax returns, wage statements, personnel and benefit plan records, and the medical or work-capacity opinions that define the post-injury earnings path)",
    );
    expect(
      serviceStateGeographicFaqs(getServiceBySlug("expert-rebuttal-and-report-review")!, tx.name)[1].answer.startsWith(
        "A rebuttal engagement typically includes a records request for the opposing report, its workpapers, and the data it relied on,",
      ),
    ).toBe(true);
  });

  it("keeps the wage-levels city FAQ where wage levels are the subject and asks about the pillar's own records elsewhere", () => {
    const wageQuestion = "How are Houston wage levels and cost of living handled in the analysis?";
    for (const s of pillars) {
      const faqs = serviceCityGeographicFaqs(s, tx.name, "Houston");
      expect(faqs, s.slug).toHaveLength(3);
      if (WAGE_FAQ_PILLARS.has(s.slug)) {
        expect(faqs[1].question, s.slug).toBe(wageQuestion);
      } else {
        expect(faqs[1].question, s.slug).not.toBe(wageQuestion);
        expect(JSON.stringify(faqs[1]), s.slug).not.toMatch(/wage levels|household services/);
      }
      // The deliverables question is the third on every pillar.
      expect(faqs[2].question, s.slug).toBe("What deliverables are available for a case venued in Houston?");
    }
    expect(serviceCityGeographicFaqs(getServiceBySlug("business-valuation")!, tx.name, "Houston")[1].question).toBe(
      "What data does a valuation of a business based in Houston rest on?",
    );
    expect(serviceCityGeographicFaqs(getServiceBySlug("fraud-and-asset-tracing")!, "New York", "The Bronx")[1].question).toBe(
      "What records drive a fraud and tracing engagement for an entity based in The Bronx?",
    );
    expect(serviceCityGeographicFaqs(getServiceBySlug("expert-rebuttal-and-report-review")!, "Ohio", "Akron")[1].question).toBe(
      "What does a rebuttal of an opposing economic report cover for a case venued in Akron?",
    );
  });

  it("every pillar's prose obeys the house rules in every state and its largest city", () => {
    for (const st of states) {
      const city = st.largestCity;
      const citySlug = city.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const sn = getStateNarrative(st);
      const cn = getCityNarrative(st, city, citySlug, `${city} County`);
      for (const s of pillars) {
        const texts = [
          serviceStateDirectAnswer(ORG_NAME, s.shortName, st.name, sn),
          serviceCityDirectAnswer(ORG_NAME, s.shortName, st.name, city, cn),
          JSON.stringify(serviceStateGeographicFaqs(s, st.name)),
          JSON.stringify(serviceCityGeographicFaqs(s, st.name, city)),
        ];
        for (const text of texts) {
          const label = `${s.slug}/${st.slug}/${citySlug}`;
          expect(text, label).not.toMatch(TYPOGRAPHY);
          expect(text, label).not.toMatch(FIGURES);
          expect(text, label).not.toMatch(CARE_COST);
          expect(text, label).not.toMatch(LEGACY_BRAND_PATTERN);
          expect(text, label).not.toMatch(DOUBLED_ARTICLE);
          expect(text, label).not.toMatch(MISARTICLED);
          expect(text, label).not.toMatch(/\b([a-z]{3,}) \1\b/i);
          expect(text, label).not.toContain("&");
          expect(text, label).not.toMatch(/in District of Columbia|, District of Columbia is/);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Page-only prose (the shells do not render these blocks): the state page's
// forum paragraph, the city page's context paragraph, the References block,
// and the credential-chip links.
// ---------------------------------------------------------------------------

describe("page-only pillar prose, geo sources, and credential links", () => {
  const nj = getStateBySlug("new-jersey")!;
  const ny = getStateBySlug("new-york")!;
  const dc = getStateBySlug("district-of-columbia")!;
  const pillars = pillarServices();
  const hackensack = cityRow("Hackensack", "Bergen County", "new-jersey", "NJ");
  const bronx = cityRow("The Bronx", "Bronx County", "new-york", "NY");

  it("prints the tort damages framework only on the injury and death pillars and a forum paragraph of the pillar's own elsewhere", () => {
    for (const s of pillars) {
      const venue = serviceStateVenueParagraph(s, nj);
      if (TORT_FRAMEWORK_PILLARS.has(s.slug)) {
        expect(venue, s.slug).toBeUndefined();
      } else {
        expect(venue, s.slug).toBeDefined();
        expect(venue, s.slug).toContain("New Jersey");
        expect(venue, s.slug).not.toMatch(TYPOGRAPHY);
        expect(venue, s.slug).not.toMatch(FIGURES);
        expect(venue, s.slug).not.toMatch(CARE_COST);
        expect(venue, s.slug).not.toMatch(/\b([a-z]{3,}) \1\b/i);
        // The District reads with its article after a preposition and bare attributively.
        const dcVenue = serviceStateVenueParagraph(s, dc)!;
        expect(dcVenue, s.slug).not.toMatch(/in District of Columbia|a the |the the /);
        expect(dcVenue, s.slug).toMatch(/in the District of Columbia|the Superior Court of the District of Columbia/);
      }
    }
    expect(serviceStateVenueParagraph(getServiceBySlug("business-valuation")!, nj)).toBe(
      "Valuation disputes arising in New Jersey reach the civil courts through shareholder, partnership, and buy-sell litigation, the matrimonial courts through the division of marital property, and the federal district courts serving New Jersey where jurisdiction allows. The standard of value, the valuation date, and the treatment of discounts for lack of control and marketability are set by the governing agreement and by New Jersey law as counsel confirms it; the report states each choice and presents the value so it can be recomputed under an alternative.",
    );
    expect(serviceStateVenueParagraph(getServiceBySlug("expert-rebuttal-and-report-review")!, nj)).toContain(
      `the Superior Court, Law Division for personal injury, wrongful death, employment, and commercial claims, the federal district courts serving New Jersey where jurisdiction allows, and the ${getRegulationsByState("new-jersey")!.compensationForum} where the dispute is over wage-loss benefits.`,
    );
    expect(serviceStateVenueParagraph(getServiceBySlug("lost-profits-and-commercial-damages")!, nj)).toContain(
      "Lost profits claims arising in New Jersey are heard in the Superior Court, Law Division and, where jurisdiction allows, in the federal district courts serving New Jersey.",
    );
  });

  it("names what each pillar measures in the city context paragraph", () => {
    const paragraphs = pillars.map((s) => serviceCityContextParagraph(s, nj, hackensack));
    expect(new Set(paragraphs).size).toBe(pillars.length);
    for (const p of paragraphs) {
      expect(p.startsWith("KW Economics serves counsel throughout Hackensack and the surrounding Bergen County area. Our economists ")).toBe(true);
      expect(p).toMatch(/engagements in New Jersey\.$/);
      expect(p).not.toMatch(TYPOGRAPHY);
      expect(p).not.toMatch(CARE_COST);
      expect(p).not.toContain("&");
    }
    expect(serviceCityContextParagraph(getServiceBySlug("business-valuation")!, nj, hackensack)).toBe(
      "KW Economics serves counsel throughout Hackensack and the surrounding Bergen County area. Our economists value the business from its own financial statements, tax returns, and governing agreements and from the Hackensack-area market it serves, and are familiar with the court system and disclosure requirements that affect business valuation engagements in New Jersey.",
    );
    expect(serviceCityContextParagraph(getServiceBySlug("fraud-and-asset-tracing")!, nj, hackensack)).toContain(
      "affect fraud and tracing engagements in New Jersey.",
    );
    // The Bronx keeps its article after "throughout" and drops it attributively.
    const wd = serviceCityContextParagraph(getServiceBySlug("wrongful-death-economic-loss")!, ny, bronx);
    expect(wd).toContain(
      "throughout The Bronx and the surrounding Bronx County area. Our economists measure the decedent's earnings, fringe benefits, and household services against wage data for the Bronx area and the decedent's own records,",
    );
    expect(wd).not.toMatch(DOUBLED_ARTICLE);
    // A city with no county falls back to the state name.
    const noCounty = { ...hackensack, county: "" };
    expect(serviceCityContextParagraph(getServiceBySlug("lost-earnings-and-earning-capacity")!, nj, noCounty)).toContain(
      "throughout Hackensack and the surrounding New Jersey area.",
    );
  });

  it("resolves geo sources through the registry: the narrative's data sources on the hub and city pages, the pillar's own on service pages", () => {
    expect(geoSources().map((s) => s.url)).toEqual([
      REFERENCES.BLS_OES.url,
      REFERENCES.CENSUS_ACS.url,
      REFERENCES.BLS_ECEC.url,
      REFERENCES.BLS_ECI.url,
      REFERENCES.SKOOG_CIECKA_KRUEGER_2011.url,
      REFERENCES.TREASURY_YIELD.url,
    ]);
    expect(geoSources(getServiceBySlug("business-valuation")!).map((s) => s.url)).toEqual([
      REFERENCES.AICPA_SSVS1.url,
      REFERENCES.NACVA_STANDARDS.url,
    ]);
    expect(geoSources(getServiceBySlug("fraud-and-asset-tracing")!).map((s) => s.url)).toEqual([REFERENCES.ACFE.url]);
    expect(geoSources(getServiceBySlug("lost-earnings-and-earning-capacity")!).map((s) => s.url)).toContain(REFERENCES.BLS_OES.url);
    for (const s of pillars) {
      const sources = geoSources(s);
      expect(sources.length, s.slug).toBeGreaterThan(0);
      for (const src of sources) {
        expect(src.url.startsWith("https://"), s.slug).toBe(true);
        expect(src.apa, s.slug).toBeTruthy();
      }
    }
  });

  it("maps every credential chip label to its credential x state page", () => {
    expect(credentialPagePath("Forensic Economist", "new-jersey")).toBe("/credentials/forensic-economist/new-jersey");
    expect(credentialPagePath("NAFE", "texas")).toBe("/credentials/nafe-member/texas");
    expect(credentialPagePath("AAEFE", "texas")).toBe("/credentials/aaefe-member/texas");
    expect(credentialPagePath("MBA", "texas")).toBe("/credentials/graduate-economics-degree/texas");
    expect(credentialPagePath("PhD", "texas")).toBe("/credentials/graduate-economics-degree/texas");
    expect(credentialPagePath("CPA", "texas")).toBeUndefined();
    for (const s of pillars) {
      for (const label of s.relevantCredentials) expect(credentialPagePath(label, "ohio"), `${s.slug}: ${label}`).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// The page-only prose renders for every state and city the site carries, so
// it is held to the same house rules as the shared prose in every state and
// its largest city, not only in the pinned New Jersey and District cases.
// ---------------------------------------------------------------------------

describe("page-only pillar prose obeys the house rules in every state and its largest city", () => {
  const pillars = pillarServices();

  it("venue paragraphs and city context paragraphs", () => {
    for (const st of states) {
      const city = cityRow(st.largestCity, `${st.largestCity} County`, st.slug, st.abbreviation);
      for (const s of pillars) {
        const texts = [serviceStateVenueParagraph(s, st) ?? "", serviceCityContextParagraph(s, st, city)];
        for (const text of texts) {
          const label = `${s.slug}/${st.slug}`;
          expect(text, label).not.toMatch(TYPOGRAPHY);
          expect(text, label).not.toMatch(FIGURES);
          expect(text, label).not.toMatch(CARE_COST);
          expect(text, label).not.toMatch(LEGACY_BRAND_PATTERN);
          expect(text, label).not.toMatch(DOUBLED_ARTICLE);
          expect(text, label).not.toMatch(MISARTICLED);
          expect(text, label).not.toMatch(/\b([a-z]{3,}) \1\b/i);
          expect(text, label).not.toContain("&");
          expect(text, label).not.toMatch(/in District of Columbia|, District of Columbia is/);
          expect(text, label).not.toMatch(/§|\bsec\.|\brule \d|\bv\.\s/i);
        }
      }
    }
  });
});
