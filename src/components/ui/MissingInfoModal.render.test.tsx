// Real server render (same technique as ExpertPicker.render.test.tsx /
// RetainerIntakeForm.render.test.tsx - vitest runs environment: "node"). The
// dialog's SSR path is the inline fallback: with no `document`, the component
// renders the panel in place instead of portalling, which is what makes these
// assertions possible at all. Everything that needs a live DOM (focus trap,
// Escape, scroll lock) is pinned by MissingInfoModal.test.mjs instead.
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MissingInfoModal } from "./MissingInfoModal";

const rows = [
  { key: "caseType", label: "Type of Case", message: "Type of Case is required", type: "select", options: ["Personal Injury", "Employment"] },
  { key: "esignConsent", label: "E-sign consent", message: "E-sign consent is required", type: "checkbox", options: [] },
  { key: "notesLike", label: "Details <script>", message: "Details is required", type: "textarea", options: [] },
];
const base = { open: true, rows, values: {}, onChange: () => {}, onContinue: () => {}, onClose: () => {} };

describe("MissingInfoModal (SSR)", () => {
  it("renders nothing when closed", () => {
    expect(renderToStaticMarkup(createElement(MissingInfoModal, { ...base, open: false }))).toBe("");
  });

  it("renders a labeled dialog with the count and one row per field", () => {
    const html = renderToStaticMarkup(createElement(MissingInfoModal, base));
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("(3)");
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("modal-caseType-error");
    expect(html).toContain("<select");
    expect(html).toContain("Personal Injury");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("<textarea");
  });

  it("labels each control with the matching htmlFor / id pair", () => {
    const html = renderToStaticMarkup(createElement(MissingInfoModal, base));
    expect(html).toContain('for="modal-caseType"');
    expect(html).toContain('id="modal-caseType"');
    expect(html).toContain('aria-describedby="modal-caseType-error"');
  });

  it("escapes labels (React default) - no raw script tag", () => {
    const html = renderToStaticMarkup(createElement(MissingInfoModal, base));
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("Continue is disabled while rows remain and enabled when clear", () => {
    const withRows = renderToStaticMarkup(createElement(MissingInfoModal, base));
    expect(withRows).toMatch(/<button[^>]*\sdisabled[^>]*>Continue<\/button>/);
    const clear = renderToStaticMarkup(createElement(MissingInfoModal, { ...base, rows: [] }));
    expect(clear).toContain("All set");
    expect(clear).toMatch(/<button(?:(?!disabled)[^>])*>Continue<\/button>/);
  });

  it("renders a Back to form escape hatch in both states", () => {
    expect(renderToStaticMarkup(createElement(MissingInfoModal, base))).toContain("Back to form");
    expect(renderToStaticMarkup(createElement(MissingInfoModal, { ...base, rows: [] }))).toContain("Back to form");
  });

  it("radio types render as a fieldset with legend", () => {
    const radioRows = [{ key: "retainingSide", label: "Retaining side", message: "Retaining side is required", type: "radio", options: ["Plaintiff", "Defense"] }];
    const html = renderToStaticMarkup(createElement(MissingInfoModal, { ...base, rows: radioRows }));
    expect(html).toContain("<fieldset");
    expect(html).toContain("<legend");
  });

  // A bare <fieldset> is role "group", which does not support aria-invalid. Radio
  // groups get role="radiogroup" (which does) and keep it on the fieldset;
  // checkbox groups have no such role, so aria-invalid moves to the inputs.
  it("radio groups are a radiogroup carrying aria-invalid on the fieldset", () => {
    const html = renderToStaticMarkup(
      createElement(MissingInfoModal, {
        ...base,
        rows: [{ key: "retainingSide", label: "Retaining side", message: "required", type: "radio", options: ["Plaintiff"] }],
      }),
    );
    expect(html).toMatch(/<fieldset[^>]*role="radiogroup"[^>]*aria-invalid="true"[^>]*aria-describedby="modal-retainingSide-error"/);
  });

  it("multiselect fieldsets describe but never claim aria-invalid; the inputs carry it", () => {
    const html = renderToStaticMarkup(
      createElement(MissingInfoModal, {
        ...base,
        rows: [{ key: "workProducts", label: "Work products", message: "required", type: "multiselect", options: ["Vocational evaluation", "Life care plan"] }],
      }),
    );
    const fieldset = html.match(/<fieldset[^>]*>/)?.[0] ?? "";
    expect(fieldset).toContain('aria-describedby="modal-workProducts-error"');
    expect(fieldset).not.toContain("aria-invalid");
    expect(fieldset).not.toContain('role="radiogroup"');
    expect(html.match(/<input[^>]*aria-invalid="true"[^>]*type="checkbox"/g)?.length).toBe(2);
  });

  it("accepts both option shapes on the same control type (schema emits both)", () => {
    const mixed = [
      { key: "retainingSide", label: "Retaining side", message: "Retaining side is required", type: "radio", options: [{ value: "plaintiff", label: "Plaintiff" }] },
      { key: "state", label: "State", message: "State is required", type: "select", options: ["NJ"] },
      { key: "workProducts", label: "Work products", message: "Work products is required", type: "multiselect", options: [{ value: "vocational", label: "Vocational evaluation" }] },
    ];
    const html = renderToStaticMarkup(createElement(MissingInfoModal, { ...base, rows: mixed }));
    expect(html).toContain('value="plaintiff"');
    expect(html).toContain("Plaintiff");
    expect(html).toContain('value="NJ"');
    expect(html).toContain('value="vocational"');
    expect(html).toContain("Vocational evaluation");
  });

  it("reflects current values (select, checkbox, multiselect) so the modal is fill-in-place", () => {
    const html = renderToStaticMarkup(
      createElement(MissingInfoModal, {
        ...base,
        rows: [
          { key: "caseType", label: "Type of Case", message: "required", type: "select", options: ["Personal Injury"] },
          // "Yes" (not true) on purpose: the schema counts it as consented, so the box must show it.
          { key: "esignConsent", label: "E-sign consent", message: "required", type: "checkbox", options: [] },
          { key: "workProducts", label: "Work products", message: "required", type: "multiselect", options: ["Vocational evaluation"] },
        ],
        values: { caseType: "Personal Injury", esignConsent: "Yes", workProducts: ["Vocational evaluation"] },
      }),
    );
    expect(html).toMatch(/<select[^>]*>[\s\S]*?<option[^>]*selected[^>]*>Personal Injury/);
    expect(html.match(/checked/g)?.length).toBe(2);
  });
});
