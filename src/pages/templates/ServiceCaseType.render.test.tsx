import { describe, it, expect, vi } from "vitest";
import ServiceCaseType from "./ServiceCaseType";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices, servicesForCaseType } from "@/data/services";
import { caseTypes } from "@/data/caseTypes";
import { ORG_NAME } from "@/lib/brand";
import { pairTitle } from "@/lib/page-titles.mjs";
import { capFirst, workPhrase } from "@/lib/service-prose.mjs";
import {
  renderRoute,
  visibleText,
  jsonLdBlocks,
  faqText,
  faqLdStrings,
  DOUBLED_WORD,
  MIS_ARTICLE,
  excerpt,
} from "@/test-utils/markup";

// The service x case-type pages (11 pillars x 14 case types) publish a meta
// description and an intro sentence templated from Service.shortName. The
// short name is a heading label ("Fraud & Tracing", "Wrongful Death"), so
// both sentences render the work the pillar performs (workPhrase) instead of
// dropping the label into the sentence. usePageMeta writes from an effect
// that never runs under renderToStaticMarkup, so it is replaced with a spy
// and the description each page would publish is read back from the call.
//
// Only the pairs a pillar declares in services.ts (caseTypeNotes) carry
// pair-specific copy and a FAQ block with FAQPage JSON-LD; the undeclared
// pairs of the all-pairs grid render the shared sections with no FAQ, so the
// case-type hub stays the FAQ owner.
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

const STAGES = ["considering", "retaining", "preparing-deposition", "trial"];

describe("ServiceCaseType meta, intro, and shared sections", () => {
  for (const service of pillarServices()) {
    const work = workPhrase(service.shortName);
    for (const caseType of caseTypes) {
      const declared = service.caseTypes.includes(caseType.slug);
      it(`/services/${service.slug}/case/${caseType.slug} (${declared ? "declared" : "undeclared"}) names the work as prose`, () => {
        const { html, title, description } = render(service.slug, caseType.slug);
        const intro = introSentence(html);
        const text = visibleText(html);
        const ct = caseType.name.toLowerCase();
        expect(html).toContain("<h1");
        // The H1 keeps the full service name; the title comes from the shared
        // pairTitle builder: the heading label (any ampersand spelled out)
        // plus the case type's short name, with "Expert" wherever it fits the
        // 60-character tag, then without it, and only then the same two forms
        // on the shorter titleShortName where the data sets one.
        expect(text).toContain(`${service.name} for ${caseType.name} Cases`);
        expect(html).toMatch(/<h1[^>]*>[^<]*Cases<\/h1>/);
        expect(title).toBe(pairTitle(service, caseType, ORG_NAME));
        const labels = [service.shortName.replace(/\s*&\s*/g, " and "), ...(service.titleShortName ? [service.titleShortName] : [])];
        const ladder = labels
          .flatMap((label) => [`${label} Expert for ${caseType.shortName}`, `${label} for ${caseType.shortName}`])
          .map((body) => `${body} | ${ORG_NAME}`);
        expect(title).toBe(ladder.find((t) => t.length <= 60));
        expect(title.length).toBeLessThanOrEqual(60);
        expect(title).not.toContain("&");
        const base = `${capFirst(work)} for ${ct} cases: how the loss is built, which records drive it, and testimony support.`;
        // "Either side." rides along only while the description fits the
        // 160-character window; the four long undeclared pairs drop it.
        expect(description).toBe(base.length + " Either side.".length <= 160 ? `${base} Either side.` : base);
        expect(description.length).toBeGreaterThanOrEqual(120);
        expect(description.length).toBeLessThanOrEqual(160);
        expect(intro).toBe(
          `${capFirst(work)} applied to ${ct} litigation: methodology, deliverables, and case-specific considerations.`,
        );
        // The heading label never enters a sentence raw; the H2 keeps the
        // full name as a proper noun.
        expect(description).not.toContain(`${service.shortName} services`);
        expect(intro).not.toContain(`${service.shortName} applied`);
        expect(text).toContain(`How ${service.name} applies to ${caseType.name}`);
        for (const t of [description, intro]) {
          expect(t).not.toContain("&");
          expect(excerpt(t, DOUBLED_WORD)).toBeUndefined();
          expect(excerpt(t, MIS_ARTICLE)).toBeUndefined();
        }
      });

      it(`/services/${service.slug}/case/${caseType.slug} renders the service, the claim, and the deliverable from the data`, () => {
        const { html } = render(service.slug, caseType.slug);
        const text = visibleText(html);
        // The pillar's own description sits under the pinned H2; the case
        // type's loss components sit under their own H2 (the hub's heading).
        const application = html.indexOf('<section id="application"');
        const loss = html.indexOf('<section id="loss-components"');
        expect(application).toBeGreaterThan(-1);
        expect(loss).toBeGreaterThan(application);
        expect(visibleText(html.slice(application, loss))).toContain(service.description);
        expect(text).toContain("What the economic claim consists of");
        expect(text).toContain(caseType.lossComponents);
        // Deliverables come from the pillar's final process step, not a fixed sentence.
        expect(text).toContain(service.process!.at(-1)!.description);
        expect(html).not.toContain("A written expert report, supporting data appendices");
        expect(text).toContain("Typical deliverables");
      });

      it(`/services/${service.slug}/case/${caseType.slug} links onward and carries a CTA`, () => {
        const { html } = render(service.slug, caseType.slug);
        expect(html).toContain(`href="/case-types/${caseType.slug}"`);
        for (const stage of STAGES) expect(html).toContain(`href="/attorneys/${stage}/${caseType.slug}"`);
        for (const v of ["cost", "process", "timeline"]) expect(html).toContain(`href="/services/${service.slug}/${v}"`);
        for (const r of service.related.slice(0, 3)) expect(html).toContain(`href="${r.href}"`);
        // Sibling pair links go only to pillars that declare this case type.
        const siblings = servicesForCaseType(caseType.slug).filter((s) => s.slug !== service.slug);
        const pairLinks = [...html.matchAll(/href="\/services\/([a-z-]+)\/case\/[a-z-]+"/g)].map((m) => m[1]);
        expect(pairLinks.sort()).toEqual(siblings.map((s) => s.slug).sort());
        expect(html).toContain('href="/contact"');
        expect(html).toMatch(/href="tel:\+1\d+"/);
        expect(html).toContain(`<time dateTime="${service.dateModified}">`);
        for (const s of service.sources.slice(0, 5)) expect(html).toContain(`href="${s.url}"`);
      });

      it(`/services/${service.slug}/case/${caseType.slug} JSON-LD carries the Organization node and dateModified`, () => {
        const { html } = render(service.slug, caseType.slug);
        const ld = jsonLdBlocks(html);
        expect(ld).toContain('"@id":"https://kweconomics.com/#org"');
        expect(ld).toContain('"provider":{"@id":"https://kweconomics.com/#org"}');
        expect(ld).toContain(`"dateModified":"${service.dateModified}"`);
        expect(ld).toContain('"@type":"BreadcrumbList"');
      });

      if (declared) {
        it(`/services/${service.slug}/case/${caseType.slug} carries its pair note and two pair-specific FAQs with FAQPage markup`, () => {
          const { html } = render(service.slug, caseType.slug);
          const note = service.caseTypeNotes[caseType.slug];
          const text = visibleText(html);
          expect(note).toBeDefined();
          expect(text).toContain(note.summary);
          const visibleFaq = faqText(html);
          const ld = faqLdStrings(html);
          expect(ld.length).toBe(note.faqs.length * 2);
          for (const f of note.faqs) {
            expect(visibleFaq).toContain(f.question);
            expect(visibleFaq).toContain(f.answer);
            expect(ld).toContain(f.question);
          }
          // Pair FAQs are not the hub's FAQs.
          for (const f of caseType.faqs) expect(ld).not.toContain(f.question);
          for (const s of [text, jsonLdBlocks(html)]) {
            expect(excerpt(s, DOUBLED_WORD)).toBeUndefined();
            expect(excerpt(s, MIS_ARTICLE)).toBeUndefined();
            expect(s).not.toMatch(/[–—]/);
          }
          expect(visibleFaq).not.toContain("&");
        });
      } else {
        it(`/services/${service.slug}/case/${caseType.slug} emits no FAQ block and no FAQPage markup`, () => {
          const { html } = render(service.slug, caseType.slug);
          expect(html).not.toContain("<details");
          expect(jsonLdBlocks(html)).not.toMatch(/"@type":\s*"FAQPage"/);
        });
      }
    }
  }

  it("prints the fraud and wrongful death pillars word for word", () => {
    const fraud = render("fraud-and-asset-tracing", "fraud-and-embezzlement");
    expect(fraud.title).toBe("Fraud and Tracing Expert for Fraud | KW Economics");
    expect(fraud.description).toBe(
      "Fraud and tracing analysis for fraud and embezzlement cases: how the loss is built, which records drive it, and testimony support. Either side.",
    );
    expect(introSentence(fraud.html)).toBe(
      "Fraud and tracing analysis applied to fraud and embezzlement litigation: methodology, deliverables, and case-specific considerations.",
    );
    const wd = render("wrongful-death-economic-loss", "traumatic-brain-injury");
    expect(wd.title).toBe("Wrongful Death Expert for Brain Injury | KW Economics");
    // Where "Expert" cannot fit beside a long label and case name it drops.
    expect(render("business-valuation", "partnership-and-shareholder-dispute").title).toBe(
      "Business Valuation for Shareholder Dispute | KW Economics",
    );
    expect(render("lost-earnings-and-earning-capacity", "personal-injury").title).toBe(
      "Lost Earnings Expert for Personal Injury | KW Economics",
    );
    // The divorce pillar keeps its heading label wherever it fits (this pair
    // is exactly 60 characters) and takes the shorter titleShortName only
    // where neither form of the heading label can.
    expect(render("divorce-and-marital-financial-analysis", "divorce-and-marital-dissolution").title).toBe(
      "Divorce Financial Analysis Expert for Divorce | KW Economics",
    );
    expect(render("divorce-and-marital-financial-analysis", "partnership-and-shareholder-dispute").title).toBe(
      "Divorce Analysis for Shareholder Dispute | KW Economics",
    );
    expect(wd.description).toBe(
      "Wrongful death analysis for traumatic brain injury cases: how the loss is built, which records drive it, and testimony support. Either side.",
    );
    expect(introSentence(wd.html)).toBe(
      "Wrongful death analysis applied to traumatic brain injury litigation: methodology, deliverables, and case-specific considerations.",
    );
  });

  it("an unknown pair renders the 404", () => {
    const { html } = render("business-valuation", "no-such-type");
    expect(html).not.toContain('<section id="application"');
  });
});


