import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { createStore } from "./store.mjs";
import { buildCsv } from "./report-csv.mjs";
import { buildDocxBuffer, buildDocxBlob } from "./report-docx.mjs";
import { buildXlsxBuffer, buildXlsxBlob } from "./report-xlsx.mjs";

// Small self-contained result: food_prep 1.0h @ $20, childcare_care 2.0h @ $15,
// generalist (37-2012) $18 - mirrors valuation.test.mjs so the numbers are known.
const atus = {
  meta: { years: [2019, 2024], sample_floor: 50, citation: "IPUMS ATUS extract." },
  activities: [
    { key: "food_prep", label: "Food Preparation & Cleanup" },
    { key: "childcare_care", label: "Childcare - Physical & Developmental Care" },
  ],
  dimensions: {
    sex: ["male", "female"],
    age_band: ["35-44"],
    employment: ["full_time"],
    married: ["married"],
    youngest_child: ["under_6"],
  },
  cells: {
    "female|35-44|full_time|married|under_6": {
      n: 400,
      thin: false,
      hours: { food_prep: { mean: 1.0, se: 0.05 }, childcare_care: { mean: 2.0, se: 0.1 } },
    },
  },
  rollups: {},
};
const oews = {
  meta: { vintage: "May 2024" },
  occupations: { "35-2013": { title: "Cooks, Private Household" }, "39-9011": { title: "Childcare Workers" }, "37-2012": { title: "Maids and Housekeeping Cleaners" } },
  areas: [{ code: "US", name: "United States", type: "national" }],
  wages: { US: { "35-2013": { mean: 20, median: 18 }, "39-9011": { mean: 15, median: 14 }, "37-2012": { mean: 18, median: 17 } } },
};
const crosswalk = {
  generalist: "37-2012",
  activities: { food_prep: { soc: ["35-2013"] }, childcare_care: { soc: ["39-9011"] } },
};

const store = createStore(atus, oews, crosswalk);
const result = store.lookup({
  sex: "female",
  age: 40,
  age_band: "35-44",
  employment: "full_time",
  married: "married",
  youngest_child: "under_6",
  area: "US",
  wageStat: "mean",
});

describe("buildCsv", () => {
  const csv = buildCsv(result);
  it("has the plan Task-12 header row", () => {
    expect(csv.split(/\r\n/)[0]).toBe(
      "activity,hours_per_day,se,soc,occupation,wage,wage_area,daily,weekly,annual",
    );
  });
  it("emits an activity row with computed dollars", () => {
    // food_prep: 1.0h * $20 = $20 daily; 20 * 365.25 = 7305 annual
    expect(csv).toMatch(/Food Preparation & Cleanup,1\.00,0\.05,35-2013,.*,20\.00,United States,20\.00,140\.00,7305\.00/);
  });
  it("emits the three TOTAL rows and a source comment", () => {
    expect(csv).toContain("TOTAL (occupation-specific)");
    expect(csv).toContain("TOTAL (generalist)");
    expect(csv).toContain("TOTAL (composite)");
    expect(csv).toMatch(/# Source: ATUS 2019-2024 \(IPUMS\); OEWS May 2024/);
  });
});

describe("buildDocx", () => {
  it("produces a non-trivial OOXML (zip) buffer starting with PK", async () => {
    const buf = await buildDocxBuffer(result);
    expect(buf.length).toBeGreaterThan(3000);
    expect(buf.subarray(0, 2).toString("latin1")).toBe("PK");
  });
  it("buildDocxBlob returns a Blob of the same document type", async () => {
    const blob = await buildDocxBlob(result);
    expect(blob).toBeInstanceOf(Blob);
    const head = Buffer.from(await blob.slice(0, 2).arrayBuffer()).toString("latin1");
    expect(head).toBe("PK");
  });
});

describe("buildXlsx", () => {
  it("reopens with exceljs and the Valuation sheet has a live daily formula", async () => {
    const buf = await buildXlsxBuffer(result);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    expect(wb.worksheets.map((w) => w.name)).toEqual(["Inputs", "Hours", "Wages", "Valuation"]);

    const val = wb.getWorksheet("Valuation");
    const daily = val.getCell("D2").value; // food_prep daily
    expect(typeof daily).toBe("object");
    expect(daily.formula).toContain("*");
    expect(daily.result).toBe(20); // round2(1.0 * 20)

    // A totals SUM formula must be present somewhere in column D.
    let sawSum = false;
    val.getColumn("D").eachCell((c) => {
      if (c.value && typeof c.value === "object" && /SUM\(/i.test(c.value.formula || "")) sawSum = true;
    });
    expect(sawSum).toBe(true);
  });
  it("buildXlsxBlob returns a spreadsheet Blob", async () => {
    const blob = await buildXlsxBlob(result);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toMatch(/spreadsheetml/);
  });
});
