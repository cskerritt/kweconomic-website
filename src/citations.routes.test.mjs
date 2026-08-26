// src/citations.routes.test.mjs
// Route-existence guard for the editorial citation/link layer (vitest env is
// "node" - reads source files as text, mirroring tools-indexing.routes.test.mjs).
//
// Collects every INTERNAL route referenced by:
//   - [[/route|anchor]] inline-link markers,
//   - internal `url: "/..."` values (e.g. a comparison's a.url / b.url),
//   - `href: "/..."` values in related[] cards,
//   - <a href="/..."> anchors inside article body HTML (stored in the raw file
//     bytes as backslash-escaped `<a href=\"/...\"` because the HTML lives inside
//     JS double-quoted strings),
// across the editorial data files, and asserts each one resolves to a real
// route: either a static path declared in App.tsx or a param route whose slug
// exists in the corresponding content collection. A broken cross-link fails CI.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(join(here, rel), "utf8");

const appSrc = read("App.tsx");

// --- Known routes -----------------------------------------------------------

// Static routes: every App.tsx path="/..." that has no ":" param and isn't "*".
const STATIC = new Set(
  [...appSrc.matchAll(/path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => p.startsWith("/") && !p.includes(":") && p !== "*"),
);

const slugsIn = (rel) =>
  new Set([...read(rel).matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));

const COLLECTIONS = {
  guides: slugsIn("data/guides.ts"),
  compare: slugsIn("data/comparisons.ts"),
  methods: slugsIn("data/methods.ts"),
  insights: slugsIn("data/insights.ts"),
  knowledge: slugsIn("data/knowledge.ts"),
  "white-papers": slugsIn("data/whitePapers.ts"),
  credentials: slugsIn("data/credentials.ts"),
  "case-types": slugsIn("data/caseTypes.ts"),
  services: slugsIn("data/services.ts"),
  team: slugsIn("data/team.ts"),
};

const SERVICE_SUFFIXES = new Set(["cost", "process", "timeline"]);

function resolves(route) {
  if (STATIC.has(route)) return true;
  const seg = route.split("/").filter(Boolean);
  if (seg.length === 2) {
    const collection = COLLECTIONS[seg[0]];
    return Boolean(collection && collection.has(seg[1]));
  }
  if (seg.length === 3 && seg[0] === "services") {
    return COLLECTIONS.services.has(seg[1]) && SERVICE_SUFFIXES.has(seg[2]);
  }
  if (seg.length === 3 && seg[0] === "case-types") {
    // /case-types/:typeSlug/:stateSlug - state slugs aren't enumerated here.
    return COLLECTIONS["case-types"].has(seg[1]);
  }
  return false;
}

// --- Referenced routes ------------------------------------------------------

// Editorial files that carry the citation/link constructs this task builds.
const EDITORIAL = [
  "data/insights.ts",
  "data/knowledge.ts",
  "data/faqs.ts",
  "data/comparisons.ts",
  "data/guides.ts",
  "data/methods.ts",
  "data/whitePapers.ts",
];

const ALLOWED_ROUTE = /^\/[a-z0-9/-]*$/;

function collect() {
  const markers = new Set();
  const urls = new Set();
  const hrefs = new Set();
  const anchors = new Set();
  let anchorHits = 0;
  for (const rel of EDITORIAL) {
    const src = read(rel);
    for (const m of src.matchAll(/\[\[(\/[^|\]]*)\|[^\]]+\]\]/g)) {
      // Only allow-listed marker routes become links; those are what must resolve.
      if (ALLOWED_ROUTE.test(m[1])) markers.add(m[1]);
    }
    for (const m of src.matchAll(/url:\s*"(\/[^"]*)"/g)) urls.add(m[1]);
    for (const m of src.matchAll(/href:\s*"(\/[^"]*)"/g)) hrefs.add(m[1]);
    // Body HTML lives inside JS double-quoted strings, so an <a href="/x"> is
    // stored in the raw file bytes as  <a href=\"/x\"  (each " backslash-escaped).
    // In this regex literal \\ matches ONE literal backslash; the capture starts
    // at "/" so only root-relative internal targets match (external http(s) links
    // begin with "h" after the quote and cannot match). No #fragments/?queries today.
    for (const m of src.matchAll(/<a\s+href=\\"(\/[^"\\]*)\\"/g)) {
      anchors.add(m[1]);
      anchorHits++;
    }
  }
  return { markers, urls, hrefs, anchors, anchorHits };
}

const { markers, urls, hrefs, anchors, anchorHits } = collect();
const all = new Set([...markers, ...urls, ...hrefs, ...anchors]);

describe("citation/link route guard", () => {
  it("App.tsx exposes the content hubs as static routes", () => {
    for (const hub of ["/guides", "/compare", "/methods", "/insights", "/knowledge"]) {
      expect(STATIC, `App.tsx missing static ${hub}`).toContain(hub);
    }
  });

  it("actually scans [[...]] markers (the inline-link pass is exercised in content)", () => {
    // The knowledge + methods bodies each carry one authored cross-link marker.
    expect(markers.size).toBeGreaterThanOrEqual(1);
    for (const route of markers) expect(ALLOWED_ROUTE.test(route)).toBe(true);
  });

  it("every internal [[...]] marker route resolves", () => {
    for (const route of markers) {
      expect(resolves(route), `marker route ${route} does not resolve`).toBe(true);
    }
  });

  it("every internal url:\"/...\" (incl. comparison a.url/b.url) resolves", () => {
    for (const route of urls) {
      expect(resolves(route), `url ${route} does not resolve`).toBe(true);
    }
  });

  it("every related[] href:\"/...\" resolves", () => {
    for (const route of hrefs) {
      expect(resolves(route), `related href ${route} does not resolve`).toBe(true);
    }
  });

  it("actually scans bodyHtml <a href> anchors (guards against scan-regex rot)", () => {
    // 83 internal <a href="/..."> anchors exist today across data/guides.ts (71) and
    // data/whitePapers.ts (12). They dedupe to fewer distinct routes, so the >= 50
    // floor is asserted on the raw occurrence count: if the raw-byte scan regex
    // silently rots to zero matches, anchorHits collapses and this trips (mirroring
    // the "actually scans [[...]] markers" spirit).
    expect(anchorHits).toBeGreaterThanOrEqual(50);
    expect(anchors.size).toBeGreaterThan(0);
    for (const route of anchors) expect(route.startsWith("/")).toBe(true);
  });

  it("every bodyHtml <a href> anchor route resolves", () => {
    for (const route of anchors) {
      expect(resolves(route), `bodyHtml anchor route ${route} does not resolve`).toBe(true);
    }
  });

  it("collected a non-trivial set of internal references", () => {
    expect(all.size).toBeGreaterThan(5);
  });
});
