import { describe, it, expect } from "vitest";
import { REFERENCES, refsToSources, type ReferenceTier } from "./references";

const TIERS: ReferenceTier[] = ["verified", "anchor", "live-verified"];
const TYPES = ["peer-reviewed", "gov", "case-law", "org"];

describe("REFERENCES registry integrity", () => {
  const entries = Object.entries(REFERENCES);

  it("covers the LCP source set (~30+ entries after the vocational prune)", () => {
    expect(entries.length).toBeGreaterThanOrEqual(30);
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

  it("keeps the surviving pre-verified canonical entries under tier 'verified'", () => {
    const verified = entries.filter(([, r]) => r.tier === "verified").map(([k]) => k);
    for (const id of [
      "NCHS_LIFE_TABLES",
      "WEED_BERENS",
      "KACZKOWSKI_V_BOLUBASZ",
      "KING_ET_AL_1998",
    ]) {
      expect(verified, `${id} must be tier 'verified'`).toContain(id);
    }
    expect(verified).toHaveLength(4);
  });

  it("carries the LCP standards and government sources added for kwlcp.com", () => {
    for (const id of ["IARP_IALCP_STANDARDS", "AANLCP_SCOPE", "CMS_WCMSA_GUIDE", "CMS_WCMSA", "CDC_LIFE_TABLES", "NCHS_LIFE_TABLES", "ICHCC_CLCP"]) {
      expect(REFERENCES[id], `${id} present`).toBeDefined();
    }
    // The IALCP standards PDF moved; the registry must point at the live host.
    expect(REFERENCES.IARP_IALCP_STANDARDS.url).toMatch(/^https:\/\/jlcp\.scholasticahq\.com\//);
  });

  it("no longer carries vocational-only sources", () => {
    for (const id of ["ONET", "DOT", "BLS_OEWS", "ABVE", "CVE_STATUS", "CRCC", "SSA_POMS", "TRUTHAN_KARMAN_2003", "SKOOG_CIECKA_KRUEGER_2011"]) {
      expect(REFERENCES[id], `${id} should be pruned`).toBeUndefined();
    }
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
    const out = refsToSources(["CMS_WCMSA_GUIDE", "AANLCP_SCOPE", "CDC_LIFE_TABLES"]);
    expect(out.map((s) => s.url)).toEqual([
      REFERENCES.CMS_WCMSA_GUIDE.url,
      REFERENCES.AANLCP_SCOPE.url,
      REFERENCES.CDC_LIFE_TABLES.url,
    ]);
  });

  it("throws loudly on an unregistered id (anti-fabrication guard)", () => {
    expect(() => refsToSources(["NOT_A_REAL_REF"])).toThrow(/Unknown reference id/);
  });
});
