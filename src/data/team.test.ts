import { describe, expect, it } from "vitest";
import { team, activeTeam, retainableExperts, EXPERT_TIER_LABELS } from "./team";

// The retainable roster drives the intake forms' expert picker. It is editorial
// data, so the guard is on the RULES (who may be offered, in what order), not on
// a frozen list: adding an expert means adding one expertTier field and this
// suite keeps the invariants that make the picker safe.
describe("retainableExperts", () => {
  it("returns the tiered members, senior first, file order preserved within a tier", () => {
    expect(retainableExperts().map((m) => m.slug)).toEqual([
      "daniel-wolstein",
      "matthew-putts",
      "jesse-wolstein",
      "sharon-hirsh",
      "paul-bourgeois",
      "christopher-skerritt",
      "john-halpin",
      "kristina-fredericksen",
      "john-may",
      "christina-rivera",
      "logan-patterson",
    ]);
  });

  it("never offers a member honored in memoriam", () => {
    for (const m of retainableExperts()) expect(m.memoriam).toBeFalsy();
    // The exclusion is structural (activeTeam), so tagging one by mistake still fails here.
    expect(team.find((m) => m.slug === "charles-kincaid")?.expertTier).toBeUndefined();
    expect(team.find((m) => m.slug === "bob-pare")?.expertTier).toBeUndefined();
  });

  it("offers nobody whose role is support or intern", () => {
    for (const m of retainableExperts()) expect(["leadership", "expert"]).toContain(m.role);
    // sharon-hirsh joined the roster 2026-07-29 (Chris's call) - COO title,
    // but CRC-credentialed and retainable.
    expect(team.find((m) => m.slug === "sharon-hirsh")?.expertTier).toBe("fellow");
    expect(team.find((m) => m.slug === "zachary-sperling")?.expertTier).toBeUndefined();
  });

  it("every offered expert has the card data the picker renders", () => {
    for (const m of retainableExperts()) {
      expect(m.imageUrl, m.slug).toMatch(/^\/team\/.+\.jpg$/);
      expect(m.specialties.length, m.slug).toBeGreaterThan(0);
      expect(m.bio.length, m.slug).toBeGreaterThan(0);
      expect(EXPERT_TIER_LABELS[m.expertTier as "senior" | "fellow"], m.slug).toBeTruthy();
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
