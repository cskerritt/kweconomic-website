import { describe, expect, it } from "vitest";
import {
  isEmail,
  isPhone,
  validateRoute,
  paymentAmountError,
  paymentInvoiceError,
  normalizePaymentIntent,
} from "./validation.server.mjs";

// A complete GRANULAR retainer payload (Phase 2b). validateRoute strictly
// validates the live intakes via the schema, so tests use the real field shape.
const validPi = (over = {}) => ({
  email: "sam@firm.com",
  formType: "personal-injury-intake",
  retainingAttorneyFirstName: "Sam",
  retainingAttorneyLastName: "Counsel",
  retainingAttorneyEmail: "sam@firm.com",
  retainingAttorneyPhone: "201-555-0100",
  retainingFirm: "Acme LLP",
  evalueeFirstName: "Jane",
  evalueeLastName: "Doe",
  caseType: "Personal Injury",
  retainingSide: "plaintiff",
  workProducts: ["Vocational Evaluation"],
  state: "NJ",
  turnaround: "standard",
  paymentMethod: "check",
  esignConsent: true,
  esignTypedName: "Sam Counsel",
  // PSA boxes now required on every retainer route (plaintiff side, so the
  // Defense-only carrier/adjuster boxes are not required here).
  invoiceTo: "Acme LLP, 1 Main St, Newark NJ 07102",
  opposingCounselName: "Pat Roe",
  opposingCounselFirm: "Roe & Co",
  dateNeededBy: "2099-01-01",
  ...over,
});
const validMarital = (over = {}) => ({ ...validPi(), formType: "marital-intake", caseType: "Matrimonial", retainingSide: "", ...over });

describe("server validators", () => {
  it("isEmail / isPhone", () => {
    expect(isEmail("a@b.com")).toBe(true);
    expect(isEmail("bad")).toBe(false);
    expect(isPhone("203-605-2814")).toBe(true);
    expect(isPhone("12")).toBe(false);
  });
  it("contact requires valid email + phone", () => {
    expect(validateRoute("contact", { email: "bad", phone: "203-605-2814" })).toMatch(/email/);
    expect(validateRoute("contact", { email: "a@b.com", phone: "12" })).toMatch(/phone/);
    expect(validateRoute("contact", { email: "a@b.com", phone: "203-605-2814" })).toBeNull();
  });

  it("strict schema validation: a complete granular PI payload passes", () => {
    expect(validateRoute("consultation", validPi())).toBeNull();
  });
  it("strict schema validation: rejects each missing/invalid required granular field", () => {
    expect(validateRoute("consultation", validPi({ retainingAttorneyPhone: "" }))).toMatch(/phone/i);
    expect(validateRoute("consultation", validPi({ retainingAttorneyPhone: "12" }))).toMatch(/phone/i);
    expect(validateRoute("consultation", validPi({ evalueeFirstName: "" }))).toMatch(/required/i);
    expect(validateRoute("consultation", validPi({ retainingSide: "" }))).toMatch(/required/i);
    expect(validateRoute("consultation", validPi({ workProducts: [] }))).toMatch(/required/i);
    expect(validateRoute("consultation", validPi({ state: "" }))).toMatch(/required/i);
    expect(validateRoute("consultation", validPi({ retainingAttorneyEmail: "nope" }))).toMatch(/email/i);
  });
  it("marital passes without a side and still requires a work product", () => {
    expect(validateRoute("consultation", validMarital())).toBeNull();
    expect(validateRoute("consultation", validMarital({ workProducts: [] }))).toMatch(/required/i);
  });
  it("BACKWARD COMPAT: still accepts a retainer payload that carries the removed referralSource field", () => {
    // Chris 2026-07-17: referralSource dropped from the schema. A cached tab or
    // in-flight /agreements post that still includes it must be ignored, not 400'd.
    expect(validateRoute("consultation", validPi({ referralSource: "Prior client" }))).toBeNull();
    expect(validateRoute("consultation", validMarital({ referralSource: "Prior client" }))).toBeNull();
  });

  it("composite /agreements intakes (consulting / nonmetro) require a side via the loose path", () => {
    // consulting + nonmetro are LIVE at /agreements and have a represents row, so
    // the loose path derives side-required from the schema (matches the client).
    expect(validateRoute("consultation", { email: "a@b.com", formType: "consulting-intake", workProducts: ["x"] })).toMatch(/side/);
    expect(validateRoute("consultation", { email: "a@b.com", formType: "nonmetro-intake", workProducts: ["x"] })).toMatch(/side/);
    // with a side (+ a work product) they pass
    expect(validateRoute("consultation", { email: "a@b.com", formType: "consulting-intake", retainingSide: "plaintiff", workProducts: ["x"] })).toBeNull();
    expect(validateRoute("consultation", { email: "a@b.com", formType: "nonmetro-intake", retainingSide: "husband", workProducts: ["x"] })).toBeNull();
  });
  it("GRANULAR path rejects a 'needed by' on/before the submission date (else the case is OVERDUE on arrival)", () => {
    // validPi() carries evalueeFirstName + a far-future deadline, so it takes the
    // strict validateFields path and passes; a past deadline is rejected with the
    // Rush-nudge copy (single source of truth with the client form).
    expect(validateRoute("consultation", validPi())).toBeNull();
    expect(validateRoute("consultation", validPi({ dateNeededBy: "2020-01-01" }))).toMatch(/after today/i);
  });
  it("COMPOSITE /agreements path must NOT gain a hard 400 on a past 'needed by' (loose-checks contract)", () => {
    // No evalueeFirstName -> the loose legacy path runs, which never inspects the
    // deadline. A composite /agreements submission with a stale dateNeededBy must
    // still pass so the strict rule can't 400 a valid signed-PSA flow.
    expect(validateRoute("consultation", {
      email: "a@b.com", formType: "personal-injury-intake",
      retainingSide: "plaintiff", workProducts: ["x"], dateNeededBy: "2020-01-01",
    })).toBeNull();
  });
  it("schedule consultation (no formType) only needs a valid email", () => {
    expect(validateRoute("consultation", { email: "a@b.com" })).toBeNull();
    expect(validateRoute("consultation", { email: "bad" })).toMatch(/email/);
  });
  it("whitepaper needs a valid email", () => {
    expect(validateRoute("whitepaper", { email: "bad" })).toMatch(/email/);
    expect(validateRoute("whitepaper", { email: "a@b.com" })).toBeNull();
  });
});

describe("payment-intent validation (unlisted /payment gate)", () => {
  const valid = (over = {}) => ({
    email: "billing@acme.com",
    name: "Acme Law LLP",
    invoiceNumber: "INV-10432",
    amount: "1250.00",
    ...over,
  });

  it("accepts a complete, valid payment intent", () => {
    expect(validateRoute("payment-intent", valid())).toBeNull();
  });
  it("requires a valid email like every route", () => {
    expect(validateRoute("payment-intent", valid({ email: "bad" }))).toMatch(/email/i);
  });
  it("rejects a missing / over-length invoice number", () => {
    expect(validateRoute("payment-intent", valid({ invoiceNumber: "" }))).toMatch(/invoice/i);
    expect(validateRoute("payment-intent", valid({ invoiceNumber: "a".repeat(41) }))).toMatch(/40 characters/i);
  });
  it("rejects a bad amount (non-numeric, negative, zero, >2 decimals, over cap)", () => {
    expect(validateRoute("payment-intent", valid({ amount: "abc" }))).toMatch(/dollar/i);
    expect(validateRoute("payment-intent", valid({ amount: "-5" }))).toBeTruthy();
    expect(validateRoute("payment-intent", valid({ amount: "0" }))).toMatch(/greater than zero/i);
    expect(validateRoute("payment-intent", valid({ amount: "12.345" }))).toMatch(/two decimals/i);
    expect(validateRoute("payment-intent", valid({ amount: "250000.01" }))).toMatch(/250,000 or less/i);
  });
  it("accepts amount at the 250,000 cap and a bare integer", () => {
    expect(validateRoute("payment-intent", valid({ amount: "250000" }))).toBeNull();
    expect(validateRoute("payment-intent", valid({ amount: "500" }))).toBeNull();
  });

  it("paymentAmountError / paymentInvoiceError expose the granular rules", () => {
    expect(paymentAmountError("$1,250.00")).toBeNull();
    expect(paymentAmountError("")).toMatch(/required/i);
    expect(paymentInvoiceError("INV-1")).toBeNull();
    expect(paymentInvoiceError("")).toMatch(/required/i);
  });

  it("normalizePaymentIntent trims text fields and strips $/commas from amount in place", () => {
    const data = {
      name: "  Acme Law LLP ",
      email: " billing@acme.com ",
      firm: "  Acme  ",
      invoiceNumber: "  INV-1 ",
      caseName: "  Doe v. Roe ",
      amount: "$1,250.00",
    };
    normalizePaymentIntent(data);
    expect(data).toMatchObject({
      name: "Acme Law LLP",
      email: "billing@acme.com",
      firm: "Acme",
      invoiceNumber: "INV-1",
      caseName: "Doe v. Roe",
      amount: "1250.00",
    });
  });
  it("normalizePaymentIntent leaves a missing amount untouched (required-check catches it)", () => {
    const data = { name: "x", email: "x@y.com", invoiceNumber: "INV-1" };
    normalizePaymentIntent(data);
    expect(data.amount).toBeUndefined();
  });
});

describe("paralegal email is optional-but-validated on the strict retainer intakes", () => {
  it("rejects a present-but-invalid paralegal email", () => {
    expect(validateRoute("consultation", validPi({ retainingParalegalEmail: "not-an-email" }))).toMatch(/email/i);
  });
  it("accepts a valid paralegal email", () => {
    expect(validateRoute("consultation", validPi({ retainingParalegalEmail: "para@firm.com" }))).toBeNull();
  });
  it("accepts when the paralegal email is absent or empty (optional)", () => {
    expect(validateRoute("consultation", validPi())).toBeNull();
    expect(validateRoute("consultation", validPi({ retainingParalegalEmail: "" }))).toBeNull();
  });
  it("does not apply the paralegal rule to non-intake consultations or contact", () => {
    expect(validateRoute("consultation", { email: "a@b.com", retainingParalegalEmail: "bad" })).toBeNull();
    expect(validateRoute("contact", { email: "a@b.com", phone: "203-605-2814", retainingParalegalEmail: "bad" })).toBeNull();
  });
});
