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
 *   "verified"      (a) One of the 12 pre-verified entries in the audit's
 *                       verified-references.json (DOIs/citations confirmed live).
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
  // TIER (a) VERIFIED - the 12 canonical entries from verified-references.json
  // ---------------------------------------------------------------------------
  SKOOG_CIECKA_KRUEGER_2011: R(
    "SKOOG_CIECKA_KRUEGER_2011",
    "verified",
    "peer-reviewed",
    "Skoog, G. R., Ciecka, J. E., & Krueger, K. V. (2011). The Markov process model of labor force activity: Extended tables of central tendency, shape, percentile points, and bootstrap standard errors. Journal of Forensic Economics, 22(2), 165-229.",
    "https://doi.org/10.5085/jfe.22.2.165",
  ),
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
    "verified",
    "org",
    "International Academy of Life Care Planners. (2022). Standards of practice for life care planners (4th ed.). International Association of Rehabilitation Professionals.",
    "https://member.aanlcp.org/wp-content/uploads/2023/03/IALCP-Standards-of-Practice-2022-4th-ed.pdf",
  ),
  CVE_STATUS: R(
    "CVE_STATUS",
    "verified",
    "org",
    "Commission on Rehabilitation Counselor Certification. (n.d.). Certified Vocational Evaluation Specialist (CVE). Retrieved July 19, 2026.",
    "https://crccertification.com/cve-certification/",
  ),
  SSA_HALLEX: R(
    "SSA_HALLEX",
    "verified",
    "gov",
    "Soc. Sec. Admin., Hearings, Appeals & Litigation Law Manual (HALLEX) I-2-6-74, Testimony of a Vocational Expert (last updated Jan. 6, 2025).",
    "https://www.ssa.gov/OP_Home/hallex/I-02/I-2-6-74.html",
  ),
  TRUTHAN_KARMAN_2003: R(
    "TRUTHAN_KARMAN_2003",
    "verified",
    "peer-reviewed",
    "Truthan, J. A., & Karman, S. E. (2003). Transferable skills analysis and vocational information in a time of transition. Journal of Forensic Vocational Analysis, 6(1), 17-25.",
    "https://skilltran.com/pubs/TSAReferenceList.htm",
  ),
  KACZKOWSKI_V_BOLUBASZ: R(
    "KACZKOWSKI_V_BOLUBASZ",
    "verified",
    "case-law",
    "Kaczkowski v. Bolubasz, 491 Pa. 561, 421 A.2d 1027 (1980).",
    "https://law.justia.com/cases/pennsylvania/supreme-court/1980/491-pa-561-0.html",
  ),
  MERCADO_V_AHMED: R(
    "MERCADO_V_AHMED",
    "verified",
    "case-law",
    "Mercado v. Ahmed, 974 F.2d 863, 868 (7th Cir. 1992).",
    "https://openjurist.org/974/f2d/863",
  ),
  KING_ET_AL_1998: R(
    "KING_ET_AL_1998",
    "verified",
    "peer-reviewed",
    "King, P. M., Tuckwell, N., & Barrett, T. E. (1998). A critical review of functional capacity evaluations. Physical Therapy, 78(8), 852-866.",
    "https://doi.org/10.1093/ptj/78.8.852",
  ),
  BEAULIEU_V_ELLIOTT: R(
    "BEAULIEU_V_ELLIOTT",
    "verified",
    "case-law",
    "Beaulieu v. Elliott, 434 P.2d 665 (Alaska 1967).",
    "https://law.justia.com/cases/alaska/supreme-court/1967/434-p-2d-665-1.html",
  ),
  TINARI_2016: R(
    "TINARI_2016",
    "verified",
    "peer-reviewed",
    "Tinari, F. D. (Ed.). (2016). Forensic economics: Assessing personal damages in civil litigation. Palgrave Macmillan.",
    "https://doi.org/10.1057/978-1-137-56392-7",
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
  BLS_OEWS: R(
    "BLS_OEWS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Occupational Employment and Wage Statistics (OEWS). U.S. Department of Labor.",
    "https://www.bls.gov/oes/",
  ),
  BLS_ATUS: R(
    "BLS_ATUS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). American Time Use Survey (ATUS). U.S. Department of Labor.",
    "https://www.bls.gov/tus/",
  ),
  BLS_OOH: R(
    "BLS_OOH",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Occupational Outlook Handbook. U.S. Department of Labor.",
    "https://www.bls.gov/ooh/",
  ),
  BLS_EMP_PROJECTIONS: R(
    "BLS_EMP_PROJECTIONS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Employment projections. U.S. Department of Labor.",
    "https://www.bls.gov/emp/",
  ),
  BLS_ECEC: R(
    "BLS_ECEC",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Employer costs for employee compensation (ECEC). U.S. Department of Labor.",
    "https://www.bls.gov/ect/",
  ),
  BLS_CPS: R(
    "BLS_CPS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Current Population Survey (CPS). U.S. Department of Labor.",
    "https://www.bls.gov/cps/",
  ),
  BLS_LAUS: R(
    "BLS_LAUS",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Local Area Unemployment Statistics (LAUS). U.S. Department of Labor.",
    "https://www.bls.gov/lau/",
  ),
  BLS_CEX: R(
    "BLS_CEX",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Consumer Expenditure Surveys. U.S. Department of Labor.",
    "https://www.bls.gov/cex/",
  ),
  BLS_BDM: R(
    "BLS_BDM",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Business employment dynamics. U.S. Department of Labor.",
    "https://www.bls.gov/bdm/",
  ),
  BLS_CPI_MEDICAL: R(
    "BLS_CPI_MEDICAL",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Consumer Price Index: Medical care [Fact sheet]. U.S. Department of Labor.",
    "https://www.bls.gov/cpi/factsheets/medical-care.htm",
  ),
  BLS_ECI: R(
    "BLS_ECI",
    "anchor",
    "gov",
    "U.S. Bureau of Labor Statistics. (n.d.). Employment cost index (ECI). U.S. Department of Labor.",
    "https://www.bls.gov/eci/",
  ),
  // O*NET / DOT
  ONET: R(
    "ONET",
    "anchor",
    "gov",
    "National Center for O*NET Development. (n.d.). O*NET OnLine. U.S. Department of Labor, Employment and Training Administration.",
    "https://www.onetonline.org/",
  ),
  ONET_CENTER: R(
    "ONET_CENTER",
    "anchor",
    "gov",
    "National Center for O*NET Development. (n.d.). About O*NET. U.S. Department of Labor, Employment and Training Administration.",
    "https://www.onetcenter.org/overview.html",
  ),
  DOT: R(
    "DOT",
    "anchor",
    "gov",
    "U.S. Department of Labor, Employment and Training Administration. (1991). Dictionary of occupational titles (4th ed., rev.). U.S. Government Printing Office.",
    "https://www.dol.gov/agencies/oalj/topics/libraries/LIBDOT",
  ),
  // SSA
  SSA_BLUEBOOK: R(
    "SSA_BLUEBOOK",
    "anchor",
    "gov",
    "Social Security Administration. (2024). Disability evaluation under Social Security (SSA Publication No. 64-039).",
    "https://www.ssa.gov/disability/professionals/bluebook/",
  ),
  SSA_POMS: R(
    "SSA_POMS",
    "anchor",
    "gov",
    "Social Security Administration. (n.d.). Program Operations Manual System (POMS).",
    "https://secure.ssa.gov/poms.nsf/",
  ),
  // Census
  CENSUS_ACS: R(
    "CENSUS_ACS",
    "anchor",
    "gov",
    "U.S. Census Bureau. (n.d.). American Community Survey (ACS).",
    "https://www.census.gov/programs-surveys/acs",
  ),
  // Credentialing / professional bodies
  CRCC: R(
    "CRCC",
    "anchor",
    "org",
    "Commission on Rehabilitation Counselor Certification. (n.d.). Certified Rehabilitation Counselor (CRC) certification. Retrieved July 19, 2026.",
    "https://crccertification.com/",
  ),
  CRCC_ETHICS: R(
    "CRCC_ETHICS",
    "anchor",
    "org",
    "Commission on Rehabilitation Counselor Certification. (2023). Code of professional ethics for rehabilitation counselors.",
    "https://crccertification.com/code-of-ethics-3/",
  ),
  ABVE: R(
    "ABVE",
    "anchor",
    "org",
    "American Board of Vocational Experts. (n.d.). Diplomate (ABVE/D) certification. Retrieved July 19, 2026.",
    "https://www.abve.net/",
  ),
  ICHCC_CLCP: R(
    "ICHCC_CLCP",
    "anchor",
    "org",
    "International Commission on Health Care Certification. (n.d.). The Certified Life Care Planner (CLCP) certification. Retrieved July 19, 2026.",
    "https://www.ichcc.org/the-clcp",
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
  CFR_404_1520: R(
    "CFR_404_1520",
    "live-verified",
    "case-law",
    "Evaluation of disability in general, 20 C.F.R. sec. 404.1520 (2024).",
    "https://www.ecfr.gov/current/title-20/chapter-III/part-404/subpart-P/section-404.1520",
  ),
  CFR_404_1560: R(
    "CFR_404_1560",
    "live-verified",
    "case-law",
    "When we will consider your vocational background, 20 C.F.R. sec. 404.1560 (2024).",
    "https://www.ecfr.gov/current/title-20/chapter-III/part-404/subpart-P/section-404.1560",
  ),
  CFR_404_1568: R(
    "CFR_404_1568",
    "live-verified",
    "case-law",
    "Skill requirements, 20 C.F.R. sec. 404.1568 (2024).",
    "https://www.ecfr.gov/current/title-20/chapter-III/part-404/subpart-P/section-404.1568",
  ),
  SSR_00_4P: R(
    "SSR_00_4P",
    "live-verified",
    "case-law",
    "SSR 00-4p, 65 Fed. Reg. 75759 (Dec. 4, 2000) (rescinded eff. Jan. 6, 2025 by SSR 24-3p).",
    "https://www.federalregister.gov/documents/2000/12/04/00-30701/social-security-ruling-ssr-00-4p-titles-ii-and-xvi-use-of-vocational-expert-and-vocational",
  ),
  // Statutes / secondary authority
  REHAB_ACT_1973: R(
    "REHAB_ACT_1973",
    "live-verified",
    "case-law",
    "Rehabilitation Act of 1973, Pub. L. No. 93-112, 87 Stat. 355 (codified as amended at 29 U.S.C. sec. 701-796l).",
    "https://www.law.cornell.edu/uscode/text/29/701",
  ),
  RESTATEMENT_TORTS_920A: R(
    "RESTATEMENT_TORTS_920A",
    "live-verified",
    "case-law",
    "Restatement (Second) of Torts sec. 920A (Am. L. Inst. 1979).",
    "https://www.law.cornell.edu/wex/collateral_source_rule",
  ),
  RESTATEMENT_TORTS_924: R(
    "RESTATEMENT_TORTS_924",
    "live-verified",
    "case-law",
    "Restatement (Second) of Torts sec. 924 (Am. L. Inst. 1979).",
    "https://www.ali.org/publications/show/torts/",
  ),
  ADA_1990: R(
    "ADA_1990",
    "live-verified",
    "case-law",
    "Americans with Disabilities Act of 1990, 42 U.S.C. sec. 12101-12213 (2018).",
    "https://www.ada.gov/law-and-regs/ada/",
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
    "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/",
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
    "https://www.cms.gov/medicare/coordination-benefits-recovery-overview",
  ),
  IRS_SCHEDULE_C: R(
    "IRS_SCHEDULE_C",
    "live-verified",
    "gov",
    "Internal Revenue Service. (n.d.). About Schedule C (Form 1040), profit or loss from business. U.S. Department of the Treasury.",
    "https://www.irs.gov/forms-pubs/about-schedule-c-form-1040",
  ),
  RSA_ED: R(
    "RSA_ED",
    "live-verified",
    "gov",
    "Rehabilitation Services Administration. (n.d.). About RSA. U.S. Department of Education.",
    "https://rsa.ed.gov/about",
  ),
  EPA_VSL: R(
    "EPA_VSL",
    "live-verified",
    "gov",
    "U.S. Environmental Protection Agency. (n.d.). Mortality risk valuation.",
    "https://www.epa.gov/environmental-economics/mortality-risk-valuation",
  ),
  AHRQ_GUIDELINES: R(
    "AHRQ_GUIDELINES",
    "live-verified",
    "gov",
    "Agency for Healthcare Research and Quality. (n.d.). Clinical guidelines and recommendations. U.S. Department of Health and Human Services.",
    "https://www.ahrq.gov/prevention/guidelines/index.html",
  ),
  SCODDOT: R(
    "SCODDOT",
    "live-verified",
    "gov",
    "U.S. Department of Labor, Employment and Training Administration. (1991). Selected characteristics of occupations defined in the revised Dictionary of Occupational Titles. U.S. Government Printing Office.",
    "https://www.dol.gov/agencies/oalj/topics/libraries/LIBDOT",
  ),
  // Peer-reviewed journals / scholarly texts
  VISCUSI_ALDY_2003: R(
    "VISCUSI_ALDY_2003",
    "live-verified",
    "peer-reviewed",
    "Viscusi, W. K., & Aldy, J. E. (2003). The value of a statistical life: A critical review of market estimates throughout the world. Journal of Risk and Uncertainty, 27(1), 5-76.",
    "https://doi.org/10.1023/A:1025598106257",
  ),
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
  PATTON_NELSON_1991: R(
    "PATTON_NELSON_1991",
    "live-verified",
    "peer-reviewed",
    "Patton, R. T., & Nelson, D. M. (1991). Estimating personal consumption costs in wrongful death cases. Journal of Forensic Economics, 4(2), 233-240.",
    "https://bioone.org/journals/journal-of-forensic-economics",
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
  EXPECTANCY_DATA_DVOD: R(
    "EXPECTANCY_DATA_DVOD",
    "live-verified",
    "org",
    "Expectancy Data. (2023). The dollar value of a day: 2023 edition. Expectancy Data.",
    "https://www.expectancydata.com/",
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
