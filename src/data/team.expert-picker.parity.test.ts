import { describe, expect, it } from "vitest";
import { retainableExperts, EXPERT_TIER_LABELS } from "./team";
import {
  RETAINED_EXPERTS,
  EXPERT_TIER_LABELS as SCHEMA_TIER_LABELS,
} from "../../lib/intake-schema.mjs";

// lib/ must stay dependency-free: the site's production Docker image copies
// lib/, not src/, so the schema carries a SNAPSHOT of the editorial roster
// rather than importing it. This test is the pin - adding an expert to team.ts
// without adding the matching schema line (or vice versa) fails here, the same
// way HOW_HEARD is pinned to the workflow's HOW_HEARD_LABELS.
describe("intake schema roster is pinned to src/data/team.ts", () => {
  it("RETAINED_EXPERTS mirrors retainableExperts() exactly, in the same order", () => {
    expect(RETAINED_EXPERTS).toEqual(
      retainableExperts().map((m) => ({ value: m.slug, label: m.name, tier: m.expertTier })),
    );
  });

  it("the tier labels match", () => {
    expect(SCHEMA_TIER_LABELS).toEqual(EXPERT_TIER_LABELS);
  });
});
