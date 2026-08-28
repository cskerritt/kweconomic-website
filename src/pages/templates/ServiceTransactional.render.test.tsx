import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import ServiceTransactional from "./ServiceTransactional";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pillarServices } from "@/data/services";
import { proseName } from "@/lib/service-prose.mjs";
import { renderRoute, DOUBLED_WORD, MIS_ARTICLE, excerpt } from "@/test-utils/markup";

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
      it(`/services/${service.slug}/${variant} reads as prose`, () => {
        const { html, description, title } = renderVariant(service.slug, variant);
        expect(html).toContain("<h1");
        expect(title).toContain(service.name);
        expect(description.length).toBeGreaterThan(0);
        expect(description).toContain(proseName(service.shortName));
        expect(description).not.toContain("&");
        expect(excerpt(description, DOUBLED_WORD)).toBeUndefined();
        expect(excerpt(description, MIS_ARTICLE)).toBeUndefined();
      });
    }
  }

  it("prints the fraud pillar's short name as prose in every variant", () => {
    expect(renderVariant("fraud-and-asset-tracing", "cost").description).toBe(
      "Pricing, fee structure, and engagement cost considerations for fraud and tracing engagements.",
    );
    expect(renderVariant("fraud-and-asset-tracing", "process").description).toBe(
      "Step-by-step fraud and tracing engagement process, from intake to deliverable.",
    );
    expect(renderVariant("fraud-and-asset-tracing", "timeline").description).toBe(
      "Typical fraud and tracing engagement timeline and turnaround expectations.",
    );
  });

  it("keeps the article-safe wording on a vowel-initial short name", () => {
    expect(renderVariant("employment-and-wage-loss-damages", "process").description).toBe(
      "Step-by-step employment damages engagement process, from intake to deliverable.",
    );
  });
});
