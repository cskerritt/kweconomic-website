import { describe, expect, it } from "vitest";
import { getCityNarrative, getStateNarrative, serviceStateDirectAnswer } from "./narratives";
import {
  cityGeographicFaqs,
  serviceCityGeographicFaqs,
  serviceStateGeographicFaqs,
  stateGeographicFaqs,
} from "./geographicFaqs";
import { majorEmployers } from "./geo-prose.mjs";
import { getServiceBySlug } from "./services";
import { getStateBySlug, states } from "./states";
import { stateRegulations } from "./regulations/state-regs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";

// Adapted from the task brief: the runtime helpers take a State object (and
// return a sectioned narrative) rather than slugs, so the test joins the
// sections before asserting on the prose.
const ECON = /wage|earnings|cost of living|damages/i;
const CARE_COST = /attendant care|home health|skilled nursing|life care planner|labor market survey|vocational expert|CLCP/i;
// Hyphens only (no em/en dashes) and no section symbols anywhere in geo prose.
const TYPOGRAPHY = /[–—§]/;
// Figures the geo prose must never print: rates, percentages, dollar amounts.
const FIGURES = /unemployment rate|median hourly wage|\d+(\.\d+)?\s?%|\$\d/i;

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
    expect(text.startsWith("Lost Earnings from KW Economics for matters venued in New Jersey.")).toBe(true);
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
      getServiceBySlug("lost-earnings-and-earning-capacity")!.name,
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
      serviceStateGeographicFaqs(svc.name, nj.name),
      serviceCityGeographicFaqs(svc.name, nj.name, "Sample City"),
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
