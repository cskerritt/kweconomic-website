// scripts/prerender-meta.test.mjs
//
// Pins the static shells scripts/prerender.mjs writes for the fixed routes to
// the usePageMeta() title/description of the React page at the same path, so
// the prerendered <title>/<meta description> and the hydrated page never
// advertise different primary signals. Source-read (vitest env is "node", no
// jsdom) - the same approach as src/App.routes.test.mjs.
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

// Templated routes (case-type hub, case-type x state, credential tiers). The
// shells and the React templates interpolate different variable names
// (`c.name` vs `caseType.name`), so every data expression collapses to a `${}`
// slot and only the brand tokens resolve before the two sides are compared.
// A `placeName(...)` slot keeps its own token: the District of Columbia reads
// "in the District of Columbia" on the hydrated page, so a shell that
// regressed to the bare state name would no longer slot the same way.
const slotify = (literal) =>
  literal
    .slice(1, -1)
    .replace(/\$\{([^}]*)\}/g, (_, expr) =>
      expr in TOKENS ? TOKENS[expr] : /^\s*placeName\(/.test(expr) ? "${place}" : "${}",
    );

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
  // The case-type x state tier and both credential tiers wrap their shared
  // builder or authored field in a template literal (`${caseTypeStateTitle(...)}`,
  // `${cred.metaTitle}`, `${headings.title}`) so they slot the same way.
  "`/case-types/${c.slug}/${s.slug}`": "CaseTypeState.tsx",
  "`/credentials/${c.slug}`": "CredentialHub.tsx",
  "`/credentials/${c.slug}/${s.slug}`": "CredentialState.tsx",
  // Federal district pages (wave 1): the abbreviation slots into the title
  // and description on both sides.
  "`/jurisdictions/federal/${d.slug}`": "FederalDistrict.tsx",
  // Service x case type x state (wave 2): both sides wrap the shared
  // serviceCaseStateTitle / serviceCaseStateDescription builders.
  "`/services/${s.slug}/case/${c.slug}/${st.slug}`": "ServiceCaseTypeState.tsx",
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

// ---------------------------------------------------------------------------
// Shell mechanics the 2026-09-02 audit pinned: one JSON-LD graph per URL after
// hydration, no hreflang on a single-language site, a dedicated 404 shell, the
// byline and the family title/description builders shared with the React
// templates, the FAQ shell, the share image, and the image sitemap. Source
// reads; the build-output checks live in scripts/prerender-shells.test.mjs.
// ---------------------------------------------------------------------------
const schemaOrgSrc = read("src/components/SchemaOrg.tsx");
const pageMetaSrc = read("src/hooks/use-page-meta.ts");
const serverSrc = read("server.js");
const brandSrc = read("src/lib/brand.ts");
const indexHtml = read("index.html");
const bylineSrc = read("src/components/AuthorByline.tsx");
const extraSitemapSrc = read("scripts/generate-extra-sitemaps.mjs");
const llmsSrc = read("scripts/generate-llms.mjs");

describe("the shell graph and the hydrated graph describe one set of entities", () => {
  it("prerender stamps its JSON-LD block and SchemaOrg removes it on mount", () => {
    expect(prerenderSrc).toContain('<script type="application/ld+json" data-prerender="ld">');
    expect(prerenderSrc).toContain("schema.graphSchema(nodes)");
    expect(schemaOrgSrc).toContain('script[type="application/ld+json"][data-prerender]');
    expect(schemaOrgSrc).toContain(".remove()");
  });

  it("every shell node comes from the src/lib/schema.ts builders the React pages use", () => {
    for (const builder of [
      "schema.organizationSchema()",
      "schema.websiteSchema()",
      "schema.breadcrumbSchema(",
      "schema.faqPageSchema(",
      "schema.articleSchema(",
      "schema.blogPostingSchema(",
      "schema.serviceSchema(",
      "schema.credentialSchema(",
      "schema.collectionPageSchema(",
      "schema.officeSchemas()",
      "schema.personSchema(",
      "schema.howToSchema(",
    ]) {
      expect(prerenderSrc, builder).toContain(builder);
    }
    // No hand-rolled Service/Article/LocalBusiness branch keyed on a schemaType string.
    expect(prerenderSrc).not.toMatch(/schemaType/);
  });

  it("neither side emits hreflang alternates (single-language site)", () => {
    expect(prerenderSrc).not.toMatch(/hreflang=/);
    expect(pageMetaSrc).not.toMatch(/ensureAlternate|"hreflang"|hreflang=/);
  });
});

describe("the not-found shell", () => {
  it("prerender writes dist/404.html with its own title, a noindex directive, no canonical, and no JSON-LD", () => {
    const block = prerenderSrc.slice(prerenderSrc.indexOf('join(DIST, "404.html")'));
    expect(block).toContain("title: `Page Not Found | ${ORG_NAME}`");
    expect(block).toContain('robots: "noindex,follow"');
    expect(block).toContain("canonical: false");
    expect(block).toContain("jsonLd: []");
  });

  it("server.js answers unknown URLs with that shell, never the home page head", () => {
    expect(serverSrc).toContain('join(DIST, "404.html")');
    expect(serverSrc).toContain("const body = clientOnly ? indexHtml : notFoundHtml;");
    expect(serverSrc).toContain("const CLIENT_ONLY_ROUTES = () => false;");
  });
});

describe("the shell byline mirrors AuthorByline.tsx", () => {
  it("prints name plus job title, the published and reviewed dates, and never a credential list", () => {
    expect(bylineSrc).toContain("`${member.name}, ${member.title}`");
    expect(prerenderSrc).toContain("`${member.name}, ${member.title}`");
    expect(prerenderSrc).toContain('By <a href="${linkTo}">');
    expect(prerenderSrc).toContain("Published ${time(datePublished)}");
    // "Reviewed" only beside a named reviewer; the editorial byline labels the
    // revision date "Updated" (audit C02), on both sides.
    expect(bylineSrc).toContain('const dateLabel = member ? "Reviewed" : "Updated";');
    expect(prerenderSrc).toContain('const dateLabel = member ? "Reviewed" : "Updated";');
    expect(prerenderSrc).toContain("${dateLabel} ${time(reviewed)}");
    expect(prerenderSrc).not.toContain("Reviewed by");
    expect(prerenderSrc).not.toContain("Last updated");
    expect(prerenderSrc).not.toMatch(/credentialsText/);
  });
});

describe("the family title/description builders are shared with the React templates", () => {
  it("journeys, credentials, variants, pairs, case types, profiles, and the editorial meta fields", () => {
    for (const expr of [
      "journeyTitle(stage, c)",
      "journeyDescription(stage, c)",
      "journeyHeading(stage, c)",
      "stageIndexTitle(stage)",
      "stageIndexDescription(stage)",
      "stageIndexHeading(stage)",
      "stageIndexIntro(stage)",
      "credentialStateHeadings(c, s.name)",
      "credentialStateAngle(c, s.name)",
      "variantDescription(s, variant)",
      "title: variantTitle(s, VARIANT_LABEL[variant], ORG_NAME)",
      "title: pairTitle(s, c, ORG_NAME)",
      "pairDescription(s, c)",
      "title: `${serviceCaseStateTitle(s, c, st, ORG_NAME)}`",
      "description: `${serviceCaseStateDescription(s, c, placeName(st.name))}`",
      "profileTitleFor(t)",
      // The case-type tiers read the entry's framing through the shared
      // helpers (src/data/caseTypes.ts) on both sides (audit F08).
      "title: `${caseTypeHubTitle(c, ORG_NAME)}`",
      "description: `${caseTypeHubDescription(c)}`",
      "title: `${caseTypeStateTitle(c, s, ORG_NAME)}`",
      "description: `${caseTypeStateDescription(c, placeName(s.name))}`",
      "caseTypeHubHeading(c)",
      "caseTypeStateHeading(c, place)",
      "caseTypeStateLead(c, ORG_NAME, place)",
      "caseTypeStateFrameworkQuestion(c, place)",
      "caseTypeStateServiceDescription(c, place)",
      "title: `${c.metaTitle}`",
      "description: `${c.metaDescription}`",
      "title: `${headings.title}`",
      "description: `${headings.description}`",
      "title: pillarTitle(svc, ORG_NAME)",
      "title: stateHubTitle(state, ORG_NAME)",
      "title: cityHubTitle(city, state, ORG_NAME)",
      "title: serviceStateTitle(svc, state, ORG_NAME)",
      "title: serviceCityTitle(svc, city, state, ORG_NAME)",
      "svc.metaDescription ?? svc.description",
      "guide.metaDescription ?? truncateAtWord(guide.tldr)",
      "title: `${m.name.endsWith(\"Methodology\") ? m.name : `${m.name} Method`} | ${ORG_NAME}`",
      "m.metaDescription ?? truncateAtWord(m.summary)",
      "cmp.answer ?? truncateAtWord(stripLinkMarkers(cmp.overlap))",
      "post.metaDescription ?? post.excerpt",
      "w.metaDescription ?? truncateAtWord(w.summary)",
      "description: truncateAtWord(narrative.directAnswer)",
      "description: truncateAtWord(directAnswer)",
      "description: truncateAtWord(cityDirect)",
    ]) {
      expect(prerenderSrc, expr).toContain(expr);
    }
    // No mid-word slice remains anywhere in the shell descriptions.
    expect(prerenderSrc).not.toMatch(/\.slice\(0, 160\)/);
  });

  it("the geo, pillar, variant, pair, and case-type x state titles come from src/lib/page-titles.mjs on both sides", () => {
    expect(prerenderSrc).toContain('from "../src/lib/page-titles.mjs"');
    for (const [file, builder] of [
      ["src/pages/StateHub.tsx", "stateHubTitle"],
      ["src/pages/CityPage.tsx", "cityHubTitle"],
      ["src/pages/ServiceState.tsx", "serviceStateTitle"],
      ["src/pages/ServiceStateCity.tsx", "serviceCityTitle"],
      ["src/pages/ServicePillar.tsx", "pillarTitle"],
      ["src/pages/templates/ServiceTransactional.tsx", "variantTitle"],
      ["src/pages/templates/ServiceCaseType.tsx", "pairTitle"],
      ["src/pages/templates/CaseTypeState.tsx", "caseTypeStateTitle"],
      ["src/pages/templates/ServiceCaseTypeState.tsx", "serviceCaseStateTitle"],
    ]) {
      const src = read(file);
      expect(src, file).toContain(`import { ${builder} } from "@/lib/page-titles.mjs";`);
      // The builder feeds the usePageMeta title (directly, through a ternary,
      // or wrapped in a template literal for the parity guard).
      expect(src, file).toMatch(new RegExp(`title: [^;]*?${builder}\\(`));
      expect(prerenderSrc, builder).toMatch(new RegExp(`title: \`?\\$?\\{?${builder}\\(`));
    }
    // The credential x state title and the profile title go through their
    // own shared builders, which apply the same ceiling.
    expect(read("src/data/credentials.ts")).toContain('import { placeTitle } from "@/lib/page-titles.mjs";');
    expect(read("src/data/team-meta.mjs")).toContain('import { TITLE_MAX } from "../lib/page-titles.mjs";');
  });

  it("uses the hand-authored pillar FAQ, the declared case-type pairs, and the pair notes", () => {
    expect(prerenderSrc).toContain("const faqs = svc.faqs ?? pillarFaqs(svc);");
    expect(prerenderSrc).toContain("const declaredCaseTypes = svc.caseTypes");
    expect(prerenderSrc).toContain("const note = s.caseTypeNotes?.[c.slug];");
    expect(prerenderSrc).toContain("...(note ? [buildFaqJsonLd(note.faqs, url)] : [])");
  });
});

describe("the FAQ shell carries the site FAQ", () => {
  it("renders every question as <details> and emits the FAQPage node from the same list", () => {
    expect(prerenderSrc).toContain('load("/src/data/faqs.ts")');
    expect(prerenderSrc).toContain('renderFaqHtml(siteFaqs, "Questions attorneys ask")');
    expect(prerenderSrc).toContain("...buildFaqJsonLd(siteFaqs, `${BASE_URL}/resources/faq`)");
    expect(prerenderSrc).toContain("dateModified: FAQ_DATE_MODIFIED");
  });
});

describe("the share image is the 1200x630 card crop on every side", () => {
  it("brand.ts, index.html, the shells, and use-page-meta agree on the file and its size", () => {
    expect(constOf(brandSrc, "DEFAULT_OG_IMAGE")).toBe("`${SITE_URL}/images/og-default.jpg`");
    expect(brandSrc).toContain("export const DEFAULT_OG_IMAGE_WIDTH = 1200;");
    expect(brandSrc).toContain("export const DEFAULT_OG_IMAGE_HEIGHT = 630;");
    expect(indexHtml).toContain(`<meta property="og:image" content="${SITE_URL}/images/og-default.jpg" />`);
    expect(indexHtml).toContain('<meta property="og:image:width" content="1200" />');
    expect(indexHtml).toContain('<meta property="og:image:height" content="630" />');
    expect(indexHtml).toMatch(/<meta property="og:image:alt" content="[^"]+" \/>/);
    expect(indexHtml).toContain(`<meta name="twitter:image" content="${SITE_URL}/images/og-default.jpg" />`);
    for (const tag of ["og:type", "og:image", "og:image:width", "og:image:height", "og:image:alt"]) {
      expect(prerenderSrc, tag).toContain(`setTemplateMeta(html, "property", "${tag}"`);
    }
    expect(prerenderSrc).toContain('setTemplateMeta(html, "name", "twitter:image", image)');
    expect(prerenderSrc).toContain('article:published_time');
    for (const tag of ["og:type", "og:image:width", "og:image:height", "og:image:alt", "article:published_time", "article:modified_time"]) {
      expect(pageMetaSrc, tag).toContain(`"${tag}"`);
    }
    expect(pageMetaSrc).toContain('setMeta("twitter:image", ogImage)');
    expect(existsSync(join(ROOT, "public", "images", "og-default.jpg"))).toBe(true);
  });

  it("team profiles override the share image with the member portrait", () => {
    expect(prerenderSrc).toContain("ogImage: portrait?.src");
    expect(prerenderSrc).toContain("ogImageAlt: portrait ? t.name : undefined");
  });
});

describe("the image sitemap lists only images that render on the page", () => {
  it("has no home-page entry (the home hero is a gradient; the share image is not on the page)", () => {
    const block = extraSitemapSrc.match(/const PAGE_IMAGES = \[([\s\S]*?)\n\];/)?.[1] ?? "";
    expect(block).not.toMatch(/path: "\/"/);
    expect(block).not.toContain("hero-office-meeting");
    expect(block).not.toContain("og-default");
  });
});

describe("the AI-facing generator keeps the economics framing", () => {
  it("scripts/generate-llms.mjs carries no sister-practice vocabulary and prints degree credentials only", () => {
    const hits = llmsSrc
      .split("\n")
      .map((line, i) => (BANNED_LLMS.test(line) ? `${i + 1}: ${line.trim().slice(0, 140)}` : null))
      .filter(Boolean);
    expect(hits).toEqual([]);
    expect(llmsSrc).toContain("degreeCredentials(m.credentials)");
    expect(llmsSrc).not.toMatch(/Credentials: \$\{joinList\(m\.credentials\)\}/);
  });
});

// Same list as the shell guard above plus the phrase the audit found in the
// generator's sister-practice note.
const BANNED_LLMS = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP|physician|KW LCP|kwlcp|Life Care Planning|KWVRS|Kincaid Wolstein Vocational/i;

function constOf(src, name) {
  return src.match(new RegExp(`export const ${name}\\s*=\\s*(\`[^\`]*\`|"[^"]*")`))?.[1];
}

// ---------------------------------------------------------------------------
// Build-output walk over EVERY shell prerender.mjs writes, the city and
// service x city tiers included (scripts/prerender-shells.test.mjs skips the
// `locations/<state>/<city>` and `services/<pillar>/<anything>` subtrees, so
// its walk never sees the variant, pair, service x state, or city shells).
// House rules that hold on every page regardless of template: no
// sister-practice credential abbreviation, no em or en dash, no section sign,
// and no count claim. Gated on dist/ like the other build checks.
// ---------------------------------------------------------------------------
const DIST = join(ROOT, "dist");
const HOUSE_RULE_BANNED = /CLCP|CNLCP|\bCRC\b|MSCC|[–—§]|\d+\+\s*(?:cases|years|firms|attorneys|clients|matters)\b/;
// Longest <title> a shell may carry, measured on the raw tag the way a crawler
// reads it (an escaped ampersand counts as five characters). The same ceiling
// src/lib/page-titles.mjs applies at the source level.
const TITLE_MAX = 60;

/** Every shell under dist/ (index.html and 404.html) as { rel, html }. */
function walkShells() {
  const shells = [];
  const walk = (dir, rel) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      const r = rel ? `${rel}/${entry}` : entry;
      if (statSync(p).isDirectory()) {
        if (r.startsWith("assets")) continue;
        walk(p, r);
      } else if (entry === "index.html" || entry === "404.html") {
        shells.push({ rel: r, html: readFileSync(p, "utf8") });
      }
    }
  };
  walk(DIST, "");
  return shells;
}

// Gated on dist/404.html, the prerender's own marker (the server-contact test
// stubs dist/index.html when the suite runs without a build).
describe.skipIf(!existsSync(join(DIST, "404.html")))("every shell in dist/ keeps the house rules (requires dist/)", () => {
  const shells = walkShells();

  it("walks the full route set", () => {
    // Core + hubs + editorial + every geo, case-type, credential, service,
    // and journey tier. A walk that saw only a few hundred files would mean
    // the tiers were skipped again.
    expect(shells.length).toBeGreaterThan(5000);
  });

  it("no shell, city and service tiers included, carries CLCP/CNLCP/CRC/MSCC, an em or en dash, a section sign, or a count claim", () => {
    const offenders = [];
    for (const { rel, html } of shells) {
      const m = html.slice(html.indexOf("<head>")).match(HOUSE_RULE_BANNED);
      if (m) offenders.push(`${rel}: ${JSON.stringify(m[0])}`);
    }
    expect(offenders).toEqual([]);
  });

  it(`no shell <title>, city and service tiers included, runs past ${TITLE_MAX} characters as written`, () => {
    const offenders = [];
    for (const { rel, html } of shells) {
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
      expect(title, `${rel} has a <title>`).toBeTruthy();
      if (title.length > TITLE_MAX) offenders.push(`${rel}: "${title}" (${title.length})`);
    }
    expect(offenders).toEqual([]);
  });
});
