// scripts/sitemap-index.test.mjs
//
// Pins the COMMITTED sitemap artifacts (public/sitemap.xml + children) to the
// generator's contract (mirrors Raffle.test.mjs: `npm run build` regenerates
// them, so these tests catch drift between the committed files, the
// contentReadiness gate, and the prerender route list).
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

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const PUBLIC = join(ROOT, "public");
const BASE = "https://kwvrs.com";

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
    expect(robots).toContain("Sitemap: https://kwvrs.com/sitemap.xml");
    expect(robots).toContain("Sitemap: https://kwvrs.com/image-sitemap.xml");
    expect(robots).toContain("Sitemap: https://kwvrs.com/news-sitemap.xml");
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
    // 10 pillars x 56 states = 560, plus gated cities (~2,750) and the
    // pillar/cost/process/timeline/case pages (~150).
    const total = childUrls["sitemap-services.xml"].length;
    expect(total).toBeGreaterThanOrEqual(1500);
    expect(total).toBeLessThanOrEqual(3600);
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
    const expected = [
      "/case-types",
      ...caseTypes.map((c) => `/case-types/${c}`),
      ...caseTypes.flatMap((c) => states.map((st) => `/case-types/${c}/${st}`)),
    ].sort();
    expect(childUrls["sitemap-case-types.xml"].map(pathOf).sort()).toEqual(expected);
  });

  it("credentials child lists the hub, every credential, and every credential x state", () => {
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

  // The per-state expert-disclosure pages (and their dateModified lastmod) were
  // removed with src/data/disclosureRules.ts (Task 4); Task 12 strips the
  // remaining disclosure branches from generate-sitemap.mjs.

  it("insight posts carry a date; generic geo pages carry none", () => {
    expect(coreXml).toMatch(
      /<loc>https:\/\/kwvrs\.com\/insights\/[a-z-]+<\/loc><lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/,
    );
    expect(servicesXml).toMatch(
      /<loc>https:\/\/kwvrs\.com\/services\/life-care-planning\/new-jersey<\/loc><changefreq>/,
    );
  });
});

describe("non-pillar services stay out of the sitemap", () => {
  const allUrls = SECTION_FILES.flatMap((f) => childUrls[f] || []);

  it("never emits forensic-economics service URLs", () => {
    const leaked = allUrls.filter((u) => u.includes("/services/forensic-economics"));
    expect(leaked).toEqual([]);
  });

  it("lists every pillar service exactly once at its pillar path", () => {
    for (const slug of genericServices) {
      expect(childUrls["sitemap-services.xml"]).toContain(`${BASE}/services/${slug}`);
    }
  });
});

describe("scripts/lib/service-slugs.mjs object-boundary split", () => {
  it("reads the real services.ts: 10 pillars, forensic-economics flagged non-pillar", () => {
    const entries = serviceEntries(servicesSource);
    expect(entries.map((e) => e.slug)).toContain("forensic-economics");
    expect(entries.find((e) => e.slug === "forensic-economics")?.pillar).toBe(false);
    expect(genericServices).toHaveLength(10);
    expect(genericServices).not.toContain("forensic-economics");
    expect(genericServices[0]).toBe("life-care-planning");
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
