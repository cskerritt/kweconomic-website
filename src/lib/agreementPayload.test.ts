import { describe, it, expect } from "vitest";
import {
  buildAgreementPayload,
  agreementModalRows,
  agreementControlValue,
  AGREEMENT_MODAL_KEYS,
  AGREEMENT_KEY_TO_NAME,
} from "./agreementPayload";
// The server-side validator the /api/consultation handler actually runs.
import { validateRoute } from "../../validation.server.mjs";
import { getAgreement } from "../data/agreements";
import { formOptions } from "../../lib/intake-schema.mjs";

const piAgreement = {
  title: "Personal Injury Retainer",
  slug: "personal-injury",
  intake: { firmLabel: "Retaining Firm" },
};

function formData(pairs: [string, string][]): FormData {
  const f = new FormData();
  for (const [k, v] of pairs) f.append(k, v);
  return f;
}

describe("buildAgreementPayload", () => {
  it("maps authorized work products into the normalized workProducts key (multi-select)", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Jane Doe"],
      ["email", "jane@firm.com"],
      ["Retaining Firm", "Doe LLP"],
      ["Retaining Counsel Represents", "Plaintiff"],
      ["Type of Case", "Personal Injury"],
      ["Work Product(s) Authorized", "Life Care Plan"],
      ["Work Product(s) Authorized", "Economic Analysis"],
    ]);
    const payload = buildAgreementPayload(raw, piAgreement);
    expect(payload.workProducts).toEqual(["Life Care Plan", "Economic Analysis"]);
    expect(payload.retainingSide).toBe("plaintiff"); // normalized label -> token
    expect(payload.formType).toBe("personal-injury-intake");
    expect(payload.name).toBe("Jane Doe");
    expect(payload.firm).toBe("Doe LLP");
  });

  it("maps the Retaining Attorney Phone label into retainingAttorneyPhone (the case row / Clio phone)", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Jane Doe"],
      ["email", "jane@firm.com"],
      ["Retaining Attorney Phone", "(201) 555-0100"],
      ["Retaining Firm", "Doe LLP"],
      ["Type of Case", "Personal Injury"],
      ["Work Product(s) Authorized", "Life Care Plan"],
    ]);
    const payload = buildAgreementPayload(raw, piAgreement);
    expect(payload.retainingAttorneyPhone).toBe("(201) 555-0100");
    // Absent field still yields the key (empty), never undefined-drops.
    const bare = buildAgreementPayload(formData([["Retaining Attorney Name", "J"]]), piAgreement);
    expect(bare.retainingAttorneyPhone).toBe("");
  });

  it("produces a payload the server intake validator ACCEPTS (the bug: it used to 400)", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Jane Doe"],
      ["email", "jane@firm.com"],
      ["Retaining Firm", "Doe LLP"],
      ["Retaining Counsel Represents", "Plaintiff"],
      ["Work Product(s) Authorized", "Life Care Plan"],
    ]);
    const payload = buildAgreementPayload(raw, piAgreement);
    expect(validateRoute("consultation", payload)).toBeNull();
  });

  it("maps the matrimonial slug to the marital-intake formType", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Pat Roe"],
      ["email", "pat@firm.com"],
      ["Work Product(s) Authorized", "Vocational Evaluation"],
    ]);
    const payload = buildAgreementPayload(raw, {
      title: "Matrimonial Retainer",
      slug: "matrimonial",
      intake: { firmLabel: "Retaining Firm" },
    });
    expect(payload.formType).toBe("marital-intake");
  });

  it("preserves multiple checked Type of Case selections (not just the first)", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Jane Doe"],
      ["email", "jane@firm.com"],
      ["Retaining Firm", "Doe LLP"],
      ["Retaining Counsel Represents", "Plaintiff"],
      ["Type of Case", "Personal Injury"],
      ["Type of Case", "Med Mal"],
      ["Work Product(s) Authorized", "Life Care Plan"],
    ]);
    const payload = buildAgreementPayload(raw, piAgreement);
    expect(payload.caseType).toBe("Personal Injury, Med Mal");
  });

  it("normalizes the evaluee name, joint side, payment, cc-paralegal, and paralegal to the keys psa-prefill reads", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Sam Counsel"],
      ["email", "sam@firm.com"],
      ["Retaining Firm", "Acme LLP"],
      ["Individual To Be Evaluated", "Jane Doe"],
      ["Retaining Counsel Represents", "Joint with Co-Counsel(s)"],
      ["Payment Method", "Check"],
      ["Work Product(s) Authorized", "Life Care Plan"],
      ["Reports can be emailed to paralegals", "Yes"],
      ["Retaining Paralegal / Email", "Pat Kim / pat@firm.com"],
    ]);
    const p = buildAgreementPayload(raw, piAgreement);
    expect(p.individualEvaluated).toBe("Jane Doe");
    expect(p.retainingSide).toBe("joint"); // label -> token (was silently dropped before)
    expect(p.paymentMethod).toBe("check"); // label -> token
    expect(p.reportsCcParalegal).toBe(true);
    expect(p.retainingParalegalName).toBe("Pat Kim / pat@firm.com");
  });

  it("normalizes the due date, referral source, and invoice-to (so Asana gets a deadline)", () => {
    const raw = formData([
      ["Report(s) Needed By", "2026-09-15"],
      ["Referral Source", "Prior client"],
      ["Invoice should be sent to", "AP Dept, Acme LLP"],
      ["Work Product(s) Authorized", "Life Care Plan"],
    ]);
    const p = buildAgreementPayload(raw, piAgreement);
    expect(p.dateNeededBy).toBe("2026-09-15");
    expect(p.referralSource).toBe("Prior client");
    expect(p.invoiceTo).toBe("AP Dept, Acme LLP");
  });

  it("normalizes Plaintiff/Defense and the marital 'Credit Card or ACH' payment", () => {
    const pi = buildAgreementPayload(formData([["Retaining Counsel Represents", "Plaintiff"], ["Payment Method", "ACH"], ["Work Product(s) Authorized", "IME"]]), piAgreement);
    expect(pi.retainingSide).toBe("plaintiff");
    expect(pi.paymentMethod).toBe("ach");
    const marital = buildAgreementPayload(
      formData([["Payment Method", "Credit Card or ACH Payment online"], ["Work Product(s) Authorized", "Vocational Evaluation"]]),
      { title: "Matrimonial", slug: "matrimonial", intake: { firmLabel: "Retaining Firm" } },
    );
    expect(marital.paymentMethod).toBe("card-or-ach");
  });

  it("omits retainingSide for a form with no represents row (matrimonial), and the server accepts it", () => {
    const raw = formData([
      ["email", "x@firm.com"],
      ["Work Product(s) Authorized", "Vocational Evaluation"],
    ]);
    const payload = buildAgreementPayload(raw, {
      title: "Matrimonial Retainer",
      slug: "matrimonial",
      intake: { firmLabel: "Retaining Firm" },
    });
    expect("retainingSide" in payload).toBe(false); // matrimonial has no represents row
    expect(validateRoute("consultation", payload)).toBeNull();
  });
});

describe("buildAgreementPayload dateOfLoss (DOI, spec section 3)", () => {
  it("normalizes the label-keyed DOI into payload.dateOfLoss (else it never reaches the conflict block)", () => {
    const raw = formData([
      ["Date of Injury / Loss", "2024-05-01"],
      ["Work Product(s) Authorized", "Life Care Plan"],
    ]);
    expect(buildAgreementPayload(raw, piAgreement).dateOfLoss).toBe("2024-05-01");
  });

  it("the server intake validator still ACCEPTS a payload carrying dateOfLoss (loose composite path)", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Jane Doe"],
      ["email", "jane@firm.com"],
      ["Retaining Firm", "Doe LLP"],
      ["Retaining Counsel Represents", "Plaintiff"],
      ["Work Product(s) Authorized", "Life Care Plan"],
      ["Date of Injury / Loss", "2024-05-01"],
    ]);
    expect(validateRoute("consultation", buildAgreementPayload(raw, piAgreement))).toBeNull();
  });
});

// --- The missing-info modal's feed for the composite /agreements form ---

const PI = getAgreement("personal-injury")!;
const MARITAL = getAgreement("matrimonial")!;
const NONMETRO = getAgreement("nonmetro")!;
const CONSULTING = getAgreement("consulting")!;

// A payload with every modal-gated field answered, so a test can knock out one
// at a time and see exactly that row.
const completePi = () =>
  buildAgreementPayload(
    formData([
      ["Individual To Be Evaluated", "Jane Doe"],
      ["Retaining Counsel Represents", "Plaintiff"],
      ["Type of Case", "Personal Injury"],
      ["Work Product(s) Authorized", "Life Care Plan"],
      ["Report(s) Needed By", "2099-01-15"],
      ["Invoice should be sent to", "AP Dept, Acme LLP"],
      ["Payment Method", "Check"],
    ]),
    PI,
  );

describe("AGREEMENT_MODAL_KEYS / AGREEMENT_KEY_TO_NAME", () => {
  it("lists exactly the schema keys that map 1:1 to an /agreements control", () => {
    expect(AGREEMENT_MODAL_KEYS).toEqual([
      "individualEvaluated",
      "caseType",
      "workProducts",
      "retainingSide",
      "dateNeededBy",
      "invoiceTo",
      "paymentMethod",
    ]);
  });

  it("names every key's control - the group label the field posts under, or its id", () => {
    expect(AGREEMENT_KEY_TO_NAME).toEqual({
      individualEvaluated: "individual",
      caseType: "Type of Case",
      workProducts: "Work Product(s) Authorized",
      retainingSide: "Retaining Counsel Represents",
      dateNeededBy: "due-date",
      invoiceTo: "invoice-to",
      paymentMethod: "Payment Method",
    });
    // Every key can be written back somewhere.
    for (const key of AGREEMENT_MODAL_KEYS) expect(AGREEMENT_KEY_TO_NAME[key]).toBeTruthy();
  });

  it("the group names are the SAME label keys buildAgreementPayload reads", () => {
    const p = buildAgreementPayload(
      formData([
        [AGREEMENT_KEY_TO_NAME.caseType, "Personal Injury"],
        [AGREEMENT_KEY_TO_NAME.workProducts, "Life Care Plan"],
        [AGREEMENT_KEY_TO_NAME.retainingSide, "Defense"],
        [AGREEMENT_KEY_TO_NAME.paymentMethod, "ACH"],
      ]),
      PI,
    );
    expect(p.caseType).toBe("Personal Injury");
    expect(p.workProducts).toEqual(["Life Care Plan"]);
    expect(p.retainingSide).toBe("defense");
    expect(p.paymentMethod).toBe("ach");
  });
});

describe("agreementModalRows", () => {
  it("flags every modal-gated gap on an empty PI submission, in schema (form) order", () => {
    const rows = agreementModalRows(buildAgreementPayload(formData([]), PI), PI);
    expect(rows.map((r) => r.key)).toEqual([
      "caseType",
      "retainingSide",
      "workProducts",
      "dateNeededBy",
      "invoiceTo",
      "paymentMethod",
    ]);
    // individualEvaluated is not a schema field (the schema collects granular
    // evaluee names), so the input's native `required` stays its only gate.
    expect(rows.map((r) => r.key)).not.toContain("individualEvaluated");
  });

  it("never leaks a gap the /agreements form has no control for", () => {
    const rows = agreementModalRows(buildAgreementPayload(formData([]), PI), PI);
    // The schema also wants attorney first/last name, state, turnaround, e-sign
    // consent... none of which this composite form renders. A row with no
    // control is unsatisfiable, and Continue stays disabled while rows remain.
    for (const key of rows.map((r) => r.key)) expect(AGREEMENT_MODAL_KEYS).toContain(key);
  });

  it("returns nothing for a complete submission", () => {
    expect(agreementModalRows(completePi(), PI)).toEqual([]);
  });

  it("omits retainingSide on a PSA with no represents row (matrimonial)", () => {
    const p = buildAgreementPayload(formData([["Payment Method", "Check"]]), MARITAL);
    expect(agreementModalRows(p, MARITAL).map((r) => r.key)).not.toContain("retainingSide");
  });

  it("subsumes the two legacy ad-hoc checks (missing side, zero work products)", () => {
    const p = completePi();
    delete p.retainingSide;
    p.workProducts = [];
    const keys = agreementModalRows(p, PI).map((r) => r.key);
    expect(keys).toContain("retainingSide");
    expect(keys).toContain("workProducts");
  });

  it("offers the PSA's OWN case-type vocabulary, not the schema's", () => {
    // The PI PSA prints abbreviations ("Med Mal", "WC", "Econ") the schema's
    // enum does not carry, and its checkbox group is multi-select. Options the
    // rendered form has no checkbox for could never be written back.
    const row = agreementModalRows(buildAgreementPayload(formData([]), PI), PI).find(
      (r) => r.key === "caseType",
    )!;
    expect(row.options).toEqual(PI.intake.caseTypeOptions);
    expect(row.options).not.toBe(PI.intake.caseTypeOptions); // copied, never the live array
    expect(row.type).toBe("select");
  });

  it("accepts a case type the schema's enum cannot judge (PSA abbreviation)", () => {
    const p = completePi();
    p.caseType = "Med Mal";
    expect(agreementModalRows(p, PI).map((r) => r.key)).not.toContain("caseType");
  });

  it("accepts MULTIPLE checked case types (the joined multi-select)", () => {
    const p = completePi();
    p.caseType = "Personal Injury, Med Mal";
    expect(agreementModalRows(p, PI).map((r) => r.key)).not.toContain("caseType");
  });

  it("gates emptiness only, so an answered group is never re-judged", () => {
    const p = completePi();
    p.workProducts = ["Some Retired Work Product"];
    p.paymentMethod = "wire";
    const keys = agreementModalRows(p, PI).map((r) => r.key);
    expect(keys).not.toContain("workProducts");
    expect(keys).not.toContain("paymentMethod");
  });

  it("keeps the one format rule the modal's own control can satisfy: a past due date", () => {
    const p = completePi();
    p.dateNeededBy = "2020-01-01";
    const row = agreementModalRows(p, PI).find((r) => r.key === "dateNeededBy")!;
    expect(row.message).toMatch(/after today/);
    expect(row.type).toBe("date");
  });

  it("works for every PSA slug", () => {
    for (const a of [PI, MARITAL, NONMETRO, CONSULTING]) {
      const rows = agreementModalRows(buildAgreementPayload(formData([]), a), a);
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) expect(Array.isArray(row.options)).toBe(true);
    }
  });
});

describe("agreementControlValue (write-back into the uncontrolled form)", () => {
  it("maps the two tokenized radio groups back to the LABEL the radio carries", () => {
    expect(agreementControlValue(PI, "retainingSide", "joint")).toBe("Joint with Co-Counsel(s)");
    expect(agreementControlValue(PI, "paymentMethod", "credit-card")).toBe("Credit Card");
    expect(agreementControlValue(MARITAL, "paymentMethod", "card-or-ach")).toBe(
      "Credit Card or ACH Payment online",
    );
    expect(agreementControlValue(NONMETRO, "retainingSide", "husband")).toBe("Husband");
  });

  it("passes label-shaped values through untouched", () => {
    expect(agreementControlValue(PI, "workProducts", ["IME", "Life Care Plan"])).toEqual([
      "IME",
      "Life Care Plan",
    ]);
    expect(agreementControlValue(PI, "caseType", "Med Mal")).toBe("Med Mal");
    expect(agreementControlValue(PI, "invoiceTo", "AP Dept")).toBe("AP Dept");
    expect(agreementControlValue(PI, "invoiceTo", undefined)).toBe("");
  });
});

describe("PSA option parity: what the modal writes must exist as a control", () => {
  // The modal renders the SCHEMA's options for the two radio groups and the work
  // products, then writes the matching label into the DOM. If a PSA's printed
  // options drift from the schema's labels, that write silently matches nothing.
  const cases: Array<[typeof PI, string]> = [
    [PI, "personal-injury-intake"],
    [CONSULTING, "consulting-intake"],
    [MARITAL, "marital-intake"],
    [NONMETRO, "nonmetro-intake"],
  ];
  for (const [agreement, formType] of cases) {
    it(`${agreement.slug}: sides, payments and work products match the schema's labels`, () => {
      const opts = formOptions(formType);
      expect(agreement.intake.representsOptions ?? []).toEqual(
        opts.sides.map((o: { label: string }) => o.label),
      );
      expect(agreement.intake.paymentOptions).toEqual(
        opts.payments.map((o: { label: string }) => o.label),
      );
      expect(agreement.intake.workProductOptions).toEqual(opts.workProducts);
    });
  }

  it("PI case types intentionally DIVERGE (the PSA prints abbreviations)", () => {
    // Documented, not a bug: this is exactly why the caseType row takes the
    // agreement's own options and is gated on emptiness alone.
    expect(PI.intake.caseTypeOptions).not.toEqual(formOptions("personal-injury-intake").caseTypes);
  });
});

describe("buildAgreementPayload retainedExpert (expert picker)", () => {
  it("normalizes the picked slug into the name + tier the dashboard renders", () => {
    const raw = formData([
      ["Work Product(s) Authorized", "Life Care Plan"],
      ["retainedExpert", "matthew-putts"],
    ]);
    const p = buildAgreementPayload(raw, piAgreement);
    expect(p.retainedExpert).toBe("matthew-putts");
    expect(p.retainedExpertName).toBe("Matthew R. Putts, Ph.D.");
    expect(p.retainedExpertTier).toBe("senior");
  });

  it("drops a slug that is not on the roster instead of storing it", () => {
    const raw = formData([
      ["Work Product(s) Authorized", "Life Care Plan"],
      ["retainedExpert", "zachary-sperling"],
    ]);
    const p = buildAgreementPayload(raw, piAgreement);
    expect(p.retainedExpert).toBe("");
    expect(p.retainedExpertName).toBeUndefined();
    expect(p.retainedExpertTier).toBeUndefined();
  });

  it("leaves the payload valid for the server when no expert is picked", () => {
    const raw = formData([
      ["Retaining Attorney Name", "Jane Doe"],
      ["email", "jane@firm.com"],
      ["Retaining Firm", "Doe LLP"],
      // A PI PSA has a represents row, so the server requires the side whether or
      // not an expert was picked (validation.server.mjs, loose composite path).
      ["Retaining Counsel Represents", "Plaintiff"],
      ["Work Product(s) Authorized", "Life Care Plan"],
    ]);
    const p = buildAgreementPayload(raw, piAgreement);
    expect(p.retainedExpert).toBe("");
    expect(validateRoute("consultation", p)).toBeNull();
  });
});
