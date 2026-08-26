/**
 * Regenerate lib/life-tables-2023.mjs (the committed, typed life-table data asset).
 *
 * PROVENANCE
 * ----------
 * Source data: CDC/NCHS, United States Life Tables, 2023 - National Vital
 * Statistics Reports, Vol. 74, No. 6 (July 15, 2025), Tables 1 through 18.
 * Companion spreadsheets: ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/NVSR/74-06/
 * (Table01.xlsx through Table18.xlsx). DOI 10.15620/cdc/174591.
 * These are works of the United States Government and are in the public domain.
 *
 * This script does NOT fetch the CDC spreadsheets. Its input is a prior derived
 * artifact - the TPLCP-LifeTables public/data.js file, which already carries the
 * Tables 1-18 ex/lx arrays as a plain object literal. The transform is purely
 * mechanical: extract the `const LIFE_TABLES = {...}` object literal, parse it as
 * JSON, validate it, and re-emit it as an ESM module (`export const LIFE_TABLES`)
 * plus an `EDITION` citation block. No UI text, branding, or report language is
 * copied - only the public-domain numeric tables and their structure.
 *
 * The regenerated asset (lib/life-tables-2023.mjs) is COMMITTED, like the files
 * under src/data. Because the CDC source is not in this repo, this generator is
 * intentionally NOT part of `npm run build` - it is run by hand only when CDC
 * publishes a new edition. That keeps the Docker/Railway build reproducible.
 *
 * USAGE
 *   node scripts/generate-life-tables.mjs [path-to-source-data.js]
 * The optional argument is the derived source (default: the sibling
 * ../TPLCP-LifeTables/public/data.js relative to this repo root). The source is
 * environment-specific and is not tracked here.
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "lib", "life-tables-2023.mjs");
const DEFAULT_SOURCE = join(ROOT, "..", "TPLCP-LifeTables", "public", "data.js");

const EDITION = {
  title: "United States Life Tables, 2023",
  series: "National Vital Statistics Reports, Vol. 74, No. 6",
  year: 2023,
  publisher: "CDC/NCHS",
  url: "https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-06.pdf",
};

// Group and sex ordering emitted into the asset (CDC Tables 1-18 order:
// all/hispanic/aian/asian/black/white, each total/male/female).
const GROUP_ORDER = ["all", "hispanic", "aian", "asian", "black", "white"];
const SEX_ORDER = ["total", "male", "female"];

function fail(msg) {
  console.error(`generate-life-tables: ${msg}`);
  process.exit(1);
}

const sourcePath = resolve(process.argv[2] || DEFAULT_SOURCE);
let sourceText;
try {
  sourceText = readFileSync(sourcePath, "utf8");
} catch {
  fail(
    `could not read source data at ${sourcePath}. Pass the path to the derived ` +
      `CDC life-table data.js as the first argument.`,
  );
}

// Extract the object literal assigned to LIFE_TABLES. The source uses all
// double-quoted keys and plain JSON values, so the literal parses as JSON. This
// is module-system independent (the source file is ESM in its own repo, so a
// plain require() would not surface its CommonJS export).
const match = sourceText.match(/const\s+LIFE_TABLES\s*=\s*(\{[\s\S]*?\});/);
if (!match) fail("could not locate `const LIFE_TABLES = {...};` in the source.");

let tables;
try {
  tables = JSON.parse(match[1]);
} catch (err) {
  fail(`the LIFE_TABLES literal did not parse as JSON: ${err.message}`);
}

// -------- Validate before emitting (fail loudly on a malformed source) --------
let leafCount = 0;
const seenTableNumbers = new Set();
for (const group of GROUP_ORDER) {
  if (!tables[group]) fail(`source is missing group "${group}".`);
  for (const sex of SEX_ORDER) {
    const leaf = tables[group][sex];
    if (!leaf) fail(`source is missing ${group}/${sex}.`);
    if (!Array.isArray(leaf.ex) || leaf.ex.length !== 101) {
      fail(`${group}/${sex} ex must be a length-101 array (got ${leaf.ex?.length}).`);
    }
    if (!Array.isArray(leaf.lx) || leaf.lx.length !== 101) {
      fail(`${group}/${sex} lx must be a length-101 array (got ${leaf.lx?.length}).`);
    }
    if (!(leaf.table >= 1 && leaf.table <= 18)) {
      fail(`${group}/${sex} table number out of range: ${leaf.table}.`);
    }
    if (seenTableNumbers.has(leaf.table)) fail(`duplicate table number ${leaf.table}.`);
    seenTableNumbers.add(leaf.table);
    for (const v of leaf.ex) if (!Number.isFinite(v)) fail(`${group}/${sex} ex has a non-finite value.`);
    for (const v of leaf.lx) if (!Number.isFinite(v)) fail(`${group}/${sex} lx has a non-finite value.`);
    leafCount += 1;
  }
}
if (leafCount !== 18) fail(`expected 18 leaf tables, found ${leafCount}.`);

// -------- Emit the ESM asset --------
const arr = (a) => `[${a.join(", ")}]`;
const leafBlock = (leaf, indent) =>
  [
    `${indent}table: ${leaf.table},`,
    `${indent}ex: ${arr(leaf.ex)},`,
    `${indent}lx: ${arr(leaf.lx)},`,
  ].join("\n");

const groupBlocks = GROUP_ORDER.map((group) => {
  const sexBlocks = SEX_ORDER.map(
    (sex) => `    ${sex}: {\n${leafBlock(tables[group][sex], "      ")}\n    },`,
  ).join("\n");
  return `  ${group}: {\n${sexBlocks}\n  },`;
}).join("\n");

const header = `// United States Life Tables, 2023 - National Vital Statistics Reports, Vol. 74,
// No. 6 (CDC/NCHS, July 15, 2025), Tables 1-18. Public-domain work of the U.S.
// Government. DOI 10.15620/cdc/174591.
//
// Companion spreadsheets: ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/NVSR/74-06/
// (Table01.xlsx .. Table18.xlsx). ex = expectation of life at exact age x (years,
// one decimal); lx = number surviving to exact age x out of 100,000 born alive.
// Array index = age 0..100; the final entry (index 100) is "100 years and older".
//
// COMMITTED, DERIVED asset. Do not hand-edit. Regenerate with:
//   node scripts/generate-life-tables.mjs [path-to-source-data.js]
`;

const body = `${header}
export const LIFE_TABLES = {
${groupBlocks}
};

export const EDITION = ${JSON.stringify(EDITION, null, 2).replace(/\n/g, "\n")};
`;

writeFileSync(OUT, body, "utf8");
console.log(
  `generate-life-tables: wrote ${OUT} (${leafCount} tables, edition ${EDITION.year}) from ${sourcePath}`,
);
