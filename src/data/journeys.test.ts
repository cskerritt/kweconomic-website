import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { journeys } from "./journeys";
import { caseTypes } from "./caseTypes";
import { guides } from "./guides";
import { team } from "./team";
import { LEGACY_BRAND_PATTERN } from "@/lib/brand";
import {
  ATTORNEY_STAGES,
  STAGE_SLUGS,
  STAGE_LABELS,
  STAGE_GUIDES,
  CASE_TYPE_SHORT_NAMES,
  caseTypeShortName,
  journeyHeading,
  journeyTitle,
  journeyDescription,
  stageIndexHeading,
  stageIndexTitle,
  stageIndexDescription,
  stageIndexIntro,
  TITLE_SUFFIX,
  TITLE_MAX,
  SHORT_NAME_MAX,
  DESCRIPTION_MIN,
  DESCRIPTION_MAX,
} from "@/lib/attorney-stages";

const STAGES = ["considering", "retaining", "preparing-deposition", "trial"] as const;
const SOURCE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "journeys.ts"), "utf8");

// Sister-discipline vocabulary this family never uses. The one permitted
// hand-off form ("coordinated with a vocational specialist") is capped at one
// line per stage by src/pages/off-brand-copy.test.mjs; the data-level check
// below applies the same cap so a new FAQ cannot add a second.
const BANNED = /vocational evaluation|vocational expert|transferable skills|labor market survey|life care planner|CLCP|CNLCP/i;
const HANDOFF = /coordinated? with (a|the) vocational specialist/g;
// Citation-free prose: statute and rule numbers travel through references.ts.
const CITATION = /\bRule \d|\bSection \d|U\.S\.C\.|C\.F\.R\.|\bFed\. R\./;
const DASHES = /[–—§]/;

describe("attorney journeys", () => {
  it("covers every stage for every case type exactly once", () => {
    const keys = journeys.map((j) => `${j.stage}/${j.caseTypeSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const c of caseTypes) for (const s of STAGES) expect(keys, `${s}/${c.slug}`).toContain(`${s}/${c.slug}`);
    expect(journeys.length).toBe(STAGES.length * caseTypes.length);
  });

  it("each stage entry is complete and economics-framed", () => {
    for (const j of journeys) {
      const id = `${j.stage}/${j.caseTypeSlug}`;
      expect(j.intro.length, id).toBeGreaterThan(200);
      expect(j.checklist.length, id).toBeGreaterThanOrEqual(3);
      expect(j.questionsToAsk.length, id).toBeGreaterThanOrEqual(3);
      expect(j.requiredDocuments.length, id).toBeGreaterThanOrEqual(3);
      expect(j.pitfalls.length, id).toBeGreaterThanOrEqual(2);
      expect(j.faqs.length, id).toBeGreaterThanOrEqual(2);
      expect(j.sources.length, id).toBeGreaterThanOrEqual(1);
      expect(j.datePublished, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(j.dateModified, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(j.dateModified >= j.datePublished, `${id} modified before published`).toBe(true);
      expect(team.some((m) => m.slug === j.authorSlug), `${id} authorSlug ${j.authorSlug} not in team.ts`).toBe(true);
      const text = JSON.stringify(j);
      expect(text, id).not.toMatch(LEGACY_BRAND_PATTERN);
      expect(text, id).not.toMatch(DASHES);
      expect(text, id).not.toMatch(BANNED);
      // Body copy only: registry APA strings (sources) may name a standard's section.
      expect(JSON.stringify({ ...j, sources: [] }), id).not.toMatch(CITATION);
    }
  });

  it("FAQ answers are self-contained plain prose (no link markers, no citations, no sister vocabulary)", () => {
    for (const j of journeys) {
      const id = `${j.stage}/${j.caseTypeSlug}`;
      const questions = j.faqs.map((f) => f.question);
      expect(new Set(questions).size, `${id} repeats a question`).toBe(questions.length);
      for (const f of j.faqs) {
        const where = `${id}: ${f.question}`;
        expect(f.question.trim().endsWith("?"), where).toBe(true);
        expect(f.answer.length, where).toBeGreaterThanOrEqual(120);
        expect(f.answer.length, where).toBeLessThanOrEqual(700);
        expect(f.answer, where).not.toContain("[[");
        expect(f.answer, where).not.toMatch(DASHES);
        expect(f.answer, where).not.toMatch(BANNED);
        expect(f.answer, where).not.toMatch(CITATION);
        expect(f.answer, where).not.toMatch(/\$\d|\d+%/);
      }
    }
  });

  it("keeps the vocational hand-off line to at most one per stage", () => {
    for (const s of STAGES) {
      const text = journeys
        .filter((j) => j.stage === s)
        .map((j) => JSON.stringify(j))
        .join("\n");
      expect((text.match(HANDOFF) ?? []).length, s).toBeLessThanOrEqual(1);
    }
  });

  it("stores datePublished and dateModified as literals on every entry (no shared constant)", () => {
    expect(SOURCE).not.toMatch(/const MODIFIED\b/);
    expect(SOURCE).not.toMatch(/dateModified: [A-Z_]+,/);
    expect((SOURCE.match(/^ {4}dateModified: "\d{4}-\d{2}-\d{2}",$/gm) ?? []).length).toBe(journeys.length);
    expect((SOURCE.match(/^ {4}datePublished: "\d{4}-\d{2}-\d{2}",$/gm) ?? []).length).toBe(journeys.length);
    expect((SOURCE.match(/^ {4}authorSlug: "[a-z-]+",$/gm) ?? []).length).toBe(journeys.length);
  });

  it("cites no organization homepage as a source (the NAFE site is not an attributed reference)", () => {
    for (const j of journeys) {
      for (const s of j.sources) {
        expect(s.url, `${j.stage}/${j.caseTypeSlug}`).not.toMatch(/^https:\/\/nafe\.net\/?$/);
      }
    }
  });
});

describe("attorney stage module", () => {
  it("declares the four stages the data uses, in journey order, and names the economist", () => {
    expect(STAGE_SLUGS).toEqual([...STAGES]);
    expect(ATTORNEY_STAGES.map((s) => s.slug)).toEqual([...STAGES]);
    expect(STAGE_LABELS.considering).toMatch(/Economist/);
    expect(STAGE_LABELS.retaining).toMatch(/Economist/);
    for (const s of ATTORNEY_STAGES) {
      expect(s.label).not.toMatch(/Expert/);
      expect(s.label).not.toMatch(DASHES);
    }
  });

  it("maps every stage to a guide that exists in guides.ts", () => {
    for (const s of STAGES) {
      const slug = STAGE_GUIDES[s];
      expect(slug, `${s} has no stage guide`).toBeTruthy();
      expect(guides.some((g) => g.slug === slug), `${s} guide ${slug} not in guides.ts`).toBe(true);
    }
  });

  it("short case-type names cover every long name and key real case types", () => {
    // 60-char title, 15-char brand suffix, 25-char longest stage phrase.
    expect(SHORT_NAME_MAX).toBe(20);
    const slugs = new Set(caseTypes.map((c) => c.slug));
    for (const [slug, short] of Object.entries(CASE_TYPE_SHORT_NAMES)) {
      expect(slugs.has(slug), `short name for unknown case type ${slug}`).toBe(true);
      expect(short.length, slug).toBeLessThanOrEqual(SHORT_NAME_MAX);
      expect(short, slug).not.toMatch(DASHES);
    }
    for (const c of caseTypes) {
      expect(caseTypeShortName(c).length, `${c.slug} needs a short name`).toBeLessThanOrEqual(SHORT_NAME_MAX);
    }
  });

  it("journey headings, titles, and descriptions fit the title and description bands on all 56 pages", () => {
    // The family shares the site's editorial title ceiling; never raise it here.
    expect(TITLE_MAX).toBeLessThanOrEqual(60);
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const s of STAGES) {
      for (const c of caseTypes) {
        const id = `${s}/${c.slug}`;
        const heading = journeyHeading(s, c);
        const title = journeyTitle(s, c);
        const description = journeyDescription(s, c);
        expect(heading, id).toContain(caseTypeShortName(c));
        expect(heading, id).toMatch(/Economist/);
        expect(title, id).toBe(`${heading}${TITLE_SUFFIX}`);
        expect(title.endsWith(" | KW Economics"), id).toBe(true);
        expect(title.length, `${id} title ${title.length} chars`).toBeLessThanOrEqual(TITLE_MAX);
        expect(description.length, `${id} description ${description.length} chars`).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
        expect(description.length, `${id} description ${description.length} chars`).toBeLessThanOrEqual(DESCRIPTION_MAX);
        expect(description.endsWith("Plaintiff and defense."), id).toBe(true);
        expect(description, id).toMatch(/economist/);
        // No mismatched indefinite article ("a employment", "an personal").
        expect(description, id).not.toMatch(/\ba [aeiou]|\ban [bcdfghjklmnpqrstvwxyz]/i);
        for (const text of [heading, title, description]) {
          expect(text, id).not.toMatch(DASHES);
          expect(text, id).not.toMatch(BANNED);
          expect(text, id).not.toMatch(/Expert/);
        }
        titles.add(title);
        descriptions.add(description);
      }
    }
    expect(titles.size).toBe(STAGES.length * caseTypes.length);
    expect(descriptions.size).toBe(STAGES.length * caseTypes.length);
    expect(journeyHeading("not-a-stage", caseTypes[0])).toBe("");
    expect(journeyTitle("not-a-stage", caseTypes[0])).toBe("");
  });

  it("stage index heading, title, description, and intro fit their bands", () => {
    for (const s of STAGES) {
      const heading = stageIndexHeading(s);
      const title = stageIndexTitle(s);
      const description = stageIndexDescription(s);
      const intro = stageIndexIntro(s);
      expect(heading, s).toMatch(/Economist/);
      expect(heading, s).toMatch(/by Case Type$/);
      expect(title, s).toBe(`${heading}${TITLE_SUFFIX}`);
      expect(title.length, `${s} title ${title.length} chars`).toBeLessThanOrEqual(TITLE_MAX);
      expect(description.length, `${s} description ${description.length} chars`).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
      expect(description.length, `${s} description ${description.length} chars`).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(description.endsWith("Plaintiff and defense."), s).toBe(true);
      expect(intro.length, s).toBeGreaterThan(100);
      for (const text of [heading, title, description, intro]) {
        expect(text, s).not.toMatch(DASHES);
        expect(text, s).not.toMatch(BANNED);
        expect(text, s).not.toMatch(LEGACY_BRAND_PATTERN);
      }
    }
    expect(stageIndexHeading("not-a-stage")).toBe("");
    expect(stageIndexTitle("not-a-stage")).toBe("");
  });
});
