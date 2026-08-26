// Guard test (source-read pattern precedent: src/components/RetainerIntakeForm.test.mjs,
// src/data/intakeForms.parity.test.mjs). No DOM env exists (vitest.config.ts environment: "node"),
// so the browser-only behavior - portal target, scroll lock, focus trap, focus return - is pinned
// at source level. The SSR render test covers the markup contract.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./MissingInfoModal.tsx", import.meta.url), "utf-8");

describe("MissingInfoModal source guards (no DOM env exists - see RetainerIntakeForm.test.mjs precedent)", () => {
  it("portals to document.body in the browser with an SSR inline fallback", () => {
    expect(src).toMatch(/createPortal/);
    expect(src).toMatch(/typeof document === "undefined"/);
    expect(src).toMatch(/document\.body/);
  });

  // The restore/teardown assertions below name the CLEANUP explicitly: asserting
  // only that the lock and the listener are installed passes even with the
  // cleanup deleted, which would leave the page unscrollable and the keydown
  // handler live after close.
  it("locks body scroll while open and restores it from inside the effect cleanup", () => {
    expect(src).toMatch(/body\.style\.overflow\s*=\s*"hidden"/);
    expect(src).toMatch(/return \(\) => \{[\s\S]*?document\.body\.style\.overflow = restoreOverflow;[\s\S]*?\};/);
  });

  it("handles Escape and traps Tab, and removes the listener on cleanup", () => {
    expect(src).toMatch(/"Escape"/);
    expect(src).toMatch(/"Tab"/);
    expect(src).toMatch(/document\.addEventListener\("keydown", handler, true\)/);
    expect(src).toMatch(/return \(\) => document\.removeEventListener\("keydown", handler, true\)/);
  });

  // Regression guard: the contains-recovery used to live only on the Shift
  // branch. Clearing the first row unmounts the focused control, activeElement
  // falls to <body>, and a plain Tab then matched NEITHER branch - focus walked
  // out of the dialog. The recovery must be checked first so it covers both
  // directions, hence the ordering assertion rather than a mere presence check.
  it("recovers focus from outside the panel before branching on Shift", () => {
    const handler = src.slice(src.indexOf('if (e.key !== "Tab") return;'));
    const recovery = handler.indexOf("!panel.contains(active)");
    const shift = handler.indexOf("shiftKey");
    expect(recovery).toBeGreaterThan(-1);
    expect(shift).toBeGreaterThan(-1);
    expect(recovery).toBeLessThan(shift);
    expect(handler).toMatch(/if \(!panel\.contains\(active\)\) \{\s*e\.preventDefault\(\);\s*first\.focus\(\);/);
  });

  it("returns focus to the opener", () => {
    expect(src).toMatch(/previouslyFocused|openerRef|lastFocused/);
  });

  it("sits above the sticky header", () => {
    expect(src).toMatch(/z-\[60\]/);
  });

  it("keeps the footer clear of the fixed mobile bottom bar", () => {
    expect(src).toMatch(/max-h-\[85vh\]/);
    expect(src).toMatch(/overflow-y-auto/);
    expect(src).toMatch(/pb-24/);
  });

  it("autofocuses the first control on open", () => {
    expect(src).toMatch(/data-autofocus/);
  });

  it("normalizes both option shapes at the point of use without mutating the shared arrays", () => {
    expect(src).toMatch(/typeof o === "string"/);
    expect(src).not.toMatch(/\.sort\(|\.reverse\(|\.splice\(|options\.push\(/);
  });

  it("coerces checkbox to boolean and multiselect to a toggled array", () => {
    expect(src).toMatch(/e\.target\.checked/);
    expect(src).toMatch(/filter\(|includes\(/);
  });

  // Built from the code point rather than typed, so this file obeys the house
  // no-em-dash rule it is enforcing.
  it("uses no em dashes in UI copy or comments", () => {
    expect(src).not.toContain(String.fromCharCode(0x2014));
  });
});
