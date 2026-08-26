// Client-side Word (.docx) exhibit for a single valuation result. Built with the
// `docx` package, which runs in the browser (Packer.toBlob) and in Node
// (Packer.toBuffer, used by the tests). Dynamically imported by the page so the
// library lands in a lazy chunk.
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from "docx";
import {
  HSV_TITLE,
  HSV_PREPARED_BY,
  METHOD_LABELS,
  usd,
  num,
  vintageLine,
  fallbackLabel,
  inputRows,
  sampleNote,
  methodologySummary,
  citations,
} from "./report-shared.mjs";

const NAVY = "14223D";
const LIGHT = "EEF1F6";

function cell(text, { bold = false, right = false, header = false, shading } = {}) {
  return new TableCell({
    shading: shading ? { fill: shading } : undefined,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [
      new Paragraph({
        alignment: right ? AlignmentType.RIGHT : AlignmentType.LEFT,
        children: [new TextRun({ text: text == null ? "" : String(text), bold, color: header ? "FFFFFF" : undefined })],
      }),
    ],
  });
}

function headerRow(labels, rightFrom = 1) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l, i) => cell(l, { bold: true, header: true, shading: NAVY, right: i >= rightFrom })),
  });
}

function table(rows) {
  const thin = { style: BorderStyle.SINGLE, size: 2, color: "C7CDD9" };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: thin, bottom: thin, left: thin, right: thin, insideHorizontal: thin, insideVertical: thin },
    rows,
  });
}

const para = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })] });
const spacer = () => new Paragraph({ children: [] });

function inputsTable(result) {
  return table(inputRows(result).map(([k, v]) => new TableRow({ children: [cell(k, { bold: true, shading: LIGHT }), cell(v)] })));
}

function hoursTable(result) {
  const rows = [headerRow(["Activity", "Hrs/day", "SE", "Matched occupation (SOC)", "Wage / area", "Daily", "Annual"], 1)];
  for (const a of result.valuation.perActivity) {
    const wageArea = a.wage == null ? "wage suppressed" : `${usd(a.wage)} / ${a.wageArea}${a.wageFallback ? ` (${fallbackLabel(a.wageFallback)})` : ""}`;
    rows.push(
      new TableRow({
        children: [
          cell(a.label),
          cell(num(a.hoursDay), { right: true }),
          cell(num(a.se), { right: true }),
          cell(`${a.socTitle} (${a.soc})`),
          cell(wageArea),
          cell(usd(a.daily), { right: true }),
          cell(usd(a.annual), { right: true }),
        ],
      }),
    );
  }
  return table(rows);
}

function totalsTable(result) {
  const t = result.valuation.totals;
  const rows = [headerRow(["Valuation method", "Rate", "Daily", "Weekly", "Annual"], 1)];
  rows.push(
    new TableRow({ children: [cell(METHOD_LABELS.occupation, { bold: true }), cell("varies", { right: true }), cell(usd(t.occupation.daily), { right: true }), cell(usd(t.occupation.weekly), { right: true }), cell(usd(t.occupation.annual), { bold: true, right: true })] }),
  );
  rows.push(
    new TableRow({ children: [cell(METHOD_LABELS.generalist, { bold: true }), cell(usd(t.generalist.rate), { right: true }), cell(usd(t.generalist.daily), { right: true }), cell(usd(t.generalist.weekly), { right: true }), cell(usd(t.generalist.annual), { bold: true, right: true })] }),
  );
  rows.push(
    new TableRow({ children: [cell(METHOD_LABELS.composite, { bold: true }), cell(usd(t.composite.rate), { right: true }), cell(usd(t.composite.daily), { right: true }), cell(usd(t.composite.weekly), { right: true }), cell(usd(t.composite.annual), { bold: true, right: true })] }),
  );
  return table(rows);
}

export function buildDocxDocument(result) {
  const note = sampleNote(result);
  const children = [
    new Paragraph({ text: HSV_TITLE, heading: HeadingLevel.TITLE }),
    para(HSV_PREPARED_BY, { italics: true, size: 18, color: "555555" }),
    para(vintageLine(result), { size: 18, color: "555555" }),
    spacer(),
    new Paragraph({ text: "Inputs", heading: HeadingLevel.HEADING_2 }),
    inputsTable(result),
    spacer(),
    new Paragraph({ text: "Hours and replacement wages by activity", heading: HeadingLevel.HEADING_2 }),
    hoursTable(result),
    para(note.base + ` (total ${num(result.valuation.totals.hoursDay)} hours per day).`, { size: 18, color: "555555" }),
  ];
  if (note.warning) children.push(para(note.warning, { size: 18, color: "8A5612" }));
  children.push(
    spacer(),
    new Paragraph({ text: "Annual valuation by method", heading: HeadingLevel.HEADING_2 }),
    totalsTable(result),
    spacer(),
    new Paragraph({ text: "Methodology", heading: HeadingLevel.HEADING_2 }),
    para(methodologySummary(result)),
    spacer(),
    new Paragraph({ text: "Citations", heading: HeadingLevel.HEADING_2 }),
    ...citations(result).map((c) => para(c, { size: 18 })),
    spacer(),
    para(
      "Informational planning tool only; not a substitute for an expert opinion, report, or testimony. Assumptions vary by case facts and jurisdiction.",
      { italics: true, size: 16, color: "777777" },
    ),
  );

  return new Document({
    creator: "KW Household Services Valuator",
    title: HSV_TITLE,
    sections: [{ children }],
  });
}

/** Browser path: returns a Blob for download. */
export function buildDocxBlob(result) {
  return Packer.toBlob(buildDocxDocument(result));
}

/** Node path (tests): returns a Buffer. */
export function buildDocxBuffer(result) {
  return Packer.toBuffer(buildDocxDocument(result));
}
