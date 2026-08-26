/**
 * Per-metric provenance for the state and metro labor datasets.
 *
 * The labor records combine two federal statistical programs, and the correct
 * publishing agency differs by metric:
 *   - Unemployment rate: U.S. Bureau of Labor Statistics (Local Area
 *     Unemployment Statistics).
 *   - Median hourly wage: U.S. Bureau of Labor Statistics (Occupational
 *     Employment and Wage Statistics).
 *   - Industry employment: U.S. Bureau of Labor Statistics (Current Employment
 *     Statistics, a nonfarm-payroll survey).
 *   - Median household income: U.S. Census Bureau (American Community Survey).
 *     BLS does not publish household income.
 *
 * Vintage: the median household income values match the Census ACS 2017-2021
 * 5-year estimates (spot-checked against Alabama at 54,943 and California at
 * 84,097), not a 2024 figure. The BLS metric values reflect the most recent
 * annual releases available when the dataset was assembled (2024).
 *
 * Keeping provenance here, rather than as a single blanket per-record label,
 * lets each metric be attributed to its actual source agency and vintage.
 */
export const LABOR_SOURCES = {
  bls: {
    agency: "U.S. Bureau of Labor Statistics",
    year: 2024,
    programs: {
      unemployment: "Local Area Unemployment Statistics",
      wages: "Occupational Employment and Wage Statistics",
      industries: "Current Employment Statistics",
    },
  },
  householdIncome: {
    agency: "U.S. Census Bureau",
    program: "American Community Survey",
    vintage: "2017-2021 5-year estimates",
  },
} as const;
