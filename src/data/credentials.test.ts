import { describe, expect, it } from "vitest";
import { credentials, getCredential } from "./credentials";
import { states } from "./states";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";

describe("economics credentials", () => {
  it("has exactly the 4 forensic-economics credential pages", () => {
    expect(credentials.map((c) => c.slug).sort()).toEqual(["aaefe-member","forensic-economist","graduate-economics-degree","nafe-member"]);
  });
  it("each has scope, >=3 requirements, >=2 faqs, and full state coverage", () => {
    for (const c of credentials) {
      expect(c.scope.length, c.slug).toBeGreaterThan(100);
      expect(c.requirements.length, c.slug).toBeGreaterThanOrEqual(3);
      expect(c.faqs.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const st of states) expect(c.stateReciprocity[st.slug], `${c.slug}/${st.slug}`).toBe("na");
      expect(c.expertSlugs.every((s) => s === "christopher-skerritt"), c.slug).toBe(true);
    }
  });
  it("membership pages never assert that a named person is a member", () => {
    for (const c of credentials.filter((c) => c.slug.endsWith("-member"))) {
      expect(`${c.scope} ${c.admissibilityHistory}`).not.toMatch(/Skerritt|Sperling/);
      expect(c.expertSlugs).toEqual([]);
    }
  });

  // House rules shared with caseTypes.test.ts: economist's standpoint, no
  // sister-brand forms, no LCP/vocational vocabulary, hyphens only, no cites.
  it("copy stays economics-framed, citation-free, and hyphen-only", () => {
    for (const c of credentials) {
      const text = [
        c.name,
        c.abbreviation,
        c.scope,
        c.admissibilityHistory,
        ...c.requirements,
        ...c.faqs.map((f) => `${f.question} ${f.answer}`),
      ].join(" ");
      expect(text, c.slug).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, c.slug).not.toMatch(
        /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i,
      );
      expect(text, c.slug).not.toMatch(/[–—§]/);
      expect(text, c.slug).not.toMatch(/\b(Rule|Fed\. R\.|U\.S\.C\.|F\.3d|F\. Supp)\b/);
      expect(text, c.slug).not.toMatch(/member of (NAFE|AAEFE)/i);
      expect(c.sources.length, c.slug).toBeGreaterThanOrEqual(1);
      for (const s of c.sources) expect(s.apa, `${c.slug} source ${s.url} must come from the registry`).toBeTruthy();
    }
    expect(getCredential("clcp")).toBeUndefined();
    expect(getCredential("forensic-economist")?.expertSlugs).toEqual(["christopher-skerritt"]);
  });

  // Schema.org credentialCategory: the membership pages say "It is not a
  // certification" in their own copy, and the JSON-LD must agree.
  it("carries a schema category that is never a certification", () => {
    expect(Object.fromEntries(credentials.map((c) => [c.slug, c.category]))).toEqual({
      "forensic-economist": "Professional Qualification",
      "nafe-member": "Professional Membership",
      "aaefe-member": "Professional Membership",
      "graduate-economics-degree": "Academic Degree",
    });
    for (const c of credentials) expect(c.category, c.slug).not.toMatch(/certif|licen/i);
  });
});
