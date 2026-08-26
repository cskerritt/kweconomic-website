import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HoneypotField from "./HoneypotField";

// Real server render (mirrors how the SPA renders the field). We verify the
// hidden-honeypot contract the bot trap depends on: it must be in the DOM (so
// autofill bots reach it) but out of a human's way, and it must post as
// company_website - the exact key server.js's checkSpam quarantines on.
const html = renderToStaticMarkup(createElement(HoneypotField, { onChange: () => {} }));

describe("HoneypotField render", () => {
  it("wraps the input in an aria-hidden, offscreen container", () => {
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("position:absolute");
    expect(html).toContain("left:-9999px");
    expect(html).toContain("overflow:hidden");
  });

  it("is a real text input (not hidden/display:none) whose DOM name/label give browser autofill nothing to match", () => {
    // Regression 2026-08-25: name="company_website" + label "Company website"
    // matched Edge/Chrome's organization autofill heuristic, which ignores
    // autocomplete="off"; a real attorney's firm name was autofilled in and 4
    // submissions were quarantined. The JSON key stays company_website (set by
    // the form, not the DOM name) - only the DOM identity is de-semanticized.
    expect(html).not.toContain('name="company_website"');
    expect(html).not.toMatch(/company|organi[sz]ation|website|url/i);
    expect(html).toContain('name="hp_x7q"');
    expect(html).toContain('type="text"');
    expect(html).not.toContain("display:none");
    expect(html).not.toContain('type="hidden"');
  });

  it("keeps the input off the tab order and out of autofill history", () => {
    expect(html).toContain('tabindex="-1"');
    // React server-renders the autoComplete prop with its React-prop casing; the
    // browser normalizes it to the autocomplete attribute. Case-insensitive.
    expect(html).toMatch(/autocomplete="off"/i);
  });

  it("starts empty so a real submission carries an empty honeypot", () => {
    expect(html).toContain('value=""');
  });
});
