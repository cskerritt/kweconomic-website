import type { Faq, Source } from "./types";
import { refsToSources } from "./references";

export interface Methodology {
  slug: string;
  name: string;
  /** Team member slug for the AuthorByline and the Article author node. */
  authorSlug: string;
  /** ISO dates for the byline and the Article datePublished/dateModified. */
  datePublished: string;
  dateModified: string;
  /** Written meta description (110-160 chars, a complete sentence); never an auto-cut of `summary`. */
  metaDescription: string;
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
// Each entry keeps `slug` then `name` on consecutive lines (scripts/prerender.mjs
// zips the two positionally); the byline and meta fields follow `name`. FAQ
// pairs must not restate a sibling guide's FAQ (src/data/editorial.test.ts
// caps the token overlap), so the method side answers with the mechanics.
export const methods: Methodology[] = [
  {
    slug: "present-value-and-discounting",
    name: "Present Value and Discounting",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-05",
    metaDescription: "Present value reduces future losses to one sum: personal-loss streams discounted at low-risk yields, lost-profits streams at a rate reflecting their risk.",
    summary:
      "Present value converts a projected stream of future losses into the single sum that, invested today at a stated rate, would replace those losses as they come due. The economist selects a discount rate matched to the horizon and to the kind of stream being valued, states how it interacts with the growth rate applied to the loss stream, and shows the arithmetic so the result can be reproduced.",
    whenUsed:
      "Every damages report that projects losses beyond the trial date reduces them to present value: future [[/services/lost-earnings-and-earning-capacity|lost earnings]], lost [[/services/household-services-valuation|household services]], the cost of a [[/services/life-care-plan-cost-projection|life care plan]], lost financial support in a [[/case-types/wrongful-death|wrongful death]] claim, and future [[/services/lost-profits-and-commercial-damages|lost profits]]. The step is required because an award is paid once, in present dollars, while the losses it replaces would have been received over many years.",
    steps: [
      "Build the year-by-year nominal loss stream from the underlying projection (earnings, benefits, services, care costs, or profits) over the horizon the analysis supports",
      "For a personal-loss stream (earnings, fringe benefits, household services, lost support, and care costs), select a discount rate tied to yields on low-risk instruments whose maturities match the horizon, because the award replaces amounts the person would have received with reasonable certainty, and state the source and the date of the yield data",
      "For a commercial lost-profits stream, select a rate that reflects the risk of the projected profits, built up from a low-risk base rate plus the equity, size, and company-specific premia the published cost-of-capital data support, or drawn from the company's weighted average cost of capital, so that a projection carrying business risk is not valued as if it were certain, and state the basis for the rate",
      "State the growth rate already applied to the stream and confirm that growth and discount assumptions were drawn on a consistent basis, either both nominal or both real",
      "Discount each year's loss back to the valuation date and sum the results, keeping past losses (carried forward to the trial date) separate from future losses (discounted back to it)",
      "Report the present value alongside the undiscounted total and a sensitivity table showing the result across a reasonable range of rates",
      "Apply any convention the venue imposes, such as a total-offset rule or a rate fixed by the court, and say so in the report",
    ],
    dataSources: [
      "Daily Treasury par yield curve rates and historical Treasury yield series",
      "BLS Consumer Price Index for the inflation component of nominal rates",
      "BLS Employment Cost Index and wage series for the growth side of the net rate",
      "Published equity risk premium, size premium, and cost-of-capital data for the rate applied to a lost-profits stream",
      "The loss stream from the underlying analysis: the earnings projection, the household services schedule, the life care plan cost tables, or the lost profits model",
    ],
    limitations:
      "The present value of a long stream is sensitive to the spread between the growth and discount rates, and small changes compound over decades. A rate chosen from a short window of unusual market conditions can overstate or understate the result, so the report should say which period the rates were drawn from and why. Present value does not resolve disputes about the underlying stream: if the earnings projection or the [[/methods/worklife-expectancy|worklife horizon]] is wrong, discounting a wrong stream correctly still yields a wrong number. The rate convention also has to match the stream: a low-risk yield applied to a commercial lost-profits projection treats an uncertain profit stream as if it were as certain as wages and overstates the loss, while a risk-adjusted rate applied to a personal earnings stream understates it, so the report says which convention it follows and why.",
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
          "Within a personal-loss claim, yes: the discount rate reflects the return on the safely invested award and does not change between the earnings, household services, and medical cost streams. What changes is the growth rate applied to each stream, since wages, household replacement costs, and medical costs grow at different rates, so the net rate differs by category even when the discount rate is the same. A commercial lost-profits stream is the exception: it is discounted at a rate that reflects the risk of the projected profits rather than at the low-risk yield.",
      },
      {
        question: "Does the economist discount past losses?",
        answer:
          "Discounting runs from the trial date forward only. Losses that accrued between the event and trial are tabulated year by year in the dollars of each year, and where the governing framework allows, prejudgment interest carries them forward to the trial date on a separate line, so the two adjustments are never confused.",
      },
    ],
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "KACZKOWSKI_V_BOLUBASZ", "TREASURY_YIELD", "BLS_CPI", "BLS_ECI"]),
  },
  {
    slug: "worklife-expectancy",
    name: "Worklife Expectancy",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    metaDescription: "Worklife expectancy is the expected years of labor force activity for a person's age, sex, education, and status, from published tables, not a retirement age.",
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
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    metaDescription: "An earnings projection carries a documented base forward year by year at a stated growth rate over the worklife horizon, for the but-for and post-event streams.",
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
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    metaDescription: "Fringe benefits are valued at the employer's cost from plan documents, or from published employer cost data where none exist, and added to the earnings streams.",
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
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    metaDescription: "Household services are valued as lost hours by task, from the household's account and time-use data, at local replacement wages, projected over life expectancy.",
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
        question: "Is the household services loss measured by what the household actually paid for help?",
        answer:
          "The measure is replacement cost rather than out-of-pocket cost: the lost hours in each task category are multiplied by the local wage of the occupation that would perform that task, whether or not anyone was hired. Where help was hired, the invoices enter the analysis as evidence of the hours and the rate, not as the measure itself.",
      },
      {
        question: "How does the time-use data treat a person who was employed full time?",
        answer:
          "The time-use tables report hours separately by employment status, so the projection for an employed person starts from the hours reported for employed people of the same sex and age, which run below the figures for people outside the labor force but rarely reach zero. The household's own account then corroborates or adjusts the table figure task by task.",
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
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    metaDescription: "A business interest is valued under the income, market, and asset approaches, reconciled to one conclusion under a stated standard of value and valuation date.",
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
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-08-27",
    metaDescription: "Lost profits are but-for profits minus actual profits over a loss period, net of avoided costs and mitigation, tested for causation, and discounted for risk.",
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
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    metaDescription: "Offsets turn a gross loss into a net loss: post-event earnings, personal consumption in a death claim, collateral payments, and taxes, each on its own schedule.",
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
        question: "How are after-tax damages computed when the venue requires them?",
        answer:
          "Where the venue requires after-tax figures, the economist computes tax on both the but-for and post-event streams from the person's filing status and presents gross and net figures side by side so the effect of the adjustment is visible. Where the venue prohibits tax evidence, gross figures are presented alone.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "RESTATEMENT_TORTS_920A", "BLS_CPS"]),
  },
  {
    slug: "personal-consumption-tables",
    name: "Personal Consumption Deduction",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-07",
    dateModified: "2026-09-07",
    metaDescription: "The personal consumption deduction removes the share of income a decedent would have spent on personal needs, read from expenditure tables by household size.",
    summary:
      "A decedent would have spent part of the household's income on personal needs, and the survivors' loss of support excludes that share. The personal consumption deduction is the percentage of income the decedent would have consumed personally, read from published tables built on household expenditure data and stratified by household size and income, applied to the projected earnings in a wrongful death claim, and stated with its source so the percentage can be tested.",
    whenUsed:
      "The deduction is taken whenever a claim measures the support survivors lost rather than the decedent's own earnings: the earnings component of a [[/services/wrongful-death-economic-loss|wrongful death economic loss]] analysis, the lost financial support in a [[/case-types/wrongful-death|wrongful death]] case whatever its cause, and the survivors' share of a self-employed decedent's income once the owner's labor has been separated from the return on the business. A survival claim that measures the decedent's own lost earnings between injury and death may not take it, and the [[/guides/wrongful-death-damages-explained|wrongful death guide]] explains which components each framework recovers.",
    steps: [
      "Establish the household on the date of death: the number of members, their ages, and the household's total income from all earners, from the tax returns and the family's account",
      "Select the published personal consumption table that matches the decedent's role, and read the percentage for a household of that size at that income level; the tables report consumption as a share of the decedent's own income or of household income, and the report says which basis it used",
      "Decide what the percentage is applied to: the decedent's projected earnings and benefits alone, or the decedent's earnings within the household's combined income, and keep the basis consistent with the table",
      "Apply the percentage year by year to the projected earnings, adjusting it where the household's composition changes over the projection, for example when a child reaches majority and the household becomes smaller",
      "Leave household services, retirement income shared with a spouse, and the value of guidance and care outside the deduction unless the governing framework directs otherwise, and say so",
      "Present the net support figure alongside the gross earnings figure and the percentage, with a sensitivity line for the alternative percentage the other side is likely to argue",
    ],
    dataSources: [
      "Published personal consumption tables derived from the BLS Consumer Expenditure Surveys, stratified by household size and income",
      "The household's tax returns, for the income level and the number of earners",
      "The family's account of household composition on the date of death and the ages of dependents",
      "Current United States life tables, for the horizon over which support to a spouse runs",
    ],
    limitations:
      "The tables describe how an average household of a given size and income divides its spending, not how this household did. A decedent with unusual personal expenses, or one who spent very little on personal needs, is an argument from the record, and the report presents the table figure and explains any departure rather than substituting an undocumented percentage. The percentage also depends on the basis: a share of the decedent's own income and a share of the household's combined income are different numbers, and applying one basis's percentage to the other basis's income is the most common error in the deduction. Because the percentage scales the entire earnings figure, a difference of a few points moves the total materially, so the [[/methods/present-value-and-discounting|present value]] schedule should show the result under the contested alternatives.",
    admissibilityHistory:
      "Courts have long recognized that the survivors' loss of support is the decedent's income less what the decedent would have consumed, and a wrongful death projection with no deduction is a recurring ground for challenge. Disputes concern the size of the percentage, the table and edition used, whether the basis matched the income it was applied to, and whether household services were wrongly reduced along with earnings. A report that names the table, states the household size and income it read, and shows the alternative percentage is positioned to be examined on the merits, and the [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] lists the questions an opposing economist will ask.",
    relevantServices: ["wrongful-death-economic-loss", "lost-earnings-and-earning-capacity", "expert-rebuttal-and-report-review"],
    faqs: [
      {
        question: "Is personal consumption deducted from household services too?",
        answer:
          "No. Household services are valued at the cost of replacing the work the decedent did for others in the household, and the decedent's own consumption of those services is already excluded by the way the hours are counted. The deduction applies to the earnings the decedent would have shared, not to the services.",
      },
      {
        question: "Why is the deduction a smaller percentage for a larger household?",
        answer:
          "Because the same income is spread across more people. Expenditure data show that each member's personal share of household spending falls as the household grows, and that the share also falls as income rises, since a larger part of a high income is saved or spent on the household as a whole. The tables reflect both patterns.",
      },
      {
        question: "Does the deduction change when the decedent was the household's only earner?",
        answer:
          "The basis changes, not the principle. With one earner the decedent's income and the household's income are the same figure, so the percentage is read from the table on that basis. With two earners the decedent's consumption is a share of the combined income, and the report either uses a table built on that basis or converts the percentage before applying it.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "BLS_CPS", "NCHS_LIFE_TABLES"]),
  },
  {
    slug: "earnings-growth-rate-selection",
    name: "Earnings Growth Rate Selection",
    authorSlug: "christopher-skerritt",
    datePublished: "2026-09-14",
    dateModified: "2026-09-14",
    metaDescription: "The growth rate carrying an earnings base forward is chosen from published wage series and the person's career stage, in the same terms as the discount rate.",
    summary:
      "The growth rate is the annual percentage by which the economist carries a documented earnings base forward over the projection, and it has three possible components: general wage inflation, which every worker's pay tends to follow; the real gain that comes with experience early in a career; and any documented step, such as a promotion or a licensing milestone, specific to the person. The rate is drawn from published wage series and the person's record, stated in the same nominal or real terms as the discount rate, and shown year by year so the assumption can be tested.",
    whenUsed:
      "A growth rate enters every projection that runs more than a year into the future: the but-for and post-event streams in a [[/services/lost-earnings-and-earning-capacity|lost earnings and earning capacity]] analysis, the decedent's earnings in a [[/services/wrongful-death-economic-loss|wrongful death]] claim, the front pay period in an [[/services/employment-and-wage-loss-damages|employment matter]], and the replacement wages behind a household services figure. The [[/methods/wage-growth-and-earnings-projection|earnings projection]] page describes the projection as a whole; this page concerns the one input that compounds across every year of it.",
    steps: [
      "Fix the earnings base first, from several years of tax returns and pay records, so the growth rate is applied to a representative figure rather than to a single high or low year",
      "Decide the terms: a nominal rate that includes expected inflation paired with a nominal discount rate, or a real rate paired with a real discount rate, and never one of each",
      "Read the general component from a long-run published wage series for the economy or for the person's industry, using a window long enough to average out a single unusual period of inflation",
      "Add a career-stage component only where the person was early in a career, from age-earnings profiles for the person's education and occupation, and taper it as the person approaches the age at which earnings in that occupation plateau",
      "Add a person-specific step only where a document supports it: a signed offer, a collective bargaining schedule, a licensing exam passed, or an employer's written promotion path",
      "Apply the same general rate to the post-event stream so the two sides of the comparison are measured on one footing, and show the loss under an alternative rate where the rate is contested",
    ],
    dataSources: [
      "BLS Employment Cost Index, for the growth of wages and salaries by industry and occupation group over long windows",
      "BLS Current Population Survey earnings series, for the growth of median weekly earnings by age, sex, and education",
      "BLS Consumer Price Index, for the inflation component that separates a nominal rate from a real rate",
      "Census American Community Survey earnings by age, education, and occupation, for the age-earnings profile behind the career-stage component",
      "The person's own pay history and any employer schedule, offer, or union contract that documents a specific step",
    ],
    limitations:
      "The rate compounds, so a small difference sustained over a long horizon becomes a large difference in the present value, and a rate drawn from a short or unusual window can carry a period of high or low inflation across decades where it does not belong. The person's own past raises are evidence of career stage but not of the future: a run of promotions early in a career says the person was on the rising part of the profile, not that the rise would continue at that pace. The growth rate is also inseparable from the [[/methods/present-value-and-discounting|discount rate]]: it is the gap between the two, the net rate, that moves the present value, so the report states the pair together and the [[/compare/net-vs-gross-discount-rate|net versus gross discount rate]] comparison explains why either one read alone can mislead.",
    admissibilityHistory:
      "Growth rates drawn from published wage series and stated alongside the discount rate are routinely admitted. Challenges follow a rate that embeds an undocumented promotion path, a rate inconsistent in its terms with the discount rate, a career-stage gain applied to a person past the age at which the occupation's earnings level off, or a but-for stream grown at one rate and a post-event stream grown at another. A report that names the series, the window, the components, and the terms, and that shows the loss under the alternative rate the other side is likely to argue, is positioned to be examined on the merits, and the [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] lists the questions an opposing economist will ask.",
    relevantServices: ["lost-earnings-and-earning-capacity", "wrongful-death-economic-loss", "employment-and-wage-loss-damages", "expert-rebuttal-and-report-review"],
    faqs: [
      {
        question: "Should the growth rate include inflation?",
        answer:
          "Either way is sound, so long as the discount rate is stated in the same terms. A nominal growth rate that includes expected inflation is paired with a nominal discount rate drawn from market yields; a real growth rate that excludes it is paired with a real discount rate. Mixing the two overstates or understates the present value by the whole inflation component.",
      },
      {
        question: "Why not project from the person's own past raises?",
        answer:
          "Because past raises describe where the person was on the age-earnings profile, not where the profile goes next. A young worker's rapid early gains reflect the steep part of the curve, and carrying that pace across a full career would project earnings no occupation delivers. The report uses the person's history to place the person on the profile and the published series to carry the profile forward.",
      },
      {
        question: "Is the growth rate the same for every year of the projection?",
        answer:
          "Usually not. The general component is constant, but the career-stage component tapers as the person approaches the age at which earnings in the occupation level off, and a documented step enters in the year the document dates it. The schedule shows the rate applied in each year so the taper is visible.",
      },
    ],
    sources: refsToSources(["BLS_ECI", "BLS_CPS", "BLS_CPI", "CENSUS_ACS"]),
  },
];

export function getMethod(slug: string): Methodology | undefined {
  return methods.find((m) => m.slug === slug);
}
