import { describe, it, expect, vi } from "vitest";
import FederalDistrict from "./FederalDistrict";
import { usePageMeta } from "@/hooks/use-page-meta";
import { federalDistricts, siblingDistricts } from "@/data/courts/federal-districts";
import { states } from "@/data/states";
import { caseTypes } from "@/data/caseTypes";
import { ORG_NAME } from "@/lib/brand";
import { ORG_URL } from "@/lib/schema";
import { expectServiceIdentity } from "@/test-utils/jsonld";
import {
  renderRoute,
  visibleText,
  jsonLdBlocks,
  faqLdStrings,
  faqText,
  DOUBLED_WORD,
  MIS_ARTICLE,
  excerpt,
} from "@/test-utils/markup";

// One page per federal district court (src/data/courts/federal-districts.ts,
// derived from state-courts.ts). Every page: a 60-character title, a 160-
// character description, one H1 naming the district, a direct-answer lead,
// breadcrumbs, the state's damages framework, the federal-practice section,
// three local FAQs with FAQPage JSON-LD, links to the state hub, the
// jurisdictions hub, the circuit siblings, the pillar services, and the
// state's case-type pages, and the house rules (no em or en dash, no section
// sign, no count claim). usePageMeta is spied the way the other render tests do.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const ROUTE = "/jurisdictions/federal/:districtSlug";
const COUNT_CLAIM = /\d+\+\s*(?:cases|years|firms|attorneys|clients|matters)\b/i;

function render(slug: string): { html: string; title: string; description: string } {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(`/jurisdictions/federal/${slug}`, ROUTE, FederalDistrict);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

describe("FederalDistrict template", () => {
  it("covers every district court", () => {
    expect(federalDistricts.length).toBe(94);
  });

  for (const d of federalDistricts) {
    const state = states.find((s) => s.slug === d.stateSlug)!;
    it(`/jurisdictions/federal/${d.slug} renders the district page`, () => {
      const { html, title, description } = render(d.slug);
      const text = visibleText(html);
      expect(title).toBe(`Economic Damages Expert, ${d.abbreviation} | ${ORG_NAME}`);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description.length).toBeGreaterThanOrEqual(110);
      expect(description).toContain(d.abbreviation);
      expect(description).toMatch(/\.$/);
      // One H1 naming the district; the lead answers directly under it.
      expect(html.match(/<h1/g)?.length).toBe(1);
      expect(html).toMatch(new RegExp(`<h1[^>]*>Economic Damages Expert for the ${d.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`));
      expect(text).toContain(`${d.circuit} Circuit`);
      expect(text).toContain(state.name);
      // Sections a non-JS reader and an answer engine both need.
      expect(html).toContain('<section id="federal-practice"');
      expect(html).toContain('<section id="state-framework"');
      expect(html).toContain('<section id="services"');
      expect(html).toContain('<section id="case-types"');
      expect(html).toContain('<section id="related"');
      expect(text).toContain("damages framework in diversity matters");
      // Internal links: state hub, jurisdictions hub, pillar services, every
      // case type x state page, and the circuit siblings.
      expect(html).toContain(`href="/locations/${d.stateSlug}"`);
      expect(html).toContain('href="/jurisdictions"');
      expect(html).toContain('href="/services/lost-earnings-and-earning-capacity"');
      expect(html).toContain('href="/services/expert-rebuttal-and-report-review"');
      for (const c of caseTypes) expect(html).toContain(`href="/case-types/${c.slug}/${d.stateSlug}"`);
      for (const s of siblingDistricts(d)) expect(html).toContain(`href="/jurisdictions/federal/${s.slug}"`);
      expect(html).not.toContain(`href="/jurisdictions/federal/${d.slug}"`);
      // Breadcrumbs, the FAQ, and the Service entity.
      expect(html).toContain('aria-label="Breadcrumb"');
      const ld = jsonLdBlocks(html);
      expect(ld).toContain('"BreadcrumbList"');
      expect(ld).toContain('"FAQPage"');
      expect(faqLdStrings(html).length).toBeGreaterThanOrEqual(6);
      expect(faqText(html)).toContain(d.name);
      expectServiceIdentity(html, `${ORG_URL}/jurisdictions/federal/${d.slug}`);
      // References through the registry only.
      expect(html).toContain('href="https://www.law.cornell.edu/rules/frcp/rule_26"');
      expect(html).toContain('href="https://www.law.cornell.edu/rules/fre/rule_702"');
      // House rules.
      for (const s of [text, ld]) {
        expect(s).not.toMatch(/[–—§]/);
        expect(s).not.toMatch(COUNT_CLAIM);
        expect(excerpt(s, DOUBLED_WORD)).toBeUndefined();
        expect(excerpt(s, MIS_ARTICLE)).toBeUndefined();
      }
      expect(text).not.toMatch(/member of (NAFE|AAEFE)|NAFE member|AAEFE member/i);
    });
  }

  it("the District of Columbia reads as a place, not a bare name", () => {
    const { html } = render("district-of-columbia");
    expect(visibleText(html)).toContain("covering the District of Columbia");
    expect(visibleText(html)).not.toContain("covering District of Columbia");
  });

  it("unknown slug renders NotFound and publishes no meta", () => {
    const { html } = render("nope");
    // The template's own call is null; the NotFound page then publishes its noindex meta.
    expect(vi.mocked(usePageMeta).mock.calls[0]?.[0]).toBeNull();
    expect(html).toContain("404");
    expect(html).not.toContain('<section id="federal-practice"');
  });
});
