// Formatting + boilerplate content shared by the on-screen results, the DOCX
// exhibit, the XLSX workbook, and the CSV export. Keeping labels and prose in
// ONE place stops the four surfaces from drifting apart. Pure - no I/O, no deps.

export const HSV_TITLE = "Household Services Valuation";
export const HSV_PREPARED_BY =
  "Prepared with the KW Household Services Valuator - Kincaid Wolstein Vocational and Rehabilitation Services";

const SEX = { male: "Male", female: "Female" };
const EMPLOYMENT = { full_time: "Full time", part_time: "Part time", not_employed: "Not employed" };
const MARRIED = { married: "Married or partnered", single: "Single" };
const CHILD = { none: "No child under 18", under_6: "Youngest child under 6", "6-17": "Youngest child 6 to 17" };

export const METHOD_LABELS = {
  occupation: "Occupation-specific",
  generalist: "Generalist",
  composite: "Composite",
};

/** Money with cents, e.g. $1,234.56. null -> "n/a". */
export const usd = (n) =>
  n == null ? "n/a" : "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Money rounded to whole dollars, e.g. $1,235. null -> "n/a". */
export const usd0 = (n) =>
  n == null ? "n/a" : "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

/** Fixed-decimal number as a string. null/NaN -> "n/a". */
export const num = (n, d = 2) => (n == null || Number.isNaN(Number(n)) ? "n/a" : Number(n).toFixed(d));

/** "2019-2024" (or a single year). */
export function yearsLabel(years) {
  if (!Array.isArray(years) || years.length === 0) return "";
  const lo = Math.min(...years);
  const hi = Math.max(...years);
  return lo === hi ? String(lo) : `${lo}-${hi}`;
}

/** Data-vintage line shown under every result and in every export. */
export function vintageLine(result) {
  const years = yearsLabel(result.meta.atus.years);
  return `ATUS ${years} (IPUMS) · OEWS ${result.meta.oews.vintage} · ${result.meta.area.name}`;
}

/** Human wage-fallback phrase, e.g. "metro to national". null -> "". */
export function fallbackLabel(fb) {
  if (!fb) return "";
  return String(fb).replace(/msa/gi, "metro").replace(/→/g, " to ").replace(/->/g, " to ");
}

/** Ordered [label, value] rows describing the inputs. */
export function inputRows(result) {
  const i = result.inputs;
  const ageBand = i.age ? `${i.age_band} (age ${i.age})` : i.age_band;
  return [
    ["Sex", SEX[i.sex] ?? i.sex],
    ["Age band", ageBand],
    ["Employment", EMPLOYMENT[i.employment] ?? i.employment],
    ["Marital status", MARRIED[i.married] ?? i.married],
    ["Youngest child", CHILD[i.youngest_child] ?? i.youngest_child],
    ["Geography", `${result.meta.area.name} (${result.meta.area.type})`],
    ["Wage statistic", i.wageStat === "median" ? "Median (50th percentile)" : "Mean"],
  ];
}

/**
 * Sample-size note. `warning` is non-null when the cell is thin or a rollup was
 * used, and explains, in plain English, which broader group supplied the hours.
 */
export function sampleNote(result) {
  const n = result.cell.n;
  const base = `Based on ${Number(n).toLocaleString("en-US")} time diaries`;
  let warning = null;
  if (result.cell.rollup === "child") {
    warning =
      "Too few time diaries matched this exact demographic group, so the hours come from a broader group that does not condition on the age of the youngest child.";
  } else if (result.cell.rollup === "child_marital") {
    warning =
      "Too few time diaries matched this exact demographic group, so the hours come from a broader group that does not condition on marital status or the age of the youngest child.";
  } else if (result.cell.thin) {
    warning =
      "This estimate rests on a small number of time diaries (below the sample-size floor), so treat it as indicative rather than precise.";
  }
  return { count: n, base, warning };
}

/** One-paragraph methodology summary for the exports. */
export function methodologySummary(result) {
  return (
    "This valuation applies the replacement-cost method: time spent on unpaid household activities is " +
    "valued at what it would cost to hire someone to perform that work. Average hours per day for each " +
    "activity come from the American Time Use Survey (ATUS) for a demographic group matching the " +
    "individual, weighted by the survey's WT06 person weights. Each activity is priced at the matched " +
    "occupation's hourly wage from the BLS Occupational Employment and Wage Statistics (OEWS) program " +
    `for ${result.meta.area.name}, with a documented fallback from metro to state to national wage where a ` +
    "value is suppressed. Daily figures are annualized as daily times 365.25; weekly figures as daily times 7."
  );
}

/** Citation strings (ATUS + OEWS) with the vintages actually used. */
export function citations(result) {
  const atus =
    result.meta.atus.citation ||
    "American Time Use Survey Data Extract Builder. IPUMS, University of Minnesota. https://doi.org/10.18128/D060.V3.2";
  const oews = `U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), ${result.meta.oews.vintage}.`;
  return [`ATUS: ${atus}`, `OEWS: ${oews}`];
}
