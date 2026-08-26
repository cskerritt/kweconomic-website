// Print asset for the conference raffle: a level-H QR code that encodes
// /raffle?event=<slug>. Zero dependencies (scripts/lib/qr-encode.mjs +
// scripts/lib/qr-png.mjs). Writes docs/raffle-qr/<event>.svg and .png.
//
// The SVG is the PRINT MASTER: vector, quiet zone, and the KWVRS wordmark
// beneath the code - fully BELOW the quiet zone, never intruding into it (the
// geometry lives in scripts/lib/qr-svg.mjs and is pinned by its own test). The
// PNG is a raster companion for slides and email and carries the code plus its
// quiet zone only - rendering text into a raster without a font library is not
// something a zero-dependency script should fake.
//
// Run (Node 22):
//   node scripts/generate-raffle-qr.mjs
//   node scripts/generate-raffle-qr.mjs --event "NJAJ 2026"
//   node scripts/generate-raffle-qr.mjs --base-url http://localhost:3000
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_RAFFLE_EVENT, normalizeEventSlug, raffleUrl } from "../lib/raffle.mjs";
import { encodeQr, modulesToPath } from "./lib/qr-encode.mjs";
import { qrPng } from "./lib/qr-png.mjs";
import { QUIET_MODULES, raffleQrSvg } from "./lib/qr-svg.mjs";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(REPO_ROOT, "docs", "raffle-qr");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const event = normalizeEventSlug(arg("event", DEFAULT_RAFFLE_EVENT));
const baseUrl = arg("base-url", "https://kwvrs.com");
const url = raffleUrl(baseUrl, event);
const qr = encodeQr(url);

const svg = raffleQrSvg(modulesToPath(qr.modules), qr.size);

mkdirSync(OUT_DIR, { recursive: true });
const svgPath = join(OUT_DIR, `${event}.svg`);
const pngPath = join(OUT_DIR, `${event}.png`);
writeFileSync(svgPath, svg + "\n");
writeFileSync(pngPath, qrPng(qr.modules, { scale: 24, quietZone: QUIET_MODULES, dark: [26, 39, 68] }));

console.log(`event:   ${event}`);
console.log(`url:     ${url} (${new TextEncoder().encode(url).length} bytes)`);
console.log(`qr:      version ${qr.version}, ${qr.size}x${qr.size} modules, EC level H, mask ${qr.mask}`);
console.log(`written: ${svgPath}`);
console.log(`written: ${pngPath}`);
console.log("Verify by scanning the PNG with a phone before sending anything to print.");
