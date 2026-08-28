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
 *                       The kwlcp.com build (2026-08-26) pruned every entry
 *                       cited only by vocational/economic content; 4 remain.
 *   "anchor"        (b) An institutional/legal anchor beyond doubt: Daubert,
 *                       Frye, FRE 702, FRCP 26, BLS program pages, O*NET, DOT,
 *                       SSA, CDC/NCHS, Census ACS, CRCC, ABVE, ICHCC, IARP.
 *   "live-verified" (c) Confirmed with a live web search/fetch while building
 *                       this registry (see the session log). Volumes, pages,
 *                       DOIs, reporter cites, statute sections and URLs were each
 *                       checked against an authoritative source before adding.
 *
 * A citation that cannot be backed by one of these tiers is SKIPPED, never
 * approximated. Nothing outside this registry may ship as a reference.
 *
 * RENDERING CONVENTION
 * --------------------
 * `apa` is the reference text ONLY (period-terminated, no trailing bare URL).
 * The clickable link is `url`; SourcesBlock renders it as a trailing hyperlink.
 * This keeps each reference to exactly one link and avoids showing a DOI/URL
 * twice. Legal materials use a Bluebook-style string in `apa`.
 *
 * HOUSE RULES: objective tone, hyphens only (no em/en dashes; APA page ranges
 * use hyphens here by house rule).
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
  WEED_BERENS: R(
    "WEED_BERENS",
    "verified",
    "peer-reviewed",
    "Weed, R. O., & Berens, D. E. (Eds.). (2018). Life care planning and case management handbook (4th ed.). Routledge.",
    "https://doi.org/10.4324/9781315157283",
  ),
  IARP_IALCP_STANDARDS: R(
    "IARP_IALCP_STANDARDS",
    "live-verified",
    "org",
    "Reavis, S. L. (2002). Standards of practice. Journal of Life Care Planning, 1(1), 49-57. International Academy of Life Care Planners / International Association of Rehabilitation Professionals.",
    "https://doi.org/10.70385/001c.151342",
  ),
  KACZKOWSKI_V_BOLUBASZ: R(
    "KACZKOWSKI_V_BOLUBASZ",
    "verified",
    "case-law",
    "Kaczkowski v. Bolubasz, 491 Pa. 561, 421 A.2d 1027 (1980).",
    "https://law.justia.com/cases/pennsylvania/supreme-court/1980/491-pa-561-0.html",
  ),
  KING_ET_AL_1998: R(
    "KING_ET_AL_1998",
    "verified",
    "peer-reviewed",
    "King, P. M., Tuckwell, N., & Barrett, T. E. (1998). A critical review of functional capacity evaluations. Physical Therapy, 78(8), 852-866.",
    "https://doi.org/10.1093/ptj/78.8.852",
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
  // BLS program pages
  BLS_CPI_MEDICAL: R(
    "BLS_CPI_MEDICAL",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Consumer Price Index: Medical care [Fact sheet]. U.S. Department of Labor.",
    "https://www.bls.gov/cpi/factsheets/medical-care.htm",
  ),
  // O*NET / DOT
  // SSA
  // Census
  // Credentialing / professional bodies
  ICHCC_CLCP: R(
    "ICHCC_CLCP",
    "anchor",
    "org",
    "International Commission on Health Care Certification. (n.d.). Certified Life Care Planner (CLCP). Retrieved August 26, 2026.",
    "https://www.ichcc.org/certified-life-care-planner-clcp.html",
  ),
  IARP: R(
    "IARP",
    "anchor",
    "org",
    "International Association of Rehabilitation Professionals. (n.d.). Standards and ethics: Forensic section. Retrieved July 19, 2026.",
    "https://rehabpro.org/",
  ),

  // ---------------------------------------------------------------------------
  // TIER (c) LIVE-VERIFIED - confirmed via web search/fetch during this build
  // ---------------------------------------------------------------------------
  // Supreme Court (Daubert trilogy siblings + present-value)
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
  // SSA regulations / rulings (section numbers and titles confirmed on eCFR)
  // Statutes / secondary authority
  RESTATEMENT_TORTS_920A: R(
    "RESTATEMENT_TORTS_920A",
    "live-verified",
    "case-law",
    "Restatement (Second) of Torts sec. 920A (Am. L. Inst. 1979).",
    "https://www.law.cornell.edu/wex/collateral_source_rule",
  ),
  MSP_1395Y: R(
    "MSP_1395Y",
    "live-verified",
    "case-law",
    "Medicare Secondary Payer, 42 U.S.C. sec. 1395y(b) (2018).",
    "https://www.law.cornell.edu/uscode/text/42/1395y",
  ),
  // Federal government program pages
  TREASURY_YIELD: R(
    "TREASURY_YIELD",
    "live-verified",
    "gov",
    "U.S. Department of the Treasury. (n.d.). Daily Treasury par yield curve rates.",
    "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve",
  ),
  CMS_PFS: R(
    "CMS_PFS",
    "live-verified",
    "gov",
    "Centers for Medicare & Medicaid Services. (n.d.). Physician fee schedule. U.S. Department of Health and Human Services.",
    "https://www.cms.gov/medicare/payment/fee-schedules/physician",
  ),
  CMS_MSP: R(
    "CMS_MSP",
    "live-verified",
    "gov",
    "Centers for Medicare & Medicaid Services. (n.d.). Medicare secondary payer. U.S. Department of Health and Human Services.",
    "https://www.cms.gov/medicare/coordination-benefits-recovery/overview",
  ),
  AHRQ_GUIDELINES: R(
    "AHRQ_GUIDELINES",
    "live-verified",
    "gov",
    "Agency for Healthcare Research and Quality. (n.d.). Clinical guidelines and recommendations. U.S. Department of Health and Human Services.",
    "https://www.ahrq.gov/prevention/guidelines/index.html",
  ),
  // Peer-reviewed journals / scholarly texts
  MOFFETT_MOORE_2011: R(
    "MOFFETT_MOORE_2011",
    "live-verified",
    "peer-reviewed",
    "Moffett, P., & Moore, G. (2011). The standard of care: Legal history and definitions: The bad and good news. Western Journal of Emergency Medicine, 12(1), 109-112.",
    "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3088386/",
  ),
  AOTA_OTPF_2020: R(
    "AOTA_OTPF_2020",
    "live-verified",
    "peer-reviewed",
    "American Occupational Therapy Association. (2020). Occupational therapy practice framework: Domain and process (4th ed.). American Journal of Occupational Therapy, 74(Suppl. 2), 7412410010.",
    "https://doi.org/10.5014/ajot.2020.74S2001",
  ),
  GENOVESE_GALPER_2009: R(
    "GENOVESE_GALPER_2009",
    "live-verified",
    "peer-reviewed",
    "Genovese, E., & Galper, J. S. (Eds.). (2009). Guide to the evaluation of functional ability: How to request, interpret, and apply functional capacity evaluations. American Medical Association.",
    "https://search.worldcat.org/search?q=bn:9781603590013",
  ),
  AMA_GUIDES_IMPAIRMENT: R(
    "AMA_GUIDES_IMPAIRMENT",
    "live-verified",
    "peer-reviewed",
    "American Medical Association. (2023). AMA guides to the evaluation of permanent impairment (6th ed.). American Medical Association.",
    "https://www.ama-assn.org/practice-management/ama-guides",
  ),
  // Professional organizations
  CMSA_STANDARDS_2022: R(
    "CMSA_STANDARDS_2022",
    "live-verified",
    "org",
    "Case Management Society of America. (2022). Standards of practice for case management (Rev. 2022). CMSA.",
    "https://cmsa.org/about/standards-of-case-management-practice/",
  ),
  CCMC: R(
    "CCMC",
    "live-verified",
    "org",
    "Commission for Case Manager Certification. (n.d.). Certified Case Manager (CCM) certification. Retrieved July 19, 2026.",
    "https://ccmcertification.org/",
  ),
  ABMS: R(
    "ABMS",
    "live-verified",
    "org",
    "American Board of Medical Specialties. (n.d.). ABMS board certification. Retrieved July 19, 2026.",
    "https://www.abms.org/board-certification/",
  ),
  FAIR_HEALTH: R(
    "FAIR_HEALTH",
    "live-verified",
    "org",
    "FAIR Health. (n.d.). FAIR Health. Retrieved July 19, 2026.",
    "https://www.fairhealth.org/",
  ),
  // ---------------------------------------------------------------------------
  // NOTE on IARP_IALCP_STANDARDS: the current (4th, 2022) edition is sold by
  // IARP (rehabpro.org/page/IALCP-standards-purchase) and rehabpro.org returns
  // 403 to non-browser fetches, so no current-edition URL could be verified.
  // The registry therefore cites the open-access founding edition (Reavis,
  // 2002) that the linked PDF actually is. Do not describe it as the 4th ed.
  // ---------------------------------------------------------------------------
  // LCP-SITE ADDITIONS (2026-08-26) - each URL fetched with curl and confirmed
  // HTTP 200 on the date recorded before entry.
  // ---------------------------------------------------------------------------
  AANLCP_SCOPE: R(
    "AANLCP_SCOPE",
    "live-verified",
    "org",
    "American Association of Nurse Life Care Planners. (n.d.). Nurse life care planning standards of practice. Retrieved August 26, 2026.",
    "https://www.aanlcp.org/nurse-life-care-planning-standards-of-practice/",
  ),
  CMS_WCMSA_GUIDE: R(
    "CMS_WCMSA_GUIDE",
    "live-verified",
    "gov",
    "Centers for Medicare & Medicaid Services. (2026). Workers' compensation Medicare set-aside arrangement (WCMSA) reference guide (Version 4.6). U.S. Department of Health and Human Services.",
    "https://www.cms.gov/files/document/wcmsa-reference-guide-version-4-6-july-13-2026.pdf",
  ),
  CMS_WCMSA: R(
    "CMS_WCMSA",
    "live-verified",
    "gov",
    "Centers for Medicare & Medicaid Services. (n.d.). Workers' compensation Medicare set aside arrangements. U.S. Department of Health and Human Services. Retrieved August 26, 2026.",
    "https://www.cms.gov/medicare/coordination-benefits-recovery/workers-comp-set-aside-arrangements",
  ),
  CDC_LIFE_TABLES: R(
    "CDC_LIFE_TABLES",
    "live-verified",
    "gov",
    "National Center for Health Statistics. (n.d.). Life tables. Centers for Disease Control and Prevention. Retrieved August 26, 2026.",
    "https://www.cdc.gov/nchs/products/life_tables.htm",
  ),
  // ---------------------------------------------------------------------------
  // KW ECONOMICS ADDITIONS (2026-08-27) - forensic economics, accounting, and
  // valuation anchors used by src/data/caseTypes.ts. BLS program pages and the
  // Census ACS are tier (b) anchors; each was still confirmed HTTP 200 on the
  // date recorded (BLS and CDC return 403 to non-browser fetches, so those were
  // confirmed in a headless browser session; the rest with curl). Professional
  // bodies and standards pages are tier (c), fetched and title-checked the
  // same day. nafe.net canonicalizes to the bare host; the URLs below are the
  // final (non-redirecting) forms.
  // ---------------------------------------------------------------------------
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
  CENSUS_ACS: R(
    "CENSUS_ACS",
    "anchor",
    "gov",
    "U.S. Census Bureau. (n.d.). American Community Survey (ACS). U.S. Department of Commerce.",
    "https://www.census.gov/programs-surveys/acs",
  ),
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
