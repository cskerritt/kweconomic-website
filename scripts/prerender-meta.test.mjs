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
  "/tools": "Tools.tsx",
  "/tools/life-expectancy": "LifeExpectancy.tsx",
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

  it("every prerendered title carries the LCP brand, never the vocational one", () => {
    for (const path of Object.keys(FIXED_ROUTES)) {
      const { title, description } = prerenderMeta(path);
      expect(`${title} ${description}`, path).toMatch(/KW Life Care Planning|KW LCP/);
    }
  });

  it("the homepage FAQ comes from the shared module on both sides", () => {
    expect(prerenderSrc).toContain('from "../src/data/home-faqs.mjs"');
    expect(read("src/pages/Home.tsx")).toContain('from "@/data/home-faqs.mjs"');
    expect(prerenderSrc).toContain("buildFaqJsonLd(HOME_FAQS, `${BASE_URL}/`)");
  });
});

describe("retired vocational-site routes are neither prerendered nor advertised", () => {
  const RETIRED = [
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
