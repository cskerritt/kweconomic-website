import { describe, it, expect } from "vitest";
import { REFERENCES, refsToSources, type ReferenceTier } from "./references";

const TIERS: ReferenceTier[] = ["verified", "anchor", "live-verified"];
const TYPES = ["peer-reviewed", "gov", "case-law", "org"];

describe("REFERENCES registry integrity", () => {
  const entries = Object.entries(REFERENCES);

  it("covers the audit source set (~40+ entries)", () => {
    expect(entries.length).toBeGreaterThanOrEqual(40);
  });

  it("every entry is well-formed and self-consistent", () => {
    for (const [key, ref] of entries) {
      expect(ref.id, `${key} id must equal its map key`).toBe(key);
      expect(TIERS, `${key} tier`).toContain(ref.tier);
      expect(TYPES, `${key} type`).toContain(ref.type);
      expect(ref.apa.length, `${key} apa non-empty`).toBeGreaterThan(10);
      expect(ref.apa.trim().endsWith("."), `${key} apa ends with a period`).toBe(true);
      expect(ref.url.startsWith("https://"), `${key} url is https`).toBe(true);
    }
  });

  it("keeps the house style: hyphens only (no em/en dashes) in APA strings", () => {
    for (const [key, ref] of entries) {
      expect(/[–—]/.test(ref.apa), `${key} apa must not use en/em dashes`).toBe(false);
    }
  });

  it("stores no trailing bare URL in apa (the url is rendered as a separate link)", () => {
    for (const [key, ref] of entries) {
      expect(ref.apa.includes("http"), `${key} apa must not embed a URL`).toBe(false);
    }
  });

  it("has the 12 pre-verified canonical entries under tier 'verified'", () => {
    const verified = entries.filter(([, r]) => r.tier === "verified").map(([k]) => k);
    for (const id of [
      "SKOOG_CIECKA_KRUEGER_2011",
      "NCHS_LIFE_TABLES",
      "WEED_BERENS",
      "IARP_IALCP_STANDARDS",
      "CVE_STATUS",
      "SSA_HALLEX",
      "TRUTHAN_KARMAN_2003",
      "KACZKOWSKI_V_BOLUBASZ",
      "MERCADO_V_AHMED",
      "KING_ET_AL_1998",
      "BEAULIEU_V_ELLIOTT",
      "TINARI_2016",
    ]) {
      expect(verified, `${id} must be tier 'verified'`).toContain(id);
    }
    expect(verified).toHaveLength(12);
  });
});

describe("refsToSources", () => {
  it("resolves ids to Source[] carrying the APA string", () => {
    const [s] = refsToSources(["DAUBERT"]);
    expect(s.apa).toBe(REFERENCES.DAUBERT.apa);
    expect(s.url).toBe(REFERENCES.DAUBERT.url);
    expect(s.type).toBe("case-law");
    expect(s.title).toBe(REFERENCES.DAUBERT.apa);
  });

  it("preserves order and length", () => {
    const out = refsToSources(["BLS_OEWS", "ONET", "DOT"]);
    expect(out.map((s) => s.url)).toEqual([
      REFERENCES.BLS_OEWS.url,
      REFERENCES.ONET.url,
      REFERENCES.DOT.url,
    ]);
  });

  it("throws loudly on an unregistered id (anti-fabrication guard)", () => {
    expect(() => refsToSources(["NOT_A_REAL_REF"])).toThrow(/Unknown reference id/);
  });
});
