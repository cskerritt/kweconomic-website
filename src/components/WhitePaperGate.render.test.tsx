import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import WhitePaperGate from "./WhitePaperGate";
import { whitePapers } from "@/data/whitePapers";

// Server render of the gated state (effects do not run, so the form shows).
// Pins the owner-approved 2026-09-18 wording: the form says what we do with
// the address (send the paper, possibly follow up) instead of promising no
// follow-up, and the privacy notice stays next to the submit button.
const html = renderToStaticMarkup(
  createElement(MemoryRouter, null, createElement(WhitePaperGate, { paper: whitePapers[0] })),
).replace(/\s+/g, " ");

describe("WhitePaperGate render", () => {
  it("states the follow-up use of the email address", () => {
    expect(html).toContain(
      "We will email you the paper and may follow up about our services. You can tell us to stop at any time.",
    );
    expect(html).not.toContain("We will only use this to follow up about your inquiry.");
  });

  it("keeps the privacy notice line", () => {
    expect(html).toContain('href="/privacy"');
    expect(html).toContain("We use this information to respond to your request.");
  });
});
