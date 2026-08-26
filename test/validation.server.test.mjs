import { describe, expect, it } from "vitest";
import { validateRoute } from "../validation.server.mjs";

const base = (over = {}) => ({
  email: "sam@firm.com",
  formType: "personal-injury-intake",
  retainingSide: "plaintiff",
  workProducts: ["Vocational Evaluation"],
  ...over,
});

describe("validateRoute turnaround", () => {
  it("rejects an out-of-set turnaround on an intake", () => {
    expect(validateRoute("consultation", base({ turnaround: "asap" }))).toMatch(/turnaround must be Rush or Standard/);
  });

  it("accepts rush", () => {
    expect(validateRoute("consultation", base({ turnaround: "rush" }))).toBeNull();
  });

  it("accepts standard", () => {
    expect(validateRoute("consultation", base({ turnaround: "standard" }))).toBeNull();
  });

  it("accepts an absent turnaround", () => {
    expect(validateRoute("consultation", base())).toBeNull();
  });
});

describe("validateEstimator (via validateRoute type=estimator)", () => {
  const base = { email: "a@b.co", annualIncome: 75000 };
  it("accepts a sane decimal-rate payload", () => {
    expect(validateRoute("estimator", { ...base, annualFringeRate: 0.25, growthRate: 0.028, currentAge: 40, retirementAge: 67 })).toBeNull();
  });
  it("rejects a missing/absurd income", () => {
    expect(validateRoute("estimator", { email: "a@b.co" })).toMatch(/annual income/);
    expect(validateRoute("estimator", { email: "a@b.co", annualIncome: 2e9 })).toMatch(/annual income/);
  });
  it("rejects rates outside the 0..1 decimal scale (percent posted raw)", () => {
    expect(validateRoute("estimator", { ...base, growthRate: 25 })).toMatch(/growthRate/);
    expect(validateRoute("estimator", { ...base, pastWageMultiplier: -0.1 })).toMatch(/pastWageMultiplier/);
  });
  it("rejects impossible ages and periods", () => {
    expect(validateRoute("estimator", { ...base, currentAge: 300 })).toMatch(/currentAge/);
    expect(validateRoute("estimator", { ...base, worklifeLossYears: 200 })).toMatch(/worklifeLossYears/);
  });
  it("still requires a valid email first", () => {
    expect(validateRoute("estimator", { email: "nope", annualIncome: 1 })).toMatch(/valid email/);
  });
});
