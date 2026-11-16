// src/lib/geo-links.parity.test.mjs
// Pins the React geo link mesh's city window (src/lib/geo-links.ts) to the
// prerender pipeline's. The prerenderer decides which service x state x city
// pages exist (the sitemap advertises a readiness-gated subset of them); the
// link mesh must agree with the prerenderer or it links to pages that do not
// exist. Reads the sources as text like the other route guards (.mjs so the
// node fs access stays out of the app typecheck).
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

function extract(file, pattern) {
  const match = read(file).match(pattern);
  expect(
    match,
    `${file} no longer defines the prerendered city window (${pattern}). ` +
      "src/lib/geo-links.ts mirrors that constant; realign them and update this test.",
  ).toBeTruthy();
  return Number(match[1]);
}

describe("SERVICE_CITY_TOP parity with the prerender pipeline", () => {
  const meshTop = extract("src/lib/geo-links.ts", /export const SERVICE_CITY_TOP = (\d+)/);

  it("is the window scripts/lib/routes.mjs enumerates (it calls geo-links' serviceCityCities, no constant of its own)", () => {
    const routes = readFileSync(join(ROOT, "scripts/lib/routes.mjs"), "utf8");
    expect(routes).toContain("serviceCityCities(citiesByState[st.slug] ?? [])");
    expect(routes).toContain("geoLinks.serviceCityCities");
    expect(routes).not.toMatch(/SERVICE_CITY_TOP/);
  });

  it("matches src/data/contentReadiness.ts", () => {
    expect(
      extract("src/data/contentReadiness.ts", /SERVICE_CITY_PRERENDER_TOP = (\d+)/),
    ).toBe(meshTop);
  });
});
