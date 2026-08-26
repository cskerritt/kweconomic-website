import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ALLOW = new Set([
  "src/lib/brand.ts",
  "src/components/CrossSell.tsx",
  "src/pages/Tools.tsx",
  "src/brand-strings.test.mjs",
]);
const PATTERN = /KWVRS|kwvrs\.com|Kincaid Wolstein/;
function walk(dir, out = []) { for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; }

describe("brand strings are centralized", () => {
  it("no src file outside the allow-list names the vocational brand", () => {
    const offenders = walk("src").filter((p) => !ALLOW.has(p) && PATTERN.test(readFileSync(p, "utf8")));
    expect(offenders).toEqual([]);
  });
  it("no file references the old domain in scripts, server, or public text", () => {
    const files = [...walk("scripts"), "server.js", "index.html", "public/llms.txt", "public/robots.txt", "public/manifest.json"].filter((p) => !/\.test\./.test(p) && !p.endsWith(".png") && !p.endsWith(".jpg") && !p.endsWith(".webp"));
    const offenders = files.filter((p) => { try { return /kwvrs\.com/.test(readFileSync(p, "utf8")); } catch { return false; } });
    expect(offenders).toEqual([]);
  });
});
