// scripts/sitemap-index.test.mjs
//
// Pins the COMMITTED sitemap artifacts (public/sitemap.xml + children) to the
// generator's contract (`npm run build` regenerates them, so these tests catch
// drift between the committed files, the contentReadiness gate, and the
// prerender route list).
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  SERVICE_CITY_PRERENDER_TOP,
  SERVICE_CITY_SITEMAP_TOP,
  sitemapReadyCitySlugs,
} from "../src/data/contentReadiness.ts";
import { collectSitemapPageUrls, extractLocs } from "./lib/sitemap-urls.mjs";
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

describe("sitemap.xml is a sitemap index", () => {
  it("references exactly the five section children plus the image sitemap", () => {
    expect(indexXml).toContain("<sitemapindex");
    expect(indexXml).not.toContain("<urlset");
    expect(extractLocs(indexXml)).toEqual(
      [...SECTION_FILES, "image-sitemap.xml"].map((f) => `${BASE}/${f}`),
    );
  });

  it("every referenced child exists in public/ (files on disk win over server.js's legacy *sitemap*.xml 410)", () => {
    for (const f of [...SECTION_FILES, "image-sitemap.xml"]) {
      expect(existsSync(join(PUBLIC, f)), `${f} missing from public/`).toBe(true);
    }
  });

  it("robots.txt still declares the index at the submitted path", () => {
    const robots = readFileSync(join(PUBLIC, "robots.txt"), "utf8");
    expect(robots).toContain(`Sitemap: ${BASE}/sitemap.xml`);
    expect(robots).toContain(`Sitemap: ${BASE}/image-sitemap.xml`);
    expect(robots).toContain(`Sitemap: ${BASE}/news-sitemap.xml`);
  });
});

describe("child sitemaps partition the URL set by path prefix", () => {
  const prefixOf = {
    "sitemap-services.xml": "/services",
    "sitemap-locations.xml": "/locations",
    "sitemap-case-types.xml": "/case-types",
    "sitemap-credentials.xml": "/credentials",
  };

  it("each sectioned child holds only its own subtree", () => {
    for (const [file, prefix] of Object.entries(prefixOf)) {
      const bad = childUrls[file]
        .map(pathOf)
        .filter((p) => p !== prefix && !p.startsWith(`${prefix}/`));
      expect(bad, `${file} holds foreign URLs`).toEqual([]);
    }
  });

  it("the core child holds none of the sectioned subtrees", () => {
    const sectioned = Object.values(prefixOf);
    const bad = childUrls["sitemap-core.xml"]
      .map(pathOf)
      .filter((p) => sectioned.some((s) => p === s || p.startsWith(`${s}/`)));
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

  it("keeps the services section within the crawl-budget target", () => {
    // 11 pillars x 56 states = 616, plus the gated city combos (11 x ~275 =
    // ~3,025), the /services hub, and the pillar/cost/process/timeline/case
    // pages (11 + 33 + 154 = 198): ~3,840. The ceiling is pinned just above
    // that so a widened gate (or a leaked cross-sell) fails the build; the
    // twin sites pin theirs the same way (kwvrs 2,600; kwlcp 3,600).
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

describe("ungated sections stay complete", () => {
  it("locations child lists the hub, every state, and every city", () => {
    const expected = [
      "/locations",
      ...states.map((st) => `/locations/${st}`),
      ...states.flatMap((st) =>
        (citiesByState[st] || []).map((c) => `/locations/${st}/${c}`),
      ),
    ].sort();
    expect(childUrls["sitemap-locations.xml"].map(pathOf).sort()).toEqual(expected);
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
describe.skipIf(!existsSync(join(ROOT, "dist", "index.html")))(
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
  },
);
