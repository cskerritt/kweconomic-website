import { describe, expect, it } from "vitest";
import { activeTeam, retainableExperts, EXPERT_TIER_LABELS } from "./team";
import { practiceAreasFor } from "@/lib/practice-areas";

// The tiered roster is editorial data; the guard is on the RULES (who may be
// listed as a retainable expert, in what order), not on a frozen list. With a
// two-person roster the only retainable expert is the Chief of Economic
// Services; the associate is support and is never offered for retention.
describe("expert tiers", () => {
  it("lists the tiered members, senior first", () => {
    expect(retainableExperts().map((m) => m.slug)).toEqual(["christopher-skerritt"]);
    expect(retainableExperts().filter((m) => m.expertTier === "senior").map((m) => m.slug)).toEqual([
      "christopher-skerritt",
    ]);
  });

  it("never offers a member honored in memoriam", () => {
    for (const m of retainableExperts()) expect(m.memoriam, m.slug).toBeFalsy();
  });

  it("offers nobody whose role is support", () => {
    for (const m of retainableExperts()) expect(["leadership", "expert"]).toContain(m.role);
    for (const m of activeTeam.filter((m) => m.role === "support")) expect(m.expertTier, m.slug).toBeUndefined();
  });

  it("every tiered expert has card data and at least one economics practice area", () => {
    for (const m of retainableExperts()) {
      expect(m.imageUrl, m.slug).toMatch(/^\/team\/.+\.jpg$/);
      expect(m.specialties.length, m.slug).toBeGreaterThan(0);
      expect(m.bio.length, m.slug).toBeGreaterThan(0);
      expect(EXPERT_TIER_LABELS[m.expertTier as "senior" | "fellow"], m.slug).toBeTruthy();
      expect(practiceAreasFor(m).length, m.slug).toBeGreaterThan(0);
    }
  });

  it("does not mutate activeTeam while sorting", () => {
    const before = activeTeam.map((m) => m.slug);
    retainableExperts();
    expect(activeTeam.map((m) => m.slug)).toEqual(before);
  });

  it("labels the two tiers", () => {
    expect(EXPERT_TIER_LABELS).toEqual({ senior: "Senior Expert", fellow: "Fellow Expert" });
  });
});
