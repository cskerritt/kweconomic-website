// Guard: the new life-expectancy tool obeys the CLAUDE.md content rules
// (objective tone, no stat counts, hyphens only) and carries the required
// educational disclaimer + CDC source citation.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const leSrc = readFileSync(join(here, "LifeExpectancy.tsx"), "utf8");
const engineSrc = readFileSync(join(here, "../../lib/life-expectancy.mjs"), "utf8");
const dataSrc = readFileSync(join(here, "../../lib/life-tables-2023.mjs"), "utf8");

describe("no em/en dashes in any new copy (hyphens only)", () => {
  for (const [name, src] of [
    ["LifeExpectancy.tsx", leSrc],
    ["lib/life-expectancy.mjs", engineSrc],
    ["lib/life-tables-2023.mjs", dataSrc],
  ]) {
    it(`${name} uses no em dash (\\u2014) or en dash (\\u2013)`, () => {
      expect(src).not.toMatch(/[—–]/);
    });
  }
});

describe("objective tone - no advocacy language or stat counts", () => {
  it("LifeExpectancy.tsx has no advocacy phrases", () => {
    for (const phrase of ["maximize", "fight for", "win your case"]) {
      expect(leSrc.toLowerCase()).not.toContain(phrase);
    }
  });

  it("LifeExpectancy.tsx has no stat-count pattern like '25+ years'", () => {
    expect(leSrc).not.toMatch(/\d+\s*\+\s*(years|cases)/i);
  });
});

describe("required disclaimer + CDC source citation", () => {
  it("LifeExpectancy.tsx carries the educational disclaimer substrings", () => {
    expect(leSrc).toContain("not an expert opinion, report, or testimony");
    expect(leSrc).toContain("not a prediction for any individual");
  });

  it("LifeExpectancy.tsx cites the CDC United States Life Tables, 2023", () => {
    expect(leSrc).toContain("United States Life Tables, 2023");
  });
});
