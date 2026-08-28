/**
 * KW Life Care Planning sitemap generator
 *
 * Writes a sitemap INDEX at public/sitemap.xml (the URL Search Console has on
 * file - an index at the same path keeps the existing submission valid) plus
 * per-section child sitemaps:
 *
 *   public/sitemap-core.xml         - core pages, hubs, team, guides, compare,
 *                                     methods, insights, knowledge,
 *                                     white-papers, attorney journey pages
 *   public/sitemap-services.xml     - /services subtree (pillars, variants,
 *                                     service x case, service x state, gated
 *                                     service x state x city)
 *   public/sitemap-locations.xml    - /locations subtree (hub, states, cities)
 *   public/sitemap-case-types.xml   - /case-types subtree
 *   public/sitemap-credentials.xml  - /credentials subtree
 *
 * The index also references public/image-sitemap.xml (written by
 * generate-extra-sitemaps.mjs later in the same build). news-sitemap.xml stays
 * out of the index; robots.txt declares it separately.
 *
 * Crawl-budget gating: Service x State x City combo pages ride the sitemap
 * only when src/data/contentReadiness.ts marks them sitemap-ready (top cities
 * per state plus prerendered metro-labor cities). Gated pages stay live,
 * prerendered, linked, and indexable - they are just not advertised.
 *
 * lastmod policy: emitted only where a real date is derivable from source data
 * (insights dateModified/publishedDate).
 * Stamping the build date on every URL made lastmod meaningless, so
 * non-derivable entries omit it (allowed by the sitemaps.org spec).
 *
 * Run: node scripts/generate-sitemap.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";
import { pillarServiceSlugs } from "./lib/service-slugs.mjs";
import { SITE_URL as BASE } from "./lib/site.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC_DATA = join(ROOT, "src", "data");
const PUBLIC = join(ROOT, "public");

function extractSlugs(file) {
  const content = readFileSync(join(SRC_DATA, file), "utf-8");
  return [...content.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

// Extract slug -> lastmod for insight posts. Block-wise (not positional zip)
// because dateModified is optional per entry; the interface block has no
// quoted slug and is skipped.
function extractInsightDates() {
  const content = readFileSync(join(SRC_DATA, "insights.ts"), "utf-8");
  const map = new Map();
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*slug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const date =
      block.match(/dateModified:\s*"([^"]+)"/)?.[1] ||
      block.match(/publishedDate:\s*"([^"]+)"/)?.[1];
    if (date) map.set(slug, date);
  }
  return map;
}

// Load the content-readiness gate (a TS module) the same way
// generate-llms.mjs / generate-extra-sitemaps.mjs load data modules.
async function loadContentReadiness() {
  const server = await createServer({
    root: ROOT,
    configFile: false,
    logLevel: "error",
    resolve: { alias: { "@": join(ROOT, "src") } },
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  const mod = await server.ssrLoadModule("/src/data/contentReadiness.ts");
  await server.close();
  return mod;
}

const states = extractSlugs("states.ts");
// Pillar services only: `pillar: false` entries (forensic economics cross-sell)
// are never advertised. Object-boundary split lives in scripts/lib/service-slugs.mjs.
const serviceSlugs = pillarServiceSlugs(
  readFileSync(join(SRC_DATA, "services.ts"), "utf-8"),
);
const caseTypes = extractSlugs("caseTypes.ts");
const credentials = extractSlugs("credentials.ts");
const methods = extractSlugs("methods.ts");
const team = extractSlugs("team.ts");
const guides = extractSlugs("guides.ts");
const comparisons = extractSlugs("comparisons.ts");
const insightDates = extractInsightDates();

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
// The readiness gate below advertises a SUBSET of this window in the sitemap.
const SERVICE_CITY_TOP = 10;

const { sitemapReadyCitySlugs, SERVICE_CITY_PRERENDER_TOP } =
  await loadContentReadiness();
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
  serviceSlugs.forEach((s) => {
    urls.add(`/services/${s}/case/${c}`);
  });
});
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
// prerendered local-SEO landing pages (state narrative, labor, courts, VR
// regulations) that were previously omitted from the sitemap.
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

// Attorney journey pages: 4 stage index pages + 4 stages × 12 case types
["considering", "retaining", "preparing-deposition", "trial"].forEach((stage) => {
  urls.add(`/attorneys/${stage}`);
  caseTypes.forEach((c) => urls.add(`/attorneys/${stage}/${c}`));
});

const lastmodOverrides = new Map();
for (const [slug, date] of insightDates) {
  lastmodOverrides.set(`/insights/${slug}`, date);
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
// image-sitemap.xml is generated by generate-extra-sitemaps.mjs in the same
// build. No <lastmod> on index entries: the children regenerate every deploy,
// so a build-date stamp would say nothing about content freshness.
const indexChildren = [
  ...SECTIONS.map(childFileFor),
  "image-sitemap.xml",
];
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexChildren.map((f) => `  <sitemap><loc>${BASE}/${f}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;
writeFileSync(join(PUBLIC, "sitemap.xml"), indexXml);

console.log(
  `Sitemap index generated: ${urls.size} URLs across ${SECTIONS.length} child sitemaps (${counts.join(", ")})`,
);
