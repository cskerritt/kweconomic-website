/**
 * Registry of PSA-backed intake forms. Each entry mirrors page 1 of a 2026
 * Professional Services Agreement exactly - same field set, case-type and
 * work-product options, represents row, and payment methods as the PDF. The
 * PDFs themselves are served from /documents for download, and the same four
 * documents drive the Documenso templates in the workflow service
 * (workflow/templates/).
 *
 * The OPTION VOCABULARIES are sourced from the shared schema
 * (lib/intake-schema.mjs) - the single source of truth pinned to the real PSA
 * templates by lib/intake-schema-psa-parity.test.mjs and this file's
 * intakeForms.parity.test.ts - so the form options can no longer drift from the
 * templates (which previously silently dropped e.g. a "Long-Term Disability"
 * selection with no matching PI checkbox). Only the page copy lives here.
 */
import { formOptions } from "../../lib/intake-schema.mjs";
import type { RetainingSide, PaymentMethod } from "@/lib/intake-payloads";

export type IntakeFormSlug = "marital" | "personal-injury" | "nonmetro" | "consulting" | "unified";

export interface IntakeOption<V extends string> {
  value: V;
  label: string;
}

export interface IntakeFormSpec {
  slug: IntakeFormSlug;
  /** Original PSA PDF file name (recorded in submissions); "" for the unified
   * spec, which has no single fixed template - the dashboard reviewer picks
   * one at send time (already true for every request today: "PSAs are never
   * auto-sent"). */
  psaFile: string;
  /** Public-facing form title shown on the page. */
  title: string;
  /** Short subtitle / lede for the page header. */
  subtitle: string;
  /** Long-form description shown beneath the heading. */
  description: string;
  /** "Retaining Counsel Represents" options; empty = row absent (marital). */
  representsOptions: IntakeOption<RetainingSide>[];
  /** "Type of Case" options, exactly as printed on the PSA. */
  caseTypes: string[];
  /** "Work Product(s) Authorized" options, exactly as printed on the PSA. */
  workProducts: string[];
  /** "Payment Method" options, exactly as printed on the PSA. */
  paymentOptions: IntakeOption<PaymentMethod>[];
  /** True only for the unified spec (spec 2026-07-16 §3): drives
   * RetainerIntakeForm's route-aware field visibility and the grouped
   * <optgroup> case-type dropdown. Absent/false on the other 4 specs, whose
   * rendering is completely unchanged. */
  unified?: boolean;
}

// Per-form option vocabularies from the shared schema (the slug + "-intake" is
// the schema's formType). The schema guarantees these map to real PSA template
// checkboxes; the values are RetainingSide/PaymentMethod members by construction.
const opts = (formType: string) =>
  formOptions(formType) as {
    sides: IntakeOption<RetainingSide>[];
    caseTypes: string[];
    workProducts: string[];
    payments: IntakeOption<PaymentMethod>[];
  };
const MARITAL = opts("marital-intake");
const PI = opts("personal-injury-intake");
const NONMETRO = opts("nonmetro-intake");
const CONSULTING = opts("consulting-intake");
const UNIFIED = opts("unified-intake");

export const INTAKE_FORMS: Record<IntakeFormSlug, IntakeFormSpec> = {
  marital: {
    slug: "marital",
    psaFile: "2026 KWVRS Marital PSA.pdf",
    title: "Matrimonial / Family Law Intake",
    subtitle: "Retainer intake for matrimonial matters",
    description:
      "Use this form to retain KWVRS for matrimonial and family law matters. After submission, KWVRS will follow up to confirm scope, send the Matrimonial Professional Services Agreement, and schedule the interview.",
    representsOptions: MARITAL.sides,
    caseTypes: MARITAL.caseTypes,
    workProducts: MARITAL.workProducts,
    paymentOptions: MARITAL.payments,
  },
  "personal-injury": {
    slug: "personal-injury",
    psaFile: "2026 KWVRS PI PSA.pdf",
    title: "Personal Injury Retainer Intake",
    subtitle: "Retainer intake for personal injury matters",
    description:
      "Use this form to retain KWVRS for personal injury matters. After submission, KWVRS will follow up to confirm scope, send the Personal Injury Professional Services Agreement, and schedule the interview.",
    representsOptions: PI.sides,
    caseTypes: PI.caseTypes,
    workProducts: PI.workProducts,
    paymentOptions: PI.payments,
  },
  // Non-Metro + Consulting are UNLISTED direct-link intake forms (noindex, not
  // in the public /intake chooser or sitemap) - the link is sent to those
  // clients. Same retainer workflow as PI/Marital, keyed to their PSA slug.
  nonmetro: {
    slug: "nonmetro",
    psaFile: "2026 KWVRS NM PSA.pdf",
    title: "Non-Metro Retainer Intake",
    subtitle: "Retainer intake for non-metro / lower-fee matters",
    description:
      "Use this form to retain KWVRS under the Non-Metro Professional Services Agreement. After submission, KWVRS will follow up to confirm scope, provide the agreement, and schedule the interview.",
    representsOptions: NONMETRO.sides,
    caseTypes: NONMETRO.caseTypes,
    workProducts: NONMETRO.workProducts,
    paymentOptions: NONMETRO.payments,
  },
  consulting: {
    slug: "consulting",
    psaFile: "2026 KWVRS Consulting PSA.pdf",
    title: "Consulting Retainer Intake",
    subtitle: "Retainer intake for consulting engagements",
    description:
      "Use this form to retain KWVRS under the Consulting Professional Services Agreement. After submission, KWVRS will follow up to confirm scope, provide the agreement, and schedule the interview.",
    representsOptions: CONSULTING.sides,
    caseTypes: CONSULTING.caseTypes,
    workProducts: CONSULTING.workProducts,
    paymentOptions: CONSULTING.payments,
  },
  // The unified public intake (spec 2026-07-16): ONE form for every case
  // type, routing to standard/matrimonial/wpec server-side. Deliberately
  // excluded from ALL_INTAKE_SLUGS below - its case types have no 1:1 PSA
  // template mapping, so it must never enter the psa-parity sweep.
  unified: {
    slug: "unified",
    psaFile: "",
    title: "KWVRS Intake",
    subtitle: "Retainer intake for every KWVRS matter type",
    description:
      "Use this form to start a KWVRS engagement. Select the case type that matches your matter; the rest of the form adapts to it. After submission, KWVRS will follow up to confirm scope and next steps.",
    representsOptions: UNIFIED.sides,
    caseTypes: UNIFIED.caseTypes,
    workProducts: UNIFIED.workProducts,
    paymentOptions: UNIFIED.payments,
    unified: true,
  },
};

// Template-backed forms only (each maps 1:1 to a real PSA template checkbox
// vocabulary, pinned by intakeForms.parity.test.mjs). The unified form is
// intentionally NOT listed here - see its own comment above.
export const ALL_INTAKE_SLUGS: IntakeFormSlug[] = ["marital", "personal-injury", "nonmetro", "consulting"];

export function getIntakeForm(slug: string): IntakeFormSpec | undefined {
  return (INTAKE_FORMS as Record<string, IntakeFormSpec>)[slug];
}
