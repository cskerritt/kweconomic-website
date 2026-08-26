// Guard: only the public-domain CDC dataset + interpolation math were ported
// from the TPLCP life-table lookup. No TPLCP UI text, branding, fonts, colors,
// or report/blacklist vocabulary may ship in the three ported files.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const FILES = {
  "src/pages/LifeExpectancy.tsx": readFileSync(join(here, "LifeExpectancy.tsx"), "utf8"),
  "lib/life-expectancy.mjs": readFileSync(join(here, "../../lib/life-expectancy.mjs"), "utf8"),
  "lib/life-tables-2023.mjs": readFileSync(join(here, "../../lib/life-tables-2023.mjs"), "utf8"),
};

// Case-insensitive forbidden substrings: TPLCP brand, its fonts/colors, and the
// report-content vocabulary Chris ruled out for this educational tool.
const FORBIDDEN = [
  "tplcp",
  "turning point",
  "#dd8c6d",
  "#b95f3c",
  "fraunces",
  "albert sans",
  "ibm plex",
  "evaluee",
  "determination",
  "report language",
  "according to the national center",
  "logo.svg",
];

describe("no TPLCP branding or report content ships in the ported files", () => {
  for (const [name, src] of Object.entries(FILES)) {
    const lower = src.toLowerCase();
    for (const term of FORBIDDEN) {
      it(`${name} does not contain "${term}"`, () => {
        expect(lower).not.toContain(term);
      });
    }
  }
});
