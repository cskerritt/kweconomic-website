import type { Faq, Source } from "./types";
import { refsToSources } from "./references";
import { expertInquiryOf } from "./regulations/state-regs";
import type { CourtSelection } from "./courts/state-courts";
import { LOCAL_TRADE_SECRET_LAW_UNSTATED, placePossessive, prosePlace } from "./geo-prose.mjs";

/**
 * KW Economics case types.
 *
 * Sixteen matters in which counsel retain a forensic economist. Each entry
 * is written from the economist's standpoint: what the economic loss claim
 * consists of (`lossComponents`), which components usually dominate and why
 * (`damagesExposure`), and how the economist builds the number
 * (`economicImpact`). Injury and death matters describe the earnings,
 * benefits, household services, and present value questions, not the medical
 * or vocational ones; the life care plan and the work-capacity opinions are
 * inputs prepared by other professionals.
 *
 * Copy rules: citation-free prose (no statute or rule cites), hyphens only,
 * no dollar figures, no invented statistics, and no claim that a named person
 * holds a membership or credential. `summaryShort`, `inShort`, and `steps`
 * follow the same house style as the long fields and are guarded by
 * caseTypes.test.ts. `relevantServices` lists pillar slugs
 * from services.ts; `relevantCredentials` uses the same label set as
 * services.ts (matched against credential slugs or abbreviations by the
 * templates). `sources` come from the registry in references.ts only.
 *
 * Build scripts (scripts/prerender.mjs, scripts/generate-sitemap.mjs) read
 * this file as text and pair `slug:` with `name:` in file order, so keep each
 * entry's `slug` and `name` as its first two fields.
 */
export type CaseTypeCategory =
  | "personal-injury"
  | "workers-comp"
  | "med-mal"
  | "wrongful-death"
  | "employment"
  | "commercial"
  | "family"
  | "tax"
  | "intellectual-property";

/**
 * Page framing for a matter that is not a damages claim. The case-type hub
 * and state templates (src/pages/templates/CaseTypeHub.tsx, CaseTypeState.tsx)
 * and the static shells (scripts/prerender.mjs) describe every case type in
 * economic-damages terms: "<name> Economic Damages Analysis", "What the
 * economic claim consists of", "Where the damages concentrate". A family-law
 * matter is an income, valuation, and tracing assignment, and a tax or
 * transfer pricing dispute is an arm's length or valuation question, so
 * those entries set these strings, and both render paths read them through
 * the helpers at the bottom of this file (caseTypeHubHeading,
 * caseTypeStateDescription, ...) and through src/lib/page-titles.mjs for the
 * <title> stems, in place of the shared damages framing wherever an entry
 * carries them (site audit 2026-09-05, F08). `{place}` and `{org}` are slots
 * the helpers fill with the place name (src/data/geo-prose.mjs placeName) and
 * the organization name; the service x case type x state lead also takes
 * `{work}` (the pillar's work phrase), `{matter}` (the lowercased case-type
 * name), and `{attr}` (the attributive place name), the courts sentence
 * takes `{courts}` (the trial courts the page lists), `{supremeCourt}`, and
 * `{stateSlug}`, the expert standard takes `{inquiry}` (the state's own
 * inquiry), and the framework paragraph takes `{circuitNote}`.
 */
export interface CaseTypeFraming {
  /** Hub <title> stem in place of titleBase ("Divorce Financial Analysis");
   * the shared builder appends the brand (src/lib/page-titles.mjs
   * caseTypeHubTitle). */
  titleStem: string;
  /** State-tier <title> stems, longest first, in place of titleBase and
   * "<shortName> Economist"; each is tried beside the full place name before
   * any takes the state abbreviation (caseTypeTitleStems). Kept distinct from
   * the service pillar's title labels so no two routes share a title. */
  stateTitleStems: string[];
  /** Hub H1 in place of `${name} Economic Damages Analysis`. */
  hubHeading: string;
  /** Hub meta description: a complete sentence of 110-160 characters. */
  hubDescription: string;
  /** State-tier H1 stem; the template renders `${stateHeadingStem} in ${place}`. */
  stateHeadingStem: string;
  /** State-tier meta description with a `{place}` slot; fits 160 characters
   * beside the longest place name. Also the state page's Service node
   * description. */
  stateDescription: string;
  /** State-tier lead paragraph with `{org}` and `{place}` slots. */
  stateLead: string;
  /** State-tier sentence that introduces the numbered steps, with a `{place}`
   * slot, in place of "the damages framework above decides which components
   * enter the total". */
  stateStepsIntro: string;
  /** State-tier framework paragraph with a `{place}` slot, in place of the
   * state's generalContext (fault, interest, and caps), which describes a
   * damages claim. */
  stateFramework: string;
  /** The local FAQ question over stateFramework, with a `{place}` slot, in
   * place of "How does {place}'s damages framework shape the economic
   * analysis?". */
  stateFrameworkQuestion: string;
  /** Section headings over lossComponents, damagesExposure, economicImpact,
   * and the state framework block. */
  sections: { components: string; concentration: string; method: string; framework: string };
  /** Lead of the service x case type x state page with `{org}`, `{work}`,
   * `{matter}`, `{place}`, and `{attr}` slots, in place of the shared "what
   * the loss claim consists of ... a present value built to <state> damages
   * rules" lead (src/pages/templates/ServiceCaseTypeState.tsx and
   * scripts/prerender.mjs, through caseTypePairStateLead). */
  pairStateLead: string;
  /** The courts answer of the state-tier courts FAQ and the service x case
   * type x state expert FAQ, as complete sentences with `{place}`,
   * `{courts}`, `{supremeCourt}`, and `{stateSlug}` slots, in place of
   * "<name> cases venued in {place} are heard in {courts}" and the appeal
   * sentence the templates add to it, where the matter is not heard only in
   * the state's trial courts (caseTypeStateCourts). It carries its own
   * appeals, so neither template appends the state's highest court. */
  courtsSentence?: string;
  /** The expert-standard paragraph of the state tier and the service x case
   * type x state page (the courts section and the FAQ that repeats it), in
   * place of the state's own text (src/data/regulations/state-regs.ts
   * expertStandard), whose closing sentence says how an economic damages
   * report meets the inquiry. `{inquiry}` is the state's inquiry alone
   * (expertInquiryOf), `{place}` the place name (caseTypeExpertStandard). */
  expertStandard: string;
  /** The close of the service x case type x state framework FAQ, with an
   * optional `{attr}` slot, in place of "The report presents past and future
   * amounts separately, states every rate and table with its source, ..."
   * (caseTypePairStateFrameworkTail). */
  pairStateFrameworkTail: string;
  /** Text the framework paragraph's `{circuitNote}` slot takes, with
   * `{place}` and `{circuit}` slots ("the Second Circuit"); empty where the
   * place sits in no federal circuit (caseTypeStateFramework). */
  circuitNote?: string;
  /** For a matter whose forums are not the state's courts: the venue
   * vocabulary and the forums listed ahead of the state's trial courts. */
  forums?: CaseTypeForums;
}

/**
 * The forums a framing entry lists ahead of the state's trial courts, and the
 * headings and questions that name them (caseTypeVenuesHeading,
 * caseTypeStateCourtsQuestion, caseTypePairStateExpertQuestion,
 * caseTypeStateForums). Each list item is `label` and `description`, never
 * `slug` or `name`, because build scripts read this file as text.
 */
export interface CaseTypeForums {
  /** Noun of the courts section heading: "<State> {noun} and expert standards". */
  noun: string;
  /** The state-tier courts FAQ question, with a `{place}` slot, in place of
   * "Which <State> courts hear <matter> cases?". */
  courtsQuestion: string;
  /** The service x case type x state expert FAQ question, with `{place}` and
   * `{work}` slots, in place of "What do <attr> courts ask of <work> before
   * it reaches the fact finder?". */
  expertQuestion: string;
  /** Forums printed before the state's trial courts under "Where these cases
   * are heard"; `{place}` and `{attr}` slots, and on a venue-framed entry
   * also `{federalCourtsName}` (the place's federal district courts, without
   * the article) and `{circuitName}` ("Third", "District of Columbia"). An
   * item that `requires` the place's federal district courts or its circuit
   * is left out where the place has none (American Samoa). */
  list: { label: string; description: string; requires?: "districts" | "circuit" }[];
  /** How many of the state's trial courts follow the forums. */
  trialCourtLimit: number;
}

/**
 * Page framing for a damages claim whose measures and forums are not the
 * state's: an intellectual property claim, whose damages the federal
 * statutes set for patents, trademarks, and copyrights wherever the case is
 * heard, and whose patent and copyright claims only the federal district
 * courts may hear. Unlike CaseTypeFraming it leaves the hub title, the H1s,
 * and the section headings to the shared damages strings (it is a damages
 * claim) and replaces only what the shared strings misplace: the state
 * courts named as the forum, the state's tort, fault, and interest rules
 * named as the damages framework, and the present value named as the
 * product. The caseType* helpers read it after `framing`, on the hub, the
 * state tier, and the service x case type x state tier, and the static
 * shells read the same helpers. Slots are CaseTypeFraming's, plus
 * `{federalCourts}` ("the United States District Court for the District of
 * New Jersey"), `{circuit}` ("the United States Court of Appeals for the
 * Third Circuit"), `{stateClaims}` (the claims under the place's own law
 * that its courts hear, from `stateClaims`), and the running-prose place
 * forms `{placeP}` ("the U.S. Virgin Islands") and `{placePoss}` ("the U.S.
 * Virgin Islands'", "Texas's"), which src/data/geo-prose.mjs prosePlace() and
 * placePossessive() derive from `{place}`; the meta description keeps
 * `{place}`. Keys are never `slug` or `name`, because build scripts read
 * this file as text.
 */
export interface CaseTypeVenueFraming {
  /** Hub meta description (140-160 characters) in place of "... how the present value is built". */
  hubDescription: string;
  /** State-tier meta description with one `{place}` slot, 140-160 characters beside every place name. */
  stateDescription: string;
  /** State-tier lead with `{org}`, `{place}`, and `{attr}` slots. */
  stateLead: string;
  /** State-tier sentence over the numbered steps, with a `{place}` slot. */
  stateStepsIntro: string;
  /** State-tier framework paragraph with a `{place}` slot, in place of the state's generalContext. */
  stateFramework: string;
  /** The local FAQ question over the framework paragraph, with a `{place}` slot. */
  stateFrameworkQuestion: string;
  /** Lead of the service x case type x state page (`{org}`, `{work}`, `{matter}`, `{place}`, `{attr}`). */
  pairStateLead: string;
  /** The service x case type x state framework FAQ question, with `{place}`
   * and `{work}` slots, in place of "How does the <attr> damages framework
   * shape <work> in <matter> case?". */
  pairStateFrameworkQuestion: string;
  /** The close of that FAQ's answer, with an `{attr}` slot. */
  pairStateFrameworkTail: string;
  /** The courts answer, as complete sentences carrying the federal and state
   * appeals, for a place with federal district courts: `{place}`, `{attr}`,
   * `{federalCourts}`, `{circuit}`, `{courts}`, `{supremeCourt}`, and
   * `{stateClaims}`. */
  courtsSentence: string;
  /** The same answer for a place with no federal district court of its own
   * (American Samoa), with the same slots less `{federalCourts}` and
   * `{circuit}`. */
  courtsSentenceNoDistrict: string;
  /** The expert-standard paragraph, with `{place}` and `{inquiry}` slots (caseTypeExpertStandard). */
  expertStandard: string;
  /** What `{stateClaims}` reads: `stated` names the place's trade secret law
   * among the claims its courts hear, `unstated` makes no claim about it, for
   * the places in LOCAL_TRADE_SECRET_LAW_UNSTATED (src/data/geo-prose.mjs). */
  stateClaims: { stated: string; unstated: string };
  /** The courts the state tier lists ahead of the state's trial courts, and the questions that name them. */
  forums: CaseTypeForums;
  /** The References block of the case-type x state page, and the case
   * type's part of the service x case type x state page's block: the
   * statutes and rules behind the forum, framework, and expert-standard copy
   * both pages print (caseTypeStateSources, caseTypePairStateSources), in
   * place of the first five hub sources. */
  stateSources: Source[];
  /** The sources behind the exposure paragraph (`damagesExposure`), which
   * the service x case type x state page prints and the case-type x state
   * page does not; caseTypePairStateSources adds them. */
  exposureSources: Source[];
}

export interface CaseType {
  slug: string;
  name: string;
  /** Short form of the name for the length-budgeted titles: the attorney
   * journey headings ("Auto Accident: Is an Economist Needed?"), the service
   * x case-type pair titles ("Lost Earnings Expert for Auto Accident"), and
   * the state tier's second stem where the full stem cannot fit beside the
   * place ("Discrimination Economist in North Carolina"); at most 20
   * characters (src/lib/attorney-stages.ts SHORT_NAME_MAX). Equals the name
   * where the name already fits; otherwise a whole-word part of the name or
   * a standard short form ("Auto Accident", "Workers' Comp"). */
  shortName: string;
  /** Short form the attorney journey headings and descriptions take in place
   * of `shortName`, where the pair titles' short form would leave the
   * journey's query term out ("Transfer Pricing: Economist at Deposition"
   * rather than "Tax Dispute: ..."); at most SHORT_NAME_MAX characters
   * (src/lib/attorney-stages.ts). */
  journeyShortName?: string;
  /** What the trial-stage journey description says the economist explains,
   * in place of "explaining present value", for a damages claim whose trial
   * seldom turns on a present value ("explaining the royalty"). */
  journeyTrialFocus?: string;
  category: CaseTypeCategory;
  /** SERP title stem, always `${name} Economist` ("Wrongful Death
   * Economist"): the hub appends the brand, so the full keyword stays on the
   * hub, and the state tier appends the place (src/lib/page-titles.mjs
   * caseTypeStateTitle, which falls back to `${shortName} Economist` and then
   * to the state abbreviation only where no stem fits beside the full state
   * name inside the 60-character tag); keep it at or under 45 characters. */
  titleBase: string;
  /** ISO dates for the Article schema and the byline. `dateModified` moves
   * whenever the entry's copy changes. */
  datePublished: string;
  dateModified: string;
  summary: string;
  /** One- or two-sentence definition of the claim, rendered on the case-type x
   * state pages in place of the hub's full summary and section prose. */
  summaryShort: string;
  /** Three one-line takeaways (components, records, how the number is built)
   * rendered as the "In short" list under the hub lead. */
  inShort: string[];
  /** Four numbered steps (base, projection, offsets, present value) that make
   * the "How the analysis is built" section liftable as a list. */
  steps: string[];
  /** What the economic claim is made of and which records drive it. */
  lossComponents: string;
  /** Which components usually dominate the number and why. */
  damagesExposure: string;
  /** How the economist builds the figure: base, projection, offsets, present value. */
  economicImpact: string;
  relevantServices: string[];
  relevantCredentials: string[];
  faqs: Faq[];
  sources: Source[];
  /** Set only where the shared economic-damages framing misdescribes the
   * matter (family law, tax and transfer pricing); entries without it keep
   * the templates' defaults. */
  framing?: CaseTypeFraming;
  /** Set only on a damages claim the state's courts do not hear alone and
   * the state's damages rules do not govern (intellectual property); see
   * CaseTypeVenueFraming. Never set together with `framing`. */
  venueFraming?: CaseTypeVenueFraming;
}

export const caseTypes: CaseType[] = [
  {
    slug: "personal-injury",
    name: "Personal Injury",
    shortName: "Personal Injury",
    category: "personal-injury",
    titleBase: "Personal Injury Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A personal injury economic claim consists of the earnings and fringe benefits the injury has taken away, the household work the person can no longer do, and the present value of the future care the record supports, each tied to the person's own records.",
    inShort: [
      "The claim consists of past and future lost earnings, lost fringe benefits, household services, and the present value of future care.",
      "Tax, wage, benefit, and personnel records set the base; the medical and work-capacity opinions in the record set the post-injury path.",
      "Each future stream is projected with stated growth and discounted to present value, with contested assumptions shown as ranges.",
    ],
    steps: [
      "Establish the but-for earnings and fringe benefit base from the tax, wage, benefit, and personnel records, or from occupational data for a career still in training.",
      "Project the base over a statistically expected worklife with a stated wage growth rate and compare it with the post-injury path the record supports.",
      "Value household services from time-use data and local replacement rates, and price the future care in the life care plan item by item with medical cost growth.",
      "Discount every future stream to present value at a stated rate and show the sensitivity of the total to the contested assumptions.",
    ],
    summary:
      "Personal injury matters range from orthopedic injuries with a defined recovery to permanent impairments that end a career. The economic claim is built from the injured person's earnings history, the work the injury has taken away or reduced, the fringe benefits that came with that work, the household work the person can no longer do, and the cost of the future care the treating providers or a life care plan have identified. The economist's job is to state each of those components, tie it to the record, and reduce the future stream to a present value the court can use.",
    lossComponents:
      "The claim typically consists of past lost earnings from the date of injury to the date of analysis, future lost earnings or reduced earning capacity across the person's expected worklife, lost fringe benefits such as employer retirement contributions and health insurance, the replacement cost of household services the person can no longer perform, and the present value of future medical and care costs when a life care plan or treating recommendations exist. The records that drive the number are tax returns, W-2s and pay stubs, personnel and union files, benefit plan documents, and the medical or work-capacity opinions that define what the person can do after the injury.",
    damagesExposure:
      "Which component dominates depends on the person's age, occupation, and residual capacity. For a young worker who can no longer perform a skilled trade, future earnings loss over a long worklife usually outweighs everything else. For a person who returns to work at reduced hours or lower pay, the loss is the gap between the but-for path and the post-injury path, and the size of that gap is the contested question. Where a life care plan exists, its present value is often the largest single figure in the report, and household services losses can be substantial when the injured person did most of the home's unpaid work.",
    economicImpact:
      "The economist establishes the but-for earnings base from the earnings history and, for a person early in a career, from occupational earnings data for the path they were on. That base is projected over a statistically expected worklife with wage growth, then compared with a post-injury path drawn from actual post-injury earnings or from the work-capacity opinions in the record. Fringe benefits are valued from plan documents or published employer cost data, household services from time-use data and local replacement rates, and future care from the life care plan priced item by item with medical cost growth. Every future stream is discounted to present value with the rate assumption stated, and contested assumptions are shown as sensitivity ranges so counsel and the fact finder can see what moves the number.",
    relevantServices: ["personal-injury-economic-damages", "lost-earnings-and-earning-capacity", "household-services-valuation", "life-care-plan-cost-projection", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "When does a personal injury case need an economist?",
        answer:
          "When the injury has removed the person from work for more than a short period, changed what they can earn, created ongoing care costs, or ended their ability to do household work. If the only claim is a few weeks of documented lost pay, counsel can often present it from the pay records alone. Once the loss runs into the future, the projection, growth, and present value questions call for an economic analysis.",
      },
      {
        question: "What records should be gathered before the economist is retained?",
        answer:
          "Several years of tax returns, W-2s or 1099s, recent pay stubs, the employer's personnel file and benefit summaries, union or pension records, and the medical opinions or work-capacity findings that describe what the person can do now. For self-employed claimants, business tax returns and financial statements replace the wage records.",
      },
      {
        question: "How is reduced earning capacity different from lost earnings?",
        answer:
          "Lost earnings measure what the person has actually not been paid. Earning capacity measures what the person could reasonably have earned along the path they were on compared with what they can earn now, even if they are working. The economist models both paths and reports the difference, stating the basis for each path.",
      },
      {
        question: "Does the economist prepare the life care plan?",
        answer:
          "No. The life care plan is prepared by a medical or rehabilitation professional and lists the future care items, their frequency, and their unit cost. The economist takes that document as an input, applies medical cost growth over the plan horizon, and reduces the stream to present value. The economist does not opine on what care is needed.",
      },
      {
        question: "How does the analysis handle a person who returned to work?",
        answer:
          "The post-injury earnings become the mitigation path. The economist compares them with the but-for projection year by year, accounts for any lost benefits or reduced advancement, and reports the remaining gap. A return to work reduces the claim; it does not eliminate it if the new path pays less or is less secure.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS", "CDC_LIFE_TABLES", "TREASURY_YIELD"]),
  },
  {
    slug: "wrongful-death",
    name: "Wrongful Death",
    shortName: "Wrongful Death",
    category: "wrongful-death",
    titleBase: "Wrongful Death Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A wrongful death economic claim measures what the decedent would have contributed to the household over an expected life: earnings and benefits net of personal consumption, household services, and support to each dependent, reduced to present value under the framework counsel identifies.",
    inShort: [
      "The claim consists of net lost earnings and benefits, the replacement value of household services, and support to each dependent over its period.",
      "The decedent's tax and wage records, the household's composition and expenditures, and the services provided at home drive the number.",
      "Personal consumption is deducted from published expenditure data, and every future stream is discounted to present value at a stated rate.",
    ],
    steps: [
      "Establish the decedent's earnings and fringe benefit base from the tax, wage, and benefit records.",
      "Project the base over a worklife expectancy with a stated wage growth rate.",
      "Deduct personal consumption from published household expenditure data and add household services and support to each dependent over its period.",
      "Discount every future stream to present value at a stated rate and show the sensitivity of the total to the contested assumptions.",
    ],
    summary:
      "In a wrongful death matter the economic claim measures what the decedent would have contributed to the household over the rest of an expected life, not what the decedent would have earned in isolation. The analysis projects earnings and fringe benefits, deducts the share the decedent would have consumed personally, adds the value of household services and, where recoverable, other forms of support, and reduces the total to present value for the survivors or the estate as the governing framework requires.",
    lossComponents:
      "The components are the decedent's lost earnings and fringe benefits over a projected worklife, a personal consumption deduction that removes the portion of income the decedent would have spent on themselves, the replacement value of household services the decedent provided, lost financial support to dependents measured over each dependent's period of dependency, and in some frameworks the accumulation the decedent would have left to the estate. The records that drive the analysis are the decedent's tax returns, wage and benefit records, the household's composition and expenditures, and documentation of the services and care the decedent provided at home.",
    damagesExposure:
      "For a working-age decedent with dependents, net lost earnings and benefits are usually the largest component, and the personal consumption deduction is the assumption most likely to be contested because it scales the whole earnings figure. Household services can approach or exceed the earnings loss when the decedent was a full-time homemaker or a caregiver for a child or disabled family member. The length of the projection matters: life and worklife expectancy, the retirement age assumed, and whether support continues past a child's majority all change the total materially.",
    economicImpact:
      "The economist builds the earnings base from the decedent's history and, where a career was interrupted early, from occupational data for the path the decedent was on, then projects it over a worklife expectancy with wage growth. Personal consumption is derived from household expenditure data adjusted to the household's size and income, and household services from time-use data and replacement wage rates for the tasks performed. Support to each survivor is measured over that survivor's expected period of dependency, and the future streams are discounted to present value with the rate stated. Because states differ on which components are recoverable and by whom, the report is organized to the framework counsel identifies and presents each component separately so it can be included or excluded as the law requires.",
    relevantServices: ["wrongful-death-economic-loss", "household-services-valuation", "lost-earnings-and-earning-capacity", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "How is the personal consumption deduction determined?",
        answer:
          "From published household expenditure data, adjusted for the number of people in the household and the household's income level. The deduction represents the share of income the decedent would have spent on personal needs rather than on the family. The economist states the percentage used and its source, and shows how the total changes if a different percentage is applied.",
      },
      {
        question: "Does the analysis value a homemaker's contribution?",
        answer:
          "Yes. The economist measures the hours of household work the decedent performed, using the household's own account and time-use data for a person of similar circumstances, and values those hours at the cost of replacing them with paid services. This component stands on its own and does not depend on the decedent having earned wages.",
      },
      {
        question: "How long is support projected for each survivor?",
        answer:
          "Over the period each survivor would reasonably have depended on the decedent: for a spouse, typically through the decedent's expected life or worklife; for a child, through the age of majority or the completion of education, as the record and the governing framework support. The report presents the periods separately so counsel can address them individually.",
      },
      {
        question: "What if the decedent was self-employed or worked irregularly?",
        answer:
          "The economist reconstructs the earnings base from business tax returns, financial statements, invoices, and bank records, and separates the decedent's labor from the return on capital in the business. Where the history is short, occupational earnings data for comparable work supplements the record. The report states the reconstruction method so it can be examined.",
      },
      {
        question: "Can the report be structured for both the estate and the survivors?",
        answer:
          "Yes. When the governing framework separates the estate's claim from the survivors' claims, the report presents the components applicable to each so the same underlying figures support both without double counting.",
      },
    ],
    sources: refsToSources(["CDC_LIFE_TABLES", "BLS_CPS", "BLS_CEX", "BLS_ATUS", "CENSUS_ACS", "TREASURY_YIELD"]),
  },
  {
    slug: "medical-malpractice",
    name: "Medical Malpractice",
    shortName: "Medical Malpractice",
    category: "med-mal",
    titleBase: "Medical Malpractice Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A medical malpractice economic claim measures the earnings, benefits, household services, and care costs the injury added to the outcome the patient would have had with proper care, as the causation opinions in the record define it.",
    inShort: [
      "The loss is the difference between two paths: the outcome proper care would have produced and the outcome the injury produced.",
      "The medical causation and apportionment opinions define the but-for path; the earnings, benefit, and care records define each component.",
      "Each component is projected over the life or worklife expectancy the medical evidence supports and discounted to present value.",
    ],
    steps: [
      "State the but-for path the causation opinions support: what the patient would have earned, for how long, and what care the underlying condition would have required regardless.",
      "Build the injured path from actual post-injury earnings, the work-capacity opinions, and the incremental care plan.",
      "Measure each component as the difference between the two paths, projected over the applicable life or worklife expectancy with stated growth.",
      "Discount the streams to present value and present the loss under each apportionment or life expectancy scenario the physicians offer.",
    ],
    summary:
      "Medical malpractice matters present the economic loss questions of a personal injury or wrongful death case with one added layer: the loss must be measured against the outcome the patient would have had with proper care, not against perfect health. The economist works from the medical causation opinions in the record to define the but-for path and then measures the earnings, benefits, household services, and care costs the injury has added to it.",
    lossComponents:
      "The claim consists of lost earnings and earning capacity attributable to the injury, lost fringe benefits, the replacement cost of household services the patient can no longer perform, the present value of the incremental future care documented in a life care plan or the treating recommendations, and, where the patient has died, the survivor and estate components of a wrongful death analysis. The records that drive the analysis are the earnings and benefit history, the medical opinions that separate the injury from the underlying condition, and the care plan that distinguishes incremental care from the care the underlying condition would have required.",
    damagesExposure:
      "Because the underlying condition often affected work capacity or life expectancy on its own, the apportionment between the injury and the pre-existing condition is usually the most contested assumption and the one that most changes the total. In cases of permanent disability the incremental care costs and the earnings loss are both large and run across a long horizon, and the life expectancy used for each stream is a second point of contention. In delayed-diagnosis cases the loss may be measured as the difference between two outcome paths, each with its own earnings and care profile.",
    economicImpact:
      "The economist starts by stating the but-for path the medical record and causation opinions support: what the patient would have earned, for how long, and what care the underlying condition would have required regardless. The injured path is then built from the actual post-injury earnings, the work-capacity opinions, and the incremental care plan. Each component is measured as the difference between the two paths, projected over the applicable life or worklife expectancy with growth, and discounted to present value. Where physicians disagree on life expectancy or apportionment, the report presents the loss under each scenario so the fact finder can attach the number to the finding it makes.",
    relevantServices: ["personal-injury-economic-damages", "wrongful-death-economic-loss", "life-care-plan-cost-projection", "lost-earnings-and-earning-capacity", "household-services-valuation"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "How does the economist handle a pre-existing condition?",
        answer:
          "The economist does not decide what the condition would have done; the medical opinions do. The report takes those opinions as its baseline, builds the but-for path from them, and measures only the loss the injury added. When the opinions differ, the report shows the result under each.",
      },
      {
        question: "What is different about a medical malpractice wrongful death analysis?",
        answer:
          "The structure is the same as any wrongful death analysis, with earnings, consumption, household services, and support to dependents. The difference is that the decedent's life and worklife expectancy may already have been shortened by the condition being treated, and the analysis must use the expectancy the medical evidence supports rather than population averages alone.",
      },
      {
        question: "Are the costs of the negligent treatment itself part of the economic claim?",
        answer:
          "Past medical expenses are usually documented from billing records and presented by counsel. The economist's work concerns the future: the incremental care the injury requires, priced from the life care plan or treating recommendations, and grown and discounted over the horizon the medical evidence supports.",
      },
      {
        question: "How early should the economist be retained?",
        answer:
          "Once causation and prognosis opinions are available and the disclosure schedule is known. The economist can begin the earnings and household analysis from the financial records while the care plan is being finalized, and then integrate the plan when it is ready.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "CDC_LIFE_TABLES", "BLS_ATUS", "TREASURY_YIELD", "NAFE_ETHICS"]),
  },
  {
    slug: "motor-vehicle-accident",
    name: "Motor Vehicle Accident",
    shortName: "Auto Accident",
    category: "personal-injury",
    titleBase: "Motor Vehicle Accident Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A motor vehicle accident economic claim ranges from a documented period of lost pay to lifetime earnings, household services, and care losses after a catastrophic crash, and the analysis is scaled to the injury the record describes.",
    inShort: [
      "The claim consists of lost earnings during recovery, any future earnings gap, lost fringe benefits, household services, and the present value of future care.",
      "Employer records on the period out of work, the earnings history, and the medical and work-capacity opinions drive the number.",
      "Each future stream is projected with stated growth and discounted to present value, with alternative return-to-work scenarios shown.",
    ],
    steps: [
      "Document the earnings history, the date the person left work, and any return to work at full or reduced capacity.",
      "Project the but-for earnings over a worklife expectancy with a stated wage growth rate and compare it with the post-injury path.",
      "Value fringe benefits from plan documents or published employer cost data, household services from time-use data, and future care from the life care plan.",
      "Discount each stream to present value at a stated rate and present the alternative scenarios where the return-to-work date or capacity is disputed.",
    ],
    summary:
      "Motor vehicle accident matters produce the full range of economic loss, from a few months of lost pay after an orthopedic injury to lifetime earnings and care losses after a catastrophic crash. The economist scales the analysis to the injury: a short past-loss calculation from pay records, or a full projection of lost earnings, benefits, household services, and future care costs to present value when the injury is permanent.",
    lossComponents:
      "The claim is made up of past lost earnings while the person was out of work, future lost earnings or reduced earning capacity where the injury limits the work the person can return to, lost fringe benefits, the replacement cost of household services during recovery and afterward, and the present value of future care costs when a life care plan or treating recommendations exist. For a fatal crash the analysis becomes a wrongful death loss to the survivors. The drivers are the earnings and benefit history, the employer's records on the period out of work and any accommodation, and the medical and work-capacity opinions in the record.",
    damagesExposure:
      "In moderate injury the exposure is concentrated in the period out of work and any future surgery or treatment, and the numbers can usually be built directly from the records. Once an injury prevents a return to the prior occupation, the future earnings gap across the remaining worklife becomes the dominant figure, and in catastrophic injury the present value of attendant care and equipment in the life care plan can exceed the earnings loss. Policy limits often frame the practical range, so counsel commonly ask for a report that presents each component separately for settlement evaluation and for trial.",
    economicImpact:
      "The economist documents the earnings history, the date the person left work, and any return to work at full or reduced capacity, and builds the but-for and post-injury paths from those facts. Future earnings are projected over a worklife expectancy with wage growth, fringe benefits are valued from plan documents or published employer cost data, household services from time-use data and local replacement rates, and future care from the life care plan with medical cost growth. Each stream is discounted to present value with the rate assumption stated. Where the return-to-work date or the post-injury capacity is disputed, the report presents the alternative scenarios so the number tracks whatever the fact finder concludes.",
    relevantServices: ["personal-injury-economic-damages", "lost-earnings-and-earning-capacity", "wrongful-death-economic-loss", "household-services-valuation", "life-care-plan-cost-projection"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "Is an economist needed if the injured person has returned to work?",
        answer:
          "It depends on what the return looks like. A full return to the same job at the same pay usually leaves only a past loss that counsel can present from the pay records. A return at reduced hours, lower pay, or to a job with fewer benefits or less advancement leaves a future gap that an economist should measure over the remaining worklife.",
      },
      {
        question: "How are lost fringe benefits calculated?",
        answer:
          "From the employer's benefit plan documents where available: retirement contributions, health insurance premiums, and paid leave. Where the documents are not available, published data on employer costs for employee compensation supply a benefit rate for the industry and occupation. The report states which approach was used.",
      },
      {
        question: "What if the injured person was a student or early in a career?",
        answer:
          "The earnings base is projected from the educational path and occupational data for the work the person was preparing for, rather than from a short earnings history. The report states the occupation and education level assumed and the source of the earnings data.",
      },
      {
        question: "Does the analysis address household services during recovery?",
        answer:
          "Yes. Household work the person could not perform during recovery is valued at the cost of replacing it, and any permanent limitation on household work is projected over the person's expected life. The hours come from the household's account and time-use data for similar people.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS", "TREASURY_YIELD"]),
  },
  {
    slug: "traumatic-brain-injury",
    name: "Traumatic Brain Injury",
    shortName: "Brain Injury",
    category: "personal-injury",
    titleBase: "Traumatic Brain Injury Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A traumatic brain injury economic claim measures the earnings, benefits, and household contributions the injury has taken away and reduces the care plan to present value, with the supervision hours and the residual work capacity stated so they can be tested.",
    inShort: [
      "The claim consists of lost earnings and earning capacity, lost fringe benefits, household services and family supervision, and the present value of the care plan.",
      "The earnings history, the neuropsychological and work-capacity opinions, and a life care plan with frequencies and durations drive the number.",
      "Future streams are discounted to present value, with the total shown under alternative supervision and work-capacity scenarios.",
    ],
    steps: [
      "Establish the but-for earnings path from the person's history or, for a young person, from occupational data for the path they were on.",
      "Draw the post-injury path from actual earnings and the work-capacity opinions in the record, and measure the earnings gap over the remaining worklife.",
      "Value household services and family supervision from time-use data and local rates, and price the care plan item by item with medical cost growth.",
      "Discount every future stream to present value at a stated rate and show the total under each supervision and work-capacity scenario.",
    ],
    summary:
      "Traumatic brain injury matters carry some of the largest economic claims in personal injury litigation because cognitive and behavioral effects can end a career even when physical function returns. The economist's task is to measure the earnings, benefits, and household contributions the injury has taken away and to reduce the care costs in the life care plan to present value, with every assumption stated so it can be tested.",
    lossComponents:
      "The claim consists of lost earnings and earning capacity, often a total loss when the person cannot return to competitive work or a partial loss when they can work only with supports or at a lower level; lost fringe benefits; the replacement cost of household services, including the supervision and management of daily affairs that family members now provide; and the present value of the care plan, which in serious injury includes attendant care, therapy, medication, and case management over a lifetime. The drivers are the earnings history, the neuropsychological and work-capacity opinions in the record, and a life care plan that specifies each item's frequency and duration.",
    damagesExposure:
      "Two components usually dominate: future lost earnings across a long worklife for a young person, and the present value of attendant care and supervision when the plan calls for daily hours of paid help. Because the level of supervision and the person's residual work capacity are both matters of expert opinion, the report's total is highly sensitive to those inputs, and the life expectancy used for the care stream is a second source of dispute. Mild injury with persistent symptoms presents a narrower claim built on reduced hours, lost advancement, and periodic treatment.",
    economicImpact:
      "The economist establishes the but-for earnings path from the person's history and, for a young person, from occupational data for the path they were on, and projects it over a worklife expectancy with wage growth. The post-injury path is drawn from actual earnings and the work-capacity opinions in the record, and the difference is the earnings loss. Household services and family supervision are valued from time-use data and local rates for the level of service involved, and the life care plan is priced item by item with medical cost growth over the horizon the medical evidence supports. All future streams are discounted to present value, and the report shows the total under alternative supervision and work-capacity scenarios so the fact finder can match the number to its findings.",
    relevantServices: ["lost-earnings-and-earning-capacity", "life-care-plan-cost-projection", "household-services-valuation", "personal-injury-economic-damages"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "Can an economist measure the loss when the person is still working?",
        answer:
          "Yes. Many people with brain injury return to work but at reduced hours, in a lower position, or with supports that will not last. The economist compares the but-for path with the actual post-injury path and measures the gap, including lost advancement and benefits, over the remaining worklife.",
      },
      {
        question: "How is family-provided supervision valued?",
        answer:
          "By the hours of supervision or assistance the record supports and the local market rate for the level of service a paid provider would charge, from companion care to skilled attendant care. The economist states the hours, the rate, and the source so the value can be examined.",
      },
      {
        question: "What does the economist need from the life care plan?",
        answer:
          "Each item's description, frequency, duration, start and end ages, and current unit cost. The economist applies the appropriate cost growth to each category and discounts the stream to present value. Items with a range of frequencies are shown at each end of the range.",
      },
      {
        question: "How does life expectancy enter the analysis?",
        answer:
          "It sets the horizon for the care stream and for household services. The economist uses the life expectancy the medical evidence supports and, where physicians disagree, presents the present value under each so the finding drives the number.",
      },
      {
        question: "Is the earnings loss measured differently for a child or student?",
        answer:
          "The earnings base is projected from the educational path the child was on and occupational earnings data for that path, since there is no work history. The report states the education level assumed and shows how the result changes if a different level is used.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC", "BLS_ATUS", "CDC_LIFE_TABLES"]),
  },
  {
    slug: "spinal-cord-injury",
    name: "Spinal Cord Injury",
    shortName: "Spinal Cord Injury",
    category: "personal-injury",
    titleBase: "Spinal Cord Injury Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A spinal cord injury economic claim brings together lost earnings and benefits, the household work the person can no longer do, and the present value of a lifetime care plan dominated by attendant care and equipment replacement cycles.",
    inShort: [
      "The claim consists of lost earnings and earning capacity, lost fringe benefits, household services, and the present value of the life care plan.",
      "The earnings and benefit history, the work-capacity opinions, and a care plan with frequencies and replacement intervals drive the number.",
      "Attendant care, equipment cycles, and modifications are priced with category-specific cost growth and discounted to present value.",
    ],
    steps: [
      "Establish the but-for earnings path from the person's history and occupational data, and project it over a worklife expectancy with stated wage growth.",
      "Compare that path with the post-injury path the work-capacity opinions support, whether no earnings, reduced earnings, or earnings after retraining.",
      "Value fringe benefits and household services, and price the care plan item by item with the cost growth rate and replacement interval appropriate to each category.",
      "Discount every future stream to present value at a stated rate and present home-based and facility-based care scenarios when the plan offers both.",
    ],
    summary:
      "Spinal cord injury matters involve permanent loss of function that typically ends the person's prior occupation and creates lifetime care and equipment costs. The economic claim brings together lost earnings and benefits, the household work the person can no longer do, and the present value of the life care plan, and the economist's role is to build each component from the record and reduce it to a number the court can rely on.",
    lossComponents:
      "The claim consists of lost earnings and earning capacity, measured as a total loss when the person cannot return to work or as the gap between the prior path and a sedentary or part-time alternative when they can; lost fringe benefits; the replacement value of household services across the person's life; and the present value of the life care plan, which for spinal cord injury is dominated by attendant care, wheelchair and equipment replacement cycles, supplies, home and vehicle modifications, and periodic hospitalization for complications. The drivers are the earnings and benefit history, the work-capacity opinions in the record, and a life care plan with frequencies and replacement intervals stated for each item.",
    damagesExposure:
      "The present value of attendant care over a lifetime is usually the largest figure, followed by future lost earnings for a person injured early in a working life. Equipment costs recur on replacement cycles and are sensitive to the cost growth rate applied, and home and vehicle modifications add one-time and recurring items. Because the level of injury determines attendant care hours and the person's capacity for alternative work, the report's total moves with those inputs, and the life expectancy the medical evidence supports sets the horizon for every stream.",
    economicImpact:
      "The economist builds the but-for earnings path from the person's history and occupational data, projects it over a worklife expectancy with wage growth, and compares it with the post-injury path the work-capacity opinions support, which may be no earnings, reduced earnings, or earnings after retraining. Fringe benefits are valued from plan documents or employer cost data, household services from time-use data and local replacement rates, and the life care plan item by item with the cost growth rate appropriate to each category and the replacement intervals the plan specifies. Every future stream is discounted to present value with the rate stated, and the report presents home-based and facility-based care scenarios when the plan offers both.",
    relevantServices: ["lost-earnings-and-earning-capacity", "life-care-plan-cost-projection", "household-services-valuation", "personal-injury-economic-damages"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "How are equipment replacement cycles handled in the present value calculation?",
        answer:
          "Each item is scheduled at the interval the life care plan specifies, priced at current cost, grown at the applicable rate to each replacement date, and discounted back to present value. The report lists the schedule so counsel can see how many replacements the horizon contains.",
      },
      {
        question: "Does the analysis account for the person working after retraining?",
        answer:
          "Yes, where the record supports it. The post-injury path can include earnings from sedentary or remote work after retraining, with a delay for the training period and a wage level from occupational data. The remaining gap between that path and the but-for path is the loss.",
      },
      {
        question: "How is attendant care valued when family members provide it?",
        answer:
          "At the local market rate for the level of care involved, for the hours the plan and the record support. The economist states the rate source and shows the value of family-provided care separately from paid care so counsel can present it under the governing framework.",
      },
      {
        question: "What cost growth rate applies to the life care plan?",
        answer:
          "Medical goods and services have historically grown at a different rate from general prices, and the economist applies category-specific growth drawn from published price indexes, stated in the report, rather than a single rate for the whole plan.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC", "BLS_ATUS", "BLS_CPI_MEDICAL", "CDC_LIFE_TABLES"]),
  },
  {
    slug: "workers-compensation",
    name: "Workers' Compensation",
    shortName: "Workers' Comp",
    category: "workers-comp",
    titleBase: "Workers' Compensation Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A workers' compensation economic analysis values the future indemnity and medical benefits at issue in a settlement, measures the wage loss that determines a benefit, or quantifies the loss in a third-party action, each structured to the question the compensation system asks.",
    inShort: [
      "The analysis values future indemnity and medical benefits, measures wage loss or reduced earning capacity, or supports a third-party claim arising from the same injury.",
      "Pre-injury wage records, the carrier's payment history, post-injury earnings, and the work-capacity opinions drive the number.",
      "Indemnity streams are valued with stated mortality and discount assumptions, and the compensation payments are separated from what a civil claim adds.",
    ],
    steps: [
      "Assemble the pre-injury wage base from the employer's records and tax documents.",
      "Establish the post-injury earnings path from actual earnings or the work-capacity opinions, and measure the loss over the applicable worklife with wage growth.",
      "Value future indemnity streams with stated mortality and discount assumptions, and grow and discount future medical by category when a treatment projection exists.",
      "Separate the amounts the compensation system pays from the components a third-party claim adds, and reconcile the two so the same facts support both.",
    ],
    summary:
      "Workers' compensation matters call for economic analysis at several points: valuing the future indemnity and medical benefits at issue in a settlement, measuring the economic loss in a third-party action arising from the same injury, and quantifying the wage loss that determines the benefit itself where loss of earning capacity is the measure. The economist brings the same earnings, benefits, and present value methods to each, structured to the question the compensation system actually asks.",
    lossComponents:
      "Depending on the setting, the claim consists of the present value of future indemnity payments under the schedule that applies, the wage loss or reduced earning capacity that benefits are meant to replace, the lost fringe benefits and household services that the compensation system does not pay but a third-party claim may, and the present value of future medical treatment where a settlement closes future medical liability. The drivers are the pre-injury wage records, the carrier's payment history, the post-injury earnings if any, the work-capacity opinions in the record, and the treatment projection when future medical is being valued.",
    damagesExposure:
      "In a settlement, the present value of a long stream of indemnity payments is the central figure, and the discount rate and the claimant's life or worklife expectancy control it. In a third-party action the exposure resembles any personal injury claim, with the added task of identifying the benefits already paid so the lien and offset questions counsel raises can be answered from the same numbers. Where the benefit turns on earning capacity, the gap between pre-injury wages and what the person can now earn is the contested figure, and the post-injury wage level is the assumption that moves it.",
    economicImpact:
      "The economist assembles the pre-injury wage base from the employer's records and tax documents, establishes the post-injury earnings path from actual earnings or the work-capacity opinions in the record, and measures the loss over the applicable worklife with wage growth. Future indemnity streams are valued with the mortality and discount assumptions stated, future medical is grown and discounted by category when a treatment projection is available, and the report separates the amounts the compensation system pays from the components a third-party claim adds. Because the compensation system and the civil claim measure loss differently, the report presents each on its own terms and reconciles the two so the same facts support both.",
    relevantServices: ["lost-earnings-and-earning-capacity", "personal-injury-economic-damages", "household-services-valuation", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "What can an economist add to a workers' compensation settlement?",
        answer:
          "A present value of the future indemnity and medical benefits at issue, with the assumptions stated, so both sides negotiate from a documented number rather than a rule of thumb. The economist can also show how the value changes with different discount rates and life expectancy assumptions.",
      },
      {
        question: "How does the economist treat benefits already paid in a third-party case?",
        answer:
          "The report identifies the indemnity and medical payments made by the carrier so counsel can address lien, offset, and collateral source questions under the governing framework. The economist reports the gross loss and the paid amounts separately rather than netting them, unless counsel asks for a net presentation.",
      },
      {
        question: "Can the analysis measure loss of earning capacity for the benefit determination?",
        answer:
          "Yes, where the jurisdiction measures the benefit that way. The economist compares the pre-injury wage with the earnings the person can achieve given the work-capacity opinions in the record, and expresses the reduction as a percentage or dollar amount as the system requires.",
      },
      {
        question: "Does the economist prepare the medical treatment projection?",
        answer:
          "No. The treatment projection comes from the treating providers or a medical cost projection prepared by others. The economist takes the items, frequencies, and costs from that document, applies cost growth, and calculates present value.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC", "TREASURY_YIELD", "NAFE"]),
  },
  {
    slug: "employment-discrimination",
    name: "Employment Discrimination",
    shortName: "Discrimination",
    category: "employment",
    titleBase: "Employment Discrimination Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "An employment discrimination economic claim measures the gap between the compensation the employee would have received absent the adverse action and the compensation actually received, as back pay, front pay, and lost benefits net of mitigation.",
    inShort: [
      "The claim consists of back pay, front pay, lost fringe benefits and equity, and in pay-disparity claims the shortfall against the comparators.",
      "Payroll and personnel records, comparator compensation, post-action earnings, and the job-search record drive the number.",
      "Mitigation is credited, front pay is shown at several durations, and future amounts are discounted to present value.",
    ],
    steps: [
      "Reconstruct the but-for compensation path from the employee's history and the employer's pay practices, including raises, bonus patterns, and benefit accruals.",
      "Compare that path with actual post-action earnings year by year, crediting mitigation from the employee's records or from local wage and unemployment duration data.",
      "Project front pay over the period the record supports for reaching comparable employment, with the loss shown at alternative durations.",
      "Separate back pay, front pay, and benefits, discount the future amounts to present value, and supply the schedule counsel needs for prejudgment interest.",
    ],
    summary:
      "Employment discrimination matters measure the economic gap between where the employee's compensation would have been absent the adverse action and where it actually is, from the date of the action through a reasonable point in the future. The economist builds the back pay and front pay figures from the compensation records, accounts for what the employee has earned or could reasonably have earned in mitigation, and reduces the future component to present value.",
    lossComponents:
      "The claim consists of back pay from the date of the adverse action to the date of trial or analysis, including base pay, overtime, bonuses, commissions, and raises the employee would have received; lost fringe benefits such as retirement contributions, health insurance, stock awards, and paid leave; front pay from the date of analysis until the employee reaches or would reasonably reach comparable employment; and, in failure-to-promote and pay-disparity claims, the difference between the compensation actually received and the compensation of the position or pay level denied. The drivers are the employer's payroll and personnel records, comparator compensation data, the employee's post-termination earnings, and evidence of the job search.",
    damagesExposure:
      "Back pay is usually the most documented component and the least contested; the disputes concentrate on front pay duration and mitigation. How long it will take the employee to reach comparable compensation, whether the replacement job counts as comparable, and whether the job search was reasonable each change the total substantially. Lost equity, bonus, and pension accruals can exceed base pay losses for senior employees, and the pay-disparity component in an unequal pay claim depends on which comparators are used and over what period.",
    economicImpact:
      "The economist reconstructs the but-for compensation path from the employee's history and the employer's pay practices, including scheduled raises, bonus patterns, and benefit accruals, and compares it with actual post-action earnings year by year. Mitigation earnings are drawn from the employee's records and, where the search is ongoing, from occupational wage data and unemployment duration data for the local market. Front pay is projected over the period the record supports for reaching comparable employment, and both back pay and front pay are stated with the components separated so the fact finder can adjust any one of them. Future amounts are discounted to present value, and where pre-judgment interest is available the report supplies the schedule counsel needs to compute it.",
    relevantServices: ["employment-and-wage-loss-damages", "lost-earnings-and-earning-capacity", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "MBA", "PhD"],
    faqs: [
      {
        question: "How is the mitigation offset determined?",
        answer:
          "From the employee's actual earnings after the adverse action, documented by pay records and tax returns. Where the employee has not found work, the economist looks at the local wage data for comparable positions and the typical duration of unemployment for similar workers, and states the assumption used. The report shows the loss with and without the offset so counsel can address whether the search was reasonable.",
      },
      {
        question: "How long should front pay run?",
        answer:
          "Until the employee reaches, or would reasonably be expected to reach, compensation comparable to the but-for path. That period depends on the employee's occupation, age, the local market, and the evidence about the search. The economist presents the loss at several durations rather than asserting one.",
      },
      {
        question: "Does the analysis include lost stock options or pension accruals?",
        answer:
          "Yes, where the records support them. Equity awards are valued from the plan terms and the vesting schedule the employee would have followed, and pension losses from the plan formula applied to the but-for and actual service and pay. These components are shown separately because they can be large and turn on plan-specific facts.",
      },
      {
        question: "Can the economist analyze a pay disparity claim?",
        answer:
          "Yes. The economist compares the employee's compensation with that of the comparators counsel identifies over the relevant period, documents the differences by pay element, and computes the shortfall with interest where applicable. The choice of comparators is counsel's; the economist states the effect of using each set.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC", "TREASURY_YIELD", "NAFE_ETHICS"]),
  },
  {
    slug: "wrongful-termination",
    name: "Wrongful Termination",
    shortName: "Wrongful Termination",
    category: "employment",
    titleBase: "Wrongful Termination Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A wrongful termination economic claim measures what the employee lost when the employment ended, as back pay, front pay, and lost benefits, and how much of that loss has been or should be replaced by other work.",
    inShort: [
      "The claim consists of back pay, front pay, lost fringe benefits, and any pension, deferred compensation, or equity forfeited at termination.",
      "The employment agreement, payroll and benefit records, tax returns, and the record of the job search drive the number.",
      "Replacement earnings are credited, the front pay period is shown at alternative durations, and future amounts are discounted to present value.",
    ],
    steps: [
      "Build the but-for compensation path from the pay history and the employer's pay and promotion practices, including the benefit accruals that would have continued.",
      "Compare it with the replacement earnings actually received, or with a reasonable job-search duration and replacement wage level drawn from local occupational data.",
      "Calculate pension and deferred compensation losses from the plan terms and equity losses from the award schedule.",
      "Discount the future components to present value at a stated rate and present back pay, front pay, and benefits separately.",
    ],
    summary:
      "Wrongful termination matters ask what the employee lost when the employment ended and how much of that loss has been or should be replaced by other work. The economist measures the gap between the compensation the employee would have received had the employment continued and the compensation actually earned since, projects that gap over a reasonable period, and reduces the future portion to present value.",
    lossComponents:
      "The claim consists of back pay from the termination date to the date of analysis, front pay for the period needed to reach comparable employment, lost fringe benefits including retirement contributions, health coverage, and equity or bonus plans, and in some matters the loss of pension or deferred compensation that vesting would have delivered. The mitigation side of the ledger consists of actual replacement earnings and, where the employee is not working, the earnings a reasonable search would have produced. The drivers are the employment agreement, payroll and personnel records, benefit plan documents, tax returns, and the record of the job search and any replacement work.",
    damagesExposure:
      "The most contested component is usually the front pay period, because the employee's age, occupation, and local market determine how quickly comparable work is reasonably available. For long-tenured employees, the loss of accrued pension benefits and retiree health coverage can rival the pay loss, and for employees with equity compensation the unvested awards forfeited at termination can be the largest single item. Where the employee found comparable work quickly, the claim may reduce to a documented back pay figure with small benefit differences.",
    economicImpact:
      "The economist builds the but-for compensation path from the employee's pay history and the employer's pay and promotion practices, including the benefit accruals that would have continued, and compares it with the replacement earnings actually received. Where the employee has not found work, the report states a reasonable job-search duration and a replacement wage level drawn from local occupational data, and presents the loss under alternative durations. Pension and deferred compensation losses are calculated from the plan terms, equity losses from the award schedule, and the future components are discounted to present value with the rate stated. The report separates back pay, front pay, and benefits so each can be examined on its own record.",
    relevantServices: ["employment-and-wage-loss-damages", "lost-earnings-and-earning-capacity", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "MBA", "PhD"],
    faqs: [
      {
        question: "Is an economist necessary when the employee has already found a new job?",
        answer:
          "If the new job pays comparably with comparable benefits, the loss may be limited to the gap period and counsel can often present it from the records. If the new job pays less, offers fewer benefits, or lacks the advancement the prior job carried, an economist measures the ongoing difference over the period the record supports.",
      },
      {
        question: "How does the analysis handle bonuses and commissions?",
        answer:
          "From the employee's own history and the employer's plan terms: the pattern of past awards, the plan's formula, and the performance of comparable employees where available. The economist states the basis for the projected amounts rather than assuming a maximum or minimum.",
      },
      {
        question: "What about pension losses for a long-tenured employee?",
        answer:
          "The economist applies the plan's benefit formula to the service and pay the employee would have accrued through the but-for retirement date and compares it with the benefit actually vested, then values the difference over the employee's expected retirement period. Plan documents and benefit statements are required.",
      },
      {
        question: "Are lost health benefits valued at the employer's cost or the employee's replacement cost?",
        answer:
          "The report can present either or both. The employer's contribution reflects what the compensation package was worth; the employee's cost to replace coverage reflects what the loss actually costs the household. The economist states which is used and why.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC", "TREASURY_YIELD"]),
  },
  {
    slug: "commercial-contract-dispute",
    name: "Commercial Contract Dispute",
    shortName: "Contract Dispute",
    category: "commercial",
    titleBase: "Commercial Contract Dispute Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-10-06",
    summaryShort:
      "A commercial contract damages claim measures the profits a business lost, or the costs it incurred, because the other party did not perform, as the difference between the performed-contract path and what the business actually earned or could have earned by mitigating.",
    inShort: [
      "The claim consists of lost profits on the contract and on dependent business, reliance costs, and in some matters the diminished value of the business.",
      "The contract, historical financial statements and tax returns, pre-dispute projections, and the cost structure drive the number.",
      "Only the lost margin is claimed, mitigation revenue is credited, and future lost profits are discounted at a rate that reflects the risk of the stream.",
    ],
    steps: [
      "Establish the but-for revenue from the contract terms, the pre-dispute projections, and the business's own history.",
      "Identify the incremental costs that would have been incurred to earn that revenue so that only the lost margin is claimed.",
      "Analyze actual results after the breach to separate the effect of the breach from market conditions and other causes, and credit mitigation revenue.",
      "Bring past lost profits forward and discount future lost profits at a stated rate that reflects the risk of the earnings stream.",
    ],
    summary:
      "Commercial contract disputes turn on the profits a business lost, or the costs it incurred, because the other party did not perform. The economist reconstructs what the business would have earned had the contract been performed, compares it with what the business actually earned or could have earned by mitigating, and presents the difference with the causation, timing, and discount assumptions stated.",
    lossComponents:
      "The claim typically consists of lost profits on the contract itself, measured as the revenue that would have been earned less the costs that would have been incurred to earn it; lost profits on related business that depended on the contract, where the record supports the connection; reliance costs incurred in preparation for performance; and in some matters the diminished value of the business when the breach reduced its ongoing earnings capacity. The drivers are the contract and its performance history, historical financial statements and tax returns, budgets and projections prepared before the dispute, customer and pricing records, and the cost structure that determines what portion of lost revenue would have been profit.",
    damagesExposure:
      "The size of the claim depends on the contract's remaining term, the profit margin the business would have realized, and how much of the lost volume was or could have been replaced. Incremental cost treatment is the usual battleground: whether a given cost would have been avoided when the revenue disappeared changes the margin and therefore the loss. For a new venture or a contract without a performance history, the reasonableness of the projected revenue is the central dispute, and the period over which lost profits are claimed is scrutinized against the contract's terms and the market.",
    economicImpact:
      "The economist establishes the but-for revenue from the contract terms, the pre-dispute projections, and the business's own history, then identifies the incremental costs that would have been incurred to earn that revenue so that only the lost margin is claimed. Actual results after the breach are analyzed to separate the effect of the breach from market conditions and other causes, and mitigation revenue is credited. Past lost profits are brought forward and future lost profits are discounted to present value at a rate that reflects the risk of the earnings stream, with the rate stated and its effect shown. The report is organized so each element of the claim ties to a document and can be tested independently.",
    relevantServices: ["lost-profits-and-commercial-damages", "business-valuation", "fraud-and-asset-tracing", "transfer-pricing-expert-witness", "intellectual-property-damages", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "MBA", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "What financial records does the economist need?",
        answer:
          "Several years of financial statements and tax returns, the general ledger or detail sufficient to separate fixed and variable costs, budgets and forecasts prepared before the dispute, the contract and any amendments, and sales, pricing, and customer records for the affected line of business. Industry data supplements the company's own records when the history is short.",
      },
      {
        question: "How is the discount rate chosen for future lost profits?",
        answer:
          "It reflects the risk that the projected profits would not have materialized. A stream from a long-term contract with a creditworthy counterparty carries less risk than a projection for a new product, and the rate is chosen accordingly from market data and stated in the report along with the effect of alternative rates.",
      },
      {
        question: "Can lost profits be measured for a business with no track record?",
        answer:
          "It is harder, and the report says so. The economist builds the projection from the business plan, comparable businesses, the market's size and growth, and any actual performance before the breach, and presents the result with the uncertainty made explicit rather than hidden in a single number.",
      },
      {
        question: "What is the difference between lost profits and lost business value?",
        answer:
          "Lost profits measure the earnings lost over a period while the business continues. Lost business value measures the reduction in what the business is worth when the breach permanently impaired it or ended it. The report uses one or the other, or both for different periods, and explains why so the claim does not count the same loss twice.",
      },
    ],
    sources: refsToSources(["TREASURY_YIELD", "NAFE_JFE", "AAEFE", "FRE_702", "FRCP_26"]),
  },
  {
    slug: "partnership-and-shareholder-dispute",
    name: "Partnership and Shareholder Dispute",
    shortName: "Shareholder Dispute",
    category: "commercial",
    titleBase: "Partnership and Shareholder Dispute Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-10-06",
    summaryShort:
      "A partnership or shareholder dispute turns on what an ownership interest is worth under the standard of value that applies and whether the business's earnings have been fairly shared, both answered from the agreements and the financial records.",
    inShort: [
      "The analysis consists of the value of the interest as of the relevant date, any shortfall against what the departing owner received, and profits diverted through compensation or related-party dealings.",
      "The operating or shareholder agreement, financial statements and tax returns, the general ledger, and distribution records drive the number.",
      "The interest is valued under the income, market, and asset approaches as the facts support, with any discounts explained.",
    ],
    steps: [
      "Read the agreements to identify the valuation date, the standard of value, and any buyout formula.",
      "Normalize the financial statements for owner compensation, related-party transactions, and non-recurring items.",
      "Value the interest under the income, market, and asset approaches as the facts support, with the weighting and any discounts or premiums explained.",
      "Trace any diverted profits through the ledger and bank records, quantify them by year, and show the effect of the principal assumptions.",
    ],
    summary:
      "Partnership and shareholder disputes turn on what an ownership interest is worth and whether the business's earnings have been fairly shared. The economist values the interest under the standard of value that applies to the claim, analyzes the distributions, compensation, and related-party dealings in the financial records, and states the conclusions with the methods and assumptions laid out so they can be examined.",
    lossComponents:
      "Depending on the claim, the analysis consists of the fair value or fair market value of the ownership interest as of the relevant date, the difference between what the departing owner received and what the interest was worth, distributions or profits diverted through excess compensation, related-party transactions, or unrecorded revenue, and lost profits to the business or to the owner when the conduct at issue reduced earnings. The drivers are the operating agreement or shareholder agreement and its buyout terms, historical financial statements and tax returns, the general ledger, compensation and distribution records, and documentation of transactions with related entities.",
    damagesExposure:
      "The valuation date and the standard of value control the result: a fair value standard may exclude the minority and marketability discounts that a fair market value standard applies, and the gap between the two can be substantial for a minority interest in a closely held company. Normalizing adjustments to owner compensation and related-party dealings often decide whether the business shows earnings to value at all. Where the claim includes diverted profits, the amount depends on how far back the records permit reconstruction and on whether the business's actual results can be separated from market conditions.",
    economicImpact:
      "The economist reviews the agreements to identify the valuation date, the standard of value, and any buyout formula, then normalizes the financial statements for owner compensation, related-party transactions, and non-recurring items. The interest is valued using the income, market, and asset approaches as the facts support, with the weighting and any discounts or premiums explained. Where profits were diverted, the report traces the transactions through the ledger and bank records and quantifies the amounts by year. The result is presented as a value or a damages figure tied to the agreements and the records, with the effect of the principal assumptions shown.",
    relevantServices: ["business-valuation", "lost-profits-and-commercial-damages", "fraud-and-asset-tracing", "transfer-pricing-expert-witness", "intellectual-property-damages", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "MBA", "PhD"],
    faqs: [
      {
        question: "Which standard of value applies to a shareholder dispute?",
        answer:
          "It depends on the claim and the governing framework counsel identifies. Buyout and oppression claims often use a fair value standard, while agreements may specify fair market value or a formula. The economist values the interest under the standard counsel identifies and can show the result under alternatives.",
      },
      {
        question: "How are owner compensation and perquisites handled?",
        answer:
          "The economist compares the compensation paid with market compensation for the role and treats the excess, along with personal expenses run through the business, as normalizing adjustments to earnings. The same analysis quantifies diverted profits when that is part of the claim.",
      },
      {
        question: "Can the economist find money taken out of the business?",
        answer:
          "The financial records are reconstructed to trace distributions, related-party payments, and unusual transactions, and the amounts are summarized by year and recipient. Where records are incomplete, the report states what could and could not be determined.",
      },
      {
        question: "Does the report address the buyout formula in the agreement?",
        answer:
          "Yes. Where the agreement specifies a formula, the economist applies it to the financial records as of the relevant date and, if counsel asks, compares the formula result with the value under the applicable standard so the difference is quantified.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD", "FRE_702"]),
  },
  {
    slug: "divorce-and-marital-dissolution",
    name: "Divorce and Marital Dissolution",
    shortName: "Divorce",
    category: "family",
    titleBase: "Divorce and Marital Dissolution Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-10-05",
    // A family-law matter is an income, valuation, and tracing assignment, not
    // a damages claim; these strings replace the shared damages framing on the
    // hub and state pages (see CaseTypeFraming).
    framing: {
      // The audit's proposed metadata (kwe-brief.md, "Pages with proposed
      // metadata changes"): "Divorce Financial Analysis | KW Economics" and
      // "Financial Analysis for Divorce and Marital Dissolution [in <place>]".
      // The state-tier title stem is "Divorce Financial Expert" rather than
      // the proposed "Divorce Financial Analysis" because the service pillar's
      // state pages (/services/divorce-and-marital-financial-analysis/<state>)
      // already carry "Divorce Financial Analysis in <place>", and no two
      // routes may advertise the same title (src/lib/page-titles.test.ts).
      titleStem: "Divorce Financial Analysis",
      stateTitleStems: ["Divorce Financial Expert"],
      hubHeading: "Financial Analysis for Divorce and Marital Dissolution",
      hubDescription:
        "Income analysis, business valuation, and funds tracing for divorce and marital dissolution: the records that drive each figure and how the analysis is built.",
      stateHeadingStem: "Financial Analysis for Divorce and Marital Dissolution",
      stateDescription:
        "Income analysis, business valuation, and funds tracing for divorce and marital dissolution in {place}: records, methods, and expert support.",
      stateLead:
        "{org} prepares financial analyses for divorce and marital dissolution matters venued in {place}: income available for support, the value of business interests in the marital estate, and the tracing of separate and marital funds, each presented so that either spouse or the court can examine the figures.",
      stateStepsIntro:
        "The same four steps apply to a divorce and marital dissolution matter venued in {place}; the governing framework in {place} decides how each finding is applied.",
      stateFramework:
        "Whether {place} divides marital property equitably or as community property, which valuation date applies, how income available for support is defined, and how the goodwill of a professional practice is treated are questions of law that counsel confirms; the report presents each finding so it can be applied under either party's position.",
      stateFrameworkQuestion: "How does {place}'s family-law framework shape the financial analysis?",
      sections: {
        components: "What the financial analysis consists of",
        concentration: "Which figures move the result",
        method: "How the analysis is built",
        framework: "Legal framework",
      },
      pairStateLead:
        "{org} prepares {work} for {matter} matters venued in {place}: the income, valuation, and tracing questions the matter raises, the records that answer them, and a presentation built to the way {attr} courts decide them. Either party.",
      // The state's own inquiry, closed by the work a family-law analysis
      // shows (the shared closing sentence speaks of a damages report).
      expertStandard:
        "{inquiry} A financial analysis for a divorce meets that inquiry by listing each normalization adjustment, valuation input, and tracing step with the record behind it.",
      pairStateFrameworkTail:
        "The report lists each normalization adjustment, valuation input, and tracing step with its source and shows the result under each spouse's position, so counsel can apply the {attr} rules to a documented figure.",
    },
    summaryShort:
      "A divorce or marital dissolution matter asks what income each spouse has available for support, what the marital assets, including any business interest, are worth for the division of the estate, and which assets are separate rather than marital. Each is answered from the business books, tax returns, and account histories rather than from the tax return alone.",
    inShort: [
      "The analysis consists of income available for support, a valuation of any business or professional practice for the division of the marital estate, the tracing of separate and marital property, and the present value of pensions and deferred compensation.",
      "Personal and business tax returns, financial statements and general ledgers, bank, brokerage, and retirement account statements, and compensation records drive each figure.",
      "Cash flow is normalized for owner compensation, personal expenses, and non-recurring items so the income figure and the valuation rest on the same adjusted statements and reconcile.",
    ],
    steps: [
      "Normalize the business's cash flow for owner compensation, personal expenses paid through the business, related-party dealings, and non-recurring items, listing each adjustment with its source.",
      "Value the business or practice as of the date the governing framework requires, under the income, market, and asset approaches as the facts support, and address personal and enterprise goodwill where the framework distinguishes them.",
      "Determine each spouse's income available for support from the same normalized statements, including distributions, perquisites, and cash flow retained in the business beyond reported salary.",
      "Trace separate property through the account statements step by step, classify commingled funds under the framework counsel identifies, and reduce pensions and deferred compensation to present value with the assumptions stated.",
    ],
    summary:
      "Divorce and marital dissolution matters turn on financial questions rather than a damages claim: what income each spouse has available for support, what the business interests and other assets in the marital estate are worth for the division of the estate, and which assets are separate property. The economist normalizes the business's cash flow, values the business, determines income from the records rather than the tax return alone, and traces separate and marital funds through the accounts, presenting each analysis so that either spouse or the court can examine it.",
    lossComponents:
      "The analysis consists of the determination of each spouse's income available for support, including the cash flow a self-employed spouse draws from a business beyond reported compensation; a valuation of any closely held business or professional practice as of the date the governing framework requires; the tracing of separate property contributions and marital funds through accounts, real estate, and investments; a lifestyle analysis where the marital standard of living is at issue; and the present value of pensions, deferred compensation, and other assets that pay out over time. The drivers are personal and business tax returns, financial statements and general ledgers, bank, brokerage, and retirement account statements, compensation and benefit records, and account histories long enough to follow the funds at issue.",
    damagesExposure:
      "The business valuation is usually the largest and most contested figure in the marital estate, and the valuation date, the standard of value, the treatment of personal and enterprise goodwill, and the normalization of owner compensation each move it materially. Income available for support for a self-employed spouse can differ substantially from the reported figure once personal expenses paid by the business and cash flow retained in it are considered, and the owner compensation adjustment has to be carried consistently into the valuation and the income determination, because the same stream of earnings appears in both. Tracing outcomes depend on the completeness of the account records and on how the governing framework, whether equitable distribution or community property, treats commingled funds and the appreciation of separate assets during the marriage.",
    economicImpact:
      "The economist starts from the business's financial statements and normalizes them for owner compensation, personal expenses paid through the business, related-party dealings, and non-recurring items, listing each adjustment with its source. The business or practice is then valued as of the date the governing framework requires, under the income, market, and asset approaches as the facts support, with personal and enterprise goodwill addressed where the framework distinguishes them. Income available for support is determined from the same normalized statements, adding distributions, perquisites, and cash flow retained in the business beyond reported salary, so the valuation and the income figure reconcile. Separate property is traced through the account statements from the date of contribution to the current holding, with each step documented and commingled funds classified under the framework counsel identifies. Pensions and deferred compensation are reduced to present value with the mortality and discount assumptions stated. Where the question is what a spouse who is not working, or is working below prior earnings, could reasonably earn, employability and attainable occupations are a vocational discipline: the affiliated vocational practice prepares that opinion, and the economist applies it to the support calculation together with published wage data. The report presents the valuation, the income determination, and the tracing as separate sections so each can be examined and used on its own by either spouse or the court.",
    relevantServices: ["divorce-and-marital-financial-analysis", "business-valuation", "fraud-and-asset-tracing", "transfer-pricing-expert-witness", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "MBA", "NAFE"],
    faqs: [
      {
        question: "Why can income for support differ from the income on the tax return?",
        answer:
          "Because a tax return reports taxable income after the deductions and elections the business took, not the cash flow the owner actually had available. The economist rebuilds the figure from the business's books and bank records: salary, distributions, personal expenses paid through the business, depreciation and other non-cash deductions, and cash retained in the business, and states the income available for support with each element shown so the other side can test it.",
      },
      {
        question: "How do the business valuation and the income determination fit together?",
        answer:
          "Both rest on the same normalized financial statements. The valuation restates owner compensation to a market level and treats the excess as earnings of the business; the income determination counts what the owner actually receives, including that excess. The report shows how the two figures relate so the court can decide how the governing framework treats an income stream that appears both in the value of the business and in the support calculation.",
      },
      {
        question: "What is the difference between personal and enterprise goodwill?",
        answer:
          "Enterprise goodwill is value that stays with the business regardless of who owns it; personal goodwill is value tied to the individual owner's reputation and relationships. Some frameworks treat only enterprise goodwill as marital property. The economist quantifies each where the distinction matters and explains the basis for the split.",
      },
      {
        question: "Can separate property be traced through years of commingling?",
        answer:
          "Often, if the account statements are available. The economist follows the separate contribution through each account and transaction and documents the path. Where the records run out, the report states the point at which tracing could not continue rather than assuming a result.",
      },
      {
        question: "What if a spouse's earning capacity, rather than actual income, is at issue?",
        answer:
          "Whether a spouse who is not working, or is working below prior earnings, could reasonably earn more is a question of employability and attainable occupations, which is a vocational discipline rather than an economic one. The affiliated vocational practice prepares that opinion, and the economist applies it to the support calculation with published wage data for the occupations and the area, so the income scenario rests on a stated foundation rather than an assumption.",
      },
      {
        question: "Can the economist serve as a joint or court-appointed expert?",
        answer:
          "Yes. The methods and reporting are the same whether the engagement is for one spouse, both, or the court, and the report is written so that either side can examine the assumptions.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD", "BLS_CPS", "BLS_OES", "CENSUS_ACS"]),
  },
  {
    slug: "fraud-and-embezzlement",
    name: "Fraud and Embezzlement",
    shortName: "Fraud",
    category: "commercial",
    titleBase: "Fraud and Embezzlement Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A fraud or embezzlement economic claim establishes how much was taken, over what period, by what mechanism, and where it went, and quantifies the loss in a form that supports a civil claim or a restitution figure.",
    inShort: [
      "The claim consists of the amounts diverted, the consequential losses the diversion caused, the cost of investigation, and the current value of assets the funds bought.",
      "Bank records, the general ledger, payroll and vendor files, and third-party records that confirm or contradict the internal books drive the number.",
      "Documented amounts, pattern-based estimates, and amounts that could not be determined are reported separately.",
    ],
    steps: [
      "Map the scheme's mechanism from the records and identify each transaction that fits it.",
      "Confirm the amounts against bank statements, cancelled checks, and third-party documents rather than the internal books alone.",
      "Trace the diverted funds forward to the accounts and assets they reached, and quantify the consequential losses with the causal link explained.",
      "Separate the amounts established from records, the amounts estimated from patterns, and the amounts that could not be determined.",
    ],
    summary:
      "Fraud and embezzlement matters require the economist to establish how much was taken, over what period, by what mechanism, and where it went, and then to quantify the loss to the business or the victim in a form that supports a civil claim or a restitution figure. The analysis is built from the transaction record and states what was found, what could not be determined, and the basis for every amount.",
    lossComponents:
      "The claim consists of the amounts diverted, reconstructed transaction by transaction from bank records, the general ledger, payroll, vendor files, and supporting documents; the consequential losses the diversion caused, such as lost profits when funds were unavailable to the business, penalties and interest, or the cost of borrowing to replace the funds; the cost of investigating and remediating the scheme; and, where the assets were converted into property or other holdings, the current value of what the funds bought. The drivers are the completeness of the bank and accounting records, the accounting system's audit trail, and third-party records that confirm or contradict the internal books.",
    damagesExposure:
      "The direct loss is usually the amount traced through the records, and its size depends on how long the scheme ran and how far back the records permit reconstruction. Consequential losses can exceed the direct loss when the diversion starved a business of working capital or caused a default. Where the funds were used to acquire assets, tracing to those assets can support recovery from the assets themselves, which changes the practical exposure. The analysis states the amounts by year and by method so that partial findings and limitations are visible.",
    economicImpact:
      "The economist maps the scheme's mechanism from the records, identifies each transaction that fits it, and confirms the amounts against bank statements, cancelled checks, and third-party documents rather than the internal books alone. The diverted funds are traced forward to the accounts and assets they reached, and the consequential losses are quantified from the business's financial records with the causal link explained. The report separates the amounts established from records, the amounts estimated from patterns where records are missing, and the amounts that could not be determined, so the claim rests on a documented figure and the fact finder can see the limits of the evidence.",
    relevantServices: ["fraud-and-asset-tracing", "lost-profits-and-commercial-damages", "business-valuation", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "MBA"],
    faqs: [
      {
        question: "What records are needed to quantify an embezzlement?",
        answer:
          "Bank statements with check images and deposit detail for every account involved, the general ledger and sub-ledgers, payroll records, vendor master files and invoices, expense reports, and access logs for the accounting system. Third-party records, such as vendor confirmations and bank records obtained by subpoena, are often decisive.",
      },
      {
        question: "How is the loss quantified when records are incomplete?",
        answer:
          "The economist quantifies what the records support directly and, where a consistent pattern exists, estimates the missing periods with the method and its limitations stated. The report separates documented amounts from estimated amounts so counsel can decide how to present each.",
      },
      {
        question: "Can the analysis follow the money into assets?",
        answer:
          "Yes. Tracing follows the diverted funds through the accounts they passed through to real estate, vehicles, investments, or other holdings, and documents each step. The report identifies the assets and the portion of their value attributable to the diverted funds.",
      },
      {
        question: "Does the economist offer an opinion on intent?",
        answer:
          "No. The economist establishes what happened to the money, how, and in what amounts. Whether the conduct was fraudulent is a question for the fact finder on the whole record.",
      },
    ],
    sources: refsToSources(["ACFE", "FRCP_26", "FRE_702", "DAUBERT"]),
  },
  {
    slug: "product-liability",
    name: "Product Liability",
    shortName: "Product Liability",
    category: "personal-injury",
    titleBase: "Product Liability Economist",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    summaryShort:
      "A product liability economic claim measures lost earnings and benefits, household services, and the present value of future care, or the survivors' loss when the injury was fatal, built from the injured person's own path rather than from an occupation the product happened to involve.",
    inShort: [
      "The claim consists of lost earnings and earning capacity, lost fringe benefits, household services, and the present value of future care, or the survivors' loss in a fatal injury.",
      "The earnings and benefit history, the medical and work-capacity opinions, and the care plan drive the number; for a child or homemaker, the educational path and household work replace wage records.",
      "Every future stream is discounted to present value, and in multi-claimant matters one documented methodology is applied to each claimant's own record.",
    ],
    steps: [
      "Establish the but-for path from the earnings history or, for a child, student, or homemaker, from the educational path, occupational data, or the household work performed.",
      "Draw the post-injury path from actual earnings and the work-capacity opinions, and project both paths over the applicable worklife or life expectancy with growth.",
      "Value household services from time-use data and local rates, and price future care from the life care plan with category-specific cost growth.",
      "Discount every stream to present value at a stated rate and, where there are multiple claimants, apply one documented methodology to each record.",
    ],
    summary:
      "Product liability matters present the same economic loss questions as other injury and death claims, with the added feature that the injured person is often a consumer or worker whose exposure to the product bears no relation to their occupation, so the earnings analysis must be built from that person's own path. The economist measures lost earnings and benefits, household services, and the present value of future care, or the survivors' loss when the injury was fatal, from the record.",
    lossComponents:
      "The claim consists of lost earnings and earning capacity from the date of injury across the person's expected worklife, lost fringe benefits, the replacement value of household services, and the present value of future care costs documented in a life care plan or treating recommendations. In a fatal injury the components become the survivors' loss of support, household services, and the estate's claim where the framework provides one. In mass tort settings the analysis may also require a consistent methodology applied across many claimants with different ages, occupations, and injuries. The drivers are the earnings and benefit history, the medical and work-capacity opinions, and the care plan.",
    damagesExposure:
      "The exposure tracks the injury: burns, amputations, and neurological injuries produce large future earnings and care losses; less severe injuries produce a bounded past loss and limited future treatment. Because product cases often involve children, homemakers, and retirees, the household services and care components frequently outweigh the earnings loss, and the analysis must be built from those components rather than from wage records that do not exist. For fatal injuries the exposure follows the wrongful death structure with the personal consumption deduction as the key assumption.",
    economicImpact:
      "The economist establishes the but-for path from the person's earnings history or, for a child, student, or homemaker, from the educational path and occupational earnings data or from the household work the person performed, and projects it over the applicable worklife or life expectancy with growth. The post-injury path is drawn from actual earnings and the work-capacity opinions, and future care from the life care plan with category-specific cost growth. Household services are valued from time-use data and local replacement rates. All future streams are discounted to present value with the rate stated, and where the matter involves multiple claimants the report applies a documented common methodology so results are consistent and each claimant's figure can be traced to their own record.",
    relevantServices: ["personal-injury-economic-damages", "wrongful-death-economic-loss", "lost-earnings-and-earning-capacity", "household-services-valuation", "life-care-plan-cost-projection"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    faqs: [
      {
        question: "How is the loss measured for a child injured by a product?",
        answer:
          "The earnings path is projected from the educational attainment the record supports and occupational earnings data for that level, starting at the age the child would have entered the workforce. Household services and future care are projected over life expectancy. The report states the education assumption and shows how the result changes under alternatives.",
      },
      {
        question: "Can the economist support a consistent damages model across many claimants?",
        answer:
          "Yes. The economist documents one methodology for earnings, benefits, household services, and care, then applies it to each claimant's own records so the figures are consistent in method and individual in result. This supports both settlement allocation and trial.",
      },
      {
        question: "How are household services valued for a retiree or homemaker?",
        answer:
          "From the hours of household work the person performed, drawn from the household's account and time-use data for similar people, valued at the cost of replacing those hours with paid services and projected over the person's expected life or the period the injury limits them.",
      },
      {
        question: "What does the economist need from the treating providers?",
        answer:
          "Opinions on work capacity and on the future care the injury requires, either as a life care plan or as treatment recommendations with frequency and duration. The economist prices and discounts those inputs; the economist does not decide what care is needed.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS", "CDC_LIFE_TABLES", "TREASURY_YIELD"]),
  },
  {
    slug: "tax-and-transfer-pricing-dispute",
    name: "Tax and Transfer Pricing Dispute",
    shortName: "Tax Dispute",
    // The journey headings keep the query term ("Transfer Pricing: Economist
    // at Deposition"); the pair titles keep "Tax Dispute" so the pillar's own
    // pair never reads "Transfer Pricing Expert for Transfer Pricing".
    journeyShortName: "Transfer Pricing",
    category: "tax",
    titleBase: "Tax and Transfer Pricing Dispute Economist",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    // A tax or transfer pricing dispute is an arm's length or valuation
    // question, not a damages claim; these strings replace the shared damages
    // framing on the hub, state, and service x case type x state pages (see
    // CaseTypeFraming). Owner request 2026-10-05: written from the
    // economist's standpoint, neutral between taxpayer and government and
    // between the parties to a civil claim, citation-free, with the statute,
    // the regulations, and the forums' rules carried by the registry sources.
    framing: {
      // The hub keeps the full keyword ("Tax and Transfer Pricing Dispute
      // Economist | KW Economics", 57 characters). The full stem cannot sit
      // beside a place name inside the 60-character tag, so the state tier
      // takes "Transfer Pricing Economist", which no pillar label shares (the
      // pillar's state pages read "Transfer Pricing in <place>").
      titleStem: "Tax and Transfer Pricing Dispute Economist",
      stateTitleStems: ["Transfer Pricing Economist"],
      hubHeading: "Economic Analysis for Tax and Transfer Pricing Disputes",
      hubDescription:
        "Arm's length analysis for tax and transfer pricing disputes: the controlled transactions, the method and comparables, and the forums that decide them.",
      stateHeadingStem: "Economic Analysis for Tax and Transfer Pricing Disputes",
      stateDescription:
        "Arm's length analysis for tax and transfer pricing disputes in {place}: the transactions, the comparables, the forums, and expert witness work.",
      stateLead:
        "{org} prepares the economic analysis in tax and transfer pricing disputes involving businesses in {place}: the controlled transactions at issue, the functional analysis and comparables that test their prices, and a report written for the forum that decides the dispute, whether a federal tax forum, a state tax appeal, or a court in {place}, for either side.",
      stateStepsIntro:
        "The same four steps apply to a tax or transfer pricing dispute involving {place}; the forum that hears the dispute and the rule of decision it applies decide how the result is used.",
      // The statute and regulations are uniform, but the circuit is not: a
      // corporation's Tax Court appeal lies to the circuit of its principal
      // place of business, whose precedent the Tax Court follows, and a
      // refund suit is brought where the business is based.
      stateFramework:
        "A federal transfer pricing dispute applies the same statute and regulations wherever the business is based, but where it is based decides which appellate decisions govern: an appeal from the Tax Court ordinarily goes to the federal court of appeals for the circuit where a corporation has its principal place of business{circuitNote}, whose precedent the Tax Court follows, and a refund suit is filed in the federal district where the business is based or in the Court of Federal Claims. Whether {place} reallocates income between related companies under its own tax, requires royalties or interest paid to an affiliate to be added back, or combines affiliates in one return, and whether a commercial, shareholder, or matrimonial claim in {place} adopts an arm's length benchmark, are questions counsel confirms; the report presents the analysis so it can be applied under either party's position.",
      circuitNote: " (for a business based in {place}, {circuit})",
      stateFrameworkQuestion: "Which rules govern a tax or transfer pricing dispute involving {place}?",
      sections: {
        components: "What the economic analysis consists of",
        concentration: "Which choices move the result",
        method: "How the analysis is built",
        framework: "Tax and legal framework",
      },
      pairStateLead:
        "{org} prepares {work} for {matter} matters involving businesses in {place}: the controlled transactions and prices at issue, the records and comparables that test them, and a report written for the forum that decides the dispute. Either side.",
      // The federal forums and their appeals first, then the state's own tax
      // process, then the state courts with the state's appeal: commercial
      // and shareholder claims in the courts the page lists (the business
      // selection: chancery, business, and general-jurisdiction courts), a
      // divorce in the court that hears divorce.
      courtsSentence:
        "Federal income tax disputes over related-party prices are heard in the United States Tax Court or, on a refund claim, in a federal district court or the Court of Federal Claims; appeals from the Tax Court and the district courts ordinarily go to the federal court of appeals for the circuit where the business is based, and appeals from the Court of Federal Claims to the Federal Circuit. A dispute over {placePoss} own tax follows its administrative and appeal process. Commercial and shareholder claims in {placeP} that turn on an intercompany price are heard in {courts}, with final appeals to the {supremeCourt}, and a divorce in which one bears on income or the value of a business is heard in [[/case-types/divorce-and-marital-dissolution/{stateSlug}|the court that hears divorce in {placeP}]].",
      // The federal tax forums apply the federal rules of evidence (the Tax
      // Court by statute); the state's own inquiry governs only the claims
      // heard in its courts.
      expertStandard:
        "Federal tax forums test expert testimony under the federal rules of evidence, which the Tax Court applies by statute: whether the expert is qualified, whether the testimony rests on sufficient facts or data and on reliable methods, and whether those methods were reliably applied to the facts of the case. The commercial, shareholder, and matrimonial claims heard in {placePoss} courts are tested under its own standard, and a state tax appeal follows the rules of the forum that hears it. {inquiry} A transfer pricing report meets each of these inquiries by stating every method choice and naming the data behind every comparable.",
      pairStateFrameworkTail:
        "The report states each transaction, method choice, and comparable screen with its source and shows the result under the opposing method, tested party, and comparables, so counsel can apply the rule of decision of the forum that hears the dispute to a documented result.",
      forums: {
        noun: "forums",
        courtsQuestion: "Which forums hear a tax or transfer pricing dispute involving {placeP}?",
        expertQuestion: "What do the forums that hear a tax or transfer pricing dispute involving {placeP} ask of {work}?",
        list: [
          { label: "United States Tax Court", description: "Hears a challenge to an IRS notice of deficiency before the tax is paid; a national court that holds trials in cities across the country" },
          { label: "United States District Courts", description: "Hear a refund suit after the tax is paid, in the district where the business is based, with a jury available" },
          { label: "United States Court of Federal Claims", description: "Hears a refund suit after the tax is paid, without a jury; appeals go to the Federal Circuit" },
          { label: "{attr} tax appeals", description: "A dispute over {placePoss} own tax, through its administrative and appeal process" },
        ],
        trialCourtLimit: 2,
      },
    },
    summaryShort:
      "A tax or transfer pricing dispute asks whether the prices one company in a group charged another for goods, services, intangibles, or loans match what unrelated parties would have agreed to, and how much income moves if they do not, answered from the intercompany agreements, the companies' conduct, and comparable transactions.",
    inShort: [
      "The analysis consists of the delineation of the controlled transactions, the functional analysis, the arm's length range under the most reliable method, and any adjustment or restated profit.",
      "The intercompany agreements, the transfer pricing documentation, legal-entity and segmented financial statements, and the ledger detail of the intercompany accounts drive the result.",
      "The same economics serves an examination, the Tax Court, a refund suit, a state tax appeal, and a commercial, shareholder, or divorce case, under each forum's own rule of decision.",
    ],
    steps: [
      "Delineate the controlled transactions from the intercompany agreements, invoices, and ledger, and test the written terms against what the companies actually did.",
      "Establish which company performed each function, owned each valuable asset, and bore and controlled each risk, from the operating records and interviews.",
      "Select the method that gives the most reliable measure of an arm's length result, search for comparables with stated screens, and compute the range from several years of data.",
      "Compare the controlled result with the range, quantify any adjustment or restated profit by year, and show how the result moves under the opposing method, tested party, and comparables.",
    ],
    summary:
      "Tax and transfer pricing disputes turn on prices that no market set: what one company in a commonly controlled group charged another for goods, services, the use of intangibles, or financing, and whether that price, or the profit it left in each company, matches what unrelated parties would have agreed to in the same transaction under the same circumstances. The economist rebuilds the transactions from the agreements and the record, measures them against comparable transactions or companies under the most reliable method, and states the arm's length result and any adjustment so that a tax authority, a court, or the other side can test every choice behind it.",
    lossComponents:
      "The analysis consists of the delineation of each controlled transaction at issue, whether a sale of goods, a service, a license of patents, trademarks, software, or know-how, or an intercompany loan or guarantee; the functional analysis of what each company did, owned, and risked; the arm's length range under the method that gives the most reliable measure; and the adjustment, or the restated profit, that follows from comparing the controlled result with that range, by year and by entity. Where a tax dispute concerns the value of property rather than a recurring price, such as intangibles transferred to a foreign affiliate or a closely held interest transferred by gift or at death, the analysis is a valuation under the standard the tax framework applies. The drivers are the intercompany agreements and their amendments, the transfer pricing policy and documentation for each year, legal-entity and segmented financial statements, the general ledger detail of the intercompany accounts and any year-end adjustments, the tax returns and information returns that report related-party transactions, and any advance pricing agreement.",
    damagesExposure:
      "The result usually turns on a few choices: the method, and whether a comparable price or a profit-based method is the more reliable on the facts; the tested party, and whether it is truly the simpler participant; the comparables and the screens that admitted or excluded them; the profit level indicator; the years of data; and the point within the range the forum uses. For intangibles, who owns them, who performed the functions that created their value, and whether the royalty base and terms match the comparables move the result most. Penalty exposure in a federal case depends on whether the documentation that existed when the return was filed supported a reasonable method, a separate question from whether the price was arm's length, and in commercial, shareholder, and divorce cases the restated profit carries into a damages claim or a valuation, where the governing contract or duty decides how it is used.",
    economicImpact:
      "The economist starts from the intercompany agreements and tests their terms against the invoices, the ledger, and the companies' conduct, because a contractual allocation of risk is respected only where the conduct is consistent with it. The functional analysis follows, from organization charts, operating records, and interviews, to establish which company performed the research, manufacturing, marketing, distribution, and support functions, which owned the valuable intangibles, and which bore the market, inventory, credit, and currency risks. The method is selected under the best method rule with the rejected alternatives explained, the comparables are searched for and screened with every criterion stated, comparability adjustments are made where the data support them, and the arm's length range is computed from several years of data. The controlled result is compared with the range, the adjustment or restated profit is quantified by year, and the report shows the result under the opposing method, tested party, and comparable set, written for the forum that decides the dispute: as direct testimony in the Tax Court, as a disclosed report in a refund suit or a commercial case, or as the economic position put to an appeals officer or a competent authority.",
    relevantServices: ["transfer-pricing-expert-witness", "business-valuation", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "MBA", "PhD"],
    faqs: [
      {
        question: "Where are tax and transfer pricing disputes decided?",
        answer:
          "A federal dispute usually begins in an IRS examination, can go to the IRS Independent Office of Appeals, and, if it is not resolved, is heard in the United States Tax Court without first paying the tax or, on a refund claim, in a federal district court or the Court of Federal Claims. A cross-border adjustment can be taken to the treaty partner through the mutual agreement procedure, a state tax dispute follows the state's own appeal process, and commercial, shareholder, and divorce claims that turn on an intercompany price are heard in the civil courts.",
      },
      {
        question: "Does the economist decide whether a price was arm's length, or only measure it?",
        answer:
          "The economist measures it and states the basis: the transactions as delineated, the method and why it is the most reliable, the comparables, and the range. Whether that result governs is for the tribunal. In a tax forum the arm's length standard is the rule of decision; in a commercial, shareholder, or divorce case the court decides whether to adopt the arm's length result as the measure, adjust it, or give it limited weight.",
      },
      {
        question: "What happens when two countries tax the same profit?",
        answer:
          "An adjustment by one country raises the income reported there without lowering the income the affiliate on the other side of the transaction reported, so the same profit is taxed twice. Under a tax treaty the taxpayer can ask the two competent authorities to resolve the double taxation through the mutual agreement procedure, and an advance pricing agreement can fix the method for future years; in either setting the economic analysis is the one a court would see, presented to tax authorities who can agree on a point, a range, or a method.",
      },
      {
        question: "When does a transfer pricing adjustment carry a penalty?",
        answer:
          "A large net transfer pricing adjustment can carry a penalty unless the taxpayer had documentation, in existence when the return was filed and produced on request, showing that it reasonably selected and applied a method. A separate penalty can apply to a single transaction whose price on the return is far from the arm's length price, whatever the size of the net adjustment, unless the taxpayer shows reasonable cause and good faith; documentation that meets the net adjustment rules is treated as showing it. Whether either protection holds is a different question from whether the price was arm's length, so the economist addresses the two separately and states which records each conclusion rests on.",
      },
    ],
    sources: refsToSources(["IRC_482", "TREAS_REG_1_482_1", "TREAS_REG_1_6662_6", "TAX_COURT_RULE_143", "IRS_TP_EXAM_PROCESS", "IRS_MAP_OVERVIEW", "OECD_TP_GUIDELINES"]),
  },
  {
    slug: "intellectual-property-infringement",
    name: "Intellectual Property Infringement",
    shortName: "IP Infringement",
    // A trial over intellectual property damages turns on the royalty and its
    // apportionment far more often than on a present value.
    journeyTrialFocus: "explaining the royalty",
    category: "intellectual-property",
    titleBase: "Intellectual Property Infringement Economist",
    datePublished: "2026-10-06",
    dateModified: "2026-10-06",
    // Owner request 2026-10-06. An infringement or misappropriation claim is
    // a damages claim, so the hub title, the H1s, and the section headings
    // keep the shared damages strings; the venue framing replaces only the
    // state-court forum and the state damages rules the shared strings would
    // print, because patent and copyright claims are heard only in the
    // federal courts and the federal statutes set the measures (see
    // CaseTypeVenueFraming). Written for the patentee and the accused
    // infringer alike, citation-free, with the statutes and decisions
    // carried by the registry sources.
    venueFraming: {
      hubDescription:
        "Patent, trademark, copyright, and trade secret damages: the reasonable royalty, lost profits, the infringer's profits, and how each is apportioned to the right.",
      stateDescription:
        "Intellectual property infringement damages in {place}: the patent, trademark, copyright, and trade secret claims, the courts, and the analysis.",
      stateLead:
        "{org} prepares economic damages analyses for intellectual property infringement cases involving {placeP}: the measure each patent, trademark, copyright, and trade secret claim carries, the sales, cost, and license records that drive it, and a report built for the federal courts, which alone hear patent and copyright claims, and for the {attr} courts that hear claims under {attr} law. Plaintiff and defense.",
      stateStepsIntro:
        "The same four steps apply to an intellectual property infringement case involving {placeP}; the statute behind each claim, set out above, decides which measures enter the total.",
      // The federal measures first (they do not change with the state,
      // though the regional circuit's decisions govern how the copyright and
      // trademark measures are applied; copyright statutory damages only for
      // a work registered in time), then the trade secret statutes without a
      // claim about any one place's enactment, then the place's own law for
      // the contract and license claims.
      stateFramework:
        "Patent, copyright, and trademark damages are set by federal statute: a reasonable royalty at least, and lost profits where they are proven, for a patent, with recovery limited to six years before suit and, for unmarked products, to the period after notice; the defendant's profits, the owner's actual damages, and the costs of the action for a trademark; and actual damages and the infringer's profits for a copyright, or statutory damages the owner elects instead where the work was registered in time, before the infringement began or within three months after first publication. Those measures do not change with the state, though the regional circuit's decisions govern how the copyright and trademark measures are applied. A trade secret claim can be brought under the federal statute, and most states, the District of Columbia, Puerto Rico, and the U.S. Virgin Islands have also enacted a version of the Uniform Trade Secrets Act; {placePoss} own law can govern the contract and license claims, whether they are brought with an infringement claim or on their own, and counsel confirms which trade secret law applies and the measures it allows.",
      stateFrameworkQuestion: "Which damages rules apply to an intellectual property claim involving {placeP}?",
      pairStateLead:
        "{org} prepares {work} for {matter} cases involving {placeP}: the measure each patent, trademark, copyright, or trade secret claim carries, the sales, cost, and license records that drive it, and a report built for the federal and {attr} courts that hear the claims. Plaintiff and defense.",
      pairStateFrameworkQuestion: "Which damages rules shape {work} in an intellectual property case involving {placeP}?",
      pairStateFrameworkTail:
        "The report presents each measure the claims support with its period, base, and apportionment, states every license, rate, and cost with its source, and shows the result under the alternatives the other side is likely to argue, so counsel can apply the federal statute or the {attr} law that governs each claim to a documented figure.",
      // The federal courts first (exclusive for patent and copyright claims:
      // the place's district courts for a case filed there, another district
      // where venue lies, the Court of Federal Claims for a claim against the
      // United States), the Federal Circuit for patent appeals, the regional
      // circuit otherwise, then the claims under the place's own law: with
      // the infringement claim in federal court when joined with a patent or
      // copyright claim, in federal court on diverse citizenship, and
      // otherwise in the place's own courts, with their appeal.
      courtsSentence:
        "Patent and copyright claims arise under federal law that only the federal courts may hear: a case filed in {placeP} is heard in {federalCourts}, a case involving a business based in {placeP} may be filed in another district where venue lies, and a claim against the United States goes to the Court of Federal Claims; trademark and trade secret claims can be filed in federal court or in {placePoss} own courts. An appeal in a case with a claim or compulsory counterclaim under the patent laws goes to the United States Court of Appeals for the Federal Circuit, and an appeal in any other case from the district court to {circuit}. Claims under {attr} law, such as {stateClaims}, are usually heard with the infringement claim in federal court when they are joined with a patent or copyright claim, and can be heard there on their own where the parties' diverse citizenship brings them within federal jurisdiction; otherwise they are heard in {courts}, with final appeals to the {supremeCourt}.",
      courtsSentenceNoDistrict:
        "Patent and copyright claims arise under federal law that only the federal courts may hear, and {placeP} has no federal district court of its own, so such a claim involving a business there is filed in a federal district court where venue lies, or, against the United States, in the Court of Federal Claims, and a federal trademark or trade secret claim can be filed in a district court as well. An appeal in a case with a claim or compulsory counterclaim under the patent laws goes to the United States Court of Appeals for the Federal Circuit from whichever district court hears it. Claims under {attr} law, such as {stateClaims}, are usually heard with the infringement claim when they are joined with a patent or copyright claim; brought on their own, they are heard in {courts}, with final appeals to the {supremeCourt}.",
      expertStandard:
        "In the federal district courts, which hear patent and copyright infringement claims between private parties, damages testimony is tested under the federal rules of evidence: whether the expert is qualified, whether the testimony rests on sufficient facts or data, and whether reliable methods were reliably applied to the facts of the case, with the proponent showing each is more likely than not. Claims heard in {placePoss} own courts are tested under the standard those courts apply. {inquiry} An intellectual property damages report meets each of these inquiries by tying every royalty input, apportionment step, and sales figure to the record or to another expert's stated opinion.",
      stateClaims: {
        stated: "trade secret misappropriation, unfair competition, and disputes over royalties owed under a license",
        unstated: "disputes over royalties owed under a license",
      },
      forums: {
        noun: "courts",
        courtsQuestion: "Which courts hear an intellectual property infringement case involving {placeP}?",
        expertQuestion: "What do the courts that hear an intellectual property case involving {placeP} ask of {work}?",
        list: [
          {
            label: "{federalCourtsName}",
            description: "Patent and copyright claims, which only the federal courts may hear, and the trademark and trade secret claims filed in federal court",
            requires: "districts",
          },
          {
            label: "United States Court of Appeals for the Federal Circuit",
            description: "Appeals in every case with a claim or compulsory counterclaim under the patent laws, from any federal district court",
          },
          {
            label: "United States Court of Appeals for the {circuitName} Circuit",
            description: "Appeals in copyright, trademark, and trade secret cases that raise no patent claim",
            requires: "circuit",
          },
        ],
        trialCourtLimit: 2,
      },
      // The statutes and rules behind the state and pair x state copy: the
      // forums and appeals (1338, 1400, 1498, 1332, 1367, 1295), the federal
      // measures and their limits (284, 286, 287, 1117, 504, 412), the trade
      // secret statutes (1836, the uniform act), and the federal expert
      // standard; the pair x state page adds the exposure paragraph's Texas
      // example of exemplary damages for the fact finder.
      stateSources: refsToSources([
        "JURISDICTION_1338",
        "PATENT_VENUE_1400",
        "GOVERNMENT_USE_1498",
        "DIVERSITY_1332",
        "SUPPLEMENTAL_1367",
        "FEDERAL_CIRCUIT_1295",
        "PATENT_284",
        "PATENT_286",
        "PATENT_287",
        "LANHAM_ACT_1117",
        "COPYRIGHT_504",
        "COPYRIGHT_412",
        "DTSA_1836",
        "UNIFORM_TRADE_SECRETS_ACT",
        "FRE_702",
      ]),
      exposureSources: refsToSources(["TEXAS_UTSA_134A"]),
    },
    summaryShort:
      "An intellectual property infringement claim measures what the unauthorized use of a patent, trademark, copyright, or trade secret cost the owner or gained the user, under the measure each statute provides, apportioned to the protected right and built from both sides' sales, cost, and license records.",
    inShort: [
      "The claim consists of a reasonable royalty or lost profits for a patent, the defendant's profits and the owner's actual damages for a trademark, actual damages and the infringer's profits for a copyright, and actual loss, unjust enrichment, or a royalty for a trade secret.",
      "The accused products' sales, prices, and costs, the owner's own sales and capacity, and the licenses to the rights in suit and to comparable technology drive the number.",
      "Each measure is apportioned to the protected right, limited to the recoverable period, and stated with prejudgment interest on the basis the court adopts.",
    ],
    steps: [
      "Identify the rights asserted, the accused products, and the recoverable period, applying the limitation, notice, and protection periods each claim carries.",
      "Build the royalty base and the infringing sales from the accused party's sales, pricing, and cost records, and apportion them to the patented feature, the protected work or mark, or the trade secret.",
      "Measure each available remedy: the reasonable royalty from comparable licenses, the profit the right made possible, and the user's alternatives; lost profits from the market and the owner's capacity; and the infringer's profits with its costs tested.",
      "Remove any overlap between the measures, add prejudgment interest on the basis the court adopts, and show how the result moves under the opposing base, licenses, and alternatives.",
    ],
    summary:
      "Intellectual property infringement cases turn on what a protected right was worth to the parties: what the owner lost because a patent, trademark, copyright, or trade secret was used without permission, and what the user gained by using it. Each statute supplies its own measure, from the reasonable royalty that is the floor of every patent award to the trademark owner's claim to the defendant's profits and the trade secret owner's claim to unjust enrichment, and each requires the damages to be tied to the protected right rather than to the rest of the product. The economist builds those measures from both sides' sales, cost, and license records and states every input, so the patentee and the accused infringer, or the owner and the party accused of taking the information, can test it.",
    lossComponents:
      "Depending on the right, the claim consists of a reasonable royalty for the use made of a patent, at the least, and the patentee's lost profits on sales it would have made, including price erosion, and for a design patent the infringer's total profit on the article of manufacture; the defendant's profits, the owner's actual damages, and the cost of corrective advertising for an infringed trademark; the copyright owner's actual damages and the infringer's profits not already counted in them, or, where the work was registered in time (before the infringement began, or within three months after first publication), statutory damages within the range the statute fixes, which the owner can elect instead; and the trade secret owner's actual loss and the misappropriator's unjust enrichment, or a reasonable royalty in their place. A license dispute adds the royalties owed under the contract's own terms. The drivers are the accused products' unit sales, revenue, prices, and costs, the owner's sales, margins, and capacity, the licenses to the rights in suit and to comparable technology, the marking, notice, and public disclosure records that set the damages period, the parties' forecasts and business plans from the date the infringement began, and the technical and survey experts' opinions on what the right covers and what it adds to the product.",
    damagesExposure:
      "Which measure dominates depends on the right and on how the parties compete. Where the owner and the infringer sell competing products and few substitutes exist, lost profits on the diverted sales and price erosion can exceed any royalty; where the owner licenses rather than sells, or many substitutes share the market, the reasonable royalty usually carries the claim, and the royalty base, the comparability of the licenses, and the cost of the infringer's alternatives move it most. In a trademark or copyright claim for the infringer's profits, the costs the infringer can deduct and the share of profit it can attribute to factors other than the protected right are the usual battleground, and in a trade secret case the length of the protection period and the head start, and whether the owner's loss and the misappropriator's gain overlap, often decide the size of the award. Across every right, apportionment to the protected feature is the most contested input. Enhanced patent damages are for the court, and exemplary trade secret damages are for the court under the federal statute and the uniform act, though some state enactments, such as Texas's, give them to the fact finder; either way they turn on the defendant's conduct, not on the economic measure.",
    economicImpact:
      "The economist starts with the rights, the accused products, and the timeline: when the infringement or misappropriation began, when the owner gave notice or marked its products, when the information became public, and which part of the period is recoverable under the limitation rules each claim carries. The accused products' sales, prices, and costs are rebuilt from the accused party's records by product, period, and customer, and the owner's sales, margins, and capacity from its own. For a reasonable royalty, the economist reconstructs the hypothetical negotiation at the start of the infringement from the comparable licenses, read in full and adjusted for scope, form, and circumstances, from the profit the protected feature made possible, and from the cost of the user's next-best alternative, and settles the rate and the base within the bargaining range; for lost profits, the but-for market is rebuilt from demand, substitutes, and capacity, and the incremental profit is computed on the sales the owner would have made; for the infringer's profits, its claimed costs and the share owed to other factors are tested against its ledger. Each measure is apportioned to the protected right with the technical and survey experts' inputs stated, overlaps are removed, prejudgment interest is computed on the basis the court adopts, and the report shows the result under the opposing base, licenses, and alternatives.",
    relevantServices: ["intellectual-property-damages", "lost-profits-and-commercial-damages", "business-valuation", "expert-rebuttal-and-report-review"],
    relevantCredentials: ["Forensic Economist", "MBA", "PhD"],
    faqs: [
      {
        question: "Which courts hear intellectual property infringement cases?",
        answer:
          "Patent and copyright claims arise under federal law, and no court of a state, the District of Columbia, or a territory may hear them. The federal district courts hear patent and copyright infringement claims between private parties, a claim against the United States goes to the Court of Federal Claims, and a small copyright claim can also go, if both sides take part, to the Copyright Claims Board in the Copyright Office. Trademark and trade secret claims can be brought in federal court or in a state court, and claims under state law, such as a trade secret claim under a state statute, unfair competition, or a dispute over the royalties owed under a license, are heard in the state's courts unless they are joined with a federal claim or the parties' diverse citizenship brings them within federal jurisdiction. An appeal in a case with a claim or compulsory counterclaim under the patent laws goes to the United States Court of Appeals for the Federal Circuit; other appeals from the district courts go to the regional court of appeals.",
      },
      {
        question: "Does the economist decide whether the right was infringed?",
        answer:
          "No. Infringement, validity, and whether information qualifies as a trade secret are decided by the fact finder on evidence the economist does not supply, and the technical experts address what the claims cover and which features practice them. The economist measures the damages on the assumption that liability is found, as the reasonable royalty framework itself assumes, and builds the measure so it can be adjusted if the fact finder accepts only some of the asserted claims, products, or secrets.",
      },
      {
        question: "Why do two damages experts in the same case reach such different numbers?",
        answer:
          "Because a few choices carry most of the result: the royalty base and its apportionment, which licenses are treated as comparable and how lump sums are converted to rates, whether the infringer had an acceptable alternative, how the market and the owner's capacity are defined in a lost profits claim, and the length of the damages period. A report that shows the result under the other side's choices as well as its own lets the fact finder see which of those choices explains the gap.",
      },
      {
        question: "What records should be gathered first?",
        answer:
          "The accused products' unit sales, revenue, prices, and costs by product and period; the owner's sales, margins, and capacity for its competing products; every license to the rights in suit and to comparable technology, with the negotiation files; the marking, notice, and public disclosure records that set the damages period; and both sides' business plans and forecasts from around the date the infringement began. Most of it is produced under a protective order, so the request is planned with the order's limits in mind.",
      },
      {
        question: "Is prejudgment interest part of the damages calculation?",
        answer:
          "Usually, and over a long damages period it can be a large part of the total. The patent statute provides for damages together with interest as the court fixes it, and the other intellectual property claims follow their own rules on whether and how interest runs. The court decides the rate and whether it compounds; the economist computes the interest on the basis the court adopts and shows it apart from the damages, so either can be adjusted.",
      },
    ],
    sources: refsToSources([
      "JURISDICTION_1338",
      "FEDERAL_CIRCUIT_1295",
      "PATENT_284",
      "LANHAM_ACT_1117",
      "COPYRIGHT_504",
      "COPYRIGHT_412",
      "DTSA_1836",
      "UNIFORM_TRADE_SECRETS_ACT",
      "TEXAS_UTSA_134A",
      "GOVERNMENT_USE_1498",
      "COPYRIGHT_CLAIMS_BOARD_1502",
      "DIVERSITY_1332",
      "SUPPLEMENTAL_1367",
      "PANDUIT",
      "GEORGIA_PACIFIC",
      "BIG_O_TIRES",
    ]),
  },
];

export function getCaseType(slug: string): CaseType | undefined {
  return caseTypes.find((c) => c.slug === slug);
}

// ---------------------------------------------------------------------------
// Page strings shared by the case-type templates (CaseTypeHub.tsx,
// CaseTypeState.tsx) and the static shells (scripts/prerender.mjs loads this
// module through vite). Each returns the entry's `framing` string where the
// entry carries one, its `venueFraming` string where it carries that (a
// damages claim heard first in the federal courts), and the shared
// economic-damages string otherwise, so the two render paths cannot disagree
// on which framing a case type takes. `place` is the place name as
// geo-prose.mjs placeName() spells it ("the District of Columbia"); `orgName`
// is the brand.
// ---------------------------------------------------------------------------

/** The slots a framing string may carry (see CaseTypeFraming and CaseTypeVenueFraming). */
interface FramingSlots {
  org?: string;
  place?: string;
  work?: string;
  matter?: string;
  attr?: string;
  courts?: string;
  supremeCourt?: string;
  stateSlug?: string;
  inquiry?: string;
  circuit?: string;
  circuitNote?: string;
  federalCourts?: string;
  federalCourtsName?: string;
  circuitName?: string;
  stateClaims?: string;
  /** Running-prose place ("the U.S. Virgin Islands"); derived from `place`. */
  placeP?: string;
  /** Its possessive ("the U.S. Virgin Islands'", "Texas's"); derived from `place`. */
  placePoss?: string;
}

/** Fill the slots of a framing string (see FramingSlots); a slot with no value
 * renders empty. `{placeP}` and `{placePoss}` are derived from `place`
 * (geo-prose.mjs prosePlace and placePossessive). */
const fillSlots = (s: string, slots: FramingSlots): string => {
  const all: FramingSlots = slots.place ? { placeP: prosePlace(slots.place), placePoss: placePossessive(slots.place), ...slots } : slots;
  return s.replace(
    /\{(org|place|work|matter|attr|courts|supremeCourt|stateSlug|inquiry|circuit|circuitNote|federalCourts|federalCourtsName|circuitName|stateClaims|placeP|placePoss)\}/g,
    (_, key: keyof FramingSlots) => all[key] ?? "",
  );
};

/** "a, b, and c" (two names take "and" alone). */
const listNames = (names: string[]): string => {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

/**
 * "the United States District Court for the District of New Jersey", the
 * plural form for a state with several districts, and the territorial
 * districts' own names ("the United States District Court of Guam"), the
 * same rule CaseTypeState.tsx applies to its federal venue sentence.
 */
function federalCourtsPhrase(names: string[]): string {
  if (names.length === 1) {
    return /^District Court\b/.test(names[0]) ? `the United States ${names[0]}` : `the United States District Court for the ${names[0]}`;
  }
  return `the United States District Courts for the ${listNames(names)}`;
}

/** A circuit as its court of appeals is named ("Third", "District of Columbia" for "D.C."). */
const circuitCourtName = (circuit: string): string => (circuit === "D.C." ? "District of Columbia" : circuit);

/**
 * Which of a state's trial courts the case-type x state and service x case
 * type x state pages list, by category (shared by CaseTypeState.tsx,
 * ServiceCaseTypeState.tsx, and scripts/prerender.mjs): the family and
 * equity courts for a divorce, the chancery and business courts for a
 * commercial dispute, the chancery, business, and general-jurisdiction
 * courts alone for the commercial and shareholder claims of a tax or
 * transfer pricing dispute and for the claims under state law that travel
 * with an intellectual property claim (no limited court and no court for
 * claims against the state, such as a Court of Claims), and the
 * general-jurisdiction courts otherwise. An entry with forums of its own also
 * caps the list (CaseTypeForums.trialCourtLimit).
 */
export const CASE_TYPE_COURT_SELECTION: Partial<Record<CaseTypeCategory, CourtSelection>> = {
  family: "family",
  commercial: "commercial",
  tax: "business",
  "intellectual-property": "business",
};

/** The forums block an entry carries, from its framing or its venue framing. */
const forumsOf = (c: CaseType): CaseTypeForums | undefined => c.framing?.forums ?? c.venueFraming?.forums;

/** The court selection and list length for a case type (see CASE_TYPE_COURT_SELECTION). */
export function caseTypeCourtSelection(c: CaseType): { kind: CourtSelection; limit?: number } {
  return { kind: CASE_TYPE_COURT_SELECTION[c.category] ?? "general", limit: forumsOf(c)?.trialCourtLimit };
}

/** Hub H1. */
export function caseTypeHubHeading(c: CaseType): string {
  return c.framing?.hubHeading ?? `${c.name} Economic Damages Analysis`;
}

/** Hub meta description. */
export function caseTypeHubDescription(c: CaseType): string {
  return (
    c.framing?.hubDescription ??
    c.venueFraming?.hubDescription ??
    `${c.name} economic damages: loss components, the records that drive them, and how the present value is built. Plaintiff and defense.`
  );
}

/** State-tier H1. */
export function caseTypeStateHeading(c: CaseType, place: string): string {
  return c.framing ? `${c.framing.stateHeadingStem} in ${place}` : `${c.name} Economic Damages Expert in ${place}`;
}

/** State-tier meta description. */
export function caseTypeStateDescription(c: CaseType, place: string): string {
  const text = c.framing?.stateDescription ?? c.venueFraming?.stateDescription;
  return text
    ? fillSlots(text, { place })
    : `${c.name} economic damages in ${place}: loss components, state damages rules and venues, and how the number is built.`;
}

/** State-tier lead paragraph under the H1. */
export function caseTypeStateLead(c: CaseType, orgName: string, place: string): string {
  const text = c.framing?.stateLead ?? c.venueFraming?.stateLead;
  return text
    ? fillSlots(text, { org: orgName, place, attr: place.replace(/^the /, "") })
    : `${orgName} prepares economic damages analyses for ${c.name.toLowerCase()} cases venued in ${place}: the components the loss claim consists of, the records that drive them, and a present value built to ${place}'s damages rules and venues. Plaintiff and defense.`;
}

/** "a"/"an" by first letter ("an employment discrimination case"). */
const withArticle = (phrase: string): string => `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;

/** State-tier sentence that introduces the numbered steps. */
export function caseTypeStateStepsIntro(c: CaseType, place: string): string {
  const text = c.framing?.stateStepsIntro ?? c.venueFraming?.stateStepsIntro;
  return text
    ? fillSlots(text, { place })
    : `The same four steps apply to ${withArticle(c.name.toLowerCase())} case venued in ${place}; the damages framework above decides which components enter the total.`;
}

/**
 * State-tier framework paragraph: the entry's own where it carries one, else
 * the state module's text the caller selected (damagesContext for the injury
 * and death categories, generalContext otherwise). `circuit` is the federal
 * circuit the place sits in (src/data/courts/federal-districts.ts
 * circuitOfState: "Second", "D.C."), which fills the entry's circuitNote; a
 * place in no circuit takes none. A venue-framed entry (intellectual
 * property) prints its own paragraph: the federal statutes set its measures.
 */
export function caseTypeStateFramework(c: CaseType, place: string, stateFrameworkText: string, circuit?: string): string {
  if (c.venueFraming) return fillSlots(c.venueFraming.stateFramework, { place });
  if (!c.framing) return stateFrameworkText;
  const circuitNote =
    circuit && c.framing.circuitNote ? fillSlots(c.framing.circuitNote, { place, circuit: `the ${circuit} Circuit` }) : "";
  return fillSlots(c.framing.stateFramework, { place, circuitNote });
}

/**
 * The expert-standard paragraph of the state tier and the service x case
 * type x state page: the state's own text (`regulation.expertStandard`,
 * which closes on how an economic damages report meets the inquiry), or for
 * a framing or venue-framed entry its own paragraph around the state's
 * inquiry alone (src/data/regulations/state-regs.ts expertInquiryOf).
 */
export function caseTypeExpertStandard(
  c: CaseType,
  place: string,
  regulation: { expertStandard: string; expertInquiry?: string },
): string {
  const text = c.framing?.expertStandard ?? c.venueFraming?.expertStandard;
  return text ? fillSlots(text, { place, inquiry: expertInquiryOf(regulation) }) : regulation.expertStandard;
}

/** The close of the service x case type x state framework FAQ answer (`attr` is the attributive place name). */
export function caseTypePairStateFrameworkTail(c: CaseType, attr: string): string {
  const text = c.framing?.pairStateFrameworkTail ?? c.venueFraming?.pairStateFrameworkTail;
  return text
    ? fillSlots(text, { attr })
    : `The report presents past and future amounts separately, states every rate and table with its source, and shows the result under the alternatives the other side is likely to argue, so counsel can apply the ${attr} rules to a documented figure.`;
}

/**
 * The service x case type x state framework FAQ question (`work` is the
 * pillar's work phrase): "How does the <attr> <framework> shape <work> in
 * <matter> case?", or a venue-framed entry's own question, since the
 * federal statutes rather than the state's framework set its measures.
 */
export function caseTypePairStateFrameworkQuestion(c: CaseType, attr: string, place: string, work: string): string {
  if (c.venueFraming) return fillSlots(c.venueFraming.pairStateFrameworkQuestion, { place, work });
  return `How does the ${attr} ${caseTypeSectionHeadings(c).framework.toLowerCase()} shape ${work} in ${withArticle(c.name.toLowerCase())} case?`;
}

/** The local FAQ question over the framework paragraph. */
export function caseTypeStateFrameworkQuestion(c: CaseType, place: string): string {
  const text = c.framing?.stateFrameworkQuestion ?? c.venueFraming?.stateFrameworkQuestion;
  return text ? fillSlots(text, { place }) : `How does ${place}'s damages framework shape the economic analysis?`;
}

/** The state page's Service node description. */
export function caseTypeStateServiceDescription(c: CaseType, place: string): string {
  return c.framing
    ? fillSlots(c.framing.stateDescription, { place })
    : `Economic damages analysis for ${c.name.toLowerCase()} matters in ${place}.`;
}

/**
 * Lead of the service x case type x state page. `work` is the pillar's work
 * phrase (src/lib/service-prose.mjs workPhrase), `place` the place name, and
 * `attr` its attributive form (geo-prose.mjs placeAttr).
 */
export function caseTypePairStateLead(c: CaseType, orgName: string, work: string, place: string, attr: string): string {
  const matter = c.name.toLowerCase();
  const text = c.framing?.pairStateLead ?? c.venueFraming?.pairStateLead;
  return text
    ? fillSlots(text, { org: orgName, work, matter, place, attr })
    : `${orgName} prepares ${work} for ${matter} cases venued in ${place}: what the loss claim consists of, the records that drive it, and a present value built to ${attr} damages rules and venues. Plaintiff and defense.`;
}

/**
 * The answer of the service x case type x state FAQ "How is <work> built for
 * <matter> case in <place>?": the pillar's note for the pair, which says how
 * the pillar's own analysis is built for the case type (every declared pair
 * carries one), or the case type's steps under the state intro where a pair
 * has none. The case type's generic steps would answer a different question
 * wherever the pillar's work is not the case type's usual measure (a license
 * royalty in a contract case, a valuation in an infringement case).
 */
export function caseTypePairStateBuildAnswer(c: CaseType, place: string, note?: { summary: string }): string {
  return note?.summary ?? `${caseTypeStateStepsIntro(c, place)} ${c.steps.join(" ")}`;
}

/** The state facts the courts answer reads. */
export interface CaseTypeCourtsInput {
  /** The place name (geo-prose.mjs placeName). */
  place: string;
  /** The trial courts the page lists ("the Superior Court (...) and the ..."). */
  courtList: string;
  /** The state's highest court ("Supreme Court of New Jersey"). */
  supremeCourt: string;
  stateSlug: string;
  /** The place's federal district court names ("District of New Jersey"),
   * which a venue-framed entry names first; none for American Samoa. */
  federalDistricts?: string[];
  /** The place's circuit ("Third", "D.C."; federal-districts.ts circuitOfState). */
  circuit?: string;
}

/** What a venue-framed entry's `{stateClaims}` slot reads for a place (see CaseTypeVenueFraming.stateClaims). */
function stateClaimsOf(venue: CaseTypeVenueFraming, stateSlug: string): string {
  return LOCAL_TRADE_SECRET_LAW_UNSTATED.has(stateSlug) ? venue.stateClaims.unstated : venue.stateClaims.stated;
}

/**
 * The courts answer of the state-tier courts FAQ and of the service x case
 * type x state expert FAQ, as complete sentences with the state's appeal:
 * "<name> cases venued in <place> are heard in <courts>." then "Final
 * appeals run to the <court>." on the case-type x state page (`appeal`
 * "sentence"), or ", with final appeals to the <court>." on the pair x state
 * page ("clause"). A framing entry whose matter is not heard only in the
 * state's trial courts supplies its own answer, which carries the federal
 * forums' appeals and the state's (the tax and transfer pricing dispute); a
 * venue-framed entry names the place's federal district courts first, then
 * the Federal Circuit and the regional circuit, then the state's courts for
 * the claims under its law (intellectual property).
 */
export function caseTypeStateCourts(c: CaseType, input: CaseTypeCourtsInput, appeal: "sentence" | "clause"): string {
  const { place, courtList, supremeCourt, stateSlug, federalDistricts = [], circuit } = input;
  if (c.venueFraming) {
    const v = c.venueFraming;
    const slots: FramingSlots = {
      place,
      attr: place.replace(/^the /, ""),
      courts: courtList,
      supremeCourt,
      stateSlug,
      stateClaims: stateClaimsOf(v, stateSlug),
      federalCourts: federalCourtsPhrase(federalDistricts),
      circuit: circuit ? `the United States Court of Appeals for the ${circuitCourtName(circuit)} Circuit` : "the regional court of appeals",
    };
    return fillSlots(federalDistricts.length ? v.courtsSentence : v.courtsSentenceNoDistrict, slots);
  }
  if (c.framing?.courtsSentence) return fillSlots(c.framing.courtsSentence, { place, courts: courtList, supremeCourt, stateSlug });
  const heard = `${c.name} cases venued in ${place} are heard in ${courtList}`;
  return appeal === "clause" ? `${heard}, with final appeals to the ${supremeCourt}.` : `${heard}. Final appeals run to the ${supremeCourt}.`;
}

/**
 * Whether the entry's courts answer already names the place's federal
 * district courts (a venue-framed entry), so the templates leave out the
 * generic "Matters within federal jurisdiction proceed in ..." sentence they
 * add after every other entry's answer.
 */
export function caseTypeCourtsNameFederalCourts(c: CaseType): boolean {
  return Boolean(c.venueFraming);
}

/** H2 of the courts section on the state tier and the service x case type x state page. */
export function caseTypeVenuesHeading(c: CaseType, stateName: string): string {
  return `${stateName} ${forumsOf(c)?.noun ?? "courts"} and expert standards`;
}

/** The state-tier courts FAQ question. */
export function caseTypeStateCourtsQuestion(c: CaseType, stateName: string, place: string): string {
  const forums = forumsOf(c);
  return forums ? fillSlots(forums.courtsQuestion, { place }) : `Which ${stateName} courts hear ${c.name.toLowerCase()} cases?`;
}

/** The service x case type x state expert FAQ question (`work` is the pillar's work phrase). */
export function caseTypePairStateExpertQuestion(c: CaseType, attr: string, place: string, work: string): string {
  const forums = forumsOf(c);
  return forums
    ? fillSlots(forums.expertQuestion, { place, work })
    : `What do ${attr} courts ask of ${work} before it reaches the fact finder?`;
}

/** The place's federal courts, as a venue-framed entry's forum list reads them. */
export interface CaseTypeForumGeo {
  /** The place's federal district court names (state-courts.ts federalDistricts). */
  federalDistricts: string[];
  /** The place's circuit ("Third", "D.C."), undefined for American Samoa. */
  circuit?: string;
}

/**
 * The forums an entry lists ahead of the state's trial courts, in the
 * trial-court shape the venue lists render; none otherwise. A venue-framed
 * entry's list depends on the place's federal courts (`geo`): an item that
 * requires the district courts or the circuit is left out where the place
 * has none.
 */
export function caseTypeStateForums(c: CaseType, place: string, attr: string, geo?: CaseTypeForumGeo): { name: string; description: string }[] {
  const districts = geo?.federalDistricts ?? [];
  const circuit = geo?.circuit;
  const slots: FramingSlots = {
    place,
    attr,
    federalCourtsName: districts.length ? federalCourtsPhrase(districts).replace(/^the /, "") : "",
    circuitName: circuit ? circuitCourtName(circuit) : "",
  };
  return (forumsOf(c)?.list ?? [])
    .filter((f) => (f.requires === "districts" ? districts.length > 0 : f.requires === "circuit" ? Boolean(circuit) : true))
    .map((f) => ({ name: fillSlots(f.label, slots), description: fillSlots(f.description, slots) }));
}

/**
 * The References block of the case-type x state page: the first five hub
 * sources, or a venue-framed entry's own state list (the statutes and rules
 * behind the forum, framework, expert-standard, and exposure copy the state
 * page prints). Shared with scripts/prerender.mjs.
 */
export function caseTypeStateSources(c: CaseType): Source[] {
  return c.venueFraming?.stateSources ?? c.sources.slice(0, 5);
}

/**
 * The References block of the service x case type x state page: the pillar's
 * first five sources, followed, for a venue-framed case type, by the case
 * type's state list and its exposure sources (de-duplicated by URL), since
 * the page prints the case type's forum, framework, and exposure copy beside
 * the pillar's.
 */
export function caseTypePairStateSources(c: CaseType, serviceSources: readonly Source[]): Source[] {
  const own = serviceSources.slice(0, 5);
  if (!c.venueFraming) return own;
  const seen = new Set(own.map((x) => x.url));
  return [...own, ...[...c.venueFraming.stateSources, ...c.venueFraming.exposureSources].filter((x) => !seen.has(x.url))];
}

/** Anchor text of the service x case type page's link to the case-type hub: the hub's own three section headings where the entry carries a framing block. */
export function caseTypeHubLinkLabel(c: CaseType): string {
  if (!c.framing) return `${c.name}: the economic claim, where the damages concentrate, and how the analysis is built`;
  const lowerFirst = (t: string) => `${t.charAt(0).toLowerCase()}${t.slice(1)}`;
  const { components, concentration, method } = c.framing.sections;
  return `${c.name}: ${lowerFirst(components)}, ${lowerFirst(concentration)}, and ${lowerFirst(method)}`;
}

/** Section headings over lossComponents, damagesExposure, economicImpact, and the framework block. */
export function caseTypeSectionHeadings(c: CaseType): CaseTypeFraming["sections"] {
  return (
    c.framing?.sections ?? {
      components: "What the economic claim consists of",
      concentration: "Where the damages concentrate",
      method: "How the analysis is built",
      framework: "Damages framework",
    }
  );
}
