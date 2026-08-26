// Minimal QR Code encoder: BYTE mode, error-correction level H, versions 1-6.
// Written in-repo on purpose: the site ships zero runtime dependencies and this
// project adds no npm package for a one-off print asset (decision recorded in
// docs/superpowers/plans/2026-07-28-qr-clio-grow-raffle.md). The narrow scope is
// what makes that safe - byte mode at level H up to version 6 covers every
// /raffle?event=<slug> URL (58 bytes) and stops short of the version-information
// blocks that exist only from version 7 up.
//
// Tables restated from ISO/IEC 18004. Correctness is pinned by
// scripts/lib/qr-encode.test.mjs: a round-trip decoder (data walk + mask +
// interleave + header) plus an independent Reed-Solomon divisibility check.

// Per version at level H: total codewords and the block layout
// [[blockCount, dataCodewordsPerBlock], ...]. data + ec always equals total.
export const VERSIONS_H = {
  1: { total: 26, ecPerBlock: 17, blocks: [[1, 9]] },
  2: { total: 44, ecPerBlock: 28, blocks: [[1, 16]] },
  3: { total: 70, ecPerBlock: 22, blocks: [[2, 13]] },
  4: { total: 100, ecPerBlock: 16, blocks: [[4, 9]] },
  5: { total: 134, ecPerBlock: 22, blocks: [[2, 11], [2, 12]] },
  6: { total: 172, ecPerBlock: 28, blocks: [[4, 15]] },
};

const ALIGNMENT_CENTERS = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };

// The eight data mask predicates (dark when true).
export const MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

// GF(256) with the QR primitive polynomial 0x11d.
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
}
const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

/** Reed-Solomon generator polynomial of the given degree, highest term first. */
export function generatorPoly(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

/** The `ecLen` error-correction codewords for one data block. */
export function ecCodewords(data, ecLen) {
  const gen = generatorPoly(ecLen);
  const buf = new Array(data.length + ecLen).fill(0);
  for (let i = 0; i < data.length; i++) buf[i] = data[i];
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef === 0) continue;
    for (let j = 0; j < gen.length; j++) buf[i + j] ^= gfMul(gen[j], coef);
  }
  return buf.slice(data.length);
}

const dataCapacity = (version) => VERSIONS_H[version].blocks.reduce((n, [count, len]) => n + count * len, 0);

// Byte capacity = data codewords minus the 12-bit mode + count header.
const byteCapacity = (version) => dataCapacity(version) - 2;

function pickVersion(byteLength) {
  for (const version of [1, 2, 3, 4, 5, 6]) {
    if (byteLength <= byteCapacity(version)) return version;
  }
  throw new Error(
    `QR payload too long: ${byteLength} bytes exceeds the ${byteCapacity(6)}-byte ceiling of version 6 at EC level H`,
  );
}

/** Mode indicator + 8-bit count + payload, terminated and pad-filled. */
function dataCodewords(bytes, version) {
  const total = dataCapacity(version);
  const bits = [];
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  push(0b0100, 4); // byte mode
  push(bytes.length, 8); // count: 8 bits for byte mode at versions 1-9
  for (const b of bytes) push(b, 8);
  const capacity = total * 8;
  for (let i = 0; i < 4 && bits.length < capacity; i++) bits.push(0); // terminator
  while (bits.length % 8 !== 0) bits.push(0);
  const out = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    out.push(byte);
  }
  const PAD = [0xec, 0x11];
  let padIndex = 0;
  while (out.length < total) out.push(PAD[padIndex++ % 2]);
  return out;
}

/** Interleaves the blocks' data codewords, then their EC codewords. */
function interleave(version, data) {
  const info = VERSIONS_H[version];
  const blocks = [];
  let offset = 0;
  for (const [count, len] of info.blocks) {
    for (let i = 0; i < count; i++) {
      const chunk = data.slice(offset, offset + len);
      offset += len;
      blocks.push({ data: chunk, ec: ecCodewords(chunk, info.ecPerBlock) });
    }
  }
  const out = [];
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < maxData; i++) {
    for (const block of blocks) if (i < block.data.length) out.push(block.data[i]);
  }
  for (let i = 0; i < info.ecPerBlock; i++) {
    for (const block of blocks) out.push(block.ec[i]);
  }
  return out;
}

/**
 * Finder + separator + timing + alignment patterns, the dark module, and the
 * reserved format-information cells. Exported so the test's round-trip decoder
 * can skip exactly the cells the encoder skipped.
 */
export function buildFunctionLayer(version) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Uint8Array(size));
  const reserved = Array.from({ length: size }, () => new Uint8Array(size));
  const set = (r, c, v) => {
    if (r < 0 || r >= size || c < 0 || c >= size) return;
    modules[r][c] = v;
    reserved[r][c] = 1;
  };
  for (const [row, col] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const ring = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6);
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        set(row + r, col + c, ring || core ? 1 : 0);
      }
    }
  }
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0 ? 1 : 0);
    set(i, 6, i % 2 === 0 ? 1 : 0);
  }
  const centers = ALIGNMENT_CENTERS[version];
  for (const r of centers) {
    for (const c of centers) {
      // Skip any alignment pattern that would overlap a finder.
      if ((r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) === 1 ? 0 : 1);
        }
      }
    }
  }
  set(size - 8, 8, 1); // dark module
  // Reserve (do not yet write) the format-information cells so the data walk
  // skips them and the mask never touches them.
  for (let i = 0; i <= 8; i++) {
    reserved[i][8] = 1;
    reserved[8][i] = 1;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = 1;
    reserved[size - 1 - i][8] = 1;
  }
  return { modules, reserved, size };
}

/** Two-column upward/downward zigzag from the bottom-right, skipping column 6. */
function placeData(modules, reserved, codewords) {
  const size = modules.length;
  let bitIndex = 0;
  const nextBit = () => {
    const byte = codewords[bitIndex >> 3];
    const bit = byte === undefined ? 0 : (byte >> (7 - (bitIndex & 7))) & 1;
    bitIndex++;
    return bit;
  };
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5; // the vertical timing column is not a data column
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const col of [right, right - 1]) {
        if (reserved[row][col]) continue;
        modules[row][col] = nextBit();
      }
    }
    upward = !upward;
  }
}

/** BCH(15,5) format information for level H plus the mask, XOR'd with 0x5412. */
function formatBits(mask) {
  const data = (0b10 << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

function placeFormat(modules, mask) {
  const size = modules.length;
  const bits = formatBits(mask);
  const bit = (i) => (bits >> i) & 1;
  // Copy 1: down the left of the top-left finder, then across beneath it.
  for (let i = 0; i <= 5; i++) modules[i][8] = bit(i);
  modules[7][8] = bit(6);
  modules[8][8] = bit(7);
  modules[8][7] = bit(8);
  for (let i = 9; i < 15; i++) modules[8][14 - i] = bit(i);
  // Copy 2: under the top-right finder, then up beside the bottom-left one.
  for (let i = 0; i < 8; i++) modules[8][size - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) modules[size - 15 + i][8] = bit(i);
  modules[size - 8][8] = 1; // dark module, always set
}

/** Mask-selection penalty (ISO/IEC 18004 rules 1-4). Lower is better. */
function penalty(m) {
  const size = m.length;
  let score = 0;
  for (const transpose of [false, true]) {
    for (let a = 0; a < size; a++) {
      let run = 1;
      for (let b = 1; b < size; b++) {
        const prev = transpose ? m[b - 1][a] : m[a][b - 1];
        const cur = transpose ? m[b][a] : m[a][b];
        if (cur === prev) {
          run++;
          if (run === 5) score += 3;
          else if (run > 5) score += 1;
        } else {
          run = 1;
        }
      }
    }
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
    }
  }
  const A = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const B = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  const matches = (get, start) => A.every((v, i) => get(start + i) === v) || B.every((v, i) => get(start + i) === v);
  for (let a = 0; a < size; a++) {
    for (let b = 0; b + 11 <= size; b++) {
      if (matches((i) => m[a][i], b)) score += 40;
      if (matches((i) => m[i][a], b)) score += 40;
    }
  }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) dark += m[r][c];
  score += Math.floor(Math.abs((dark * 100) / (size * size) - 50) / 5) * 10;
  return score;
}

/** Encodes `text` as a byte-mode, level-H QR matrix. Throws past 58 bytes. */
export function encodeQr(text) {
  const bytes = [...new TextEncoder().encode(String(text))];
  const version = pickVersion(bytes.length);
  const codewords = interleave(version, dataCodewords(bytes, version));
  const { modules, reserved } = buildFunctionLayer(version);
  placeData(modules, reserved, codewords);
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const candidate = modules.map((row) => Uint8Array.from(row));
    for (let r = 0; r < candidate.length; r++) {
      for (let c = 0; c < candidate.length; c++) {
        if (!reserved[r][c] && MASKS[mask](r, c)) candidate[r][c] ^= 1;
      }
    }
    placeFormat(candidate, mask);
    const score = penalty(candidate);
    if (!best || score < best.score) best = { score, mask, modules: candidate };
  }
  return { version, size: version * 4 + 17, mask: best.mask, modules: best.modules };
}

/** SVG path data, one rect per horizontal dark run (matches Payment.tsx's QR_PATH style). */
export function modulesToPath(modules) {
  const parts = [];
  for (let r = 0; r < modules.length; r++) {
    let c = 0;
    while (c < modules[r].length) {
      if (!modules[r][c]) {
        c++;
        continue;
      }
      let run = 1;
      while (c + run < modules[r].length && modules[r][c + run]) run++;
      parts.push(`M${c} ${r}h${run}v1H${c}z`);
      c += run;
    }
  }
  return parts.join("");
}
