import { describe, expect, it } from "vitest";
import { methods } from "./methods";
import { guides } from "./guides";
import { comparisons } from "./comparisons";
import { knowledgeGuides as knowledge } from "./knowledge";
import { insightPosts as insights, formatPublishedDate, getRelatedPosts, insightBlocks, insightHeadings } from "./insights";
import { whitePapers } from "./whitePapers";
import { pillarServices } from "./services";
import { faqs } from "./faqs";
import { REFERENCES } from "./references";
import { homepageFaqs } from "./home-faqs.mjs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";

const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug).sort();
// Global flag so `match` counts every hit, not just the first.
const VOCAB = /life care planner|vocational expert|vocational evaluation|transferable skills|labor market survey|CLCP|CNLCP/gi;
// The two comparison pages that name the sister disciplines are the only
// allowed mentions (Task 10's off-brand guard carves out exactly these slugs).
const SISTER_COMPARISONS = new Set(["forensic-economist-vs-vocational-expert", "economist-vs-life-care-planner"]);
const ROSTER = ["christopher-skerritt", "zachary-sperling"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

// The <title> each template assembles from its entry. Kept in step with the
// usePageMeta calls in src/pages (the "templates wire the fields" test below
// pins the expressions) so the SERP-window check measures the real title.
const pageTitles = (): { page: string; title: string }[] => [
  ...guides.map((g) => ({ page: `guides/${g.slug}`, title: `${g.metaTitle ?? g.title} | ${ORG_NAME}` })),
  ...methods.map((m) => ({
    page: `methods/${m.slug}`,
    title: `${m.name.endsWith("Methodology") ? m.name : `${m.name} Method`} | ${ORG_NAME}`,
  })),
  ...comparisons.map((c) => ({ page: `compare/${c.slug}`, title: `${c.metaTitle ?? c.title} | ${ORG_NAME}` })),
  ...knowledge.map((k) => ({ page: `knowledge/${k.slug}`, title: `${k.metaTitle ?? k.title} | ${ORG_NAME}` })),
  ...insights.map((p) => ({ page: `insights/${p.slug}`, title: `${p.metaTitle ?? p.title} | ${ORG_NAME}` })),
  ...whitePapers.map((w) => ({ page: `white-papers/${w.slug}`, title: `${w.metaTitle ?? w.title} | White Paper | ${ORG_NAME}` })),
];

// Meta description per page: the written field everywhere, and the one-line
// answer on comparisons (which is also the lead and the Article description).
const metaDescriptions = (): { page: string; text: string }[] => [
  ...guides.map((g) => ({ page: `guides/${g.slug}`, text: g.metaDescription })),
  ...methods.map((m) => ({ page: `methods/${m.slug}`, text: m.metaDescription })),
  ...comparisons.map((c) => ({ page: `compare/${c.slug}`, text: c.answer })),
  ...knowledge.map((k) => ({ page: `knowledge/${k.slug}`, text: k.metaDescription })),
  ...insights.map((p) => ({ page: `insights/${p.slug}`, text: p.metaDescription })),
  ...whitePapers.map((w) => ({ page: `white-papers/${w.slug}`, text: w.metaDescription })),
];

// Every FAQ pair on the site with the page that owns it. Guides, methods,
// comparisons, and knowledge guides all emit FAQPage JSON-LD.
type OwnedFaq = { page: string; question: string; answer: string };
const allFaqs = (): OwnedFaq[] => [
  ...guides.flatMap((g) => (g.faqs ?? []).map((f) => ({ page: `guides/${g.slug}`, ...f }))),
  ...methods.flatMap((m) => m.faqs.map((f) => ({ page: `methods/${m.slug}`, ...f }))),
  ...comparisons.flatMap((c) => c.faqs.map((f) => ({ page: `compare/${c.slug}`, ...f }))),
  ...knowledge.flatMap((k) => (k.faqs ?? []).map((f) => ({ page: `knowledge/${k.slug}`, ...f }))),
];

// Normalized unique word tokens of a passage.
const tokens = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1),
  );
// Dice coefficient on unique tokens: 2|A n B| / (|A| + |B|). A verbatim copy
// scores 1.0; the pairs this guard was written against scored 0.96, 0.85, 0.68.
function overlap(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return (2 * shared) / (A.size + B.size);
}
// Ceiling for any two FAQ answers on different pages. Sibling guide/method
// pages that answer the same question must do so with different mechanics.
// The highest pair on the site after the 2026-09-02 rewrites scores 0.59
// (two start-up questions with parallel structure); 0.65 leaves headroom for
// copy edits while staying well under the 0.85 at which a pair reads as a copy.
const FAQ_OVERLAP_CEILING = 0.65;

describe("economics editorial data", () => {
  it("methods", () =>
    expect(slugs(methods)).toEqual([
      "age-earnings-profile",
      "below-market-discount-rate",
      "business-valuation-approaches",
      "earnings-growth-rate-selection",
      "fringe-benefits-valuation",
      "household-services-methodology",
      "lost-profits-but-for-analysis",
      "mitigation-and-offsets",
      "personal-consumption-tables",
      "present-value-and-discounting",
      "reasonable-royalty-analysis",
      "total-offset-method",
      "transfer-pricing-methods",
      "wage-growth-and-earnings-projection",
      "worklife-expectancy",
    ]));
  it("guides", () =>
    expect(slugs(guides)).toEqual([
      "business-valuation-in-litigation",
      "collateral-source-rule-explained",
      "discounts-for-lack-of-marketability",
      "expert-witness-disclosure-rules",
      "federal-vs-state-court-daubert",
      "fringe-benefits-in-a-lost-earnings-claim",
      "front-pay-vs-reinstatement",
      "goodwill-in-a-divorce-valuation",
      "household-services-in-personal-injury",
      "how-lost-earnings-are-calculated",
      "how-to-rebut-an-economic-damages-report",
      "how-worklife-expectancy-is-chosen",
      "income-determination-in-divorce",
      "intercompany-royalty-rates-in-litigation",
      "lost-profits-for-a-new-business",
      "lost-profits-vs-lost-business-value",
      "mitigation-in-employment-cases",
      "patent-damages-reasonable-royalty-explained",
      "personal-consumption-in-wrongful-death",
      "present-value-explained-for-attorneys",
      "tracing-commingled-funds",
      "trade-secret-damages-explained",
      "transfer-pricing-disputes-explained",
      "valuing-a-homemakers-services",
      "what-is-a-forensic-economist",
      "when-do-you-need-an-economic-expert",
      "wrongful-death-damages-explained",
    ]));
  it("comparisons", () =>
    expect(slugs(comparisons)).toEqual([
      "back-pay-vs-front-pay",
      "economist-vs-forensic-accountant-on-lost-profits",
      "economist-vs-life-care-planner",
      "fair-market-value-vs-fair-value",
      "fair-value-vs-fair-market-value-in-shareholder-disputes",
      "forensic-economist-vs-forensic-accountant",
      "forensic-economist-vs-vocational-expert",
      "lost-earnings-vs-earning-capacity-in-workers-compensation",
      "lost-earnings-vs-lost-earning-capacity",
      "lost-profits-vs-business-valuation",
      "lost-profits-vs-diminished-business-value",
      "lost-profits-vs-reasonable-royalty",
      "net-vs-gross-discount-rate",
      "plaintiff-economist-vs-defense-economist",
      "transfer-pricing-documentation-vs-expert-report",
    ]));
  it("knowledge, insights, white papers", () => {
    expect(slugs(knowledge)).toEqual(["expert-witness-testimony-guide", "guide-to-economic-damages"]);
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(slugs(insights)).toContain("components-of-an-economic-damages-report");
    expect(slugs(insights)).toContain("what-a-w-2-adds-to-a-lost-earnings-claim");
    expect(slugs(insights)).toContain("what-tax-returns-add-to-a-lost-earnings-claim");
    expect(slugs(insights)).toContain("what-pay-stubs-add-to-a-lost-earnings-claim");
    expect(slugs(insights)).toContain("what-union-contracts-add-to-a-lost-earnings-claim");
    expect(slugs(insights)).toContain("what-benefit-summaries-add-to-a-lost-earnings-claim");
    expect(slugs(insights)).toContain("what-intercompany-agreements-add-to-a-transfer-pricing-dispute");
    expect(slugs(insights)).toContain("what-license-agreements-add-to-an-ip-damages-claim");
    expect(slugs(whitePapers)).toEqual(["business-valuation-standards-in-litigation", "daubert-ready-economic-damages-report"]);
    expect(whitePapers.every((w) => w.discipline === "Economic")).toBe(true);
  });
  it("faqs are economics-framed", () => {
    expect(faqs.length).toBeGreaterThanOrEqual(8);
    const home = homepageFaqs("KW Economics", "KW Economics");
    expect(home.length).toBeGreaterThanOrEqual(5);
    const text = JSON.stringify([methods, guides, comparisons, knowledge, insights, whitePapers, faqs, home]);
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
    const bylines = [...methods, ...guides, ...comparisons, ...knowledge, ...insights, ...whitePapers]
      .map((x) => (x as { authorSlug?: string }).authorSlug)
      .filter((s): s is string => Boolean(s));
    for (const s of bylines) expect(ROSTER).toContain(s);
    // FAQBlock renders guide/method/comparison/knowledge FAQ answers as plain text.
    for (const x of [...methods, ...guides, ...comparisons, ...knowledge]) {
      for (const f of (x as { faqs?: { answer: string }[] }).faqs ?? []) {
        expect(f.answer, `${x.slug} faq`).not.toMatch(/\[\[/);
      }
    }
  });
});

describe("author and date signals on every editorial page", () => {
  it("methods, guides, comparisons, knowledge guides, and white papers all name an author and carry ISO dates", () => {
    const dated = [
      ...methods.map((m) => ({ page: `methods/${m.slug}`, ...m })),
      ...guides.map((g) => ({ page: `guides/${g.slug}`, ...g })),
      ...comparisons.map((c) => ({ page: `compare/${c.slug}`, ...c })),
      ...knowledge.map((k) => ({ page: `knowledge/${k.slug}`, ...k })),
      ...whitePapers.map((w) => ({ page: `white-papers/${w.slug}`, ...w })),
    ];
    // 15 methods, 27 guides, 15 comparisons, 2 knowledge guides, 2 white papers (waves 1 to 5 each added one, two,
    // and one; the transfer pricing batch of 2026-10-05 and the intellectual property batch of 2026-10-06 each
    // added one, two, and one).
    expect(dated.length).toBe(15 + 27 + 15 + 2 + 2);
    for (const x of dated) {
      expect(ROSTER, `${x.page} authorSlug`).toContain(x.authorSlug);
      expect(x.datePublished, `${x.page} datePublished`).toMatch(ISO_DATE);
      expect(x.dateModified, `${x.page} dateModified`).toMatch(ISO_DATE);
      expect((x.dateModified ?? "") >= (x.datePublished ?? ""), `${x.page} dateModified precedes datePublished`).toBe(true);
    }
  });
  it("insight posts name an author and carry ISO publish and modified dates", () => {
    for (const p of insights) {
      expect(ROSTER, `${p.slug} authorSlug`).toContain(p.authorSlug);
      expect(p.publishedDate, `${p.slug} publishedDate`).toMatch(ISO_DATE);
      expect(p.dateModified ?? p.publishedDate, `${p.slug} dateModified`).toMatch(ISO_DATE);
      expect((p.dateModified ?? p.publishedDate) >= p.publishedDate, `${p.slug} dates`).toBe(true);
    }
  });
});

describe("titles and meta descriptions are written for the SERP", () => {
  it("every editorial <title> is 40-60 characters with the brand suffix", () => {
    const titles = pageTitles();
    expect(titles.length).toBe(15 + 27 + 15 + 2 + 9 + 2);
    for (const { page, title } of titles) {
      expect(title.length, `${page}: "${title}" (${title.length})`).toBeLessThanOrEqual(60);
      expect(title.length, `${page}: "${title}" (${title.length})`).toBeGreaterThanOrEqual(40);
      expect(title.endsWith(` | ${ORG_NAME}`), `${page} brand suffix`).toBe(true);
      expect(title, `${page} duplicated word`).not.toMatch(/Methodology \| Methodology/);
    }
  });
  it("metaTitle, when set, is shorter than the H1 it stands in for", () => {
    for (const x of [...guides, ...comparisons, ...insights, ...whitePapers]) {
      if (x.metaTitle) expect(x.metaTitle.length, x.slug).toBeLessThan(x.title.length);
    }
    // The two knowledge guides carry the primary query the short H1 leaves out.
    for (const k of knowledge) expect(k.metaTitle?.length ?? 0, k.slug).toBeGreaterThan(k.title.length);
  });
  it("every meta description is a complete written sentence of 110-160 characters (no auto-cut, no markers)", () => {
    const descs = metaDescriptions();
    expect(descs.length).toBe(15 + 27 + 15 + 2 + 9 + 2);
    for (const { page, text } of descs) {
      expect(text.length, `${page} (${text.length})`).toBeLessThanOrEqual(160);
      expect(text.length, `${page} (${text.length})`).toBeGreaterThanOrEqual(110);
      expect(text, `${page} ends mid-sentence`).toMatch(/\.$/);
      expect(text, `${page} ellipsis`).not.toMatch(/…|\.\.\./);
      expect(text, `${page} link marker`).not.toMatch(/\[\[/);
      expect(text, `${page} html`).not.toMatch(/<[a-z]/);
    }
  });
  it("no meta description is the truncated opening of the page lead (the pre-fix pattern)", () => {
    for (const g of guides) expect(g.tldr.startsWith(g.metaDescription.slice(0, 60)), g.slug).toBe(false);
    for (const m of methods) expect(m.summary.startsWith(m.metaDescription.slice(0, 60)), m.slug).toBe(false);
    for (const c of comparisons) expect(c.overlap.startsWith(c.answer.slice(0, 60)), c.slug).toBe(false);
  });
});

describe("comparison answer blocks", () => {
  it("every comparison states the difference in one sentence that names both sides", () => {
    for (const c of comparisons) {
      expect(c.answer.length, c.slug).toBeLessThanOrEqual(160);
      // One sentence: a single terminal period (semicolons carry the contrast).
      expect(c.answer.match(/\./g)?.length, `${c.slug} sentence count`).toBe(1);
      // The answer names the two things being compared (a keyword from each label).
      const key = (label: string) => label.toLowerCase().split(" ").filter((w) => w.length > 3).pop() ?? "";
      expect(c.answer.toLowerCase(), `${c.slug} names ${c.a.label}`).toContain(key(c.a.label));
      expect(c.answer.toLowerCase(), `${c.slug} names ${c.b.label}`).toContain(key(c.b.label));
    }
  });
});

describe("FAQ pairs are owned by one page", () => {
  const owned = allFaqs();
  it("collects the guide, method, comparison, and knowledge FAQs", () => {
    expect(owned.length).toBeGreaterThan(80);
  });
  it("no two pages ask the same normalized question", () => {
    const seen = new Map<string, string>();
    for (const f of owned) {
      const q = [...tokens(f.question)].sort().join(" ");
      const prior = seen.get(q);
      expect(prior, `${f.page} repeats the question on ${prior}: ${f.question}`).toBeUndefined();
      seen.set(q, f.page);
    }
  });
  it(`no two answers on different pages overlap above ${FAQ_OVERLAP_CEILING} (Dice on unique tokens)`, () => {
    const offenders: string[] = [];
    for (let i = 0; i < owned.length; i++) {
      for (let j = i + 1; j < owned.length; j++) {
        if (owned[i].page === owned[j].page) continue;
        const score = overlap(owned[i].answer, owned[j].answer);
        if (score > FAQ_OVERLAP_CEILING) {
          offenders.push(`${score.toFixed(2)} ${owned[i].page} <> ${owned[j].page}: "${owned[i].question}" / "${owned[j].question}"`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
  it("the three guide/method pairs that were verbatim now answer with different mechanics", () => {
    const answer = (page: string, re: RegExp) => {
      const f = owned.find((x) => x.page === page && re.test(x.question));
      if (!f) throw new Error(`no FAQ matching ${re} on ${page}`);
      return f.answer;
    };
    const pairs: [string, RegExp, string, RegExp][] = [
      ["guides/how-lost-earnings-are-calculated", /before or after tax/, "methods/mitigation-and-offsets", /after-tax/],
      ["guides/household-services-in-personal-injury", /worked full time/, "methods/household-services-methodology", /employed full time/],
      ["guides/household-services-in-personal-injury", /hire someone/, "methods/household-services-methodology", /actually paid/],
    ];
    for (const [pa, qa, pb, qb] of pairs) {
      expect(overlap(answer(pa, qa), answer(pb, qb)), `${pa} vs ${pb}`).toBeLessThanOrEqual(FAQ_OVERLAP_CEILING);
    }
    expect(answer("methods/mitigation-and-offsets", /after-tax/)).toMatch(/^Where the venue requires after-tax figures, the economist computes tax/);
  });
});

describe("method pages link the services they support", () => {
  it("every relevantServices slug is a pillar service, at least three per method", () => {
    const pillars = new Set(pillarServices().map((s) => s.slug));
    for (const m of methods) {
      expect(m.relevantServices.length, m.slug).toBeGreaterThanOrEqual(3);
      for (const s of m.relevantServices) expect(pillars.has(s), `${m.slug} -> ${s}`).toBe(true);
    }
  });
});

describe("knowledge guides carry lift-able units", () => {
  it("each guide has key points, three or more FAQs, and a publish date", () => {
    for (const k of knowledge) {
      expect(k.keyPoints?.length ?? 0, `${k.slug} keyPoints`).toBeGreaterThanOrEqual(3);
      expect(k.faqs?.length ?? 0, `${k.slug} faqs`).toBeGreaterThanOrEqual(3);
      expect(k.datePublished, k.slug).toMatch(ISO_DATE);
      for (const p of k.keyPoints ?? []) expect(p, `${k.slug} key point`).not.toMatch(/\[\[|<[a-z]/);
    }
  });
});

describe("insight posts", () => {
  const knownRoutes = new Set([
    ...guides.map((g) => `/guides/${g.slug}`),
    ...methods.map((m) => `/methods/${m.slug}`),
    ...comparisons.map((c) => `/compare/${c.slug}`),
    ...knowledge.map((k) => `/knowledge/${k.slug}`),
    ...whitePapers.map((w) => `/white-papers/${w.slug}`),
    ...pillarServices().map((s) => `/services/${s.slug}`),
  ]);
  it("are split into H2 sections with unique fragment ids (six or more per post)", () => {
    for (const p of insights) {
      const headings = insightHeadings(p.content);
      expect(headings.length, p.slug).toBeGreaterThanOrEqual(6);
      const ids = headings.map((h) => h.id);
      expect(new Set(ids).size, `${p.slug} duplicate ids`).toBe(ids.length);
      for (const h of headings) {
        expect(h.id, p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(h.text, p.slug).not.toMatch(/\[\[|#/);
      }
      // The opener stays a paragraph, and no stray markdown marker survives in a paragraph.
      const blocks = insightBlocks(p.content);
      expect(blocks[0].type, `${p.slug} opener`).toBe("paragraph");
      for (const b of blocks) if (b.type === "paragraph") expect(b.text, p.slug).not.toMatch(/^#/);
    }
  });
  it("carry the specified section headings in order", () => {
    const byId = Object.fromEntries(insights.map((p) => [p.slug, insightHeadings(p.content).map((h) => h.text)]));
    expect(byId["components-of-an-economic-damages-report"]).toEqual([
      "Records reviewed and assumptions adopted",
      "The earnings base and projection",
      "The horizon: worklife and life expectancy",
      "Fringe benefits",
      "Post-event earnings and offsets",
      "Household services",
      "Present value",
      "Summary and sensitivity analysis",
      "Where the disputes actually are",
    ]);
    expect(byId["what-a-w-2-adds-to-a-lost-earnings-claim"]).toEqual([
      "The wage figure is three figures",
      "Deferrals show what the person chose to save",
      "The health coverage box hints at a benefit the form does not value",
      "Several years of forms make a history",
      "What the form cannot tell you",
      "Where the disputes start",
      "What to produce with it",
    ]);
    expect(byId["daubert-vs-frye-expert-testimony-standards"]).toEqual([
      "Two framework families",
      "The reliability framework",
      "The general-acceptance framework",
      "Why the discipline itself is rarely excluded",
      "The recurring grounds for challenge",
      "The report is the defense",
      "Hybrid and codified state rules",
    ]);
    expect(byId["what-intercompany-agreements-add-to-a-transfer-pricing-dispute"]).toEqual([
      "The parties and the transactions it covers",
      "The pricing clause and the year-end adjustment",
      "Risk allocation and the conduct that has to match it",
      "Intangibles: ownership, scope, and the royalty base",
      "Services, cost bases, and intercompany loans",
      "When the agreement was signed",
      "What the agreement cannot tell you",
      "Where the disputes start",
      "What to produce with it",
    ]);
    expect(byId["what-license-agreements-add-to-an-ip-damages-claim"]).toEqual([
      "The grant: rights, field, territory, and exclusivity",
      "The royalty terms: rate, base, and lump sums",
      "Portfolio, cross, and settlement licenses",
      "The date and the parties",
      "Licenses for trademarks, copyrights, and trade secrets",
      "What the license cannot tell you",
      "Where the disputes start",
      "What to produce with it",
    ]);
  });
  it("carry three curated related links that resolve to real editorial or service routes", () => {
    for (const p of insights) {
      expect(p.related?.length ?? 0, p.slug).toBeGreaterThanOrEqual(3);
      for (const r of p.related ?? []) {
        expect(knownRoutes.has(r.href), `${p.slug} -> ${r.href}`).toBe(true);
        expect(r.title.length, r.href).toBeGreaterThan(0);
      }
    }
  });
  it("getRelatedPosts never returns an empty sidebar and never returns the post itself", () => {
    for (const p of insights) {
      const rel = getRelatedPosts(p.slug, p.category);
      expect(rel.length, p.slug).toBeGreaterThanOrEqual(1);
      expect(rel.map((r) => r.slug), p.slug).not.toContain(p.slug);
    }
    // The Economics post has no category sibling, so the fallback is what
    // fills its block: the first three other posts, in file order. The seven
    // Records posts (waves 1 to 5, the transfer pricing batch of 2026-10-05,
    // and the intellectual property batch of 2026-10-06) are each other's
    // same-category match, in file order.
    expect(getRelatedPosts("components-of-an-economic-damages-report", "Economics").map((r) => r.slug)).toEqual([
      "daubert-vs-frye-expert-testimony-standards",
      "what-a-w-2-adds-to-a-lost-earnings-claim",
      "what-tax-returns-add-to-a-lost-earnings-claim",
    ]);
    expect(getRelatedPosts("what-a-w-2-adds-to-a-lost-earnings-claim", "Records").map((r) => r.slug)).toEqual([
      "what-tax-returns-add-to-a-lost-earnings-claim",
      "what-pay-stubs-add-to-a-lost-earnings-claim",
      "what-union-contracts-add-to-a-lost-earnings-claim",
      "what-benefit-summaries-add-to-a-lost-earnings-claim",
      "what-intercompany-agreements-add-to-a-transfer-pricing-dispute",
      "what-license-agreements-add-to-an-ip-damages-claim",
    ]);
    expect(getRelatedPosts("what-pay-stubs-add-to-a-lost-earnings-claim", "Records").map((r) => r.slug)).toEqual([
      "what-a-w-2-adds-to-a-lost-earnings-claim",
      "what-tax-returns-add-to-a-lost-earnings-claim",
      "what-union-contracts-add-to-a-lost-earnings-claim",
      "what-benefit-summaries-add-to-a-lost-earnings-claim",
      "what-intercompany-agreements-add-to-a-transfer-pricing-dispute",
      "what-license-agreements-add-to-an-ip-damages-claim",
    ]);
    expect(getRelatedPosts("what-union-contracts-add-to-a-lost-earnings-claim", "Records").map((r) => r.slug)).toEqual([
      "what-a-w-2-adds-to-a-lost-earnings-claim",
      "what-tax-returns-add-to-a-lost-earnings-claim",
      "what-pay-stubs-add-to-a-lost-earnings-claim",
      "what-benefit-summaries-add-to-a-lost-earnings-claim",
      "what-intercompany-agreements-add-to-a-transfer-pricing-dispute",
      "what-license-agreements-add-to-an-ip-damages-claim",
    ]);
    expect(getRelatedPosts("what-benefit-summaries-add-to-a-lost-earnings-claim", "Records").map((r) => r.slug)).toEqual([
      "what-a-w-2-adds-to-a-lost-earnings-claim",
      "what-tax-returns-add-to-a-lost-earnings-claim",
      "what-pay-stubs-add-to-a-lost-earnings-claim",
      "what-union-contracts-add-to-a-lost-earnings-claim",
      "what-intercompany-agreements-add-to-a-transfer-pricing-dispute",
      "what-license-agreements-add-to-an-ip-damages-claim",
    ]);
    expect(getRelatedPosts("what-intercompany-agreements-add-to-a-transfer-pricing-dispute", "Records").map((r) => r.slug)).toEqual([
      "what-a-w-2-adds-to-a-lost-earnings-claim",
      "what-tax-returns-add-to-a-lost-earnings-claim",
      "what-pay-stubs-add-to-a-lost-earnings-claim",
      "what-union-contracts-add-to-a-lost-earnings-claim",
      "what-benefit-summaries-add-to-a-lost-earnings-claim",
      "what-license-agreements-add-to-an-ip-damages-claim",
    ]);
    expect(getRelatedPosts("what-license-agreements-add-to-an-ip-damages-claim", "Records").map((r) => r.slug)).toEqual([
      "what-a-w-2-adds-to-a-lost-earnings-claim",
      "what-tax-returns-add-to-a-lost-earnings-claim",
      "what-pay-stubs-add-to-a-lost-earnings-claim",
      "what-union-contracts-add-to-a-lost-earnings-claim",
      "what-benefit-summaries-add-to-a-lost-earnings-claim",
      "what-intercompany-agreements-add-to-a-transfer-pricing-dispute",
    ]);
  });
  it("the admissibility post and its companion guide name Daubert and Frye", () => {
    const post = insights.find((p) => p.slug === "daubert-vs-frye-expert-testimony-standards")!;
    for (const field of [post.title, post.excerpt, post.content]) {
      expect(field).toMatch(/Daubert/);
      expect(field).toMatch(/Frye/);
    }
    expect(post.excerpt).toContain(
      "Neither framework routinely excludes forensic economic testimony; challenges target inputs the record does not support.",
    );
    const guide = guides.find((g) => g.slug === "federal-vs-state-court-daubert")!;
    const body = (guide.sections ?? []).map((s) => s.bodyHtml).join(" ");
    for (const field of [guide.title, guide.tldr, body]) {
      expect(field).toMatch(/Daubert/);
      expect(field).toMatch(/Frye/);
    }
  });
});

describe("formatPublishedDate", () => {
  const zones = ["UTC", "America/New_York", "America/Los_Angeles", "Pacific/Honolulu", "Pacific/Auckland"];
  it("renders the ISO calendar date in every timezone (no off-by-one west of Greenwich)", () => {
    const original = process.env.TZ;
    try {
      for (const tz of zones) {
        process.env.TZ = tz;
        expect(formatPublishedDate("2025-02-18"), tz).toBe("February 18, 2025");
        expect(formatPublishedDate("2026-08-27"), tz).toBe("August 27, 2026");
        expect(formatPublishedDate("2026-01-01"), tz).toBe("January 1, 2026");
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
  it("the bare Date(dateStr).toLocaleDateString pattern it replaces does shift the day west of UTC (control)", () => {
    const original = process.env.TZ;
    try {
      process.env.TZ = "America/Los_Angeles";
      const naive = new Date("2025-02-18").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      expect(naive).toBe("February 17, 2025");
      expect(formatPublishedDate("2025-02-18")).toBe("February 18, 2025");
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
});

// Review fixes (2026-10-05) to the transfer pricing editorial batch: each pin
// below holds a statement to the regulation it paraphrases (Treas. Reg.
// 1.482-1(c)(1) and (e)(2), 1.482-5(b)(4), 1.6662-6(b) and (d)) or to the
// procedure it describes, and keeps every source a statement leans on in the
// entry's References block.
describe("transfer pricing editorial: statements match the rules they describe", () => {
  const method = methods.find((m) => m.slug === "transfer-pricing-methods")!;
  const disputes = guides.find((g) => g.slug === "transfer-pricing-disputes-explained")!;
  const royalty = guides.find((g) => g.slug === "intercompany-royalty-rates-in-litigation")!;
  const comparison = comparisons.find((c) => c.slug === "transfer-pricing-documentation-vs-expert-report")!;
  const disputesText = JSON.stringify(disputes);

  it("the best method rule: no method must first be shown inapplicable; the rejected-alternatives duty belongs to the penalty documentation", () => {
    const faq = method.faqs.find((f) => f.question === "What is the best method rule in transfer pricing?")!;
    expect(faq.answer).toContain("A method may be applied without first showing that the others are inapplicable, but a method later shown to be more reliable must be used.");
    expect(faq.answer).toContain("Describing the alternatives considered and why they were rejected is a requirement of the penalty documentation");
    expect(faq.answer).not.toMatch(/has to explain why the other methods were not used/);
  });

  it("the arm's length range comes from equally reliable comparables, and inexact comparables narrow it", () => {
    expect(method.summary).toContain("where several comparables are equally reliable the result is a range, narrowed to the interquartile range when the comparables are inexact");
    expect(method.summary).not.toMatch(/where the comparables are inexact the result is a range/);
    const faq = (disputes.faqs ?? []).find((f) => /arm's length standard require/.test(f.question))!;
    expect(faq.answer).toContain("expressed as a range, narrowed by a statistical method when the comparables are inexact");
  });

  it("a tested party belongs to the one-sided methods; the profit split has none", () => {
    const step = method.steps.find((s) => /select the tested party/.test(s))!;
    expect(step).toMatch(/^For a one-sided method \(the comparable profits method or its OECD counterpart, the transactional net margin method, and the resale price or cost plus method\)/);
    expect(step).toContain("the profit split has no tested party");
    expect(disputesText).toContain("where a one-sided method such as the comparable profits method applies");
    expect(disputesText).not.toContain("where a profit-based method applies");
  });

  it("the multi-year rule applies to the comparables' results", () => {
    expect(disputesText).toContain(
      "The years: comparables' results drawn from a single year, where the regulations generally call for at least the year under review and the two years before it",
    );
    expect(disputesText).not.toContain("a single year tested under the comparable profits method");
  });

  it("the disputes guide cites the documentation guidance, the penalty regulation, and the comparable profits regulation it leans on", () => {
    const urls = (disputes.sources ?? []).map((s) => s.url);
    for (const url of [
      "https://www.irs.gov/businesses/international-businesses/transfer-pricing-documentation-best-practices-frequently-asked-questions-faqs",
      "https://www.ecfr.gov/current/title-26/section-1.6662-6",
      "https://www.ecfr.gov/current/title-26/section-1.482-5",
    ]) {
      expect(urls, url).toContain(url);
    }
  });

  it("the royalty guide's snippet gives the licensee its routine return, not the residual profit", () => {
    expect(royalty.metaDescription).toContain("the licensee's routine return");
    expect(royalty.metaDescription).not.toContain("residual profit");
    expect(royalty.metaDescription.length).toBeGreaterThanOrEqual(140);
    expect(royalty.metaDescription.length).toBeLessThanOrEqual(160);
  });

  it("the expert report is the instrument in contract arbitration; treaty arbitration decides between the competent authorities", () => {
    expect(comparison.whenUseB).toContain("an arbitration under a contract,");
    expect(comparison.whenUseB).not.toContain("an arbitration under a treaty or a contract");
    expect(comparison.whenUseB).toContain("the taxpayer's analysis reaches the panel through the U.S. competent authority, to the extent the treaty permits, rather than through testimony");
    for (const url of ["https://www.irs.gov/businesses/overview-of-the-map-process", "https://www.irs.gov/irb/2015-35_IRB#RP-2015-40"]) {
      expect(comparison.sources.map((s) => s.url), url).toContain(url);
    }
  });

  it("the site FAQ keeps the arm's length work apart from the damages analyses", () => {
    const faq = faqs.find((f) => f.question === "What types of matters does a forensic economist handle?")!;
    expect(faq.answer).toContain("matters, and arm's length analyses are prepared for [[/case-types/tax-and-transfer-pricing-dispute|tax and transfer pricing disputes]]");
    expect(faq.answer).not.toMatch(/matters; and \[\[\/case-types\/tax/);
  });
});

// Intellectual property batch (2026-10-06): each pin below holds a statement to
// the statute or decision it paraphrases (35 U.S.C. 284, 286, 287, and 289; 28
// U.S.C. 1338(a) and 1295(a)(1); 18 U.S.C. 1836 and 1838; the Uniform Trade
// Secrets Act and its comments; Panduit, Mor-Flo, Rite-Hite, Grain Processing,
// Georgia-Pacific, Lucent, Uniloc, LaserDynamics, the 2025 en banc EcoFactor
// decision, Aro, Samsung v. Apple, Halo, Romag, Dewberry, and On Davis), keeps
// every source a statement leans on in the entry's References block, and holds
// the batch to the house rules the transfer pricing review enforced: forums
// framed federal first, both sides named, no person, figure, or outcome.
describe("intellectual property editorial: statements match the rules they describe", () => {
  const patent = guides.find((g) => g.slug === "patent-damages-reasonable-royalty-explained")!;
  const secrets = guides.find((g) => g.slug === "trade-secret-damages-explained")!;
  const method = methods.find((m) => m.slug === "reasonable-royalty-analysis")!;
  const comparison = comparisons.find((c) => c.slug === "lost-profits-vs-reasonable-royalty")!;
  const post = insights.find((p) => p.slug === "what-license-agreements-add-to-an-ip-damages-claim")!;
  // Prose only: the byline slug is the one place a person's name may appear.
  const prose = (x: unknown) => JSON.stringify(x, (key, value) => (key === "authorSlug" ? undefined : value));
  const cites = (sources: { url: string }[] | undefined, ids: string[]) => {
    const urls = (sources ?? []).map((s) => s.url);
    for (const id of ids) expect(urls, id).toContain(REFERENCES[id].url);
  };

  it("every page in the batch carries a meta description of 140 to 160 characters", () => {
    for (const d of [patent.metaDescription, secrets.metaDescription, method.metaDescription, comparison.answer, post.metaDescription]) {
      expect(d.length, d).toBeGreaterThanOrEqual(140);
      expect(d.length, d).toBeLessThanOrEqual(160);
    }
    // The methods template appends " Method" unless the name ends in "Methodology".
    expect(method.name).toBe("Reasonable Royalty Methodology");
  });

  it("frames the forums federal first: patent and copyright claims in the federal courts, patent appeals in the Federal Circuit, trade secret claims in either system", () => {
    const forum = patent.sections!.find((s) => s.id === "where-patent-cases-are-heard")!.bodyHtml;
    expect(forum).toContain(
      "the federal district courts have exclusive jurisdiction over it: no court of any state, the District of Columbia, or a territory may hear a claim for relief arising under the patent laws, and the same is true of copyright claims",
    );
    expect(forum).toContain("Appeals go to the U.S. Court of Appeals for the Federal Circuit rather than to the regional circuit that covers the district");
    expect(forum).toContain("usually a contract claim governed by state law, which a state court can hear");
    cites(patent.sources, ["JURISDICTION_1338", "FEDERAL_CIRCUIT_1295"]);
    const tsForum = secrets.sections!.find((s) => s.id === "where-claims-are-heard")!.bodyHtml;
    expect(tsForum).toContain("the federal district courts have original jurisdiction of those claims");
    expect(tsForum).toContain("The federal statute does not preempt or displace state law");
    expect(tsForum).toContain("goes to the Federal Circuit only when the case also includes a claim or compulsory counterclaim arising under the patent laws");
    // Enactment counts change; the copy says "most states" and names no number.
    expect(tsForum).not.toMatch(/\d+ states|forty|fifty/i);
    cites(secrets.sources, ["DTSA_1836", "DTSA_1838", "UNIFORM_TRADE_SECRETS_ACT", "FEDERAL_CIRCUIT_1295"]);
  });

  it("the patent damages period: six years, marking and notice, and a negotiation dated when the infringement began", () => {
    const t = prose(patent);
    expect(t).toContain("No recovery is had for infringement committed more than six years before the complaint or counterclaim for infringement was filed");
    expect(t).toContain("filing the lawsuit is itself notice");
    expect(t).toContain("the six-year limit and the marking rule restrict what is recoverable without moving the date on which the license would have been agreed");
    cites(patent.sources, ["PATENT_284", "PATENT_286", "PATENT_287", "LASERDYNAMICS"]);
  });

  it("lost profits: the Panduit factors, the market share approach, available alternatives, and the functional unit", () => {
    const t = prose(patent);
    expect(t).toContain("four factors from the Panduit decision");
    expect(t).toContain("the Federal Circuit has accepted a market share approach");
    expect(t).toContain("counts against the claim even if it was not on the market during the infringement, provided it was available");
    expect(t).toContain("count only if they function together with it as a unit");
    cites(patent.sources, ["PANDUIT", "STATE_INDUSTRIES_MOR_FLO", "GRAIN_PROCESSING", "RITE_HITE", "ARO_MANUFACTURING"]);
    cites(comparison.sources, ["PANDUIT", "STATE_INDUSTRIES_MOR_FLO", "GRAIN_PROCESSING", "RITE_HITE"]);
  });

  it("the reasonable royalty: Georgia-Pacific, validity and infringement assumed, apportionment, and the rejected rule of thumb", () => {
    const t = prose(patent);
    expect(t).toContain("the list of fifteen factors from the Georgia-Pacific decision");
    expect(t).toContain("The parties are assumed to know that the patent is valid and infringed");
    expect(t).toContain("the royalty is generally built on the smallest salable unit that practices the patent");
    expect(t).toContain("applies when the patented feature drives the demand for the whole product");
    // The 25 percent rule appears only as the rule the Federal Circuit rejected.
    expect(t).toContain("the 25 percent rule of thumb, which assigned the patentee a fixed share of the infringer's expected profit, is a fundamentally flawed tool");
    expect(method.limitations).toContain("the Federal Circuit rejected the 25 percent rule of thumb as a starting point");
    for (const x of [patent, secrets, method, comparison, post]) {
      for (const m of prose(x).matchAll(/[^.]*25 percent[^.]*\./g)) expect(m[0], x.slug).toMatch(/Federal Circuit/);
    }
    cites(patent.sources, ["GEORGIA_PACIFIC", "LUCENT_GATEWAY", "UNILOC", "LASERDYNAMICS"]);
    cites(method.sources, ["PATENT_284", "GEORGIA_PACIFIC", "LUCENT_GATEWAY", "UNILOC", "LASERDYNAMICS", "GRAIN_PROCESSING"]);
  });

  it("comparable licenses: the 2025 en banc decision and Rule 702 travel with the sources they rest on", () => {
    expect(prose(patent)).toContain("Sitting en banc in 2025, the Federal Circuit held that a damages expert's testimony that earlier lump-sum licenses reflected an agreed per-unit rate was not based on sufficient facts or data");
    expect(post.content).toContain("Sitting en banc in 2025, the court also held");
    expect(method.admissibilityHistory).toContain("which requires the proponent to show the court that each admissibility requirement is more likely than not met");
    cites(patent.sources, ["ECOFACTOR_GOOGLE", "FRE_702"]);
    cites(post.sources, ["ECOFACTOR_GOOGLE", "LASERDYNAMICS", "LUCENT_GATEWAY", "GEORGIA_PACIFIC"]);
    cites(method.sources, ["ECOFACTOR_GOOGLE", "FRE_702"]);
  });

  it("design patents and enhancement: total profit on the article of manufacture; enhancement is the court's sanction, not the economic measure", () => {
    const t = prose(patent);
    expect(t).toContain("in a multi-component product the article can be the end product sold to the consumer or a component of it");
    expect(t).toContain("generally reserved for egregious infringement behavior, decided by the court and separate from the economic measure of the loss");
    cites(patent.sources, ["PATENT_289", "SAMSUNG_V_APPLE", "HALO_ELECTRONICS"]);
  });

  it("trade secret measures: non-overlapping loss and enrichment or a royalty in their place, the head start, and exemplary damages for the court", () => {
    const t = prose(secrets);
    expect(secrets.tldr).toContain("to the extent the two do not overlap, or, in place of both, a reasonable royalty");
    expect(t).toContain("plus any additional period in which the misappropriator kept an advantage over good-faith competitors because of the misappropriation");
    expect(t).toContain("the court may award exemplary damages of up to twice the compensatory award");
    expect(t).toContain("Reverse engineering and independent derivation are not improper means");
    cites(secrets.sources, ["DTSA_1839", "USPTO_TRADE_SECRET_POLICY", "GEORGIA_PACIFIC"]);
    cites(comparison.sources, ["DTSA_1836", "UNIFORM_TRADE_SECRETS_ACT"]);
  });

  it("trademark and copyright statements rest on the statutes and the decisions they describe", () => {
    expect(post.content).toContain("the Supreme Court has held that willfulness is not a precondition to a profits award");
    expect(post.content).toContain("only the named defendant's profits can be awarded, not those of affiliates that are not parties");
    expect(post.content).toContain("the Second Circuit has held that the fair market value of a license covering the infringing use can be the owner's actual damages in appropriate circumstances");
    cites(post.sources, ["LANHAM_ACT_1117", "ROMAG_FASTENERS", "DEWBERRY_GROUP", "COPYRIGHT_504", "ON_DAVIS_V_GAP", "DTSA_1836"]);
    expect(method.whenUsed).toContain("with a license fee entering a trademark case as evidence of the damages rather than as a measure of its own");
    cites(method.sources, ["COPYRIGHT_504", "ON_DAVIS_V_GAP", "LANHAM_ACT_1117", "DTSA_1836", "UNIFORM_TRADE_SECRETS_ACT"]);
  });

  it("names both sides, no team member, and no figure, award, or outcome", () => {
    expect(prose(patent)).toContain("the work follows the same sequence for the patentee and for the accused infringer");
    expect(prose(secrets)).toContain("for whichever side retains the expert, the owner or the party accused of taking the information");
    for (const x of [patent, secrets, method, comparison, post]) {
      const t = prose(x);
      expect(t, x.slug).not.toMatch(/Skerritt|Sperling|Kumah/);
      expect(t, x.slug).not.toMatch(/\$\d|\d+(\.\d+)?\s?%|\bmillion\b|\bbillion\b|\bverdict\b/i);
      expect(t, x.slug).not.toMatch(/\b(we|our) (have )?(testified|been retained|won)\b/i);
    }
  });

  it("the intercompany royalty guide links the patent damages guide where it contrasts the two royalties", () => {
    const royalty = guides.find((g) => g.slug === "intercompany-royalty-rates-in-litigation")!;
    const body = royalty.sections!.map((s) => s.bodyHtml).join(" ");
    expect(body).toContain('A <a href="/guides/patent-damages-reasonable-royalty-explained">reasonable royalty for patent infringement</a> is a different measure');
  });
});
