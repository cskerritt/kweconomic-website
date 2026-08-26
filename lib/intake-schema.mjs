// Shared, dependency-free intake schema: pure validators, field descriptors,
// per-form option vocabularies, validation, and legacy-key derivation. Imported
// by BOTH the Node server (validation.server.mjs) and the Vite/TS client, so it
// must stay plain ESM with no TypeScript and no external deps. Lives in lib/ so
// the site Docker runtime image (which copies lib/, not src/) can import it.

import { CASE_TYPES, routeForCaseType } from "./case-types.mjs";

const str = (v) => (typeof v === "string" ? v.trim() : "");

// TLD must be >= 2 chars: Resend rejects addresses like "x@gmail.c" with a
// 422 at send time (real incident 2026-08-11, case e80c7896 - a truncated
// ".com"), so catch the typo at intake while the attorney is still present.
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(str(v));
export const isPhone = (v) => typeof v === "string" && v.replace(/\D/g, "").length >= 10;
export const isZip = (v) => /^\d{5}(-\d{4})?$/.test(str(v));
export const isValidDate = (v) => {
  const s = str(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const ms = Date.parse(s);
  if (Number.isNaN(ms)) return false;
  return new Date(ms).toISOString().slice(0, 10) === s;
};
// Date-only values (YYYY-MM-DD) are entered in the user's LOCAL calendar, but
// `now` is a UTC instant. A +/-1 day grace absorbs timezone skew across every
// served locale (Guam UTC+10 .. American Samoa UTC-11) so a legitimate "today"
// value is never rejected near the UTC day boundary, while clearly out-of-range
// dates are still caught. These are advisory checks on optional fields.
const DAY_MS = 86400000;
export const isNonFutureDate = (v, now = Date.now()) => isValidDate(v) && Date.parse(str(v)) <= startOfDay(now) + DAY_MS;
export const isNonPastDate = (v, now = Date.now()) => isValidDate(v) && Date.parse(str(v)) >= startOfDay(now) - DAY_MS;

// A HARD-DEADLINE date (the "Report needed by" / dateNeededBy field) must not be
// one the admin dashboard would flag OVERDUE the instant the case is created.
// Attorneys kept entering the submission date (or earlier), so cases landed on
// the dashboard already red. The workflow calls a case overdue only when
// date_needed_by is STRICTLY BEFORE today's UTC midnight (deadlineDaysLeft < 0 in
// workflow/lib/dashboard.js; a value equal to today-UTC renders a harmless "due
// today" badge, not OVERDUE). So we reject EXACTLY that set: dates strictly
// before today-UTC. This is deliberately GENEROUS - we do NOT push the cutoff to
// today+1, because a legitimate next-day deadline typed in a behind-UTC US
// evening already reads as today-UTC once the UTC day has rolled over (the same
// +/-1 day timezone skew, Guam UTC+10 .. American Samoa UTC-11, that the
// isNonFutureDate/isNonPastDate grace absorbs); a today+1 cutoff would falsely
// reject it. The user-facing copy still nudges toward a clearly-future date (or
// the Rush turnaround), even though a same-UTC-day value technically passes.
export const isFutureDeadlineDate = (v, now = Date.now()) => isValidDate(v) && Date.parse(str(v)) >= startOfDay(now);

function startOfDay(ms) {
  const d = new Date(ms);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

// ---- Per-form option vocabularies, mirroring the four 2026 PSA templates
// (src/data/agreements.ts + workflow/templates/tabs.json). The four retainer
// forms have DISTINCT template checkbox vocabularies, so each string is chosen
// so that, run through the workflow's psa-prefill mapping, it lands on a checkbox
// tab that EXISTS on that form's template - pinned by the psa-parity test. Phase 2's
// src/data/intakeForms.ts re-exports these so options live in ONE place. ----
export const PI_SIDES = [
  { value: "plaintiff", label: "Plaintiff" },
  { value: "defense", label: "Defense" },
  { value: "joint", label: "Joint with Co-Counsel(s)" },
];
export const NONMETRO_SIDES = [
  { value: "plaintiff", label: "Plaintiff" },
  { value: "defense", label: "Defense" },
  { value: "husband", label: "Husband" },
  { value: "wife", label: "Wife" },
];
export const PI_PAYMENTS = [
  { value: "check", label: "Check" },
  { value: "credit-card", label: "Credit Card" },
  { value: "ach", label: "ACH" },
];
export const MARITAL_PAYMENTS = [
  { value: "check", label: "Check" },
  { value: "card-or-ach", label: "Credit Card or ACH Payment online" },
];
export const NONMETRO_PAYMENTS = [
  { value: "check", label: "Check" },
  { value: "card-or-ach", label: "Credit Card or ACH online" },
];
export const PI_CASE_TYPES = ["Personal Injury", "Medical Malpractice", "Motor Vehicle Accident", "Workers' Compensation", "Wrongful Death", "Economic Loss Analysis"];
export const CONSULTING_CASE_TYPES = ["Personal Injury", "Med Mal", "WC", "MVA", "Wrongful death", "TDIU", "LTD", "Other"];
export const NONMETRO_CASE_TYPES = ["Personal Injury", "Med Mal", "Wrongful termination", "WC", "Wrongful death", "Discrimination", "MVA", "Marital"];
export const MARITAL_CASE_TYPES = ["Matrimonial"];
export const PI_WORK_PRODUCTS = ["Vocational Evaluation", "Life Care Plan", "IME", "Loss of Household Services", "Economic Analysis"];
export const CONSULTING_WORK_PRODUCTS = ["Business Valuation", "Life Care Plan", "IME", "Loss of Household Services", "Economic Analysis", "VE"];
// CME (the non-metro PSA's compulsory-medical-exam product) was REMOVED
// 2026-08-17 (Chris: KWVRS conducts medical exams for NY/NJ matters only, and
// the non-metro form is by definition outside them). The paper PSA template
// keeps its printed CME checkbox; it just never gets offered or checked.
export const NONMETRO_WORK_PRODUCTS = ["Vocational Evaluation", "Life Care Plan", "Loss of Household Services", "Economic Analysis"];

// IME is conducted for New York and New Jersey matters ONLY (Chris,
// 2026-08-17). workProductsFor filters the option out of every vocabulary
// unless the matter's `state` is one of these - and because that helper drives
// BOTH the rendered checkbox list and validateFields' vocabulary, the rule is
// enforced identically on the client form and the server.
export const IME_STATES = ["NY", "NJ"];
export const MARITAL_WORK_PRODUCTS = ["Vocational Evaluation"];
export const EDUCATION = ["Less than high school", "High school / GED", "Some college", "Associate", "Bachelor", "Graduate"];

const isRetainer = (ft) => typeof ft === "string" && ft.endsWith("-intake");

// The unified public intake form's flat case-type vocabulary (the values of
// lib/case-types.mjs's CASE_TYPES - grouping into <optgroup>s is a client-only
// concern, handled by src/lib/unified-intake-visibility.ts + case-types.mjs's
// own caseTypeGroups(), not by this schema).
const UNIFIED_CASE_TYPES = CASE_TYPES.map((c) => c.value);

// The unified form (formType "unified-intake") drives field REQUIREDNESS by
// the ROUTE its selected case type resolves to (spec 2026-07-16
// unified-intake-wpec-routing-design.md §3), rather than a fixed
// per-formType rule: the wpec bucket hides/does not require the side,
// work-product, e-sign, and payment fields. Returns null for every OTHER
// formType, so each call site below falls back to its EXISTING static rule -
// zero behavior change for personal-injury-intake/marital-intake/
// nonmetro-intake/consulting-intake.
function unifiedRoute(formType, data) {
  if (formType !== "unified-intake") return null;
  return routeForCaseType(data && data.caseType);
}

// A field that must be filled on every retainer PSA - all routes EXCEPT the
// email-only WPEC referral (which collects no PSA). Mirrors the
// esignConsent/workProducts/paymentMethod rule so "every PSA box fully filled
// in" is enforced identically on the client form and the server (validateFields
// is the single source of truth). For the 4 legacy retainer forms unifiedRoute
// is null, so this falls back to isRetainer (always true for a *-intake form).
const requiredForRetainer = (ft, data) => {
  const route = unifiedRoute(ft, data);
  return route !== null ? route !== "wpec" : isRetainer(ft);
};
// The two Defense-only PSA boxes (Carrier/Claim No., Adjuster) - required only
// when the retaining side is Defense; blank/irrelevant for plaintiff, joint,
// husband/wife, and matrimonial (which has no side row).
const requiredWhenDefense = (ft, data) => requiredForRetainer(ft, data) && (data && data.retainingSide) === "defense";

// Resolve the per-form option set. Light forms (consultation/contact) don't use
// these fields, so they fall back to the personal-injury vocabulary.
const FORM_OPTIONS = {
  "personal-injury-intake": { sides: PI_SIDES, caseTypes: PI_CASE_TYPES, workProducts: PI_WORK_PRODUCTS, payments: PI_PAYMENTS },
  "consulting-intake": { sides: PI_SIDES, caseTypes: CONSULTING_CASE_TYPES, workProducts: CONSULTING_WORK_PRODUCTS, payments: PI_PAYMENTS },
  "nonmetro-intake": { sides: NONMETRO_SIDES, caseTypes: NONMETRO_CASE_TYPES, workProducts: NONMETRO_WORK_PRODUCTS, payments: NONMETRO_PAYMENTS },
  "marital-intake": { sides: [], caseTypes: MARITAL_CASE_TYPES, workProducts: MARITAL_WORK_PRODUCTS, payments: MARITAL_PAYMENTS },
  "unified-intake": { sides: PI_SIDES, caseTypes: UNIFIED_CASE_TYPES, workProducts: PI_WORK_PRODUCTS, payments: PI_PAYMENTS },
};
export function formOptions(ft) {
  return FORM_OPTIONS[ft] || FORM_OPTIONS["personal-injury-intake"];
}

// Route-aware "Work product(s) authorized" vocabulary. The unified intake offers
// one form for every case type, but the destination PSA template depends on the
// case type's ROUTE, and the matrimonial route's marital PSA can only express
// the marital work-product vocabulary (MARITAL_WORK_PRODUCTS = Vocational
// Evaluation) - any other product silently drops from the stamped PSA. So for
// the unified form's matrimonial route, narrow the options to the marital set;
// every other unified route (standard/wpec) keeps the unified (PI) set, and the
// 4 legacy forms (unifiedRoute === null) keep their own fixed vocabulary
// unchanged. Mirrors the unifiedFieldVisibility precedent that hides the side
// row for matrimonial. Drives BOTH the workProducts field's options (so
// validateFields agrees on client AND server) and the form's rendered checkbox
// list, so the two can never drift.
export function workProductsFor(formType, data) {
  const route = unifiedRoute(formType, data);
  const base = route === "matrimonial" ? MARITAL_WORK_PRODUCTS : formOptions(formType).workProducts;
  // IME is offered for NY/NJ matters ONLY (see IME_STATES). Filtered here -
  // not removed from the vocabularies - so the PSA template parity pins stay
  // intact and a NY/NJ matter still gets the full list. An unset state hides
  // the option too (it reappears the moment NY or NJ is chosen).
  if (base.includes("IME") && !IME_STATES.includes(data?.state)) {
    return base.filter((p) => p !== "IME");
  }
  return base;
}

export const SECTIONS = ["party", "evaluee", "matter", "opposing", "billing"];

// Marketing-attribution vocabulary for the "How did you hear about us?"
// dropdown. Shared by the public forms (client render + server validateFields)
// and mirrored by the workflow dashboard's referral panel
// (workflow/lib/case-detail-rows.js HOW_HEARD_LABELS - the workflow container
// builds from workflow/ only and cannot import this file; a workflow test pins
// the two lists together). "other" must stay LAST (the forms reveal a free-text
// field for it), and it pairs with the free-text `howHeardOther`.
export const HOW_HEARD = [
  { value: "google", label: "Google search" },
  { value: "other-search", label: "Other search engine (Bing, DuckDuckGo...)" },
  { value: "ai-assistant", label: "AI assistant (ChatGPT, Claude, Gemini...)" },
  { value: "attorney-referral", label: "Referral from another attorney" },
  { value: "colleague-referral", label: "Referral from a colleague or paralegal" },
  { value: "past-client", label: "Worked with KWVRS before" },
  { value: "expert-directory", label: "Expert witness directory (SEAK, JurisPro...)" },
  { value: "bar-cle", label: "Bar association / CLE program" },
  { value: "conference", label: "Conference or seminar" },
  { value: "prior-testimony", label: "Saw prior testimony or a court opinion" },
  { value: "publication", label: "Legal publication or article" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "social", label: "Other social media" },
  { value: "email-newsletter", label: "Email or newsletter" },
  { value: "other", label: "Other" },
];

// Badge text for the two retention tiers, mirrored from src/data/team.ts.
export const EXPERT_TIER_LABELS = { senior: "Senior Expert", fellow: "Fellow Expert" };

// The KWVRS experts an attorney may ask for by name on the intake forms.
// SNAPSHOT of src/data/team.ts's retainableExperts() (slug, display name, tier),
// senior first, in the order the picker renders. It is duplicated rather than
// imported because this file must stay dependency-free: the site's production
// Docker image copies lib/, not src/. src/data/team.expert-picker.parity.test.ts
// pins the two together, so adding an expert is a one-field edit in team.ts plus
// one line here and the test fails until both are done. Nobody honored in
// memoriam and no support/operations member appears here (see retainableExperts).
export const RETAINED_EXPERTS = [
  { value: "daniel-wolstein", label: "Daniel Wolstein, Ph.D.", tier: "senior" },
  { value: "matthew-putts", label: "Matthew R. Putts, Ph.D.", tier: "senior" },
  { value: "jesse-wolstein", label: "Jesse Wolstein, M.D., M.A.", tier: "fellow" },
  { value: "sharon-hirsh", label: "Sharon Hirsh, M.S.", tier: "fellow" },
  { value: "paul-bourgeois", label: "Paul Bourgeois, Ph.D.", tier: "fellow" },
  { value: "christopher-skerritt", label: "Christopher Skerritt, M.Ed., MBA", tier: "fellow" },
  { value: "john-halpin", label: "John J. Halpin, M.A.", tier: "fellow" },
  { value: "kristina-fredericksen", label: "Kristina Fredericksen-Koleck", tier: "fellow" },
  { value: "john-may", label: "John May, M.A.", tier: "fellow" },
  { value: "christina-rivera", label: "Christina Rivera, R.N., B.S.N.", tier: "fellow" },
  { value: "logan-patterson", label: "Logan Patterson, M.A.", tier: "fellow" },
];

/** Roster entry for a team slug, or null when the slug is blank or unknown. */
export function retainedExpertMeta(slug) {
  const s = str(slug);
  if (!s) return null;
  return RETAINED_EXPERTS.find((e) => e.value === s) || null;
}

// required/options may be a value or a (formType) => value function.
export const FIELDS = [
  // A. Retaining party
  { key: "retainingAttorneyFirstName", section: "party", label: "Attorney first name", help: "", type: "text", required: isRetainer },
  { key: "retainingAttorneyLastName", section: "party", label: "Attorney last name", help: "", type: "text", required: isRetainer },
  { key: "retainingAttorneyEmail", section: "party", label: "Attorney email", help: "We send confirmations and the agreement here.", type: "email", format: "email", required: isRetainer },
  { key: "retainingAttorneyPhone", section: "party", label: "Attorney phone", help: "", type: "tel", format: "phone", required: isRetainer },
  { key: "retainingFirm", section: "party", label: "Retaining firm", help: "Firm name only.", type: "text", required: isRetainer },
  { key: "retainingParalegalFirstName", section: "party", label: "Paralegal first name", help: "", type: "text", required: false },
  { key: "retainingParalegalLastName", section: "party", label: "Paralegal last name", help: "", type: "text", required: false },
  { key: "retainingParalegalEmail", section: "party", label: "Paralegal email", help: "", type: "email", format: "email", required: false },
  { key: "reportsCcParalegal", section: "party", label: "Reports can be emailed to the paralegal", help: "", type: "checkbox", required: false },
  { key: "esignConsent", section: "party", label: "Consent to sign the PSA electronically", help: "", type: "checkbox", required: (ft, data) => { const route = unifiedRoute(ft, data); return route !== null ? route !== "wpec" : isRetainer(ft); } },
  { key: "esignTypedName", section: "party", label: "Type your full legal name to sign", help: "This becomes your electronic signature on the PSA.", type: "text", required: (formType, data) => { const route = unifiedRoute(formType, data); const esignApplies = route !== null ? route !== "wpec" : isRetainer(formType); return esignApplies && Boolean(data && (data.esignConsent === true || data.esignConsent === "true" || data.esignConsent === "Yes")); } },
  // B. Evaluee
  { key: "evalueeFirstName", section: "evaluee", label: "Evaluee first name", help: "The person to be evaluated.", type: "text", required: isRetainer },
  { key: "evalueeLastName", section: "evaluee", label: "Evaluee last name", help: "", type: "text", required: isRetainer },
  { key: "evalueeDob", section: "evaluee", label: "Date of birth", help: "Helps scope vocational and economic analysis.", type: "date", format: "dateNotFuture", required: false },
  { key: "evalueeOccupation", section: "evaluee", label: "Occupation (pre-injury / current)", help: "", type: "text", required: false },
  { key: "evalueeEducation", section: "evaluee", label: "Education level", help: "", type: "select", options: () => EDUCATION, format: "enum", required: false },
  // C. The matter
  { key: "caseType", section: "matter", label: "Type of case", help: "", type: "select", options: (ft) => formOptions(ft).caseTypes, format: "enum", required: isRetainer },
  { key: "retainingSide", section: "matter", label: "Retaining counsel represents", help: "", type: "radio", options: (ft) => formOptions(ft).sides, format: "enum", required: (ft, data) => { const route = unifiedRoute(ft, data); return route !== null ? route === "standard" : formOptions(ft).sides.length > 0; } },
  { key: "workProducts", section: "matter", label: "Work product(s) authorized", help: "Select at least one.", type: "multiselect", options: (ft, data) => workProductsFor(ft, data), required: (ft, data) => { const route = unifiedRoute(ft, data); return route !== null ? route !== "wpec" : isRetainer(ft); } },
  { key: "dateOfLoss", section: "matter", label: "Date of injury / loss", help: "", type: "date", format: "dateNotFuture", required: false },
  { key: "injuryDescription", section: "matter", label: "Injury / condition (brief)", help: "One or two lines.", type: "textarea", required: false },
  { key: "venueCourt", section: "matter", label: "Jurisdiction / court", help: "", type: "text", required: false },
  { key: "docketCaption", section: "matter", label: "Docket no. / case caption", help: "", type: "text", required: false },
  { key: "state", section: "matter", label: "State", help: "", type: "select", options: () => STATE_VALUES, format: "enum", required: isRetainer },
  { key: "city", section: "matter", label: "City", help: "", type: "text", required: false },
  { key: "dateNeededBy", section: "matter", label: "Report needed by", help: "", type: "date", format: "dateFutureDeadline", required: requiredForRetainer },
  // NOTE: a standalone "Referral source" field was removed 2026-07-17 (Chris:
  // duplicative of "How did you hear about us?"). howHeard is the single
  // attribution field. The PSA templates still carry a "Referral Source" text
  // box; psa-prefill.js now feeds it from howHeard (matching Clio's existing
  // howHeardLabel treatment). Payloads that still send referralSource are
  // accepted and ignored (validateFields only iterates FIELDS).
  { key: "howHeard", section: "matter", label: "How did you hear about us?", help: "", type: "select", options: () => HOW_HEARD, format: "enum", required: false },
  { key: "howHeardOther", section: "matter", label: "How you heard about us (other)", help: "Only if you chose Other.", type: "text", required: false },
  { key: "turnaround", section: "matter", label: "Requested turnaround", help: "", type: "radio", options: () => [{ value: "standard", label: "Standard" }, { value: "rush", label: "Rush" }], format: "enum", required: isRetainer },
  // Retained-expert preference (spec 2026-07-28). OPTIONAL on every form: "No
  // preference - let KWVRS assign" is the default and stores an empty value, so
  // no existing submission becomes invalid. The vocabulary is the firm-wide
  // RETAINED_EXPERTS roster (not per-PSA), so the rendered picker and the
  // validation that guards it can never drift. It does NOT stamp the PSA.
  { key: "retainedExpert", section: "matter", label: "Requested KWVRS expert", help: "Optional. Leave this unset and KWVRS assigns the expert.", type: "select", options: () => RETAINED_EXPERTS, format: "enum", required: false },
  { key: "notes", section: "matter", label: "Case summary / notes", help: "", type: "textarea", required: false },
  // D. Opposing party & insurance
  { key: "opposingCounselName", section: "opposing", label: "Opposing counsel name", help: "", type: "text", required: requiredForRetainer },
  { key: "opposingCounselFirm", section: "opposing", label: "Opposing counsel firm", help: "", type: "text", required: requiredForRetainer },
  { key: "opposingCounselEmail", section: "opposing", label: "Opposing counsel email", help: "", type: "email", format: "email", required: false },
  { key: "opposingCounselPhone", section: "opposing", label: "Opposing counsel phone", help: "", type: "tel", format: "phone", required: false },
  // The live RetainerIntakeForm collects the "Carrier / Claim No." PSA box as a
  // single composite (carrierClaimNo). carrierName/claimNumber are the granular
  // equivalents used by the future granular surface + deriveLegacyKeys; they
  // stay optional so validateFields never demands them of the composite form.
  { key: "carrierClaimNo", section: "opposing", label: "Carrier / claim no.", help: "", type: "text", required: requiredWhenDefense },
  { key: "carrierName", section: "opposing", label: "Insurance carrier", help: "", type: "text", required: false },
  { key: "claimNumber", section: "opposing", label: "Claim number", help: "", type: "text", required: false },
  { key: "adjusterName", section: "opposing", label: "Adjuster name", help: "", type: "text", required: requiredWhenDefense },
  // E. Billing
  // The live RetainerIntakeForm collects the "Invoice should be sent to" PSA box
  // as one free-text composite (invoiceTo). The granular billing* fields below
  // are the future granular equivalents + deriveLegacyKeys sources; they stay
  // optional so validateFields never demands them of the composite form.
  { key: "invoiceTo", section: "billing", label: "Invoice / billing address", help: "", type: "textarea", required: requiredForRetainer },
  { key: "billingContactName", section: "billing", label: "Billing contact", help: "", type: "text", required: false },
  { key: "billingEmail", section: "billing", label: "Billing email", help: "", type: "email", format: "email", required: false },
  { key: "billingStreet", section: "billing", label: "Billing street address", help: "", type: "text", required: false },
  { key: "billingCity", section: "billing", label: "Billing city", help: "", type: "text", required: false },
  { key: "billingState", section: "billing", label: "Billing state", help: "", type: "select", options: () => STATE_VALUES, format: "enum", required: false },
  { key: "billingZip", section: "billing", label: "Billing ZIP", help: "", type: "zip", format: "zip", required: false },
  { key: "paymentMethod", section: "billing", label: "Payment method", help: "", type: "radio", options: (ft) => formOptions(ft).payments, format: "enum", required: (ft, data) => { const route = unifiedRoute(ft, data); return route !== null ? route !== "wpec" : isRetainer(ft); } },
];

// State/territory abbreviations. Phase 2 replaces this literal with a re-export
// from src/data/states.ts (client) - but the server needs the values here, so
// they are duplicated intentionally and pinned by a test in Phase 2.
export const STATE_VALUES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC","PR","VI","GU","AS","MP",
];

// resolve: `data` is an optional third arg forwarded to function-valued
// required/options, so a field's `required` resolver can read sibling fields
// (e.g. esignTypedName is required only when esignConsent is checked).
// Existing callers that pass no `data` behave identically (data is undefined,
// same as before this arg existed).
const resolve = (v, formType, data) => (typeof v === "function" ? v(formType, data) : v);

export function getFields(formType, data = {}) {
  return FIELDS.map((f) => ({
    ...f,
    resolvedOptions: resolve(f.options, formType, data),
    resolvedRequired: Boolean(resolve(f.required, formType, data)),
  }));
}

const FORMAT_CHECKS = {
  email: (v) => (isEmail(v) ? null : "enter a valid email"),
  phone: (v) => (isPhone(v) ? null : "enter a valid phone number"),
  zip: (v) => (isZip(v) ? null : "enter a valid ZIP"),
  dateNotFuture: (v, now) => (isNonFutureDate(v, now) ? null : "enter a valid date (not in the future)"),
  dateNotPast: (v, now) => (isNonPastDate(v, now) ? null : "enter a valid date (not in the past)"),
  // Hard-deadline rule (dateNeededBy): reject a deadline the dashboard would flag
  // OVERDUE on arrival - see isFutureDeadlineDate. Message nudges toward Rush.
  dateFutureDeadline: (v, now) => (isFutureDeadlineDate(v, now) ? null : "Date needed by must be after today - if the matter is urgent, choose the Rush turnaround instead"),
};

function isEmptyValue(v) {
  if (Array.isArray(v)) return v.length === 0;
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "") || v === false;
}

// A field label mid-sentence: drop only the leading capital, never the rest.
// Lowercasing the whole label turned "Requested KWVRS expert" into "requested
// kwvrs expert" in the error the attorney reads.
const midSentence = (label) => String(label || "").charAt(0).toLowerCase() + String(label || "").slice(1);

export function validateFields(formType, data = {}, now = Date.now()) {
  if (!data || typeof data !== "object") data = {};
  const errors = {};
  for (const f of getFields(formType, data)) {
    const val = data[f.key];
    // Multiselect fields are satisfied ONLY by a non-empty array of allowed
    // values; a non-array truthy value must not slip past the required check,
    // and every element must be in the resolved vocabulary.
    if (f.type === "multiselect") {
      const arr = Array.isArray(val) ? val : [];
      if (f.resolvedRequired && arr.length === 0) {
        errors[f.key] = `${f.label} is required`;
        continue;
      }
      const opts = (f.resolvedOptions || []).map((o) => (typeof o === "string" ? o : o.value));
      if (arr.some((x) => !opts.includes(x))) errors[f.key] = `choose valid ${midSentence(f.label)}`;
      continue;
    }
    const empty = isEmptyValue(val);
    if (f.resolvedRequired && empty) {
      errors[f.key] = `${f.label} is required`;
      continue;
    }
    if (empty) continue;
    if (f.format === "enum") {
      const opts = (f.resolvedOptions || []).map((o) => (typeof o === "string" ? o : o.value));
      if (!opts.includes(val)) errors[f.key] = `choose a valid ${midSentence(f.label)}`;
    } else if (f.format && FORMAT_CHECKS[f.format]) {
      const msg = FORMAT_CHECKS[f.format](val, now);
      if (msg) errors[f.key] = msg;
    }
  }
  return errors;
}

/**
 * The fill-in-place modal's feed (spec 2026-08-10-intake-missing-info-modal):
 * every required-and-unmet or format-failing field for this form and data, in
 * FIELDS (form) order, with everything a generic control needs to render it.
 * Pure; safe on both client and server (this file ships in the Docker image).
 */
export function missingRequiredFields(formType, data = {}) {
  const problems = validateFields(formType, data);
  return getFields(formType, data)
    .filter((f) => Object.prototype.hasOwnProperty.call(problems, f.key))
    .map((f) => ({
      key: f.key,
      label: f.label,
      message: problems[f.key],
      type: f.type,
      options: Array.isArray(f.resolvedOptions) ? f.resolvedOptions : [],
    }));
}

// ---- Legacy-key derivation (preserves the PSA prefill contract) ----
// The workflow's psa-prefill.js reads a fixed set of composite keys
// (individualEvaluated, retainingAttorneyName, retainingParalegalName,
// carrierClaimNo, invoiceTo). The redesigned intake collects those as granular
// fields, so this composes the legacy composites from the granular values. Only
// non-empty composites are emitted, so spreading the result never overwrites an
// existing legacy value with a blank. All other legacy keys (retainingFirm,
// *Email, dateNeededBy, opposingCounsel*, adjusterName,
// retainingSide, caseType, workProducts, paymentMethod, reportsCcParalegal)
// already share their key names and pass through unchanged.
const joinName = (first, last) => [str(first), str(last)].filter(Boolean).join(" ");
const joinSlash = (a, b) => [str(a), str(b)].filter(Boolean).join(" / ");

function composeInvoiceTo(d) {
  const cityLine = [str(d.billingCity), [str(d.billingState), str(d.billingZip)].filter(Boolean).join(" ")]
    .filter(Boolean).join(", ");
  return [str(d.billingContactName), str(d.billingEmail), str(d.billingStreet), cityLine]
    .filter(Boolean).join("; ");
}

export function deriveLegacyKeys(data = {}) {
  if (!data || typeof data !== "object") data = {};
  const out = {};
  const put = (k, v) => { if (v) out[k] = v; };
  put("individualEvaluated", joinName(data.evalueeFirstName, data.evalueeLastName));
  put("retainingAttorneyName", joinName(data.retainingAttorneyFirstName, data.retainingAttorneyLastName));
  put("retainingParalegalName", joinName(data.retainingParalegalFirstName, data.retainingParalegalLastName));
  put("carrierClaimNo", joinSlash(data.carrierName, data.claimNumber));
  put("invoiceTo", composeInvoiceTo(data));
  return out;
}

// ---- Retained-expert payload keys ----
// SEPARATE from deriveLegacyKeys on purpose: that function's five composites are
// the PSA prefill contract and must not grow. These three keys are what the
// dashboard case detail and the internal team email render
// (workflow/lib/case-detail-rows.js). An unknown or blank slug yields {} so
// spreading the result can never write a bogus expert onto a payload.
export function deriveRetainedExpertKeys(data = {}) {
  const meta = retainedExpertMeta(data && data.retainedExpert);
  if (!meta) return {};
  return { retainedExpert: meta.value, retainedExpertName: meta.label, retainedExpertTier: meta.tier };
}
