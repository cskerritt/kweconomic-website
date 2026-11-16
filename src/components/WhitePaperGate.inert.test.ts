import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The locked state renders only a neutral aria-hidden placeholder behind the sign-up form: the gated sections are not
// rendered (and so are not in the prerendered HTML) until unlocked, so there is no blurred preview to make inert, and
// the unlock flag is read through useSyncExternalStore with a "locked" server snapshot so hydration cannot mismatch.
describe("white paper gate", () => {
  const src = readFileSync(join(process.cwd(), "src/components/WhitePaperGate.tsx"), "utf8");
  it("renders the gated sections only in the unlocked branch", () => {
    const locked = src.slice(src.indexOf(") : ("), src.indexOf("<form"));
    expect(locked).not.toContain("gated.map");
    expect(locked).toContain('aria-hidden="true"');
    expect(src.match(/gated\.map/g)).toHaveLength(1);
  });
  it("reads the unlock flag via useSyncExternalStore with a locked server snapshot", () => {
    expect(src).toMatch(/useSyncExternalStore\(\s*subscribeUnlock,\s*\(\) => readUnlocked\(paper\.slug\),\s*\(\) => false,/);
    expect(src).not.toContain("useEffect");
  });
});
