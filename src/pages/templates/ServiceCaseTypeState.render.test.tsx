import { describe, it, expect, vi } from "vitest";
import ServiceCaseTypeState from "./ServiceCaseTypeState";
import { usePageMeta } from "@/hooks/use-page-meta";
import { declaredPairs, releasedStates, STATE_BATCHES } from "@/data/serviceCaseTypeStates";
import { pillarServices } from "@/data/services";
import { getCaseType, caseTypeSectionHeadings, caseTypeVenuesHeading } from "@/data/caseTypes";
import { states } from "@/data/states";
import { federalDistricts } from "@/data/courts/federal-districts";
import { ORG_NAME } from "@/lib/brand";
import { ORG_URL } from "@/lib/schema";
import { serviceCaseStateTitle, TITLE_MAX } from "@/lib/page-titles.mjs";
import { serviceCaseStateDescription } from "@/lib/service-prose.mjs";
import { placeName } from "@/data/geo-prose.mjs";
import { expectServiceIdentity } from "@/test-utils/jsonld";
import { renderRoute, visibleText, jsonLdBlocks, faqLdStrings, faqText, DOUBLED_WORD, MIS_ARTICLE, excerpt } from "@/test-utils/markup";

// The service x case type x state tier (plan Task 2): one page per declared
// pair per state, composed from the pair's note, the case type's exposure
// text, the state's courts and damages framework, and three localized FAQs.
// The route renders every declared pair in every state; the prerender and the
// sitemap gate on the released batches (src/data/serviceCaseTypeStates.ts).
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const ROUTE = "/services/:serviceSlug/case/:typeSlug/:stateSlug";

function render(serviceSlug: string, typeSlug: string, stateSlug: string) {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(`/services/${serviceSlug}/case/${typeSlug}/${stateSlug}`, ROUTE, ServiceCaseTypeState);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

const NJ = states.find((s) => s.slug === "new-jersey")!;

describe("ServiceCaseTypeState template", () => {
  for (const { serviceSlug, typeSlug } of declaredPairs()) {
    const service = pillarServices().find((s) => s.slug === serviceSlug)!;
    const caseType = getCaseType(typeSlug)!;
    it(`${serviceSlug} x ${typeSlug} x new-jersey renders with state substance`, () => {
      const { html, title, description } = render(serviceSlug, typeSlug, "new-jersey");
      const text = visibleText(html);
      const headings = caseTypeSectionHeadings(caseType);
      expect(title).toBe(serviceCaseStateTitle(service, caseType, NJ, ORG_NAME));
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
      expect(title).toMatch(/New Jersey|NJ/);
      expect(description).toBe(serviceCaseStateDescription(service, caseType, placeName(NJ.name)));
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description.length).toBeGreaterThanOrEqual(100);
      expect(html.match(/<h1[\s>]/g)?.length).toBe(1);
      expect(text).toContain(`${service.name} for ${caseType.name} Cases in New Jersey`);
      // The direct-answer lead names the practice, the work, and the place.
      expect(html).toMatch(/<p class="kw-lead[^"]*">/);
      expect(text).toContain(`${ORG_NAME} prepares`);
      // State substance: the courts block ("forums" on the tax matter), the
      // framework block, and the pair note.
      expect(text).toContain(caseTypeVenuesHeading(caseType, "New Jersey"));
      expect(text).toContain(headings.framework);
      expect(text).toContain(headings.concentration);
      expect(text).toContain(service.caseTypeNotes[caseType.slug].summary);
      // Links: the parent pair page, the case-type x state page, the service
      // x state page, the state hub, the pillar, and the state's federal districts.
      expect(html).toContain(`href="/services/${serviceSlug}/case/${typeSlug}"`);
      expect(html).toContain(`href="/case-types/${typeSlug}/new-jersey"`);
      expect(html).toContain(`href="/services/${serviceSlug}/new-jersey"`);
      expect(html).toContain('href="/locations/new-jersey"');
      expect(html).toContain(`href="/services/${serviceSlug}"`);
      for (const d of federalDistricts.filter((x) => x.stateSlug === "new-jersey")) {
        expect(html).toContain(`href="/jurisdictions/federal/${d.slug}"`);
      }
      // Breadcrumbs, FAQ, and the Service entity.
      const ld = jsonLdBlocks(html);
      expect(ld).toContain('"BreadcrumbList"');
      expect(ld).toContain('"FAQPage"');
      expect(faqLdStrings(html).length).toBeGreaterThanOrEqual(6);
      expect(ld).toContain(`"dateModified":"${service.dateModified}"`);
      expectServiceIdentity(html, `${ORG_URL}/services/${serviceSlug}/case/${typeSlug}/new-jersey`);
      // House rules on the visible copy and the FAQ text.
      for (const s of [text, faqText(html), ld]) {
        expect(s).not.toMatch(/[–—§]/);
        expect(s).not.toMatch(/\d+\+ (cases|years|firms)/i);
        expect(excerpt(s, DOUBLED_WORD)).toBeUndefined();
        expect(excerpt(s, MIS_ARTICLE)).toBeUndefined();
      }
      // The pillar that costs a plan someone else authored may name its
      // author (the off-brand guard's carve-out for that services.ts entry).
      if (serviceSlug !== "life-care-plan-cost-projection") {
        expect(text).not.toMatch(/vocational expert|life care planner|CLCP|CNLCP/i);
      }
    });
  }

  it("every declared pair in every state publishes a title inside the SERP window and a description inside the 140-160 band", () => {
    for (const { serviceSlug, typeSlug } of declaredPairs()) {
      const service = pillarServices().find((s) => s.slug === serviceSlug)!;
      const caseType = getCaseType(typeSlug)!;
      for (const st of states) {
        const title = serviceCaseStateTitle(service, caseType, st, ORG_NAME);
        expect(title.length, `${serviceSlug}/${typeSlug}/${st.slug}: ${title}`).toBeLessThanOrEqual(TITLE_MAX);
        expect(title).not.toMatch(/&|[–—§]/);
        const description = serviceCaseStateDescription(service, caseType, placeName(st.name));
        expect(description.length, `${serviceSlug}/${typeSlug}/${st.slug}`).toBeLessThanOrEqual(160);
        // The builder takes the first candidate inside the band (review fix
        // 2026-10-05: four transfer pricing x shareholder pages fell to 139).
        expect(description.length, `${serviceSlug}/${typeSlug}/${st.slug}: ${description}`).toBeGreaterThanOrEqual(140);
        expect(description).toMatch(/\.$/);
        // A matter that is not a damages claim never closes on "Plaintiff and defense."
        if (caseType.framing) expect(description, `${serviceSlug}/${typeSlug}/${st.slug}`).not.toContain("Plaintiff and defense");
      }
    }
  });

  it("links the pair's pages in the other released states and the sibling pillars for the case type in the same state", () => {
    const { html } = render("lost-earnings-and-earning-capacity", "personal-injury", "california");
    for (const st of releasedStates().filter((s) => s !== "california")) {
      expect(html).toContain(`href="/services/lost-earnings-and-earning-capacity/case/personal-injury/${st}"`);
    }
    const unreleased = STATE_BATCHES.find((b) => !b.released)?.states[0];
    if (unreleased) expect(html).not.toContain(`href="/services/lost-earnings-and-earning-capacity/case/personal-injury/${unreleased}"`);
    expect(html).toContain('href="/services/personal-injury-economic-damages/case/personal-injury/california"');
    expect(html).not.toContain('href="/services/business-valuation/case/personal-injury/california"');
  });

  it("the workers' compensation pair names the compensation forum and the family-law pair keeps its framing", () => {
    const wc = visibleText(render("lost-earnings-and-earning-capacity", "workers-compensation", "texas").html);
    expect(wc).toContain("Compensation forum");
    const divorce = render("business-valuation", "divorce-and-marital-dissolution", "florida");
    expect(visibleText(divorce.html)).toContain("Legal framework");
    expect(visibleText(divorce.html)).not.toContain("Damages framework");
    expect(divorce.description).toContain("financial questions");
    expect(divorce.description).not.toContain("loss claim");
  });

  // Review fixes (2026-10-05): the tax pair x state pages printed New
  // Jersey's damages-report sentence, listed only the state's trial courts,
  // and closed their framework FAQ on "past and future amounts"; the divorce
  // pairs carried the same expert-standard and FAQ tails.
  it("the tax pairs name the federal tax forums, the federal evidence rules, and a transfer pricing close, never a damages report", () => {
    for (const serviceSlug of ["transfer-pricing-expert-witness", "business-valuation", "expert-rebuttal-and-report-review"]) {
      const { html } = render(serviceSlug, "tax-and-transfer-pricing-dispute", "new-york");
      const text = visibleText(html);
      const faqs = faqLdStrings(html).join(" ");
      expect(text).toContain("New York forums and expert standards");
      for (const forum of ["United States Tax Court", "United States District Courts", "United States Court of Federal Claims", "New York tax appeals"]) {
        expect(text, `${serviceSlug}: ${forum}`).toContain(forum);
      }
      // The commercial selection, two courts deep: no Court of Claims (claims against the State).
      expect(text).not.toContain("Court of Claims");
      expect(text).toContain("Federal tax forums test expert testimony under the federal rules of evidence, which the Tax Court applies by statute");
      expect(text).toContain("A transfer pricing report meets each of these inquiries");
      expect(faqs).toContain("What do the forums that hear a tax or transfer pricing dispute involving New York ask of");
      expect(faqs).toContain("(for a business based in New York, the Second Circuit)");
      expect(faqs).toContain("The report states each transaction, method choice, and comparable screen with its source");
      expect(html).toContain('href="/case-types/divorce-and-marital-dissolution/new-york"');
      for (const s of [text, faqs]) {
        expect(s, serviceSlug).not.toMatch(/damages report|lost earnings, household services|past and future amounts|Final appeals run to/);
      }
    }
  });

  it("the divorce pairs close the expert standard and the framework FAQ on the family-law work", () => {
    for (const serviceSlug of ["divorce-and-marital-financial-analysis", "transfer-pricing-expert-witness"]) {
      const { html } = render(serviceSlug, "divorce-and-marital-dissolution", "new-york");
      const text = `${visibleText(html)} ${faqLdStrings(html).join(" ")}`;
      expect(text).toContain("A financial analysis for a divorce meets that inquiry");
      expect(text).toContain("The report lists each normalization adjustment, valuation input, and tracing step with its source");
      expect(text, serviceSlug).not.toMatch(/damages report|lost earnings, household services|past and future amounts/);
    }
  });

  // Intellectual property infringement (2026-10-06): every pillar that
  // declares the matter names the federal district courts first on its pair
  // x state page, with the Federal Circuit and the state's own circuit before
  // the state's courts, prints no second federal sentence, and closes the
  // framework FAQ on the federal statutes, in every state, the District, and
  // every territory.
  it("the intellectual property pairs name the federal courts first and the federal statutes, in every state and territory", () => {
    const pillars = ["intellectual-property-damages", "lost-profits-and-commercial-damages", "business-valuation", "expert-rebuttal-and-report-review"];
    for (const serviceSlug of pillars) {
      for (const st of states) {
        const label = `${serviceSlug}/${st.slug}`;
        const place = placeName(st.name);
        const { html, description } = render(serviceSlug, "intellectual-property-infringement", st.slug);
        const text = visibleText(html);
        const faqs = faqLdStrings(html);
        expect(description.length, label).toBeGreaterThanOrEqual(140);
        expect(description.length, label).toBeLessThanOrEqual(160);
        expect(description, label).toContain("courts");
        expect(text, label).toContain(`cases involving ${place}: the measure each patent, trademark, copyright, or trade secret claim carries`);
        const expertQ = faqs.findIndex((q) => q.startsWith(`What do the courts that hear an intellectual property case involving ${place} ask of`));
        expect(expertQ, label).toBeGreaterThan(-1);
        const expertAnswer = faqs[expertQ + 1];
        expect(expertAnswer, label).toContain("Patent and copyright claims arise under federal law that only the federal courts may hear");
        expect(expertAnswer, label).not.toContain("Matters within federal jurisdiction proceed in");
        expect(faqs, label).toContain(`Which damages rules shape ${faqs[expertQ].slice(faqs[expertQ].indexOf(" ask of ") + 8, -1)} in an intellectual property case involving ${place}?`);
        for (const t of [text, faqs.join(" ")]) {
          expect(t, label).not.toMatch(/damages rules and venues|a present value built|past and future amounts separately|contributory negligence|comparative fault/);
          expect(t, label).not.toMatch(/\b(a|an|the) (a|an|the)\b|in District of Columbia|for the District Court (of|for)/i);
        }
        if (st.slug === "american-samoa") {
          expect(expertAnswer, label).toContain("American Samoa has no federal district court of its own");
        } else {
          expect(expertAnswer.indexOf("United States District Court"), label).toBeLessThan(expertAnswer.indexOf("Federal Circuit"));
        }
      }
    }
  }, 120_000);

  it("an undeclared pair, an unknown state, and an unknown service render NotFound and publish no meta", () => {
    for (const [s, c, st] of [
      ["divorce-and-marital-financial-analysis", "traumatic-brain-injury", "new-jersey"],
      ["lost-earnings-and-earning-capacity", "personal-injury", "nowhere"],
      ["no-such-service", "personal-injury", "new-jersey"],
      ["vocational-evaluation", "personal-injury", "new-jersey"],
    ] as const) {
      const { html, title } = render(s, c, st);
      // The template publishes no meta of its own; the last call is NotFound's.
      expect(title, `${s}/${c}/${st}`).toMatch(/^(|Page Not Found \| KW Economics)$/);
      expect(html, `${s}/${c}/${st}`).toContain("404");
      expect(jsonLdBlocks(html), `${s}/${c}/${st}`).toBe("");
    }
  });
});
