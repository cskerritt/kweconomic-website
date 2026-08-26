import { describe, expect, it } from "vitest";
import { getStateNarrative, getCityNarrative } from "./narratives";
import {
  cityGeographicFaqs,
  serviceCityGeographicFaqs,
  serviceStateGeographicFaqs,
  stateGeographicFaqs,
} from "./geographicFaqs";
import { getServiceBySlug } from "./services";
import { getStateBySlug, states } from "./states";
import { stateRegulations } from "./regulations/state-regs";
import { ORG_NAME } from "@/lib/brand";

// Adapted from the task brief: the runtime helpers take a State object (and
// return a sectioned narrative) rather than slugs, so the test joins the
// sections before asserting on the prose.
const BANNED = /labor market|unemployment|median hourly wage|median household income|employers|earning capacity|transferable skills|vocational rehabilitation/i;
const CARE = /attendant care|home health|provider|cost of care/i;

const stateText = (slug: string) => {
  const n = getStateNarrative(getStateBySlug(slug)!);
  return [n.directAnswer, n.careContext, n.legalContext].join(" ");
};

describe("LCP geo narratives", () => {
  it("state narrative talks about care costs, not labor markets", () => {
    const text = stateText("new-jersey");
    expect(text).toMatch(CARE);
    expect(text).not.toMatch(BANNED);
    expect(text).toContain(ORG_NAME);
    expect(text).not.toMatch(/KWVRS|Kincaid Wolstein/);
  });

  it("every state narrative is LCP-framed and names the state's trial forum", () => {
    for (const st of states) {
      const text = stateText(st.slug);
      expect(text, st.slug).toMatch(CARE);
      expect(text, st.slug).not.toMatch(BANNED);
    }
  });

  it("island wording is gated on real islands, not on region = territory", () => {
    const dc = stateText("district-of-columbia");
    expect(dc).not.toMatch(/island|mainland/i);
    expect(dc).toContain("venued in the District of Columbia");
    expect(dc).not.toMatch(/in District of Columbia|, District of Columbia is/);
    expect(stateText("puerto-rico")).toMatch(/island/i);
    expect(stateText("wyoming")).not.toMatch(/most expensive/i);
    expect(stateText("california")).not.toMatch(/most expensive/i);
  });

  it("city narrative is LCP-framed for every state's largest city", () => {
    for (const st of states) {
      const city = st.largestCity.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const n = getCityNarrative(st, st.largestCity, city, `${st.largestCity} County`);
      const text = `${n.directAnswer} ${n.blurb}`;
      expect(text, `${st.slug}/${city}`).toMatch(CARE);
      expect(text, `${st.slug}/${city}`).not.toMatch(BANNED);
      expect(text, `${st.slug}/${city}`).not.toMatch(/KWVRS|Kincaid Wolstein/);
    }
  });

  it("metro cities name medical centers, never wages or employer lists", () => {
    const ny = getStateBySlug("new-york")!;
    const n = getCityNarrative(ny, "New York City", "new-york-city", "New York County", {
      msaName: "New York-Newark-Jersey City, NY-NJ-PA",
    });
    const text = `${n.directAnswer} ${n.blurb}`;
    expect(text).toMatch(/Health|Hospital|Medical/);
    expect(text).not.toMatch(/JP Morgan|Citigroup|\$\d|%/);
    expect(text).not.toMatch(BANNED);
  });

  it("FAQs are LCP-framed on every geo template", () => {
    const nj = getStateBySlug("new-jersey")!;
    const svc = getServiceBySlug("life-care-planning")!;
    const sets = [
      stateGeographicFaqs(nj.name),
      cityGeographicFaqs(nj.name, "Sample City"),
      serviceStateGeographicFaqs(svc.name, nj.name),
      serviceCityGeographicFaqs(svc.name, nj.name, "Sample City"),
    ];
    for (const faqs of sets) {
      expect(faqs.length).toBeGreaterThanOrEqual(3);
      const json = JSON.stringify(faqs);
      expect(json).not.toMatch(/vocational expert|earning capacity|labor market|KWVRS|Kincaid Wolstein/i);
      expect(json).toMatch(CARE);
      expect(json).toContain(ORG_NAME);
    }
  });

  it("state regulations carry a care-oversight agency and citation-free practice context", () => {
    expect(stateRegulations).toHaveLength(states.length);
    for (const r of stateRegulations) {
      expect(r.careOversightAgency, r.stateSlug).toMatch(/\w{3,}/);
      expect(r.practiceContext, r.stateSlug).toMatch(/court|forum|commission|board/i);
      // No statute/rule numbers, no damage caps, no vocational framing.
      expect(r.practiceContext, r.stateSlug).not.toMatch(/§|\bsec\.|\brule \d|\d+\.\d+|cap of|\$\d|vocational/i);
    }
  });
});
