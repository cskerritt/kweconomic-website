/**
 * KW Economics sitemap generator
 *
 * Writes a sitemap INDEX at public/sitemap.xml (the URL Search Console has on
 * file - an index at the same path keeps the existing submission valid) plus
 * per-section child sitemaps:
 *
 *   public/sitemap-core.xml         - core pages, hubs, team, guides, compare,
 *                                     methods, insights, knowledge,
 *                                     white-papers, attorney journey pages
 *   public/sitemap-services.xml     - /services subtree (pillars, variants,
 *                                     declared service x case, service x state,
 *                                     gated service x state x city)
 *   public/sitemap-locations.xml    - /locations subtree (hub, states, cities)
 *   public/sitemap-case-types.xml   - /case-types subtree
 *   public/sitemap-credentials.xml  - /credentials subtree
 *
 * The index also references public/image-sitemap.xml (written by
 * generate-extra-sitemaps.mjs later in the same build) and, only while an
 * insight post is inside the two-day Google News window, news-sitemap.xml
 * (scripts/lib/news-sitemap.mjs decides; generate-extra-sitemaps.mjs writes
 * or removes the file and keeps the index and robots.txt in step with it).
 *
 * Crawl-budget gating: Service x State x City combo pages ride the sitemap
 * only when src/data/contentReadiness.ts marks them sitemap-ready (top cities
 * per state plus prerendered metro-labor cities). Gated pages stay live,
 * prerendered, linked, and indexable - they are just not advertised. T08
 * decision (site audit 2026-09-05): the audit listed the 2,772 gated combos
 * and the gate stays; widening it is a change to SERVICE_CITY_SITEMAP_TOP
 * there (with the services child ceiling in scripts/sitemap-index.test.mjs),
 * made only on Search Console evidence.
 *
 * lastmod policy: emitted only where a real date is derivable from source data
 * (the dateModified / publishedDate an entry carries: insights, guides,
 * comparisons, knowledge guides, white papers, methods, attorney journeys, the
 * site FAQ, and any service entry that records one). Stamping the build date
 * on every URL made lastmod meaningless, so non-derivable entries omit it
 * (allowed by the sitemaps.org spec).
 *
 * Run: node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";
import { pillarServiceSlugs } from "./lib/service-slugs.mjs";
import { NEWS_SITEMAP_FILE, recentNewsPosts } from "./lib/news-sitemap.mjs";
import { SITE_URL as BASE } from "./lib/site.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DATA = join(ROOT, "src", "data");
const PUBLIC = join(ROOT, "public");

function extractSlugs(file) {
  const content = readFileSync(join(SRC_DATA, file), "utf-8");
  return [...content.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

// Load the content-readiness gate and the dated data modules (TS) the same
// way generate-llms.mjs / generate-extra-sitemaps.mjs load data modules. The
// dates come from the modules themselves rather than a regex over the source,
// so an entry that references a shared constant (journeys.ts) or adds a field
// later is read exactly as the React page reads it.
async function loadDataModules() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@": join(ROOT, "src") } },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  const load = (p) => server.ssrLoadModule(p);
  const [readiness, insights, guides, comparisons, knowledge, whitePapers, methods, journeys, faqs, services] =
    await Promise.all([
      load("/src/data/contentReadiness.ts"),
      load("/src/data/insights.ts"),
      load("/src/data/guides.ts"),
      load("/src/data/comparisons.ts"),
      load("/src/data/knowledge.ts"),
      load("/src/data/whitePapers.ts"),
      load("/src/data/methods.ts"),
      load("/src/data/journeys.ts"),
      load("/src/data/faqs.ts"),
      load("/src/data/services.ts"),
    ]);
  await server.close();
  return { readiness, insights, guides, comparisons, knowledge, whitePapers, methods, journeys, faqs, services };
}

const states = extractSlugs("states.ts");
// Pillar services only: `pillar: false` entries (the vocational and life care
// plan cross-sells) are never advertised. Object-boundary split lives in
// scripts/lib/service-slugs.mjs.
const serviceSlugs = pillarServiceSlugs(
  readFileSync(join(SRC_DATA, "services.ts"), "utf-8"),
);
const caseTypes = extractSlugs("caseTypes.ts");
const credentials = extractSlugs("credentials.ts");
const methods = extractSlugs("methods.ts");
const team = extractSlugs("team.ts");
const guides = extractSlugs("guides.ts");
const comparisons = extractSlugs("comparisons.ts");

// Routes registered in src/App.tsx only. The retired vocational-site surfaces
// (intake, forms, PHQ/HIPAA downloads, economic tools) have no route on
// this site and are neither advertised nor prerendered.
const CORE = [
  "/", "/about", "/team", "/contact",
  "/services", "/locations",
  "/resources/faq",
  "/knowledge", "/insights", "/case-studies",
  "/schedule-consultation", "/privacy", "/terms",
  "/case-types", "/credentials", "/guides", "/compare", "/methods",
  "/jurisdictions", "/attorneys",
];

// Prerender window: cities per state that get a Service x State x City page
// (scripts/prerender.mjs slices each state's city file to its first N entries
// in file order; src/lib/geo-links.ts mirrors it for the React link mesh).
// The readiness gate below advertises a SUBSET of this window in the sitemap
// (src/data/contentReadiness.ts; the gate stays by the T08 decision of
// 2026-09-05).
const SERVICE_CITY_TOP = 10;

const data = await loadDataModules();
const { sitemapReadyCitySlugs, SERVICE_CITY_PRERENDER_TOP } = data.readiness;
if (SERVICE_CITY_PRERENDER_TOP !== SERVICE_CITY_TOP) {
  throw new Error(
    `SERVICE_CITY_PRERENDER_TOP (${SERVICE_CITY_PRERENDER_TOP}) in src/data/contentReadiness.ts ` +
      `!= SERVICE_CITY_TOP (${SERVICE_CITY_TOP}); the sitemap would advertise pages ` +
      `prerender.mjs does not write. Realign the constants.`,
  );
}

const urls = new Set();

CORE.forEach((u) => urls.add(u));
serviceSlugs.forEach((s) => {
  urls.add(`/services/${s}`);
  urls.add(`/services/${s}/cost`);
  urls.add(`/services/${s}/process`);
  urls.add(`/services/${s}/timeline`);
});
caseTypes.forEach((c) => {
  urls.add(`/case-types/${c}`);
  states.forEach((st) => urls.add(`/case-types/${c}/${st}`));
});
// Service x case type: only the pairs a pillar declares in services.ts, from
// the same helper scripts/prerender.mjs enumerates (serviceCaseTypePairs()).
// An undeclared pair has no shell and server.js 301s its address to the
// pillar, so it is never advertised.
for (const { path } of data.services.serviceCaseTypePairs()) urls.add(path);
credentials.forEach((c) => {
  urls.add(`/credentials/${c}`);
  states.forEach((st) => urls.add(`/credentials/${c}/${st}`));
});
methods.forEach((m) => urls.add(`/methods/${m}`));
// White papers (email-gated long-form content) - new non-thin pages.
urls.add("/white-papers");
extractSlugs("whitePapers.ts").forEach((w) => urls.add(`/white-papers/${w}`));
// Knowledge guides and insight posts - prerendered article pages linked from the hubs.
extractSlugs("knowledge.ts").forEach((k) => urls.add(`/knowledge/${k}`));
extractSlugs("insights.ts").forEach((i) => urls.add(`/insights/${i}`));
team.forEach((t) => urls.add(`/team/${t}`));
guides.forEach((g) => urls.add(`/guides/${g}`));
comparisons.forEach((c) => urls.add(`/compare/${c}`));

// Geographic pages: state hubs, city pages, and service x state. These are
// prerendered local-SEO landing pages (state narrative, wage and cost-of-living
// context, courts, state damages rules).
const cityFiles = readdirSync(join(SRC_DATA, "cities")).filter(
  (f) => f.endsWith(".ts") && f !== "index.ts",
);
const citiesByState = {};
for (const file of cityFiles) {
  const content = readFileSync(join(SRC_DATA, "cities", file), "utf-8");
  const stateSlug = file.replace(".ts", "");
  citiesByState[stateSlug] = [
    ...content.matchAll(/slug:\s*"([^"]+)"/g),
  ].map((m) => m[1]);
}
states.forEach((st) => {
  urls.add(`/locations/${st}`);
  (citiesByState[st] || []).forEach((c) => urls.add(`/locations/${st}/${c}`));
  serviceSlugs.forEach((s) => {
    urls.add(`/services/${s}/${st}`);
    // Service x State x City: intentional local-SEO landing pages. Only the
    // contentReadiness sitemap-ready subset is advertised (crawl-budget
    // concentration); the rest of the prerendered top cities stay live and
    // linked from the Service x State page, just not in the sitemap.
    sitemapReadyCitySlugs(st, citiesByState[st] || []).forEach((c) =>
      urls.add(`/services/${s}/${st}/${c}`),
    );
  });
});

// Attorney journey pages: 4 stage index pages + 4 stages x 14 case types
["considering", "retaining", "preparing-deposition", "trial"].forEach((stage) => {
  urls.add(`/attorneys/${stage}`);
  caseTypes.forEach((c) => urls.add(`/attorneys/${stage}/${c}`));
});

// ---------------------------------------------------------------------------
// lastmod: one map from route to the date its data entry records.
// ---------------------------------------------------------------------------
const lastmodOverrides = new Map();
const setDate = (route, date) => {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) lastmodOverrides.set(route, date);
};
for (const p of data.insights.insightPosts) setDate(`/insights/${p.slug}`, p.dateModified ?? p.publishedDate);
for (const g of data.guides.guides) setDate(`/guides/${g.slug}`, g.dateModified);
for (const c of data.comparisons.comparisons) setDate(`/compare/${c.slug}`, c.dateModified);
for (const k of data.knowledge.knowledgeGuides) setDate(`/knowledge/${k.slug}`, k.dateModified);
for (const w of data.whitePapers.whitePapers) setDate(`/white-papers/${w.slug}`, w.dateModified ?? w.datePublished);
for (const m of data.methods.methods) setDate(`/methods/${m.slug}`, m.dateModified);
for (const j of data.journeys.journeys) setDate(`/attorneys/${j.stage}/${j.caseTypeSlug}`, j.dateModified);
setDate("/resources/faq", data.faqs.FAQ_DATE_MODIFIED);
// A service entry that records dateModified stamps its pillar page, the three
// engagement-detail variants, and its declared case-type pages; undated
// entries (the norm today) stay without lastmod rather than taking the build date.
for (const s of data.services.pillarServices()) {
  if (!s.dateModified) continue;
  setDate(`/services/${s.slug}`, s.dateModified);
  for (const v of ["cost", "process", "timeline"]) setDate(`/services/${s.slug}/${v}`, s.dateModified);
  for (const ct of s.caseTypes ?? []) setDate(`/services/${s.slug}/case/${ct}`, s.dateModified);
}

// PSA retainer intake forms: the unified /contact/intake form replaced the
// separate Personal Injury + Matrimonial routes (spec 2026-07-16); those two
// 301 to /contact/intake, so the sitemap must not list them. The unified form
// itself is a client-only noindex route and is deliberately NOT in the sitemap.
const RETAINER_INTAKE_PATHS = new Set([]);

function priorityFor(u) {
  if (RETAINER_INTAKE_PATHS.has(u)) return "0.6";
  return null;
}

// ---------------------------------------------------------------------------
// Partition into per-section child sitemaps and write the index.
// ---------------------------------------------------------------------------

function sectionOf(u) {
  if (u === "/services" || u.startsWith("/services/")) return "services";
  if (u === "/locations" || u.startsWith("/locations/")) return "locations";
  if (u === "/case-types" || u.startsWith("/case-types/")) return "case-types";
  if (u === "/credentials" || u.startsWith("/credentials/")) return "credentials";
  return "core";
}

// Order here is the order in the index file.
const SECTIONS = ["core", "services", "locations", "case-types", "credentials"];
const childFileFor = (section) => `sitemap-${section}.xml`;

function renderUrlEntry(u) {
  const loc = `${BASE}${u === "/" ? "" : u}`;
  const lastmod = lastmodOverrides.get(u);
  const lastmodXml = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  const priority = priorityFor(u);
  const priorityXml = priority ? `<priority>${priority}</priority>` : "";
  return `  <url><loc>${loc}</loc>${lastmodXml}<changefreq>monthly</changefreq>${priorityXml}</url>`;
}

const bySection = new Map(SECTIONS.map((s) => [s, []]));
for (const u of [...urls].sort()) {
  bySection.get(sectionOf(u)).push(u);
}

const counts = [];
for (const section of SECTIONS) {
  const sectionUrls = bySection.get(section);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sectionUrls.map(renderUrlEntry).join("\n")}
</urlset>
`;
  writeFileSync(join(PUBLIC, childFileFor(section)), xml);
  counts.push(`${childFileFor(section)}: ${sectionUrls.length}`);
}

// The index lives at /sitemap.xml (same path Search Console already has).
// image-sitemap.xml and news-sitemap.xml are generated by
// generate-extra-sitemaps.mjs in the same build; the news child joins the
// index only while an insight post is inside the Google News window, the same
// rule that script applies when it writes or removes the file (and it
// reconciles this index to the file on disk). No <lastmod> on index entries:
// the children regenerate every deploy, so a build-date stamp would say
// nothing about content freshness.
const newsPosts = recentNewsPosts(data.insights.insightPosts, new Date());
const indexChildren = [
  ...SECTIONS.map(childFileFor),
  "image-sitemap.xml",
  ...(newsPosts.length ? [NEWS_SITEMAP_FILE] : []),
];
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexChildren.map((f) => `  <sitemap><loc>${BASE}/${f}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;
writeFileSync(join(PUBLIC, "sitemap.xml"), indexXml);

console.log(
  `Sitemap index generated: ${urls.size} URLs across ${SECTIONS.length} child sitemaps (${counts.join(", ")}); ${lastmodOverrides.size} dated; ` +
    `${NEWS_SITEMAP_FILE} ${newsPosts.length ? `listed (${newsPosts.length} post(s) in the two-day news window)` : "not listed (no post in the two-day news window)"}`,
);
