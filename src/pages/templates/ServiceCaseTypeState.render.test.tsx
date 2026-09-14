import { describe, it, expect, vi } from "vitest";
import ServiceCaseTypeState from "./ServiceCaseTypeState";
import { usePageMeta } from "@/hooks/use-page-meta";
import { declaredPairs, releasedStates, STATE_BATCHES } from "@/data/serviceCaseTypeStates";
import { pillarServices } from "@/data/services";
import { getCaseType, caseTypeSectionHeadings } from "@/data/caseTypes";
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
      // State substance: the courts block, the framework block, and the pair note.
      expect(text).toContain("New Jersey courts and expert standards");
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

  it("every declared pair in every state publishes a title inside the SERP window and a description inside 160 characters", () => {
    for (const { serviceSlug, typeSlug } of declaredPairs()) {
      const service = pillarServices().find((s) => s.slug === serviceSlug)!;
      const caseType = getCaseType(typeSlug)!;
      for (const st of states) {
        const title = serviceCaseStateTitle(service, caseType, st, ORG_NAME);
        expect(title.length, `${serviceSlug}/${typeSlug}/${st.slug}: ${title}`).toBeLessThanOrEqual(TITLE_MAX);
        expect(title).not.toMatch(/&|[–—§]/);
        const description = serviceCaseStateDescription(service, caseType, placeName(st.name));
        expect(description.length, `${serviceSlug}/${typeSlug}/${st.slug}`).toBeLessThanOrEqual(160);
        expect(description).toMatch(/\.$/);
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
