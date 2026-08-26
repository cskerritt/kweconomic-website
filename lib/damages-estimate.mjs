/**
 * Preliminary economic-loss estimate engine (planning-level).
 *
 * Pure, dependency-free math shared by the public /tools estimator page, the
 * server's breakdown email (which recomputes rather than trusting client
 * numbers), and the internal CLI (scripts/economic-damages-calculator.mjs).
 * Lives in lib/ because the production Docker image ships lib/, not scripts/
 * or src/ (same constraint as intake-schema.mjs).
 *
 * This is a calculator-level model for rough planning estimates - not an
 * expert opinion; assumptions must be calibrated per case and jurisdiction.
 */

export const DEMO_SCENARIO = {
  scenarioName: 'Demo: knee trauma / reduced earning capacity',
  annualIncome: 72000,
  annualFringeRate: 0.28,
  worklifeLossYears: 22,
  currentAge: 38,
  retirementAge: 68,
  lossBeforeFileInjuryYears: 0.75,
  pastWageMultiplier: 0.7,
  growthRate: 0.028,
  discountRate: 0.02,
  inflationRateFuture: 0.02,
  preDisabilityIncome: 0,
  medicalsPast: 1800,
  medicalsFuture: 9000,
  attendantCarePast: 700,
  attendantCareFuture: 50000,
  otherPast: 2500,
  otherFuture: 12000,
};

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function ensurePositive(name, value) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Invalid value for ${name}: ${value}`);
  }
}

export function pvAnnuityWithGrowth({ baseAmount, years, growthRate, discountRate }) {
  let running = baseAmount;
  let presentValue = 0;
  for (let year = 1; year <= years; year += 1) {
    running *= 1 + growthRate;
    const discounted = running / Math.pow(1 + discountRate, year);
    presentValue += discounted;
  }
  return presentValue;
}

function adjustForTaxableWageToPV(annualWage, fringeRate = 0, multiplier = 1) {
  return annualWage * (1 + Math.max(0, fringeRate)) * Math.max(0, multiplier);
}

function calculatePastEconomicLoss(s) {
  const annualIncome = asNumber(s.annualIncome);
  const fringeRate = asNumber(s.annualFringeRate);
  const pastYears = asNumber(s.lossBeforeFileInjuryYears, 0);
  const mult = asNumber(s.pastWageMultiplier, 1);
  const medicalReduction = asNumber(s.preDisabilityIncome, 0);

  ensurePositive('annualIncome', annualIncome);
  ensurePositive('lossBeforeFileInjuryYears', pastYears);

  const annualWithFringe = adjustForTaxableWageToPV(annualIncome, fringeRate, mult);
  const nominal = annualWithFringe * pastYears;
  return {
    years: pastYears,
    annualRate: annualWithFringe,
    multiplier: mult,
    amount: nominal - medicalReduction,
    fringeRate,
    note: 'Past loss is not discounted (already historical period).',
  };
}

function calculateFutureEarningsLoss({ annualIncome, annualFringeRate = 0, growthRate = 0, discountRate = 0, currentAge, retirementAge, worklifeLossYears }) {
  const base = asNumber(annualIncome);
  const fringe = asNumber(annualFringeRate);
  const g = asNumber(growthRate);
  const r = asNumber(discountRate);
  const curAge = asNumber(currentAge);
  const retAge = asNumber(retirementAge);
  const worklife = asNumber(worklifeLossYears);

  ensurePositive('annualIncome', base);
  ensurePositive('growthRate', g);
  ensurePositive('discountRate', r);
  ensurePositive('retirementAge', retAge);
  ensurePositive('currentAge', curAge);

  if (!worklife) {
    const caps = Math.max(0, retAge - curAge);
    const effectiveYears = asNumber(worklifeLossYears || caps, 0);
    const annualWithFringe = adjustForTaxableWageToPV(base, fringe);
    return {
      years: effectiveYears,
      annualRate: annualWithFringe,
      growthRate: g,
      discountRate: r,
      presentValue: pvAnnuityWithGrowth({ baseAmount: annualWithFringe, years: effectiveYears, growthRate: g, discountRate: r }),
      note: 'Worklife loss inferred from retirementAge-currentAge.',
    };
  }

  const annualWithFringe = adjustForTaxableWageToPV(base, fringe);
  return {
    years: worklife,
    annualRate: annualWithFringe,
    growthRate: g,
    discountRate: r,
    presentValue: pvAnnuityWithGrowth({ baseAmount: annualWithFringe, years: worklife, growthRate: g, discountRate: r }),
    note: 'Explicit worklifeLossYears used.',
  };
}

function projectNonWageExpense(expense, years, growthRate, discountRate) {
  const base = asNumber(expense);
  return pvAnnuityWithGrowth({ baseAmount: base, years, growthRate, discountRate });
}

export function uncertaintyBand(total, lowMultiplier = 0.85, highMultiplier = 1.2) {
  return {
    low: total * lowMultiplier,
    mid: total,
    high: total * highMultiplier,
  };
}

export function roundMoney(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateEconomicDamages(caseInput) {
  const s = {
    annualIncome: 0,
    annualFringeRate: 0,
    growthRate: 0,
    discountRate: 0,
    inflationRateFuture: 0,
    lossBeforeFileInjuryYears: 0,
    preDisabilityIncome: 0,
    pastWageMultiplier: 1,
    medicalsPast: 0,
    medicalsFuture: 0,
    attendantCarePast: 0,
    attendantCareFuture: 0,
    otherPast: 0,
    otherFuture: 0,
    ...caseInput,
  };

  const pastEcon = calculatePastEconomicLoss(s);
  const futureEcon = calculateFutureEarningsLoss({
    annualIncome: asNumber(s.annualIncome),
    annualFringeRate: asNumber(s.annualFringeRate),
    growthRate: asNumber(s.growthRate),
    discountRate: asNumber(s.discountRate),
    currentAge: asNumber(s.currentAge, 0),
    retirementAge: asNumber(s.retirementAge, 0),
    worklifeLossYears: asNumber(s.worklifeLossYears, asNumber(s.retirementAge, 0) - asNumber(s.currentAge, 0)),
  });

  // Non-wage future expenses inflate by inflationRateFuture - validate it the same
  // way wage growth/discount rates are validated (a negative or non-finite rate
  // would silently produce a nonsensical present value).
  ensurePositive('inflationRateFuture', asNumber(s.inflationRateFuture));

  const futureServiceYears = asNumber(s.worklifeLossYears, Math.max(0, s.retirementAge - s.currentAge));
  const medFuture = projectNonWageExpense(asNumber(s.medicalsFuture), futureServiceYears, asNumber(s.inflationRateFuture), asNumber(s.discountRate));
  const careFuture = projectNonWageExpense(asNumber(s.attendantCareFuture), futureServiceYears, asNumber(s.inflationRateFuture), asNumber(s.discountRate));
  const otherFuture = projectNonWageExpense(asNumber(s.otherFuture), futureServiceYears, asNumber(s.inflationRateFuture), asNumber(s.discountRate));

  const pastMedicalOther = asNumber(s.medicalsPast) + asNumber(s.attendantCarePast) + asNumber(s.otherPast);

  const totals = {
    pastEconomic: pastEcon.amount,
    futureEconomic: futureEcon.presentValue,
    futureMedical: medFuture,
    futureAttendantCare: careFuture,
    futureOther: otherFuture,
  };

  const subtotal = Object.values(totals).reduce((acc, n) => acc + n, 0);
  const band = uncertaintyBand(subtotal);

  return {
    scenarioName: s.scenarioName || 'Unnamed scenario',
    assumptions: {
      annualIncome: asNumber(s.annualIncome),
      annualFringeRate: asNumber(s.annualFringeRate),
      growthRate: asNumber(s.growthRate),
      discountRate: asNumber(s.discountRate),
      inflationRateFuture: asNumber(s.inflationRateFuture),
      worklifeLossYears: asNumber(s.worklifeLossYears, Math.max(0, asNumber(s.retirementAge, 0) - asNumber(s.currentAge, 0))),
      currentAge: asNumber(s.currentAge, 0),
      retirementAge: asNumber(s.retirementAge, 0),
    },
    lineItems: {
      past: {
        pastEconomicLoss: roundMoney(pastEcon.amount),
        pastMedicalAndOther: roundMoney(pastMedicalOther),
      },
      future: {
        presentValueFutureEarnedIncome: roundMoney(futureEcon.presentValue),
        presentValueFutureMedicals: roundMoney(medFuture),
        presentValueFutureAttendantCare: roundMoney(careFuture),
        presentValueFutureOther: roundMoney(otherFuture),
      },
      totals: {
        lostEarnings: roundMoney(totals.pastEconomic + totals.futureEconomic),
        futureSpecials: roundMoney(totals.futureMedical + totals.futureAttendantCare + totals.futureOther),
        totalEconomicDamages: roundMoney(subtotal),
        uncertaintyBand: {
          low: roundMoney(band.low),
          mid: roundMoney(band.mid),
          high: roundMoney(band.high),
        },
      },
    },
    diagnostics: {
      pastCalculation: pastEcon,
      futureCalculation: futureEcon,
      formulaNotes: [
        'Future streams discounted to present value using annuity-style projection.',
        'Non-wage future expenses are inflated and discounted using inflationRateFuture and discountRate.',
        'Med/attendant/other past expenses are treated as present-time historical amounts.',
      ],
    },
  };
}
