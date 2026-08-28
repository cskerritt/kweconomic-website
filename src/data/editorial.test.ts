import { describe, expect, it } from "vitest";
import { methods } from "./methods";
import { guides } from "./guides";
import { comparisons } from "./comparisons";
import { knowledgeGuides as knowledge } from "./knowledge";
import { insightPosts as insights } from "./insights";
import { whitePapers } from "./whitePapers";
import { faqs } from "./faqs";
import { testimonials } from "./testimonials";
import { homepageFaqs } from "./home-faqs.mjs";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug).sort();
// Global flag so `match` counts every hit, not just the first.
const VOCAB = /life care planner|vocational expert|vocational evaluation|transferable skills|labor market survey|CLCP|CNLCP/gi;
// The two comparison pages that name the sister disciplines are the only
// allowed mentions (Task 10's off-brand guard carves out exactly these slugs).
const SISTER_COMPARISONS = new Set(["forensic-economist-vs-vocational-expert", "economist-vs-life-care-planner"]);

// Word count of an entry's prose: JSON text with HTML tags, link markers, and
// keys stripped. Used for the floor checks (guides/knowledge >= 400, methods/
// comparisons >= 250) required by the content plan.
function words(entry: unknown): number {
  const text = JSON.stringify(entry)
    .replace(/<[^>]+>/g, " ")
    .replace(/\[\[[^|\]]*\|([^\]]+)\]\]/g, "$1")
    .replace(/"[a-zA-Z]+":/g, " ")
    .replace(/https?:\/\/\S+/g, " ");
  return text.split(/\s+/).filter((w) => /[a-zA-Z]/.test(w)).length;
}

describe("economics editorial data", () => {
  it("methods", () =>
    expect(slugs(methods)).toEqual([
      "business-valuation-approaches",
      "fringe-benefits-valuation",
      "household-services-methodology",
      "lost-profits-but-for-analysis",
      "mitigation-and-offsets",
      "present-value-and-discounting",
      "wage-growth-and-earnings-projection",
      "worklife-expectancy",
    ]));
  it("guides", () =>
    expect(slugs(guides)).toEqual([
      "business-valuation-in-litigation",
      "collateral-source-rule-explained",
      "expert-witness-disclosure-rules",
      "federal-vs-state-court-daubert",
      "household-services-in-personal-injury",
      "how-lost-earnings-are-calculated",
      "how-to-rebut-an-economic-damages-report",
      "income-determination-in-divorce",
      "lost-profits-vs-lost-business-value",
      "present-value-explained-for-attorneys",
      "what-is-a-forensic-economist",
      "when-do-you-need-an-economic-expert",
      "wrongful-death-damages-explained",
    ]));
  it("comparisons", () =>
    expect(slugs(comparisons)).toEqual([
      "economist-vs-life-care-planner",
      "fair-market-value-vs-fair-value",
      "forensic-economist-vs-forensic-accountant",
      "forensic-economist-vs-vocational-expert",
      "lost-earnings-vs-lost-earning-capacity",
      "lost-profits-vs-business-valuation",
      "net-vs-gross-discount-rate",
      "plaintiff-economist-vs-defense-economist",
    ]));
  it("knowledge, insights, white papers", () => {
    expect(slugs(knowledge)).toEqual(["expert-witness-testimony-guide", "guide-to-economic-damages"]);
    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(slugs(insights)).toContain("components-of-an-economic-damages-report");
    expect(slugs(whitePapers)).toEqual(["business-valuation-standards-in-litigation", "daubert-ready-economic-damages-report"]);
    expect(whitePapers.every((w) => w.discipline === "Economic")).toBe(true);
  });
  it("faqs and testimonials are economics-framed", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(8);
    expect(testimonials.length).toBeGreaterThanOrEqual(2);
    const home = homepageFaqs("KW Economics", "KW Economics");
    expect(home.length).toBeGreaterThanOrEqual(5);
    const text = JSON.stringify([methods, guides, comparisons, knowledge, insights, whitePapers, faqs, testimonials, home]);
    expect(text).not.toMatch(LEGACY_BRAND_PATTERN);
    expect(text).not.toMatch(/[–—§]/);
    const vocabHits = text.match(VOCAB) ?? [];
    // the two comparison pages that name the sister disciplines are the only allowed mentions
    expect(vocabHits.length).toBeLessThanOrEqual(12);
    const outside = JSON.stringify([
      methods,
      guides,
      comparisons.filter((c) => !SISTER_COMPARISONS.has(c.slug)),
      knowledge,
      insights,
      whitePapers,
      faqs,
      testimonials,
      home,
    ]);
    expect(outside.match(VOCAB) ?? []).toEqual([]);
  });
  it("every editorial entry has at least one registry source", () => {
    for (const x of [...methods, ...guides, ...comparisons, ...knowledge, ...insights, ...whitePapers]) {
      expect((x as { sources?: unknown[] }).sources?.length, x.slug).toBeGreaterThanOrEqual(1);
    }
  });
  it("meets the prose floors (guides/knowledge >= 400 words, methods/comparisons >= 250)", () => {
    for (const g of guides) expect(words(g), `guide ${g.slug}`).toBeGreaterThanOrEqual(400);
    for (const k of knowledge) expect(words(k), `knowledge ${k.slug}`).toBeGreaterThanOrEqual(400);
    for (const m of methods) expect(words(m), `method ${m.slug}`).toBeGreaterThanOrEqual(250);
    for (const c of comparisons) expect(words(c), `comparison ${c.slug}`).toBeGreaterThanOrEqual(250);
  });
  it("authored bylines resolve to the two-person roster and FAQ answers carry no link markers", () => {
    const bylines = [...guides, ...comparisons, ...knowledge, ...insights, ...whitePapers]
      .map((x) => (x as { authorSlug?: string }).authorSlug)
      .filter((s): s is string => Boolean(s));
    for (const s of bylines) expect(["christopher-skerritt", "zachary-sperling"]).toContain(s);
    // FAQBlock renders guide/method/comparison FAQ answers as plain text.
    for (const x of [...methods, ...guides, ...comparisons]) {
      for (const f of (x as { faqs?: { answer: string }[] }).faqs ?? []) {
        expect(f.answer, `${x.slug} faq`).not.toMatch(/\[\[/);
      }
    }
  });
});
