import type { Faq, Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";

export interface ComparisonRow {
  dimension: string;
  a: string;
  b: string;
}

export interface Comparison {
  slug: string;
  title: string;
  /** Shorter <title> form (target: under 60 chars with the brand suffix). The H1, cards, and nav keep `title`. */
  metaTitle?: string;
  /**
   * One sentence (at most 160 chars) that states the difference and the
   * verdict. It is the lead paragraph under the H1, the meta description, and
   * the Article description (the /compare hub cards are to adopt it too), so
   * one sentence drives them all.
   */
  answer: string;
  a: { label: string; summary: string; url?: string };
  b: { label: string; summary: string; url?: string };
  rows: ComparisonRow[];
  whenUseA: string;
  whenUseB: string;
  overlap: string;
  faqs: Faq[];
  sources: Source[];
  authorSlug: string;
  datePublished: string;
  dateModified: string;
  related?: RelatedItem[];
}

// Each entry keeps `slug` then `title` on consecutive lines (scripts/prerender.mjs
// extracts the pair positionally); `answer`, the byline fields, and the dates
// follow. Prose is citation-free; sources render through the registry. The two
// entries that compare the economist with the sister disciplines (vocational
// and life care planning) are the only copy on the site allowed to name those
// experts; the off-brand guard carves them out.
export const comparisons: Comparison[] = [
  {
    slug: "forensic-economist-vs-forensic-accountant",
    title: "Forensic Economist vs. Forensic Accountant",
    answer:
      "A forensic economist values losses to people and households; a forensic accountant works inside a company's records; the two meet on self-employed earnings.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Forensic Economist",
      summary:
        "An economist who measures losses to people and households: [[/services/lost-earnings-and-earning-capacity|lost earnings and benefits]], household services, support to survivors, and the present value of future costs, using the person's records and published labor market, demographic, and financial data.",
      url: "/services/lost-earnings-and-earning-capacity",
    },
    b: {
      label: "Forensic Accountant",
      summary:
        "An accountant who examines the books and records of a business: [[/services/fraud-and-asset-tracing|tracing funds]], reconstructing transactions, quantifying commercial losses, and valuing business interests, usually from a CPA background with fraud examination or valuation credentials.",
      url: "/services/fraud-and-asset-tracing",
    },
    rows: [
      { dimension: "Primary subject", a: "Individuals and households", b: "Businesses and their records" },
      { dimension: "Typical questions", a: "Lost earnings, earning capacity, death losses, present value of care", b: "Lost profits, fraud and tracing, valuation, marital business interests" },
      { dimension: "Core data", a: "Tax returns, pay records, BLS and Census data, Treasury yields", b: "General ledgers, bank records, financial statements, transaction data" },
      { dimension: "Professional standards", a: "NAFE and AAEFE ethics statements and the forensic economics literature", b: "AICPA, NACVA, and ACFE standards" },
      { dimension: "Where the two meet", a: "Self-employed earnings, death of a business owner", b: "Owner compensation, discounting of lost profits" },
    ],
    whenUseA:
      "Retain the economist when the loss belongs to a person or a household: an injured worker's earnings, a decedent's support to survivors, the value of household work, or the present value of a life care plan. The economist also discounts any future stream, including lost profits, once the stream has been established.",
    whenUseB:
      "Retain the forensic accountant when the question lives inside a company's records: whether money was diverted and where it went, what a business earned before and after an event, how owner compensation should be normalized, or what an interest in the business is worth under a stated standard of value.",
    overlap:
      "Both disciplines quantify financial loss from documents and both testify to it. They meet in the self-employed claimant, whose tax returns mix labor income with the return on the business, and in the death of an owner, where the survivors' loss depends on both the owner's earnings and the company's prospects. Under one roof the practice fields both, and the report identifies which discipline's method was applied to each component so the foundation for every figure is clear.",
    faqs: [
      {
        question: "Can the same expert serve as both?",
        answer:
          "Some practitioners hold training in both fields and can address both sets of questions. Whether one expert or two is better depends on the case: a matter with a personal loss and a business loss often benefits from an expert for each, with the reports reconciled so the same revenue is not counted twice.",
      },
      {
        question: "Which expert values a business in a divorce?",
        answer:
          "Business valuation is a valuation discipline governed by professional standards, and the valuator is usually credentialed in valuation regardless of whether the background is accounting or economics. The economist typically handles the income determination and support analysis in the same matter.",
      },
      {
        question: "Who discounts lost profits to present value?",
        answer:
          "Either expert can, and the method is the same. What matters is that the discount rate reflects the risk of the projected profits and that the person who built the projection and the person who discounted it used consistent assumptions.",
      },
    ],
    sources: refsToSources(["NAFE_ETHICS", "AICPA_SSVS1", "ACFE", "NACVA_STANDARDS"]),
    related: [
      { title: "Fraud Investigation and Asset Tracing", href: "/services/fraud-and-asset-tracing", description: "Tracing diverted funds and quantifying the loss." },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches", description: "Income, market, and asset approaches to value." },
      { title: "What Is a Forensic Economist?", href: "/guides/what-is-a-forensic-economist", description: "What the discipline covers and how the work is done." },
    ],
  },
  {
    slug: "forensic-economist-vs-vocational-expert",
    title: "Forensic Economist vs. Vocational Expert",
    answer:
      "The vocational expert opines on what work a person can do and what it pays; the economist converts the resulting earnings gap into a present value figure.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Forensic Economist",
      summary:
        "The expert who converts a loss into dollars over time: the but-for earnings, the post-event earnings, fringe benefits, household services, the worklife horizon, and the [[/methods/present-value-and-discounting|present value]] of the difference.",
      url: "/services/lost-earnings-and-earning-capacity",
    },
    b: {
      label: "Vocational Expert",
      summary:
        "An evaluator of employability and earning capacity: which occupations a person can perform after an injury, what those jobs pay in the local labor market, and how long it takes to reach them. The economist relies on this opinion when the record does not fix the post-injury earnings directly.",
      url: "/services/vocational-evaluation",
    },
    rows: [
      { dimension: "Core question", a: "How much is the loss worth, in present dollars", b: "What work the person can do and what it pays" },
      { dimension: "Inputs", a: "Earnings records, benefit records, published wage and time-use data, discount rates", b: "Medical restrictions, work history, skills, local job market data" },
      { dimension: "Output", a: "Present value damages report with schedules", b: "Employability and earning capacity opinion" },
      { dimension: "Typical retention", a: "Any matter with a lost earnings, household services, death, or business claim", b: "Injury, disability, and employment matters where post-injury work capacity is disputed" },
      { dimension: "Testimony", a: "Numbers, assumptions, and sensitivity", b: "Capacity, placeability, and wage findings" },
    ],
    whenUseA:
      "Retain the economist whenever a loss must be expressed as a dollar figure over time: lost earnings, benefits, household services, support to survivors, the present value of a care plan, or lost profits. The economist can proceed on the record alone when post-event earnings are documented or agreed.",
    whenUseB:
      "Retain the vocational expert when the post-injury capacity to work is contested and the record does not settle it: what jobs remain open, what they pay, and whether retraining is realistic. The opinion supplies the post-event side of the earnings comparison.",
    overlap:
      "Both experts address earning capacity, from different directions. The vocational opinion establishes what the person can earn; the economist converts the difference between that figure and the but-for earnings into a present value. In many injury matters both are retained and the reports reconcile: the economist adopts the vocational findings as inputs and states that reliance. Where only one is retained, the economist can present the loss under alternative post-event earnings assumptions drawn from the medical record, and the report says so. The [[/compare/lost-earnings-vs-lost-earning-capacity|lost earnings versus lost earning capacity]] comparison explains when the capacity question arises.",
    faqs: [
      {
        question: "Can the economist testify to what jobs the plaintiff can do?",
        answer:
          "No. That is a vocational question outside the economist's field. The economist presents the loss under the post-event earnings scenarios the record supports and identifies which expert or document supports each scenario.",
      },
      {
        question: "Do I always need both?",
        answer:
          "Not always. Where the person has returned to work at a documented wage, or the parties agree on post-event earnings, the economist can proceed without a separate vocational opinion. Where capacity is contested, the economist's post-event assumption needs a foundation, and that is usually the vocational expert.",
      },
      {
        question: "Which expert should be retained first?",
        answer:
          "Ideally both early, and the vocational opinion before the economist finalizes the report, since the post-event earnings figure flows from it. A short interval between the two reports keeps the assumptions consistent.",
      },
    ],
    sources: refsToSources(["BLS_OES", "BLS_CPS", "NAFE_ETHICS"]),
    related: [
      { title: "Lost Earnings and Earning Capacity Analysis", href: "/services/lost-earnings-and-earning-capacity", description: "The economist's affirmative earnings analysis." },
      { title: "Worklife Expectancy", href: "/methods/worklife-expectancy", description: "How the earnings horizon is set." },
      { title: "Vocational Assessment (sister practice)", href: "/services/vocational-evaluation", description: "Employability and capacity opinions from the vocational practice." },
    ],
  },
  {
    slug: "lost-earnings-vs-lost-earning-capacity",
    title: "Lost Earnings vs. Lost Earning Capacity",
    answer:
      "Lost earnings project a documented earnings history; lost earning capacity measures a reduced ability to earn when the history understates what was possible.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Lost Earnings",
      summary:
        "The wages and benefits actually not received because of the event, measured from the person's own earnings history: pay records, tax returns, and employer statements, from the event to the return to work or to the end of the projection.",
      url: "/services/lost-earnings-and-earning-capacity",
    },
    b: {
      label: "Lost Earning Capacity",
      summary:
        "The reduction in the ability to earn, whether or not that ability was fully used before the event. It applies when the pre-event history understates what the person could have earned, or when the injury forecloses work the person had not yet begun.",
      url: "/services/lost-earnings-and-earning-capacity",
    },
    rows: [
      { dimension: "Measure", a: "Actual earnings history projected forward", b: "Capacity to earn, from education, training, and market data" },
      { dimension: "Best evidence", a: "Tax returns, W-2 forms, pay stubs", b: "Occupational wage data, education, documented career path, vocational findings" },
      { dimension: "Typical claimant", a: "Established worker with a stable history", b: "Student, homemaker, underemployed worker, business owner, worker between jobs" },
      { dimension: "Contested point", a: "Growth rate, horizon, post-event earnings", b: "Whether the capacity was real and would have been used" },
      { dimension: "Other experts", a: "Often only the medical evidence", b: "Vocational and medical opinions on capacity" },
    ],
    whenUseA:
      "Lost earnings is the baseline measure whenever the person had a stable job and a documented history. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] starts from the records, carries them forward with wage growth over the [[/methods/worklife-expectancy|worklife]], adds benefits, and nets post-event earnings.",
    whenUseB:
      "Lost earning capacity is the measure when the history does not describe the loss: a student whose career had not started, a parent who had left the labor force and intended to return, a worker who was between jobs or underemployed, or a person whose injury forecloses a documented path to higher-paying work. The projection is built from education, training, and occupational earnings data rather than from pay stubs alone.",
    overlap:
      "Both measures produce a but-for earnings stream and a post-event earnings stream and take the difference. The distinction is in the foundation for the but-for stream. In practice many reports blend the two: the history sets the starting point and capacity evidence supports growth beyond it, such as a promotion the person had already been offered. The report states which measure was applied to each period and why, so the trier of fact can see where the history ends and the capacity opinion begins.",
    faqs: [
      {
        question: "Does a person who was unemployed at the time of injury have a claim?",
        answer:
          "Often, yes, as lost earning capacity. The analysis asks what the person could have earned given education, skills, and the local labor market, and whether the record shows an intent and ability to work. The history of employment before the gap is relevant evidence.",
      },
      {
        question: "Do courts recognize earning capacity as a separate measure?",
        answer:
          "Most jurisdictions recognize the loss of the ability to earn as compensable, with the foundation and terminology varying by state. Counsel confirms the governing framework, and the economist presents the figures in the form that framework uses.",
      },
      {
        question: "How does the economist avoid speculation in a capacity claim?",
        answer:
          "By tying each assumption to evidence: the degree program the person was enrolled in, the occupation the training leads to, the published earnings for that occupation and education level in the area, and the vocational and medical opinions on post-event capacity. Where the record leaves the path open, the report shows the result under each alternative.",
      },
    ],
    sources: refsToSources(["BLS_OES", "CENSUS_ACS", "SKOOG_CIECKA_KRUEGER_2011"]),
    related: [
      { title: "How Lost Earnings Are Calculated", href: "/guides/how-lost-earnings-are-calculated", description: "The full calculation, input by input." },
      { title: "Wage Growth and Earnings Projection", href: "/methods/wage-growth-and-earnings-projection", description: "Building the but-for and post-event streams." },
      { title: "Economist and Vocational Witness Roles", href: "/compare/forensic-economist-vs-vocational-expert", description: "Who supplies the capacity opinion and who values it." },
    ],
  },
  {
    slug: "lost-profits-vs-business-valuation",
    title: "Lost Profits vs. Business Valuation",
    answer:
      "Lost profits apply when the business survives and recovers over a loss period; business valuation applies when it is destroyed or the interest is taken.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Lost Profits",
      summary:
        "The profits a continuing business would have earned but for the wrongful act, measured over a defined loss period, net of avoided costs and mitigation, and [[/methods/lost-profits-but-for-analysis|discounted to present value]].",
      url: "/services/lost-profits-and-commercial-damages",
    },
    b: {
      label: "Business Valuation",
      summary:
        "The value of the business interest as a whole at a valuation date, applied when the business was destroyed or the interest was taken, measured under a stated standard of value using the [[/methods/business-valuation-approaches|income, market, and asset approaches]].",
      url: "/services/business-valuation",
    },
    rows: [
      { dimension: "When it applies", a: "The business survives and recovers", b: "The business is destroyed or the interest is taken" },
      { dimension: "Time frame", a: "A loss period from the act to recovery", b: "A single valuation date" },
      { dimension: "What is measured", a: "The difference in profits over the period", b: "The value of all expected future cash flows" },
      { dimension: "Risk treatment", a: "Discount rate applied to projected profits", b: "Discount or capitalization rate within the income approach" },
      { dimension: "Governing standard", a: "Reasonable certainty of the fact of loss", b: "The standard of value the framework specifies" },
    ],
    whenUseA:
      "Use lost profits when the business continued to operate and the harm was an interruption: a breached supply contract, a lost customer, a period of closure, or a diverted opportunity. The loss period ends when the business recovered or would have recovered, and the measure is profits, not revenue.",
    whenUseB:
      "Use business valuation when the harm ended the business or removed the owner's interest: a company forced to close, a partner squeezed out, a franchise terminated, or a marital interest to be divided. The measure is what the interest was worth on the valuation date under the standard of value the governing framework requires.",
    overlap:
      "Both measures rest on projected cash flows and both discount them for time and risk. The danger is double recovery: a business valued as of the date of destruction already incorporates the profits it would have earned afterward, so claiming both lost profits after that date and the lost value of the business counts the same cash flows twice. Where a business was harmed for a period and then destroyed, the analysis presents lost profits through the date of destruction and the value of the business as of that date, with the boundary stated. The [[/guides/lost-profits-vs-lost-business-value|lost profits versus lost business value]] guide works through the choice.",
    faqs: [
      {
        question: "Can a plaintiff claim both lost profits and lost business value?",
        answer:
          "Only for different periods. Lost profits can run from the wrongful act to the date the business was destroyed, and the business can be valued as of that date, but lost profits after the valuation date are already inside the value and cannot be added again.",
      },
      {
        question: "Which is larger?",
        answer:
          "Neither is inherently larger. A short interruption of a valuable business produces small lost profits and no change in value; the destruction of a marginal business produces a small value and, had it survived, small profits. The facts, not the label, drive the number.",
      },
      {
        question: "Does the discount rate differ between the two?",
        answer:
          "Both use a rate that reflects the risk of the cash flows. In a valuation the rate is built up from the company's risk profile within the income approach; in a lost profits analysis the rate reflects the risk of the specific projected profits, which can be lower where the profits were contractually assured.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD"]),
    related: [
      { title: "Lost Profits and But-For Analysis", href: "/methods/lost-profits-but-for-analysis", description: "Building the but-for scenario and the loss period." },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches", description: "Income, market, and asset approaches to value." },
      { title: "Business Valuation in Litigation", href: "/guides/business-valuation-in-litigation", description: "Standards of value, valuation dates, and discounts." },
    ],
  },
  {
    slug: "plaintiff-economist-vs-defense-economist",
    title: "Plaintiff Economist vs. Defense Economist: Is the Method Different?",
    metaTitle: "Plaintiff Economist vs. Defense Economist",
    answer:
      "The method is the same on both sides, with the same published data and discounting arithmetic; the two economists differ on which facts control each input.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Plaintiff Economist",
      summary:
        "An economist retained by the injured person, the survivors, or the business claiming the loss, usually to prepare the affirmative [[/services/personal-injury-economic-damages|damages report]] that states the loss and its foundation.",
      url: "/services/personal-injury-economic-damages",
    },
    b: {
      label: "Defense Economist",
      summary:
        "An economist retained by the defendant or the carrier, usually to [[/services/expert-rebuttal-and-report-review|review the affirmative report]], test its inputs against the record, and often to present an alternative calculation.",
      url: "/services/expert-rebuttal-and-report-review",
    },
    rows: [
      { dimension: "Method", a: "The same accepted methods", b: "The same accepted methods" },
      { dimension: "Data sources", a: "Case records and published government data", b: "The same, tested against the record" },
      { dimension: "Typical assignment", a: "Affirmative report", b: "Rebuttal review and, often, an alternative calculation" },
      { dimension: "Common disagreements", a: "Earnings base, growth rate, worklife, post-event earnings, consumption, discount rate", b: "The same inputs, argued from the other side of the record" },
      { dimension: "Ethical obligation", a: "Objective analysis regardless of retaining party", b: "The same" },
    ],
    whenUseA:
      "Retain an economist to prepare the affirmative report when representing the person, the survivors, or the business claiming the loss. The report should state each input, its source, and the sensitivity of the result, because a defense economist will test every one of them.",
    whenUseB:
      "Retain an economist to review the affirmative report when representing the defendant or the carrier. A useful rebuttal does more than list objections: it identifies which inputs the record supports, recalculates the loss under supportable alternatives, and gives the trier of fact a second number with its own foundation.",
    overlap:
      "The method does not change with the retaining party, and a report that changes it has a credibility problem before the first question on cross-examination. Both economists use the same published wage, benefit, time-use, expenditure, and yield data and the same discounting arithmetic; they differ on which facts in the record control each input. KW Economics accepts engagements from both plaintiff and defense and applies the same method to each, which is what allows an economist to be believed when the analysis favors the retaining party and when it does not.",
    faqs: [
      {
        question: "Should I avoid an economist who usually works for the other side?",
        answer:
          "Not categorically. An economist with a balanced record is often more credible under cross-examination, and the deposition and trial history is disclosed in most jurisdictions anyway. What matters is whether the method holds constant across engagements.",
      },
      {
        question: "Do the two economists always disagree?",
        answer:
          "Rarely on everything. Opposing economists usually agree on the framework and on most inputs and disagree on a few: the earnings base, the growth rate, the post-event earnings, the consumption percentage in a death claim, or the discount rate. Narrowing the dispute to those inputs is what a good rebuttal does.",
      },
      {
        question: "Will the defense economist produce a number of their own?",
        answer:
          "In most engagements, yes. The reviewing economist reruns the schedules with the inputs the record supports, so the trier of fact can compare two calculations built on the same framework and see exactly which inputs account for the gap between them.",
      },
    ],
    sources: refsToSources(["NAFE_ETHICS", "FRE_702", "FRCP_26"]),
    related: [
      { title: "Expert Rebuttal and Report Review", href: "/services/expert-rebuttal-and-report-review", description: "Testing an opposing economic report against the record." },
      { title: "How to Rebut an Economic Damages Report", href: "/guides/how-to-rebut-an-economic-damages-report", description: "Where damages reports fail and how to show it." },
      { title: "Expert Witness Testimony Guide", href: "/knowledge/expert-witness-testimony-guide", description: "Admissibility, deposition, and trial for economic testimony." },
    ],
  },
  {
    slug: "fair-market-value-vs-fair-value",
    title: "Fair Market Value vs. Fair Value",
    answer:
      "Fair market value prices a hypothetical sale and usually applies minority discounts; fair value is a statutory shareholder standard that often excludes them.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Fair Market Value",
      summary:
        "The price at which the interest would change hands between a willing buyer and a willing seller, neither under compulsion and both with reasonable knowledge of the relevant facts. It is the standard in tax matters, in many divorce and buy-sell contexts, and it ordinarily considers discounts for lack of control and lack of marketability.",
      url: "/services/business-valuation",
    },
    b: {
      label: "Fair Value",
      summary:
        "A standard defined by statute or case law for a specific purpose, most often dissenting and oppressed shareholder matters, that frequently excludes some or all of the discounts fair market value would apply. Its meaning depends on the jurisdiction and the context, and it is not the same as the financial reporting definition of the term.",
      url: "/services/business-valuation",
    },
    rows: [
      { dimension: "Where defined", a: "Tax authority definitions and professional valuation standards", b: "State statutes and case law; separately, financial reporting standards" },
      { dimension: "Hypothetical parties", a: "A willing buyer and a willing seller", b: "Often the actual parties and the actual transaction" },
      { dimension: "Discounts", a: "Lack of control and lack of marketability usually considered", b: "Often excluded, depending on the jurisdiction" },
      { dimension: "Typical use", a: "Tax, divorce in many states, buy-sell agreements", b: "Dissenting and oppressed shareholder matters" },
      { dimension: "Effect on a minority interest", a: "Usually lower", b: "Usually higher" },
    ],
    whenUseA:
      "Fair market value applies where the governing framework, the agreement, or the tax context calls for it: estate and gift matters, most buy-sell agreements that name it, and divorce in the states that adopt it. The [[/methods/business-valuation-approaches|valuation]] considers what a hypothetical buyer would pay for the interest as it exists, including the disadvantages of holding a minority stake in a closely held company.",
    whenUseB:
      "Fair value applies where a statute or a court defines it for the matter at hand, most commonly when a shareholder dissents from a merger or claims oppression and the company or the majority must buy the shares. Many jurisdictions read the standard to exclude discounts for lack of control and marketability so the departing owner receives a proportionate share of the whole.",
    overlap:
      "The two standards share the same approaches to value and often the same enterprise-level conclusion; they diverge in how the interest is treated after the enterprise is valued. The choice of standard is a legal question, and the valuator applies the one counsel identifies, states it in the report, and where the standard is unsettled presents the result under each. Applying the wrong standard is one of the most common reasons a valuation is rejected, so the [[/guides/business-valuation-in-litigation|business valuation in litigation]] guide treats the standard of value as the first decision of the engagement.",
    faqs: [
      {
        question: "Is fair value the same as the accounting term?",
        answer:
          "No. Financial reporting standards define fair value for measuring assets and liabilities on financial statements. The litigation standard is defined by the state's statute and case law for shareholder matters, and the two definitions can differ in important ways.",
      },
      {
        question: "Why do discounts matter so much?",
        answer:
          "A discount for lack of control or lack of marketability can reduce the value of a minority interest substantially below its proportionate share of the enterprise. Whether the standard allows the discount can therefore change the number more than any other single decision in the valuation.",
      },
      {
        question: "Which standard applies in divorce?",
        answer:
          "It varies by state. Some states use fair market value, some apply a fair value concept that limits discounts, and some have developed their own approach through case law. Counsel identifies the standard and the valuator applies it.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS"]),
    related: [
      { title: "Business Valuation", href: "/services/business-valuation", description: "Valuation of closely held interests for litigation." },
      { title: "Business Valuation in Litigation", href: "/guides/business-valuation-in-litigation", description: "Standards of value, valuation dates, and discounts." },
      { title: "Income Determination in Divorce", href: "/guides/income-determination-in-divorce", description: "Owner income, perquisites, and support analysis." },
    ],
  },
  {
    slug: "net-vs-gross-discount-rate",
    title: "Net vs. Gross Discount Rate",
    answer:
      "A net rate, discount less growth, applies to constant dollars; a gross rate discounts a nominally grown stream; consistent inputs give the same present value.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Net Discount Rate",
      summary:
        "A single rate that combines growth and discounting: the difference between the rate at which the loss stream grows and the rate at which future amounts are discounted. It is applied to a loss stated in today's dollars and is the usual presentation where both rates are drawn from the same period.",
      url: "/methods/present-value-and-discounting",
    },
    b: {
      label: "Gross Discount Rate",
      summary:
        "The full nominal discount rate applied to a loss stream that has already been grown into future nominal dollars. It shows growth and discounting as two visible steps and is the presentation many readers expect when the growth rate differs by loss category.",
      url: "/methods/present-value-and-discounting",
    },
    rows: [
      { dimension: "Loss stream", a: "Stated in constant, present-day dollars", b: "Projected in future nominal dollars" },
      { dimension: "Rates shown", a: "One number; the growth assumption is implicit", b: "Two numbers; growth and discount both visible" },
      { dimension: "Consistency risk", a: "Low when both rates share a period and a basis", b: "Higher if growth and discount come from different periods" },
      { dimension: "Multiple loss categories", a: "One net rate per category", b: "One growth rate per category, one discount rate overall" },
      { dimension: "Total offset", a: "A net rate of zero: growth and discount cancel", b: "Not a separate case; total offset is a net-rate convention" },
    ],
    whenUseA:
      "A net rate suits a projection with one loss category and rates drawn from the same historical window, and it is the natural form where a venue directs a total-offset approach, under which the net rate is zero and the present value equals the undiscounted sum of the losses in today's dollars. The report should still show the two components so the reader can see what the net rate contains.",
    whenUseB:
      "A gross presentation suits a report with several loss categories growing at different rates, such as wages, household replacement costs, and medical costs, because each category can be grown on its own series and the whole stream discounted at one rate. It also makes the [[/methods/wage-growth-and-earnings-projection|growth assumption]] visible, which is where most cross-examination on discounting begins.",
    overlap:
      "The two presentations are arithmetically equivalent when the assumptions are consistent: growing a stream at one rate and discounting it at another produces the same present value as applying the net of the two rates to the constant-dollar stream. The choice is about transparency and venue convention, not about the size of the number. The [[/methods/present-value-and-discounting|present value method]] page explains the mechanics; some jurisdictions fix the approach by case law, and the report follows the venue's rule and says so.",
    faqs: [
      {
        question: "What is the total offset method?",
        answer:
          "A convention under which the growth rate and the discount rate are assumed to cancel, so future losses are neither grown nor discounted and the present value equals the sum of the losses stated in today's dollars. Some states direct it by case law; elsewhere it is one assumption among several and must be justified.",
      },
      {
        question: "Which produces the larger present value?",
        answer:
          "Neither, if the assumptions are consistent. A net rate of two percent and a gross presentation with five percent growth and seven percent discount give the same result. Differences appear only when the two components are drawn from different periods or bases, which is a consistency problem rather than a presentation choice.",
      },
      {
        question: "Does the economist have to use Treasury yields?",
        answer:
          "Yields on low-risk instruments are the mainstream basis because the award is meant to be invested safely, not speculatively. The report states the instruments, the maturities, and the period used, and shows the sensitivity of the result to reasonable alternatives.",
      },
    ],
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "KACZKOWSKI_V_BOLUBASZ", "TREASURY_YIELD", "BLS_ECI"]),
    related: [
      { title: "Present Value and Discounting", href: "/methods/present-value-and-discounting", description: "How future losses are reduced to a single sum." },
      { title: "Present Value Explained for Attorneys", href: "/guides/present-value-explained-for-attorneys", description: "The concepts behind the discount rate, in plain terms." },
      { title: "Wage Growth and Earnings Projection", href: "/methods/wage-growth-and-earnings-projection", description: "Where the growth side of the net rate comes from." },
    ],
  },
  {
    slug: "economist-vs-life-care-planner",
    title: "Forensic Economist vs. Life Care Planner",
    answer:
      "The life care planner identifies and prices future care needs item by item; the economist applies growth and discount rates to that plan to reach present value.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    a: {
      label: "Forensic Economist",
      summary:
        "The expert who reduces a life care plan's year-by-year costs to [[/methods/present-value-and-discounting|present value]], applies growth rates by care category, and reconciles the valuation to the plan item by item.",
      url: "/services/life-care-plan-cost-projection",
    },
    b: {
      label: "Life Care Planner",
      summary:
        "The clinician who identifies the future medical and support needs that flow from an injury and prices each item with its frequency and duration, producing the life care plan that the economist values.",
      url: "/services/life-care-planning",
    },
    rows: [
      { dimension: "Core question", a: "What the plan costs in present dollars", b: "What care the person needs and what each item costs today" },
      { dimension: "Foundation", a: "The plan's cost tables, growth data, discount rates, life expectancy", b: "Medical records, provider recommendations, cost research" },
      { dimension: "Output", a: "Present value schedule reconciled to the plan", b: "Itemized life care plan" },
      { dimension: "Contested inputs", a: "Growth rates, discount rate, horizon", b: "Medical foundation, frequency, duration, unit cost" },
      { dimension: "Credential family", a: "Graduate economics or finance training, professional association membership", b: "Clinical license plus a planning certification" },
    ],
    whenUseA:
      "Retain the economist once a plan exists, or is expected, and the future care cost must be presented as a single figure alongside the other economic losses. The economist also reviews an opposing valuation of a plan and reprices it under supportable growth and discount assumptions.",
    whenUseB:
      "Retain the life care planner when the case involves lifelong or long-term care needs that no treating provider has organized into a costed plan. The plan is the foundation; without it the economist has no item-level cost stream to value.",
    overlap:
      "Both experts work on the same future-care number, and the two reports must reconcile. The plan supplies the items, frequencies, durations, unit costs, and the life expectancy basis; the economist supplies the growth rates by category, the discount rate, and the arithmetic that turns the schedule into a present value. Neither substitutes for the other: the economist does not add or remove care items, and the plan's author does not discount. The [[/services/life-care-plan-cost-projection|life care plan cost projection]] service describes the hand-off.",
    faqs: [
      {
        question: "Can the economist prepare the life care plan?",
        answer:
          "No. The plan is a clinical document that rests on medical foundation and cost research, prepared by a credentialed planner. The economist values the plan and states in the report that the items and costs were taken from it.",
      },
      {
        question: "Can one report cover both?",
        answer:
          "The economist's report can attach or summarize the plan and then value it, but the plan's authorship stays with its author, who is disclosed and available for testimony on the items. Courts and opposing counsel expect each expert to testify to their own work.",
      },
      {
        question: "What if the plan and the valuation use different life expectancies?",
        answer:
          "They should not. The economist adopts the plan's horizon and states it, or presents the valuation under each horizon in dispute. A mismatch between the two reports is a common cross-examination theme and is avoidable.",
      },
    ],
    sources: refsToSources(["BLS_CPI_MEDICAL", "NCHS_LIFE_TABLES", "TREASURY_YIELD"]),
    related: [
      { title: "Life Care Plan Cost Projection and Present Value", href: "/services/life-care-plan-cost-projection", description: "Valuing a plan's cost stream to present value." },
      { title: "Present Value and Discounting", href: "/methods/present-value-and-discounting", description: "How future costs are reduced to a single sum." },
      { title: "Life Care Plans (sister practice)", href: "/services/life-care-planning", description: "Plan authorship from the life care planning practice." },
    ],
  },
  {
    slug: "back-pay-vs-front-pay",
    title: "Back Pay vs. Front Pay in Employment Cases",
    answer:
      "Back pay measures earnings lost from the adverse action to the judgment; front pay measures the loss after judgment where reinstatement is not ordered.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-07",
    dateModified: "2026-09-07",
    a: {
      label: "Back Pay",
      summary:
        "The wages and benefits the employee would have received from the termination, demotion, or failure to hire up to the date of judgment, less what the employee actually earned in the interim. It is a historical figure built from pay records on both sides, and the [[/services/employment-and-wage-loss-damages|employment damages]] analysis tabulates it year by year in the dollars of each year.",
      url: "/services/employment-and-wage-loss-damages",
    },
    b: {
      label: "Front Pay",
      summary:
        "The wages and benefits the employee will lose after judgment because reinstatement is not ordered or is not practical: the projected gap between the position lost and the position the employee holds or can be expected to hold, over a stated period, reduced to [[/methods/present-value-and-discounting|present value]].",
      url: "/services/employment-and-wage-loss-damages",
    },
    rows: [
      { dimension: "Period measured", a: "From the adverse action to the judgment", b: "From the judgment forward, over a period the court or the record supports" },
      { dimension: "Records that drive it", a: "Pay and benefit records from the former employer and every interim employer", b: "The same records, plus the evidence on how long the gap would persist" },
      { dimension: "Interim earnings", a: "Deducted year by year from what was lost", b: "Projected and deducted over the front pay period" },
      { dimension: "Present value", a: "Not discounted; past sums are stated as of the years they were lost, with interest where the framework allows", b: "Discounted to the judgment date at a rate tied to low-risk yields" },
      { dimension: "Relationship to reinstatement", a: "Available whether or not reinstatement is ordered", b: "An alternative to reinstatement, ordered where reinstatement is not feasible" },
      { dimension: "Who decides", a: "Usually the trier of fact, on the economist's schedules", b: "Often the court, as an equitable remedy, with the economist supplying the calculation" },
    ],
    whenUseA:
      "Every employment damages claim carries a back pay figure, because the loss from the adverse action to trial is a matter of record: what the position paid, what the employee earned instead, and the benefits on each side. The economist builds it from pay stubs, tax returns, and benefit statements, applies the raises and promotions the record supports, and separates it from any future loss so the trier of fact can award each on its own footing. The [[/methods/mitigation-and-offsets|mitigation and offsets]] page describes how interim earnings are handled.",
    whenUseB:
      "Front pay enters when the employee will not be returning to the position. The economist projects the earnings and benefits of the position lost and of the position the employee has or can be expected to obtain, over a period the record supports, and discounts the difference. The period is the contested input: the evidence on how long it would take to reach comparable pay, the employee's age and the [[/methods/worklife-expectancy|worklife horizon]], and the framework's view of how far a front pay award may run all bear on it, and the report presents the figure under more than one period where the period is disputed.",
    overlap:
      "Both measures compare the same two streams, the compensation of the position lost and the compensation the employee earned or can earn instead, and both rest on the same records. The dividing line is the judgment date: back pay looks backward from it and front pay forward. A report that presents the two on one schedule, with the past portion in the dollars of each year and the future portion discounted, lets counsel argue reinstatement, front pay, or neither without rebuilding the numbers, and the [[/compare/lost-earnings-vs-lost-earning-capacity|lost earnings versus earning capacity]] comparison explains how the same distinction runs in an injury claim.",
    faqs: [
      {
        question: "Is front pay a substitute for reinstatement?",
        answer:
          "In most frameworks it is the remedy ordered when reinstatement is not feasible, for example where the position no longer exists or the working relationship has broken down. The economist calculates the figure; whether front pay or reinstatement is ordered is a question for the court.",
      },
      {
        question: "Does the interim earnings offset apply to front pay as well as back pay?",
        answer:
          "Yes, but as a projection rather than a record. For back pay the offset is the interim earnings actually received, taken from pay records. For front pay the offset is the earnings the employee is expected to receive over the period, projected from the current position or from the evidence on the positions available.",
      },
      {
        question: "Who decides how long the front pay period runs?",
        answer:
          "The length of the period is usually for the court, drawing on the evidence about how long the loss would persist. The economist's role is to show what the figure is under each period the parties advance, and to state the horizon beyond which the projection has no support in the record.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECI"]),
    related: [
      { title: "Employment and Wage Loss Damages", href: "/services/employment-and-wage-loss-damages", description: "Back pay, front pay, and benefits in employment claims." },
      { title: "Mitigation and Offsets", href: "/methods/mitigation-and-offsets", description: "How interim earnings and other offsets are applied." },
      { title: "Lost Earnings vs. Lost Earning Capacity", href: "/compare/lost-earnings-vs-lost-earning-capacity", description: "The parallel distinction in an injury claim." },
    ],
  },
  {
    slug: "lost-earnings-vs-earning-capacity-in-workers-compensation",
    title: "Lost Earnings vs. Earning Capacity in Workers' Compensation",
    metaTitle: "Lost Earnings vs. Capacity in Workers' Comp",
    answer:
      "In a work injury, lost earnings are the wages not actually received; lost earning capacity is the reduced ability to earn that a compensation benefit replaces.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-14",
    dateModified: "2026-09-14",
    a: {
      label: "Lost Earnings",
      summary:
        "The wages and benefits the injured worker did not receive because of the work injury, measured from the pre-injury pay records against what the worker earned afterward, week by week for the past and year by year for the future. It is the measure a third-party action arising from the same injury uses, and the [[/services/lost-earnings-and-earning-capacity|lost earnings analysis]] builds it from the employer's records, the carrier's payment history, and the post-injury earnings.",
      url: "/services/lost-earnings-and-earning-capacity",
    },
    b: {
      label: "Lost Earning Capacity",
      summary:
        "The reduction in what the worker is able to earn, given the physical restrictions in the medical record, whether or not the worker is currently earning less. It is the measure the compensation system uses in the jurisdictions that pay a benefit for reduced capacity, expressed as a percentage or a weekly dollar figure, and the economist compares the pre-injury wage with the wage the restrictions leave available in the local labor market.",
      url: "/services/lost-earnings-and-earning-capacity",
    },
    rows: [
      { dimension: "What it measures", a: "Wages and benefits actually not received", b: "The reduced ability to earn, whether or not it has yet produced a lower wage" },
      { dimension: "Who uses it", a: "The civil claim against a third party, and the indemnity computation where benefits are tied to actual wage loss", b: "The compensation forum, in jurisdictions that measure the benefit by the loss of capacity" },
      { dimension: "Records that drive it", a: "Pre-injury pay records, the carrier's payment history, and post-injury pay stubs and tax returns", b: "The pre-injury wage, the work restrictions in the medical record, and the wages of the work those restrictions leave available" },
      { dimension: "Form of the result", a: "A dollar schedule, past and future, with the future reduced to present value", b: "A percentage or a weekly figure in the form the compensation system requires" },
      { dimension: "Effect of a return to work", a: "Post-injury earnings are deducted year by year", b: "A return to lighter work is evidence of the remaining capacity, not the end of the reduction" },
      { dimension: "Present value", a: "Applied to the future portion at a rate tied to low-risk yields", b: "Applied only where the system values a future indemnity stream, for example in a settlement" },
    ],
    whenUseA:
      "Lost earnings is the measure whenever the question is what the worker actually lost: the third-party action against a manufacturer, a property owner, or a driver arising from the same injury, and the settlement valuation where the indemnity stream is tied to actual wage loss. The economist assembles the pre-injury wage base, subtracts what the worker earned after the injury, projects the gap over the worklife horizon with a stated growth rate, and identifies the indemnity benefits already paid so lien and offset questions can be answered from the same numbers. The [[/methods/mitigation-and-offsets|mitigation and offsets]] page describes how the post-injury earnings and the benefits are handled.",
    whenUseB:
      "Lost earning capacity is the measure where the compensation system pays for the reduction in the worker's ability to earn, which several jurisdictions do for a permanent partial disability. The economist takes the pre-injury wage from the employer's records, reads the restrictions from the medical record, identifies the wage the work within those restrictions pays in the local labor market from published occupational wage data, and expresses the difference in the form the system requires. The figure does not depend on whether the worker has found the lighter work yet, and the [[/case-types/workers-compensation|workers' compensation case type]] page sets the measure inside the wider claim.",
    overlap:
      "Both measures start from the same pre-injury wage base and the same restrictions, and in a worker who has returned to the best work the restrictions allow they converge, because the actual post-injury wage is then the capacity wage. They diverge when the worker is earning less than the restrictions would allow, or more, and when the forum asks a different question: the compensation system wants the reduction in capacity in its own form, and the civil court wants the dollars lost. A report that presents the pre-injury wage, the capacity wage, and the actual post-injury earnings on one schedule lets counsel answer either question from the same facts, and the [[/compare/lost-earnings-vs-lost-earning-capacity|lost earnings versus lost earning capacity]] comparison explains how the same distinction runs outside the compensation system.",
    faqs: [
      {
        question: "Which measure applies to the third-party action arising from a work injury?",
        answer:
          "Lost earnings, in the ordinary civil form: the difference between the but-for earnings and the actual post-injury earnings, past and future, with the future reduced to present value. The compensation benefits already paid are identified separately so counsel can address the lien and any offset under the governing framework.",
      },
      {
        question: "Can the two measures give different numbers from the same wage records?",
        answer:
          "Yes, and the gap is informative. A worker earning less than the restrictions allow shows a lost earnings figure larger than the capacity reduction; a worker who has out-earned the capacity wage shows the reverse. The report presents both so the forum can see which question it is answering.",
      },
      {
        question: "Does a return to lighter work end the earning capacity claim?",
        answer:
          "No. The return is evidence of what the worker can do, and the wage of the lighter work is compared with the pre-injury wage to measure the reduction that remains. The capacity claim ends only where the worker can again earn what the pre-injury job paid within the restrictions the medical record sets.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES"]),
    related: [
      { title: "Lost Earnings and Earning Capacity Analysis", href: "/services/lost-earnings-and-earning-capacity", description: "The analysis both measures come from." },
      { title: "Workers' Compensation", href: "/case-types/workers-compensation", description: "Where each measure sits inside the claim." },
      { title: "Mitigation and Offsets", href: "/methods/mitigation-and-offsets", description: "How post-injury earnings and paid benefits are handled." },
    ],
  },
  {
    slug: "lost-profits-vs-diminished-business-value",
    title: "Lost Profits vs. Diminished Business Value",
    answer:
      "Lost profits measure a shortfall that ends with recovery; diminished business value measures a lasting reduction in what a surviving business is worth.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-21",
    dateModified: "2026-09-21",
    a: {
      label: "Lost Profits",
      summary:
        "The profits a continuing business did not earn over a loss period that begins with the wrongful act and ends when the business recovered or would have recovered, measured through a [[/methods/lost-profits-but-for-analysis|but-for projection]] net of the costs the business avoided and the profits it recovered by mitigating, with any future portion reduced to present value.",
      url: "/services/lost-profits-and-commercial-damages",
    },
    b: {
      label: "Diminished Business Value",
      summary:
        "The difference between what the business was worth immediately before the wrongful act and what it was worth after it, where the business continues to operate but has been left permanently smaller, riskier, or less profitable. It is measured by two [[/methods/business-valuation-approaches|valuations]] on the same standard of value, one on each side of the harm.",
      url: "/services/business-valuation",
    },
    rows: [
      { dimension: "Nature of the harm", a: "An interruption the business recovers from", b: "A permanent impairment of a business that survives" },
      { dimension: "Time frame", a: "A loss period with a beginning and an end", b: "A single measurement date, the value before against the value after" },
      { dimension: "What is measured", a: "Profits not earned during the period, net of avoided costs", b: "The change in the capitalized value of all future cash flows" },
      { dimension: "How it is built", a: "A but-for projection compared with actual results, year by year", b: "Two valuations under the income and market approaches, differing only in the effect of the act" },
      { dimension: "Risk and discounting", a: "The specific projected profits at a rate reflecting their own risk", b: "Inside the capitalization or discount rate of each valuation" },
      { dimension: "Where the two meet", a: "Runs to the date the permanent impairment is measured", b: "Absorbs every profit after the measurement date" },
    ],
    whenUseA:
      "Lost profits is the measure when the business was set back and then came back: a supplier's breach that stopped production for a season, a competitor's misconduct that diverted customers until the business won them back, a period of closure after a casualty. The economist establishes the revenue the business would have earned from its own history and the market, deducts the costs it did not incur, nets the profits it earned by mitigating, and closes the period when the record shows the business had recovered. The [[/services/lost-profits-and-commercial-damages|lost profits and commercial damages]] service page describes the analysis, and a [[/case-types/commercial-contract-dispute|contract dispute]] is its most common setting.",
    whenUseB:
      "Diminished value is the measure when the business kept operating but will never be what it was: a franchise whose territory was cut, a company whose key contract, license, or reputation was permanently lost, a firm whose customer base was taken by a departing owner and will not return. The economist values the business as it stood the day before the act and again as it stands with the impairment, on the same standard of value and the same valuation date, and the difference is the loss. The [[/guides/business-valuation-in-litigation|business valuation in litigation]] guide covers the standards the two valuations follow.",
    overlap:
      "Both measures rest on projected cash flows, and both ask what the business would have earned but for the act, so the same records, the same history, and the same market analysis feed each. The boundary is time: lost profits run from the act to the date the impairment is measured, and the diminished value as of that date already contains every profit the business will now fail to earn afterward, so a claim that carries lost profits past the measurement date counts those profits twice. The [[/compare/lost-profits-vs-business-valuation|lost profits versus business valuation]] comparison draws the same line where the business was destroyed rather than impaired, and the [[/guides/lost-profits-vs-lost-business-value|lost profits versus lost business value]] guide works through the choice.",
    faqs: [
      {
        question: "Can a business that is still operating claim diminished value?",
        answer:
          "Yes, where the record shows the impairment is permanent. A business that lost a territory, a license, or a customer base it cannot rebuild has a lasting reduction in its cash flows, and the reduction is measured as the difference between its value before and after the act. A business that will recover has a lost profits claim instead, and the report says which the evidence supports.",
      },
      {
        question: "How is the value before the act established after the fact?",
        answer:
          "From the records as they stood on the day before the act: the financial statements, the contracts in force, the customer list, and the market conditions of that date, with no knowledge of what followed. The after value uses the same date and standard, changed only by the effect of the act, so the difference isolates the harm from everything else that happened to the business.",
      },
      {
        question: "Is diminished value the same as lost goodwill?",
        answer:
          "Goodwill is one part of it. Diminished value measures the change in the whole enterprise, tangible assets and goodwill together, and a permanent loss of customers or reputation usually shows up as a reduction in goodwill within that total. The report values the enterprise, not the goodwill line alone, so that the effect on the assets and on the operating cash flows is captured as well.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD"]),
    related: [
      { title: "Lost Profits and Commercial Damages", href: "/services/lost-profits-and-commercial-damages", description: "The loss-period measure for a business that recovers." },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches", description: "The income, market, and asset approaches behind the two valuations." },
      { title: "Lost Profits vs. Lost Business Value", href: "/guides/lost-profits-vs-lost-business-value", description: "The full guide to choosing the measure." },
    ],
  },
  {
    slug: "fair-value-vs-fair-market-value-in-shareholder-disputes",
    title: "Fair Value vs. Fair Market Value in Shareholder Disputes",
    metaTitle: "Fair Value vs. FMV in Shareholder Disputes",
    answer:
      "Fair value pays the shareholder a pro rata share of the whole company, usually undiscounted; fair market value prices the minority block, with discounts.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-28",
    dateModified: "2026-09-28",
    a: {
      label: "Fair Value",
      summary:
        "The standard most states prescribe when a shareholder dissents from a merger or claims oppression and the company or the majority must buy the shares. It is the shareholder's proportionate interest in the enterprise as a going concern, valued under the [[/methods/business-valuation-approaches|income and market approaches]] immediately before the transaction or the conduct complained of, and in most jurisdictions without a discount for lack of control or lack of marketability, so the departing owner receives a pro rata share of the whole.",
      url: "/services/business-valuation",
    },
    b: {
      label: "Fair Market Value",
      summary:
        "The price a hypothetical willing buyer would pay a willing seller for the specific block of shares, neither under compulsion and both informed. Applied to a minority interest in a closely held company, it reflects what that block is worth to an outsider who cannot control the company or readily sell the shares, so discounts for lack of control and lack of marketability are ordinarily considered, and the result for the minority holder is lower than a pro rata share of the enterprise.",
      url: "/services/business-valuation",
    },
    rows: [
      { dimension: "What is being valued", a: "The shareholder's proportionate share of the enterprise", b: "The specific block of shares as a buyer would see it" },
      { dimension: "Discount for lack of control", a: "Usually not applied", b: "Ordinarily considered for a minority block" },
      { dimension: "Discount for lack of marketability", a: "Excluded in most jurisdictions, applied in a few in limited circumstances", b: "Ordinarily considered for shares with no ready market" },
      { dimension: "Valuation date", a: "Immediately before the merger or the oppressive conduct", b: "The date the agreement, the statute, or the court fixes" },
      { dimension: "Effect of the transaction itself", a: "Value arising from the merger is generally excluded; oppression cases may adjust for the wrongdoer's conduct", b: "Not a feature of the standard" },
      { dimension: "Where it is written", a: "The state's corporation statute and the case law applying it", b: "Tax definitions, professional valuation standards, and the agreement that adopts it" },
      { dimension: "Result for a minority holder", a: "Higher, a pro rata share of the whole", b: "Lower, the discounted value of the block" },
    ],
    whenUseA:
      "Fair value governs where a statute gives it to the shareholder: the appraisal remedy when a shareholder dissents from a merger or a sale of substantially all the assets, and the buyout remedy when a minority holder proves oppression or a deadlock and the court orders the company or the majority to purchase the shares. In both settings the departing owner is not a willing seller and the majority is not a hypothetical buyer, which is why most courts reject the discounts that describe an arm's-length sale of a minority block. The economist values the enterprise as a whole under the standard the state's case law describes, multiplies by the shareholder's percentage, and states the treatment of each discount with the authority counsel identifies. A [[/case-types/partnership-and-shareholder-dispute|partnership and shareholder dispute]] is the setting, and the [[/services/business-valuation|business valuation]] service page describes the valuation the standard is applied to.",
    whenUseB:
      "Fair market value governs where the parties chose it or the law imports it: a shareholder agreement or buy-sell provision that names the standard for a departing owner's shares, a voluntary sale between owners, a redemption priced by agreement, and the tax consequences of any of them. A minority holder who agreed in advance to be bought out at fair market value has usually agreed to the discounts that come with it, and the economist applies them from the evidence on the degree of control the block carries and the restrictions on its transfer. Where the agreement names the standard but the departing owner also pleads oppression, the two standards can both be in play, and the report presents the value under each so the court in a [[/case-types/partnership-and-shareholder-dispute/new-york|New York shareholder dispute]], or in any venue, can see what the choice of standard is worth. The [[/guides/business-valuation-in-litigation|business valuation in litigation]] guide covers the standards of value generally.",
    overlap:
      "Both standards begin from the same enterprise valuation: the same normalized financial statements, the same income and market approaches, and usually the same conclusion about what the whole company is worth. They part at the interest level, in whether the shareholder receives a proportionate share of that whole or the discounted value of the block. The general [[/compare/fair-market-value-vs-fair-value|fair market value versus fair value]] comparison sets out the definitions; the shareholder setting adds the questions of the valuation date, the exclusion of value created by the transaction, and the adjustments some courts make for the majority's conduct, each of which the report addresses expressly. Which standard applies is a legal question, and where it is unsettled the report carries both figures so that neither side has to argue the law from a number built for the other standard.",
    faqs: [
      {
        question: "Does a buy-sell agreement's price override the statutory fair value standard?",
        answer:
          "Often for a voluntary departure, less often for an oppression or dissenters' rights claim. Courts differ on whether a shareholder can be held to an agreed formula when the statute gives a fair value remedy, and the answer is counsel's. The economist reports the value under the agreement's formula and under the statutory standard so the court can enforce whichever governs.",
      },
      {
        question: "Is value created by the merger itself included in a fair value appraisal?",
        answer:
          "Generally not. The appraisal statutes in most states value the shares immediately before the transaction and exclude any appreciation or depreciation that the merger itself brings about, so synergies the acquirer expected are left out. The company is valued as it stood as a going concern on that date, on its own prospects.",
      },
      {
        question: "Can a court apply a marketability discount but refuse a control discount in a fair value buyout?",
        answer:
          "Some courts have, on the reasoning that the lack of a market for the shares is a feature of the whole company rather than of the minority position. The majority of jurisdictions reject both discounts under fair value. The report states the treatment adopted and shows the figure with and without each discount so the difference is on the record.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS"]),
    related: [
      { title: "Partnership and Shareholder Disputes", href: "/case-types/partnership-and-shareholder-dispute", description: "The economic analysis in a buyout, appraisal, or oppression claim." },
      { title: "Fair Market Value vs. Fair Value", href: "/compare/fair-market-value-vs-fair-value", description: "The two standards defined across every setting." },
      { title: "Business Valuation", href: "/services/business-valuation", description: "Valuation of closely held interests for litigation." },
    ],
  },
  {
    slug: "economist-vs-forensic-accountant-on-lost-profits",
    title: "Economist vs. Forensic Accountant on Lost Profits",
    metaTitle: "Economist vs. Accountant on Lost Profits",
    answer:
      "On lost profits the forensic accountant rebuilds what the business earned from its books; the economist projects what it would have earned and discounts it.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    a: {
      label: "Forensic Economist",
      summary:
        "An economist approaches a [[/services/lost-profits-and-commercial-damages|lost profits claim]] from the market the business operated in: the demand it faced, the prices and volumes comparable firms achieved, the industry's growth and margins, and the cost of capital that fits the risk of the projected stream. The economist's contribution is the but-for projection and its present value: what the business would have earned absent the wrongful act, over what period, discounted at what rate, and how sensitive the result is to each of those choices.",
      url: "/services/lost-profits-and-commercial-damages",
    },
    b: {
      label: "Forensic Accountant",
      summary:
        "A forensic accountant approaches the same claim from inside the business's records: the general ledger, the financial statements, the tax returns, the invoices, and the bank activity that show what the business actually earned before, during, and after the event. The accountant's contribution is the reconstruction and the normalization: which revenues and costs were real, which were affected by the event, which costs were avoided, and what the owner's compensation and the related-party transactions should look like before the figures are compared.",
      url: "/services/fraud-and-asset-tracing",
    },
    rows: [
      { dimension: "Starting point", a: "The market and the industry the business competed in", b: "The business's own books and records" },
      { dimension: "Core question", a: "What would the business have earned absent the event?", b: "What did the business actually earn, and are the figures reliable?" },
      { dimension: "Treatment of costs", a: "Incremental costs the lost revenue would have carried, from margins and cost behavior", b: "Costs as recorded, classified as fixed or variable, saved or incurred" },
      { dimension: "Growth and the loss period", a: "From industry data, comparable firms, and economic conditions", b: "From the trend in the business's own historical results" },
      { dimension: "Discounting", a: "A rate matched to the risk of the projected stream, with the choice explained", b: "Often a rate adopted by convention or taken from the economist" },
      { dimension: "Reliability of the inputs", a: "Takes the financial statements as given unless told otherwise", b: "Tests the statements against the source documents" },
      { dimension: "Typical failure", a: "A projection that outruns what the business could have delivered", b: "A trend extended from the books with no regard to the market" },
    ],
    whenUseA:
      "The economist is the right lead when the dispute is about the projection: a business whose market changed around the time of the event, a new or growing business whose own history does not show what it would have become, a claim whose loss period and growth rate are the contested inputs, or a defendant who argues that the downturn in results came from the economy rather than the breach. The [[/methods/lost-profits-but-for-analysis|but-for analysis]] is the economist's method, and the [[/guides/lost-profits-for-a-new-business|new business guide]] shows what the projection rests on when the books are thin. The economist also owns the present value step wherever the stream runs into the future, because the discount rate has to carry the risk of the profits themselves and that is a question about markets, not ledgers.",
    whenUseB:
      "The forensic accountant is the right lead when the dispute is about the records: whether the historical results are reliable, whether revenues were shifted between periods or entities, how owner compensation and related-party dealings should be normalized, which costs were actually saved when the revenue stopped, and whether the post-event results reflect the event or a change in bookkeeping. A claim in a [[/case-types/commercial-contract-dispute/illinois|commercial contract dispute venued in Illinois]], or anywhere, in which the plaintiff's own statements are contested is one the accountant has to settle before any projection can begin, and a matter that also involves [[/services/fraud-and-asset-tracing|diverted funds]] is the accountant's from the start.",
    overlap:
      "Most lost profits claims need both kinds of work, and in a practice that fields both disciplines the question is one of sequence rather than of choosing. The reconstruction comes first: the historical results are tested and normalized so the projection has a reliable base and the actual results have a reliable comparison. The projection comes second, built from that base and from the market evidence, with the loss period, the growth, the incremental costs, and the discount rate each stated and sourced. The broader [[/compare/forensic-economist-vs-forensic-accountant|economist versus forensic accountant]] comparison draws the line between the two disciplines across every kind of claim; on lost profits the line is between what the books show and what the market would have allowed, and a report that reads only one side of it is the one an opposing expert takes apart. The report identifies which method produced each component so that the court can see the foundation under every figure.",
    faqs: [
      {
        question: "Do an economist and a forensic accountant reach different lost profits figures from the same records?",
        answer:
          "They can, and the difference usually lies in the projection rather than the history. The accountant extends the business's own trend; the economist tests that trend against the market and the comparables and may shorten the loss period, lower the growth, or raise the discount rate. Where both work the same matter, the normalized history is shared and the projection is built on it.",
      },
      {
        question: "Who decides which costs the lost revenue would have carried?",
        answer:
          "Both contribute. The accountant classifies the recorded costs as fixed or variable and identifies which were actually avoided when the revenue stopped; the economist estimates the incremental cost the projected revenue would have carried from the business's cost behavior and the industry's margins. The two figures are reconciled so that saved costs are deducted once.",
      },
      {
        question: "Does a lost profits claim need two experts?",
        answer:
          "Not always. A short loss period for an established business with clean books can be handled by one expert with the right training. A claim with contested records and a contested projection, or one that mixes lost profits with a tracing or valuation question, usually benefits from both, with one report or two reconciled reports that use the same base and the same assumptions.",
      },
    ],
    sources: refsToSources(["NAFE_ETHICS","ACFE","AICPA_SSVS1"]),
    related: [
      { title: "Lost Profits and Commercial Damages", href: "/services/lost-profits-and-commercial-damages", description: "The but-for projection and its present value." },
      { title: "Forensic Economist vs. Forensic Accountant", href: "/compare/forensic-economist-vs-forensic-accountant", description: "The two disciplines across every kind of claim." },
      { title: "Lost Profits But-For Analysis", href: "/methods/lost-profits-but-for-analysis", description: "How the projection is built and tested." },
    ],
  },
  // Transfer pricing (owner request 2026-10-05): the tax-compliance study and
  // the litigation report side by side, neutral between taxpayer and
  // government. The answer names "documentation" and "report", the last long
  // word of each label, as the answer-block test requires.
  {
    slug: "transfer-pricing-documentation-vs-expert-report",
    title: "Transfer Pricing Documentation vs. Expert Report",
    metaTitle: "Transfer Pricing Study vs. Expert Report",
    answer:
      "Transfer pricing documentation supports a tax return before any dispute; a litigation expert report states and defends opinions for the tribunal deciding one.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-05",
    dateModified: "2026-10-05",
    a: {
      label: "Transfer Pricing Documentation",
      summary:
        "The study a taxpayer maintains to show that its intercompany prices were set under a reasonably selected and reasonably applied method. Under the U.S. penalty regulations its principal documents describe the business and the organization, the controlled transactions, the method selected and why, the alternatives considered and why they were rejected, the comparables and the adjustments, and the economic analysis; they must exist when the return is filed and be provided within thirty days of an IRS request to protect against the net adjustment penalty. Under the OECD approach the equivalent record is a master file and a local file alongside country-by-country reporting, and the [[/methods/transfer-pricing-methods|methods]] it documents are the same.",
      url: "/methods/transfer-pricing-methods",
    },
    b: {
      label: "Litigation Expert Report",
      summary:
        "The report a testifying expert prepares once a dispute exists, stating every opinion with its basis and reasons, the facts or data considered, the exhibits, and the expert's qualifications, prior testimony, and compensation. In the U.S. Tax Court it is received in evidence as the expert's direct testimony; in a district court or an arbitration it is the disclosure the expert is examined on and the opinion the tribunal tests for reliability. It answers the question the case presents, for the transactions and years at issue, and it has to engage the other side's analysis rather than only present its own, as the [[/guides/expert-witness-disclosure-rules|disclosure guide]] describes.",
      url: "/services/transfer-pricing-expert-witness",
    },
    rows: [
      { dimension: "Purpose", a: "Support the return position and protect against the net adjustment penalty", b: "Present and defend opinions on the arm's length result before the tribunal" },
      { dimension: "When it is prepared", a: "By the time the return is filed, and updated as the transactions change", b: "After the dispute arises, on the schedule the court or the panel sets" },
      { dimension: "Audience", a: "The examining tax authority", b: "A Tax Court judge, a jury in a refund suit or a commercial case, or an arbitral panel" },
      { dimension: "Standard it is judged by", a: "Whether the method was reasonably selected and reasonably applied under the best method rule", b: "Whether the opinion rests on sufficient facts and a reliable method reliably applied, and whether it persuades" },
      { dimension: "Scope", a: "Every material controlled transaction for the year, often at a summary level", b: "The transactions and years in dispute, in the depth the contested issues require" },
      { dimension: "The other side's analysis", a: "None exists yet; the study anticipates the questions", b: "Must engage the opposing expert's method, tested party, comparables, and adjustments" },
      { dimension: "Data", a: "The most current reliable data available by the end of the year, plus relevant data obtained before filing", b: "The full record produced in the case, including later data where the framework allows" },
      { dimension: "Author's exposure", a: "Prepared for the taxpayer, often by its advisors, and reviewed by the examiners", b: "Signed by the testifying expert, who is deposed and cross-examined on it" },
    ],
    whenUseA:
      "Documentation is the instrument before any dispute, prepared as each return is filed: it records the method the group applied, why it was the best method, and how the result was computed, so that an examination can be resolved on the record and the penalty protection is preserved. In an examination it is the record the examiners test the taxpayer's results against, and the IRS has said that documentation which explains the actual drivers of the results, including a downturn or a year-end adjustment, can support an early end to the inquiry. In a commercial, shareholder, or divorce case the documentation is evidence of the policy the group applied and of what it told the tax authorities, and a party may offer it as proof that the intercompany prices were fair; it answers the tax question it was written for, and the economist reads it for what it shows about the transactions rather than adopting its conclusion, as the [[/guides/transfer-pricing-disputes-explained|transfer pricing disputes guide]] explains.",
    whenUseB:
      "The expert report is the instrument once a dispute exists and a tribunal will decide it: a [[/case-types/tax-and-transfer-pricing-dispute|Tax Court petition]], a refund suit, an arbitration under a contract, or a commercial action in which the intercompany price is part of the claim or the defense, such as a [[/case-types/commercial-contract-dispute|commercial contract dispute]] over an agreement between former affiliates or a [[/case-types/partnership-and-shareholder-dispute|shareholder dispute]] over profits shifted to entities the controlling owner holds. Treaty arbitration is different: under the treaties that provide it, a case the two competent authorities could not resolve through the mutual agreement procedure goes to an arbitration panel whose determination binds them only if the taxpayer accepts it, and the taxpayer's analysis reaches the panel through the U.S. competent authority, to the extent the treaty permits, rather than through testimony. The report is prepared under the tribunal's disclosure rules, for the transactions and years at issue, and it has to test the documentation rather than restate it: whether the delineation matched the conduct, whether the tested party and the comparables hold up, and what the result is under the alternatives the other side will press. The [[/methods/transfer-pricing-methods|transfer pricing methodology]] page lists the choices the report has to defend one by one.",
    overlap:
      "Both documents apply the same regulations, the same methods, and often the same comparables, and an expert report may start from the documentation's delineation and functional analysis. They differ in what they are for and how they are tested. The documentation shows that a reasonable method was reasonably applied when the return was filed; the expert report shows what the arm's length result is on the full record and defends it under cross-examination against an opposing analysis. Documentation that was adequate for penalty protection can still be the weak point at trial, because a comparable set or a tested party that was reasonable for compliance may not survive an opposing expert's scrutiny, and an expert who adopts it without testing it inherits its weaknesses. A [[/services/transfer-pricing-expert-witness|testifying transfer pricing expert]] who did not prepare the documentation can test it as the other side will, and the [[/services/expert-rebuttal-and-report-review|report review]] service describes how an opposing transfer pricing report is examined one choice at a time.",
    faqs: [
      {
        question: "Is a company's transfer pricing study evidence of an arm's length price in litigation?",
        answer:
          "It is evidence of the policy the company applied and of what it told the tax authorities, and its admissibility and weight are for counsel and the court. It is not an expert opinion on the question the case presents: an expert who relies on it adopts its delineation, comparables, and method and must be ready to defend each of them, and in the Tax Court the expert's own report, not the study, is the direct testimony.",
      },
      {
        question: "Does documentation that protects against a transfer pricing penalty prove the prices were arm's length?",
        answer:
          "No. Penalty protection turns on whether the method was reasonably selected and applied with the data available when the return was filed, and on whether the documentation existed then and was produced on time. An adjustment can still be sustained on the full record even though no penalty applies, because the two questions are judged by different standards.",
      },
      {
        question: "Should the firm that prepared the documentation also serve as the testifying expert?",
        answer:
          "It can, but the expert then defends the firm's earlier work and is examined on every choice it made. A testifying expert who did not prepare the documentation can test it the way the other side will, adopt what holds up, and correct what does not; the choice depends on the strength of the documentation, the issues in dispute, and the cost of a second review.",
      },
    ],
    sources: refsToSources(["TREAS_REG_1_6662_6", "IRS_TP_DOCUMENTATION_FAQS", "TAX_COURT_RULE_143", "FRCP_26", "FRE_702", "IRS_MAP_OVERVIEW", "IRS_REV_PROC_2015_40", "OECD_TP_GUIDELINES"]),
    related: [
      { title: "Transfer Pricing Disputes Explained", href: "/guides/transfer-pricing-disputes-explained", description: "Where transfer pricing disputes arise and how each forum decides them." },
      { title: "Transfer Pricing Methodology", href: "/methods/transfer-pricing-methods", description: "The methods both documents apply, step by step." },
      { title: "Expert Witness Disclosure Rules", href: "/guides/expert-witness-disclosure-rules", description: "What a testifying expert's report must contain and when it is due." },
      { title: "Transfer Pricing Expert Witness", href: "/services/transfer-pricing-expert-witness", description: "The litigation analysis and report, for either side of a tax or civil dispute." },
    ],
  },
  // Intellectual property damages (owner request 2026-10-06): the two patent
  // and trade secret measures side by side, neutral between the owner and the
  // accused party. The answer names "profits" and "royalty", the last long
  // word of each label, as the answer-block test requires.
  {
    slug: "lost-profits-vs-reasonable-royalty",
    title: "Lost Profits vs. Reasonable Royalty",
    answer:
      "Lost profits measure the sales a patentee or trade secret owner proves it lost; a reasonable royalty prices the use itself and is open to every owner.",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-10-06",
    dateModified: "2026-10-06",
    a: {
      label: "Lost Profits",
      summary:
        "The profits the owner would have earned on the sales it lost to the infringer or misappropriator, on its own sales at prices the competition forced down, and on related sales that function with the protected product as a unit. In a patent case the owner proves that but for the infringement it would have made the sales, commonly through the four Panduit factors or a market share approach, and the claim is computed at incremental profit; under the trade secret statutes it is the main form of the owner's actual loss. The [[/methods/lost-profits-but-for-analysis|but-for analysis]] that supports it is the one used in any commercial damages claim.",
      url: "/methods/lost-profits-but-for-analysis",
    },
    b: {
      label: "Reasonable Royalty",
      summary:
        "The license fee a willing licensor and a willing licensee would have agreed to for the use the infringer made, negotiated hypothetically as of the date the infringement or misappropriation began. The Patent Act makes it the floor of every patent award, and the trade secret statutes allow it in place of the owner's loss and the misappropriator's gain. It is built from comparable licenses, the profit the protected feature made possible, and the cost of the user's next-best alternative, apportioned to the protected feature, as the [[/methods/reasonable-royalty-analysis|reasonable royalty methodology]] describes.",
      url: "/services/intellectual-property-damages",
    },
    rows: [
      { dimension: "Who can claim it", a: "An owner that competed for the sales, with the patented product or a product of its own that the infringing product displaced", b: "Every patent owner, including one that licenses rather than sells, and a trade secret owner that elects it in place of other measures" },
      { dimension: "What it measures", a: "The owner's lost incremental profit on lost sales, eroded prices, and related sales that function with the product", b: "The value of the right to use the protected invention or information, priced as a license fee" },
      { dimension: "What must be proved", a: "That the owner would have made the sales but for the infringement, and that the loss was reasonably foreseeable", b: "The infringing use and its extent; no lost sale has to be shown" },
      { dimension: "Key evidence", a: "Market structure, substitutes, capacity, the owner's costs, and the infringer's sales", b: "Comparable licenses, the profit the feature made possible, and the cost of the user's alternatives" },
      { dimension: "Noninfringing alternatives", a: "An available and acceptable substitute can defeat or reduce the claim, even if it was not on the market", b: "The cost and delay of switching to an alternative bound what the licensee would have paid" },
      { dimension: "Apportionment", a: "Related unpatented sales count only if they function with the patented product as a unit", b: "The base and the rate must reflect the patented feature, not the unpatented features of the product" },
      { dimension: "Timing", a: "The loss period, with the six-year limit and any marking and notice rule applied", b: "A negotiation dated when the infringement began, with payment for the recoverable period" },
      { dimension: "Where the experts disagree", a: "Market definition, substitutes, capacity, and incremental costs", b: "The comparability of licenses, the royalty base, and the point within the bargaining range" },
    ],
    whenUseA:
      "Lost profits are the measure where the owner competed for the sales the infringer made and can prove it would have made them. A manufacturer whose patented product faced the infringer's copy in a market with few acceptable substitutes, and that had the capacity to supply the added demand, has the classic claim, and the four Panduit factors, demand, the absence of acceptable noninfringing substitutes, capacity, and the profit it would have made, are the usual proof; where several competitors share the market, the owner may claim the share of the infringing sales that matches its market share. The claim can include price erosion, where the competition forced the owner's prices down, and lost sales of the owner's own competing products, where the infringement caused them and the loss was foreseeable. In a trade secret case the same analysis measures the owner's actual loss from customers and sales diverted by the misappropriation, as the [[/guides/trade-secret-damages-explained|trade secret damages guide]] explains, and the [[/guides/patent-damages-reasonable-royalty-explained|patent damages guide]] sets out the proof in a patent case.",
    whenUseB:
      "A reasonable royalty is the measure for every infringing sale the owner cannot show it would have made: all of them for an owner that licenses rather than sells, or that lacked the capacity to serve the market, and the remainder for a competitor whose lost profits cover only part of the infringing sales. It is also the measure a trade secret owner can elect in place of actual loss and unjust enrichment, often where the secret was used but the owner's loss and the defendant's gain are hard to isolate. The royalty prices the right to use the invention in a hypothetical negotiation at the start of the infringement, with the patent assumed valid and infringed, and an [[/services/intellectual-property-damages|intellectual property damages]] analysis builds it from comparable licenses, the profit attributable to the patented feature, and the cost of the infringer's alternatives, under the apportionment rules that keep the base and the rate tied to the invention. In a [[/case-types/commercial-contract-dispute|license dispute]], where the question is what a licensee owes under its agreement, the contract rather than the patent statute sets the measure, though the same comparable-license evidence often informs it.",
    overlap:
      "The two measures are not exclusive, and a [[/case-types/intellectual-property-infringement|patent award]] often combines them: lost profits on the sales the owner proves it would have made and a reasonable royalty on the rest, with no sale counted twice. They also inform each other. The profit the owner expected to lose by licensing a competitor raises the minimum it would have accepted in the hypothetical negotiation, and the profit the infringer expected the invention to add over its next-best alternative sets the most it would have paid, so the evidence behind a lost profits claim reappears in the royalty analysis even where the lost profits claim fails. Both measures rest on a reconstruction of the market as it would have been without the infringement, with the same alternatives, the same customers, and the same period, and a report that treats the alternatives one way for lost profits and another way for the royalty will be tested on the inconsistency. The [[/services/lost-profits-and-commercial-damages|lost profits and commercial damages]] service and the [[/services/expert-rebuttal-and-report-review|report review]] service describe how each side's measure is built and examined.",
    faqs: [
      {
        question: "Can a patentee recover lost profits on some infringing sales and a royalty on the rest?",
        answer:
          "Yes. Courts allow a split award: lost profits on the share of the infringing sales the patentee proves it would have made, often its share of the market, and a reasonable royalty on the remainder. The damages schedule assigns each infringing unit to one measure so that none is counted twice.",
      },
      {
        question: "Which measure is larger, lost profits or a reasonable royalty?",
        answer:
          "It depends on the facts. A competitor's margin on a lost sale can exceed what it would have accepted as a royalty on that sale, but the royalty reaches every infringing sale while lost profits reach only the sales the owner proves it would have made. The market, the alternatives, and the owner's capacity decide the comparison, and the report computes both where the evidence supports them.",
      },
      {
        question: "Does a reasonable royalty in a trade secret case work the same way as in a patent case?",
        answer:
          "The framework is similar, a hypothetical negotiation dated when the misappropriation began, but the inputs differ. There is no patent term, so the license runs for the period the information would have stayed secret or the head start would have lasted, and the alternatives that bound the bargain include independent development and reverse engineering, which trade secret law treats as lawful.",
      },
    ],
    sources: refsToSources([
      "PATENT_284",
      "PANDUIT",
      "STATE_INDUSTRIES_MOR_FLO",
      "RITE_HITE",
      "GRAIN_PROCESSING",
      "GEORGIA_PACIFIC",
      "LUCENT_GATEWAY",
      "LASERDYNAMICS",
      "DTSA_1836",
      "UNIFORM_TRADE_SECRETS_ACT",
    ]),
    related: [
      { title: "Patent Damages Explained", href: "/guides/patent-damages-reasonable-royalty-explained", description: "Where patent cases are heard and how lost profits and the royalty are built." },
      { title: "Reasonable Royalty Methodology", href: "/methods/reasonable-royalty-analysis", description: "The hypothetical negotiation, step by step." },
      { title: "Trade Secret Damages Explained", href: "/guides/trade-secret-damages-explained", description: "Actual loss, unjust enrichment, and the royalty in a misappropriation case." },
      { title: "Lost Profits and But-For Analysis", href: "/methods/lost-profits-but-for-analysis", description: "How the but-for projection is built and tested." },
      { title: "Intellectual Property Damages", href: "/services/intellectual-property-damages", description: "The damages analysis for either side of a patent, trademark, copyright, or trade secret claim." },
    ],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
