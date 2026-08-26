// Single source of truth for the unified public intake's case-type
// vocabulary and its routing map (docs/superpowers/specs/
// 2026-07-16-unified-intake-wpec-routing-design.md §2). Dependency-free plain
// ESM - imported by BOTH the shared intake schema (lib/intake-schema.mjs, for
// the dropdown options + route-aware required fields) and the workflow
// service (workflow/lib/pipeline.js, for handleNewCase's server-authoritative
// router) - so, like lib/intake-schema.mjs, it must stay free of TypeScript
// and external dependencies.
//
// Each entry carries TWO independent axes:
//   - `route`: which pipeline branch handleNewCase takes ("wpec" sends two
//     emails and stops before any Clio/Documenso/Drive/Asana call;
//     "matrimonial" is the existing marital PSA/Clio flow; "standard" is
//     every other PSA/Clio flow).
//   - `group`: which <optgroup> the case type displays under in the unified
//     form's dropdown (independent of route - e.g. "Workers' Compensation"
//     routes "standard" but displays under "Disability & Comp", not "PI & Tort").

export const CASE_TYPE_GROUPS = [
  "PI & Tort",
  "Disability & Comp",
  "Family",
  "Economic & Commercial",
  "Other",
  // Employment/discrimination (the WPEC-routed cluster) renders LAST in the
  // dropdown per Chris 2026-07-17 ("move the employment options down to the
  // bottom"); routing/membership are unchanged - only the display position.
  "Employment & Discrimination",
];

export const CASE_TYPES = [
  // --- PI & Tort (route: standard) ---
  { value: "Personal Injury", group: "PI & Tort", route: "standard" },
  { value: "Motor Vehicle Accident", group: "PI & Tort", route: "standard" },
  { value: "Trucking/Commercial Vehicle", group: "PI & Tort", route: "standard" },
  { value: "Motorcycle", group: "PI & Tort", route: "standard" },
  { value: "Pedestrian/Bicycle", group: "PI & Tort", route: "standard" },
  { value: "Premises Liability", group: "PI & Tort", route: "standard" },
  { value: "Slip & Fall", group: "PI & Tort", route: "standard" },
  { value: "Product Liability", group: "PI & Tort", route: "standard" },
  { value: "Medical Malpractice", group: "PI & Tort", route: "standard" },
  { value: "Dental Malpractice", group: "PI & Tort", route: "standard" },
  { value: "Nursing Home/Elder Neglect", group: "PI & Tort", route: "standard" },
  { value: "Birth Injury", group: "PI & Tort", route: "standard" },
  { value: "Construction Accident", group: "PI & Tort", route: "standard" },
  { value: "Wrongful Death", group: "PI & Tort", route: "standard" },
  { value: "Dog Bite/Animal Attack", group: "PI & Tort", route: "standard" },
  { value: "Aviation", group: "PI & Tort", route: "standard" },
  { value: "Maritime/Jones Act", group: "PI & Tort", route: "standard" },
  { value: "Railroad/FELA", group: "PI & Tort", route: "standard" },
  { value: "Toxic Tort/Environmental", group: "PI & Tort", route: "standard" },
  { value: "Traumatic Brain Injury", group: "PI & Tort", route: "standard" },
  { value: "Spinal Cord Injury", group: "PI & Tort", route: "standard" },
  { value: "Burn Injury", group: "PI & Tort", route: "standard" },
  { value: "Amputation/Catastrophic", group: "PI & Tort", route: "standard" },
  { value: "Negligent Security", group: "PI & Tort", route: "standard" },
  { value: "Sexual Abuse/Assault (civil)", group: "PI & Tort", route: "standard" },
  { value: "Pharmaceutical/Mass Tort", group: "PI & Tort", route: "standard" },
  { value: "Medical Device", group: "PI & Tort", route: "standard" },
  { value: "Legal Malpractice", group: "PI & Tort", route: "standard" },

  // --- Disability & Comp (route: standard) ---
  { value: "Workers' Compensation", group: "Disability & Comp", route: "standard" },
  { value: "Long-Term Disability", group: "Disability & Comp", route: "standard" },
  { value: "Short-Term Disability", group: "Disability & Comp", route: "standard" },
  { value: "Social Security Disability", group: "Disability & Comp", route: "standard" },
  { value: "Veterans/TDIU", group: "Disability & Comp", route: "standard" },
  { value: "ERISA Disability", group: "Disability & Comp", route: "standard" },

  // --- Family (route: matrimonial) ---
  { value: "Matrimonial/Divorce", group: "Family", route: "matrimonial" },
  { value: "Spousal Support/Alimony", group: "Family", route: "matrimonial" },
  { value: "Child Support (earning capacity)", group: "Family", route: "matrimonial" },

  // --- Economic & Commercial (route: standard) ---
  { value: "Economic Loss Analysis", group: "Economic & Commercial", route: "standard" },
  { value: "Business Valuation", group: "Economic & Commercial", route: "standard" },
  { value: "Commercial/Business Damages", group: "Economic & Commercial", route: "standard" },
  { value: "Lost Profits/Business Interruption", group: "Economic & Commercial", route: "standard" },
  { value: "Breach of Contract (commercial)", group: "Economic & Commercial", route: "standard" },

  // --- Other (route: standard) ---
  { value: "Other (specify)", group: "Other", route: "standard" },

  // --- Employment & Discrimination (route: wpec) - displayed LAST in the
  // dropdown (Chris 2026-07-17); kept as a contiguous block at the tail so the
  // array's physical order matches the <optgroup> render order. ---
  { value: "Wrongful Termination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Employment Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Race Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Sex/Gender Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Age Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Disability Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Pregnancy Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Religious/National-Origin Discrimination", group: "Employment & Discrimination", route: "wpec" },
  { value: "Sexual Harassment", group: "Employment & Discrimination", route: "wpec" },
  { value: "Hostile Work Environment", group: "Employment & Discrimination", route: "wpec" },
  { value: "Retaliation/Whistleblower", group: "Employment & Discrimination", route: "wpec" },
  { value: "Wage & Hour (FLSA)", group: "Employment & Discrimination", route: "wpec" },
  { value: "Equal Pay", group: "Employment & Discrimination", route: "wpec" },
  { value: "Failure to Promote/Demotion", group: "Employment & Discrimination", route: "wpec" },
  { value: "Constructive Discharge", group: "Employment & Discrimination", route: "wpec" },
  { value: "FMLA Violation", group: "Employment & Discrimination", route: "wpec" },
  { value: "Breach of Employment Contract", group: "Employment & Discrimination", route: "wpec" },
  { value: "Non-Compete/Restrictive Covenant", group: "Employment & Discrimination", route: "wpec" },
  { value: "Other Employment", group: "Employment & Discrimination", route: "wpec" },
];

const ROUTE_BY_VALUE = new Map(CASE_TYPES.map((c) => [c.value, c.route]));

/**
 * Server-authoritative routing decision for a case type. Exact-value lookup
 * against THIS file's canonical vocabulary; defaults to "standard" for
 * anything else (blank, unknown, or one of the 4 existing forms' own
 * distinct case-type strings, which intentionally never appear in
 * CASE_TYPES - Non-Metro/Consulting/the legacy PI/Marital vocabularies are
 * unaffected by this file, per spec's non-goals).
 */
export function routeForCaseType(caseType) {
  const value = typeof caseType === "string" ? caseType.trim() : "";
  return ROUTE_BY_VALUE.get(value) || "standard";
}

/**
 * CASE_TYPES regrouped by display group, in CASE_TYPE_GROUPS order, for the
 * unified form's grouped <optgroup> dropdown. Every group with at least one
 * member is included (all 6 have members today).
 */
export function caseTypeGroups() {
  return CASE_TYPE_GROUPS.map((group) => ({
    group,
    options: CASE_TYPES.filter((c) => c.group === group).map((c) => ({ value: c.value, label: c.value })),
  })).filter((g) => g.options.length > 0);
}
