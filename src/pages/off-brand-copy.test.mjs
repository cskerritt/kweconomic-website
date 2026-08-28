// Guard: rendered page/component copy must stay in economics framing. The
// sister-practice phrases below are the tells that a vocational-site or
// life-care-planning-site line was carried over unedited. CrossSell.tsx is the
// one deliberate hand-off to the sister practices and is allowed to name them.
//
// The same guard walks src/data (journeys, case types, services, guides ...)
// because that copy renders on thousands of prerendered pages, including the
// FAQPage JSON-LD. Allowances there are deliberate and narrow:
//   - src/data/team.ts: biographies may name a background credential or body.
//   - src/data/services.ts, the life-care-plan-cost-projection entry only: the
//     one service that costs a plan someone else authored may name its author.
//   - src/data/comparisons.ts, the two entries that compare the economist with
//     the sister disciplines (forensic-economist-vs-vocational-expert and
//     economist-vs-life-care-planner).
// Entry-level allowances cover the lines from the entry's `slug:` line up to
// the next `slug:` line. Hand-offs elsewhere say "vocational specialist"
// (at most one line per journey stage) so the dist grep for "vocational
// expert" stays at zero.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ALLOW = new Set(["src/components/CrossSell.tsx"]);
const DATA_ALLOW_FILES = new Set(["src/data/team.ts"]);
const DATA_ALLOW_ENTRIES = {
  "src/data/services.ts": new Set(["life-care-plan-cost-projection"]),
  "src/data/comparisons.ts": new Set(["forensic-economist-vs-vocational-expert", "economist-vs-life-care-planner"]),
};
const HANDOFF_LINE = /coordinated? with (a|the) vocational specialist/;
const PATTERN =
  /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i;
const SLUG_LINE = /^\s*slug:\s*"([^"]+)"/;

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
    const allowedEntries = DATA_ALLOW_ENTRIES[p];
    let inAllowedEntry = false;
    const lines = readFileSync(p, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (allowedEntries) {
        const slug = line.match(SLUG_LINE)?.[1];
        if (slug !== undefined) inAllowedEntry = allowedEntries.has(slug);
        if (inAllowedEntry) return;
      }
      if (PATTERN.test(line)) offenders.push(`${p}:${i + 1}: ${line.trim().slice(0, 160)}`);
    });
  }
  return offenders;
}

describe("page and component copy is economics-framed", () => {
  it("no rendered source under src/pages or src/components carries sister-practice phrasing", () => {
    const files = [...walk("src/pages"), ...walk("src/components")].filter(
      (p) => /\.(tsx?|mjs)$/.test(p) && !/\.test\./.test(p) && !ALLOW.has(p),
    );
    expect(offendersIn(files)).toEqual([]);
  });

  it("no data file under src/data carries sister-practice phrasing outside the carve-outs (journeys, case types, guides ...)", () => {
    const files = walk("src/data").filter(
      (p) => /\.(ts|mjs)$/.test(p) && !/\.(test|d)\./.test(p) && !DATA_ALLOW_FILES.has(p),
    );
    expect(offendersIn(files)).toEqual([]);
  });

  it("the entry carve-outs cover exactly the intended entries", () => {
    for (const [file, slugs] of Object.entries(DATA_ALLOW_ENTRIES)) {
      const present = new Set(
        readFileSync(file, "utf8")
          .split("\n")
          .map((l) => l.match(SLUG_LINE)?.[1])
          .filter(Boolean),
      );
      for (const slug of slugs) expect(present.has(slug), `${file} has no entry ${slug}`).toBe(true);
    }
  });

  it("services.ts carries at most a single vocational hand-off line", () => {
    const hits = readFileSync("src/data/services.ts", "utf8")
      .split("\n")
      .filter((l) => HANDOFF_LINE.test(l));
    expect(hits.length).toBeLessThanOrEqual(1);
  });

  it("journeys.ts hand-off lines are at most one per stage and never link off-site", () => {
    const src = readFileSync("src/data/journeys.ts", "utf8");
    const stages = src.split(/\n  \/\/ ── /).slice(1); // one chunk per stage banner
    expect(stages.length).toBeGreaterThan(0);
    for (const chunk of stages) {
      const hits = chunk.split("\n").filter((l) => HANDOFF_LINE.test(l));
      expect(hits.length).toBeLessThanOrEqual(1);
    }
    expect(src).not.toMatch(/https?:\/\//);
  });
});
