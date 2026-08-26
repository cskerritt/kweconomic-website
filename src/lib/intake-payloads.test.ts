import { describe, expect, it } from "vitest";
import { buildRetainerPayload, type RetainerIntakeFields } from "./intake-payloads";
import { DEFAULT_TURNAROUND } from "./turnaround";
import type { IntakeFormSpec } from "@/data/intakeForms";

const spec = { slug: "personal-injury", psaFile: "personal-injury.pdf" } as IntakeFormSpec;

const fields = (over: Partial<RetainerIntakeFields> = {}): RetainerIntakeFields => ({
  evalueeFirstName: "Jane",
  evalueeLastName: "Doe",
  retainingAttorneyFirstName: "Sam",
  retainingAttorneyLastName: "Counsel",
  retainingAttorneyEmail: "sam@firm.com",
  retainingAttorneyPhone: "201-555-0100",
  retainingParalegalFirstName: "",
  retainingParalegalLastName: "",
  retainingParalegalEmail: "",
  reportsCcParalegal: false,
  esignConsent: false,
  esignTypedName: "",
  retainingFirm: "Acme LLP",
  invoiceTo: "",
  retainingSide: "plaintiff",
  opposingCounselName: "",
  opposingCounselFirm: "",
  carrierClaimNo: "",
  adjusterName: "",
  caseType: "Personal Injury",
  workProducts: ["Vocational Evaluation"],
  dateOfLoss: "",
  state: "NJ",
  city: "Newark",
  dateNeededBy: "",
  howHeard: "",
  howHeardOther: "",
  paymentMethod: "check",
  notes: "",
  retainedExpert: "",
  turnaround: DEFAULT_TURNAROUND,
  ...over,
});

describe("buildRetainerPayload howHeard (marketing attribution)", () => {
  it("carries the dropdown value and the Other free text into the payload", () => {
    const p = buildRetainerPayload(spec, fields({ howHeard: "other", howHeardOther: "courthouse flyer" }));
    expect(p.howHeard).toBe("other");
    expect(p.howHeardOther).toBe("courthouse flyer");
  });
});

describe("buildRetainerPayload turnaround", () => {
  it("emits the rush label", () => {
    expect(buildRetainerPayload(spec, fields({ turnaround: "rush" })).turnaround).toBe("rush");
  });
  it("emits the standard label", () => {
    expect(buildRetainerPayload(spec, fields({ turnaround: "standard" })).turnaround).toBe("standard");
  });
  it("emits the default (standard) when defaulted", () => {
    expect(buildRetainerPayload(spec, fields()).turnaround).toBe("standard");
  });
});

describe("buildRetainerPayload derives the legacy PSA-prefill composites", () => {
  it("composes individualEvaluated + retainingAttorneyName from the granular fields", () => {
    const p = buildRetainerPayload(spec, fields());
    expect(p.individualEvaluated).toBe("Jane Doe");
    expect(p.retainingAttorneyName).toBe("Sam Counsel");
    // the granular fields are still present for the record + strict validation
    expect(p.evalueeFirstName).toBe("Jane");
    expect(p.retainingAttorneyPhone).toBe("201-555-0100");
    expect(p.formType).toBe("personal-injury-intake");
  });
  it("composes retainingParalegalName only when a paralegal name is present", () => {
    expect(buildRetainerPayload(spec, fields()).retainingParalegalName).toBeUndefined();
    const p = buildRetainerPayload(spec, fields({ retainingParalegalFirstName: "Pat", retainingParalegalLastName: "Kim" }));
    expect(p.retainingParalegalName).toBe("Pat Kim");
  });
  it("does not overwrite the form's composite carrierClaimNo / invoiceTo with a blank", () => {
    const p = buildRetainerPayload(spec, fields({ carrierClaimNo: "Acme / CL-9", invoiceTo: "AP Dept" }));
    expect(p.carrierClaimNo).toBe("Acme / CL-9");
    expect(p.invoiceTo).toBe("AP Dept");
  });
});

describe("buildRetainerPayload retainedExpert (expert picker)", () => {
  it("emits the slug, display name, and tier for a chosen expert", () => {
    const p = buildRetainerPayload(spec, fields({ retainedExpert: "daniel-wolstein" }));
    expect(p.retainedExpert).toBe("daniel-wolstein");
    expect(p.retainedExpertName).toBe("Daniel Wolstein, Ph.D.");
    expect(p.retainedExpertTier).toBe("senior");
  });

  it("emits no name or tier when the attorney expresses no preference", () => {
    const p = buildRetainerPayload(spec, fields());
    expect(p.retainedExpert).toBe("");
    expect(p.retainedExpertName).toBeUndefined();
    expect(p.retainedExpertTier).toBeUndefined();
  });

  // WPEC prune: the picker hides on an employment/discrimination route, but a
  // pick made BEFORE switching the case type still sits in component state.
  // The payload boundary must strip it so a case KWVRS refers to the affiliate
  // never carries (or emails) a stale KWVRS expert preference.
  const unifiedSpec = { slug: "unified", psaFile: "", unified: true } as IntakeFormSpec;

  it("strips a stale expert pick from a WPEC-routed unified submission", () => {
    const p = buildRetainerPayload(
      unifiedSpec,
      fields({ retainedExpert: "daniel-wolstein", caseType: "Wrongful Termination" }),
      true,
    );
    expect(p.retainedExpert).toBe("");
    expect(p.retainedExpertName).toBeUndefined();
    expect(p.retainedExpertTier).toBeUndefined();
  });

  it("keeps the pick on the same case type when WPEC routing is disabled", () => {
    const p = buildRetainerPayload(
      unifiedSpec,
      fields({ retainedExpert: "daniel-wolstein", caseType: "Wrongful Termination" }),
      false,
    );
    expect(p.retainedExpert).toBe("daniel-wolstein");
    expect(p.retainedExpertName).toBe("Daniel Wolstein, Ph.D.");
  });

  it("keeps the pick on a standard-routed case type with WPEC routing enabled", () => {
    const p = buildRetainerPayload(
      unifiedSpec,
      fields({ retainedExpert: "matthew-putts", caseType: "Personal Injury" }),
      true,
    );
    expect(p.retainedExpert).toBe("matthew-putts");
    expect(p.retainedExpertTier).toBe("senior");
  });

  it("still derives the legacy PSA composites alongside it", () => {
    const p = buildRetainerPayload(spec, fields({ retainedExpert: "john-may" }));
    expect(p.individualEvaluated).toBe("Jane Doe");
    expect(p.retainedExpertTier).toBe("fellow");
  });
});

describe("buildRetainerPayload retainingSide (matrimonial route hides the side row)", () => {
  // The "represents" radio row sits ABOVE the case-type select, so an attorney
  // can pick a side and THEN choose a matrimonial case type, which hides the
  // row but leaves the stale value in state. The marital PSA prints no side
  // boxes, so a stale side produced a spurious "represents_plaintiff NOT
  // stamped" warning on the admin dashboard. Strip it at the payload boundary
  // (mirrors the WPEC retainedExpert prune above).
  const unifiedSpec = { slug: "unified", psaFile: "", unified: true } as IntakeFormSpec;

  it("strips a stale side from a matrimonial-routed unified submission", () => {
    const p = buildRetainerPayload(unifiedSpec, fields({ retainingSide: "plaintiff", caseType: "Matrimonial/Divorce" }));
    expect(p.retainingSide).toBe("");
  });

  it("keeps the side on a standard-routed unified submission", () => {
    const p = buildRetainerPayload(unifiedSpec, fields({ retainingSide: "defense", caseType: "Personal Injury" }));
    expect(p.retainingSide).toBe("defense");
  });

  it("never touches the side on the non-unified specs (their side row is always shown)", () => {
    const p = buildRetainerPayload(spec, fields({ retainingSide: "plaintiff", caseType: "Matrimonial" }));
    expect(p.retainingSide).toBe("plaintiff");
  });
});
