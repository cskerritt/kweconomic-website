// Guard test (source-read pattern precedent: RetainerIntakeForm.test.mjs).
// The /agreements form renders a DOI input posting under the exact label key the builder reads.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const agreementSrc = readFileSync(join(here, "../pages/Agreement.tsx"), "utf8");

describe("Agreement.tsx DOI render guard", () => {
  it("renders a DOI input posting under the exact label key the builder reads", () => {
    expect(agreementSrc).toContain('field("Date of Injury / Loss")');
    expect(agreementSrc).toContain('type="date"');
  });
});
