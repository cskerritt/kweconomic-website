// Guard: the sister practices (vocational and life care planning) are spelled
// in exactly two src files - src/lib/brand.ts (the constants) and
// src/components/CrossSell.tsx (the one hand-off card). Everything else reads
// the constants, so a rebrand or a sister-site change is a one-file edit and
// no page, data file, or test can quietly carry the other sites' copy.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LEGACY_BRAND_PATTERN } from "./lib/brand.ts";

const ALLOW = new Set([
  "src/lib/brand.ts",
  "src/lib/brand.test.ts", // pins LEGACY_BRAND_PATTERN against every sister form on purpose
  "src/components/CrossSell.tsx",
  "src/brand-strings.test.mjs",
]);
// KWVRS | kwvrs.com | kwlcp | KW LCP | Kincaid Wolstein Vocational | Life Care Planning
// (the capitalized brand form; "life care plan" as a costing subject is fine).
const PATTERN = LEGACY_BRAND_PATTERN;
// Scripts, server, and public text may spell the sister domains only through
// the Node-side brand mirror (scripts/lib/site.mjs).
const DOMAIN_PATTERN = /kwvrs\.com|kwlcp\.com/;
const DOMAIN_ALLOW = new Set(["scripts/lib/site.mjs"]);

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

describe("brand strings are centralized", () => {
  it("no src file outside the allow-list names a sister brand", () => {
    const offenders = walk("src").filter((p) => !ALLOW.has(p) && PATTERN.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });
  it("no file references a sister domain in scripts, server, or public text", () => {
    const files = [...walk("scripts"), "server.js", "index.html", "public/llms.txt", "public/robots.txt", "public/manifest.json"].filter(
      (p) => !DOMAIN_ALLOW.has(p) && !/\.test\./.test(p) && !/\.(png|jpg|webp)$/.test(p),
    );
    const offenders = files.filter((p) => {
      try {
        return DOMAIN_PATTERN.test(readFileSync(p, "utf8"));
      } catch {
        return false;
      }
    });
    expect(offenders).toEqual([]);
  });
});
