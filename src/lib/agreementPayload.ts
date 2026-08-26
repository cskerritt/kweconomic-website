// Builds the JSON payload posted by the /agreements/:slug retention forms to
// /api/consultation. The server intake validator (validation.server.mjs) and the
// workflow's psa-prefill read NORMALIZED keys (individualEvaluated, retainingSide,
// paymentMethod, reportsCcParalegal, workProducts, formType, name, firm, caseType),
// while the form fields are keyed by their human labels ("Individual To Be
// Evaluated", "Payment Method", ...). This bridges the two so a completed
// agreement form is accepted AND every selection reaches the signed PSA.
//
// The choice fields (side, payment) post their printed LABEL as the value, so we
// map them to the schema's token values (plaintiff/defense/joint/husband/wife,
// check/credit-card/ach/card-or-ach) via formOptions - the same tokens
// psa-prefill's SIDE_CHECKBOXES / PAY_CHECKBOXES key on. Without this, e.g.
// "Joint with Co-Counsel(s)" or "Check" silently drop off the executed agreement.
import {
  formOptions,
  deriveRetainedExpertKeys,
  missingRequiredFields,
} from "../../lib/intake-schema.mjs";
import type { MissingFieldRow } from "@/components/ui/MissingInfoModal";

interface AgreementLike {
  title: string;
  slug: string;
  intake: {
    firmLabel: string;
    representsOptions?: string[];
    caseTypeOptions?: string[];
    workProductOptions?: string[];
    paymentOptions?: string[];
  };
}

// The PSA slug is the form slug except for matrimonial, whose template + schema
// vocabulary are named "marital".
export function agreementFormType(slug: string): string {
  return `${slug === "matrimonial" ? "marital" : slug}-intake`;
}

// The schema keys the /agreements missing-info modal validates: the keys
// buildAgreementPayload emits that ALSO map 1:1 to a control this form renders.
// The composite form has one "Retaining Attorney Name" box, so the schema's
// granular name/state/turnaround/e-sign fields can never be satisfied here and
// keep the browser's native `required` (or nothing) as their gate.
// NOTE individualEvaluated is not a schema field at all (the schema collects
// granular evaluee names), so it never yields a row today; it stays on the list
// because the input is the modal's write-back target the day it becomes one.
export const AGREEMENT_MODAL_KEYS: string[] = [
  "individualEvaluated",
  "caseType",
  "workProducts",
  "retainingSide",
  "dateNeededBy",
  "invoiceTo",
  "paymentMethod",
];

// key -> the form control the modal writes its answer into. Group fields post
// under their printed label (the name attribute); the single text/date controls
// are addressed by id. form.elements.namedItem matches EITHER, so one map does
// both.
export const AGREEMENT_KEY_TO_NAME: Record<string, string> = {
  individualEvaluated: "individual",
  caseType: "Type of Case",
  workProducts: "Work Product(s) Authorized",
  retainingSide: "Retaining Counsel Represents",
  dateNeededBy: "due-date",
  invoiceTo: "invoice-to",
  paymentMethod: "Payment Method",
};

// The two radio groups whose payload value is a normalized TOKEN while the radio
// itself carries the printed label.
const TOKENIZED: Record<string, "sides" | "payments"> = {
  retainingSide: "sides",
  paymentMethod: "payments",
};

const isEmptyValue = (v: unknown): boolean =>
  Array.isArray(v)
    ? v.length === 0
    : v === undefined || v === null || v === false || (typeof v === "string" && v.trim() === "");

/**
 * The missing-info modal's rows for a composite /agreements submission: the
 * shared schema's gap list, narrowed to what this form can actually fix.
 *
 * Three narrowings, each of which would otherwise strand the attorney behind a
 * row no control can satisfy (Continue stays disabled while rows remain):
 *  1. Only AGREEMENT_MODAL_KEYS - the rest of the schema's fields have no
 *     control on this form.
 *  2. retainingSide only when the PSA prints a represents row. The schema's own
 *     resolver already agrees (marital has no sides), so this is a guard against
 *     a future PSA/schema drift, not a correction.
 *  3. EMPTINESS only, except dateNeededBy. This form posts the PSA's printed
 *     LABELS, and those are not always the schema's enum values (the PI PSA
 *     prints "Med Mal"/"WC"/"Econ"), plus "Type of Case" is multi-select and
 *     posts a joined string - so a schema enum verdict on an ANSWERED field
 *     would reject submissions that are correct for the PSA. dateNeededBy is
 *     the exception: its rule (a deadline after today) is expressible in the
 *     modal's own date control, so it stays.
 */
export function agreementModalRows(
  values: Record<string, unknown>,
  agreement: AgreementLike,
): MissingFieldRow[] {
  const formType =
    typeof values.formType === "string" ? values.formType : agreementFormType(agreement.slug);
  const hasSides = Boolean(agreement.intake.representsOptions?.length);
  const rows = missingRequiredFields(formType, values) as MissingFieldRow[];
  return rows
    .filter((row) => AGREEMENT_MODAL_KEYS.includes(row.key))
    .filter((row) => (row.key === "retainingSide" ? hasSides : true))
    .filter((row) => row.key === "dateNeededBy" || isEmptyValue(values[row.key]))
    .map((row) =>
      // The PSA's own case-type vocabulary, not the schema's: an option with no
      // checkbox on this form could never be written back.
      row.key === "caseType"
        ? { ...row, options: [...(agreement.intake.caseTypeOptions ?? [])] }
        : row,
    );
}

/**
 * The DOM-shaped value for a modal answer: the modal holds schema-shaped values
 * (tokens for the two radio groups), the form's controls carry printed labels.
 */
export function agreementControlValue(
  agreement: AgreementLike,
  key: string,
  value: unknown,
): string | string[] {
  if (Array.isArray(value)) return value.map(String);
  const group = TOKENIZED[key];
  if (!group) return value === undefined || value === null ? "" : String(value);
  const options = formOptions(agreementFormType(agreement.slug))[group] as {
    value: string;
    label: string;
  }[];
  return options.find((o) => o.value === value)?.label ?? String(value ?? "");
}

export function buildAgreementPayload(
  raw: FormData,
  agreement: AgreementLike,
): Record<string, unknown> {
  // Keep every (label-keyed) field for the record...
  const payload: Record<string, unknown> = { _agreement: agreement.title };
  for (const [k, v] of raw.entries()) {
    const prev = payload[k];
    payload[k] = prev === undefined ? v : Array.isArray(prev) ? [...prev, v] : [prev, v];
  }

  // ...then add the normalized keys the intake workflow + server validator read.
  const formType = agreementFormType(agreement.slug);
  const opts = formOptions(formType);
  const toToken = (list: { value: string; label: string }[], label: unknown): string =>
    list.find((o) => o.label === label)?.value ?? String(label ?? "").toLowerCase();

  payload.formType = formType;
  payload.name = raw.get("Retaining Attorney Name") ?? "";
  // The workflow's case row (psa-mapping), the dashboard's "Attorney phone"
  // detail row, and the Clio contact create/backfill all read
  // retainingAttorneyPhone (or the plain `phone` the consultation route
  // normalizes it into) - without this key an /agreements case has no phone
  // anywhere downstream.
  payload.retainingAttorneyPhone = raw.get("Retaining Attorney Phone") ?? "";
  payload.firm = raw.get(agreement.intake.firmLabel) ?? "";
  payload.individualEvaluated = raw.get("Individual To Be Evaluated") ?? "";
  // "Type of Case" is a checkbox group - read ALL selections (getAll), not just
  // the first, so a second checked case type is not silently dropped.
  payload.caseType = raw.getAll("Type of Case").join(", ");
  // The server requires at least one work product for every *-intake submission.
  payload.workProducts = raw.getAll("Work Product(s) Authorized");
  // These reach the case row / Asana (due date, referral, invoice) and the PSA
  // PDF via the same camelCase keys, so normalize them from their label keys -
  // else the Asana task lands with NO deadline and blank referral/invoice.
  payload.dateNeededBy = raw.get("Report(s) Needed By") ?? "";
  // DOI reaches the dashboard conflict block + detail rows via the same
  // camelCase key the shared schema validates (dateOfLoss, dateNotFuture).
  payload.dateOfLoss = raw.get("Date of Injury / Loss") ?? "";
  payload.referralSource = raw.get("Referral Source") ?? "";
  payload.invoiceTo = raw.get("Invoice should be sent to") ?? "";
  // retainingSide is only present on agreements that ask who counsel represents;
  // normalize the printed label to the schema token so psa-prefill can match it.
  const sideLabel = raw.get("Retaining Counsel Represents");
  if (sideLabel !== null) payload.retainingSide = toToken(opts.sides, sideLabel);
  // Payment method: map the printed label to its token (else the PSA pay checkbox drops).
  const payLabel = raw.get("Payment Method");
  if (payLabel !== null) payload.paymentMethod = toToken(opts.payments, payLabel);
  // The form's paralegal field is a single combined "Name / Email"; psa-prefill
  // reads retainingParalegalName (joined name/email), so pass it through there.
  payload.retainingParalegalName = raw.get("Retaining Paralegal / Email") ?? "";
  payload.reportsCcParalegal = raw.get("Reports can be emailed to paralegals") === "Yes";
  // Retained-expert picker: the radio group posts the team slug under its own
  // name, so the label-keyed loop above already copied it verbatim. Re-derive it
  // through the shared roster so a slug that is not on the roster is DROPPED
  // rather than stored, and add the display name + tier the dashboard case
  // detail and the internal team email render.
  const expert = deriveRetainedExpertKeys({ retainedExpert: raw.get("retainedExpert") });
  payload.retainedExpert = expert.retainedExpert ?? "";
  if (expert.retainedExpertName) payload.retainedExpertName = expert.retainedExpertName;
  if (expert.retainedExpertTier) payload.retainedExpertTier = expert.retainedExpertTier;
  // The attorney email is already posted under the "email" field name.

  return payload;
}
