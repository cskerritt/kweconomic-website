// scripts/lib/site.mjs is the Node-side mirror of src/lib/brand.ts (the build
// scripts cannot import the TS module without vite). Pin the two so a rebrand
// edit to one file cannot silently leave prerender/sitemaps/llms.txt on the
// old identity.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const brandTs = readFileSync(join(ROOT, "src", "lib", "brand.ts"), "utf8");
const siteMjs = readFileSync(join(ROOT, "scripts", "lib", "site.mjs"), "utf8");

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
