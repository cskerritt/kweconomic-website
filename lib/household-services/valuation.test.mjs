import { describe, it, expect } from "vitest";
import { computeValuation } from "./valuation.mjs";

// Ported from the KW-Household-Services-Valuator pipeline (tests/valuation.test.js).
const activities = [
  { key: "food_prep", label: "Food Preparation & Cleanup" },
  { key: "childcare_care", label: "Childcare - Physical & Developmental Care" },
];
const crosswalk = {
  generalist: "37-2012",
  activities: { food_prep: { soc: ["35-2013"] }, childcare_care: { soc: ["39-9011"] } },
};
const cellEntry = {
  n: 400,
  thin: false,
  hours: { food_prep: { mean: 1.0, se: 0.05 }, childcare_care: { mean: 2.0, se: 0.1 } },
};
const wagesForArea = {
  "35-2013": { value: 20, area: "S:RI", areaName: "Rhode Island", fallback: null, title: "Cooks, Private Household" },
  "39-9011": { value: 15, area: "US", areaName: "United States", fallback: "msa→state→national", title: "Childcare Workers" },
  "37-2012": { value: 18, area: "S:RI", areaName: "Rhode Island", fallback: null, title: "Maids and Housekeeping Cleaners" },
};

describe("computeValuation", () => {
  const r = computeValuation({ cellEntry, activities, crosswalk, wagesForArea, wageStat: "mean" });
  it("per-activity daily/weekly/annual", () => {
    const fp = r.perActivity.find((a) => a.key === "food_prep");
    expect(fp.daily).toBe(20); // 1.0h × $20
    expect(fp.weekly).toBe(140);
    expect(fp.annual).toBe(7305); // 20 × 365.25
    expect(fp.wageFallback).toBe(null);
    const cc = r.perActivity.find((a) => a.key === "childcare_care");
    expect(cc.annual).toBe(10957.5); // 2×15×365.25
    expect(cc.wageFallback).toBe("msa→state→national");
  });
  it("occupation-specific total", () => {
    expect(r.totals.occupation.daily).toBe(50); // 20 + 30
    expect(r.totals.occupation.annual).toBe(18262.5);
  });
  it("generalist total uses generalist rate on ALL hours", () => {
    expect(r.totals.generalist.rate).toBe(18);
    expect(r.totals.generalist.daily).toBe(54); // 3h × 18
  });
  it("composite = hours-weighted blended rate applied to total hours", () => {
    // (1×20 + 2×15)/3 = 16.6667
    expect(r.totals.composite.rate).toBeCloseTo(16.67, 2);
    expect(r.totals.composite.daily).toBeCloseTo(50, 1); // equals occupation total by construction
  });
  it("zero-hour activities carried with zero dollars", () => {
    const r2 = computeValuation({
      cellEntry: { ...cellEntry, hours: { ...cellEntry.hours, food_prep: { mean: 0, se: 0 } } },
      activities,
      crosswalk,
      wagesForArea,
      wageStat: "mean",
    });
    expect(r2.perActivity.find((a) => a.key === "food_prep").annual).toBe(0);
  });
});
