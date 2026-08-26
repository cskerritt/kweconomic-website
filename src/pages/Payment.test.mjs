// Source-read guard (precedent: RetainerIntakeForm.test.mjs). vitest runs in a
// node env (no DOM), so the /payment gating contract is pinned at source level;
// Payment.render.test.tsx additionally asserts the initial gated DOM.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "Payment.tsx"), "utf8");

describe("Payment page: reuses the site's anti-spam form primitives", () => {
  it("renders the shared Turnstile widget and hidden honeypot", () => {
    expect(src).toContain('import Turnstile from "@/components/Turnstile"');
    expect(src).toContain('import HoneypotField from "@/components/HoneypotField"');
    expect(src).toContain("<Turnstile onToken={setTurnstileToken} />");
    expect(src).toContain("<HoneypotField onChange={setCompanyWebsite} />");
  });
  it("posts to /api/payment-intent with the token + honeypot in the body", () => {
    expect(src).toContain('const ENDPOINT = "/api/payment-intent"');
    expect(src).toContain("fetch(ENDPOINT");
    expect(src).toMatch(/turnstileToken, company_website: companyWebsite/);
  });
  it("uses the shared pure logic for validation, payload, memo, and amount echo", () => {
    expect(src).toContain('from "@/lib/paymentIntent"');
    expect(src).toContain("validatePaymentIntentFields(fields)");
    expect(src).toContain("buildPaymentIntentPayload(");
    expect(src).toContain("zelleMemo(");
    expect(src).toContain("formatUsd(");
  });
});

describe("Payment page: gates the Zelle QR behind the intent form", () => {
  it("shows the intent form first, QR only once revealed", () => {
    expect(src).toContain("Tell us what this payment is for");
    expect(src).toMatch(/status !== "revealed"/);
    // The QR path + Pay-with-Zelle link live in the revealed branch.
    expect(src).toContain("d={QR_PATH}");
    expect(src).toContain("Pay with Zelle");
  });
  it("required fields: name, email, invoice number, amount", () => {
    for (const id of ["pi-name", "pi-email", "pi-invoiceNumber", "pi-amount"]) {
      expect(src).toContain(`id="${id}"`);
    }
  });
});

describe("Payment page: the memo is the point (invoice number required in Zelle memo)", () => {
  it("shows the exact 'Invoice {n}' memo with a copy-to-clipboard button", () => {
    expect(src).toContain("const memo = confirmed ? zelleMemo(confirmed.invoiceNumber)");
    expect(src).toContain("navigator.clipboard.writeText(memo)");
    expect(src).toMatch(/Put this exact memo on your Zelle payment/);
  });
  it("echoes the entered amount for the payer to send", () => {
    expect(src).toMatch(/Send <strong>\{confirmed\.amount\}<\/strong> via Zelle/);
  });
  it("the how-it-works step requires the invoice number in the memo", () => {
    expect(src).toMatch(/required so we can match/i);
  });
});

describe("Payment page: availability - never block a willing payer", () => {
  it("a 400 (Turnstile) rejection asks the payer to retry, re-challenging the widget", () => {
    expect(src).toContain('if (res.status === 400) return "verify"');
    expect(src).toContain('setNotice({ kind: "verify" })');
    expect(src).toContain('setTurnstileToken("")');
  });
  it("a network/5xx failure retries once, then offers Continue to payment", () => {
    expect(src).toMatch(/Retry ONCE on a transient failure/);
    expect(src).toContain('setNotice({ kind: "offline" })');
    expect(src).toContain("onClick={() => reveal(fields, false)}");
    expect(src).toContain("Continue to payment");
  });
});

describe("Payment page: stays unlisted (noindex) and links the verified Zelle URL", () => {
  it("keeps the noindex meta", () => {
    expect(src).toContain("noindex: true");
  });
  it("links the same Zelle URL the QR encodes", () => {
    expect(src).toContain(
      "https://enroll.zellepay.com/qr-codes/?data=eyJuYW1lIjoiS0lOQ0FJRCBXT0xTVEVJTiBWT0NBVElPTkFMICYiLCJ0b2tlbiI6Imt3dnJzMjAyNiIsImFjdGlvbiI6InBheW1lbnQifQ==",
    );
  });
});
