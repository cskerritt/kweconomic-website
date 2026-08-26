#!/usr/bin/env node
/**
 * Economic damages calculator for personal-injury / PI-style analyses.
 *
 * This is an internal, calculator-level model for rough estimates. It is not legal
 * advice, and users should calibrate assumptions to case facts and jurisdiction.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// Engine moved to lib/damages-estimate.mjs (2026-07-05) so the public /tools
// estimator page and the server's breakdown email share the same math.
import {
  calculateEconomicDamages as calc,
  roundMoney,
  pvAnnuityWithGrowth,
  uncertaintyBand,
  DEMO_SCENARIO,
} from '../lib/damages-estimate.mjs';

const usage = `Usage:
  node scripts/economic-damages-calculator.mjs --input <path-to-json>
  node scripts/economic-damages-calculator.mjs --demo
  node scripts/economic-damages-calculator.mjs --help

Input JSON fields (all numeric unless stated):
  scenarioName               (string, optional)
  annualIncome               (base annual earning potential, required)
  hourlyWage                 (optional, used when income is time-based)
  workHoursPerWeek           (optional if hourlyWage)
  annualFringeRate           (e.g. 0.30 for 30%; default 0)
  worklifeLossYears           years of future work capacity loss
  retirementAge               age expected retirement (for future loss)
  currentAge                  (for future loss)
  lossBeforeFileInjuryYears    past lost income years (can be fractional)
  pastWageMultiplier          multiplier (e.g. partial disability: 0.6)
  growthRate                 annual wage growth (e.g. 0.03)
  discountRate               discount rate (e.g. 0.02)
  preDisabilityIncome        prior medical-related earnings loss amount (optional)
  medicalsPast, medicalsFuture, attendantCarePast, attendantCareFuture, otherPast, otherFuture
  inflationRateFuture         for non-wage future medical/care adjustments (optional)

Output:
  - past economic
  - future economic
  - future medical + care
  - total with uncertainty band (low/mid/high)
`;

function parseArgs(argv) {
  return Object.fromEntries(
    argv.reduce((acc, token, idx, arr) => {
      if (!token.startsWith('--')) return acc;
      const key = token.replace(/^--/, '');
      if (key === 'help' || key === 'demo') {
        acc.push([key, true]);
      } else if (arr[idx + 1] && !arr[idx + 1].startsWith('--')) {
        acc.push([key, arr[idx + 1]]);
      } else {
        acc.push([key, true]);
      }
      return acc;
    }, []),
  );
}

// Resolve the scenario object from parsed CLI args. Throws a friendly Error (not
// a raw stack) when --input is given without a path, points at a missing file, or
// references a file that isn't valid JSON.
function resolveScenario(args) {
  const inputPath = args.input;
  if (args.demo === true || !inputPath) return DEMO_SCENARIO;
  if (typeof inputPath !== 'string') {
    throw new Error('--input requires a file path, e.g. --input scenario.json (or use --demo)');
  }
  let raw;
  try {
    raw = readFileSync(inputPath, 'utf8');
  } catch (err) {
    throw new Error(`cannot read --input file "${inputPath}": ${err.message}`);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`--input file "${inputPath}" is not valid JSON: ${err.message}`);
  }
}

function printReport(report) {
  console.log(`\n=== Economic Damages Estimate (${report.scenarioName}) ===`);
  console.log(`Assumptions: ${JSON.stringify(report.assumptions, null, 2)}`);
  console.log('\n--- Past Loss ---');
  console.log(`Past Lost Earnings: $${report.lineItems.past.pastEconomicLoss.toLocaleString()}`);
  console.log(`Past Medical + Other: $${report.lineItems.past.pastMedicalAndOther.toLocaleString()}`);
  console.log('\n--- Future Loss ---');
  console.log(`Future Lost Earnings (PV): $${report.lineItems.future.presentValueFutureEarnedIncome.toLocaleString()}`);
  console.log(`Future Medical (PV): $${report.lineItems.future.presentValueFutureMedicals.toLocaleString()}`);
  console.log(`Future Attendant Care (PV): $${report.lineItems.future.presentValueFutureAttendantCare.toLocaleString()}`);
  console.log(`Future Other (PV): $${report.lineItems.future.presentValueFutureOther.toLocaleString()}`);
  console.log('\n--- Totals ---');
  console.log(`Lost Earnings Total: $${report.lineItems.totals.lostEarnings.toLocaleString()}`);
  console.log(`Future Specials Total: $${report.lineItems.totals.futureSpecials.toLocaleString()}`);
  console.log(`Total Economic Damages (Mid): $${report.lineItems.totals.totalEconomicDamages.toLocaleString()}`);
  console.log(`Uncertainty band (low/mid/high): $${report.lineItems.totals.uncertaintyBand.low.toLocaleString()} / $${report.lineItems.totals.uncertaintyBand.mid.toLocaleString()} / $${report.lineItems.totals.uncertaintyBand.high.toLocaleString()}`);
  console.log('\nJSON dump:');
  console.log(JSON.stringify(report, null, 2));
}

function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    console.log(usage);
    return;
  }
  try {
    const report = calc(resolveScenario(parseArgs(argv)));
    printReport(report);
  } catch (err) {
    // Friendly one-line message instead of a raw stack for bad args / input / rates.
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// Run as a CLI only when executed directly, so importing calc/parseArgs has no
// side effects (no demo run, no process.exit).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}

// Keep importable behavior for future use in other scripts + tests.
export { calc as calculateEconomicDamages, parseArgs, resolveScenario, roundMoney, pvAnnuityWithGrowth, uncertaintyBand };
