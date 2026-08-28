import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { team, activeTeam, retainableExperts, getMemoriam } from "./team";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";
import { practiceAreasFor } from "@/lib/practice-areas";

describe("KW Economics team", () => {
  it("has the two-person roster", () => {
    expect(team.map((m) => m.slug)).toEqual(["christopher-skerritt", "zachary-sperling"]);
    expect(getMemoriam()).toEqual([]);
    expect(activeTeam.length).toBe(2);
  });
  it("Christopher Skerritt leads as Chief of Economic Services", () => {
    const c = team.find((m) => m.slug === "christopher-skerritt")!;
    expect(c.title).toBe("Chief of Economic Services");
    expect(c.role).toBe("leadership");
    expect(c.expertTier).toBe("senior");
    expect(c.credentials).toEqual(expect.arrayContaining(["M.Ed.", "MBA"]));
    expect(c.statesServed).toEqual(["NJ", "NY", "MA", "VA", "RI", "CT", "PA"]);
    expect(practiceAreasFor(c).map((s) => s.slug)).toContain("lost-earnings-and-earning-capacity");
  });
  it("Zachary Sperling is support and not retainable", () => {
    const z = team.find((m) => m.slug === "zachary-sperling")!;
    expect(z.title).toBe("Economics Associate / Expert Liaison");
    expect(z.role).toBe("support");
    expect(z.expertTier).toBeUndefined();
    expect(retainableExperts().map((m) => m.slug)).toEqual(["christopher-skerritt"]);
  });
  it("no bio mentions a sister brand or claims a membership", () => {
    for (const m of team) {
      expect(`${m.bio} ${m.fullBio ?? ""}`, m.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(`${m.bio} ${m.fullBio ?? ""}`, m.slug).not.toMatch(/member of (NAFE|AAEFE)/i);
    }
  });
  it("bios are finished prose: no placeholders, no em/en dashes", () => {
    for (const m of team) {
      const text = `${m.bio} ${m.fullBio ?? ""}`;
      expect(text, m.slug).not.toMatch(/<[^>]*>|TBD|lorem/i);
      expect(text, m.slug).not.toMatch(/[\u2013\u2014]/);
    }
  });
  it("every portrait referenced by the roster is shipped with its webp sibling", () => {
    for (const m of team) {
      expect(m.imageUrl, m.slug).toMatch(/^\/team\/[a-z-]+\.jpg$/);
      const jpg = join("public", m.imageUrl!);
      expect(existsSync(jpg), jpg).toBe(true);
      expect(existsSync(jpg.replace(/\.jpg$/, ".webp")), `${jpg} webp sibling`).toBe(true);
    }
  });
});
