import { describe, it, expect, vi } from "vitest";
import ServiceCaseType from "./ServiceCaseType";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices } from "@/data/services";
import { caseTypes } from "@/data/caseTypes";
import { ORG_NAME } from "@/lib/brand";
import { capFirst, workPhrase } from "@/lib/service-prose.mjs";
import { renderRoute, visibleText, DOUBLED_WORD, MIS_ARTICLE, excerpt } from "@/test-utils/markup";

// The service x case-type pages (11 pillars x 14 case types) publish a meta
// description and an intro sentence templated from Service.shortName. The
// short name is a heading label ("Fraud & Tracing", "Wrongful Death"), so
// both sentences render the work the pillar performs (workPhrase) instead of
// dropping the label into the sentence ("Wrongful Death services tailored
// to", "Fraud & Tracing applied to"). usePageMeta writes from an effect that
// never runs under renderToStaticMarkup, so it is replaced with a spy and the
// description each page would publish is read back from the call.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const ROUTE = "/services/:serviceSlug/case/:typeSlug";

function render(serviceSlug: string, typeSlug: string): { html: string; title: string; description: string } {
  vi.mocked(usePageMeta).mockClear();
  const html = renderRoute(`/services/${serviceSlug}/case/${typeSlug}`, ROUTE, ServiceCaseType);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, title: meta?.title ?? "", description: meta?.description ?? "" };
}

/** The intro paragraph under the byline, as the visitor reads it. */
function introSentence(html: string): string {
  const m = html.match(/<p class="text-lg text-neutral-700 mb-8">([\s\S]*?)<\/p>/);
  return m ? visibleText(m[1]).trim() : "";
}

describe("ServiceCaseType meta description and intro", () => {
  for (const service of pillarServices()) {
    const work = workPhrase(service.shortName);
    for (const caseType of caseTypes) {
      it(`/services/${service.slug}/case/${caseType.slug} names the work as prose`, () => {
        const { html, title, description } = render(service.slug, caseType.slug);
        const intro = introSentence(html);
        const ct = caseType.name.toLowerCase();
        expect(html).toContain("<h1");
        expect(title).toBe(`${service.name} for ${caseType.name} Cases | ${ORG_NAME}`);
        expect(description).toBe(
          `${ORG_NAME} provides ${work} tailored to ${ct} cases. Methodology, deliverables, and testimony support. Plaintiff and defense.`,
        );
        expect(intro).toBe(
          `${capFirst(work)} applied to ${ct} litigation: methodology, deliverables, and case-specific considerations.`,
        );
        // The heading label never enters a sentence raw; the H2 keeps the
        // full name as a proper noun.
        expect(description).not.toContain(`${service.shortName} services`);
        expect(intro).not.toContain(`${service.shortName} applied`);
        expect(visibleText(html)).toContain(`How ${service.name} applies to ${caseType.name}`);
        for (const text of [description, intro]) {
          expect(text).not.toContain("&");
          expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
          expect(excerpt(text, MIS_ARTICLE)).toBeUndefined();
        }
      });
    }
  }

  it("prints the fraud and wrongful death pillars word for word", () => {
    const fraud = render("fraud-and-asset-tracing", "fraud-and-embezzlement");
    expect(fraud.description).toBe(
      "KW Economics provides fraud and tracing analysis tailored to fraud and embezzlement cases. Methodology, deliverables, and testimony support. Plaintiff and defense.",
    );
    expect(introSentence(fraud.html)).toBe(
      "Fraud and tracing analysis applied to fraud and embezzlement litigation: methodology, deliverables, and case-specific considerations.",
    );
    const wd = render("wrongful-death-economic-loss", "traumatic-brain-injury");
    expect(wd.description).toBe(
      "KW Economics provides wrongful death analysis tailored to traumatic brain injury cases. Methodology, deliverables, and testimony support. Plaintiff and defense.",
    );
    expect(introSentence(wd.html)).toBe(
      "Wrongful death analysis applied to traumatic brain injury litigation: methodology, deliverables, and case-specific considerations.",
    );
  });
});
