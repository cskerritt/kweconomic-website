import { describe, it, expect } from "vitest";
import ServicePillar from "./ServicePillar";
import { pillarServices } from "@/data/services";
import {
  renderRoute,
  visibleText,
  jsonLdBlocks,
  faqText,
  faqLdStrings,
  excerpt,
  DOUBLED_WORD,
  MIS_ARTICLE,
} from "@/test-utils/markup";

// Server renders of every pillar page. usePageMeta does not run under
// renderToStaticMarkup, so these assert the synchronous body and JSON-LD.
//
// The pillar FAQ sentences and the "by Case Type" intro are templated from
// Service.shortName, which is a heading label rather than a prose phrase.
// Each of these seams printed in the visible copy and in the FAQPage JSON-LD:
// - "Divorce Financial Analysis" already ends in the noun the template
//   appended ("divorce financial analysis analysis");
// - "Employment Damages" starts with a vowel ("a employment damages
//   engagement");
// - "Fraud & Tracing" carried its ampersand into running prose ("accepts
//   fraud & tracing engagements");
// - seven short names are loss subjects, not the work performed ("Where does
//   KW Economics provide wrongful death?").
// The prose helpers live in src/lib/service-prose.ts (shared with the geo
// sidebars and the transactional meta descriptions); the markup helpers in
// src/test-utils/markup.ts.
function render(slug: string): string {
  return renderRoute(`/services/${slug}`, "/services/:serviceSlug", ServicePillar);
}

describe("ServicePillar templated copy", () => {
  for (const service of pillarServices()) {
    describe(service.slug, () => {
      const html = render(service.slug);

      it("renders the pillar page with its FAQPage JSON-LD", () => {
        expect(jsonLdBlocks(html)).toMatch(/"@type":\s*"FAQPage"/);
        expect(faqLdStrings(html).length).toBeGreaterThan(0);
      });

      it("never doubles a word in the visible text", () => {
        expect(excerpt(visibleText(html), DOUBLED_WORD)).toBeUndefined();
      });

      it("never doubles a word in the JSON-LD", () => {
        expect(excerpt(jsonLdBlocks(html), DOUBLED_WORD)).toBeUndefined();
      });

      it("never puts 'a' before a vowel in the visible text", () => {
        expect(excerpt(visibleText(html), MIS_ARTICLE)).toBeUndefined();
      });

      it("never puts 'a' before a vowel in the JSON-LD", () => {
        expect(excerpt(jsonLdBlocks(html), MIS_ARTICLE)).toBeUndefined();
      });

      it("spells out ampersands in the FAQ prose (headings may keep them)", () => {
        expect(faqText(html)).not.toContain("&");
        for (const s of faqLdStrings(html)) expect(s).not.toContain("&");
      });

      it("feeds the FAQPage JSON-LD from the same sentences the visitor reads", () => {
        const visible = faqText(html);
        for (const s of faqLdStrings(html)) expect(visible).toContain(s);
      });
    });
  }

  // Exact sentences, pinned in both the visible FAQ and the FAQPage JSON-LD.
  // The cost question takes an a/an-aware article; the plaintiff-and-defense
  // answer and the coverage question name the work performed (a short name
  // that already ends in a work noun is used as-is, the rest take
  // " analysis"); the coverage answer and turnaround question use the short
  // name attributively with any ampersand spelled out.
  const FAQ_PINS: Record<string, string[]> = {
    "lost-earnings-and-earning-capacity": [
      "What does a lost earnings engagement cost?",
      "objective lost earnings analysis for plaintiff and defense counsel",
      "Where does KW Economics provide lost earnings analysis?",
    ],
    "wrongful-death-economic-loss": [
      "Where does KW Economics provide wrongful death analysis?",
      "accepts wrongful death engagements in all 50 states",
    ],
    "personal-injury-economic-damages": [
      "Where does KW Economics provide personal injury economic damages analysis?",
      "objective personal injury economic damages analysis for plaintiff and defense counsel",
    ],
    "household-services-valuation": [
      "Where does KW Economics provide household services analysis?",
    ],
    "life-care-plan-cost-projection": [
      "objective life care plan costing for plaintiff and defense counsel",
      "Where does KW Economics provide life care plan costing?",
    ],
    "employment-and-wage-loss-damages": [
      "What does an employment damages engagement cost?",
      "Where does KW Economics provide employment damages analysis?",
    ],
    "business-valuation": [
      "objective business valuation for plaintiff and defense counsel",
      "Where does KW Economics provide business valuation?",
    ],
    "lost-profits-and-commercial-damages": [
      "Where does KW Economics provide lost profits analysis?",
    ],
    "fraud-and-asset-tracing": [
      "What does a fraud and tracing engagement cost?",
      "objective fraud and tracing analysis for plaintiff and defense counsel",
      "Where does KW Economics provide fraud and tracing analysis?",
      "accepts fraud and tracing engagements in all 50 states",
      "What is the typical turnaround for a full fraud and tracing report?",
    ],
    "divorce-and-marital-financial-analysis": [
      "objective divorce financial analysis for plaintiff and defense counsel",
      "Where does KW Economics provide divorce financial analysis?",
    ],
    "expert-rebuttal-and-report-review": [
      "What does a rebuttal engagement cost?",
      "Where does KW Economics provide rebuttal analysis?",
    ],
  };
  for (const [slug, phrases] of Object.entries(FAQ_PINS)) {
    it(`${slug}: FAQ sentences read as prose in the visible FAQ and the JSON-LD`, () => {
      const html = render(slug);
      const visible = faqText(html);
      const ld = faqLdStrings(html).join("\n");
      for (const phrase of phrases) {
        expect(visible).toContain(phrase);
        expect(ld).toContain(phrase);
      }
    });
  }

  // The "by Case Type" intro is visible copy only (no JSON-LD counterpart)
  // and names the work performed, not the loss subject.
  const CASE_TYPE_INTRO_PINS: Record<string, string> = {
    "wrongful-death-economic-loss": "How wrongful death analysis applies to the specific demands of each case type",
    "personal-injury-economic-damages": "How personal injury economic damages analysis applies to the specific demands of each case type",
    "fraud-and-asset-tracing": "How fraud and tracing analysis applies to the specific demands of each case type",
    "business-valuation": "How business valuation applies to the specific demands of each case type",
    "life-care-plan-cost-projection": "How life care plan costing applies to the specific demands of each case type",
    "expert-rebuttal-and-report-review": "How rebuttal analysis applies to the specific demands of each case type",
  };
  for (const [slug, phrase] of Object.entries(CASE_TYPE_INTRO_PINS)) {
    it(`${slug}: the by-Case-Type intro names the work performed`, () => {
      expect(visibleText(render(slug))).toContain(phrase);
    });
  }
});
