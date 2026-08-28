import { describe, expect, it } from "vitest";
import { journeys } from "./journeys";
import { caseTypes } from "./caseTypes";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

const STAGES = ["considering", "retaining", "preparing-deposition", "trial"] as const;

describe("attorney journeys", () => {
  it("covers every stage for every case type exactly once", () => {
    const keys = journeys.map((j) => `${j.stage}/${j.caseTypeSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of caseTypes) for (const s of STAGES) expect(keys, `${s}/${c.slug}`).toContain(`${s}/${c.slug}`);
    expect(journeys.length).toBe(STAGES.length * caseTypes.length);
  });
  it("each stage entry is complete and economics-framed", () => {
    for (const j of journeys) {
      const id = `${j.stage}/${j.caseTypeSlug}`;
      expect(j.intro.length, id).toBeGreaterThan(200);
      expect(j.checklist.length, id).toBeGreaterThanOrEqual(3);
      expect(j.questionsToAsk.length, id).toBeGreaterThanOrEqual(3);
      expect(j.requiredDocuments.length, id).toBeGreaterThanOrEqual(3);
      expect(j.pitfalls.length, id).toBeGreaterThanOrEqual(2);
      expect(j.faqs.length, id).toBeGreaterThanOrEqual(1);
      expect(j.sources.length, id).toBeGreaterThanOrEqual(1);
      expect(j.dateModified, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const text = JSON.stringify(j);
      expect(text, id).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, id).not.toMatch(/[–—§]/);
      expect(text, id).not.toMatch(/life care planner|vocational expert|CLCP/i);
    }
  });
});
