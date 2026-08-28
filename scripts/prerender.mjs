/**
 * KW Life Care Planning Pre-render Script
 *
 * Generates static HTML files for every route after vite build completes.
 * Each file contains correct meta tags, title, description, canonical URL,
 * schema.org JSON-LD, and a basic HTML content skeleton so that search
 * engines can index the content before JavaScript loads and React hydrates.
 *
 * Run: node scripts/prerender.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { pillarServiceEntries } from "./lib/service-slugs.mjs";
import { ORG_NAME, ORG_SHORT, ORG_PHONE, ORG_PHONE_DISPLAY, SITE_URL } from "./lib/site.mjs";
import { homepageFaqs } from "../src/data/home-faqs.mjs";
import * as geoProse from "../src/data/geo-prose.mjs";
import { createGeoNarrators, extractCityDataByState } from "./lib/geo-inputs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SRC_DATA = join(ROOT, "src", "data");
// Brand identity comes from scripts/lib/site.mjs (mirror of src/lib/brand.ts).
const BASE_URL = SITE_URL;
const COMPANY = ORG_NAME;
const DOMAIN = new URL(SITE_URL).host;
// Raster logo for structured-data logo/image fields - Google's rich-results
// guidelines prefer PNG/JPG over SVG. Mirrors ORG_LOGO in src/lib/schema.ts so
// non-JS crawlers see the same logo the React-injected Organization schema emits.
const LOGO_URL = `${BASE_URL}/images/logo.png`;
const ORG_LOGO_IMAGE = { "@type": "ImageObject", url: LOGO_URL };

// ---------------------------------------------------------------------------
// 1. Read the built dist/index.html as the template
// ---------------------------------------------------------------------------
const template = readFileSync(join(DIST, "index.html"), "utf-8");

// ---------------------------------------------------------------------------
// 2. Extract data from TypeScript source files using regex
// ---------------------------------------------------------------------------

function extractPairs(content, slugPattern, namePattern) {
  const slugs = [...content.matchAll(slugPattern)].map((m) => m[1]);
  const names = [...content.matchAll(namePattern)].map((m) => m[1]);
  // These two passes are zipped positionally (the i-th slug pairs with the i-th
  // name). That holds only while every object has exactly one of each in the same
  // order; a stray or missing field shifts the alignment and would silently ship
  // mis-paired pages (the `|| slug` fallback hides it). Fail the build loudly on a
  // count mismatch instead so the data file / pattern gets fixed.
  if (slugs.length !== names.length) {
    throw new Error(
      `extractPairs count mismatch: ${slugs.length} slug(s) vs ${names.length} ` +
        `${namePattern.source} match(es) (first slug: "${slugs[0] ?? "?"}"). ` +
        `Fix the data file or the namePattern - positional zipping requires equal counts.`,
    );
  }
  return slugs.map((slug, i) => ({ slug, name: names[i] || slug }));
}

// States
const statesContent = readFileSync(join(SRC_DATA, "states.ts"), "utf-8");
const stateData = extractPairs(
  statesContent,
  /slug:\s*"([^"]+)"/g,
  /\bname:\s*"([^"]+)"/g
);

// Services - pillar entries only. `pillar: false` entries (the forensic
// economics cross-sell) are client-rendered noindex cards and are never
// prerendered; see scripts/lib/service-slugs.mjs for the object-boundary split.
const serviceData = pillarServiceEntries(
  readFileSync(join(SRC_DATA, "services.ts"), "utf-8"),
);

// Knowledge guides
const knowledgeContent = readFileSync(join(SRC_DATA, "knowledge.ts"), "utf-8");
const guideData = extractPairs(
  knowledgeContent,
  /slug:\s*"([^"]+)"/g,
  /title:\s*"([^"]+)"/g
);

// Insight posts
const insightsContent = readFileSync(join(SRC_DATA, "insights.ts"), "utf-8");
const postData = extractPairs(
  insightsContent,
  /slug:\s*"([^"]+)"/g,
  /title:\s*"([^"]+)"/g
);

/**
 * Extract top-level entries (slug + title) from a data file where each entry
 * is indented at 2 spaces and `slug:` and `title:` appear on consecutive lines
 * at 4-space indent. Avoids matching nested `title:` fields in related/sources.
 */
function extractTopLevelPairs(content) {
  const re = /^ {2}\{\s*\n {4}slug:\s*"([^"]+)",\s*\n {4}title:\s*"([^"]+)"/gm;
  const pairs = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    pairs.push({ slug: m[1], name: m[2] });
  }
  return pairs;
}

// Guides (`/guides/:slug`)
const guidesContent = readFileSync(join(SRC_DATA, "guides.ts"), "utf-8");
const guideSlugData = extractTopLevelPairs(guidesContent);

// Comparisons (`/compare/:slug`)
const comparisonsContent = readFileSync(join(SRC_DATA, "comparisons.ts"), "utf-8");
const comparisonData = extractTopLevelPairs(comparisonsContent);

/**
 * Extract authorSlug + dateModified per entry. Both fields are optional.
 * Returns map slug -> { authorSlug, dateModified }.
 */
function extractAuthorMap(content) {
  const map = {};
  const blocks = content.split(/(?=\n\s*\{\s*\n\s*slug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const authorSlug = block.match(/authorSlug:\s*"([^"]+)"/)?.[1];
    const dateModified = block.match(/dateModified:\s*"([^"]+)"/)?.[1];
    const publishedDate = block.match(/publishedDate:\s*"([^"]+)"/)?.[1];
    map[slug] = {
      authorSlug,
      dateModified: dateModified ?? publishedDate,
      publishedDate,
    };
  }
  return map;
}
const insightAuthorMap = extractAuthorMap(insightsContent);
const guideAuthorMap = extractAuthorMap(knowledgeContent);

// Build a simple team map (slug -> { name, credentials[] }) for AuthorByline
// inline rendering. credentials are extracted as the array entries between
// `credentials: [` and the first closing `]`.
const teamContent = readFileSync(join(SRC_DATA, "team.ts"), "utf-8");
const teamMap = (() => {
  const m = {};
  const blocks = teamContent.split(/(?=\n\s*\{\s*\n\s*slug:\s*")/);
  for (const block of blocks) {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    if (!slug) continue;
    const name = block.match(/name:\s*"([^"]+)"/)?.[1];
    const credsBlock = block.match(/credentials:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const credentials = [...credsBlock.matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    m[slug] = { name, credentials };
  }
  return m;
})();

// Cities - one file per state (slug, name, county, msaName per entry).
const cityDataByState = extractCityDataByState(SRC_DATA);

// Build a lookup for state slug -> state name
const stateNameMap = {};
for (const s of stateData) {
  stateNameMap[s.slug] = s.name;
}

// ---------------------------------------------------------------------------
// 2b. Per-state and per-metro narrative inputs.
//
// The sentence templates live in src/data/geo-prose.mjs and are shared with
// the React runtime (src/data/narratives.ts, src/data/geographicFaqs.ts), so
// the static shells carry exactly the copy the hydrated page renders. Only the
// data joins happen here; src/data/narratives.parity.test.mjs pins the two.
// Never feed wages, unemployment, or employer lists into the prose.
// ---------------------------------------------------------------------------

const { buildStateNarrative, buildCityNarrative } = createGeoNarrators(SRC_DATA, ORG_NAME);

// Geo FAQ blocks - thin wrappers over the shared templates.
const stateGeographicFaqs = (stateName) => geoProse.stateGeographicFaqs(ORG_NAME, stateName);
const cityGeographicFaqs = (stateName, cityName) =>
  geoProse.cityGeographicFaqs(ORG_NAME, stateName, cityName);
const serviceStateGeographicFaqs = (serviceName, stateName) =>
  geoProse.serviceStateGeographicFaqs(ORG_NAME, serviceName, stateName);
const serviceCityGeographicFaqs = (serviceName, stateName, cityName) =>
  geoProse.serviceCityGeographicFaqs(ORG_NAME, serviceName, stateName, cityName);

/** Render a list of FAQs as static HTML <details> blocks for the prerender body. */
function renderFaqHtml(faqs, headingText) {
  const items = faqs
    .map(
      (f) =>
        `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`,
    )
    .join("");
  return `<section><h2>${escapeHtml(headingText)}</h2>${items}</section>`;
}

/** Build a FAQPage JSON-LD blob from a list of FAQs. Returns the JSON string ready for inlining. */
function buildFaqJsonLd(faqs, pageUrl) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  });
}

// ---------------------------------------------------------------------------
// 3. Helper: generate a modified index.html for a given route
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPage({ path, title, description, innerHtml, schemaType, extraJsonLd, authorSlug, authorName, datePublished, dateModified }) {
  // Homepage canonical keeps its trailing slash to match use-page-meta (which
  // normalizes every other path to no trailing slash but leaves the root as "/").
  const url = path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`;
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);

  // Schema.org JSON-LD
  let jsonLd;
  if (schemaType === "WebSite") {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: COMPANY,
      url: BASE_URL,
      description: description,
    });
  } else if (schemaType === "LocalBusiness") {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: COMPANY,
      url: url,
      description: description,
      logo: LOGO_URL,
      image: LOGO_URL,
      areaServed: { "@type": "Country", name: "United States" },
    });
  } else if (schemaType === "Service") {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      name: title.replace(` | ${ORG_NAME}`, ""),
      provider: { "@type": "Organization", name: COMPANY, url: BASE_URL, logo: ORG_LOGO_IMAGE },
      url: url,
      description: description,
    });
  } else if (schemaType === "Article") {
    const articleAuthor = authorSlug
      ? { "@type": "Person", "@id": `${BASE_URL}/team/${authorSlug}#person`, name: authorName ?? `${ORG_NAME} Editorial Team` }
      : { "@type": "Organization", name: COMPANY };
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title.replace(` | ${ORG_NAME}`, ""),
      image: LOGO_URL,
      publisher: { "@type": "Organization", name: COMPANY, url: BASE_URL, logo: ORG_LOGO_IMAGE },
      author: articleAuthor,
      url: url,
      description: description,
      ...(datePublished ? { datePublished } : {}),
      ...(dateModified ? { dateModified } : {}),
    });
  } else {
    jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: url,
      description: description,
      publisher: { "@type": "Organization", name: COMPANY, url: BASE_URL, logo: ORG_LOGO_IMAGE },
    });
  }

  const metaTags = `
    <meta name="description" content="${safeDesc}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />
    <script type="application/ld+json">${jsonLd}</script>${extraJsonLd ? `\n    <script type="application/ld+json">${extraJsonLd}</script>` : ""}`;

  let html = template;

  // Strip the template's generic multi-line <meta name="description"> so the
  // page-specific one injected below is the ONLY description tag. Without this,
  // every prerendered page shipped two competing description tags.
  html = html.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/i, "");

  // Replace title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${safeTitle}</title>`
  );

  // Insert meta tags after the <title> tag
  html = html.replace(
    /(<title>[^<]*<\/title>)/,
    (match) => `${match}${metaTags}`
  );

  // Replace <div id="root"></div> with content
  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${innerHtml}</div>`
  );

  return html;
}

// Non-pillar cross-sell routes are client-rendered noindex cards; emitting a
// static shell for them would put an unadvertised, noindex page on disk and
// invite the sitemap/prerender parity test to drift. Hard stop.
const NON_PILLAR_SERVICE_PREFIXES = ["/services/forensic-economics"];

function writePage(routePath, html) {
  for (const prefix of NON_PILLAR_SERVICE_PREFIXES) {
    if (routePath === prefix || routePath.startsWith(`${prefix}/`)) {
      throw new Error(`prerender: refusing to emit non-pillar service route ${routePath}`);
    }
  }
  let filePath;
  if (routePath === "/") {
    filePath = join(DIST, "index.html");
  } else {
    filePath = join(DIST, routePath, "index.html");
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html, "utf-8");
}

// ---------------------------------------------------------------------------
// 4. Generate all pages
// ---------------------------------------------------------------------------

const counts = {
  core: 0,
  servicePillar: 0,
  knowledge: 0,
  insights: 0,
  guides: 0,
  comparisons: 0,
  state: 0,
  city: 0,
  serviceState: 0,
};

// --- Core pages ---

// Every entry mirrors the usePageMeta() title/description of the React page
// at the same path (scripts/prerender-meta.test.mjs pins them) so the static
// shell and the hydrated page advertise the same primary signals.
const HOME_FAQS = homepageFaqs(ORG_NAME, ORG_SHORT);
const corePages = [
  {
    path: "/",
    title: `Life Care Planning Expert Witness Services | ${ORG_NAME}`,
    description:
      "Independent, physician-informed life care plans and medical cost projections for plaintiff and defense attorneys in all 50 states. Response in 1 business day.",
    innerHtml:
      `<h1>Life Care Plans That Document the Future of Care</h1>` +
      `<p>${ORG_NAME} produces independent, evidence-based life care plans and medical cost projections for plaintiff and defense counsel in all 50 states, the District of Columbia, and U.S. territories.</p>` +
      `<p>Engagements accepted in all 50 states, the District of Columbia, and U.S. territories. Headquarters in Hackensack, NJ with a Richmond, VA office. <a href="tel:${ORG_PHONE.replace(/-/g, "")}">${ORG_PHONE_DISPLAY}</a>.</p>` +
      // FAQ block - the same copy Home.tsx renders (shared src/data/home-faqs.mjs).
      renderFaqHtml(HOME_FAQS, "Common questions") +
      `<nav><a href="/services">Services</a> <a href="/locations">Locations</a> <a href="/about">About</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebSite",
    extraJsonLd: buildFaqJsonLd(HOME_FAQS, `${BASE_URL}/`),
  },
  {
    path: "/about",
    title: `About ${ORG_NAME} - Independent, Physician-Informed Life Care Planning`,
    description:
      `${ORG_NAME} prepares independent, physician-informed life care plans and medical cost projections for plaintiff and defense attorneys in all 50 states.`,
    innerHtml:
      `<h1>About ${ORG_NAME}</h1><p>${ORG_NAME} is a nationwide practice preparing independent, physician-informed life care plans, medical cost projections, plan rebuttals, and Medicare set-aside allocations for plaintiff and defense counsel.</p><nav><a href="/team">Our Team</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "LocalBusiness",
  },
  {
    path: "/team",
    title: `Our Team | ${ORG_NAME}`,
    description:
      "Meet the KW Life Care Planning team - a board-certified physician, doctoral-level Certified Life Care Planners, a Medicare Set-Aside Certified Consultant, and a registered nurse life care planner serving attorneys nationwide.",
    innerHtml:
      `<h1>Our Team</h1><p>The ${ORG_NAME} team brings together a board-certified physician, Certified Life Care Planners, a Medicare Set-Aside Certified Consultant, and a registered nurse life care planner serving attorneys nationwide.</p><nav><a href="/about">About</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebPage",
  },
  {
    path: "/contact",
    title: `Contact Us | ${ORG_NAME}`,
    description:
      `Contact ${ORG_NAME} to discuss a life care plan, medical cost projection, or plan rebuttal for your case. Offices in New Jersey and Virginia; response in 1 business day.`,
    innerHtml:
      `<h1>Contact ${ORG_NAME}</h1><p>Reach out to discuss a life care plan, medical cost projection, or plan rebuttal for your case, or to schedule a consultation.</p><nav><a href="/services">Services</a> <a href="/locations">Locations</a> <a href="/about">About</a></nav>`,
    schemaType: "LocalBusiness",
  },
  {
    path: "/services",
    title: `Life Care Planning Services | ${ORG_NAME}`,
    description:
      `${ORG_NAME} prepares life care plans, pediatric and catastrophic injury plans, medical cost projections, plan rebuttals, and Medicare set-aside allocations - serving all states.`,
    innerHtml:
      `<h1>Life Care Planning Services</h1><p>${ORG_NAME} prepares life care plans, pediatric and catastrophic injury plans, medical cost projections, plan rebuttals, and Medicare set-aside allocations for litigation support nationwide.</p><nav><a href="/services/life-care-planning">Life Care Planning</a> <a href="/services/medical-cost-projection">Medical Cost Projections</a> <a href="/services/life-care-plan-rebuttal">Plan Rebuttal</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "Service",
  },
  {
    path: "/locations",
    title: `Locations | ${ORG_NAME} - Serving All 50 States`,
    description:
      `${ORG_NAME} prepares life care plans and medical cost projections in all 50 states, DC, and U.S. territories. Find your state to learn more.`,
    innerHtml:
      `<h1>Nationwide Coverage</h1><p>${ORG_NAME} accepts cases in all 50 states, the District of Columbia, and U.S. territories. Select a state to learn more about life care planning in your area.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a> <a href="/about">About</a></nav>`,
    schemaType: "WebPage",
  },
  {
    path: "/resources/faq",
    title: `Frequently Asked Questions | ${ORG_NAME}`,
    description:
      `Answers to common questions about ${ORG_NAME}'s life care plans, medical cost projections, plan rebuttals, planner credentials, fees, and nationwide coverage.`,
    innerHtml:
      `<h1>Frequently Asked Questions</h1><p>Find answers to common questions about life care plans, medical cost projections, plan rebuttals, planner credentials, fees, and working with ${ORG_NAME}.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a> <a href="/about">About</a></nav>`,
    schemaType: "WebPage",
  },
];

for (const page of corePages) {
  writePage(page.path, buildPage(page));
  counts.core++;
}

// --- Phase 2 pages ---

const phase2Pages = [
  {
    path: "/knowledge",
    title: `Knowledge Center | ${ORG_NAME}`,
    description:
      "In-depth guides on life care planning, medical cost projection, Medicare set-asides, and expert witness testimony - written for attorneys and other legal professionals.",
    innerHtml:
      '<h1>Knowledge Center</h1><p>Explore in-depth guides on life care planning, medical cost projection, Medicare set-asides, and expert witness testimony.</p><nav><a href="/services">Services</a> <a href="/insights">Insights</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/insights",
    title: `Insights | ${ORG_NAME}`,
    description:
      `Articles on life care planning, medical cost projection, Medicare set-asides, and expert witness standards - from the practitioners at ${ORG_NAME}.`,
    innerHtml:
      '<h1>Insights</h1><p>Articles and analysis on life care planning, medical cost projection, Medicare set-asides, and litigation topics.</p><nav><a href="/knowledge">Knowledge Center</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>',
    schemaType: "WebPage",
  },
  {
    path: "/case-studies",
    title: `Illustrative Life Care Planning Engagements | ${ORG_NAME}`,
    description:
      `${ORG_NAME} prepares life care plans, medical cost projections, and Medicare set-aside allocations for plaintiff and defense counsel. Three anonymized, illustrative engagements show how a plan is built.`,
    innerHtml:
      `<h1>Illustrative Life Care Planning Engagements</h1><p>Anonymized, illustrative engagements showing how ${ORG_NAME} builds a life care plan, a medical cost projection, and a Medicare set-aside allocation.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebPage",
  },
  {
    path: "/schedule-consultation",
    title: `Schedule a Consultation | ${ORG_NAME}`,
    description:
      `Contact ${ORG_NAME} to discuss your case and schedule a consultation with a certified life care planner. Response within one business day.`,
    innerHtml:
      `<h1>Schedule a Consultation</h1><p>Contact ${ORG_NAME} to discuss your case requirements and schedule a consultation with a certified life care planner.</p><nav><a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebPage",
  },
  {
    path: "/privacy",
    title: `Privacy Policy | ${ORG_NAME}`,
    description:
      `Privacy Policy for ${DOMAIN} - how ${ORG_NAME} collects, uses, and protects information on this website.`,
    innerHtml:
      `<h1>Privacy Policy</h1><p>This privacy policy describes how ${ORG_NAME} collects, uses, and protects information through our website.</p>`,
    schemaType: "WebPage",
  },
  {
    path: "/terms",
    title: `Terms of Service | ${ORG_NAME}`,
    description:
      `Terms of Service for ${DOMAIN} - governing your use of the ${ORG_NAME} website.`,
    innerHtml:
      `<h1>Terms of Service</h1><p>Terms governing the use of the ${ORG_NAME} website.</p>`,
    schemaType: "WebPage",
  },
];

for (const page of phase2Pages) {
  writePage(page.path, buildPage(page));
  counts.core++;
}

/**
 * Render an inline "Reviewed by ..." byline for the static HTML.
 * Mirrors the React-side AuthorByline component.
 */
function renderBylineHtml(authorSlug, dateModified) {
  const member = authorSlug ? teamMap[authorSlug] : undefined;
  const displayName = member?.name ?? `${ORG_NAME} Editorial Team`;
  // Filter credentials already in the name (e.g. team names often include
  // "Ph.D." or "M.D." inline) to avoid duplication like "Ph.D., Ph.D.".
  const filteredCreds = (member?.credentials ?? []).filter(
    (c) => !displayName.includes(c),
  );
  const credentials = filteredCreds.length
    ? `, ${filteredCreds.slice(0, 3).join(", ")}`
    : "";
  const linkTo = member ? `/team/${authorSlug}` : "/team";
  const dateChunk = dateModified
    ? ` &middot; Last updated <time datetime="${escapeHtml(dateModified)}">${escapeHtml(dateModified)}</time>`
    : "";
  return `<p class="byline">Reviewed by <a href="${linkTo}">${escapeHtml(displayName)}${escapeHtml(credentials)}</a>${dateChunk}</p>`;
}

// --- Knowledge guide pages ---

for (const guide of guideData) {
  const path = `/knowledge/${guide.slug}`;
  const author = guideAuthorMap[guide.slug] ?? {};
  const authorName = author.authorSlug ? teamMap[author.authorSlug]?.name : undefined;
  const dateMod = author.dateModified ?? "2026-05-03";
  writePage(
    path,
    buildPage({
      path,
      title: `${guide.name} | ${ORG_NAME}`,
      description: `${guide.name} - an in-depth guide from ${ORG_NAME} covering key concepts, methodology, and practical considerations.`,
      innerHtml:
        `<h1>${escapeHtml(guide.name)}</h1>` +
        renderBylineHtml(author.authorSlug, dateMod) +
        `<p>An in-depth guide from ${ORG_NAME}.</p>` +
        `<nav><a href="/knowledge">Knowledge Center</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
      authorSlug: author.authorSlug,
      authorName,
      datePublished: dateMod,
      dateModified: dateMod,
    }),
  );
  counts.knowledge++;
}

// --- Insight post pages ---

for (const post of postData) {
  const path = `/insights/${post.slug}`;
  const author = insightAuthorMap[post.slug] ?? {};
  const authorName = author.authorSlug ? teamMap[author.authorSlug]?.name : undefined;
  const dateMod = author.dateModified ?? author.publishedDate;
  writePage(
    path,
    buildPage({
      path,
      title: `${post.name} | ${ORG_NAME}`,
      description: `${post.name} - analysis and insights from ${ORG_NAME}.`,
      innerHtml:
        `<h1>${escapeHtml(post.name)}</h1>` +
        renderBylineHtml(author.authorSlug, dateMod) +
        `<p>Analysis and insights from ${ORG_NAME}.</p>` +
        `<nav><a href="/insights">All Insights</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
      authorSlug: author.authorSlug,
      authorName,
      datePublished: author.publishedDate,
      dateModified: dateMod,
    }),
  );
  counts.insights++;
}

// --- Guide pages (`/guides/:slug`) ---
// Static HTML so crawlers see real content (the SPA route hydrates the same
// content client-side). Required by sitemap.xml which lists all guide slugs.

for (const guide of guideSlugData) {
  const path = `/guides/${guide.slug}`;
  writePage(
    path,
    buildPage({
      path,
      title: `${guide.name} | ${ORG_NAME}`,
      description: `${guide.name} - an in-depth guide from ${ORG_NAME} covering key concepts, methodology, and practical considerations.`,
      innerHtml:
        `<h1>${escapeHtml(guide.name)}</h1>` +
        `<p>An in-depth guide from ${ORG_NAME}.</p>` +
        `<nav><a href="/guides">All Guides</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
    }),
  );
  counts.guides++;
}

// --- Comparison pages (`/compare/:slug`) ---

for (const cmp of comparisonData) {
  const path = `/compare/${cmp.slug}`;
  writePage(
    path,
    buildPage({
      path,
      title: `${cmp.name} | ${ORG_NAME}`,
      description: `${cmp.name} - side-by-side comparison from ${ORG_NAME}. Scope, methodology, credentials, and when to retain.`,
      innerHtml:
        `<h1>${escapeHtml(cmp.name)}</h1>` +
        `<p>Side-by-side comparison from ${ORG_NAME}.</p>` +
        `<nav><a href="/compare">All Comparisons</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Article",
    }),
  );
  counts.comparisons++;
}

// --- Service pillar pages ---

for (const svc of serviceData) {
  const path = `/services/${svc.slug}`;
  writePage(
    path,
    buildPage({
      path,
      title: `${svc.name} - Nationwide Expert Witness | ${ORG_NAME}`,
      description: `${svc.name} from ${ORG_NAME}. Independent, evidence-based analysis for plaintiff and defense attorneys nationwide.`,
      innerHtml: `<h1>${escapeHtml(svc.name)}</h1><p>${ORG_NAME} provides ${escapeHtml(svc.name.toLowerCase())} for litigation support nationwide.</p><nav><a href="/services">All Services</a> <a href="/locations">Locations</a> <a href="/contact">Contact</a></nav>`,
      schemaType: "Service",
    })
  );
  counts.servicePillar++;
}

// --- State pages ---

for (const state of stateData) {
  const path = `/locations/${state.slug}`;
  const narrative = buildStateNarrative(state);
  const faqs = stateGeographicFaqs(state.name);
  const url = `${BASE_URL}${path}`;
  const innerHtml =
    `<h1>Life Care Planners in ${escapeHtml(geoProse.placeName(state.name))}</h1>` +
    `<p>${escapeHtml(narrative.directAnswer)}</p>` +
    `<p>${escapeHtml(narrative.careContext)}</p>` +
    `<p>${escapeHtml(narrative.legalContext)}</p>` +
    renderFaqHtml(faqs, `Frequently asked: ${state.name} expert services`) +
    `<nav><a href="/services">Services</a> <a href="/locations">All Locations</a> <a href="/contact">Contact</a></nav>`;
  writePage(
    path,
    buildPage({
      path,
      // Match StateHub.tsx (placeName: "the District of Columbia").
      title: `Life Care Planners in ${geoProse.placeName(state.name)} | ${ORG_NAME}`,
      description: narrative.directAnswer.slice(0, 160),
      innerHtml,
      schemaType: "Service",
      extraJsonLd: buildFaqJsonLd(faqs, url),
    }),
  );
  counts.state++;
}

// --- City pages ---

for (const state of stateData) {
  const cities = cityDataByState[state.slug];
  if (!cities) continue;
  for (const city of cities) {
    const path = `/locations/${state.slug}/${city.slug}`;
    const narrative = buildCityNarrative(state, city);
    const faqs = cityGeographicFaqs(state.name, city.name);
    const url = `${BASE_URL}${path}`;
    const innerHtml =
      `<h1>Life Care Planners in ${escapeHtml(city.name)}, ${escapeHtml(state.name)}</h1>` +
      `<p>${escapeHtml(narrative.directAnswer)}</p>` +
      `<p>${escapeHtml(narrative.blurb)}</p>` +
      renderFaqHtml(faqs, `Frequently asked: ${city.name} expert services`) +
      `<nav><a href="/locations/${state.slug}">Back to ${escapeHtml(state.name)}</a> <a href="/services">Services</a> <a href="/contact">Contact</a></nav>`;
    writePage(
      path,
      buildPage({
        path,
        title: `Life Care Planners in ${city.name}, ${state.name} | ${ORG_NAME}`,
        description: narrative.directAnswer.slice(0, 160),
        innerHtml,
        schemaType: "Service",
        extraJsonLd: buildFaqJsonLd(faqs, url),
      }),
    );
    counts.city++;
  }
}

// --- Service x State pages ---

// Top cities per state to emit a Service x State x City page for (matches the
// city links surfaced on the React Service x State page).
const SERVICE_CITY_TOP = 10;
let serviceStateCityPages = 0;
for (const svc of serviceData) {
  for (const state of stateData) {
    const path = `/services/${svc.slug}/${state.slug}`;
    const narrative = buildStateNarrative(state);
    const faqs = serviceStateGeographicFaqs(svc.name, state.name);
    const url = `${BASE_URL}${path}`;
    const directAnswer = geoProse.serviceStateDirectAnswer(ORG_NAME, svc.shortName, state.name, narrative);
    const innerHtml =
      `<h1>${escapeHtml(svc.name)} in ${escapeHtml(geoProse.placeName(state.name))}</h1>` +
      `<p>${escapeHtml(directAnswer)}</p>` +
      `<p>${escapeHtml(narrative.legalContext)}</p>` +
      renderFaqHtml(faqs, `Frequently asked: ${svc.name} in ${state.name}`) +
      `<nav><a href="/services/${svc.slug}">About ${escapeHtml(svc.name)}</a> <a href="/locations/${state.slug}">${escapeHtml(state.name)}</a> <a href="/contact">Contact</a></nav>`;
    writePage(
      path,
      buildPage({
        path,
        title: `${svc.name} in ${geoProse.placeName(state.name)} | ${ORG_NAME}`,
        description: directAnswer.slice(0, 160),
        innerHtml,
        schemaType: "Service",
        extraJsonLd: buildFaqJsonLd(faqs, url),
      }),
    );
    counts.serviceState++;

    // Service x State x City - mirrors the React ServiceStateCity page so the
    // top-metro service pages are statically captured for SEO.
    const cities = (cityDataByState[state.slug] || []).slice(0, SERVICE_CITY_TOP);
    for (const city of cities) {
      const cityPath = `/services/${svc.slug}/${state.slug}/${city.slug}`;
      const cityUrl = `${BASE_URL}${cityPath}`;
      const cityNarrative = buildCityNarrative(state, city);
      const cityFaqs = serviceCityGeographicFaqs(svc.name, state.name, city.name);
      const cityDirect = geoProse.serviceCityDirectAnswer(ORG_NAME, svc.shortName, state.name, city.name, cityNarrative);
      const cityInner =
        `<h1>${escapeHtml(svc.name)} in ${escapeHtml(city.name)}, ${escapeHtml(state.name)}</h1>` +
        `<p>${escapeHtml(cityDirect)}</p>` +
        `<p>${escapeHtml(cityNarrative.directAnswer)}</p>` +
        renderFaqHtml(cityFaqs, `Frequently asked: ${svc.name} in ${city.name}`) +
        `<nav><a href="/services/${svc.slug}/${state.slug}">${escapeHtml(svc.name)} in ${escapeHtml(state.name)}</a> <a href="/locations/${state.slug}/${city.slug}">${escapeHtml(city.name)}</a> <a href="/contact">Contact</a></nav>`;
      writePage(
        cityPath,
        buildPage({
          path: cityPath,
          title: `${svc.name} in ${city.name}, ${state.name} | ${ORG_NAME}`,
          description: cityDirect.slice(0, 160),
          innerHtml: cityInner,
          schemaType: "Service",
          extraJsonLd: buildFaqJsonLd(cityFaqs, cityUrl),
        }),
      );
      serviceStateCityPages++;
    }
  }
}

// ---------------------------------------------------------------------------
// 4b. New landing page types
// ---------------------------------------------------------------------------

const caseTypeData = extractPairs(readFileSync(join(SRC_DATA, "caseTypes.ts"), "utf-8"), /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
const credentialsContent = readFileSync(join(SRC_DATA, "credentials.ts"), "utf-8");
const credentialData = extractPairs(credentialsContent, /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
// The credential templates (CredentialHub / CredentialState) title + H1 on the
// ABBREVIATION, not the full name. Extract it so the prerendered title/H1 match
// the hydrated React render (no indexed primary-signal drift across ~672 pages).
const credAbbrBySlug = Object.fromEntries(
  extractPairs(credentialsContent, /slug:\s*"([^"]+)"/g, /abbreviation:\s*"([^"]+)"/g).map((x) => [x.slug, x.name]),
);
const methodData = extractPairs(readFileSync(join(SRC_DATA, "methods.ts"), "utf-8"), /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
const teamData = extractPairs(readFileSync(join(SRC_DATA, "team.ts"), "utf-8"), /slug:\s*"([^"]+)"/g, /\bname:\s*"([^"]+)"/g);
// Slugs flagged memoriam in team.ts (same block-splitting as teamMap above):
// their prerendered head must read as a tribute, not a hireable-expert profile.
const memoriamSlugs = new Set(
  readFileSync(join(SRC_DATA, "team.ts"), "utf-8")
    .split(/(?=\n\s*\{\s*\n\s*slug:\s*")/)
    .filter((block) => /memoriam:\s*true/.test(block))
    .map((block) => block.match(/slug:\s*"([^"]+)"/)?.[1])
    .filter(Boolean),
);

// Mirror the src/pages/hubs/*HubPage.tsx usePageMeta values.
const newHubPages = [
  { path: "/case-types", title: `Case Types | ${ORG_NAME}`, description: "Economic damages analysis across the most common civil and commercial case types: personal injury, wrongful death, employment, commercial disputes, divorce, fraud, and more.", innerHtml: "<h1>Case Types</h1>", schemaType: "WebPage" },
  { path: "/credentials", title: `Expert Credentials | CLCP, CNLCP, MSCC, CRC | ${ORG_NAME}`, description: "Professional credentials held by our life care planners: CLCP, CNLCP, MSCC, CDMS, CRC, M.D., R.N., and Ph.D. Scope, requirements, admissibility.", innerHtml: "<h1>Credentials</h1>", schemaType: "WebPage" },
  { path: "/guides", title: `Life Care Planning Guides | ${ORG_NAME}`, description: "In-depth practitioner guides on life care planning, medical cost projection, Medicare set-asides, and expert witness practice. Methodology, admissibility, and engagement guidance.", innerHtml: "<h1>Guides</h1>", schemaType: "WebPage" },
  { path: "/compare", title: `Life Care Planning Comparisons | ${ORG_NAME}`, description: "Side-by-side comparisons of life care planning services, methodologies, and credentials. Life care plan vs. cost projection, CLCP vs. CNLCP, FCE vs. IME, and more.", innerHtml: "<h1>Comparisons</h1>", schemaType: "WebPage" },
  { path: "/methods", title: `Life Care Planning Methodologies | Present Value, Cost Research | ${ORG_NAME}`, description: "Life care planning methodologies used by our planners: life expectancy, present value analysis, plan development, functional capacity evaluation, cost research, and Medicare set-aside allocation.", innerHtml: "<h1>Methods</h1>", schemaType: "WebPage" },
  { path: "/jurisdictions", title: `Jurisdictions | ${ORG_NAME} Nationwide`, description: `${ORG_NAME} prepares life care plans and medical cost projections in all 50 states, DC, US territories, and across federal courts. Browse by state or federal circuit.`, innerHtml: "<h1>Jurisdictions</h1>", schemaType: "WebPage" },
  { path: "/attorneys", title: `Resources for Attorneys | ${ORG_NAME}`, description: "Stage-by-stage attorney resources for retaining, preparing, and using a life care planning expert. Considering, retaining, deposition, and trial.", innerHtml: "<h1>Resources for Attorneys</h1>", schemaType: "WebPage" },
];
for (const p of newHubPages) { writePage(p.path, buildPage(p)); counts.core++; }

// Case type hubs + case type × state
let caseTypeStatePages = 0;
for (const c of caseTypeData) {
  writePage(`/case-types/${c.slug}`, buildPage({
    path: `/case-types/${c.slug}`,
    // Match CaseTypeHub.tsx (title + H1).
    title: `${c.name} Economic Damages Expert | ${ORG_NAME}`,
    description: `Economic damages analysis for ${c.name.toLowerCase()} cases: what the loss claim consists of, where the damages concentrate, and how the number is built. Plaintiff and defense.`,
    innerHtml: `<h1>${escapeHtml(c.name)}</h1>`,
    schemaType: "Service",
  }));
  counts.core++;
  for (const s of stateData) {
    writePage(`/case-types/${c.slug}/${s.slug}`, buildPage({
      path: `/case-types/${c.slug}/${s.slug}`,
      // Match CaseTypeState.tsx (title + H1) so the prerendered + hydrated signals agree.
      title: `${c.name} Economic Damages Expert in ${s.name} | ${ORG_NAME}`,
      description: `Economic damages analysis for ${c.name.toLowerCase()} cases venued in ${s.name}: what the loss claim consists of, where the damages concentrate, and how the number is built. Plaintiff and defense.`,
      innerHtml: `<h1>${escapeHtml(c.name)} Expert Services in ${escapeHtml(s.name)}</h1>`,
      schemaType: "LocalBusiness",
    }));
    caseTypeStatePages++;
  }
}

// Credential hubs + credential × state
let credentialStatePages = 0;
for (const c of credentialData) {
  const abbr = credAbbrBySlug[c.slug] || c.name;
  writePage(`/credentials/${c.slug}`, buildPage({
    path: `/credentials/${c.slug}`,
    // Match CredentialHub.tsx (title `${abbr} Credential | ${name} | ${ORG_NAME}`, H1 `${name} (${abbr})`).
    title: `${abbr} Credential | ${c.name} | ${ORG_NAME}`,
    description: `${c.name} - scope, requirements, and our planners holding this credential.`,
    innerHtml: `<h1>${escapeHtml(c.name)} (${escapeHtml(abbr)})</h1>`,
    schemaType: "Article",
  }));
  counts.core++;
  for (const s of stateData) {
    writePage(`/credentials/${c.slug}/${s.slug}`, buildPage({
      path: `/credentials/${c.slug}/${s.slug}`,
      // Match CredentialState.tsx (abbreviation-based title + H1).
      title: `${abbr} Experts in ${s.name} | ${ORG_NAME}`,
      description: `${c.name} (${abbr}) credential scope, recognition, and life care planners available for ${s.name} matters. Plaintiff and defense.`,
      innerHtml: `<h1>${escapeHtml(abbr)} in ${escapeHtml(s.name)}</h1>`,
      schemaType: "LocalBusiness",
    }));
    credentialStatePages++;
  }
}

// Methods
for (const m of methodData) {
  writePage(`/methods/${m.slug}`, buildPage({
    path: `/methods/${m.slug}`,
    // Match MethodologyExplainer.tsx.
    title: `${m.name} | Methodology | ${ORG_NAME}`,
    description: `${m.name} methodology explained.`,
    innerHtml: `<h1>${escapeHtml(m.name)}</h1>`,
    schemaType: "Article",
  }));
  counts.core++;
}

// Team profiles
for (const t of teamData) {
  const memoriam = memoriamSlugs.has(t.slug);
  writePage(`/team/${t.slug}`, buildPage({
    path: `/team/${t.slug}`,
    title: memoriam ? `${t.name} | In Memoriam | ${ORG_NAME}` : `${t.name} | ${ORG_NAME}`,
    description: memoriam
      ? `${t.name} - remembered by the ${ORG_NAME} team.`
      : `${t.name} - ${ORG_NAME} life care planning expert profile.`,
    innerHtml: `<h1>${escapeHtml(t.name)}</h1>`,
    schemaType: "WebPage",
  }));
  counts.core++;
}

// Service transactional + service × case type
let serviceVariantPages = 0;
let serviceCaseTypePages = 0;
for (const s of serviceData) {
  for (const variant of ["cost", "process", "timeline"]) {
    writePage(`/services/${s.slug}/${variant}`, buildPage({
      path: `/services/${s.slug}/${variant}`,
      title: `${s.name} ${variant.charAt(0).toUpperCase() + variant.slice(1)} | ${ORG_NAME}`,
      description: `${s.name} ${variant} details.`,
      innerHtml: `<h1>${escapeHtml(s.name)} ${variant}</h1>`,
      schemaType: "Service",
    }));
    serviceVariantPages++;
  }
  for (const c of caseTypeData) {
    writePage(`/services/${s.slug}/case/${c.slug}`, buildPage({
      path: `/services/${s.slug}/case/${c.slug}`,
      // Match ServiceCaseType.tsx.
      title: `${s.name} for ${c.name} Cases | ${ORG_NAME}`,
      description: `${s.name} applied to ${c.name.toLowerCase()} cases.`,
      innerHtml: `<h1>${escapeHtml(s.name)} for ${escapeHtml(c.name)}</h1>`,
      schemaType: "Service",
    }));
    serviceCaseTypePages++;
  }
}

// Attorney journey stages × case types (plus a per-stage index page - the
// journey pages' breadcrumbs link to /attorneys/<stage>).
const STAGE_LABELS = {
  considering: "Considering an Expert",
  retaining: "Retaining an Expert",
  "preparing-deposition": "Preparing for Deposition",
  trial: "Trial Testimony",
};
let journeyPages = 0;
for (const stage of ["considering", "retaining", "preparing-deposition", "trial"]) {
  writePage(`/attorneys/${stage}`, buildPage({
    path: `/attorneys/${stage}`,
    title: `${STAGE_LABELS[stage]}: Attorney Guides by Case Type | ${ORG_NAME}`,
    description: `${STAGE_LABELS[stage]} guides for attorneys, by case type: step-by-step actions, required documents, common pitfalls, and FAQs.`,
    innerHtml: `<h1>${escapeHtml(STAGE_LABELS[stage])}</h1>`,
    schemaType: "WebPage",
  }));
  journeyPages++;
  for (const c of caseTypeData) {
    writePage(`/attorneys/${stage}/${c.slug}`, buildPage({
      path: `/attorneys/${stage}/${c.slug}`,
      // Match JourneyStage.tsx.
      title: `${STAGE_LABELS[stage]} for ${c.name} Cases | ${ORG_NAME}`,
      description: `Attorney guidance for ${stage.replace("-", " ")} in ${c.name.toLowerCase()} cases.`,
      innerHtml: `<h1>${escapeHtml(c.name)}: ${stage}</h1>`,
      schemaType: "Article",
    }));
    journeyPages++;
  }
}

// PSA retainer intake forms. The unified case-type-driven form at
// /contact/intake replaced the separate Personal Injury + Matrimonial forms
// (spec 2026-07-16); those two legacy routes 301 to /contact/intake in
// server.js, so prerendering them only produced unreachable dist files. The
// unified form itself is deliberately NOT prerendered - it is a client-only
// noindex route (CLIENT_ONLY_ROUTES); prerendering it would drop the noindex.
const RETAINER_INTAKE_PAGES = [];
let retainerIntakePages = 0;
for (const r of RETAINER_INTAKE_PAGES) {
  writePage(
    r.path,
    buildPage({
      path: r.path,
      title: r.title,
      description: r.description,
      innerHtml: `<h1>${escapeHtml(r.h1)}</h1><p>${escapeHtml(r.blurb)}</p><nav><a href="/contact">Back to Contact</a> <a href="/services">All Services</a></nav>`,
      schemaType: "WebPage",
    }),
  );
  retainerIntakePages++;
}

// ---------------------------------------------------------------------------
// 4e. White papers hub + detail pages. Parsed from the data file so the static
// HTML carries the abstract, key takeaways, and outline for non-JS crawlers.
// (The full gated body is delivered client-side and is present in the rendered
// DOM for JS-capable crawlers.)
// ---------------------------------------------------------------------------
const wpContent = readFileSync(join(SRC_DATA, "whitePapers.ts"), "utf-8");
const wpParts = wpContent.split(/\n    slug: "/).slice(1);
let whitePaperPages = 0;
const wpList = [];
for (const part of wpParts) {
  const slug = part.slice(0, part.indexOf('"'));
  const pick = (re) => {
    const m = part.match(re);
    return m ? m[1] : "";
  };
  const title = pick(/title:\s*"([^"]+)"/);
  const subtitle = pick(/subtitle:\s*"([^"]+)"/);
  const summary = pick(/summary:\s*"([^"]+)"/);
  const discipline = pick(/discipline:\s*"([^"]+)"/);
  const reading = pick(/readingTime:\s*"([^"]+)"/);
  const headings = [...part.matchAll(/heading:\s*"([^"]+)"/g)].map((m) => m[1]);
  const takeBlock = (part.match(/keyTakeaways:\s*\[([\s\S]*?)\]/) || [, ""])[1];
  const takeaways = [...takeBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  wpList.push({ slug, title, subtitle, discipline });

  const path = `/white-papers/${slug}`;
  const innerHtml =
    `<h1>${escapeHtml(title)}</h1>` +
    `<p><em>${escapeHtml(subtitle)}</em></p>` +
    `<p>${escapeHtml(discipline)} &middot; ${escapeHtml(reading)}</p>` +
    `<h2>Abstract</h2><p>${escapeHtml(summary)}</p>` +
    (takeaways.length
      ? `<h2>Key takeaways</h2><ul>${takeaways.map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>`
      : "") +
    (headings.length
      ? `<h2>What is inside</h2><ol>${headings.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ol>`
      : "") +
    `<nav><a href="/white-papers">All white papers</a> <a href="/contact">Request a consultation</a></nav>`;
  writePage(
    path,
    buildPage({
      path,
      title: `${title} | White Paper | ${ORG_NAME}`,
      description: summary.slice(0, 160),
      innerHtml,
      schemaType: "Article",
    }),
  );
  whitePaperPages++;
}
writePage(
  "/white-papers",
  buildPage({
    path: "/white-papers",
    title: `White Papers | Life Care Planning Methodology | ${ORG_NAME}`,
    description:
      `In-depth white papers on the methodology behind defensible life care plans and medical cost projections. From ${ORG_NAME}.`,
    innerHtml:
      `<h1>White papers on defensible expert methodology</h1>` +
      `<p>Detailed, objective treatments of how ${ORG_NAME} builds life care plans and cost projections that can be examined and tested.</p>` +
      `<ul>${wpList
        .map((w) => `<li><a href="/white-papers/${w.slug}">${escapeHtml(w.title)}</a> - ${escapeHtml(w.subtitle)}</li>`)
        .join("")}</ul>` +
      `<nav><a href="/services">Services</a> <a href="/knowledge">Knowledge Center</a> <a href="/contact">Contact</a></nav>`,
    schemaType: "WebPage",
  }),
);
const whitePaperHubPages = 1;

// ---------------------------------------------------------------------------
// 5. Report
// ---------------------------------------------------------------------------

const total =
  counts.core +
  counts.servicePillar +
  counts.knowledge +
  counts.insights +
  counts.guides +
  counts.comparisons +
  counts.state +
  counts.city +
  counts.serviceState +
  serviceStateCityPages +
  caseTypeStatePages +
  credentialStatePages +
  serviceVariantPages +
  serviceCaseTypePages +
  journeyPages +
  retainerIntakePages +
  whitePaperPages +
  whitePaperHubPages;

console.log(`Pre-rendering ${ORG_NAME} pages...`);
console.log(`  Core pages: ${counts.core}`);
console.log(`  Service pillar pages: ${counts.servicePillar}`);
console.log(`  Knowledge guides: ${counts.knowledge}`);
console.log(`  Insight posts: ${counts.insights}`);
console.log(`  Guide pages: ${counts.guides}`);
console.log(`  Comparison pages: ${counts.comparisons}`);
console.log(`  State pages: ${counts.state}`);
console.log(`  City pages: ${counts.city}`);
console.log(`  Service x State pages: ${counts.serviceState}`);
console.log(`  Service x State x City pages: ${serviceStateCityPages}`);
console.log(`  Case-type x State pages: ${caseTypeStatePages}`);
console.log(`  Credential x State pages: ${credentialStatePages}`);
console.log(`  Service variant pages: ${serviceVariantPages}`);
console.log(`  Service x Case-type pages: ${serviceCaseTypePages}`);
console.log(`  Attorney journey pages: ${journeyPages}`);
console.log(`  PSA retainer intake pages: ${retainerIntakePages}`);
console.log(`  White paper pages: ${whitePaperPages + whitePaperHubPages}`);
console.log(`  Total: ${total} pages pre-rendered`);
