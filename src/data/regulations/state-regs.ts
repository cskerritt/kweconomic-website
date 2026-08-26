import type { StateRegulation } from "../../types";

/**
 * Citation-free per-state venue framing for life care plans. `careOversightAgency`
 * is the public body that administers workers' compensation (the forum, outside
 * civil court, where a plan is most often offered); for territories without a
 * knowable compensation forum it is the health department. `practiceContext` is
 * one or two general sentences on where these cases are heard. Primary-source
 * citations, rule numbers, and damage caps are intentionally omitted; attorneys
 * are responsible for confirming the governing framework for their case.
 */
export const stateRegulations: StateRegulation[] = [
  {
    stateSlug: "alabama",
    careOversightAgency: "Alabama Department of Labor, Workers' Compensation Division",
    practiceContext: "Personal injury and medical malpractice claims in Alabama are tried in the Circuit Courts, and disputed workers' compensation claims are also litigated there rather than before an administrative tribunal. A life care plan offered in either setting is priced for the injured person's own county.",
  },
  {
    stateSlug: "alaska",
    careOversightAgency: "Alaska Workers' Compensation Board",
    practiceContext: "Alaska's civil claims are heard in the Superior Court, while disputed workers' compensation claims go before the Alaska Workers' Compensation Board. Provider scarcity outside Anchorage means a plan must document where each service can actually be obtained and budget travel where it cannot.",
  },
  {
    stateSlug: "arizona",
    careOversightAgency: "Industrial Commission of Arizona",
    practiceContext: "Injury and malpractice claims in Arizona are tried in the Superior Court of each county. Workers' compensation claims are administered by the Industrial Commission of Arizona, with contested matters heard by its administrative law judges.",
  },
  {
    stateSlug: "arkansas",
    careOversightAgency: "Arkansas Workers' Compensation Commission",
    practiceContext: "Arkansas civil claims are heard in the Circuit Courts. Workers' compensation disputes are decided by administrative law judges of the Arkansas Workers' Compensation Commission, where future medical exposure is a frequent subject of life care testimony.",
  },
  {
    stateSlug: "california",
    careOversightAgency: "California Division of Workers' Compensation",
    practiceContext: "California's unified Superior Court hears personal injury and medical malpractice claims, and medical malpractice matters proceed under a long-standing state-specific framework that counsel should confirm. Workers' compensation claims are administered by the Division of Workers' Compensation and litigated before the Workers' Compensation Appeals Board.",
  },
  {
    stateSlug: "colorado",
    careOversightAgency: "Colorado Division of Workers' Compensation",
    practiceContext: "Colorado civil claims are tried in the District Courts. Workers' compensation is administered by the Division of Workers' Compensation, with contested claims heard by the state's administrative courts.",
  },
  {
    stateSlug: "connecticut",
    careOversightAgency: "Connecticut Workers' Compensation Commission",
    practiceContext: "Connecticut's Superior Court is the trial forum for personal injury and medical malpractice claims, the latter subject to a pre-suit good-faith review requirement. Workers' compensation claims proceed before the administrative law judges of the Workers' Compensation Commission.",
  },
  {
    stateSlug: "delaware",
    careOversightAgency: "Delaware Office of Workers' Compensation",
    practiceContext: "Delaware civil claims are tried in the Superior Court. Workers' compensation is administered by the Office of Workers' Compensation, and disputed claims are heard by the Industrial Accident Board.",
  },
  {
    stateSlug: "district-of-columbia",
    careOversightAgency: "DC Department of Employment Services, Office of Workers' Compensation",
    practiceContext: "The Superior Court of the District of Columbia hears personal injury and medical malpractice claims, with medical malpractice subject to a pre-suit notice and mediation process. Private-sector workers' compensation claims are administered by the Department of Employment Services.",
  },
  {
    stateSlug: "florida",
    careOversightAgency: "Florida Division of Workers' Compensation",
    practiceContext: "Florida's Circuit Courts hear personal injury and medical malpractice claims, the latter preceded by a mandatory pre-suit investigation period. Workers' compensation disputes are heard by the Office of the Judges of Compensation Claims rather than by the courts.",
  },
  {
    stateSlug: "georgia",
    careOversightAgency: "Georgia State Board of Workers' Compensation",
    practiceContext: "Georgia civil claims are tried in the Superior Courts and, for many injury matters, the State Courts. Workers' compensation claims are decided by the State Board of Workers' Compensation and its administrative law judges.",
  },
  {
    stateSlug: "hawaii",
    careOversightAgency: "Hawaii Disability Compensation Division",
    practiceContext: "Hawaii's Circuit Courts hear injury and malpractice claims, and medical malpractice claims are first submitted to a medical inquiry and conciliation panel. Workers' compensation is administered by the Disability Compensation Division, with appeals to the Labor and Industrial Relations Appeals Board.",
  },
  {
    stateSlug: "idaho",
    careOversightAgency: "Idaho Industrial Commission",
    practiceContext: "Idaho civil claims are tried in the District Courts, and medical malpractice claims pass through a pre-litigation screening panel. Workers' compensation claims are decided by the Idaho Industrial Commission.",
  },
  {
    stateSlug: "illinois",
    careOversightAgency: "Illinois Workers' Compensation Commission",
    practiceContext: "Illinois personal injury and medical malpractice claims are tried in the Circuit Courts, with Cook County among the busiest venues in the country. Workers' compensation claims are heard by arbitrators of the Illinois Workers' Compensation Commission.",
  },
  {
    stateSlug: "indiana",
    careOversightAgency: "Worker's Compensation Board of Indiana",
    practiceContext: "Indiana civil claims are tried in the Circuit and Superior Courts, and medical malpractice claims are first reviewed by a medical review panel before suit. Workers' compensation claims are decided by the Worker's Compensation Board of Indiana.",
  },
  {
    stateSlug: "iowa",
    careOversightAgency: "Iowa Division of Workers' Compensation",
    practiceContext: "Iowa civil claims are tried in the District Court in each county. Workers' compensation claims are heard by deputy commissioners of the Iowa Division of Workers' Compensation.",
  },
  {
    stateSlug: "kansas",
    careOversightAgency: "Kansas Division of Workers Compensation",
    practiceContext: "Kansas civil claims are tried in the District Courts, and medical malpractice screening panels are available on request. Workers' compensation claims are decided by administrative law judges of the Division of Workers Compensation.",
  },
  {
    stateSlug: "kentucky",
    careOversightAgency: "Kentucky Department of Workers' Claims",
    practiceContext: "Kentucky's Circuit Courts hear personal injury and medical malpractice claims. Workers' compensation claims are decided by administrative law judges of the Department of Workers' Claims.",
  },
  {
    stateSlug: "louisiana",
    careOversightAgency: "Louisiana Office of Workers' Compensation Administration",
    practiceContext: "Louisiana civil claims are tried in the parish District Courts, and medical malpractice claims against qualified providers go first to a medical review panel. Workers' compensation claims are heard by the Office of Workers' Compensation Administration.",
  },
  {
    stateSlug: "maine",
    careOversightAgency: "Maine Workers' Compensation Board",
    practiceContext: "Maine civil claims are tried in the Superior Court, and medical malpractice claims are screened by a pre-litigation panel. Workers' compensation claims are decided by the Maine Workers' Compensation Board.",
  },
  {
    stateSlug: "maryland",
    careOversightAgency: "Maryland Workers' Compensation Commission",
    practiceContext: "Maryland's Circuit Courts hear injury claims, and medical malpractice claims are first filed with the state's health care alternative dispute resolution office before proceeding to court. Workers' compensation claims are decided by the Maryland Workers' Compensation Commission.",
  },
  {
    stateSlug: "massachusetts",
    careOversightAgency: "Massachusetts Department of Industrial Accidents",
    practiceContext: "Massachusetts personal injury and medical malpractice claims are tried in the Superior Court, with malpractice claims screened by a tribunal early in the case. Workers' compensation claims proceed before the Department of Industrial Accidents.",
  },
  {
    stateSlug: "michigan",
    careOversightAgency: "Michigan Workers' Disability Compensation Agency",
    practiceContext: "Michigan civil claims are tried in the Circuit Courts, and medical malpractice claims require pre-suit notice to the defendant providers. Workers' compensation claims are heard by magistrates of the Workers' Disability Compensation Agency.",
  },
  {
    stateSlug: "minnesota",
    careOversightAgency: "Minnesota Department of Labor and Industry, Workers' Compensation Division",
    practiceContext: "Minnesota civil claims are tried in the District Courts. Workers' compensation is administered by the Department of Labor and Industry, with contested claims heard by compensation judges at the Office of Administrative Hearings.",
  },
  {
    stateSlug: "mississippi",
    careOversightAgency: "Mississippi Workers' Compensation Commission",
    practiceContext: "Mississippi's Circuit Courts hear personal injury and medical malpractice claims, the latter requiring pre-suit notice. Workers' compensation claims are decided by the Mississippi Workers' Compensation Commission.",
  },
  {
    stateSlug: "missouri",
    careOversightAgency: "Missouri Division of Workers' Compensation",
    practiceContext: "Missouri civil claims are tried in the Circuit Courts. Workers' compensation claims are heard by administrative law judges of the Division of Workers' Compensation.",
  },
  {
    stateSlug: "montana",
    careOversightAgency: "Montana Department of Labor and Industry, Employment Relations Division",
    practiceContext: "Montana civil claims are tried in the District Courts, and medical malpractice claims are reviewed by the Montana Medical Legal Panel before suit. Disputed workers' compensation claims are decided by the Workers' Compensation Court.",
  },
  {
    stateSlug: "nebraska",
    careOversightAgency: "Nebraska Workers' Compensation Court",
    practiceContext: "Nebraska civil claims are tried in the District Courts. Workers' compensation claims are heard by the Nebraska Workers' Compensation Court, a specialized court rather than an administrative agency.",
  },
  {
    stateSlug: "nevada",
    careOversightAgency: "Nevada Division of Industrial Relations",
    practiceContext: "Nevada personal injury and medical malpractice claims are tried in the District Courts. Workers' compensation is regulated by the Division of Industrial Relations, with contested claims heard by hearing and appeals officers.",
  },
  {
    stateSlug: "new-hampshire",
    careOversightAgency: "New Hampshire Department of Labor, Workers' Compensation Division",
    practiceContext: "New Hampshire civil claims are tried in the Superior Court. Workers' compensation claims are administered by the Department of Labor, with disputes heard by its hearing officers and the Compensation Appeals Board.",
  },
  {
    stateSlug: "new-jersey",
    careOversightAgency: "New Jersey Division of Workers' Compensation",
    practiceContext: "New Jersey personal injury and medical malpractice claims are tried in the Superior Court, Law Division, with malpractice claims requiring an affidavit of merit. Workers' compensation claims are decided by judges of compensation in the Division of Workers' Compensation, where a plan's future medical component is regularly contested.",
  },
  {
    stateSlug: "new-mexico",
    careOversightAgency: "New Mexico Workers' Compensation Administration",
    practiceContext: "New Mexico civil claims are tried in the District Courts, and medical malpractice claims against qualified providers go first to a medical review commission. Workers' compensation claims are decided by judges of the Workers' Compensation Administration.",
  },
  {
    stateSlug: "new-york",
    careOversightAgency: "New York State Workers' Compensation Board",
    practiceContext: "New York's Supreme Court is the trial-level forum for personal injury and medical malpractice claims despite its name, with the five New York City counties among the highest-volume venues in the country. Workers' compensation claims are decided by the New York State Workers' Compensation Board.",
  },
  {
    stateSlug: "north-carolina",
    careOversightAgency: "North Carolina Industrial Commission",
    practiceContext: "North Carolina civil claims are tried in the Superior Court. Workers' compensation claims, and tort claims against the state, are decided by the North Carolina Industrial Commission.",
  },
  {
    stateSlug: "north-dakota",
    careOversightAgency: "North Dakota Workforce Safety and Insurance",
    practiceContext: "North Dakota civil claims are tried in the District Courts. Workers' compensation is provided through the state's exclusive fund, Workforce Safety and Insurance, so future medical exposure is adjudicated within that system rather than before private carriers.",
  },
  {
    stateSlug: "ohio",
    careOversightAgency: "Ohio Bureau of Workers' Compensation",
    practiceContext: "Ohio personal injury and medical malpractice claims are tried in the Courts of Common Pleas. Workers' compensation is provided through the state fund administered by the Bureau of Workers' Compensation, with contested claims heard by the Industrial Commission of Ohio and appealable to the Courts of Common Pleas.",
  },
  {
    stateSlug: "oklahoma",
    careOversightAgency: "Oklahoma Workers' Compensation Commission",
    practiceContext: "Oklahoma civil claims are tried in the District Courts. Workers' compensation claims are decided by the Oklahoma Workers' Compensation Commission.",
  },
  {
    stateSlug: "oregon",
    careOversightAgency: "Oregon Workers' Compensation Division",
    practiceContext: "Oregon civil claims are tried in the Circuit Courts. Workers' compensation is administered by the Workers' Compensation Division, with disputed claims heard by administrative law judges and the Workers' Compensation Board.",
  },
  {
    stateSlug: "pennsylvania",
    careOversightAgency: "Pennsylvania Bureau of Workers' Compensation",
    practiceContext: "Pennsylvania personal injury and medical malpractice claims are tried in the Courts of Common Pleas, with malpractice claims requiring a certificate of merit and subject to venue rules counsel should confirm. Workers' compensation claims are decided by workers' compensation judges under the Bureau of Workers' Compensation.",
  },
  {
    stateSlug: "rhode-island",
    careOversightAgency: "Rhode Island Workers' Compensation Court",
    practiceContext: "Rhode Island civil claims are tried in the Superior Court. Workers' compensation claims are heard by the Workers' Compensation Court, a specialized court rather than an administrative board.",
  },
  {
    stateSlug: "south-carolina",
    careOversightAgency: "South Carolina Workers' Compensation Commission",
    practiceContext: "South Carolina civil claims are tried in the Circuit Court's Court of Common Pleas, and medical malpractice claims require pre-suit notice and mediation. Workers' compensation claims are decided by the South Carolina Workers' Compensation Commission.",
  },
  {
    stateSlug: "south-dakota",
    careOversightAgency: "South Dakota Department of Labor and Regulation, Division of Labor and Management",
    practiceContext: "South Dakota civil claims are tried in the Circuit Courts. Workers' compensation disputes are heard by the Department of Labor and Regulation's Division of Labor and Management.",
  },
  {
    stateSlug: "tennessee",
    careOversightAgency: "Tennessee Bureau of Workers' Compensation",
    practiceContext: "Tennessee personal injury and medical malpractice claims are tried in the Circuit Courts, with malpractice claims requiring pre-suit notice and a certificate of good faith. Workers' compensation claims are decided by the Court of Workers' Compensation Claims within the Bureau of Workers' Compensation.",
  },
  {
    stateSlug: "texas",
    careOversightAgency: "Texas Department of Insurance, Division of Workers' Compensation",
    practiceContext: "Texas personal injury and medical malpractice claims are tried in the District Courts, with malpractice claims requiring an early expert report. Workers' compensation is administered by the Division of Workers' Compensation, and because Texas employers may decline coverage, injured workers of non-subscribing employers bring their claims in the civil courts, where a life care plan frames the future medical damages.",
  },
  {
    stateSlug: "utah",
    careOversightAgency: "Utah Labor Commission",
    practiceContext: "Utah civil claims are tried in the District Courts, and medical malpractice claims pass through a pre-litigation panel. Workers' compensation claims are decided by administrative law judges of the Utah Labor Commission.",
  },
  {
    stateSlug: "vermont",
    careOversightAgency: "Vermont Department of Labor, Workers' Compensation Division",
    practiceContext: "Vermont civil claims are tried in the Superior Court. Workers' compensation claims are administered and decided by the Department of Labor's Workers' Compensation Division.",
  },
  {
    stateSlug: "virginia",
    careOversightAgency: "Virginia Workers' Compensation Commission",
    practiceContext: "Virginia civil claims are tried in the Circuit Courts, and medical malpractice review panels are available to either party before trial. Workers' compensation claims are decided by the Virginia Workers' Compensation Commission, where lifetime medical awards make future care costs a central issue.",
  },
  {
    stateSlug: "washington",
    careOversightAgency: "Washington Department of Labor and Industries",
    practiceContext: "Washington civil claims are tried in the Superior Courts. Workers' compensation is provided through the state fund administered by the Department of Labor and Industries, with contested decisions heard by the Board of Industrial Insurance Appeals.",
  },
  {
    stateSlug: "west-virginia",
    careOversightAgency: "West Virginia Offices of the Insurance Commissioner",
    practiceContext: "West Virginia personal injury and medical malpractice claims are tried in the Circuit Courts, with malpractice claims requiring pre-suit notice and a screening certificate of merit. Workers' compensation is regulated by the Offices of the Insurance Commissioner, with contested claims heard by the Workers' Compensation Board of Review.",
  },
  {
    stateSlug: "wisconsin",
    careOversightAgency: "Wisconsin Department of Workforce Development, Worker's Compensation Division",
    practiceContext: "Wisconsin civil claims are tried in the Circuit Courts, and medical malpractice claims pass through a mediation process before trial. Workers' compensation claims are decided by administrative law judges under the Department of Workforce Development.",
  },
  {
    stateSlug: "wyoming",
    careOversightAgency: "Wyoming Department of Workforce Services, Workers' Compensation Division",
    practiceContext: "Wyoming civil claims are tried in the District Courts. Workers' compensation is provided through the state fund administered by the Department of Workforce Services, with contested claims heard by the Office of Administrative Hearings or the Medical Commission.",
  },
  {
    stateSlug: "puerto-rico",
    careOversightAgency: "Puerto Rico State Insurance Fund Corporation (CFSE)",
    practiceContext: "Puerto Rico civil claims are tried in the Court of First Instance. Workers' compensation is provided through the State Insurance Fund Corporation, with disputed decisions reviewed by the Industrial Commission.",
  },
  {
    stateSlug: "us-virgin-islands",
    careOversightAgency: "Virgin Islands Department of Labor, Workers' Compensation Division",
    practiceContext: "Civil claims in the U.S. Virgin Islands are tried in the Superior Court of the Virgin Islands. Workers' compensation is administered by the Department of Labor, and specialist care not available on-island is priced for travel to the mainland.",
  },
  {
    stateSlug: "guam",
    careOversightAgency: "Guam Department of Labor, Workers' Compensation Commission",
    practiceContext: "Civil claims in Guam are tried in the Superior Court of Guam. Workers' compensation claims are administered by the Department of Labor's Workers' Compensation Commission, and tertiary care not available on-island is priced for off-island travel.",
  },
  {
    stateSlug: "american-samoa",
    careOversightAgency: "American Samoa Department of Health",
    practiceContext: "Civil claims in American Samoa are tried in the Trial Division of the High Court. Provider availability on-island is limited, so a plan documents which services are obtainable locally and budgets travel to Hawaii or the mainland for the rest.",
  },
  {
    stateSlug: "northern-mariana-islands",
    careOversightAgency: "CNMI Department of Health",
    practiceContext: "Civil claims in the Northern Mariana Islands are tried in the Commonwealth Superior Court. Provider availability on-island is limited, so a plan documents which services are obtainable locally and budgets travel to Guam, Hawaii, or the mainland for the rest.",
  },
];

export function getRegulationsByState(stateSlug: string): StateRegulation | undefined {
  return stateRegulations.find((r) => r.stateSlug === stateSlug);
}
