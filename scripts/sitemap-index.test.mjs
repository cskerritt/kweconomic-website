// scripts/sitemap-index.test.mjs
//
// Pins the COMMITTED sitemap artifacts (public/sitemap.xml + children) to the
// generator's contract (`npm run build` regenerates them, so these tests catch
// drift between the committed files, the contentReadiness gate, the
// news-sitemap window, and the prerender route list).
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  SERVICE_CITY_PRERENDER_TOP,
  SERVICE_CITY_SITEMAP_TOP,
  sitemapReadyCitySlugs,
} from "../src/data/contentReadiness.ts";
import { serviceCaseTypePairs } from "../src/data/services.ts";
import { federalDistricts } from "../src/data/courts/federal-districts.ts";
import { releasedStates, serviceCaseStatePath, STATE_BATCHES } from "../src/data/serviceCaseTypeStates.ts";
import { collectSitemapPageUrls, extractLocs } from "./lib/sitemap-urls.mjs";
import {
  NEWS_SITEMAP_FILE,
  NEWS_WINDOW_DAYS,
  isRecentNews,
  recentNewsPosts,
  renderNewsSitemap,
  syncIndexNewsSitemap,
  syncRobotsNewsSitemap,
} from "./lib/news-sitemap.mjs";
import { pillarServiceSlugs, serviceEntries } from "./lib/service-slugs.mjs";
import { SITE_URL as BASE } from "./lib/site.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const PUBLIC = join(ROOT, "public");

// The eleven indexable service lines, in services.ts order (spec 4.1). The two
// cross-sell entries (vocational-evaluation, life-care-planning) are
// `pillar: false` and must never reach a sitemap.
const PILLARS = [
  "lost-earnings-and-earning-capacity",
  "wrongful-death-economic-loss",
  "personal-injury-economic-damages",
  "household-services-valuation",
  "life-care-plan-cost-projection",
  "employment-and-wage-loss-damages",
  "business-valuation",
  "lost-profits-and-commercial-damages",
  "fraud-and-asset-tracing",
  "divorce-and-marital-financial-analysis",
  "expert-rebuttal-and-report-review",
];
const CROSS_SELLS = ["vocational-evaluation", "life-care-planning"];
// Matches a cross-sell service path exactly or any descendant, without
// touching the pillar `life-care-plan-cost-projection` (shared prefix).
const CROSS_SELL_PATH = new RegExp(`/services/(${CROSS_SELLS.join("|")})(/|$)`);

const SECTION_FILES = [
  "sitemap-core.xml",
  "sitemap-services.xml",
  "sitemap-service-case-types.xml",
  "sitemap-locations.xml",
  "sitemap-case-types.xml",
  "sitemap-credentials.xml",
];

const indexXml = readFileSync(join(PUBLIC, "sitemap.xml"), "utf8");
const childUrls = Object.fromEntries(
  SECTION_FILES.map((f) => {
    const path = join(PUBLIC, f);
    return [f, existsSync(path) ? extractLocs(readFileSync(path, "utf8")) : null];
  }),
);

// Same data extraction the generator + prerender use (readFileSync + regex on
// src/data, file order preserved).
const SRC_DATA = join(ROOT, "src", "data");
const extractSlugs = (file) =>
  [...readFileSync(join(SRC_DATA, file), "utf-8").matchAll(/slug:\s*"([^"]+)"/g)].map(
    (m) => m[1],
  );
const states = extractSlugs("states.ts");
// Pillar services only - the same object-boundary reader the generator and
// prerender use, so a `pillar: false` entry never leaks into expectations.
const servicesSource = readFileSync(join(SRC_DATA, "services.ts"), "utf-8");
const genericServices = pillarServiceSlugs(servicesSource);
const caseTypes = extractSlugs("caseTypes.ts");
const credentials = extractSlugs("credentials.ts");
const citiesByState = Object.fromEntries(
  readdirSync(join(SRC_DATA, "cities"))
    .filter((f) => f.endsWith(".ts") && f !== "index.ts" && !f.endsWith(".test.ts"))
    .map((f) => [f.replace(".ts", ""), extractSlugs(join("cities", f))]),
);

const pathOf = (loc) => {
  expect(loc.startsWith(BASE)).toBe(true);
  return loc.slice(BASE.length) || "/";
};

// news-sitemap.xml exists only while an insight post is inside the two-day
// Google News window (scripts/lib/news-sitemap.mjs); the index and robots.txt
// refer to it exactly when the file exists.
const hasNewsSitemap = existsSync(join(PUBLIC, NEWS_SITEMAP_FILE));
const EXPECTED_INDEX_CHILDREN = [
  ...SECTION_FILES,
  "image-sitemap.xml",
  ...(hasNewsSitemap ? [NEWS_SITEMAP_FILE] : []),
];

describe("sitemap.xml is a sitemap index", () => {
  it("references exactly the six section children, the image sitemap, and the news sitemap only while it exists", () => {
    expect(indexXml).toContain("<sitemapindex");
    expect(indexXml).not.toContain("<urlset");
    expect(extractLocs(indexXml)).toEqual(EXPECTED_INDEX_CHILDREN.map((f) => `${BASE}/${f}`));
  });

  it("every referenced child exists in public/ (files on disk win over server.js's legacy *sitemap*.xml 410)", () => {
    for (const loc of extractLocs(indexXml)) {
      const f = loc.slice(`${BASE}/`.length);
      expect(existsSync(join(PUBLIC, f)), `${f} missing from public/`).toBe(true);
    }
  });

  it("robots.txt declares the index at the submitted path and the image sitemap, and the news sitemap only while it exists", () => {
    const robots = readFileSync(join(PUBLIC, "robots.txt"), "utf8");
    expect(robots).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    expect(robots).toContain(`Sitemap: ${BASE}/image-sitemap.xml`);
    expect(robots.includes(`Sitemap: ${BASE}/${NEWS_SITEMAP_FILE}`)).toBe(hasNewsSitemap);
  });
});

describe("child sitemaps partition the URL set by path prefix", () => {
  // The locations child carries the venue pages: /locations and, since wave 1
  // (2026-09-07), the /jurisdictions hub and the federal district pages.
  const prefixOf = {
    "sitemap-services.xml": ["/services"],
    // The service x case type x state tier (wave 2) sits under /services but
    // in its own child; the describe block below pins it to that child alone.
    "sitemap-service-case-types.xml": ["/services"],
    "sitemap-locations.xml": ["/locations", "/jurisdictions"],
    "sitemap-case-types.xml": ["/case-types"],
    "sitemap-credentials.xml": ["/credentials"],
  };
  const inSubtree = (p, prefixes) => prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));

  it("each sectioned child holds only its own subtree", () => {
    for (const [file, prefixes] of Object.entries(prefixOf)) {
      const bad = childUrls[file].map(pathOf).filter((p) => !inSubtree(p, prefixes));
      expect(bad, `${file} holds foreign URLs`).toEqual([]);
    }
  });

  it("the core child holds none of the sectioned subtrees", () => {
    const sectioned = Object.values(prefixOf).flat();
    const bad = childUrls["sitemap-core.xml"]
      .map(pathOf)
      .filter((p) => inSubtree(p, sectioned));
    expect(bad).toEqual([]);
  });

  it("no URL appears in two children", () => {
    const seen = new Map();
    for (const file of SECTION_FILES) {
      for (const u of childUrls[file]) {
        expect(seen.has(u), `${u} in both ${seen.get(u)} and ${file}`).toBe(false);
        seen.set(u, file);
      }
    }
  });
});

// T08 decision (audit 2026-09-05): the crawl-budget gate stays. The combos it
// holds back are prerendered (scripts/prerender.mjs) and linked from the
// Service x State "Cities" grid (src/lib/geo-links.ts) but not advertised;
// they sit entirely inside the prerender window. The dist/ check at the bottom
// of this file confirms each one has a shell and that nothing else is missing
// from the sitemap.
const gatedCombos = states
  .flatMap((st) => {
    const ordered = citiesByState[st] || [];
    const ready = new Set(sitemapReadyCitySlugs(st, ordered));
    return ordered
      .slice(0, SERVICE_CITY_PRERENDER_TOP)
      .filter((c) => !ready.has(c))
      .flatMap((c) => genericServices.map((svc) => `/services/${svc}/${st}/${c}`));
  })
  .sort();

describe("service x state x city sitemap gating (contentReadiness)", () => {
  const stateSet = new Set(states);
  const serviceSet = new Set(genericServices);
  const actualCombos = childUrls["sitemap-services.xml"]
    .map(pathOf)
    .filter((p) => {
      const parts = p.split("/"); // ["", "services", svc, state, city]
      return (
        parts.length === 5 && serviceSet.has(parts[2]) && stateSet.has(parts[3])
      );
    })
    .sort();

  const expectedCombos = states
    .flatMap((st) =>
      genericServices.flatMap((svc) =>
        sitemapReadyCitySlugs(st, citiesByState[st] || []).map(
          (c) => `/services/${svc}/${st}/${c}`,
        ),
      ),
    )
    .sort();

  it("the services child carries exactly the sitemap-ready combos", () => {
    expect(actualCombos).toEqual(expectedCombos);
  });

  it("every ready city is inside the prerendered top slice (sitemap URLs must resolve to prerendered pages)", () => {
    for (const st of states) {
      const ready = sitemapReadyCitySlugs(st, citiesByState[st] || []);
      const prerendered = (citiesByState[st] || []).slice(0, SERVICE_CITY_PRERENDER_TOP);
      for (const c of ready) {
        expect(prerendered, `${st}/${c} is ready but not prerendered`).toContain(c);
      }
      expect(ready.length).toBeLessThanOrEqual(prerendered.length);
    }
  });

  it("T08: the gate holds back a non-empty set of prerendered combos, none of them advertised", () => {
    expect(SERVICE_CITY_SITEMAP_TOP).toBe(5);
    expect(gatedCombos.length).toBeGreaterThan(0);
    const advertised = new Set(actualCombos);
    for (const p of gatedCombos) expect(advertised.has(p), `${p} is gated but advertised`).toBe(false);
    // The audit's examples: rank 5-9 cities without metro labor data.
    expect(gatedCombos).toContain("/services/lost-earnings-and-earning-capacity/texas/el-paso");
    expect(gatedCombos).toContain("/services/wrongful-death-economic-loss/new-jersey/camden");
    // The metro-labor exception still advertises Hackensack (HQ) past the top slice.
    expect(advertised.has("/services/lost-earnings-and-earning-capacity/new-jersey/hackensack")).toBe(true);
    expect(gatedCombos).not.toContain("/services/lost-earnings-and-earning-capacity/new-jersey/hackensack");
  });

  it("every child sitemap stays inside the sitemaps.org limits (50,000 URLs, 50 MB uncompressed)", () => {
    for (const f of EXPECTED_INDEX_CHILDREN) {
      expect(statSync(join(PUBLIC, f)).size, `${f} bytes`).toBeLessThanOrEqual(50 * 1024 * 1024);
    }
    for (const f of SECTION_FILES) {
      expect(childUrls[f].length, `${f} URLs`).toBeLessThanOrEqual(50000);
    }
  });

  it("keeps the services section within the crawl-budget target", () => {
    // 11 pillars x 56 states = 616, plus the gated city combos (11 x 275 =
    // 3,025: the first SERVICE_CITY_SITEMAP_TOP cities per state and the
    // prerendered metro-labor cities), the /services hub, the
    // pillar/cost/process/timeline pages (11 + 33), and the 60 declared
    // service x case pairs: 3,746. The ceiling is pinned just above that so a
    // widened gate (or a leaked cross-sell) fails the build; the twin sites
    // pin theirs the same way (kwvrs 2,600; kwlcp 3,600).
    // T08 decision (audit 2026-09-05): the gate stays. Widening it to the
    // whole prerender window (SERVICE_CITY_SITEMAP_TOP = 10) adds the 2,772
    // gated combos (6,518 in this child) and must raise this ceiling to 7,000
    // in the same change, on Search Console evidence only (README, "Facts to
    // confirm").
    const total = childUrls["sitemap-services.xml"].length;
    expect(total).toBeGreaterThanOrEqual(1500);
    expect(total).toBeLessThanOrEqual(4000);
  });

  it("prerender.mjs's SERVICE_CITY_TOP matches contentReadiness's prerender constant", () => {
    const prerenderSrc = readFileSync(join(ROOT, "scripts", "prerender.mjs"), "utf8");
    expect(prerenderSrc).toContain(
      `const SERVICE_CITY_TOP = ${SERVICE_CITY_PRERENDER_TOP};`,
    );
    expect(SERVICE_CITY_SITEMAP_TOP).toBeLessThanOrEqual(SERVICE_CITY_PRERENDER_TOP);
  });
});

describe("news sitemap: the Google News two-day window (scripts/lib/news-sitemap.mjs)", () => {
  const NOW = new Date("2026-09-05T15:00:00Z");

  it("a post dated today or yesterday (UTC) is news; two days ago, future-dated, or malformed is not", () => {
    expect(NEWS_WINDOW_DAYS).toBe(2);
    expect(isRecentNews("2026-09-05", NOW)).toBe(true);
    expect(isRecentNews("2026-09-04", NOW)).toBe(true);
    expect(isRecentNews("2026-09-03", NOW)).toBe(false);
    expect(isRecentNews("2026-09-06", NOW)).toBe(false);
    expect(isRecentNews("2026-9-5", NOW)).toBe(false);
    expect(isRecentNews(undefined, NOW)).toBe(false);
    // Boundary: exactly 48 hours after the publication midnight is out.
    expect(isRecentNews("2026-09-03", new Date("2026-09-05T00:00:00Z"))).toBe(false);
    expect(isRecentNews("2026-09-03", new Date("2026-09-04T23:59:59Z"))).toBe(true);
  });

  it("recentNewsPosts keeps only the posts in the window, in the order given", () => {
    const posts = [
      { slug: "old", publishedDate: "2025-02-18" },
      { slug: "today", publishedDate: "2026-09-05" },
      { slug: "yesterday", publishedDate: "2026-09-04" },
      { slug: "last-week", publishedDate: "2026-08-27" },
    ];
    expect(recentNewsPosts(posts, NOW).map((p) => p.slug)).toEqual(["today", "yesterday"]);
    expect(recentNewsPosts(posts, new Date("2026-10-01T00:00:00Z"))).toEqual([]);
  });

  it("renders one <news:news> entry per post with the publication name, language, date, and escaped title", () => {
    const xml = renderNewsSitemap(
      [{ slug: "a-post", title: 'Daubert & "Frye"', publishedDate: "2026-09-05" }],
      { base: BASE, publicationName: "KW Economics Insights" },
    );
    expect(xml).toContain('xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
    expect(xml).toContain(`<loc>${BASE}/insights/a-post</loc>`);
    expect(xml).toContain("<news:name>KW Economics Insights</news:name>");
    expect(xml).toContain("<news:language>en</news:language>");
    expect(xml).toContain("<news:publication_date>2026-09-05</news:publication_date>");
    expect(xml).toContain("<news:title>Daubert &amp; &quot;Frye&quot;</news:title>");
    expect((xml.match(/<url>/g) ?? []).length).toBe(1);
  });

  it("syncIndexNewsSitemap lists the news child last, exactly once, and removes it again", () => {
    const base = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${BASE}/sitemap-core.xml</loc></sitemap>\n  <sitemap><loc>${BASE}/image-sitemap.xml</loc></sitemap>\n</sitemapindex>\n`;
    const withNews = syncIndexNewsSitemap(base, true, BASE);
    expect(extractLocs(withNews)).toEqual([
      `${BASE}/sitemap-core.xml`,
      `${BASE}/image-sitemap.xml`,
      `${BASE}/${NEWS_SITEMAP_FILE}`,
    ]);
    expect(syncIndexNewsSitemap(withNews, true, BASE)).toBe(withNews);
    expect(syncIndexNewsSitemap(withNews, false, BASE)).toBe(base);
    expect(syncIndexNewsSitemap(base, false, BASE)).toBe(base);
  });

  it("syncRobotsNewsSitemap declares the news sitemap after the other Sitemap lines, exactly once, and removes it again", () => {
    const base = `User-agent: *\nAllow: /\n\n# Sitemap\nSitemap: ${BASE}/sitemap.xml\nSitemap: ${BASE}/image-sitemap.xml\n\nLlms: ${BASE}/llms.txt\n`;
    const withNews = syncRobotsNewsSitemap(base, true, BASE);
    expect(withNews).toContain(`Sitemap: ${BASE}/image-sitemap.xml\nSitemap: ${BASE}/${NEWS_SITEMAP_FILE}\n\nLlms:`);
    expect(syncRobotsNewsSitemap(withNews, true, BASE)).toBe(withNews);
    expect(syncRobotsNewsSitemap(withNews, false, BASE)).toBe(base);
    expect(syncRobotsNewsSitemap(base, false, BASE)).toBe(base);
    // A robots.txt with no Sitemap line gets one before the trailing newline.
    expect(syncRobotsNewsSitemap("User-agent: *\nAllow: /\n", true, BASE)).toBe(
      `User-agent: *\nAllow: /\nSitemap: ${BASE}/${NEWS_SITEMAP_FILE}\n`,
    );
  });

  it("the committed news sitemap, when present, lists only insight posts that the ordinary sitemap also carries, with their recorded publication dates", () => {
    if (!hasNewsSitemap) return;
    const xml = readFileSync(join(PUBLIC, NEWS_SITEMAP_FILE), "utf8");
    const locs = extractLocs(xml);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) {
      expect(loc.startsWith(`${BASE}/insights/`), loc).toBe(true);
      expect(childUrls["sitemap-core.xml"], loc).toContain(loc);
    }
    const recorded = new Set(
      [...readFileSync(join(SRC_DATA, "insights.ts"), "utf-8").matchAll(/publishedDate: "(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]),
    );
    for (const m of xml.matchAll(/<news:publication_date>([^<]+)<\/news:publication_date>/g)) {
      expect(recorded.has(m[1]), `publication_date ${m[1]} is not a date any post records`).toBe(true);
    }
  });

  it("insight posts stay in the ordinary sitemap whether or not they are news", () => {
    const slugs = extractSlugs("insights.ts");
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      expect(childUrls["sitemap-core.xml"]).toContain(`${BASE}/insights/${slug}`);
    }
  });
});

// 2026-09-05 audit, T06/T09: the all-pairs grid (every pillar x every case
// type) advertised 91 pages nothing linked. Only the pairs a pillar declares
// are pages now, and the generator enumerates them from the same helper the
// prerender uses (serviceCaseTypePairs()).
describe("service x case-type pairs: only the declared pairs are advertised", () => {
  const PAIR_PATH = /^\/services\/[a-z0-9-]+\/case\/[a-z0-9-]+$/;
  const advertised = childUrls["sitemap-services.xml"].map(pathOf).filter((p) => PAIR_PATH.test(p)).sort();
  const declared = serviceCaseTypePairs().map((p) => p.path);

  it("the services child carries exactly serviceCaseTypePairs()", () => {
    expect(advertised).toEqual([...declared].sort());
    expect(new Set(advertised).size).toBe(declared.length);
  });

  it("never advertises an undeclared pillar x case-type pair", () => {
    const declaredSet = new Set(declared);
    const undeclared = genericServices
      .flatMap((s) => caseTypes.map((c) => `/services/${s}/case/${c}`))
      .filter((p) => !declaredSet.has(p));
    expect(undeclared.length).toBe(genericServices.length * caseTypes.length - declaredSet.size);
    for (const p of undeclared) expect(advertised, p).not.toContain(p);
    for (const p of [
      "/services/business-valuation/case/medical-malpractice",
      "/services/divorce-and-marital-financial-analysis/case/personal-injury",
    ]) {
      expect(undeclared).toContain(p);
    }
  });

  it("no pair URL appears in any other child", () => {
    for (const f of SECTION_FILES.filter((f) => f !== "sitemap-services.xml")) {
      expect(childUrls[f].map(pathOf).filter((p) => PAIR_PATH.test(p)), f).toEqual([]);
    }
  });
});

// Wave 2 (2026-09-14): the service x case type x state family. One URL per
// declared pair per released state batch (src/data/serviceCaseTypeStates.ts),
// in its own child so the services child's ceiling is untouched. The ceiling
// here is pinned for the full rollout: 60 declared pairs x 56 states = 3,360
// (the plan's 3,300 assumed 56 pairs; services.ts declares 60), so a fifth
// batch or a widened pair set fails the build.
describe("service x case type x state pages ride their own child (wave 2)", () => {
  const FILE = "sitemap-service-case-types.xml";
  const STATE_PAIR_PATH = /^\/services\/([a-z0-9-]+)\/case\/([a-z0-9-]+)\/([a-z0-9-]+)$/;
  const advertised = (childUrls[FILE] ?? []).map(pathOf).sort();
  const released = releasedStates();
  const expected = serviceCaseTypePairs()
    .flatMap((p) => released.map((st) => serviceCaseStatePath(p.service.slug, p.caseTypeSlug, st)))
    .sort();

  it("carries exactly the declared pairs in the released states", () => {
    expect(released.length).toBeGreaterThanOrEqual(14);
    expect(advertised).toEqual(expected);
    expect(advertised.length).toBe(serviceCaseTypePairs().length * released.length);
    expect(advertised).toContain("/services/lost-earnings-and-earning-capacity/case/personal-injury/california");
  });

  it("stays inside the family's crawl-budget ceiling", () => {
    expect(advertised.length).toBeLessThanOrEqual(3400);
  });

  it("every URL is a state pair path in a released state, and no unreleased state or undeclared pair leaks", () => {
    const declared = new Set(serviceCaseTypePairs().map((p) => p.path));
    const releasedSet = new Set(released);
    for (const u of advertised) {
      const m = STATE_PAIR_PATH.exec(u);
      expect(m, u).toBeTruthy();
      expect(declared.has(`/services/${m[1]}/case/${m[2]}`), u).toBe(true);
      expect(releasedSet.has(m[3]), u).toBe(true);
    }
    const unreleased = STATE_BATCHES.filter((b) => !b.released).flatMap((b) => b.states);
    for (const st of unreleased) {
      expect(advertised.some((u) => u.endsWith(`/${st}`)), `${st} advertised before its batch shipped`).toBe(false);
    }
  });

  it("no state pair URL appears in any other child", () => {
    for (const f of SECTION_FILES.filter((f) => f !== FILE)) {
      expect(childUrls[f].map(pathOf).filter((p) => STATE_PAIR_PATH.test(p)), f).toEqual([]);
    }
  });
});

describe("ungated sections stay complete", () => {
  it("locations child lists the hub, every state, every city, the jurisdictions hub, and every federal district", () => {
    const expected = [
      "/locations",
      ...states.map((st) => `/locations/${st}`),
      ...states.flatMap((st) =>
        (citiesByState[st] || []).map((c) => `/locations/${st}/${c}`),
      ),
      "/jurisdictions",
      ...federalDistricts.map((d) => `/jurisdictions/federal/${d.slug}`),
    ].sort();
    expect(childUrls["sitemap-locations.xml"].map(pathOf).sort()).toEqual(expected);
  });

  it("advertises every federal district page, one per federalDistricts row in state-courts.ts", () => {
    const rows = readFileSync(join(SRC_DATA, "courts", "state-courts.ts"), "utf-8").match(/abbreviation:\s*"/g) ?? [];
    expect(rows.length).toBe(94);
    expect(federalDistricts.length).toBe(rows.length);
    const advertised = childUrls["sitemap-locations.xml"].map(pathOf).filter((u) => u.startsWith("/jurisdictions/federal/"));
    expect(advertised.length).toBe(rows.length);
    expect(new Set(advertised).size).toBe(rows.length);
    expect(advertised).toContain("/jurisdictions/federal/district-of-new-jersey");
    expect(childUrls["sitemap-core.xml"].map(pathOf)).not.toContain("/jurisdictions");
  });

  it("case-types child lists the hub, every case type, and every case type x state", () => {
    expect(caseTypes).toHaveLength(14);
    const expected = [
      "/case-types",
      ...caseTypes.map((c) => `/case-types/${c}`),
      ...caseTypes.flatMap((c) => states.map((st) => `/case-types/${c}/${st}`)),
    ].sort();
    expect(childUrls["sitemap-case-types.xml"].map(pathOf).sort()).toEqual(expected);
  });

  it("credentials child lists the hub, every credential, and every credential x state", () => {
    expect(credentials).toHaveLength(4);
    const expected = [
      "/credentials",
      ...credentials.map((c) => `/credentials/${c}`),
      ...credentials.flatMap((c) => states.map((st) => `/credentials/${c}/${st}`)),
    ].sort();
    expect(childUrls["sitemap-credentials.xml"].map(pathOf).sort()).toEqual(expected);
  });
});

describe("lastmod is emitted only where derivable", () => {
  const servicesXml = readFileSync(join(PUBLIC, "sitemap-services.xml"), "utf8");
  const coreXml = readFileSync(join(PUBLIC, "sitemap-core.xml"), "utf8");
  const DATE = "\\d{4}-\\d{2}-\\d{2}";
  const dated = (xml, path) => new RegExp(`<loc>${BASE}${path}</loc><lastmod>${DATE}</lastmod>`).test(xml);
  // The date a data entry records, read from the source the way the
  // generator reads it (one `dateModified` per entry block).
  const firstEntryDate = (file) => readFileSync(join(SRC_DATA, file), "utf-8").match(/dateModified:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1];

  it("insight posts carry a date; generic geo pages carry none", () => {
    expect(coreXml).toMatch(
      new RegExp(`<loc>${BASE}/insights/[a-z-]+</loc><lastmod>\\d{4}-\\d{2}-\\d{2}</lastmod>`),
    );
    expect(servicesXml).toContain(
      `<loc>${BASE}/services/lost-earnings-and-earning-capacity/new-jersey</loc><changefreq>`,
    );
  });

  it("every dated editorial family advertises its dateModified: guides, comparisons, knowledge, white papers, methods, the FAQ", () => {
    for (const [file, prefix] of [
      ["guides.ts", "/guides"],
      ["comparisons.ts", "/compare"],
      ["knowledge.ts", "/knowledge"],
      ["whitePapers.ts", "/white-papers"],
      ["methods.ts", "/methods"],
    ]) {
      const slugsInFile = extractSlugs(file);
      expect(slugsInFile.length, file).toBeGreaterThan(0);
      for (const slug of slugsInFile) {
        expect(dated(coreXml, `${prefix}/${slug}`), `${prefix}/${slug} has no lastmod`).toBe(true);
      }
      expect(firstEntryDate(file), `${file} records dateModified`).toBeTruthy();
    }
    expect(dated(coreXml, "/resources/faq")).toBe(true);
  });

  it("every attorney journey page advertises its own dateModified", () => {
    for (const stage of ["considering", "retaining", "preparing-deposition", "trial"]) {
      for (const c of caseTypes) {
        expect(dated(coreXml, `/attorneys/${stage}/${c}`), `/attorneys/${stage}/${c}`).toBe(true);
      }
    }
  });

  it("a pillar that records dateModified stamps its pillar, variant, and declared case-type pages", () => {
    const blocks = serviceEntries(servicesSource).filter((e) => e.pillar);
    let stamped = 0;
    for (const { slug } of blocks) {
      const block = servicesSource.split(`slug: "${slug}"`)[1]?.split(/\n  \},?\n/)[0] ?? "";
      const date = block.match(/dateModified:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1];
      if (!date) continue;
      stamped++;
      expect(servicesXml, slug).toContain(`<loc>${BASE}/services/${slug}</loc><lastmod>${date}</lastmod>`);
      for (const v of ["cost", "process", "timeline"]) {
        expect(servicesXml, `${slug}/${v}`).toContain(`<loc>${BASE}/services/${slug}/${v}</loc><lastmod>${date}</lastmod>`);
      }
      const declared = [...(block.match(/caseTypes:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      for (const ct of declared) {
        expect(servicesXml, `${slug}/case/${ct}`).toContain(`<loc>${BASE}/services/${slug}/case/${ct}</loc><lastmod>${date}</lastmod>`);
      }
    }
    // Undated entries stay without lastmod rather than taking the build date;
    // the count only documents how many pillars are dated today.
    expect(stamped).toBeGreaterThanOrEqual(0);
  });

  it("never stamps a build date: every lastmod is a date an entry records", () => {
    const dates = new Set([...coreXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]));
    const recorded = new Set(
      ["guides.ts", "comparisons.ts", "knowledge.ts", "whitePapers.ts", "methods.ts", "journeys.ts", "insights.ts", "faqs.ts"].flatMap((f) =>
        [...readFileSync(join(SRC_DATA, f), "utf-8").matchAll(/(?:dateModified|publishedDate|FAQ_DATE_MODIFIED)[:=]?\s*"?(\d{4}-\d{2}-\d{2})"/g)].map((m) => m[1]),
      ),
    );
    for (const d of dates) expect(recorded.has(d), `lastmod ${d} is not a date any entry records`).toBe(true);
  });
});

describe("image sitemap lists only images that render on the page", () => {
  const generatorSrc = readFileSync(join(ROOT, "scripts", "generate-extra-sitemaps.mjs"), "utf8");
  const imageXml = readFileSync(join(PUBLIC, "image-sitemap.xml"), "utf8");
  const pageImages = [...generatorSrc.matchAll(/\{ path: "([^"]+)", images: \[\{ src: "([^"]+)"/g)].map((m) => ({ path: m[1], src: m[2] }));
  const PAGE_SOURCE = {
    "/about": "src/pages/About.tsx",
    "/contact": "src/pages/Contact.tsx",
    "/services": "src/pages/ServicesHub.tsx",
    "/schedule-consultation": "src/pages/ScheduleConsultation.tsx",
  };

  it("has no home-page entry (the home hero is a gradient, the share image is not on the page)", () => {
    expect(pageImages.map((p) => p.path)).not.toContain("/");
    expect(imageXml).not.toContain(`<loc>${BASE}</loc>`);
    expect(imageXml).not.toContain("hero-office-meeting");
    expect(imageXml).not.toContain("og-default");
  });

  it("every curated PAGE_IMAGES src is rendered by the page it is attributed to", () => {
    expect(pageImages.length).toBeGreaterThan(0);
    for (const { path, src } of pageImages) {
      const file = PAGE_SOURCE[path];
      expect(file, `${path} has no page source mapped in this test`).toBeTruthy();
      expect(readFileSync(join(ROOT, file), "utf8"), `${file} renders ${src}`).toContain(`src="${src}"`);
      expect(imageXml).toContain(`<loc>${BASE}${path}</loc>`);
      expect(imageXml).toContain(`<image:loc>${BASE}${src}</image:loc>`);
    }
  });

  it("carries the team headshots on /team and on each profile that has one", () => {
    const teamSrc = readFileSync(join(SRC_DATA, "team.ts"), "utf-8");
    const members = [...teamSrc.matchAll(/slug: "([^"]+)"[\s\S]*?imageUrl: "([^"]+)"/g)].map((m) => ({ slug: m[1], src: m[2] }));
    expect(members.length).toBeGreaterThan(0);
    for (const { slug, src } of members) {
      expect(imageXml).toContain(`<loc>${BASE}/team/${slug}</loc>`);
      expect(imageXml).toContain(`<image:loc>${BASE}${src}</image:loc>`);
    }
    expect(imageXml).toContain(`<loc>${BASE}/team</loc>`);
  });
});

describe("non-pillar services stay out of the sitemap", () => {
  const allUrls = SECTION_FILES.flatMap((f) => childUrls[f] || []);

  it("never emits a cross-sell service URL in any child", () => {
    const leaked = allUrls.filter((u) => CROSS_SELL_PATH.test(u));
    expect(leaked).toEqual([]);
  });

  it("emits every pillar service x state and no cross-sell service URLs", () => {
    const urls = childUrls["sitemap-services.xml"];
    expect(genericServices).toEqual(PILLARS);
    for (const s of PILLARS) {
      for (const st of states) expect(urls).toContain(`${BASE}/services/${s}/${st}`);
    }
    expect(urls.some((u) => CROSS_SELL_PATH.test(u))).toBe(false);
  });

  it("lists every pillar service exactly once at its pillar path", () => {
    for (const slug of PILLARS) {
      expect(childUrls["sitemap-services.xml"].filter((u) => u === `${BASE}/services/${slug}`)).toHaveLength(1);
    }
  });

  it("the pillar whose slug shares the life-care-plan prefix is still advertised", () => {
    expect(childUrls["sitemap-services.xml"]).toContain(`${BASE}/services/life-care-plan-cost-projection`);
  });
});

describe("scripts/lib/service-slugs.mjs object-boundary split", () => {
  it("reads the real services.ts: 11 pillars in canonical order, both cross-sells flagged non-pillar", () => {
    const entries = serviceEntries(servicesSource);
    expect(entries).toHaveLength(13);
    for (const slug of CROSS_SELLS) {
      expect(entries.map((e) => e.slug)).toContain(slug);
      expect(entries.find((e) => e.slug === slug)?.pillar).toBe(false);
    }
    expect(genericServices).toEqual(PILLARS);
    expect(genericServices[0]).toBe("lost-earnings-and-earning-capacity");
  });

  it("splits on top-level object boundaries, not nested cost/process objects", () => {
    const fixture = [
      'import type { Service } from "@/types";',
      "",
      "export const services: Service[] = [",
      "  {",
      '    slug: "alpha",',
      '    name: "Alpha",',
      "    pillar: true,",
      "    cost: {",
      '      range: "pillar: false appears in prose here and must not flip the flag",',
      "      drivers: [],",
      "    },",
      "    process: [",
      '      { step: "One", description: "slug: \"decoy\" inside a step" },',
      "    ],",
      "  },",
      "  {",
      '    slug: "beta",',
      '    name: "Beta",',
      "    pillar: false,",
      '    externalUrl: "https://example.com",',
      "  },",
      "  {",
      '    slug: "gamma",',
      '    name: "Gamma",',
      "    pillar: true,",
      "  },",
      "];",
      "",
    ].join("\n");
    expect(serviceEntries(fixture)).toEqual([
      // shortName falls back to name when the entry has none.
      { slug: "alpha", name: "Alpha", shortName: "Alpha", pillar: true },
      { slug: "beta", name: "Beta", shortName: "Beta", pillar: false },
      { slug: "gamma", name: "Gamma", shortName: "Gamma", pillar: true },
    ]);
    expect(pillarServiceSlugs(fixture)).toEqual(["alpha", "gamma"]);
  });
});

// Full-coverage check against the built site. dist/ is gitignored and only
// exists after `npm run build`; the build gate is where this must hold.
// Gated on dist/404.html, the prerender's own marker (the server-contact test
// stubs dist/index.html when the suite runs without a build).
describe.skipIf(!existsSync(join(ROOT, "dist", "404.html")))(
  "every sitemap URL resolves to a prerendered page (requires dist/)",
  () => {
    it("dist/<route>/index.html exists for every advertised URL", () => {
      const urls = collectSitemapPageUrls(join(PUBLIC, "sitemap.xml"));
      const missing = urls.filter((loc) => {
        const p = pathOf(loc);
        const file =
          p === "/" ? join(ROOT, "dist", "index.html") : join(ROOT, "dist", p, "index.html");
        return !existsSync(file);
      });
      expect(missing).toEqual([]);
    });

    // The inverse direction. A prerendered shell may be missing from the
    // sitemap for exactly one reason: it is a service x state x city combo the
    // contentReadiness gate holds back (T08 decision, 2026-09-05: linked and
    // indexable, not advertised). Any other unadvertised shell is a generator
    // or prerender drift; any gated combo without a shell is a prerender drift.
    it("T08: every prerendered shell is either advertised or a readiness-gated service x state x city combo", () => {
      const advertised = new Set(collectSitemapPageUrls(join(PUBLIC, "sitemap.xml")).map(pathOf));
      const shells = [];
      const walk = (dir, rel) => {
        for (const entry of readdirSync(dir)) {
          const p = join(dir, entry);
          const r = rel ? `${rel}/${entry}` : entry;
          if (statSync(p).isDirectory()) {
            if (r.startsWith("assets")) continue;
            walk(p, r);
          } else if (entry === "index.html") {
            shells.push(rel ? `/${rel}` : "/");
          }
        }
      };
      walk(join(ROOT, "dist"), "");
      expect(shells.length).toBeGreaterThan(advertised.size);
      const unadvertised = shells.filter((r) => !advertised.has(r)).sort();
      expect(unadvertised).toEqual(gatedCombos);
    });
  },
);
