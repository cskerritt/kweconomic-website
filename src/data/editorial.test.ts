import { describe, expect, it } from "vitest";
import { methods } from "./methods";
import { guides } from "./guides";
import { comparisons } from "./comparisons";
import { knowledgeGuides as knowledge } from "./knowledge";
import { insightPosts as insights, formatPublishedDate, getRelatedPosts, insightBlocks, insightHeadings } from "./insights";
import { whitePapers } from "./whitePapers";
import { pillarServices } from "./services";
import { faqs } from "./faqs";
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
      "business-valuation-approaches",
      "fringe-benefits-valuation",
      "household-services-methodology",
      "lost-profits-but-for-analysis",
      "mitigation-and-offsets",
      "personal-consumption-tables",
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
      "fringe-benefits-in-a-lost-earnings-claim",
      "household-services-in-personal-injury",
      "how-lost-earnings-are-calculated",
      "how-to-rebut-an-economic-damages-report",
      "how-worklife-expectancy-is-chosen",
      "income-determination-in-divorce",
      "lost-profits-vs-lost-business-value",
      "present-value-explained-for-attorneys",
      "what-is-a-forensic-economist",
      "when-do-you-need-an-economic-expert",
      "wrongful-death-damages-explained",
    ]));
  it("comparisons", () =>
    expect(slugs(comparisons)).toEqual([
      "back-pay-vs-front-pay",
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
    expect(insights.length).toBeGreaterThanOrEqual(3);
    expect(slugs(insights)).toContain("components-of-an-economic-damages-report");
    expect(slugs(insights)).toContain("what-a-w-2-adds-to-a-lost-earnings-claim");
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
    // 9 methods, 15 guides, 9 comparisons, 2 knowledge guides, 2 white papers (wave 1 added one, two, and one).
    expect(dated.length).toBe(9 + 15 + 9 + 2 + 2);
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
    expect(titles.length).toBe(9 + 15 + 9 + 2 + 3 + 2);
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
    expect(descs.length).toBe(9 + 15 + 9 + 2 + 3 + 2);
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
    // The three posts sit in different categories (Legal, Economics, Records),
    // so the fallback is what fills the block: the other posts, in file order.
    expect(getRelatedPosts("components-of-an-economic-damages-report", "Economics").map((r) => r.slug)).toEqual([
      "daubert-vs-frye-expert-testimony-standards",
      "what-a-w-2-adds-to-a-lost-earnings-claim",
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
