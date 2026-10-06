/**
 * State + city narrative helpers. These synthesize short factual paragraphs
 * from the courts / regulations / metro data so each geographic page (state
 * hub, service-state, city, service-city) has unique, economics-framed copy
 * without hand-authoring 56 state essays + 800 city blurbs.
 *
 * The sentence templates live in ./geo-prose.mjs, which scripts/prerender.mjs
 * imports too - this module only does the data joins. Citation-free by
 * policy; never prints unemployment rates or wage figures. Employer names
 * reach the prose only as context for the local earnings picture.
 *
 * The second half of the module is the page-only prose the geo templates
 * render below the hero: the venue paragraph and the city context paragraph
 * of the service x geo pages, the References block every geo template carries,
 * and the credential-chip links. The static shells do not render those blocks,
 * so they live here in TypeScript rather than in geo-prose.mjs. Keyed by
 * Service.slug and pinned per pillar in narratives.test.ts; the same house
 * rules apply (hyphens only, no figures, no statutes, no sister-discipline
 * vocabulary, no article in front of a place or city slot).
 */

import { ORG_NAME } from "@/lib/brand";
import { proseName } from "@/lib/service-prose.mjs";
import { getMetroLabor } from "./labor/metro-labor";
import { getCourtsByState, selectTrialCourts } from "./courts/state-courts";
import { circuitOfState } from "./courts/federal-districts";
import { getRegulationsByState } from "./regulations/state-regs";
import { credentials } from "./credentials";
import { refsToSources } from "./references";
import { caseTypeCourtSelection, getCaseType } from "./caseTypes";
import {
  buildCityNarrative,
  buildStateNarrative,
  cityAttr,
  LOCAL_TRADE_SECRET_LAW_UNSTATED,
  majorEmployers,
  placeAttr,
  placeName,
  placePossessive,
  prosePlace,
  type CityNarrativeOutput,
  type StateNarrativeOutput,
} from "./geo-prose.mjs";
import type { Source } from "./types";
import type { City, Service, State, StateCourtSystem } from "../types";

export {
  serviceStateDirectAnswer,
  serviceCityDirectAnswer,
  serviceStateLegalContext,
  serviceCityPlaceParagraph,
} from "./geo-prose.mjs";

export type StateNarrative = StateNarrativeOutput;
export type CityNarrative = CityNarrativeOutput;

/**
 * The courts the intellectual property case-type pages list for the claims
 * under a place's own law (caseTypes.ts caseTypeCourtSelection: the chancery,
 * business, and general-jurisdiction courts, two deep), so the pillar's state
 * and city prose and the case-type pages name the same courts.
 */
function ipTrialCourtNames(courts: StateCourtSystem | undefined): string[] {
  const ip = getCaseType("intellectual-property-infringement");
  if (!courts || !ip) return [];
  const { kind, limit } = caseTypeCourtSelection(ip);
  return selectTrialCourts(courts, kind, limit).map((c) => c.name);
}

export function getStateNarrative(state: State): StateNarrative {
  const courts = getCourtsByState(state.slug);
  const regs = getRegulationsByState(state.slug);
  return buildStateNarrative({
    orgName: ORG_NAME,
    stateName: state.name,
    stateSlug: state.slug,
    region: state.region,
    population: state.population,
    trialCourtName: courts?.trialCourts?.[0]?.name,
    ipTrialCourtNames: ipTrialCourtNames(courts),
    supremeCourt: courts?.supremeCourt,
    federalDistrictCount: courts?.federalDistricts?.length ?? 0,
    compensationForum: regs?.compensationForum,
  });
}

export interface CityNarrativeExtras {
  msaName?: string;
}

export function getCityNarrative(
  state: State,
  cityName: string,
  citySlug: string,
  county?: string,
  extras: CityNarrativeExtras = {},
): CityNarrative {
  const metro = getMetroLabor(state.slug, citySlug);
  const courts = getCourtsByState(state.slug);
  return buildCityNarrative({
    orgName: ORG_NAME,
    stateName: state.name,
    cityName,
    county,
    msaName: extras.msaName,
    employers: majorEmployers(metro?.topEmployers),
    hasMetroData: metro !== undefined,
    trialCourtName: courts?.trialCourts?.[0]?.name,
    ipTrialCourtNames: ipTrialCourtNames(courts),
  });
}

// ---------------------------------------------------------------------------
// Page-only prose for the service x state and service x city templates, and
// the References block for all four geo templates.
// ---------------------------------------------------------------------------

/** Registry ids behind the state hub and city page prose: the wage, household,
 * fringe-benefit, wage-growth, worklife, and discount-rate sources the shared
 * narrative names. */
const GEO_SOURCE_IDS = [
  "BLS_OES",
  "CENSUS_ACS",
  "BLS_ECEC",
  "BLS_ECI",
  "SKOOG_CIECKA_KRUEGER_2011",
  "TREASURY_YIELD",
];

interface VenueContext {
  /** After in/across ("the District of Columbia"). */
  place: string;
  /** Attributive ("District of Columbia law"). */
  attr: string;
  /** "the Superior Court, Law Division" or the generic fallback. */
  forum: string;
  /** The courts the intellectual property case-type pages list for the
   * claims under the place's own law ("the Court of Chancery and the Superior
   * Court"), or `forum` where the place lists none. */
  ipForum: string;
  compensationForum?: string;
  stateSlug: string;
  /** The federal circuit the place sits in ("Third", "D.C."); undefined for American Samoa. */
  circuit?: string;
  /** How many federal district courts serve the place (none for American Samoa). */
  federalDistrictCount: number;
}

interface ServicePageProse {
  /** The predicate of "Our economists ..." in the city context paragraph:
   * what the analysis measures and against what. Takes the attributive city
   * name ("Bronx"), never preceded by an article. */
  measures: (cityA: string) => string;
  /** Registry ids for the References block (src/data/references.ts). */
  sources: string[];
  /** Venue paragraph for the state page. Absent on the pillars whose damages
   * framework is the tort framework (injury, death, household services, life
   * care costing): those print the state's damagesContext and its workers'
   * compensation forum instead. */
  venue?: (ctx: VenueContext) => string;
  /** The object of "are familiar with ..." in the city context paragraph,
   * where "the court system and disclosure requirements that affect <work>
   * engagements in <state>" misplaces the pillar's forums (transfer pricing:
   * mostly federal). Takes the attributive state name. */
  familiar?: (attr: string) => string;
  /** The whole second sentence of the city context paragraph, in place of
   * "Our economists <measures>, and are familiar with <familiar>.", for a
   * pillar whose work only part of the roster lists as a specialty
   * (intellectual property: Christopher Skerritt's profile alone), so the
   * sentence describes the analysis and the report rather than the
   * economists. Takes the attributive city and state names. */
  context?: (cityA: string, attr: string) => string;
}

const SERVICE_PAGE_PROSE: Record<string, ServicePageProse> = {
  "lost-earnings-and-earning-capacity": {
    measures: (cityA) =>
      `measure lost earnings, fringe benefits, and post-injury earning capacity against wage data for the ${cityA} area and the plaintiff's own records`,
    sources: ["BLS_OES", "BLS_ECEC", "BLS_ECI", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"],
  },
  "wrongful-death-economic-loss": {
    measures: (cityA) =>
      `measure the decedent's earnings, fringe benefits, and household services against wage data for the ${cityA} area and the decedent's own records`,
    sources: [
      "BLS_OES",
      "BLS_ECEC",
      "BLS_CEX",
      "BLS_ATUS",
      "SKOOG_CIECKA_KRUEGER_2011",
      "NCHS_LIFE_TABLES",
      "TREASURY_YIELD",
    ],
  },
  "personal-injury-economic-damages": {
    measures: (cityA) =>
      `measure earnings, fringe benefits, and household services against wage data for the ${cityA} area and the plaintiff's own records`,
    sources: [
      "BLS_OES",
      "BLS_ECEC",
      "BLS_ATUS",
      "SKOOG_CIECKA_KRUEGER_2011",
      "BLS_CPI_MEDICAL",
      "NCHS_LIFE_TABLES",
      "TREASURY_YIELD",
    ],
  },
  "household-services-valuation": {
    measures: (cityA) =>
      `value each category of lost household services at the ${cityA}-area replacement wage for that task and at the hours the household's own composition and routine support`,
    sources: ["BLS_ATUS", "BLS_OES", "NCHS_LIFE_TABLES", "TREASURY_YIELD"],
  },
  "life-care-plan-cost-projection": {
    measures: (cityA) =>
      `carry each item of the life care plan forward at the medical cost growth appropriate to its category, discount it over the applicable life expectancy, and state and source any ${cityA}-area adjustment to a unit cost`,
    sources: ["BLS_CPI_MEDICAL", "BLS_CPI", "NCHS_LIFE_TABLES", "TREASURY_YIELD"],
  },
  "employment-and-wage-loss-damages": {
    measures: (cityA) =>
      `reconstruct back pay and front pay from the employee's own pay and benefit records and measure mitigation against wage data for the employee's occupation in the ${cityA} area`,
    sources: ["BLS_OES", "BLS_ECEC", "BLS_ECI", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"],
    venue: ({ place, forum }) =>
      `Employment damages claims arising in ${place} are heard in ${forum} and, where jurisdiction allows, in the federal district courts serving ${place}, often after an administrative charge has run its course. Back pay, front pay, and lost benefits are measured from the employee's own records and offset by interim earnings; whether prejudgment interest runs and how collateral payments are treated are questions of the governing law that counsel confirms, and the report presents each element so it can be adjusted to the remedy that applies.`,
  },
  "business-valuation": {
    measures: (cityA) =>
      `value the business from its own financial statements, tax returns, and governing agreements and from the ${cityA}-area market it serves`,
    sources: ["AICPA_SSVS1", "NACVA_STANDARDS"],
    venue: ({ place, attr }) =>
      `Valuation disputes arising in ${place} reach the civil courts through shareholder, partnership, and buy-sell litigation, the matrimonial courts through the division of marital property, and the federal district courts serving ${place} where jurisdiction allows. The standard of value, the valuation date, and the treatment of discounts for lack of control and marketability are set by the governing agreement and by ${attr} law as counsel confirms it; the report states each choice and presents the value so it can be recomputed under an alternative.`,
  },
  "lost-profits-and-commercial-damages": {
    measures: (cityA) =>
      `build the but-for revenue and cost path from the company's own financial history and the ${cityA}-area market it sells into, and tie each claimed loss to the conduct at issue`,
    sources: ["BLS_CPI", "TREASURY_YIELD"],
    venue: ({ place, attr, forum }) =>
      `Lost profits claims arising in ${place} are heard in ${forum} and, where jurisdiction allows, in the federal district courts serving ${place}. How firmly the lost profits must be proven, how the period of loss is bounded, and whether prejudgment interest runs on a commercial award are questions of the governing contract and of ${attr} law as counsel confirms it; the report separates the but-for revenue path, the avoided costs, and the mitigation offset so each can be tested on its own.`,
  },
  "fraud-and-asset-tracing": {
    measures: () =>
      `trace the flow of funds through the entity's own bank, ledger, and payment records and the accounts the funds moved into, and quantify the loss for each scheme identified`,
    sources: ["ACFE"],
    venue: ({ place, forum }) =>
      `Fraud and tracing engagements in ${place} arise in civil fraud, fiduciary, partnership, and matrimonial matters heard in ${forum}, in the federal district courts serving ${place}, and in insurance recoveries that never reach a courtroom. The tracing is built from the entity's own bank, ledger, and payment records rather than from wage or market data, and the evidence trail is documented so the same schedule can support a civil claim, an insurance claim, or a referral.`,
  },
  "transfer-pricing-expert-witness": {
    measures: (cityA) =>
      `test the prices charged between related companies against the arm's length standard, from the group's own intercompany agreements and financial records and from comparables selected for the transactions at issue, with ${cityA}-area market conditions entering only where a comparability adjustment calls for them`,
    sources: ["IRC_482", "TREAS_REG_1_482_1", "OECD_TP_GUIDELINES"],
    venue: ({ place, attr, forum }) =>
      `Transfer pricing disputes that involve ${place} reach several forums: the United States Tax Court and, on a refund claim, the federal district courts serving ${place} or the Court of Federal Claims for federal income tax; the ${attr} tax authority and its appeal process for a dispute over ${attr} tax; and ${forum} for the commercial, shareholder, and matrimonial claims that turn on an intercompany price. The arm's length analysis is built the same way for each forum; the forum sets the rule of decision, which counsel confirms, and the report presents the result so it can be applied under it.`,
    familiar: (attr) => `the forums and disclosure rules that apply to transfer pricing disputes involving ${attr} businesses`,
  },
  // Intellectual property damages (2026-10-06): the federal district courts
  // first, the Federal Circuit and the place's regional circuit for the
  // appeals, then the place's own court for the claims under its law, with
  // no claim about the trade secret law of the territories in
  // LOCAL_TRADE_SECRET_LAW_UNSTATED.
  "intellectual-property-damages": {
    measures: (cityA) =>
      `measure patent, trademark, copyright, and trade secret damages from the parties' own sales, cost, and license records, apportioned to the protected right, with ${cityA}-area market conditions entering only where the market for the accused product is local`,
    sources: ["PATENT_284", "LANHAM_ACT_1117", "COPYRIGHT_504", "DTSA_1836", "JURISDICTION_1338"],
    venue: ({ place, attr, ipForum, stateSlug, circuit, federalDistrictCount }) => {
      const placeP = prosePlace(place);
      const localClaims = LOCAL_TRADE_SECRET_LAW_UNSTATED.has(stateSlug)
        ? "the contract and license claims"
        : "the trade secret, unfair competition, contract, and license claims";
      const appeals = circuit
        ? `the United States Court of Appeals for the Federal Circuit for every appeal in a case with a patent claim, and the court of appeals for the ${circuit === "D.C." ? "District of Columbia" : circuit} Circuit for the others`
        : "the United States Court of Appeals for the Federal Circuit for every appeal in a case with a patent claim";
      const federal =
        federalDistrictCount > 0
          ? `the federal district court${federalDistrictCount === 1 ? "" : "s"} serving ${placeP} for the patent and copyright claims filed there, which only the federal courts may hear, and for the trademark and trade secret claims filed in federal court`
          : `a federal district court where venue lies for patent and copyright claims, which only the federal courts may hear, since ${placeP} has no federal district court of its own`;
      return `Intellectual property claims that involve ${placeP} reach several courts: ${federal}; ${appeals}; and ${ipForum} for ${localClaims} under ${attr} law brought on their own. The federal patent, trademark, and copyright measures do not change with the state, though the regional circuit's decisions govern how the copyright and trademark measures are applied, and ${placePossessive(place)} own law can govern the contract and license claims; the court fixes the interest and decides any enhancement of a patent or trademark award, and the report presents each measure so it can be applied to the claims the fact finder accepts.`;
    },
    context: (cityA, attr) =>
      `The analysis measures patent, trademark, copyright, and trade secret damages from the parties' own sales, cost, and license records, apportioned to the protected right, with ${cityA}-area market conditions entering only where the market for the accused product is local, and the report is built for the federal and ${attr} courts that hear intellectual property claims and for their disclosure rules.`,
  },
  "divorce-and-marital-financial-analysis": {
    measures: (cityA) =>
      `determine income available for support from the spouse's own records, value a marital business from its own statements and the ${cityA}-area market it serves, and trace separate and marital funds through accounts and assets`,
    sources: ["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_OES"],
    venue: ({ place, attr }) =>
      `Matrimonial matters in ${place} are heard in the family or domestic relations part of the trial courts, where income available for support, the value of a business interest, and the character of an asset as separate or marital are decided. Whether the jurisdiction divides property equitably or as community property, which valuation date applies, and how the goodwill of a professional practice is treated are questions of ${attr} law as counsel confirms it; the report presents each finding so it can be applied under either party's position.`,
  },
  "expert-rebuttal-and-report-review": {
    measures: (cityA) =>
      `test the opposing report's inputs against the record and the published data for the ${cityA} area, and quantify how its conclusion changes when each error is corrected`,
    sources: ["FRE_702", "DAUBERT", "BLS_OES", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD"],
    venue: ({ place, forum, compensationForum }) =>
      `A rebuttal engagement in ${place} reaches the same forum as the report it reviews: ${forum} for personal injury, wrongful death, employment, and commercial claims, the federal district courts serving ${place} where jurisdiction allows${
        compensationForum ? `, and the ${compensationForum} where the dispute is over wage-loss benefits` : ""
      }. The critique is written to the reliability standard that forum applies to expert opinion and to its disclosure practice, so it can be served as a rebuttal report or used to prepare cross-examination.`,
  },
};

const defaultMeasures = (cityA: string) =>
  `measure each component of the loss against the records that drive the claim and against data for the ${cityA} area`;

/**
 * The venue paragraph of a service x state page for the pillars whose forum
 * is not the tort damages framework (employment, the four commercial pillars,
 * transfer pricing, intellectual property, rebuttal). Returns undefined for the injury, death, household services, and
 * life care costing pillars, which print the state's damagesContext and
 * workers' compensation forum instead.
 */
export function serviceStateVenueParagraph(service: Service, state: State): string | undefined {
  const venue = SERVICE_PAGE_PROSE[service.slug]?.venue;
  if (!venue) return undefined;
  const courts = getCourtsByState(state.slug);
  const trial = courts?.trialCourts?.[0]?.name;
  const forum = trial ? `the ${trial}` : "the general-jurisdiction trial courts";
  const ipNames = ipTrialCourtNames(courts);
  return venue({
    place: placeName(state.name),
    attr: placeAttr(state.name),
    forum,
    ipForum: ipNames.length ? ipNames.map((n) => `the ${n}`).join(" and ") : forum,
    compensationForum: getRegulationsByState(state.slug)?.compensationForum,
    stateSlug: state.slug,
    circuit: circuitOfState(state.slug),
    federalDistrictCount: courts?.federalDistricts?.length ?? 0,
  });
}

/**
 * The local-context paragraph of a service x city page: where the firm serves
 * counsel, what the pillar's analysis measures and against what, and the forum
 * awareness sentence. The city name is used as written after "throughout" and
 * attributively ("Bronx-area") where it modifies a noun.
 */
export function serviceCityContextParagraph(service: Service, state: State, city: City): string {
  const cityA = cityAttr(city.name);
  const prose = SERVICE_PAGE_PROSE[service.slug];
  const lead = `${ORG_NAME} serves counsel throughout ${city.name} and the surrounding ${city.county || state.name} area.`;
  if (prose?.context) return `${lead} ${prose.context(cityA, placeAttr(state.name))}`;
  const measures = prose?.measures(cityA) ?? defaultMeasures(cityA);
  const familiar =
    prose?.familiar?.(placeAttr(state.name)) ??
    `the court system and disclosure requirements that affect ${proseName(service.shortName)} engagements in ${placeName(state.name)}`;
  return `${lead} Our economists ${measures}, and are familiar with ${familiar}.`;
}

/**
 * Registry-backed sources for a geo page's References block: the pillar's own
 * data and standards on a service x geo page, the shared narrative's sources
 * on the state hub and city page. Every id resolves through references.ts, so
 * an unregistered source can never ship.
 */
export function geoSources(service?: Service): Source[] {
  const ids = (service && SERVICE_PAGE_PROSE[service.slug]?.sources) || GEO_SOURCE_IDS;
  return refsToSources(ids);
}

// services.ts names credentials as a label set ("Forensic Economist", "NAFE",
// "MBA", "PhD"); credentials.ts keys them by a punctuated, sometimes
// slash-separated abbreviation ("MBA / M.A. / Ph.D."). Compare on letters and
// digits only and let any part of a slash-separated abbreviation match (the
// same rule CredentialState.tsx uses to list a pillar under a credential).
const normalizeCredential = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();

/** The credential x state page a service's credential chip links to, or
 * undefined for a label no credential page carries. */
export function credentialPagePath(label: string, stateSlug: string): string | undefined {
  const key = normalizeCredential(label);
  const cred = credentials.find((c) => c.abbreviation.split("/").map(normalizeCredential).includes(key));
  return cred ? `/credentials/${cred.slug}/${stateSlug}` : undefined;
}
