import { describe, it, expect } from "vitest";
import {
  parseISODate,
  daysBetween,
  anniversary,
  exactAge,
  lifeExpectancy,
  computeLifeExpectancy,
  GROUPS,
  SEXES,
  MAX_TABLE_AGE,
  EDITION,
} from "./life-expectancy.mjs";
import { LIFE_TABLES } from "./life-tables-2023.mjs";

const d = (s) => parseISODate(s);

describe("parseISODate", () => {
  it("accepts a real leap day and rejects impossible / malformed dates", () => {
    expect(parseISODate("2000-02-29")).toBeInstanceOf(Date);
    expect(parseISODate("2001-02-29")).toBe(null); // 2001 is a common year
    expect(parseISODate("2023-02-30")).toBe(null); // Date would roll over
    expect(parseISODate("2023-13-01")).toBe(null);
    expect(parseISODate("garbage")).toBe(null);
    expect(parseISODate("")).toBe(null);
  });
});

describe("exactAge (golden set ported from the public-domain calc reference)", () => {
  it("exact birthday is a whole number", () => {
    expect(exactAge(d("1980-07-02"), d("2026-07-02"))).toEqual({
      years: 46,
      months: 0,
      days: 0,
      decimal: 46,
    });
  });

  it("the day before a birthday is just under the next year", () => {
    const a = exactAge(d("1980-07-02"), d("2026-07-01"));
    expect(a.years).toBe(45);
    expect(a.decimal).toBeGreaterThan(45.99);
    expect(a.decimal).toBeLessThan(46);
  });

  it("a newborn six months in is about 0.5", () => {
    const a = exactAge(d("2026-01-01"), d("2026-07-02"));
    expect(a.years).toBe(0);
    expect(a.decimal).toBeGreaterThan(0.49);
    expect(a.decimal).toBeLessThan(0.51);
  });

  it("a half-year past a birthday is about x.5", () => {
    const a = exactAge(d("1980-01-01"), d("2026-07-02"));
    expect(a.years).toBe(46);
    expect(Math.abs(a.decimal - 46.5)).toBeLessThan(0.01);
  });

  it("a Feb 29 birthday resolves to Feb 28 in a common year", () => {
    const a = exactAge(d("2000-02-29"), d("2026-03-01"));
    expect(a.years).toBe(26);
    expect(a.months).toBe(0);
    expect(a.days).toBe(1);
  });

  it("a date of birth after the as-of date returns null", () => {
    expect(exactAge(d("2026-07-03"), d("2026-07-02"))).toBe(null);
  });

  it("daysBetween and anniversary behave", () => {
    expect(daysBetween(d("2026-01-01"), d("2026-01-31"))).toBe(30);
    expect(anniversary(d("2000-02-29"), 2025).getMonth()).toBe(1); // February
    expect(anniversary(d("2000-02-29"), 2025).getDate()).toBe(28); // common year -> Feb 28
  });
});

describe("lifeExpectancy - published integer ages use the CDC value verbatim", () => {
  it("all/total e0 and e65 match Table 1", () => {
    const ex = LIFE_TABLES.all.total.ex;
    const r0 = lifeExpectancy(ex, 0);
    expect(r0.le).toBe(78.4);
    expect(r0.interpolated).toBe(false);
    const r65 = lifeExpectancy(ex, 65);
    expect(r65.le).toBe(19.5);
    expect(r65.interpolated).toBe(false);
  });

  it("returns null for a negative age", () => {
    expect(lifeExpectancy(LIFE_TABLES.all.total.ex, -1)).toBe(null);
  });

  it("caps at age 100 and beyond ('100 and older'), no interpolation", () => {
    const ex = LIFE_TABLES.all.male.ex; // Table 2
    const capped = lifeExpectancy(ex, 104.3);
    expect(capped.le).toBe(ex[MAX_TABLE_AGE]); // 2.0
    expect(capped.capped).toBe(true);
    expect(capped.interpolated).toBe(false);
    const boundary = lifeExpectancy(ex, 100);
    expect(boundary.le).toBe(ex[MAX_TABLE_AGE]);
    expect(boundary.capped).toBe(true);
  });
});

// The 12+ golden interpolation/spot cases. Because this engine reuses the CDC
// tables and the source interpolation math unchanged, these equal the reference
// tool's own outputs. `le` is asserted to high precision (floating-point exact),
// and every case cross-checks against the same lo + frac*(hi-lo) formula.
describe("lifeExpectancy - 12+ golden spot cases across groups, sexes, ages, and edges", () => {
  const CASES = [
    // group, sex, age, expectedLE, table, interpolated, capped
    ["all", "total", 0, 78.4, 1, false, false],
    ["all", "total", 65, 19.5, 1, false, false],
    ["all", "total", 65.5, 19.15, 1, true, false],
    ["all", "total", 40, 40.7, 1, false, false],
    ["all", "total", 0.5, 78.15, 1, true, false],
    ["all", "female", 45.5, 37.55, 3, true, false],
    ["all", "male", 104.3, 2.0, 2, false, true],
    ["all", "male", 100, 2.0, 2, false, true],
    ["hispanic", "female", 0, 84.0, 6, false, false],
    ["aian", "total", 30, 42.8, 7, false, false],
    ["asian", "male", 50.5, 34.65, 11, true, false],
    ["black", "female", 20, 58.9, 15, false, false],
    ["white", "total", 99.4, 2.22, 16, true, false],
    ["white", "total", 80.25, 8.95, 16, true, false],
  ];

  it.each(CASES)(
    "%s/%s @ %f -> %f years (table %i)",
    (group, sex, age, expectedLE, table, interpolated, capped) => {
      const ex = LIFE_TABLES[group][sex].ex;
      const r = lifeExpectancy(ex, age);
      // Matches the published literal to well within a rounding tolerance...
      expect(r.le).toBeCloseTo(expectedLE, 6);
      // ...and equals the interpolation formula on the actual data exactly.
      const lo = Math.floor(age);
      const frac = age - lo;
      const manual =
        age >= MAX_TABLE_AGE ? ex[MAX_TABLE_AGE] : frac === 0 ? ex[lo] : ex[lo] + frac * (ex[lo + 1] - ex[lo]);
      expect(r.le).toBe(manual);
      expect(r.interpolated).toBe(interpolated);
      expect(r.capped).toBe(capped);
      if (interpolated) {
        expect(r.loAge).toBe(lo);
        expect(r.hiAge).toBe(lo + 1);
      }
      expect(LIFE_TABLES[group][sex].table).toBe(table);
    },
  );
});

describe("computeLifeExpectancy - display-ready result plus citation meta", () => {
  it("resolves group/sex, returns remaining LE, expected age, table, and edition", () => {
    const r = computeLifeExpectancy({ group: "all", sex: "total", ageDecimal: 40 });
    expect(r.remainingLE).toBe(40.7);
    expect(r.expectedAgeAtEnd).toBeCloseTo(80.7, 6);
    expect(r.table).toBe(1);
    expect(r.edition.year).toBe(2023);
    expect(r.group).toBe("all");
    expect(r.sex).toBe("total");
  });

  it("returns null for an unknown group/sex or a negative age", () => {
    expect(computeLifeExpectancy({ group: "nope", sex: "total", ageDecimal: 40 })).toBe(null);
    expect(computeLifeExpectancy({ group: "all", sex: "other", ageDecimal: 40 })).toBe(null);
    expect(computeLifeExpectancy({ group: "all", sex: "total", ageDecimal: -1 })).toBe(null);
  });

  it("caps computeLifeExpectancy at the top of the table", () => {
    const r = computeLifeExpectancy({ group: "all", sex: "total", ageDecimal: 130 });
    expect(r.capped).toBe(true);
    expect(r.remainingLE).toBe(LIFE_TABLES.all.total.ex[MAX_TABLE_AGE]);
  });
});

describe("data integrity - LIFE_TABLES matches CDC NVSR 74-06", () => {
  it("has exactly 18 leaf tables, each with length-101 ex/lx and table in 1..18", () => {
    let n = 0;
    const tableNumbers = new Set();
    for (const sexes of Object.values(LIFE_TABLES)) {
      for (const t of Object.values(sexes)) {
        expect(t.ex).toHaveLength(101);
        expect(t.lx).toHaveLength(101);
        expect(t.table).toBeGreaterThanOrEqual(1);
        expect(t.table).toBeLessThanOrEqual(18);
        tableNumbers.add(t.table);
        n += 1;
      }
    }
    expect(n).toBe(18);
    expect(tableNumbers.size).toBe(18);
  });

  it("e0 grid matches the printed report", () => {
    const expectedE0 = {
      all: { total: 78.4, male: 75.8, female: 81.1 },
      hispanic: { total: 81.3, male: 78.5, female: 84.0 },
      aian: { total: 70.1, male: 66.7, female: 73.5 },
      asian: { total: 85.2, male: 83.2, female: 87.1 },
      black: { total: 74.0, male: 70.3, female: 77.6 },
      white: { total: 78.4, male: 76.0, female: 80.9 },
    };
    for (const [group, sexes] of Object.entries(expectedE0)) {
      for (const [sex, e0] of Object.entries(sexes)) {
        expect(LIFE_TABLES[group][sex].ex[0]).toBe(e0);
      }
    }
  });

  it("lx starts at 100,000 for every table", () => {
    for (const sexes of Object.values(LIFE_TABLES)) {
      for (const t of Object.values(sexes)) {
        expect(t.lx[0]).toBe(100000);
      }
    }
  });

  it("ex does not rise after age 1 (allowing the infant-mortality bump at 0->1)", () => {
    for (const sexes of Object.values(LIFE_TABLES)) {
      for (const t of Object.values(sexes)) {
        for (let a = 1; a < MAX_TABLE_AGE; a++) {
          expect(t.ex[a + 1]).toBeLessThan(t.ex[a] + 0.05);
        }
      }
    }
  });
});

describe("option metadata for the UI", () => {
  it("exposes 6 groups, 3 sexes, MAX_TABLE_AGE, and the edition citation", () => {
    expect(GROUPS).toHaveLength(6);
    expect(GROUPS.map((g) => g.value)).toEqual(["all", "hispanic", "aian", "asian", "black", "white"]);
    expect(SEXES.map((s) => s.value)).toEqual(["total", "female", "male"]);
    expect(MAX_TABLE_AGE).toBe(100);
    expect(EDITION.series).toContain("Vol. 74, No. 6");
    // Every group/sex option resolves to a real table.
    for (const g of GROUPS) for (const s of SEXES) expect(LIFE_TABLES[g.value][s.value]).toBeTruthy();
  });
});
