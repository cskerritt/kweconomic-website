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
  a: { label: string; summary: string; url?: string };
  b: { label: string; summary: string; url?: string };
  rows: ComparisonRow[];
  whenUseA: string;
  whenUseB: string;
  overlap: string;
  faqs: Faq[];
  sources: Source[];
  dateModified?: string;
  authorSlug?: string;
  related?: RelatedItem[];
}

// Each entry keeps `slug` then `title` on consecutive lines (scripts/prerender.mjs
// extracts the pair positionally). Prose is citation-free; sources render
// through the registry. The two entries that compare the economist with the
// sister disciplines (vocational and life care planning) are the only copy on
// the site allowed to name those experts; the off-brand guard carves them out.
export const comparisons: Comparison[] = [
  {
    slug: "forensic-economist-vs-forensic-accountant",
    title: "Forensic Economist vs. Forensic Accountant",
    dateModified: "2026-08-27",
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
    dateModified: "2026-08-27",
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
    dateModified: "2026-08-27",
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
    dateModified: "2026-08-27",
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
    dateModified: "2026-08-27",
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
          "Usually, where the record supports one. An alternative calculation gives the trier of fact a supported figure rather than only a critique, and it demonstrates that the reviewer applied the method rather than simply rejecting the result.",
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
    dateModified: "2026-08-27",
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
    dateModified: "2026-08-27",
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
    dateModified: "2026-08-27",
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
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
