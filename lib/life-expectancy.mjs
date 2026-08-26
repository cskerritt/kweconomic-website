/**
 * Remaining-life-expectancy lookup engine (planning-level).
 *
 * Pure, dependency-free, DOM-free ESM math shared by the public
 * /tools/life-expectancy page. Lives in lib/ because the production Docker image
 * ships lib/, not src/ (same constraint as damages-estimate.mjs and
 * intake-schema.mjs), so importing it from the page bundles the tables
 * client-side with no runtime fetch.
 *
 * Data source: CDC/NCHS United States Life Tables, 2023 (NVSR Vol. 74, No. 6),
 * period life tables, public domain. See lib/life-tables-2023.mjs. The age and
 * interpolation math is ported from a prior public-domain life-table lookup;
 * only the math and the public numeric tables are reused - no third-party UI,
 * branding, or report copy.
 *
 * This is an educational lookup of published population averages, not an expert
 * opinion. A case-specific analysis prepared for either plaintiff or defense may
 * differ materially.
 */

import { LIFE_TABLES, EDITION } from "./life-tables-2023.mjs";

export { EDITION };

// The final published row is "100 years and older": ages at or beyond it are
// reported at that value, not interpolated past the end of the table.
export const MAX_TABLE_AGE = 100;

// Population groups available in NVSR 74-06 (6 groups x 3 sexes = 18 tables).
// value = key into LIFE_TABLES; label = neutral source-data description.
export const GROUPS = [
  { value: "all", label: "All groups" },
  { value: "hispanic", label: "Hispanic" },
  { value: "aian", label: "American Indian and Alaska Native (non-Hispanic)" },
  { value: "asian", label: "Asian (non-Hispanic)" },
  { value: "black", label: "Black (non-Hispanic)" },
  { value: "white", label: "White (non-Hispanic)" },
];

// Sex tables published for each group. total = both sexes combined.
export const SEXES = [
  { value: "total", label: "Total" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

// -------- Date helpers (optional date-of-birth entry path) --------

// Parse "YYYY-MM-DD" into a local-time Date at midnight (avoids the UTC shift of
// new Date(string)). Returns null for anything that is not a real calendar date
// (e.g. 2023-02-30, or 2001-02-29 in a common year).
export function parseISODate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) {
    return null;
  }
  return d;
}

// Whole days between two Dates (b - a), rounded.
export function daysBetween(a, b) {
  const MS = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / MS);
}

// The anniversary of `dob` in calendar year `year`. A Feb 29 birthday falls on
// Feb 28 in a common (non-leap) year.
export function anniversary(dob, year) {
  const month = dob.getMonth();
  const day = dob.getDate();
  const d = new Date(year, month, day);
  if (d.getMonth() !== month) return new Date(year, month, day - 1); // Feb 29 -> Feb 28
  return d;
}

// Add whole calendar months to a date, clamping the day to the target month's
// last day (e.g. Jan 31 + 1 month -> Feb 28/29). Internal helper for exactAge.
function addMonthsClamped(date, months) {
  const y = date.getFullYear();
  const m = date.getMonth() + months;
  const day = date.getDate();
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(day, lastDay));
}

// Exact age at `asof`: completed years, plus a decimal fraction of the current
// age-year that has elapsed. Also returns completed months and leftover days for
// display. Returns null when `asof` is before `dob`.
export function exactAge(dob, asof) {
  if (asof < dob) return null;
  let years = asof.getFullYear() - dob.getFullYear();
  let last = anniversary(dob, dob.getFullYear() + years);
  if (last > asof) {
    years -= 1;
    last = anniversary(dob, dob.getFullYear() + years);
  }
  const next = anniversary(dob, dob.getFullYear() + years + 1);
  const spanDays = daysBetween(last, next); // 365 or 366
  const elapsedDays = daysBetween(last, asof);

  let months = asof.getMonth() - last.getMonth() + 12 * (asof.getFullYear() - last.getFullYear());
  let monthAnchor = addMonthsClamped(last, months);
  if (monthAnchor > asof) {
    months -= 1;
    monthAnchor = addMonthsClamped(last, months);
  }
  const days = daysBetween(monthAnchor, asof);
  return {
    years,
    months,
    days,
    decimal: years + elapsedDays / spanDays,
  };
}

// -------- Life-expectancy lookup + interpolation --------

// Look up remaining life expectancy for a decimal age in one table's `ex` array
// (index 0..100). Linear interpolation between the published values at
// floor(age) and floor(age)+1. Returns null for a negative age.
//   - age 0 or any exact integer -> the published value at that age (interpolated:false)
//   - age at or beyond MAX_TABLE_AGE -> the "100 and older" value (capped:true)
//   - otherwise -> the interpolated value (interpolated:true)
export function lifeExpectancy(exArr, ageDecimal) {
  if (ageDecimal < 0) return null;
  if (ageDecimal >= MAX_TABLE_AGE) {
    return {
      le: exArr[MAX_TABLE_AGE],
      loAge: MAX_TABLE_AGE,
      hiAge: null,
      loEx: exArr[MAX_TABLE_AGE],
      hiEx: null,
      capped: true,
      interpolated: false,
    };
  }
  const lo = Math.floor(ageDecimal);
  const frac = ageDecimal - lo;
  const loEx = exArr[lo];
  if (frac === 0) {
    return { le: loEx, loAge: lo, hiAge: null, loEx, hiEx: null, capped: false, interpolated: false };
  }
  const hi = lo + 1;
  const hiEx = exArr[hi];
  return {
    le: loEx + frac * (hiEx - loEx),
    loAge: lo,
    hiAge: hi,
    loEx,
    hiEx,
    capped: false,
    interpolated: true,
  };
}

// Resolve a group + sex to its published table, look up the decimal age, and
// return a display-ready result plus citation metadata. Returns null for an
// unknown group/sex or a negative age.
export function computeLifeExpectancy({ group, sex, ageDecimal }) {
  const table = LIFE_TABLES[group]?.[sex];
  if (!table) return null;
  const result = lifeExpectancy(table.ex, ageDecimal);
  if (!result) return null;
  return {
    remainingLE: result.le,
    expectedAgeAtEnd: ageDecimal + result.le,
    group,
    sex,
    table: table.table,
    edition: EDITION,
    capped: result.capped,
    interpolated: result.interpolated,
  };
}
