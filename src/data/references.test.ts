import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { REFERENCES, refsToSources, type ReferenceTier } from "./references";

const TIERS: ReferenceTier[] = ["verified", "anchor", "live-verified"];
const TYPES = ["peer-reviewed", "gov", "case-law", "org"];

// The economics registry keys the editorial, case-type, credential, journey,
// and geo content may cite (plan Task 7 "Interfaces"), with the tier each
// entered under.
const ECONOMICS_KEYS: Record<string, ReferenceTier> = {
  DAUBERT: "anchor",
  FRYE: "anchor",
  FRE_702: "anchor",
  FRCP_26: "anchor",
  BLS_CPS: "anchor",
  BLS_OES: "anchor",
  BLS_ECEC: "anchor",
  BLS_ATUS: "anchor",
  BLS_CEX: "anchor",
  BLS_ECI: "anchor",
  BLS_CPI: "anchor",
  BLS_CPI_MEDICAL: "anchor",
  CENSUS_ACS: "anchor",
  TREASURY_YIELD: "live-verified",
  NAFE: "live-verified",
  NAFE_ETHICS: "live-verified",
  NAFE_JFE: "live-verified",
  AAEFE: "live-verified",
  AAEFE_JLE: "live-verified",
  AICPA_SSVS1: "live-verified",
  NACVA_STANDARDS: "live-verified",
  ACFE: "live-verified",
  SKOOG_CIECKA_KRUEGER_2011: "live-verified",
  JONES_LAUGHLIN_PFEIFER: "live-verified",
  KUMHO_TIRE: "live-verified",
  GE_JOINER: "live-verified",
  RESTATEMENT_TORTS_920A: "live-verified",
  KACZKOWSKI_V_BOLUBASZ: "verified",
  NCHS_LIFE_TABLES: "verified",
  CDC_LIFE_TABLES: "live-verified",
};

// Life-care-planning-only and vocational-only sources have no place on an
// economics site; the sister-site builds carried them and this build prunes them.
const PRUNED = [
  "WEED_BERENS",
  "IARP_IALCP_STANDARDS",
  "ICHCC_CLCP",
  "IARP",
  "AANLCP_SCOPE",
  "CMS_WCMSA_GUIDE",
  "CMS_WCMSA",
  "CMS_PFS",
  "CMS_MSP",
  "MSP_1395Y",
  "AHRQ_GUIDELINES",
  "MOFFETT_MOORE_2011",
  "AOTA_OTPF_2020",
  "GENOVESE_GALPER_2009",
  "AMA_GUIDES_IMPAIRMENT",
  "CMSA_STANDARDS_2022",
  "CCMC",
  "ABMS",
  "FAIR_HEALTH",
  "KING_ET_AL_1998",
  "ONET",
  "DOT",
  "BLS_OEWS",
  "ABVE",
  "CVE_STATUS",
  "CRCC",
  "SSA_POMS",
  "TRUTHAN_KARMAN_2003",
];

const DATA_DIR = dirname(fileURLToPath(import.meta.url));

function walk(dir: string, out: string[] = []): string[] {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|mjs)$/.test(f) && !/\.test\./.test(f) && f !== "references.ts") out.push(p);
  }
  return out;
}

describe("REFERENCES registry integrity", () => {
  const entries = Object.entries(REFERENCES);

  it("covers the economics source set (~30 entries after the LCP prune)", () => {
    expect(entries.length).toBeGreaterThanOrEqual(28);
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

  it("carries every economics key under its recorded tier", () => {
    for (const [id, tier] of Object.entries(ECONOMICS_KEYS)) {
      expect(REFERENCES[id], `${id} present`).toBeDefined();
      expect(REFERENCES[id].tier, `${id} tier`).toBe(tier);
    }
  });

  it("pins the worklife table citation to its confirmed DOI and the NAFE pages to the canonical host", () => {
    expect(REFERENCES.SKOOG_CIECKA_KRUEGER_2011.url).toBe("https://doi.org/10.5085/jfe.22.2.165");
    expect(REFERENCES.SKOOG_CIECKA_KRUEGER_2011.apa).toMatch(/^Skoog, G\. R\., Ciecka, J\. E\., & Krueger, K\. V\. \(2011\)/);
    expect(REFERENCES.SKOOG_CIECKA_KRUEGER_2011.apa).toMatch(/Journal of Forensic Economics, 22\(2\), 165-229\./);
    for (const id of ["NAFE", "NAFE_ETHICS", "NAFE_JFE"]) expect(REFERENCES[id].url).toMatch(/^https:\/\/nafe\.net\//);
    expect(REFERENCES.AAEFE_JLE.url).toMatch(/^https:\/\/aaefe\.org\//);
  });

  it("no longer carries life-care-planning-only or vocational-only sources", () => {
    for (const id of PRUNED) {
      expect(REFERENCES[id], `${id} should be pruned`).toBeUndefined();
    }
  });

  it("every registry key is cited by at least one data file (no dead entries)", () => {
    const corpus = walk(DATA_DIR)
      .map((p) => readFileSync(p, "utf8"))
      .join("\n");
    for (const [key] of entries) {
      expect(corpus.includes(`"${key}"`), `${key} is cited nowhere under src/data`).toBe(true);
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
    const out = refsToSources(["BLS_CPS", "NAFE_ETHICS", "TREASURY_YIELD"]);
    expect(out.map((s) => s.url)).toEqual([
      REFERENCES.BLS_CPS.url,
      REFERENCES.NAFE_ETHICS.url,
      REFERENCES.TREASURY_YIELD.url,
    ]);
  });

  it("throws loudly on an unregistered id (anti-fabrication guard)", () => {
    expect(() => refsToSources(["NOT_A_REAL_REF"])).toThrow(/Unknown reference id/);
  });
});
