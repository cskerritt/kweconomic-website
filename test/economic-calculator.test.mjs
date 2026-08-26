import { describe, expect, it } from "vitest";
import {
  calculateEconomicDamages,
  parseArgs,
  resolveScenario,
} from "../scripts/economic-damages-calculator.mjs";

// Importing the module must NOT run the CLI (no demo print / process.exit) - the
// isMain guard gates that. If it ran, this suite would emit the demo report.

describe("economic-damages-calculator arg parsing", () => {
  it("parses --demo as a flag", () => {
    expect(parseArgs(["--demo"])).toEqual({ demo: true });
  });

  it("parses --input <path> as a value", () => {
    expect(parseArgs(["--input", "scenario.json"])).toEqual({ input: "scenario.json" });
  });

  it("treats a valueless --input as a boolean flag (no following value)", () => {
    expect(parseArgs(["--input"])).toEqual({ input: true });
  });
});

describe("resolveScenario", () => {
  it("returns the demo scenario for --demo", () => {
    expect(resolveScenario({ demo: true }).scenarioName).toMatch(/Demo/);
  });

  it("throws a friendly error when --input has no path", () => {
    expect(() => resolveScenario({ input: true })).toThrow(/--input requires a file path/);
  });

  it("throws a friendly error when the --input file is missing", () => {
    expect(() => resolveScenario({ input: "/no/such/scenario.json" })).toThrow(/cannot read --input file/);
  });
});

describe("calculateEconomicDamages rate validation", () => {
  const base = {
    annualIncome: 60000,
    growthRate: 0.02,
    discountRate: 0.02,
    inflationRateFuture: 0.02,
    currentAge: 40,
    retirementAge: 65,
    worklifeLossYears: 10,
    medicalsFuture: 1000,
  };

  it("computes a finite, positive total for a valid scenario", () => {
    const report = calculateEconomicDamages(base);
    expect(report.lineItems.totals.totalEconomicDamages).toBeGreaterThan(0);
    expect(Number.isFinite(report.lineItems.totals.totalEconomicDamages)).toBe(true);
  });

  it("rejects a negative inflationRateFuture (previously unvalidated)", () => {
    expect(() => calculateEconomicDamages({ ...base, inflationRateFuture: -0.5 })).toThrow(
      /Invalid value for inflationRateFuture/,
    );
  });

  it("rejects a negative discountRate", () => {
    expect(() => calculateEconomicDamages({ ...base, discountRate: -0.01 })).toThrow(
      /Invalid value for discountRate/,
    );
  });
});
