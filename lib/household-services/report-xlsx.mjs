// Client-side Excel (.xlsx) workbook for a single valuation result. Built with
// exceljs (runs in browser and Node). The Valuation sheet uses LIVE formulas
// (daily = hours*wage, weekly = daily*7, annual = daily*365.25, totals via SUM)
// so an analyst can trace every number. Dynamically imported by the page.
import ExcelJS from "exceljs";
import {
  HSV_TITLE,
  HSV_PREPARED_BY,
  METHOD_LABELS,
  vintageLine,
  fallbackLabel,
  inputRows,
  citations,
  sampleNote,
} from "./report-shared.mjs";

const NAVY = "FF14223D";

function styleHeader(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.eachCell((c) => {
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  });
}

function buildWorkbook(result) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "KW Household Services Valuator";
  wb.title = HSV_TITLE;

  // --- Inputs -------------------------------------------------------------
  const inputs = wb.addWorksheet("Inputs");
  inputs.columns = [
    { header: "Field", key: "k", width: 22 },
    { header: "Value", key: "v", width: 48 },
  ];
  styleHeader(inputs.getRow(1));
  for (const [k, v] of inputRows(result)) inputs.addRow({ k, v });
  inputs.addRow({});
  inputs.addRow({ k: "Data vintage", v: vintageLine(result).replace(/·/g, "|") });
  inputs.addRow({ k: "Prepared with", v: HSV_PREPARED_BY });
  for (const c of citations(result)) inputs.addRow({ k: "Citation", v: c });

  // --- Hours (raw ATUS) ---------------------------------------------------
  const hours = wb.addWorksheet("Hours");
  hours.columns = [
    { header: "Activity", key: "a", width: 40 },
    { header: "Hours/day", key: "h", width: 12 },
    { header: "SE", key: "se", width: 10 },
  ];
  styleHeader(hours.getRow(1));
  for (const a of result.valuation.perActivity) hours.addRow({ a: a.label, h: a.hoursDay, se: a.se });
  const sn = sampleNote(result);
  hours.addRow({});
  hours.addRow({ a: sn.base });
  if (sn.warning) hours.addRow({ a: sn.warning });

  // --- Wages (matched OEWS) ----------------------------------------------
  const wages = wb.addWorksheet("Wages");
  wages.columns = [
    { header: "Activity", key: "a", width: 40 },
    { header: "SOC", key: "soc", width: 12 },
    { header: "Occupation", key: "occ", width: 40 },
    { header: "Hourly wage", key: "w", width: 14 },
    { header: "Wage area", key: "area", width: 32 },
    { header: "Fallback", key: "fb", width: 20 },
  ];
  styleHeader(wages.getRow(1));
  wages.getColumn("w").numFmt = '"$"#,##0.00';
  for (const a of result.valuation.perActivity) {
    wages.addRow({ a: a.label, soc: a.soc, occ: a.socTitle, w: a.wage, area: a.wageArea, fb: fallbackLabel(a.wageFallback) });
  }

  // --- Valuation (LIVE formulas) -----------------------------------------
  const val = wb.addWorksheet("Valuation");
  val.columns = [
    { header: "Activity", key: "a", width: 40 },
    { header: "Hours/day", key: "h", width: 12 },
    { header: "Hourly wage", key: "w", width: 14 },
    { header: "Daily $", key: "d", width: 14 },
    { header: "Weekly $", key: "wk", width: 14 },
    { header: "Annual $", key: "an", width: 16 },
  ];
  styleHeader(val.getRow(1));
  for (const col of ["C", "D", "E", "F"]) val.getColumn(col).numFmt = '"$"#,##0.00';

  const acts = result.valuation.perActivity;
  const first = 2;
  const last = first + acts.length - 1;
  acts.forEach((a, i) => {
    const r = first + i;
    const row = val.getRow(r);
    row.getCell("A").value = a.label;
    row.getCell("B").value = a.hoursDay;
    if (a.wage == null) {
      row.getCell("C").value = "suppressed";
      row.getCell("D").value = "n/a";
      row.getCell("E").value = "n/a";
      row.getCell("F").value = "n/a";
    } else {
      row.getCell("C").value = a.wage;
      row.getCell("D").value = { formula: `B${r}*C${r}`, result: a.daily };
      row.getCell("E").value = { formula: `D${r}*7`, result: a.weekly };
      row.getCell("F").value = { formula: `D${r}*365.25`, result: a.annual };
    }
  });

  const t = result.valuation.totals;
  const hoursRowNum = last + 2;
  const hoursRow = val.getRow(hoursRowNum);
  hoursRow.getCell("A").value = "Total hours/day";
  hoursRow.getCell("A").font = { bold: true };
  hoursRow.getCell("B").value = { formula: `SUM(B${first}:B${last})`, result: t.hoursDay };
  hoursRow.getCell("B").font = { bold: true };

  const occRowNum = hoursRowNum + 2;
  const occRow = val.getRow(occRowNum);
  occRow.getCell("A").value = METHOD_LABELS.occupation;
  occRow.getCell("A").font = { bold: true };
  occRow.getCell("D").value = { formula: `SUM(D${first}:D${last})`, result: t.occupation.daily };
  occRow.getCell("E").value = { formula: `D${occRowNum}*7`, result: t.occupation.weekly };
  occRow.getCell("F").value = { formula: `D${occRowNum}*365.25`, result: t.occupation.annual };

  const genRowNum = occRowNum + 1;
  const genRow = val.getRow(genRowNum);
  genRow.getCell("A").value = METHOD_LABELS.generalist;
  genRow.getCell("A").font = { bold: true };
  genRow.getCell("C").value = t.generalist.rate;
  genRow.getCell("D").value = { formula: `B${hoursRowNum}*C${genRowNum}`, result: t.generalist.daily };
  genRow.getCell("E").value = { formula: `D${genRowNum}*7`, result: t.generalist.weekly };
  genRow.getCell("F").value = { formula: `D${genRowNum}*365.25`, result: t.generalist.annual };

  const compRowNum = genRowNum + 1;
  const compRow = val.getRow(compRowNum);
  compRow.getCell("A").value = METHOD_LABELS.composite;
  compRow.getCell("A").font = { bold: true };
  compRow.getCell("C").value = { formula: `D${occRowNum}/B${hoursRowNum}`, result: t.composite.rate };
  compRow.getCell("D").value = { formula: `B${hoursRowNum}*C${compRowNum}`, result: t.composite.daily };
  compRow.getCell("E").value = { formula: `D${compRowNum}*7`, result: t.composite.weekly };
  compRow.getCell("F").value = { formula: `D${compRowNum}*365.25`, result: t.composite.annual };

  for (const col of ["C", "D", "E", "F"]) val.getColumn(col).numFmt = '"$"#,##0.00';

  return wb;
}

/** Node path (tests): returns a Buffer that exceljs can re-open. */
export async function buildXlsxBuffer(result) {
  const wb = buildWorkbook(result);
  return wb.xlsx.writeBuffer();
}

/** Browser path: returns a Blob for download. */
export async function buildXlsxBlob(result) {
  const buf = await buildXlsxBuffer(result);
  return new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
