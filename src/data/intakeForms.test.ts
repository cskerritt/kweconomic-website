import { describe, expect, it } from "vitest";
import { INTAKE_FORMS, ALL_INTAKE_SLUGS, getIntakeForm } from "./intakeForms";
import { CASE_TYPES } from "../../lib/case-types.mjs";

describe("intake forms registry", () => {
  it("ALL_INTAKE_SLUGS still lists only the 4 template-backed forms (the unified form has no fixed PSA template)", () => {
    expect(ALL_INTAKE_SLUGS).toEqual(["marital", "personal-injury", "nonmetro", "consulting"]);
    expect(Object.keys(INTAKE_FORMS).sort()).toEqual(["consulting", "marital", "nonmetro", "personal-injury", "unified"]);
  });

  it("the unified spec sources its case types from the full case-types.mjs vocabulary and is excluded from ALL_INTAKE_SLUGS", () => {
    const spec = getIntakeForm("unified");
    expect(spec).toBeDefined();
    expect(spec!.unified).toBe(true);
    expect(spec!.caseTypes.length).toBe(CASE_TYPES.length);
    expect(ALL_INTAKE_SLUGS).not.toContain("unified");
  });

  it("exposes the non-metro and consulting forms (unlisted, noindex direct-link)", () => {
    expect(getIntakeForm("nonmetro")?.slug).toBe("nonmetro");
    expect(getIntakeForm("consulting")?.slug).toBe("consulting");
  });

  it("spells out the Personal Injury matter types that map to a real PI PSA checkbox", () => {
    // "Long-Term Disability" was removed: it maps to case_ltd, which the PI PSA
    // template does not have, so selecting it was silently dropped from the signed
    // PSA. Sourced from the schema now and pinned by intakeForms.parity.test.mjs.
    expect(INTAKE_FORMS["personal-injury"].caseTypes).toEqual([
      "Personal Injury",
      "Medical Malpractice",
      "Motor Vehicle Accident",
      "Workers' Compensation",
      "Wrongful Death",
      "Economic Loss Analysis",
    ]);
  });

  it("keeps Matrimonial as a single-case-type form with no represents row", () => {
    const marital = INTAKE_FORMS.marital;
    expect(marital.caseTypes).toEqual(["Matrimonial"]);
    expect(marital.representsOptions).toEqual([]);
  });
});
