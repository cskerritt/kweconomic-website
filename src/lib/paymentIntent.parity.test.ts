import { describe, expect, it } from "vitest";
// Parity guard (repo idiom: intakeForms.parity.test, intake-schema-psa-parity.test).
// The /payment gate validates the amount + invoice number in TWO places that
// cannot share a literal module: the browser client (src/lib/paymentIntent.ts,
// TS) and the Node server (validation.server.mjs). This test drives the SAME raw
// inputs through both and asserts they reach the SAME accept/reject verdict, so a
// rule change on one side that isn't mirrored on the other fails CI.
import { amountError as clientAmount, invoiceError as clientInvoice } from "./paymentIntent";
import {
  paymentAmountError as serverAmount,
  paymentInvoiceError as serverInvoice,
} from "../../validation.server.mjs";

const AMOUNTS = [
  "1250.00",
  "1250",
  "1250.5",
  "$1,250.00",
  "250000",
  "250000.01",
  "0",
  "0.00",
  "0.01",
  "-5",
  "12.345",
  "abc",
  "",
  "   ",
  "999999999",
];

const INVOICES = [
  "INV-10432",
  "1",
  "a".repeat(40),
  "a".repeat(41),
  "",
  "   ",
  "  INV-7  ",
];

describe("payment-intent amount validation is identical client and server", () => {
  for (const raw of AMOUNTS) {
    it(`agrees on ${JSON.stringify(raw)}`, () => {
      // Same verdict (accepted vs rejected). Wording may differ; the accept/reject
      // decision is the contract that must never drift.
      expect(Boolean(clientAmount(raw))).toBe(Boolean(serverAmount(raw)));
    });
  }
});

describe("payment-intent invoice validation is identical client and server", () => {
  for (const raw of INVOICES) {
    it(`agrees on ${JSON.stringify(raw)}`, () => {
      expect(Boolean(clientInvoice(raw))).toBe(Boolean(serverInvoice(raw)));
    });
  }
});
