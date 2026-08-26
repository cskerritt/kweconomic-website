import { useCallback, useState } from "react";
import { states } from "@/data/states";
import type { IntakeFormSpec } from "@/data/intakeForms";
import { buildRetainerPayload, type RetainerIntakeFields } from "@/lib/intake-payloads";
import { TURNAROUND_OPTIONS, DEFAULT_TURNAROUND } from "@/lib/turnaround";
import {
  validateFields as schemaValidate,
  HOW_HEARD,
  FIELDS,
  workProductsFor,
  missingRequiredFields,
} from "../../lib/intake-schema.mjs";
import MissingInfoModal, { type MissingFieldRow } from "@/components/ui/MissingInfoModal";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import ExpertPicker from "@/components/ExpertPicker";
import { unifiedFieldVisibility } from "@/lib/unified-intake-visibility";
import { caseTypeGroups } from "../../lib/case-types.mjs";

export type { PaymentMethod, RetainerIntakeFields, RetainingSide } from "@/lib/intake-payloads";

// Build-time mirror of the server's WPEC_ROUTING_ENABLED flag. The server only
// routes employment/discrimination cases to WPEC (email-only) when its runtime
// flag is on; this build flag must be set to "true" at the SAME time so the
// form's WPEC notice + field-hiding only appear when the referral will really
// happen. Off by default (prod) -> employment cases show the standard fields
// and no WPEC promise. See unifiedFieldVisibility.
const WPEC_ROUTING_ENABLED = import.meta.env.VITE_WPEC_ROUTING_ENABLED === "true";

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
  spec: IntakeFormSpec;
}

// Submissions go to the server handler, which saves the lead and forwards it to
// the intake workflow (Supabase case, Documenso PSA, Asana task).
const ENDPOINT = "/api/consultation";

// Field key -> human label, sourced from the shared schema so the "still needed"
// checklist never drifts from the fields the same schema validates.
const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  (FIELDS as { key: string; label: string }[]).map((f) => [f.key, f.label]),
);

const initialFields = (spec: IntakeFormSpec): RetainerIntakeFields => ({
  evalueeFirstName: "",
  evalueeLastName: "",
  retainingAttorneyFirstName: "",
  retainingAttorneyLastName: "",
  retainingAttorneyEmail: "",
  retainingAttorneyPhone: "",
  retainingParalegalFirstName: "",
  retainingParalegalLastName: "",
  retainingParalegalEmail: "",
  reportsCcParalegal: false,
  esignConsent: false,
  esignTypedName: "",
  retainingFirm: "",
  invoiceTo: "",
  // No pre-selection: a defense/joint engagement must NOT be silently recorded as
  // the first option (plaintiff). Empty forces a conscious choice - the required
  // check below (representsOptions.length && !isNonEmpty) then blocks submission.
  retainingSide: "",
  opposingCounselName: "",
  opposingCounselFirm: "",
  carrierClaimNo: "",
  adjusterName: "",
  caseType: spec.caseTypes.length === 1 ? spec.caseTypes[0] : "",
  workProducts: spec.workProducts.length === 1 ? [...spec.workProducts] : [],
  dateOfLoss: "",
  state: "",
  city: "",
  dateNeededBy: "",
  howHeard: "",
  howHeardOther: "",
  paymentMethod: spec.paymentOptions[0]?.value ?? "check",
  notes: "",
  retainedExpert: "",
  turnaround: DEFAULT_TURNAROUND,
});

export default function RetainerIntakeForm({ spec }: Props) {
  const [fields, setFields] = useState<RetainerIntakeFields>(() => initialFields(spec));
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // useCallback (setState updaters are stable, so deps are empty): the missing-
  // info modal's onChange is derived from this, and that handler's identity is
  // read by the modal's effects - a fresh lambda per render would churn them.
  const update = useCallback(<K extends keyof RetainerIntakeFields>(
    key: K,
    value: RetainerIntakeFields[K],
  ) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    // Inline UX: clear a field's error as soon as the user edits it.
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // The form's field keys mirror the shared schema, so validation is the SAME
  // rules the server runs (single source of truth) - no client/server drift.
  const formType = `${spec.slug}-intake`;
  const runValidation = () => schemaValidate(formType, fields as unknown as Record<string, unknown>);

  // Validate one field on blur, setting or clearing just that field's error.
  const validateOnBlur = (key: keyof RetainerIntakeFields) => {
    const all = runValidation();
    setErrors((prev) => {
      const next = { ...prev };
      if (all[key]) next[key] = all[key];
      else delete next[key];
      return next;
    });
  };

  const toggleWorkProduct = (label: string) => {
    setFields((prev) => ({
      ...prev,
      workProducts: prev.workProducts.includes(label)
        ? prev.workProducts.filter((w) => w !== label)
        : [...prev.workProducts, label],
    }));
    setErrors((prev) => {
      if (!prev.workProducts) return prev;
      const next = { ...prev };
      delete next.workProducts;
      return next;
    });
  };

  // Case-type change on the UNIFIED form can change the route (hence the
  // destination PSA template): the matrimonial route's marital PSA can express
  // only the marital work-product vocabulary, so drop any now-invalid selection
  // rather than leave a stale PI product that the shared validation would reject
  // and that would silently drop from the stamped PSA. The other 4 specs keep a
  // plain update - their work-product vocabulary never varies with the case type.
  const updateCaseType = useCallback((value: string) => {
    setFields((prev) => {
      const next = { ...prev, caseType: value };
      if (spec.unified) {
        const allowed = new Set(workProductsFor(formType, next as unknown as Record<string, unknown>));
        const pruned = prev.workProducts.filter((w) => allowed.has(w));
        if (pruned.length !== prev.workProducts.length) next.workProducts = pruned;
      }
      return next;
    });
    // Clear the case-type error and any stale work-product error (a prune can
    // resolve or introduce the "at least one" requirement).
    setErrors((prev) => {
      if (!prev.caseType && !prev.workProducts) return prev;
      const next = { ...prev };
      delete next.caseType;
      delete next.workProducts;
      return next;
    });
  }, [spec.unified, formType]);

  // State change mirrors updateCaseType's prune: leaving NY/NJ removes IME
  // from the vocabulary (workProductsFor), so drop a now-invalid IME selection
  // rather than leave a product the shared validation would reject and that
  // would silently drop from the stamped PSA.
  const updateState = useCallback((value: string) => {
    setFields((prev) => {
      const next = { ...prev, state: value };
      const allowed = new Set(workProductsFor(formType, next as unknown as Record<string, unknown>));
      const pruned = prev.workProducts.filter((w) => allowed.has(w));
      if (pruned.length !== prev.workProducts.length) next.workProducts = pruned;
      return next;
    });
    setErrors((prev) => {
      if (!prev.state && !prev.workProducts) return prev;
      const next = { ...prev };
      delete next.state;
      delete next.workProducts;
      return next;
    });
  }, [formType]);

  // Live view of everything that still blocks submission (same rules as the
  // server). Drives both the disabled button and the "still needed" checklist,
  // so the user is never left staring at a greyed-out button with no reason.
  const validationErrors = runValidation();
  const missingFields = Object.keys(validationErrors).map((key) => ({
    key,
    label: FIELD_LABELS[key] ?? key,
    message: validationErrors[key] as string,
  }));
  // The button is clickable whenever a submit is not already in flight: a click
  // on an incomplete form is what OPENS the fill-in-place modal, so disabling it
  // would hide the very affordance that explains what is missing.
  const submitDisabled = status === "submitting";

  // Rows for the modal, from the SAME schema that validates the form. Passing
  // the live `fields` as data is what makes the unified spec's route-aware
  // pruning (work products) flow through automatically. Never sorted or mutated
  // here - the array and its rows are the schema's to shape.
  const modalRows = missingRequiredFields(
    formType,
    fields as unknown as Record<string, unknown>,
  ) as MissingFieldRow[];

  // Jump to a field from the checklist: scroll it into view and focus it.
  const focusField = (key: string) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(key);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof (el as HTMLElement).focus === "function") {
      (el as HTMLElement).focus({ preventScroll: true });
    }
  };

  // The network half of a submit, callable without a form event so the modal's
  // Continue button runs the IDENTICAL path a direct submit runs.
  const performSubmit = useCallback(async () => {
    if (status === "submitting") return;
    setErrors({});
    setStatus("submitting");
    setErrorMessage("");

    const payload = buildRetainerPayload(spec, fields, WPEC_ROUTING_ENABLED);

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ...payload, turnstileToken, company_website: companyWebsite }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Submission failed");
    }
  }, [status, spec, fields, turnstileToken, companyWebsite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const fieldErrors = runValidation();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      setModalOpen(true);
      return;
    }
    await performSubmit();
  };

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleModalChange = useCallback(
    (key: string, value: unknown) => {
      // caseType MUST take the same path the form's own select takes: on the
      // unified spec a route change can narrow the work-product vocabulary, and
      // only updateCaseType prunes the now-invalid selections. A bare update()
      // here would strand a value that neither the modal nor the form can
      // uncheck (both render only the RESOLVED options), leaving the row
      // permanently invalid and Continue permanently disabled.
      if (key === "caseType") {
        updateCaseType(String(value));
        return;
      }
      update(key as keyof RetainerIntakeFields, value as never);
    },
    [update, updateCaseType],
  );

  // The modal's Continue is enabled only once no rows remain, so this closes and
  // hands off to the same submit path.
  const continueFromModal = useCallback(() => {
    setModalOpen(false);
    void performSubmit();
  }, [performSubmit]);

  if (status === "success") {
    return (
      <div className="rounded-lg border border-forest/40 bg-forest/5 p-8 text-center">
        <h3 className="font-serif text-2xl text-navy mb-3">Intake received</h3>
        <p className="text-neutral-700">
          Thank you. KWVRS will follow up by email to confirm scope, send the {spec.title.replace(" Intake", "")} Professional Services Agreement, and schedule the interview.
        </p>
      </div>
    );
  }

  // Route-aware visibility ONLY applies to the unified spec (spec 2026-07-16
  // §3); every other spec keeps its EXISTING static rule unchanged.
  const visibility = spec.unified
    ? unifiedFieldVisibility(fields.caseType, WPEC_ROUTING_ENABLED)
    : {
        showSide: spec.representsOptions.length > 0,
        showWorkProducts: true,
        showEsignAndPayment: true,
        showWpecNotice: false,
      };
  const showSpouseSides = visibility.showSide;
  const caseTypeOptions = spec.caseTypes;
  // Data-aware for EVERY spec since 2026-08-17 (IME renders only when the
  // matter state is NY/NJ - IME_STATES in the schema; the unified spec's
  // matrimonial-route narrowing rides the same helper). Sourced from the SAME
  // schema helper that validateFields uses, so the rendered checkboxes and
  // the validation vocabulary can never drift.
  const workProductOptions = workProductsFor(formType, fields as unknown as Record<string, unknown>);
  // The Carrier/Claim No. and Adjuster PSA boxes are required only for a Defense
  // retention (schema: requiredWhenDefense), so their asterisk is conditional.
  const sideIsDefense = fields.retainingSide === "defense";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-navy mb-2">Party retaining KWVRS</legend>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Evaluee first name *</span>
            <input id="evalueeFirstName" type="text" required value={fields.evalueeFirstName}
              onChange={(e) => update("evalueeFirstName", e.target.value)}
              onBlur={() => validateOnBlur("evalueeFirstName")}
              aria-invalid={Boolean(errors.evalueeFirstName)}
              aria-describedby={errors.evalueeFirstName ? "evalueeFirstName-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {errors.evalueeFirstName && <p id="evalueeFirstName-error" className="mt-1 text-sm text-red-600">{errors.evalueeFirstName}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Evaluee last name *</span>
            <input id="evalueeLastName" type="text" required value={fields.evalueeLastName}
              onChange={(e) => update("evalueeLastName", e.target.value)}
              onBlur={() => validateOnBlur("evalueeLastName")}
              aria-invalid={Boolean(errors.evalueeLastName)}
              aria-describedby={errors.evalueeLastName ? "evalueeLastName-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {errors.evalueeLastName && <p id="evalueeLastName-error" className="mt-1 text-sm text-red-600">{errors.evalueeLastName}</p>}
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Retaining attorney first name *</span>
            <input id="retainingAttorneyFirstName" type="text" required value={fields.retainingAttorneyFirstName}
              onChange={(e) => update("retainingAttorneyFirstName", e.target.value)}
              onBlur={() => validateOnBlur("retainingAttorneyFirstName")}
              aria-invalid={Boolean(errors.retainingAttorneyFirstName)}
              aria-describedby={errors.retainingAttorneyFirstName ? "retainingAttorneyFirstName-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {errors.retainingAttorneyFirstName && <p id="retainingAttorneyFirstName-error" className="mt-1 text-sm text-red-600">{errors.retainingAttorneyFirstName}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Retaining attorney last name *</span>
            <input id="retainingAttorneyLastName" type="text" required value={fields.retainingAttorneyLastName}
              onChange={(e) => update("retainingAttorneyLastName", e.target.value)}
              onBlur={() => validateOnBlur("retainingAttorneyLastName")}
              aria-invalid={Boolean(errors.retainingAttorneyLastName)}
              aria-describedby={errors.retainingAttorneyLastName ? "retainingAttorneyLastName-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {errors.retainingAttorneyLastName && <p id="retainingAttorneyLastName-error" className="mt-1 text-sm text-red-600">{errors.retainingAttorneyLastName}</p>}
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Retaining attorney email *</span>
            <input id="retainingAttorneyEmail" type="email" required value={fields.retainingAttorneyEmail}
              onChange={(e) => update("retainingAttorneyEmail", e.target.value)}
              onBlur={() => validateOnBlur("retainingAttorneyEmail")}
              aria-invalid={Boolean(errors.retainingAttorneyEmail)}
              aria-describedby={errors.retainingAttorneyEmail ? "retainingAttorneyEmail-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {errors.retainingAttorneyEmail && <p id="retainingAttorneyEmail-error" className="mt-1 text-sm text-red-600">{errors.retainingAttorneyEmail}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Retaining attorney phone *</span>
            <input id="retainingAttorneyPhone" type="tel" required value={fields.retainingAttorneyPhone}
              onChange={(e) => update("retainingAttorneyPhone", e.target.value)}
              onBlur={() => validateOnBlur("retainingAttorneyPhone")}
              aria-invalid={Boolean(errors.retainingAttorneyPhone)}
              aria-describedby={errors.retainingAttorneyPhone ? "retainingAttorneyPhone-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
            {errors.retainingAttorneyPhone && <p id="retainingAttorneyPhone-error" className="mt-1 text-sm text-red-600">{errors.retainingAttorneyPhone}</p>}
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Retaining paralegal first name</span>
            <input type="text" value={fields.retainingParalegalFirstName}
              onChange={(e) => update("retainingParalegalFirstName", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Retaining paralegal last name</span>
            <input type="text" value={fields.retainingParalegalLastName}
              onChange={(e) => update("retainingParalegalLastName", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
          </label>
        </div>

        <label className="block">
          <span className="block text-sm font-semibold text-navy mb-1">Retaining paralegal email</span>
          <input id="retainingParalegalEmail" type="email" value={fields.retainingParalegalEmail}
            onChange={(e) => update("retainingParalegalEmail", e.target.value)}
            onBlur={() => validateOnBlur("retainingParalegalEmail")}
            aria-invalid={Boolean(errors.retainingParalegalEmail)}
            aria-describedby={errors.retainingParalegalEmail ? "retainingParalegalEmail-error" : undefined}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2" />
          {errors.retainingParalegalEmail && <p id="retainingParalegalEmail-error" className="mt-1 text-sm text-red-600">{errors.retainingParalegalEmail}</p>}
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={fields.reportsCcParalegal}
            onChange={(e) => update("reportsCcParalegal", e.target.checked)}
          />
          <span className="text-sm text-neutral-700">Reports can be emailed to paralegal</span>
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-navy mb-1">Retaining firm *</span>
          <input
            id="retainingFirm"
            type="text"
            required
            value={fields.retainingFirm}
            onChange={(e) => update("retainingFirm", e.target.value)}
            onBlur={() => validateOnBlur("retainingFirm")}
            aria-invalid={Boolean(errors.retainingFirm)}
            aria-describedby={errors.retainingFirm ? "retainingFirm-error" : undefined}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
          />
          {errors.retainingFirm && <p id="retainingFirm-error" className="mt-1 text-sm text-red-600">{errors.retainingFirm}</p>}
        </label>

        <label className="block">
          <span className="block text-sm font-semibold text-navy mb-1">Invoice should be sent to *</span>
          <textarea
            id="invoiceTo"
            value={fields.invoiceTo}
            onChange={(e) => update("invoiceTo", e.target.value)}
            onBlur={() => validateOnBlur("invoiceTo")}
            aria-invalid={Boolean(errors.invoiceTo)}
            aria-describedby={errors.invoiceTo ? "invoiceTo-error" : undefined}
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            placeholder="Billing address or contact (if different from retaining attorney)"
          />
          {errors.invoiceTo && <p id="invoiceTo-error" className="mt-1 text-sm text-red-600">{errors.invoiceTo}</p>}
        </label>

        {/* A bare <fieldset> is role "group", which does not support
            aria-invalid, so the radio set declares role "radiogroup" (which
            does) - same treatment MissingInfoModal gives its radio rows. */}
        {showSpouseSides && (
          <fieldset
            id="retainingSide"
            tabIndex={-1}
            role="radiogroup"
            aria-invalid={Boolean(errors.retainingSide)}
            aria-describedby={errors.retainingSide ? "retainingSide-error" : undefined}
            className="scroll-mt-24 focus:outline-none"
          >
            <legend className="block text-sm font-semibold text-navy mb-2">Retaining counsel represents *</legend>
            <div className="flex flex-wrap gap-4">
              {spec.representsOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="retainingSide"
                    value={opt.value}
                    checked={fields.retainingSide === opt.value}
                    onChange={() => update("retainingSide", opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.retainingSide && <p id="retainingSide-error" className="mt-1 text-sm text-red-600">{errors.retainingSide}</p>}
          </fieldset>
        )}

        {visibility.showEsignAndPayment && (
          <div className="rounded-lg border border-navy/20 bg-navy/5 p-4 space-y-3">
            <label className="flex items-start gap-2">
              <input
                id="esignConsent"
                type="checkbox"
                className="mt-1"
                checked={fields.esignConsent}
                onChange={(e) => update("esignConsent", e.target.checked)}
              />
              <span className="text-sm text-neutral-700">
                I have reviewed the Professional Services Agreement and consent to signing it electronically.
                Typing my name below and submitting this form is my legal signature under the ESIGN Act and applicable state law.
                <strong className="block mt-1 text-navy">Required to submit.</strong>
              </span>
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-navy mb-1">Type your full legal name to sign *</span>
              <input
                id="esignTypedName"
                type="text"
                value={fields.esignTypedName}
                onChange={(e) => update("esignTypedName", e.target.value)}
                onBlur={() => validateOnBlur("esignTypedName")}
                aria-invalid={Boolean(errors.esignTypedName)}
                aria-describedby={errors.esignTypedName ? "esignTypedName-error" : undefined}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
              {errors.esignTypedName && <p id="esignTypedName-error" className="mt-1 text-sm text-red-600">{errors.esignTypedName}</p>}
            </label>
          </div>
        )}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-navy mb-2">Opposing counsel</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Opposing counsel name *</span>
            <input
              id="opposingCounselName"
              type="text"
              value={fields.opposingCounselName}
              onChange={(e) => update("opposingCounselName", e.target.value)}
              onBlur={() => validateOnBlur("opposingCounselName")}
              aria-invalid={Boolean(errors.opposingCounselName)}
              aria-describedby={errors.opposingCounselName ? "opposingCounselName-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            {errors.opposingCounselName && <p id="opposingCounselName-error" className="mt-1 text-sm text-red-600">{errors.opposingCounselName}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Opposing counsel firm *</span>
            <input
              id="opposingCounselFirm"
              type="text"
              value={fields.opposingCounselFirm}
              onChange={(e) => update("opposingCounselFirm", e.target.value)}
              onBlur={() => validateOnBlur("opposingCounselFirm")}
              aria-invalid={Boolean(errors.opposingCounselFirm)}
              aria-describedby={errors.opposingCounselFirm ? "opposingCounselFirm-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            {errors.opposingCounselFirm && <p id="opposingCounselFirm-error" className="mt-1 text-sm text-red-600">{errors.opposingCounselFirm}</p>}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-navy mb-2">
          Insurance / claim{sideIsDefense ? " (required for Defense)" : " (if applicable)"}
        </legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Carrier / Claim No.{sideIsDefense ? " *" : ""}</span>
            <input
              id="carrierClaimNo"
              type="text"
              value={fields.carrierClaimNo}
              onChange={(e) => update("carrierClaimNo", e.target.value)}
              onBlur={() => validateOnBlur("carrierClaimNo")}
              aria-invalid={Boolean(errors.carrierClaimNo)}
              aria-describedby={errors.carrierClaimNo ? "carrierClaimNo-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            {errors.carrierClaimNo && <p id="carrierClaimNo-error" className="mt-1 text-sm text-red-600">{errors.carrierClaimNo}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Adjuster name{sideIsDefense ? " *" : ""}</span>
            <input
              id="adjusterName"
              type="text"
              value={fields.adjusterName}
              onChange={(e) => update("adjusterName", e.target.value)}
              onBlur={() => validateOnBlur("adjusterName")}
              aria-invalid={Boolean(errors.adjusterName)}
              aria-describedby={errors.adjusterName ? "adjusterName-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            {errors.adjusterName && <p id="adjusterName-error" className="mt-1 text-sm text-red-600">{errors.adjusterName}</p>}
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-serif text-xl text-navy mb-2">Case &amp; scope</legend>

        {visibility.showWpecNotice && (
          <p className="rounded-lg border border-teal/30 bg-teal/5 p-3 text-sm text-neutral-700">
            Employment matters are handled by our affiliate, Wolstein Putts Expert Consulting. After
            you submit this form, your request is forwarded to them directly and they will follow up
            with you.
          </p>
        )}

        {caseTypeOptions.length > 0 && (
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Type of case *</span>
            <select
              id="caseType"
              value={fields.caseType}
              onChange={(e) => updateCaseType(e.target.value)}
              onBlur={() => validateOnBlur("caseType")}
              aria-invalid={Boolean(errors.caseType)}
              aria-describedby={errors.caseType ? "caseType-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            >
              <option value="">Select a case type</option>
              {spec.unified ? (
                caseTypeGroups().map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </optgroup>
                ))
              ) : (
                caseTypeOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))
              )}
            </select>
            {errors.caseType && <p id="caseType-error" className="mt-1 text-sm text-red-600">{errors.caseType}</p>}
          </label>
        )}

        {/* Checkbox group: role "group" takes aria-describedby but not
            aria-invalid, so the invalid state rides each option input. */}
        {workProductOptions.length > 0 && visibility.showWorkProducts && (
          <fieldset
            id="workProducts"
            tabIndex={-1}
            aria-describedby={errors.workProducts ? "workProducts-error" : undefined}
            className="scroll-mt-24 focus:outline-none"
          >
            <legend className="block text-sm font-semibold text-navy mb-2">Work product(s) authorized *</legend>
            <div className="grid sm:grid-cols-2 gap-2">
              {workProductOptions.map((wp) => (
                <label key={wp} className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 cursor-pointer hover:border-teal">
                  <input
                    type="checkbox"
                    checked={fields.workProducts.includes(wp)}
                    onChange={() => toggleWorkProduct(wp)}
                    aria-invalid={Boolean(errors.workProducts)}
                  />
                  <span>{wp}</span>
                </label>
              ))}
            </div>
            {errors.workProducts && <p id="workProducts-error" className="mt-1 text-sm text-red-600">{errors.workProducts}</p>}
          </fieldset>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">State *</span>
            <select
              id="state"
              value={fields.state}
              onChange={(e) => updateState(e.target.value)}
              onBlur={() => validateOnBlur("state")}
              aria-invalid={Boolean(errors.state)}
              aria-describedby={errors.state ? "state-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            >
              <option value="">Select a state</option>
              {states.map((s) => (
                <option key={s.slug} value={s.abbreviation}>{s.name}</option>
              ))}
            </select>
            {errors.state && <p id="state-error" className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">City</span>
            <input
              type="text"
              value={fields.city}
              onChange={(e) => update("city", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Date of injury / loss</span>
            <input
              id="dateOfLoss"
              type="date"
              value={fields.dateOfLoss}
              onChange={(e) => update("dateOfLoss", e.target.value)}
              onBlur={() => validateOnBlur("dateOfLoss")}
              aria-invalid={Boolean(errors.dateOfLoss)}
              aria-describedby={errors.dateOfLoss ? "dateOfLoss-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            {errors.dateOfLoss && <p id="dateOfLoss-error" className="mt-1 text-sm text-red-600">{errors.dateOfLoss}</p>}
            <span className="block mt-1 text-xs text-neutral-600">Optional - helps us run the conflict check.</span>
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">Report needed by *</span>
            <input
              id="dateNeededBy"
              type="date"
              value={fields.dateNeededBy}
              onChange={(e) => update("dateNeededBy", e.target.value)}
              onBlur={() => validateOnBlur("dateNeededBy")}
              aria-invalid={Boolean(errors.dateNeededBy)}
              aria-describedby={errors.dateNeededBy ? "dateNeededBy-error" : undefined}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            />
            {errors.dateNeededBy && <p id="dateNeededBy-error" className="mt-1 text-sm text-red-600">{errors.dateNeededBy}</p>}
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-navy mb-1">How did you hear about us?</span>
            <select
              value={fields.howHeard}
              onChange={(e) => update("howHeard", e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-white"
            >
              <option value="">Select one (optional)</option>
              {HOW_HEARD.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {fields.howHeard === "other" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-navy mb-1">Tell us how you heard about us</span>
              <input
                type="text"
                value={fields.howHeardOther}
                onChange={(e) => update("howHeardOther", e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2"
              />
            </label>
          </div>
        )}

        <fieldset>
          <legend className="block text-sm font-semibold text-navy mb-2">Requested turnaround</legend>
          <div className="flex flex-wrap gap-4">
            {TURNAROUND_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="turnaround"
                  value={opt.value}
                  checked={fields.turnaround === opt.value}
                  onChange={() => update("turnaround", opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          {fields.turnaround === "rush" && (
            <p className="mt-2 text-sm text-neutral-700">
              Rush turnaround may be subject to an expedited surcharge; KWVRS will confirm scope and fee before work begins.
            </p>
          )}
        </fieldset>

        {/* An employment/discrimination case is referred to WPEC, which staffs
            it with its own people - so asking the attorney to pick a KWVRS
            expert there collects a preference nobody can honor. Hidden on the
            same flag that hides the other KWVRS-engagement controls (work
            products, e-sign, payment). */}
        {!visibility.showWpecNotice && (
          <ExpertPicker
            value={fields.retainedExpert}
            onChange={(v) => update("retainedExpert", v)}
          />
        )}

        {visibility.showEsignAndPayment && (
          <fieldset>
            <legend className="block text-sm font-semibold text-navy mb-2">Payment method</legend>
            <div className="flex flex-wrap gap-4">
              {spec.paymentOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={fields.paymentMethod === opt.value}
                    onChange={() => update("paymentMethod", opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label className="block">
          <span className="block text-sm font-semibold text-navy mb-1">Case summary / notes</span>
          <textarea
            value={fields.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2"
            placeholder="Brief description of the case and the question to be answered."
          />
        </label>
      </fieldset>

      {status === "error" && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Submission failed: {errorMessage}. Please try again or call (201) 343-0700.
        </p>
      )}

      <Turnstile onToken={setTurnstileToken} />
      <HoneypotField onChange={setCompanyWebsite} />

      {missingFields.length > 0 && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-amber-300 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-amber-900">
            {missingFields.length === 1
              ? "1 item still needs your attention - submitting opens a window to complete it:"
              : `${missingFields.length} items still need your attention - submitting opens a window to complete them:`}
          </p>
          <ul className="mt-2 space-y-1">
            {missingFields.map((f) => (
              <li key={f.key} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-amber-500">&#9633;</span>
                <button
                  type="button"
                  onClick={() => focusField(f.key)}
                  className="text-left text-sm text-amber-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
                >
                  {f.label}
                  {f.message !== `${f.label} is required` && (
                    <span className="text-amber-700"> - {f.message}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={submitDisabled}
        className="w-full sm:w-auto rounded-lg bg-navy px-6 py-3 text-white font-semibold disabled:opacity-50 hover:bg-navy/90"
      >
        {status === "submitting" ? "Submitting..." : "Submit intake"}
      </button>

      <MissingInfoModal
        open={modalOpen}
        rows={modalRows}
        values={fields as unknown as Record<string, unknown>}
        onChange={handleModalChange}
        onContinue={continueFromModal}
        onClose={closeModal}
      />

      <p className="text-xs text-neutral-600">
        After submission, KWVRS will follow up by email with the {spec.title.replace(" Intake", "")} Professional Services Agreement for signature and a 50% retainer invoice. Submitting this form does not create an attorney-client or expert-retention relationship until the PSA is signed and the retainer is paid.
      </p>
    </form>
  );
}
