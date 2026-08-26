// Pure payload builder for the PSA retainer intake forms. Kept out of the
// component file so it exports only components (react-refresh requirement)
// and the builder stays unit-testable without rendering.
//
// Phase 2b: the form now collects GRANULAR names (evaluee first/last, attorney
// first/last + phone, paralegal first/last) keyed exactly like the shared schema
// (lib/intake-schema.mjs), so both the client and the server can validate with
// the schema's validateFields. buildRetainerPayload additionally emits
// deriveLegacyKeys(fields) - the composite keys (individualEvaluated,
// retainingAttorneyName, retainingParalegalName) that the workflow's
// psa-prefill.js reads - so the PSA-prefill contract is unchanged.
import { deriveLegacyKeys, deriveRetainedExpertKeys } from "../../lib/intake-schema.mjs";
import { unifiedFieldVisibility } from "@/lib/unified-intake-visibility";
import type { IntakeFormSpec } from "@/data/intakeForms";
import type { TurnaroundOption } from "@/lib/turnaround";

export type RetainingSide = "plaintiff" | "defense" | "joint" | "husband" | "wife";
export type PaymentMethod = "check" | "credit-card" | "ach" | "card-or-ach";

export interface RetainerIntakeFields {
  evalueeFirstName: string;
  evalueeLastName: string;
  retainingAttorneyFirstName: string;
  retainingAttorneyLastName: string;
  retainingAttorneyEmail: string;
  retainingAttorneyPhone: string;
  retainingParalegalFirstName: string;
  retainingParalegalLastName: string;
  retainingParalegalEmail: string;
  reportsCcParalegal: boolean;
  esignConsent: boolean;
  esignTypedName: string;
  retainingFirm: string;
  invoiceTo: string;
  /** Empty when the PSA has no "represents" row (matrimonial). */
  retainingSide: RetainingSide | "";
  opposingCounselName: string;
  opposingCounselFirm: string;
  carrierClaimNo: string;
  adjusterName: string;
  caseType: string;
  workProducts: string[];
  /** Optional date of injury / loss (YYYY-MM-DD, dateNotFuture) - conflict-check context. */
  dateOfLoss: string;
  state: string;
  city: string;
  dateNeededBy: string;
  /** Marketing attribution: a value from the schema's HOW_HEARD vocabulary. */
  howHeard: string;
  /** Free text shown when howHeard === "other". */
  howHeardOther: string;
  paymentMethod: PaymentMethod;
  notes: string;
  /** Team slug of the requested expert, or "" for "No preference". */
  retainedExpert: string;
  turnaround: TurnaroundOption;
}

export interface RetainerIntakePayload extends RetainerIntakeFields {
  formType: string;
  psaFile: string;
  // Legacy composite keys the workflow's psa-prefill reads, derived from the
  // granular fields (present only when their source fields are non-empty).
  individualEvaluated?: string;
  retainingAttorneyName?: string;
  retainingParalegalName?: string;
  // Derived from retainedExpert; present only when an expert was picked.
  retainedExpertName?: string;
  retainedExpertTier?: string;
}

export function buildRetainerPayload(
  spec: IntakeFormSpec,
  fields: RetainerIntakeFields,
  wpecRoutingEnabled = false,
): RetainerIntakePayload {
  // A WPEC-routed unified submission must not carry a KWVRS expert preference:
  // the picker is hidden on that route, but hidden state still submits when the
  // attorney picked an expert and THEN switched the case type to an
  // employment/discrimination matter - and the referral surfaces would print a
  // preference the form no longer shows. Mirrors updateCaseType's work-product
  // prune, applied at the payload boundary where it is pure and testable.
  const visibility = spec.unified ? unifiedFieldVisibility(fields.caseType, wpecRoutingEnabled) : null;
  const wpecRouted = Boolean(visibility?.showWpecNotice) && Boolean(fields.retainedExpert);
  // Same shape for the "represents" side: the matrimonial route hides the side
  // row (its marital PSA prints no side boxes), but a side picked BEFORE the
  // case type was switched still sits in state and would stamp nothing while
  // tripping the dashboard's "represents_* NOT stamped" warning.
  const sideHidden = visibility !== null && !visibility.showSide && Boolean(fields.retainingSide);
  const cleanFields =
    wpecRouted || sideHidden
      ? { ...fields, ...(wpecRouted ? { retainedExpert: "" } : {}), ...(sideHidden ? { retainingSide: "" as const } : {}) }
      : fields;
  return {
    formType: `${spec.slug}-intake`,
    psaFile: spec.psaFile,
    ...cleanFields,
    // Composes individualEvaluated / retainingAttorneyName / retainingParalegalName
    // (and, when present, carrierClaimNo / invoiceTo) from the granular fields.
    // Blank composites are omitted, so the form's own carrierClaimNo / invoiceTo
    // are not overwritten.
    ...(deriveLegacyKeys(cleanFields as unknown as Record<string, unknown>) as Partial<RetainerIntakePayload>),
    // Adds retainedExpertName + retainedExpertTier for a picked expert, and
    // NOTHING at all otherwise, so "No preference" leaves retainedExpert "" and
    // no stale name/tier can ride along.
    ...(deriveRetainedExpertKeys(cleanFields as unknown as Record<string, unknown>) as Partial<RetainerIntakePayload>),
  };
}
