// Guard test (source-read pattern precedent: workflow/test/provision-field-sets.test.mjs:294,
// src/data/intakeForms.parity.test.mjs). No DOM env exists (vitest.config.ts environment: "node"),
// so the JSX binding is pinned at source level and validation at schema level.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FIELDS, validateFields, missingRequiredFields, workProductsFor } from "../../lib/intake-schema.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const formSrc = readFileSync(join(here, "RetainerIntakeForm.tsx"), "utf8");
const payloadsSrc = readFileSync(join(here, "../lib/intake-payloads.ts"), "utf8");

describe("retainer intake form collects dateOfLoss (DOI, spec section 3)", () => {
  it("declares dateOfLoss on RetainerIntakeFields so it rides buildRetainerPayload's field spread", () => {
    expect(payloadsSrc).toMatch(/dateOfLoss: string;/);
  });

  it("renders a date input bound to fields.dateOfLoss with blur validation and an initialFields seed", () => {
    expect(formSrc).toMatch(/update\("dateOfLoss", e\.target\.value\)/);
    expect(formSrc).toMatch(/validateOnBlur\("dateOfLoss"\)/);
    expect(formSrc).toMatch(/dateOfLoss: "",/);
  });

  it("uses the shared schema's label for the field", () => {
    const doi = FIELDS.find((f) => f.key === "dateOfLoss");
    expect(doi?.label).toBe("Date of injury / loss");
    expect(formSrc).toContain("Date of injury / loss");
  });

  it("round trip: the same validateFields the form calls rejects a future DOI and accepts a past one", () => {
    expect(validateFields("personal-injury-intake", { dateOfLoss: "2099-01-01" }).dateOfLoss).toMatch(/not in the future/);
    expect(validateFields("personal-injury-intake", { dateOfLoss: "2020-05-01" }).dateOfLoss).toBeUndefined();
  });
});

describe("intake form surfaces what still blocks submission (missing-fields checklist)", () => {
  it("derives the checklist from the same validateFields the disabled button uses", () => {
    expect(formSrc).toMatch(/const validationErrors = runValidation\(\)/);
    expect(formSrc).toMatch(/const missingFields =/);
    // The button itself no longer gates on the checklist (a click is what opens
    // the missing-info modal), so only an in-flight submit disables it.
    expect(formSrc).toMatch(/submitDisabled = status === "submitting";/);
    expect(formSrc).toMatch(/still needs? your attention/);
  });

  it("checklist labels come from the shared schema (no drift)", () => {
    expect(formSrc).toMatch(/FIELD_LABELS/);
    expect(formSrc).toMatch(/FIELDS as .*\[\]\)\.map/);
  });

  it("marks the previously-silent required selects (caseType, state) and validates them on blur", () => {
    expect(formSrc).toContain('id="caseType"');
    expect(formSrc).toContain('validateOnBlur("caseType")');
    expect(formSrc).toMatch(/Type of case \*/);
    expect(formSrc).toContain('id="state"');
    expect(formSrc).toContain('validateOnBlur("state")');
    expect(formSrc).toMatch(/>State \*</);
  });

  it("schema flags every checklist field for an empty PI retainer, and each maps to a label", () => {
    const errs = validateFields("personal-injury-intake", {});
    expect(errs.caseType).toMatch(/required/);
    expect(errs.state).toMatch(/required/);
    expect(errs.workProducts).toMatch(/required/);
    for (const key of Object.keys(errs)) {
      expect(FIELDS.find((f) => f.key === key)?.label).toBeTruthy();
    }
  });

  it("every required control carries an id so the checklist can focus it", () => {
    for (const id of [
      "evalueeFirstName",
      "evalueeLastName",
      "retainingAttorneyEmail",
      "retainingAttorneyPhone",
      "retainingFirm",
      "workProducts",
      "retainingSide",
      // PSA-box fields made required so every PSA box is filled in.
      "invoiceTo",
      "opposingCounselName",
      "opposingCounselFirm",
      "carrierClaimNo",
      "adjusterName",
      "dateNeededBy",
    ]) {
      expect(formSrc).toContain(`id="${id}"`);
    }
  });

  it("no longer renders a standalone Referral source box (removed as duplicative of How-did-you-hear, Chris 2026-07-17)", () => {
    expect(formSrc).not.toContain('id="referralSource"');
    expect(formSrc).not.toContain('update("referralSource"');
    expect(formSrc).not.toMatch(/Referral source \*/);
    // The How-did-you-hear control (the field it duplicated) stays.
    expect(formSrc).toContain("How did you hear about us?");
    expect(formSrc).toMatch(/update\("howHeard", e\.target\.value\)/);
  });

  it("optional but FORMAT-checked controls also carry an id so the checklist jump-link works", () => {
    // These fields are optional, but a bad value (a future date / malformed
    // email) is format-validated into the "still needed" checklist. Without an
    // id, focusField's getElementById returns null and the checklist row's
    // jump-to-field button silently does nothing.
    for (const id of ["dateOfLoss", "retainingParalegalEmail"]) {
      expect(formSrc).toContain(`id="${id}"`);
    }
  });
});

describe("e-sign consent controls", () => {
  it("seeds the two e-sign fields in initialFields", () => {
    expect(formSrc).toMatch(/esignConsent:\s*false/);
    expect(formSrc).toMatch(/esignTypedName:\s*""/);
  });
  it("binds the consent checkbox and the typed-name input", () => {
    expect(formSrc).toContain('update("esignConsent", e.target.checked)');
    expect(formSrc).toContain('id="esignTypedName"');
    expect(formSrc).toContain('validateOnBlur("esignTypedName")');
  });
});

describe("unified form: route-aware visibility (spec 2026-07-16 §3)", () => {
  it("imports unifiedFieldVisibility and computes visibility per spec.unified", () => {
    expect(formSrc).toMatch(/unifiedFieldVisibility/);
    expect(formSrc).toMatch(/spec\.unified/);
  });
  it("gates the side row, work-products fieldset, and e-sign+payment block on the computed visibility", () => {
    expect(formSrc).toMatch(/visibility\.showSide/);
    expect(formSrc).toMatch(/visibility\.showWorkProducts/);
    expect(formSrc).toMatch(/visibility\.showEsignAndPayment/);
  });
  it("renders the WPEC affiliate notice when visibility.showWpecNotice is true", () => {
    expect(formSrc).toMatch(/visibility\.showWpecNotice/);
    expect(formSrc).toContain("Wolstein Putts Expert Consulting");
  });
  it("renders grouped <optgroup>s for the unified spec via case-types.mjs's caseTypeGroups", () => {
    expect(formSrc).toMatch(/caseTypeGroups/);
    expect(formSrc).toContain("<optgroup");
  });
});

describe("failed submits open the fill-in-place missing-info modal", () => {
  it("sources the modal rows from the shared schema helper, called with (formType, fields)", () => {
    expect(formSrc).toMatch(/import\s*\{[^}]*missingRequiredFields[^}]*\}\s*from\s*"\.\.\/\.\.\/lib\/intake-schema\.mjs"/s);
    expect(formSrc).toMatch(/missingRequiredFields\(\s*formType,\s*fields/);
  });

  it("renders the shared MissingInfoModal wired to the form's own state", () => {
    expect(formSrc).toContain('from "@/components/ui/MissingInfoModal"');
    expect(formSrc).toMatch(/<MissingInfoModal/);
    expect(formSrc).toMatch(/open=\{modalOpen\}/);
    expect(formSrc).toMatch(/rows=\{modalRows\}/);
    // RetainerIntakeFields is an interface (no implicit index signature), so the
    // frozen Record<string, unknown> prop takes the same cast used elsewhere.
    expect(formSrc).toMatch(/values=\{fields\b/);
    expect(formSrc).toMatch(/onContinue=\{continueFromModal\}/);
  });

  it("the failed-validation branch opens the modal instead of silently returning", () => {
    expect(formSrc).toMatch(/setErrors\(fieldErrors\);\s*\n\s*setModalOpen\(true\);\s*\n\s*return;/);
  });

  it("continuing from the modal runs the SAME network path as a direct submit", () => {
    expect(formSrc).toMatch(/const performSubmit = useCallback\(/);
    expect(formSrc).toMatch(/performSubmit\(\)/);
  });

  it("the modal's identity-sensitive handlers are useCallback-wrapped", () => {
    // MissingInfoModal's keydown effect depends on onClose's identity; a fresh
    // inline lambda every render would tear down and re-add the listener.
    expect(formSrc).toMatch(/const closeModal = useCallback\(/);
    expect(formSrc).toMatch(/const continueFromModal = useCallback\(/);
    expect(formSrc).toMatch(/const handleModalChange = useCallback\(/);
    expect(formSrc).toMatch(/onClose=\{closeModal\}/);
    expect(formSrc).toMatch(/onChange=\{handleModalChange\}/);
  });

  it("inline field errors are wired to their control for assistive tech", () => {
    expect(formSrc).toContain("aria-describedby");
    expect(formSrc).toContain("aria-invalid");
    expect(formSrc).toMatch(/aria-invalid=\{Boolean\(errors\.evalueeFirstName\)\}/);
    expect(formSrc).toMatch(/aria-describedby=\{errors\.evalueeFirstName \? "evalueeFirstName-error" : undefined\}/);
    expect(formSrc).toMatch(/id="evalueeFirstName-error"/);
  });

  it("keeps the amber still-needed checklist alongside the modal", () => {
    expect(formSrc).toMatch(/still needs? your attention/);
  });

  it("the checklist no longer claims the missing items block submitting", () => {
    // Submitting an incomplete form is now allowed - it opens the modal - so the
    // old "before you can submit" copy would be a lie.
    expect(formSrc).not.toContain("before you can submit");
    expect(formSrc).toMatch(/submitting opens a window/);
  });

  it("performSubmit carries the same in-flight re-entry guard handleSubmit has", () => {
    expect(formSrc).toMatch(/performSubmit = useCallback\(async \(\) => \{\s*\n?\s*if \(status === "submitting"\) return;/);
  });
});

describe("a caseType change made INSIDE the modal must prune work products", () => {
  // Soft-lock: the unified matrimonial route offers a NARROWER work-product
  // vocabulary, so a selection made under the old route becomes a value that no
  // rendered control can uncheck - the modal only draws the resolved options.
  const STALE = { caseType: "Matrimonial/Divorce", workProducts: ["Life Care Plan"] };

  it("a stale out-of-vocabulary selection is unclearable from the modal's own options", () => {
    const row = missingRequiredFields("unified-intake", STALE).find((r) => r.key === "workProducts");
    expect(row).toBeTruthy();
    expect(row.message).toMatch(/choose valid/);
    expect(row.options).not.toContain("Life Care Plan");
  });

  it("the prune resolves it into a row the modal CAN satisfy", () => {
    const allowed = workProductsFor("unified-intake", STALE);
    const pruned = STALE.workProducts.filter((w) => allowed.includes(w));
    expect(pruned).toEqual([]);
    const row = missingRequiredFields("unified-intake", { ...STALE, workProducts: pruned })
      .find((r) => r.key === "workProducts");
    expect(row.message).toMatch(/required/);
    expect(row.options.length).toBeGreaterThan(0);
  });

  it("handleModalChange routes caseType through updateCaseType (which prunes), not bare update", () => {
    const body = formSrc.match(/const handleModalChange = useCallback\(([\s\S]*?)\n {2}\);/)?.[1];
    expect(body).toBeTruthy();
    expect(body).toMatch(/if \(key === "caseType"\) \{[\s\S]{0,120}?updateCaseType\(String\(value\)\);[\s\S]{0,40}?return;/);
    // Ordering: the prune branch must come BEFORE the generic update fallthrough.
    expect(body.indexOf("updateCaseType")).toBeLessThan(body.indexOf("update(key as"));
  });
});

describe("retainer intake form renders the expert picker (spec 2026-07-28)", () => {
  it("declares retainedExpert on RetainerIntakeFields and seeds it empty", () => {
    expect(payloadsSrc).toMatch(/retainedExpert: string;/);
    expect(formSrc).toMatch(/retainedExpert: "",/);
  });

  it("renders the shared ExpertPicker bound to fields.retainedExpert", () => {
    expect(formSrc).toContain('import ExpertPicker from "@/components/ExpertPicker"');
    expect(formSrc).toMatch(/<ExpertPicker\s+value=\{fields\.retainedExpert\}/);
    expect(formSrc).toMatch(/onChange=\{\(v\) => update\("retainedExpert", v\)\}/);
  });

  it("the schema treats it as optional, so it never blocks submission", () => {
    const f = FIELDS.find((x) => x.key === "retainedExpert");
    expect(f.label).toBe("Requested KWVRS expert");
    expect(validateFields("personal-injury-intake", {}).retainedExpert).toBeUndefined();
  });
});
