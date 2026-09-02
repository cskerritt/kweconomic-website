import { describe, it, expect } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import ServicesHub from "./ServicesHub";
import LocationsHub from "./LocationsHub";
import KnowledgeHub from "./KnowledgeHub";
import InsightsHub from "./InsightsHub";
import WhitePapersHub from "./WhitePapersHub";
import AttorneysHubPage from "./hubs/AttorneysHubPage";
import CaseTypesHubPage from "./hubs/CaseTypesHubPage";
import ComparisonsHubPage from "./hubs/ComparisonsHubPage";
import CredentialsHubPage from "./hubs/CredentialsHubPage";
import GuidesHubPage from "./hubs/GuidesHubPage";
import JurisdictionsHubPage from "./hubs/JurisdictionsHubPage";
import MethodsHubPage from "./hubs/MethodsHubPage";
import { LEGACY_BRAND_PATTERN, ORG_NAME, ORG_PHONE, SITE_URL, telHref } from "@/lib/brand";
import { ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import { caseTypes } from "@/data/caseTypes";
import { comparisons } from "@/data/comparisons";
import { credentials } from "@/data/credentials";
import { guides } from "@/data/guides";
import { methods } from "@/data/methods";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { knowledgeGuides } from "@/data/knowledge";
import { insightPosts } from "@/data/insights";
import { whitePapers } from "@/data/whitePapers";

// Server renders of the twelve hub / index pages. usePageMeta does not run
// under renderToStaticMarkup, so the body and JSON-LD are asserted from the
// render and the title/description pair is read from the source literal (the
// same way scripts/prerender-meta.test.mjs pins it against the shells).
const here = dirname(fileURLToPath(import.meta.url));

function render(path: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path, element: createElement(Page) })),
    ),
  );
}

type JsonLd = Record<string, unknown>;
const withoutJsonLd = (html: string) => html.replace(/<script type="application\/ld\+json">[^]*?<\/script>/g, "");
// CrossSell.tsx is the one deliberate hand-off to the sister practices and is
// allowed to name them; the brand guard applies to everything else on the page.
const withoutCrossSell = (html: string) => html.replace(/<section aria-labelledby="cross-sell-heading"[^>]*>[^]*?<\/section>/, "");
const graphOf = (html: string): JsonLd[] =>
  [...html.matchAll(/<script type="application\/ld\+json">([^]*?)<\/script>/g)].flatMap(
    (m) => (JSON.parse(m[1]) as { "@graph"?: JsonLd[] })["@graph"] ?? [],
  );
const headingLevels = (html: string) => [...withoutJsonLd(html).matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
const h1Text = (html: string) => (html.match(/<h1[^>]*>([^]*?)<\/h1>/)?.[1] ?? "").replace(/<[^>]+>/g, "");
// React's text/attribute escaping, so data strings can be looked up in the markup.
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

const STR = "(`[^`]*`|\"[^\"]*\")";
function pageMeta(file: string) {
  const src = readFileSync(join(here, file), "utf8");
  const m = src.match(new RegExp(`usePageMeta\\(\\{\\s*title: ${STR},\\s*description:\\s*${STR}`));
  if (!m) throw new Error(`${file} has no literal usePageMeta title/description`);
  const resolve = (lit: string) => lit.slice(1, -1).replace(/\$\{ORG_NAME\}/g, ORG_NAME);
  return { title: resolve(m[1]), description: resolve(m[2]) };
}

const HUBS: { path: string; Page: ComponentType; file: string; h1: string; count: number; itemPrefix: string }[] = [
  { path: "/services", Page: ServicesHub, file: "ServicesHub.tsx", h1: "Forensic Economics and Damages Services", count: pillarServices().length, itemPrefix: `${SITE_URL}/services/` },
  { path: "/locations", Page: LocationsHub, file: "LocationsHub.tsx", h1: "Forensic Economists in All 50 States, DC, and U.S. Territories", count: states.length, itemPrefix: `${SITE_URL}/locations/` },
  { path: "/knowledge", Page: KnowledgeHub, file: "KnowledgeHub.tsx", h1: "Knowledge Center: Economic Damages Guides for Attorneys", count: knowledgeGuides.length, itemPrefix: `${SITE_URL}/knowledge/` },
  { path: "/insights", Page: InsightsHub, file: "InsightsHub.tsx", h1: "Insights on Economic Damages and Expert Testimony", count: insightPosts.length, itemPrefix: `${SITE_URL}/insights/` },
  { path: "/white-papers", Page: WhitePapersHub, file: "WhitePapersHub.tsx", h1: "White papers on defensible expert methodology", count: whitePapers.length, itemPrefix: `${SITE_URL}/white-papers/` },
  { path: "/attorneys", Page: AttorneysHubPage, file: "hubs/AttorneysHubPage.tsx", h1: "Attorney Resources by Litigation Stage", count: ATTORNEY_STAGES.length, itemPrefix: `${SITE_URL}/attorneys/` },
  { path: "/case-types", Page: CaseTypesHubPage, file: "hubs/CaseTypesHubPage.tsx", h1: "Case Types We Analyze", count: caseTypes.length, itemPrefix: `${SITE_URL}/case-types/` },
  { path: "/compare", Page: ComparisonsHubPage, file: "hubs/ComparisonsHubPage.tsx", h1: "Economic Damages Comparisons", count: comparisons.length, itemPrefix: `${SITE_URL}/compare/` },
  { path: "/credentials", Page: CredentialsHubPage, file: "hubs/CredentialsHubPage.tsx", h1: "Credentials of a Forensic Economist", count: credentials.length, itemPrefix: `${SITE_URL}/credentials/` },
  { path: "/guides", Page: GuidesHubPage, file: "hubs/GuidesHubPage.tsx", h1: "Guides for Attorneys", count: guides.length, itemPrefix: `${SITE_URL}/guides/` },
  { path: "/jurisdictions", Page: JurisdictionsHubPage, file: "hubs/JurisdictionsHubPage.tsx", h1: "State and Federal Jurisdictions Served", count: states.length, itemPrefix: `${SITE_URL}/locations/` },
  { path: "/methods", Page: MethodsHubPage, file: "hubs/MethodsHubPage.tsx", h1: "Forensic Economics Methods", count: methods.length, itemPrefix: `${SITE_URL}/methods/` },
];

const FEEDBACK_COPY = /What Attorneys Say|Representative feedback|Retaining attorney|testimonial|Sample - Replace/i;

for (const hub of HUBS) {
  describe(hub.path, () => {
    const html = render(hub.path, hub.Page);

    it("renders the subject-bearing H1 once", () => {
      expect(h1Text(html)).toBe(hub.h1);
      expect(headingLevels(html).filter((l) => l === 1)).toHaveLength(1);
    });

    it("heading levels never skip (no h1 -> h3)", () => {
      const levels = headingLevels(html);
      expect(levels[0]).toBe(1);
      levels.reduce((prev, level) => {
        expect(level, `h${prev} -> h${level}`).toBeLessThanOrEqual(prev + 1);
        return level;
      }, 0);
    });

    it("emits CollectionPage + ItemList structured data whose references resolve", () => {
      const graph = graphOf(html);
      const page = graph.find((n) => n["@type"] === "CollectionPage") as JsonLd;
      expect(page, "CollectionPage node").toBeDefined();
      expect(page["@id"]).toBe(`${SITE_URL}${hub.path}#webpage`);
      expect(page.url).toBe(`${SITE_URL}${hub.path}`);
      expect(page.name).toBe(hub.h1);
      expect((page.publisher as JsonLd)["@id"]).toBe(ORG_ID);
      expect((page.isPartOf as JsonLd)["@id"]).toBe(WEBSITE_ID);
      const list = page.mainEntity as JsonLd;
      expect(list["@type"]).toBe("ItemList");
      expect(list.numberOfItems).toBe(hub.count);
      const items = list.itemListElement as JsonLd[];
      expect(items).toHaveLength(hub.count);
      items.forEach((item, i) => {
        expect(item["@type"]).toBe("ListItem");
        expect(item.position).toBe(i + 1);
        expect(String(item.url).startsWith(hub.itemPrefix), String(item.url)).toBe(true);
        expect(String(item.name).length).toBeGreaterThan(0);
      });
      // The @id references above must point at nodes in the same graph.
      expect(graph.some((n) => n["@type"] === "ProfessionalService" && n["@id"] === ORG_ID)).toBe(true);
      expect(graph.some((n) => n["@type"] === "WebSite" && n["@id"] === WEBSITE_ID)).toBe(true);
      expect(graph.some((n) => n["@type"] === "BreadcrumbList")).toBe(true);
      // An index page is not an Article.
      expect(graph.some((n) => n["@type"] === "Article")).toBe(false);
    });

    it("carries an in-body phone link and a visible breadcrumb", () => {
      expect(html).toContain(`href="${telHref(ORG_PHONE)}"`);
      expect(html).toContain('aria-label="Breadcrumb"');
    });

    it("stays within the site rules (no dashes, sister brands, link markers, or feedback copy)", () => {
      expect(html).not.toMatch(/[\u2013\u2014]/);
      expect(withoutCrossSell(withoutJsonLd(html))).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(html).not.toContain("[[");
      expect(html).not.toMatch(FEEDBACK_COPY);
      expect(html).not.toContain("<blockquote");
    });

    it("meta title fits a SERP and the description sits in the 140-160 window", () => {
      const { title, description } = pageMeta(hub.file);
      expect(title.length, title).toBeLessThanOrEqual(60);
      expect(title.endsWith(`| ${ORG_NAME}`), title).toBe(true);
      expect(description.length, description).toBeGreaterThanOrEqual(140);
      expect(description.length, description).toBeLessThanOrEqual(160);
      expect(`${title} ${description}`).not.toMatch(/[\u2013\u2014]/);
    });
  });
}

describe("grid headings added above the card lists", () => {
  const GRID_HEADINGS: [string, ComponentType, string][] = [
    ["/case-types", CaseTypesHubPage, "Browse case types"],
    ["/methods", MethodsHubPage, "All methods"],
    ["/guides", GuidesHubPage, "All guides"],
    ["/compare", ComparisonsHubPage, "All comparisons"],
    ["/credentials", CredentialsHubPage, "The credentials"],
    ["/white-papers", WhitePapersHub, "Available white papers"],
  ];
  for (const [path, Page, heading] of GRID_HEADINGS) {
    it(`${path} renders <h2>${heading}</h2> before its cards`, () => {
      const html = render(path, Page);
      expect(html).toMatch(new RegExp(`<h2[^>]*>${heading}</h2>`));
    });
  }
});

describe("/attorneys links its stage indexes", () => {
  const html = render("/attorneys", AttorneysHubPage);

  it("links all four /attorneys/:stage index pages from the stage headings", () => {
    for (const stage of ATTORNEY_STAGES) {
      expect(html).toMatch(new RegExp(`<h2[^>]*><a[^>]*href="/attorneys/${stage.slug}"[^>]*>${esc(stage.label)}</a></h2>`));
    }
  });

  it("labels every stage x case-type card with its stage so repeated anchor text stays distinct", () => {
    for (const stage of ATTORNEY_STAGES) {
      for (const c of caseTypes) {
        expect(html).toContain(`href="/attorneys/${stage.slug}/${c.slug}"`);
        expect(html).toContain(`aria-label="${esc(`${stage.label}: ${c.name}`)}"`);
      }
    }
  });

  it("lists the four stage indexes as the CollectionPage ItemList", () => {
    const page = graphOf(html).find((n) => n["@type"] === "CollectionPage") as JsonLd;
    const items = (page.mainEntity as JsonLd).itemListElement as JsonLd[];
    expect(items.map((i) => i.url)).toEqual(ATTORNEY_STAGES.map((s) => `${SITE_URL}/attorneys/${s.slug}`));
  });
});

describe("/insights dates", () => {
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // The visible date must equal the ISO datePublished (the JSON-LD and sitemap
  // value) in every US zone; a UTC-midnight parse shows the previous day.
  for (const tz of ["America/New_York", "America/Los_Angeles", "Pacific/Kiritimati", "UTC"]) {
    it(`renders each post's calendar date beside a machine-readable <time> (TZ=${tz})`, () => {
      const prev = process.env.TZ;
      process.env.TZ = tz;
      try {
        const html = render("/insights", InsightsHub);
        for (const post of insightPosts) {
          const [y, m, d] = post.publishedDate.split("-").map(Number);
          expect(html).toMatch(new RegExp(`<time datetime="${post.publishedDate}"`, "i"));
          expect(html).toContain(`${MONTHS[m - 1]} ${d}, ${y}`);
        }
      } finally {
        if (prev === undefined) delete process.env.TZ;
        else process.env.TZ = prev;
      }
    });
  }
});

describe("/locations and /jurisdictions", () => {
  const loc = render("/locations", LocationsHub);
  const jur = render("/jurisdictions", JurisdictionsHubPage);

  it("abbreviation quick-grid links carry the state name in their anchor text (visually hidden)", () => {
    for (const s of states.filter((st) => st.type === "state")) {
      expect(loc).toMatch(
        new RegExp(`<a[^>]*href="/locations/${s.slug}"[^>]*>${s.abbreviation}<span class="sr-only">, ${esc(s.name)}</span></a>`),
      );
    }
  });

  it("cross-link each other", () => {
    expect(loc).toContain('href="/jurisdictions"');
    expect(jur).toContain('href="/locations"');
  });

  it("the jurisdictions hero claims accepted engagements, not testimony in every venue", () => {
    const body = withoutJsonLd(jur);
    expect(body).toContain(`${ORG_NAME} accepts engagements`);
    expect(body).toContain("Venue determines which damages rules");
    expect(body).not.toMatch(/where our forensic economists testify/);
  });
});

describe("hub cross-links", () => {
  it("/services and /case-types link the attorney, credential, method, and comparison hubs", () => {
    for (const html of [render("/services", ServicesHub), render("/case-types", CaseTypesHubPage)]) {
      const nav = html.match(/<nav aria-label="Related resources"[^>]*>[^]*?<\/nav>/)?.[0] ?? "";
      for (const href of ["/attorneys", "/credentials", "/methods", "/compare"]) {
        expect(nav).toContain(`href="${href}"`);
      }
    }
  });

  it("/attorneys and /credentials link back to /case-types and /services", () => {
    for (const html of [render("/attorneys", AttorneysHubPage), render("/credentials", CredentialsHubPage)]) {
      const nav = html.match(/<nav aria-label="Related resources"[^>]*>[^]*?<\/nav>/)?.[0] ?? "";
      expect(nav).toContain('href="/case-types"');
      expect(nav).toContain('href="/services"');
    }
  });

  it("each editorial hub links the other five editorial hubs in its library nav, never itself", () => {
    const EDITORIAL: Record<string, ComponentType> = {
      "/guides": GuidesHubPage,
      "/compare": ComparisonsHubPage,
      "/methods": MethodsHubPage,
      "/white-papers": WhitePapersHub,
      "/knowledge": KnowledgeHub,
      "/insights": InsightsHub,
    };
    for (const [path, Page] of Object.entries(EDITORIAL)) {
      const html = render(path, Page);
      const nav = html.match(/<nav aria-label="More from the library"[^>]*>[^]*?<\/nav>/)?.[0] ?? "";
      expect(nav, `${path} has a library nav`).not.toBe("");
      for (const other of Object.keys(EDITORIAL)) {
        if (other === path) expect(nav, `${path} links itself`).not.toContain(`href="${other}"`);
        else expect(nav, `${path} -> ${other}`).toContain(`href="${other}"`);
      }
    }
  });
});

describe("/compare cards", () => {
  const html = render("/compare", ComparisonsHubPage);

  it("carry a one-line blurb from the comparison copy with link markers collapsed to text", () => {
    for (const c of comparisons) {
      const lead = c.overlap.replace(/\[\[\/[^|\]]*\|([^\]]+)\]\]/g, "$1").slice(0, 60);
      expect(html).toContain(esc(lead));
    }
    // The two sister-discipline entries are carved out of the off-brand guard
    // in the data file; the hub blurbs drawn from them must still stay free
    // of the sister vocabulary (the entry titles are the only allowed mention).
    const blurbs = [...html.matchAll(/<p class="text-sm text-neutral-600 mt-1 line-clamp-2">([^]*?)<\/p>/g)].map((m) => m[1]);
    expect(blurbs).toHaveLength(comparisons.length);
    for (const b of blurbs) {
      expect(b).not.toMatch(/vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i);
    }
    // A card is already an anchor: the blurb must never nest another one.
    for (const m of html.matchAll(/<a\b[^>]*>([^]*?)<\/a>/g)) {
      expect(m[1], m[0].slice(0, 120)).not.toMatch(/<a\b/);
    }
  });
});
