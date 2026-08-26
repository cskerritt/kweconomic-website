import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import Raffle from "./Raffle";
import { RAFFLE_PRIZE, RAFFLE_RULES } from "../../lib/raffle.mjs";

// Real server render of the initial (ungated) state. usePageMeta's effect does
// not run under renderToStaticMarkup, so this asserts only the DOM contract:
// the entry form, its required markers, and the official-rules block are all
// present on first paint - a conference attendee sees them without any JS
// round-trip beyond hydration.
const html = renderToStaticMarkup(
  createElement(MemoryRouter, { initialEntries: ["/raffle?event=njaj-2026"] }, createElement(Raffle)),
);

describe("Raffle initial render", () => {
  it("shows the prize headline", () => {
    expect(html).toContain(RAFFLE_PRIZE);
  });

  it("renders the three required inputs and the two optional ones", () => {
    for (const id of ["rf-firstName", "rf-lastName", "rf-email", "rf-firm", "rf-phone"]) {
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain('type="email"');
    // React 19 serializes inputMode verbatim; HTML attribute names are
    // case-insensitive, so the browser still parses it as inputmode="tel".
    expect(html).toMatch(/inputmode="tel"/i);
  });

  it("renders every official rule on first paint", () => {
    for (const rule of RAFFLE_RULES) expect(html).toContain(rule);
  });

  it("includes the hidden honeypot input the server quarantines on", () => {
    expect(html).toContain('name="hp_x7q"');
  });
});
