// src/tools-indexing.routes.test.mjs
// Source-read guard tests (vitest env is "node", no jsdom/RTL - mirrors
// App.routes.test.mjs). Pins the two indexing changes:
//   Track A: /tools/household-services (+ methodology) are now PUBLIC (dropped
//            from CLIENT_ONLY_ROUTES + noindex, added to sitemap + prerender).
//   Track B: /tools/life-expectancy is a NEW public, indexed tool.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(join(here, rel), "utf8");

const appSrc = read("App.tsx");
const serverSrc = read("../server.js");
const toolsSrc = read("pages/Tools.tsx");
const leSrc = read("pages/LifeExpectancy.tsx");
const hsvSrc = read("pages/HouseholdServicesValuator.tsx");
const hsvMethSrc = read("pages/HouseholdServicesMethodology.tsx");
const sitemapSrc = read("../scripts/generate-sitemap.mjs");
const prerenderSrc = read("../scripts/prerender.mjs");

const NEW_ROUTES = [
  "/tools/life-expectancy",
  "/tools/household-services",
  "/tools/household-services/methodology",
];

describe("Track B - /tools/life-expectancy is a registered SPA route", () => {
  it("App.tsx lazy-imports LifeExpectancy and registers the route", () => {
    expect(appSrc).toContain('const LifeExpectancy = lazy(() => import("@/pages/LifeExpectancy"));');
    expect(appSrc).toContain('<Route path="/tools/life-expectancy" element={<LifeExpectancy />} />');
  });
});

describe("indexability - none of the three tool routes are client-only/noindex", () => {
  it("server.js CLIENT_ONLY_ROUTES no longer lists household-services and never listed life-expectancy", () => {
    expect(serverSrc).not.toContain('"/tools/household-services"');
    expect(serverSrc).not.toContain('"/tools/household-services/methodology"');
    expect(serverSrc).not.toContain('"/tools/life-expectancy"');
  });

  it("LifeExpectancy.tsx sets the relative canonical and does not pass noindex", () => {
    expect(leSrc).toContain('canonical: "/tools/life-expectancy"');
    expect(leSrc).not.toMatch(/noindex/);
  });

  it("the household pages no longer pass noindex", () => {
    expect(hsvSrc).not.toContain("noindex: true");
    expect(hsvMethSrc).not.toContain("noindex: true");
  });
});

describe("discoverability - sitemap + prerender include all three tool routes", () => {
  it("generate-sitemap.mjs CORE lists all three", () => {
    for (const route of NEW_ROUTES) {
      expect(sitemapSrc, `sitemap CORE missing ${route}`).toContain(`"${route}"`);
    }
  });

  it("prerender.mjs corePages has an entry for each of the three", () => {
    for (const route of NEW_ROUTES) {
      expect(prerenderSrc, `prerender corePages missing ${route}`).toContain(`path: "${route}"`);
    }
  });
});

describe("Tools hub lists the life expectancy calculator in a 3-up grid", () => {
  it("Tools.tsx links the new tool and widens the grid to 3 columns", () => {
    expect(toolsSrc).toContain('to="/tools/life-expectancy"');
    expect(toolsSrc).toContain("md:grid-cols-3");
  });
});
