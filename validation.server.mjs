// Server-side intake validation. The VALIDATORS and the turnaround vocabulary are
// now sourced from the shared schema (lib/intake-schema.mjs) - the single source
// of truth - instead of a local duplicate, so the client and server can no longer
// drift on those rules. The REQUIRED-SET below is intentionally kept as-is (the
// "guard"): the live retainer form posts composite field names + omits some
// granular fields, so the schema's strict validateFields cannot be used wholesale
// yet without 400ing valid submissions - that lands in Phase 2b with the field
// redesign. Returns an error string, or null when the payload passes.
import { isEmail, isPhone, getFields, validateFields, formOptions } from "./lib/intake-schema.mjs";
import { normalizeEventSlug, validateRaffleFields } from "./lib/raffle.mjs";
import { BAR_ASSOCIATION_OTHER, normalizeBarAssociation, sanitizeBarAssociationOther } from "./lib/bar-associations.mjs";

export { isEmail, isPhone };

// Phase 2b: the LIVE retainer intakes now post the schema's GRANULAR fields, so
// the server validates them with the schema's strict validateFields - the exact
// same rules the client runs (true single source of truth, zero drift).
const GRANULAR_INTAKES = new Set(["personal-injury-intake", "marital-intake", "nonmetro-intake", "consulting-intake", "unified-intake"]);

// The composite /agreements form (all 4 slugs) uses the loose checks below.
// Allowed turnaround labels come from the schema's turnaround descriptor.
const ALLOWED_TURNAROUND = getFields("personal-injury-intake")
  .find((f) => f.key === "turnaround")
  .resolvedOptions.map((o) => o.value);

// Estimator (/api/estimator): numeric sanity for the lead + breakdown email.
// The page converts percentage inputs to DECIMALS before posting (25% -> 0.25),
// so rates here are validated on the 0..1 scale. Rejecting here keeps garbage
// out of raw_submissions/the dashboard AND guarantees buildEstimatorEmail's
// recompute cannot throw on a submission we accepted.
const ESTIMATOR_RATE_FIELDS = ["annualFringeRate", "growthRate", "discountRate", "inflationRateFuture", "pastWageMultiplier"];
export function validateEstimator(data) {
  const num = (v) => (v === undefined || v === "" ? undefined : Number(v));
  const income = num(data.annualIncome);
  if (!Number.isFinite(income) || income < 0 || income > 100_000_000) {
    return "annual income must be a number between 0 and 100,000,000";
  }
  for (const f of ESTIMATOR_RATE_FIELDS) {
    const v = num(data[f]);
    if (v === undefined) continue;
    if (!Number.isFinite(v) || v < 0 || v > 1) return `${f} must be between 0 and 1 (a decimal rate)`;
  }
  for (const f of ["currentAge", "retirementAge"]) {
    const v = num(data[f]);
    if (v === undefined) continue;
    if (!Number.isFinite(v) || v < 0 || v > 120) return `${f} must be between 0 and 120`;
  }
  for (const f of ["worklifeLossYears", "lossBeforeFileInjuryYears"]) {
    const v = num(data[f]);
    if (v === undefined) continue;
    if (!Number.isFinite(v) || v < 0 || v > 80) return `${f} must be between 0 and 80 years`;
  }
  for (const f of ["medicalsPast", "medicalsFuture", "attendantCarePast", "attendantCareFuture", "otherPast", "otherFuture"]) {
    const v = num(data[f]);
    if (v === undefined) continue;
    if (!Number.isFinite(v) || v < 0 || v > 100_000_000) return `${f} must be a number between 0 and 100,000,000`;
  }
  return null;
}

// Payment-intent (/api/payment-intent): the unlisted /payment page's "what is
// this payment for" gate in front of the Zelle QR. Pure sanity checks so a
// tracking record is trustworthy and the workflow's cents conversion can't choke
// on a bad amount. These rules MUST stay in lockstep with the client copy in
// src/lib/paymentIntent.ts - src/lib/paymentIntent.parity.test.ts pins them.
export const MAX_PAYMENT_AMOUNT = 250000;
export const MAX_INVOICE_LENGTH = 40;

// Strip a leading "$" and thousands separators so "$1,250.00" and "1250" both
// reduce to the same bare numeric string. The client posts a canonical
// "1250.00", but a direct API caller (a bot, curl) might not.
export function normalizePaymentAmount(raw) {
  return String(raw ?? "").trim().replace(/^\$/, "").replace(/,/g, "").trim();
}

export function paymentAmountError(raw) {
  const s = normalizePaymentAmount(raw);
  if (!s) return "a payment amount is required";
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return "amount must be a dollar figure with at most two decimals (e.g. 1250.00)";
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return "amount must be greater than zero";
  if (n > MAX_PAYMENT_AMOUNT) return "amount must be 250,000 or less";
  return null;
}

export function paymentInvoiceError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return "an invoice number is required";
  if (s.length > MAX_INVOICE_LENGTH) return "invoice number must be 40 characters or fewer";
  return null;
}

// Route normalize hook (server.js API_ROUTES): trim the text fields and
// canonicalize amount IN PLACE so the durable raw_submissions row + the workflow
// forward carry clean values. Runs BEFORE the required + Turnstile checks.
export function normalizePaymentIntent(data) {
  for (const k of ["name", "email", "firm", "invoiceNumber", "caseName"]) {
    if (typeof data[k] === "string") data[k] = data[k].trim();
  }
  if (data.amount !== undefined && data.amount !== null) {
    data.amount = normalizePaymentAmount(data.amount);
  }
}

export function validatePaymentIntent(data) {
  const invoice = paymentInvoiceError(data.invoiceNumber);
  if (invoice) return invoice;
  const amount = paymentAmountError(data.amount);
  if (amount) return amount;
  return null;
}

// Raffle (/api/raffle): the conference QR entry form. Trims the entry fields,
// canonicalizes the event slug IN PLACE so the ledger row + Clio Grow lead carry
// the same value the QR encoded, and derives the composite `name` the way the
// consultation route derives it from retainingAttorneyName - the layer-2
// gibberish heuristics (lib/spam-heuristics.server.mjs) key on `name`, and
// without it a raffle entry would silently sit outside that check.
//
// The derivation is UNCONDITIONAL. The raffle form posts first/last and never
// `name`, so a `name` in the body can only come from a direct API caller, and
// honouring it would hand a bot the heuristics' own input: gibberish first/last
// plus name:"John Smith" would score clean and walk into the LIVE Grow inbox.
export function normalizeRaffle(data) {
  for (const k of ["firstName", "lastName", "email", "firm", "phone"]) {
    if (typeof data[k] === "string") data[k] = data[k].trim();
  }
  data.event = normalizeEventSlug(data.event);
  // The metrics dimension. Only a roster value (or one of the two escape
  // options) survives; anything else becomes "" and validateRaffle 400s it, so
  // junk cannot reach the breakdown. The free text is kept ONLY under the Other
  // option - otherwise a direct API caller could staple arbitrary text to a real
  // association and have it render on /admin/raffle-leads.
  data.barAssociation = normalizeBarAssociation(data.barAssociation);
  data.barAssociationOther =
    data.barAssociation === BAR_ASSOCIATION_OTHER ? sanitizeBarAssociationOther(data.barAssociationOther) : "";
  data.name = `${data.firstName || ""} ${data.lastName || ""}`.trim();
}

// First error wins, matching the granular-intake branch below.
export function validateRaffle(data) {
  const errors = validateRaffleFields(data);
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
}

export function validateRoute(type, data) {
  if (!isEmail(data.email)) return "a valid email is required";

  if (type === "estimator") return validateEstimator(data);

  if (type === "payment-intent") return validatePaymentIntent(data);

  if (type === "raffle") return validateRaffle(data);

  if (type === "contact") {
    if (!isPhone(data.phone)) return "a valid phone number is required";
    return null;
  }

  if (type === "consultation" && typeof data.formType === "string" && data.formType.endsWith("-intake")) {
    // Two live forms post these formTypes: the granular RetainerIntakeForm
    // (/contact/*-intake, which sends evalueeFirstName + the other granular fields)
    // and the composite /agreements form (which does NOT). Only run the schema's
    // STRICT validateFields on a genuinely-granular payload; the composite
    // /agreements payload (and the retired public intakes) keep the loose checks,
    // so strict validation can't 400 a valid composite submission.
    if (GRANULAR_INTAKES.has(data.formType) && "evalueeFirstName" in data) {
      // First error wins (validateFields keys errors in FIELDS order).
      const errors = validateFields(data.formType, data);
      const firstKey = Object.keys(errors)[0];
      return firstKey ? errors[firstKey] : null;
    }
    // Legacy loose checks for the composite /agreements form. Side is required
    // whenever the form's PSA has a represents row (derived from the schema's
    // per-form option set), so the server matches the client for ALL slugs
    // (consulting / personal-injury / nonmetro have sides; matrimonial does not).
    if (formOptions(data.formType).sides.length > 0 && !data.retainingSide) return "retaining side is required";
    const wp = data.workProducts;
    const hasProduct = Array.isArray(wp) ? wp.length > 0 : Boolean(wp);
    if (!hasProduct) return "at least one work product is required";
    if (data.turnaround !== undefined && data.turnaround !== "" && !ALLOWED_TURNAROUND.includes(data.turnaround)) {
      return "turnaround must be Rush or Standard";
    }
    const para = data.retainingParalegalEmail;
    if (typeof para === "string" && para.trim() !== "" && !isEmail(para)) {
      return "a valid paralegal email is required";
    }
  }

  return null;
}
