#!/usr/bin/env node
// Generate .webp next to each raster image under public/team + public/images.
//
// The originals are KEPT (the <Picture> component falls back to them, and og:image
// / JSON-LD `image` fields still reference the .jpg/.png). Run this locally after
// adding or replacing an image, then COMMIT the generated .webp files - the Railway
// build does not run cwebp, it just serves the committed files.
//
// Requires cwebp:  brew install webp
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const DIRS = ["public/team", "public/images"];
const SKIP = new Set(["logo.png"]); // keep PNG raster for Organization structured data
const RASTER = /\.(jpe?g|png)$/i;
const QUALITY = "82"; // visual/size sweet spot for photographic content

function resolveCwebp() {
  const candidates = [
    "cwebp",
    `${process.env.HOME}/.homebrew/bin/cwebp`,
    "/opt/homebrew/bin/cwebp",
    "/usr/local/bin/cwebp",
  ];
  for (const p of candidates) {
    try {
      execFileSync(p, ["-version"], { stdio: "ignore" });
      return p;
    } catch {
      /* try next */
    }
  }
  throw new Error("cwebp not found on PATH - install it with: brew install webp");
}

const cwebp = resolveCwebp();
let converted = 0;
let skipped = 0;
let savedBytes = 0;

for (const dir of DIRS) {
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    if (!RASTER.test(name) || SKIP.has(name)) continue;
    const src = join(dir, name);
    const out = src.replace(RASTER, ".webp");
    // Idempotent: skip when an up-to-date .webp already exists.
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) {
      skipped += 1;
      continue;
    }
    execFileSync(cwebp, ["-q", QUALITY, "-m", "6", "-quiet", src, "-o", out]);
    const before = statSync(src).size;
    const after = statSync(out).size;
    savedBytes += before - after;
    converted += 1;
    console.log(`${src} -> ${out}  (${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB)`);
  }
}

console.log(
  `\nConverted ${converted}, skipped ${skipped} (up-to-date). ` +
    `Transfer saved on converted files: ${(savedBytes / 1024 / 1024).toFixed(2)} MB.`,
);
