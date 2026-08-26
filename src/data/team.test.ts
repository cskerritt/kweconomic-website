import { describe, expect, it } from "vitest";
import { team, activeTeam, retainableExperts, getMemoriam } from "./team";

describe("KW LCP team", () => {
  it("has the LCP roster", () => {
    expect(team.map((m) => m.slug).sort()).toEqual(["abigail-wolstein","cara-creighton","charles-kincaid","christina-rivera","christopher-skerritt","daniel-wolstein","danielle-vallone","jesse-wolstein","lizette-mendoza","matthew-putts","paul-bourgeois","rebecca-wolstein"]);
  });
  it("Jesse Wolstein leads as Chief Medical Director & Life Care Planner", () => {
    const j = team.find((m) => m.slug === "jesse-wolstein")!;
    expect(j.title).toBe("Chief Medical Director & Life Care Planner");
    expect(j.credentials).toContain("CLCP");
    expect(j.bio).toMatch(/board-certified emergency medicine physician/);
  });
  it("Christopher Skerritt carries MSCC for the MSA practice", () => {
    expect(team.find((m) => m.slug === "christopher-skerritt")!.credentials).toContain("MSCC");
  });
  it("memoriam is excluded from active and retainable lists", () => {
    expect(getMemoriam().map((m) => m.slug)).toEqual(["charles-kincaid"]);
    expect(activeTeam.some((m) => m.memoriam)).toBe(false);
    expect(retainableExperts().some((m) => m.memoriam)).toBe(false);
  });
  it("no bio mentions the vocational brand", () => {
    for (const m of team) expect(`${m.bio} ${m.fullBio ?? ""}`, m.slug).not.toMatch(/KWVRS|Kincaid Wolstein Vocational/);
  });
});
