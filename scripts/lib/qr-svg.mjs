// Print-master SVG layout for the raffle QR poster. Pure: no I/O, no argv - the
// numbers are testable on their own (scripts/lib/qr-svg.test.mjs), which is the
// point, because getting them wrong makes a printed code unreadable.
//
// A QR code is only decodable when its QUIET ZONE - the 4-module light border
// the spec mandates on every side - stays empty. The caption is therefore laid
// out from the BOTTOM of that quiet zone, not from the bottom of the code, and
// remember that an SVG text `y` is a BASELINE: the glyphs rise above it by the
// font's ascent, so the baseline must sit at least one ascent lower still.
//
// WIDTH matters as much as height: the canvas is only `size + 8` modules wide
// and an outer <svg> CLIPS at the viewBox, so a line wider than the canvas
// prints truncated (the original single-line company name measured ~65 modules
// on a 37-module canvas - 43% clipped off the print master). Every caption
// line therefore passes through fitFontSize(), which shrinks the font until a
// CONSERVATIVE advance-width bound fits inside the side margins. The bound
// (0.55 em per character) overestimates every font in both stacks (Georgia
// measures ~0.45, Helvetica ~0.41), so a line that passes the bound cannot
// clip in any of them.
export const QUIET_MODULES = 4; // spec minimum light border, in modules
export const MODULE_PX = 24; // pixels per module for the width/height attributes
export const WORDMARK_FONT_SIZE = 2.6; // modules - the "KWVRS" wordmark line
export const NAME_FONT_SIZE = 1.4; // modules - the wrapped full company name
export const SUBCAPTION_FONT_SIZE = 2; // modules
// Conservative upper bounds, as fractions of font-size. Real ascents run ~0.75
// and real average advances ~0.41-0.45; the slack keeps the invariants honest.
export const ASCENT_RATIO = 0.8;
export const DESCENT_RATIO = 0.25;
export const MAX_ADVANCE_RATIO = 0.55;
export const SIDE_MARGIN = 1; // modules of guaranteed white left+right of text
export const CAPTION_CLEARANCE = 0.5; // extra breathing room below the quiet zone
export const LINE_GAP = 0.5; // white between one line's descent and the next ascent
export const BOTTOM_MARGIN = 1; // white below the last descender

export const NAVY = "#1a2744";
export const SUBCAPTION_FILL = "#5a6478";
export const WORDMARK_TEXT = "KWVRS";
// The full company name wraps to two lines so it FITS the canvas instead of
// clipping (content rule: the full name appears; "KWVRS" is the wordmark).
export const NAME_LINES = ["Kincaid Wolstein Vocational and", "Rehabilitation Services"];
export const SUBCAPTION_TEXT = "Scan to enter the gift card raffle";
export const ARIA_LABEL = "Scan to enter the KWVRS gift card raffle";

// Round UP to two decimals: the clearance invariants are >= comparisons, and
// rounding down by a float hair would break them.
const ceil2 = (n) => Math.ceil(n * 100) / 100;
// Fitted font sizes round DOWN: rounding up could re-break the width fit.
const floor2 = (n) => Math.floor(n * 100) / 100;

/**
 * The largest font size (capped at `maxSize`) at which `text` provably fits
 * inside `availWidth` modules under the conservative advance bound.
 */
export function fitFontSize(text, maxSize, availWidth) {
  const bound = availWidth / (String(text).length * MAX_ADVANCE_RATIO);
  return floor2(Math.min(maxSize, bound));
}

/** Worst-case rendered width of a line, in modules (the fit invariant's LHS). */
export function boundedLineWidth(text, fontSize) {
  return String(text).length * fontSize * MAX_ADVANCE_RATIO;
}

/**
 * Geometry for a `size` x `size` module matrix, in module units. Returns the
 * canvas box, the quiet-zone floor, and one { text, fontSize, baseline, serif,
 * fill } entry per caption line, top to bottom. Every line's bounded width
 * fits inside `width - 2 * SIDE_MARGIN` by construction (fitFontSize), and
 * every baseline clears the line above by ascent + descent + LINE_GAP.
 */
export function qrSvgLayout(size) {
  const width = size + QUIET_MODULES * 2;
  const avail = width - SIDE_MARGIN * 2;
  const quietZoneBottom = QUIET_MODULES + size + QUIET_MODULES;

  const lines = [];
  let cursor = quietZoneBottom + CAPTION_CLEARANCE;
  const push = (text, maxSize, serif, fill) => {
    const fontSize = fitFontSize(text, maxSize, avail);
    const baseline = ceil2(cursor + fontSize * ASCENT_RATIO);
    lines.push({ text, fontSize, baseline, serif, fill });
    cursor = baseline + fontSize * DESCENT_RATIO + LINE_GAP;
  };
  push(WORDMARK_TEXT, WORDMARK_FONT_SIZE, true, NAVY);
  for (const line of NAME_LINES) push(line, NAME_FONT_SIZE, true, NAVY);
  push(SUBCAPTION_TEXT, SUBCAPTION_FONT_SIZE, false, SUBCAPTION_FILL);

  const last = lines[lines.length - 1];
  const height = Math.ceil(last.baseline + last.fontSize * DESCENT_RATIO + BOTTOM_MARGIN);
  return { width, height, avail, quietZoneBottom, lines };
}

/** The full print-master SVG for an already-rendered module path. */
export function raffleQrSvg(pathData, size) {
  const { width, height, lines } = qrSvgLayout(size);
  const serifStack = "Georgia, 'Times New Roman', serif";
  const sansStack = "Helvetica, Arial, sans-serif";
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width * MODULE_PX}" height="${height * MODULE_PX}" role="img" aria-label="${ARIA_LABEL}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<g transform="translate(${QUIET_MODULES},${QUIET_MODULES})" shape-rendering="crispEdges"><path d="${pathData}" fill="${NAVY}"/></g>`,
    ...lines.map(
      (l) =>
        `<text x="${width / 2}" y="${l.baseline}" text-anchor="middle" font-family="${l.serif ? serifStack : sansStack}" font-size="${l.fontSize}" fill="${l.fill}">${l.text}</text>`,
    ),
    `</svg>`,
  ].join("\n");
}
