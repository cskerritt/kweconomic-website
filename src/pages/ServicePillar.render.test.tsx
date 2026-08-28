import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ServicePillar from "./ServicePillar";
import { pillarServices } from "@/data/services";

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
// are never read as one run of prose; only a seam inside a single text node,
// which is what a template produces, can match.
function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " | ")
    .replace(/<[^>]+>/g, " | ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

function jsonLdBlocks(html: string): string {
  return [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join("\n");
}

// The FAQ prose as the visitor reads it: every <details> block, tags stripped.
function faqText(html: string): string {
  return [...html.matchAll(/<details[\s\S]*?<\/details>/g)]
    .map((m) => visibleText(m[0]))
    .join(" | ");
}

// Question and answer strings from the FAQPage node of each JSON-LD graph.
// Scoped to that node because the organization node legitimately carries "&"
// inside its map URLs.
interface FaqQuestion { name: string; acceptedAnswer: { text: string } }
interface LdNode { "@type"?: string; mainEntity?: FaqQuestion[] }
function faqLdStrings(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]) as LdNode & { "@graph"?: LdNode[] };
    for (const node of data["@graph"] ?? [data]) {
      if (node["@type"] !== "FAQPage") continue;
      for (const q of node.mainEntity ?? []) out.push(q.name, q.acceptedAnswer.text);
    }
  }
  return out;
}

// A word immediately repeated ("analysis analysis") is a template seam, never
// intended copy.
const DOUBLED_WORD = /\b([a-z]{3,}) \1\b/i;

// "a" in front of a vowel-initial word ("a employment damages engagement") is
// the seam a fixed article produces when the slot it precedes can start with
// a vowel.
const MIS_ARTICLE = /\ba [aeiou]/i;

// The match with its surroundings, so a failure names the seam.
function excerpt(text: string, re: RegExp): string | undefined {
  const hit = re.exec(text);
  if (!hit) return undefined;
  return text.slice(Math.max(0, hit.index - 60), hit.index + hit[0].length + 60);
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
      "Where does KW Economics provide personal injury analysis?",
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
    "personal-injury-economic-damages": "How personal injury analysis applies to the specific demands of each case type",
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
