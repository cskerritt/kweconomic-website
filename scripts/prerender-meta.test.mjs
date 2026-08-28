// scripts/prerender-meta.test.mjs
//
// Pins the static shells scripts/prerender.mjs writes for the fixed routes to
// the usePageMeta() title/description of the React page at the same path, so
// the prerendered <title>/<meta description> and the hydrated page never
// advertise different primary signals. Source-read (vitest env is "node", no
// jsdom) - the same approach as src/App.routes.test.mjs.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ORG_NAME, ORG_SHORT, SITE_URL } from "./lib/site.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const prerenderSrc = read("scripts/prerender.mjs");
const sitemapSrc = read("scripts/generate-sitemap.mjs");

// Resolve the brand tokens the way both sides do at runtime.
const TOKENS = { ORG_NAME, ORG_SHORT, SITE_URL, DOMAIN: new URL(SITE_URL).host };
const resolve = (literal) =>
  literal
    .slice(1, -1) // strip the surrounding quotes/backticks
    .replace(/\$\{(\w+)\}/g, (_, k) => {
      if (!(k in TOKENS)) throw new Error(`unresolvable token \${${k}} in ${literal}`);
      return TOKENS[k];
    });

const STR = "(`[^`]*`|\"[^\"]*\")";

/** prerender.mjs: `{ path: "/x", title: ..., description: ... }` entries. */
function prerenderMeta(path) {
  const re = new RegExp(`path: "${path.replace(/[/.]/g, "\\$&")}",\\s*title: ${STR},\\s*description:\\s*${STR}`);
  const m = prerenderSrc.match(re);
  if (!m) throw new Error(`prerender.mjs has no core entry for ${path}`);
  return { title: resolve(m[1]), description: resolve(m[2]) };
}

/** React page: the first usePageMeta({ title, description }) literal pair. */
function pageMeta(file) {
  const src = read(`src/pages/${file}`);
  const re = new RegExp(`usePageMeta\\(\\{\\s*title: ${STR},\\s*description:\\s*${STR}`);
  const m = src.match(re);
  if (!m) throw new Error(`${file} has no literal usePageMeta title/description`);
  return { title: resolve(m[1]), description: resolve(m[2]) };
}

const FIXED_ROUTES = {
  "/": "Home.tsx",
  "/about": "About.tsx",
  "/team": "Team.tsx",
  "/contact": "Contact.tsx",
  "/services": "ServicesHub.tsx",
  "/locations": "LocationsHub.tsx",
  "/resources/faq": "FAQ.tsx",
  "/knowledge": "KnowledgeHub.tsx",
  "/insights": "InsightsHub.tsx",
  "/case-studies": "CaseStudies.tsx",
  "/schedule-consultation": "ScheduleConsultation.tsx",
  "/privacy": "Privacy.tsx",
  "/terms": "Terms.tsx",
  "/white-papers": "WhitePapersHub.tsx",
  "/case-types": "hubs/CaseTypesHubPage.tsx",
  "/credentials": "hubs/CredentialsHubPage.tsx",
  "/guides": "hubs/GuidesHubPage.tsx",
  "/compare": "hubs/ComparisonsHubPage.tsx",
  "/methods": "hubs/MethodsHubPage.tsx",
  "/jurisdictions": "hubs/JurisdictionsHubPage.tsx",
  "/attorneys": "hubs/AttorneysHubPage.tsx",
};

describe("prerender shells mirror the React page meta", () => {
  for (const [path, file] of Object.entries(FIXED_ROUTES)) {
    it(`${path} title + description match ${file}`, () => {
      expect(prerenderMeta(path)).toEqual(pageMeta(file));
    });
  }

  it("every prerendered title carries the site brand", () => {
    const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const brand = new RegExp([...new Set([ORG_NAME, ORG_SHORT])].map(escape).join("|"));
    for (const path of Object.keys(FIXED_ROUTES)) {
      const { title, description } = prerenderMeta(path);
      expect(`${title} ${description}`, path).toMatch(brand);
    }
  });

  it("the homepage FAQ comes from the shared module on both sides", () => {
    expect(prerenderSrc).toContain('from "../src/data/home-faqs.mjs"');
    expect(read("src/pages/Home.tsx")).toContain('from "@/data/home-faqs.mjs"');
    expect(prerenderSrc).toContain("buildFaqJsonLd(HOME_FAQS, `${BASE_URL}/`)");
  });
});

// Templated routes (case-type hub, case-type x state). The shells and the React
// templates interpolate different variable names (`c.name` vs `caseType.name`),
// so every data expression collapses to a `${}` slot and only the brand tokens
// resolve before the two sides are compared.
const slotify = (literal) =>
  literal.slice(1, -1).replace(/\$\{([^}]*)\}/g, (_, expr) => (expr in TOKENS ? TOKENS[expr] : "${}"));

/** prerender.mjs: `path: \`/x/${c.slug}\`, [// comment] title: ..., description: ...` */
function prerenderTemplateMeta(pathLiteral) {
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`path: ${escape(pathLiteral)},(?:\\s*//[^\\n]*)*\\s*title: ${STR},\\s*description:\\s*${STR}`);
  const m = prerenderSrc.match(re);
  if (!m) throw new Error(`prerender.mjs has no templated entry for ${pathLiteral}`);
  return { title: slotify(m[1]), description: slotify(m[2]) };
}

/** React template: the first `title: ..., description: ...` pair inside usePageMeta(...). */
function templateMeta(file) {
  const src = read(`src/pages/templates/${file}`);
  const re = new RegExp(`usePageMeta\\([^]*?title: ${STR},\\s*description:\\s*${STR}`);
  const m = src.match(re);
  if (!m) throw new Error(`${file} has no usePageMeta title/description`);
  return { title: slotify(m[1]), description: slotify(m[2]) };
}

const TEMPLATED_ROUTES = {
  "`/case-types/${c.slug}`": "CaseTypeHub.tsx",
  "`/case-types/${c.slug}/${s.slug}`": "CaseTypeState.tsx",
  // CredentialHub.tsx describes with truncateAtWord(scope), not a literal, so
  // only the credential x state template is pinned here.
  "`/credentials/${c.slug}/${s.slug}`": "CredentialState.tsx",
};

describe("prerender shells mirror the templated case-type and credential page meta", () => {
  for (const [pathLiteral, file] of Object.entries(TEMPLATED_ROUTES)) {
    it(`${pathLiteral} title + description match ${file}`, () => {
      expect(prerenderTemplateMeta(pathLiteral)).toEqual(templateMeta(file));
    });
  }
});

describe("retired vocational-site routes are neither prerendered nor advertised", () => {
  const RETIRED = [
    "/tools",
    "/tools/life-expectancy",
    "/intake",
    "/forms",
    "/phq-form-english",
    "/phq-form-spanish",
    "/hipaa-english",
    "/hipaa-spanish",
    "/tools/economic-damages-estimator",
    "/tools/household-services",
    "/tools/household-services/methodology",
    "/services/expert-disclosure",
  ];
  it("prerender.mjs emits no shell for them", () => {
    for (const r of RETIRED) expect(prerenderSrc, r).not.toContain(`"${r}"`);
  });
  it("generate-sitemap.mjs CORE does not list them", () => {
    for (const r of RETIRED) expect(sitemapSrc, r).not.toContain(`"${r}"`);
  });
});

// The static shells carry the only copy a non-JS crawler ever sees for ~8.5k
// routes, so no inherited life-care-planning or vocational claim may survive
// in prerender.mjs's shell text (titles, descriptions, innerHtml, comments).
// "life care plan" as the subject of a cost projection is allowed; the
// planner, the certification, and the physician-review claim are not.
describe("prerender shell text is economics-framed", () => {
  const BANNED = /life care planner|CLCP|CNLCP|physician|KW LCP|kwlcp|Life Care Planning|KWVRS|Kincaid Wolstein Vocational|vocational expert/i;
  it("scripts/prerender.mjs matches no sister-practice phrasing", () => {
    const hits = prerenderSrc
      .split("\n")
      .map((line, i) => (BANNED.test(line) ? `${i + 1}: ${line.trim().slice(0, 140)}` : null))
      .filter(Boolean);
    expect(hits).toEqual([]);
  });
  it("refuses to emit shells for both cross-sell service routes", () => {
    expect(prerenderSrc).toContain('"/services/vocational-evaluation"');
    expect(prerenderSrc).toContain('"/services/life-care-planning"');
    expect(prerenderSrc).not.toContain('"/services/forensic-economics"');
  });
});
