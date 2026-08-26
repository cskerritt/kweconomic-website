import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Payment from "./Payment";

// Real server render (precedent: HoneypotField.render.test.tsx). The initial
// render must show the "what is this payment for" form and MUST NOT yet expose
// the Zelle QR / Pay-with-Zelle link - the gate is the whole point of the page.
const html = renderToStaticMarkup(createElement(Payment));

describe("Payment initial render is the intent form, QR gated", () => {
  it("renders the intent form with the required fields", () => {
    expect(html).toContain("Tell us what this payment is for");
    expect(html).toContain('id="pi-name"');
    expect(html).toContain('id="pi-email"');
    expect(html).toContain('id="pi-invoiceNumber"');
    expect(html).toContain('id="pi-amount"');
  });

  it("does not expose the Zelle QR or the Pay-with-Zelle link before submit", () => {
    expect(html).not.toContain("Pay with Zelle");
    expect(html).not.toContain('viewBox="0 0 49 49"'); // the inline QR svg
  });

  it("includes the hidden honeypot field the server quarantines on", () => {
    expect(html).toContain('name="hp_x7q"');
  });
});
