// Intellectual property coverage of every state, the District of Columbia,
// and every territory (owner request 2026-10-06: "we should also cover all
// the states"). For each slug in src/data/states.ts, the pillar's service x
// state page (/services/intellectual-property-damages/<state>), the case
// type's state page (/case-types/intellectual-property-infringement/<state>),
// and every declared IP pair's state page (/services/<pillar>/case/<case>/
// <state> for each pair the pillar or the case type joins) must be:
//
//   1. advertised in the committed sitemaps (public/sitemap-*.xml, which the
//      build regenerates from the same data), in the child its section
//      belongs to, and released in the service x case type x state plan; and
//   2. answered 200 by the real request handler (server.js) from a
//      prerendered shell whose canonical is that URL, never the 404 shell or
//      a redirect. This half needs a build (dist/404.html is the prerender's
//      own marker), like the shell parity checks in
//      scripts/prerender-shells.test.mjs.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { states } from "../src/data/states.ts";
import { serviceCaseTypePairs } from "../src/data/services.ts";
import { releasedStates, serviceCaseStatePath } from "../src/data/serviceCaseTypeStates.ts";
import { SITE_URL } from "../scripts/lib/site.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const DIST = join(ROOT, "dist");
const hasDist = existsSync(join(DIST, "404.html"));

const PILLAR = "intellectual-property-damages";
const CASE_TYPE = "intellectual-property-infringement";
// The declared pairs the pillar or the case type joins.
const IP_PAIRS = serviceCaseTypePairs().filter((p) => p.service.slug === PILLAR || p.caseTypeSlug === CASE_TYPE);

/** Every IP route a state carries, with the sitemap child it belongs to. */
function routesFor(stateSlug) {
  return [
    { path: `/services/${PILLAR}/${stateSlug}`, child: "sitemap-services.xml" },
    { path: `/case-types/${CASE_TYPE}/${stateSlug}`, child: "sitemap-case-types.xml" },
    ...IP_PAIRS.map((p) => ({ path: serviceCaseStatePath(p.service.slug, p.caseTypeSlug, stateSlug), child: "sitemap-service-case-types.xml" })),
  ];
}

const locsOf = (file) =>
  new Set([...readFileSync(join(PUBLIC, file), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE_URL, "")));

describe("intellectual property routes cover every state, the District, and every territory", () => {
  const children = Object.fromEntries(
    ["sitemap-services.xml", "sitemap-case-types.xml", "sitemap-service-case-types.xml"].map((f) => [f, locsOf(f)]),
  );

  it("declares the six intellectual property pairs and releases every state in the pair x state plan", () => {
    expect(IP_PAIRS.map((p) => p.path).sort()).toEqual(
      [
        `/services/${PILLAR}/case/${CASE_TYPE}`,
        `/services/${PILLAR}/case/commercial-contract-dispute`,
        `/services/${PILLAR}/case/partnership-and-shareholder-dispute`,
        `/services/lost-profits-and-commercial-damages/case/${CASE_TYPE}`,
        `/services/business-valuation/case/${CASE_TYPE}`,
        `/services/expert-rebuttal-and-report-review/case/${CASE_TYPE}`,
      ].sort(),
    );
    expect(states).toHaveLength(56);
    expect([...releasedStates()].sort()).toEqual(states.map((s) => s.slug).sort());
  });

  it("advertises every state's pillar, case-type, and pair x state URL in its own sitemap child", () => {
    const missing = [];
    for (const st of states) {
      for (const { path, child } of routesFor(st.slug)) {
        if (!children[child].has(path)) missing.push(`${child}: ${path}`);
      }
    }
    expect(missing).toEqual([]);
    // 56 places x (1 pillar page + 1 case-type page + 6 pairs) = 448 URLs.
    expect(states.flatMap((st) => routesFor(st.slug))).toHaveLength(448);
  });
});

describe.skipIf(!hasDist)("every state's intellectual property routes answer 200 from a prerendered shell (requires dist/)", () => {
  let server;
  let base;
  beforeAll(async () => {
    delete process.env.CANONICAL_HOST;
    const mod = await import("../server.js");
    server = createServer(mod.requestHandler);
    await new Promise((resolve) => server.listen(0, resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => server?.close());

  it("serves each of the 448 routes with status 200, the page's own canonical, and no not-found shell", async () => {
    const failures = [];
    for (const st of states) {
      for (const { path } of routesFor(st.slug)) {
        const res = await fetch(`${base}${path}`, { redirect: "manual" });
        const html = await res.text();
        if (res.status !== 200) {
          failures.push(`${path}: ${res.status}`);
          continue;
        }
        if (!html.includes(`<link rel="canonical" href="${SITE_URL}${path}" />`)) failures.push(`${path}: canonical`);
        if (/<title>Page Not Found/.test(html)) failures.push(`${path}: not-found shell`);
        if (!html.includes('<meta name="description" content="')) failures.push(`${path}: no description`);
      }
    }
    expect(failures).toEqual([]);
  }, 120_000);
});
