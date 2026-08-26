// src/tools-indexing.routes.test.mjs
// Source-read guard tests (vitest env is "node", no jsdom/RTL - mirrors
// App.routes.test.mjs). On kwlcp.com the ONLY interactive tool is the public,
// indexed life-expectancy lookup; the economic-damages estimator and the
// household-services valuator stay on the sister vocational site and are cross-linked from /tools.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { VOC_SITE_URL } from "./lib/brand.ts";

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel) => readFileSync(join(here, rel), "utf8");

const appSrc = read("App.tsx");
const serverSrc = read("../server.js");
const toolsSrc = read("pages/Tools.tsx");
const leSrc = read("pages/LifeExpectancy.tsx");
const sitemapSrc = read("../scripts/generate-sitemap.mjs");
const prerenderSrc = read("../scripts/prerender.mjs");

const TOOL_ROUTES = ["/tools/life-expectancy"];
const RETIRED_TOOL_ROUTES = [
  "/tools/economic-damages-estimator",
  "/tools/household-services",
  "/tools/household-services/methodology",
];

describe("/tools/life-expectancy is the one registered tool route", () => {
  it("App.tsx lazy-imports LifeExpectancy and registers the route", () => {
    expect(appSrc).toContain('const LifeExpectancy = lazy(() => import("@/pages/LifeExpectancy"));');
    expect(appSrc).toContain('<Route path="/tools/life-expectancy" element={<LifeExpectancy />} />');
  });

  it("App.tsx registers no other /tools/* route", () => {
    const toolPaths = [...appSrc.matchAll(/path="(\/tools[^"]*)"/g)].map((m) => m[1]);
    expect(toolPaths.sort()).toEqual(["/tools", ...TOOL_ROUTES].sort());
  });
});

describe("indexability - the tool route is not client-only/noindex", () => {
  it("server.js never lists the tool routes as client-only", () => {
    for (const route of [...TOOL_ROUTES, ...RETIRED_TOOL_ROUTES]) {
      expect(serverSrc).not.toContain(`"${route}"`);
    }
  });

  it("LifeExpectancy.tsx sets the relative canonical and does not pass noindex", () => {
    expect(leSrc).toContain('canonical: "/tools/life-expectancy"');
    expect(leSrc).not.toMatch(/noindex/);
  });
});

describe("discoverability - sitemap + prerender include the tool route", () => {
  it("generate-sitemap.mjs CORE lists it", () => {
    for (const route of TOOL_ROUTES) {
      expect(sitemapSrc, `sitemap CORE missing ${route}`).toContain(`"${route}"`);
    }
  });

  it("prerender.mjs corePages has an entry for it", () => {
    for (const route of TOOL_ROUTES) {
      expect(prerenderSrc, `prerender corePages missing ${route}`).toContain(`path: "${route}"`);
    }
  });
});

describe("Tools hub lists only the life expectancy calculator and cross-links the sister site's tools", () => {
  it("Tools.tsx links the life-expectancy tool and none of the retired ones", () => {
    expect(toolsSrc).toContain('to="/tools/life-expectancy"');
    for (const route of RETIRED_TOOL_ROUTES) {
      expect(toolsSrc, `Tools.tsx still links ${route}`).not.toContain(`to="${route}"`);
    }
  });

  it("Tools.tsx links the sister site's /tools for the economic calculators", () => {
    expect(toolsSrc).toContain(`href="${VOC_SITE_URL}/tools"`);
  });
});
