import { describe, expect, it } from "vitest";
import { caseTypes } from "./caseTypes";
import { getAllServiceSlugs } from "./services";

describe("LCP case types", () => {
  it("has the 11 LCP case types", () => {
    expect(caseTypes.map((c) => c.slug).sort()).toEqual(["amputation","birth-injury","burn-injury","cerebral-palsy","medical-malpractice","motor-vehicle-accident","personal-injury","spinal-cord-injury","traumatic-brain-injury","workers-compensation","wrongful-death"]);
  });
  it("references only pillar services and has LCP impact copy", () => {
    const pillars = new Set(getAllServiceSlugs());
    for (const c of caseTypes) {
      for (const s of c.relevantServices) expect(pillars.has(s), `${c.slug} -> ${s}`).toBe(true);
      expect(c.lifeCareImpact?.length, c.slug).toBeGreaterThan(200);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(3);
    }
  });
});
