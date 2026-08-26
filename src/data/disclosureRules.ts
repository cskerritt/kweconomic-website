import type { Faq } from "./types";

/**
 * Per-state framing for KWVRS expert services. Citation-free by policy: we do
 * not maintain primary-source legal citations on the public site to avoid the
 * mis-citing risk of stale or jurisdiction-mistaken references. Each entry
 * provides general state-name-flavored framing for SEO/GEO/AEO use plus
 * KWVRS service touchpoints.
 *
 * Attorneys should always verify the governing rule for their specific case
 * against primary sources. KWVRS does not provide legal advice.
 */
export type DisclosureRule = {
  stateSlug: string;
  stateName: string;
  /** 1-3 sentence general framing of the state's expert-service landscape - no rule numbers, no statute references, no case names. */
  plainSummary: string;
  /** 3-6 generic bullets about expert services in the state (process, common case types, regional considerations). */
  practiceNotes: string[];
  /** 3-5 FAQs that avoid rule numbers and case citations. */
  faqs: Faq[];
  dateModified: string;
};

/**
 * Helper: builds a default 3-FAQ block keyed by state name. Used so every
 * entry has a baseline of citation-free Q&A; entries can override or extend.
 */
function defaultFaqs(stateName: string, metros: string): Faq[] {
  return [
    {
      question: `Does KWVRS provide expert services for ${stateName} cases?`,
      answer: `Yes. KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in ${stateName}. We support plaintiff and defense counsel across personal injury, motor vehicle, workers' compensation, wrongful-death, matrimonial, and other case types with deliverables sized to settlement, mediation, demand-letter support, or pre-trial disclosure use. Attorneys are responsible for confirming the governing rule and timing for their specific case against primary sources; KWVRS does not provide legal advice.`,
    },
    {
      question: `What deliverables are available for ${stateName} matters?`,
      answer: `KWVRS provides full retained-expert reports across the Vocational, Economic, and Life Care disciplines for trial-track and settlement matters. The appropriate deliverable depends on the case posture and the disclosure framework that applies to the specific matter.`,
    },
    {
      question: `How is ${stateName}'s labor market handled in earning capacity analyses?`,
      answer: `KWVRS incorporates state-level and metro-level labor market data for ${stateName}, including wage benchmarks for the major metros (${metros}) and regional adjustments where the case warrants. The methodology references accepted vocational and forensic economic protocols and supports both pre-trial settlement and trial-track use depending on the engagement scope.`,
    },
  ];
}

export const disclosureRules: DisclosureRule[] = [
  {
    stateSlug: "alabama",
    stateName: "Alabama",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Alabama. The state sees a steady volume of personal injury, workers' compensation, and wrongful-death matters across its circuit courts, with major case origination in Birmingham, Mobile, Montgomery, and Huntsville.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Alabama with vocational evaluations, life care plans, and economic analyses sized to settlement, mediation, and pre-trial disclosure use.",
      "Common case types include personal injury, motor vehicle, workers' compensation, wrongful death, and product liability matters venued in Alabama circuit courts.",
      "Regional labor market data for Alabama is incorporated into earning capacity and wage projections, with metro-level adjustments where appropriate.",
      "Disclosure timing is typically set by the case's scheduling order; attorneys are responsible for confirming the governing rule for their specific case.",
    ],
    faqs: defaultFaqs("Alabama", "Birmingham, Mobile, Montgomery, Huntsville"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "alaska",
    stateName: "Alaska",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Alaska. The state's superior courts in Anchorage, Fairbanks, and Juneau handle personal injury, maritime, motor vehicle, and resource-industry cases that benefit from expert vocational and economic analysis.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Alaska across personal injury, maritime, oilfield, and motor vehicle matters with case-specific deliverables.",
      "Disclosure timing in Alaska superior courts is typically set by the pretrial scheduling order in the case.",
      "Regional labor market data for Alaska, including the major boroughs and judicial districts, is incorporated into earning capacity analyses.",
      "Retained-expert reports are available depending on case posture and disclosure scope.",
    ],
    faqs: defaultFaqs("Alaska", "Anchorage, Fairbanks, Juneau"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "american-samoa",
    stateName: "American Samoa",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in American Samoa. The High Court of American Samoa hears civil cases under territorial procedural rules, with case origination concentrated in Pago Pago.",
    practiceNotes: [
      "KWVRS supports counsel handling American Samoa matters with case-specific deliverables sized to the engagement scope.",
      "Disclosure timing and content requirements in territorial courts are typically set by the case's scheduling order.",
      "Retained-expert reports are available depending on case posture.",
    ],
    faqs: defaultFaqs("American Samoa", "Pago Pago"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "arizona",
    stateName: "Arizona",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Arizona. The state's superior courts handle a high volume of personal injury, motor vehicle, wrongful-death, and product liability cases across the major metros of Phoenix, Tucson, Mesa, and Chandler.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Arizona with vocational evaluations, life care plans, and economic analyses calibrated to the case's disclosure framework.",
      "Arizona's mandatory pre-trial disclosure framework calls for proactive identification and substance-of-opinion disclosure for retained experts; attorneys confirm the specific scope for their case.",
      "Regional labor market data for the Phoenix and Tucson metros is incorporated into earning capacity analyses, with adjustments for the state's other judicial divisions where appropriate.",
      "Full retained-expert reports are available for Arizona engagements.",
    ],
    faqs: defaultFaqs("Arizona", "Phoenix, Tucson, Mesa, Chandler"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "arkansas",
    stateName: "Arkansas",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Arkansas. The state's circuit courts handle personal injury, motor vehicle, workers' compensation, and product liability matters across the major metros of Little Rock, Fort Smith, Fayetteville, and Springdale.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Arkansas with vocational, economic, and life care expert deliverables.",
      "Common case types include personal injury, motor vehicle, workers' compensation, wrongful death, and matrimonial matters venued in Arkansas circuit courts.",
      "Regional labor market data for Arkansas's major metros is incorporated into earning capacity analyses.",
      "Disclosure timing is typically set by the case's scheduling order.",
    ],
    faqs: defaultFaqs("Arkansas", "Little Rock, Fort Smith, Fayetteville, Springdale"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "california",
    stateName: "California",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in California. The state's superior courts span the highest civil-litigation volume in the nation across Los Angeles, San Francisco, San Diego, Sacramento, and the broader Bay Area, Inland Empire, and Central Valley markets.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel across California's broad case mix: personal injury, motor vehicle, employment, workers' compensation, wrongful death, matrimonial, and complex product liability.",
      "California's expert disclosure framework involves a simultaneous exchange between parties; attorneys confirm the timing and content scope for their specific case.",
      "Regional labor market data for the LA, Bay Area, San Diego, Sacramento, Inland Empire, and Central Valley markets is incorporated into earning capacity analyses with metro-level adjustments.",
      "Full retained-expert reports for trial-track engagements are available.",
    ],
    faqs: defaultFaqs("California", "Los Angeles, San Francisco, San Diego, Sacramento, San Jose, Fresno"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "colorado",
    stateName: "Colorado",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Colorado. The state's district courts handle personal injury, motor vehicle, wrongful-death, and product liability cases across Denver, Colorado Springs, Aurora, and the Western Slope.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Colorado with vocational, economic, and life care deliverables.",
      "Colorado's case management framework includes simplified-procedure tracks for lower-value matters and standard tracks for complex cases; the appropriate deliverable scales to the track and case posture.",
      "Regional labor market data for the Front Range and the Western Slope is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Colorado engagements.",
    ],
    faqs: defaultFaqs("Colorado", "Denver, Colorado Springs, Aurora, Fort Collins"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "connecticut",
    stateName: "Connecticut",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Connecticut. The state's superior courts handle personal injury, motor vehicle, professional liability, and product liability cases across Hartford, New Haven, Stamford, Bridgeport, and the broader Fairfield County corridor.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Connecticut across the state's full civil case mix.",
      "Connecticut's expert disclosure timing is typically calibrated to the scheduling order in the case; attorneys confirm the specific deadline for their case.",
      "Regional labor market data for Connecticut's metros and the Fairfield County commuter market is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Connecticut engagements.",
    ],
    faqs: defaultFaqs("Connecticut", "Hartford, New Haven, Stamford, Bridgeport, Waterbury"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "delaware",
    stateName: "Delaware",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Delaware. The state's superior court and Court of Chancery handle a distinctive case mix that includes complex commercial litigation alongside personal injury and product liability matters concentrated in Wilmington and Dover.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Delaware across personal injury, product liability, employment, and matrimonial matters.",
      "Delaware's small bar and concentrated docket call for tightly scoped expert deliverables; KWVRS calibrates scope to the engagement.",
      "Regional labor market data for the Wilmington-Newark corridor and the Dover area is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Delaware engagements.",
    ],
    faqs: defaultFaqs("Delaware", "Wilmington, Dover, Newark"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "district-of-columbia",
    stateName: "District of Columbia",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in the District of Columbia. D.C.'s Superior Court and the U.S. District Court for D.C. handle a case mix shaped by federal-agency activity, federal-employee matters, and a broader civil docket including personal injury and product liability.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in D.C. matters in both Superior Court and the U.S. District Court for D.C.",
      "Disclosure scope and timing differ between Superior Court and the federal district court; attorneys confirm which framework applies to their case.",
      "Regional labor market data for the D.C. metro and the broader Washington commuter market is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for D.C. engagements.",
    ],
    faqs: defaultFaqs("District of Columbia", "Washington, Bethesda, Silver Spring, Arlington"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "florida",
    stateName: "Florida",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Florida. The state's circuit courts span one of the highest civil-litigation volumes in the country across Miami-Dade, Orlando, Tampa, Jacksonville, and the broader Gulf and Atlantic coasts.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Florida across personal injury, motor vehicle, premises liability, wrongful death, matrimonial, and product liability matters.",
      "Florida's pretrial disclosure framework now includes mandatory initial disclosures early in the case; attorneys confirm the specific scope and timing for their matter.",
      "Regional labor market data for South Florida, Central Florida, the Tampa Bay area, and the Panhandle is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Florida engagements.",
    ],
    faqs: defaultFaqs("Florida", "Miami, Orlando, Tampa, Jacksonville, Fort Lauderdale, St. Petersburg"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "georgia",
    stateName: "Georgia",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Georgia. The state's superior and state courts handle personal injury, motor vehicle, workers' compensation, and product liability cases concentrated in the Atlanta metro and supplemented by Savannah, Augusta, Columbus, and Macon.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Georgia across the state's broad civil case mix.",
      "Disclosure timing is typically set by the case management order; attorneys confirm the specific deadlines for their case.",
      "Regional labor market data for the Atlanta metro and Georgia's other major markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Georgia engagements.",
    ],
    faqs: defaultFaqs("Georgia", "Atlanta, Savannah, Augusta, Columbus, Macon"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "guam",
    stateName: "Guam",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Guam. Guam's Superior Court and the U.S. District Court of Guam handle territorial civil matters with a federal-influenced procedural framework.",
    practiceNotes: [
      "KWVRS supports counsel handling Guam matters with case-specific deliverables sized to the engagement scope.",
      "Disclosure timing in territorial courts is typically set by the case's scheduling order.",
      "Retained-expert reports are available for Guam engagements.",
    ],
    faqs: defaultFaqs("Guam", "Hagåtña, Dededo, Tamuning"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "hawaii",
    stateName: "Hawaii",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Hawaii. The state's circuit courts handle personal injury, motor vehicle, premises liability, wrongful-death, and tourism-related liability matters across the four judicial circuits with case origination concentrated in Honolulu.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Hawaii with vocational, economic, and life care deliverables.",
      "Hawaii's pretrial expert disclosure framework calls for written disclosures with structured timing; attorneys confirm the specific deadline and content scope for their case.",
      "Regional labor market data for the Hawaii metros and inter-island markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Hawaii engagements.",
    ],
    faqs: defaultFaqs("Hawaii", "Honolulu, Hilo, Kailua, Kaneohe"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "idaho",
    stateName: "Idaho",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Idaho. The state's district courts handle personal injury, motor vehicle, workers' compensation, agriculture-related liability, and product liability cases across Boise, Idaho Falls, Nampa, Meridian, and Pocatello.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Idaho across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order under the standard discovery framework.",
      "Regional labor market data for the Treasure Valley and Idaho's other major markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Idaho engagements.",
    ],
    faqs: defaultFaqs("Idaho", "Boise, Meridian, Nampa, Idaho Falls, Pocatello"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "illinois",
    stateName: "Illinois",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Illinois. The state's circuit courts span one of the country's highest civil dockets across Cook County (Chicago), DuPage, Lake, Will, and the downstate markets including Springfield and Peoria.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Illinois across personal injury, motor vehicle, employment, products, and complex commercial matters.",
      "Illinois uses a tiered expert-witness framework that distinguishes among lay witnesses, independent experts, and retained or controlled experts; the disclosure scope differs by category and attorneys confirm the specific category for their witness.",
      "Regional labor market data for the Chicago metro and downstate Illinois is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Illinois engagements.",
    ],
    faqs: defaultFaqs("Illinois", "Chicago, Aurora, Rockford, Joliet, Naperville, Springfield"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "indiana",
    stateName: "Indiana",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Indiana. The state's circuit and superior courts handle personal injury, motor vehicle, manufacturing-related liability, and workers' compensation cases concentrated in Indianapolis, Fort Wayne, Evansville, and South Bend.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Indiana across the state's case mix.",
      "Disclosure timing is typically set by the case management order; attorneys confirm the specific deadlines for their case.",
      "Regional labor market data for Indiana's major metros and the manufacturing corridors is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Indiana engagements.",
    ],
    faqs: defaultFaqs("Indiana", "Indianapolis, Fort Wayne, Evansville, South Bend"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "iowa",
    stateName: "Iowa",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Iowa. The state's district courts handle personal injury, motor vehicle, workers' compensation, agriculture, and product liability cases across Des Moines, Cedar Rapids, Davenport, Sioux City, and Iowa City.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Iowa across personal injury, motor vehicle, workers' compensation, and matrimonial matters.",
      "Disclosure timing and content scope are typically set by the case's scheduling order; attorneys confirm the specific deadlines for their case.",
      "Regional labor market data for Iowa's metros and rural markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Iowa engagements.",
    ],
    faqs: defaultFaqs("Iowa", "Des Moines, Cedar Rapids, Davenport, Sioux City"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "kansas",
    stateName: "Kansas",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Kansas. The state's district courts handle personal injury, motor vehicle, workers' compensation, agriculture, and product liability cases across Wichita, Overland Park, Kansas City (KS), Topeka, and Lawrence.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Kansas across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Wichita, Kansas City (KS), and Topeka metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Kansas engagements.",
    ],
    faqs: defaultFaqs("Kansas", "Wichita, Overland Park, Kansas City, Topeka"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "kentucky",
    stateName: "Kentucky",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Kentucky. The state's circuit courts handle personal injury, motor vehicle, workers' compensation, products, and matrimonial cases concentrated in Louisville, Lexington, Bowling Green, and Owensboro.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Kentucky across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Louisville and Lexington metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Kentucky engagements.",
    ],
    faqs: defaultFaqs("Kentucky", "Louisville, Lexington, Bowling Green, Owensboro"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "louisiana",
    stateName: "Louisiana",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Louisiana. The state's civil-law tradition shapes a distinctive procedural framework, and the district courts handle personal injury, maritime, motor vehicle, workers' compensation, and matrimonial cases across New Orleans, Baton Rouge, Shreveport, Lafayette, and Lake Charles.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Louisiana across the state's case mix.",
      "Louisiana's expert framework includes a structured pretrial admissibility-screening procedure; attorneys confirm the timing and content scope for their case.",
      "Regional labor market data for Louisiana's major metros and the Gulf Coast corridor is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Louisiana engagements.",
    ],
    faqs: defaultFaqs("Louisiana", "New Orleans, Baton Rouge, Shreveport, Lafayette, Lake Charles"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "maine",
    stateName: "Maine",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Maine. The state's superior courts handle personal injury, motor vehicle, products, maritime, and workers' compensation cases concentrated in Portland, Lewiston, Bangor, and South Portland.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Maine across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Portland metro and Maine's coastal and inland markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Maine engagements.",
    ],
    faqs: defaultFaqs("Maine", "Portland, Lewiston, Bangor, South Portland"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "maryland",
    stateName: "Maryland",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Maryland. The state's circuit courts handle personal injury, motor vehicle, products, employment, and matrimonial cases concentrated in Baltimore, the D.C. suburbs (Montgomery and Prince George's counties), and the Eastern Shore.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Maryland across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Baltimore-Washington corridor and the Maryland suburbs is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Maryland engagements.",
    ],
    faqs: defaultFaqs("Maryland", "Baltimore, Columbia, Silver Spring, Frederick"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "massachusetts",
    stateName: "Massachusetts",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Massachusetts. The state's superior courts handle personal injury, motor vehicle, products, professional liability, and complex commercial cases concentrated in Boston, Worcester, Springfield, and Cambridge.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Massachusetts across the state's broad case mix.",
      "Disclosure timing is typically set by the case management order in the case.",
      "Regional labor market data for the Boston metro and the broader New England market is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Massachusetts engagements.",
    ],
    faqs: defaultFaqs("Massachusetts", "Boston, Worcester, Springfield, Cambridge, Lowell"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "michigan",
    stateName: "Michigan",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Michigan. The state's circuit courts handle personal injury, motor vehicle (including no-fault auto matters), products, manufacturing-related liability, and workers' compensation cases concentrated in Detroit, Grand Rapids, Warren, and Ann Arbor.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Michigan across personal injury, motor vehicle (including auto no-fault), employment, products, and matrimonial matters.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Detroit metro, West Michigan, and the manufacturing corridors is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Michigan engagements.",
    ],
    faqs: defaultFaqs("Michigan", "Detroit, Grand Rapids, Warren, Sterling Heights, Ann Arbor"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "minnesota",
    stateName: "Minnesota",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Minnesota. The state's district courts handle personal injury, motor vehicle, products, workers' compensation, and matrimonial cases across the Twin Cities metro, Rochester, Duluth, and St. Cloud.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Minnesota across the state's case mix.",
      "Minnesota's framework calls for written expert disclosures with structured timing; attorneys confirm the specific deadlines and content scope for their case.",
      "Regional labor market data for the Twin Cities metro and Minnesota's other markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Minnesota engagements.",
    ],
    faqs: defaultFaqs("Minnesota", "Minneapolis, St. Paul, Rochester, Duluth, Bloomington"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "mississippi",
    stateName: "Mississippi",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Mississippi. The state's circuit courts handle personal injury, motor vehicle, products, workers' compensation, and matrimonial cases across Jackson, Gulfport, Hattiesburg, and Tupelo.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Mississippi across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Jackson and Gulf Coast metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Mississippi engagements.",
    ],
    faqs: defaultFaqs("Mississippi", "Jackson, Gulfport, Hattiesburg, Tupelo"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "missouri",
    stateName: "Missouri",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Missouri. The state's circuit courts handle personal injury, motor vehicle, products, workers' compensation, and matrimonial cases concentrated in the Kansas City and St. Louis metros plus Springfield, Columbia, and Independence.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Missouri across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Kansas City and St. Louis metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Missouri engagements.",
    ],
    faqs: defaultFaqs("Missouri", "Kansas City, St. Louis, Springfield, Columbia, Independence"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "montana",
    stateName: "Montana",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Montana. The state's district courts handle personal injury, motor vehicle, mining and resource-industry liability, agricultural, and workers' compensation cases across Billings, Missoula, Great Falls, Bozeman, and Helena.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Montana across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for Montana's metros and the resource-industry markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Montana engagements.",
    ],
    faqs: defaultFaqs("Montana", "Billings, Missoula, Great Falls, Bozeman, Helena"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "nebraska",
    stateName: "Nebraska",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Nebraska. The state's district courts handle personal injury, motor vehicle, agriculture-related liability, products, and workers' compensation cases concentrated in Omaha, Lincoln, Bellevue, and Grand Island.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Nebraska across the state's case mix.",
      "Nebraska's pretrial expert disclosure framework has been updated in recent years; attorneys confirm the current scope and timing for their case against primary sources.",
      "Regional labor market data for the Omaha and Lincoln metros and the rural agricultural markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Nebraska engagements.",
    ],
    faqs: defaultFaqs("Nebraska", "Omaha, Lincoln, Bellevue, Grand Island"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "nevada",
    stateName: "Nevada",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Nevada. The state's district courts handle personal injury, hospitality and premises liability, motor vehicle, and products cases concentrated in Las Vegas, Henderson, Reno, North Las Vegas, and Sparks.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Nevada across personal injury, hospitality, motor vehicle, products, employment, and matrimonial matters.",
      "Nevada's pretrial expert disclosure framework calls for structured written disclosures with sequencing tied to the case discovery cutoff; attorneys confirm the specific deadlines and content scope for their case.",
      "Regional labor market data for the Las Vegas and Reno metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Nevada engagements.",
    ],
    faqs: defaultFaqs("Nevada", "Las Vegas, Henderson, Reno, North Las Vegas, Sparks"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "new-hampshire",
    stateName: "New Hampshire",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in New Hampshire. The state's superior courts handle personal injury, motor vehicle, products, professional liability, and matrimonial cases across Manchester, Nashua, Concord, and Dover.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in New Hampshire across the state's case mix.",
      "Disclosure timing is typically set by the case structuring order in the case; attorneys confirm the specific deadlines for their matter.",
      "Regional labor market data for the New Hampshire metros and the Boston commuter market is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for New Hampshire engagements.",
    ],
    faqs: defaultFaqs("New Hampshire", "Manchester, Nashua, Concord, Dover"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "new-jersey",
    stateName: "New Jersey",
    plainSummary:
      "KWVRS is headquartered in Hackensack, New Jersey and provides vocational, economic, and life care expert services for attorneys handling matters venued throughout the state. New Jersey's superior courts handle one of the nation's highest civil dockets, including personal injury, motor vehicle, employment, professional liability, products, and matrimonial cases across Newark, Jersey City, Hackensack, Trenton, and Camden.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in New Jersey across the state's full civil case mix.",
      "New Jersey's expert disclosure framework calls for substantive written reports for retained experts; attorneys confirm the specific scope and timing for their case.",
      "Regional labor market data for the Northern New Jersey and Southern New Jersey markets is incorporated into earning capacity analyses, with metro-level adjustments where appropriate.",
      "KWVRS's New Jersey office handles intake and case management for matters across the state; full retained-expert reports are available across all disciplines.",
    ],
    faqs: defaultFaqs("New Jersey", "Newark, Jersey City, Hackensack, Trenton, Camden, Paterson"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "new-mexico",
    stateName: "New Mexico",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in New Mexico. The state's district courts handle personal injury, motor vehicle, products, oil and gas, and matrimonial cases concentrated in Albuquerque, Las Cruces, Rio Rancho, and Santa Fe.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in New Mexico across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Albuquerque metro and New Mexico's other markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for New Mexico engagements.",
    ],
    faqs: defaultFaqs("New Mexico", "Albuquerque, Las Cruces, Rio Rancho, Santa Fe"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "new-york",
    stateName: "New York",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in New York. The state's Supreme Court (its trial-level court of general jurisdiction) handles one of the country's highest civil dockets across the five New York City boroughs, Long Island, the Hudson Valley, and Upstate New York.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in New York across personal injury, medical malpractice, motor vehicle, premises liability, employment, products, matrimonial, and complex commercial matters.",
      "New York's pretrial expert disclosure framework calls for substance-of-opinions disclosure rather than a full federal-style report; attorneys confirm the timing and content scope for their case.",
      "Regional labor market data for New York City, Long Island, the Hudson Valley, and Upstate New York (including Buffalo, Rochester, Syracuse, and Albany) is incorporated into earning capacity analyses with metro-level adjustments.",
      "Full retained-expert reports are available for New York engagements.",
    ],
    faqs: defaultFaqs("New York", "New York City, Buffalo, Rochester, Yonkers, Syracuse, Albany"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "north-carolina",
    stateName: "North Carolina",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in North Carolina. The state's superior courts handle personal injury, motor vehicle, products, manufacturing-related liability, and workers' compensation cases concentrated in Charlotte, Raleigh, Greensboro, Durham, and Winston-Salem.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in North Carolina across the state's case mix.",
      "North Carolina's pretrial expert disclosure framework allows for an optional written report alongside interrogatory-driven disclosure; attorneys confirm the specific scope for their case.",
      "Regional labor market data for the Charlotte and Research Triangle (Raleigh-Durham-Chapel Hill) metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for North Carolina engagements.",
    ],
    faqs: defaultFaqs("North Carolina", "Charlotte, Raleigh, Greensboro, Durham, Winston-Salem"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "north-dakota",
    stateName: "North Dakota",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in North Dakota. The state's district courts handle personal injury, motor vehicle, oil and gas, agriculture, and workers' compensation cases concentrated in Fargo, Bismarck, Grand Forks, and Minot.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in North Dakota across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Fargo and Bismarck metros and the Bakken oil-field corridor is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for North Dakota engagements.",
    ],
    faqs: defaultFaqs("North Dakota", "Fargo, Bismarck, Grand Forks, Minot"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "northern-mariana-islands",
    stateName: "Northern Mariana Islands",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in the Commonwealth of the Northern Mariana Islands. The CNMI Superior Court hears civil cases under territorial procedural rules with case origination concentrated on Saipan.",
    practiceNotes: [
      "KWVRS supports counsel handling Northern Mariana Islands matters with case-specific deliverables sized to the engagement scope.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Retained-expert reports are available for CNMI engagements.",
    ],
    faqs: defaultFaqs("Northern Mariana Islands", "Saipan, Tinian, Rota"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "ohio",
    stateName: "Ohio",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Ohio. The state's courts of common pleas handle personal injury, motor vehicle, products, manufacturing-related liability, and workers' compensation cases concentrated in Columbus, Cleveland, Cincinnati, Toledo, and Akron.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Ohio across the state's case mix.",
      "Disclosure timing is typically set by the case management order.",
      "Regional labor market data for the Columbus, Cleveland, Cincinnati, and Toledo metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Ohio engagements.",
    ],
    faqs: defaultFaqs("Ohio", "Columbus, Cleveland, Cincinnati, Toledo, Akron, Dayton"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "oklahoma",
    stateName: "Oklahoma",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Oklahoma. The state's district courts handle personal injury, motor vehicle, oil and gas, products, and workers' compensation cases concentrated in Oklahoma City, Tulsa, Norman, and Broken Arrow.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Oklahoma across the state's case mix.",
      "Oklahoma's pretrial expert disclosure framework calls for detailed interrogatory-driven disclosures including supporting materials; attorneys confirm the specific content scope for their case.",
      "Regional labor market data for the Oklahoma City and Tulsa metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Oklahoma engagements.",
    ],
    faqs: defaultFaqs("Oklahoma", "Oklahoma City, Tulsa, Norman, Broken Arrow"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "oregon",
    stateName: "Oregon",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Oregon. The state's circuit courts handle personal injury, motor vehicle, products, employment, and matrimonial cases concentrated in Portland, Eugene, Salem, Gresham, and Hillsboro.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Oregon across the state's case mix.",
      "Oregon's expert framework is distinctive among states; attorneys confirm the scope and timing of expert disclosure for their specific case.",
      "Regional labor market data for the Portland metro and Oregon's other markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Oregon engagements.",
    ],
    faqs: defaultFaqs("Oregon", "Portland, Eugene, Salem, Gresham, Hillsboro"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "pennsylvania",
    stateName: "Pennsylvania",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Pennsylvania. The state's courts of common pleas handle personal injury, medical malpractice, motor vehicle, products, employment, and workers' compensation cases concentrated in Philadelphia, Pittsburgh, Allentown, Erie, and Reading.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Pennsylvania across the state's broad case mix.",
      "Pennsylvania's pretrial expert disclosure framework allows either an interrogatory-style response signed by the expert or a separate report; attorneys confirm the specific scope for their case.",
      "Regional labor market data for the Philadelphia and Pittsburgh metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Pennsylvania engagements.",
    ],
    faqs: defaultFaqs("Pennsylvania", "Philadelphia, Pittsburgh, Allentown, Erie, Reading"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "puerto-rico",
    stateName: "Puerto Rico",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Puerto Rico. Proceedings before the Tribunal de Primera Instancia and the Tribunal de Apelaciones may be conducted in Spanish or English, and the case mix includes personal injury, motor vehicle, products, employment, and matrimonial matters concentrated in San Juan, Bayamón, Carolina, and Ponce. Cases filed in the U.S. District Court for the District of Puerto Rico follow federal procedure.",
    practiceNotes: [
      "KWVRS supports counsel handling Puerto Rico matters in both Commonwealth courts and the U.S. District Court for the District of Puerto Rico.",
      "Disclosure timing differs between Commonwealth and federal proceedings; attorneys confirm which framework applies to their case.",
      "Regional labor market data for the San Juan metro and the broader Puerto Rico labor market is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Puerto Rico engagements.",
    ],
    faqs: defaultFaqs("Puerto Rico", "San Juan, Bayamón, Carolina, Ponce"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "rhode-island",
    stateName: "Rhode Island",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Rhode Island. The state's superior court handles personal injury, motor vehicle, products, professional liability, and matrimonial cases concentrated in Providence, Cranston, Warwick, and Pawtucket.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Rhode Island across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Providence metro and the broader southern New England market is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Rhode Island engagements.",
    ],
    faqs: defaultFaqs("Rhode Island", "Providence, Cranston, Warwick, Pawtucket"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "south-carolina",
    stateName: "South Carolina",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in South Carolina. The state's circuit courts handle personal injury, motor vehicle, products, manufacturing-related liability, and workers' compensation cases concentrated in Charleston, Columbia, Greenville, North Charleston, and Mount Pleasant.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in South Carolina across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Charleston, Columbia, and Greenville metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for South Carolina engagements.",
    ],
    faqs: defaultFaqs("South Carolina", "Charleston, Columbia, Greenville, North Charleston, Mount Pleasant"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "south-dakota",
    stateName: "South Dakota",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in South Dakota. The state's circuit courts handle personal injury, motor vehicle, agriculture, and workers' compensation cases concentrated in Sioux Falls, Rapid City, Aberdeen, and Brookings.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in South Dakota across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for South Dakota's metros and the rural agricultural markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for South Dakota engagements.",
    ],
    faqs: defaultFaqs("South Dakota", "Sioux Falls, Rapid City, Aberdeen, Brookings"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "tennessee",
    stateName: "Tennessee",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Tennessee. The state's circuit courts handle personal injury, motor vehicle, healthcare-related liability, products, and workers' compensation cases concentrated in Nashville, Memphis, Knoxville, Chattanooga, and Clarksville.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Tennessee across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Nashville, Memphis, Knoxville, and Chattanooga metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Tennessee engagements.",
    ],
    faqs: defaultFaqs("Tennessee", "Nashville, Memphis, Knoxville, Chattanooga, Clarksville"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "texas",
    stateName: "Texas",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Texas. The state's district courts span one of the country's highest civil-litigation volumes across Houston, San Antonio, Dallas, Austin, Fort Worth, and El Paso, with case origination shaped by the energy, healthcare, manufacturing, and tech sectors.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Texas across personal injury, motor vehicle, products, energy-industry, employment, and complex commercial matters.",
      "Texas's pretrial expert disclosure framework calls for affirmative disclosures tied to the discovery period rather than to the trial date; attorneys confirm the specific scope and timing for their case.",
      "Regional labor market data for the major Texas metros and the broader Texas Triangle is incorporated into earning capacity analyses with metro-level adjustments.",
      "Full retained-expert reports are available for Texas engagements.",
    ],
    faqs: defaultFaqs("Texas", "Houston, San Antonio, Dallas, Austin, Fort Worth, El Paso"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "us-virgin-islands",
    stateName: "U.S. Virgin Islands",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in the U.S. Virgin Islands. The Superior Court of the Virgin Islands hears civil cases under territorial procedural rules, with case origination across St. Croix, St. Thomas, and St. John.",
    practiceNotes: [
      "KWVRS supports counsel handling U.S. Virgin Islands matters with case-specific deliverables sized to the engagement scope.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Retained-expert reports are available for U.S. Virgin Islands engagements.",
    ],
    faqs: defaultFaqs("U.S. Virgin Islands", "Charlotte Amalie, Christiansted, Frederiksted"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "utah",
    stateName: "Utah",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Utah. The state's district courts handle personal injury, motor vehicle, products, employment, and matrimonial cases concentrated in Salt Lake City, West Valley City, Provo, Sandy, and Orem.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Utah across the state's case mix.",
      "Utah's pretrial expert disclosure framework gives the offering party a choice between producing a written report or making the expert available for deposition; attorneys confirm the specific scope for their case.",
      "Regional labor market data for the Wasatch Front and Utah's other markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Utah engagements.",
    ],
    faqs: defaultFaqs("Utah", "Salt Lake City, West Valley City, Provo, Sandy, Orem"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "vermont",
    stateName: "Vermont",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Vermont. The state's superior court handles personal injury, motor vehicle, products, and workers' compensation cases concentrated in Burlington, South Burlington, Rutland, and Essex Junction.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Vermont across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Burlington metro and Vermont's other markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Vermont engagements.",
    ],
    faqs: defaultFaqs("Vermont", "Burlington, South Burlington, Rutland, Essex Junction"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "virginia",
    stateName: "Virginia",
    plainSummary:
      "KWVRS maintains an office in Richmond, Virginia and provides vocational, economic, and life care expert services for attorneys handling matters venued throughout the state. Virginia's circuit courts handle personal injury, motor vehicle, products, military and federal-employee-related cases, and workers' compensation matters concentrated in Virginia Beach, Norfolk, Chesapeake, Richmond, and Newport News.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Virginia across the state's case mix.",
      "Virginia's pretrial expert disclosure framework is interrogatory-driven; attorneys confirm the specific scope and timing for their case.",
      "Regional labor market data for the Hampton Roads, Richmond, and Northern Virginia (D.C. metro) markets is incorporated into earning capacity analyses with metro-level adjustments.",
      "KWVRS's Richmond office handles intake and case management for Virginia and broader Mid-Atlantic matters.",
    ],
    faqs: defaultFaqs("Virginia", "Virginia Beach, Norfolk, Chesapeake, Richmond, Newport News, Alexandria"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "washington",
    stateName: "Washington",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Washington. The state's superior courts handle personal injury, motor vehicle, products, employment, technology-industry, and workers' compensation cases concentrated in Seattle, Spokane, Tacoma, Vancouver, and Bellevue.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Washington across the state's case mix.",
      "Washington's pretrial expert disclosure framework is interrogatory-driven; attorneys confirm the specific scope and timing for their case.",
      "Regional labor market data for the Puget Sound metro and Washington's other markets is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Washington engagements.",
    ],
    faqs: defaultFaqs("Washington", "Seattle, Spokane, Tacoma, Vancouver, Bellevue"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "west-virginia",
    stateName: "West Virginia",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in West Virginia. The state's circuit courts handle personal injury, motor vehicle, mining and resource-industry liability, products, and workers' compensation cases concentrated in Charleston, Huntington, Morgantown, and Parkersburg.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in West Virginia across the state's case mix.",
      "West Virginia's pretrial expert disclosure framework has been updated in recent years; attorneys confirm the current scope and timing for their case against primary sources.",
      "Regional labor market data for West Virginia's metros and the resource-industry corridors is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for West Virginia engagements.",
    ],
    faqs: defaultFaqs("West Virginia", "Charleston, Huntington, Morgantown, Parkersburg"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "wisconsin",
    stateName: "Wisconsin",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Wisconsin. The state's circuit courts handle personal injury, motor vehicle, products, employment, and workers' compensation cases concentrated in Milwaukee, Madison, Green Bay, Kenosha, and Racine.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Wisconsin across the state's case mix.",
      "Disclosure timing is typically set by the case's scheduling order.",
      "Regional labor market data for the Milwaukee and Madison metros is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Wisconsin engagements.",
    ],
    faqs: defaultFaqs("Wisconsin", "Milwaukee, Madison, Green Bay, Kenosha, Racine"),
    dateModified: "2026-05-03",
  },
  {
    stateSlug: "wyoming",
    stateName: "Wyoming",
    plainSummary:
      "KWVRS provides vocational, economic, and life care expert services for attorneys handling matters venued in Wyoming. The state's district courts handle personal injury, motor vehicle, energy and resource-industry liability, agriculture, and workers' compensation cases concentrated in Cheyenne, Casper, Laramie, and Gillette.",
    practiceNotes: [
      "KWVRS supports plaintiff and defense counsel in Wyoming across the state's case mix.",
      "Wyoming's pretrial expert disclosure framework calls for substantive written disclosures with sequencing tied to the case schedule; attorneys confirm the specific scope and timing for their case.",
      "Regional labor market data for Wyoming's metros and the energy-industry corridors is incorporated into earning capacity analyses.",
      "Full retained-expert reports are available for Wyoming engagements.",
    ],
    faqs: defaultFaqs("Wyoming", "Cheyenne, Casper, Laramie, Gillette"),
    dateModified: "2026-05-03",
  },
];

export function getDisclosureRule(stateSlug: string): DisclosureRule | undefined {
  return disclosureRules.find((r) => r.stateSlug === stateSlug);
}
