import { describe, expect, it } from "vitest";
import {
  amountError,
  buildPaymentIntentPayload,
  formatUsd,
  invoiceError,
  normalizeAmount,
  validatePaymentIntentFields,
  zelleMemo,
  type PaymentIntentFields,
  MAX_INVOICE_LENGTH,
} from "./paymentIntent";

const fields = (over: Partial<PaymentIntentFields> = {}): PaymentIntentFields => ({
  name: "Acme Law LLP",
  email: "billing@acme.com",
  firm: "Acme Law LLP",
  invoiceNumber: "INV-10432",
  caseName: "Doe v. Roe",
  amount: "1250.00",
  ...over,
});

describe("normalizeAmount", () => {
  it("strips a leading $ and thousands separators", () => {
    expect(normalizeAmount("$1,250.00")).toBe("1250.00");
    expect(normalizeAmount("  1,000 ")).toBe("1000");
    expect(normalizeAmount("$ 500")).toBe("500");
  });
});

describe("amountError", () => {
  it("accepts positive dollar figures with up to two decimals", () => {
    expect(amountError("1250")).toBeNull();
    expect(amountError("1250.5")).toBeNull();
    expect(amountError("1250.00")).toBeNull();
    expect(amountError("$1,250.00")).toBeNull();
    expect(amountError("250000")).toBeNull(); // at the cap
    expect(amountError("0.01")).toBeNull();
  });
  it("rejects empty, non-numeric, negative, zero, >2 decimals, and over-cap", () => {
    expect(amountError("")).toMatch(/amount/i);
    expect(amountError("abc")).toMatch(/dollar amount/i);
    expect(amountError("-5")).toBeTruthy();
    expect(amountError("0")).toMatch(/greater than zero/i);
    expect(amountError("0.00")).toMatch(/greater than zero/i);
    expect(amountError("12.345")).toMatch(/two decimal/i);
    expect(amountError("250000.01")).toMatch(/250,000 or less/i);
    expect(amountError("999999")).toMatch(/250,000 or less/i);
  });
});

describe("invoiceError", () => {
  it("accepts a present, in-length invoice number", () => {
    expect(invoiceError("INV-1")).toBeNull();
    expect(invoiceError("a".repeat(MAX_INVOICE_LENGTH))).toBeNull();
  });
  it("rejects empty / whitespace-only and over-length", () => {
    expect(invoiceError("")).toMatch(/invoice number/i);
    expect(invoiceError("   ")).toMatch(/invoice number/i);
    expect(invoiceError("a".repeat(MAX_INVOICE_LENGTH + 1))).toMatch(/40 characters or fewer/i);
  });
});

describe("zelleMemo", () => {
  it("produces the exact contract string 'Invoice {invoiceNumber}'", () => {
    expect(zelleMemo("INV-10432")).toBe("Invoice INV-10432");
    expect(zelleMemo("  INV-7 ")).toBe("Invoice INV-7");
  });
});

describe("formatUsd", () => {
  it("echoes the amount as US currency", () => {
    expect(formatUsd("1250")).toBe("$1,250.00");
    expect(formatUsd("1250.5")).toBe("$1,250.50");
    expect(formatUsd("$1,250.00")).toBe("$1,250.00");
  });
  it("returns an empty string for an unparseable amount", () => {
    expect(formatUsd("")).toBe("");
    expect(formatUsd("abc")).toBe("");
  });
});

describe("validatePaymentIntentFields", () => {
  it("passes a complete, valid form", () => {
    expect(validatePaymentIntentFields(fields())).toEqual({});
  });
  it("flags each required field independently", () => {
    expect(validatePaymentIntentFields(fields({ name: "  " })).name).toBeTruthy();
    expect(validatePaymentIntentFields(fields({ email: "nope" })).email).toBeTruthy();
    expect(validatePaymentIntentFields(fields({ invoiceNumber: "" })).invoiceNumber).toBeTruthy();
    expect(validatePaymentIntentFields(fields({ amount: "-1" })).amount).toBeTruthy();
  });
  it("treats firm and caseName as optional (no error when blank)", () => {
    const errs = validatePaymentIntentFields(fields({ firm: "", caseName: "" }));
    expect(errs).toEqual({});
  });
});

describe("buildPaymentIntentPayload", () => {
  it("trims text fields and canonicalizes amount to a 2-decimal string", () => {
    const p = buildPaymentIntentPayload(
      fields({ name: "  Acme  ", invoiceNumber: " INV-1 ", amount: "$1,250" }),
    );
    expect(p.name).toBe("Acme");
    expect(p.invoiceNumber).toBe("INV-1");
    expect(p.amount).toBe("1250.00");
  });
  it("preserves optional fields (firm, caseName) trimmed", () => {
    const p = buildPaymentIntentPayload(fields({ firm: " Acme Law ", caseName: " Doe " }));
    expect(p.firm).toBe("Acme Law");
    expect(p.caseName).toBe("Doe");
  });
});
