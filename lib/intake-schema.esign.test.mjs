import { describe, expect, it } from "vitest";
import { validateFields, getFields } from "./intake-schema.mjs";

const retainer = "personal-injury-intake";
// A minimal valid retainer payload EXCEPT the two new e-sign fields.
function baseValid() {
  return {
    evalueeFirstName: "Sam", evalueeLastName: "Evaluee",
    retainingFirst: "Jane", retainingLast: "Attorney",
    retainingAttorneyPhone: "555-0100", retainingFirm: "Doe & Co",
    retainingSide: "plaintiff", caseType: "Personal Injury",
    workProducts: ["Vocational Evaluation"], paymentMethod: "check",
    esignConsent: true, esignTypedName: "Jane Q. Attorney",
  };
}

describe("e-sign consent schema fields", () => {
  it("declares esignConsent (checkbox, REQUIRED to submit) and esignTypedName (text)", () => {
    const fields = getFields(retainer);
    const consent = fields.find((f) => f.key === "esignConsent");
    const typed = fields.find((f) => f.key === "esignTypedName");
    // Consent is mandatory: a retainer cannot be submitted without it.
    expect(consent).toMatchObject({ type: "checkbox", resolvedRequired: true });
    expect(typed?.type).toBe("text");
  });

  it("BLOCKS submitting a retainer without consent (consent + typed name both flagged missing)", () => {
    const errors = validateFields(retainer, { ...baseValid(), esignConsent: false, esignTypedName: "" });
    expect(errors.esignConsent).toBeTruthy();
    // The unchecked consent means the typed name is not yet required (it becomes
    // required only once consent is checked) - the checklist surfaces consent first.
    expect(errors.esignTypedName).toBeFalsy();
  });

  it("requires the typed name once consent is checked", () => {
    const errors = validateFields(retainer, { ...baseValid(), esignConsent: true, esignTypedName: "" });
    expect(errors.esignTypedName).toBeTruthy();
  });

  it("passes when consent is checked and the typed name is provided", () => {
    const errors = validateFields(retainer, baseValid());
    expect(errors.esignConsent).toBeFalsy();
    expect(errors.esignTypedName).toBeFalsy();
  });
});
