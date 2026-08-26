import { describe, expect, it } from "vitest";
import { CASE_TYPES, CASE_TYPE_GROUPS, routeForCaseType, caseTypeGroups } from "./case-types.mjs";

describe("CASE_TYPES", () => {
  it("has 62 entries with no duplicate values", () => {
    // Spec §2 (docs/superpowers/specs/2026-07-16-unified-intake-wpec-routing-design.md)
    // lists 19 wpec + 3 matrimonial + 40 standard = 62 case types.
    expect(CASE_TYPES.length).toBe(62);
    expect(new Set(CASE_TYPES.map((c) => c.value)).size).toBe(62);
  });
  it("every entry's group is a real CASE_TYPE_GROUPS member", () => {
    for (const c of CASE_TYPES) expect(CASE_TYPE_GROUPS).toContain(c.group);
  });
  it("every entry's route is one of wpec/matrimonial/standard", () => {
    for (const c of CASE_TYPES) expect(["wpec", "matrimonial", "standard"]).toContain(c.route);
  });
});

describe("routeForCaseType - every case type (spec §8)", () => {
  it("resolves every CASE_TYPES entry to its own declared route", () => {
    for (const c of CASE_TYPES) expect(routeForCaseType(c.value)).toBe(c.route);
  });
  it("spot-checks explicit values independent of the CASE_TYPES table itself", () => {
    expect(routeForCaseType("Wrongful Termination")).toBe("wpec");
    expect(routeForCaseType("Sexual Harassment")).toBe("wpec");
    expect(routeForCaseType("Other Employment")).toBe("wpec");
    expect(routeForCaseType("Matrimonial/Divorce")).toBe("matrimonial");
    expect(routeForCaseType("Spousal Support/Alimony")).toBe("matrimonial");
    expect(routeForCaseType("Personal Injury")).toBe("standard");
    expect(routeForCaseType("Workers' Compensation")).toBe("standard");
    expect(routeForCaseType("Other (specify)")).toBe("standard");
  });
  it("defaults to standard for anything not in the map, including blank/unknown input", () => {
    expect(routeForCaseType("Nonsense Case Type")).toBe("standard");
    expect(routeForCaseType("")).toBe("standard");
    expect(routeForCaseType(undefined)).toBe("standard");
    expect(routeForCaseType(null)).toBe("standard");
  });
  it("the OTHER 4 forms' own distinct case-type vocabularies always resolve standard (non-goal: unchanged)", () => {
    expect(routeForCaseType("Marital")).toBe("standard"); // nonmetro-intake's abbreviated value
    expect(routeForCaseType("Wrongful termination")).toBe("standard"); // nonmetro-intake's lowercase-t value, distinct from this file's "Wrongful Termination"
    expect(routeForCaseType("Matrimonial")).toBe("standard"); // marital-intake's own fixed value, distinct from this file's "Matrimonial/Divorce"
  });
});

describe("caseTypeGroups", () => {
  it("returns every group in CASE_TYPE_GROUPS order, each non-empty", () => {
    const groups = caseTypeGroups();
    expect(groups.map((g) => g.group)).toEqual(CASE_TYPE_GROUPS);
    for (const g of groups) expect(g.options.length).toBeGreaterThan(0);
  });
  it("wpec's field-set task is hideable per-entry via routeForCaseType, independent of display group", () => {
    const employment = caseTypeGroups().find((g) => g.group === "Employment & Discrimination");
    expect(employment.options.map((o) => o.value)).toContain("Wrongful Termination");
    expect(routeForCaseType("Wrongful Termination")).toBe("wpec");
    const disabilityComp = caseTypeGroups().find((g) => g.group === "Disability & Comp");
    expect(disabilityComp.options.map((o) => o.value)).toContain("Workers' Compensation");
    expect(routeForCaseType("Workers' Compensation")).toBe("standard");
  });
});

describe("case-type dropdown order: Employment & Discrimination sits at the BOTTOM (Chris 2026-07-17)", () => {
  // Chris 2026-07-17: "move the employment options down to the bottom of that
  // dropdown list." The employment/discrimination cluster (the wpec-routed
  // group) must render as the LAST <optgroup>; every OTHER group keeps its
  // prior relative order, and the employment options keep their own relative
  // order among themselves. Routing/membership are unchanged - only positions.
  const EMPLOYMENT = "Employment & Discrimination";

  it("Employment & Discrimination is the final display group (both the array and caseTypeGroups())", () => {
    expect(CASE_TYPE_GROUPS[CASE_TYPE_GROUPS.length - 1]).toBe(EMPLOYMENT);
    const groups = caseTypeGroups();
    expect(groups[groups.length - 1].group).toBe(EMPLOYMENT);
  });

  it("the non-employment groups keep their prior relative order", () => {
    expect(CASE_TYPE_GROUPS.filter((g) => g !== EMPLOYMENT)).toEqual([
      "PI & Tort",
      "Disability & Comp",
      "Family",
      "Economic & Commercial",
      "Other",
    ]);
  });

  it("all 19 employment entries are contiguous at the tail of the flat CASE_TYPES list, still routing wpec", () => {
    const employment = CASE_TYPES.filter((c) => c.group === EMPLOYMENT);
    expect(employment.length).toBe(19);
    const tail = CASE_TYPES.slice(-19);
    expect(tail.every((c) => c.group === EMPLOYMENT)).toBe(true);
    for (const c of employment) expect(routeForCaseType(c.value)).toBe("wpec");
  });

  it("the employment options keep their own relative order (Wrongful Termination first, Other Employment last)", () => {
    const employment = CASE_TYPES.filter((c) => c.group === EMPLOYMENT).map((c) => c.value);
    expect(employment[0]).toBe("Wrongful Termination");
    expect(employment[employment.length - 1]).toBe("Other Employment");
  });

  it("the non-employment case types keep their prior relative order (PI first, Other (specify) last before employment)", () => {
    const nonEmployment = CASE_TYPES.filter((c) => c.group !== EMPLOYMENT).map((c) => c.value);
    expect(nonEmployment[0]).toBe("Personal Injury");
    expect(nonEmployment[nonEmployment.length - 1]).toBe("Other (specify)");
  });
});
