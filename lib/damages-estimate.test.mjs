import { describe, it, expect } from "vitest";
import { calculateEconomicDamages, DEMO_SCENARIO, roundMoney, uncertaintyBand } from "./damages-estimate.mjs";

describe("calculateEconomicDamages (golden values from the original CLI)", () => {
  it("reproduces the demo scenario exactly", () => {
    const r = calculateEconomicDamages(DEMO_SCENARIO);
    expect(r.lineItems.totals.lostEarnings).toBe(2269224.26);
    expect(r.lineItems.totals.futureSpecials).toBe(1562000);
    expect(r.lineItems.totals.totalEconomicDamages).toBe(3831224.26);
    expect(r.lineItems.totals.uncertaintyBand).toEqual({
      low: 3256540.62,
      mid: 3831224.26,
      high: 4597469.11,
    });
  });

  it("infers worklife years from ages when not supplied", () => {
    const r = calculateEconomicDamages({ annualIncome: 50000, currentAge: 60, retirementAge: 65 });
    expect(r.assumptions.worklifeLossYears).toBe(5);
    expect(r.lineItems.future.presentValueFutureEarnedIncome).toBeGreaterThan(0);
  });

  it("handles an all-zero scenario without NaN", () => {
    const r = calculateEconomicDamages({ annualIncome: 0 });
    expect(r.lineItems.totals.totalEconomicDamages).toBe(0);
    expect(Number.isFinite(r.lineItems.totals.uncertaintyBand.high)).toBe(true);
  });

  it("rejects negative rates loudly", () => {
    expect(() => calculateEconomicDamages({ annualIncome: 50000, discountRate: -0.02 })).toThrow(/discountRate/);
    expect(() => calculateEconomicDamages({ annualIncome: 50000, inflationRateFuture: -1 })).toThrow(/inflationRateFuture/);
  });

  it("past multiplier scales past loss (partial capacity)", () => {
    const full = calculateEconomicDamages({ annualIncome: 100000, lossBeforeFileInjuryYears: 1, pastWageMultiplier: 1 });
    const half = calculateEconomicDamages({ annualIncome: 100000, lossBeforeFileInjuryYears: 1, pastWageMultiplier: 0.5 });
    expect(half.lineItems.past.pastEconomicLoss).toBeCloseTo(full.lineItems.past.pastEconomicLoss / 2, 2);
  });
});

describe("helpers", () => {
  it("roundMoney rounds to cents", () => {
    expect(roundMoney(1.005)).toBe(1.01);
  });
  it("uncertaintyBand applies default multipliers", () => {
    expect(uncertaintyBand(100)).toEqual({ low: 85, mid: 100, high: 120 });
  });
});
