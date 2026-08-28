import type { Service } from "@/types";
import { VOC_SITE_URL, LCP_SITE_URL } from "@/lib/brand";

/**
 * KW Economics service taxonomy.
 *
 * Eleven `pillar: true` entries are the site's indexable service lines: every
 * service page, service x state, service x city, cost/process/timeline page,
 * hub card, cross-link, sitemap entry, and prerendered route enumerates from
 * `pillarServices()`. The two `pillar: false` entries (vocational assessment
 * and life care plan authorship) are hand-offs to the sister practices: each
 * resolves at /services/<slug> as a short noindex card that links out through
 * `externalUrl`, and is excluded from every enumeration.
 *
 * Copy is written from the economist's standpoint: what the loss claim
 * consists of, which records drive it, and how the number is built. No
 * statute or rule citations, no dollar figures, no invented statistics, and
 * no claim that a named person holds a membership or credential.
 *
 * Build scripts (scripts/lib/service-slugs.mjs) read this file as text and
 * split it on top-level `\n  {\n` object boundaries, dropping any block that
 * contains `pillar: false`. Keep each entry as its own two-space-indented
 * object literal with `slug:` as the first field.
 */
export const services: Service[] = [
  {
    slug: "lost-earnings-and-earning-capacity",
    name: "Lost Earnings and Earning Capacity Analysis",
    shortName: "Lost Earnings",
    pillar: true,
    description: "Past and future lost earnings and fringe benefits for a person whose injury has removed them from work or reduced what they can earn. The analysis builds from the earnings history, projects the but-for path over the person's expected worklife with wage growth, and discounts the future stream to present value. When the person can still work in a reduced capacity, the loss is framed as diminished earning capacity, with the post-injury path drawn from a vocational opinion or the treating record and offset against the but-for projection.",
    icon: "TrendingUp",
    keywords: ["lost earnings", "loss of earning capacity", "lost wages expert", "worklife expectancy", "fringe benefits loss", "present value of lost earnings"],
    caseTypes: ["personal-injury", "motor-vehicle-accident", "traumatic-brain-injury", "spinal-cord-injury", "medical-malpractice", "workers-compensation", "product-liability"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    cost: {
      range: "Lost earnings engagements are scoped to the components of the claim and the records available to support them. A wage earner with a stable earnings history and a clear return-to-work date is the narrowest scope; a self-employed claimant, a career still in training, or a contested post-injury capacity widens it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Whether the claim is a total loss, a delayed return to work, or a reduced post-injury capacity that must be modeled against the but-for path",
        "Volume and quality of earnings records: tax returns, wage statements, pay stubs, personnel files, and union and pension records",
        "Whether the person was self-employed, paid on commission, or early in a career so that earnings must be projected from occupational data rather than history",
        "Fringe benefits to be valued, including employer retirement contributions, health insurance, and paid leave",
        "Whether worklife expectancy, wage growth, or discount rate assumptions are contested and call for sensitivity analysis",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Lost earnings analysis is billed at an hourly rate for records review, data collection, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm the parties and counsel for conflicts, define the damages questions to be answered, establish the retainer, and agree on the report deadline and any disclosure dates." },
      { step: "Records and data request", description: "We issue a records list covering tax returns, wage statements, employment and personnel files, benefit plan documents, and the medical or vocational opinions that define post-injury work capacity." },
      { step: "Analysis and modeling", description: "We establish the but-for earnings base, apply worklife expectancy and wage growth, model the post-injury earnings path, value fringe benefits, and discount future losses to present value with sensitivity ranges where assumptions are contested." },
      { step: "Draft report and counsel review", description: "We deliver a draft that states every assumption, data source, and calculation, then review it with counsel for completeness and factual accuracy before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report in disclosure-ready form and provide deposition and trial testimony, rebuttal of opposing economic opinions, and updated calculations as new records arrive." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "2 to 4 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "wrongful-death-economic-loss",
    name: "Wrongful Death Economic Loss",
    shortName: "Wrongful Death",
    pillar: true,
    description: "The economic loss to survivors when a wage earner or homemaker dies: the decedent's lost earnings and fringe benefits net of personal consumption, the household services the decedent would have provided, and the financial support that would have flowed to dependents. Which elements are recoverable, and whether the loss is measured to the estate or to the survivors, vary by state, so the analysis is structured to the framework counsel identifies and every assumption is stated so it can be examined.",
    icon: "Scale",
    keywords: ["wrongful death economist", "loss of financial support", "personal consumption deduction", "lost household services", "survivor economic loss", "estate lost earnings"],
    caseTypes: ["wrongful-death", "medical-malpractice", "motor-vehicle-accident", "product-liability"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    cost: {
      range: "Wrongful death engagements are scoped to the number of loss components, the number of survivors whose support must be modeled, and the depth of the decedent's earnings and household record. A single wage earner with dependents and a clear work history is the narrowest scope; a self-employed decedent, a homemaker whose services must be reconstructed, or several survivor classes with different support periods widen it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of loss components claimed: lost earnings and benefits, lost household services, lost financial support, and any lost accumulation to the estate",
        "Volume of earnings records, tax returns, and benefit documents available for the decedent",
        "Number of survivors and the period over which support to each must be projected",
        "Whether a personal consumption deduction must be developed from household expenditure data and the household's composition",
        "State-specific framework questions that change which components are measured and to whom",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Wrongful death analysis is billed at an hourly rate for records review, data collection, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the survivors and the damages framework that applies in the venue, establish the retainer, and set the report deadline." },
      { step: "Records and data request", description: "We request the decedent's tax returns, wage and benefit records, employment history, and household information, including the composition of the household and the services the decedent provided." },
      { step: "Analysis and modeling", description: "We project the decedent's but-for earnings and benefits over the expected worklife, deduct personal consumption where the framework requires it, value lost household services, and discount each survivor's loss to present value." },
      { step: "Draft report and counsel review", description: "We deliver a draft with every assumption and source stated, organized by loss component and survivor, and review it with counsel before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony, rebuttal of opposing opinions, and supplemental calculations if the framework or the record changes." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "2 to 4 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "personal-injury-economic-damages",
    name: "Personal Injury Economic Damages",
    shortName: "Personal Injury",
    pillar: true,
    description: "An integrated economic damages report for an injured person: lost earnings and fringe benefits, lost household services, and the present value of future medical and care costs supplied by treating providers or a life care plan. One report carries every economic component to a single present value with consistent growth, discount, and life expectancy assumptions, so counsel can present the damages as a whole and the jury sees one set of numbers.",
    icon: "Activity",
    keywords: ["economic damages expert", "personal injury economist", "future medical costs present value", "lost earnings and household services", "economic damages report"],
    caseTypes: ["personal-injury", "motor-vehicle-accident", "traumatic-brain-injury", "spinal-cord-injury", "medical-malpractice", "product-liability"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    cost: {
      range: "Integrated damages engagements are scoped to the number of loss components and the records behind each. A claim limited to lost earnings is the narrowest scope; adding household services, fringe benefits, and a future medical cost stream drawn from a life care plan or treating provider recommendations widens both the record and the modeling. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of economic components claimed: lost earnings, fringe benefits, household services, and future medical or care costs",
        "Volume of earnings, tax, and employment records to review",
        "Whether future medical costs are supplied as a life care plan, as treating provider recommendations, or must be assembled from the medical record with counsel",
        "Number of care scenarios to value, such as home-based and facility-based alternatives",
        "Whether medical cost growth, discount rate, or life expectancy assumptions are contested and call for sensitivity analysis",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Integrated damages analysis is billed at an hourly rate for records review, data collection, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify which economic components are claimed and which other experts supply the underlying facts, establish the retainer, and set the report deadline." },
      { step: "Records and data request", description: "We request earnings and benefit records, household information, the life care plan or treating provider recommendations for future care, and the medical or vocational opinions that define post-injury work capacity." },
      { step: "Analysis and modeling", description: "We value each component on a consistent basis: earnings and benefits over the expected worklife, household services at replacement cost, and future medical costs with item-specific growth, all discounted to present value over the applicable life expectancy." },
      { step: "Draft report and counsel review", description: "We deliver a draft organized by component with every assumption and source stated, then review it with counsel for consistency with the other experts' opinions." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony, rebuttal of opposing economic reports, and recalculation when the life care plan or the medical record is updated." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "2 to 4 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "household-services-valuation",
    name: "Household Services Valuation",
    shortName: "Household Services",
    pillar: true,
    description: "Replacement-cost valuation of the household production an injured or deceased person can no longer provide: meal preparation, cleaning, home and vehicle maintenance, shopping, child care, and care of other household members. The hours are drawn from national time-use data adjusted to the person's household composition and pre-injury role, and each category is priced at the local wage for the occupation that would replace it, then projected and discounted over the period of loss.",
    icon: "Home",
    keywords: ["household services valuation", "loss of household services", "replacement cost of household services", "time-use data", "household production economist"],
    caseTypes: ["personal-injury", "wrongful-death", "traumatic-brain-injury", "spinal-cord-injury", "motor-vehicle-accident", "medical-malpractice"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    cost: {
      range: "Household services engagements are scoped to whether the loss is total or partial, the number of service categories affected, and how much the household's pre-injury division of labor must be documented. A stand-alone valuation for a single household is the narrowest scope; a partial loss that must be apportioned by category, or a valuation that has to reconcile with a life care plan's attendant care hours, widens it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Whether the loss is total, as in a death or a catastrophic injury, or partial and apportioned by category of work",
        "Household composition and how it changes over the period of loss as children age or the household dissolves",
        "Depth of documentation of the pre-injury division of household labor, from interviews, deposition testimony, or family records",
        "Whether attendant care in a life care plan overlaps the household services claim and must be reconciled to avoid double counting",
        "Local wage data required to price each replacement occupation in the household's region",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Household services valuation is billed at an hourly rate for records review, data collection, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, establish whether the claim is a stand-alone valuation or a component of a larger damages report, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We request household composition, the person's pre-injury role in the home, work schedules, medical restrictions bearing on household work, and any life care plan that projects attendant care." },
      { step: "Analysis and modeling", description: "We apply national time-use hours adjusted to the household, apportion the loss by category where the injury leaves some capacity intact, price each category at local replacement wages, and project and discount the loss over the applicable period." },
      { step: "Draft report and counsel review", description: "We deliver a draft showing hours, wage rates, and present value by category, and review it with counsel and any coordinating expert for consistency." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony and rebuttal of opposing household services opinions." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "1 to 3 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "life-care-plan-cost-projection",
    name: "Life Care Plan Cost Projection and Present Value",
    shortName: "Life Care Plan Costing",
    pillar: true,
    description: "Reduction of a life care plan's line items to a single present value. The plan's items, frequencies, durations, and unit costs are carried forward with medical cost growth appropriate to each category, then discounted over the applicable life expectancy. Plan authorship stays with the life care planner; our role is the economic translation of the plan into a damages figure that reconciles with the plan and can be examined item by item.",
    icon: "Calculator",
    keywords: ["life care plan present value", "future medical costs economist", "medical cost growth rate", "life care plan cost projection", "present value of future care"],
    caseTypes: ["traumatic-brain-injury", "spinal-cord-injury", "medical-malpractice", "personal-injury", "product-liability", "motor-vehicle-accident"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "PhD"],
    cost: {
      range: "Present value engagements are scoped to the length and structure of the plan and the number of scenarios to value. A single plan with one care scenario and an agreed life expectancy is the narrowest scope; multiple scenarios, contested life expectancy, category-specific growth rates, or a plan that is revised during the litigation widen it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of line items and care categories in the plan and whether each carries its own growth rate",
        "Number of plan scenarios to value, such as home-based and facility-based care or plaintiff and defense plans",
        "Whether life expectancy is agreed or contested and must be modeled under alternative assumptions",
        "Discount rate conventions that apply in the venue and whether a net discount approach is required",
        "Coordination with the plan's author on updates and revised plans",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Present value analysis is billed at an hourly rate for plan review, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the plan or plans to be valued and the venue's discounting conventions, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We obtain the life care plan with its item-level cost tables, the basis for its life expectancy, and any medical opinions that bear on the duration of care." },
      { step: "Analysis and modeling", description: "We assign growth rates by care category, apply the applicable life expectancy, discount each item to present value, and prepare sensitivity analysis across the reasonable range of growth and discount assumptions." },
      { step: "Draft report and counsel review", description: "We deliver a draft that ties every valued item back to the plan and states each assumption, then review it with counsel and the plan's author so the plan and the valuation reconcile." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony, rebuttal of opposing present value opinions, and revaluation when the plan is updated." },
    ],
    timeline: [
      { phase: "Retention and plan hand-off", duration: "About 1 week" },
      { phase: "Present value analysis", duration: "1 to 3 weeks after the plan is received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "employment-and-wage-loss-damages",
    name: "Employment and Wage-Loss Damages",
    shortName: "Employment Damages",
    pillar: true,
    description: "Back pay, front pay, and lost benefits in discrimination, retaliation, wrongful termination, and wage-and-hour matters. The analysis reconstructs what the employee would have earned in the position, including raises, bonuses, and benefit accruals, measures actual interim earnings, and evaluates mitigation and the period over which front pay is reasonable. In wage-and-hour matters the same records drive an hours and pay reconstruction for the individual claim or the class.",
    icon: "Briefcase",
    keywords: ["back pay calculation", "front pay economist", "wrongful termination damages", "employment discrimination economic damages", "mitigation of damages analysis", "wage and hour damages"],
    caseTypes: ["employment-discrimination", "wrongful-termination"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "MBA", "PhD"],
    cost: {
      range: "Employment damages engagements are scoped to the number of claimants, the complexity of the compensation structure, and how contested mitigation is. A single salaried employee with a documented pay history and a short back pay period is the narrowest scope; variable compensation, equity or bonus plans, multiple claimants, or a disputed front pay horizon widen it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of claimants and whether the analysis is individual or class-wide",
        "Complexity of compensation: base pay, overtime, commissions, bonuses, equity, and benefit plans that must be reconstructed",
        "Length of the back pay period and whether a front pay period must be projected and bounded",
        "Volume of interim earnings and job search records needed to evaluate mitigation",
        "Whether payroll and timekeeping data must be rebuilt to reconstruct hours in a wage-and-hour matter",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Employment damages analysis is billed at an hourly rate for records review, data collection, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the claims and the damages periods at issue, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We request personnel and payroll records, compensation and benefit plan documents, comparator pay data where relevant, and the claimant's post-separation earnings and job search records." },
      { step: "Analysis and modeling", description: "We reconstruct the but-for compensation path, measure interim earnings, evaluate mitigation, bound the front pay period, value lost benefits, and discount future amounts to present value." },
      { step: "Draft report and counsel review", description: "We deliver a draft that separates back pay, front pay, and benefits and states each assumption, then review it with counsel before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony, rebuttal of opposing damages opinions, and updated calculations as the trial date moves." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "2 to 4 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "business-valuation",
    name: "Business Valuation",
    shortName: "Business Valuation",
    pillar: true,
    description: "Valuation of closely held businesses and ownership interests for shareholder and partnership disputes, divorce, estate and gift matters, and buy-sell disagreements. The work applies the income, market, and asset approaches under the standard of value that governs the matter, addresses discounts for lack of control and marketability where they apply, and documents every input so the conclusion can be tested on cross-examination.",
    icon: "Building2",
    keywords: ["business valuation expert", "closely held business valuation", "fair market value vs fair value", "income approach valuation", "discount for lack of marketability", "shareholder dispute valuation"],
    caseTypes: ["partnership-and-shareholder-dispute", "divorce-and-marital-dissolution", "commercial-contract-dispute"],
    relevantCredentials: ["Forensic Economist", "MBA", "PhD"],
    cost: {
      range: "Valuation engagements are scoped to the size and complexity of the business, the quality of its financial records, and the purpose and standard of value. A single operating company with clean financial statements and one valuation date is the narrowest scope; multiple entities, related-party transactions, normalization of owner compensation, or several valuation dates widen it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Size and complexity of the business, including the number of entities, locations, and revenue lines",
        "Quality and completeness of financial statements, tax returns, and general ledger detail",
        "Standard of value and the purpose of the valuation, which determine the approaches and adjustments applied",
        "Normalization adjustments required for owner compensation, related-party transactions, and non-operating assets",
        "Whether discounts for lack of control or marketability are at issue and must be supported",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Business valuation is billed at an hourly rate for financial analysis, industry research, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the interest to be valued, the valuation date, the standard of value, and the purpose, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We request historical financial statements, tax returns, general ledger detail, ownership and governance documents, budgets and forecasts, and any prior valuations or buy-sell agreements." },
      { step: "Analysis and modeling", description: "We normalize the financial statements, analyze the industry and economic conditions at the valuation date, apply the income, market, and asset approaches as appropriate, reconcile the indications of value, and support any discounts applied." },
      { step: "Draft report and counsel review", description: "We deliver a draft that documents the approaches, inputs, and reconciliation, and review it with counsel for factual accuracy before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony and critique of opposing valuation reports." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Financial analysis and valuation", duration: "3 to 6 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "lost-profits-and-commercial-damages",
    name: "Lost Profits and Commercial Damages",
    shortName: "Lost Profits",
    pillar: true,
    description: "Lost profits and related commercial damages for contract, business-tort, and business-interruption matters. The analysis builds the but-for revenue and cost path from the company's own history, its market, and the terms of the disputed relationship, links each claimed loss to the conduct at issue, addresses mitigation, and reasons through the period of loss so the damages figure answers the causation question as well as the amount.",
    icon: "LineChart",
    keywords: ["lost profits expert", "commercial damages economist", "but-for profits analysis", "business interruption damages", "breach of contract damages", "period of loss"],
    caseTypes: ["commercial-contract-dispute", "partnership-and-shareholder-dispute", "fraud-and-embezzlement"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "MBA", "PhD"],
    cost: {
      range: "Lost profits engagements are scoped to the length of the loss period, the complexity of the business, and how much of the but-for case must be built from market data rather than the company's own history. A single product line with an established sales history and a defined loss period is the narrowest scope; a new venture, multiple revenue streams, disputed causation, or an open-ended loss period widen it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Length of the loss period and whether it is closed, ongoing, or must be bounded by the analysis",
        "Quality of the company's financial records and the history available to establish the but-for path",
        "Whether the business is established, so history drives the projection, or new, so market and comparable data must carry it",
        "Number of revenue streams and cost structures that must be modeled separately",
        "Extent of mitigation evidence and offsetting benefits that must be netted against the loss",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Lost profits analysis is billed at an hourly rate for records review, market research, modeling, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the conduct at issue and the theory of loss, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We request financial statements, sales and cost detail by product or customer, contracts, budgets and forecasts prepared before the dispute, and industry and market data for the loss period." },
      { step: "Analysis and modeling", description: "We construct the but-for revenue and cost projection, separate incremental from fixed costs, link each loss element to the conduct, net mitigation and offsets, and discount future lost profits to present value." },
      { step: "Draft report and counsel review", description: "We deliver a draft that states the causal link, the projection method, and every input, and review it with counsel before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony and rebuttal of opposing damages models." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "3 to 6 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "fraud-and-asset-tracing",
    name: "Fraud Investigation and Asset Tracing",
    shortName: "Fraud & Tracing",
    pillar: true,
    description: "Forensic accounting for embezzlement, misappropriation, and financial statement irregularities. The work reconstructs the flow of funds through bank, ledger, and payment records, traces diverted assets to where they came to rest, quantifies the loss for each scheme identified, and documents the evidence trail so it can support a civil claim, an insurance recovery, or a referral to authorities.",
    icon: "Search",
    keywords: ["forensic accountant", "embezzlement loss quantification", "asset tracing", "misappropriation investigation", "funds flow analysis", "financial statement irregularities"],
    caseTypes: ["fraud-and-embezzlement", "partnership-and-shareholder-dispute", "divorce-and-marital-dissolution", "commercial-contract-dispute"],
    relevantCredentials: ["Forensic Economist", "MBA"],
    cost: {
      range: "Fraud and tracing engagements are scoped to the number of accounts and years involved, the volume of transactions to be reconstructed, and how far the diverted funds moved. A single account and a defined scheme over a short period is the narrowest scope; multiple entities, commingled accounts, cash transactions, or funds moved through several intermediaries widen it considerably. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of bank, credit, and ledger accounts and the number of years to be reconstructed",
        "Volume of transactions and whether records are electronic or must be rebuilt from paper",
        "Number of schemes or diversion methods identified and whether each requires a separate loss calculation",
        "Distance the funds traveled through intermediaries, entities, or asset purchases before coming to rest",
        "Whether the analysis must support an insurance claim, restitution, or a civil damages claim, each with different evidentiary needs",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Fraud investigation and tracing is billed at an hourly rate for records reconstruction, transaction analysis, tracing, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the suspected conduct, the entities involved, and the period at issue, establish the retainer, and agree on the sequence of work." },
      { step: "Records and data request", description: "We request bank and credit card statements, general ledger and subledger detail, payroll and vendor files, corporate and personal tax returns, and the access and authorization records that show who controlled each account." },
      { step: "Analysis and tracing", description: "We reconstruct the funds flow, identify the transactions that fall outside authorized activity, trace the diverted funds to their destination, and quantify the loss by scheme and period." },
      { step: "Draft report and counsel review", description: "We deliver a draft with the tracing schedules, the supporting documents indexed to each transaction, and the loss by scheme, and review it with counsel before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony, support for insurance or restitution claims, and rebuttal of opposing accounting analyses." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "1 to 2 weeks" },
      { phase: "Reconstruction and tracing", duration: "4 to 8 weeks, depending on transaction volume" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "divorce-and-marital-financial-analysis",
    name: "Divorce and Marital Financial Analysis",
    shortName: "Divorce Financial Analysis",
    pillar: true,
    description: "Financial analysis for matrimonial matters: determination of income available for support when a spouse is self-employed or compensated in ways that do not appear on a pay stub, valuation of business interests in the marital estate, lifestyle analysis that documents the marital standard of living, and tracing of separate versus marital funds through accounts and assets. Each analysis is written so counsel can present it directly and the other side can test it.",
    icon: "Users",
    keywords: ["divorce financial expert", "income determination for support", "lifestyle analysis", "separate vs marital property tracing", "business valuation in divorce", "matrimonial forensic accounting"],
    caseTypes: ["divorce-and-marital-dissolution"],
    relevantCredentials: ["Forensic Economist", "MBA", "NAFE"],
    cost: {
      range: "Matrimonial engagements are scoped to the questions counsel asks and the complexity of the marital finances. A single income determination for a self-employed spouse is the narrowest scope; adding a business valuation, a lifestyle analysis, or tracing of separate property through years of commingled accounts widens the record and the work. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Which questions are engaged: income determination, business valuation, lifestyle analysis, or separate property tracing",
        "Complexity of the parties' income, including self-employment, pass-through entities, deferred compensation, and perquisites paid through a business",
        "Number of accounts and years to be reconstructed for a lifestyle or tracing analysis",
        "Whether a business interest must be valued and the quality of its financial records",
        "Degree of cooperation in producing records and whether documents must be obtained through discovery",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Matrimonial financial analysis is billed at an hourly rate for records review, reconstruction, valuation, report preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify which financial questions are at issue and the relevant dates, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We request personal and business tax returns, financial statements, bank and investment statements, compensation records, and the account history needed to trace separate and marital funds." },
      { step: "Analysis and modeling", description: "We reconstruct income available for support, value business interests under the applicable standard of value, document the marital standard of living from actual spending, and trace contested assets to their source." },
      { step: "Draft report and counsel review", description: "We deliver a draft organized by question with schedules that tie to source documents, and review it with counsel before finalizing." },
      { step: "Final report and testimony support", description: "We issue the final report and provide deposition and trial testimony, settlement conference support, and rebuttal of opposing financial analyses." },
    ],
    timeline: [
      { phase: "Retention and records intake", duration: "About 1 week" },
      { phase: "Analysis and modeling", duration: "2 to 4 weeks after records are received" },
      { phase: "Draft and final report", duration: "1 to 2 weeks after the analysis" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "expert-rebuttal-and-report-review",
    name: "Expert Rebuttal and Report Review",
    shortName: "Rebuttal",
    pillar: true,
    description: "Critique of an opposing economic damages, valuation, or forensic accounting report for plaintiff or defense counsel. The review tests the assumptions, data sources, discount rates, worklife and life expectancy inputs, growth rates, mitigation treatment, and arithmetic behind the opposing number, identifies the errors that matter, and quantifies how the conclusion changes when they are corrected. The result supports cross-examination, a rebuttal report, or a motion directed at the reliability of the opinion.",
    icon: "FileSearch",
    keywords: ["economic damages rebuttal", "rebuttal expert economist", "expert report review", "opposing expert critique", "damages report errors", "cross-examination support"],
    caseTypes: ["personal-injury", "wrongful-death", "medical-malpractice", "motor-vehicle-accident", "traumatic-brain-injury", "spinal-cord-injury", "workers-compensation", "employment-discrimination", "wrongful-termination", "commercial-contract-dispute", "partnership-and-shareholder-dispute", "divorce-and-marital-dissolution", "fraud-and-embezzlement", "product-liability"],
    relevantCredentials: ["Forensic Economist", "NAFE", "AAEFE", "MBA", "PhD"],
    cost: {
      range: "Rebuttal engagements are scoped to the length and complexity of the report under review and whether counsel needs a written rebuttal or consulting support only. A review of a single lost earnings report with a memo of findings is the narrowest scope; a valuation or lost profits report with extensive schedules, multiple opposing experts, or a full alternative calculation widens it. We provide a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Length and complexity of the opposing report and the number of schedules and data sources behind it",
        "Number of opposing experts whose opinions interact and must be reviewed together",
        "Whether counsel needs a consulting memo, a disclosed rebuttal report, or a full alternative damages calculation",
        "Availability of the opposing expert's workpapers, data, and deposition testimony",
        "Whether the critique must be quantified by recalculating the opposing model under corrected assumptions",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Rebuttal and report review is billed at an hourly rate for report and workpaper review, recalculation, findings preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Retention and conflict check", description: "We confirm conflicts, identify the reports and experts under review and the form of work product counsel needs, establish the retainer, and set the deadline." },
      { step: "Records and data request", description: "We obtain the opposing report with its schedules, workpapers, and data, the expert's deposition if taken, and the underlying case records the report relies on." },
      { step: "Analysis and review", description: "We test each assumption and source, check the arithmetic and internal consistency, compare the method to accepted practice, and recalculate the model under corrected inputs to show the effect of each error." },
      { step: "Draft findings and counsel review", description: "We deliver findings ranked by their effect on the conclusion, with proposed cross-examination areas, and review them with counsel to decide what is disclosed and what remains consulting work." },
      { step: "Rebuttal report and testimony support", description: "We issue a rebuttal report where one is disclosed and provide deposition and trial testimony, cross-examination outlines, and support for motions directed at the opinion." },
    ],
    timeline: [
      { phase: "Retention and report intake", duration: "About 1 week" },
      { phase: "Review and recalculation", duration: "1 to 3 weeks after the report and workpapers are received" },
      { phase: "Findings memo or rebuttal report", duration: "1 to 2 weeks after the review" },
      { phase: "Deposition and trial support", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "vocational-evaluation",
    name: "Vocational Assessment",
    shortName: "Vocational Assessment",
    pillar: false,
    description: "Employability, work capacity, and post-injury earning capacity opinions from our sister vocational practice. When a lost earnings analysis needs a vocational foundation for what the injured person can still do and earn, we refer that question to the vocational practice and build the economic loss on its opinion.",
    icon: "Briefcase",
    keywords: ["vocational assessment", "employability opinion", "post-injury earning capacity"],
    caseTypes: [],
    relevantCredentials: [],
    externalUrl: `${VOC_SITE_URL}/services/vocational-evaluation`,
    cost: {
      range: "Vocational work is engaged through our sister vocational practice under its own engagement agreement; a written estimate is provided once the referral questions, the records to be reviewed, and whether testimony is expected are known.",
      drivers: [
        "Whether the referral question is employability, work capacity, or post-injury earning capacity",
        "Volume of medical, educational, and employment records to be reviewed",
        "Whether an interview and testing of the injured person are required",
        "Whether the vocational opinion will be disclosed and testimony expected",
      ],
      billingStructure: "Vocational work is billed hourly under the sister practice's engagement agreement, separately from the economic analysis retainer, with the two practices coordinating on assumptions so the vocational opinion and the economic loss reconcile.",
    },
    process: [
      { step: "Referral", description: "Counsel or our economist identifies the vocational question the economic analysis depends on and refers it to the sister practice." },
      { step: "Records transfer", description: "Medical, educational, and employment records are transmitted so both practices work from the same file." },
      { step: "Vocational opinion", description: "The sister practice evaluates employability and post-injury capacity and issues its opinion." },
      { step: "Economic integration", description: "Our economist builds the lost earnings analysis on the vocational opinion and coordinates testimony so the two reports reconcile." },
    ],
    timeline: [
      { phase: "Referral and records transfer", duration: "About 1 week" },
      { phase: "Vocational opinion", duration: "As scheduled by the sister practice" },
      { phase: "Economic integration", duration: "1 to 2 weeks after the opinion is received" },
    ],
  },
  {
    slug: "life-care-planning",
    name: "Life Care Plans",
    shortName: "Life Care Plans",
    pillar: false,
    description: "Life care plans and future medical cost projections authored by our sister practice. When a matter needs a plan written rather than an existing plan valued, we refer the authorship there and then reduce the finished plan to present value.",
    icon: "HeartPulse",
    keywords: ["life care plan", "future medical cost projection", "life care plan authorship"],
    caseTypes: [],
    relevantCredentials: [],
    externalUrl: `${LCP_SITE_URL}/services/life-care-planning`,
    cost: {
      range: "Plan authorship is engaged through our sister practice under its own engagement agreement; a written estimate is provided once the injury, the volume of medical records, and the scope of future care to be projected are known.",
      drivers: [
        "Severity and complexity of the injury and the breadth of future care to be projected",
        "Volume of medical records and the number of treating providers",
        "Whether a clinical interview or home assessment is part of the plan",
        "Whether the finished plan will also be reduced to present value by our economists",
      ],
      billingStructure: "Plan authorship is billed hourly under the sister practice's engagement agreement, separately from the economic analysis retainer; the present value work that follows is billed under our own agreement, with the two practices coordinating so the plan and the valuation reconcile.",
    },
    process: [
      { step: "Referral", description: "Counsel identifies the need for an authored plan and we refer the engagement to the sister practice." },
      { step: "Records transfer", description: "Medical records and provider information are transmitted so the plan is built from the complete file." },
      { step: "Plan authorship", description: "The sister practice prepares the life care plan with item-level frequencies, durations, and unit costs." },
      { step: "Present value", description: "Our economist reduces the finished plan to present value and coordinates testimony so the plan and the valuation reconcile." },
    ],
    timeline: [
      { phase: "Referral and records transfer", duration: "About 1 week" },
      { phase: "Plan authorship", duration: "As scheduled by the sister practice" },
      { phase: "Present value analysis", duration: "1 to 2 weeks after the plan is received" },
    ],
  },
];

/** The indexable service lines. Every enumerator (pages, components, scripts) uses this. */
export function pillarServices(): Service[] {
  return services.filter((s) => s.pillar);
}

/** Direct lookup by slug; resolves non-pillar cross-sells too (ServicePillar renders them as a card). */
export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Pillar slugs only - the set of /services/:slug routes that are prerendered and in the sitemap. */
export function getAllServiceSlugs(): string[] {
  return pillarServices().map((s) => s.slug);
}
