// Minimal PNG writer for a QR matrix: 8-bit truecolour, filter 0, one IDAT.
// Zero dependencies - node:zlib supplies the deflate stream PNG already
// specifies, and the CRC table is eight lines. Used by
// scripts/generate-raffle-qr.mjs for the raster companion to the print SVG.
import { deflateSync } from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

/**
 * Renders a QR module matrix to a PNG Buffer. `scale` is pixels per module and
 * `quietZone` is the mandatory light border in modules (4 is the spec minimum).
 */
export function qrPng(modules, { scale = 8, quietZone = 4, dark = [26, 39, 68], light = [255, 255, 255] } = {}) {
  const count = modules.length;
  const px = (count + quietZone * 2) * scale;
  const raw = Buffer.alloc(px * (1 + px * 3));
  let offset = 0;
  for (let y = 0; y < px; y++) {
    raw[offset++] = 0; // filter type 0 (none)
    const row = Math.floor(y / scale) - quietZone;
    for (let x = 0; x < px; x++) {
      const col = Math.floor(x / scale) - quietZone;
      const isDark = row >= 0 && row < count && col >= 0 && col < count && modules[row][col] === 1;
      const [r, g, b] = isDark ? dark : light;
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px, 0);
  ihdr.writeUInt32BE(px, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour RGB
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace
  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
