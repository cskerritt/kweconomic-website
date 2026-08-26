import { describe, expect, it } from "vitest";
import {
  isEmail, isPhone, isZip, isValidDate, isNonFutureDate, isNonPastDate, isFutureDeadlineDate,
  FIELDS, SECTIONS, getFields, validateFields, deriveLegacyKeys, formOptions, workProductsFor,
  PI_CASE_TYPES, PI_WORK_PRODUCTS, MARITAL_WORK_PRODUCTS, PI_SIDES, PI_PAYMENTS, MARITAL_PAYMENTS, EDUCATION, IME_STATES,
  RETAINED_EXPERTS, EXPERT_TIER_LABELS, retainedExpertMeta, deriveRetainedExpertKeys,
  missingRequiredFields,
} from "./intake-schema.mjs";

const NOW = Date.parse("2026-07-01T00:00:00Z");

describe("format validators", () => {
  it("isEmail", () => {
    expect(isEmail("a@b.co")).toBe(true);
    expect(isEmail("bad")).toBe(false);
    expect(isEmail("")).toBe(false);
    expect(isEmail(undefined)).toBe(false);
    // Truncated TLD: Resend 422s "x@gmail.c" at send time (2026-08-11
    // incident, case e80c7896) - must be rejected at intake instead.
    expect(isEmail("roni.elmore@gmail.c")).toBe(false);
    expect(isEmail("roni.elmore@gmail.com")).toBe(true);
    // Multi-label domain: the 2-char minimum binds to the FINAL label - the
    // regex must not satisfy it by spanning "gmail.c" across the dot.
    expect(isEmail("x@mail.gmail.c")).toBe(false);
    expect(isEmail("x@sub.domain.co")).toBe(true);
  });
  it("isPhone (>=10 digits, tolerant of formatting)", () => {
    expect(isPhone("(201) 343-0700")).toBe(true);
    expect(isPhone("201343070")).toBe(false);
    expect(isPhone(12345)).toBe(false);
  });
  it("isZip (5 or 9 digit)", () => {
    expect(isZip("07601")).toBe(true);
    expect(isZip("07601-1234")).toBe(true);
    expect(isZip("123")).toBe(false);
  });
  it("isValidDate / range checks", () => {
    expect(isValidDate("2026-07-01")).toBe(true);
    expect(isValidDate("not-a-date")).toBe(false);
    expect(isValidDate("2026-02-30")).toBe(false); // rolls over -> rejected
    expect(isValidDate("2026-02-29")).toBe(false); // 2026 not a leap year
    expect(isValidDate("2024-02-29")).toBe(true);  // 2024 IS a leap year
    expect(isNonFutureDate("2020-01-01", NOW)).toBe(true);
    expect(isNonFutureDate("2030-01-01", NOW)).toBe(false);
    expect(isNonPastDate("2030-01-01", NOW)).toBe(true);
    expect(isNonPastDate("2020-01-01", NOW)).toBe(false);
  });
});

describe("field descriptors", () => {
  it("every descriptor has a known section and type", () => {
    const types = new Set(["text","email","tel","date","select","multiselect","radio","checkbox","textarea","zip"]);
    for (const f of FIELDS) {
      expect(SECTIONS).toContain(f.section);
      expect(types.has(f.type)).toBe(true);
      expect(typeof f.key).toBe("string");
      expect(typeof f.label).toBe("string");
    }
  });
  it("getFields resolves personal-injury options + conditional required", () => {
    const fields = getFields("personal-injury-intake");
    const side = fields.find((f) => f.key === "retainingSide");
    expect(side.resolvedRequired).toBe(true);            // PI requires side
    expect(side.resolvedOptions.map((o) => o.value)).toEqual(["plaintiff","defense","joint"]);
    const caseType = fields.find((f) => f.key === "caseType");
    expect(caseType.resolvedOptions).toContain("Personal Injury");
  });
  it("getFields hides the side row for marital and drops PI-only options", () => {
    const fields = getFields("marital-intake");
    const side = fields.find((f) => f.key === "retainingSide");
    expect(side.resolvedRequired).toBe(false);           // marital: not required
    const caseType = fields.find((f) => f.key === "caseType");
    expect(caseType.resolvedOptions).toEqual(["Matrimonial"]);
  });
  it("evaluee names and state are required on the retainer intakes", () => {
    const fields = getFields("personal-injury-intake");
    for (const key of ["evalueeFirstName","evalueeLastName","retainingAttorneyPhone","state","paymentMethod"]) {
      expect(fields.find((f) => f.key === key).resolvedRequired).toBe(true);
    }
    // DOB and billing are encouraged, not required
    expect(fields.find((f) => f.key === "evalueeDob").resolvedRequired).toBe(false);
    expect(fields.find((f) => f.key === "billingZip").resolvedRequired).toBe(false);
  });
});

describe("vocabulary exports", () => {
  it("exposes the per-form option vocabularies for Phase 2", () => {
    expect(PI_CASE_TYPES).toContain("Personal Injury");
    expect(PI_SIDES.map((o) => o.value)).toContain("plaintiff");
    expect(MARITAL_PAYMENTS.map((o) => o.value)).toContain("card-or-ach");
  });
});

const goodPI = {
  retainingAttorneyFirstName: "Sam", retainingAttorneyLastName: "Lee",
  retainingAttorneyEmail: "sam@firm.com", retainingAttorneyPhone: "201-343-0700",
  retainingFirm: "Lee LLP", evalueeFirstName: "Jane", evalueeLastName: "Doe",
  caseType: "Personal Injury", retainingSide: "plaintiff", workProducts: ["Vocational Evaluation"],
  state: "NJ", turnaround: "standard", paymentMethod: "check",
  esignConsent: true, esignTypedName: "Sam Lee",
  // PSA-box fields now required on every retainer route (spec: "every PSA box
  // fully filled in"). Side is plaintiff, so the Defense-only carrier/adjuster
  // boxes are NOT required here.
  invoiceTo: "Lee LLP, 1 Main St, Newark NJ 07102",
  opposingCounselName: "Pat Roe", opposingCounselFirm: "Roe & Co",
  dateNeededBy: "2099-01-01",
};

describe("PSA-box requiredness (every PSA box fully filled in)", () => {
  // Boxes that must be filled on EVERY retainer PSA (all routes except the
  // email-only WPEC referral).
  const NEW_ALWAYS = ["invoiceTo", "opposingCounselName", "opposingCounselFirm", "dateNeededBy"];

  it("marks the always-on PSA boxes required on the retainer intakes", () => {
    const fields = getFields("personal-injury-intake");
    for (const key of NEW_ALWAYS) {
      expect(fields.find((f) => f.key === key)?.resolvedRequired, key).toBe(true);
    }
  });

  it("flags each missing always-on PSA box", () => {
    for (const key of NEW_ALWAYS) {
      const errs = validateFields("personal-injury-intake", { ...goodPI, [key]: "" });
      expect(errs[key], key).toMatch(/required/i);
    }
  });

  it("requires Carrier/Claim No. and Adjuster ONLY when the side is Defense", () => {
    const plaintiff = getFields("personal-injury-intake", { retainingSide: "plaintiff" });
    expect(plaintiff.find((f) => f.key === "carrierClaimNo").resolvedRequired).toBe(false);
    expect(plaintiff.find((f) => f.key === "adjusterName").resolvedRequired).toBe(false);
    const defense = getFields("personal-injury-intake", { retainingSide: "defense" });
    expect(defense.find((f) => f.key === "carrierClaimNo").resolvedRequired).toBe(true);
    expect(defense.find((f) => f.key === "adjusterName").resolvedRequired).toBe(true);
  });

  it("flags carrier/adjuster on a Defense payload but not a plaintiff one", () => {
    const errs = validateFields("personal-injury-intake", { ...goodPI, retainingSide: "defense" });
    expect(errs.carrierClaimNo).toMatch(/required/i);
    expect(errs.adjusterName).toMatch(/required/i);
    expect(validateFields("personal-injury-intake", goodPI).carrierClaimNo).toBeUndefined();
  });

  it("does NOT require any of these on the WPEC (email-only) route", () => {
    const wpec = getFields("unified-intake", { caseType: "Wrongful Termination" });
    for (const key of [...NEW_ALWAYS, "carrierClaimNo", "adjusterName"]) {
      expect(wpec.find((f) => f.key === key)?.resolvedRequired, key).toBe(false);
    }
  });

  it("DOES require the always-on boxes on the unified standard route", () => {
    const standard = getFields("unified-intake", { caseType: "Personal Injury" });
    for (const key of NEW_ALWAYS) {
      expect(standard.find((f) => f.key === key)?.resolvedRequired, key).toBe(true);
    }
  });
});

describe("validateFields", () => {
  it("passes a complete PI payload", () => {
    expect(validateFields("personal-injury-intake", goodPI)).toEqual({});
  });
  it("flags each missing required field", () => {
    const errs = validateFields("personal-injury-intake", { ...goodPI, evalueeLastName: "", state: "" });
    expect(errs.evalueeLastName).toMatch(/required/i);
    expect(errs.state).toMatch(/required/i);
  });
  it("flags a bad email / phone / enum / date", () => {
    const errs = validateFields("personal-injury-intake", {
      ...goodPI, retainingAttorneyEmail: "nope", retainingAttorneyPhone: "12",
      state: "ZZ", dateOfLoss: "2999-01-01",
    });
    expect(errs.retainingAttorneyEmail).toBeTruthy();
    expect(errs.retainingAttorneyPhone).toBeTruthy();
    expect(errs.state).toBeTruthy();          // not in STATE_VALUES
    expect(errs.dateOfLoss).toBeTruthy();      // future
  });
  it("requires >=1 work product", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, workProducts: [] }).workProducts).toMatch(/required/i);
  });
  it("does not require side on marital", () => {
    const maritalGood = { ...goodPI, caseType: "Matrimonial", workProducts: ["Vocational Evaluation"], retainingSide: "", paymentMethod: "check" };
    expect(validateFields("marital-intake", maritalGood).retainingSide).toBeUndefined();
  });
  it("rejects an out-of-vocabulary turnaround value", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, turnaround: "someday" }).turnaround).toMatch(/valid/i);
    expect(validateFields("personal-injury-intake", { ...goodPI, turnaround: "rush" }).turnaround).toBeUndefined();
  });
  it("enum-checks caseType against the per-form vocabulary", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, caseType: "Bogus Type" }).caseType).toMatch(/valid/i);
    expect(validateFields("personal-injury-intake", { ...goodPI, caseType: "Personal Injury" }).caseType).toBeUndefined();
  });
});

describe("date range validators tolerate US + Pacific-territory timezone skew", () => {
  // date-only values are entered in the user's LOCAL calendar; `now` is a UTC
  // instant. A +/-1 day grace covers every served locale (Guam UTC+10 .. American
  // Samoa UTC-11) so "today" is never wrongly rejected near the UTC day boundary.
  const guamMorning = Date.parse("2026-06-30T22:00:00Z"); // local Jul 1 in UTC+10
  const eastEvening = Date.parse("2026-07-02T01:00:00Z");  // local Jul 1 in UTC-4
  const midday = Date.parse("2026-07-01T15:00:00Z");
  it("accepts today entered from an ahead-of-UTC territory (no false 'future')", () => {
    expect(isNonFutureDate("2026-07-01", guamMorning)).toBe(true);
    expect(validateFields("personal-injury-intake", { dateOfLoss: "2026-07-01" }, guamMorning).dateOfLoss).toBeUndefined();
  });
  it("accepts a next-day deadline typed in a behind-UTC evening; rejects a same-local-day one (no false 'past', but not overdue-on-arrival)", () => {
    expect(isNonPastDate("2026-07-01", eastEvening)).toBe(true);
    // dateNeededBy now uses the stricter hard-deadline rule. In a behind-UTC
    // evening the user's LOCAL tomorrow (Jul 2) is already UTC-today, so a Jul 2
    // deadline must still pass (the generosity - no false rejection). Their LOCAL
    // today (Jul 1) is UTC-yesterday and IS the set the dashboard flags overdue,
    // so it is now correctly rejected.
    expect(validateFields("personal-injury-intake", { dateNeededBy: "2026-07-02" }, eastEvening).dateNeededBy).toBeUndefined();
    expect(validateFields("personal-injury-intake", { dateNeededBy: "2026-07-01" }, eastEvening).dateNeededBy).toMatch(/after today/i);
  });
  it("still rejects clearly-future and clearly-past values", () => {
    expect(isNonFutureDate("2026-07-05", midday)).toBe(false);
    expect(isNonPastDate("2026-06-25", midday)).toBe(false);
  });
  it("pins today as valid at a mid-day UTC now", () => {
    expect(isNonPastDate("2026-07-01", midday)).toBe(true);
    expect(isNonFutureDate("2026-07-01", midday)).toBe(true);
  });
});

describe("dateNeededBy hard-deadline rule (never overdue-on-arrival)", () => {
  // Attorneys kept entering the submission date (or earlier), so the case landed
  // on the admin dashboard already OVERDUE. The dashboard flags overdue only when
  // date_needed_by is STRICTLY before today-UTC (a same-UTC-day value is a benign
  // "due today"), so the rule rejects exactly that set: strictly-before-today-UTC.
  const now = Date.parse("2026-07-15T12:00:00Z"); // today-UTC = Jul 15
  it("isFutureDeadlineDate rejects only dates strictly before today-UTC", () => {
    expect(isFutureDeadlineDate("2026-07-14", now)).toBe(false); // yesterday -> would be OVERDUE
    expect(isFutureDeadlineDate("2026-07-15", now)).toBe(true);  // today-UTC -> "due today", allowed
    expect(isFutureDeadlineDate("2026-07-16", now)).toBe(true);  // tomorrow
    expect(isFutureDeadlineDate("2027-01-01", now)).toBe(true);  // far future
    expect(isFutureDeadlineDate("not-a-date", now)).toBe(false); // invalid string
    expect(isFutureDeadlineDate("", now)).toBe(false);
  });
  it("validateFields flags a past deadline with the Rush-nudge message", () => {
    const errs = validateFields("personal-injury-intake", { ...goodPI, dateNeededBy: "2026-07-14" }, now);
    expect(errs.dateNeededBy).toMatch(/after today/i);
    expect(errs.dateNeededBy).toMatch(/rush/i);
  });
  it("accepts a same-UTC-day (due-today) deadline - not overdue, so not rejected", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, dateNeededBy: "2026-07-15" }, now).dateNeededBy).toBeUndefined();
  });
  it("accepts a clearly-future deadline", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, dateNeededBy: "2026-08-01" }, now).dateNeededBy).toBeUndefined();
  });
  it("an EMPTY required deadline still fails as required, not as a format error", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, dateNeededBy: "" }, now).dateNeededBy).toMatch(/required/i);
  });
});

describe("validateFields robustness + enum coverage", () => {
  it("tolerates null / non-object data without throwing", () => {
    expect(() => validateFields("personal-injury-intake", null)).not.toThrow();
    expect(() => deriveLegacyKeys(null)).not.toThrow();
    expect(deriveLegacyKeys(null)).toEqual({});
  });
  it("treats a non-array workProducts as unsatisfied (no bypass of the >=1 rule)", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, workProducts: "Vocational Evaluation" }).workProducts).toMatch(/required/i);
  });
  it("rejects a workProducts array with an out-of-vocabulary value", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, workProducts: ["Vocational Evaluation", "Bogus"] }).workProducts).toBeTruthy();
  });
  it("enum-checks retainingSide and paymentMethod against the form vocabulary", () => {
    expect(validateFields("personal-injury-intake", { ...goodPI, retainingSide: "bogus" }).retainingSide).toMatch(/valid/i);
    expect(validateFields("personal-injury-intake", { ...goodPI, paymentMethod: "bitcoin" }).paymentMethod).toMatch(/valid/i);
  });
});

describe("deriveLegacyKeys", () => {
  it("composes the load-bearing PSA keys from granular fields", () => {
    const d = deriveLegacyKeys({
      evalueeFirstName: "Jane", evalueeLastName: "Doe",
      retainingAttorneyFirstName: "Sam", retainingAttorneyLastName: "Lee",
      retainingParalegalFirstName: "Pat", retainingParalegalLastName: "Kim",
      carrierName: "Acme Mutual", claimNumber: "CL-123",
      billingContactName: "AP Dept", billingEmail: "ap@firm.com",
      billingStreet: "1 University Plaza", billingCity: "Hackensack", billingState: "NJ", billingZip: "07601",
    });
    expect(d.individualEvaluated).toBe("Jane Doe");
    expect(d.retainingAttorneyName).toBe("Sam Lee");
    expect(d.retainingParalegalName).toBe("Pat Kim");
    expect(d.carrierClaimNo).toBe("Acme Mutual / CL-123");
    expect(d.invoiceTo).toContain("AP Dept");
    expect(d.invoiceTo).toContain("Hackensack, NJ 07601");
  });
  it("omits keys with no source data (never overwrites with blank)", () => {
    const d = deriveLegacyKeys({ evalueeFirstName: "Jane", evalueeLastName: "Doe" });
    expect(d.individualEvaluated).toBe("Jane Doe");
    expect(d).not.toHaveProperty("carrierClaimNo");
    expect(d).not.toHaveProperty("invoiceTo");
    expect(d).not.toHaveProperty("retainingAttorneyName");
  });
  it("composes partial names and a carrier without a claim number", () => {
    const d = deriveLegacyKeys({ evalueeFirstName: "Jane", carrierName: "Acme Mutual" });
    expect(d.individualEvaluated).toBe("Jane");        // last name absent -> no trailing space
    expect(d.carrierClaimNo).toBe("Acme Mutual");      // claim absent -> no trailing slash
  });
  it("composes a partial invoiceTo without dangling separators", () => {
    expect(deriveLegacyKeys({ billingContactName: "AP Dept", billingEmail: "ap@f.com" }).invoiceTo).toBe("AP Dept; ap@f.com");
    expect(deriveLegacyKeys({ billingState: "NJ", billingZip: "07601" }).invoiceTo).toBe("NJ 07601");
  });
  it("tolerates a missing/empty payload without throwing", () => {
    expect(deriveLegacyKeys()).toEqual({});
    expect(deriveLegacyKeys({})).toEqual({});
  });
});

describe("howHeard (marketing attribution dropdown)", () => {
  it("exposes a detailed HOW_HEARD vocabulary ending in Other", async () => {
    const { HOW_HEARD } = await import("./intake-schema.mjs");
    expect(HOW_HEARD.length).toBeGreaterThanOrEqual(10);
    for (const o of HOW_HEARD) {
      expect(typeof o.value).toBe("string");
      expect(typeof o.label).toBe("string");
    }
    expect(HOW_HEARD[HOW_HEARD.length - 1].value).toBe("other");
    // The channels the firm actually tracks must be present.
    const values = HOW_HEARD.map((o) => o.value);
    for (const v of ["google", "attorney-referral", "past-client", "expert-directory", "ai-assistant", "linkedin"]) {
      expect(values).toContain(v);
    }
  });

  it("is an optional enum on every retainer intake: empty ok, valid ok, bogus rejected", () => {
    const base = {
      retainingAttorneyFirstName: "Sam", retainingAttorneyLastName: "Lee",
      retainingAttorneyEmail: "sam@firm.com", retainingAttorneyPhone: "201-555-0100",
      retainingFirm: "Lee LLP", evalueeFirstName: "Jane", evalueeLastName: "Doe",
      caseType: "Personal Injury", retainingSide: "plaintiff",
      workProducts: ["Vocational Evaluation"], state: "NJ",
      turnaround: "standard", paymentMethod: "check",
      esignConsent: true, esignTypedName: "Sam Lee",
      // Now-required PSA boxes (plaintiff side, so no carrier/adjuster).
      invoiceTo: "Lee LLP, 1 Main St, Newark NJ 07102",
      opposingCounselName: "Pat Roe", opposingCounselFirm: "Roe & Co",
      dateNeededBy: "2099-01-01",
    };
    expect(validateFields("personal-injury-intake", base)).toEqual({});
    expect(validateFields("personal-injury-intake", { ...base, howHeard: "google" })).toEqual({});
    expect(validateFields("personal-injury-intake", { ...base, howHeard: "other", howHeardOther: "billboard" })).toEqual({});
    const errs = validateFields("personal-injury-intake", { ...base, howHeard: "carrier-pigeon" });
    expect(Object.keys(errs)).toEqual(["howHeard"]);
  });
});

describe("referral source removed (Chris 2026-07-17: duplicative of 'How did you hear about us?')", () => {
  // Chris 2026-07-17: "remove the referral source box as it is duplicative with
  // the how did you hear above us." referralSource is no longer a schema field
  // (not required, not rendered). howHeard stays. Payloads that still CARRY
  // referralSource (cached tabs / in-flight /agreements posts) must be accepted,
  // never 400'd - validateFields only iterates FIELDS, so an unknown key is
  // simply ignored.
  const noReferral = {
    retainingAttorneyFirstName: "Sam", retainingAttorneyLastName: "Lee",
    retainingAttorneyEmail: "sam@firm.com", retainingAttorneyPhone: "201-343-0700",
    retainingFirm: "Lee LLP", evalueeFirstName: "Jane", evalueeLastName: "Doe",
    caseType: "Personal Injury", retainingSide: "plaintiff", workProducts: ["Vocational Evaluation"],
    state: "NJ", turnaround: "standard", paymentMethod: "check",
    esignConsent: true, esignTypedName: "Sam Lee",
    invoiceTo: "Lee LLP, 1 Main St, Newark NJ 07102",
    opposingCounselName: "Pat Roe", opposingCounselFirm: "Roe & Co",
    dateNeededBy: "2099-01-01",
  };

  it("no longer declares a referralSource field descriptor", () => {
    expect(FIELDS.find((f) => f.key === "referralSource")).toBeUndefined();
  });

  it("does NOT require referralSource: a complete payload that omits it validates cleanly (all routes)", () => {
    expect(validateFields("personal-injury-intake", noReferral)).toEqual({});
    expect(validateFields("unified-intake", { ...noReferral, caseType: "Personal Injury" })).toEqual({});
  });

  it("BACKWARD COMPAT: a legacy payload still carrying referralSource is accepted, not rejected", () => {
    expect(validateFields("personal-injury-intake", { ...noReferral, referralSource: "Prior client" })).toEqual({});
  });
});

describe("unified-intake: route-aware required fields (spec 2026-07-16 §3)", () => {
  it("formOptions exposes the full 62-value case-type vocabulary", () => {
    // lib/case-types.test.mjs pins CASE_TYPES.length to 62 (19 wpec + 3
    // matrimonial + 40 standard, per spec §2) - mirrored here rather than the
    // plan's stale "61" arithmetic.
    expect(formOptions("unified-intake").caseTypes.length).toBe(62);
    expect(formOptions("unified-intake").caseTypes).toContain("Wrongful Termination");
    expect(formOptions("unified-intake").caseTypes).toContain("Matrimonial/Divorce");
  });

  it("standard route (e.g. Personal Injury): side, work products, e-sign, and payment are all required", () => {
    const data = { caseType: "Personal Injury" };
    const fields = getFields("unified-intake", data);
    expect(fields.find((f) => f.key === "retainingSide").resolvedRequired).toBe(true);
    expect(fields.find((f) => f.key === "workProducts").resolvedRequired).toBe(true);
    expect(fields.find((f) => f.key === "esignConsent").resolvedRequired).toBe(true);
    expect(fields.find((f) => f.key === "paymentMethod").resolvedRequired).toBe(true);
  });

  it("matrimonial route (e.g. Matrimonial/Divorce): side is NOT required, work products/e-sign/payment ARE", () => {
    const data = { caseType: "Matrimonial/Divorce" };
    const fields = getFields("unified-intake", data);
    expect(fields.find((f) => f.key === "retainingSide").resolvedRequired).toBe(false);
    expect(fields.find((f) => f.key === "workProducts").resolvedRequired).toBe(true);
    expect(fields.find((f) => f.key === "esignConsent").resolvedRequired).toBe(true);
    expect(fields.find((f) => f.key === "paymentMethod").resolvedRequired).toBe(true);
  });

  it("wpec route (e.g. Wrongful Termination): side, work products, e-sign, and payment are all NOT required", () => {
    const data = { caseType: "Wrongful Termination" };
    const fields = getFields("unified-intake", data);
    expect(fields.find((f) => f.key === "retainingSide").resolvedRequired).toBe(false);
    expect(fields.find((f) => f.key === "workProducts").resolvedRequired).toBe(false);
    expect(fields.find((f) => f.key === "esignConsent").resolvedRequired).toBe(false);
    expect(fields.find((f) => f.key === "paymentMethod").resolvedRequired).toBe(false);
  });

  it("wpec submission validates cleanly with only the case-facts fields filled in (no side/products/esign/payment)", () => {
    const errors = validateFields("unified-intake", {
      caseType: "Wrongful Termination",
      state: "NJ",
      evalueeFirstName: "Jane",
      evalueeLastName: "Doe",
      retainingAttorneyFirstName: "Sam",
      retainingAttorneyLastName: "Counsel",
      retainingAttorneyEmail: "sam@firm.com",
      retainingAttorneyPhone: "2015550100",
      retainingFirm: "Acme LLP",
      turnaround: "standard",
    });
    expect(errors.retainingSide).toBeUndefined();
    expect(errors.workProducts).toBeUndefined();
    expect(errors.esignConsent).toBeUndefined();
    expect(errors.paymentMethod).toBeUndefined();
  });

  it("every OTHER formType is unaffected (personal-injury-intake keeps its existing static rule)", () => {
    const fields = getFields("personal-injury-intake", {});
    expect(fields.find((f) => f.key === "retainingSide").resolvedRequired).toBe(true);
    expect(fields.find((f) => f.key === "workProducts").resolvedRequired).toBe(true);
    const maritalFields = getFields("marital-intake", {});
    expect(maritalFields.find((f) => f.key === "retainingSide").resolvedRequired).toBe(false);
  });
});

// The unified intake offers ALL PI work products, but the matrimonial route's
// marital PSA can only express the marital vocabulary (Vocational Evaluation) -
// anything else silently drops from the stamped PSA. The workProducts field's
// OPTIONS are now route-aware so the client renders (and BOTH client + server
// validateFields accept) only what the destination template can carry.
describe("unified-intake: route-aware work-product OPTIONS (2026-07-20 fix)", () => {
  const wpOptions = (data) => getFields("unified-intake", data).find((f) => f.key === "workProducts").resolvedOptions;

  it("matrimonial route narrows the work-product options to the marital vocabulary", () => {
    expect(wpOptions({ caseType: "Matrimonial/Divorce" })).toEqual(MARITAL_WORK_PRODUCTS);
    expect(wpOptions({ caseType: "Spousal Support/Alimony" })).toEqual(MARITAL_WORK_PRODUCTS);
  });

  it("standard (and wpec) routes keep the full PI work-product vocabulary (NY matter: IME offered)", () => {
    expect(wpOptions({ caseType: "Personal Injury", state: "NY" })).toEqual(PI_WORK_PRODUCTS);
    expect(wpOptions({ caseType: "Wrongful Termination", state: "NY" })).toEqual(PI_WORK_PRODUCTS); // wpec
    expect(wpOptions({ state: "NJ" })).toEqual(PI_WORK_PRODUCTS); // no case type yet -> standard default
  });

  it("workProductsFor is exported and leaves the 4 legacy forms unchanged", () => {
    expect(workProductsFor("unified-intake", { caseType: "Matrimonial/Divorce" })).toEqual(MARITAL_WORK_PRODUCTS);
    expect(workProductsFor("marital-intake", {})).toEqual(MARITAL_WORK_PRODUCTS);
    expect(workProductsFor("personal-injury-intake", { caseType: "Matrimonial/Divorce", state: "NY" })).toEqual(PI_WORK_PRODUCTS);
  });

  it("validateFields REJECTS a PI-only product on the matrimonial route (client + server agree)", () => {
    const errors = validateFields("unified-intake", { caseType: "Matrimonial/Divorce", workProducts: ["IME"] });
    expect(errors.workProducts).toBeTruthy();
  });

  it("validateFields ACCEPTS Vocational Evaluation on the matrimonial route", () => {
    const errors = validateFields("unified-intake", { caseType: "Matrimonial/Divorce", workProducts: ["Vocational Evaluation"] });
    expect(errors.workProducts).toBeUndefined();
  });

  it("validateFields still ACCEPTS every PI product on the standard route (NY matter)", () => {
    const errors = validateFields("unified-intake", { caseType: "Personal Injury", state: "NY", workProducts: ["IME", "Life Care Plan"] });
    expect(errors.workProducts).toBeUndefined();
  });
});

// IME is conducted for New York and New Jersey matters ONLY (Chris,
// 2026-08-17): the option is offered - and accepted by validateFields - only
// when the matter's `state` is NY or NJ. Same shared-helper mechanism as the
// matrimonial narrowing above, so the rendered checkboxes and the server
// validation can never drift. CME (the non-metro form's equivalent exam) was
// removed from NONMETRO_WORK_PRODUCTS entirely in the same change.
describe("IME offered for NY/NJ matters only (2026-08-17)", () => {
  const wpOptions = (ft, data) => getFields(ft, data).find((f) => f.key === "workProducts").resolvedOptions;

  it("IME_STATES exports the allowed states", () => {
    expect(IME_STATES).toEqual(["NY", "NJ"]);
  });

  it("hides IME from the PI + consulting vocabularies when the state is not NY/NJ (or not yet chosen)", () => {
    for (const ft of ["personal-injury-intake", "consulting-intake", "unified-intake"]) {
      expect(wpOptions(ft, { state: "TX" })).not.toContain("IME");
      expect(wpOptions(ft, {})).not.toContain("IME");
    }
  });

  it("offers IME for NY and NJ matters", () => {
    for (const state of ["NY", "NJ"]) {
      expect(wpOptions("personal-injury-intake", { state })).toContain("IME");
      expect(wpOptions("consulting-intake", { state })).toContain("IME");
    }
  });

  it("validateFields REJECTS IME for a non-NY/NJ matter (client + server agree)", () => {
    const errors = validateFields("personal-injury-intake", { state: "TX", workProducts: ["IME"] });
    expect(errors.workProducts).toBeTruthy();
  });

  it("validateFields ACCEPTS IME for a NJ matter", () => {
    const errors = validateFields("personal-injury-intake", { state: "NJ", workProducts: ["IME"] });
    expect(errors.workProducts).toBeUndefined();
  });

  it("CME is gone from the non-metro vocabulary", () => {
    expect(wpOptions("nonmetro-intake", {})).not.toContain("CME");
    const errors = validateFields("nonmetro-intake", { workProducts: ["CME"] });
    expect(errors.workProducts).toBeTruthy();
  });
});

// Retained-expert picker (spec 2026-07-28). The field is OPTIONAL by design:
// "No preference - let KWVRS assign" is the default and stores nothing, so no
// existing submission becomes invalid and no PSA behavior changes.
describe("retainedExpert (intake expert picker)", () => {
  it("is optional on every retainer form", () => {
    for (const ft of ["personal-injury-intake", "marital-intake", "nonmetro-intake", "consulting-intake", "unified-intake"]) {
      const f = getFields(ft, {}).find((x) => x.key === "retainedExpert");
      expect(f, ft).toBeTruthy();
      expect(f.resolvedRequired, ft).toBe(false);
    }
    expect(validateFields("personal-injury-intake", {}).retainedExpert).toBeUndefined();
    expect(validateFields("personal-injury-intake", { retainedExpert: "" }).retainedExpert).toBeUndefined();
  });

  it("accepts a slug from the roster and rejects anything else", () => {
    expect(validateFields("personal-injury-intake", { retainedExpert: "daniel-wolstein" }).retainedExpert).toBeUndefined();
    expect(validateFields("personal-injury-intake", { retainedExpert: "sharon-hirsh" }).retainedExpert).toBeUndefined();
    expect(validateFields("personal-injury-intake", { retainedExpert: "zachary-sperling" }).retainedExpert).toBeTruthy();
    expect(validateFields("personal-injury-intake", { retainedExpert: "not-a-person" }).retainedExpert).toBeTruthy();
  });

  it("names the field in the error without flattening the KWVRS acronym", () => {
    // The enum message is built from the field label, which used to be
    // lowercased whole - "choose a valid requested kwvrs expert". Only the
    // leading capital is dropped now, so acronyms inside a label survive.
    expect(validateFields("personal-injury-intake", { retainedExpert: "not-a-person" }).retainedExpert)
      .toBe("choose a valid requested KWVRS expert");
    // Ordinary labels are unchanged by the same rule.
    expect(validateFields("personal-injury-intake", { paymentMethod: "wampum" }).paymentMethod)
      .toBe("choose a valid payment method");
  });

  it("offers the same vocabulary on every form (the roster is firm-wide, not per PSA)", () => {
    const opts = (ft) => getFields(ft, {}).find((x) => x.key === "retainedExpert").resolvedOptions;
    expect(opts("marital-intake")).toEqual(RETAINED_EXPERTS);
    expect(opts("unified-intake")).toEqual(RETAINED_EXPERTS);
  });

  it("every roster entry carries a known tier, seniors first", () => {
    const tiers = RETAINED_EXPERTS.map((e) => e.tier);
    for (const t of tiers) expect(EXPERT_TIER_LABELS[t]).toBeTruthy();
    expect(tiers.indexOf("fellow")).toBeGreaterThan(tiers.lastIndexOf("senior"));
    for (const e of RETAINED_EXPERTS) {
      expect(e.value).toMatch(/^[a-z]+(-[a-z]+)+$/);
      expect(e.label.length).toBeGreaterThan(0);
    }
    expect(new Set(RETAINED_EXPERTS.map((e) => e.value)).size).toBe(RETAINED_EXPERTS.length);
  });
});

describe("deriveRetainedExpertKeys", () => {
  it("emits the slug, display name, and tier for a known expert", () => {
    expect(deriveRetainedExpertKeys({ retainedExpert: "daniel-wolstein" })).toEqual({
      retainedExpert: "daniel-wolstein",
      retainedExpertName: "Daniel Wolstein, Ph.D.",
      retainedExpertTier: "senior",
    });
    expect(deriveRetainedExpertKeys({ retainedExpert: "john-may" }).retainedExpertTier).toBe("fellow");
  });

  it("emits NOTHING for a blank, missing, or unknown slug (spreading it is always safe)", () => {
    expect(deriveRetainedExpertKeys({})).toEqual({});
    expect(deriveRetainedExpertKeys({ retainedExpert: "" })).toEqual({});
    expect(deriveRetainedExpertKeys({ retainedExpert: "zachary-sperling" })).toEqual({});
    expect(deriveRetainedExpertKeys()).toEqual({});
    expect(deriveRetainedExpertKeys(null)).toEqual({});
  });

  it("retainedExpertMeta resolves a slug and tolerates whitespace", () => {
    expect(retainedExpertMeta(" matthew-putts ").tier).toBe("senior");
    expect(retainedExpertMeta("nobody")).toBeNull();
  });

  it("leaves deriveLegacyKeys (the PSA prefill contract) untouched", () => {
    const legacy = deriveLegacyKeys({
      evalueeFirstName: "Jane",
      evalueeLastName: "Doe",
      retainedExpert: "daniel-wolstein",
    });
    expect(legacy).toEqual({ individualEvaluated: "Jane Doe" });
  });
});

// The case type the "unified-intake: route-aware required fields" describe above
// uses for the wpec route - reused here rather than invented, so the two blocks
// can never disagree about which vocabulary word routes to wpec.
const WPEC_ROUTED_CASE_TYPE = "Wrongful Termination";

describe("missingRequiredFields (spec 2026-08-10 intake modal)", () => {
  it("returns FIELDS-ordered entries with label, message, type and options", () => {
    const rows = missingRequiredFields("personal-injury-intake", {});
    expect(rows.length).toBeGreaterThan(0);
    // FIELDS order: attorney identity comes before evaluee, which comes before caseType
    const keys = rows.map((r) => r.key);
    expect(keys.indexOf("retainingAttorneyFirstName")).toBeGreaterThan(-1);
    expect(keys.indexOf("retainingAttorneyFirstName")).toBeLessThan(keys.indexOf("evalueeFirstName"));
    expect(keys.indexOf("evalueeFirstName")).toBeLessThan(keys.indexOf("caseType"));
    const caseType = rows.find((r) => r.key === "caseType");
    expect(caseType.label).toBeTruthy();
    expect(caseType.message).toContain("required");
    expect(Array.isArray(caseType.options)).toBe(true);
    expect(caseType.options.length).toBeGreaterThan(0);
    expect(caseType.type).toBeTruthy();
  });
  it("shrinks as data fills and is empty when the form validates", () => {
    const empty = missingRequiredFields("consulting-intake", {});
    const partial = missingRequiredFields("consulting-intake", {
      retainingAttorneyFirstName: "Ann",
      retainingAttorneyLastName: "Attorney",
    });
    expect(partial.length).toBeLessThan(empty.length);
    expect(partial.map((r) => r.key)).not.toContain("retainingAttorneyFirstName");
  });
  it("respects conditional requiredness: defense-only fields", () => {
    const plaintiff = missingRequiredFields("personal-injury-intake", { retainingSide: "plaintiff" });
    const defense = missingRequiredFields("personal-injury-intake", { retainingSide: "defense" });
    expect(plaintiff.map((r) => r.key)).not.toContain("carrierClaimNo");
    expect(defense.map((r) => r.key)).toContain("carrierClaimNo");
    expect(defense.map((r) => r.key)).toContain("adjusterName");
  });
  it("marital form never requires retainingSide", () => {
    expect(missingRequiredFields("marital-intake", {}).map((r) => r.key)).not.toContain("retainingSide");
  });
  it("unified-intake wpec route drops the retainer-only fields", () => {
    // Pick a case type that routes to wpec (see unified route tests above for the vocabulary).
    const wpecData = { caseType: WPEC_ROUTED_CASE_TYPE };
    const keys = missingRequiredFields("unified-intake", wpecData).map((r) => r.key);
    for (const dropped of ["retainingSide", "workProducts", "esignConsent", "paymentMethod", "dateNeededBy", "invoiceTo"]) {
      expect(keys).not.toContain(dropped);
    }
  });
  it("treats an unchecked required checkbox (false) as missing", () => {
    const keys = missingRequiredFields("personal-injury-intake", { esignConsent: false }).map((r) => r.key);
    expect(keys).toContain("esignConsent");
  });
  it("includes format failures, not just emptiness", () => {
    const rows = missingRequiredFields("personal-injury-intake", { retainingAttorneyEmail: "not-an-email" });
    const email = rows.find((r) => r.key === "retainingAttorneyEmail");
    expect(email).toBeTruthy();
    expect(email.message).not.toContain("required");
  });
});
