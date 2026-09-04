import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import ServiceTransactional from "./ServiceTransactional";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices } from "@/data/services";
import { proseName } from "@/lib/service-prose.mjs";
import { renderRoute, visibleText, jsonLdBlocks, DOUBLED_WORD, MIS_ARTICLE, excerpt } from "@/test-utils/markup";

// The cost / process / timeline pages publish a one-sentence meta description
// templated from Service.shortName. usePageMeta writes it from an effect that
// never runs under renderToStaticMarkup, so the hook is replaced with a spy
// and the description each page would publish is read back from the call.
vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));

const VARIANTS = ["cost", "process", "timeline"] as const;
type Variant = (typeof VARIANTS)[number];

function renderVariant(slug: string, variant: Variant): { html: string; description: string; title: string } {
  vi.mocked(usePageMeta).mockClear();
  const Page = () => createElement(ServiceTransactional, { variant });
  const html = renderRoute(`/services/${slug}/${variant}`, `/services/:serviceSlug/${variant}`, Page);
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
  return { html, description: meta?.description ?? "", title: meta?.title ?? "" };
}

describe("ServiceTransactional meta descriptions", () => {
  for (const service of pillarServices()) {
    for (const variant of VARIANTS) {
      it(`/services/${service.slug}/${variant} reads as prose and answers the page's question`, () => {
        const { html, description, title } = renderVariant(service.slug, variant);
        expect(html).toContain("<h1");
        // The H1 keeps the full name; the <title> takes the pillar's titleName
        // where the full name would overrun the 60-character tag.
        expect(html).toContain(`${service.name} ${variant[0].toUpperCase()}${variant.slice(1)}</h1>`);
        const label = `${variant[0].toUpperCase()}${variant.slice(1)}`;
        const full = `${service.name} ${label} | KW Economics`;
        expect(title).toBe(full.length <= 60 ? full : `${service.titleName ?? service.name} ${label} | KW Economics`);
        expect(title.length).toBeLessThanOrEqual(60);
        expect(description.length).toBeGreaterThanOrEqual(140);
        expect(description.length).toBeLessThanOrEqual(160);
        expect(description).toContain(proseName(service.shortName));
        expect(description).not.toContain("&");
        expect(excerpt(description, DOUBLED_WORD)).toBeUndefined();
        expect(excerpt(description, MIS_ARTICLE)).toBeUndefined();
        // The description answers, it does not describe the page.
        expect(description).toMatch(/^(What .* costs:|How .* engagement runs:|How long .* takes:)/);
      });
    }
  }

  it("prints the fraud pillar's short name as prose in every variant", () => {
    expect(renderVariant("fraud-and-asset-tracing", "cost").description).toBe(
      "What fraud and tracing analysis costs: hourly billing against a retainer, the factors that set the scope, and a written estimate up front. Either side.",
    );
    expect(renderVariant("fraud-and-asset-tracing", "process").description).toBe(
      "How a fraud and tracing engagement runs: conflict check and retention, records request, analysis, draft review with counsel, then the final report.",
    );
    expect(renderVariant("fraud-and-asset-tracing", "timeline").description).toBe(
      "How long fraud and tracing analysis takes: 1 to 2 weeks for intake, 4 to 8 weeks of analysis, 1 to 2 weeks to the report, then testimony. Plaintiff and defense.",
    );
  });

  it("keeps the article-safe wording on a vowel-initial short name", () => {
    expect(renderVariant("employment-and-wage-loss-damages", "process").description).toBe(
      "How an employment damages engagement runs: conflict check and retention, records request, analysis, draft review with counsel, then the final report.",
    );
  });

  it("drops the closing tail only where the work phrase is long (personal injury)", () => {
    expect(renderVariant("lost-earnings-and-earning-capacity", "cost").description).toMatch(/ Either side\.$/);
    expect(renderVariant("personal-injury-economic-damages", "cost").description).toBe(
      "What personal injury economic damages analysis costs: hourly billing against a retainer, the factors that set the scope, and a written estimate up front.",
    );
    expect(renderVariant("personal-injury-economic-damages", "timeline").description).toBe(
      "How long personal injury economic damages analysis takes: about 1 week for intake, 2 to 4 weeks of analysis, 1 to 2 weeks to the report, then testimony.",
    );
  });
});

describe("ServiceTransactional body", () => {
  for (const service of pillarServices()) {
    describe(service.slug, () => {
      for (const variant of VARIANTS) {
        const { html } = renderVariant(service.slug, variant);
        const text = visibleText(html);

        it(`${variant}: carries the byline date, the CTA with a phone number, and the consultation link`, () => {
          expect(html).toContain(`<time dateTime="${service.dateModified}">`);
          expect(html).toContain('href="/contact"');
          expect(html).toMatch(/href="tel:\+1\d+"/);
          expect(html).toContain('href="/schedule-consultation"');
        });

        it(`${variant}: links the pillar, the two sibling variants, and the pillar's guides`, () => {
          expect(html).toContain(`href="/services/${service.slug}"`);
          for (const v of VARIANTS.filter((x) => x !== variant)) {
            expect(html).toContain(`href="/services/${service.slug}/${v}"`);
          }
          for (const r of service.related.slice(0, 3)) expect(html).toContain(`href="${r.href}"`);
        });

        it(`${variant}: JSON-LD carries the Organization node the Service provider points at, plus dateModified`, () => {
          const ld = jsonLdBlocks(html);
          expect(ld).toContain('"@id":"https://kweconomics.com/#org"');
          expect(ld).toContain('"provider":{"@id":"https://kweconomics.com/#org"}');
          expect(ld).toContain(`"dateModified":"${service.dateModified}"`);
          expect(ld).toContain('"@type":"BreadcrumbList"');
        });

        it(`${variant}: visible copy has no doubled words, misplaced articles, or dashes`, () => {
          expect(excerpt(text, DOUBLED_WORD)).toBeUndefined();
          expect(excerpt(text, MIS_ARTICLE)).toBeUndefined();
          expect(text).not.toMatch(/[–—]/);
        });
      }

      it("cost: opens with the direct billing answer before the scope and driver sections", () => {
        const { html } = renderVariant(service.slug, "cost");
        const answer = html.indexOf("is billed at an hourly rate against a retainer");
        const billing = html.indexOf('<section id="billing"');
        const range = html.indexOf('<section id="range"');
        const drivers = html.indexOf('<section id="drivers"');
        expect(answer).toBeGreaterThan(-1);
        expect(billing).toBeGreaterThan(answer);
        expect(range).toBeGreaterThan(billing);
        expect(drivers).toBeGreaterThan(range);
        expect(html).not.toContain("Typical range");
        expect(html).toContain("What sets the scope");
      });

      it("process: opens with a lead sentence and links the timeline inline", () => {
        const { html } = renderVariant(service.slug, "process");
        const lead = html.indexOf("engagement moves through");
        const list = html.indexOf('<section id="process"');
        expect(lead).toBeGreaterThan(-1);
        expect(list).toBeGreaterThan(lead);
        expect(html).toContain(`href="/services/${service.slug}/timeline"`);
      });

      it("timeline: opens with a lead sentence that links the engagement process inline", () => {
        const { html } = renderVariant(service.slug, "timeline");
        const lead = html.indexOf("sets the pace");
        const list = html.indexOf('<section id="timeline"');
        expect(lead).toBeGreaterThan(-1);
        expect(list).toBeGreaterThan(lead);
        expect(html.slice(0, list)).toContain(`href="/services/${service.slug}/process"`);
        expect(html).toContain("What the engagement delivers");
      });
    });
  }

  it("an unknown service renders the 404", () => {
    const { html } = renderVariant("no-such-service", "cost");
    expect(html).not.toContain('<section id="billing"');
  });
});
