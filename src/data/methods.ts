import type { Faq, Source } from "./types";
import { refsToSources } from "./references";

export interface Methodology {
  slug: string;
  name: string;
  summary: string;
  whenUsed: string;
  steps: string[];
  dataSources: string[];
  limitations: string;
  admissibilityHistory: string;
  relevantServices: string[];
  faqs: Faq[];
  sources: Source[];
}

// Methods are written from the economist's standpoint: what the calculation
// consists of, which records and published series drive each input, and where
// the result is sensitive. Prose is citation-free; sources render through the
// registry (refsToSources). `summary` renders as plain text on the hub, so it
// carries no link markers; the other fields render through renderTextWithLinks.
// FAQ answers render as plain text (FAQBlock) and carry no markers either.
export const methods: Methodology[] = [
  {
    slug: "present-value-and-discounting",
    name: "Present Value and Discounting",
    summary:
      "Present value converts a projected stream of future losses into the single sum that, invested today at a stated rate, would replace those losses as they come due. The economist selects a discount rate matched to the horizon, states how it interacts with the growth rate applied to the loss stream, and shows the arithmetic so the result can be reproduced.",
    whenUsed:
      "Every damages report that projects losses beyond the trial date reduces them to present value: future [[/services/lost-earnings-and-earning-capacity|lost earnings]], lost [[/services/household-services-valuation|household services]], the cost of a [[/services/life-care-plan-cost-projection|life care plan]], lost financial support in a [[/case-types/wrongful-death|wrongful death]] claim, and future [[/services/lost-profits-and-commercial-damages|lost profits]]. The step is required because an award is paid once, in present dollars, while the losses it replaces would have been received over many years.",
    steps: [
      "Build the year-by-year nominal loss stream from the underlying projection (earnings, benefits, services, care costs, or profits) over the horizon the analysis supports",
      "Select a discount rate tied to yields on low-risk instruments whose maturities match the horizon, and state the source and the date of the yield data",
      "State the growth rate already applied to the stream and confirm that growth and discount assumptions were drawn on a consistent basis, either both nominal or both real",
      "Discount each year's loss back to the valuation date and sum the results, keeping past losses (carried forward to the trial date) separate from future losses (discounted back to it)",
      "Report the present value alongside the undiscounted total and a sensitivity table showing the result across a reasonable range of rates",
      "Apply any convention the venue imposes, such as a total-offset rule or a rate fixed by the court, and say so in the report",
    ],
    dataSources: [
      "Daily Treasury par yield curve rates and historical Treasury yield series",
      "BLS Consumer Price Index for the inflation component of nominal rates",
      "BLS Employment Cost Index and wage series for the growth side of the net rate",
      "The loss stream from the underlying analysis: the earnings projection, the household services schedule, the life care plan cost tables, or the lost profits model",
    ],
    limitations:
      "The present value of a long stream is sensitive to the spread between the growth and discount rates, and small changes compound over decades. A rate chosen from a short window of unusual market conditions can overstate or understate the result, so the report should say which period the rates were drawn from and why. Present value does not resolve disputes about the underlying stream: if the earnings projection or the [[/methods/worklife-expectancy|worklife horizon]] is wrong, discounting a wrong stream correctly still yields a wrong number.",
    admissibilityHistory:
      "Reduction of future losses to present value is a long-accepted step in federal and state courts, and the Supreme Court has treated the choice among discounting approaches as a matter for the trier of fact provided the economist explains the assumptions. Challenges usually target inputs rather than the method: an unexplained rate, a growth rate inconsistent with the discount rate, or a failure to follow a venue's stated convention. Some jurisdictions direct a total-offset approach by case law, under which growth and discounting are assumed to cancel; the [[/compare/net-vs-gross-discount-rate|net versus gross discount rate]] comparison explains the alternatives.",
    relevantServices: [
      "lost-earnings-and-earning-capacity",
      "wrongful-death-economic-loss",
      "life-care-plan-cost-projection",
      "lost-profits-and-commercial-damages",
    ],
    faqs: [
      {
        question: "Why does a lower discount rate produce a larger present value?",
        answer:
          "A lower rate assumes the award will earn less when invested, so a larger sum is needed today to fund the same future losses. The relationship is mechanical, which is why the source and the period of the rate matter more than the rate itself.",
      },
      {
        question: "Is the discount rate the same for lost earnings and for future medical costs?",
        answer:
          "The discount rate reflects the return on the invested award and does not change with the type of loss. What changes is the growth rate applied to each stream: wages, household replacement costs, and medical costs grow at different rates, so the net rate differs by category even when the discount rate is the same.",
      },
      {
        question: "Does the economist discount past losses?",
        answer:
          "No. Losses that accrued before trial are stated in the dollars of the years in which they occurred and, where the governing framework allows, carried forward with interest to the trial date. Discounting applies only to losses that occur after the award.",
      },
    ],
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "KACZKOWSKI_V_BOLUBASZ", "TREASURY_YIELD", "BLS_CPI", "BLS_ECI"]),
  },
  {
    slug: "worklife-expectancy",
    name: "Worklife Expectancy",
    summary:
      "Worklife expectancy is the number of additional years a person of a given age, sex, education, and labor force status is expected to be employed or actively seeking work over the rest of a lifetime. It sets the horizon for a lost earnings projection and is drawn from published tables built on labor force transition data rather than from an assumed retirement age.",
    whenUsed:
      "Worklife expectancy bounds every projection of future earnings: [[/services/lost-earnings-and-earning-capacity|lost earnings and earning capacity]] in injury matters, the decedent's earnings in [[/services/wrongful-death-economic-loss|wrongful death]] claims, and the front-pay or lost-career horizon in [[/services/employment-and-wage-loss-damages|employment matters]]. It also informs the period over which fringe benefits accrue and the age at which retirement income would have begun.",
    steps: [
      "Record the person's age at the valuation date, sex, highest level of education completed, and labor force status immediately before the event",
      "Select the published worklife table that matches those characteristics and read the expected additional years of labor force activity",
      "Decide whether to apply the expectancy as a single figure or to model the year-by-year probabilities of being active, which spreads expected earnings over the full horizon rather than truncating at a fixed age",
      "Consider case-specific evidence of a different horizon, such as a documented retirement plan, a mandatory retirement age in the occupation, or a medical opinion on reduced life expectancy, and state how it was used",
      "Apply the same horizon to earnings, benefits, and any offsetting post-event earnings so the two sides of the comparison are measured over the same period",
    ],
    dataSources: [
      "Published worklife expectancy tables derived from the Markov process model of labor force activity",
      "BLS Current Population Survey data on labor force participation by age, sex, and education",
      "Occupation-specific retirement provisions and pension plan documents in the record",
      "Current United States life tables where the projection is limited by life expectancy rather than by labor force activity",
    ],
    limitations:
      "Worklife tables describe population averages. They do not know that a particular person intended to work to seventy, that a particular occupation is physically demanding, or that a particular employer offers early retirement. Those facts belong in the record, and the report should say whether and how they moved the horizon away from the table. Tables are also updated periodically, so a projection should identify the edition used.",
    admissibilityHistory:
      "Published worklife tables have been used in damages testimony for decades and are the standard reference in the forensic economics literature; courts rarely exclude an earnings projection for relying on them. Disputes concern the choice between a fixed horizon and a probability-weighted one, whether the pre-event labor force status was characterized correctly, and whether an economist departed from the table without a documented basis. The [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] describes how the horizon fits into the full calculation.",
    relevantServices: ["lost-earnings-and-earning-capacity", "wrongful-death-economic-loss", "employment-and-wage-loss-damages"],
    faqs: [
      {
        question: "Is worklife expectancy the same as retirement age?",
        answer:
          "No. Retirement age is a single assumed stopping point. Worklife expectancy is an expected number of years of labor force activity that already reflects the probability of periods out of the labor force, whether from unemployment, illness, caregiving, or early retirement, and the probability of working past a conventional retirement age.",
      },
      {
        question: "Does an injury change worklife expectancy?",
        answer:
          "The published tables describe the pre-event population. Where the record supports a reduced post-event worklife, for example a medical opinion that the person will leave the labor force earlier than expected, the economist models that reduction explicitly and explains its basis rather than adjusting the table silently.",
      },
      {
        question: "What does the economist do when the person was not working at the time of the event?",
        answer:
          "Tables are stratified by labor force status, so an inactive person has a lower expected worklife than an active one of the same age and education. The report states which status was used and why, and where the person was between jobs or on leave, the record on the intent to return to work is discussed.",
      },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_CPS", "NCHS_LIFE_TABLES"]),
  },
  {
    slug: "wage-growth-and-earnings-projection",
    name: "Wage Growth and Earnings Projection",
    summary:
      "An earnings projection starts from a documented earnings base and carries it forward over the worklife horizon with a growth rate that reflects general wage inflation, the person's stage of career, and any documented promotions or credentials. The projection is stated year by year so the growth assumption can be seen and tested rather than buried in a single multiplier.",
    whenUsed:
      "The projection is the core of every [[/services/lost-earnings-and-earning-capacity|lost earnings analysis]] and of the earnings component in [[/services/wrongful-death-economic-loss|wrongful death]] and [[/services/employment-and-wage-loss-damages|employment]] matters. It is built twice: once for the earnings the person would have received but for the event, and once for the earnings the person can now expect, with the difference forming the loss.",
    steps: [
      "Establish the earnings base from tax returns, W-2 and 1099 forms, pay records, and employer statements, typically over several years to smooth unusual periods",
      "Separate base wages from overtime, bonuses, commissions, and self-employment income, and decide which components the record supports carrying forward",
      "Select a growth rate: general wage growth from published series, an age-earnings profile where the person was early in a career, or an occupation-specific path where the record documents it",
      "Project the but-for earnings year by year over the worklife horizon, then project post-event earnings on the same basis using the vocational and medical evidence in the record",
      "Add fringe benefits to both streams, subtract post-event earnings from but-for earnings, and carry the resulting annual loss into the present value calculation",
    ],
    dataSources: [
      "The person's tax returns, W-2 and 1099 forms, pay stubs, and employer compensation records",
      "BLS Employment Cost Index and Current Population Survey earnings series for general wage growth",
      "BLS Occupational Employment and Wage Statistics for occupational wage levels by area when the history is short or the career had not begun",
      "Census American Community Survey earnings by education, age, and occupation for age-earnings profiles",
    ],
    limitations:
      "The projection is only as good as the base. A single high or low year, an undocumented promise of promotion, or self-employment income that mixes the owner's labor with a return on capital can distort the result, and each should be addressed in the report. Growth rates drawn from a short historical window can embed unusual inflation. The longer the horizon, the more the choice of growth rate matters, so the report should show the sensitivity.",
    admissibilityHistory:
      "Earnings projections grounded in the person's own records and published wage series are routinely admitted. Exclusions tend to follow projections that assume a career path the record does not support, that apply a growth rate inconsistent with the discount rate, or that ignore documented post-event earnings. The [[/compare/lost-earnings-vs-lost-earning-capacity|lost earnings versus lost earning capacity]] comparison explains when the projection measures a capacity rather than an actual earnings history.",
    relevantServices: ["lost-earnings-and-earning-capacity", "wrongful-death-economic-loss", "employment-and-wage-loss-damages"],
    faqs: [
      {
        question: "How many years of earnings history does the economist need?",
        answer:
          "Usually three to five years of tax returns and pay records, and more where earnings were irregular. A short history is supplemented with occupational wage data for the work the person was doing or was trained to do.",
      },
      {
        question: "Are bonuses and overtime included?",
        answer:
          "They are included where the record shows they were a regular part of compensation rather than a one-time event. The report states which components were carried forward and at what level.",
      },
      {
        question: "How is a young person with no earnings history projected?",
        answer:
          "From the educational path the record supports and published earnings by education and age, which describe how earnings typically rise over a career. The report identifies the assumptions about education and occupation and shows the result under alternatives where the record leaves the path open.",
      },
    ],
    sources: refsToSources(["BLS_ECI", "BLS_CPS", "BLS_OES", "CENSUS_ACS"]),
  },
  {
    slug: "fringe-benefits-valuation",
    name: "Fringe Benefits Valuation",
    summary:
      "Fringe benefits are the part of compensation paid in something other than wages: employer contributions to health insurance and retirement plans, legally required payroll contributions, paid leave, and similar items. The economist values the benefits the person actually received or would have received and adds them to the earnings projection, so that lost compensation is measured as a whole.",
    whenUsed:
      "Fringe benefits are part of every [[/services/lost-earnings-and-earning-capacity|lost earnings]] and [[/services/wrongful-death-economic-loss|wrongful death]] analysis where the person was employed, and of [[/services/employment-and-wage-loss-damages|employment damages]] where a termination ended benefit coverage. They matter most where the employer's contribution to health and retirement plans was large relative to wages, as in public-sector, union, and long-tenure private employment.",
    steps: [
      "Identify the benefits the person received from employer benefit statements, plan documents, collective bargaining agreements, and pay records, and separate them from benefits paid by the employee",
      "Value each benefit at the employer's cost or, for a defined benefit pension, at the value of the accrued and projected benefit, rather than at a generic percentage where records exist",
      "Where records are unavailable, apply published employer cost data for the industry, occupation, and region, and state that a published rate was used",
      "Determine which benefits continue post-event, such as coverage under a spouse's plan or a replacement employer's plan, and net them against the but-for benefits",
      "Carry the benefit stream forward with the earnings projection over the same horizon and reduce it to present value with the rest of the loss",
    ],
    dataSources: [
      "Employer benefit statements, summary plan descriptions, and pension plan documents",
      "BLS Employer Costs for Employee Compensation, which reports employer benefit costs as a share of compensation by industry, occupation, and region",
      "Collective bargaining agreements and public employer benefit schedules",
      "Social Security earnings records and pension benefit estimates in the record",
    ],
    limitations:
      "A published average benefit rate is a fallback, not a substitute for the person's own plan documents, and applying it to a person who received few benefits overstates the loss. Health insurance is valued at the employer's cost, which is not the same as the cost of replacing coverage individually; the report should say which measure was used and why. Pension losses depend on plan terms and vesting, and a defined benefit plan requires a separate calculation rather than a percentage add-on.",
    admissibilityHistory:
      "Inclusion of fringe benefits in lost compensation is well established. Challenges typically argue that a benefit was double counted, for example a retirement contribution added to wages that already included it, or that a published rate was applied where plan documents were available. A report that lists each benefit, its source, and its value item by item is positioned to meet those arguments, and the [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] shows where benefits sit in the calculation.",
    relevantServices: ["lost-earnings-and-earning-capacity", "wrongful-death-economic-loss", "employment-and-wage-loss-damages"],
    faqs: [
      {
        question: "Are legally required benefits such as the employer's Social Security contribution included?",
        answer:
          "Practice varies and the report states the approach. Many economists include the employer share of Social Security and Medicare taxes because it funds a benefit the person would have received; others treat it separately. Either way the treatment is disclosed so it can be tested.",
      },
      {
        question: "What if the person's employer did not offer benefits?",
        answer:
          "Then the but-for benefit stream is small or zero and the report says so. Benefits are valued as the person actually received them, not as an average worker might have.",
      },
      {
        question: "How are lost pension benefits valued?",
        answer:
          "For a defined contribution plan, as the employer contributions that would have been made plus their expected growth. For a defined benefit plan, as the difference between the pension the person would have received under the but-for career and the pension now expected, discounted to present value from the date each payment would have begun.",
      },
    ],
    sources: refsToSources(["BLS_ECEC", "BLS_CPS"]),
  },
  {
    slug: "household-services-methodology",
    name: "Household Services Methodology",
    summary:
      "Household services are the unpaid work a person performs for the household: cooking, cleaning, shopping, home and yard maintenance, household management, transportation, and care of children or other family members. The economist measures the hours the person can no longer perform, or that a decedent would have performed, and values them at the cost of replacing that work with paid labor in the local market.",
    whenUsed:
      "Household services are claimed in [[/services/personal-injury-economic-damages|personal injury]] matters when an injury reduces the person's capacity for household work, and in [[/services/wrongful-death-economic-loss|wrongful death]] matters for the services the decedent would have provided to the surviving household. The [[/services/household-services-valuation|household services valuation]] is often the largest component when the person was a full-time homemaker or a caregiver.",
    steps: [
      "Establish the person's pre-event hours by task from the household's own account, corroborated by time-use survey data for people of the same sex, age, employment status, and household composition",
      "Determine the post-event capacity for each task from the medical and functional evidence, and compute the lost hours as the difference",
      "Select replacement wage rates for each task category from occupational wage data for the area where the household lives, such as cooks, housekeepers, childcare workers, and grounds maintenance workers",
      "Adjust the projection for changes in the household over time, such as children reaching adulthood, and for the age-related decline in hours reflected in the time-use data",
      "Carry the annual value forward over the appropriate horizon and reduce it to present value with the rest of the loss",
    ],
    dataSources: [
      "BLS American Time Use Survey for hours by task, sex, age, employment status, and presence of children",
      "BLS Occupational Employment and Wage Statistics for replacement wage rates by occupation and metropolitan area",
      "The household's own account of who performed which tasks, and any care schedules or invoices for hired help in the file",
      "Current United States life tables for the horizon in wrongful death and lifetime-injury projections",
    ],
    limitations:
      "Time-use data describe averages for demographic groups; a household in which one person did far more or far less than average must be documented from the record. Replacement cost values the work at what it would cost to hire it out, which is the standard approach but not the only one, and the report should identify the approach used. Care of a family member with special needs can exceed anything the survey captures and is documented separately.",
    admissibilityHistory:
      "Replacement cost valuation of household services using time-use and occupational wage data is the mainstream approach in the forensic economics literature and is regularly admitted. Contested points are the hours assumed, whether the person actually performed the tasks before the event, and whether the horizon is life expectancy or a shorter period. The [[/guides/household-services-in-personal-injury|household services guide]] describes the records that support each input.",
    relevantServices: ["household-services-valuation", "wrongful-death-economic-loss", "personal-injury-economic-damages"],
    faqs: [
      {
        question: "Does the household have to have hired someone to recover household services?",
        answer:
          "No. The loss is the value of the services no longer performed, measured at what it would cost to replace them, whether or not the household has actually paid for replacement. Where the household has hired help, those invoices corroborate both the hours and the rate.",
      },
      {
        question: "Are household services valued for a person who worked full time outside the home?",
        answer:
          "Yes. Employed people perform fewer household hours on average than people not in the labor force, and the time-use data reflect that difference, but the hours are rarely zero. The projection uses the hours for the person's actual employment status.",
      },
      {
        question: "How does the analysis treat a partial loss of capacity?",
        answer:
          "By task. A person may still cook but no longer be able to do yard work or lift a child. The lost hours are computed for each task category from the functional evidence, so the total reflects what the person actually can and cannot do.",
      },
    ],
    sources: refsToSources(["BLS_ATUS", "BLS_OES", "NCHS_LIFE_TABLES"]),
  },
  {
    slug: "business-valuation-approaches",
    name: "Business Valuation Approaches",
    summary:
      "A business interest is valued under three recognized approaches: the income approach, which converts expected future cash flows into a present value; the market approach, which draws on prices paid for comparable companies or interests; and the asset approach, which values the company's assets net of its liabilities. The valuator applies the approaches that fit the company, reconciles the indications, and states the standard of value and the valuation date.",
    whenUsed:
      "[[/services/business-valuation|Business valuation]] is required in [[/case-types/partnership-and-shareholder-dispute|shareholder and partnership disputes]], in [[/case-types/divorce-and-marital-dissolution|divorce]] where a business interest is marital property, in buy-sell disputes, and in damages matters where a business was destroyed rather than merely interrupted. The approach chosen depends on the company's stage, its earnings history, and the availability of comparable transactions.",
    steps: [
      "Define the engagement: the interest being valued, the valuation date, the standard of value the governing framework requires, and the premise of value, going concern or liquidation",
      "Normalize the historical financial statements by removing non-recurring items, adjusting owner compensation to a market level, and separating non-operating assets",
      "Apply the income approach by projecting cash flows or capitalizing a normalized earnings level, with a discount or capitalization rate built from the company's risk profile",
      "Apply the market approach where comparable transaction or guideline company data exist, and explain the adjustments made for size, growth, and risk",
      "Apply the asset approach where the company's value rests mainly in its assets, or as a floor, and reconcile all indications into a conclusion with stated weights",
      "Consider discounts or premiums for lack of control and lack of marketability where the standard of value and the interest being valued call for them, and document the basis",
    ],
    dataSources: [
      "The company's financial statements, tax returns, general ledger, and budgets",
      "Guideline transaction databases and public company financial data for the market approach",
      "Published cost-of-capital data and Treasury yields for building discount rates",
      "Professional valuation standards from the AICPA and NACVA, which prescribe the engagement definition, the approaches, and the report content",
    ],
    limitations:
      "Valuation conclusions are sensitive to normalization adjustments, the discount rate, and the treatment of owner compensation, and two valuators can reach different conclusions from the same statements. The standard of value changes the answer: fair market value, fair value, and investment value can diverge materially for the same interest. Discounts for lack of control and marketability are the most litigated inputs and must be tied to the interest actually being valued.",
    admissibilityHistory:
      "The three approaches are recognized in professional standards and in the courts, and a valuation that follows the published standards and explains its choices is generally admitted. Exclusions follow valuations that apply a standard of value the governing framework does not use, that rely on projections with no support in the company's history, or that apply discounts by rote. The [[/compare/fair-market-value-vs-fair-value|fair market value versus fair value]] comparison explains the standard-of-value question.",
    relevantServices: ["business-valuation", "divorce-and-marital-financial-analysis", "lost-profits-and-commercial-damages"],
    faqs: [
      {
        question: "Which approach is the right one?",
        answer:
          "Usually more than one is applied and the results are reconciled. An established company with steady earnings supports the income approach; a company with active comparable transactions supports the market approach; a holding company or a business being liquidated points to the asset approach. The report explains why each was or was not used.",
      },
      {
        question: "What is a normalization adjustment?",
        answer:
          "A change to the reported financial statements to show the company's sustainable earning power: removing one-time gains or losses, restating owner salary to what an outside manager would be paid, and separating personal expenses run through the business. Each adjustment is listed and explained.",
      },
      {
        question: "How does the valuation date affect the result?",
        answer:
          "Value is measured as of a specific date using what was known or knowable then. Events after that date are generally not considered unless the governing framework directs otherwise, so the choice of date, often set by the framework or agreed by the parties, can change the conclusion.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD"]),
  },
  {
    slug: "lost-profits-but-for-analysis",
    name: "Lost Profits and But-For Analysis",
    summary:
      "Lost profits measure the difference between the profits a business would have earned had the wrongful act not occurred and the profits it actually earned or will earn. The economist builds the but-for scenario from the company's own history, its market, and the terms of the disrupted relationship, subtracts actual results and avoided costs, and reduces future losses to present value.",
    whenUsed:
      "Lost profits are the usual measure in [[/case-types/commercial-contract-dispute|contract disputes]], business interruption claims, and cases in which a business was harmed but continues to operate. Where the business was destroyed, the measure may shift to lost business value, as the [[/guides/lost-profits-vs-lost-business-value|lost profits versus lost business value]] guide explains. The [[/services/lost-profits-and-commercial-damages|lost profits service]] covers both.",
    steps: [
      "Define the loss period from the date of the wrongful act to the date the business recovered, or would have recovered, or to the end of the disrupted relationship",
      "Establish but-for revenue using a before-and-after comparison, a yardstick comparison to similar businesses or markets unaffected by the act, or the projections the parties themselves relied on before the dispute",
      "Deduct the costs the business avoided by not earning the lost revenue, so that the loss is measured in profits rather than sales, and distinguish fixed costs from variable costs",
      "Account for mitigation: what the business did or reasonably could have done to replace the lost business, and any profits it earned as a result",
      "Test causation for each component of the loss against other events in the period, such as market changes, competition, or management decisions, and exclude losses with other causes",
      "Reduce future lost profits to present value at a rate that reflects the risk of the projected profits, and state the basis for the rate",
    ],
    dataSources: [
      "The company's financial statements, sales records, contracts, and budgets before and after the event",
      "Industry and market data for the yardstick comparison and for testing causation",
      "Correspondence, forecasts, and business plans prepared before the dispute",
      "Treasury yields and published cost-of-capital data for the discount rate",
    ],
    limitations:
      "Lost profits for a new or unestablished business rest on projections without a track record and face a higher bar of proof; the report must show the basis for each projection. The but-for scenario is a counterfactual, and a projection that ignores the ordinary risks the business faced overstates the loss. Fixed and variable cost classification drives the result and should be documented from the company's own accounting rather than assumed.",
    admissibilityHistory:
      "Lost profits methodology using before-and-after and yardstick approaches is well established in commercial litigation. Reports are excluded when the projection has no foundation in the company's history or market, when avoided costs are not deducted, or when the expert assumes causation rather than analyzing it. Reasonable certainty is the standard most jurisdictions apply to the fact of loss, with more latitude on the amount once the fact is shown.",
    relevantServices: ["lost-profits-and-commercial-damages", "business-valuation", "expert-rebuttal-and-report-review"],
    faqs: [
      {
        question: "What is the difference between lost revenue and lost profits?",
        answer:
          "Lost revenue is the sales the business did not make. Lost profits deduct the costs the business would have incurred to make those sales but avoided. Damages are measured in lost profits, which is why the cost analysis matters as much as the revenue projection.",
      },
      {
        question: "How long can the loss period be?",
        answer:
          "As long as the effect of the wrongful act lasts, which may be the remaining term of a contract, the time needed to rebuild a customer base, or, where the business never recovers, an indefinite period that is usually better handled as lost business value. The report explains the basis for the period chosen.",
      },
      {
        question: "Can a start-up recover lost profits?",
        answer:
          "In many jurisdictions, yes, if the projections rest on evidence such as signed contracts, comparable businesses, or the performance of the business before the event. The analysis is more demanding and the report addresses the risks the business faced directly.",
      },
    ],
    sources: refsToSources(["TREASURY_YIELD", "AAEFE_JLE", "NAFE_JFE"]),
  },
  {
    slug: "mitigation-and-offsets",
    name: "Mitigation and Offsets",
    summary:
      "Mitigation and offsets are the deductions that turn a gross loss into a net loss: the earnings the person has earned or can reasonably earn after the event, the profits a business recovered, and, where the governing framework directs, collateral payments such as disability benefits, personal consumption in a death claim, or income taxes. The economist applies each deduction explicitly and separately so counsel can include or exclude it as the law requires.",
    whenUsed:
      "Every damages calculation involves at least one offset. Post-event earnings are netted in [[/services/lost-earnings-and-earning-capacity|lost earnings]] and [[/services/employment-and-wage-loss-damages|employment]] matters; personal consumption is deducted in [[/services/wrongful-death-economic-loss|wrongful death]] claims; replacement business is netted in [[/services/lost-profits-and-commercial-damages|lost profits]]; and the treatment of insurance, benefits, and taxes follows the venue's collateral source and tax rules as the [[/guides/collateral-source-rule-explained|collateral source guide]] explains.",
    steps: [
      "Identify post-event earnings from tax returns and pay records and, where the person is not yet working, the earnings the vocational and medical evidence supports over the post-event horizon",
      "Project post-event earnings and benefits on the same basis as but-for earnings, with the same growth assumptions and the same worklife horizon, and net the two streams year by year",
      "In a death claim, apply a personal consumption deduction derived from household expenditure data for a household of the same size and income, and state the percentage and its source",
      "Catalog collateral payments in the record, such as disability benefits, workers' compensation, and insurance, and present them separately so counsel can apply the venue's collateral source rule",
      "Where the venue requires after-tax damages, compute the tax on but-for and post-event earnings using the person's filing status and the applicable rates, and present both gross and net figures",
      "Document each offset in its own schedule so the trier of fact can see the gross loss, each deduction, and the net result",
    ],
    dataSources: [
      "Post-event tax returns, pay records, and benefit statements",
      "BLS Consumer Expenditure Surveys for personal consumption shares by household size and income",
      "Disability, workers' compensation, and insurance benefit records in the file",
      "Federal and state tax rate schedules for after-tax presentations where required",
    ],
    limitations:
      "Mitigation is a legal concept as well as an economic one: whether a person was required to accept particular work, or a business to take particular steps, is for counsel and the trier of fact, and the economist's role is to quantify the alternatives. Personal consumption percentages vary by method and data source, and the report should show the result under the alternatives when the deduction is contested. Collateral source and tax treatment differ by venue, so the report presents each offset separately rather than folding it into a single number.",
    admissibilityHistory:
      "Netting post-event earnings and deducting personal consumption in death claims are standard components of a damages calculation and are routinely admitted. Disputes arise over whether the post-event earnings assumed are supported by the vocational and medical evidence, over the consumption percentage, and over whether a deduction the venue prohibits was taken. A report that keeps every offset visible and separate is the practical safeguard.",
    relevantServices: [
      "lost-earnings-and-earning-capacity",
      "wrongful-death-economic-loss",
      "employment-and-wage-loss-damages",
      "lost-profits-and-commercial-damages",
    ],
    faqs: [
      {
        question: "Does the economist decide whether the plaintiff mitigated adequately?",
        answer:
          "No. The economist quantifies the post-event earnings the evidence supports and, where the parties dispute what the person could have earned, presents the loss under each version. Whether the person's efforts were reasonable is a question for the trier of fact.",
      },
      {
        question: "What is a personal consumption deduction?",
        answer:
          "The share of a decedent's income that the decedent would have spent on personal needs rather than on the household. It is deducted in a wrongful death claim because the survivors' loss is the support they would have received, not the decedent's gross income. The percentage comes from household expenditure data and depends on household size and income.",
      },
      {
        question: "Are damages calculated before or after taxes?",
        answer:
          "It depends on the venue and the claim. Some frameworks require after-tax figures, some prohibit tax evidence, and some leave it to the court. The report presents the figures the governing framework requires and, where that is unsettled, both.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "RESTATEMENT_TORTS_920A", "BLS_CPS"]),
  },
];

export function getMethod(slug: string): Methodology | undefined {
  return methods.find((m) => m.slug === slug);
}
