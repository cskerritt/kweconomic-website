import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// 2026-11-16 (axe aria-hidden-focus): the blurred preview behind the sign-up form is hidden from screen readers, so it
// must also be out of the Tab order, or a keyboard user lands on links they cannot see. inert does both, as on the vocational site.
describe("white paper gate preview", () => {
  it("is inert as well as aria-hidden", () => {
    const src = readFileSync(join(process.cwd(), "src/components/WhitePaperGate.tsx"), "utf8");
    expect(src).toMatch(/blur-\[6px\][^>]*aria-hidden="true"\s+inert/);
  });
});
