import { describe, it, expect } from "vitest";
import { STATE_BATCHES, releasedStates, declaredPairs, isReleased } from "./serviceCaseTypeStates";
import { states } from "./states";
import { pillarServices, serviceCaseTypePairs } from "./services";

// The service x case type x state family ships one state batch per wave
// (plan Task 2). The batches partition the 56 states in crawl-priority order,
// the pairs are exactly the ones each pillar declares, and the released set is
// always a prefix of the batch order so the prerender, the sitemap, and the
// link mesh agree on which pages exist.
describe("service x case type x state release plan", () => {
  it("covers every state exactly once across four batches of 14", () => {
    const all = STATE_BATCHES.flatMap((b) => b.states);
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual(states.map((s) => s.slug).sort());
    expect(STATE_BATCHES.map((b) => b.id)).toEqual(["A", "B", "C", "D"]);
    for (const b of STATE_BATCHES) expect(b.states.length, `batch ${b.id}`).toBe(14);
  });

  it("names only real state slugs (the territories as states.ts spells them)", () => {
    const known = new Set(states.map((s) => s.slug));
    for (const b of STATE_BATCHES) for (const st of b.states) expect(known.has(st), st).toBe(true);
    expect(STATE_BATCHES[3].states).toContain("us-virgin-islands");
    expect(STATE_BATCHES[3].states).toContain("district-of-columbia");
  });

  it("declared pairs are the pillars' caseTypes, in serviceCaseTypePairs() order", () => {
    const pairs = declaredPairs();
    expect(pairs.length).toBe(pillarServices().reduce((n, s) => n + s.caseTypes.length, 0));
    expect(pairs).toEqual(serviceCaseTypePairs().map((p) => ({ serviceSlug: p.service.slug, typeSlug: p.caseTypeSlug })));
  });

  it("released states are a non-empty prefix of the batch order (batch A shipped in wave 2)", () => {
    const released = releasedStates();
    expect(released.length).toBeGreaterThanOrEqual(14);
    expect(STATE_BATCHES.flatMap((b) => b.states).slice(0, released.length)).toEqual(released);
    expect(STATE_BATCHES[0].released).toBe(true);
    // A later batch is never released ahead of an earlier one.
    let seenUnreleased = false;
    for (const b of STATE_BATCHES) {
      if (!b.released) seenUnreleased = true;
      else expect(seenUnreleased, `batch ${b.id} released after an unreleased batch`).toBe(false);
    }
  });

  it("isReleased needs a declared pair and a released state", () => {
    expect(isReleased("lost-earnings-and-earning-capacity", "personal-injury", "california")).toBe(true);
    expect(isReleased("business-valuation", "medical-malpractice", "california")).toBe(false);
    const unreleased = STATE_BATCHES.find((b) => !b.released)?.states[0];
    if (unreleased) expect(isReleased("lost-earnings-and-earning-capacity", "personal-injury", unreleased)).toBe(false);
    expect(isReleased("lost-earnings-and-earning-capacity", "personal-injury", "nowhere")).toBe(false);
  });
});
