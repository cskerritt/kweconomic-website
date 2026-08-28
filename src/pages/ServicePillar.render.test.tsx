import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ServicePillar from "./ServicePillar";
import { pillarServices } from "@/data/services";

// Server renders of every pillar page. usePageMeta does not run under
// renderToStaticMarkup, so these assert the synchronous body and JSON-LD.
// The pillar FAQ answers are templated from Service.shortName; one short
// name ("Divorce Financial Analysis") already ends in the noun the template
// appended, which printed "divorce financial analysis analysis" in the
// visible FAQ and in the FAQPage JSON-LD.
function render(slug: string): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [`/services/${slug}`] },
      createElement(
        Routes,
        null,
        createElement(Route, { path: "/services/:serviceSlug", element: createElement(ServicePillar) }),
      ),
    ),
  );
}

// Visible text only: attribute values (Tailwind's "flex flex-col") would trip
// a doubled-word check, so scripts and tags are stripped first. Each tag
// becomes a " | " delimiter so neighboring elements (an H1 "Business
// Valuation" beside a paragraph starting "Valuation of...", two keyword chips)
// are never read as one run of prose; only a doubled word inside a single
// text node, which is what a template seam produces, can match.
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " | ")
    .replace(/<[^>]+>/g, " | ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, " ");
}

function jsonLdBlocks(html: string): string {
  return [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join("\n");
}

// A word immediately repeated ("analysis analysis") is a template seam, never
// intended copy.
const DOUBLED_WORD = /\b([a-z]{3,}) \1\b/i;

// The doubled word with its surroundings, so a failure names the seam.
function doubledWord(text: string): string | undefined {
  const hit = DOUBLED_WORD.exec(text);
  if (!hit) return undefined;
  return text.slice(Math.max(0, hit.index - 60), hit.index + hit[0].length + 60);
}

describe("ServicePillar templated FAQ copy", () => {
  for (const service of pillarServices()) {
    describe(service.slug, () => {
      const html = render(service.slug);

      it("renders the pillar page with its FAQPage JSON-LD", () => {
        expect(jsonLdBlocks(html)).toMatch(/"@type":\s*"FAQPage"/);
      });

      it("never doubles a word in the visible text", () => {
        expect(doubledWord(visibleText(html))).toBeUndefined();
      });

      it("never doubles a word in the JSON-LD", () => {
        expect(doubledWord(jsonLdBlocks(html))).toBeUndefined();
      });
    });
  }

  // Short names that already end in a work noun are used as-is; the others
  // take " analysis". Pinned in both the visible FAQ and the FAQPage JSON-LD.
  const PLAINTIFF_DEFENSE_PHRASES: Record<string, string> = {
    "divorce-and-marital-financial-analysis": "objective divorce financial analysis for plaintiff and defense counsel",
    "business-valuation": "objective business valuation for plaintiff and defense counsel",
    "life-care-plan-cost-projection": "objective life care plan costing for plaintiff and defense counsel",
    "lost-earnings-and-earning-capacity": "objective lost earnings analysis for plaintiff and defense counsel",
  };
  for (const [slug, phrase] of Object.entries(PLAINTIFF_DEFENSE_PHRASES)) {
    it(`${slug}: names the work once in the plaintiff-and-defense answer`, () => {
      const html = render(slug);
      expect(visibleText(html)).toContain(phrase);
      expect(jsonLdBlocks(html)).toContain(phrase);
    });
  }
});
