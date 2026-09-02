import { describe, expect, it } from "vitest";
import { credentials, getCredential, credentialStateAngle, credentialStateHeadings } from "./credentials";
import { states } from "./states";
import { LEGACY_BRAND_PATTERN, ORG_NAME } from "@/lib/brand";

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
        c.metaTitle,
        c.metaDescription,
        c.whatItEstablishes,
        c.stateLead,
        c.stateAngle,
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

// Any phrasing that attributes a credential to the firm's economists (same
// pattern as credential-claims.render.test.tsx).
const FIRM_LEVEL_CLAIM = /economists holding|holding (NAFE|AAEFE)|planners holding|(our|KW Economics) (economists|experts) (are|hold|belong)/i;
// Doubled articles ("a the District of Columbia") and an indefinite article
// in front of a capitalized vowel-initial name ("a Alabama matter"). Letters
// pronounced with a leading vowel (F, H, L, M, N, R, S, X: "an MBA") are
// left out of the consonant class.
const DOUBLED_ARTICLE = /\b(a|an|the) (a|an|the)\b/i;
const MISARTICLED = /\ba [AEIO]\w|\ban [BCDGJKPQTVWYZ]\w/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("credential hub SERP fields", () => {
  it("metaTitle fits the SERP, carries the brand, and never calls a role or a membership a credential", () => {
    for (const c of credentials) {
      expect(c.metaTitle.length, c.slug).toBeLessThanOrEqual(60);
      expect(c.metaTitle.endsWith(` | ${ORG_NAME}`), c.slug).toBe(true);
      expect(c.metaTitle, c.slug).not.toMatch(/Credential \|/);
      expect(c.metaTitle.split(" | ").length, c.slug).toBe(2);
    }
    // The membership titles read as an affiliation even out of context.
    expect(getCredential("nafe-member")!.metaTitle).toBe(`What NAFE Membership Establishes | ${ORG_NAME}`);
    expect(getCredential("aaefe-member")!.metaTitle).toBe(`What AAEFE Membership Establishes | ${ORG_NAME}`);
  });

  it("metaDescription fits the SERP and ends with an answer, never an ellipsis", () => {
    for (const c of credentials) {
      expect(c.metaDescription.length, c.slug).toBeGreaterThan(100);
      expect(c.metaDescription.length, c.slug).toBeLessThanOrEqual(160);
      expect(c.metaDescription, c.slug).toMatch(/\.$/);
      expect(c.metaDescription, c.slug).not.toMatch(/…|\.\.\./);
      expect(c.metaDescription, c.slug).not.toMatch(FIRM_LEVEL_CLAIM);
    }
  });

  it("carries ISO dates for the byline", () => {
    for (const c of credentials) {
      expect(c.datePublished, c.slug).toMatch(ISO_DATE);
      expect(c.dateModified, c.slug).toMatch(ISO_DATE);
      expect(c.dateModified >= c.datePublished, c.slug).toBe(true);
    }
  });
});

describe("credential x state headings", () => {
  it("are keyed on the category and take the attributive place form in attributive slots", () => {
    expect(credentialStateHeadings(getCredential("forensic-economist")!, "District of Columbia")).toEqual({
      title: `Forensic Economist Qualifications in the District of Columbia | ${ORG_NAME}`,
      h1: "Forensic Economist Qualifications for District of Columbia Damages Cases",
      description: "What the forensic economist qualification establishes, how District of Columbia courts weigh it, and how to retain a forensic economist there.",
    });
    expect(credentialStateHeadings(getCredential("nafe-member")!, "Texas")).toEqual({
      title: `NAFE Membership and Texas Damages Testimony | ${ORG_NAME}`,
      h1: "NAFE Membership and Texas Damages Testimony",
      description: "What NAFE membership establishes, how Texas courts weigh it, and how to retain a forensic economist there.",
    });
    expect(credentialStateHeadings(getCredential("aaefe-member")!, "New Jersey").h1).toBe("AAEFE Membership and New Jersey Damages Testimony");
    const degree = credentialStateHeadings(getCredential("graduate-economics-degree")!, "New York");
    expect(degree.title).toBe(`Graduate Economics Credentials in New York | ${ORG_NAME}`);
    expect(degree.h1).toBe("Graduate Economics Credentials for New York Damages Cases");
    expect(degree.description).toBe("What graduate economics and MBA degrees establish, how New York courts weigh it, and how to retain a forensic economist there.");
  });

  it("fit the SERP and read cleanly for every credential and every jurisdiction", () => {
    for (const c of credentials) {
      for (const st of states) {
        const h = credentialStateHeadings(c, st.name);
        const label = `${c.slug}/${st.slug}`;
        expect(h.title.length, label).toBeLessThanOrEqual(80);
        expect(h.title.endsWith(` | ${ORG_NAME}`), label).toBe(true);
        expect(h.title, label).not.toMatch(/Credential in/);
        expect(h.description.length, label).toBeLessThanOrEqual(160);
        expect(h.description, label).not.toContain("forensic economists available");
        const all = `${h.title} ${h.h1} ${h.description}`;
        expect(all, label).not.toMatch(DOUBLED_ARTICLE);
        expect(all, label).not.toMatch(MISARTICLED);
        expect(all, label).not.toMatch(/for the District of Columbia Damages|how the District of Columbia courts/);
        expect(all, label).not.toMatch(/[–—§]/);
      }
    }
  });
});

describe("credential x state paragraph", () => {
  it("resolves both place tokens for every jurisdiction and stays membership-neutral", () => {
    for (const c of credentials) {
      expect(c.stateAngle, c.slug).toMatch(/\{place\}/);
      expect(c.stateAngle.length, c.slug).toBeGreaterThan(300);
      expect(c.stateLead, c.slug).toMatch(/\.$/);
      expect(c.whatItEstablishes, c.slug).toMatch(/establish(es)?$/);
      for (const st of states) {
        const text = credentialStateAngle(c, st.name);
        const label = `${c.slug}/${st.slug}`;
        expect(text, label).not.toMatch(/\{place(Attr)?\}/);
        expect(text, label).not.toMatch(FIRM_LEVEL_CLAIM);
        expect(text, label).not.toMatch(/Skerritt|Sperling/);
        expect(text, label).not.toMatch(DOUBLED_ARTICLE);
        expect(text, label).not.toMatch(MISARTICLED);
        expect(text, label).not.toMatch(/[–—§]/);
      }
      const dc = credentialStateAngle(c, "District of Columbia");
      expect(dc, c.slug).toContain("the District of Columbia");
      expect(dc, c.slug).not.toMatch(/a the District|the the District/);
    }
  });

  it("differs by credential for the same state, so the state tier is credential-specific", () => {
    const texts = credentials.map((c) => credentialStateAngle(c, "Texas"));
    expect(new Set(texts).size).toBe(credentials.length);
  });

  it("membership copy describes verification and the ethics statement, never the roster", () => {
    for (const slug of ["nafe-member", "aaefe-member"]) {
      const text = credentialStateAngle(getCredential(slug)!, "Texas");
      expect(text, slug).toMatch(/verified with the association|confirmed with the academy/);
      expect(text, slug).toMatch(/at engagement/);
      expect(text, slug).not.toMatch(/our members?\b|the roster|is a member/i);
    }
    expect(credentialStateAngle(getCredential("nafe-member")!, "Texas")).toContain("ethics statement");
  });
});
