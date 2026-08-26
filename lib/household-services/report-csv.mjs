// Client-side CSV export. Columns per plan Task 12: one row per activity, then
// three TOTAL (<method>) rows, then a `# Source:` comment line with vintages.
import { fallbackLabel, vintageLine, HSV_PREPARED_BY } from "./report-shared.mjs";

const COLUMNS = [
  "activity",
  "hours_per_day",
  "se",
  "soc",
  "occupation",
  "wage",
  "wage_area",
  "daily",
  "weekly",
  "annual",
];

/** RFC-4180-ish quoting: wrap in quotes and double internal quotes when needed. */
function csvCell(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const row = (cells) => cells.map(csvCell).join(",");
const money = (n) => (n == null ? "" : Number(n).toFixed(2));

export function buildCsv(result) {
  const lines = [row(COLUMNS)];

  for (const a of result.valuation.perActivity) {
    const area = a.wageArea
      ? a.wageFallback
        ? `${a.wageArea} [fallback: ${fallbackLabel(a.wageFallback)}]`
        : a.wageArea
      : "";
    lines.push(
      row([
        a.label,
        a.hoursDay?.toFixed?.(2) ?? a.hoursDay,
        a.se?.toFixed?.(2) ?? a.se,
        a.soc,
        a.socTitle,
        money(a.wage),
        area,
        money(a.daily),
        money(a.weekly),
        money(a.annual),
      ]),
    );
  }

  const t = result.valuation.totals;
  const hrs = t.hoursDay?.toFixed?.(2) ?? t.hoursDay;
  lines.push(row(["TOTAL (occupation-specific)", hrs, "", "", "", "", "", money(t.occupation.daily), money(t.occupation.weekly), money(t.occupation.annual)]));
  lines.push(row(["TOTAL (generalist)", hrs, "", "", "generalist rate", money(t.generalist.rate), "", money(t.generalist.daily), money(t.generalist.weekly), money(t.generalist.annual)]));
  lines.push(row(["TOTAL (composite)", hrs, "", "", "blended rate", money(t.composite.rate), "", money(t.composite.daily), money(t.composite.weekly), money(t.composite.annual)]));

  lines.push(`# Source: ${vintageLine(result).replace(/\s*·\s*/g, "; ")}`);
  lines.push(`# ${HSV_PREPARED_BY}`);
  return lines.join("\r\n") + "\r\n";
}
