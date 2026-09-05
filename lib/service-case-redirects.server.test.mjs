import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveUndeclaredPairRedirect } from "./service-case-redirects.server.mjs";
import { pillarServices, serviceCaseTypePairs } from "../src/data/services.ts";
import { caseTypes } from "../src/data/caseTypes.ts";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");

// Prerendered routes stand in for dist/ so the suite runs without a build: the
// pillars, the case-type hubs, and the declared pairs, exactly what
// scripts/prerender.mjs writes for those tiers.
const SHELLS = new Set([
  ...pillarServices().map((s) => `/services/${s.slug}`),
  ...caseTypes.map((c) => `/case-types/${c.slug}`),
  ...serviceCaseTypePairs().map((p) => p.path),
  "/services/business-valuation/texas",
  "/services/business-valuation/cost",
]);
const exists = (p) => SHELLS.has(p);

describe("resolveUndeclaredPairRedirect", () => {
  it("sends an undeclared pair of a real pillar and a real case type to the pillar", () => {
    expect(resolveUndeclaredPairRedirect("/services/business-valuation/case/medical-malpractice", exists)).toBe("/services/business-valuation");
    expect(resolveUndeclaredPairRedirect("/services/divorce-and-marital-financial-analysis/case/personal-injury", exists)).toBe(
      "/services/divorce-and-marital-financial-analysis",
    );
    expect(resolveUndeclaredPairRedirect("/services/business-valuation/case/medical-malpractice/", exists)).toBe("/services/business-valuation");
  });

  it("leaves a declared pair alone (its own shell exists)", () => {
    expect(resolveUndeclaredPairRedirect("/services/business-valuation/case/divorce-and-marital-dissolution", exists)).toBeNull();
    expect(resolveUndeclaredPairRedirect("/services/lost-earnings-and-earning-capacity/case/personal-injury", exists)).toBeNull();
  });

  it("falls through to the 404 for an unknown case type or an unknown pillar", () => {
    expect(resolveUndeclaredPairRedirect("/services/business-valuation/case/no-such-type", exists)).toBeNull();
    expect(resolveUndeclaredPairRedirect("/services/no-such-service/case/personal-injury", exists)).toBeNull();
    expect(resolveUndeclaredPairRedirect("/services/vocational-evaluation/case/personal-injury", exists)).toBeNull();
  });

  it("ignores every path that is not a service x case-type address", () => {
    for (const p of [
      "/", "/services", "/services/business-valuation", "/services/business-valuation/texas",
      "/services/business-valuation/cost", "/services/business-valuation/case",
      "/services/business-valuation/case/personal-injury/extra", "/case-types/personal-injury",
      "/services/business-valuation/Case/personal-injury", "/api/contact",
    ]) {
      expect(resolveUndeclaredPairRedirect(p, exists), p).toBeNull();
    }
  });

  it("covers the whole grid: every undeclared pair redirects to its pillar and every declared pair is live", () => {
    const declared = new Set(serviceCaseTypePairs().map((p) => p.path));
    let redirected = 0;
    for (const s of pillarServices()) {
      for (const c of caseTypes) {
        const path = `/services/${s.slug}/case/${c.slug}`;
        const target = resolveUndeclaredPairRedirect(path, exists);
        if (declared.has(path)) {
          expect(target, path).toBeNull();
        } else {
          expect(target, path).toBe(`/services/${s.slug}`);
          redirected++;
        }
      }
    }
    // 154 combinations less the 60 declared pairs: the 91 the audit found
    // unreachable plus the three the case-type hubs still reference.
    expect(redirected).toBe(94);
  });
});

describe("server.js wires the redirect", () => {
  const serverSrc = readFileSync(join(ROOT, "server.js"), "utf8");

  it("imports the resolver and runs it with the shell-existence check, after the legacy map and before the API routes, GET/HEAD only", () => {
    expect(serverSrc).toContain('import { resolveUndeclaredPairRedirect } from "./lib/service-case-redirects.server.mjs";');
    const legacy = serverSrc.indexOf("resolveLegacyRedirect(url.pathname, prerenderedRouteExists)");
    const pair = serverSrc.indexOf("resolveUndeclaredPairRedirect(url.pathname, prerenderedRouteExists)");
    const api = serverSrc.indexOf("const apiRoute = API_ROUTES[url.pathname];");
    expect(legacy).toBeGreaterThan(-1);
    expect(pair).toBeGreaterThan(legacy);
    expect(api).toBeGreaterThan(pair);
    const block = serverSrc.slice(serverSrc.lastIndexOf("if (isRead) {", pair), pair);
    expect(block).toContain("if (isRead) {");
    expect(serverSrc.slice(pair, api)).toContain("res.writeHead(301, {");
    expect(serverSrc.slice(pair, api)).toContain("Location: pillar + url.search,");
  });
});
