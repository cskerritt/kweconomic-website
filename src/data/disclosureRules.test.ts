import { describe, expect, it } from "vitest";
import { disclosureRules, getDisclosureRule } from "./disclosureRules";

describe("disclosureRules data", () => {
  it("contains the 5 anchor states", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const anchor of ["california", "florida", "new-jersey", "new-york", "texas"]) {
      expect(slugs).toContain(anchor);
    }
  });

  it("every entry has a plain-language summary, practice notes, and at least 3 FAQs", () => {
    for (const r of disclosureRules) {
      expect(r.plainSummary.length).toBeGreaterThan(20);
      expect(r.practiceNotes.length).toBeGreaterThanOrEqual(3);
      expect(r.faqs.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("entries are citation-free (no rule numbers, statute refs, or case names)", () => {
    // Citation-free policy: avoid mis-citing risk by keeping all primary-source
    // legal references off the public site. See type docstring in disclosureRules.ts.
    const citationPatterns = [
      /\bRule\s+\d+\(/i,
      /\bR\.\s*Civ\.\s*P\./i,
      /\bCCP\s*§/i,
      /\bF\.R\.C\.P\./i,
      /\bCPLR\s*\d/i,
      /\bU\.S\.C\.\s*§/i,
      /\bDaubert\s+v\./i,
      /\bFrye\s+v\./i,
    ];
    for (const r of disclosureRules) {
      const allText = [
        r.plainSummary,
        ...r.practiceNotes,
        ...r.faqs.flatMap((f) => [f.question, f.answer]),
      ].join("\n");
      for (const pat of citationPatterns) {
        expect(allText).not.toMatch(pat);
      }
    }
  });

  it("getDisclosureRule looks up by stateSlug", () => {
    const ny = getDisclosureRule("new-york");
    expect(ny?.stateName).toBe("New York");
    expect(ny?.faqs.length).toBeGreaterThanOrEqual(3);
  });

  it("contains all expected jurisdiction slugs after Northeast batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of [
      "new-york", "new-jersey", "california", "florida", "texas",
      "massachusetts", "connecticut", "rhode-island", "vermont", "new-hampshire", "maine",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 11 disclosure rule entries after Northeast batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(11);
  });

  it("contains all expected jurisdiction slugs after Mid-Atlantic batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of ["pennsylvania", "delaware", "maryland", "district-of-columbia"]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 15 disclosure rule entries after Mid-Atlantic batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(15);
  });

  it("contains all expected jurisdiction slugs after Southeast batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of [
      "virginia", "west-virginia", "north-carolina", "south-carolina", "georgia",
      "alabama", "mississippi", "tennessee", "kentucky", "louisiana",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 25 disclosure rule entries after Southeast batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(25);
  });

  it("contains all expected jurisdiction slugs after Midwest North batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of ["ohio", "indiana", "illinois", "michigan", "wisconsin", "minnesota"]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 31 disclosure rule entries after Midwest North batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(31);
  });

  it("contains all expected jurisdiction slugs after Plains+Southwest batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of [
      "iowa", "missouri", "north-dakota", "south-dakota",
      "nebraska", "kansas", "arkansas", "oklahoma",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 39 disclosure rule entries after Plains+Southwest batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(39);
  });

  it("contains all expected jurisdiction slugs after Mountain West batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of [
      "montana", "idaho", "wyoming", "colorado", "utah", "nevada", "arizona", "new-mexico",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 47 disclosure rule entries after Mountain West batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(47);
  });

  it("contains all expected jurisdiction slugs after West Coast batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of ["washington", "oregon", "alaska", "hawaii"]) {
      expect(slugs).toContain(expected);
    }
  });

  it("has at least 51 disclosure rule entries after West Coast batch", () => {
    expect(disclosureRules.length).toBeGreaterThanOrEqual(51);
  });

  it("contains all expected jurisdiction slugs after Territories batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    for (const expected of [
      "puerto-rico", "us-virgin-islands", "guam", "american-samoa", "northern-mariana-islands",
    ]) {
      expect(slugs).toContain(expected);
    }
  });

  it("contains all 56 jurisdiction slugs after Territories batch", () => {
    const slugs = disclosureRules.map((r) => r.stateSlug);
    expect(slugs.length).toBe(56);
  });

  it("every slug from states.ts has a matching disclosureRule entry", async () => {
    const { states } = await import("./states");
    const ruleSlugs = new Set(disclosureRules.map((r) => r.stateSlug));
    const missing = states.filter((s) => !ruleSlugs.has(s.slug)).map((s) => s.slug);
    expect(missing).toEqual([]);
  });
});
