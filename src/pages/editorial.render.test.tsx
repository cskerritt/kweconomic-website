import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PillarGuide from "./templates/PillarGuide";
import MethodologyExplainer from "./templates/MethodologyExplainer";
import Comparison from "./templates/Comparison";
import KnowledgeArticle from "./KnowledgeArticle";
import InsightPost from "./InsightPost";
import WhitePaper from "./WhitePaper";
import { guides } from "@/data/guides";
import { methods } from "@/data/methods";
import { comparisons } from "@/data/comparisons";
import { knowledgeGuides } from "@/data/knowledge";
import { insightPosts, insightHeadings } from "@/data/insights";
import { whitePapers } from "@/data/whitePapers";
import { getServiceBySlug } from "@/data/services";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

// Server renders of the six editorial page types (guides, methods,
// comparisons, knowledge guides, insight posts, white papers). usePageMeta
// does not run under renderToStaticMarkup, so this covers the synchronous
// body and the JSON-LD; the <title>/description fields are pinned from the
// data side in src/data/editorial.test.ts.
function render(path: string, routePath: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page) })),
    ),
  );
}

const here = dirname(fileURLToPath(import.meta.url));
const withoutJsonLd = (html: string) => html.replace(/<script type="application\/ld\+json">[^]*?<\/script>/g, "");
type Node = Record<string, unknown>;
const graphNodes = (html: string): Node[] =>
  [...html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)].flatMap((m) => {
    const parsed = JSON.parse(m[1]) as { "@graph"?: Node[] };
    return parsed["@graph"] ?? [parsed];
  });
const articleNode = (html: string): Node => {
  const node = graphNodes(html).find((n) => n["@type"] === "Article" || n["@type"] === "BlogPosting");
  if (!node) throw new Error("no Article/BlogPosting node");
  return node;
};

const BYLINE = "By </span><a";
const AUTHOR = "Christopher Skerritt, M.Ed., MBA, Chief of Economic Services";
// The rehabilitation-counseling, life-care-plan, and set-aside designations
// never appear on an economics byline (src/pages/off-brand-copy.test.mjs bans
// the middle one from rendered copy; team.ts is carved out, which is exactly
// how the old byline leaked it).
const NON_ECONOMICS_CREDENTIALS = /\b(CRC|CLCP|MSCC)\b/;
const VOCAB = /life care planner|vocational expert|vocational evaluation|transferable skills|labor market survey|CLCP|CNLCP/i;
const SISTER_COMPARISONS = new Set(["forensic-economist-vs-vocational-expert", "economist-vs-life-care-planner"]);

type Rendered = { page: string; slug: string; html: string; datePublished: string; dateModified: string };
const pages: Rendered[] = [
  ...guides.map((g) => ({ page: "guides", slug: g.slug, html: render(`/guides/${g.slug}`, "/guides/:slug", PillarGuide), datePublished: g.datePublished, dateModified: g.dateModified })),
  ...methods.map((m) => ({ page: "methods", slug: m.slug, html: render(`/methods/${m.slug}`, "/methods/:slug", MethodologyExplainer), datePublished: m.datePublished, dateModified: m.dateModified })),
  ...comparisons.map((c) => ({ page: "compare", slug: c.slug, html: render(`/compare/${c.slug}`, "/compare/:slug", Comparison), datePublished: c.datePublished, dateModified: c.dateModified })),
  ...knowledgeGuides.map((k) => ({ page: "knowledge", slug: k.slug, html: render(`/knowledge/${k.slug}`, "/knowledge/:slug", KnowledgeArticle), datePublished: k.datePublished!, dateModified: k.dateModified! })),
  ...insightPosts.map((p) => ({ page: "insights", slug: p.slug, html: render(`/insights/${p.slug}`, "/insights/:slug", InsightPost), datePublished: p.publishedDate, dateModified: p.dateModified ?? p.publishedDate })),
  ...whitePapers.map((w) => ({ page: "white-papers", slug: w.slug, html: render(`/white-papers/${w.slug}`, "/white-papers/:slug", WhitePaper), datePublished: w.datePublished, dateModified: w.dateModified })),
];

describe("every editorial page (40 renders across six templates)", () => {
  it("renders all 40 pages", () => {
    // 15 guides, 9 comparisons, 9 methods, 2 knowledge guides, 3 insight posts, 2 white papers.
    expect(pages.length).toBe(15 + 9 + 9 + 2 + 3 + 2);
    for (const p of pages) expect(p.html.length, `${p.page}/${p.slug}`).toBeGreaterThan(2000);
  });

  it("carries a named author byline with the job title, no non-economics credentials, and machine-readable dates", () => {
    for (const p of pages) {
      const label = `${p.page}/${p.slug}`;
      const body = withoutJsonLd(p.html);
      expect(body, label).toContain(BYLINE);
      // react-router appends data-discover to the anchor; React keeps the
      // camelCase dateTime attribute name in static markup.
      expect(body, label).toMatch(new RegExp(`href="/team/christopher-skerritt"[^>]*>${AUTHOR.replace(/\./g, "\\.")}</a>`));
      expect(body, label).not.toContain("Reviewed by");
      expect(body, label).not.toContain("Editorial Team");
      expect(body, label).not.toMatch(NON_ECONOMICS_CREDENTIALS);
      expect(body, label).toContain(`<span> · Published </span><time dateTime="${p.datePublished}">${p.datePublished}</time>`);
      if (p.dateModified !== p.datePublished) {
        expect(body, label).toContain(`<span> · Reviewed </span><time dateTime="${p.dateModified}">${p.dateModified}</time>`);
      } else {
        // ("Peer-Reviewed" is a sources-block type label, hence the middle dot.)
        expect(body, label).not.toContain("· Reviewed");
      }
    }
  });

  it("emits an Article node with the same person as author, both dates, and a speakable spec for the H1 and the lead", () => {
    for (const p of pages) {
      const label = `${p.page}/${p.slug}`;
      const node = articleNode(p.html);
      expect((node.author as { "@id": string })["@id"], label).toMatch(/\/team\/christopher-skerritt#person$/);
      expect(node.datePublished, label).toBe(p.datePublished);
      expect(node.dateModified, label).toBe(p.dateModified);
      expect(node.speakable, label).toEqual({ "@type": "SpeakableSpecification", cssSelector: ["h1", ".kw-lead"] });
      // Exactly one lead paragraph carries the speakable hook.
      expect(p.html.match(/class="kw-lead/g)?.length, label).toBe(1);
      expect(p.html.match(/<h1[\s>]/g)?.length, label).toBe(1);
    }
  });

  it("stays on brand: no dashes, no sister-brand form outside the JSON-LD, no sister-discipline vocabulary outside the two comparisons", () => {
    // The prev/next pagination labels are the neighboring entries' titles, so
    // the two sister-discipline comparison titles surface on the adjacent
    // comparison pages through that nav alone; the body copy is what this
    // guard measures.
    const withoutPagination = (html: string) => html.replace(/<nav aria-label="Pagination"[^]*?<\/nav>/g, "");
    for (const p of pages) {
      const label = `${p.page}/${p.slug}`;
      expect(p.html, label).not.toMatch(/[\u2013\u2014\u00a7]/);
      expect(withoutJsonLd(p.html), label).not.toMatch(LEGACY_BRAND_PATTERN);
      if (!SISTER_COMPARISONS.has(p.slug)) expect(withoutPagination(withoutJsonLd(p.html)), label).not.toMatch(VOCAB);
    }
  });
});

describe("comparison pages answer first", () => {
  for (const c of comparisons) {
    it(`/compare/${c.slug}: the one-sentence answer precedes the cards and the table, which is captioned with column and row scopes`, () => {
      const html = pages.find((p) => p.page === "compare" && p.slug === c.slug)!.html;
      const lead = html.indexOf('class="kw-lead');
      const h1 = html.indexOf("<h1");
      const firstCard = html.indexOf(`Learn more about ${c.a.label}`);
      const table = html.indexOf("<table");
      expect(lead, "lead present").toBeGreaterThan(h1);
      expect(lead, "lead before the definition cards").toBeLessThan(firstCard);
      expect(lead, "lead before the table").toBeLessThan(table);
      // Static markup escapes apostrophes; compare on the escaped form.
      const escaped = c.answer.replace(/'/g, "&#x27;");
      expect(html).toContain(`>${escaped}</p>`);
      expect(html).toContain(`<caption class="sr-only">${c.a.label} compared with ${c.b.label}, by dimension</caption>`);
      expect(html.match(/scope="col"/g)?.length).toBe(3);
      expect(html.match(/scope="row"/g)?.length).toBe(c.rows.length);
      expect(articleNode(html).description).toBe(c.answer);
    });
  }
});

describe("method pages link the pillar services they support", () => {
  for (const m of methods) {
    it(`/methods/${m.slug}: a related-services block with a descriptive anchor per relevantServices slug`, () => {
      const html = pages.find((p) => p.page === "methods" && p.slug === m.slug)!.html;
      expect(html).toContain("Services that use this method");
      for (const slug of m.relevantServices) {
        const service = getServiceBySlug(slug)!;
        expect(html).toContain(`href="/services/${slug}"`);
        expect(html).toContain(`<div class="font-semibold text-navy">${service.name}</div>`);
      }
      // HowTo and FAQPage still ride along with the Article.
      const types = graphNodes(html).map((n) => n["@type"]);
      expect(types).toEqual(expect.arrayContaining(["Article", "HowTo", "FAQPage", "BreadcrumbList"]));
    });
  }
});

describe("knowledge guides expose extractable units", () => {
  for (const k of knowledgeGuides) {
    it(`/knowledge/${k.slug}: key points, fragment-link contents, FAQ block with FAQPage schema`, () => {
      const html = pages.find((p) => p.page === "knowledge" && p.slug === k.slug)!.html;
      expect(html).toContain("Key points");
      for (const point of k.keyPoints ?? []) expect(html).toContain(`<li>${point.replace(/'/g, "&#x27;")}</li>`);
      // Contents are anchors, not buttons, so the sections are addressable without JavaScript.
      expect(html).not.toContain("<button");
      k.sections.forEach((s, idx) => {
        expect(html).toContain(`href="#section-${idx}"`);
        expect(html).toContain(`id="section-${idx}"`);
        expect(html).toContain(s.heading);
      });
      expect(html).toContain("Frequently Asked Questions");
      for (const f of k.faqs ?? []) expect(html).toContain(`<summary class="cursor-pointer font-semibold text-navy">${f.question.replace(/'/g, "&#x27;")}</summary>`);
      const faq = graphNodes(html).find((n) => n["@type"] === "FAQPage") as { mainEntity: unknown[] } | undefined;
      expect(faq, "FAQPage node").toBeDefined();
      expect(faq!.mainEntity.length).toBe(k.faqs?.length);
    });
  }
});

describe("insight posts are sectioned, dated, and cross-linked", () => {
  for (const post of insightPosts) {
    it(`/insights/${post.slug}: H2 per section with matching contents links, a <time> for the publish date, related reading, and a populated sidebar`, () => {
      const html = pages.find((p) => p.page === "insights" && p.slug === post.slug)!.html;
      const headings = insightHeadings(post.content);
      expect(headings.length).toBeGreaterThanOrEqual(6);
      for (const h of headings) {
        expect(html).toContain(`id="${h.id}"`);
        expect(html).toContain(`href="#${h.id}"`);
        expect(html).toMatch(new RegExp(`<h2[^>]*id="${h.id}"[^>]*>${h.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h2>`));
      }
      expect(html).toContain("In This Article");
      expect(html).toContain(`<time dateTime="${post.publishedDate}" class="text-sm text-neutral-500 font-mono">`);
      // The hero prints the ISO calendar date, not the local-zone rendering of UTC midnight.
      const iso = new Date(`${post.publishedDate}T00:00:00Z`);
      const expected = iso.toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });
      expect(html).toContain(`>${expected}</time>`);
      expect(html).toContain("Related reading");
      for (const r of post.related ?? []) expect(html).toContain(`href="${r.href}"`);
      // The sidebar falls back to the other post when no post shares the category.
      expect(html).toContain("Related Articles");
      for (const other of insightPosts.filter((p) => p.slug !== post.slug)) {
        expect(html).toContain(`href="/insights/${other.slug}"`);
      }
      // Body prose keeps its inline links.
      expect(html).toMatch(/href="\/methods\/[a-z-]+"/);
    });
  }

  it("the admissibility post names Daubert and Frye in the H1 and the body", () => {
    const html = pages.find((p) => p.page === "insights" && p.slug === "daubert-vs-frye-expert-testimony-standards")!.html;
    expect(html).toMatch(/<h1[^>]*>Daubert vs\. Frye: /);
    expect(withoutJsonLd(html).match(/Daubert/g)!.length).toBeGreaterThanOrEqual(4);
    expect(withoutJsonLd(html).match(/Frye/g)!.length).toBeGreaterThanOrEqual(3);
  });
});

describe("white papers", () => {
  for (const w of whitePapers) {
    it(`/white-papers/${w.slug}: byline above the abstract, the abstract is the speakable lead, teaser section open`, () => {
      const html = pages.find((p) => p.page === "white-papers" && p.slug === w.slug)!.html;
      const byline = html.indexOf(BYLINE);
      const abstract = html.indexOf(">Abstract</h2>");
      expect(byline).toBeGreaterThan(-1);
      expect(byline).toBeLessThan(abstract);
      expect(html).toContain('<p class="kw-lead text-neutral-700 leading-relaxed">');
      expect(html).toContain(w.sections[0].heading);
    });
  }

  it("the gate's error copy dials the brand phone constant, and its storage key names no sister brand", () => {
    const src = readFileSync(join(here, "../components/WhitePaperGate.tsx"), "utf8");
    expect(src).toContain("telHref(ORG_PHONE)");
    expect(src).toContain("{ORG_PHONE_DISPLAY}");
    expect(src).not.toMatch(/343-0700/);
    expect(src).not.toMatch(/kwvrs/i);
  });
});

describe("the templates wire the data fields the meta tests measure", () => {
  const src = (rel: string) => readFileSync(join(here, rel), "utf8");
  it("guides: metaTitle fallback and metaDescription", () => {
    const s = src("templates/PillarGuide.tsx");
    expect(s).toContain("title: `${guide.metaTitle ?? guide.title} | ${ORG_NAME}`");
    expect(s).toContain("description: guide.metaDescription");
  });
  it("methods: the Method suffix pattern (to be mirrored by scripts/prerender.mjs) and metaDescription", () => {
    const s = src("templates/MethodologyExplainer.tsx");
    expect(s).toContain('title: `${m.name.endsWith("Methodology") ? m.name : `${m.name} Method`} | ${ORG_NAME}`');
    expect(s).toContain("description: m.metaDescription");
  });
  it("comparisons: metaTitle fallback and the answer as description", () => {
    const s = src("templates/Comparison.tsx");
    expect(s).toContain("title: `${c.metaTitle ?? c.title} | ${ORG_NAME}`");
    expect(s).toContain("description: c.answer");
  });
  it("knowledge, insights, white papers: metaTitle fallback and metaDescription", () => {
    expect(src("KnowledgeArticle.tsx")).toContain("title: `${guide.metaTitle ?? guide.title} | ${ORG_NAME}`");
    expect(src("KnowledgeArticle.tsx")).toContain("description: guide.metaDescription");
    expect(src("InsightPost.tsx")).toContain("title: `${post.metaTitle ?? post.title} | ${ORG_NAME}`");
    expect(src("InsightPost.tsx")).toContain("description: post.metaDescription");
    expect(src("WhitePaper.tsx")).toContain("title: `${paper.metaTitle ?? paper.title} | White Paper | ${ORG_NAME}`");
    expect(src("WhitePaper.tsx")).toContain("description: paper.metaDescription");
  });
});
