import { describe, expect, it } from "vitest";
import { inflateSync } from "node:zlib";
import { qrPng } from "./qr-png.mjs";

function chunks(png) {
  const out = {};
  let offset = 8;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString("latin1");
    const data = png.subarray(offset + 8, offset + 8 + length);
    out[type] = out[type] ? Buffer.concat([out[type], data]) : data;
    offset += 12 + length;
  }
  return out;
}

const MODULES = [Uint8Array.from([1, 0]), Uint8Array.from([0, 1])];

describe("qrPng", () => {
  it("writes a valid PNG signature and IHDR sized by scale + quiet zone", () => {
    const png = qrPng(MODULES, { scale: 2, quietZone: 1 });
    expect(png.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const ihdr = chunks(png).IHDR;
    expect(ihdr.readUInt32BE(0)).toBe(8); // (2 modules + 2 * 1 quiet) * 2 px
    expect(ihdr.readUInt32BE(4)).toBe(8);
    expect(ihdr[8]).toBe(8); // 8-bit depth
    expect(ihdr[9]).toBe(2); // truecolour RGB
  });

  it("inflates to one filter-0 scanline per pixel row with the expected colours", () => {
    const png = qrPng(MODULES, { scale: 1, quietZone: 0, dark: [26, 39, 68], light: [255, 255, 255] });
    const raw = inflateSync(chunks(png).IDAT);
    expect(raw).toHaveLength(2 * (1 + 2 * 3));
    expect(raw[0]).toBe(0); // filter byte
    expect([...raw.subarray(1, 4)]).toEqual([26, 39, 68]); // dark module
    expect([...raw.subarray(4, 7)]).toEqual([255, 255, 255]); // light module
    expect(raw[7]).toBe(0); // second scanline filter byte
    expect([...raw.subarray(8, 11)]).toEqual([255, 255, 255]);
  });

  it("scales each module into a square block", () => {
    const png = qrPng([Uint8Array.from([1])], { scale: 3, quietZone: 0 });
    const raw = inflateSync(chunks(png).IDAT);
    expect(raw).toHaveLength(3 * (1 + 3 * 3));
    for (let row = 0; row < 3; row++) {
      const start = row * 10;
      expect(raw[start]).toBe(0);
      expect([...raw.subarray(start + 1, start + 10)]).toEqual([26, 39, 68, 26, 39, 68, 26, 39, 68]);
    }
  });
});
