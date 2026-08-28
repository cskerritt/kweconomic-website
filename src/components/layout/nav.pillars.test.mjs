// Guard: the static service-link arrays in Header.tsx and Footer.tsx must
// list exactly the pillar services from src/data/services.ts, in file order.
// They are hand-maintained for render speed; this test is what keeps them
// from drifting when a pillar is added, renamed, or reordered. Source-read
// (vitest env is "node"), via the same text reader the build scripts use.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pillarServiceSlugs } from "../../../scripts/lib/service-slugs.mjs";

const expected = pillarServiceSlugs(readFileSync("src/data/services.ts", "utf8")).map((s) => `/services/${s}`);

/** hrefs inside `const serviceLinks = [ ... ];`, excluding the "/services" index link. */
function serviceHrefs(file) {
  const src = readFileSync(file, "utf8");
  const block = src.match(/const serviceLinks = \[([\s\S]*?)\n\];/);
  if (!block) throw new Error(`${file}: no serviceLinks array`);
  return [...block[1].matchAll(/href: "([^"]+)"/g)].map((m) => m[1]).filter((h) => h !== "/services");
}

describe("header/footer service links track pillarServices()", () => {
  it("services.ts exposes the 11 pillar slugs", () => {
    expect(expected).toHaveLength(11);
  });
  it("Header.tsx serviceLinks match pillar slugs in order", () => {
    expect(serviceHrefs("src/components/layout/Header.tsx")).toEqual(expected);
  });
  it("Footer.tsx serviceLinks match pillar slugs in order", () => {
    expect(serviceHrefs("src/components/layout/Footer.tsx")).toEqual(expected);
  });
});
