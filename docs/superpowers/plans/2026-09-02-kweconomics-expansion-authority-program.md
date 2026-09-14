# KW Economics Expansion and Authority Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The weekly cloud routine executes ONE wave from section "Wave schedule" per run and ticks it.

**Goal:** Ship the old-URL 301 map now, then grow kweconomics.com by one tested, sitemap-gated wave per week (federal district pages, service x case type x state pages, and editorial batches) via auto-merged PRs.

**Architecture:** Every new page family is a data module plus a React template plus a prerender block plus a sitemap section, mirroring the existing case-type x state family. Redirects live in a runtime-only module under `lib/` because the Docker image never carries `scripts/` or `src/`. Each wave is one branch, one PR, one squash merge.

**Tech Stack:** React 19 + Vite + TypeScript, vitest (node environment, `renderToStaticMarkup` render tests), Node 22 `http` server, Railway Dockerfile deploy.

**Spec:** `docs/superpowers/specs/2026-09-02-kweconomics-expansion-authority-program-design.md`

## Global Constraints

- Node 22 only: `export PATH=~/.local/node/node-v22.22.0-darwin-arm64/bin:$PATH` locally; the cloud routine uses the image's Node 22.
- Gate before every PR: `npx tsc -b && npx eslint . && npx vitest run && npm run build` (the build regenerates sitemaps, llms.txt, and 8,613+ shells; commit the regenerated `public/sitemap-*.xml` and `public/llms*.txt`).
- Copy rules (guard tests enforce): objective plaintiff-and-defense tone; hyphens only, never em or en dashes or the section sign; no statistics or counts ("25+ years", "500 cases"); no NAFE or AAEFE membership claims; citation-free prose with sources only through `src/data/references.ts` (registry tiers: verified, anchor, live-verified; never approximate a citation); no vocational or life-care-planning vocabulary outside the carve-outs; sister brands only via `src/lib/brand.ts` and `CrossSell.tsx`; no client names, firms, cases, or testimonials.
- Never weaken a guard test. Raise a sitemap ceiling only in the task that deliberately adds the family, and say so in the commit.
- Every `slug:` then `title:`/`name:` pair in a data file stays on consecutive lines (prerender extracts positionally).
- Commits end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 0: Legacy URL 301 map (Wave 0, ships from the local session)

**Files:**
- Create: `lib/legacy-redirects.server.mjs`
- Create: `lib/legacy-redirects.server.test.mjs`
- Create: `test/fixtures/legacy-sitemap-sample.txt` (307 old URLs sampled from the old site's sitemap; already written)
- Modify: `server.js:353-368` (insert the legacy layer after the trailing-slash 301, before the CORS preflight)
- Modify: `README.md` (Production section: one paragraph on the redirect layer)

**Interfaces:**
- Produces: `resolveLegacyRedirect(pathname: string, exists: (routePath: string) => boolean): string | null` returning an absolute path on this site, an absolute `https://` URL on a sister site, or `null` when the path is not a legacy route.

- [ ] **Step 1: Write the failing test**

```js
// lib/legacy-redirects.server.test.mjs
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveLegacyRedirect } from "./legacy-redirects.server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");

// Prerendered routes stand in for dist/ so the suite runs without a build.
const PRERENDERED = new Set([
  "/services/lost-earnings-and-earning-capacity",
  "/services/lost-earnings-and-earning-capacity/new-jersey",
  "/services/lost-earnings-and-earning-capacity/new-jersey/hackensack",
  "/services/business-valuation",
  "/services/business-valuation/texas",
  "/services/lost-profits-and-commercial-damages",
  "/services/lost-profits-and-commercial-damages/ohio",
  "/services/life-care-plan-cost-projection",
  "/locations/new-jersey",
  "/locations/new-jersey/hackensack",
  "/locations/ohio",
  "/case-types/wrongful-death",
]);
const exists = (p) => PRERENDERED.has(p);

describe("resolveLegacyRedirect", () => {
  it("maps old service x state x city to the pillar page for that city when it exists", () => {
    expect(resolveLegacyRedirect("/services/economic-loss-assessment/new-jersey/hackensack", exists))
      .toBe("/services/lost-earnings-and-earning-capacity/new-jersey/hackensack");
  });
  it("falls back to the pillar x state page when the city is not prerendered", () => {
    expect(resolveLegacyRedirect("/services/economic-loss-assessment/new-jersey/kearny", exists))
      .toBe("/services/lost-earnings-and-earning-capacity/new-jersey");
  });
  it("maps old service hubs to pillars and unmapped old services to /services", () => {
    expect(resolveLegacyRedirect("/services/business-consulting", exists)).toBe("/services/lost-profits-and-commercial-damages");
    expect(resolveLegacyRedirect("/services/public-policy-analysis/ohio/akron", exists)).toBe("/services");
  });
  it("sends the sister-practice services to the sister sites", () => {
    expect(resolveLegacyRedirect("/services/vocational-evaluation/texas/houston", exists)).toBe("https://kwvrs.com/");
    expect(resolveLegacyRedirect("/services/life-care-planning", exists)).toBe("https://kwlcp.com/");
    expect(resolveLegacyRedirect("/vocational-expert/anything", exists)).toBe("https://kwvrs.com/");
    expect(resolveLegacyRedirect("/life-care-planner", exists)).toBe("https://kwlcp.com/");
  });
  it("maps bare state and state/city routes into /locations", () => {
    expect(resolveLegacyRedirect("/new-jersey", exists)).toBe("/locations/new-jersey");
    expect(resolveLegacyRedirect("/new-jersey/hackensack", exists)).toBe("/locations/new-jersey/hackensack");
    expect(resolveLegacyRedirect("/ohio/akron", exists)).toBe("/locations/ohio");
  });
  it("maps the retired core routes", () => {
    expect(resolveLegacyRedirect("/experience", exists)).toBe("/team");
    expect(resolveLegacyRedirect("/advisory", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/calculators/present-value", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/tools/anything", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/emergency-consultation", exists)).toBe("/contact");
    expect(resolveLegacyRedirect("/search", exists)).toBe("/");
    expect(resolveLegacyRedirect("/blog/some-post", exists)).toBe("/insights");
    expect(resolveLegacyRedirect("/economic-damages/foo", exists)).toBe("/services");
    expect(resolveLegacyRedirect("/lost-earnings/bar", exists)).toBe("/services/lost-earnings-and-earning-capacity");
  });
  it("leaves live routes alone", () => {
    for (const p of ["/", "/about", "/services", "/services/business-valuation", "/locations/ohio", "/case-types/wrongful-death", "/guides/what-is-a-forensic-economist", "/api/contact", "/healthz", "/assets/index-abc.js"]) {
      expect(resolveLegacyRedirect(p, exists), p).toBeNull();
    }
  });
  it("resolves every sampled old sitemap URL to a live target or a sister site", () => {
    const sample = readFileSync(join(ROOT, "test/fixtures/legacy-sitemap-sample.txt"), "utf8").split("\n").filter(Boolean);
    expect(sample.length).toBeGreaterThan(250);
    const liveExists = (p) => p === "/" || p === "/services" || p === "/contact" || p === "/team" || p === "/about" || p === "/insights" || p === "/knowledge" || p === "/locations" || p === "/case-studies" || p === "/schedule-consultation" || p === "/case-types" || /^\/services\/[a-z-]+(\/[a-z-]+)?$/.test(p) || /^\/locations\/[a-z-]+$/.test(p);
    for (const old of sample) {
      const target = resolveLegacyRedirect(old, liveExists);
      if (target === null) {
        // Only routes that still exist on the new site may resolve to null.
        expect(liveExists(old), `${old} is neither redirected nor live`).toBe(true);
        continue;
      }
      expect(target.startsWith("https://") || liveExists(target), `${old} -> ${target}`).toBe(true);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/legacy-redirects.server.test.mjs`
Expected: FAIL with "Failed to resolve import ./legacy-redirects.server.mjs".

- [ ] **Step 3: Write the module**

```js
// lib/legacy-redirects.server.mjs
// 301 map from the retired kweconomics.com routes (cskerritt/kweconomics,
// 22,418 sitemap URLs) to the closest page on this site. Runtime-only: the
// Docker image carries server.js + lib/ and never scripts/ or src/, so the
// state list and the old service slugs are spelled here. `exists` answers
// whether a route has a prerendered shell in dist/ (server.js passes a
// filesystem check; tests pass a Set).
import { SITE_URL } from "./brand.server.mjs";

const KWVRS = "https://kwvrs.com/";
const KWLCP = "https://kwlcp.com/";

export const STATE_SLUGS = new Set([
  "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware","district-of-columbia","florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky","louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi","missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico","new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania","rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont","virginia","washington","west-virginia","wisconsin","wyoming","puerto-rico","guam","u-s-virgin-islands","american-samoa","northern-mariana-islands",
]);

// Old service slug -> pillar slug, "/services" (no equivalent), or a sister URL.
export const OLD_SERVICE_TARGETS = {
  "economic-loss-assessment": "lost-earnings-and-earning-capacity",
  "expert-testimony": "lost-earnings-and-earning-capacity",
  "labor-economics-consulting": "lost-earnings-and-earning-capacity",
  "labor-market-employment-studies": "lost-earnings-and-earning-capacity",
  "econometrics-data-science": "lost-earnings-and-earning-capacity",
  "finance-investment-economics": "lost-earnings-and-earning-capacity",
  "business-valuation": "business-valuation",
  "business-consulting": "lost-profits-and-commercial-damages",
  "cost-benefit-roi-analysis": "lost-profits-and-commercial-damages",
  "pricing-strategy": "lost-profits-and-commercial-damages",
  "market-analysis-forecasting": "lost-profits-and-commercial-damages",
  "economic-impact-studies": "lost-profits-and-commercial-damages",
  "health-economics": "life-care-plan-cost-projection",
  "public-policy-analysis": null,
  "program-evaluation": null,
  "regulatory-impact-assessments": null,
  "education-economics": null,
  "international-development-economics": null,
  "vocational-evaluation": KWVRS,
  "disability-evaluation": KWVRS,
  "life-care-planning": KWLCP,
};

// Retired top-level prefixes -> target. Order matters only for readability.
const PREFIX_TARGETS = [
  ["/vocational-expert", KWVRS],
  ["/disability-evaluation", KWVRS],
  ["/life-care-planner", KWLCP],
  ["/lost-earnings", "/services/lost-earnings-and-earning-capacity"],
  ["/present-value", "/services/lost-earnings-and-earning-capacity"],
  ["/wrongful-death-damages", "/services/wrongful-death-economic-loss"],
  ["/business-valuation", "/services/business-valuation"],
  ["/business-damages", "/services/lost-profits-and-commercial-damages"],
  ["/commercial-damages", "/services/lost-profits-and-commercial-damages"],
  ["/forensic-economist", "/services"],
  ["/personal-injury-economist", "/services/personal-injury-economic-damages"],
  ["/expert-witness", "/services"],
  ["/practice-areas", "/services"],
  ["/economic-damages", "/services"],
  ["/vendor", "/services"],
  ["/tools", "/services"],
  ["/calculators", "/services"],
  ["/advisory", "/services"],
  ["/blog", "/insights"],
  ["/experience", "/team"],
  ["/emergency-consultation", "/contact"],
  ["/search", "/"],
];

const isSlug = (s) => /^[a-z0-9-]+$/.test(s);

export function resolveLegacyRedirect(pathname, exists) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || path.startsWith("/api/") || path.startsWith("/assets/")) return null;
  const parts = path.split("/").slice(1);

  // /services/<old>[/<state>[/<city>]]
  if (parts[0] === "services" && parts.length >= 2 && parts[1] in OLD_SERVICE_TARGETS) {
    const target = OLD_SERVICE_TARGETS[parts[1]];
    if (target === null) return "/services";
    if (target.startsWith("https://")) return target;
    const [, , state, city] = parts;
    if (state && STATE_SLUGS.has(state)) {
      if (city && isSlug(city) && exists(`/services/${target}/${state}/${city}`)) return `/services/${target}/${state}/${city}`;
      if (exists(`/services/${target}/${state}`)) return `/services/${target}/${state}`;
    }
    return `/services/${target}`;
  }

  // /<state>[/<city>]
  if (STATE_SLUGS.has(parts[0]) && parts.length <= 2) {
    const [state, city] = parts;
    if (city && isSlug(city) && exists(`/locations/${state}/${city}`)) return `/locations/${state}/${city}`;
    return `/locations/${state}`;
  }

  for (const [prefix, target] of PREFIX_TARGETS) {
    if (path === prefix || path.startsWith(`${prefix}/`)) return target;
  }
  return null;
}

export function legacyRedirectLocation(target, host) {
  return target.startsWith("https://") ? target : `${host || SITE_URL}${target}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/legacy-redirects.server.test.mjs`
Expected: PASS, 8 tests.

- [ ] **Step 5: Wire it into server.js**

Insert after the trailing-slash block (the `if (... url.pathname.endsWith("/"))` return) and before the CORS preflight:

```js
  // Legacy 301 map from the retired kweconomics.com routes (lib/legacy-redirects.server.mjs).
  // GET/HEAD only; runs after host + trailing-slash canonicalization so the
  // Location is final. Targets are checked against dist/ so a redirect never
  // lands on a 404.
  if (req.method === "GET" || req.method === "HEAD") {
    const legacyTarget = resolveLegacyRedirect(url.pathname, (p) => {
      const candidate = join(DIST, p, "index.html");
      return existsSync(candidate) && statSync(candidate).isFile();
    });
    if (legacyTarget) {
      res.writeHead(301, {
        Location: legacyTarget.startsWith("https://") ? legacyTarget : legacyTarget,
        "Cache-Control": "no-cache",
        ...SECURITY_HEADERS,
      });
      res.end();
      return;
    }
  }
```

Add the import at the top of `server.js`: `import { resolveLegacyRedirect } from "./lib/legacy-redirects.server.mjs";`

- [ ] **Step 6: Add the integration test**

Append to `test/server-contact.test.mjs` a describe block (the file already boots `requestHandler` on an ephemeral port):

```js
describe("legacy 301 map", () => {
  let server, base;
  beforeAll(async () => {
    server = createServer(mod.requestHandler);
    await new Promise((r) => server.listen(0, "127.0.0.1", r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  afterAll(() => new Promise((r) => server.close(r)));
  it("301s an old service route and leaves a live route alone", async () => {
    const r = await fetch(`${base}/services/economic-loss-assessment`, { redirect: "manual" });
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe("/services/lost-earnings-and-earning-capacity");
    const live = await fetch(`${base}/healthz`);
    expect(live.status).toBe(200);
  });
  it("sends a sister-practice route off-site", async () => {
    const r = await fetch(`${base}/services/vocational-evaluation/texas/houston`, { redirect: "manual" });
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe("https://kwvrs.com/");
  });
});
```

- [ ] **Step 7: Run the gate and commit**

Run: `npx tsc -b && npx eslint . && npx vitest run && npm run build` then the Docker smoke from README, plus `curl -sI localhost:3200/new-jersey/hackensack | head -3` expecting `301` and `Location: /locations/new-jersey/hackensack`.

```bash
git add lib/legacy-redirects.server.mjs lib/legacy-redirects.server.test.mjs test/fixtures/legacy-sitemap-sample.txt server.js test/server-contact.test.mjs README.md
git commit -m "server: 301 map from the retired kweconomics.com routes"
```

---

### Task 1: Federal district court pages (Wave 1)

**Files:**
- Create: `src/data/courts/federal-districts.ts`
- Create: `src/data/courts/federal-districts.test.ts`
- Create: `src/pages/templates/FederalDistrict.tsx`
- Create: `src/pages/templates/FederalDistrict.render.test.tsx`
- Modify: `src/App.tsx` (lazy import + route `/jurisdictions/federal/:districtSlug`)
- Modify: `src/App.routes.test.mjs` (add the route to the param list)
- Modify: `src/pages/hubs/JurisdictionsHubPage.tsx` (replace the plain circuit list with districts grouped by circuit, linked)
- Modify: `scripts/prerender.mjs` (new block after the credential block; count line `Federal district pages`)
- Modify: `scripts/generate-sitemap.mjs` (add `/jurisdictions/federal/<slug>` to `urls`; `sectionOf` maps `/jurisdictions` to "locations")
- Modify: `scripts/sitemap-index.test.mjs` (pin district count in `sitemap-locations.xml`)
- Modify: `src/data/references.ts` (add `FRCP_26` if absent; it is an "anchor" tier entry: `https://www.law.cornell.edu/rules/frcp/rule_26`)

**Interfaces:**
- Produces: `federalDistricts: FederalDistrict[]` with `{ slug, name, abbreviation, stateSlug, circuit }`, `getFederalDistrict(slug)`, `districtsByCircuit(): Record<string, FederalDistrict[]>`, `districtSlug(name: string): string`.

- [ ] **Step 1: Write the failing data test**

```ts
// src/data/courts/federal-districts.test.ts
import { describe, it, expect } from "vitest";
import { federalDistricts, getFederalDistrict, districtsByCircuit, districtSlug } from "./federal-districts";
import { stateCourts } from "./state-courts";

describe("federal districts", () => {
  it("derives one entry per federalDistricts row in state-courts.ts with unique slugs", () => {
    const rows = stateCourts.flatMap((s) => s.federalDistricts);
    expect(federalDistricts.length).toBe(rows.length);
    expect(new Set(federalDistricts.map((d) => d.slug)).size).toBe(federalDistricts.length);
  });
  it("slugs are lowercase hyphenated names without the word 'the'", () => {
    expect(districtSlug("Northern District of Alabama")).toBe("northern-district-of-alabama");
    expect(districtSlug("District of Alaska")).toBe("district-of-alaska");
    for (const d of federalDistricts) expect(d.slug).toMatch(/^[a-z0-9-]+$/);
  });
  it("assigns every district a circuit", () => {
    const CIRCUITS = new Set(["First","Second","Third","Fourth","Fifth","Sixth","Seventh","Eighth","Ninth","Tenth","Eleventh","D.C."]);
    for (const d of federalDistricts) expect(CIRCUITS.has(d.circuit), d.slug).toBe(true);
    expect(Object.keys(districtsByCircuit()).length).toBe(12);
  });
  it("looks up by slug", () => {
    expect(getFederalDistrict("district-of-new-jersey")?.stateSlug).toBe("new-jersey");
    expect(getFederalDistrict("nope")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/data/courts/federal-districts.test.ts`
Expected: FAIL, cannot resolve `./federal-districts`.

- [ ] **Step 3: Write the data module**

```ts
// src/data/courts/federal-districts.ts
import { stateCourts } from "./state-courts";

export interface FederalDistrict {
  slug: string;
  name: string;
  abbreviation: string;
  stateSlug: string;
  circuit: string;
}

// Circuit assignment by state; the District of Columbia sits in the D.C. Circuit.
const CIRCUIT_BY_STATE: Record<string, string> = {
  maine: "First", massachusetts: "First", "new-hampshire": "First", "rhode-island": "First", "puerto-rico": "First",
  connecticut: "Second", "new-york": "Second", vermont: "Second",
  delaware: "Third", "new-jersey": "Third", pennsylvania: "Third", "u-s-virgin-islands": "Third",
  maryland: "Fourth", "north-carolina": "Fourth", "south-carolina": "Fourth", virginia: "Fourth", "west-virginia": "Fourth",
  louisiana: "Fifth", mississippi: "Fifth", texas: "Fifth",
  kentucky: "Sixth", michigan: "Sixth", ohio: "Sixth", tennessee: "Sixth",
  illinois: "Seventh", indiana: "Seventh", wisconsin: "Seventh",
  arkansas: "Eighth", iowa: "Eighth", minnesota: "Eighth", missouri: "Eighth", nebraska: "Eighth", "north-dakota": "Eighth", "south-dakota": "Eighth",
  alaska: "Ninth", arizona: "Ninth", california: "Ninth", hawaii: "Ninth", idaho: "Ninth", montana: "Ninth", nevada: "Ninth", oregon: "Ninth", washington: "Ninth", guam: "Ninth", "northern-mariana-islands": "Ninth", "american-samoa": "Ninth",
  colorado: "Tenth", kansas: "Tenth", "new-mexico": "Tenth", oklahoma: "Tenth", utah: "Tenth", wyoming: "Tenth",
  alabama: "Eleventh", florida: "Eleventh", georgia: "Eleventh",
  "district-of-columbia": "D.C.",
};

export function districtSlug(name: string): string {
  return name.toLowerCase().replace(/^the /, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const federalDistricts: FederalDistrict[] = stateCourts.flatMap((s) =>
  s.federalDistricts.map((d) => ({
    slug: districtSlug(d.name),
    name: d.name,
    abbreviation: d.abbreviation,
    stateSlug: s.stateSlug,
    circuit: CIRCUIT_BY_STATE[s.stateSlug] ?? "Ninth",
  })),
);

export function getFederalDistrict(slug: string): FederalDistrict | undefined {
  return federalDistricts.find((d) => d.slug === slug);
}

export function districtsByCircuit(): Record<string, FederalDistrict[]> {
  const out: Record<string, FederalDistrict[]> = {};
  for (const d of federalDistricts) (out[d.circuit] ??= []).push(d);
  return out;
}
```

If the state slugs for territories differ in `states.ts` (check `grep -n 'slug: "' src/data/states.ts | tail -6`), use those exact slugs in `CIRCUIT_BY_STATE`. American Samoa has no district court; if `state-courts.ts` lists none for it the map entry is harmless.

- [ ] **Step 4: Run the data test**

Run: `npx vitest run src/data/courts/federal-districts.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing render test**

```tsx
// src/pages/templates/FederalDistrict.render.test.tsx
import { describe, it, expect, vi } from "vitest";
import FederalDistrict from "./FederalDistrict";
import { usePageMeta } from "@/hooks/use-page-meta";
import { federalDistricts } from "@/data/courts/federal-districts";
import { renderRoute, visibleText, jsonLdBlocks, faqLdStrings, faqText } from "@/test-utils/markup";

vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));
const ROUTE = "/jurisdictions/federal/:districtSlug";

describe("FederalDistrict template", () => {
  for (const d of federalDistricts) {
    it(`/jurisdictions/federal/${d.slug} renders the district page`, () => {
      vi.mocked(usePageMeta).mockClear();
      const html = renderRoute(`/jurisdictions/federal/${d.slug}`, ROUTE, FederalDistrict);
      const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
      expect(meta?.title.length).toBeLessThanOrEqual(70);
      expect(meta?.description.length).toBeLessThanOrEqual(160);
      expect(html).toContain(`<h1`);
      expect(visibleText(html)).toContain(d.name);
      expect(html).toContain(`href="/locations/${d.stateSlug}"`);
      expect(html).toContain(`href="/jurisdictions"`);
      expect(html).toContain(`href="/services/lost-earnings-and-earning-capacity"`);
      expect(jsonLdBlocks(html)).toContain('"BreadcrumbList"');
      expect(jsonLdBlocks(html)).toContain('"FAQPage"');
      expect(faqLdStrings(html).length).toBeGreaterThanOrEqual(3);
      expect(faqText(html)).not.toMatch(/[–—§]/);
      expect(visibleText(html)).not.toMatch(/\d+\+ (cases|years|firms)/i);
    });
  }
  it("unknown slug renders NotFound", () => {
    const html = renderRoute("/jurisdictions/federal/nope", ROUTE, FederalDistrict);
    expect(html).toContain("404");
  });
});
```

- [ ] **Step 6: Write the template**

```tsx
// src/pages/templates/FederalDistrict.tsx
import { useParams, Link } from "react-router-dom";
import { getFederalDistrict, federalDistricts } from "@/data/courts/federal-districts";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { caseTypes } from "@/data/caseTypes";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { refsToSources } from "@/data/references";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import ContactCTA from "@/components/ContactCTA";
import { graphSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

const FEDERAL_SERVICES = [
  "lost-earnings-and-earning-capacity",
  "employment-and-wage-loss-damages",
  "lost-profits-and-commercial-damages",
  "business-valuation",
  "expert-rebuttal-and-report-review",
];

export default function FederalDistrict() {
  const { districtSlug = "" } = useParams();
  const district = getFederalDistrict(districtSlug);
  const state = district ? states.find((s) => s.slug === district.stateSlug) : undefined;
  const url = district ? `${ORG_URL}/jurisdictions/federal/${district.slug}` : "";

  usePageMeta(
    district && state
      ? {
          title: `Economic Damages Expert, ${district.abbreviation} | ${ORG_NAME}`,
          description: `Forensic economist for matters in the ${district.name}: how the damages report, the disclosure, and the deposition are prepared for federal practice. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );
  if (!district || !state) return <NotFound />;

  const regulation = getRegulationsByState(state.slug);
  const siblings = federalDistricts.filter((d) => d.stateSlug === state.slug && d.slug !== district.slug);
  const services = pillarServices().filter((s) => FEDERAL_SERVICES.includes(s.slug));
  const faqs = [
    {
      question: `What does an economic damages report for the ${district.name} contain?`,
      answer: `A complete statement of the opinions and their basis, the records relied on, the economist's qualifications and prior testimony, and the compensation arrangement, in the form federal practice requires for a retained expert. ${ORG_NAME} writes every report to that standard regardless of venue.`,
    },
    {
      question: `Does ${ORG_NAME} testify in the ${district.name}?`,
      answer: `Yes. The economists prepare reports and give deposition and trial testimony in federal matters nationwide, including the ${district.name}, and work with counsel on the disclosure timing the scheduling order sets.`,
    },
    {
      question: `How is a federal damages report different from a state court report?`,
      answer: `The economic method is the same. Federal practice fixes the content of the written disclosure and the timing of expert exchange, and reliability challenges are decided by the court before trial, so the report states every assumption and its source in a form that can be examined in advance.`,
    },
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Jurisdictions", url: "/jurisdictions" },
        { name: district.name, url: `/jurisdictions/federal/${district.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">Economic Damages Expert for the {district.name}</h1>
      <AuthorByline />
      <p className="text-lg text-neutral-700 mb-8">
        {ORG_NAME} prepares economic damages reports and testimony for civil matters in the {district.name} ({district.abbreviation}), a federal trial court in the {district.circuit} Circuit covering {state.name}. The economist's method does not change with the venue; what changes is the form and timing of the written disclosure, and the report is built to meet it.
      </p>

      <section id="federal-practice" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">How the report is prepared for federal practice</h2>
        <p className="text-neutral-700">
          A retained economist's written report in federal court sets out every opinion and the basis for it, lists the records and data considered, attaches the exhibits that support the figures, and states the economist's qualifications, prior testimony, and compensation. The court decides reliability challenges before trial, so the report states its earnings base, growth rate, worklife horizon, and discount rate with sources so that each input can be examined on the papers.
        </p>
      </section>

      {regulation && (
        <section id="state-framework" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} damages framework in diversity matters</h2>
          <p className="text-neutral-700">{regulation.damagesContext}</p>
        </section>
      )}

      <section id="services" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Work most often retained in federal matters</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {services.map((s) => (
            <li key={s.slug}><Link to={`/services/${s.slug}`} className="text-navy underline underline-offset-2 hover:text-amber-dark">{s.name}</Link></li>
          ))}
        </ul>
      </section>

      <section id="case-types" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">{state.name} case types</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {caseTypes.map((c) => (
            <li key={c.slug}><Link to={`/case-types/${c.slug}/${state.slug}`} className="text-navy hover:text-amber-dark hover:underline">{c.name}</Link></li>
          ))}
        </ul>
      </section>

      <section id="related" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Related venues</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li><Link to={`/locations/${state.slug}`} className="text-navy underline underline-offset-2 hover:text-amber-dark">{state.name} state courts and economists</Link></li>
          {siblings.map((d) => (
            <li key={d.slug}><Link to={`/jurisdictions/federal/${d.slug}`} className="text-navy underline underline-offset-2 hover:text-amber-dark">{d.name}</Link></li>
          ))}
          <li><Link to="/jurisdictions" className="text-navy underline underline-offset-2 hover:text-amber-dark">All jurisdictions</Link></li>
        </ul>
      </section>

      <FAQBlock faqs={faqs} />
      <SourcesBlock sources={refsToSources(["FRCP_26", "FRE_702"])} />
      <div className="mt-10"><ContactCTA /></div>

      <SchemaOrg data={graphSchema([
        faqPageSchema(faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Jurisdictions", url: `${ORG_URL}/jurisdictions` },
          { name: district.name, url },
        ]),
      ])} />
    </article>
  );
}
```

Confirm the registry keys `FRCP_26` and `FRE_702` exist (`grep -n '"FRCP_26"\|"FRE_702"' src/data/references.ts`); add `FRCP_26` as an anchor entry if missing, following the existing entry shape.

- [ ] **Step 7: Route, hub, prerender, sitemap**

`src/App.tsx`: add `const FederalDistrict = lazy(() => import("@/pages/templates/FederalDistrict"));` and `<Route path="/jurisdictions/federal/:districtSlug" element={<FederalDistrict />} />` next to the `/jurisdictions` route. Add `"/jurisdictions/federal/:districtSlug"` to the param-route list in `src/App.routes.test.mjs`.

`JurisdictionsHubPage.tsx`: replace the `FEDERAL_CIRCUITS` list with `districtsByCircuit()` rendered as one `<h3>` per circuit and a `<Link to={`/jurisdictions/federal/${d.slug}`}>` per district.

`scripts/prerender.mjs`: after the credential block, read the district names from `src/data/courts/state-courts.ts` with a regex over each `stateSlug` block (`/stateSlug:\s*"([^"]+)"[\s\S]*?federalDistricts:\s*\[([\s\S]*?)\]/g`, then `/name:\s*"([^"]+)",\s*abbreviation:\s*"([^"]+)"/g` inside), slugify with the same rule as `districtSlug`, and write:

```js
let federalDistrictPages = 0;
for (const d of federalDistrictData) {
  writePage(`/jurisdictions/federal/${d.slug}`, buildPage({
    path: `/jurisdictions/federal/${d.slug}`,
    // Match FederalDistrict.tsx (title + H1).
    title: `Economic Damages Expert, ${d.abbreviation} | ${ORG_NAME}`,
    description: `Forensic economist for matters in the ${d.name}: how the damages report, the disclosure, and the deposition are prepared for federal practice. Plaintiff and defense.`,
    innerHtml: `<h1>Economic Damages Expert for the ${escapeHtml(d.name)}</h1>`,
    schemaType: "LocalBusiness",
  }));
  federalDistrictPages++;
}
```

Add `federalDistrictPages` to `total` and a `console.log(`  Federal district pages: ${federalDistrictPages}`)` line.

`scripts/generate-sitemap.mjs`: enumerate the same districts and `urls.add(`/jurisdictions/federal/${slug}`)`; in `sectionOf`, add `if (u === "/jurisdictions" || u.startsWith("/jurisdictions/")) return "locations";` before the core fallback.

`scripts/sitemap-index.test.mjs`: add `it("advertises every federal district page")` asserting `childUrls["sitemap-locations.xml"].filter((u) => u.includes("/jurisdictions/federal/")).length` equals the district count read from `state-courts.ts`.

- [x] **Step 8: Gate and commit** (wave 1, 2026-09-07: `Federal district pages: 94`; the shell block loads `federal-districts.ts` through the vite loader instead of the regex over `state-courts.ts`, and the meta pair is pinned in `prerender-meta.test.mjs`)

Run the full gate. Expected build log line `Federal district pages: 94` (or 95 if a territory district is listed). Commit:

```bash
git add src/data/courts/federal-districts.ts src/data/courts/federal-districts.test.ts src/pages/templates/FederalDistrict.tsx src/pages/templates/FederalDistrict.render.test.tsx src/App.tsx src/App.routes.test.mjs src/pages/hubs/JurisdictionsHubPage.tsx scripts/prerender.mjs scripts/generate-sitemap.mjs scripts/sitemap-index.test.mjs src/data/references.ts public/sitemap-locations.xml public/sitemap.xml public/llms.txt public/llms-full.txt
git commit -m "feat(wave-1): federal district court pages under /jurisdictions/federal"
```

---

### Task 2: Service x case type x state pages (Waves 2 to 5, one state batch each)

**Files:**
- Create: `src/data/serviceCaseTypeStates.ts` (declared pairs + the state batches)
- Create: `src/data/serviceCaseTypeStates.test.ts`
- Create: `src/pages/templates/ServiceCaseTypeState.tsx`
- Create: `src/pages/templates/ServiceCaseTypeState.render.test.tsx`
- Modify: `src/App.tsx` (route `/services/:serviceSlug/case/:typeSlug/:stateSlug`, registered BEFORE `/services/:serviceSlug/:stateSlug/:citySlug`)
- Modify: `src/App.routes.test.mjs`
- Modify: `src/pages/templates/ServiceCaseType.tsx` (add a "By state" link grid for released states)
- Modify: `src/pages/templates/CaseTypeState.tsx` (add "Services for this case type in {state}" links)
- Modify: `scripts/prerender.mjs`, `scripts/generate-sitemap.mjs` (new section `service-case-types` -> `sitemap-service-case-types.xml`), `scripts/sitemap-index.test.mjs` (add the file to `SECTION_FILES`, ceiling 3,300)

**Interfaces:**
- Produces: `RELEASED_STATE_BATCHES: string[][]` (4 arrays of 14 state slugs, largest metros first: batch A = california, texas, florida, new-york, pennsylvania, illinois, ohio, georgia, north-carolina, michigan, new-jersey, virginia, washington, arizona; batch B = massachusetts, tennessee, indiana, maryland, missouri, wisconsin, colorado, minnesota, south-carolina, alabama, louisiana, kentucky, oregon, oklahoma; batch C = connecticut, utah, iowa, nevada, arkansas, mississippi, kansas, new-mexico, nebraska, idaho, west-virginia, hawaii, new-hampshire, maine; batch D = the remaining 14 including district-of-columbia and the territories), `releasedStates(): string[]` (flatten of the batches whose `released: true`), `declaredPairs(): { serviceSlug, typeSlug }[]` from `service.caseTypes` of the pillars.

- [ ] **Step 1: Write the failing data test**

```ts
// src/data/serviceCaseTypeStates.test.ts
import { describe, it, expect } from "vitest";
import { STATE_BATCHES, releasedStates, declaredPairs } from "./serviceCaseTypeStates";
import { states } from "./states";
import { pillarServices } from "./services";

describe("service x case type x state release plan", () => {
  it("covers every state exactly once across the four batches", () => {
    const all = STATE_BATCHES.flatMap((b) => b.states);
    expect(new Set(all).size).toBe(all.length);
    expect(all.sort()).toEqual(states.map((s) => s.slug).sort());
    for (const b of STATE_BATCHES) expect(b.states.length).toBe(14);
  });
  it("declared pairs are the pillar caseTypes (56)", () => {
    expect(declaredPairs().length).toBe(pillarServices().reduce((n, s) => n + s.caseTypes.length, 0));
  });
  it("released states are a prefix of the batch order", () => {
    const released = releasedStates();
    expect(STATE_BATCHES.flatMap((b) => b.states).slice(0, released.length)).toEqual(released);
  });
});
```

- [ ] **Step 2: Write the data module**

```ts
// src/data/serviceCaseTypeStates.ts
import { pillarServices } from "./services";

export interface StateBatch { id: "A" | "B" | "C" | "D"; released: boolean; states: string[] }

// Flip `released` in the wave that ships the batch. Order = crawl priority.
export const STATE_BATCHES: StateBatch[] = [
  { id: "A", released: false, states: ["california","texas","florida","new-york","pennsylvania","illinois","ohio","georgia","north-carolina","michigan","new-jersey","virginia","washington","arizona"] },
  { id: "B", released: false, states: ["massachusetts","tennessee","indiana","maryland","missouri","wisconsin","colorado","minnesota","south-carolina","alabama","louisiana","kentucky","oregon","oklahoma"] },
  { id: "C", released: false, states: ["connecticut","utah","iowa","nevada","arkansas","mississippi","kansas","new-mexico","nebraska","idaho","west-virginia","hawaii","new-hampshire","maine"] },
  { id: "D", released: false, states: ["montana","rhode-island","delaware","south-dakota","north-dakota","alaska","vermont","wyoming","district-of-columbia","puerto-rico","guam","u-s-virgin-islands","american-samoa","northern-mariana-islands"] },
];

export function releasedStates(): string[] {
  return STATE_BATCHES.filter((b) => b.released).flatMap((b) => b.states);
}

export function declaredPairs(): { serviceSlug: string; typeSlug: string }[] {
  return pillarServices().flatMap((s) => s.caseTypes.map((typeSlug) => ({ serviceSlug: s.slug, typeSlug })));
}

export function isReleased(serviceSlug: string, typeSlug: string, stateSlug: string): boolean {
  return releasedStates().includes(stateSlug) && declaredPairs().some((p) => p.serviceSlug === serviceSlug && p.typeSlug === typeSlug);
}
```

Verify the territory slugs against `src/data/states.ts` before committing (`grep -n 'slug: "' src/data/states.ts | tail -6`) and correct batch D.

- [ ] **Step 3: Write the failing render test**

```tsx
// src/pages/templates/ServiceCaseTypeState.render.test.tsx
import { describe, it, expect, vi } from "vitest";
import ServiceCaseTypeState from "./ServiceCaseTypeState";
import { usePageMeta } from "@/hooks/use-page-meta";
import { declaredPairs } from "@/data/serviceCaseTypeStates";
import { renderRoute, visibleText, jsonLdBlocks, faqLdStrings } from "@/test-utils/markup";

vi.mock("@/hooks/use-page-meta", () => ({ usePageMeta: vi.fn() }));
const ROUTE = "/services/:serviceSlug/case/:typeSlug/:stateSlug";

describe("ServiceCaseTypeState template", () => {
  for (const { serviceSlug, typeSlug } of declaredPairs()) {
    it(`${serviceSlug} x ${typeSlug} x new-jersey renders with state substance`, () => {
      vi.mocked(usePageMeta).mockClear();
      const html = renderRoute(`/services/${serviceSlug}/case/${typeSlug}/new-jersey`, ROUTE, ServiceCaseTypeState);
      const meta = vi.mocked(usePageMeta).mock.calls.at(-1)?.[0];
      expect(meta?.title.length).toBeLessThanOrEqual(70);
      expect(meta?.description.length).toBeLessThanOrEqual(160);
      const text = visibleText(html);
      expect(text).toContain("New Jersey");
      expect(text).toContain("Damages framework");           // state-regs content rendered
      expect(html).toContain(`href="/services/${serviceSlug}/case/${typeSlug}"`);
      expect(html).toContain(`href="/case-types/${typeSlug}/new-jersey"`);
      expect(html).toContain(`href="/services/${serviceSlug}/new-jersey"`);
      expect(jsonLdBlocks(html)).toContain('"FAQPage"');
      expect(faqLdStrings(html).length).toBeGreaterThanOrEqual(3);
      expect(text).not.toMatch(/[–—§]/);
    });
  }
  it("an undeclared pair renders NotFound", () => {
    const html = renderRoute("/services/divorce-and-marital-financial-analysis/case/traumatic-brain-injury/new-jersey", ROUTE, ServiceCaseTypeState);
    expect(html).toContain("404");
  });
});
```

- [ ] **Step 4: Write the template**

Compose from `ServiceCaseType.tsx` and `CaseTypeState.tsx`: params `serviceSlug`, `typeSlug`, `stateSlug`; NotFound unless the pair is declared (`service.caseTypes.includes(typeSlug)`) and the state exists (render regardless of release so links in the hub tier can be tested; the prerender and sitemap gate on release). Title: `${service.name} for ${caseType.name} Cases in ${placeName(state.name)} | ${ORG_NAME}`; if that exceeds 70 chars use `${service.shortName} for ${caseType.name} in ${state.name} | ${ORG_NAME}`. Description: `${ORG_NAME} provides ${workPhrase(service.shortName)} for ${caseType.name.toLowerCase()} cases venued in ${placeName(state.name)}: the loss claim, the records that drive it, and the state framework. Plaintiff and defense.` H1 equals the title without the brand. Sections in order: intro (one paragraph joining `caseType.lossComponents` to the service), "How {service.name} applies to {caseType.name}" (`service.description`), "Where the damages concentrate" (`caseType.damagesExposure`), "{state.name} courts and expert standards" (courts trial courts + federal districts, each district linked to `/jurisdictions/federal/<slug>` once Task 1 has shipped), "Damages framework" (`regulations.damagesContext`), localized FAQs (the `CaseTypeState` substitution rule), links: parent service x case-type, case-type x state, service x state, state hub. JSON-LD: `serviceSchema` (slug `${service.slug}/case/${caseType.slug}/${state.slug}`), `faqPageSchema`, `breadcrumbSchema`.

- [ ] **Step 5: Routes, links, prerender, sitemap**

`src/App.tsx`: register `/services/:serviceSlug/case/:typeSlug/:stateSlug` immediately after `/services/:serviceSlug/case/:typeSlug`. Add to `App.routes.test.mjs`.

`ServiceCaseType.tsx`: below the deliverables section add `<section id="by-state">` listing `releasedStates()` as links to `/services/${service.slug}/case/${caseType.slug}/${st}` (state names from `states`). `CaseTypeState.tsx`: add a section listing the pillar services whose `caseTypes` include this type, linked to the new route when the state is released, else to `/services/<slug>/<state>`.

`scripts/prerender.mjs`: read `STATE_BATCHES` by regex from `src/data/serviceCaseTypeStates.ts` (`/released:\s*true,\s*states:\s*\[([^\]]*)\]/g`) and the `caseTypes: [...]` arrays per pillar from `services.ts` (the `pillarServiceEntries` helper returns each pillar's source block; extract its `caseTypes` list). Write one shell per released (service, type, state) with title/description/H1 matching the template exactly, `schemaType: "Service"`. Count line `Service x Case-type x State pages`.

`scripts/generate-sitemap.mjs`: add the same URLs; `sectionOf`: `if (/^\/services\/[^/]+\/case\/[^/]+\/[^/]+$/.test(u)) return "service-case-types";` placed BEFORE the `/services` rule; add `"service-case-types"` to `SECTIONS`. `scripts/sitemap-index.test.mjs`: add `sitemap-service-case-types.xml` to `SECTION_FILES`; assert its count equals `declaredPairs().length * releasedStates().length` and is `<= 3300`; keep the services ceiling at 4,000 (the new family lives in its own file).

- [x] **Steps 1-5: scaffold** (wave 2, 2026-09-14: `src/data/serviceCaseTypeStates.ts` reads the pairs from `serviceCaseTypePairs()` (60, not 56) and spells the Virgin Islands `us-virgin-islands` as states.ts does; the shell block loads the module through the vite loader; the sitemap child ceiling is 3,400)

- [ ] **Step 6: Per-wave release step** (batch A released in wave 2; B, C, D follow)

In the wave that ships batch N: set `released: true` on that batch, run the gate, confirm the build log shows `Service x Case-type x State pages: <56 x released states>`, commit `feat(wave-N): release service x case type x state batch <ID> (<14 states>)`.

---

### Task 3: Editorial batch recipe (every wave)

Each wave adds 2 guides, 1 method, 1 comparison, 1 insight from the backlog below (take the next unclaimed topics in order; strike them from the backlog in the same PR).

**Files:**
- Modify: `src/data/guides.ts`, `src/data/methods.ts`, `src/data/comparisons.ts`, `src/data/insights.ts`, `src/data/references.ts` (only when a new source is genuinely needed and can be live-verified; record the tier and the date), `README.md` page inventory counts.
- Tests already in place: `src/data/editorial.test.ts` (word floors, dash guard, registry sources), `src/data/references.test.ts` (no dead registry entries), `src/data/sources-urls.test.ts`, `src/citations.routes.test.mjs` (internal anchors resolve), `scripts/prerender-meta.test.mjs`.

- [ ] **Step 1: Guide skeleton** (append to `guides` in `src/data/guides.ts`; keep `slug` then `title` on consecutive lines)

```ts
  {
    slug: "how-worklife-expectancy-is-chosen",
    title: "How Worklife Expectancy Is Chosen in a Lost Earnings Claim",
    tldr: "Worklife expectancy is the number of years a person is expected to remain in the labor force, and it sets the horizon of a lost earnings projection. The economist selects it from published worklife tables by age, sex, and education, adjusts it for facts in the record, and states the choice so it can be tested.",
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-07",
    sections: [
      { id: "what-it-is", heading: "What worklife expectancy measures", bodyHtml: "<p>...</p>" },
      { id: "how-it-is-selected", heading: "How the table value is selected", bodyHtml: "<p>... link to <a href=\"/methods/worklife-expectancy\">the method page</a> ...</p>" },
      { id: "adjustments", heading: "When the record supports an adjustment", bodyHtml: "<p>...</p>" },
      { id: "where-it-goes-wrong", heading: "Where opposing reports go wrong", bodyHtml: "<p>...</p>" },
    ],
    faqs: [
      { question: "Is worklife expectancy the same as retirement age?", answer: "No. ..." },
      { question: "Does worklife expectancy change after an injury?", answer: "..." },
      { question: "Which table does the economist use?", answer: "..." },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_WORKLIFE", "BLS_CPS"]),
    related: [{ title: "Worklife Expectancy", url: "/methods/worklife-expectancy" }, { title: "Lost Earnings and Earning Capacity", url: "/services/lost-earnings-and-earning-capacity" }],
  },
```

Body target 900-1,400 words across the sections; lead the first section with a one-sentence definition; every section must stand alone; at least three internal links (a service, a method, a geo or case-type page); zero numerals used as claims about the practice.

- [ ] **Step 2: Method skeleton** (append to `methods` in `src/data/methods.ts`; fields are all required)

```ts
  {
    slug: "personal-consumption-tables",
    name: "Personal Consumption Deduction",
    summary: "...one paragraph, plain text, no link markers...",
    whenUsed: "...may use [[/path|label]] link markers...",
    steps: ["...", "...", "...", "...", "..."],
    dataSources: ["...", "..."],
    limitations: "...",
    admissibilityHistory: "...general, citation-free...",
    relevantServices: ["wrongful-death-economic-loss", "personal-injury-economic-damages"],
    faqs: [ { question: "...", answer: "..." }, { question: "...", answer: "..." }, { question: "...", answer: "..." } ],
    sources: refsToSources(["BLS_CEX"]),
  },
```

- [ ] **Step 3: Comparison skeleton** (append to `comparisons`)

```ts
  {
    slug: "back-pay-vs-front-pay",
    title: "Back Pay vs. Front Pay",
    dateModified: "2026-09-07",
    authorSlug: "christopher-skerritt",
    a: { label: "Back Pay", summary: "...", url: "/services/employment-and-wage-loss-damages" },
    b: { label: "Front Pay", summary: "...", url: "/services/employment-and-wage-loss-damages" },
    rows: [ { dimension: "Period measured", a: "...", b: "..." }, { dimension: "Records that drive it", a: "...", b: "..." }, { dimension: "Mitigation", a: "...", b: "..." }, { dimension: "Present value", a: "...", b: "..." }, { dimension: "Who decides", a: "...", b: "..." } ],
    whenUseA: "...", whenUseB: "...", overlap: "...",
    faqs: [ ... three ... ],
    sources: refsToSources(["BLS_CPS"]),
    related: [ ... ],
  },
```

- [ ] **Step 4: Insight skeleton** (append to `insightPosts`; `slug` first line of the entry)

```ts
  {
    slug: "what-a-w-2-adds-to-a-lost-earnings-claim",
    sources: refsToSources(["IRS_W2", "BLS_CPS"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-09-07",
    title: "What a W-2 Adds to a Lost Earnings Claim",
    excerpt: "...two sentences...",
    category: "Records",
    publishedDate: "2026-09-07",
    content: `...600-900 words, paragraphs separated by blank lines, [[/path|label]] markers for internal links...`,
  },
```

- [ ] **Step 5: Verify and commit**

Run: `npx vitest run src/data src/citations.routes.test.mjs scripts/prerender-meta.test.mjs` then the full gate. Update the README inventory counts (guides, methods, comparisons, insights). Commit `content(wave-N): <guide 1>, <guide 2>, <method>, <comparison>, <insight>`.

**Backlog (strike as used):**

Guides: ~~how worklife expectancy is chosen~~ (wave 1); ~~fringe benefits in a lost earnings claim~~ (wave 1); ~~personal consumption in wrongful death~~ (wave 2); ~~valuing a homemaker's services~~ (wave 2); mitigation in employment cases; front pay versus reinstatement; lost profits for a new business; goodwill in a divorce valuation; discounts for lack of marketability; tracing commingled funds; reading an opposing economist's report; what an economic damages report costs and why; when to retain an economist in a medical malpractice case; economic damages for a minor plaintiff; damages for an undocumented worker; damages for a self-employed plaintiff; life expectancy adjustments after injury; hedonic damages and why they are not an economic calculation; prejudgment interest in damages; taxes in lost earnings claims.

Methods: ~~personal consumption tables~~ (wave 1); ~~earnings growth rate selection~~ (wave 2); the total offset method; the below-market discount rate; the age-earnings profile; capitalization of earnings; the discounted cash flow method for valuation; the yardstick and before-and-after methods for lost profits; net discount rate sensitivity; life expectancy tables.

Comparisons: ~~back pay versus front pay~~ (wave 1); ~~lost earnings versus lost earning capacity in workers' compensation~~ (wave 2); lost profits versus diminished business value; fair value versus fair market value in shareholder disputes; economist versus forensic accountant on lost profits; gross versus net earnings; present value versus total offset; nominal versus real discount rates; wrongful death versus survival damages; income approach versus market approach.

Insights (one record each): ~~W-2s~~ (wave 1), ~~tax returns~~ (wave 2), pay stubs, union contracts, benefit summaries, business tax returns, general ledgers, bank statements, QuickBooks exports, personnel files.

---

## Wave schedule

The routine takes the first unchecked wave whose date has passed. Tick it in the PR that ships it.

- [x] Wave 0 (2026-09-02, local session): Task 0 legacy 301 map.
- [x] Wave 1 (not before 2026-09-07): Task 1 federal district pages + editorial batch 1 (guides 1-2, method 1, comparison 1, insight 1). Shipped 2026-09-07 (94 district pages; how worklife expectancy is chosen, fringe benefits in a lost earnings claim, personal consumption tables, back pay versus front pay, W-2s).
- [x] Wave 2 (not before 2026-09-14): Task 2 scaffold + release batch A + editorial batch 2. Shipped 2026-09-14 (`/services/<service>/case/<case-type>/<state>` scaffold, 60 declared pairs x batch A's 14 states = 840 pages in `sitemap-service-case-types.xml`, ceiling pinned at 3,400 for the full 60 x 56 rollout since services.ts declares 60 pairs, not 56; the title comes from `serviceCaseStateTitle` in `page-titles.mjs` and the H1 keeps the full service and case-type names; personal consumption in wrongful death, valuing a homemaker's services, earnings growth rate selection, lost earnings versus earning capacity in workers' compensation, tax returns).
- [ ] Wave 3 (not before 2026-09-21): release batch B + editorial batch 3.
- [ ] Wave 4 (not before 2026-09-28): release batch C + editorial batch 4.
- [ ] Wave 5 (not before 2026-10-05): release batch D + editorial batch 5.
- [ ] Wave 6+ (weekly from 2026-10-12): editorial batches 6, 7, 8 until the backlog is empty; then open a GitHub issue titled "Editorial backlog empty" and stop.

## Routine operating procedure (one wave per run)

1. `git checkout -b wave/<n>-<slug>` from `origin/main`.
2. Implement the wave's tasks above with TDD.
3. Gate: `npx tsc -b && npx eslint . && npx vitest run && npm run build`; read the build log's page count table and confirm the new family count.
4. Commit (regenerated `public/sitemap*.xml`, `public/llms*.txt` included), push, `gh pr create --fill --body-file <summary with the count table>`.
5. `gh pr merge --squash --delete-branch --auto` if available, else `gh pr merge --squash --delete-branch` after confirming the gate output is in the PR body. If `gh` is unauthenticated in the environment, push the branch and merge locally with `git checkout main && git merge --ff-only wave/<n>-<slug> && git push origin main`.
6. Poll `https://kweconomics.com/healthz` and three new URLs every 60 s for up to 15 minutes until they return 200 (Railway builds on push to main). On failure, open a revert PR and stop.
7. `INDEXNOW_KEY=<secret> npm run indexnow`.
8. Tick the wave in this file (already committed in step 4).
