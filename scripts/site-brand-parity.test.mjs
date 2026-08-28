// scripts/lib/site.mjs is the Node-side mirror of src/lib/brand.ts (the build
// scripts cannot import the TS module without vite), and lib/brand.server.mjs
// is the runtime mirror for server.js and the lead mailer (the production image
// copies server.js + lib/ only, never scripts/ or src/). Pin all three so a
// rebrand edit to one file cannot silently leave prerender/sitemaps/llms.txt or
// the lead email on the old identity.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const brandTs = readFileSync(join(ROOT, "src", "lib", "brand.ts"), "utf8");
const siteMjs = readFileSync(join(ROOT, "scripts", "lib", "site.mjs"), "utf8");
const runtimeMjs = readFileSync(join(ROOT, "lib", "brand.server.mjs"), "utf8");

const constOf = (src, name) => {
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*"([^"]*)"`));
  return m ? m[1] : undefined;
};

describe("scripts/lib/site.mjs mirrors src/lib/brand.ts", () => {
  for (const name of ["ORG_NAME", "ORG_SHORT", "SITE_URL", "ORG_PHONE"]) {
    it(`${name} is the same string literal in both files`, () => {
      const ts = constOf(brandTs, name);
      const mjs = constOf(siteMjs, name);
      expect(ts, `${name} missing from brand.ts`).toBeDefined();
      expect(mjs, `${name} missing from site.mjs`).toBeDefined();
      expect(mjs).toBe(ts);
    });
  }
});

describe("lib/brand.server.mjs (runtime image) mirrors the same identity", () => {
  for (const name of ["ORG_NAME", "SITE_URL", "ORG_PHONE"]) {
    it(`${name} matches src/lib/brand.ts`, () => {
      const ts = constOf(brandTs, name);
      const runtime = constOf(runtimeMjs, name);
      expect(ts, `${name} missing from brand.ts`).toBeDefined();
      expect(runtime, `${name} missing from lib/brand.server.mjs`).toBeDefined();
      expect(runtime).toBe(ts);
    });
  }
  // brand.ts derives the display phone with formatPhone(); site.mjs spells it.
  it("ORG_PHONE_DISPLAY matches scripts/lib/site.mjs", () => {
    const mirror = constOf(siteMjs, "ORG_PHONE_DISPLAY");
    const runtime = constOf(runtimeMjs, "ORG_PHONE_DISPLAY");
    expect(mirror).toBeDefined();
    expect(runtime).toBe(mirror);
  });
  it("spells no sister-practice brand or domain (those live only in brand.ts / site.mjs / CrossSell.tsx)", () => {
    expect(runtimeMjs).not.toMatch(/KWVRS|KW LCP|kwlcp|kwvrs\.com|Life Care Planning/);
  });
});
