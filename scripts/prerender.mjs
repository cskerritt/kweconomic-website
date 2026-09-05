/**
 * KW Economics Pre-render Script
 *
 * Generates static HTML files for every route after vite build completes.
 * Each file carries the same title, description, canonical URL, Open Graph
 * tags, and schema.org @graph the hydrated React page publishes, plus the
 * page's substance as plain HTML (lead paragraph, sections, FAQ <details>,
 * breadcrumbs, child links, a consultation line) so a crawler that does not
 * execute JavaScript reads the page, not an empty shell.
 *
 * Data comes from the same TypeScript modules the React pages import, loaded
 * through vite's ssrLoadModule (the pattern scripts/generate-llms.mjs uses),
 * and the JSON-LD comes from the same builders in src/lib/schema.ts, so the
 * two views of a route describe one set of entities. SchemaOrg.tsx removes the
 * shell's graph (tagged data-prerender="ld") once the page hydrates.
 *
 * Run: node scripts/prerender.mjs
 * PRERENDER_DIST=<dir> reads the template from <dir>/index.html and writes
 * every page under <dir>, for a scratch run that leaves dist/ alone (the same
 * override the sister sites' prerender scripts take).
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";
import { ORG_NAME, ORG_SHORT, ORG_PHONE, ORG_PHONE_DISPLAY, SITE_URL, VOC_SITE_URL, LCP_SITE_URL } from "./lib/site.mjs";
import { homepageFaqs } from "../src/data/home-faqs.mjs";
import * as geoProse from "../src/data/geo-prose.mjs";
import {
  stateHubTitle,
  cityHubTitle,
  serviceStateTitle,
  serviceCityTitle,
  caseTypeStateTitle,
  caseTypeHubTitle,
  pillarTitle,
  variantTitle,
  pairTitle,
} from "../src/lib/page-titles.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
// PRERENDER_DIST redirects the template read and every write to a scratch
// directory, so the pages can be generated without touching dist/.
const DIST = process.env.PRERENDER_DIST ? resolve(process.env.PRERENDER_DIST) : join(ROOT, "dist");
const SRC = join(ROOT, "src");
// Brand identity comes from scripts/lib/site.mjs (mirror of src/lib/brand.ts).
const BASE_URL = SITE_URL;
const DOMAIN = new URL(SITE_URL).host;

// ---------------------------------------------------------------------------
// 1. Load the data and schema modules through vite (full TypeScript fidelity)
// ---------------------------------------------------------------------------

const viteServer = await createServer({
  root: ROOT,
  configFile: false,
  logLevel: "error",
  resolve: { alias: { "@": SRC } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: "custom",
});
const load = (p) => viteServer.ssrLoadModule(p);
// Shared modules that may be added later by other parts of the site; absent today.
const loadOptional = (p) => (existsSync(join(ROOT, p)) ? load(p).catch(() => null) : Promise.resolve(null));

const [
  brand,
  schema,
  { truncateAtWord },
  prose,
  stages,
  { pillarServices, servicesForCaseType, serviceCaseTypePairs },
  {
    caseTypes,
    caseTypeHubHeading,
    caseTypeHubDescription,
    caseTypeStateHeading,
    caseTypeStateDescription,
    caseTypeStateLead,
    caseTypeStateStepsIntro,
    caseTypeStateFramework,
    caseTypeStateFrameworkQuestion,
    caseTypeStateServiceDescription,
    caseTypeSectionHeadings,
  },
  { credentials, credentialStateHeadings, credentialStateAngle },
  { methods },
  { guides },
  { comparisons },
  { knowledgeGuides },
  { insightPosts, insightBlocks },
  { whitePapers },
  { journeys, stageReviewer, stageSources },
  faqsModule,
  { team, activeTeam, retainableExperts, analysisResponsibility },
  { states },
  narratives,
  geoFaqs,
  { getRegulationsByState },
  { getCourtsByState, selectTrialCourts, courtSystemLabel },
  { getLocalContent },
  geoLinks,
  teamMeta,
  sharedServiceFaqs,
  sharedCaseStudies,
] = await Promise.all([
  load("/src/lib/brand.ts"),
  load("/src/lib/schema.ts"),
  load("/src/lib/text.ts"),
  load("/src/lib/service-prose.mjs"),
  load("/src/lib/attorney-stages.ts"),
  load("/src/data/services.ts"),
  load("/src/data/caseTypes.ts"),
  load("/src/data/credentials.ts"),
  load("/src/data/methods.ts"),
  load("/src/data/guides.ts"),
  load("/src/data/comparisons.ts"),
  load("/src/data/knowledge.ts"),
  load("/src/data/insights.ts"),
  load("/src/data/whitePapers.ts"),
  load("/src/data/journeys.ts"),
  load("/src/data/faqs.ts"),
  load("/src/data/team.ts"),
  load("/src/data/states.ts"),
  load("/src/data/narratives.ts"),
  load("/src/data/geographicFaqs.ts"),
  load("/src/data/regulations/state-regs.ts"),
  load("/src/data/courts/state-courts.ts"),
  load("/src/data/local-content.ts"),
  load("/src/lib/geo-links.ts"),
  loadOptional("/src/data/team-meta.mjs"),
  loadOptional("/src/data/service-faqs.mjs"),
  loadOptional("/src/data/case-studies.mjs"),
]);

// The attorney journey family's stage slugs, labels, and every heading, title,
// description, and intro builder come from src/lib/attorney-stages.ts, the
// module JourneyStage.tsx and JourneyStageIndex.tsx render from.
const {
  ATTORNEY_STAGES,
  STAGE_LABELS,
  STAGE_GUIDES,
  journeyHeading,
  journeyTitle,
  journeyDescription,
  stageIndexHeading,
  stageIndexTitle,
  stageIndexDescription,
  stageIndexIntro,
} = stages;

// Every state's city file (one code-split chunk per state in the app; here
// loaded eagerly so the city tier is prerendered from the same objects).
const cityDataByState = {};
for (const state of states) {
  const mod = await loadOptional(`/src/data/cities/${state.slug}.ts`);
  cityDataByState[state.slug] = mod ? (Object.values(mod)[0] ?? []) : [];
}
// Shared copy of the legal pages and the consultation page (site audit T01):
// the /privacy, /terms, and /schedule-consultation shells render the same
// sections, steps, and field labels the React pages do.
const legalPolicies = await load("/src/data/legal-policies.ts");
const consultation = await load("/src/data/consultation.ts");
// Where an inquiry goes (the shared intake inbox) and the /about section on
// the sister practices: one module for About.tsx, Contact.tsx,
// ScheduleConsultation.tsx, the privacy policy, and these shells (audit F06).
const intake = await load("/src/data/intake.ts");
await viteServer.close();

const ORG_LEGAL = brand.ORG_LEGAL;
const siteFaqs = faqsModule.faqs;
const FAQ_DATE_MODIFIED = faqsModule.FAQ_DATE_MODIFIED;
const serviceData = pillarServices();
const teamBySlug = Object.fromEntries(team.map((m) => [m.slug, m]));
const caseTypeBySlug = Object.fromEntries(caseTypes.map((c) => [c.slug, c]));
const stateBySlug = Object.fromEntries(states.map((s) => [s.slug, s]));
const ORG_URL = schema.ORG_URL;
const STAGE_SLUGS = ATTORNEY_STAGES.map((s) => s.slug);
const { placeName, placeAttr, cityAttr } = geoProse;

// Share image defaults (src/lib/brand.ts). The team profiles override with
// the member's portrait.
const OG = {
  image: brand.DEFAULT_OG_IMAGE,
  width: brand.DEFAULT_OG_IMAGE_WIDTH,
  height: brand.DEFAULT_OG_IMAGE_HEIGHT,
  alt: brand.DEFAULT_OG_IMAGE_ALT,
};
const PORTRAIT_SIZES = {
  "christopher-skerritt": { width: 798, height: 1200 },
  "zachary-sperling": { width: 900, height: 1200 },
};

// ---------------------------------------------------------------------------
// 2. HTML helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
const esc = escapeHtml;

// The [[/route|anchor]] inline-link markers editorial copy carries
// (src/lib/richtext.tsx): the same allow-listed pass, emitted as <a href>.
// Everything else is escaped text; a marker whose route fails the allow-list
// prints as its literal text, exactly as the React renderer does.
const MARKER = /\[\[(\/[^|\]]*)\|([^\]]+)\]\]/g;
const ALLOWED_ROUTE = /^\/[a-z0-9/-]*$/;
function linkify(text) {
  const src = String(text ?? "");
  let out = "";
  let last = 0;
  MARKER.lastIndex = 0;
  let m;
  while ((m = MARKER.exec(src)) !== null) {
    out += esc(src.slice(last, m.index));
    out += ALLOWED_ROUTE.test(m[1]) ? `<a href="${m[1]}">${esc(m[2])}</a>` : esc(m[0]);
    last = m.index + m[0].length;
  }
  return out + esc(src.slice(last));
}
const stripLinkMarkers = schema.stripLinkMarkers;

/** One or more paragraphs (blank-line separated) with the inline-link pass applied. */
function paragraphs(text) {
  return String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${linkify(p)}</p>`)
    .join("");
}
const para = (text) => `<p>${linkify(text)}</p>`;
const h2 = (text, id) => `<h2${id ? ` id="${esc(id)}"` : ""}>${esc(text)}</h2>`;
const h3 = (text) => `<h3>${esc(text)}</h3>`;
const ul = (items) => `<ul>${items.map((i) => `<li>${linkify(i)}</li>`).join("")}</ul>`;
const ol = (items) => `<ol>${items.map((i) => `<li>${linkify(i)}</li>`).join("")}</ol>`;
/** A link list: [{ href, label, blurb? }]. */
const linkList = (items) =>
  `<ul>${items
    .map((i) => `<li><a href="${esc(i.href)}">${esc(i.label)}</a>${i.blurb ? ` - ${esc(i.blurb)}` : ""}</li>`)
    .join("")}</ul>`;
const navLinks = (items) =>
  `<nav>${items.map((i) => `<a href="${esc(i.href)}">${esc(i.label)}</a>`).join(" ")}</nav>`;
const abs = (path) => (path === "/" ? `${BASE_URL}/` : `${BASE_URL}${path}`);

/** Render a list of FAQs as static HTML <details> blocks for the prerender body. */
function renderFaqHtml(faqs, headingText = "Frequently Asked Questions") {
  if (!faqs.length) return "";
  const items = faqs
    .map((f) => `<details><summary>${esc(f.question)}</summary><p>${linkify(f.answer)}</p></details>`)
    .join("");
  return `<section><h2>${esc(headingText)}</h2>${items}</section>`;
}

/** The FAQPage node for a list of FAQs (schema.ts strips the link markers). */
function buildFaqJsonLd(faqs, pageUrl) {
  return schema.faqPageSchema(faqs, pageUrl);
}

// Degree post-nominals are the only credentials a byline prints on the
// economics site; a reviewer's background certifications from another
// discipline stay in the profile biography. Mirrors the allow-list applied to
// the React byline.
const DEGREE_CREDENTIAL = /^(Ph\.?D\.?|M\.?B\.?A\.?|M\.?Ed\.?|M\.?A\.?|M\.?S\.?|J\.?D\.?|D\.?B\.?A\.?|Ed\.?D\.?)$/i;
const degreeCredentials = (member) =>
  (member?.credentials ?? []).filter((c) => DEGREE_CREDENTIAL.test(c));

/**
 * Render the inline byline for the static HTML. Mirrors the React-side
 * AuthorByline component: "By <name>, <title> · Published <date> · Reviewed
 * <date>", where the reviewed date prints only when it differs from the
 * published date. The display name is the member's name (which already
 * carries the degree post-nominals) plus the job title; the background
 * certifications listed under `credentials` in team.ts never appear here.
 * Unnamed copy is bylined to the editorial team.
 */
function renderBylineHtml(authorSlug, datePublished, dateModified) {
  const member = authorSlug ? teamBySlug[authorSlug] : undefined;
  const displayName = member ? `${member.name}, ${member.title}` : `${ORG_NAME} Editorial Team`;
  const linkTo = member ? `/team/${member.slug}` : "/team";
  const reviewed = dateModified && dateModified !== datePublished ? dateModified : undefined;
  // "Reviewed" is a claim about a named person; the editorial byline labels
  // the revision date "Updated" (AuthorByline.tsx; audit C02).
  const dateLabel = member ? "Reviewed" : "Updated";
  const time = (d) => `<time datetime="${esc(d)}">${esc(d)}</time>`;
  return (
    `<p class="byline">By <a href="${linkTo}">${esc(displayName)}</a>` +
    (datePublished ? ` &middot; Published ${time(datePublished)}` : "") +
    (reviewed ? ` &middot; ${dateLabel} ${time(reviewed)}` : "") +
    `</p>`
  );
}

/**
 * "<subject> is directed by <name>, <title>, who is available to testify to
 * it." The professional responsible for the page's work, linked to the
 * profile that carries the CV, from src/data/team.ts analysisResponsibility()
 * exactly as the ResponsibilityLine component prints it (audit C02). Empty
 * when the roster has no retainable expert.
 */
function responsibilityHtml(subject, plural = true) {
  const line = analysisResponsibility(subject, plural);
  if (!line) return "";
  return `<p>${esc(line.lead)}<a href="/team/${line.expert.slug}">${esc(line.expert.name)}</a>${esc(line.tail)}</p>`;
}

/** Visible breadcrumb trail: [{ name, path }], last item current. */
function breadcrumbHtml(items) {
  const lis = items.map((item, i) =>
    i === items.length - 1
      ? `<li aria-current="page">${esc(item.name)}</li>`
      : `<li><a href="${esc(item.path)}">${esc(item.name)}</a></li>`,
  );
  return `<nav aria-label="Breadcrumb"><ol>${lis.join("")}</ol></nav>`;
}

/** The consultation line every shell carries: a contact path a non-JS reader can act on. */
function ctaHtml(context) {
  const tel = `<a href="tel:${ORG_PHONE.replace(/-/g, "")}">${ORG_PHONE_DISPLAY}</a>`;
  return `<p><a href="/contact">Request a consultation</a>${context ? ` on ${esc(context)}` : ""} or call ${tel}. Plaintiff and defense counsel.</p>`;
}

// The lead paragraph the editorial templates mark for answer engines (the
// `.kw-lead` selector the Article node's speakable specification names, next
// to the H1). Same class on the shell so the selector resolves without JS.
const lead = (text) => `<p class="kw-lead">${linkify(text)}</p>`;
const SPEAKABLE = { speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".kw-lead"] } };

/** "Related" card list ({ title, href, description }[]) as the React RelatedContent block. */
const relatedHtml = (items, heading = "Related") =>
  items && items.length
    ? `<section>${h2(heading)}${linkList(items.map((r) => ({ href: r.href, label: r.title, blurb: r.description })))}</section>`
    : "";

// Service engagement-detail variants (src/pages/templates/ServiceTransactional.tsx).
const VARIANTS = ["cost", "process", "timeline"];
const VARIANT_LABEL = { cost: "Cost", process: "Process", timeline: "Timeline" };
const VARIANT_LINK_LABEL = { cost: "Cost and fee structure", process: "Engagement process", timeline: "Typical timeline" };

/** "2 to 4 weeks after records are received" -> "2 to 4 weeks"; "About 1 week" -> "about 1 week". */
function span(duration, fallback) {
  const m = duration.match(/^(About \d+ weeks?|\d+ to \d+ weeks)/i);
  return m ? m[1].toLowerCase() : fallback;
}

/** Append the first closing sentence that keeps the description within 160 characters. */
function fit(base, ...tails) {
  const tail = tails.find((t) => base.length + t.length <= 160);
  return tail ? base + tail : base;
}

/**
 * The meta description each variant page publishes (the same builder
 * ServiceTransactional.tsx applies): a direct answer to what the work costs,
 * how the engagement runs, or how long it takes, 140-160 characters.
 */
function variantDescription(s, variant) {
  const work = prose.workPhrase(s.shortName);
  const name = prose.proseName(s.shortName);
  switch (variant) {
    case "cost":
      return fit(
        `What ${work} costs: hourly billing against a retainer, the factors that set the scope, and a written estimate up front.`,
        " Either side.",
      );
    case "process":
      return fit(
        `How ${prose.withArticle(name)} engagement runs: conflict check and retention, records request, analysis, draft review with counsel, then the final report.`,
        " Testimony follows.",
      );
    default: {
      const t = s.timeline ?? [];
      const intake = span(t[0]?.duration ?? "", "about a week");
      const analysis = span(t[1]?.duration ?? "", "several weeks");
      const report = span(t[2]?.duration ?? "", "1 to 2 weeks");
      return fit(
        `How long ${work} takes: ${intake} for intake, ${analysis} of analysis, ${report} to the report, then testimony.`,
        " Plaintiff and defense.",
        " Either side.",
      );
    }
  }
}

// Service x case-type pair pages (src/pages/templates/ServiceCaseType.tsx):
// the title comes from the shared pairTitle builder (src/lib/page-titles.mjs);
// the description names the work through the shared prose helper.
const pairDescription = (s, c) => {
  const base = `${prose.capFirst(prose.workPhrase(s.shortName))} for ${c.name.toLowerCase()} cases: how the loss is built, which records drive it, and testimony support.`;
  // Mirrors ServiceCaseType.tsx: the audience tag rides along only inside the
  // 160-character window.
  return base.length + " Either side.".length <= 160 ? `${base} Either side.` : base;
};

/** "A, B, and C" (CaseTypeState.tsx listNames). */
const listNames = (names) => {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

// services.ts and caseTypes.ts name credentials as a label set ("Forensic
// Economist", "NAFE", "PhD"); credentials.ts keys them by slug and a
// punctuated, sometimes slash-separated abbreviation. Compare on letters and
// digits only (the rule the templates apply).
const normalizeCredential = (s) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
const credentialMatches = (cred, labels) =>
  labels.some(
    (label) =>
      label === cred.slug ||
      cred.abbreviation.split("/").some((part) => normalizeCredential(part) === normalizeCredential(label)),
  );

/**
 * The venue list a case-type x state or credential x state page prints: the
 * selected trial courts, the highest court, the federal districts, the court
 * system link, and any venue note (CaseTypeState.tsx / CredentialState.tsx).
 */
function courtVenuesHtml(courts, trialCourts, heading) {
  const federal = courts.federalDistricts ?? [];
  return (
    (heading ? h3(heading) : "") +
    `<ul>${trialCourts.map((c) => `<li><strong>${esc(c.name)}</strong> - ${esc(c.description)}</li>`).join("")}</ul>` +
    `<p>Highest court: ${esc(courts.supremeCourt)}.` +
    (federal.length ? ` Federal venues: ${esc(federal.map((d) => d.abbreviation).join(", ").replace(/\.$/, ""))}.` : "") +
    (courts.filingPortalUrl
      ? ` Court system: <a href="${esc(courts.filingPortalUrl)}" rel="noopener">${esc(courtSystemLabel(courts.filingPortalUrl))}</a>.`
      : "") +
    `</p>` +
    (courts.venueNote ? para(courts.venueNote) : "")
  );
}

/** References list from registry-backed sources. */
function sourcesHtml(sources) {
  const list = (sources ?? []).filter(Boolean);
  if (!list.length) return "";
  const seen = new Set();
  const lis = [];
  for (const s of list) {
    const key = s.apa ?? s.url;
    if (seen.has(key)) continue;
    seen.add(key);
    lis.push(`<li>${esc(s.apa ?? s.title)} <a href="${esc(s.url)}" rel="noopener">${esc(hostOf(s.url))}</a></li>`);
  }
  return `<section><h2>References</h2><ul>${lis.join("")}</ul></section>`;
}
function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

// ---------------------------------------------------------------------------
// 3. Template and page assembly
// ---------------------------------------------------------------------------

const rawTemplate = readFileSync(join(DIST, "index.html"), "utf-8");

/**
 * A previous prerender run rewrites dist/index.html as the home shell. Strip
 * everything buildPage injects so running this script against that file
 * yields the same output as running it against vite's fresh index.html.
 */
function pristineTemplate(html) {
  return html
    // vite's index.html carries no JSON-LD; every ld+json block is a shell's.
    .replace(/\s*<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/\s*<link rel="canonical"[^>]*\/>/g, "")
    .replace(
      /\s*<meta\s+(?:name|property)="(?:description|og:title|og:description|og:url|twitter:title|twitter:description|article:published_time|article:modified_time)"[\s\S]*?\/>/g,
      "",
    )
    // The root div is the only body-level element (vite hoists the module
    // script into <head>), so the last </div> before </body> closes it.
    .replace(/<div id="root">[\s\S]*?<\/div>(?=\s*<\/body>)/, '<div id="root"></div>');
}
const template = pristineTemplate(rawTemplate);
if (!template.includes('<div id="root"></div>')) {
  throw new Error("prerender: dist/index.html has no empty #root after template cleanup; rebuild with vite first");
}

/** Replace the content attribute of a template meta tag, or drop the tag when `content` is undefined. */
function setTemplateMeta(html, attr, name, content) {
  const re = new RegExp(`\\s*<meta ${attr}="${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" content="[^"]*" />`);
  if (content === undefined) return html.replace(re, "");
  return html.replace(re, (m) => m.replace(/content="[^"]*"/, `content="${esc(String(content))}"`));
}

function buildPage({
  path,
  title,
  description,
  innerHtml,
  jsonLd = [],
  breadcrumbs,
  ogType = "website",
  datePublished,
  dateModified,
  ogImage,
  ogImageWidth,
  ogImageHeight,
  ogImageAlt,
  cta = true,
  ctaContext,
  robots,
  canonical = true,
}) {
  // Homepage canonical keeps its trailing slash to match use-page-meta (which
  // normalizes every other path to no trailing slash but leaves the root as "/").
  const url = abs(path);
  const safeTitle = esc(title);
  const safeDesc = esc(description);

  const nodes = [...jsonLd];
  let body = innerHtml;
  if (breadcrumbs && breadcrumbs.length) {
    body = breadcrumbHtml(breadcrumbs) + body;
    nodes.push(schema.breadcrumbSchema(breadcrumbs.map((b) => ({ name: b.name, url: abs(b.path) }))));
  }
  if (cta) body += ctaHtml(ctaContext);
  // The root reset in pristineTemplate() stops at the first </div>; the shell
  // body therefore never contains a div.
  if (/<div[\s>]/i.test(body)) throw new Error(`prerender: shell body for ${path} must not contain <div>`);

  const image = ogImage ?? OG.image;
  const isDefaultImage = image === OG.image;
  const width = ogImageWidth ?? (isDefaultImage ? OG.width : undefined);
  const height = ogImageHeight ?? (isDefaultImage ? OG.height : undefined);
  const alt = ogImageAlt ?? (isDefaultImage ? OG.alt : undefined);

  const articleTags =
    ogType === "article"
      ? `${datePublished ? `\n    <meta property="article:published_time" content="${esc(datePublished)}" />` : ""}${
          dateModified ? `\n    <meta property="article:modified_time" content="${esc(dateModified)}" />` : ""
        }`
      : "";
  const ldScript = nodes.length
    ? `\n    <script type="application/ld+json" data-prerender="ld">${JSON.stringify(schema.graphSchema(nodes)).replace(/<\//g, "<\\/")}</script>`
    : "";
  const metaTags = `
    <meta name="description" content="${safeDesc}" />${canonical ? `\n    <link rel="canonical" href="${url}" />` : ""}
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDesc}" />
    <meta property="og:url" content="${url}" />${articleTags}
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDesc}" />${ldScript}`;

  let html = template;

  // Strip the template's generic multi-line <meta name="description"> so the
  // page-specific one injected below is the ONLY description tag. Without this,
  // every prerendered page shipped two competing description tags.
  html = html.replace(/\s*<meta\s+name="description"[\s\S]*?\/>/i, "");

  // Replace title
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);

  // Insert meta tags after the <title> tag
  html = html.replace(/(<title>[^<]*<\/title>)/, (match) => `${match}${metaTags}`);

  // Per-route Open Graph values on the template's default tags.
  html = setTemplateMeta(html, "property", "og:type", ogType);
  html = setTemplateMeta(html, "property", "og:image", image);
  html = setTemplateMeta(html, "property", "og:image:width", width);
  html = setTemplateMeta(html, "property", "og:image:height", height);
  html = setTemplateMeta(html, "property", "og:image:alt", alt);
  html = setTemplateMeta(html, "name", "twitter:image", image);
  if (robots) html = setTemplateMeta(html, "name", "robots", robots);

  // Replace <div id="root"></div> with content
  html = html.replace(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);

  return html;
}

// Non-pillar cross-sell routes are retired addresses that the legacy 301 map
// sends to the sister practices; emitting a static shell for them would put an
// unadvertised page on disk and invite the sitemap/prerender parity test to
// drift. Hard stop.
const NON_PILLAR_SERVICE_PREFIXES = ["/services/vocational-evaluation", "/services/life-care-planning"];

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
// 4. Shared shell pieces
// ---------------------------------------------------------------------------

const HUB_LINKS = [
  { href: "/services", label: "Services" },
  { href: "/case-types", label: "Case Types" },
  { href: "/locations", label: "Locations" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/knowledge", label: "Knowledge Center" },
  { href: "/guides", label: "Guides" },
  { href: "/white-papers", label: "White Papers" },
  { href: "/insights", label: "Insights" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/credentials", label: "Credentials" },
  { href: "/methods", label: "Methods" },
  { href: "/compare", label: "Comparisons" },
  { href: "/attorneys", label: "Attorney Resources" },
  { href: "/jurisdictions", label: "Jurisdictions" },
  { href: "/resources/faq", label: "FAQ" },
];

// Sibling editorial hubs (the "More from the library" block on each hub page).
const LIBRARY_LINKS = [
  { href: "/guides", label: "Practitioner guides" },
  { href: "/compare", label: "Side-by-side comparisons" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/white-papers", label: "White papers" },
  { href: "/knowledge", label: "Knowledge center" },
  { href: "/insights", label: "Insights" },
];
const libraryNav = (except) => navLinks(LIBRARY_LINKS.filter((l) => l.href !== except));

const pillarLinks = (prefix = "") =>
  serviceData.map((s) => ({ href: `/services/${s.slug}${prefix}`, label: s.shortName }));
const stateLinks = (hrefFor) => states.map((s) => ({ href: hrefFor(s), label: s.name }));
const item = (name, path) => ({ name, url: abs(path) });

/**
 * The four templated FAQs every pillar page renders (src/pages/ServicePillar.tsx).
 * Read from src/data/service-faqs.mjs when that shared module exists; until
 * then the same sentences are built here with the shared prose helpers, and
 * scripts/prerender-meta.test.mjs pins the shell to the rendered page.
 */
function pillarFaqs(service) {
  if (sharedServiceFaqs?.pillarFaqs) return sharedServiceFaqs.pillarFaqs(ORG_NAME, ORG_SHORT, service);
  const work = prose.workPhrase(service.shortName);
  const name = prose.proseName(service.shortName);
  return [
    {
      question: `What does ${prose.withArticle(name)} engagement cost?`,
      answer: `Full retained-expert engagements are billed hourly across review, evaluation, report, and (if needed) testimony phases. Specific cost depends on case complexity and engagement scope.`,
    },
    {
      question: `Does ${ORG_SHORT} work for both plaintiff and defense?`,
      answer: `Yes. ${ORG_NAME} provides independent, objective ${work} for plaintiff and defense counsel. The methodology is the same regardless of which side commissions the work; every report is built from the records in the case and published data, with each assumption stated.`,
    },
    {
      question: `Where does ${ORG_SHORT} provide ${work}?`,
      answer: `${ORG_NAME} accepts ${name} engagements in all 50 states, the District of Columbia, and US territories. State-specific framing is available on the per-state pages linked below.`,
    },
    {
      question: `What is the typical turnaround for a full ${name} report?`,
      answer: `Most reports are delivered within several weeks after the records are complete, depending on the number of loss components and scenarios to be analyzed. Rush turnarounds are accommodated case by case.`,
    },
  ];
}

/** Courts block for a state page family. */
function courtsHtml(state) {
  const courts = getCourtsByState(state.slug);
  if (!courts) return "";
  const trial = courts.trialCourts.slice(0, 3).map((c) => `${c.name} - ${c.description}`);
  const federal = courts.federalDistricts.length
    ? ` Federal venues: ${courts.federalDistricts.map((d) => d.abbreviation).join(", ").replace(/\.$/, "")}.`
    : "";
  return `${h3("Where these cases are heard")}${ul(trial)}<p>Highest court: ${esc(courts.supremeCourt)}.${esc(federal)}</p>`;
}

/** Damages framework + compensation forum for a state (src/data/regulations/state-regs.ts). */
function damagesFrameworkHtml(state) {
  const regs = getRegulationsByState(state.slug);
  if (!regs) return "";
  return (
    h3("Damages Framework") +
    para(regs.damagesContext) +
    h3("Workers' Compensation Forum") +
    para(regs.compensationForum)
  );
}

/** Hand-written local essay (src/data/local-content.ts) where one exists. */
function localContentHtml(stateSlug, citySlug) {
  const local = getLocalContent(stateSlug, citySlug);
  if (!local) return "";
  let html = `<section>${h2(local.headline)}${paragraphs(local.content)}`;
  if (local.localCourts) html += `${h3("Key Courts and Venues")}${para(local.localCourts)}`;
  if (local.commonCaseTypes?.length) html += `<p>Common case types: ${esc(local.commonCaseTypes.join(", "))}.</p>`;
  return `${html}</section>`;
}

/** The team roster as it appears on /team and the profiles: degree credentials only. */
function memberSummaryHtml(m) {
  const degrees = degreeCredentials(m).filter((c) => !m.name.includes(c));
  return (
    `<li><a href="/team/${m.slug}">${esc(m.name)}</a>${degrees.length ? `, ${esc(degrees.join(", "))}` : ""} - ${esc(m.title)}. ${esc(m.bio)}</li>`
  );
}

function personNode(m) {
  return schema.personSchema({
    slug: m.slug,
    name: m.name,
    jobTitle: m.title,
    credentials: degreeCredentials(m),
    specialties: m.specialties,
    imageUrl: m.imageUrl,
    bio: m.bio,
    sameAs: m.sameAs,
  });
}

// Illustrative engagements (src/pages/CaseStudies.tsx). Read from
// src/data/case-studies.mjs when that shared module exists; otherwise the
// module-local array is read out of the page source (title, caseTypeSlug,
// context, approach[], result are single-line double-quoted strings), as is
// the revision date the page's byline and CollectionPage node carry.
// The legal pages (src/pages/Privacy.tsx, Terms.tsx): the effective-date line
// and every policy section, heading with its paragraphs, from the shared copy
// in src/data/legal-policies.ts.
const effectiveDateHtml = (d) => `<p>Effective Date: <time datetime="${esc(d.iso)}">${esc(d.label)}</time></p>`;
const legalSectionsHtml = (sections) =>
  sections.map((s) => `<section>${h2(s.heading)}${paragraphs(s.content)}</section>`).join("");
const CASE_STUDIES_DATE_MODIFIED =
  sharedCaseStudies?.CASE_STUDIES_DATE_MODIFIED ??
  readFileSync(join(SRC, "pages", "CaseStudies.tsx"), "utf-8").match(/CASE_STUDIES_DATE_MODIFIED = "(\d{4}-\d{2}-\d{2})"/)?.[1];
function caseStudyEntries() {
  if (sharedCaseStudies?.caseStudies) return sharedCaseStudies.caseStudies;
  const src = readFileSync(join(SRC, "pages", "CaseStudies.tsx"), "utf-8");
  const body = src.match(/const caseStudies = \[([\s\S]*?)\n\];/)?.[1] ?? "";
  const entries = [];
  for (const block of body.split(/\n  \{\n/).slice(1)) {
    const pick = (key) => block.match(new RegExp(`${key}:\\s*\\n?\\s*"([^"]+)"`))?.[1];
    const approachBlock = block.match(/approach:\s*\[([\s\S]*?)\n\s*\]/)?.[1] ?? "";
    entries.push({
      title: pick("title"),
      caseTypeSlug: pick("caseTypeSlug"),
      context: pick("context"),
      approach: [...approachBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]),
      result: pick("result"),
    });
  }
  return entries.filter((e) => e.title && e.context);
}

// ---------------------------------------------------------------------------
// 5. Generate all pages
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
const HOME_URL = `${BASE_URL}/`;
const corePages = [
  {
    path: "/",
    title: `Forensic Economics and Damages Experts | ${ORG_NAME}`,
    description:
      "Independent lost earnings, wrongful death, household services, employment, and business damages analyses for plaintiff and defense attorneys in all 50 states.",
    innerHtml:
      `<h1>Economic Damages Analysis Built on Transparent Methods</h1>` +
      `<p>${ORG_NAME} delivers independent lost earnings, wrongful death, household services, employment, business valuation, and forensic accounting analyses for plaintiff and defense counsel in all 50 states, the District of Columbia, and U.S. territories.</p>` +
      `<p>Engagements accepted in all 50 states, the District of Columbia, and U.S. territories. Headquarters in Hackensack, NJ with a Richmond, VA office. <a href="tel:${ORG_PHONE.replace(/-/g, "")}">${ORG_PHONE_DISPLAY}</a>.</p>` +
      // Mirrors Home.tsx REPORT_STATES: the inputs every report sets out, across
      // the earnings, valuation, and tracing lanes alike.
      `<section>${h2("What Every Report States")}${ul([
        "Question asked. The loss, value, or tracing question the analysis answers and the records it relies on.",
        "Base figures. Documented earnings and benefits, or the normalized cash flow and standard of value for a business interest.",
        "Projection assumptions. Wage growth and the worklife horizon, or the loss period and market data behind a profit projection, each on its own schedule.",
        "Discount rate. The rate that reduces future amounts to present value, matched to the stream it discounts, and its source.",
        "Tie-out to the record. Each schedule traces to the tax return, ledger, or account statement it came from, and a tracing states where the records end.",
      ])}<p>Same schedules in every venue, plaintiff or defense. <a href="/methods">See the methods</a>.</p></section>` +
      `<section>${h2("Services")}${linkList(serviceData.map((s) => ({ href: `/services/${s.slug}`, label: s.name })))}</section>` +
      `<section>${h2("Nationwide coverage")}${linkList(stateLinks((s) => `/locations/${s.slug}`))}</section>` +
      // FAQ block - the same copy Home.tsx renders (shared src/data/home-faqs.mjs).
      renderFaqHtml(HOME_FAQS, "Common questions") +
      `<section>${h2("Background reading")}${linkList([
        { href: "/guides/what-is-a-forensic-economist", label: "What Is a Forensic Economist?" },
        { href: "/guides/how-lost-earnings-are-calculated", label: "How Lost Earnings Are Calculated" },
        { href: "/guides/present-value-explained-for-attorneys", label: "Present Value, Explained for Attorneys" },
        { href: "/guides/how-to-rebut-an-economic-damages-report", label: "How to Rebut an Economic Damages Report" },
        { href: "/compare/lost-earnings-vs-lost-earning-capacity", label: "Lost Earnings vs. Lost Earning Capacity" },
        { href: "/compare/forensic-economist-vs-forensic-accountant", label: "Forensic Economist vs. Forensic Accountant" },
      ])}</section>` +
      navLinks(HUB_LINKS),
    jsonLd: [schema.organizationSchema(), schema.websiteSchema(), buildFaqJsonLd(HOME_FAQS, `${BASE_URL}/`)],
  },
  {
    path: "/about",
    title: `About ${ORG_NAME} - Independent Forensic Economics Practice`,
    description:
      `${ORG_NAME} is an independent forensic economics practice: economic damages, business valuation, and forensic accounting analyses for plaintiff and defense.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "About", path: "/about" }],
    innerHtml:
      `<h1>About ${ORG_NAME}</h1>` +
      `<p>${ORG_NAME} is a forensic economics practice. We measure economic losses for litigation - lost earnings, wrongful death losses, household services, the present value of future care, employment damages, lost profits, and the value of business interests - for attorneys and their clients across all U.S. jurisdictions, and we testify to that work when the case requires it.</p>` +
      `<section>${h2("The Practice")}` +
      `<p>${ORG_NAME} is the trade name of ${esc(ORG_LEGAL)}, the forensic economics, forensic accounting, and business valuation practice of a family of expert firms headquartered in Hackensack, New Jersey. The practice operates under its own name so that attorneys, insurers, and courts can find a dedicated economics resource.</p>` +
      `<p>Every analysis is built from the records in the case and from published data: tax returns, wage and benefit records, and financial statements on one side, and government wage, price, and worklife series, market yield data, and the forensic economics literature on the other. The report states each assumption in plain language and presents the loss under alternative scenarios where the record supports more than one reading of the facts, so the other side can recompute the figure from the report alone.</p>` +
      `<p>${ORG_SHORT} accepts plaintiff and defense engagements equally. Opinions follow the evidence. With offices in Hackensack, NJ and Richmond, VA, ${ORG_SHORT} accepts engagements in all 50 states, the District of Columbia, and U.S. territories.</p>` +
      `<p>The <a href="/services">service descriptions</a> set out each analysis the practice prepares, the <a href="/case-studies">illustrative engagements</a> show how a damages figure is built, the <a href="/resources/faq">attorney FAQ</a> answers the questions that come up at retention, and the <a href="/credentials">credentials</a> page describes what qualifies a forensic economist to testify.</p></section>` +
      // Mirrors the About.tsx "Sister Practices" section word for word: the
      // copy comes from src/data/intake.ts (FAMILY_SECTION), the sister
      // practices are named only through the brand constants (link label =
      // host), and the handoff facts come from the two pillar: false entries
      // in services.ts and the shared intake inbox (brand.ts, lead mailer).
      `<section id="family-of-practices">${h2(intake.FAMILY_SECTION.heading)}` +
      `<p>${esc(intake.FAMILY_SECTION.intro[0])}<a href="${VOC_SITE_URL}" rel="noopener">${hostOf(VOC_SITE_URL)}</a>${esc(intake.FAMILY_SECTION.intro[1])}<a href="${LCP_SITE_URL}" rel="noopener">${hostOf(LCP_SITE_URL)}</a>${esc(intake.FAMILY_SECTION.intro[2])}</p>` +
      `<ul>${intake.FAMILY_SECTION.bullets.map((b) => `<li><strong>${esc(b.lead)}</strong>${esc(b.text)}</li>`).join("")}</ul>` +
      `<p>${esc(intake.FAMILY_SECTION.intake[0])}<a href="/contact">${esc(intake.FAMILY_SECTION.contactFormLabel)}</a>${esc(intake.FAMILY_SECTION.intake[1])}<a href="mailto:${esc(brand.ORG_EMAIL)}">${esc(brand.ORG_EMAIL)}</a>${esc(intake.FAMILY_SECTION.intake[2])}</p></section>` +
      `<section>${h2("Our Economists")}<p>The practice is led by a Chief of Economic Services who directs every analysis and is available to testify to it, supported by an economics associate who coordinates each engagement with counsel.</p>${linkList(activeTeam.map((m) => ({ href: `/team/${m.slug}`, label: m.name, blurb: m.title })))}</section>` +
      navLinks([{ href: "/team", label: "Our Team" }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
    jsonLd: [
      schema.organizationSchema(),
      {
        "@type": "AboutPage",
        "@id": `${BASE_URL}/about#webpage`,
        url: `${BASE_URL}/about`,
        name: `About ${ORG_NAME}`,
        isPartOf: { "@id": schema.WEBSITE_ID },
        about: { "@id": schema.ORG_ID },
        mainEntity: { "@id": schema.ORG_ID },
      },
    ],
  },
  {
    path: "/team",
    title: `Forensic Economics Team | ${ORG_NAME}`,
    description:
      `The ${ORG_NAME} team: a Chief of Economic Services who directs each damages analysis and can testify to it, and an associate who coordinates every engagement.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Team", path: "/team" }],
    innerHtml:
      `<h1>The ${ORG_NAME} Team</h1>` +
      `<p>${ORG_NAME} is a focused practice: a Chief of Economic Services who directs every forensic economic analysis and is available to testify to it, and an economics associate who coordinates each engagement between the economics team and retaining counsel. Our analyses are prepared for plaintiff and defense attorneys and are built to be examined in the report, at deposition, and at trial.</p>` +
      `<section>${h2("Leadership")}<ul>${activeTeam.filter((m) => m.role === "leadership").map(memberSummaryHtml).join("")}</ul></section>` +
      `<section>${h2("Economics Team")}<ul>${activeTeam.filter((m) => m.role !== "leadership").map(memberSummaryHtml).join("")}</ul></section>` +
      navLinks([{ href: "/about", label: "About" }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
    jsonLd: [schema.organizationSchema(), ...activeTeam.map(personNode)],
  },
  {
    path: "/contact",
    title: `Contact a Forensic Economist | ${ORG_NAME}`,
    description:
      `Contact ${ORG_NAME} about a lost earnings, wrongful death, household services, or business damages analysis. Offices in NJ and VA; reply in 1 business day.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }],
    cta: false,
    innerHtml:
      `<h1>Contact ${ORG_NAME}</h1><p>Ready to discuss your case? Tell us about the loss claim, the records you have, and your deadlines. A member of the team responds within one business day.</p>` +
      `<section>${h2("Our Offices")}${h3("New Jersey - Headquarters")}<p>${esc(brand.OFFICES[0].streetAddress)}, Hackensack, NJ ${brand.OFFICES[0].postalCode}. <a href="tel:${ORG_PHONE.replace(/-/g, "")}">${ORG_PHONE_DISPLAY}</a>. <a href="mailto:${esc(brand.ORG_EMAIL)}">${esc(brand.ORG_EMAIL)}</a></p>${h3("Virginia - Richmond Office")}<p>Richmond, Virginia. <a href="tel:${brand.ORG_PHONE_VA.replace(/-/g, "")}">${esc(brand.ORG_PHONE_VA_DISPLAY)}</a></p><p>Office hours Monday to Friday, 9:00 AM to 5:00 PM ET.</p></section>` +
      `<section>${h2("What happens next")}${ol(["Conflict check within 1 business day.", "Scope and fee confirmed in writing for the analysis you need.", "Engagement letter and records-request checklist."])}<p><a href="/schedule-consultation">Schedule a consultation</a> to discuss the loss claim, the records you have, and your deadlines. We confirm scope, timeline, and fee before any work begins.</p>` +
      // Mirrors the note under the Contact.tsx form: where the inquiry goes
      // (src/data/intake.ts; audit F06, F08 /contact).
      `<p>${esc(intake.INTAKE_DISCLOSURE)}</p></section>` +
      navLinks([{ href: "/services", label: "Services" }, { href: "/locations", label: "Locations" }, { href: "/about", label: "About" }]),
    jsonLd: [
      schema.organizationSchema(),
      ...schema.officeSchemas(),
      {
        "@type": "ContactPage",
        "@id": `${BASE_URL}/contact#webpage`,
        url: `${BASE_URL}/contact`,
        name: "Contact a Forensic Economist",
        isPartOf: { "@id": schema.WEBSITE_ID },
        about: { "@id": schema.ORG_ID },
      },
    ],
  },
  {
    path: "/services",
    title: `Forensic Economics and Damages Services | ${ORG_NAME}`,
    description:
      "Lost earnings, wrongful death, household services, employment, business valuation, lost profits, and fraud analyses for plaintiff and defense attorneys.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }],
    innerHtml:
      `<h1>Forensic Economics and Damages Services</h1>` +
      `<p>${ORG_SHORT} prepares independent economic damages analyses, business valuations, and forensic accounting work for attorneys, insurers, and businesses in every U.S. jurisdiction. Each report states its records, data sources, and assumptions so it can be examined line by line.</p>` +
      `<section>${h2("All Services")}${linkList(serviceData.map((s) => ({ href: `/services/${s.slug}`, label: s.name, blurb: s.description })))}</section>` +
      navLinks([
        { href: "/attorneys", label: "Attorney resources by litigation stage" },
        { href: "/credentials", label: "Credentials of a forensic economist" },
        { href: "/methods", label: "Forensic economics methods" },
        { href: "/compare", label: "Expert and method comparisons" },
        { href: "/contact", label: "Contact" },
      ]),
    jsonLd: [
      schema.organizationSchema(),
      schema.websiteSchema(),
      schema.collectionPageSchema({
        url: `${BASE_URL}/services`,
        name: "Forensic Economics and Damages Services",
        description: `${ORG_SHORT} prepares independent economic damages analyses, business valuations, and forensic accounting work for attorneys, insurers, and businesses in every U.S. jurisdiction. Each report states its records, data sources, and assumptions so it can be examined line by line.`,
        items: serviceData.map((s) => item(s.name, `/services/${s.slug}`)),
      }),
    ],
  },
  {
    path: "/locations",
    title: `Forensic Economist by State: All 50 States | ${ORG_NAME}`,
    description:
      "Lost earnings, wrongful death, household services, and business damages analyses in all 50 states, DC, and U.S. territories. Pick a state for venue context.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }],
    innerHtml:
      `<h1>Forensic Economists in All 50 States, DC, and U.S. Territories</h1>` +
      `<p>${ORG_NAME} accepts cases in all 50 states, the District of Columbia, and U.S. territories. Our economists understand each jurisdiction's damages rules, local wage levels and cost of living, and court standards wherever your case is filed.</p>` +
      `<section>${h2("Select a State")}${linkList(stateLinks((s) => `/locations/${s.slug}`).map((l, i) => ({ ...l, blurb: `${states[i].abbreviation} - Capital: ${states[i].capital}` })))}</section>` +
      navLinks([
        { href: "/jurisdictions", label: "State and federal jurisdictions served" },
        { href: "/services", label: "Forensic economics and damages services" },
        { href: "/contact", label: "Contact" },
      ]),
    jsonLd: [
      schema.organizationSchema(),
      schema.websiteSchema(),
      schema.collectionPageSchema({
        url: `${BASE_URL}/locations`,
        name: "Forensic Economists in All 50 States, DC, and U.S. Territories",
        description: `${ORG_NAME} accepts cases in all 50 states, the District of Columbia, and U.S. territories. Our economists understand each jurisdiction's damages rules, local wage levels and cost of living, and court standards wherever your case is filed.`,
        items: states.map((s) => item(s.name, `/locations/${s.slug}`)),
      }),
    ],
  },
  {
    path: "/resources/faq",
    title: `Forensic Economist FAQ for Attorneys | ${ORG_NAME}`,
    description:
      "Answers for attorneys retaining a forensic economist: records, how the number is built, fees, timing, admissibility, and coverage in all 50 states.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "FAQ", path: "/resources/faq" }],
    innerHtml:
      `<h1>Frequently Asked Questions</h1>` +
      `<p>Answers to common questions about economic damages analysis, our process, the records we need, fees, and geographic coverage. Don't see your question? <a href="/contact">Contact us directly</a>.</p>` +
      renderBylineHtml("christopher-skerritt", undefined, FAQ_DATE_MODIFIED) +
      renderFaqHtml(siteFaqs, "Questions attorneys ask") +
      sourcesHtml(siteFaqs.flatMap((f) => f.sources ?? [])) +
      navLinks([{ href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }, { href: "/about", label: "About" }]),
    // The FAQPage node carries the revision date the byline prints and the
    // site/organization ids, exactly as FAQ.tsx builds it.
    jsonLd: [
      schema.organizationSchema(),
      {
        ...buildFaqJsonLd(siteFaqs, `${BASE_URL}/resources/faq`),
        url: `${BASE_URL}/resources/faq`,
        dateModified: FAQ_DATE_MODIFIED,
        isPartOf: { "@id": schema.WEBSITE_ID },
        about: { "@id": schema.ORG_ID },
      },
    ],
  },
];

for (const page of corePages) {
  writePage(page.path, buildPage(page));
  counts.core++;
}

// --- Phase 2 pages ---

// The /insights hub lead (src/pages/InsightsHub.tsx LEAD): the hero paragraph
// and the CollectionPage description.
const INSIGHTS_LEAD = `Insights are shorter articles on the questions that recur in economic damages work: what a damages report contains, how expert testimony on damages is admitted, and how valuation and forensic accounting evidence is built and tested. They are written by the economists at ${ORG_NAME} for attorneys on both sides of a damages claim.`;

const phase2Pages = [
  {
    path: "/knowledge",
    title: `Knowledge Center: Economic Damages Guides | ${ORG_NAME}`,
    description:
      "In-depth guides on economic damages, expert witness testimony, and the methods behind a defensible damages figure, written for attorneys who retain economists.",
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Knowledge Center", path: "/knowledge" }],
    innerHtml:
      `<h1>Knowledge Center: Economic Damages Guides for Attorneys</h1>` +
      `<p>The Knowledge Center holds the long-form guides behind an economic damages report: what a loss claim consists of, which records drive it, and how a defensible figure is built and tested. Each guide is written for attorneys who retain or cross-examine economists and covers the methodology, the governing standards, and the practical considerations for litigation.</p>` +
      `<section>${h2("Pillar Guides")}${linkList(knowledgeGuides.map((g) => ({ href: `/knowledge/${g.slug}`, label: g.title, blurb: g.description })))}</section>` +
      libraryNav("/knowledge"),
    jsonLd: [
      schema.organizationSchema(),
      schema.websiteSchema(),
      schema.collectionPageSchema({
        url: `${BASE_URL}/knowledge`,
        name: "Knowledge Center: Economic Damages Guides for Attorneys",
        description:
          "The Knowledge Center holds the long-form guides behind an economic damages report: what a loss claim consists of, which records drive it, and how a defensible figure is built and tested. Each guide is written for attorneys who retain or cross-examine economists and covers the methodology, the governing standards, and the practical considerations for litigation.",
        items: knowledgeGuides.map((g) => item(g.title, `/knowledge/${g.slug}`)),
      }),
    ],
  },
  {
    path: "/insights",
    title: `Economic Damages Insights and Articles | ${ORG_NAME}`,
    description:
      `Articles on economic damages, business valuation, forensic accounting, and expert witness standards, written by the economists at ${ORG_NAME} for attorneys.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }],
    innerHtml:
      `<h1>Insights on Economic Damages and Expert Testimony</h1><p>${INSIGHTS_LEAD}</p>` +
      `<section>${h2("Articles")}<ul>${insightPosts
        .map(
          (p) =>
            `<li><a href="/insights/${p.slug}">${esc(p.title)}</a> - ${esc(p.category)}, <time datetime="${esc(p.publishedDate)}">${esc(p.publishedDate)}</time>. ${esc(p.excerpt)}</li>`,
        )
        .join("")}</ul></section>` +
      libraryNav("/insights"),
    jsonLd: [
      schema.organizationSchema(),
      schema.websiteSchema(),
      schema.collectionPageSchema({
        url: `${BASE_URL}/insights`,
        name: "Insights on Economic Damages and Expert Testimony",
        description: INSIGHTS_LEAD,
        items: insightPosts.map((p) => item(p.title, `/insights/${p.slug}`)),
      }),
    ],
  },
  {
    path: "/case-studies",
    title: `Illustrative Economic Damages Engagements | ${ORG_NAME}`,
    description:
      `Three anonymized engagements show how ${ORG_NAME} builds a lost earnings, lost profits, or business valuation figure for plaintiff and defense counsel.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Case Studies", path: "/case-studies" }],
    innerHtml:
      `<h1>How an Economic Damages Analysis Is Built</h1>` +
      `<p>${ORG_NAME} supports both plaintiff and defense counsel. The three narratives below are anonymized composites that show how a damages figure is grounded, structured, and tested in three common contexts. They describe method, not specific cases or outcomes.</p>` +
      renderBylineHtml("christopher-skerritt", undefined, CASE_STUDIES_DATE_MODIFIED) +
      `<p>Our work is retained by plaintiff attorneys, defense attorneys, insurers, and businesses. We do not advocate for either side - our role is to apply accepted economic methods to the records in the case and produce an analysis that can be examined figure by figure. The narratives below are illustrative and contain no client-identifying details; any resemblance to a particular matter is coincidental.</p>` +
      `<section>${h2("Built to be defensible")}<p>Whatever the loss, the analysis is held to the same standard - so each figure holds up under examination, not just on paper.</p>${ul([
        "Same method, either side. The methodology is identical whether plaintiff or defense commissions the work. An analysis that only holds up for the retaining party does not survive cross-examination.",
        "Records, assumptions, arithmetic. Every figure traces to a record in the case or a published data source, states the assumption behind it, and can be recomputed by the other side from the report alone.",
        "Conflict-checked and confidential. Every matter opens with a conflict check. Pre-retention communications are handled confidentially; whether they are protected as consulting-expert work product depends on the terms of the retention and the rules of the forum, which counsel confirms at engagement.",
      ])}</section>` +
      caseStudyEntries()
        .map(
          (cs) =>
            `<article>${h2(cs.title)}${h3("Context")}${para(cs.context)}${h3("Approach")}${ol(cs.approach)}${h3("What the analysis delivered")}${para(cs.result)}${
              cs.caseTypeSlug ? `<p><a href="/case-types/${esc(cs.caseTypeSlug)}">About this case type</a></p>` : ""
            }</article>`,
        )
        .join("") +
      navLinks([{ href: "/services", label: "Services" }, { href: "/case-types", label: "Case Types" }, { href: "/contact", label: "Contact" }]),
    jsonLd: [
      schema.organizationSchema(),
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}/case-studies#webpage`,
        url: `${BASE_URL}/case-studies`,
        name: "Illustrative Economic Damages Engagements",
        dateModified: CASE_STUDIES_DATE_MODIFIED,
        isPartOf: { "@id": schema.WEBSITE_ID },
        about: { "@id": schema.ORG_ID },
      },
    ],
  },
  {
    path: "/schedule-consultation",
    title: `Schedule a Forensic Economist Consultation | ${ORG_NAME}`,
    description:
      `Contact ${ORG_NAME} to discuss your case and schedule an economic damages consultation with a forensic economist. Response within one business day.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }, { name: "Schedule a Consultation", path: "/schedule-consultation" }],
    cta: false,
    // Mirrors ScheduleConsultation.tsx through src/data/consultation.ts: the
    // hero lead, the four "What to Expect" steps, the preparation list, the
    // request form's field labels and choices, and the office details, so a
    // non-JS reader learns what the consultation involves and how to request
    // one. The form itself is client-side; the shell offers the phone and the
    // contact page as the working paths.
    innerHtml:
      // The lead is the page's own hero paragraph (src/data/consultation.ts);
      // the shell prints no paragraph the hydrated page does not.
      `<h1>Schedule a Consultation</h1>${para(consultation.CONSULTATION_LEAD)}` +
      `<section>${h2("What to Expect")}<ol>${consultation.whatToExpect
        .map((s) => `<li><strong>${esc(s.heading)}:</strong> ${esc(s.body)}</li>`)
        .join("")}</ol></section>` +
      `<section>${h2("Information to Have Ready")}${para(consultation.INFO_TO_HAVE_READY_INTRO)}${ul(consultation.infoToHaveReady)}</section>` +
      `<section>${h2("Request a Consultation")}<p>The request form asks for the following. Fields marked required must be completed before the form is submitted.</p>` +
      `<ul>${consultation.consultationFormFields
        .map((f) => `<li>${esc(f.label)}${f.required ? " (required)" : ""}${f.options ? `: ${esc(f.options.join(", "))}` : ""}</li>`)
        .join("")}</ul>` +
      `<p>The form is sent with the "${esc(consultation.FORM_SUBMIT_LABEL)}" button. ${esc(consultation.FORM_FOOTNOTE)}</p><p>${esc(consultation.FORM_INTAKE_NOTE)}</p></section>` +
      `<section>${h2("Our Offices")}${consultation.consultationOffices
        .map(
          (o) =>
            `<h3>${esc(o.heading)}</h3><p>${esc(o.location)}. Phone: <a href="tel:${o.phone.replace(/-/g, "")}">${esc(o.phoneDisplay)}</a>.` +
            (o.email ? ` Email: <a href="mailto:${esc(o.email)}">${esc(o.email)}</a>.` : "") +
            `</p>`,
        )
        .join("")}` +
      `<h3>Office Hours</h3><p>${consultation.OFFICE_HOURS.map((h) => `${esc(h.days)}: ${esc(h.hours)}`).join(". ")}. ${esc(consultation.AFTER_HOURS_NOTE)}</p></section>` +
      navLinks([{ href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
    jsonLd: [
      schema.organizationSchema(),
      {
        "@type": "ContactPage",
        "@id": `${BASE_URL}/schedule-consultation#webpage`,
        url: `${BASE_URL}/schedule-consultation`,
        name: "Schedule a Forensic Economist Consultation",
        isPartOf: { "@id": schema.WEBSITE_ID },
        about: { "@id": schema.ORG_ID },
      },
    ],
  },
  {
    path: "/privacy",
    title: `Privacy Policy | ${ORG_NAME}`,
    description:
      `How ${ORG_NAME} handles information submitted through this site: contact and consultation forms, analytics cookies, disclosure limits, and data security.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy" }],
    cta: false,
    // The full policy (Privacy.tsx via src/data/legal-policies.ts): effective
    // date, the opening paragraph, and every section's heading and paragraphs.
    innerHtml:
      `<h1>Privacy Policy</h1>` +
      effectiveDateHtml(legalPolicies.PRIVACY_EFFECTIVE_DATE) +
      para(legalPolicies.privacyIntro) +
      legalSectionsHtml(legalPolicies.privacySections) +
      navLinks([{ href: "/terms", label: "Terms of Service" }, { href: "/contact", label: "Contact Us" }]),
    jsonLd: [],
  },
  {
    path: "/terms",
    title: `Terms of Service | ${ORG_NAME}`,
    description:
      `Terms of use for the ${ORG_NAME} website: informational content only, no expert relationship until an engagement letter is signed, and New Jersey law.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Terms of Service", path: "/terms" }],
    cta: false,
    // The full terms (Terms.tsx via src/data/legal-policies.ts): effective
    // date, the opening paragraph, and every section's heading and paragraphs.
    innerHtml:
      `<h1>Terms of Service</h1>` +
      effectiveDateHtml(legalPolicies.TERMS_EFFECTIVE_DATE) +
      para(legalPolicies.termsIntro) +
      legalSectionsHtml(legalPolicies.termsSections) +
      navLinks([{ href: "/privacy", label: "Privacy Policy" }, { href: "/contact", label: "Contact Us" }]),
    jsonLd: [],
  },
];

for (const page of phase2Pages) {
  writePage(page.path, buildPage(page));
  counts.core++;
}

// --- Knowledge guide pages ---

for (const guide of knowledgeGuides) {
  const path = `/knowledge/${guide.slug}`;
  const url = abs(path);
  // Match KnowledgeArticle.tsx: the reviewed date is the entry's own
  // dateModified and the published date falls back to it.
  const dateMod = guide.dateModified;
  const datePublished = guide.datePublished ?? dateMod;
  const faqs = guide.faqs ?? [];
  const keyPoints = guide.keyPoints ?? [];
  writePage(
    path,
    buildPage({
      path,
      title: `${guide.metaTitle ?? guide.title} | ${ORG_NAME}`,
      description: guide.metaDescription ?? guide.description,
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Knowledge", path: "/knowledge" }, { name: guide.title, path }],
      ogType: "article",
      datePublished,
      dateModified: dateMod,
      innerHtml:
        `<h1>${esc(guide.title)}</h1>` +
        lead(guide.description) +
        renderBylineHtml(guide.authorSlug, datePublished, dateMod) +
        (keyPoints.length ? `<section>${h2("Key points")}${ul(keyPoints)}</section>` : "") +
        guide.sections.map((s, idx) => `<section id="section-${idx}">${h2(s.heading)}${paragraphs(s.content)}</section>`).join("") +
        renderFaqHtml(faqs) +
        sourcesHtml(guide.sources) +
        navLinks([{ href: "/knowledge", label: "Knowledge Center" }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
      ctaContext: guide.title,
      jsonLd: [
        schema.organizationSchema(),
        {
          ...schema.articleSchema({
            title: guide.title,
            description: guide.description,
            url,
            dateModified: dateMod,
            datePublished,
            authorSlug: guide.authorSlug,
          }),
          ...SPEAKABLE,
        },
        ...(faqs.length ? [buildFaqJsonLd(faqs, url)] : []),
      ],
    }),
  );
  counts.knowledge++;
}

// --- Insight post pages ---

for (const post of insightPosts) {
  const path = `/insights/${post.slug}`;
  const url = abs(path);
  const dateMod = post.dateModified ?? post.publishedDate;
  writePage(
    path,
    buildPage({
      path,
      title: `${post.metaTitle ?? post.title} | ${ORG_NAME}`,
      description: post.metaDescription ?? post.excerpt,
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Insights", path: "/insights" }, { name: post.title, path }],
      ogType: "article",
      datePublished: post.publishedDate,
      dateModified: dateMod,
      innerHtml:
        `<p>${esc(post.category)} &middot; <time datetime="${esc(post.publishedDate)}">${esc(post.publishedDate)}</time></p>` +
        `<h1>${esc(post.title)}</h1>` +
        lead(post.excerpt) +
        renderBylineHtml(post.authorSlug, post.publishedDate, dateMod) +
        // "## Heading" paragraphs become <h2 id> exactly as InsightPost.tsx renders them.
        insightBlocks(post.content)
          .map((b) => (b.type === "heading" ? `<h2 id="${esc(b.id)}">${esc(b.text)}</h2>` : para(b.text)))
          .join("") +
        relatedHtml(post.related ?? [], "Related reading") +
        sourcesHtml(post.sources) +
        navLinks([{ href: "/insights", label: "All Insights" }, { href: "/knowledge", label: "Knowledge Center" }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
      ctaContext: post.category,
      jsonLd: [
        schema.organizationSchema(),
        {
          ...schema.blogPostingSchema({
            title: post.title,
            description: post.excerpt,
            url,
            datePublished: post.publishedDate,
            dateModified: dateMod,
            authorSlug: post.authorSlug,
          }),
          ...SPEAKABLE,
        },
      ],
    }),
  );
  counts.insights++;
}

// --- Guide pages (`/guides/:slug`) ---
// Static HTML so crawlers see real content (the SPA route hydrates the same
// content client-side). Required by sitemap.xml which lists all guide slugs.

for (const [i, guide] of guides.entries()) {
  const path = `/guides/${guide.slug}`;
  const url = abs(path);
  const prev = guides[i - 1];
  const next = guides[i + 1];
  writePage(
    path,
    buildPage({
      path,
      // Match PillarGuide.tsx: metaTitle where the H1 runs long, the written
      // metaDescription (never an auto-cut of the tldr).
      title: `${guide.metaTitle ?? guide.title} | ${ORG_NAME}`,
      description: guide.metaDescription ?? truncateAtWord(guide.tldr),
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: guide.title, path }],
      ogType: "article",
      datePublished: guide.datePublished ?? guide.dateModified,
      dateModified: guide.dateModified,
      innerHtml:
        `<h1>${esc(guide.title)}</h1>` +
        renderBylineHtml(guide.authorSlug, guide.datePublished, guide.dateModified) +
        lead(guide.tldr) +
        // Section bodies are authored HTML (double-quoted strings with escaped
        // attribute quotes in guides.ts); they render verbatim.
        (guide.sections ?? []).map((s) => `<section id="${esc(s.id)}">${h2(s.heading)}${s.bodyHtml}</section>`).join("") +
        renderFaqHtml(guide.faqs ?? []) +
        relatedHtml(guide.related ?? []) +
        sourcesHtml(guide.sources) +
        navLinks([
          ...(prev ? [{ href: `/guides/${prev.slug}`, label: `Previous: ${prev.title}` }] : []),
          ...(next ? [{ href: `/guides/${next.slug}`, label: `Next: ${next.title}` }] : []),
          { href: "/guides", label: "All Guides" },
          { href: "/services", label: "Services" },
          { href: "/contact", label: "Contact" },
        ]),
      ctaContext: guide.title,
      jsonLd: [
        {
          ...schema.articleSchema({
            title: guide.title,
            description: guide.tldr,
            url,
            datePublished: guide.datePublished,
            dateModified: guide.dateModified,
            authorSlug: guide.authorSlug,
            image: guide.image,
          }),
          ...SPEAKABLE,
        },
        buildFaqJsonLd(guide.faqs ?? [], url),
      ],
    }),
  );
  counts.guides++;
}

// --- Comparison pages (`/compare/:slug`) ---

for (const [i, cmp] of comparisons.entries()) {
  const path = `/compare/${cmp.slug}`;
  const url = abs(path);
  const prev = comparisons[i - 1];
  const next = comparisons[i + 1];
  const side = (x) =>
    `<section>${h2(x.label)}${para(x.summary)}${x.url ? `<p><a href="${esc(x.url)}">Learn more about ${esc(x.label)}</a></p>` : ""}</section>`;
  const table =
    `<table><thead><tr><th>Dimension</th><th>${esc(cmp.a.label)}</th><th>${esc(cmp.b.label)}</th></tr></thead><tbody>` +
    cmp.rows.map((r) => `<tr><td>${esc(r.dimension)}</td><td>${esc(r.a)}</td><td>${esc(r.b)}</td></tr>`).join("") +
    `</tbody></table>`;
  writePage(
    path,
    buildPage({
      path,
      // Match Comparison.tsx: the one-sentence answer is the meta
      // description, the lead, and the Article description.
      title: `${cmp.metaTitle ?? cmp.title} | ${ORG_NAME}`,
      description: cmp.answer ?? truncateAtWord(stripLinkMarkers(cmp.overlap)),
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Compare", path: "/compare" }, { name: cmp.title, path }],
      ogType: "article",
      datePublished: cmp.datePublished ?? cmp.dateModified,
      dateModified: cmp.dateModified,
      innerHtml:
        `<h1>${esc(cmp.title)}</h1>` +
        renderBylineHtml(cmp.authorSlug, cmp.datePublished, cmp.dateModified) +
        (cmp.answer ? lead(cmp.answer) : "") +
        side(cmp.a) +
        side(cmp.b) +
        table +
        `<section id="when-a">${h2(`When to use ${cmp.a.label}`)}${para(cmp.whenUseA)}</section>` +
        `<section id="when-b">${h2(`When to use ${cmp.b.label}`)}${para(cmp.whenUseB)}</section>` +
        `<section id="overlap">${h2("Where they overlap")}${para(cmp.overlap)}</section>` +
        renderFaqHtml(cmp.faqs ?? []) +
        sourcesHtml(cmp.sources) +
        relatedHtml(cmp.related ?? []) +
        navLinks([
          ...(prev ? [{ href: `/compare/${prev.slug}`, label: `Previous: ${prev.title}` }] : []),
          ...(next ? [{ href: `/compare/${next.slug}`, label: `Next: ${next.title}` }] : []),
          { href: "/compare", label: "All Comparisons" },
          { href: "/services", label: "Services" },
          { href: "/contact", label: "Contact" },
        ]),
      ctaContext: cmp.title,
      jsonLd: [
        {
          ...schema.articleSchema({
            title: cmp.title,
            description: cmp.answer ?? cmp.overlap,
            url,
            datePublished: cmp.datePublished,
            dateModified: cmp.dateModified,
            authorSlug: cmp.authorSlug,
          }),
          ...SPEAKABLE,
        },
        buildFaqJsonLd(cmp.faqs ?? [], url),
      ],
    }),
  );
  counts.comparisons++;
}

// --- Service pillar pages ---

for (const svc of serviceData) {
  const path = `/services/${svc.slug}`;
  const url = abs(path);
  const work = prose.workPhrase(svc.shortName);
  const name = prose.proseName(svc.shortName);
  // The hand-authored, service-specific FAQ (services.ts `faqs`) the pillar
  // renders and marks up; the templated set is only a fallback.
  const faqs = svc.faqs ?? pillarFaqs(svc);
  const description = svc.metaDescription ?? svc.description;
  // Only the pairs this pillar declares (the same set ServicePillar.tsx links).
  const declaredCaseTypes = svc.caseTypes
    .map((ct) => caseTypeBySlug[ct] ?? caseTypes.find((c) => c.name === ct))
    .filter(Boolean);
  const linkedCredentials = credentials.filter((c) => credentialMatches(c, svc.relevantCredentials));
  writePage(
    path,
    buildPage({
      path,
      // Match ServicePillar.tsx: the shared pillarTitle builder ("<name> Expert
      // | <brand>", titleName where the full name would overrun the tag) and
      // the written metaDescription.
      title: pillarTitle(svc, ORG_NAME),
      description,
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: svc.name, path }],
      innerHtml:
        `<h1>${esc(svc.name)}</h1>` +
        renderBylineHtml(undefined, undefined, svc.dateModified) +
        para(svc.description) +
        `<p>${ORG_NAME} prepares ${esc(work)} for plaintiff and defense counsel nationwide; the method is the same whichever side retains the economist.</p>` +
        // Mirrors ServicePillar.tsx: the professional responsible for the work
        // (C02) and, where the pillar carries one, the explained hand-off to
        // the sister practice whose discipline the work depends on (F08, G01).
        responsibilityHtml(`${prose.capFirst(work)} at ${ORG_NAME}`, false) +
        (svc.handoff
          ? `<p>${esc(svc.handoff.text)} <a href="${esc(svc.handoff.href)}" rel="noopener">${esc(svc.handoff.linkLabel)}</a>.</p>`
          : "") +
        (declaredCaseTypes.length
          ? `<section>${h2("Case Types")}${linkList(declaredCaseTypes.map((c) => ({ href: `/case-types/${c.slug}`, label: c.name })))}</section>`
          : "") +
        `<section>${h2(`${svc.shortName} by Case Type`)}<p>How ${esc(work)} applies to the specific demands of each case type: methodology, deliverables, and what counsel should expect.</p>${linkList(
          declaredCaseTypes.map((c) => ({ href: `/services/${svc.slug}/case/${c.slug}`, label: `${svc.shortName} for ${c.name}` })),
        )}</section>` +
        // The FAQ and the guides come before the 56-entry state directory, as
        // on the hydrated page (audit F08).
        renderFaqHtml(faqs, `Frequently asked: ${svc.shortName}`) +
        relatedHtml(svc.related ?? [], `Guides and methods for ${name}`) +
        `<section>${h2(`${svc.shortName} by State`)}${linkList(
          states.map((s) => ({ href: `/services/${svc.slug}/${s.slug}`, label: s.name, blurb: s.abbreviation })),
        )}</section>` +
        sourcesHtml(svc.sources) +
        (linkedCredentials.length
          ? `<section>${h2("How an expert on this work is qualified")}<p>No state licenses forensic economists. Qualification to testify on ${esc(work)} is decided case by case on education, method, and testimony history; these pages explain what each credential establishes and what it does not.</p>${linkList(
              linkedCredentials.map((c) => ({ href: `/credentials/${c.slug}`, label: c.name })),
            )}</section>`
          : "") +
        `<section>${h2("Engagement Details")}${linkList(
          VARIANTS.map((v) => ({ href: `/services/${svc.slug}/${v}`, label: VARIANT_LINK_LABEL[v] })),
        )}</section>` +
        navLinks([{ href: "/services", label: "All Services" }, { href: "/locations", label: "Locations" }, { href: "/contact", label: "Contact" }]),
      ctaContext: svc.shortName,
      jsonLd: [
        schema.organizationSchema(),
        schema.serviceSchema({ url, name: svc.name, description, dateModified: svc.dateModified }),
        buildFaqJsonLd(faqs, url),
      ],
    }),
  );
  counts.servicePillar++;
}

// ---------------------------------------------------------------------------
// Geo pages. The narrative and FAQ copy comes from src/data/narratives.ts and
// src/data/geographicFaqs.ts, the same modules the React pages render, so the
// shells carry exactly the hydrated copy.
// ---------------------------------------------------------------------------

const stateNarrative = (state) => narratives.getStateNarrative(state);
const cityNarrative = (state, city) =>
  narratives.getCityNarrative(state, city.name, city.slug, city.county, { msaName: city.msaName });

// The city intro CityPage.tsx builds from the city's own attributes (county,
// MSA, capital or largest-city status); kept in step with buildCityIntro there.
function cityIntro(city, state) {
  const lead = `${city.name} is located in ${city.county}, ${state.name}.`;
  let role;
  if (city.isStateCapital) {
    role = `As the capital of ${state.name}, ${city.name} is home to the state's principal courts and administrative agencies, and public-sector pay scales and benefit plans shape many of the earnings histories the economist is asked to project.`;
  } else if (city.name === state.largestCity) {
    role = `As the largest city in ${state.name}, ${city.name} anchors one of the state's most active litigation markets and its most diverse wage market, so an earnings projection has to be built for the plaintiff's own occupation and employer rather than for the city as a whole.`;
  } else if (city.msaName) {
    role = `It falls within the ${city.msaName} metropolitan area, whose occupational wage data and cost of living anchor the earnings and household-services components of a local analysis.`;
  } else {
    role = `Counsel across ${city.county} retain ${ORG_NAME} for objective lost earnings, wrongful death, household services, and business damages analyses.`;
  }
  const close = `${ORG_NAME} prepares independent economic damages reports for ${city.name} attorneys and insurers, grounded in ${state.name}'s expert evidence standards and damages rules and measured against wage data for the ${cityAttr(city.name)} area.`;
  return `${lead} ${role} ${close}`;
}

// --- State pages ---

for (const state of states) {
  const path = `/locations/${state.slug}`;
  const url = abs(path);
  const narrative = stateNarrative(state);
  const faqs = geoFaqs.stateGeographicFaqs(state.name);
  const place = placeName(state.name);
  const cities = cityDataByState[state.slug] ?? [];
  const innerHtml =
    `<h1>Forensic Economists in ${esc(place)}</h1>` +
    para(narrative.directAnswer) +
    para(narrative.economicContext) +
    `<section>${h2(`Expert Services in ${place}`)}<p>Our forensic economists prepare lost earnings, wrongful death, household services, employment, and business damages analyses and rebuttals for ${esc(state.name)} litigation. Each projection is anchored to the plaintiff's own records and to ${esc(state.name)} wage data, and written to the jurisdiction's expert evidence standards.</p>${responsibilityHtml(`Analyses for ${placeAttr(state.name)} matters`)}${linkList(
      serviceData.map((s) => ({ href: `/services/${s.slug}/${state.slug}`, label: `${s.shortName} in ${place}` })),
    )}</section>` +
    (cities.length
      ? `<section>${h2(`Cities We Serve in ${place}`)}<p>${ORG_NAME} accepts cases from attorneys across ${esc(place)}. Select a city for local wage-market and venue context.</p>${linkList(
          cities.map((c) => ({ href: `/locations/${state.slug}/${c.slug}`, label: c.name, blurb: c.county })),
        )}</section>`
      : "") +
    `<section>${h2(`Where ${state.name} Damages Claims Are Litigated`)}<p>An economic damages report is written for the forum that will examine it and around the damages rules that forum applies.</p>${damagesFrameworkHtml(state)}${courtsHtml(state)}</section>` +
    `<section>${h2(`Case Types We Support in ${place}`)}${linkList(caseTypes.map((c) => ({ href: `/case-types/${c.slug}/${state.slug}`, label: c.name })))}</section>` +
    `<section>${h2(`Expert Credentials in ${place}`)}${linkList(credentials.map((c) => ({ href: `/credentials/${c.slug}/${state.slug}`, label: `${c.abbreviation} (${c.name})` })))}</section>` +
    localContentHtml(state.slug, undefined) +
    para(narrative.legalContext) +
    renderFaqHtml(faqs, `Frequently asked: ${state.name} expert services`) +
    navLinks([{ href: "/services", label: "Services" }, { href: "/locations", label: "All Locations" }, { href: "/jurisdictions", label: "Jurisdictions" }, { href: "/contact", label: "Contact" }]);
  writePage(
    path,
    buildPage({
      path,
      // Match StateHub.tsx: the shared stateHubTitle builder (placeName "the
      // District of Columbia"; the abbreviation only where it cannot fit).
      title: stateHubTitle(state, ORG_NAME),
      description: `Forensic economists for ${place}: lost earnings, wrongful death, household services, and business damages analyses, plaintiff and defense.`,
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "Locations", path: "/locations" }, { name: state.name, path }],
      innerHtml,
      ctaContext: `${state.name} cases`,
      jsonLd: [
        schema.organizationSchema(),
        schema.serviceSchema({
          url,
          name: `Economic Damages Services in ${place}`,
          description: narrative.directAnswer,
          areaServed: { "@type": "AdministrativeArea", name: state.name },
        }),
        buildFaqJsonLd(faqs, url),
      ],
    }),
  );
  counts.state++;
}

// --- City pages ---

for (const state of states) {
  const cities = cityDataByState[state.slug] ?? [];
  for (const city of cities) {
    const path = `/locations/${state.slug}/${city.slug}`;
    const url = abs(path);
    const narrative = cityNarrative(state, city);
    const faqs = geoFaqs.cityGeographicFaqs(state.name, city.name);
    const nearby = geoLinks.nearestCities(cities, city.slug, 6);
    const hasCityServicePages = geoLinks.hasServiceCityPages(cities, city.slug);
    const serviceLinksHere = hasCityServicePages
      ? serviceData.map((s) => ({ href: `/services/${s.slug}/${state.slug}/${city.slug}`, label: s.name, blurb: s.description }))
      : serviceData
          .filter((s) => s.slug !== "expert-rebuttal-and-report-review")
          .map((s) => ({ href: `/services/${s.slug}/${state.slug}`, label: s.name, blurb: s.description }));
    const innerHtml =
      `<h1>Forensic Economists in ${esc(city.name)}, ${esc(state.abbreviation)}</h1>` +
      para(narrative.directAnswer) +
      para(narrative.blurb) +
      para(cityIntro(city, state)) +
      // Mirrors CityPage.tsx: the professional responsible for the work (C02).
      responsibilityHtml(`Analyses for ${cityAttr(city.name)} matters`) +
      `<section>${h2(`Services in ${city.name}`)}${linkList(serviceLinksHere)}</section>` +
      `<section>${h2(`About ${city.name}`)}<p>County: ${esc(city.county)}.${city.msaName ? ` Metropolitan area: ${esc(city.msaName)}.` : ""}${city.isStateCapital ? ` State capital of ${esc(state.name)}.` : ""}</p></section>` +
      `<section>${h2(`Where ${state.name} Damages Claims Are Litigated`)}<p>Economic damages reports for ${esc(city.name)} cases are prepared for ${esc(state.name)}'s civil and compensation forums, its expert evidence standards, and the damages rules that decide which loss components are recoverable.</p>${damagesFrameworkHtml(state)}</section>` +
      localContentHtml(state.slug, city.slug) +
      (nearby.length
        ? `<section>${h2(`Nearby Cities in ${state.name}`)}${linkList(nearby.map((c) => ({ href: `/locations/${state.slug}/${c.slug}`, label: c.name, blurb: c.county })))}</section>`
        : "") +
      renderFaqHtml(faqs, `Frequently asked: ${city.name} expert services`) +
      navLinks([{ href: `/locations/${state.slug}`, label: `All ${state.name} locations` }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]);
    writePage(
      path,
      buildPage({
        path,
        // Match CityPage.tsx: the shared cityHubTitle builder (the state
        // abbreviation, dropped only where a long city name cannot fit).
        title: cityHubTitle(city, state, ORG_NAME),
        description: truncateAtWord(narrative.directAnswer),
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Locations", path: "/locations" },
          { name: state.name, path: `/locations/${state.slug}` },
          { name: city.name, path },
        ],
        innerHtml,
        ctaContext: `${city.name}, ${state.abbreviation} cases`,
        jsonLd: [
          schema.organizationSchema(),
          schema.serviceSchema({
            url,
            name: `Economic Damages Services in ${city.name}, ${state.abbreviation}`,
            description: narrative.directAnswer,
            areaServed: { "@type": "City", name: `${city.name}, ${state.abbreviation}` },
          }),
          buildFaqJsonLd(faqs, url),
        ],
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
  const work = prose.workPhrase(svc.shortName);
  const relatedServices = serviceData.filter((s) => s.slug !== svc.slug && s.slug !== "expert-rebuttal-and-report-review");
  const serviceCaseTypes = svc.caseTypes.map((ct) => caseTypeBySlug[ct]).filter(Boolean);
  for (const state of states) {
    const path = `/services/${svc.slug}/${state.slug}`;
    const url = abs(path);
    const narrative = stateNarrative(state);
    const faqs = geoFaqs.serviceStateGeographicFaqs(svc, state.name);
    const place = placeName(state.name);
    const directAnswer = narratives.serviceStateDirectAnswer(ORG_NAME, svc.shortName, state.name, narrative);
    const regs = getRegulationsByState(state.slug);
    // Mirrors ServiceState.tsx: the pillar's own venue paragraph
    // (src/data/narratives.ts serviceStateVenueParagraph) on the pillars whose
    // framework is not the tort framework (employment, the commercial pillars,
    // divorce, rebuttal); the tort pillars print the state's damages context
    // and its workers' compensation forum (2026-09-05 audit, F09).
    const venueParagraph = narratives.serviceStateVenueParagraph(svc, state);
    const topCities = geoLinks.serviceCityCities(cityDataByState[state.slug] ?? []);
    const innerHtml =
      `<h1>${esc(svc.shortName)} in ${esc(place)}</h1>` +
      para(directAnswer) +
      // Mirrors ServiceState.tsx: the legal context for this pillar's category
      // (the commercial and family-financial pillars never print the workers'
      // compensation forum, which hears no claim of theirs; audit F09).
      para(narratives.serviceStateLegalContext(svc.shortName, narrative)) +
      `<section>${h2(`${svc.shortName} in ${place}`)}${para(svc.description)}${
        venueParagraph
          ? `<p>${esc(venueParagraph)}</p>`
          : regs
            ? `<p>${esc(regs.damagesContext)} Outside the civil courts, wage-loss disputes in workers' compensation matters proceed before the ${esc(regs.compensationForum)}.</p>`
            : ""
      }${responsibilityHtml(`${prose.capFirst(work)} for ${placeAttr(state.name)} matters`, false)}</section>` +
      (serviceCaseTypes.length
        ? `<section>${h2("Case Types")}${linkList(serviceCaseTypes.map((c) => ({ href: `/case-types/${c.slug}/${state.slug}`, label: c.name })))}</section>`
        : "") +
      (topCities.length
        ? `<section>${h2(`${svc.shortName} Across ${place}`)}<p>Our experts serve clients throughout ${esc(place)}, including the following communities.</p>${linkList(
            topCities.map((c) => ({ href: `/services/${svc.slug}/${state.slug}/${c.slug}`, label: `${svc.shortName} in ${c.name}`, blurb: c.county })),
          )}</section>`
        : "") +
      `<section>${h2(`Related Services in ${place}`)}<p>${ORG_NAME} offers complementary services to support your ${esc(state.name)} cases.</p>${linkList(
        relatedServices.map((s) => ({ href: `/services/${s.slug}/${state.slug}`, label: s.shortName })),
      )}</section>` +
      renderFaqHtml(faqs, `Frequently asked: ${svc.shortName} in ${place}`) +
      navLinks([
        { href: `/services/${svc.slug}`, label: `All ${svc.shortName} Locations` },
        { href: `/locations/${state.slug}`, label: `${state.name} Locations Hub` },
        { href: "/services", label: "All Services" },
        { href: "/contact", label: "Contact" },
      ]);
    writePage(
      path,
      buildPage({
        path,
        // Match ServiceState.tsx: the shared serviceStateTitle builder (the
        // title label and the place name, the abbreviation only where the
        // full name cannot fit); the description is the hero cut at a word.
        title: serviceStateTitle(svc, state, ORG_NAME),
        description: truncateAtWord(directAnswer),
        breadcrumbs: [
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: svc.name, path: `/services/${svc.slug}` },
          { name: state.name, path },
        ],
        innerHtml,
        ctaContext: `${svc.shortName} in ${place}`,
        jsonLd: [
          schema.organizationSchema(),
          schema.serviceSchema({
            url,
            name: `${svc.name} in ${place}`,
            description: directAnswer,
            areaServed: { "@type": "AdministrativeArea", name: state.name },
          }),
          buildFaqJsonLd(faqs, url),
        ],
      }),
    );
    counts.serviceState++;

    // Service x State x City - mirrors the React ServiceStateCity page so the
    // top-metro service pages are statically captured for SEO.
    const cities = (cityDataByState[state.slug] || []).slice(0, SERVICE_CITY_TOP);
    for (const city of cities) {
      const cityPath = `/services/${svc.slug}/${state.slug}/${city.slug}`;
      const cityUrl = abs(cityPath);
      const cityNarr = cityNarrative(state, city);
      const cityFaqs = geoFaqs.serviceCityGeographicFaqs(svc, state.name, city.name);
      const cityDirect = narratives.serviceCityDirectAnswer(ORG_NAME, svc.shortName, state.name, city.name, cityNarr);
      const cityA = cityAttr(city.name);
      const otherCities = geoLinks.nearestCities(cities, city.slug, cities.length);
      const cityInner =
        `<h1>${esc(svc.shortName)} in ${esc(city.name)}, ${esc(state.abbreviation)}</h1>` +
        para(cityDirect) +
        // Mirrors ServiceStateCity.tsx: the place paragraph is the city
        // narrative's anchor sentence with the sides sentence; the hero above
        // already names the pillar's work, so the hub's "prepares economic
        // damages analyses" opener never prints under a valuation, tracing,
        // or matrimonial hero (2026-09-05 audit, F09).
        para(narratives.serviceCityPlaceParagraph(svc.shortName, cityNarr)) +
        // Mirrors ServiceStateCity.tsx: the pillar's own context paragraph
        // (src/data/narratives.ts serviceCityContextParagraph) names what this
        // pillar measures and against what; the earnings-and-wage-data sentence
        // belongs to the personal-loss pillars only (2026-09-05 audit, F09).
        // Then the professional responsible for the work (C02).
        `<section>${h2(`${svc.shortName} in ${city.name}`)}${para(svc.description)}<p>${esc(narratives.serviceCityContextParagraph(svc, state, city))}</p>${responsibilityHtml(`${prose.capFirst(work)} for ${cityA} matters`, false)}</section>` +
        (serviceCaseTypes.length
          ? `<section>${h2("Case Types")}${linkList(serviceCaseTypes.map((c) => ({ href: `/case-types/${c.slug}/${state.slug}`, label: c.name })))}</section>`
          : "") +
        `<section>${h2(`Other Services in ${city.name}`)}<p>${ORG_NAME} offers complementary economic damages services for ${esc(cityA)} cases.</p>${linkList(
          serviceData.filter((s) => s.slug !== svc.slug).map((s) => ({ href: `/services/${s.slug}/${state.slug}/${city.slug}`, label: `${s.shortName} in ${city.name}` })),
        )}</section>` +
        (otherCities.length
          ? `<section>${h2(`${svc.shortName} in Nearby ${state.name} Cities`)}<p>We also provide ${esc(work)} in these ${esc(state.name)} communities.</p>${linkList(
              otherCities.map((c) => ({ href: `/services/${svc.slug}/${state.slug}/${c.slug}`, label: `${svc.shortName} in ${c.name}`, blurb: c.county })),
            )}</section>`
          : "") +
        renderFaqHtml(cityFaqs, `Frequently asked: ${svc.shortName} in ${city.name}`) +
        navLinks([
          { href: `/services/${svc.slug}/${state.slug}`, label: `${svc.shortName} in ${place}` },
          { href: `/locations/${state.slug}/${city.slug}`, label: `${city.name} Location Page` },
          { href: `/locations/${state.slug}`, label: `${state.name} Locations` },
          { href: "/services", label: "All Services" },
          { href: "/contact", label: "Contact" },
        ]);
      writePage(
        cityPath,
        buildPage({
          path: cityPath,
          // Match ServiceStateCity.tsx: the shared serviceCityTitle builder
          // (title label, city, state abbreviation where it fits).
          title: serviceCityTitle(svc, city, state, ORG_NAME),
          description: truncateAtWord(cityDirect),
          breadcrumbs: [
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: svc.name, path: `/services/${svc.slug}` },
            { name: state.name, path: `/services/${svc.slug}/${state.slug}` },
            { name: city.name, path: cityPath },
          ],
          innerHtml: cityInner,
          ctaContext: `${svc.shortName} in ${city.name}`,
          jsonLd: [
            schema.organizationSchema(),
            schema.serviceSchema({
              url: cityUrl,
              name: `${svc.name} in ${city.name}, ${state.abbreviation}`,
              description: cityDirect,
              areaServed: { "@type": "City", name: `${city.name}, ${state.abbreviation}` },
            }),
            buildFaqJsonLd(cityFaqs, cityUrl),
          ],
        }),
      );
      serviceStateCityPages++;
    }
  }
}

// ---------------------------------------------------------------------------
// 6. Landing page hubs and templates
// ---------------------------------------------------------------------------

const hubLead = {
  caseTypes: `The case type fixes what an economic damages claim consists of: in an injury or death matter, the earnings, benefits, and household services a person would have provided; in an employment, commercial, or family matter, the wages, profits, cash flows, or business value at issue. ${ORG_NAME} prepares the analysis for plaintiff and defense counsel alike, and each page below sets out the components of the claim, the records that drive it, and how the number is built.`,
  credentials:
    "Economic damages testimony does not rest on a state license. It rests on graduate training in economics and finance, on the published standards of the profession's associations, and on a record of reports and testimony that have held up under cross-examination. These pages set out each of those foundations, what it does and does not establish, and how courts weigh it.",
  guides:
    "A practitioner guide walks through one damages question from the economist's standpoint: what the claim consists of, which records drive it, how the number is built, and where it is tested at deposition and trial. The guides below cover lost earnings, wrongful death, household services, present value, expert disclosure, business valuation, lost profits, and rebutting an opposing report, for attorneys on either side of the claim.",
  compare:
    "Choosing the right expert and the right damages measure is the first decision in an economic damages case, because each measure rests on different records and answers a different question. Each comparison below sets the two side by side, states what each one measures and from which records, and identifies when one applies, when the other does, and where they overlap.",
  methods:
    "A forensic economics method is the documented procedure that turns a person's or a business's records into a damages figure: the base earnings or cash flow, the projection period, the growth and discount rates, and the offsets that reduce the loss. Each method page below states what the method answers, the published data it draws on, its limits, and how it has fared when challenged, so counsel on either side can test the figure line by line.",
  jurisdictions: `State and federal jurisdictions where ${ORG_NAME} accepts engagements. Venue determines which damages rules, admissibility standard, and collateral source treatment apply, so each state page sets out that context before the economics.`,
  attorneys:
    "Stage-by-stage guides for retaining, preparing, and using a forensic economist across each major case type: what the loss claim consists of, which records drive it, and how the number is defended. Pick the stage the matter is at, or start from the case type; each guide lists the actions to take, the records to gather, the pitfalls to avoid, and the questions counsel most often ask at that stage.",
};

const FEDERAL_CIRCUITS = [
  "First Circuit", "Second Circuit", "Third Circuit", "Fourth Circuit",
  "Fifth Circuit", "Sixth Circuit", "Seventh Circuit", "Eighth Circuit",
  "Ninth Circuit", "Tenth Circuit", "Eleventh Circuit", "D.C. Circuit",
  "Federal Circuit",
];

const hubPage = ({ path, title, description, h1, crumb, lead, listHeading, items, extra = "", nav, collectionName }) => ({
  path,
  title,
  description,
  breadcrumbs: [{ name: "Home", path: "/" }, { name: crumb, path }],
  innerHtml: `<h1>${esc(h1)}</h1>${para(lead)}<section>${h2(listHeading)}${linkList(items)}</section>${extra}${nav}`,
  jsonLd: [
    schema.organizationSchema(),
    schema.websiteSchema(),
    schema.collectionPageSchema({
      url: abs(path),
      name: collectionName ?? h1,
      description: lead,
      items: items.map((i) => ({ name: i.label, url: abs(i.href) })),
    }),
  ],
});

// Mirror the src/pages/hubs/*HubPage.tsx usePageMeta values.
const newHubPages = [
  hubPage({
    path: "/case-types",
    title: `Case Types for Economic Damages Analysis | ${ORG_NAME}`,
    description: "Economic damages analysis for personal injury, wrongful death, employment, commercial, divorce, and fraud cases: what the loss claim is and how it is built.",
    h1: "Case Types We Analyze",
    crumb: "Case Types",
    lead: hubLead.caseTypes,
    listHeading: "Browse case types",
    items: caseTypes.map((c) => ({ href: `/case-types/${c.slug}`, label: c.name, blurb: truncateAtWord(c.summary, 200) })),
    nav: navLinks([
      { href: "/attorneys", label: "Attorney resources by litigation stage" },
      { href: "/credentials", label: "Credentials of a forensic economist" },
      { href: "/methods", label: "Forensic economics methods" },
      { href: "/compare", label: "Expert and method comparisons" },
    ]),
  }),
  hubPage({
    path: "/credentials",
    title: `Credentials of a Forensic Economist | ${ORG_NAME}`,
    description: "What qualifies a forensic economist to testify on damages: graduate training, the standards of the forensic economics associations, and a testimony record.",
    h1: "Credentials of a Forensic Economist",
    crumb: "Credentials",
    lead: hubLead.credentials,
    listHeading: "The credentials",
    items: credentials.map((c) => ({ href: `/credentials/${c.slug}`, label: c.name, blurb: c.abbreviation !== c.name ? c.abbreviation : undefined })),
    extra: `<p>No state licenses forensic economists, so there is no license number to look up. Ask three questions instead: what graduate training the economist has, whether the report follows the disclosure and ethics standards of the forensic economics associations, and how the economist has fared at deposition and trial. Membership in an association is an affiliation, not a certification, and a degree matters only as far as it covers the methods the report actually uses.</p>`,
    nav: navLinks([
      { href: "/case-types", label: "Case types for economic damages analysis" },
      { href: "/services", label: "Forensic economics and damages services" },
      { href: "/attorneys", label: "Attorney resources by litigation stage" },
    ]),
  }),
  hubPage({
    path: "/guides",
    title: `Forensic Economics Guides for Attorneys | ${ORG_NAME}`,
    description: "Practitioner guides on lost earnings, wrongful death damages, household services, present value, expert disclosure, valuation, and rebutting a damages report.",
    h1: "Guides for Attorneys",
    crumb: "Guides",
    lead: hubLead.guides,
    listHeading: "All guides",
    items: guides.map((g) => ({ href: `/guides/${g.slug}`, label: g.title, blurb: truncateAtWord(g.tldr, 200) })),
    nav: libraryNav("/guides"),
  }),
  hubPage({
    path: "/compare",
    title: `Economic Damages Comparisons for Attorneys | ${ORG_NAME}`,
    description: "Side-by-side comparisons: economist vs. forensic accountant, lost earnings vs. earning capacity, lost profits vs. business value, net vs. gross discount rate.",
    h1: "Economic Damages Comparisons",
    crumb: "Compare",
    lead: hubLead.compare,
    listHeading: "All comparisons",
    items: comparisons.map((c) => ({ href: `/compare/${c.slug}`, label: c.title, blurb: truncateAtWord(stripLinkMarkers(c.overlap), 160) })),
    nav: libraryNav("/compare"),
  }),
  hubPage({
    path: "/methods",
    title: `Forensic Economics Methods and Damages Models | ${ORG_NAME}`,
    description: "The methods behind our economic damages reports: present value, worklife expectancy, wage growth, fringe benefits, household services, valuation, and offsets.",
    h1: "Forensic Economics Methods",
    crumb: "Methods",
    lead: hubLead.methods,
    listHeading: "All methods",
    items: methods.map((m) => ({ href: `/methods/${m.slug}`, label: m.name, blurb: truncateAtWord(m.summary, 200) })),
    nav: libraryNav("/methods"),
  }),
  hubPage({
    path: "/jurisdictions",
    title: `State and Federal Jurisdictions Served | ${ORG_NAME}`,
    description: `${ORG_NAME} prepares economic damages analyses in all 50 states, DC, US territories, and federal courts. Browse by state or federal circuit for venue context.`,
    h1: "State and Federal Jurisdictions Served",
    crumb: "Jurisdictions",
    lead: hubLead.jurisdictions,
    listHeading: "States and Territories",
    items: stateLinks((s) => `/locations/${s.slug}`),
    extra: `<section>${h2("Federal Circuits")}${ul(FEDERAL_CIRCUITS)}</section><p>The <a href="/locations">directory of forensic economists by state</a> lists the same states by region.</p>`,
    nav: navLinks([{ href: "/locations", label: "Locations" }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
  }),
  hubPage({
    path: "/attorneys",
    title: `Attorney Resources by Litigation Stage | ${ORG_NAME}`,
    description: "Stage-by-stage attorney resources for retaining, preparing, and using a forensic economist: considering, retaining, deposition, and trial, for each case type.",
    h1: "Attorney Resources by Litigation Stage",
    crumb: "Attorneys",
    lead: hubLead.attorneys,
    listHeading: "Stages",
    items: ATTORNEY_STAGES.map((s) => ({ href: `/attorneys/${s.slug}`, label: s.label, blurb: stageIndexIntro(s.slug) })),
    extra: ATTORNEY_STAGES.map(
      (stage) =>
        `<section>${h2(stage.label)}${linkList(caseTypes.map((c) => ({ href: `/attorneys/${stage.slug}/${c.slug}`, label: `${stage.label}: ${c.name}` })))}</section>`,
    ).join(""),
    nav: navLinks([
      { href: "/case-types", label: "Case types for economic damages analysis" },
      { href: "/services", label: "Forensic economics and damages services" },
      { href: "/credentials", label: "Credentials of a forensic economist" },
    ]),
  }),
];
for (const p of newHubPages) { writePage(p.path, buildPage(p)); counts.core++; }

// Case type hubs + case type x state. Both tiers mirror CaseTypeHub.tsx and
// CaseTypeState.tsx: the named reviewer and dates, the headings and section
// order, the category-gated state modules, the local FAQs, and the JSON-LD.
const INJURY_CATEGORIES = new Set(["personal-injury", "wrongful-death", "med-mal", "workers-comp"]);
const COURT_SELECTION = { family: "family", commercial: "commercial" };
// The economists counsel may retain by name (team.ts retention rule), senior
// first; the same named economist signs the work on every case-type page.
const caseTypeExperts = retainableExperts();
const caseTypeAuthor = caseTypeExperts[0];
let caseTypeStatePages = 0;
for (const [i, c] of caseTypes.entries()) {
  const hubUrl = abs(`/case-types/${c.slug}`);
  const lower = c.name.toLowerCase();
  const prev = caseTypes[i - 1];
  const next = caseTypes[i + 1];
  const linkedServices = serviceData.filter((s) => c.relevantServices.includes(s.slug));
  // "Related services" links the service x case pair pages, so only the linked
  // services that declare this case type in services.ts (the pairs that exist;
  // an undeclared pair 301s to the pillar). Mirrors CaseTypeHub.tsx.
  const pairServices = linkedServices.filter((s) => s.caseTypes.includes(c.slug)).slice(0, 3);
  const linkedCredentials = credentials.filter((cred) => credentialMatches(cred, c.relevantCredentials));
  // The H1, title stem, description, and section headings come from the
  // case-type helpers CaseTypeHub.tsx reads: the entry's `framing` block where
  // it carries one (the family-law matter is an income, valuation, and tracing
  // assignment, not a damages claim; audit F08) and the shared damages
  // framing otherwise.
  const hubH1 = caseTypeHubHeading(c);
  const hubHeadings = caseTypeSectionHeadings(c);
  writePage(`/case-types/${c.slug}`, buildPage({
    path: `/case-types/${c.slug}`,
    // Match CaseTypeHub.tsx (title + description, both through the shared
    // helpers); pinned by scripts/prerender-meta.test.mjs.
    title: `${caseTypeHubTitle(c, ORG_NAME)}`,
    description: `${caseTypeHubDescription(c)}`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Case Types", path: "/case-types" }, { name: c.name, path: `/case-types/${c.slug}` }],
    innerHtml:
      `<h1>${esc(hubH1)}</h1>` +
      renderBylineHtml(caseTypeAuthor?.slug, c.datePublished, c.dateModified) +
      lead(c.summary) +
      `<section id="in-short"><p><strong>In short</strong></p>${ul(c.inShort ?? [])}</section>` +
      `<section id="loss-components">${h2(hubHeadings.components)}${para(c.lossComponents)}</section>` +
      `<section id="damages-exposure">${h2(hubHeadings.concentration)}${para(c.damagesExposure)}</section>` +
      `<section id="analysis">${h2(hubHeadings.method)}${para(c.economicImpact)}${ol(c.steps ?? [])}</section>` +
      (linkedCredentials.length
        ? `<section id="credentials">${h2("Relevant credentials")}${linkList(linkedCredentials.map((cred) => ({ href: `/credentials/${cred.slug}`, label: `${cred.name} (${cred.abbreviation})` })))}</section>`
        : "") +
      (caseTypeExperts.length
        ? `<section id="experts">${h2("Our economists")}${linkList(caseTypeExperts.map((m) => ({ href: `/team/${m.slug}`, label: m.name, blurb: m.title })))}</section>`
        : "") +
      `<section id="by-state">${h2(`${c.name} services by state`)}${linkList(states.map((s) => ({ href: `/case-types/${c.slug}/${s.slug}`, label: `${c.name} in ${placeName(s.name)}` })))}</section>` +
      `<section id="attorney-guides">${h2(`Attorney guides for ${lower} cases`)}<p>Stage-by-stage guidance on working with a forensic economist in ${esc(lower)} litigation.</p>${linkList(
        ATTORNEY_STAGES.map((stage) => ({ href: `/attorneys/${stage.slug}/${c.slug}`, label: stage.label, blurb: `${c.name} cases` })),
      )}</section>` +
      renderFaqHtml(c.faqs) +
      (pairServices.length
        ? `<section>${h2("Related services")}${linkList(pairServices.map((s) => ({ href: `/services/${s.slug}/case/${c.slug}`, label: s.name, blurb: `Applied to ${lower} matters` })))}</section>`
        : "") +
      (linkedServices.length
        ? `<section id="service-pages">${h2("Service pages")}${linkList(linkedServices.map((s) => ({ href: `/services/${s.slug}`, label: s.name })))}</section>`
        : "") +
      sourcesHtml(c.sources) +
      navLinks([
        ...(prev ? [{ href: `/case-types/${prev.slug}`, label: `Previous: ${prev.name}` }] : []),
        ...(next ? [{ href: `/case-types/${next.slug}`, label: `Next: ${next.name}` }] : []),
        { href: "/case-types", label: "All case types" },
        { href: "/services", label: "Services" },
        { href: "/contact", label: "Contact" },
      ]),
    ctaContext: `${lower} cases`,
    jsonLd: [
      schema.articleSchema({
        title: hubH1,
        description: c.summary,
        url: hubUrl,
        authorSlug: caseTypeAuthor?.slug,
        datePublished: c.datePublished,
        dateModified: c.dateModified,
      }),
      buildFaqJsonLd(c.faqs, hubUrl),
    ],
  }));
  counts.core++;
  const isInjury = INJURY_CATEGORIES.has(c.category);
  for (const s of states) {
    const path = `/case-types/${c.slug}/${s.slug}`;
    const url = abs(path);
    const place = placeName(s.name);
    const expertsInState = caseTypeExperts.filter((m) => m.statesServed.includes(s.abbreviation));
    const courts = getCourtsByState(s.slug);
    const regulations = getRegulationsByState(s.slug);
    const trialCourts = courts ? selectTrialCourts(courts, COURT_SELECTION[c.category] ?? "general") : [];
    const federalVenues = courts?.federalDistricts ?? [];
    // Mirrors CaseTypeState.tsx: the state module's damages text (tort for the
    // injury and death categories, fault-interest-caps otherwise), or the
    // entry's own framing paragraph for a matter that is not a damages claim.
    const frameworkText = regulations
      ? caseTypeStateFramework(c, place, isInjury ? regulations.damagesContext : regulations.generalContext)
      : "";
    const h1 = caseTypeStateHeading(c, place);
    const stateHeadings = caseTypeSectionHeadings(c);
    // Two FAQs that exist only for this case type in this state; the hub's own
    // FAQs are linked, not repeated, so the FAQPage node is not a duplicate.
    const localFaqs = [
      ...(courts
        ? [
            {
              question: `Which ${s.name} courts hear ${lower} cases?`,
              answer: [
                `${c.name} cases venued in ${place} are heard in ${listNames(trialCourts.map((t) => `the ${t.name} (${t.description})`))}.`,
                `Final appeals run to the ${courts.supremeCourt}.`,
                federalVenues.length > 0
                  ? `Matters within federal jurisdiction proceed in the United States District Court${federalVenues.length > 1 ? "s" : ""} for the ${listNames(federalVenues.map((d) => d.name))}.`
                  : "",
                courts.venueNote ?? "",
              ]
                .filter(Boolean)
                .join(" "),
            },
          ]
        : []),
      ...(regulations
        ? [
            {
              question: caseTypeStateFrameworkQuestion(c, place),
              answer: `${frameworkText} ${regulations.expertStandard}`,
            },
          ]
        : []),
    ];
    const compensationHtml =
      regulations && c.category === "workers-comp"
        ? `<p><strong>Compensation forum:</strong> ${esc(regulations.compensationForum)}. Third-party actions arising from the same injury proceed in the civil courts listed above, and the report separates what the compensation system pays from what the civil claim adds.</p>`
        : regulations && isInjury
          ? `<p>Outside the civil courts, wage-loss disputes in workers' compensation matters proceed before the <strong>${esc(regulations.compensationForum)}</strong>.</p>`
          : "";
    writePage(path, buildPage({
      path: `/case-types/${c.slug}/${s.slug}`,
      // Match CaseTypeState.tsx (the shared caseTypeStateTitle builder, wrapped
      // in a template literal so the parity guard can slot it, + description);
      // pinned by scripts/prerender-meta.test.mjs.
      title: `${caseTypeStateTitle(c, s, ORG_NAME)}`,
      description: `${caseTypeStateDescription(c, placeName(s.name))}`,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Case Types", path: "/case-types" },
        { name: c.name, path: `/case-types/${c.slug}` },
        { name: s.name, path },
      ],
      innerHtml:
        `<h1>${esc(h1)}</h1>` +
        renderBylineHtml(caseTypeAuthor?.slug, c.datePublished, c.dateModified) +
        para(caseTypeStateLead(c, ORG_NAME, place)) +
        `<section id="definition"><p>${esc(c.summaryShort ?? c.summary)} <a href="/case-types/${c.slug}">Read the full ${esc(lower)} analysis guide</a>.</p></section>` +
        (courts || regulations
          ? `<section id="jurisdictional-notes">${h2(`${s.name} courts and expert standards`)}` +
            (regulations ? para(regulations.expertStandard) : "") +
            (courts ? courtVenuesHtml(courts, trialCourts, "Where these cases are heard") + compensationHtml : "") +
            (regulations ? `${h3(stateHeadings.framework)}${para(frameworkText)}` : "") +
            `</section>`
          : "") +
        `<section id="analysis">${h2(stateHeadings.method)}${para(caseTypeStateStepsIntro(c, place))}${ol(c.steps ?? [])}</section>` +
        (expertsInState.length
          ? `<section id="experts">${h2(`Experts serving ${place}`)}${linkList(expertsInState.slice(0, 6).map((m) => ({ href: `/team/${m.slug}`, label: m.name, blurb: m.title })))}</section>`
          : "") +
        `<section id="attorney-guides">${h2(`Attorney guides for ${lower} cases`)}${linkList(
          ATTORNEY_STAGES.map((stage) => ({ href: `/attorneys/${stage.slug}/${c.slug}`, label: `${stage.label} for ${c.name} Cases` })),
        )}</section>` +
        `<section id="related-state-pages">${h2(`More ${s.name} resources`)}${linkList([
          { href: `/locations/${s.slug}`, label: `Forensic economists in ${place}` },
          ...linkedServices.map((svc) => ({ href: `/services/${svc.slug}/${s.slug}`, label: `${svc.shortName} in ${place}` })),
        ])}</section>` +
        `<section id="other-case-types">${h2(`Other case types in ${place}`)}${linkList(caseTypes.filter((ct) => ct.slug !== c.slug).map((ct) => ({ href: `/case-types/${ct.slug}/${s.slug}`, label: ct.name })))}</section>` +
        renderFaqHtml(localFaqs, `Frequently asked: ${lower} cases in ${place}`) +
        `<section id="more-questions">${h2(`More questions about ${lower} analysis`)}${linkList(c.faqs.map((f) => ({ href: `/case-types/${c.slug}#faq-heading`, label: f.question })))}</section>` +
        sourcesHtml(c.sources.slice(0, 5)) +
        navLinks([{ href: `/case-types/${c.slug}`, label: `${c.name} overview` }, { href: "/case-types", label: "All case types" }, { href: "/contact", label: "Contact" }]),
      ctaContext: `${lower} cases in ${place}`,
      jsonLd: [
        // The page canonical is the Service entity's @id and url (no
        // /services/<case-type>/<state> route exists).
        schema.serviceSchema({
          url,
          name: h1,
          description: caseTypeStateServiceDescription(c, place),
          areaServed: { "@type": s.type === "state" ? "State" : "AdministrativeArea", name: s.name },
          dateModified: c.dateModified,
        }),
        buildFaqJsonLd(localFaqs, url),
      ],
    }));
    caseTypeStatePages++;
  }
}

// Credential hubs + credential x state (CredentialHub.tsx / CredentialState.tsx).
// Named holders come from the credential's own expertSlugs list and from
// nowhere else: the membership pages carry an empty list until membership is
// confirmed, so no person is ever attached to NAFE or AAEFE here. The same
// switch decides the byline: a named reviewer only where the credential names
// him, the editorial byline on the membership pages.
const RECOGNITION_LABEL = {
  na: () => "Recognized nationally; no state licensure applies",
  full: (stateName) => `Recognized in ${stateName} by reciprocity`,
  limited: (stateName) => `Recognized in ${stateName} with conditions`,
  none: (stateName) => `Not recognized in ${stateName}`,
};
const VERIFICATION =
  "There is no state license for forensic economists to check, so counsel verify the credential with its issuer and review the economist's testimony record directly.";
let credentialStatePages = 0;
for (const [i, c] of credentials.entries()) {
  const abbr = c.abbreviation;
  const hubUrl = abs(`/credentials/${c.slug}`);
  const prev = credentials[i - 1];
  const next = credentials[i + 1];
  const credentialNode = schema.credentialSchema({
    slug: c.slug, name: c.name, abbreviation: c.abbreviation, category: c.category,
    issuer: c.issuer, issuerUrl: c.issuerUrl, scope: c.scope,
  });
  const experts = activeTeam.filter((m) => c.expertSlugs.includes(m.slug));
  const reviewer = experts[0];
  writePage(`/credentials/${c.slug}`, buildPage({
    path: `/credentials/${c.slug}`,
    // Match CredentialHub.tsx: the authored metaTitle and metaDescription,
    // H1 `${name} (${abbr})`; pinned by scripts/prerender-meta.test.mjs.
    title: `${c.metaTitle}`,
    description: `${c.metaDescription}`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Credentials", path: "/credentials" }, { name: abbr, path: `/credentials/${c.slug}` }],
    innerHtml:
      `<h1>${esc(c.name)} (${esc(abbr)})</h1>` +
      renderBylineHtml(reviewer?.slug, c.datePublished, c.dateModified) +
      lead(c.scope) +
      (c.issuer ? `<section id="issuer">${h2("Issued by")}<p>${c.issuerUrl ? `<a href="${esc(c.issuerUrl)}" rel="noopener">${esc(c.issuer)}</a>` : esc(c.issuer)}</p></section>` : "") +
      (c.requirements.length ? `<section id="requirements">${h2("Requirements")}${ul(c.requirements)}</section>` : "") +
      (c.admissibilityHistory ? `<section id="daubert">${h2("Admissibility")}${para(c.admissibilityHistory)}</section>` : "") +
      (experts.length
        ? `<section id="experts">${h2("Our economists with this credential")}${linkList(experts.map((m) => ({ href: `/team/${m.slug}`, label: m.name, blurb: m.title })))}</section>`
        : "") +
      `<section id="by-state">${h2(`${abbr} by state`)}${linkList(states.map((s) => ({ href: `/credentials/${c.slug}/${s.slug}`, label: `${abbr} in ${s.name}` })))}</section>` +
      renderFaqHtml(c.faqs) +
      sourcesHtml(c.sources) +
      navLinks([
        ...(prev ? [{ href: `/credentials/${prev.slug}`, label: `Previous: ${prev.abbreviation}` }] : []),
        ...(next ? [{ href: `/credentials/${next.slug}`, label: `Next: ${next.abbreviation}` }] : []),
        { href: "/credentials", label: "All credentials" },
        { href: "/services", label: "Services" },
        { href: "/contact", label: "Contact" },
      ]),
    jsonLd: [credentialNode, buildFaqJsonLd(c.faqs, hubUrl)],
  }));
  counts.core++;
  const credentialServices = serviceData.filter((svc) => credentialMatches(c, svc.relevantCredentials));
  for (const s of states) {
    const path = `/credentials/${c.slug}/${s.slug}`;
    const url = abs(path);
    const place = placeName(s.name);
    const attr = placeAttr(s.name);
    const headings = credentialStateHeadings(c, s.name);
    const stateExperts = experts.filter((m) => m.statesServed.includes(s.abbreviation));
    const regulations = getRegulationsByState(s.slug);
    const courts = getCourtsByState(s.slug);
    const trialCourts = courts ? selectTrialCourts(courts, "general") : [];
    const recognition = RECOGNITION_LABEL[c.stateReciprocity[s.slug] ?? "na"](s.name);
    const expertStandard =
      regulations?.expertStandard ??
      `Qualification to testify on economic damages in ${place} is decided case by case on education, method, and experience.`;
    // One FAQ that exists only for this state; the hub's own FAQs are linked,
    // not repeated, so the FAQPage node is not a duplicate of the hub's.
    const localFaqs = [
      {
        question: `How do ${attr} courts qualify a forensic economist?`,
        answer: `${expertStandard} ${recognition}. ${VERIFICATION}`,
      },
    ];
    writePage(path, buildPage({
      path: `/credentials/${c.slug}/${s.slug}`,
      // Match CredentialState.tsx: title, H1, and description come from
      // credentialStateHeadings (keyed on the credential's category); pinned
      // by scripts/prerender-meta.test.mjs.
      title: `${headings.title}`,
      description: `${headings.description}`,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Credentials", path: "/credentials" },
        { name: abbr, path: `/credentials/${c.slug}` },
        { name: s.name, path },
      ],
      innerHtml:
        `<h1>${esc(headings.h1)}</h1>` +
        renderBylineHtml(reviewer?.slug, c.datePublished, c.dateModified) +
        `<p>${esc(expertStandard)} ${esc(c.stateLead ?? "")}</p>` +
        `<section id="recognition">${h2(`Recognition and qualification in ${place}`)}<p><strong>State recognition:</strong> ${esc(recognition)}. ${esc(VERIFICATION)}</p>${para(credentialStateAngle(c, s.name))}<p>${ORG_NAME} economists apply nationally recognized methods while accounting for ${esc(place)}'s wage levels, venue, and damages rules.</p></section>` +
        (courts
          ? `<section id="courts">${h2(`${s.name} courts and venues`)}<p>Economic damages experts testify in ${esc(place)}'s courts, where qualification is decided case by case on education, method, and experience rather than on any single credential.</p>${courtVenuesHtml(courts, trialCourts)}</section>`
          : "") +
        (stateExperts.length
          ? `<section id="experts">${h2(`Our economists with this credential who serve ${place}`)}${linkList(stateExperts.map((m) => ({ href: `/team/${m.slug}`, label: m.name, blurb: m.title })))}</section>`
          : `<section id="experts">${h2(`Forensic economists for ${s.name} matters`)}<p>${ORG_NAME} provides forensic economists for ${esc(s.name)} damages matters, including remote consultation, report preparation, and deposition or trial testimony where the case is venued. <a href="/contact">Contact us</a> to discuss availability for your matter.</p></section>`) +
        `<section id="related-state-pages">${h2(`More ${s.name} resources`)}${linkList([
          { href: `/locations/${s.slug}`, label: `Forensic economists in ${place}` },
          ...credentialServices.map((svc) => ({ href: `/services/${svc.slug}/${s.slug}`, label: `${svc.shortName} in ${place}` })),
        ])}</section>` +
        `<section id="other-credentials">${h2(`Other credentials in ${place}`)}${linkList(credentials.filter((x) => x.slug !== c.slug).map((x) => ({ href: `/credentials/${x.slug}/${s.slug}`, label: `${x.abbreviation} in ${place}` })))}</section>` +
        renderFaqHtml(localFaqs, `Frequently asked: qualifying a forensic economist in ${place}`) +
        `<section id="more-questions">${h2("More questions about this credential")}${linkList(c.faqs.map((f) => ({ href: `/credentials/${c.slug}#faq-heading`, label: f.question })))}</section>` +
        sourcesHtml(c.sources.slice(0, 5)) +
        navLinks([{ href: `/credentials/${c.slug}`, label: `About the ${abbr} credential` }, { href: "/credentials", label: "All credentials" }, { href: "/contact", label: "Contact" }]),
      ctaContext: `${s.name} damages matters`,
      jsonLd: [
        credentialNode,
        // Membership-neutral on purpose: the service is the firm's forensic
        // economics work in the state, not a claim that its economists hold
        // the credential. The page canonical is the entity's @id and url.
        schema.serviceSchema({
          url,
          name: `Forensic Economists for ${s.name} Damages Matters (${abbr})`,
          description: `${ORG_NAME} provides forensic economists for ${s.name} damages matters. This page explains ${c.name} (${abbr}) and how ${attr} courts weigh it.`,
          areaServed: { "@type": s.type === "state" ? "State" : "AdministrativeArea", name: s.name },
          dateModified: c.dateModified,
        }),
        buildFaqJsonLd(localFaqs, url),
      ],
    }));
    credentialStatePages++;
  }
}

// Methods
for (const [i, m] of methods.entries()) {
  const path = `/methods/${m.slug}`;
  const url = abs(path);
  const prev = methods[i - 1];
  const next = methods[i + 1];
  // The pillar services this method feeds, in the entry's curated order.
  const relevant = (m.relevantServices ?? []).map((slug) => serviceData.find((s) => s.slug === slug)).filter(Boolean);
  writePage(path, buildPage({
    path,
    // Match MethodologyExplainer.tsx: "<name> Method | <brand>" (or the bare
    // name when it already ends in "Methodology") and the written metaDescription.
    title: `${m.name.endsWith("Methodology") ? m.name : `${m.name} Method`} | ${ORG_NAME}`,
    description: m.metaDescription ?? truncateAtWord(m.summary),
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Methods", path: "/methods" }, { name: m.name, path }],
    ogType: "article",
    datePublished: m.datePublished,
    dateModified: m.dateModified,
    innerHtml:
      `<h1>${esc(m.name)}</h1>` +
      renderBylineHtml(m.authorSlug, m.datePublished, m.dateModified) +
      lead(m.summary) +
      `<section id="when-used">${h2("When it is used")}${para(m.whenUsed)}</section>` +
      (m.steps.length ? `<section id="steps">${h2("Step-by-step")}${ol(m.steps)}</section>` : "") +
      (m.dataSources.length ? `<section id="data-sources">${h2("Data sources")}${ul(m.dataSources)}</section>` : "") +
      `<section id="limitations">${h2("Limitations")}${para(m.limitations)}</section>` +
      `<section id="daubert">${h2("Admissibility")}${para(m.admissibilityHistory)}</section>` +
      renderFaqHtml(m.faqs) +
      relatedHtml(
        relevant.map((s) => ({ title: s.name, href: `/services/${s.slug}`, description: truncateAtWord(s.description, 120) })),
        "Services that use this method",
      ) +
      sourcesHtml(m.sources) +
      navLinks([
        ...(prev ? [{ href: `/methods/${prev.slug}`, label: `Previous: ${prev.name}` }] : []),
        ...(next ? [{ href: `/methods/${next.slug}`, label: `Next: ${next.name}` }] : []),
        { href: "/methods", label: "All methods" },
        { href: "/services", label: "Services" },
        { href: "/contact", label: "Contact" },
      ]),
    ctaContext: m.name,
    jsonLd: [
      {
        ...schema.articleSchema({
          title: m.name,
          description: m.summary,
          url,
          datePublished: m.datePublished,
          dateModified: m.dateModified,
          authorSlug: m.authorSlug,
        }),
        ...SPEAKABLE,
      },
      schema.howToSchema({ name: m.name, description: m.summary, steps: m.steps }),
      buildFaqJsonLd(m.faqs, url),
    ],
  }));
  counts.core++;
}

// The specialty -> service map src/lib/practice-areas.ts applies on the profile
// page ("Areas of Practice"); mirrored here for the shell.
const PRACTICE_AREA_BY_SPECIALTY = {
  "Forensic Economics": "lost-earnings-and-earning-capacity",
  "Economic Damages": "personal-injury-economic-damages",
  "Earning Capacity Analysis": "lost-earnings-and-earning-capacity",
  "Wrongful Death Analysis": "wrongful-death-economic-loss",
  "Household Services": "household-services-valuation",
  "Present Value Analysis": "life-care-plan-cost-projection",
  "Employment Damages": "employment-and-wage-loss-damages",
  "Business Valuation": "business-valuation",
  "Lost Profits": "lost-profits-and-commercial-damages",
  "Forensic Accounting": "fraud-and-asset-tracing",
  "Divorce Financial Analysis": "divorce-and-marital-financial-analysis",
  "Expert Testimony": "expert-rebuttal-and-report-review",
  "Economic Analysis": "lost-earnings-and-earning-capacity",
};

// Team profiles
const stateNameByAbbr = Object.fromEntries(states.map((s) => [s.abbreviation, s.name]));
const profileTitleFor = (m) =>
  teamMeta?.profileTitle
    ? teamMeta.profileTitle({ name: m.name, jobTitle: m.title, memoriam: m.memoriam, orgName: ORG_NAME })
    : m.memoriam
      ? `${m.name} | In Memoriam | ${ORG_NAME}`
      : `${m.name} | ${ORG_NAME}`;
const bareNameOf = (name) => (teamMeta?.bareName ? teamMeta.bareName(name) : name.split(",")[0].trim());
for (const t of team) {
  const path = `/team/${t.slug}`;
  const url = abs(path);
  const memoriam = Boolean(t.memoriam);
  const jurisdictions = (t.statesServed ?? []).map((a) => stateNameByAbbr[a] ?? a);
  const practiceSlugs = new Set(
    (t.specialties ?? []).map((sp) => PRACTICE_AREA_BY_SPECIALTY[sp]).filter(Boolean),
  );
  const practiceAreas = serviceData.filter((s) => practiceSlugs.has(s.slug));
  const portrait = t.imageUrl ? { src: `${BASE_URL}${t.imageUrl}`, ...(PORTRAIT_SIZES[t.slug] ?? {}) } : undefined;
  writePage(path, buildPage({
    path,
    title: profileTitleFor(t),
    // Match ExpertProfile.tsx: the description is the bio cut at a word boundary.
    description: memoriam
      ? `${t.name} - remembered by the ${ORG_NAME} team.`
      : t.bio
        ? truncateAtWord(t.bio)
        : `${bareNameOf(t.name)} is ${t.title} at ${ORG_NAME}.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Team", path: "/team" }, { name: t.name, path }],
    ogImage: portrait?.src,
    ogImageWidth: portrait?.width,
    ogImageHeight: portrait?.height,
    ogImageAlt: portrait ? t.name : undefined,
    cta: !memoriam,
    innerHtml:
      `<h1>${esc(t.name)}</h1><p>${esc(t.title)}</p>` +
      // Degree credentials only, the rule the bylines and the Person nodes
      // apply: background certifications from another discipline stay off the
      // economics shells (scripts/prerender-shells.test.mjs scans for them).
      (degreeCredentials(t).length ? `<p>Credentials: ${esc(degreeCredentials(t).join(", "))}</p>` : "") +
      (!memoriam && jurisdictions.length ? `<p>Jurisdictions served: ${esc(jurisdictions.join(", "))}</p>` : "") +
      `<section>${h2("Biography", "bio")}${paragraphs(t.fullBio || t.bio)}</section>` +
      ((t.specialties ?? []).length ? `<section>${h2("Areas of Expertise", "expertise")}${ul(t.specialties)}</section>` : "") +
      (!memoriam && practiceAreas.length
        ? `<section>${h2("Areas of Practice", "practice")}${linkList(practiceAreas.map((s) => ({ href: `/services/${s.slug}`, label: s.name })))}</section>`
        : "") +
      ((t.education ?? []).length
        ? `<section>${h2("Education", "education")}${ul(t.education.map((e) => `${e.degree}, ${e.institution}${e.year ? ` (${e.year})` : ""}`))}</section>`
        : "") +
      navLinks([{ href: "/team", label: "Back to the team" }, { href: "/services", label: "Services" }, { href: "/contact", label: "Contact" }]),
    jsonLd: [schema.organizationSchema(), ...(memoriam ? [] : [personNode(t)])],
  }));
  counts.core++;
}

// Service engagement-detail variants + service x case type. Both mirror
// ServiceTransactional.tsx and ServiceCaseType.tsx: the same H1, the same
// meta description builders, the same section order and crawl path, and the
// same Service node (with the pillar's dateModified).
let serviceVariantPages = 0;
let serviceCaseTypePages = 0;
for (const s of serviceData) {
  const name = prose.proseName(s.shortName);
  const work = prose.workPhrase(s.shortName);
  const finalStep = s.process?.at(-1);
  const related = (s.related ?? []).slice(0, 3);
  for (const variant of VARIANTS) {
    const path = `/services/${s.slug}/${variant}`;
    const title = `${s.name} ${VARIANT_LABEL[variant]}`;
    const description = variantDescription(s, variant);
    let body = "";
    if (variant === "cost" && s.cost) {
      body =
        // Direct answer first: how the work is billed, then what sets the
        // scope, then the drivers.
        `<p>${esc(prose.capFirst(work))} is billed at an hourly rate against a retainer established at the outset, with a written fee schedule and a cost estimate before work begins. The scope of the engagement, and so its cost, depends on the factors below.</p>` +
        `<section id="billing">${h2(`How ${name} is billed`)}${para(s.cost.billingStructure)}</section>` +
        `<section id="range">${h2("What sets the scope")}${para(s.cost.range)}</section>` +
        `<section id="drivers">${h2("What drives cost")}${ul(s.cost.drivers)}</section>`;
    } else if (variant === "process" && s.process) {
      body =
        `<p>${esc(prose.capFirst(prose.withArticle(name)))} engagement moves through ${s.process.length} steps, from the conflict check to testimony. Each step ends in something counsel can review, and the <a href="/services/${s.slug}/timeline">typical timeline</a> shows how long each phase runs.</p>` +
        `<section id="process">${h2("Engagement process")}<ol>${s.process.map((step) => `<li><strong>${esc(step.step)}:</strong> ${esc(step.description)}</li>`).join("")}</ol></section>`;
    } else if (variant === "timeline" && s.timeline) {
      body =
        `<p>The phases below run in sequence. The analysis starts when the records arrive, so the records request in the <a href="/services/${s.slug}/process">engagement process</a> sets the pace, and disclosure deadlines are agreed at retention.</p>` +
        `<section id="timeline">${h2("Typical timeline")}<ul>${s.timeline.map((p) => `<li><strong>${esc(p.phase)}</strong> ${esc(p.duration)}</li>`).join("")}</ul></section>` +
        (finalStep ? `<section id="deliverable">${h2("What the engagement delivers")}${para(finalStep.description)}</section>` : "");
    }
    const siblings = VARIANTS.filter((v) => v !== variant);
    writePage(path, buildPage({
      path,
      // Match ServiceTransactional.tsx: the shared variantTitle builder (the
      // H1 and the Service node keep the full name) and variantDescription().
      title: variantTitle(s, VARIANT_LABEL[variant], ORG_NAME),
      description,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: s.name, path: `/services/${s.slug}` },
        { name: VARIANT_LABEL[variant], path },
      ],
      innerHtml:
        `<h1>${esc(title)}</h1>` +
        renderBylineHtml(undefined, undefined, s.dateModified) +
        body +
        // Crawl path: the pillar and the two sibling variants.
        `<section id="also-for-this-service">${h2("Also for this service")}${linkList([
          { href: `/services/${s.slug}`, label: s.name },
          ...siblings.map((v) => ({ href: `/services/${s.slug}/${v}`, label: `${VARIANT_LINK_LABEL[v]} for ${name}` })),
        ])}</section>` +
        `<p><a href="/schedule-consultation">Schedule a consultation</a></p>` +
        relatedHtml(related, "Guides and methods") +
        // Mirrors ServiceTransactional.tsx: the pillar's standards and data
        // sources beside the billing, process, and timeline claims (C04).
        sourcesHtml(s.sources) +
        navLinks([
          { href: `/services/${s.slug}`, label: s.name },
          { href: "/services", label: "All Services" },
          { href: "/contact", label: "Contact" },
        ]),
      ctaContext: s.shortName,
      jsonLd: [
        schema.organizationSchema(),
        schema.serviceSchema({
          url: abs(path),
          name: title,
          description,
          dateModified: s.dateModified,
        }),
      ],
    }));
    serviceVariantPages++;
  }
  // Only the pairs the pillar declares in services.ts (serviceCaseTypePairs(),
  // the set the sitemap advertises and ServicePillar.tsx links). An undeclared
  // pair is not a page: ServiceCaseType.tsx sends it to the pillar and
  // server.js 301s its address the same way, so no shell is written for it.
  const declaredPairs = serviceCaseTypePairs().filter((p) => p.service.slug === s.slug);
  for (const c of declaredPairs.map((p) => caseTypeBySlug[p.caseTypeSlug]).filter(Boolean)) {
    const path = `/services/${s.slug}/case/${c.slug}`;
    const url = abs(path);
    const heading = `${s.name} for ${c.name} Cases`;
    const lower = c.name.toLowerCase();
    // The pair note (services.ts caseTypeNotes, keyed by case-type slug)
    // carries the pair's summary and its two FAQs; a declared pair without a
    // note falls back to the shared sections with no FAQ block or FAQPage
    // markup, so the case-type hub stays the FAQ owner.
    const note = s.caseTypeNotes?.[c.slug];
    const siblings = servicesForCaseType(c.slug).filter((x) => x.slug !== s.slug);
    writePage(path, buildPage({
      path,
      // Match ServiceCaseType.tsx (pairTitle / pairDescription).
      title: pairTitle(s, c, ORG_NAME),
      description: pairDescription(s, c),
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: s.name, path: `/services/${s.slug}` },
        { name: c.name, path },
      ],
      innerHtml:
        `<h1>${esc(heading)}</h1>` +
        renderBylineHtml(undefined, undefined, s.dateModified) +
        `<p>${esc(prose.capFirst(work))} applied to ${esc(lower)} litigation: methodology, deliverables, and case-specific considerations.</p>` +
        `<section id="application">${h2(`How ${s.name} applies to ${c.name}`)}${note ? para(note.summary) : ""}${para(s.description)}</section>` +
        `<section id="loss-components">${h2("What the economic claim consists of")}${para(c.lossComponents)}</section>` +
        (finalStep ? `<section id="deliverables">${h2("Typical deliverables")}${para(finalStep.description)}</section>` : "") +
        // Crawl path out of the pair page: the case-type hub, the other
        // pillars that declare this case type, and the engagement details.
        `<section id="related-pages">${h2("Related pages")}${linkList([
          { href: `/case-types/${c.slug}`, label: `${c.name}: the economic claim, where the damages concentrate, and how the analysis is built` },
          ...siblings.map((x) => ({ href: `/services/${x.slug}/case/${c.slug}`, label: `${x.shortName} for ${c.name}` })),
          ...VARIANTS.map((v) => ({ href: `/services/${s.slug}/${v}`, label: `${VARIANT_LINK_LABEL[v]} for ${s.shortName}` })),
        ])}</section>` +
        `<section id="attorney-guides">${h2(`Attorney guides for ${lower} cases`)}${linkList(
          ATTORNEY_STAGES.map((stage) => ({ href: `/attorneys/${stage.slug}/${c.slug}`, label: stage.label, blurb: `${c.name} cases` })),
        )}</section>` +
        (note ? renderFaqHtml(note.faqs, `Frequently asked: ${s.shortName} in ${lower} matters`) : "") +
        relatedHtml(related, "Guides and methods") +
        sourcesHtml((s.sources ?? []).slice(0, 5)) +
        navLinks([
          { href: `/services/${s.slug}`, label: s.name },
          { href: `/case-types/${c.slug}`, label: `${c.name} overview` },
          { href: "/services", label: "All Services" },
          { href: "/contact", label: "Contact" },
        ]),
      ctaContext: s.shortName,
      jsonLd: [
        schema.organizationSchema(),
        schema.serviceSchema({
          url,
          name: heading,
          description: pairDescription(s, c),
          dateModified: s.dateModified,
        }),
        ...(note ? [buildFaqJsonLd(note.faqs, url)] : []),
      ],
    }));
    serviceCaseTypePages++;
  }
}

// Attorney journey stages x case types, plus a per-stage index page (the
// journey pages' breadcrumbs link to /attorneys/<stage>). Every heading,
// title, description, and intro comes from src/lib/attorney-stages.ts, the
// module JourneyStageIndex.tsx and JourneyStage.tsx render from, so the two
// sides cannot drift.
let journeyPages = 0;
for (const stage of STAGE_SLUGS) {
  const label = STAGE_LABELS[stage];
  const stagePath = `/attorneys/${stage}`;
  const stageUrl = abs(stagePath);
  const heading = stageIndexHeading(stage);
  const items = caseTypes.map((c) => ({ name: journeyHeading(stage, c), url: abs(`/attorneys/${stage}/${c.slug}`) }));
  // Mirrors JourneyStageIndex.tsx: the reviewer the stage's guides share and
  // the union of their registry sources (audit C02 / C04).
  const stageBy = stageReviewer(stage);
  writePage(stagePath, buildPage({
    path: stagePath,
    // Match JourneyStageIndex.tsx (stageIndexTitle / stageIndexDescription).
    title: stageIndexTitle(stage),
    description: stageIndexDescription(stage),
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "Attorneys", path: "/attorneys" }, { name: label, path: stagePath }],
    innerHtml:
      `<p>${esc(label)}</p>` +
      `<h1>${esc(heading)}</h1>` +
      (stageBy ? renderBylineHtml(stageBy.authorSlug, stageBy.datePublished, stageBy.dateModified) : "") +
      para(stageIndexIntro(stage)) +
      `<section>${linkList(caseTypes.map((c) => ({ href: `/attorneys/${stage}/${c.slug}`, label: c.name })))}</section>` +
      `<section id="other-stages">${h2("Other stages")}${linkList([
        ...ATTORNEY_STAGES.filter((s) => s.slug !== stage).map((s) => ({ href: `/attorneys/${s.slug}`, label: stageIndexHeading(s.slug) })),
        { href: "/attorneys", label: "Browse all attorney resources" },
      ])}</section>` +
      sourcesHtml(stageSources(stage)) +
      navLinks([{ href: "/attorneys", label: "Attorney resources" }, { href: "/case-types", label: "Case types" }, { href: "/contact", label: "Contact" }]),
    // Index-page structured data as JourneyStageIndex.tsx builds it: the
    // CollectionPage whose main entity is the ItemList of the stage's journey
    // pages, with the Organization and WebSite nodes the references resolve to.
    jsonLd: [
      schema.organizationSchema(),
      schema.websiteSchema(),
      schema.collectionPageSchema({ url: stageUrl, name: heading, description: stageIndexDescription(stage), items }),
    ],
  }));
  journeyPages++;
}
// The journey pages in journeys.ts order, so the previous/next links match
// the page's PaginateNav.
for (const [idx, j] of journeys.entries()) {
  const c = caseTypeBySlug[j.caseTypeSlug];
  if (!c) continue;
  const stage = j.stage;
  const label = STAGE_LABELS[stage];
  const stagePath = `/attorneys/${stage}`;
  const path = `/attorneys/${stage}/${c.slug}`;
  const url = abs(path);
  const heading = journeyHeading(stage, c);
  const description = journeyDescription(stage, c);
  const lower = c.name.toLowerCase();
  const neighbour = (k) => {
    const n = journeys[k];
    const ct = n && caseTypeBySlug[n.caseTypeSlug];
    return ct ? { href: `/attorneys/${n.stage}/${n.caseTypeSlug}`, label: journeyHeading(n.stage, ct) } : undefined;
  };
  const prev = idx > 0 ? neighbour(idx - 1) : undefined;
  const next = idx < journeys.length - 1 ? neighbour(idx + 1) : undefined;
  // Contextual links beyond the family: the first three pillar services the
  // case type declares and the guide that maps onto this stage.
  const relatedServices = c.relevantServices
    .map((slug) => serviceData.find((s) => s.slug === slug))
    .filter(Boolean)
    .slice(0, 3);
  const stageGuide = guides.find((g) => g.slug === STAGE_GUIDES[stage]);
  writePage(path, buildPage({
    path,
    // Match JourneyStage.tsx (journeyTitle / journeyDescription / journeyHeading).
    title: journeyTitle(stage, c),
    description,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Attorneys", path: "/attorneys" },
      { name: label, path: stagePath },
      { name: c.name, path },
    ],
    ogType: "article",
    datePublished: j.datePublished,
    dateModified: j.dateModified,
    innerHtml:
      `<h1>${esc(heading)}</h1>` +
      renderBylineHtml(j.authorSlug, j.datePublished, j.dateModified) +
      para(j.intro) +
      `<section id="checklist">${h2("Checklist")}${ol(j.checklist)}</section>` +
      `<section id="questions">${h2("Questions to ask the economist")}${ul(j.questionsToAsk)}</section>` +
      `<section id="timeline">${h2("Timeline")}${para(j.timeline)}</section>` +
      `<section id="documents">${h2("Required documents")}${ul(j.requiredDocuments)}</section>` +
      `<section id="pitfalls">${h2("Common pitfalls")}${ul(j.pitfalls)}</section>` +
      `<section id="related-guides">${h2(`More ${lower} guides`)}${linkList([
        ...ATTORNEY_STAGES.filter((s) => s.slug !== stage).map((s) => ({ href: `/attorneys/${s.slug}/${c.slug}`, label: journeyHeading(s.slug, c) })),
        { href: `/case-types/${c.slug}`, label: `${c.name} expert services overview` },
      ])}</section>` +
      `<section id="related-services">${h2("Related services and reading")}${linkList([
        ...relatedServices.map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
        ...(stageGuide ? [{ href: `/guides/${stageGuide.slug}`, label: stageGuide.title }] : []),
      ])}</section>` +
      renderFaqHtml(j.faqs) +
      sourcesHtml(j.sources) +
      navLinks([
        ...(prev ? [{ href: prev.href, label: `Previous: ${prev.label}` }] : []),
        ...(next ? [{ href: next.href, label: `Next: ${next.label}` }] : []),
        { href: stagePath, label },
        { href: "/attorneys", label: "Attorney resources" },
        { href: "/contact", label: "Contact" },
      ]),
    ctaContext: c.name,
    jsonLd: [
      schema.organizationSchema(),
      schema.articleSchema({
        title: heading,
        description,
        url,
        datePublished: j.datePublished,
        dateModified: j.dateModified,
        authorSlug: j.authorSlug,
      }),
      buildFaqJsonLd(j.faqs, url),
    ],
  }));
  journeyPages++;
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
      innerHtml: `<h1>${esc(r.h1)}</h1><p>${esc(r.blurb)}</p><nav><a href="/contact">Back to Contact</a> <a href="/services">All Services</a></nav>`,
      jsonLd: [],
    }),
  );
  retainerIntakePages++;
}

// ---------------------------------------------------------------------------
// 7. White papers hub + detail pages. The static HTML carries the abstract,
// key takeaways, the outline, and the first (open) section for non-JS
// crawlers. The gated sections are delivered client-side behind the email
// capture and are deliberately not written into the shell.
// ---------------------------------------------------------------------------
let whitePaperPages = 0;
for (const w of whitePapers) {
  const path = `/white-papers/${w.slug}`;
  const url = abs(path);
  const [teaser] = w.sections;
  const service = serviceData.find((s) => s.slug === w.serviceSlug);
  writePage(
    path,
    buildPage({
      path,
      title: `${w.metaTitle ?? w.title} | White Paper | ${ORG_NAME}`,
      description: w.metaDescription ?? truncateAtWord(w.summary),
      breadcrumbs: [{ name: "Home", path: "/" }, { name: "White Papers", path: "/white-papers" }, { name: w.title, path }],
      ogType: "article",
      datePublished: w.datePublished,
      dateModified: w.dateModified,
      innerHtml:
        `<h1>${esc(w.title)}</h1>` +
        `<p><em>${esc(w.subtitle)}</em></p>` +
        `<p>${esc(w.discipline)} &middot; ${esc(w.readingTime)}</p>` +
        renderBylineHtml(w.authorSlug, w.datePublished, w.dateModified) +
        `<section>${h2("Abstract")}${lead(w.summary)}</section>` +
        (w.keyTakeaways.length ? `<section>${h2("Key takeaways")}${ul(w.keyTakeaways)}</section>` : "") +
        (w.sections.length ? `<section>${h2("What is inside")}${ol(w.sections.map((s) => s.heading))}</section>` : "") +
        (teaser ? `<section>${h2(teaser.heading)}${teaser.bodyHtml}</section>` : "") +
        sourcesHtml(w.sources) +
        (service ? `<p>Related practice area: <a href="/services/${service.slug}">${esc(service.shortName)}</a></p>` : "") +
        navLinks([{ href: "/white-papers", label: "All white papers" }, { href: "/knowledge", label: "Knowledge Center" }, { href: "/contact", label: "Request a consultation" }]),
      ctaContext: w.title,
      jsonLd: [
        schema.organizationSchema(),
        {
          ...schema.articleSchema({
            title: w.title,
            description: w.summary,
            url,
            datePublished: w.datePublished,
            dateModified: w.dateModified,
            authorSlug: w.authorSlug,
          }),
          ...SPEAKABLE,
        },
      ],
    }),
  );
  whitePaperPages++;
}
writePage(
  "/white-papers",
  buildPage({
    path: "/white-papers",
    title: `White Papers | Economic Damages Methodology | ${ORG_NAME}`,
    description:
      `In-depth white papers on the methodology behind defensible economic damages reports and litigation business valuations, written for attorneys by ${ORG_NAME}.`,
    breadcrumbs: [{ name: "Home", path: "/" }, { name: "White Papers", path: "/white-papers" }],
    innerHtml:
      `<h1>White papers on defensible expert methodology</h1>` +
      `<p>Detailed, objective treatments of how ${ORG_NAME} builds damages analyses and valuations that can be examined and tested. Written for attorneys who want to understand the method, not just the conclusion.</p>` +
      // Each paper as the hub card (title, subtitle, discipline, reading time,
      // as WhitePapersHub.tsx shows them) plus its abstract, the paper's own
      // always-visible summary, so a non-JS reader can choose a paper here.
      `<section>${h2("Available white papers")}${whitePapers
        .map(
          (w) =>
            `<article><h3><a href="/white-papers/${w.slug}">${esc(w.title)}</a></h3>` +
            `<p><em>${esc(w.subtitle)}</em></p>` +
            `<p>${esc(w.discipline)} &middot; ${esc(w.readingTime)} &middot; Published <time datetime="${esc(w.datePublished)}">${esc(w.datePublished)}</time>` +
            (w.dateModified && w.dateModified !== w.datePublished
              ? ` &middot; Reviewed <time datetime="${esc(w.dateModified)}">${esc(w.dateModified)}</time>`
              : "") +
            `</p>${para(w.summary)}<p><a href="/white-papers/${w.slug}">Read white paper</a></p></article>`,
        )
        .join("")}</section>` +
      `<section>${h2("More from the library")}${libraryNav("/white-papers")}</section>`,
    jsonLd: [
      schema.organizationSchema(),
      schema.websiteSchema(),
      schema.collectionPageSchema({
        url: `${BASE_URL}/white-papers`,
        name: "White papers on defensible expert methodology",
        description: `Detailed, objective treatments of how ${ORG_NAME} builds damages analyses and valuations that can be examined and tested. Written for attorneys who want to understand the method, not just the conclusion.`,
        items: whitePapers.map((w) => item(w.title, `/white-papers/${w.slug}`)),
      }),
    ],
  }),
);
const whitePaperHubPages = 1;

// ---------------------------------------------------------------------------
// 8. Not-found shell. server.js answers every unknown URL with this file and a
// 404 status: the error page's own title and a noindex directive, no canonical
// and no JSON-LD, so a crawler never logs the home page's head under a 404.
// ---------------------------------------------------------------------------
writeFileSync(
  join(DIST, "404.html"),
  buildPage({
    path: "/404",
    title: `Page Not Found | ${ORG_NAME}`,
    description: "The page you are looking for could not be found.",
    canonical: false,
    robots: "noindex,follow",
    cta: false,
    innerHtml:
      `<h1>Page not found</h1><p>The address may have changed, or the page may never have existed. These pages cover most of what attorneys come here for.</p>` +
      linkList([
        { href: "/services", label: "Services", blurb: "Lost earnings, wrongful death, household services, and business damages analyses" },
        { href: "/case-types", label: "Case types", blurb: "Economic damages by case type, from personal injury to commercial disputes" },
        { href: "/contact", label: "Contact", blurb: "Reach the team; response within one business day" },
      ]) +
      `<p>Or call <a href="tel:${ORG_PHONE.replace(/-/g, "")}">${ORG_PHONE_DISPLAY}</a>. <a href="/">Return home</a>.</p>`,
    jsonLd: [],
  }),
  "utf-8",
);

// ---------------------------------------------------------------------------
// 9. Report
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
console.log(`  Total: ${total} pages pre-rendered (plus 404.html)`);
