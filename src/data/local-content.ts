import { ORG_NAME } from "@/lib/brand";

export interface LocalContent {
  stateSlug: string;
  citySlug?: string; // if undefined, applies to state page
  headline: string;
  content: string; // 2-3 paragraphs separated by \n\n
  localCourts?: string;
  commonCaseTypes?: string[];
}

// Hand-written local essays for the markets the firm knows first-hand. Court
// and venue facts are kept; every cost sentence is framed around the price and
// availability of care, never wages or labor markets.
export const localContentEntries: LocalContent[] = [
  {
    stateSlug: "new-york",
    headline: "Life Care Planning in New York State",
    content:
      `New York presents a distinctive litigation environment for life care planners. Unlike most states, New York's Supreme Court functions as the primary trial court - not an appellate body - which can create confusion for attorneys unfamiliar with the system. Personal injury, medical malpractice, and workers' compensation cases are all heavy consumers of life care plan testimony, and New York courts apply state-specific standards to expert disclosure that call for well-organized, comprehensive plans.\n\nThe state's five boroughs, Long Island, the Hudson Valley, and Upstate New York each represent distinct care markets with materially different rates for attendant care, home health, skilled nursing, and specialist follow-up. A plan must price each item for the region where the evaluee actually lives. The New York City metropolitan area records some of the highest home health and attendant-care rates in the nation, while Upstate markets like Buffalo, Rochester, and Albany reflect substantially different provider costs and, outside the metros, longer travel to tertiary care.\n\nNew York's Workers' Compensation Board has its own procedural framework for medical evidence and future treatment, and a plan offered there is scrutinized on the medical necessity of each item. ${ORG_NAME} has extensive familiarity with New York's courts, its regional care markets, and the standards that New York judges and arbitrators apply to life care plan opinions.`,
    localCourts: "New York Supreme Court (trial court), Appellate Division (four departments), Court of Appeals, U.S. District Courts for SDNY, EDNY, NDNY, and WDNY, New York Workers' Compensation Board",
    commonCaseTypes: ["Personal Injury", "Medical Malpractice", "Workers' Compensation", "Catastrophic Injury", "Wrongful Death"],
  },
  {
    stateSlug: "new-york",
    citySlug: "new-york-city",
    headline: "Life Care Planning in New York City",
    content:
      `New York City is one of the most active litigation markets in the United States. The Southern District of New York (SDNY) and the Eastern District of New York (EDNY) together handle an enormous volume of federal civil litigation, and the five-borough Supreme Court system processes thousands of personal injury and medical malpractice cases annually. In this environment, the quality and credibility of expert testimony - including life care planning opinions - is scrutinized intensely.\n\nThe city's care market is highly stratified. The cost of home health aides, attendant care, durable medical equipment, and specialist services in New York City is among the highest in the country, and rates differ between Manhattan and the outer boroughs. A carefully documented life care plan - one that names the provider behind every rate - is essential in catastrophic injury cases venued here.\n\nKings County Supreme Court (Brooklyn), Bronx Supreme Court, Queens County Supreme Court, and New York County Supreme Court each have their own administrative practices and judicial temperaments. ${ORG_NAME} planners are prepared to testify in any of these venues, with plans priced for the borough where the evaluee lives and written for the specific forum.`,
    localCourts: "New York County Supreme Court, Kings County Supreme Court, Bronx County Supreme Court, Queens County Supreme Court, Richmond County Supreme Court, SDNY, EDNY",
    commonCaseTypes: ["Personal Injury", "Medical Malpractice", "Wrongful Death", "Workers' Compensation", "Catastrophic Injury"],
  },
  {
    stateSlug: "new-york",
    citySlug: "brooklyn",
    headline: "Life Care Planning in Brooklyn (Kings County)",
    content:
      `Brooklyn is served by the Kings County Supreme Court, one of the highest-volume civil trial courts in New York State. Motor vehicle accidents, premises liability cases, and construction site injuries generate substantial demand for life care planning in this jurisdiction. Kings County juries are experienced with complex expert testimony, and a plan must be both technically rigorous and clearly communicated to lay audiences.\n\nBrooklyn's care market reflects the diversity of the borough itself. Home health agencies, outpatient rehabilitation, and specialist practices are widely available, anchored by the borough's hospital systems, but rates vary between neighborhoods and between agency-provided and privately arranged attendant care. A plan for a Brooklyn evaluee must document which level of care the record supports and what it actually costs where the evaluee lives.\n\nFor catastrophic injury and wrongful death cases in Kings County, life care plans should incorporate New York City-specific cost data for home health aides, skilled nursing, and outpatient rehabilitation - all of which are substantially more expensive than national averages. ${ORG_NAME} provides jurisdiction-aware plans that hold up under cross-examination in Kings County courts.`,
    localCourts: "Kings County Supreme Court, Kings County Family Court, EDNY (Eastern District of New York)",
    commonCaseTypes: ["Personal Injury", "Motor Vehicle Accident", "Premises Liability", "Workers' Compensation", "Medical Malpractice"],
  },
  {
    stateSlug: "new-jersey",
    citySlug: "newark",
    headline: "Life Care Planning in Newark, New Jersey",
    content:
      `Newark is the seat of Essex County and a major hub for New Jersey litigation. The Essex County courthouse handles a broad range of civil cases including personal injury, workers' compensation, and medical malpractice matters. The U.S. District Court for the District of New Jersey (D.N.J.), with its Vicinage in Newark, is among the busiest federal courts in the Third Circuit and regularly sees life care planning testimony in complex civil cases.\n\nNewark's care market is tightly connected to the broader New York metropolitan area. Many Essex County evaluees receive specialist and tertiary care in Newark's own medical centers, while others are followed by New York City providers, and a plan must price follow-up care where the evaluee will realistically obtain it rather than at a statewide average. New Jersey follows a modified comparative negligence standard, which can affect how the plan's totals interact with the damages calculation.\n\nNew Jersey's Division of Workers' Compensation is the forum for the future medical component of compensation claims, and ${ORG_NAME} planners are familiar with how judges of compensation and Superior Court judges expect a plan to document medical necessity and cost. Our Newark-market plans price attendant care, home health, equipment, and medication from providers serving Essex County and the Newark, NJ-PA Metropolitan Division of the New York-Newark-Jersey City metropolitan area.`,
    localCourts: "Essex County Superior Court, D.N.J. (Newark Vicinage), New Jersey Division of Workers' Compensation",
    commonCaseTypes: ["Personal Injury", "Workers' Compensation", "Medical Malpractice", "Wrongful Death", "Catastrophic Injury"],
  },
  {
    stateSlug: "new-jersey",
    citySlug: "hackensack",
    headline: `${ORG_NAME} Headquarters - Bergen County, New Jersey`,
    content:
      `${ORG_NAME} is headquartered in Hackensack, New Jersey, the county seat of Bergen County and one of the most active civil litigation venues in the state. Bergen County Superior Court handles a high volume of personal injury, medical malpractice, and family law matters. The proximity to New York City and the density of the Bergen County population make this a particularly active market for life care planning services.\n\nBergen County's care market reflects its position at the heart of the New York metropolitan region. Attendant-care, home health, and skilled-nursing rates are among the highest in New Jersey, and the county is home to a deep concentration of specialist and rehabilitation providers. For a Bergen County evaluee, the plan can usually price every item from a local provider; the task is documenting the level of care the record supports and the rate that provider actually charges.\n\nAs the firm's home base, Hackensack-area cases benefit from the full depth of our resources. Planners here have direct familiarity with the Bergen County courthouse, the local medical providers used for cost documentation, and the specific judicial and arbitration expectations that govern expert testimony in this venue. The firm also maintains an office in Richmond, VA, providing similar depth of local knowledge for Virginia matters.`,
    localCourts: "Bergen County Superior Court, D.N.J. (Newark Vicinage), Bergen County Family Court",
    commonCaseTypes: ["Personal Injury", "Medical Malpractice", "Catastrophic Injury", "Workers' Compensation", "Life Care Planning"],
  },
  {
    stateSlug: "new-jersey",
    citySlug: "jersey-city",
    headline: "Life Care Planning in Jersey City, New Jersey",
    content:
      `Jersey City is the seat of Hudson County and a rapidly growing litigation market in northeastern New Jersey. Hudson County Superior Court handles a diverse civil docket including personal injury, premises liability, and an increasing volume of commercial disputes. The close proximity to Manhattan - and the daily flow between the two - means that many Hudson County evaluees receive care on both sides of the river.\n\nFor life care planners, Jersey City cases often present cross-market pricing questions. An evaluee may be followed by a New York City specialist while receiving home health and attendant care in Hudson County, and the plan must price each item where it will actually be delivered. Life care plans in Hudson County must also account for the availability and cost of specialized services, which may be accessed in both New Jersey and New York depending on proximity and insurance coverage.\n\nNew Jersey's reliability-based admissibility framework calls for life care plan opinions to rest on sufficient data and reliable methodology. ${ORG_NAME} planners produce plans that clearly document their methodology, cost sources, and reasoning in a format that meets New Jersey's evidentiary standards and withstands deposition and cross-examination.`,
    localCourts: "Hudson County Superior Court, D.N.J. (Newark Vicinage), Hudson County Family Court",
    commonCaseTypes: ["Personal Injury", "Workers' Compensation", "Premises Liability", "Medical Malpractice", "Catastrophic Injury"],
  },
  {
    stateSlug: "virginia",
    headline: "Life Care Planning in Virginia",
    content:
      `Virginia is a contributory negligence state - one of only a handful remaining in the United States. Under contributory negligence, a plaintiff who is found even minimally at fault for an accident may be barred from any recovery. This legal standard creates a distinctive environment for life care plan testimony: the threshold question of liability is often as contested as damages, and expert opinions on future care needs and their cost must be airtight.\n\nVirginia's federal courts - particularly the Eastern District of Virginia (E.D. Va.), known informally as the "Rocket Docket" for its compressed trial schedule - demand that expert reports and disclosures be thorough and ready-for-trial from the outset. The Western District of Virginia covers the Roanoke and Charlottesville areas. Virginia state courts apply the Virginia Rules of Evidence, which have been substantially modernized but retain some distinctions from the Federal Rules.\n\n${ORG_NAME} maintains an office in Richmond, VA, providing direct familiarity with Virginia's court systems and the Virginia Workers' Compensation Commission, where lifetime medical awards make future care costs a central issue. Life care plans for Virginia cases are priced for the evaluee's own region - Northern Virginia, Richmond, Hampton Roads, or the rural Southwest - because attendant-care rates and specialist availability differ materially across the state.`,
    localCourts: "Virginia Circuit Courts, Virginia Courts of Appeals, E.D. Va. (Richmond and Alexandria Divisions), W.D. Va., Virginia Workers' Compensation Commission",
    commonCaseTypes: ["Personal Injury", "Workers' Compensation", "Medical Malpractice", "Wrongful Death", "Catastrophic Injury"],
  },
  {
    stateSlug: "massachusetts",
    headline: "Life Care Planning in Massachusetts",
    content:
      `Massachusetts follows a modified comparative negligence standard, permitting plaintiffs to recover damages as long as they are not more than 50% at fault. The state's civil litigation market is centered on Suffolk County Superior Court in Boston, one of the most active state civil courts in New England. The U.S. District Court for the District of Massachusetts (D. Mass.) in Boston handles a significant volume of federal civil litigation including product liability, medical device, and pharmaceutical cases where life care planning testimony is routinely offered.\n\nMassachusetts has a robust workers' compensation system administered by the Department of Industrial Accidents (DIA), with its own procedural framework for presenting medical evidence in conciliation and conference proceedings. The DIA's Impartial Medical Examiner process interacts with future-care opinions in ways that practitioners must navigate carefully. ${ORG_NAME} planners are familiar with how Massachusetts administrative judges and judges of the Superior Court evaluate life care plan testimony.\n\nThe Massachusetts care market is anchored by the greater Boston medical centers, which offer a depth of specialist and rehabilitation care matched by few regions in the country - at rates that run well above national averages for attendant care and skilled nursing. Plans for evaluees outside the Boston metro must document specialist availability and travel to tertiary care. ${ORG_NAME} plans for Massachusetts cases price every item from providers serving the evaluee's own community.`,
    localCourts: "Suffolk County Superior Court, D. Mass. (Boston), Massachusetts Department of Industrial Accidents, Massachusetts Appeals Court",
    commonCaseTypes: ["Personal Injury", "Medical Malpractice", "Workers' Compensation", "Wrongful Death", "Catastrophic Injury"],
  },
  {
    stateSlug: "california",
    citySlug: "los-angeles",
    headline: "Life Care Planning in Los Angeles, California",
    content:
      `Los Angeles is one of the largest and most active personal injury litigation markets in the United States. The Los Angeles County Superior Court processes tens of thousands of civil filings annually, and the U.S. District Court for the Central District of California (C.D. Cal.) is one of the busiest federal courts in the country. In this environment, life care planners are called upon regularly, and the quality of expert credentials and methodology is routinely scrutinized by experienced plaintiff and defense counsel.\n\nCalifornia follows a pure comparative fault standard, meaning a plaintiff can recover even if found mostly at fault for their injuries. This standard tends to support higher damages settlements and verdicts, which in turn elevates the importance of a precisely documented plan. Life care plan costs in the Los Angeles area are among the highest in the nation for home health aides, attendant care, and specialized medical services, and each cost projection in a California life care plan should be supported by locally-sourced provider cost data.\n\nCalifornia's workers' compensation system is administered by the Division of Workers' Compensation and has its own specialized framework for medical evidence, including the role of Qualified Medical Evaluators and the utilization review of future treatment. ${ORG_NAME} planners are familiar with both the California civil litigation context and the workers' compensation administrative framework, and our Los Angeles-market plans price attendant care, home health, equipment, and specialist follow-up from providers serving Los Angeles County.`,
    localCourts: "Los Angeles County Superior Court, C.D. Cal. (Los Angeles Division), California Workers' Compensation Appeals Board",
    commonCaseTypes: ["Personal Injury", "Workers' Compensation", "Medical Malpractice", "Wrongful Death", "Catastrophic Injury"],
  },
  {
    stateSlug: "texas",
    citySlug: "houston",
    headline: "Life Care Planning in Houston, Texas",
    content:
      `Houston is the seat of Harris County and home to one of the largest and most active state civil courts in the country. Harris County District Courts process a substantial volume of personal injury, oilfield injury, maritime, and medical malpractice cases. The U.S. District Court for the Southern District of Texas (S.D. Tex.), headquartered in Houston, is one of the busiest federal courts in the nation and handles significant maritime and industrial-injury litigation where life care planning testimony is frequently required.\n\nTexas follows a modified comparative fault standard with a 51% bar - plaintiffs who are found more than 50% responsible cannot recover. The Texas oilfield, petrochemical, and construction industries generate a distinctive case mix: high-severity injuries from industrial accidents, occupational exposure claims, and maritime personal injury matters under the Jones Act. Because Texas employers may decline workers' compensation coverage, many of these injuries are litigated in the civil courts, where the life care plan frames the future medical damages.\n\nHouston is home to the Texas Medical Center, one of the largest concentrations of hospitals and specialist care in the world, so the question for a Houston plan is rarely availability but rather documenting the rate each provider actually charges. Life care plans for catastrophic injury cases in the Houston area must reflect local costs for home health services, medical specialties, rehabilitation facilities, and durable medical equipment - all of which differ materially from national averages. ${ORG_NAME} prices Houston-market plans from providers serving the Houston-The Woodlands-Sugar Land metropolitan area.`,
    localCourts: "Harris County District Courts, S.D. Tex. (Houston Division), Texas Department of Insurance, Division of Workers' Compensation",
    commonCaseTypes: ["Personal Injury", "Workers' Compensation", "Oilfield/Industrial Injury", "Maritime/Jones Act", "Medical Malpractice"],
  },
];

export function getLocalContent(stateSlug: string, citySlug?: string): LocalContent | undefined {
  return localContentEntries.find(
    (entry) => entry.stateSlug === stateSlug && entry.citySlug === citySlug
  );
}
