// Pure, framework-free logic for the unlisted /payment "tell us what this
// payment is for" gate (src/pages/Payment.tsx). Kept out of the React component
// so it is unit-testable in the node test env (vitest environment: "node").
//
// The amount + invoice-number rules here MUST stay in lockstep with the server's
// payment-intent validator in validation.server.mjs (paymentAmountError /
// paymentInvoiceError). src/lib/paymentIntent.parity.test.ts pins the two
// together so a change on one side that isn't mirrored on the other fails CI -
// the same "single source of truth, zero drift" posture the intake schema uses.
import { isEmail, isNonEmpty } from "./validation";

// Sanity ceiling on a single payment we will accept a tracking record for. This
// is NOT a business limit (Zelle's own per-transaction cap is far lower) - it
// keeps a fat-fingered or hostile amount out of the record. Mirrors the server.
export const MAX_PAYMENT_AMOUNT = 250000;
export const MAX_INVOICE_LENGTH = 40;

export interface PaymentIntentFields {
  name: string;
  email: string;
  firm: string;
  invoiceNumber: string;
  caseName: string;
  amount: string;
}

export type PaymentIntentFieldErrors = Partial<Record<keyof PaymentIntentFields, string>>;

export interface PaymentIntentPayload {
  name: string;
  email: string;
  firm: string;
  invoiceNumber: string;
  caseName: string;
  // Canonical dollars string, e.g. "1250.00", so the workflow's cents
  // conversion is unambiguous.
  amount: string;
}

// Strip a leading "$" and thousands separators so "$1,250.00" and "1250" both
// reduce to the same bare numeric string. The result may still be invalid - the
// caller validates it.
export function normalizeAmount(raw: string): string {
  return String(raw ?? "")
    .trim()
    .replace(/^\$/, "")
    .replace(/,/g, "")
    .trim();
}

// null when the amount is a positive dollar figure with at most two decimals and
// no greater than MAX_PAYMENT_AMOUNT; otherwise a human-readable message.
export function amountError(raw: string): string | null {
  const s = normalizeAmount(raw);
  if (!s) return "Enter the payment amount.";
  if (!/^\d+(\.\d{1,2})?$/.test(s)) {
    return "Enter a dollar amount like 1250.00 (numbers only, up to two decimal places).";
  }
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return "Enter an amount greater than zero.";
  if (n > MAX_PAYMENT_AMOUNT) {
    return "Enter an amount of 250,000 or less, or email us to arrange a larger payment.";
  }
  return null;
}

// null when the invoice number is present and no longer than MAX_INVOICE_LENGTH.
export function invoiceError(raw: string): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return "Enter the invoice number from your statement.";
  if (s.length > MAX_INVOICE_LENGTH) {
    return `Invoice number must be ${MAX_INVOICE_LENGTH} characters or fewer.`;
  }
  return null;
}

// The exact Zelle memo the payer must type so their payment can be matched to
// the account. Contract string: "Invoice {invoiceNumber}".
export function zelleMemo(invoiceNumber: string): string {
  return `Invoice ${String(invoiceNumber ?? "").trim()}`;
}

// Echo the entered amount as US currency ("$1,250.00"). Empty string when the
// amount is not (yet) a parseable number, so the UI can simply omit the echo.
export function formatUsd(raw: string): string {
  const s = normalizeAmount(raw);
  const n = Number(s);
  if (!s || !Number.isFinite(n)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

// Field-level errors for the inline UI: only failing fields appear. firm and
// caseName are optional and never validated here.
export function validatePaymentIntentFields(fields: PaymentIntentFields): PaymentIntentFieldErrors {
  const errors: PaymentIntentFieldErrors = {};
  if (!isNonEmpty(fields.name)) errors.name = "Enter the name of the person or firm making the payment.";
  if (!isEmail(fields.email)) errors.email = "Enter a valid email address.";
  const inv = invoiceError(fields.invoiceNumber);
  if (inv) errors.invoiceNumber = inv;
  const amt = amountError(fields.amount);
  if (amt) errors.amount = amt;
  return errors;
}

// Trim + canonicalize the fields into the JSON body POSTed to /api/payment-intent.
// amount is emitted as a fixed two-decimal dollars string ("1250.00").
export function buildPaymentIntentPayload(fields: PaymentIntentFields): PaymentIntentPayload {
  const amount = normalizeAmount(fields.amount);
  const n = Number(amount);
  return {
    name: fields.name.trim(),
    email: fields.email.trim(),
    firm: fields.firm.trim(),
    invoiceNumber: fields.invoiceNumber.trim(),
    caseName: fields.caseName.trim(),
    amount: Number.isFinite(n) && amount !== "" ? n.toFixed(2) : amount,
  };
}
