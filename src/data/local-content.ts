import { ORG_NAME } from "@/lib/brand";

export interface LocalContent {
  stateSlug: string;
  citySlug?: string; // if undefined, applies to state page
  headline: string;
  content: string; // 2-3 paragraphs separated by \n\n
  localCourts?: string;
  /** Display names of the case types common to the market; CityPage maps them
   * to case-type slugs for the RelatedServices block. */
  commonCaseTypes?: string[];
}

// Hand-written local essays for the markets the firm knows first-hand. Court
// and venue facts are kept; every economic sentence is framed around how local
// wage levels, industry mix, cost of living, and the state's damages rules
// enter an earnings, household-services, or business damages analysis. No
// figures, no citations, hyphens only.
export const localContentEntries: LocalContent[] = [
  {
    stateSlug: "new-york",
    headline: "Forensic Economics in New York State",
    content:
      `New York presents a distinctive litigation environment for forensic economists. Unlike most states, New York's Supreme Court functions as the primary trial court - not an appellate body - and personal injury, medical malpractice, wrongful death, and employment cases in that court routinely turn on economic damages testimony. New York's wrongful death measure has long centered on the pecuniary loss to the distributees, which puts the economist's projection of lost earnings, lost household services, and the value of a parent's guidance at the heart of a death case, and the state's collateral-source offset and structured-judgment procedures shape how a future-damages award is actually paid.\n\nThe state's five boroughs, Long Island, the Hudson Valley, and Upstate New York are distinct wage markets with materially different earnings histories and costs of living. An earnings projection for a Manhattan professional, a Long Island tradesperson, and a Buffalo manufacturing worker rests on different occupational wage data, different fringe benefit structures, and different commuting patterns, and each must be anchored to the plaintiff's own records and to the wage data for the area where the plaintiff actually worked rather than to a statewide figure.\n\nNew York's workers' compensation system handles wage-loss benefits through the Workers' Compensation Board, but the tort claims that flow from the same injuries, and the employment discrimination and wrongful termination cases heard in state and federal court, call for economic loss analyses written to New York's expert disclosure practice. ${ORG_NAME} has extensive familiarity with New York's courts, its regional wage markets, and the standards that New York judges apply to economic damages opinions.`,
    localCourts: "New York Supreme Court (trial court), Appellate Division (four departments), Court of Appeals, U.S. District Courts for SDNY, EDNY, NDNY, and WDNY, New York Workers' Compensation Board",
    commonCaseTypes: ["Personal Injury", "Wrongful Death", "Medical Malpractice", "Employment Discrimination", "Motor Vehicle Accident"],
  },
  {
    stateSlug: "new-york",
    citySlug: "new-york-city",
    headline: "Forensic Economics in New York City",
    content:
      `New York City is one of the most active litigation markets in the United States. The Southern District of New York (SDNY) and the Eastern District of New York (EDNY) together handle an enormous volume of federal civil litigation, including the employment and commercial cases where lost earnings and lost profits are the core of the dispute, and the five-borough Supreme Court system processes a large docket of personal injury, medical malpractice, and wrongful death cases. In this environment, the quality and credibility of economic damages testimony is scrutinized intensely by experienced counsel on both sides.\n\nThe city's earnings picture is highly stratified. Finance, law, health care, education, government, construction, transportation, and hospitality each carry their own wage structures, bonus and overtime patterns, and benefit packages, and the cost of living differs between Manhattan and the outer boroughs. A lost earnings analysis for a New York City plaintiff has to start from the plaintiff's own tax returns and pay records and then test that history against occupational wage data for the metropolitan area, not a national average, before projecting it forward.\n\nKings County Supreme Court (Brooklyn), Bronx Supreme Court, Queens County Supreme Court, and New York County Supreme Court each have their own administrative practices and judicial temperaments. ${ORG_NAME} economists are prepared to testify in any of these venues, with reports built on the wage data for the borough where the plaintiff lives and works and written for the specific forum.`,
    localCourts: "New York County Supreme Court, Kings County Supreme Court, Bronx County Supreme Court, Queens County Supreme Court, Richmond County Supreme Court, SDNY, EDNY",
    commonCaseTypes: ["Personal Injury", "Wrongful Death", "Medical Malpractice", "Employment Discrimination", "Commercial Contract Dispute"],
  },
  {
    stateSlug: "new-york",
    citySlug: "brooklyn",
    headline: "Forensic Economics in Brooklyn (Kings County)",
    content:
      `Brooklyn is served by the Kings County Supreme Court, one of the highest-volume civil trial courts in New York State. Motor vehicle accidents, premises liability cases, and construction site injuries generate steady demand for economic damages analysis in this jurisdiction. Kings County juries are experienced with complex expert testimony, and a lost earnings or wrongful death analysis must be both technically rigorous and clearly explained.\n\nBrooklyn's earnings picture reflects the diversity of the borough itself. Health care, education, government, transit, retail, construction, and a growing technology and logistics sector employ Brooklyn residents at very different wage levels and with very different benefit packages, and a large share of the borough commutes into Manhattan. The economist's task is to document what the plaintiff actually earned, in wages and in benefits, and to test that history against occupational wage data for the metropolitan area rather than against a borough-wide or national average.\n\nFor catastrophic injury and wrongful death cases in Kings County, the analysis typically includes lost earnings, lost fringe benefits, lost household services valued at metropolitan-area replacement rates, and, where a life care plan exists, the present value of its future costs. ${ORG_NAME} provides jurisdiction-aware economic damages reports that hold up under cross-examination in Kings County courts.`,
    localCourts: "Kings County Supreme Court, Kings County Family Court, EDNY (Eastern District of New York)",
    commonCaseTypes: ["Personal Injury", "Motor Vehicle Accident", "Wrongful Death", "Workers' Compensation", "Medical Malpractice"],
  },
  {
    stateSlug: "new-jersey",
    citySlug: "newark",
    headline: "Forensic Economics in Newark, New Jersey",
    content:
      `Newark is the seat of Essex County and a major hub for New Jersey litigation. The Essex County courthouse handles a broad range of civil cases including personal injury, employment, and medical malpractice matters. The U.S. District Court for the District of New Jersey (D.N.J.), with its Vicinage in Newark, is among the busiest federal courts in the Third Circuit and regularly sees economic damages testimony in employment discrimination, wrongful termination, and complex commercial cases.\n\nNewark's wage market is tightly connected to the broader New York metropolitan area. Many Essex County residents work in Newark's own finance, insurance, education, health care, transportation, and port and airport logistics sectors, while others commute into Manhattan, and an earnings projection must use the wage data for where the plaintiff actually worked rather than a New Jersey statewide average. New Jersey follows a modified comparative negligence standard and deducts most collateral-source benefits from the award after verdict, both of which affect how the economist's totals translate into a recovery.\n\nNew Jersey's Division of Workers' Compensation is the forum for wage-loss benefits in compensation claims, and ${ORG_NAME} economists are familiar with how judges of compensation and Superior Court judges expect an earnings history and a loss projection to be documented. Our Newark-market reports draw on occupational wage data for the Newark, NJ-PA Metropolitan Division of the New York-Newark-Jersey City metropolitan area and on the plaintiff's own tax, pay, and benefit records.`,
    localCourts: "Essex County Superior Court, D.N.J. (Newark Vicinage), New Jersey Division of Workers' Compensation",
    commonCaseTypes: ["Personal Injury", "Employment Discrimination", "Wrongful Termination", "Wrongful Death", "Medical Malpractice"],
  },
  {
    stateSlug: "new-jersey",
    citySlug: "hackensack",
    headline: `${ORG_NAME} Headquarters - Bergen County, New Jersey`,
    content:
      `${ORG_NAME} is headquartered in Hackensack, New Jersey, the county seat of Bergen County and one of the most active civil litigation venues in the state. Bergen County Superior Court handles a high volume of personal injury, medical malpractice, employment, and family law matters, the last of which brings income determination and business valuation questions before the Family Part. The proximity to New York City and the density of the Bergen County population make this a particularly active market for economic damages work.\n\nBergen County's earnings picture reflects its position at the heart of the New York metropolitan region. Health care, pharmaceuticals, professional services, retail, and a large population of Manhattan commuters produce earnings histories with substantial fringe benefits and bonus and equity compensation that a projection must capture from the plaintiff's own records. For a Bergen County plaintiff, the task is documenting what was actually earned, in cash and in benefits, and testing it against metropolitan-area wage data before projecting it forward.\n\nAs the firm's home base, Hackensack-area cases benefit from the full depth of our resources. Economists here have direct familiarity with the Bergen County courthouse, the wage data used for local projections, and the specific judicial and arbitration expectations that govern expert testimony in this venue. The firm also maintains an office in Richmond, VA, providing similar depth of local knowledge for Virginia matters.`,
    localCourts: "Bergen County Superior Court, D.N.J. (Newark Vicinage), Bergen County Family Court",
    commonCaseTypes: ["Personal Injury", "Medical Malpractice", "Divorce and Marital Dissolution", "Employment Discrimination", "Wrongful Death"],
  },
  {
    stateSlug: "new-jersey",
    citySlug: "jersey-city",
    headline: "Forensic Economics in Jersey City, New Jersey",
    content:
      `Jersey City is the seat of Hudson County and a rapidly growing litigation market in northeastern New Jersey. Hudson County Superior Court handles a diverse civil docket including personal injury, premises liability, and an increasing volume of employment and commercial disputes. The close proximity to Manhattan - and the daily flow between the two - means that many Hudson County residents earn their living on the other side of the river.\n\nFor forensic economists, Jersey City cases often present cross-market questions. A plaintiff may have worked for a Manhattan financial firm while living in Hudson County, or for one of the banks, insurers, and technology employers along the Jersey City waterfront, and the projection must use the wage data and benefit structure of the market where the plaintiff actually worked. Household services are valued at replacement rates for the Jersey City area, and the cost of living on both sides of the Hudson enters the analysis where the plaintiff's circumstances changed after the injury.\n\nNew Jersey's reliability-based admissibility framework calls for economic damages opinions to rest on sufficient data and reliable methodology. ${ORG_NAME} economists produce reports that clearly document their methodology, data sources, and reasoning in a format that meets New Jersey's evidentiary standards and withstands deposition and cross-examination.`,
    localCourts: "Hudson County Superior Court, D.N.J. (Newark Vicinage), Hudson County Family Court",
    commonCaseTypes: ["Personal Injury", "Employment Discrimination", "Wrongful Termination", "Commercial Contract Dispute", "Wrongful Death"],
  },
  {
    stateSlug: "virginia",
    headline: "Forensic Economics in Virginia",
    content:
      `Virginia is a contributory negligence state - one of only a handful remaining in the United States. Under contributory negligence, a plaintiff who is found even minimally at fault for an accident may be barred from any recovery, so the threshold question of liability is often as contested as damages, and the economic loss analysis must be airtight when the case reaches the jury. Virginia's wrongful death statute gives the statutory beneficiaries a recovery that includes the decedent's expected income and services, and prejudgment interest is left to the factfinder's discretion.\n\nVirginia's federal courts - particularly the Eastern District of Virginia (E.D. Va.), known informally as the "Rocket Docket" for its compressed trial schedule - demand that expert reports and disclosures be thorough and ready for trial from the outset. The Western District of Virginia covers the Roanoke and Charlottesville areas. Virginia state courts apply the Virginia Rules of Evidence, which have been substantially modernized but retain some distinctions from the Federal Rules.\n\n${ORG_NAME} maintains an office in Richmond, VA, providing direct familiarity with Virginia's court systems and the Virginia Workers' Compensation Commission. Earnings projections for Virginia cases are built from the wage data for the plaintiff's own region - Northern Virginia, Richmond, Hampton Roads, or the rural Southwest - because wage levels, the federal and military presence, and the cost of living differ materially across the state.`,
    localCourts: "Virginia Circuit Courts, Virginia Courts of Appeals, E.D. Va. (Richmond and Alexandria Divisions), W.D. Va., Virginia Workers' Compensation Commission",
    commonCaseTypes: ["Personal Injury", "Wrongful Death", "Medical Malpractice", "Workers' Compensation", "Employment Discrimination"],
  },
  {
    stateSlug: "massachusetts",
    headline: "Forensic Economics in Massachusetts",
    content:
      `Massachusetts follows a modified comparative negligence standard, permitting plaintiffs to recover damages as long as their fault does not exceed the combined fault of the defendants. The state's civil litigation market is centered on Suffolk County Superior Court in Boston, one of the most active state civil courts in New England. The U.S. District Court for the District of Massachusetts (D. Mass.) in Boston handles a significant volume of federal civil litigation including employment, product liability, and commercial cases where economic damages testimony is routinely offered.\n\nMassachusetts measures wrongful death by the fair monetary value of the decedent to the beneficiaries, including lost income and services as well as society and companionship, and prejudgment interest on tort awards runs from the filing of the action. The Department of Industrial Accidents (DIA) administers wage-loss benefits in workers' compensation claims. ${ORG_NAME} economists are familiar with how Massachusetts judges evaluate economic damages testimony and how the state's damages framework shapes the components of the report.\n\nThe Massachusetts earnings picture is anchored by greater Boston's health care, higher education, biotechnology, financial services, and technology employers, whose wage levels and benefit structures differ from those in the western and southeastern parts of the state. Earnings projections for Massachusetts plaintiffs are built from the plaintiff's own records and from occupational wage data for the plaintiff's own metropolitan or nonmetropolitan area, not from a statewide figure.`,
    localCourts: "Suffolk County Superior Court, D. Mass. (Boston), Massachusetts Department of Industrial Accidents, Massachusetts Appeals Court",
    commonCaseTypes: ["Personal Injury", "Wrongful Death", "Medical Malpractice", "Employment Discrimination", "Product Liability"],
  },
  {
    stateSlug: "california",
    citySlug: "los-angeles",
    headline: "Forensic Economics in Los Angeles, California",
    content:
      `Los Angeles is one of the largest and most active civil litigation markets in the United States. The Los Angeles County Superior Court processes a very large volume of civil filings, and the U.S. District Court for the Central District of California (C.D. Cal.) is one of the busiest federal courts in the country. In this environment, forensic economists are called upon regularly, and the quality of expert credentials and methodology is routinely scrutinized by experienced plaintiff and defense counsel.\n\nCalifornia follows a pure comparative fault standard, meaning a plaintiff can recover even if found mostly at fault, and measures past medical expenses by the amounts actually paid or owed rather than billed. Los Angeles earnings histories span entertainment, aerospace, logistics, health care, hospitality, and construction, with self-employment, contract work, and irregular income far more common than in many markets, so a lost earnings analysis often has to reconstruct an earnings history from tax returns and business records before it can be projected forward against metropolitan-area wage data.\n\nCalifornia's workers' compensation system is administered by the Division of Workers' Compensation and has its own framework for wage-loss benefits. ${ORG_NAME} economists are familiar with both the California civil litigation context and the compensation framework, and our Los Angeles-market reports draw on occupational wage data for Los Angeles County and the plaintiff's own tax, pay, and benefit records.`,
    localCourts: "Los Angeles County Superior Court, C.D. Cal. (Los Angeles Division), California Workers' Compensation Appeals Board",
    commonCaseTypes: ["Personal Injury", "Employment Discrimination", "Wrongful Termination", "Wrongful Death", "Product Liability"],
  },
  {
    stateSlug: "texas",
    citySlug: "houston",
    headline: "Forensic Economics in Houston, Texas",
    content:
      `Houston is the seat of Harris County and home to one of the largest and most active state civil courts in the country. Harris County District Courts process a substantial volume of personal injury, oilfield injury, maritime, and commercial cases. The U.S. District Court for the Southern District of Texas (S.D. Tex.), headquartered in Houston, is one of the busiest federal courts in the nation and handles significant maritime and industrial-injury litigation where economic damages testimony is frequently required.\n\nTexas follows a modified comparative fault standard that bars recovery once the plaintiff's responsibility exceeds half, limits medical expense recovery to amounts actually paid or incurred, and does not award prejudgment interest on future damages. The Texas energy, petrochemical, construction, and maritime industries produce earnings histories with substantial overtime, per-diem and offshore pay, and benefit packages that a projection must capture from the plaintiff's own records. Because Texas employers may decline workers' compensation coverage, many workplace injuries are litigated in the civil courts, where the economist's lost earnings analysis frames the damages.\n\nHouston is also home to the Texas Medical Center, one of the largest concentrations of hospitals and specialist care in the world, so the future medical component of a catastrophic injury case is often costed from a detailed life care plan that the economist reduces to present value. ${ORG_NAME} prepares Houston-market reports from occupational wage data for the Houston-The Woodlands-Sugar Land metropolitan area and from the plaintiff's own tax, pay, and benefit records.`,
    localCourts: "Harris County District Courts, S.D. Tex. (Houston Division), Texas Department of Insurance, Division of Workers' Compensation",
    commonCaseTypes: ["Personal Injury", "Workers' Compensation", "Wrongful Death", "Commercial Contract Dispute", "Product Liability"],
  },
];

export function getLocalContent(stateSlug: string, citySlug?: string): LocalContent | undefined {
  return localContentEntries.find(
    (entry) => entry.stateSlug === stateSlug && entry.citySlug === citySlug
  );
}
