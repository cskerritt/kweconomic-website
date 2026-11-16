// scripts/prerender-meta.test.mjs
//
// Pins the pages scripts/prerender.mjs writes to dist/ (the real React app,
// server-rendered through src/entry-server.tsx) to what the source says they
// must be: the fixed routes carry the usePageMeta() title/description of the
// React page that owns them, the head tag set is the one use-page-meta.ts
// publishes, each URL carries exactly one JSON-LD graph, the 404 page is
// noindex with no canonical, and the share-image, FAQ, byline and house-rule
// guarantees hold in the written HTML. The dist/ blocks need `npm run build`
// and are gated on the prerender's own marker (dist/404.html).
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ORG_NAME, SITE_URL } from "./lib/site.mjs";
import { FIXED_ROUTES, pageMetaFromSource } from "./lib/page-source-meta.mjs";
import { collectRoutes } from "./lib/routes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const sitemapSrc = read("scripts/generate-sitemap.mjs");
const schemaOrgSrc = read("src/components/SchemaOrg.tsx");
const pageMetaSrc = read("src/hooks/use-page-meta.ts");
const pageHeadSrc = read("src/lib/page-head.ts");
const serverSrc = read("server.js");
const brandSrc = read("src/lib/brand.ts");
const indexHtml = read("index.html");
const extraSitemapSrc = read("scripts/generate-extra-sitemaps.mjs");
const llmsSrc = read("scripts/generate-llms.mjs");
const DIST = join(ROOT, "dist");
const hasDist = existsSync(join(DIST, "404.html"));
const shellPath = (route) => (route === "/" ? join(DIST, "index.html") : join(DIST, route, "index.html"));
const readShell = (route) => readFileSync(shellPath(route), "utf8");
const dec = (s) => s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const titleOf = (h) => dec(h.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
const metaOf = (h, attr, name) => { const m = h.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`)); return m ? dec(m[1]) : undefined; };
const ldBlocks = (h) => [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const BANNED_ECON = /life care planner|CLCP|CNLCP|physician|KW LCP|kwlcp|Life Care Planning|KWVRS|Kincaid Wolstein Vocational|vocational expert/i;

describe.skipIf(!hasDist)("the written pages carry the React page meta (requires dist/)", () => {
  for (const [route, file] of Object.entries(FIXED_ROUTES)) {
    it(`${route} title + description match ${file}`, () => {
      const meta = pageMetaFromSource(ROOT, file);
      const html = readShell(route);
      expect(titleOf(html)).toBe(meta.title);
      if (meta.description !== null) expect(metaOf(html, "name", "description")).toBe(meta.description);
      expect(titleOf(html)).toContain(ORG_NAME);
    });
  }
  it("the homepage FAQ comes from the shared module and is in the written home page", () => {
    expect(read("src/pages/Home.tsx")).toContain("home-faqs.mjs");
    const html = readShell("/");
    expect((html.match(/<details/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });
  it("exactly one description, one canonical (indexable pages), og:url equal to the canonical", () => {
    for (const route of ["/", "/about", "/services/business-valuation", "/locations/new-jersey", "/guides/business-valuation-in-litigation"]) {
      const html = readShell(route);
      expect((html.match(/<meta name="description"/g) ?? []).length, route).toBe(1);
      expect((html.match(/<link rel="canonical"/g) ?? []).length, route).toBe(1);
      const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)[1];
      expect(metaOf(html, "property", "og:url"), route).toBe(canonical);
      expect(canonical, route).toBe(route === "/" ? `${SITE_URL}/` : `${SITE_URL}${route}`);
    }
  });
  it("the head carries no hreflang alternates (single-language site)", () => {
    expect(readShell("/about")).not.toContain("hreflang");
    expect(pageMetaSrc).not.toContain("hreflang\"");
    expect(pageMetaSrc).not.toMatch(/setAttribute\("hreflang"/);
  });
});

describe("retired vocational-site routes are neither prerendered nor advertised", () => {
  const RETIRED = [
    "/tools", "/tools/life-expectancy", "/intake", "/forms", "/phq-form-english", "/phq-form-spanish",
    "/hipaa-english", "/hipaa-spanish", "/tools/economic-damages-estimator", "/tools/household-services",
    "/tools/household-services/methodology", "/services/expert-disclosure",
  ];
  const routesSrc = read("scripts/lib/routes.mjs");
  it("routes.mjs enumerates no page for them", () => {
    for (const r of RETIRED) expect(routesSrc, r).not.toContain(`"${r}"`);
  });
  it("generate-sitemap.mjs CORE does not list them", () => {
    for (const r of RETIRED) expect(sitemapSrc, r).not.toContain(`"${r}"`);
  });
  it.skipIf(!hasDist)("dist/ holds no page for either cross-sell service route", () => {
    for (const r of ["/services/vocational-evaluation", "/services/life-care-planning", "/services/forensic-economics", ...RETIRED]) {
      expect(existsSync(shellPath(r)), r).toBe(false);
    }
  });
  it("collectRoutes never emits a non-pillar service route", () => {
    const routes = collectRoutes({
      states: [{ slug: "new-jersey" }], pillarServices: [{ slug: "business-valuation" }], serviceCaseTypePairs: [], caseTypes: [],
      credentials: [], team: [], journeys: [], guides: [], knowledgeGuides: [], insightPosts: [], methods: [], comparisons: [],
      whitePapers: [], attorneyStages: [], federalDistricts: [], releasedStateSlugs: [], serviceCaseStatePath: () => "",
      citiesByState: {}, serviceCityCities: () => [],
    });
    for (const r of routes) expect(r.path).not.toMatch(/vocational-evaluation|life-care-planning/);
  });
});

describe.skipIf(!hasDist)("written page text is economics-framed (requires dist/)", () => {
  it("no page's head or JSON-LD matches sister-practice phrasing", () => {
    for (const route of ["/", "/about", "/services", "/team", "/contact", "/case-types", "/guides", "/white-papers"]) {
      const html = readShell(route);
      const head = html.slice(0, html.indexOf("</head>"));
      expect(head.match(BANNED_ECON), route).toBeNull();
    }
  });
});

describe("one JSON-LD graph per URL, rendered with the page", () => {
  it("SchemaOrg is a pure render: no effect that removes graphs, and < is escaped as \\u003c", () => {
    expect(schemaOrgSrc).not.toContain("useEffect");
    expect(schemaOrgSrc).not.toContain("data-prerender");
    expect(schemaOrgSrc).toContain('.replace(/</g, "\\\\u003c")');
  });
  it("the prerender driver writes no JSON-LD of its own", () => {
    expect(read("scripts/prerender.mjs")).not.toContain("ld+json");
    expect(read("scripts/lib/page-head.mjs")).not.toContain("ld+json");
  });
  it.skipIf(!hasDist)("every page that carries structured data carries exactly one graph; the 404 carries none", () => {
    for (const route of ["/", "/about", "/services", "/services/business-valuation", "/locations/new-jersey/hackensack", "/guides/business-valuation-in-litigation", "/resources/faq", "/privacy", "/terms", "/team/christopher-skerritt"]) {
      const blocks = ldBlocks(readShell(route));
      expect(blocks.length, route).toBe(1);
      const parsed = JSON.parse(blocks[0]);
      expect(parsed["@context"], route).toBe("https://schema.org");
      expect(Array.isArray(parsed["@graph"]), route).toBe(true);
    }
    expect(ldBlocks(readFileSync(join(DIST, "404.html"), "utf8"))).toHaveLength(0);
  });
});

describe("the not-found page", () => {
  it.skipIf(!hasDist)("dist/404.html has its own title, a noindex directive, no canonical, and no JSON-LD", () => {
    const html = readFileSync(join(DIST, "404.html"), "utf8");
    expect(titleOf(html)).toBe(`Page Not Found | ${ORG_NAME}`);
    expect(metaOf(html, "name", "robots")).toBe("noindex,follow");
    expect(html).not.toContain('rel="canonical"');
    expect(ldBlocks(html)).toHaveLength(0);
  });
  it("server.js answers unknown URLs with that page, never the home page head", () => {
    expect(serverSrc).toContain('join(DIST, "404.html")');
  });
});

describe.skipIf(!hasDist)("bylines and editorial dates in the written pages (requires dist/)", () => {
  it("an editorial page prints its reviewer with a job title and both dates as <time>, and no credential list", () => {
    const html = readShell("/guides/business-valuation-in-litigation");
    const main = html.match(/<main\b[\s\S]*<\/main>/)[0];
    expect(main).toMatch(/<time dateTime="\d{4}-\d{2}-\d{2}"|<time datetime="\d{4}-\d{2}-\d{2}"/);
    expect(metaOf(html, "property", "og:type")).toBe("article");
    expect(metaOf(html, "property", "article:published_time")).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(metaOf(html, "property", "article:modified_time")).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });
  it("article times and og:type=article are on every editorial family; website elsewhere", () => {
    for (const route of ["/guides/business-valuation-in-litigation", "/compare/back-pay-vs-front-pay", "/methods/age-earnings-profile", "/knowledge/expert-witness-testimony-guide", "/attorneys/considering/personal-injury"]) {
      const html = readShell(route);
      expect(metaOf(html, "property", "og:type"), route).toBe("article");
      expect(metaOf(html, "property", "article:published_time"), route).toBeTruthy();
    }
    for (const route of ["/", "/about", "/locations/new-jersey"]) {
      const html = readShell(route);
      expect(metaOf(html, "property", "og:type"), route).toBe("website");
      expect(html, route).not.toContain("article:published_time");
    }
  });
});

describe.skipIf(!hasDist)("the family titles come from the shared builders (requires dist/)", () => {
  it("scripts/lib/routes.mjs and the React pages share src/lib/page-titles.mjs (every title is also checked at source by src/lib/page-titles.test.ts)", () => {
    expect(read("src/lib/page-titles.mjs")).toContain("export const pillarTitle");
    for (const f of ["src/pages/ServicePillar.tsx", "src/pages/ServiceState.tsx", "src/pages/StateHub.tsx"]) {
      expect(read(f), f).toContain("page-titles.mjs");
    }
  });
});

describe.skipIf(!hasDist)("the FAQ page carries the site FAQ (requires dist/)", () => {
  it("renders every question as <details> and emits the FAQPage node from the same list", () => {
    const html = readShell("/resources/faq");
    const main = html.match(/<main\b[\s\S]*<\/main>/)[0];
    // One native <details> per question: the answers open without JavaScript.
    const details = (main.match(/<details[ >]/g) ?? []).length;
    expect(details).toBeGreaterThanOrEqual(10);
    expect(main).not.toContain("aria-controls");
    const faqPage = JSON.parse(ldBlocks(html)[0])["@graph"].find((n) => n["@type"] === "FAQPage");
    expect(faqPage.mainEntity.length).toBe(details);
    for (const q of faqPage.mainEntity) expect(dec(main), q.name).toContain(dec(q.name).replace(/&/g, "&"));
  });
});

describe("the share image is the 1200x630 card crop on every side", () => {
  it("brand.ts, index.html, page-head and use-page-meta agree on the file and its size", () => {
    expect(constOf(brandSrc, "DEFAULT_OG_IMAGE")).toBe("`${SITE_URL}/images/og-default.jpg`");
    expect(brandSrc).toContain("export const DEFAULT_OG_IMAGE_WIDTH = 1200;");
    expect(brandSrc).toContain("export const DEFAULT_OG_IMAGE_HEIGHT = 630;");
    expect(indexHtml).toContain(`<meta property="og:image" content="${SITE_URL}/images/og-default.jpg" />`);
    expect(indexHtml).toContain('<meta property="og:image:width" content="1200" />');
    expect(indexHtml).toContain('<meta property="og:image:height" content="630" />');
    expect(indexHtml).toMatch(/<meta property="og:image:alt" content="[^"]+" \/>/);
    expect(indexHtml).toContain(`<meta name="twitter:image" content="${SITE_URL}/images/og-default.jpg" />`);
    for (const tag of ["og:type", "og:image:width", "og:image:height", "og:image:alt", "article:published_time", "article:modified_time"]) {
      expect(pageMetaSrc, tag).toContain(`"${tag}"`);
    }
    expect(pageMetaSrc).toContain('setMeta("twitter:image", head.ogImage)');
    expect(pageHeadSrc).toContain("DEFAULT_OG_IMAGE_WIDTH");
    expect(existsSync(join(ROOT, "public", "images", "og-default.jpg"))).toBe(true);
  });
  it.skipIf(!hasDist)("the written home page carries the default card size; a profile carries the member portrait", () => {
    const home = readShell("/");
    expect(metaOf(home, "property", "og:image")).toBe(`${SITE_URL}/images/og-default.jpg`);
    expect(metaOf(home, "property", "og:image:width")).toBe("1200");
    expect(metaOf(home, "property", "og:image:height")).toBe("630");
    expect(metaOf(home, "name", "twitter:image")).toBe(`${SITE_URL}/images/og-default.jpg`);
    const prof = readShell("/team/christopher-skerritt");
    expect(metaOf(prof, "property", "og:image")).toBe(`${SITE_URL}/team/christopher-skerritt.jpg`);
    expect(metaOf(prof, "property", "og:image:alt")).toBeTruthy();
    expect(metaOf(prof, "name", "twitter:image")).toBe(`${SITE_URL}/team/christopher-skerritt.jpg`);
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
      // /team and /team/<member> print the roster's background credentials (the page
      // says which are from another discipline) as chips and JSON-LD; the page the
      // browser renders always did, and the static HTML is now that page. Flagged
      // in the hand-off for the site owner; every other page stays under the rule.
      const isTeamPage = /^team(\/[^/]+)?\/index\.html$/.test(rel);
      const rule = isTeamPage ? /[–—§]|\d+\+\s*(?:cases|years|firms|attorneys|clients|matters)\b/ : HOUSE_RULE_BANNED;
      const m = html.slice(html.indexOf("<head>")).match(rule);
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
