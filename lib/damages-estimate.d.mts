export interface DamagesScenario {
  scenarioName?: string;
  annualIncome?: number;
  annualFringeRate?: number;
  currentAge?: number;
  retirementAge?: number;
  worklifeLossYears?: number;
  lossBeforeFileInjuryYears?: number;
  pastWageMultiplier?: number;
  growthRate?: number;
  discountRate?: number;
  inflationRateFuture?: number;
  preDisabilityIncome?: number;
  medicalsPast?: number;
  medicalsFuture?: number;
  attendantCarePast?: number;
  attendantCareFuture?: number;
  otherPast?: number;
  otherFuture?: number;
}

export interface DamagesReport {
  scenarioName: string;
  assumptions: {
    annualIncome: number;
    annualFringeRate: number;
    growthRate: number;
    discountRate: number;
    inflationRateFuture: number;
    worklifeLossYears: number;
    currentAge: number;
    retirementAge: number;
  };
  lineItems: {
    past: { pastEconomicLoss: number; pastMedicalAndOther: number };
    future: {
      presentValueFutureEarnedIncome: number;
      presentValueFutureMedicals: number;
      presentValueFutureAttendantCare: number;
      presentValueFutureOther: number;
    };
    totals: {
      lostEarnings: number;
      futureSpecials: number;
      totalEconomicDamages: number;
      uncertaintyBand: { low: number; mid: number; high: number };
    };
  };
  diagnostics: unknown;
}

export declare const DEMO_SCENARIO: DamagesScenario;
export declare function calculateEconomicDamages(caseInput: DamagesScenario): DamagesReport;
export declare function pvAnnuityWithGrowth(args: {
  baseAmount: number;
  years: number;
  growthRate: number;
  discountRate: number;
}): number;
export declare function uncertaintyBand(
  total: number,
  lowMultiplier?: number,
  highMultiplier?: number,
): { low: number; mid: number; high: number };
export declare function roundMoney(n: number): number;
