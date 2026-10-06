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
  // Transfer pricing primary sources (live-verified 2026-10-05).
  IRC_482: "live-verified",
  TREAS_REG_1_482_1: "live-verified",
  TREAS_REG_1_482_3: "live-verified",
  TREAS_REG_1_482_4: "live-verified",
  TREAS_REG_1_482_5: "live-verified",
  TREAS_REG_1_482_6: "live-verified",
  TREAS_REG_1_482_9: "live-verified",
  TREAS_REG_1_6662_6: "live-verified",
  TAX_COURT_RULE_143: "live-verified",
  OECD_TP_GUIDELINES: "live-verified",
  IRS_TP_EXAM_PROCESS: "live-verified",
  IRS_TP_DOCUMENTATION_FAQS: "live-verified",
  IRS_MAP_OVERVIEW: "live-verified",
  // Review fixes (2026-10-05): the treaty arbitration sentence of the
  // documentation vs. expert report comparison.
  IRS_REV_PROC_2015_40: "live-verified",
  IRS_APMA: "live-verified",
  IRS_APMA_REPORT_2025: "live-verified",
  // Intellectual property damages primary sources (live-verified 2026-10-06).
  PATENT_284: "live-verified",
  PATENT_286: "live-verified",
  PATENT_287: "live-verified",
  PATENT_289: "live-verified",
  LANHAM_ACT_1117: "live-verified",
  COPYRIGHT_504: "live-verified",
  DTSA_1836: "live-verified",
  DTSA_1838: "live-verified",
  DTSA_1839: "live-verified",
  JURISDICTION_1338: "live-verified",
  FEDERAL_CIRCUIT_1295: "live-verified",
  UNIFORM_TRADE_SECRETS_ACT: "live-verified",
  USPTO_PATENT_ESSENTIALS: "live-verified",
  USPTO_TRADE_SECRET_POLICY: "live-verified",
  GEORGIA_PACIFIC: "live-verified",
  PANDUIT: "live-verified",
  STATE_INDUSTRIES_MOR_FLO: "live-verified",
  RITE_HITE: "live-verified",
  GRAIN_PROCESSING: "live-verified",
  LUCENT_GATEWAY: "live-verified",
  UNILOC: "live-verified",
  LASERDYNAMICS: "live-verified",
  ECOFACTOR_GOOGLE: "live-verified",
  ARO_MANUFACTURING: "live-verified",
  SAMSUNG_V_APPLE: "live-verified",
  HALO_ELECTRONICS: "live-verified",
  ROMAG_FASTENERS: "live-verified",
  DEWBERRY_GROUP: "live-verified",
  ON_DAVIS_V_GAP: "live-verified",
  // Corrective advertising as trademark actual damages (pillar stage, live-verified 2026-10-06).
  BIG_O_TIRES: "live-verified",
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

  it("pins the transfer pricing sources to their primary publishers", () => {
    // The regulations link to the current eCFR text, section by section.
    for (const [id, section] of [
      ["TREAS_REG_1_482_1", "1.482-1"],
      ["TREAS_REG_1_482_3", "1.482-3"],
      ["TREAS_REG_1_482_4", "1.482-4"],
      ["TREAS_REG_1_482_5", "1.482-5"],
      ["TREAS_REG_1_482_6", "1.482-6"],
      ["TREAS_REG_1_482_9", "1.482-9"],
      ["TREAS_REG_1_6662_6", "1.6662-6"],
    ]) {
      expect(REFERENCES[id].url, id).toBe(`https://www.ecfr.gov/current/title-26/section-${section}`);
      expect(REFERENCES[id].apa, id).toMatch(new RegExp(`^Treas\\. Reg\\. sec\\. ${section.replace(".", "\\.")} \\(`));
    }
    expect(REFERENCES.IRC_482.url).toBe("https://www.law.cornell.edu/uscode/text/26/482");
    expect(REFERENCES.TAX_COURT_RULE_143.url).toMatch(/^https:\/\/ustaxcourt\.gov\/files\/documents\/rule-143\.pdf$/);
    expect(REFERENCES.OECD_TP_GUIDELINES.url).toBe("https://doi.org/10.1787/0e655865-en");
    for (const id of ["IRS_TP_EXAM_PROCESS", "IRS_TP_DOCUMENTATION_FAQS", "IRS_MAP_OVERVIEW", "IRS_REV_PROC_2015_40", "IRS_APMA", "IRS_APMA_REPORT_2025"]) {
      expect(REFERENCES[id].url, id).toMatch(/^https:\/\/www\.irs\.gov\//);
    }
    // House rule: the section sign never appears, in legal strings or anywhere else.
    for (const [key, ref] of entries) expect(ref.apa, key).not.toContain("\u00a7");
  });

  it("pins the intellectual property sources to their primary publishers and their reporter cites", () => {
    // Statutes: the U.S. Code on LII, section by section, cited "<title> U.S.C. sec. <section> (".
    for (const [id, title, section] of [
      ["PATENT_284", "35", "284"],
      ["PATENT_286", "35", "286"],
      ["PATENT_287", "35", "287"],
      ["PATENT_289", "35", "289"],
      ["LANHAM_ACT_1117", "15", "1117"],
      ["COPYRIGHT_504", "17", "504"],
      ["DTSA_1836", "18", "1836"],
      ["DTSA_1838", "18", "1838"],
      ["DTSA_1839", "18", "1839"],
      ["JURISDICTION_1338", "28", "1338"],
      ["FEDERAL_CIRCUIT_1295", "28", "1295"],
    ]) {
      expect(REFERENCES[id].url, id).toBe(`https://www.law.cornell.edu/uscode/text/${title}/${section}`);
      expect(REFERENCES[id].apa, id).toMatch(new RegExp(`^${title} U\\.S\\.C\\. sec\\. ${section} \\(`));
    }
    // Supreme Court opinions on LII (docket or volume/page paths); the U.S. Reports cite in `apa`.
    for (const [id, path, cite] of [
      ["ARO_MANUFACTURING", "377/476", "377 U.S. 476 (1964)"],
      ["SAMSUNG_V_APPLE", "15-777", "580 U.S. 53 (2016)"],
      ["HALO_ELECTRONICS", "14-1513", "579 U.S. 93 (2016)"],
      ["ROMAG_FASTENERS", "18-1233", "590 U.S. 212 (2020)"],
      ["DEWBERRY_GROUP", "23-900", "604 U.S. 321 (2025)"],
    ]) {
      expect(REFERENCES[id].url, id).toBe(`https://www.law.cornell.edu/supremecourt/text/${path}`);
      expect(REFERENCES[id].apa, id).toContain(cite);
    }
    // Courts of appeals and the district court before 2018: the Caselaw Access
    // Project page for the reporter, volume, and first page in `apa`.
    for (const [id, reporterPath, cite] of [
      ["GEORGIA_PACIFIC", "f-supp/318/html/1116-01", "318 F. Supp. 1116 (S.D.N.Y. 1970)"],
      ["PANDUIT", "f2d/575/html/1152-02", "575 F.2d 1152 (6th Cir. 1978)"],
      ["STATE_INDUSTRIES_MOR_FLO", "f2d/883/html/1573-01", "883 F.2d 1573 (Fed. Cir. 1989)"],
      ["RITE_HITE", "f3d/56/html/1538-01", "56 F.3d 1538 (Fed. Cir. 1995) (en banc)"],
      ["GRAIN_PROCESSING", "f3d/185/html/1341-01", "185 F.3d 1341 (Fed. Cir. 1999)"],
      ["LUCENT_GATEWAY", "f3d/580/html/1301-01", "580 F.3d 1301 (Fed. Cir. 2009)"],
      ["UNILOC", "f3d/632/html/1292-01", "632 F.3d 1292 (Fed. Cir. 2011)"],
      ["LASERDYNAMICS", "f3d/694/html/0051-01", "694 F.3d 51 (Fed. Cir. 2012)"],
      ["ON_DAVIS_V_GAP", "f3d/246/html/0152-01", "246 F.3d 152 (2d Cir. 2001)"],
      ["BIG_O_TIRES", "f2d/561/html/1365-01", "561 F.2d 1365 (10th Cir. 1977)"],
    ]) {
      expect(REFERENCES[id].url, id).toBe(`https://static.case.law/${reporterPath}.html`);
      expect(REFERENCES[id].apa, id).toContain(cite);
    }
    expect(REFERENCES.GEORGIA_PACIFIC.apa).toContain("modified and aff'd, 446 F.2d 295 (2d Cir. 1971)");
    // The 2025 en banc opinion on the Federal Circuit's own site.
    expect(REFERENCES.ECOFACTOR_GOOGLE.url).toMatch(/^https:\/\/www\.cafc\.uscourts\.gov\/opinions-orders\/23-1101\.OPINION\.5-21-2025_\d+\.pdf$/);
    expect(REFERENCES.ECOFACTOR_GOOGLE.apa).toContain("137 F.4th 1333 (Fed. Cir. 2025) (en banc)");
    expect(REFERENCES.UNIFORM_TRADE_SECRETS_ACT.url).toMatch(/^https:\/\/www\.uniformlaws\.org\//);
    for (const id of ["USPTO_PATENT_ESSENTIALS", "USPTO_TRADE_SECRET_POLICY"]) {
      expect(REFERENCES[id].url, id).toMatch(/^https:\/\/www\.uspto\.gov\//);
      expect(REFERENCES[id].type, id).toBe("gov");
    }
    // justia.com blocks non-browser fetches, so none of this batch links there.
    for (const id of ["GEORGIA_PACIFIC", "PANDUIT", "RITE_HITE", "UNILOC", "LASERDYNAMICS", "SAMSUNG_V_APPLE", "DEWBERRY_GROUP"]) {
      expect(REFERENCES[id].url, id).not.toContain("justia.com");
    }
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
