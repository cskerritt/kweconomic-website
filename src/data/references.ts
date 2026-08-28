import type { Source, SourceType } from "./types";

/**
 * Canonical citation registry (single source of truth for every reference that
 * ships on the site's editorial pages).
 *
 * ANTI-FABRICATION LAW
 * --------------------
 * An entry may appear here ONLY if it entered under one of three tiers, recorded
 * in the `tier` field of every entry:
 *
 *   "verified"      (a) One of the pre-verified entries in the audit's
 *                       verified-references.json (DOIs/citations confirmed live).
 *                       The kweconomics.com build (2026-08-27) pruned every entry
 *                       cited only by life-care-planning or vocational content;
 *                       2 remain (the current U.S. life tables and the
 *                       Pennsylvania total-offset decision).
 *   "anchor"        (b) An institutional/legal anchor beyond doubt: Daubert,
 *                       Frye, FRE 702, FRCP 26, BLS program pages, Census ACS.
 *   "live-verified" (c) Confirmed with a live web fetch or browser session while
 *                       building this registry (see the session log). Volumes,
 *                       pages, DOIs, reporter cites, and URLs were each checked
 *                       against an authoritative source before adding.
 *
 * A citation that cannot be backed by one of these tiers is SKIPPED, never
 * approximated. Nothing outside this registry may ship as a reference, and
 * src/data/references.test.ts fails on any registry key that no data file
 * cites (no dead entries).
 *
 * RENDERING CONVENTION
 * --------------------
 * `apa` is the reference text ONLY (period-terminated, no trailing bare URL).
 * The clickable link is `url`; SourcesBlock renders it as a trailing hyperlink.
 * This keeps each reference to exactly one link and avoids showing a DOI/URL
 * twice. Legal materials use a Bluebook-style string in `apa`.
 *
 * HOUSE RULES: objective tone, hyphens only (no em/en dashes; APA page ranges
 * use hyphens here by house rule). Page copy is citation-free: references reach
 * the reader only through SourcesBlock, never as parentheticals in prose.
 *
 * LIVE-CHECK NOTES (2026-08-27): bls.gov, cdc.gov, and justia.com return 403 to
 * non-browser fetches, so those URLs are confirmed in a headless browser
 * session; aaefe.org serves a bot challenge to curl but renders in a browser;
 * the remaining URLs were confirmed HTTP 200 with curl on the date recorded.
 */

export type ReferenceTier = "verified" | "anchor" | "live-verified";

export interface Reference {
  id: string;
  /** Full APA 7 reference (Bluebook string for legal materials). No trailing URL. */
  apa: string;
  /** Canonical link, rendered by SourcesBlock as a trailing hyperlink. */
  url: string;
  type: SourceType;
  tier: ReferenceTier;
}

const R = (
  id: string,
  tier: ReferenceTier,
  type: SourceType,
  apa: string,
  url: string,
): Reference => ({ id, tier, type, apa, url });

export const REFERENCES: Record<string, Reference> = {
  // ---------------------------------------------------------------------------
  // TIER (a) VERIFIED - surviving canonical entries from verified-references.json
  // ---------------------------------------------------------------------------
  NCHS_LIFE_TABLES: R(
    "NCHS_LIFE_TABLES",
    "verified",
    "gov",
    "Arias, E., Xu, J., & Kochanek, K. D. (2025). United States life tables, 2023. National Vital Statistics Reports, 74(6), 1-63. National Center for Health Statistics.",
    "https://doi.org/10.15620/cdc/174591",
  ),
  KACZKOWSKI_V_BOLUBASZ: R(
    "KACZKOWSKI_V_BOLUBASZ",
    "verified",
    "case-law",
    "Kaczkowski v. Bolubasz, 491 Pa. 561, 421 A.2d 1027 (1980).",
    "https://law.justia.com/cases/pennsylvania/supreme-court/1980/491-pa-561-0.html",
  ),

  // ---------------------------------------------------------------------------
  // TIER (b) ANCHOR - institutional/legal anchors beyond doubt
  // ---------------------------------------------------------------------------
  // Legal anchors
  DAUBERT: R(
    "DAUBERT",
    "anchor",
    "case-law",
    "Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993).",
    "https://supreme.justia.com/cases/federal/us/509/579/",
  ),
  FRYE: R(
    "FRYE",
    "anchor",
    "case-law",
    "Frye v. United States, 293 F. 1013 (D.C. Cir. 1923).",
    "https://law.justia.com/cases/federal/appellate-courts/F/293/1013/",
  ),
  FRE_702: R(
    "FRE_702",
    "anchor",
    "case-law",
    "Fed. R. Evid. 702.",
    "https://www.law.cornell.edu/rules/fre/rule_702",
  ),
  FRCP_26: R(
    "FRCP_26",
    "anchor",
    "case-law",
    "Fed. R. Civ. P. 26.",
    "https://www.law.cornell.edu/rules/frcp/rule_26",
  ),
  // BLS program pages (browser-confirmed; bls.gov blocks non-browser fetches)
  BLS_CPS: R(
    "BLS_CPS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Current Population Survey (CPS). U.S. Department of Labor.",
    "https://www.bls.gov/cps/",
  ),
  BLS_OES: R(
    "BLS_OES",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Occupational Employment and Wage Statistics (OEWS). U.S. Department of Labor.",
    "https://www.bls.gov/oes/",
  ),
  BLS_ECEC: R(
    "BLS_ECEC",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Employer Costs for Employee Compensation (ECEC). U.S. Department of Labor.",
    "https://www.bls.gov/ecec/",
  ),
  BLS_ATUS: R(
    "BLS_ATUS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). American Time Use Survey (ATUS). U.S. Department of Labor.",
    "https://www.bls.gov/tus/",
  ),
  BLS_CEX: R(
    "BLS_CEX",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Consumer Expenditure Surveys (CE). U.S. Department of Labor.",
    "https://www.bls.gov/cex/",
  ),
  BLS_ECI: R(
    "BLS_ECI",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Employment Cost Index (ECI). U.S. Department of Labor.",
    "https://www.bls.gov/eci/",
  ),
  BLS_CPI: R(
    "BLS_CPI",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Consumer Price Index (CPI). U.S. Department of Labor.",
    "https://www.bls.gov/cpi/",
  ),
  BLS_CPI_MEDICAL: R(
    "BLS_CPI_MEDICAL",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Consumer Price Index: Medical care [Fact sheet]. U.S. Department of Labor.",
    "https://www.bls.gov/cpi/factsheets/medical-care.htm",
  ),
  // Census
  CENSUS_ACS: R(
    "CENSUS_ACS",
    "anchor",
    "gov",
    "U.S. Census Bureau. (n.d.). American Community Survey (ACS). U.S. Department of Commerce.",
    "https://www.census.gov/programs-surveys/acs",
  ),

  // ---------------------------------------------------------------------------
  // TIER (c) LIVE-VERIFIED - confirmed via web fetch/browser during this build
  // ---------------------------------------------------------------------------
  // Supreme Court (Daubert trilogy siblings + present value)
  KUMHO_TIRE: R(
    "KUMHO_TIRE",
    "live-verified",
    "case-law",
    "Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999).",
    "https://supreme.justia.com/cases/federal/us/526/137/",
  ),
  GE_JOINER: R(
    "GE_JOINER",
    "live-verified",
    "case-law",
    "General Electric Co. v. Joiner, 522 U.S. 136 (1997).",
    "https://supreme.justia.com/cases/federal/us/522/136/",
  ),
  JONES_LAUGHLIN_PFEIFER: R(
    "JONES_LAUGHLIN_PFEIFER",
    "live-verified",
    "case-law",
    "Jones & Laughlin Steel Corp. v. Pfeifer, 462 U.S. 523 (1983).",
    "https://supreme.justia.com/cases/federal/us/462/523/",
  ),
  // Secondary authority
  RESTATEMENT_TORTS_920A: R(
    "RESTATEMENT_TORTS_920A",
    "live-verified",
    "case-law",
    "Restatement (Second) of Torts sec. 920A (Am. L. Inst. 1979).",
    "https://www.law.cornell.edu/wex/collateral_source_rule",
  ),
  // Federal government program pages
  TREASURY_YIELD: R(
    "TREASURY_YIELD",
    "live-verified",
    "gov",
    "U.S. Department of the Treasury. (n.d.). Daily Treasury par yield curve rates.",
    "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve",
  ),
  CDC_LIFE_TABLES: R(
    "CDC_LIFE_TABLES",
    "live-verified",
    "gov",
    "National Center for Health Statistics. (n.d.). Life tables. Centers for Disease Control and Prevention. Retrieved August 26, 2026.",
    "https://www.cdc.gov/nchs/products/life_tables.htm",
  ),
  // Peer-reviewed journals. The DOI below was resolved live on 2026-08-27 to
  // the Journal of Forensic Economics volume 22, issue 2 article beginning at
  // page 165 (the extended Markov worklife tables).
  SKOOG_CIECKA_KRUEGER_2011: R(
    "SKOOG_CIECKA_KRUEGER_2011",
    "live-verified",
    "peer-reviewed",
    "Skoog, G. R., Ciecka, J. E., & Krueger, K. V. (2011). The Markov process model of labor force activity: Extended tables of central tendency, shape, percentile points, and bootstrap standard errors. Journal of Forensic Economics, 22(2), 165-229.",
    "https://doi.org/10.5085/jfe.22.2.165",
  ),
  // Professional bodies and standards (forensic economics, accounting,
  // valuation). nafe.net canonicalizes to the bare host; the URLs below are
  // the final (non-redirecting) forms.
  NAFE: R(
    "NAFE",
    "live-verified",
    "org",
    "National Association of Forensic Economics. (n.d.). National Association of Forensic Economics. Retrieved August 27, 2026.",
    "https://nafe.net/",
  ),
  NAFE_ETHICS: R(
    "NAFE_ETHICS",
    "live-verified",
    "org",
    "National Association of Forensic Economics. (n.d.). NAFE's ethics statement. Retrieved August 27, 2026.",
    "https://nafe.net/ethics/",
  ),
  NAFE_JFE: R(
    "NAFE_JFE",
    "live-verified",
    "org",
    "National Association of Forensic Economics. (n.d.). Journal of Forensic Economics. Retrieved August 27, 2026.",
    "https://nafe.net/journal-of-forensic-economics/",
  ),
  AAEFE: R(
    "AAEFE",
    "live-verified",
    "org",
    "American Academy of Economic and Financial Experts. (n.d.). American Academy of Economic and Financial Experts. Retrieved August 27, 2026.",
    "https://aaefe.org/",
  ),
  AAEFE_JLE: R(
    "AAEFE_JLE",
    "live-verified",
    "org",
    "American Academy of Economic and Financial Experts. (n.d.). Journal of Legal Economics. Retrieved August 27, 2026.",
    "https://aaefe.org/journal-of-legal-economics/",
  ),
  AICPA_SSVS1: R(
    "AICPA_SSVS1",
    "live-verified",
    "org",
    "American Institute of Certified Public Accountants. (n.d.). Statement on Standards for Valuation Services (VS Section 100). AICPA & CIMA. Retrieved August 27, 2026.",
    "https://www.aicpa-cima.com/resources/download/statement-on-standards-for-valuation-services-vs-section-100",
  ),
  NACVA_STANDARDS: R(
    "NACVA_STANDARDS",
    "live-verified",
    "org",
    "National Association of Certified Valuators and Analysts. (n.d.). NACVA professional standards and ethics. Retrieved August 27, 2026.",
    "https://www.nacva.com/standards",
  ),
  ACFE: R(
    "ACFE",
    "live-verified",
    "org",
    "Association of Certified Fraud Examiners. (n.d.). Association of Certified Fraud Examiners. Retrieved August 27, 2026.",
    "https://www.acfe.com/",
  ),
};

/**
 * Resolve a list of registry ids to `Source[]` for a SourcesBlock. Throws on an
 * unknown id so a typo fails the build/tests loudly - an unregistered reference
 * can never ship (anti-fabrication law). `title` mirrors the APA text; it is only
 * used by SourcesBlock's non-APA fallback path, which registry sources never hit.
 */
export function refsToSources(ids: string[]): Source[] {
  return ids.map((id) => {
    const ref = REFERENCES[id];
    if (!ref) {
      throw new Error(
        `Unknown reference id "${id}". Add it to src/data/references.ts under a valid tier, or remove the citation.`,
      );
    }
    return { title: ref.apa, url: ref.url, type: ref.type, apa: ref.apa };
  });
}
