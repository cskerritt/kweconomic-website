import { describe, it, expect } from "vitest";
import { createStore, ageToBand } from "./store.mjs";

// Ported from the KW-Household-Services-Valuator pipeline (tests/datastore.test.js).
// The Node original wrote fixture JSON to disk and passed a dataDir; the browser
// port takes the three parsed docs directly, so the fixtures are plain objects.
const CELL = "female|35-44|full_time|married|under_6";
const hours = { food_prep: { mean: 1, se: 0.1 }, childcare_care: { mean: 2, se: 0.1 } };

const atus = {
  meta: { years: [2023], sample_floor: 50 },
  activities: [
    { key: "food_prep", label: "Food Prep" },
    { key: "childcare_care", label: "Childcare" },
  ],
  dimensions: {
    sex: ["male", "female"],
    age_band: ["35-44"],
    employment: ["full_time"],
    married: ["married", "single"],
    youngest_child: ["none", "under_6", "6-17"],
  },
  cells: {
    [CELL]: { n: 400, thin: false, hours },
    "male|35-44|full_time|married|under_6": { n: 10, thin: true, hours },
  },
  rollups: {
    "male|35-44|full_time|married|*": { n: 300, thin: false, hours },
    "male|35-44|full_time|*|*": { n: 900, thin: false, hours },
  },
};
const oews = {
  meta: { vintage: "May 2024" },
  occupations: {
    "35-2013": { title: "Cooks" },
    "39-9011": { title: "Childcare Workers" },
    "37-2012": { title: "Maids" },
  },
  areas: [
    { code: "US", name: "United States", type: "national" },
    { code: "S:RI", name: "Rhode Island", type: "state" },
    { code: "M:39300", name: "Providence-Warwick, RI-MA", type: "msa", state: "RI" },
  ],
  wages: {
    US: {
      "35-2013": { mean: 18, median: 17 },
      "39-9011": { mean: 15, median: 14 },
      "37-2012": { mean: 16, median: 15 },
    },
    "S:RI": { "35-2013": { mean: 20, median: 19 }, "37-2012": { mean: 18, median: 17 } },
    "M:39300": { "37-2012": { mean: 19, median: 18 } },
  },
};
const crosswalk = {
  generalist: "37-2012",
  activities: { food_prep: { soc: ["35-2013"] }, childcare_care: { soc: ["39-9011"] } },
};

const build = () => createStore(atus, oews, crosswalk);

describe("store", () => {
  it("finds exact non-thin cell", () => {
    const f = build().findCell({
      sex: "female",
      age_band: "35-44",
      employment: "full_time",
      married: "married",
      youngest_child: "under_6",
    });
    expect(f.cellKey).toBe(CELL);
    expect(f.rollup).toBe(null);
    expect(f.thin).toBe(false);
  });
  it("thin cell rolls up to child-collapsed rollup", () => {
    const f = build().findCell({
      sex: "male",
      age_band: "35-44",
      employment: "full_time",
      married: "married",
      youngest_child: "under_6",
    });
    expect(f.rollup).toBe("child");
    expect(f.entry.n).toBe(300);
  });
  it("allowThin returns the thin exact cell instead of rolling up", () => {
    const f = build().findCell(
      { sex: "male", age_band: "35-44", employment: "full_time", married: "married", youngest_child: "under_6" },
      { allowThin: true },
    );
    expect(f.rollup).toBe(null);
    expect(f.thin).toBe(true);
    expect(f.entry.n).toBe(10);
  });
  it("resolveWages walks msa→state→US and reports fallback", () => {
    const w = build().resolveWages("M:39300", "mean");
    expect(w["37-2012"]).toMatchObject({ value: 19, fallback: null });
    expect(w["35-2013"]).toMatchObject({ value: 20, areaName: "Rhode Island", fallback: "msa→state" });
    expect(w["39-9011"]).toMatchObject({ value: 15, fallback: "msa→national" });
  });
  it("lookup composes cell + wages + valuation with meta", () => {
    const r = build().lookup({
      sex: "female",
      age_band: "35-44",
      employment: "full_time",
      married: "married",
      youngest_child: "under_6",
      area: "S:RI",
      wageStat: "mean",
    });
    expect(r.valuation.totals.occupation.daily).toBe(50); // 1×20 + 2×15(US fallback)
    expect(r.meta.oews.vintage).toBe("May 2024");
    expect(r.cell.n).toBe(400);
  });
  it("lookup rejects invalid enums", () => {
    expect(() =>
      build().lookup({
        sex: "x",
        age_band: "35-44",
        employment: "full_time",
        married: "married",
        youngest_child: "none",
        area: "US",
        wageStat: "mean",
      }),
    ).toThrow(/sex/);
  });
  it("areas() exposes the OEWS area list", () => {
    expect(build().areas().map((a) => a.code)).toEqual(["US", "S:RI", "M:39300"]);
  });
});

describe("ageToBand", () => {
  it("maps ages to the seven canonical bands", () => {
    expect(ageToBand(18)).toBe("18-24");
    expect(ageToBand(24)).toBe("18-24");
    expect(ageToBand(30)).toBe("25-34");
    expect(ageToBand(40)).toBe("35-44");
    expect(ageToBand(54)).toBe("45-54");
    expect(ageToBand(60)).toBe("55-64");
    expect(ageToBand(70)).toBe("65-74");
    expect(ageToBand(75)).toBe("75+");
    expect(ageToBand(103)).toBe("75+");
  });
  it("returns null below the adult frame or for non-numbers", () => {
    expect(ageToBand(17)).toBe(null);
    expect(ageToBand(NaN)).toBe(null);
    expect(ageToBand("")).toBe(null);
  });
});
