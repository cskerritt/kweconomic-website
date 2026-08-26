// Guard: rendered page/component copy must stay in life-care-planning framing.
// The vocational-site phrases below are the tells that a kwvrs-site line was
// carried over unedited. CrossSell.tsx is the one deliberate hand-off to the
// sister vocational practice and is allowed to name that work.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ALLOW = new Set(["src/components/CrossSell.tsx"]);
const PATTERN =
  /vocational expert|vocational rehabilitation|earning capacity|transferable skills|labor market/i;

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

describe("page and component copy is LCP-framed", () => {
  it("no rendered source under src/pages or src/components carries vocational-site phrasing", () => {
    const files = [...walk("src/pages"), ...walk("src/components")].filter(
      (p) => /\.(tsx?|mjs)$/.test(p) && !/\.test\./.test(p) && !ALLOW.has(p),
    );
    const offenders = [];
    for (const p of files) {
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (PATTERN.test(line)) offenders.push(`${p}:${i + 1}: ${line.trim()}`);
      });
    }
    expect(offenders).toEqual([]);
  });
});
