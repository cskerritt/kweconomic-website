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
 *
 * LIVE-CHECK NOTES (2026-10-05, transfer pricing sources): the eCFR section
 * permalinks (ecfr.gov/current/title-26/section-<n>) return HTTP 200 after
 * eCFR's own redirect to the section's canonical page, and each page's title
 * was matched to the section heading in `apa`; law.cornell.edu, irs.gov, and
 * ustaxcourt.gov returned HTTP 200 with curl and the cited text was read on
 * the page or in the PDF. The OECD DOI resolves through doi.org to the OECD
 * publication page, which serves a bot challenge to curl; its title, date,
 * and DOI were confirmed in a headless browser session and in the Crossref
 * registration record.
 *
 * LIVE-CHECK NOTES (2026-10-06, intellectual property damages sources): every
 * URL below returned HTTP 200 with curl on that date and the cited text was
 * read on the page or in the PDF. The statutes link to the U.S. Code on
 * law.cornell.edu, and each page's title was matched to the section heading
 * in `apa`; the Supreme Court opinions link to law.cornell.edu, whose pages
 * carry the slip opinion, so each U.S. Reports volume and first page was
 * confirmed through CourtListener's citation resolver
 * (courtlistener.com/c/U.S./<vol>/<page>/), which redirected to the named
 * case. The court of appeals and district court opinions decided before
 * 2018 link to the Caselaw Access Project of the Harvard Law School Library
 * (static.case.law), whose metadata confirmed the reporter, volume, first
 * page, court, and decision date of each; the Federal Circuit's 2025 en banc
 * opinion links to the court's own PDF, and its F.4th cite was confirmed
 * through the same resolver. justia.com still blocks non-browser fetches,
 * which is why these entries do not use it. The Uniform Trade Secrets Act
 * links to the Uniform Law Commission's final act page, whose attached PDF
 * (the act with the 1985 amendments and comments) was read; the USPTO pages
 * were read on uspto.gov.
 *
 * LIVE-CHECK NOTES (2026-10-06, intellectual property review fixes): the added
 * statutes (17 U.S.C. 412 and 1502; 28 U.S.C. 1332, 1367, 1400, and 1498)
 * link to LII, returned HTTP 200 with curl, and each page's title was matched
 * to the section heading in `apa`. CSIRO, Exmark (decided January 12, 2018),
 * and Sands, Taylor & Wood link to the Caselaw Access Project, whose pages
 * carry the reporter, court, and decision date, and their cites resolved
 * through CourtListener's citation resolver to the named cases. The three
 * trade secret opinions decided after 2018 link to the U.S. Courts
 * collection on govinfo.gov (the Government Publishing Office), whose PDFs
 * returned HTTP 200 and were read; the Second Circuit's own links are
 * session-bound, so govinfo serves all three. The Texas statute's public
 * page renders the chapter text from the Legislature's statute service,
 * where section 134A.004 and its amendment history were read.
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
  // Transfer pricing primary sources (live-verified 2026-10-05; see the
  // LIVE-CHECK NOTES above). The statute and the Treasury regulations are
  // legal materials, cited Bluebook-style with "sec." in place of the section
  // sign (house rule); the regulations link to the current eCFR text.
  IRC_482: R(
    "IRC_482",
    "live-verified",
    "case-law",
    "26 U.S.C. sec. 482 (allocation of income and deductions among taxpayers).",
    "https://www.law.cornell.edu/uscode/text/26/482",
  ),
  TREAS_REG_1_482_1: R(
    "TREAS_REG_1_482_1",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.482-1 (allocation of income and deductions among taxpayers).",
    "https://www.ecfr.gov/current/title-26/section-1.482-1",
  ),
  TREAS_REG_1_482_3: R(
    "TREAS_REG_1_482_3",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.482-3 (methods to determine taxable income in connection with a transfer of tangible property).",
    "https://www.ecfr.gov/current/title-26/section-1.482-3",
  ),
  TREAS_REG_1_482_4: R(
    "TREAS_REG_1_482_4",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.482-4 (methods to determine taxable income in connection with a transfer of intangible property).",
    "https://www.ecfr.gov/current/title-26/section-1.482-4",
  ),
  TREAS_REG_1_482_5: R(
    "TREAS_REG_1_482_5",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.482-5 (comparable profits method).",
    "https://www.ecfr.gov/current/title-26/section-1.482-5",
  ),
  TREAS_REG_1_482_6: R(
    "TREAS_REG_1_482_6",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.482-6 (profit split method).",
    "https://www.ecfr.gov/current/title-26/section-1.482-6",
  ),
  TREAS_REG_1_482_9: R(
    "TREAS_REG_1_482_9",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.482-9 (methods to determine taxable income in connection with a controlled services transaction).",
    "https://www.ecfr.gov/current/title-26/section-1.482-9",
  ),
  TREAS_REG_1_6662_6: R(
    "TREAS_REG_1_6662_6",
    "live-verified",
    "case-law",
    "Treas. Reg. sec. 1.6662-6 (transactions between persons described in section 482 and net section 482 transfer price adjustments).",
    "https://www.ecfr.gov/current/title-26/section-1.6662-6",
  ),
  TAX_COURT_RULE_143: R(
    "TAX_COURT_RULE_143",
    "live-verified",
    "case-law",
    "Tax Ct. R. Prac. & Proc. 143(g) (expert witness reports).",
    "https://ustaxcourt.gov/files/documents/rule-143.pdf",
  ),
  OECD_TP_GUIDELINES: R(
    "OECD_TP_GUIDELINES",
    "live-verified",
    "org",
    "OECD. (2022). OECD transfer pricing guidelines for multinational enterprises and tax administrations 2022. OECD Publishing.",
    "https://doi.org/10.1787/0e655865-en",
  ),
  IRS_TP_EXAM_PROCESS: R(
    "IRS_TP_EXAM_PROCESS",
    "live-verified",
    "gov",
    "Internal Revenue Service. (2020). Transfer pricing examination process (Publication 5300, Rev. 9-2020). U.S. Department of the Treasury.",
    "https://www.irs.gov/pub/irs-pdf/p5300.pdf",
  ),
  IRS_TP_DOCUMENTATION_FAQS: R(
    "IRS_TP_DOCUMENTATION_FAQS",
    "live-verified",
    "gov",
    "Internal Revenue Service. (n.d.). Transfer pricing documentation best practices frequently asked questions (FAQs). U.S. Department of the Treasury. Retrieved October 5, 2026.",
    "https://www.irs.gov/businesses/international-businesses/transfer-pricing-documentation-best-practices-frequently-asked-questions-faqs",
  ),
  IRS_MAP_OVERVIEW: R(
    "IRS_MAP_OVERVIEW",
    "live-verified",
    "gov",
    "Internal Revenue Service. (n.d.). Overview of the MAP process. U.S. Department of the Treasury. Retrieved October 5, 2026.",
    "https://www.irs.gov/businesses/overview-of-the-map-process",
  ),
  // Rev. Proc. 2015-40, the competent authority procedures; section 10
  // (arbitration) says a case the competent authorities cannot resolve in
  // the treaty's time goes to the panel, the taxpayer's analysis reaches the
  // panel through the U.S. competent authority as the treaty permits, and
  // the determination binds only if the taxpayer accepts it. Read on the
  // Internal Revenue Bulletin page 2026-10-05 (the review fixes); the IRS
  // MAP overview cites the same sections.
  IRS_REV_PROC_2015_40: R(
    "IRS_REV_PROC_2015_40",
    "live-verified",
    "gov",
    "Rev. Proc. 2015-40, 2015-35 I.R.B. 236 (procedures for requesting U.S. competent authority assistance under tax treaties).",
    "https://www.irs.gov/irb/2015-35_IRB#RP-2015-40",
  ),
  IRS_APMA: R(
    "IRS_APMA",
    "live-verified",
    "gov",
    "Internal Revenue Service. (n.d.). Advance Pricing and Mutual Agreement (APMA) Program. U.S. Department of the Treasury. Retrieved October 5, 2026.",
    "https://www.irs.gov/businesses/corporations/apma",
  ),
  // The calendar-year 2025 report, dated March 30, 2026, as listed on the
  // IRS "Annual APA statutory reports" page. Cited for how the methods,
  // tested parties, and ranges are applied in executed agreements; the pages
  // that cite it carry none of its figures.
  IRS_APMA_REPORT_2025: R(
    "IRS_APMA_REPORT_2025",
    "live-verified",
    "gov",
    "Internal Revenue Service. (2026). Announcement and report concerning advance pricing agreements [2025 APMA statutory report]. U.S. Department of the Treasury.",
    "https://www.irs.gov/pub/irs-drop/a-26-08.pdf",
  ),
  // Intellectual property damages primary sources (live-verified 2026-10-06;
  // see the LIVE-CHECK NOTES above). Statutes are cited Bluebook-style with
  // "sec." in place of the section sign (house rule). The pages that cite
  // these entries describe the rules; they carry no award, verdict, or
  // figure from any case.
  PATENT_284: R(
    "PATENT_284",
    "live-verified",
    "case-law",
    "35 U.S.C. sec. 284 (damages).",
    "https://www.law.cornell.edu/uscode/text/35/284",
  ),
  PATENT_286: R(
    "PATENT_286",
    "live-verified",
    "case-law",
    "35 U.S.C. sec. 286 (time limitation on damages).",
    "https://www.law.cornell.edu/uscode/text/35/286",
  ),
  PATENT_287: R(
    "PATENT_287",
    "live-verified",
    "case-law",
    "35 U.S.C. sec. 287 (limitation on damages and other remedies; marking and notice).",
    "https://www.law.cornell.edu/uscode/text/35/287",
  ),
  PATENT_289: R(
    "PATENT_289",
    "live-verified",
    "case-law",
    "35 U.S.C. sec. 289 (additional remedy for infringement of design patent).",
    "https://www.law.cornell.edu/uscode/text/35/289",
  ),
  LANHAM_ACT_1117: R(
    "LANHAM_ACT_1117",
    "live-verified",
    "case-law",
    "15 U.S.C. sec. 1117 (recovery for violation of rights).",
    "https://www.law.cornell.edu/uscode/text/15/1117",
  ),
  COPYRIGHT_504: R(
    "COPYRIGHT_504",
    "live-verified",
    "case-law",
    "17 U.S.C. sec. 504 (remedies for infringement: damages and profits).",
    "https://www.law.cornell.edu/uscode/text/17/504",
  ),
  DTSA_1836: R(
    "DTSA_1836",
    "live-verified",
    "case-law",
    "18 U.S.C. sec. 1836 (civil proceedings).",
    "https://www.law.cornell.edu/uscode/text/18/1836",
  ),
  DTSA_1838: R(
    "DTSA_1838",
    "live-verified",
    "case-law",
    "18 U.S.C. sec. 1838 (construction with other laws).",
    "https://www.law.cornell.edu/uscode/text/18/1838",
  ),
  DTSA_1839: R(
    "DTSA_1839",
    "live-verified",
    "case-law",
    "18 U.S.C. sec. 1839 (definitions).",
    "https://www.law.cornell.edu/uscode/text/18/1839",
  ),
  // Subsection (a): original federal jurisdiction over patent, plant variety,
  // copyright, and trademark claims, exclusive of every state, the District
  // of Columbia, and the territories for patent and copyright claims.
  JURISDICTION_1338: R(
    "JURISDICTION_1338",
    "live-verified",
    "case-law",
    "28 U.S.C. sec. 1338 (patents, plant variety protection, copyrights, mask works, designs, trademarks, and unfair competition).",
    "https://www.law.cornell.edu/uscode/text/28/1338",
  ),
  // Subsection (a)(1): the Federal Circuit hears the appeal in any civil
  // action arising under the patent laws, from every district court,
  // including the territorial courts of Guam, the Virgin Islands, and the
  // Northern Mariana Islands.
  FEDERAL_CIRCUIT_1295: R(
    "FEDERAL_CIRCUIT_1295",
    "live-verified",
    "case-law",
    "28 U.S.C. sec. 1295 (jurisdiction of the United States Court of Appeals for the Federal Circuit).",
    "https://www.law.cornell.edu/uscode/text/28/1295",
  ),
  // The act with the 1985 amendments and the commissioners' comments
  // (UTSA_final_85.pdf, attached to the final act page). Section 3 and its
  // comment: damages for actual loss and unjust enrichment without double
  // counting, a reasonable royalty in lieu of other measures on competent
  // evidence, recovery limited to the period of protection plus any head
  // start, and exemplary damages up to twice the award; sections 2(b), 4, 6,
  // and 7 cover the royalty injunction, fees, the three-year limitation, and
  // the displacement of other tort and restitution claims.
  UNIFORM_TRADE_SECRETS_ACT: R(
    "UNIFORM_TRADE_SECRETS_ACT",
    "live-verified",
    "case-law",
    "Unif. Trade Secrets Act with 1985 Amendments (Unif. L. Comm'n 1985).",
    "https://www.uniformlaws.org/viewdocument/final-act-128?CommunityKey=3a2538fb-e030-4e2d-a9e2-90373dc05792&tab=librarydocuments",
  ),
  USPTO_PATENT_ESSENTIALS: R(
    "USPTO_PATENT_ESSENTIALS",
    "live-verified",
    "gov",
    "U.S. Patent and Trademark Office. (n.d.). Patent essentials. U.S. Department of Commerce. Retrieved October 6, 2026.",
    "https://www.uspto.gov/patents/basics/essentials",
  ),
  USPTO_TRADE_SECRET_POLICY: R(
    "USPTO_TRADE_SECRET_POLICY",
    "live-verified",
    "gov",
    "U.S. Patent and Trademark Office. (n.d.). Trade secret policy. U.S. Department of Commerce. Retrieved October 6, 2026.",
    "https://www.uspto.gov/ip-policy/trade-secret-policy",
  ),
  // The fifteen-factor framework for the hypothetical negotiation (318 F.
  // Supp. at 1120) and the reasonable profit left to the licensee; the
  // Second Circuit modified the royalty and otherwise affirmed.
  GEORGIA_PACIFIC: R(
    "GEORGIA_PACIFIC",
    "live-verified",
    "case-law",
    "Georgia-Pacific Corp. v. United States Plywood Corp., 318 F. Supp. 1116 (S.D.N.Y. 1970), modified and aff'd, 446 F.2d 295 (2d Cir. 1971).",
    "https://static.case.law/f-supp/318/html/1116-01.html",
  ),
  // The four-factor lost profits test (575 F.2d at 1156). Two opinions begin
  // on this page of the reporter; 1152-02 is Panduit.
  PANDUIT: R(
    "PANDUIT",
    "live-verified",
    "case-law",
    "Panduit Corp. v. Stahlin Bros. Fibre Works, Inc., 575 F.2d 1152 (6th Cir. 1978).",
    "https://static.case.law/f2d/575/html/1152-02.html",
  ),
  // Lost profits on the patentee's market share of the infringing sales, a
  // reasonable royalty on the rest.
  STATE_INDUSTRIES_MOR_FLO: R(
    "STATE_INDUSTRIES_MOR_FLO",
    "live-verified",
    "case-law",
    "State Industries, Inc. v. Mor-Flo Industries, Inc., 883 F.2d 1573 (Fed. Cir. 1989).",
    "https://static.case.law/f2d/883/html/1573-01.html",
  ),
  // But-for causation and reasonable, objective foreseeability; lost sales of
  // a competing product the patent does not cover; unpatented items sold with
  // the patented one only where they form a functional unit.
  RITE_HITE: R(
    "RITE_HITE",
    "live-verified",
    "case-law",
    "Rite-Hite Corp. v. Kelley Co., 56 F.3d 1538 (Fed. Cir. 1995) (en banc).",
    "https://static.case.law/f3d/56/html/1538-01.html",
  ),
  // An acceptable noninfringing substitute that was available, though not on
  // the market, during the infringement.
  GRAIN_PROCESSING: R(
    "GRAIN_PROCESSING",
    "live-verified",
    "case-law",
    "Grain Processing Corp. v. American Maize-Products Co., 185 F.3d 1341 (Fed. Cir. 1999).",
    "https://static.case.law/f3d/185/html/1341-01.html",
  ),
  // The analytical method and the hypothetical negotiation (580 F.3d at
  // 1324-25, with validity and infringement assumed); lump-sum and running
  // royalty licenses compared.
  LUCENT_GATEWAY: R(
    "LUCENT_GATEWAY",
    "live-verified",
    "case-law",
    "Lucent Technologies, Inc. v. Gateway, Inc., 580 F.3d 1301 (Fed. Cir. 2009).",
    "https://static.case.law/f3d/580/html/1301-01.html",
  ),
  // The 25 percent rule of thumb held a fundamentally flawed tool and
  // inadmissible under Daubert and the Federal Rules of Evidence.
  UNILOC: R(
    "UNILOC",
    "live-verified",
    "case-law",
    "Uniloc USA, Inc. v. Microsoft Corp., 632 F.3d 1292 (Fed. Cir. 2011).",
    "https://static.case.law/f3d/632/html/1292-01.html",
  ),
  // The smallest salable patent-practicing unit, the entire market value rule
  // as a narrow exception, the hypothetical negotiation dated when the
  // infringement began (apart from the sec. 286 and 287 limits), and a
  // settlement license admitted in error.
  LASERDYNAMICS: R(
    "LASERDYNAMICS",
    "live-verified",
    "case-law",
    "LaserDynamics, Inc. v. Quanta Computer, Inc., 694 F.3d 51 (Fed. Cir. 2012).",
    "https://static.case.law/f3d/694/html/0051-01.html",
  ),
  // En banc, decided May 21, 2025: a damages expert's opinion that lump-sum
  // licenses reflected an agreed per-unit rate was not based on sufficient
  // facts or data under Rule 702(b); the court noted that the 2023 amendment,
  // which clarifies the proponent's burden, did not change the standard.
  ECOFACTOR_GOOGLE: R(
    "ECOFACTOR_GOOGLE",
    "live-verified",
    "case-law",
    "EcoFactor, Inc. v. Google LLC, 137 F.4th 1333 (Fed. Cir. 2025) (en banc).",
    "https://www.cafc.uscourts.gov/opinions-orders/23-1101.OPINION.5-21-2025_2518737.pdf",
  ),
  // Since the 1946 amendment only damages, not the infringer's profits as
  // such, are recoverable for a utility patent; the measure asks what the
  // patentee would have made had the infringer not infringed.
  ARO_MANUFACTURING: R(
    "ARO_MANUFACTURING",
    "live-verified",
    "case-law",
    "Aro Manufacturing Co. v. Convertible Top Replacement Co., 377 U.S. 476 (1964).",
    "https://www.law.cornell.edu/supremecourt/text/377/476",
  ),
  // Sec. 289: the article of manufacture may be the end product or a
  // component of it; total profit is computed on that article.
  SAMSUNG_V_APPLE: R(
    "SAMSUNG_V_APPLE",
    "live-verified",
    "case-law",
    "Samsung Electronics Co. v. Apple Inc., 580 U.S. 53 (2016).",
    "https://www.law.cornell.edu/supremecourt/text/15-777",
  ),
  // Enhanced damages under sec. 284 are discretionary and generally reserved
  // for egregious infringement behavior.
  HALO_ELECTRONICS: R(
    "HALO_ELECTRONICS",
    "live-verified",
    "case-law",
    "Halo Electronics, Inc. v. Pulse Electronics, Inc., 579 U.S. 93 (2016).",
    "https://www.law.cornell.edu/supremecourt/text/14-1513",
  ),
  // Willfulness is not a precondition to a profits award under 15 U.S.C.
  // 1117(a), though the defendant's mental state is a highly important
  // consideration.
  ROMAG_FASTENERS: R(
    "ROMAG_FASTENERS",
    "live-verified",
    "case-law",
    "Romag Fasteners, Inc. v. Fossil, Inc., 590 U.S. 212 (2020).",
    "https://www.law.cornell.edu/supremecourt/text/18-1233",
  ),
  // Decided February 26, 2025: the "defendant's profits" under sec. 1117(a)
  // are the named defendant's own, not those of affiliates that are not
  // parties.
  DEWBERRY_GROUP: R(
    "DEWBERRY_GROUP",
    "live-verified",
    "case-law",
    "Dewberry Group, Inc. v. Dewberry Engineers Inc., 604 U.S. 321 (2025).",
    "https://www.law.cornell.edu/supremecourt/text/23-900",
  ),
  // Sec. 504(b) permits actual damages, in appropriate circumstances, for the
  // fair market value of a license covering the infringing use.
  ON_DAVIS_V_GAP: R(
    "ON_DAVIS_V_GAP",
    "live-verified",
    "case-law",
    "On Davis v. The Gap, Inc., 246 F.3d 152 (2d Cir. 2001).",
    "https://static.case.law/f3d/246/html/0152-01.html",
  ),
  // Corrective advertising as trademark actual damages (added in the pillar
  // stage, live-verified 2026-10-06 on the Caselaw Access Project page and its
  // case metadata: 561 F.2d 1365, 10th Cir., decided September 2, 1977). In a
  // reverse confusion case under the false designation provision and the
  // common law, the court held the owner could recover a reasonable amount
  // equivalent to a corrective advertising campaign it had not yet run,
  // scaled to the markets where it did business and less than dollar for
  // dollar against the infringer's own campaign. The pages that cite it carry
  // none of the case's figures.
  BIG_O_TIRES: R(
    "BIG_O_TIRES",
    "live-verified",
    "case-law",
    "Big O Tire Dealers, Inc. v. Goodyear Tire & Rubber Co., 561 F.2d 1365 (10th Cir. 1977).",
    "https://static.case.law/f2d/561/html/1365-01.html",
  ),
  // Review fixes (live-verified 2026-10-06; see the LIVE-CHECK NOTES above).
  // The forums: a patent or copyright claim against the United States goes to
  // the Court of Federal Claims for reasonable and entire compensation
  // (sec. 1498(a) and (b)); patent venue lies where the defendant resides or
  // has committed acts of infringement and has a regular and established
  // place of business (sec. 1400(b)); state-law claims reach a district court
  // on diverse citizenship (sec. 1332(a)) or as part of the same case or
  // controversy (sec. 1367(a)); the Copyright Claims Board is an alternative
  // forum the parties use voluntarily (17 U.S.C. sec. 1502(a)).
  GOVERNMENT_USE_1498: R(
    "GOVERNMENT_USE_1498",
    "live-verified",
    "case-law",
    "28 U.S.C. sec. 1498 (patent and copyright cases).",
    "https://www.law.cornell.edu/uscode/text/28/1498",
  ),
  PATENT_VENUE_1400: R(
    "PATENT_VENUE_1400",
    "live-verified",
    "case-law",
    "28 U.S.C. sec. 1400 (patents and copyrights, mask works, and designs).",
    "https://www.law.cornell.edu/uscode/text/28/1400",
  ),
  DIVERSITY_1332: R(
    "DIVERSITY_1332",
    "live-verified",
    "case-law",
    "28 U.S.C. sec. 1332 (diversity of citizenship; amount in controversy; costs).",
    "https://www.law.cornell.edu/uscode/text/28/1332",
  ),
  SUPPLEMENTAL_1367: R(
    "SUPPLEMENTAL_1367",
    "live-verified",
    "case-law",
    "28 U.S.C. sec. 1367 (supplemental jurisdiction).",
    "https://www.law.cornell.edu/uscode/text/28/1367",
  ),
  COPYRIGHT_CLAIMS_BOARD_1502: R(
    "COPYRIGHT_CLAIMS_BOARD_1502",
    "live-verified",
    "case-law",
    "17 U.S.C. sec. 1502 (Copyright Claims Board).",
    "https://www.law.cornell.edu/uscode/text/17/1502",
  ),
  // No statutory damages or fees for infringement of an unpublished work
  // begun before registration, or for infringement begun after first
  // publication and before registration unless the work was registered
  // within three months after first publication.
  COPYRIGHT_412: R(
    "COPYRIGHT_412",
    "live-verified",
    "case-law",
    "17 U.S.C. sec. 412 (registration as prerequisite to certain remedies for infringement).",
    "https://www.law.cornell.edu/uscode/text/17/412",
  ),
  // Subsection (b): where willful and malicious misappropriation is proven
  // by clear and convincing evidence, the fact finder may award exemplary
  // damages of up to twice the award under subsection (a). The public page
  // renders the chapter from the Legislature's statute service
  // (tcss.legis.texas.gov/resources/CP/htm/CP.134A.htm), where the section
  // and its 2017 amendment note were read.
  TEXAS_UTSA_134A: R(
    "TEXAS_UTSA_134A",
    "live-verified",
    "case-law",
    "Tex. Civ. Prac. & Rem. Code Ann. sec. 134A.004 (damages).",
    "https://statutes.capitol.texas.gov/Docs/CP/htm/CP.134A.htm",
  ),
  // The rule the Federal Circuit called untenable: that every damages model
  // must begin with the smallest salable patent-practicing unit; licensing
  // negotiations priced on the end product that already apportion to the
  // patent are a reliable starting point.
  CSIRO_CISCO: R(
    "CSIRO_CISCO",
    "live-verified",
    "case-law",
    "Commonwealth Scientific & Industrial Research Organisation v. Cisco Systems, Inc., 809 F.3d 1295 (Fed. Cir. 2015).",
    "https://static.case.law/f3d/809/html/1295-01.html",
  ),
  // Decided January 12, 2018 (on the Caselaw Access Project): apportionment
  // can be done through the royalty base, the royalty rate, or both, and
  // using the accused product as the base and apportioning through the rate
  // is an acceptable methodology.
  EXMARK: R(
    "EXMARK",
    "live-verified",
    "case-law",
    "Exmark Manufacturing Co. v. Briggs & Stratton Power Products Group, LLC, 879 F.3d 1332 (Fed. Cir. 2018).",
    "https://static.case.law/f3d/879/html/1332-01.html",
  ),
  // A Lanham Act award redetermined with a reasonable royalty "as a baseline
  // or starting point" (the principles Judges Cudahy and Ripple joined).
  SANDS_TAYLOR_WOOD: R(
    "SANDS_TAYLOR_WOOD",
    "live-verified",
    "case-law",
    "Sands, Taylor & Wood Co. v. Quaker Oats Co., 978 F.2d 947 (7th Cir. 1992).",
    "https://static.case.law/f2d/978/html/0947-01.html",
  ),
  // Avoided costs under the federal trade secret statute: the Second Circuit
  // allows them as unjust enrichment where the misappropriation injured the
  // owner beyond its actual loss, such as by diminishing the secret's value
  // (68 F.4th at 809-12); the Seventh Circuit agreed (108 F.4th, footnote 10);
  // the Fifth Circuit declined to require that showing and removed the
  // overlap with the injunction instead (slip op. at 25-34). Each opinion
  // links to the copy in the U.S. Courts collection on govinfo.gov, and the
  // F.4th cites were confirmed through CourtListener's citation resolver.
  SYNTEL_TRIZETTO: R(
    "SYNTEL_TRIZETTO",
    "live-verified",
    "case-law",
    "Syntel Sterling Best Shores Mauritius Ltd. v. TriZetto Group, Inc., 68 F.4th 792 (2d Cir. 2023).",
    "https://www.govinfo.gov/content/pkg/USCOURTS-ca2-21-01370/pdf/USCOURTS-ca2-21-01370-0.pdf",
  ),
  MOTOROLA_HYTERA: R(
    "MOTOROLA_HYTERA",
    "live-verified",
    "case-law",
    "Motorola Solutions, Inc. v. Hytera Communications Corp., 108 F.4th 458 (7th Cir. 2024).",
    "https://www.govinfo.gov/content/pkg/USCOURTS-ca7-22-02370/pdf/USCOURTS-ca7-22-02370-0.pdf",
  ),
  CSC_TATA: R(
    "CSC_TATA",
    "live-verified",
    "case-law",
    "Computer Sciences Corp. v. Tata Consultancy Services Ltd., No. 24-10749 (5th Cir. Nov. 21, 2025).",
    "https://www.govinfo.gov/content/pkg/USCOURTS-ca5-24-10749/pdf/USCOURTS-ca5-24-10749-0.pdf",
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
