// Guard: every source/issuer URL in the credential, case-type, and reference
// registries is a well-formed https URL. No network here - the live-link
// sweep is a one-off curl (see the 2026-08-26 final-fix report); this test
// catches the typo class (http://, stray whitespace, missing scheme).
import { describe, expect, it } from "vitest";
import { credentials } from "./credentials";
import { caseTypes } from "./caseTypes";
import { REFERENCES } from "./references";

function collect(): { where: string; url: string }[] {
  const out: { where: string; url: string }[] = [];
  for (const c of credentials) {
    if (c.issuerUrl !== undefined) out.push({ where: `credentials/${c.slug}#issuerUrl`, url: c.issuerUrl });
    for (const s of c.sources) out.push({ where: `credentials/${c.slug}`, url: s.url });
  }
  for (const c of caseTypes) for (const s of c.sources) out.push({ where: `caseTypes/${c.slug}`, url: s.url });
  for (const [id, r] of Object.entries(REFERENCES)) out.push({ where: `references/${id}`, url: r.url });
  return out;
}

describe("source URLs are well-formed", () => {
  const all = collect();
  it("collects a meaningful set", () => {
    expect(all.length).toBeGreaterThan(50);
  });
  it("every url is https:// with no whitespace and parses as a URL", () => {
    const bad = all.filter(({ url }) => !/^https:\/\/\S+$/.test(url) || !URL.canParse(url));
    expect(bad).toEqual([]);
  });
  it("retired dead paths are gone", () => {
    const dead = all.filter(({ url }) => /ichcc\.org\/the-clcp|workers-compensation-medicare-set-aside-arrangements/.test(url));
    expect(dead).toEqual([]);
  });
});
