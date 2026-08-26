// Geometry pins for the raffle QR print master. A QR code is only readable if
// its quiet zone stays EMPTY, so the caption block underneath it must clear
// the bottom quiet zone by at least the font's ascent - a text `y` is a
// BASELINE, and the glyphs sit above it. Width is pinned too: an outer <svg>
// clips at the viewBox, so every line must provably fit the canvas (the
// original single-line company name printed 43% clipped).
import { describe, expect, it } from "vitest";
import {
  ASCENT_RATIO,
  BOTTOM_MARGIN,
  DESCENT_RATIO,
  LINE_GAP,
  MODULE_PX,
  NAME_LINES,
  QUIET_MODULES,
  SIDE_MARGIN,
  SUBCAPTION_TEXT,
  WORDMARK_TEXT,
  boundedLineWidth,
  fitFontSize,
  qrSvgLayout,
  raffleQrSvg,
} from "./qr-svg.mjs";

// Every QR version this encoder can emit (1-6 => 21..41 modules).
const SIZES = [21, 25, 29, 33, 37, 41];

describe("fitFontSize", () => {
  it("caps at the requested size when the line already fits", () => {
    expect(fitFontSize("KWVRS", 2.6, 35)).toBe(2.6);
  });
  it("shrinks a line that would overflow, rounding DOWN", () => {
    const size = fitFontSize("x".repeat(55), 2.6, 35);
    expect(size).toBeLessThan(2.6);
    expect(boundedLineWidth("x".repeat(55), size)).toBeLessThanOrEqual(35);
  });
});

describe("qrSvgLayout", () => {
  for (const size of SIZES) {
    it(`keeps every caption line out of the quiet zone AND inside the canvas for a ${size}x${size} code`, () => {
      const layout = qrSvgLayout(size);
      const quietZoneBottom = QUIET_MODULES + size + QUIET_MODULES;

      expect(layout.width).toBe(size + QUIET_MODULES * 2);
      expect(layout.quietZoneBottom).toBe(quietZoneBottom);
      expect(layout.lines.length).toBe(2 + NAME_LINES.length);

      let prevBottom = quietZoneBottom + 0.49; // clearance minus float slack
      for (const line of layout.lines) {
        // Vertical: the glyph top (baseline - ascent) starts below the line above.
        expect(line.baseline - line.fontSize * ASCENT_RATIO).toBeGreaterThanOrEqual(prevBottom);
        prevBottom = line.baseline + line.fontSize * DESCENT_RATIO + LINE_GAP - 0.01;
        // Horizontal: the conservative width bound fits inside the side margins.
        expect(boundedLineWidth(line.text, line.fontSize)).toBeLessThanOrEqual(
          layout.width - SIDE_MARGIN * 2 + 0.01,
        );
      }
      const last = layout.lines[layout.lines.length - 1];
      expect(layout.height).toBeGreaterThanOrEqual(last.baseline + last.fontSize * DESCENT_RATIO + BOTTOM_MARGIN);
      expect(Number.isInteger(layout.height)).toBe(true); // integral pixel height at MODULE_PX
    });
  }

  it("renders the wordmark, both company-name lines, and the scan line in order", () => {
    const texts = qrSvgLayout(29).lines.map((l) => l.text);
    expect(texts).toEqual([WORDMARK_TEXT, ...NAME_LINES, SUBCAPTION_TEXT]);
  });

  it("pins the canvas box for the 29x29 default poster", () => {
    const layout = qrSvgLayout(29);
    // 4 + 29 + 4 = 37 modules of code + quiet zone, caption block below it.
    expect(layout.width).toBe(37);
    expect(layout.quietZoneBottom).toBe(37);
    const last = layout.lines[layout.lines.length - 1];
    expect(layout.height).toBe(Math.ceil(last.baseline + last.fontSize * DESCENT_RATIO + BOTTOM_MARGIN));
  });
});

describe("raffleQrSvg", () => {
  const svg = raffleQrSvg("M0 0h1v1H0z", 29);

  it("sizes the viewBox and the pixel dimensions from the layout", () => {
    const layout = qrSvgLayout(29);
    expect(svg).toContain(`viewBox="0 0 ${layout.width} ${layout.height}"`);
    expect(svg).toContain(`width="${layout.width * MODULE_PX}" height="${layout.height * MODULE_PX}"`);
  });

  it("places every text baseline where the layout says", () => {
    const layout = qrSvgLayout(29);
    const baselines = [...svg.matchAll(/<text[^>]*\sy="([\d.]+)"/g)].map((m) => Number(m[1]));
    expect(baselines).toEqual(layout.lines.map((l) => l.baseline));
  });

  it("offsets the code by the quiet zone and uses hyphens, never em dashes", () => {
    expect(svg).toContain(`translate(${QUIET_MODULES},${QUIET_MODULES})`);
    expect(svg).not.toContain("—");
  });
});
