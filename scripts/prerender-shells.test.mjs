// scripts/prerender-shells.test.mjs
//
// Build-output parity for the static shells scripts/prerender.mjs writes. For
// one route per template the shell in dist/ must advertise the same <title>,
// meta description, and H1 as the hydrated React page, and its JSON-LD graph
// must describe the same entities (same @type and @id, the same names,
// descriptions, dates, FAQ questions, and breadcrumb trail). The second half
// checks what a non-JS crawler is given: hub shells that link every child,
// the site FAQ on /resources/faq, a consultation line and breadcrumb on every
// shell, the share image tags, the not-found shell, and no sister-practice
// credential abbreviation anywhere in the shell text.
//
// dist/ is gitignored and only exists after `npm run build`; every block is
// gated on it the way scripts/sitemap-index.test.mjs gates its dist check.
// usePageMeta writes from an effect that never runs under
// renderToStaticMarkup, so it is replaced with a spy and the meta each page
// would publish is read back from the call; useStateCities is an effect-driven
// chunk load, replaced with a synchronous lookup for the two states rendered.
import { describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { SITE_URL, ORG_NAME, DEFAULT_OG_IMAGE } from "@/lib/brand";
import { faqs as siteFaqs } from "@/data/faqs";
import { caseTypes } from "@/data/caseTypes";
import { credentials } from "@/data/credentials";
import { guides } from "@/data/guides";
import { comparisons } from "@/data/comparisons";
import { methods } from "@/data/methods";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { knowledgeGuides } from "@/data/knowledge";
import { insightPosts } from "@/data/insights";
import { whitePapers } from "@/data/whitePapers";
import { team } from "@/data/team";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Team from "@/pages/Team";
import Contact from "@/pages/Contact";
import ServicesHub from "@/pages/ServicesHub";
import LocationsHub from "@/pages/LocationsHub";
import FAQ from "@/pages/FAQ";
import KnowledgeHub from "@/pages/KnowledgeHub";
import InsightsHub from "@/pages/InsightsHub";
import CaseStudies from "@/pages/CaseStudies";
import ScheduleConsultation from "@/pages/ScheduleConsultation";
import WhitePapersHub from "@/pages/WhitePapersHub";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import CaseTypesHubPage from "@/pages/hubs/CaseTypesHubPage";
import CredentialsHubPage from "@/pages/hubs/CredentialsHubPage";
import GuidesHubPage from "@/pages/hubs/GuidesHubPage";
import ComparisonsHubPage from "@/pages/hubs/ComparisonsHubPage";
import MethodsHubPage from "@/pages/hubs/MethodsHubPage";
import JurisdictionsHubPage from "@/pages/hubs/JurisdictionsHubPage";
import AttorneysHubPage from "@/pages/hubs/AttorneysHubPage";
import ExpertProfile from "@/pages/templates/ExpertProfile";
import ServicePillar from "@/pages/ServicePillar";
import ServiceTransactional from "@/pages/templates/ServiceTransactional";
import ServiceCaseType from "@/pages/templates/ServiceCaseType";
import StateHub from "@/pages/StateHub";
import CityPage from "@/pages/CityPage";
import ServiceState from "@/pages/ServiceState";
import ServiceStateCity from "@/pages/ServiceStateCity";
import CaseTypeHub from "@/pages/templates/CaseTypeHub";
import CaseTypeState from "@/pages/templates/CaseTypeState";
import CredentialHub from "@/pages/templates/CredentialHub";
import CredentialState from "@/pages/templates/CredentialState";
import PillarGuide from "@/pages/templates/PillarGuide";
import MethodologyExplainer from "@/pages/templates/MethodologyExplainer";
import Comparison from "@/pages/templates/Comparison";
import KnowledgeArticle from "@/pages/KnowledgeArticle";
import InsightPost from "@/pages/InsightPost";
import WhitePaper from "@/pages/WhitePaper";
import JourneyStageIndex from "@/pages/templates/JourneyStageIndex";
import JourneyStage from "@/pages/templates/JourneyStage";

vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));
vi.mock("@/hooks/use-state-cities", async () => {
  const { newJerseyCities } = await import("@/data/cities/new-jersey");
  const { districtOfColumbiaCities } = await import("@/data/cities/district-of-columbia");
  const BY_STATE = { "new-jersey": newJerseyCities, "district-of-columbia": districtOfColumbiaCities };
  return {
    useStateCities: (stateSlug) => ({ cities: (stateSlug && BY_STATE[stateSlug]) || [], loading: false }),
  };
});

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const hasDist = existsSync(join(DIST, "index.html"));
const shellPath = (route) => (route === "/" ? join(DIST, "index.html") : join(DIST, route, "index.html"));
const readShell = (route) => readFileSync(shellPath(route), "utf8");
const canonicalOf = (route) => (route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`);

// Text as a reader sees it: entities decoded (the shell escapes with numeric
// and named entities, React with its own set), whitespace collapsed.
const decode = (s) =>
  s
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&middot;/g, "·")
    .replace(/&rarr;/g, "→")
    .replace(/&larr;/g, "←")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const textOf = (html) => decode(html.replace(/<[^>]+>/g, ""));
const titleOf = (html) => decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
const descriptionOf = (html) => decode(html.match(/<meta name="description" content="([^"]*)" \/>/)?.[1] ?? "");
const h1Of = (html) => textOf(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
const ldScripts = (html) => [...html.matchAll(/<script type="application\/ld\+json"([^>]*)>([\s\S]*?)<\/script>/g)];
const ldBlocks = (html) => ldScripts(html).map((m) => JSON.parse(m[2]));
const nodesOf = (html) => ldBlocks(html).flatMap((b) => b["@graph"] ?? [b]);
const hrefs = (html) => new Set([...html.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]));
const metaContent = (html, attr, name) => html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)" />`))?.[1];

function render(path, routePath, Page, props) {
  vi.mocked(usePageMeta).mockClear();
  const html = renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page, props ?? null) })),
    ),
  );
  const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0] ?? null;
  return { html, meta };
}

// One route per template. `route` is the URL, `pattern` the App.tsx route.
const ROUTES = [
  { route: "/", pattern: "/", Page: Home },
  { route: "/about", pattern: "/about", Page: About },
  { route: "/team", pattern: "/team", Page: Team },
  { route: "/contact", pattern: "/contact", Page: Contact },
  { route: "/services", pattern: "/services", Page: ServicesHub },
  { route: "/locations", pattern: "/locations", Page: LocationsHub },
  { route: "/resources/faq", pattern: "/resources/faq", Page: FAQ },
  { route: "/knowledge", pattern: "/knowledge", Page: KnowledgeHub },
  { route: "/insights", pattern: "/insights", Page: InsightsHub },
  { route: "/case-studies", pattern: "/case-studies", Page: CaseStudies },
  { route: "/schedule-consultation", pattern: "/schedule-consultation", Page: ScheduleConsultation },
  { route: "/white-papers", pattern: "/white-papers", Page: WhitePapersHub },
  { route: "/privacy", pattern: "/privacy", Page: Privacy },
  { route: "/terms", pattern: "/terms", Page: Terms },
  { route: "/case-types", pattern: "/case-types", Page: CaseTypesHubPage },
  { route: "/credentials", pattern: "/credentials", Page: CredentialsHubPage },
  { route: "/guides", pattern: "/guides", Page: GuidesHubPage },
  { route: "/compare", pattern: "/compare", Page: ComparisonsHubPage },
  { route: "/methods", pattern: "/methods", Page: MethodsHubPage },
  { route: "/jurisdictions", pattern: "/jurisdictions", Page: JurisdictionsHubPage },
  { route: "/attorneys", pattern: "/attorneys", Page: AttorneysHubPage },
  { route: `/team/${team[0].slug}`, pattern: "/team/:slug", Page: ExpertProfile },
  { route: "/services/lost-earnings-and-earning-capacity", pattern: "/services/:serviceSlug", Page: ServicePillar },
  { route: "/services/lost-earnings-and-earning-capacity/cost", pattern: "/services/:serviceSlug/cost", Page: ServiceTransactional, props: { variant: "cost" } },
  { route: "/services/lost-earnings-and-earning-capacity/process", pattern: "/services/:serviceSlug/process", Page: ServiceTransactional, props: { variant: "process" } },
  { route: "/services/lost-earnings-and-earning-capacity/timeline", pattern: "/services/:serviceSlug/timeline", Page: ServiceTransactional, props: { variant: "timeline" } },
  { route: "/services/lost-earnings-and-earning-capacity/case/personal-injury", pattern: "/services/:serviceSlug/case/:typeSlug", Page: ServiceCaseType },
  { route: "/services/business-valuation/case/personal-injury", pattern: "/services/:serviceSlug/case/:typeSlug", Page: ServiceCaseType },
  { route: "/locations/new-jersey", pattern: "/locations/:stateSlug", Page: StateHub },
  { route: "/locations/district-of-columbia", pattern: "/locations/:stateSlug", Page: StateHub },
  { route: "/locations/new-jersey/hackensack", pattern: "/locations/:stateSlug/:citySlug", Page: CityPage },
  { route: "/services/lost-earnings-and-earning-capacity/new-jersey", pattern: "/services/:serviceSlug/:stateSlug", Page: ServiceState },
  { route: "/services/lost-earnings-and-earning-capacity/new-jersey/hackensack", pattern: "/services/:serviceSlug/:stateSlug/:citySlug", Page: ServiceStateCity },
  { route: "/case-types/wrongful-death", pattern: "/case-types/:slug", Page: CaseTypeHub },
  { route: "/case-types/wrongful-death/new-jersey", pattern: "/case-types/:typeSlug/:stateSlug", Page: CaseTypeState },
  { route: "/case-types/wrongful-death/district-of-columbia", pattern: "/case-types/:typeSlug/:stateSlug", Page: CaseTypeState },
  { route: "/case-types/commercial-contract-dispute/texas", pattern: "/case-types/:typeSlug/:stateSlug", Page: CaseTypeState },
  { route: "/credentials/forensic-economist", pattern: "/credentials/:slug", Page: CredentialHub },
  { route: "/credentials/forensic-economist/new-jersey", pattern: "/credentials/:credSlug/:stateSlug", Page: CredentialState },
  { route: "/credentials/nafe-member/district-of-columbia", pattern: "/credentials/:credSlug/:stateSlug", Page: CredentialState },
  { route: `/guides/${guides[0].slug}`, pattern: "/guides/:slug", Page: PillarGuide },
  { route: `/methods/${methods[0].slug}`, pattern: "/methods/:slug", Page: MethodologyExplainer },
  { route: `/compare/${comparisons[0].slug}`, pattern: "/compare/:slug", Page: Comparison },
  { route: `/knowledge/${knowledgeGuides[0].slug}`, pattern: "/knowledge/:slug", Page: KnowledgeArticle },
  { route: `/insights/${insightPosts[0].slug}`, pattern: "/insights/:slug", Page: InsightPost },
  { route: `/white-papers/${whitePapers[0].slug}`, pattern: "/white-papers/:slug", Page: WhitePaper },
  { route: `/attorneys/${ATTORNEY_STAGES[0].slug}`, pattern: "/attorneys/:stage", Page: JourneyStageIndex },
  { route: `/attorneys/${ATTORNEY_STAGES[0].slug}/personal-injury`, pattern: "/attorneys/:stage/:caseTypeSlug", Page: JourneyStage },
];

// Keys a shell node may legitimately differ on: the /team Person nodes list
// the degree credentials only (the background certifications stay off the
// economics shells by rule) while the hydrated page lists them all.
const IGNORED_KEYS = new Set(["hasCredential"]);

function findMatch(shellNodes, node) {
  if (node["@id"]) {
    const byId = shellNodes.find((n) => n["@id"] === node["@id"]);
    if (byId) return byId;
  }
  return shellNodes.find((n) => n["@type"] === node["@type"] && (node.name === undefined || n.name === node.name));
}

/**
 * Every field of the hydrated node must appear with the same value on the shell
 * node. A Service node whose React url is a slug-derived /services path (the
 * geo templates still derive it) is matched on type and name instead, and the
 * shell's url must be the page canonical.
 */
function expectNodeParity(reactNode, shellNode, canonical) {
  const synthetic = reactNode["@type"] === "Service" && reactNode.url !== canonical;
  for (const [key, value] of Object.entries(reactNode)) {
    if (IGNORED_KEYS.has(key)) continue;
    if (synthetic && (key === "@id" || key === "url")) continue;
    expect(shellNode[key], `${canonical}: ${reactNode["@type"]}.${key}`).toEqual(value);
  }
  if (synthetic) {
    expect(shellNode.url, `${canonical}: shell Service url`).toBe(canonical);
    expect(shellNode["@id"], `${canonical}: shell Service @id`).toBe(`${canonical}#service`);
  }
}

describe.skipIf(!hasDist)("static shells mirror the hydrated page (requires dist/)", () => {
  for (const { route, pattern, Page, props } of ROUTES) {
    const canonical = canonicalOf(route);
    it(`${route}: title, description, H1, and JSON-LD graph`, () => {
      expect(existsSync(shellPath(route)), `no shell for ${route}`).toBe(true);
      const shell = readShell(route);
      const { html, meta } = render(route, pattern, Page, props);
      expect(meta, `${route} publishes page meta`).toBeTruthy();
      expect(titleOf(shell)).toBe(decode(meta.title));
      expect(descriptionOf(shell)).toBe(decode(meta.description));
      expect(shell).toContain(`<link rel="canonical" href="${canonical}" />`);
      expect(h1Of(shell)).toBe(h1Of(html));

      const reactNodes = nodesOf(html);
      const shellNodes = nodesOf(shell);
      for (const node of reactNodes) {
        const match = findMatch(shellNodes, node);
        expect(match, `${route}: shell has no ${node["@type"]} node ${node["@id"] ?? node.name ?? ""}`).toBeTruthy();
        expectNodeParity(node, match, canonical);
      }
      // A page without structured data (the legal pages) gets at most the
      // breadcrumb trail on the shell; everywhere else the node sets agree.
      if (reactNodes.length) {
        const extra = shellNodes.filter((n) => !findMatch(reactNodes, n));
        expect(extra.map((n) => `${n["@type"]} ${n["@id"] ?? n.name ?? ""}`), `${route}: shell-only nodes`).toEqual([]);
      }
    });
  }

  it("/404: the not-found shell carries the error page's title, a noindex directive, no canonical, and no JSON-LD", () => {
    const shell = readFileSync(join(DIST, "404.html"), "utf8");
    const { meta, html } = render("/nothing-here", "*", NotFound);
    expect(titleOf(shell)).toBe(meta.title);
    expect(descriptionOf(shell)).toBe(meta.description);
    expect(h1Of(shell)).toBe(h1Of(html));
    expect(shell).toContain('<meta name="robots" content="noindex,follow" />');
    expect(shell).not.toContain('rel="canonical"');
    expect(ldScripts(shell)).toHaveLength(0);
    expect(shell).toContain('href="tel:');
  });
});

describe.skipIf(!hasDist)("what a non-JS crawler is given (requires dist/)", () => {
  const sample = ROUTES.map((r) => r.route);

  it("every shell JSON-LD block is tagged for removal on hydration and is a schema.org graph", () => {
    for (const route of sample) {
      for (const m of ldScripts(readShell(route))) {
        expect(m[1], `${route}: ld+json attributes`).toContain('data-prerender="ld"');
        const parsed = JSON.parse(m[2]);
        expect(parsed["@context"], route).toBe("https://schema.org");
        expect(Array.isArray(parsed["@graph"]), route).toBe(true);
      }
    }
  });

  it("every shell but the home page carries a visible breadcrumb trail and a BreadcrumbList", () => {
    for (const route of sample.filter((r) => r !== "/")) {
      const shell = readShell(route);
      expect(shell, route).toContain('<nav aria-label="Breadcrumb">');
      expect(nodesOf(shell).some((n) => n["@type"] === "BreadcrumbList"), route).toBe(true);
    }
  });

  it("every content shell ends with a consultation line and a tel: link", () => {
    const skip = new Set(["/contact", "/schedule-consultation", "/privacy", "/terms"]);
    for (const route of sample.filter((r) => !skip.has(r))) {
      const shell = readShell(route);
      expect(shell, route).toContain('href="tel:');
      expect(shell, route).toMatch(/Request a consultation|Request a Consultation/);
    }
  });

  it("the share image tags name the 1200x630 card crop, and the profile shell the portrait", () => {
    for (const route of sample.filter((r) => !r.startsWith("/team/"))) {
      const shell = readShell(route);
      expect(metaContent(shell, "property", "og:image"), route).toBe(DEFAULT_OG_IMAGE);
      expect(metaContent(shell, "property", "og:image:width"), route).toBe("1200");
      expect(metaContent(shell, "property", "og:image:height"), route).toBe("630");
      expect(metaContent(shell, "property", "og:image:alt"), route).toBeTruthy();
      expect(metaContent(shell, "name", "twitter:image"), route).toBe(DEFAULT_OG_IMAGE);
    }
    const profile = readShell(`/team/${team[0].slug}`);
    expect(metaContent(profile, "property", "og:image")).toBe(`${SITE_URL}${team[0].imageUrl}`);
    expect(metaContent(profile, "property", "og:image:alt")).toBe(team[0].name);
    expect(Number(metaContent(profile, "property", "og:image:width"))).toBeGreaterThan(0);
  });

  it("editorial shells are typed article with their published and modified times", () => {
    for (const route of [`/guides/${guides[0].slug}`, `/methods/${methods[0].slug}`, `/compare/${comparisons[0].slug}`, `/knowledge/${knowledgeGuides[0].slug}`, `/insights/${insightPosts[0].slug}`, `/white-papers/${whitePapers[0].slug}`, `/attorneys/${ATTORNEY_STAGES[0].slug}/personal-injury`]) {
      const shell = readShell(route);
      expect(metaContent(shell, "property", "og:type"), route).toBe("article");
      expect(metaContent(shell, "property", "article:published_time"), route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(metaContent(shell, "property", "article:modified_time"), route).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(metaContent(readShell("/services"), "property", "og:type")).toBe("website");
  });

  it("/resources/faq renders every site FAQ as <details> and marks the same set up as FAQPage", () => {
    const shell = readShell("/resources/faq");
    expect((shell.match(/<details>/g) ?? []).length).toBe(siteFaqs.length);
    const faqNode = nodesOf(shell).find((n) => n["@type"] === "FAQPage");
    expect(faqNode.mainEntity.map((q) => q.name)).toEqual(siteFaqs.map((f) => f.question.replace(/\[\[\/[^|\]]*\|([^\]]+)\]\]/g, "$1")));
    expect(faqNode.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("hub shells link every child page (derived from the data files, not hard-coded counts)", () => {
    const expectLinks = (route, expected) => {
      const found = hrefs(readShell(route));
      const missing = expected.filter((h) => !found.has(h));
      expect(missing, `${route} is missing child links`).toEqual([]);
    };
    const pillars = pillarServices();
    expectLinks("/services", pillars.map((s) => `/services/${s.slug}`));
    expectLinks("/locations", states.map((s) => `/locations/${s.slug}`));
    expectLinks("/jurisdictions", states.map((s) => `/locations/${s.slug}`));
    expectLinks("/case-types", caseTypes.map((c) => `/case-types/${c.slug}`));
    expectLinks("/credentials", credentials.map((c) => `/credentials/${c.slug}`));
    expectLinks("/guides", guides.map((g) => `/guides/${g.slug}`));
    expectLinks("/compare", comparisons.map((c) => `/compare/${c.slug}`));
    expectLinks("/methods", methods.map((m) => `/methods/${m.slug}`));
    expectLinks("/knowledge", knowledgeGuides.map((k) => `/knowledge/${k.slug}`));
    expectLinks("/insights", insightPosts.map((p) => `/insights/${p.slug}`));
    expectLinks("/white-papers", whitePapers.map((w) => `/white-papers/${w.slug}`));
    expectLinks("/attorneys", [
      ...ATTORNEY_STAGES.map((s) => `/attorneys/${s.slug}`),
      ...ATTORNEY_STAGES.flatMap((s) => caseTypes.map((c) => `/attorneys/${s.slug}/${c.slug}`)),
    ]);
    for (const stage of ATTORNEY_STAGES) {
      expectLinks(`/attorneys/${stage.slug}`, caseTypes.map((c) => `/attorneys/${stage.slug}/${c.slug}`));
    }
    expectLinks("/case-types/wrongful-death", [
      ...ATTORNEY_STAGES.map((s) => `/attorneys/${s.slug}/wrongful-death`),
      ...states.map((s) => `/case-types/wrongful-death/${s.slug}`),
    ]);
    expectLinks("/credentials/forensic-economist", states.map((s) => `/credentials/forensic-economist/${s.slug}`));
    expectLinks("/services/lost-earnings-and-earning-capacity", [
      ...states.map((s) => `/services/lost-earnings-and-earning-capacity/${s.slug}`),
      ...["cost", "process", "timeline"].map((v) => `/services/lost-earnings-and-earning-capacity/${v}`),
      ...pillars.find((s) => s.slug === "lost-earnings-and-earning-capacity").caseTypes.map((ct) => `/services/lost-earnings-and-earning-capacity/case/${ct}`),
    ]);
    expectLinks("/locations/new-jersey", [
      ...pillars.map((s) => `/services/${s.slug}/new-jersey`),
      ...caseTypes.map((c) => `/case-types/${c.slug}/new-jersey`),
      ...credentials.map((c) => `/credentials/${c.slug}/new-jersey`),
      "/locations/new-jersey/hackensack",
    ]);
    // The home shell reaches every hub the header and footer expose after hydration.
    expectLinks("/", [
      "/services", "/case-types", "/locations", "/team", "/about", "/contact", "/knowledge", "/guides",
      "/white-papers", "/insights", "/case-studies", "/credentials", "/methods", "/compare", "/attorneys",
      "/jurisdictions", "/resources/faq",
    ]);
  });

  it("no shell outside the city tiers carries a sister-practice credential abbreviation, an em or en dash, or a section sign", () => {
    // The city and service x city tiers repeat the state copy; the walk covers
    // every other shell (core, hubs, editorial, team, pillars, variants,
    // pairs, states, service x state, case-type and credential tiers).
    const BANNED = /CLCP|CNLCP|\bCRC\b|MSCC|[–—§]/;
    const skipDir = (rel) => /^(locations|services)\/[^/]+\/[^/]+$/.test(rel);
    const offenders = [];
    const walk = (dir, rel) => {
      for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        const r = rel ? `${rel}/${entry}` : entry;
        if (statSync(p).isDirectory()) {
          if (r.startsWith("assets")) continue;
          if (skipDir(r)) continue;
          walk(p, r);
        } else if (entry === "index.html" || entry === "404.html") {
          const html = readFileSync(p, "utf8");
          const m = html.match(BANNED);
          if (m) offenders.push(`${r}: ${m[0]}`);
        }
      }
    };
    walk(DIST, "");
    expect(offenders).toEqual([]);
  });

  it("brand: every sampled shell names the practice in its title or description", () => {
    for (const route of sample) {
      const shell = readShell(route);
      expect(`${titleOf(shell)} ${descriptionOf(shell)}`, route).toContain(ORG_NAME);
    }
  });
});
