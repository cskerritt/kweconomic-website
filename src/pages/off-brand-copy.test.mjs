// Guard: rendered page/component copy must stay in life-care-planning framing.
// The vocational-site phrases below are the tells that a kwvrs-site line was
// carried over unedited. CrossSell.tsx is the one deliberate hand-off to the
// sister vocational practice and is allowed to name that work.
//
// The same guard walks src/data (journeys, case types, services, guides ...)
// because that copy renders on thousands of prerendered pages, including the
// FAQPage JSON-LD. Allowances there are deliberate and narrow:
//   - src/data/team.ts: biographies may name a vocational body or degree.
//   - src/data/credentials.ts: the crc/cdms entries describe rehabilitation
//     counseling credentials.
// Hand-offs to the sister practice say "vocational specialist" (services.ts
// workers' compensation entry; at most one line per journey stage) so the
// dist grep for "vocational expert" stays at zero.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ALLOW = new Set(["src/components/CrossSell.tsx"]);
const DATA_ALLOW_FILES = new Set(["src/data/team.ts", "src/data/credentials.ts"]);
const HANDOFF_LINE = /coordinated? with (a|the) vocational specialist/;
const PATTERN =
  /vocational expert|vocational rehabilitation|earning capacity|transferable skills|labor market/i;

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

function offendersIn(files) {
  const offenders = [];
  for (const p of files) {
    const lines = readFileSync(p, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) offenders.push(`${p}:${i + 1}: ${line.trim().slice(0, 160)}`);
    });
  }
  return offenders;
}

describe("page and component copy is LCP-framed", () => {
  it("no rendered source under src/pages or src/components carries vocational-site phrasing", () => {
    const files = [...walk("src/pages"), ...walk("src/components")].filter(
      (p) => /\.(tsx?|mjs)$/.test(p) && !/\.test\./.test(p) && !ALLOW.has(p),
    );
    expect(offendersIn(files)).toEqual([]);
  });

  it("no data file under src/data carries vocational-site phrasing (journeys, case types, guides ...)", () => {
    const files = walk("src/data").filter(
      (p) => /\.(ts|mjs)$/.test(p) && !/\.(test|d)\./.test(p) && !DATA_ALLOW_FILES.has(p),
    );
    expect(offendersIn(files)).toEqual([]);
  });

  it("services.ts carries a single workers' compensation hand-off line", () => {
    const hits = readFileSync("src/data/services.ts", "utf8")
      .split("\n")
      .filter((l) => HANDOFF_LINE.test(l));
    expect(hits.length).toBeLessThanOrEqual(1);
  });

  it("journeys.ts hand-off lines are at most one per stage and never link off-site", () => {
    const src = readFileSync("src/data/journeys.ts", "utf8");
    const stages = src.split(/\n  \/\/ ── /).slice(1); // one chunk per stage banner
    for (const chunk of stages) {
      const hits = chunk.split("\n").filter((l) => HANDOFF_LINE.test(l));
      expect(hits.length).toBeLessThanOrEqual(1);
    }
    expect(src).not.toMatch(/kwvrs\.com/);
  });
});
