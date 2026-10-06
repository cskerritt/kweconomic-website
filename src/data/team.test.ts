import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { team, activeTeam, retainableExperts, getMemoriam } from "./team";
import { bareName, profileTitle } from "./team-meta.mjs";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";
import { practiceAreasFor, practiceAreaLabel } from "@/lib/practice-areas";
import { pillarServices } from "./services";

describe("KW Economics team", () => {
  it("has the three-person roster", () => {
    expect(team.map((m) => m.slug)).toEqual(["christopher-skerritt", "zachary-sperling", "francis-kumah"]);
    expect(getMemoriam()).toEqual([]);
    expect(activeTeam.length).toBe(3);
  });
  it("Francis Kumah is a support forensic accountant and not retainable", () => {
    const f = team.find((m) => m.slug === "francis-kumah")!;
    expect(f.title).toBe("Forensic Accountant");
    expect(f.role).toBe("support");
    expect(f.expertTier).toBeUndefined();
    expect(f.imageUrl).toBe("/team/francis-kumah.jpg");
    // The source roster's specialties; no transfer pricing specialty,
    // record, or schedule is attributed to him (review fix 2026-10-05).
    expect(f.specialties).toEqual(["Forensic Accounting", "Financial Analysis", "Economic Damages"]);
    expect(`${f.bio} ${f.fullBio ?? ""}`).not.toMatch(/transfer pricing|intercompany/i);
    expect(practiceAreasFor(f).map((s) => s.slug)).not.toContain("transfer-pricing-expert-witness");
  });
  it("a member counsel cannot retain by name never carries a role-noun practice-area label", () => {
    const tp = pillarServices().find((s) => s.slug === "transfer-pricing-expert-witness")!;
    const bv = pillarServices().find((s) => s.slug === "business-valuation")!;
    const chris = team.find((m) => m.slug === "christopher-skerritt")!;
    const francis = team.find((m) => m.slug === "francis-kumah")!;
    expect(practiceAreaLabel(chris, tp)).toBe("Transfer Pricing Expert Witness");
    expect(practiceAreaLabel(francis, tp)).toBe("Transfer Pricing");
    expect(practiceAreaLabel(francis, bv)).toBe("Business Valuation");
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
    expect(z.title).toBe("Economic Associate / Expert Liaison");
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
  // /team/:slug <title> (shared with the static shell through team-meta.mjs):
  // the person's role, never a credential, and the same string on both sides.
  it("profile titles carry the role where it fits the 60-character tag and drop the post-nominals and credentials", () => {
    expect(bareName("Christopher Skerritt, M.Ed., MBA")).toBe("Christopher Skerritt");
    expect(bareName("Zachary Sperling")).toBe("Zachary Sperling");
    for (const m of team) {
      const title = profileTitle({ name: m.name, jobTitle: m.title, memoriam: m.memoriam, orgName: ORG_NAME });
      // A compound role keeps its first half in the title; a role that still
      // cannot fit beside the name and the brand is dropped, never
      // paraphrased (team-meta.mjs).
      const withRole = `${bareName(m.name)}, ${m.title.split(" / ")[0]} | ${ORG_NAME}`;
      expect(title, m.slug).toBe(withRole.length <= 60 ? withRole : `${bareName(m.name)} | ${ORG_NAME}`);
      expect(title.startsWith(bareName(m.name)), m.slug).toBe(true);
      expect(title.endsWith(` | ${ORG_NAME}`), m.slug).toBe(true);
      for (const c of m.credentials) expect(title, `${m.slug} title spells ${c}`).not.toContain(c);
      expect(title, m.slug).not.toMatch(/[\u2013\u2014]/);
      expect(title.length, m.slug).toBeLessThanOrEqual(60);
    }
    // "Christopher Skerritt, Chief of Economic Services | KW Economics" runs
    // 63 characters, so the chief's profile carries the name alone.
    expect(
      profileTitle({ name: "Christopher Skerritt, M.Ed., MBA", jobTitle: "Chief of Economic Services", orgName: ORG_NAME }),
    ).toBe(`Christopher Skerritt | ${ORG_NAME}`);
    expect(
      profileTitle({ name: "Zachary Sperling", jobTitle: "Economic Associate / Expert Liaison", orgName: ORG_NAME }),
    ).toBe(`Zachary Sperling, Economic Associate | ${ORG_NAME}`);
    expect(
      profileTitle({ name: "Jane Roe, Ph.D.", jobTitle: "Economist", orgName: ORG_NAME }),
    ).toBe(`Jane Roe, Economist | ${ORG_NAME}`);
    expect(
      profileTitle({ name: "Jane Roe, Ph.D.", jobTitle: "Economist", memoriam: true, orgName: ORG_NAME }),
    ).toBe(`Jane Roe | In Memoriam | ${ORG_NAME}`);
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
