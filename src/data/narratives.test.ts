import { describe, expect, it } from "vitest";
import { getCityNarrative, getStateNarrative, serviceCityDirectAnswer, serviceStateDirectAnswer } from "./narratives";
import {
  cityGeographicFaqs,
  serviceCityGeographicFaqs,
  serviceStateGeographicFaqs,
  stateGeographicFaqs,
} from "./geographicFaqs";
import { majorEmployers } from "./geo-prose.mjs";
import { getServiceBySlug, pillarServices } from "./services";
import { getStateBySlug, states } from "./states";
import { stateRegulations } from "./regulations/state-regs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { workPhrase } from "@/lib/service-prose.mjs";

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
