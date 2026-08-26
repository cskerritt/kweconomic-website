import { describe, expect, it } from "vitest";
import { MASKS, VERSIONS_H, buildFunctionLayer, ecCodewords, encodeQr, modulesToPath } from "./qr-encode.mjs";

const URL_DEFAULT = "https://kwvrs.com/raffle";
const URL_EVENT = "https://kwvrs.com/raffle?event=njaj-boardwalk-2026";

/**
 * Independent decoder: reverses the data walk, the mask, and the block
 * interleave, then parses the byte-mode header. It ignores the error-correction
 * codewords (those are checked algebraically below), so between the two a QR
 * that passes cannot be structurally wrong.
 */
function decodeQr({ modules, version, mask }) {
  const { reserved } = buildFunctionLayer(version);
  const size = modules.length;
  const bits = [];
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const col of [right, right - 1]) {
        if (reserved[row][col]) continue;
        bits.push(modules[row][col] ^ (MASKS[mask](row, col) ? 1 : 0));
      }
    }
    upward = !upward;
  }
  const stream = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    stream.push(byte);
  }
  const sizes = [];
  for (const [count, len] of VERSIONS_H[version].blocks) for (let i = 0; i < count; i++) sizes.push(len);
  const blocks = sizes.map(() => []);
  let idx = 0;
  for (let i = 0; i < Math.max(...sizes); i++) {
    for (let b = 0; b < sizes.length; b++) if (i < sizes[b]) blocks[b].push(stream[idx++]);
  }
  const dataBits = [];
  for (const byte of blocks.flat()) for (let j = 7; j >= 0; j--) dataBits.push((byte >> j) & 1);
  const read = (offset, length) => dataBits.slice(offset, offset + length).reduce((n, b) => (n << 1) | b, 0);
  const length = read(4, 8);
  const bytes = [];
  for (let i = 0; i < length; i++) bytes.push(read(12 + i * 8, 8));
  return { mode: read(0, 4), text: Buffer.from(bytes).toString("utf8") };
}

describe("encodeQr version selection", () => {
  it("picks the smallest level-H version that fits the payload", () => {
    expect(encodeQr("x".repeat(7)).version).toBe(1);
    expect(encodeQr("x".repeat(8)).version).toBe(2);
    expect(encodeQr("x".repeat(44)).version).toBe(5);
    expect(encodeQr("x".repeat(45)).version).toBe(6);
    expect(encodeQr("x".repeat(58)).version).toBe(6);
  });

  it("throws a precise error past the version-6 ceiling", () => {
    expect(() => encodeQr("x".repeat(59))).toThrow(/59 bytes/);
  });

  it("sizes the matrix at 4 * version + 17", () => {
    const qr = encodeQr(URL_EVENT);
    expect(qr.size).toBe(qr.version * 4 + 17);
    expect(qr.modules).toHaveLength(qr.size);
    expect(qr.modules[0]).toHaveLength(qr.size);
  });
});

describe("encodeQr function patterns", () => {
  const qr = encodeQr(URL_EVENT);

  it("places the three finder patterns with their separators", () => {
    for (const [r, c] of [[0, 0], [0, qr.size - 7], [qr.size - 7, 0]]) {
      expect(qr.modules[r][c]).toBe(1); // outer ring
      expect(qr.modules[r + 1][c + 1]).toBe(0); // light gap
      expect(qr.modules[r + 3][c + 3]).toBe(1); // dark core
    }
    expect(qr.modules[7][0]).toBe(0); // separator below the top-left finder
  });

  it("alternates the timing patterns", () => {
    expect(qr.modules[6][8]).toBe(1);
    expect(qr.modules[6][9]).toBe(0);
    expect(qr.modules[8][6]).toBe(1);
    expect(qr.modules[9][6]).toBe(0);
  });

  it("always sets the dark module", () => {
    expect(qr.modules[qr.size - 8][8]).toBe(1);
  });
});

describe("encodeQr format information", () => {
  it("writes a BCH-valid level-H format string, identically in both copies", () => {
    const { modules, size, mask } = encodeQr(URL_EVENT);
    let copy2 = 0;
    for (let i = 0; i < 8; i++) copy2 |= modules[8][size - 1 - i] << i;
    for (let i = 8; i < 15; i++) copy2 |= modules[size - 15 + i][8] << i;

    let copy1 = 0;
    for (let i = 0; i <= 5; i++) copy1 |= modules[i][8] << i;
    copy1 |= modules[7][8] << 6;
    copy1 |= modules[8][8] << 7;
    copy1 |= modules[8][7] << 8;
    for (let i = 9; i < 15; i++) copy1 |= modules[8][14 - i] << i;
    expect(copy1).toBe(copy2);

    const unmasked = copy2 ^ 0x5412;
    expect(unmasked >> 10).toBe((0b10 << 3) | mask); // EC level H (0b10) + the chosen mask
    let rem = unmasked;
    for (let i = 14; i >= 10; i--) if ((rem >> i) & 1) rem ^= 0x537 << (i - 10);
    expect(rem).toBe(0); // BCH(15,5) parity checks out
  });
});

describe("encodeQr round trip", () => {
  it("decodes back to the exact URL, for the default and a named event", () => {
    for (const text of [URL_DEFAULT, URL_EVENT, "https://kwvrs.com/raffle?event=a"]) {
      const qr = encodeQr(text);
      const decoded = decodeQr(qr);
      expect(decoded.mode).toBe(0b0100); // byte mode
      expect(decoded.text).toBe(text);
    }
  });

  it("uses a mask in range and produces a genuinely masked matrix", () => {
    const qr = encodeQr(URL_EVENT);
    expect(qr.mask).toBeGreaterThanOrEqual(0);
    expect(qr.mask).toBeLessThanOrEqual(7);
    const dark = qr.modules.reduce((n, row) => n + row.reduce((m, v) => m + v, 0), 0);
    const ratio = dark / (qr.size * qr.size);
    expect(ratio).toBeGreaterThan(0.3);
    expect(ratio).toBeLessThan(0.7);
  });
});

describe("Reed-Solomon parity", () => {
  it("produces codeword blocks divisible by the generator polynomial", () => {
    // Independent GF(256) arithmetic and long division: a wrong parity table
    // would sail through the round trip above (which ignores EC) and then fail
    // every real scanner.
    const EXP = new Array(255);
    const LOG = new Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    const mul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[(LOG[a] + LOG[b]) % 255]);

    for (const ecLen of [16, 17, 22, 28]) {
      let gen = [1];
      for (let i = 0; i < ecLen; i++) {
        const next = new Array(gen.length + 1).fill(0);
        for (let j = 0; j < gen.length; j++) {
          next[j] ^= gen[j];
          next[j + 1] ^= mul(gen[j], EXP[i]);
        }
        gen = next;
      }
      const data = Array.from({ length: 13 }, (_, i) => (i * 37 + 11) & 0xff);
      const rem = [...data, ...ecCodewords(data, ecLen)];
      for (let i = 0; i + gen.length <= rem.length; i++) {
        const coef = rem[i];
        if (!coef) continue;
        for (let j = 0; j < gen.length; j++) rem[i + j] ^= mul(gen[j], coef);
      }
      expect(rem.slice(-(gen.length - 1)).every((v) => v === 0)).toBe(true);
    }
  });
});

describe("modulesToPath", () => {
  it("emits one run-length rect per horizontal dark run", () => {
    const modules = [Uint8Array.from([1, 1, 0, 1]), Uint8Array.from([0, 0, 0, 0])];
    expect(modulesToPath(modules)).toBe("M0 0h2v1H0zM3 0h1v1H3z");
  });

  it("emits nothing for an all-light matrix", () => {
    expect(modulesToPath([Uint8Array.from([0, 0])])).toBe("");
  });
});
