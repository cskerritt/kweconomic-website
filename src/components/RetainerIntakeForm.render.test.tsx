import { describe, it, expect, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { INTAKE_FORMS, type IntakeFormSpec } from "@/data/intakeForms";

// Real server render (same technique as ExpertPicker.render.test.tsx /
// HoneypotField.render.test.tsx - vitest runs environment: "node"). The rest of
// this component is covered by source-read guards in RetainerIntakeForm.test.mjs;
// what needs a RENDER is the interaction between two independently-computed
// things: the WPEC affiliate notice and the expert picker.
//
// An employment/discrimination case type is referred to Wolstein Putts Expert
// Consulting - KWVRS does not staff it - so offering "pick your KWVRS expert" on
// that branch collects a preference that can never be honored. The picker must
// disappear with the rest of the KWVRS-engagement controls (work products,
// e-sign, payment) that the same flag already hides.
//
// The WPEC branch only exists when the build flag mirrors the server's
// WPEC_ROUTING_ENABLED, so stub it BEFORE importing the component (it reads
// import.meta.env at module scope).
const renderForm = async (spec: IntakeFormSpec, wpecEnabled: boolean) => {
  vi.resetModules();
  vi.stubEnv("VITE_WPEC_ROUTING_ENABLED", wpecEnabled ? "true" : "false");
  const { default: RetainerIntakeForm } = await import("./RetainerIntakeForm");
  const html = renderToStaticMarkup(createElement(RetainerIntakeForm, { spec }));
  vi.unstubAllEnvs();
  return html;
};

// initialFields seeds fields.caseType from spec.caseTypes when there is exactly
// one, which is how a first paint can land on a given route with no interaction.
const specWithCaseType = (caseType: string): IntakeFormSpec => ({
  ...INTAKE_FORMS.unified,
  caseTypes: [caseType],
});

const WPEC_CASE = "Employment Discrimination";
const STANDARD_CASE = "Personal Injury";
const PICKER_LEGEND = "Requested KWVRS expert";

describe("RetainerIntakeForm: the submit button is always reachable", () => {
  // The button no longer gates on missingFields: a click on an incomplete form
  // is what OPENS the missing-info modal, so a disabled button would make the
  // modal unreachable for exactly the users it exists for.
  const submitButtonTag = (html: string) => html.match(/<button[^>]*type="submit"[^>]*>/)?.[0] ?? "";

  it("renders an enabled submit button on a first paint of an empty form", async () => {
    const html = await renderForm(INTAKE_FORMS.unified, false);
    const tag = submitButtonTag(html);
    expect(tag).not.toBe("");
    // The ATTRIBUTE, not the Tailwind `disabled:opacity-50` class it still keeps
    // for the in-flight state.
    expect(tag).not.toMatch(/\sdisabled(=|>|\s)/);
  });

  it("does not render the modal before a submit attempt", async () => {
    const html = await renderForm(INTAKE_FORMS.unified, false);
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("A few required items are missing");
  });
});

describe("RetainerIntakeForm: the expert picker on the WPEC branch", () => {
  it("renders the WPEC notice and NOT the expert picker", async () => {
    const html = await renderForm(specWithCaseType(WPEC_CASE), true);
    expect(html).toContain("Wolstein Putts Expert Consulting");
    expect(html).not.toContain(PICKER_LEGEND);
    expect(html).not.toContain('name="retainedExpert"');
    // Sanity: it disappears alongside the other KWVRS-engagement controls the
    // same flag hides, rather than instead of them.
    expect(html).not.toContain('name="paymentMethod"');
  });

  it("still renders the picker for a standard case type", async () => {
    const html = await renderForm(specWithCaseType(STANDARD_CASE), true);
    expect(html).not.toContain("Wolstein Putts Expert Consulting");
    expect(html).toContain(PICKER_LEGEND);
    expect(html).toContain('name="retainedExpert"');
    expect(html).toContain("Daniel Wolstein, Ph.D.");
  });

  it("still renders the picker for an employment case when WPEC routing is OFF", async () => {
    // Flag off (the prod default) means the server handles the case in the
    // standard pipeline, so the form must show the standard KWVRS controls.
    const html = await renderForm(specWithCaseType(WPEC_CASE), false);
    expect(html).not.toContain("Wolstein Putts Expert Consulting");
    expect(html).toContain(PICKER_LEGEND);
    expect(html).toContain('name="retainedExpert"');
  });

  it("renders the picker on the non-unified specs, which have no WPEC branch", async () => {
    for (const slug of ["personal-injury", "marital", "nonmetro", "consulting"] as const) {
      const html = await renderForm(INTAKE_FORMS[slug], true);
      expect(html, slug).toContain(PICKER_LEGEND);
      expect(html, slug).not.toContain("Wolstein Putts Expert Consulting");
    }
  });
});
