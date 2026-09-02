import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import JourneyStage from "./templates/JourneyStage";
import JourneyStageIndex from "./templates/JourneyStageIndex";
import AttorneysHubPage from "./hubs/AttorneysHubPage";
import { journeys, getJourney } from "@/data/journeys";
import { caseTypes, getCaseType } from "@/data/caseTypes";
import { guides } from "@/data/guides";
import { pillarServices } from "@/data/services";
import { ATTORNEY_STAGES, STAGE_GUIDES, journeyHeading, stageIndexHeading } from "@/lib/attorney-stages";
import { LEGACY_BRAND_PATTERN, ORG_PHONE, telHref } from "@/lib/brand";

// Server renders of the attorney journey family (/attorneys, /attorneys/<stage>,
// /attorneys/<stage>/<case-type>). usePageMeta does not run under
// renderToStaticMarkup, so the <title>/description pair is pinned by
// src/data/journeys.test.ts through the shared stage module; this file covers
// the synchronous body and the JSON-LD.
function render(path: string, routePath: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page) })),
    ),
  );
}

// React escapes text nodes; mirror it so heading strings can be matched verbatim.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const withoutJsonLd = (html: string) => html.replace(/<script type="application\/ld\+json">[^]*?<\/script>/g, "");
type Node = Record<string, unknown>;
function graphOf(html: string): Node[] {
  const m = html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/);
  expect(m, "page emits one JSON-LD block").toBeTruthy();
  return (JSON.parse(m![1]) as { "@graph": Node[] })["@graph"];
}
const nodeOfType = (graph: Node[], type: string) => graph.find((n) => n["@type"] === type);

const JOURNEY_ROUTE = "/attorneys/:stage/:caseTypeSlug";
const INDEX_ROUTE = "/attorneys/:stage";
const TEL = telHref(ORG_PHONE);
const BANNED = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i;
const CREDENTIAL_SUFFIX = /\bCRC\b|CLCP|MSCC/;

describe("JourneyStage /attorneys/considering/personal-injury", () => {
  const stage = "considering";
  const slug = "personal-injury";
  const caseType = getCaseType(slug)!;
  const j = getJourney(stage, slug)!;
  const html = render(`/attorneys/${stage}/${slug}`, JOURNEY_ROUTE, JourneyStage);
  const heading = journeyHeading(stage, caseType);

  it("prints the shared heading as the single H1", () => {
    expect(html.match(/<h1\b/g)?.length).toBe(1);
    expect(html).toContain(`<h1 class="font-serif text-4xl text-navy mb-4">${esc(heading)}</h1>`);
    expect(heading).toBe("Personal Injury: Is an Economist Needed?");
  });

  it("carries a named byline with both dates and no credential suffix", () => {
    expect(html).toContain('href="/team/christopher-skerritt"');
    expect(html).toContain("Christopher Skerritt");
    expect(html).not.toMatch(CREDENTIAL_SUFFIX);
    expect(html).toMatch(new RegExp(`<time datetime="${j.datePublished}">${j.datePublished}</time>`, "i"));
    expect(html).toMatch(new RegExp(`<time datetime="${j.dateModified}">${j.dateModified}</time>`, "i"));
  });

  it("ends with the consultation CTA and the office phone", () => {
    expect(html).toContain('href="/contact"');
    expect(html).toContain(`href="${TEL}"`);
    expect(html).toContain("Request a Consultation");
  });

  it("links the other three stages, the case-type hub, three pillar services, and the stage guide", () => {
    for (const s of ATTORNEY_STAGES.filter((s) => s.slug !== stage)) {
      expect(html).toContain(`href="/attorneys/${s.slug}/${slug}"`);
      expect(html).toContain(esc(journeyHeading(s.slug, caseType)));
    }
    expect(html).toContain(`href="/case-types/${slug}"`);
    const pillars = new Set(pillarServices().map((s) => s.slug));
    const expected = caseType.relevantServices.filter((s) => pillars.has(s)).slice(0, 3);
    expect(expected.length).toBe(3);
    for (const s of expected) expect(html).toContain(`href="/services/${s}"`);
    expect(html).not.toContain('href="/services/vocational-evaluation"');
    expect(html).not.toContain('href="/services/life-care-planning"');
    const guide = guides.find((g) => g.slug === STAGE_GUIDES[stage])!;
    expect(html).toContain(`href="/guides/${guide.slug}"`);
    expect(html).toContain(esc(guide.title));
  });

  it("labels Prev/Next with the neighbouring page heading, not the raw slug", () => {
    const next = journeys[1];
    const nextHeading = journeyHeading(next.stage, getCaseType(next.caseTypeSlug)!);
    expect(html).toContain(`Next: ${esc(nextHeading)}`);
    expect(html).toContain("No previous");
    expect(html).not.toMatch(/(Prev|Next): [^<]* - [a-z]+-[a-z-]+/);
  });

  it("emits Organization, Article (dated, person-authored), FAQPage, and BreadcrumbList, and no HowTo", () => {
    const graph = graphOf(html);
    const types = graph.map((n) => n["@type"]);
    expect(types).toContain("ProfessionalService");
    expect(types).toContain("Article");
    expect(types).toContain("FAQPage");
    expect(types).toContain("BreadcrumbList");
    expect(types).not.toContain("HowTo");
    const article = nodeOfType(graph, "Article")!;
    expect(article.headline).toBe(heading);
    expect(article.datePublished).toBe(j.datePublished);
    expect(article.dateModified).toBe(j.dateModified);
    expect(article.mainEntityOfPage).toBe(`https://kweconomics.com/attorneys/${stage}/${slug}`);
    const author = article.author as Node;
    expect(author["@id"]).toBe("https://kweconomics.com/team/christopher-skerritt#person");
    expect(author.hasCredential).toBeUndefined();
    expect(JSON.stringify(graph)).not.toMatch(CREDENTIAL_SUFFIX);
    const faq = nodeOfType(graph, "FAQPage")!;
    expect((faq.mainEntity as unknown[]).length).toBe(j.faqs.length);
    expect(j.faqs.length).toBeGreaterThanOrEqual(2);
  });

  it("stays in economics framing: no sister vocabulary, no dashes, no legacy brand on the visible page", () => {
    expect(html).not.toMatch(BANNED);
    expect(html).not.toMatch(/[–—]/);
    expect(withoutJsonLd(html)).not.toMatch(LEGACY_BRAND_PATTERN);
  });

  it("an unknown case type renders the 404, not an empty guide", () => {
    const missing = render("/attorneys/considering/not-a-case-type", JOURNEY_ROUTE, JourneyStage);
    expect(missing).not.toContain('id="checklist"');
    expect(missing).not.toContain("Reviewed by");
  });
});

describe("every journey page", () => {
  it("renders the heading, two or more FAQs, the CTA, a pillar service, and the stage guide, in economics framing", () => {
    for (const j of journeys) {
      const id = `${j.stage}/${j.caseTypeSlug}`;
      const caseType = getCaseType(j.caseTypeSlug)!;
      const html = render(`/attorneys/${j.stage}/${j.caseTypeSlug}`, JOURNEY_ROUTE, JourneyStage);
      expect(html, id).toContain(`<h1 class="font-serif text-4xl text-navy mb-4">${esc(journeyHeading(j.stage, caseType))}</h1>`);
      expect(html.match(/<details\b/g)?.length ?? 0, id).toBeGreaterThanOrEqual(2);
      expect(html, id).toContain('href="/contact"');
      expect(html, id).toContain(`href="${TEL}"`);
      expect(html, id).toMatch(/href="\/services\/[a-z-]+"/);
      expect(html, id).toContain(`href="/guides/${STAGE_GUIDES[j.stage]}"`);
      expect(html, id).toContain("Christopher Skerritt");
      expect(html, id).not.toMatch(CREDENTIAL_SUFFIX);
      expect(html, id).not.toMatch(BANNED);
      expect(html, id).not.toMatch(/[–—]/);
    }
  });
});

describe("JourneyStageIndex /attorneys/<stage>", () => {
  const html = render("/attorneys/considering", INDEX_ROUTE, JourneyStageIndex);

  it("prints the descriptive stage heading as the H1 and the intro paragraph", () => {
    expect(html.match(/<h1\b/g)?.length).toBe(1);
    expect(html).toContain(`<h1 class="font-serif text-4xl text-navy mb-4">${esc(stageIndexHeading("considering"))}</h1>`);
    expect(html).toContain("Deciding whether the loss justifies a forensic economist.");
  });

  it("links every case type for the stage, the other three stage indexes, and the hub", () => {
    for (const c of caseTypes) {
      expect(html).toContain(`href="/attorneys/considering/${c.slug}"`);
      // The card text is the target page's heading (the same string the ItemList names).
      expect(html).toContain(esc(journeyHeading("considering", c)));
    }
    for (const s of ATTORNEY_STAGES.filter((s) => s.slug !== "considering")) {
      expect(html).toContain(`href="/attorneys/${s.slug}"`);
    }
    expect(html).toContain('href="/attorneys"');
    expect(html).not.toContain('href="/attorneys/considering"');
  });

  it("carries the consultation CTA", () => {
    expect(html).toContain('href="/contact"');
    expect(html).toContain(`href="${TEL}"`);
  });

  it("emits CollectionPage (ItemList of the 14 journey pages as its main entity) + BreadcrumbList + Organization + WebSite, not Article", () => {
    const graph = graphOf(html);
    const types = graph.map((n) => n["@type"]);
    expect(types).toContain("CollectionPage");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("ProfessionalService");
    expect(types).toContain("WebSite");
    expect(types).not.toContain("Article");
    // Same shape as the shared schema.ts builder and the /attorneys hub.
    const collection = nodeOfType(graph, "CollectionPage")!;
    expect(collection["@id"]).toBe("https://kweconomics.com/attorneys/considering#webpage");
    expect(collection.name).toBe(stageIndexHeading("considering"));
    const website = nodeOfType(graph, "WebSite")!;
    expect((collection.isPartOf as { "@id": string })["@id"]).toBe(website["@id"]);
    expect((collection.publisher as { "@id": string })["@id"]).toBe("https://kweconomics.com/#org");
    const list = collection.mainEntity as { "@type": string; "@id": string; numberOfItems: number; itemListElement: { name: string; url: string }[] };
    expect(list["@type"]).toBe("ItemList");
    expect(list["@id"]).toBe("https://kweconomics.com/attorneys/considering#list");
    expect(list.numberOfItems).toBe(caseTypes.length);
    expect(list.itemListElement.length).toBe(caseTypes.length);
    expect(list.itemListElement[0].url).toBe(`https://kweconomics.com/attorneys/considering/${caseTypes[0].slug}`);
    expect(list.itemListElement[0].name).toBe(journeyHeading("considering", caseTypes[0]));
    // Every ListItem name is visible on the page as the card that links the same URL.
    for (const item of list.itemListElement) {
      expect(html).toContain(esc(item.name));
      expect(html).toContain(`href="${item.url.replace("https://kweconomics.com", "")}"`);
    }
  });

  it("renders all four stages with their own heading and stays in economics framing", () => {
    for (const s of ATTORNEY_STAGES) {
      const page = render(`/attorneys/${s.slug}`, INDEX_ROUTE, JourneyStageIndex);
      expect(page, s.slug).toContain(esc(stageIndexHeading(s.slug)));
      expect(page, s.slug).not.toMatch(BANNED);
      expect(page, s.slug).not.toMatch(/[–—]/);
      expect(withoutJsonLd(page), s.slug).not.toMatch(LEGACY_BRAND_PATTERN);
    }
  });

  it("an unknown stage renders the 404, not an empty index", () => {
    const missing = render("/attorneys/not-a-stage", INDEX_ROUTE, JourneyStageIndex);
    expect(missing).not.toContain('href="/attorneys/not-a-stage/');
    expect(missing).not.toContain("by Case Type");
  });
});

describe("AttorneysHubPage /attorneys", () => {
  const html = render("/attorneys", "/attorneys", AttorneysHubPage);

  it("links all 56 journey pages and the four stage indexes", () => {
    for (const s of ATTORNEY_STAGES) {
      expect(html).toContain(`href="/attorneys/${s.slug}"`);
      for (const c of caseTypes) expect(html).toContain(`href="/attorneys/${s.slug}/${c.slug}"`);
    }
  });

  it("names the economist in every stage heading", () => {
    for (const s of ATTORNEY_STAGES) expect(html).toContain(esc(s.label));
    expect(html).not.toContain("Considering an Expert");
    expect(html).not.toContain("Retaining an Expert");
  });
});
