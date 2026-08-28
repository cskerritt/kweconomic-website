import type { Faq, Source } from "./types";
import { refsToSources } from "./references";

/**
 * Attorney journeys: four stages x fourteen case types, written from the
 * economist's standpoint. Each stage answers the question counsel is actually
 * asking at that point: whether the loss justifies an economist and what to
 * gather first (considering), how to scope the engagement and what to send
 * (retaining), how the report is built and which assumptions will be attacked
 * (preparing for deposition), and how the number is presented to a jury and
 * defended against the opposing economist (trial).
 *
 * Copy rules: citation-free prose (sources only through references.ts),
 * hyphens only, no dollar figures or invented statistics, no claim that a
 * named person holds a credential. Opinions on what an injured person can
 * still do come from the medical record or from vocational findings supplied
 * by other experts; the economist prices them. Keep the four stage banners
 * below: src/pages/off-brand-copy.test.mjs splits this file on them and
 * allows at most one sister-practice hand-off line per stage.
 */
export type JourneyStageSlug = "considering" | "retaining" | "preparing-deposition" | "trial";

export interface JourneyStage {
  stage: JourneyStageSlug;
  caseTypeSlug: string;
  intro: string;
  checklist: string[];
  questionsToAsk: string[];
  timeline: string;
  requiredDocuments: string[];
  pitfalls: string[];
  faqs: Faq[];
  sources: Source[];
  dateModified?: string;
}

const MODIFIED = "2026-08-27";

export const journeys: JourneyStage[] = [
  // ── Considering stage ─────────────────────────────────────────
  {
    stage: "considering",
    caseTypeSlug: "personal-injury",
    dateModified: MODIFIED,
    intro:
      "A personal injury claim needs an economist once the loss runs past what the pay records show on their face. A few weeks of documented lost wages can be presented from the pay stubs alone. When the person has not returned to the prior job, has returned at reduced hours or pay, faces future treatment, or can no longer do the household work they did before, the projection, growth, and present value questions call for an economic analysis. The decision turns on the size and duration of the loss, not on the severity label attached to the injury.",
    checklist: [
      "Confirm how long the person was out of work and whether they have returned at the same or a lower level of earnings",
      "Gather three to five years of tax returns, W-2s or 1099s, and recent pay stubs so the pre-injury earnings base can be judged",
      "Identify the fringe benefits that came with the job: employer retirement contributions, health insurance, and any pension accrual",
      "Determine whether a treating provider has projected future treatment or whether a life care plan exists or is planned",
      "Note who did the household work before the injury and what the person can no longer do at home",
    ],
    questionsToAsk: [
      "At what size and duration of loss do you recommend an economic analysis rather than a pay-records presentation?",
      "Which records do you need first to tell us whether the claim is large enough to justify a full report?",
      "How do you handle a case where the post-injury work capacity opinion has not been written yet?",
      "Can you provide a preliminary range before the full engagement so we can evaluate the claim?",
    ],
    timeline: "One to two weeks from the first call to a preliminary view of the loss, once the earnings records are in hand. A full report follows the retention and records phases described on the services pages.",
    requiredDocuments: [
      "Tax returns for the years before and after the injury",
      "W-2s, 1099s, or pay stubs showing earnings history and any post-injury earnings",
      "Employer benefit summaries or plan documents",
      "Medical opinions describing current work restrictions, if any exist yet",
    ],
    pitfalls: [
      "Waiting until the disclosure deadline to ask whether an economist is needed, which compresses the records request and the analysis",
      "Assuming a modest injury means a modest claim when the person's occupation cannot accommodate the restrictions",
      "Overlooking household services and fringe benefits, which can rival the wage loss for some households",
    ],
    faqs: [
      {
        question: "Is there a minimum loss that justifies retaining an economist?",
        answer:
          "There is no fixed threshold. The practical test is whether the loss extends into the future or involves components that must be projected, grown, and discounted. A short, fully documented past wage loss rarely needs an expert; a loss that continues past the date of trial almost always does.",
      },
      {
        question: "Can the economist work from partial records at this stage?",
        answer:
          "Yes. A preliminary range can be built from tax returns and a description of the injury's effect on work. The full report needs the complete earnings and benefit records, and the post-injury path needs the medical or work-capacity opinions in the record. When no such opinion exists, that gap is coordinated with a vocational specialist rather than filled by the economist.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "NAFE_ETHICS"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "wrongful-death",
    dateModified: MODIFIED,
    intro:
      "Nearly every wrongful death claim with a working-age decedent or a decedent who supported a household justifies an economist, because the loss is a stream of future contributions that must be projected over an expected life and reduced to present value. The claim measures what the decedent would have provided to the survivors in earnings, benefits, and household work, less what the decedent would have consumed personally where the venue requires that deduction. Counsel considering an economist should first establish who the survivors are and what the decedent was contributing at the time of death.",
    checklist: [
      "Identify the survivors entitled to recover and the framework the venue applies to their claim",
      "Gather the decedent's tax returns, W-2s, and benefit records for the years before death",
      "Document the household: who lived with the decedent, their ages, and the decedent's share of the household work",
      "Note whether the decedent was the primary earner, a secondary earner, or a homemaker whose contribution was mainly household services",
      "Confirm the decedent's age, health history, and education so worklife and life expectancy can be addressed",
    ],
    questionsToAsk: [
      "How do you treat personal consumption, and does the venue's framework require the deduction?",
      "How do you value household services for a decedent who did most of the unpaid work in the home?",
      "What do you need to project earnings for a decedent who was early in a career or between jobs at death?",
      "Do you separate the loss by survivor when the framework requires it?",
    ],
    timeline: "One to two weeks to a preliminary view once the earnings records and household information are available. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Tax returns and W-2s or 1099s for several years before death",
      "Employer benefit statements, pension or retirement plan documents",
      "Household composition and the ages of dependents",
      "Death certificate and the decedent's date of birth and education history",
    ],
    pitfalls: [
      "Treating the decedent's gross earnings as the loss without addressing consumption, benefits, and household services",
      "Overlooking a homemaker decedent because there were no wages to lose, when household services can be the largest component",
      "Delaying the household inventory until memories fade and the survivors' accounts become harder to document",
    ],
    faqs: [
      {
        question: "Does a wrongful death claim for a retired decedent need an economist?",
        answer:
          "Often, yes. A retired decedent may have provided household services, pension or Social Security income that ended or reduced at death, and financial support to survivors. Each of those is a future stream that must be projected over the remaining life expectancy and discounted to present value.",
      },
    ],
    sources: refsToSources(["CDC_LIFE_TABLES", "BLS_CEX", "BLS_ATUS"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "medical-malpractice",
    dateModified: MODIFIED,
    intro:
      "A medical malpractice claim needs an economist when the injury has changed what the patient can earn, created ongoing care costs, or ended the patient's ability to do household work. The added feature of these matters is the comparison: the loss is measured against the outcome the patient would have had with proper care, not against perfect health. Counsel considering an economist should be prepared to describe both paths, because the economist needs the causation opinions to define what the patient would have earned and needed regardless of the negligence.",
    checklist: [
      "Confirm the expected outcome with proper care from the causation opinions so the but-for path can be defined",
      "Gather the patient's earnings history: tax returns, W-2s or 1099s, and pay stubs",
      "Identify any pre-existing condition that affected work or life expectancy independently of the injury",
      "Determine whether a life care plan or treating recommendations will define the incremental future care",
      "Note the patient's role in household work before the injury",
    ],
    questionsToAsk: [
      "How do you apportion the loss between the injury and the underlying condition?",
      "What do you need from the causation and treating opinions before you can build the two paths?",
      "How do you handle life expectancy when the underlying condition shortened it independently?",
      "Can you give a preliminary range before the medical opinions are final?",
    ],
    timeline: "Two to three weeks to a preliminary view, because the but-for path depends on causation opinions that may still be in progress. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Tax returns and wage records for the years before and after the injury",
      "Employer benefit summaries",
      "Causation and treating opinions describing the expected outcome with proper care",
      "Medical records bearing on the pre-existing condition and its effect on work",
    ],
    pitfalls: [
      "Retaining the economist before the causation opinions define the but-for path, so the report must be rebuilt later",
      "Ignoring the pre-existing condition's own effect on earnings, which the opposing economist will raise",
      "Assuming the incremental care will be small when the underlying condition already required substantial treatment",
    ],
    faqs: [
      {
        question: "Why does the economist need the causation opinions before starting?",
        answer:
          "Because the loss is the difference between two paths, and the but-for path in a malpractice case is not full health but the outcome proper care would have produced. Without a medical opinion on that outcome, the economist cannot state what earnings, care, and life expectancy the patient would have had regardless of the negligence.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "CDC_LIFE_TABLES", "NAFE_ETHICS"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: MODIFIED,
    intro:
      "Motor vehicle accident claims span the full range of economic loss, and the need for an economist scales with the injury. A short absence from work with a documented return can be presented from the pay records. Once the person cannot return to the prior occupation, needs future surgery or treatment, or has lost the ability to do household work, the loss becomes a projection over a worklife and requires growth and present value assumptions that counsel should not be left to argue without an expert. The first step is to establish the work timeline: date of injury, date of any return, and the level of earnings on return.",
    checklist: [
      "Establish the dates the person left work and returned, and whether the return was at full or reduced earnings",
      "Gather tax returns, W-2s or 1099s, and pay stubs for the years before the crash and every period since",
      "Identify fringe benefits lost during the absence or reduced on return",
      "Determine whether future treatment has been projected by a treating provider or in a life care plan",
      "Document the household work the person did before the crash and cannot do now",
    ],
    questionsToAsk: [
      "How do you decide whether a return to work at reduced earnings represents a permanent loss?",
      "What records do you need to distinguish a bounded past loss from a future loss?",
      "How do you treat overtime, seasonal work, or a second job in the earnings base?",
      "Can you provide a preliminary range for settlement discussions before the full report?",
    ],
    timeline: "One to two weeks to a preliminary view from the earnings records and the work timeline. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Tax returns and W-2s or 1099s for the years before and after the crash",
      "Pay stubs or employer statements showing the absence and any return to work",
      "Benefit plan summaries",
      "Medical opinions on work restrictions, if any have been written",
    ],
    pitfalls: [
      "Presenting the claim from pay records alone when the person's return to work is at reduced hours and the gap will continue",
      "Overlooking self-employment or gig income that does not appear on a W-2",
      "Leaving household services out of a claim for a person who did most of the unpaid work in the home",
    ],
    faqs: [
      {
        question: "The injured person is back at work. Is there still an economic loss?",
        answer:
          "Possibly. If the return is at lower pay, fewer hours, or in a job with less growth or fewer benefits, the gap between the prior path and the current path continues over the remaining worklife. The economist measures that gap; a return to work does not end the claim by itself.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: MODIFIED,
    intro:
      "Traumatic brain injury claims almost always justify an economist, because cognitive and behavioral effects can end a career even when physical function returns, and because the care and supervision costs can extend over a lifetime. The economic claim combines lost earnings and earning capacity, lost fringe benefits, the replacement cost of household services, and the present value of the future care documented in a life care plan or treating recommendations. Counsel considering an economist should understand that the size of the claim depends on inputs prepared by others: the medical and work-capacity opinions define the post-injury path, and the economist prices it.",
    checklist: [
      "Gather the person's earnings history and, for a young person, the educational and occupational path they were on",
      "Determine whether the record contains an opinion on what work, if any, the person can do now",
      "Identify whether a life care plan is planned and who will author it, since its present value is often the largest figure",
      "Document the household work and supervision the family now provides without pay",
      "Note the person's age, because a long remaining worklife drives the earnings component",
    ],
    questionsToAsk: [
      "How do you build the but-for earnings path for a student or a young worker with a short earnings history?",
      "How do you treat a return to work with supports or at a lower level as a partial loss?",
      "How do you reconcile attendant care in the life care plan with a household services claim to avoid double counting?",
      "What do you need from the neuropsychological and treating opinions to define the post-injury path?",
    ],
    timeline: "Two to three weeks to a preliminary view, because the post-injury path depends on medical and work-capacity opinions that may not yet exist. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Tax returns, W-2s or 1099s, and pay stubs, or school records for a student",
      "Employer benefit summaries",
      "Neuropsychological and treating opinions bearing on work capacity and supervision",
      "The life care plan, if one exists, with its item-level cost tables",
    ],
    pitfalls: [
      "Retaining the economist before anyone has addressed what the person can do now, so the post-injury path has no basis in the record",
      "Assuming a mild injury means a small claim when persistent symptoms keep the person out of skilled work",
      "Claiming both attendant care hours and household services for the same tasks without reconciling them",
    ],
    faqs: [
      {
        question: "Can the economist estimate what the injured person can still earn?",
        answer:
          "No. That opinion comes from the medical record or from vocational findings supplied by other experts. The economist takes the post-injury capacity as given, prices it with occupational earnings data, and measures the gap against the but-for path. Retaining the economist alone does not close that gap in the record.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_CPI_MEDICAL"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: MODIFIED,
    intro:
      "Spinal cord injury claims justify an economist in nearly every case. The person's prior occupation has usually ended, attendant care and equipment recur for life, and the household work the person did before the injury now has to be replaced. Each of those components is a future stream with its own growth rate and duration, and the present value of the whole can only be built by an economist working from the medical, care, and earnings records. Counsel considering an economist should start by assembling the earnings history and identifying who will author the life care plan, because the plan's items and the person's post-injury work capacity are the inputs the economist prices.",
    checklist: [
      "Gather the earnings history and the fringe benefits that came with the prior job",
      "Identify the life care plan's author and timing, since the plan supplies the care and equipment items to be valued",
      "Determine whether the record addresses what sedentary or part-time work, if any, the person can do",
      "Document the household work the person performed before the injury and the hours now supplied by family",
      "Note the neurological level and age, because they drive life expectancy, care hours, and the length of the earnings loss",
    ],
    questionsToAsk: [
      "How do you apply life expectancy when the medical opinions address the injury's effect on it?",
      "Which growth rate do you apply to attendant care as opposed to equipment and supplies?",
      "How do you treat home and vehicle modifications that recur on replacement cycles?",
      "How do you keep the household services claim from overlapping the attendant care hours in the plan?",
    ],
    timeline: "Two to three weeks to a preliminary earnings view; the care component waits for the life care plan. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Tax returns, W-2s or 1099s, and pay stubs for the years before the injury",
      "Employer benefit summaries or plan documents",
      "The life care plan or the treating recommendations for future care",
      "Medical opinions on life expectancy and post-injury work capacity",
    ],
    pitfalls: [
      "Retaining the economist before the life care plan is scheduled, leaving the largest component with no source",
      "Applying a single growth rate to every care category when medical and non-medical costs move differently",
      "Overlooking the fringe benefits of a trade or union job, which can be a substantial share of compensation",
    ],
    faqs: [
      {
        question: "Which component of a spinal cord injury claim is usually the largest?",
        answer:
          "The present value of attendant care over the person's lifetime is usually the largest figure, followed by future lost earnings for a person injured early in a working life. Equipment, supplies, and modifications recur on replacement cycles and are sensitive to the cost growth rate applied. The economist values each on a consistent basis so the total can be examined item by item.",
      },
    ],
    sources: refsToSources(["BLS_CPI_MEDICAL", "CDC_LIFE_TABLES", "BLS_ECEC"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "workers-compensation",
    dateModified: MODIFIED,
    intro:
      "Workers' compensation matters call for an economist at specific points rather than in every claim: valuing a stream of future indemnity or medical benefits for a settlement, measuring the economic loss in a third-party action arising from the same injury, and quantifying the wage loss where the benefit itself turns on loss of earning capacity. Counsel considering an economist should identify which of those questions the matter presents, because the analysis is structured to the question the compensation system actually asks and the records needed differ for each.",
    checklist: [
      "Identify the question: settlement value of future benefits, third-party economic loss, or the wage loss that sets the benefit",
      "Gather the pre-injury wage records from the employer and the claimant's tax returns",
      "Obtain the carrier's payment history for indemnity and medical benefits paid to date",
      "Determine whether a treatment projection exists if future medical liability is being valued",
      "For a third-party action, note the fringe benefits and household services the compensation system does not pay",
    ],
    questionsToAsk: [
      "How do you value a stream of future indemnity payments, and which mortality and discount assumptions do you state?",
      "In a third-party action, how do you present the benefits already paid so the lien and offset questions can be answered?",
      "Can you express a loss of earning capacity as a percentage or a dollar figure as the compensation system requires?",
      "Do you prepare the medical treatment projection, or does that come from others?",
    ],
    timeline: "One to two weeks to a preliminary present value of a benefit stream once the payment history and schedule are in hand. A third-party damages report follows the retention and records phases.",
    requiredDocuments: [
      "Employer wage records and the claimant's tax returns for the years before the injury",
      "The carrier's indemnity and medical payment history",
      "The applicable benefit schedule and any settlement proposal",
      "Post-injury earnings records and the work-capacity opinions in the record",
    ],
    pitfalls: [
      "Negotiating a settlement from a rule of thumb when a present value with stated assumptions would document the number",
      "Netting paid benefits against the loss in a third-party report before counsel has resolved the lien and offset questions",
      "Treating the compensation system's measure of loss as if it were the civil measure, or the reverse",
    ],
    faqs: [
      {
        question: "Does a routine workers' compensation claim need an economist?",
        answer:
          "Usually not. The economist adds value when a long stream of future benefits is being settled, when a third-party claim adds components the compensation system does not pay, or when the benefit turns on a contested loss of earning capacity. In those settings a documented present value replaces an estimate.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "TREASURY_YIELD", "NAFE"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "employment-discrimination",
    dateModified: MODIFIED,
    intro:
      "An employment discrimination claim needs an economist when the loss extends beyond a short, documented period of back pay. Once front pay is claimed, once the lost compensation includes bonuses, equity, or benefit accruals that must be reconstructed, or once mitigation is contested, the analysis requires a year-by-year comparison of the but-for compensation path and the actual path that counsel should not present without an expert. The first step is to assemble the employee's compensation history and the employer's pay practices, because the but-for path is built from both.",
    checklist: [
      "Gather the employee's pay history: W-2s, pay stubs, bonus and commission statements, and equity award records",
      "Obtain the employer's compensation policies, raise schedules, and benefit plan documents",
      "Document the employee's job search and any replacement earnings since the adverse action",
      "Identify comparators whose pay progression shows what the employee's path would have been",
      "Note the employee's age and tenure, which bear on the front pay period and on pension losses",
    ],
    questionsToAsk: [
      "How do you bound the front pay period, and what evidence do you rely on for it?",
      "How do you treat replacement earnings that are lower, higher, or from a different kind of work?",
      "How do you value lost equity awards, bonuses, and retirement contributions?",
      "Can you provide a preliminary back pay figure quickly for mediation?",
    ],
    timeline: "One to two weeks to a preliminary back pay figure from the pay records. A full back pay, front pay, and benefits report follows the retention and records phases.",
    requiredDocuments: [
      "W-2s, pay stubs, and bonus or commission statements for the years before and after the adverse action",
      "Employer compensation policies and benefit plan documents",
      "Records of the job search and any replacement employment",
      "Personnel file entries bearing on pay, promotion, and performance",
    ],
    pitfalls: [
      "Claiming back pay from the last pay rate alone, without the raises, bonuses, and benefit accruals the employee would have received",
      "Leaving the front pay period unsupported, which is the assumption the opposing side attacks first",
      "Ignoring the mitigation record until the deposition, when the economist must explain it",
    ],
    faqs: [
      {
        question: "What is the difference between back pay and front pay in the economic analysis?",
        answer:
          "Back pay covers the period from the adverse action to the date of trial or analysis and is built from records of what the employee would have earned. Front pay covers the future period needed to reach comparable compensation and must be projected and discounted. Both are measured against the compensation the employee actually received or should reasonably have received from replacement work.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECEC"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "wrongful-termination",
    dateModified: MODIFIED,
    intro:
      "A wrongful termination claim needs an economist when the gap between the compensation the employee would have received and the compensation they have replaced runs into the future, or when the lost compensation includes pension accruals, retiree health coverage, or equity that cannot be read off a pay stub. For a long-tenured employee the benefit losses can rival the wage loss, and for an older employee the front pay period can be the largest and most contested component. Counsel considering an economist should first assemble the compensation history and the benefit plan documents that show what the employee was accruing.",
    checklist: [
      "Gather W-2s, pay stubs, and bonus statements for the years before and after the termination",
      "Obtain the pension, retiree health, and equity plan documents that define what the employee was accruing",
      "Document the job search and any replacement employment, including its pay and benefits",
      "Identify the employer's practices for raises and promotions to support the but-for path",
      "Note the employee's age, tenure, and occupation, which bear on the front pay period",
    ],
    questionsToAsk: [
      "How do you value the loss of pension accruals and retiree health coverage for a long-tenured employee?",
      "What evidence supports the length of the front pay period for an employee of this age and occupation?",
      "How do you treat replacement work that pays less or carries fewer benefits?",
      "Can you produce a preliminary range before the full engagement?",
    ],
    timeline: "One to two weeks to a preliminary back pay and benefits view from the pay and plan records. The full report follows the retention and records phases.",
    requiredDocuments: [
      "W-2s, pay stubs, and bonus or commission records",
      "Pension, retiree health, and equity plan documents and account statements",
      "Records of the job search and replacement employment",
      "Personnel records bearing on pay progression and expected tenure",
    ],
    pitfalls: [
      "Overlooking the benefit losses of a long-tenured employee, which can exceed the wage loss",
      "Asserting a front pay period with no support in the employee's age, occupation, or local job market",
      "Failing to document the job search, which leaves the mitigation question to the opposing economist",
    ],
    faqs: [
      {
        question: "How does the economist decide how long front pay should run?",
        answer:
          "From the employee's age, occupation, tenure, and the time comparable work reasonably takes to find, supported by the job search record and by data on how long similar workers stay in a position. The economist states the period and the reason for it, and can show the number under alternative periods so the fact finder sees what the assumption moves.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "TREASURY_YIELD"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "commercial-contract-dispute",
    dateModified: MODIFIED,
    intro:
      "A commercial contract dispute needs an economist when the claimed loss is profits that would have been earned had the contract been performed, because that figure has to be reconstructed from the contract terms, the business's history, and the costs that would have been incurred to earn the revenue. A claim limited to a liquidated amount or an invoice may not require an expert. Once lost profits, lost related business, or the value of a destroyed business line are claimed, the but-for analysis and the incremental cost treatment call for an economist. Counsel should first gather the financial statements and the contract, because the analysis starts there.",
    checklist: [
      "Gather the contract, amendments, and any projections or budgets prepared before the dispute",
      "Assemble financial statements and tax returns for the years before and after the breach",
      "Identify the revenue attributable to the contract and any related business that depended on it",
      "Document what the business did after the breach to replace the lost volume",
      "Note whether the claim is lost profits, reliance costs, or the value of a business line, since the method differs",
    ],
    questionsToAsk: [
      "How do you separate incremental costs from fixed costs so only the lost margin is claimed?",
      "What do you rely on for but-for revenue when the contract had a variable term or volume?",
      "How do you treat revenue the business replaced after the breach?",
      "Can you provide a preliminary range from the financial statements before a full engagement?",
    ],
    timeline: "Two to three weeks to a preliminary lost profits range from the financial statements and the contract. The full report follows the retention and records phases.",
    requiredDocuments: [
      "The contract, amendments, and correspondence bearing on performance and volume",
      "Financial statements and tax returns for several years before and after the breach",
      "General ledger detail or management reports for the affected revenue and costs",
      "Pre-dispute projections, budgets, or business plans",
    ],
    pitfalls: [
      "Claiming lost revenue rather than lost profit, which the opposing side corrects at the first opportunity",
      "Treating fixed costs as avoided, or variable costs as fixed, without support in the business's own records",
      "Ignoring the revenue the business replaced after the breach",
    ],
    faqs: [
      {
        question: "Is lost profits the same as the value of the business?",
        answer:
          "No. Lost profits measure the margin the business would have earned over a defined period; lost business value measures what the business or a business line was worth when it was destroyed. The two are alternative measures for the same harm in some matters and claiming both for the same period double counts. The economist identifies which measure fits the claim.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "TREASURY_YIELD", "AAEFE_JLE"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "partnership-and-shareholder-dispute",
    dateModified: MODIFIED,
    intro:
      "A partnership or shareholder dispute needs an economist when the value of an ownership interest is at issue, when distributions or compensation are alleged to have been diverted, or when a buyout formula in the governing agreement has to be applied to normalized financial statements. The valuation date and the standard of value control the result, and the gap between fair value and fair market value can be substantial for a minority interest in a closely held company. Counsel considering an economist should start with the agreements, because they define the date, the standard, and any formula the analysis must follow.",
    checklist: [
      "Gather the partnership, shareholder, or operating agreement and any buy-sell provisions",
      "Assemble financial statements, tax returns, and general ledger detail for several years",
      "Identify the valuation date the claim or the agreement requires and the standard of value that applies",
      "Document owner compensation, related-party transactions, and distributions to each owner",
      "Note any prior valuations, offers, or transactions in the company's interests",
    ],
    questionsToAsk: [
      "How do you approach a fair value standard as opposed to a fair market value standard for a minority interest?",
      "How do you normalize owner compensation and related-party items before valuing the interest?",
      "Which of the income, market, and asset approaches do you expect to carry the most weight for this company, and why?",
      "How do you quantify diverted distributions or excess compensation?",
    ],
    timeline: "Two to three weeks to a preliminary value range from the financial statements and agreements. The full valuation follows the retention and records phases.",
    requiredDocuments: [
      "Governing agreements, amendments, and any buy-sell or valuation formula provisions",
      "Financial statements and tax returns for several years around the valuation date",
      "General ledger detail, owner compensation records, and related-party transaction records",
      "Prior valuations, offers, or transactions in the company's equity",
    ],
    pitfalls: [
      "Retaining an economist before the valuation date and standard of value are pinned down from the agreements and the claim",
      "Assuming a minority discount applies when the standard of value for the claim may exclude it",
      "Overlooking related-party transactions that change the normalized earnings materially",
    ],
    faqs: [
      {
        question: "Why does the standard of value matter so much in a shareholder dispute?",
        answer:
          "Because fair market value assumes a hypothetical sale between willing parties and may apply minority and marketability discounts, while a fair value standard in an oppression or dissenters' setting may exclude them. For a minority interest in a closely held company the difference can be a large share of the result. The economist identifies the standard the claim requires and states how it was applied.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "FRE_702"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "divorce-and-marital-dissolution",
    dateModified: MODIFIED,
    intro:
      "A divorce or marital dissolution matter needs an economist when a closely held business or professional practice must be valued, when a self-employed spouse's income for support purposes differs from the reported compensation, when separate and marital property must be traced through commingled accounts, or when a lifestyle analysis is needed to support or contest a support claim. Counsel considering an economist should gather the business records and the personal financial statements first, because the valuation, the income determination, and the tracing all start from them.",
    checklist: [
      "Gather the business's financial statements, tax returns, and general ledger detail for several years",
      "Assemble the parties' personal tax returns, bank and brokerage statements, and loan applications",
      "Identify the valuation date the governing framework requires and whether personal goodwill is treated separately",
      "Document owner compensation, personal expenses run through the business, and distributions",
      "Note whether tracing of separate property or a lifestyle analysis is needed in addition to the valuation",
    ],
    questionsToAsk: [
      "How do you determine the income available for support from a business beyond the owner's reported compensation?",
      "How do you address personal and enterprise goodwill when the framework requires the distinction?",
      "What records do you need to trace separate property through commingled accounts?",
      "Can you provide a preliminary value range for mediation before the full engagement?",
    ],
    timeline: "Two to three weeks to a preliminary value and income view from the business and personal records. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Business financial statements, tax returns, and general ledger detail",
      "Personal tax returns, bank, brokerage, and retirement account statements",
      "Loan applications and personal financial statements submitted to lenders",
      "Documents bearing on the acquisition of assets claimed as separate property",
    ],
    pitfalls: [
      "Accepting the owner spouse's reported compensation as income for support without analyzing the business's cash flow",
      "Valuing the business as of the wrong date for the framework that governs the division",
      "Waiting to request the general ledger, which is the record that reveals personal expenses paid by the business",
    ],
    faqs: [
      {
        question: "Does every divorce with a business interest need a valuation?",
        answer:
          "Not always, but most contested ones do. Where the parties agree on value or the interest is minor relative to the estate, a valuation may not be worth its cost. Where the business is the largest marital asset, where one spouse controls its records, or where income for support is in dispute, an independent valuation and income analysis usually decides the outcome.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_OES"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "fraud-and-embezzlement",
    dateModified: MODIFIED,
    intro:
      "A fraud or embezzlement matter needs an economist or forensic accountant as soon as the amount taken, the period it ran, and where the funds went have to be established from the records rather than from an admission. The direct loss is reconstructed transaction by transaction, the consequential losses such as lost profits or penalties are measured separately, and the diverted funds are traced forward to the accounts and assets that received them. Counsel considering an expert should preserve the bank records, general ledger, and supporting documents immediately, because the reconstruction depends on them and they are easiest to obtain early.",
    checklist: [
      "Preserve bank statements, cancelled checks, wire records, and the general ledger for the suspected period",
      "Identify the suspected mechanism: fictitious vendors, payroll manipulation, skimming, or unauthorized transfers",
      "Gather the documents that support each transaction type: vendor files, payroll registers, invoices, and approvals",
      "Note the consequential effects: missed payments, penalties, lost business, or borrowing to cover the shortfall",
      "Determine whether a restitution figure, a civil damages figure, or both are needed, since the presentation differs",
    ],
    questionsToAsk: [
      "How far back can the loss be reconstructed with the records available, and what happens beyond that point?",
      "How do you confirm amounts against third-party records rather than the internal books alone?",
      "How do you trace diverted funds forward to assets that might be recovered?",
      "How do you separate the direct loss from consequential losses in the report?",
    ],
    timeline: "Two to four weeks to a preliminary loss estimate once bank records and the general ledger are available; the length of the scheme drives the schedule. The full reconstruction follows the retention and records phases.",
    requiredDocuments: [
      "Bank statements, cancelled checks, and wire and deposit records for the suspected period",
      "General ledger detail, payroll registers, and vendor master files",
      "Invoices, approvals, and supporting documents for the suspected transactions",
      "Records of the consequential effects: penalties, lost contracts, or borrowing",
    ],
    pitfalls: [
      "Relying on the internal books, which the scheme may have altered, instead of confirming against bank and third-party records",
      "Delaying the records preservation until accounts are closed or retention periods lapse",
      "Combining the direct loss and the consequential losses into one figure the fact finder cannot separate",
    ],
    faqs: [
      {
        question: "What is the difference between quantifying the loss and tracing the funds?",
        answer:
          "Quantifying the loss establishes how much was taken, when, and by what mechanism, and it supports a damages or restitution figure. Tracing follows the diverted funds forward to the accounts, purchases, and assets that received them, and it supports recovery. The two use the same records but answer different questions, and counsel should decide early whether both are needed.",
      },
    ],
    sources: refsToSources(["ACFE", "FRCP_26", "DAUBERT"]),
  },
  {
    stage: "considering",
    caseTypeSlug: "product-liability",
    dateModified: MODIFIED,
    intro:
      "A product liability claim needs an economist under the same conditions as any injury or death claim: when the loss extends into the future, when future care has been projected, or when household work the person did before the injury must be replaced. The distinctive feature is the claimant. Product cases often involve children, students, homemakers, and retirees, whose but-for earnings path cannot be read from a wage history and must be built from educational attainment, occupational earnings data, or the household work the person performed. Counsel considering an economist should be ready to describe the claimant's circumstances, not just the injury.",
    checklist: [
      "Gather the earnings history if there is one, or the school and training records for a child or student",
      "Document the household work performed by a homemaker or retiree claimant",
      "Determine whether future care has been projected by a treating provider or in a life care plan",
      "Identify the fringe benefits attached to any prior employment",
      "Note the claimant's age and expected life and worklife, which set the duration of each stream",
    ],
    questionsToAsk: [
      "How do you build a but-for earnings path for a child or student with no earnings history?",
      "How do you value the lost household services of a homemaker or retired claimant?",
      "How do you apply life expectancy when the medical opinions address the injury's effect on it?",
      "Can you provide a preliminary range before the full engagement?",
    ],
    timeline: "One to three weeks to a preliminary view depending on whether an earnings history exists. The full report follows the retention and records phases.",
    requiredDocuments: [
      "Tax returns and wage records, or school records and any training history",
      "Household composition and the claimant's role in the home before the injury",
      "Medical opinions on work restrictions and, where relevant, life expectancy",
      "The life care plan or treating recommendations for future care, if any",
    ],
    pitfalls: [
      "Assuming a claimant without wages has no economic loss, when household services and future earning capacity can both be substantial",
      "Building a child's earnings path on an optimistic assumption without support in the family and school record",
      "Overlooking the future care component until the disclosure deadline approaches",
    ],
    faqs: [
      {
        question: "How is a child's lost earning capacity measured?",
        answer:
          "From the educational path the record supports, the earnings associated with that level of attainment in occupational and survey data, and a statistically expected worklife, compared against the path the injury leaves open. The economist states the attainment assumption and shows the result under alternatives so the fact finder sees what drives the figure.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "CENSUS_ACS", "BLS_ATUS"]),
  },
  // ── Retaining stage ───────────────────────────────────────────
  {
    stage: "retaining",
    caseTypeSlug: "personal-injury",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a personal injury matter starts with a conflict check on the parties and counsel, then a written scope that names the components to be valued: past and future lost earnings, fringe benefits, household services, and the present value of future care if a life care plan or treating recommendations will supply it. The engagement letter should state the report deadline, the disclosure format, and which other experts will supply the post-injury work capacity and care inputs, so the economist can issue a records request that reaches every source at once.",
    checklist: [
      "Provide the party and counsel names for the conflict check before any records are sent",
      "Agree on the loss components in scope and whether household services and future care are included",
      "Identify which experts will supply the work-capacity and care inputs and when their opinions are expected",
      "Send the economist's records list to the client, the employer, and the benefit plan administrators at the same time",
      "Confirm the disclosure deadline and whether a draft review with counsel is planned",
    ],
    questionsToAsk: [
      "What is your records list for this kind of claim, and which items are essential rather than helpful?",
      "How do you handle a change in the work-capacity or care opinions after the report is issued?",
      "Will the report state each assumption and source so it can be examined item by item?",
      "How do you treat self-employment income or a second job in the earnings base?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Tax returns for several years before the injury and every year since",
      "W-2s, 1099s, pay stubs, and the employer's personnel file",
      "Benefit plan documents and statements for retirement, health, and other fringe benefits",
      "Medical opinions on work restrictions and any life care plan or treatment projection",
      "Household composition and a description of the person's pre-injury work in the home",
    ],
    pitfalls: [
      "Sending medical records without the earnings records, which are what the economist needs first",
      "Leaving the scope open so the report values components the pleadings do not claim or omits ones they do",
      "Retaining the economist after the other experts' deadlines, so their opinions are not available when the report is due",
    ],
    faqs: [
      {
        question: "What should the engagement letter cover?",
        answer:
          "The parties and the conflict check, the components to be valued, the deadline and disclosure format, the fee schedule and retainer, who supplies the work-capacity and care inputs, and whether counsel will review a draft. A clear scope keeps the report aligned with the claim as pleaded.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "FRCP_26"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "wrongful-death",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a wrongful death matter means defining the survivors whose loss is being measured, the framework the venue applies, and the components in scope: the decedent's net earnings and benefits, personal consumption, household services, and any financial support the decedent provided to specific survivors. Because the decedent cannot describe the household, the records request reaches further than in an injury case: employer files, benefit plan documents, and detailed information from the survivors about the decedent's work at home and the support the decedent gave.",
    checklist: [
      "Run the conflict check on the estate, the survivors, and counsel",
      "Confirm the survivors and the loss framework the venue applies, including whether personal consumption is deducted",
      "Agree on the components in scope and whether the loss is presented by survivor",
      "Request the employer file, benefit plan documents, and the decedent's tax returns",
      "Schedule the survivor interviews or questionnaires that document household services and support",
    ],
    questionsToAsk: [
      "How do you document the decedent's household services when the decedent cannot be interviewed?",
      "Which consumption approach do you apply, and how does it change with household size and income?",
      "How do you treat a decedent who was between jobs, self-employed, or early in a career?",
      "How do you handle a survivor's remarriage or a dependent reaching adulthood in the projection?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the earnings records and household information arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Tax returns, W-2s or 1099s, and pay stubs for the years before death",
      "Employer personnel file and benefit plan documents, including pension and life insurance",
      "Household composition, dependents' ages, and a description of the decedent's work in the home",
      "Records of financial support the decedent provided to survivors outside the household",
      "Death certificate and documents establishing the decedent's education and health history",
    ],
    pitfalls: [
      "Omitting the survivor questionnaire, so household services rest on general assumptions instead of the decedent's actual role",
      "Failing to identify the framework's treatment of consumption before the analysis is built",
      "Leaving out employer-paid benefits that ended at death, such as health coverage for dependents",
    ],
    faqs: [
      {
        question: "Why does the economist need information from the survivors?",
        answer:
          "Because the household services and support components depend on what the decedent actually did and provided. Time-use data supply the starting point, but the survivors' account of the decedent's schedule, tasks, and contributions is what ties the projection to this household rather than an average one.",
      },
    ],
    sources: refsToSources(["BLS_ATUS", "BLS_CEX", "NCHS_LIFE_TABLES"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "medical-malpractice",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a medical malpractice matter requires coordinating the engagement with the causation and treating experts, because the economist's but-for path is defined by their opinion on the outcome proper care would have produced. The scope should state which components are claimed, whether the incremental future care will come from a life care plan or from treating recommendations, and how the pre-existing condition's own effect on earnings and life expectancy will be handled. The records request covers the earnings and benefit records and the medical opinions on both paths.",
    checklist: [
      "Run the conflict check on the patient, the providers, the institutions, and counsel",
      "Confirm the causation opinions on the expected outcome with proper care and share them with the economist",
      "Agree on the components in scope and the source of the incremental future care figure",
      "Request the earnings, benefit, and household records",
      "Set the report deadline against the other experts' deadlines so their opinions arrive first",
    ],
    questionsToAsk: [
      "How do you present the two paths so the fact finder can see the incremental loss?",
      "How do you handle a life expectancy shortened by the underlying condition rather than by the injury?",
      "What do you need from the treating providers to define the care the patient would have required regardless?",
      "Will you show the result under alternative apportionment assumptions?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the records and the causation opinions arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Tax returns, W-2s or 1099s, and pay stubs for the years before and after the injury",
      "Employer benefit plan documents",
      "Causation opinions on the expected outcome with proper care",
      "Medical records and opinions bearing on the pre-existing condition, work capacity, and life expectancy",
      "The life care plan or the treating recommendations for incremental future care",
    ],
    pitfalls: [
      "Retaining the economist on a deadline that falls before the causation opinions are final",
      "Asking the economist to value total care rather than the incremental care attributable to the injury",
      "Ignoring the earnings effect of the underlying condition, which the opposing side will quantify if the report does not",
    ],
    faqs: [
      {
        question: "What does the economist need that a personal injury engagement would not require?",
        answer:
          "A medical opinion on the outcome the patient would have had with proper care, including its effect on work and life expectancy, and a clear statement of which future care is incremental to the injury. Those inputs define the but-for path, and without them the report compares the injured path to full health, which overstates the loss.",
      },
    ],
    sources: refsToSources(["CDC_LIFE_TABLES", "BLS_CPI_MEDICAL", "NAFE_ETHICS"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a motor vehicle accident matter follows the same steps as any injury claim: conflict check, written scope, and a records request that reaches the employer and benefit plans at once. The scope should match the injury. For a bounded loss the engagement may be limited to past wages and a short future period; for a catastrophic crash it covers lost earnings and earning capacity, fringe benefits, household services, and the present value of a life care plan. Counsel should also identify the sources of post-injury work capacity and future care so the economist is not asked to supply either.",
    checklist: [
      "Run the conflict check on the parties, insurers, and counsel",
      "Scope the engagement to the components the injury actually supports",
      "Request tax returns, W-2s or 1099s, pay stubs, and the employer's records of the absence and any return",
      "Identify who will supply the work-capacity opinion and any life care plan, and when",
      "Confirm the disclosure deadline and the format the venue requires",
    ],
    questionsToAsk: [
      "How do you scope a report for a moderate injury so its cost stays proportionate to the claim?",
      "How do you document a return to work at reduced earnings as a continuing loss?",
      "What do you need from the employer beyond the pay records?",
      "How do you treat lost overtime or a second job?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the records arrive, then one to two weeks for the draft and final report. A bounded past-loss calculation can move faster.",
    requiredDocuments: [
      "Tax returns and W-2s or 1099s for the years before and after the crash",
      "Pay stubs and employer records documenting the absence and any return to work",
      "Benefit plan documents",
      "Medical opinions on work restrictions and any life care plan or treatment projection",
    ],
    pitfalls: [
      "Scoping a full damages report for a claim whose loss is short and documented, which wastes fees and invites criticism",
      "Scoping a narrow report for a claim whose loss will continue, which leaves front-end components unclaimed",
      "Failing to obtain the employer's attendance and return-to-work records, which anchor the past loss",
    ],
    faqs: [
      {
        question: "Can the engagement start narrow and expand later?",
        answer:
          "Yes. Many engagements begin with a past loss and a preliminary future range, then expand to household services and future care when the medical picture settles. The engagement letter should allow for that, and the report deadline should leave room for the added components.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a traumatic brain injury matter means building the engagement around the other experts' inputs. The post-injury earnings path comes from the neuropsychological and treating opinions and from vocational findings supplied by other experts; the future care comes from a life care plan; the household services and supervision hours come from the family's account and the plan. The economist's scope should name each input, its source, and its expected date, so the records request and the report deadline are sequenced correctly and the components reconcile with one another.",
    checklist: [
      "Run the conflict check and set a scope that names each input and its source",
      "Request the earnings history and, for a young person, the school and training records that define the but-for path",
      "Confirm the schedule for the neuropsychological, treating, and work-capacity opinions",
      "Obtain the life care plan with its item-level tables, or the date it will be delivered",
      "Document the supervision and household work now supplied by family members",
    ],
    questionsToAsk: [
      "How do you reconcile attendant care and supervision hours in the plan with the household services claim?",
      "How do you build the but-for path for a student or a worker with a short history?",
      "What growth rate do you apply to the plan's care categories, and how do you support it?",
      "How do you handle a post-injury path that involves supported work or reduced hours?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the records, the work-capacity opinion, and the life care plan arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Tax returns, W-2s or 1099s, pay stubs, or school and training records",
      "Employer benefit plan documents",
      "Neuropsychological, treating, and work-capacity opinions",
      "The life care plan with item-level frequencies, durations, and unit costs",
      "A description of the supervision and household work now provided by family",
    ],
    pitfalls: [
      "Retaining the economist with no plan for who supplies the post-injury work capacity; where the record has none, that input is coordinated with a vocational specialist rather than assumed by the economist",
      "Delivering the life care plan after the economic report deadline",
      "Valuing supervision hours in the plan and household services separately for the same time of day",
    ],
    faqs: [
      {
        question: "What happens if the life care plan changes after the economic report is issued?",
        answer:
          "The economist revalues the affected items and issues a supplemental report. The engagement letter should anticipate at least one revision, and the report should tie every valued item to a plan line so the change can be traced.",
      },
    ],
    sources: refsToSources(["BLS_OES", "BLS_CPI_MEDICAL", "SKOOG_CIECKA_KRUEGER_2011"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a spinal cord injury matter centers on the life care plan and the earnings record. The plan supplies the attendant care, equipment, supplies, and modification items that usually form the largest component; the earnings and benefit records define the but-for path; and the medical opinions on work capacity and life expectancy set the post-injury path and the duration of each stream. The scope should state that the economist values the plan as authored, reconciles it with the household services claim, and applies growth and discount assumptions by category.",
    checklist: [
      "Run the conflict check and agree on the components in scope",
      "Obtain the life care plan with item-level tables, or confirm its delivery date against the report deadline",
      "Request the earnings history and benefit plan documents",
      "Obtain the medical opinions on life expectancy and post-injury work capacity",
      "Document the household work the person performed before the injury and the hours now supplied by family",
    ],
    questionsToAsk: [
      "How do you assign growth rates to attendant care, equipment, supplies, and medical items?",
      "How do you apply a life expectancy opinion that differs from the general population tables?",
      "How do you treat equipment replacement cycles and home and vehicle modifications?",
      "How do you present the report so each valued item ties to a plan line?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the plan and the records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Tax returns, W-2s or 1099s, and pay stubs for the years before the injury",
      "Employer benefit plan documents",
      "The life care plan with item-level frequencies, durations, and unit costs",
      "Medical opinions on life expectancy and work capacity",
      "Household composition and the person's pre-injury role in the home",
    ],
    pitfalls: [
      "Engaging the economist before the plan is scheduled, so the largest component has no source at the deadline",
      "Applying general population life expectancy without addressing the medical opinion on the injury's effect",
      "Leaving fringe benefits out of a trade or union earnings base",
    ],
    faqs: [
      {
        question: "Does the economist review the life care plan for medical accuracy?",
        answer:
          "No. Plan authorship and medical judgment stay with the professional who wrote it. The economist reviews the plan for the information needed to value it: items, frequencies, durations, unit costs, and the basis for its life expectancy, and raises questions with the author when an item cannot be priced as written.",
      },
    ],
    sources: refsToSources(["BLS_CPI_MEDICAL", "CDC_LIFE_TABLES", "TREASURY_YIELD"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "workers-compensation",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a workers' compensation matter begins with naming the question: a present value of future benefits for settlement, an economic loss report for a third-party action, or a wage-loss analysis where the benefit turns on loss of earning capacity. The scope, the records, and the report format differ for each, and a third-party report must also separate what the compensation system pays from the components the civil claim adds so the lien and offset questions can be answered from the same numbers.",
    checklist: [
      "Run the conflict check on the claimant, the employer, the carrier, and counsel",
      "State the question the analysis answers and the format the compensation system or the court expects",
      "Request the employer's wage records, the claimant's tax returns, and the carrier's payment history",
      "Obtain the post-injury earnings records and the work-capacity opinions in the record",
      "For future medical, obtain the treatment projection prepared by the providers or by others",
    ],
    questionsToAsk: [
      "How do you present paid benefits in a third-party report so counsel can address liens and offsets?",
      "Which mortality and discount assumptions do you use for a benefit stream, and how do you state them?",
      "How do you express a loss of earning capacity in the form the compensation system requires?",
      "How do you keep the compensation measure and the civil measure separate in one report?",
    ],
    timeline: "About one week for retention and the records request, then one to three weeks for a benefit-stream present value or two to four weeks for a third-party damages analysis, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Employer wage records and tax returns for the years before the injury",
      "The carrier's indemnity and medical payment history and the applicable benefit schedule",
      "Post-injury earnings records",
      "Work-capacity opinions in the record",
      "The treatment projection, if future medical is being valued",
    ],
    pitfalls: [
      "Retaining for a settlement value without the carrier's payment history and the schedule that applies",
      "Asking the economist to prepare the treatment projection, which comes from the providers or others",
      "Netting paid benefits into the third-party loss before counsel has decided how liens will be presented",
    ],
    faqs: [
      {
        question: "Can one economist serve both the compensation claim and the third-party action?",
        answer:
          "Yes, and it is often efficient, because the same wage base and post-injury path support both. The report presents each measure on its own terms and reconciles them, so the same facts support the benefit determination and the civil damages figure without contradiction.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "TREASURY_YIELD", "NAFE"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "employment-discrimination",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in an employment discrimination matter involves a records request that reaches the employer as well as the employee, because the but-for compensation path is built from the employer's pay practices, raise schedules, bonus patterns, and benefit accruals, often illustrated by comparators. The scope should state the claims and damages periods at issue, whether front pay is claimed, and how mitigation will be documented, and it should set the report deadline against the discovery schedule so the employer's compensation records are in hand before the analysis begins.",
    checklist: [
      "Run the conflict check on the employee, the employer, and counsel",
      "State the claims, the damages periods, and whether back pay, front pay, and benefits are all in scope",
      "Request the employee's pay history and the employer's compensation policies and comparator data through discovery",
      "Document the job search and replacement earnings to date",
      "Obtain the benefit plan documents for retirement, health, and equity awards",
    ],
    questionsToAsk: [
      "How do you use comparator pay data to build the but-for path?",
      "How do you treat a period of unemployment followed by lower-paid replacement work?",
      "How do you value lost equity awards and the vesting the employee would have reached?",
      "Will you update the back pay figure to the trial date?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the pay and policy records arrive, then one to two weeks for the draft and final report, with an update to the trial date if needed.",
    requiredDocuments: [
      "W-2s, pay stubs, and bonus or commission statements for the years before and after the adverse action",
      "Employer compensation policies, raise schedules, and comparator pay data",
      "Benefit plan documents for retirement, health, and equity awards",
      "Records of the job search and replacement employment",
    ],
    pitfalls: [
      "Retaining the economist before the employer's compensation records are produced, so the but-for path rests on the employee's recollection",
      "Leaving mitigation undocumented, which lets the opposing economist assume replacement earnings the employee never had",
      "Omitting equity and bonus components that the employee would have received on the but-for path",
    ],
    faqs: [
      {
        question: "What employer records matter most to the economist?",
        answer:
          "The compensation policies and the pay histories of similarly situated employees, because they show the raises, promotions, bonuses, and benefit accruals the employee would have received. Without them the but-for path defaults to the last pay rate, which understates the loss for an employee whose compensation was rising.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECI", "FRCP_26"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "wrongful-termination",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a wrongful termination matter means scoping the engagement to the compensation the employee lost when the employment ended, including the benefit accruals that stopped, and to the replacement earnings that reduce it. The engagement letter should state the damages period, whether front pay and pension losses are claimed, and how the job search will be documented. The records request should reach the employer's pay and plan records early, because pension and retiree health losses for a long-tenured employee depend on plan terms the employee does not hold.",
    checklist: [
      "Run the conflict check on the employee, the employer, and counsel",
      "State the damages period and the components in scope: back pay, front pay, benefits, and pension losses",
      "Request the employer's pay records, raise practices, and pension and retiree health plan documents",
      "Document the job search and any replacement employment with its pay and benefits",
      "Confirm the report deadline against the discovery schedule",
    ],
    questionsToAsk: [
      "How do you value a defined benefit pension loss for an employee terminated before full vesting or retirement eligibility?",
      "How do you treat retiree health coverage the employee would have qualified for?",
      "What evidence do you rely on to bound the front pay period?",
      "How do you treat replacement work with lower pay or fewer benefits?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the pay and plan records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "W-2s, pay stubs, and bonus or commission records",
      "Pension, retiree health, and equity plan documents and account statements",
      "Employer records of pay progression and expected tenure",
      "Records of the job search and replacement employment",
    ],
    pitfalls: [
      "Overlooking the plan documents, so pension and retiree health losses cannot be valued",
      "Setting the damages period without a stated basis, which the opposing side attacks first",
      "Letting the job search go undocumented, which weakens the mitigation position at deposition",
    ],
    faqs: [
      {
        question: "How does the economist handle a replacement job the employee has not yet found?",
        answer:
          "By stating a reasonable period to find comparable work based on the employee's age, occupation, and local job market, and by applying replacement earnings from that point. The report shows the result under alternative periods and updates when the employee finds work.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "TREASURY_YIELD"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "commercial-contract-dispute",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a commercial contract dispute requires a scope that names the damages measure the claim relies on: lost profits over a defined period, reliance costs, or the value of a destroyed business line. The engagement letter should state the damages period, the discount rate convention counsel expects the venue to accept, and the records the business will produce, including the general ledger detail that separates incremental costs from fixed costs. The conflict check should extend to affiliated companies and the counterparty's affiliates.",
    checklist: [
      "Run the conflict check on the parties and their affiliates",
      "State the damages measure and period so the analysis fits the claim",
      "Request financial statements, tax returns, general ledger detail, and management reports",
      "Obtain the contract, amendments, and pre-dispute projections or budgets",
      "Document the business's actions after the breach to replace the lost volume",
    ],
    questionsToAsk: [
      "How do you establish but-for revenue when the contract had variable volume?",
      "Which costs do you treat as incremental, and how do you support that treatment from the ledger?",
      "How do you treat replaced revenue and avoided costs?",
      "What discount rate do you apply to future lost profits, and why?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the financial records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "The contract, amendments, and performance correspondence",
      "Financial statements and tax returns for several years before and after the breach",
      "General ledger detail and management reports for the affected revenue and costs",
      "Pre-dispute projections, budgets, and business plans",
      "Records of replacement business and post-breach results",
    ],
    pitfalls: [
      "Retaining for lost profits without the general ledger detail needed to separate incremental costs",
      "Leaving the damages period undefined, so the analysis and the pleadings diverge",
      "Withholding post-breach results, which the opposing side will obtain and use to show replaced revenue",
    ],
    faqs: [
      {
        question: "Why does the economist need the general ledger rather than the financial statements alone?",
        answer:
          "Because the financial statements aggregate costs, and the lost profits analysis depends on which costs would have been incurred to earn the lost revenue. The ledger shows cost behavior by account and period, which supports the incremental cost treatment the opposing side will test.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "TREASURY_YIELD", "NAFE_JFE"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "partnership-and-shareholder-dispute",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a partnership or shareholder dispute means engaging a valuation that follows the agreements and the claim: the valuation date, the standard of value, any buyout formula, and the purpose of the valuation are stated in the engagement letter before the analysis starts. The records request covers several years of financial statements, tax returns, general ledger detail, owner compensation, and related-party transactions, because normalizing those items is what converts the company's books into the earnings a valuation can rely on.",
    checklist: [
      "Run the conflict check on the company, each owner, and counsel",
      "State the valuation date, standard of value, interest to be valued, and purpose in the engagement letter",
      "Request financial statements, tax returns, general ledger detail, and budgets or forecasts",
      "Obtain owner compensation records, related-party transaction records, and distribution histories",
      "Provide the governing agreements, prior valuations, and any offers or transactions in the equity",
    ],
    questionsToAsk: [
      "How do you document the normalization adjustments so each can be examined?",
      "How do you weigh the income, market, and asset approaches for this company?",
      "How do you address discounts for lack of control and marketability under the standard the claim requires?",
      "How do you quantify diverted distributions or excess compensation as a separate figure?",
    ],
    timeline: "About one week for retention and the records request, then three to six weeks of analysis after the financial records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Governing agreements, amendments, and buy-sell provisions",
      "Financial statements and tax returns for several years around the valuation date",
      "General ledger detail, owner compensation records, and related-party transaction records",
      "Budgets, forecasts, and prior valuations or transactions in the equity",
    ],
    pitfalls: [
      "Engaging the valuation before the standard of value is fixed, so the report must be redone under a different standard",
      "Withholding related-party and compensation records, which the opposing valuation will obtain and use",
      "Asking for a value without a purpose statement, which the opposing side will characterize as advocacy",
    ],
    faqs: [
      {
        question: "What does the valuation report contain?",
        answer:
          "A statement of the interest valued, the date, the standard and premise of value, the purpose, the sources relied on, the normalization adjustments, the approaches applied and their reconciliation, and the conclusion. Each step is documented so the opposing valuation can be compared to it item by item.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "FRCP_26"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "divorce-and-marital-dissolution",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a divorce or marital dissolution matter involves a scope that may include a business valuation, an income determination for support, a tracing of separate and marital property, and a lifestyle analysis, each with its own records. The engagement letter should state which are included, the valuation date the framework requires, and whether the economist is retained by one party or jointly. The records request reaches the business's general ledger and the parties' personal financial statements, because the personal expenses run through the business affect both the valuation and the income figure.",
    checklist: [
      "Run the conflict check on both spouses, the business, and counsel",
      "State the services in scope: valuation, income determination, tracing, lifestyle analysis",
      "Confirm the valuation date and the goodwill treatment the framework requires",
      "Request the business's financial statements, tax returns, and general ledger detail",
      "Request personal tax returns, bank and brokerage statements, and loan applications",
    ],
    questionsToAsk: [
      "How do you present income for support when the business pays personal expenses of the owner spouse?",
      "How do you separate personal goodwill from enterprise goodwill?",
      "What do you need to trace separate property through commingled accounts?",
      "Can you serve as a joint neutral expert, and how does that change the engagement?",
    ],
    timeline: "About one week for retention and the records request, then three to six weeks of analysis after the business and personal records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Business financial statements, tax returns, and general ledger detail",
      "Personal tax returns, bank, brokerage, and retirement account statements",
      "Loan applications and personal financial statements submitted to lenders",
      "Documents establishing the acquisition and source of assets claimed as separate property",
    ],
    pitfalls: [
      "Retaining the economist without the general ledger, which is where personal expenses paid by the business appear",
      "Confusing the valuation date with the separation date when the framework distinguishes them",
      "Omitting the lifestyle analysis when the support claim depends on the marital standard of living",
    ],
    faqs: [
      {
        question: "Why do loan applications matter in a divorce engagement?",
        answer:
          "Because a personal financial statement submitted to a lender states the owner's income and the business's value as the owner represented them at the time. When those representations differ from the positions taken in the divorce, the economist can address the difference and the fact finder can weigh it.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_CPS"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "fraud-and-embezzlement",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist or forensic accountant in a fraud or embezzlement matter means agreeing on the period to be reconstructed, the mechanisms suspected, whether the funds are to be traced forward, and the form the result must take: a civil damages figure, a restitution figure, or both. The records request is broad and immediate, because bank records, the general ledger, and supporting documents are the reconstruction, and the engagement letter should address privilege and the chain of custody for records the expert receives.",
    checklist: [
      "Run the conflict check on the victim entity, the suspected individuals, and counsel",
      "State the period, the suspected mechanisms, and whether tracing is in scope",
      "Request bank statements, cancelled checks, wire records, and the general ledger for the full period",
      "Obtain vendor files, payroll registers, invoices, and approval records",
      "Address privilege, chain of custody, and how records will be received and stored",
    ],
    questionsToAsk: [
      "How do you organize the reconstruction so each transaction ties to a bank record or third-party document?",
      "How do you handle periods for which records are missing or destroyed?",
      "How do you present the direct loss, consequential losses, and traced assets separately?",
      "How do you coordinate with a parallel criminal proceeding or an insurance claim?",
    ],
    timeline: "About one week for retention and the records request, then three to eight weeks of reconstruction depending on the length of the scheme and the volume of transactions, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Bank statements, cancelled checks, and wire and deposit records for the period",
      "General ledger detail, payroll registers, and vendor master files",
      "Invoices, approvals, and supporting documents for the suspected transactions",
      "Records of consequential effects and any insurance or restitution correspondence",
    ],
    pitfalls: [
      "Limiting the records request to the internal books, which the scheme may have altered",
      "Scoping the period too narrowly, so the reconstruction stops where the scheme began",
      "Failing to address chain of custody, which the opposing side raises to challenge the reconstruction",
    ],
    faqs: [
      {
        question: "How does the expert deal with records the suspected individual controlled?",
        answer:
          "By confirming every amount against records the individual could not alter: bank statements, cancelled checks, and third-party documents. The internal books are used to map the mechanism, but the loss figure rests on the external records so it withstands the argument that the books were manipulated.",
      },
    ],
    sources: refsToSources(["ACFE", "FRCP_26", "FRE_702"]),
  },
  {
    stage: "retaining",
    caseTypeSlug: "product-liability",
    dateModified: MODIFIED,
    intro:
      "Retaining an economist in a product liability matter follows the injury or death engagement pattern, with attention to the claimant's circumstances. For a child or student the scope covers lost earning capacity built from educational attainment and occupational data; for a homemaker or retiree it centers on household services and any lost income or support; for a worker it covers the full earnings, benefits, and household components. The scope should name the sources of post-injury capacity and future care, and the records request should reach the school, employer, or household as the claimant's situation requires.",
    checklist: [
      "Run the conflict check on the parties, manufacturers, distributors, and counsel",
      "Scope the components to the claimant's circumstances",
      "Request the earnings, school, or household records that define the but-for path",
      "Identify the sources of the post-injury capacity opinion and any life care plan",
      "Confirm the disclosure deadline and format",
    ],
    questionsToAsk: [
      "How do you support the educational attainment assumption for a child claimant?",
      "How do you document household services for a homemaker with no wage history?",
      "How do you value the lost support a retired claimant provided to others?",
      "How do you handle a life expectancy opinion that differs from the tables?",
    ],
    timeline: "About one week for retention and the records request, then two to four weeks of analysis after the records arrive, then one to two weeks for the draft and final report.",
    requiredDocuments: [
      "Tax returns and wage records, or school and training records for a child or student",
      "Household composition and the claimant's pre-injury role in the home",
      "Medical opinions on work restrictions and life expectancy",
      "The life care plan or treating recommendations for future care, if any",
      "Benefit plan documents for any prior employment",
    ],
    pitfalls: [
      "Applying an adult wage-earner template to a child, homemaker, or retiree claimant",
      "Asserting an educational path for a child without the family and school record to support it",
      "Leaving future care unsourced until the deadline",
    ],
    faqs: [
      {
        question: "How does the economist document a homemaker's household services?",
        answer:
          "From the household's composition, the claimant's pre-injury schedule and tasks, time-use data for comparable households, and local replacement wage rates for each category of work. The report shows hours, rates, and present value by category so the fact finder can see how the figure was built.",
      },
    ],
    sources: refsToSources(["BLS_ATUS", "CENSUS_ACS", "BLS_OES"]),
  },
  // ── Preparing for Deposition ──────────────────────────────────
  {
    stage: "preparing-deposition",
    caseTypeSlug: "personal-injury",
    dateModified: MODIFIED,
    intro:
      "Preparing an economist for deposition in a personal injury matter means walking through the report the way opposing counsel will: the earnings base, the worklife assumption, the wage growth rate, the discount rate, the post-injury path, the fringe benefit rate, the household services hours and wage rates, and the growth rate applied to future care. Each assumption should be tied to a stated source and the report should show the result under alternatives, so the economist can explain what moves the number without conceding that the number is arbitrary. Counsel should also confirm that the economist's inputs match the current medical and work-capacity opinions.",
    checklist: [
      "Review the report section by section and confirm every assumption has a stated source",
      "Confirm the post-injury path matches the latest work-capacity and medical opinions in the record",
      "Prepare the economist to explain the worklife, growth, and discount choices and the sensitivity ranges",
      "Assemble the file the economist relied on and the list of materials considered for production",
      "Review the opposing economist's report, if served, for the assumptions that differ",
    ],
    questionsToAsk: [
      "Which of your assumptions moves the number most, and how do you support it?",
      "How does the result change if the worklife or the discount rate is set at the opposing economist's values?",
      "What did you rely on for the post-injury earnings path, and what happens if that opinion changes?",
      "Which items in the report came from other experts, and did you check them for internal consistency?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the reliance materials are final.",
    requiredDocuments: [
      "The final report with its tables and the sources for each assumption",
      "The complete reliance file and the list of materials considered",
      "The current medical, work-capacity, and care opinions",
      "The opposing economist's report and any prior testimony by the economist on the same questions",
    ],
    pitfalls: [
      "Serving a report whose inputs predate a changed work-capacity opinion, which the deposition exposes",
      "Presenting a single figure with no sensitivity analysis, so every assumption looks like advocacy",
      "Leaving the fringe benefit and household services components unsupported while the earnings component is fully sourced",
    ],
    faqs: [
      {
        question: "What are the most common attacks on an economic damages report at deposition?",
        answer:
          "That the earnings base is inflated by an unusual year, that the worklife is too long, that wage growth is too high or the discount rate too low, that the post-injury path ignores what the person can do, and that household services or benefits are double counted. A report that states each assumption, sources it, and shows alternatives meets each attack on its own terms.",
      },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD", "FRCP_26"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "wrongful-death",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a wrongful death matter concentrates on the assumptions that scale the whole report: the personal consumption deduction, the worklife and life expectancy applied to the decedent, the wage growth and discount rates, and the hours and wage rates behind household services. Opposing counsel will test whether consumption was drawn from household expenditure data appropriate to the household's size and income, whether the decedent's earnings history supports the base, and whether the survivors' account of household services was documented rather than assumed. The economist should be ready to explain each choice and show the result under alternatives.",
    checklist: [
      "Review the consumption approach and confirm it fits the household's size and income",
      "Confirm the earnings base against the tax returns and the worklife against the decedent's age, education, and history",
      "Verify that household services rest on the survivors' documented account and time-use data",
      "Prepare the economist to explain the framework's treatment of each survivor's loss",
      "Assemble the reliance file and review the opposing economist's assumptions",
    ],
    questionsToAsk: [
      "How did you derive the consumption percentage, and how does it change with household size?",
      "What worklife did you apply, and how does the result change under a shorter one?",
      "How did you document the decedent's household services, and what wage rates did you apply?",
      "Which of your inputs came from the survivors and how did you verify them?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the reliance materials are final.",
    requiredDocuments: [
      "The final report and the sources behind consumption, worklife, growth, and discount",
      "The survivor questionnaires or interview notes on household services and support",
      "The decedent's earnings and benefit records",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Applying a consumption rate from a household of a different size or income level",
      "Presenting household services without documentation of the decedent's actual role",
      "Ignoring the framework's treatment of consumption, which the opposing economist will apply if the report does not",
    ],
    faqs: [
      {
        question: "Why is personal consumption the most contested assumption?",
        answer:
          "Because it is subtracted from the entire earnings stream, so a small change in the percentage moves the whole figure. The economist supports the rate with household expenditure data matched to the household's size and income and explains why that match is appropriate, and the report shows the result under alternative rates.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "NCHS_LIFE_TABLES", "SKOOG_CIECKA_KRUEGER_2011"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "medical-malpractice",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a medical malpractice matter turns on the two paths and the apportionment between them. Opposing counsel will press the economist on whether the but-for path reflects the outcome proper care would have produced rather than full health, whether the underlying condition's own effect on earnings and life expectancy was accounted for, and whether the future care valued is incremental to the injury. The economist should be able to point to the causation and treating opinions for each input, explain what was taken as given, and show the result under alternative apportionment assumptions.",
    checklist: [
      "Confirm the but-for path in the report matches the causation opinion on the expected outcome with proper care",
      "Verify that only incremental future care was valued and that each item ties to a plan line or treating recommendation",
      "Prepare the economist to explain the treatment of the pre-existing condition's own effect on earnings and life expectancy",
      "Review the sensitivity analysis under alternative apportionment assumptions",
      "Assemble the reliance file and the opposing report",
    ],
    questionsToAsk: [
      "Which medical opinion defines the but-for path, and what did you take as given from it?",
      "How did you separate incremental care from the care the underlying condition would have required?",
      "How does the result change under the opposing side's causation and life expectancy positions?",
      "What did you rely on for the post-injury earnings path?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the causation opinions and the report are final.",
    requiredDocuments: [
      "The final report and the causation and treating opinions it relies on",
      "The life care plan or treating recommendations with incremental items identified",
      "The earnings and benefit records",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Comparing the injured path to full health, which overstates the loss and is the first point opposing counsel makes",
      "Valuing the full life care plan when only part of it is incremental to the injury",
      "Leaving life expectancy to the general tables when the medical opinions address the underlying condition",
    ],
    faqs: [
      {
        question: "How does the economist handle a dispute between medical experts about the expected outcome?",
        answer:
          "By stating which opinion the report relies on and showing the result under the alternative. The economist does not resolve the medical dispute; the report makes the effect of each position visible so the fact finder can apply whichever it accepts.",
      },
    ],
    sources: refsToSources(["CDC_LIFE_TABLES", "BLS_CPI_MEDICAL", "FRE_702"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a motor vehicle accident matter follows the report's structure: the earnings history and the base drawn from it, the dates out of work and the return, the post-injury path and its source, the fringe benefit rate, household services, and the growth and discount assumptions applied to each stream. Opposing counsel will look for an earnings base inflated by overtime or an unusual year, a return to work the report treats as a permanent loss without a supporting opinion, and household services hours that exceed the time-use data. The economist should be ready to explain each choice from the record.",
    checklist: [
      "Confirm the earnings base against the tax returns and explain any overtime or unusual year",
      "Verify the dates out of work and the return against the employer's records",
      "Confirm the post-injury path is supported by a medical or work-capacity opinion",
      "Review the household services hours against time-use data and the person's documented role",
      "Assemble the reliance file and compare assumptions with the opposing report",
    ],
    questionsToAsk: [
      "Why did you select this earnings base, and how does the result change if the unusual year is excluded?",
      "What supports treating the reduced-earnings return to work as a continuing loss?",
      "How did you set the household services hours, and what wage rates did you apply?",
      "Which growth and discount rates did you apply, and what is the net effect?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the reliance materials are final.",
    requiredDocuments: [
      "The final report and its sources",
      "Tax returns, pay stubs, and the employer's attendance and return-to-work records",
      "The medical or work-capacity opinions the post-injury path relies on",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Building the base on a peak overtime year without explaining why it is representative",
      "Treating a return to work as a permanent partial loss with no opinion in the record supporting the reduction",
      "Applying household services hours that exceed what time-use data and the person's schedule support",
    ],
    faqs: [
      {
        question: "What if the injured person's earnings recovered after the report was written?",
        answer:
          "The economist updates the post-injury path and issues a supplemental calculation. The engagement should anticipate updates, and the deposition preparation should cover what the report would show under the recovered earnings so the economist is not surprised by the question.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ATUS", "TREASURY_YIELD"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a traumatic brain injury matter centers on the inputs the economist took from others and on how the components reconcile. Opposing counsel will ask where the post-injury work capacity came from, whether the earnings path for a young person rests on the record or on optimism, how attendant care and supervision hours in the life care plan relate to the household services claim, and which growth rate was applied to each care category. The economist should be able to name the source of every input, show that the components do not overlap, and explain the sensitivity of the total to the plan's largest items.",
    checklist: [
      "Confirm the source of the post-injury work capacity used in the report and that it matches the current opinion",
      "Verify the but-for path for a young person against school records, family history, and occupational data",
      "Reconcile attendant care and supervision hours in the plan with the household services claim",
      "Review the growth rates applied by care category and the sensitivity of the total to the largest plan items",
      "Assemble the reliance file and the opposing report",
    ],
    questionsToAsk: [
      "What did you rely on for the post-injury earning capacity, and did you form any opinion of your own on it?",
      "How did you avoid counting supervision hours in the plan and household services for the same time?",
      "How does the total change if the largest care items are removed or reduced?",
      "What supports the educational attainment assumption for a young claimant?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the life care plan, the work-capacity opinion, and the report are final.",
    requiredDocuments: [
      "The final report and the item-level tables tying each valued item to the plan",
      "The neuropsychological, treating, and work-capacity opinions",
      "School records, earnings history, and family history for a young claimant",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Letting the economist appear to have formed a work-capacity opinion, which invites a motion to limit the testimony",
      "Valuing supervision in the plan and household services for overlapping hours",
      "Applying one growth rate to every care category without explaining why",
    ],
    faqs: [
      {
        question: "How should the economist answer a question about what the injured person can still do?",
        answer:
          "By identifying the medical or vocational finding the report relied on and stating that the economist priced it rather than formed it. The economist can explain how the result changes under a different capacity assumption, but the capacity opinion itself belongs to the experts who prepared it.",
      },
    ],
    sources: refsToSources(["BLS_OES", "BLS_CPI_MEDICAL", "KUMHO_TIRE"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a spinal cord injury matter focuses on the present value of the life care plan and the assumptions that drive it: the growth rate for each care category, the discount rate, the life expectancy applied, the replacement cycles for equipment and modifications, and the reconciliation of attendant care with household services. Because the plan is usually the largest component, opposing counsel will test whether the economist valued the plan as authored, whether the growth rates are supported by the medical price data appropriate to each category, and whether the life expectancy follows the medical opinion or the general tables.",
    checklist: [
      "Confirm every valued item ties to a plan line with the plan's frequency, duration, and unit cost",
      "Review the growth rate for each category and its source in the price data",
      "Confirm the life expectancy applied and its basis in the medical opinion or the tables",
      "Reconcile attendant care hours with the household services claim",
      "Prepare the economist to show the total under alternative growth, discount, and life expectancy assumptions",
    ],
    questionsToAsk: [
      "Why does attendant care grow at a different rate from equipment and supplies?",
      "What life expectancy did you apply, and what is the result under the opposing side's figure?",
      "How did you treat items the plan lists as optional or conditional?",
      "What is the net effect of your growth and discount rates on the largest item?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the plan and the report are final.",
    requiredDocuments: [
      "The final report with item-level present value tables",
      "The life care plan with its cost tables and life expectancy basis",
      "The medical opinions on life expectancy and work capacity",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Valuing an item differently from the plan without documenting the reason and consulting the plan's author",
      "Applying a medical growth rate to non-medical items such as attendant care or transportation",
      "Failing to present the net discount effect so the fact finder cannot see how growth and discount interact",
    ],
    faqs: [
      {
        question: "How does the economist explain the net discount rate?",
        answer:
          "As the difference between how fast the cost of an item is expected to rise and how much a dollar invested today would earn over the same period. When the two are stated by category and their sources are given, the fact finder can see that the present value is a calculation, not a judgment call.",
      },
    ],
    sources: refsToSources(["BLS_CPI_MEDICAL", "TREASURY_YIELD", "JONES_LAUGHLIN_PFEIFER"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "workers-compensation",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a workers' compensation matter depends on which question the report answers. For a benefit-stream present value the questions are the schedule applied, the mortality assumption, and the discount rate. For a third-party report they are the wage base, the post-injury path, the components the compensation system does not pay, and how paid benefits are presented. For a loss of earning capacity determination they are the pre-injury wage and the post-injury wage the record supports. The economist should be ready to keep the compensation measure and the civil measure separate and to explain how the same facts support both.",
    checklist: [
      "Confirm the report answers the question the proceeding actually presents",
      "Review the benefit schedule, mortality, and discount assumptions for a benefit-stream valuation",
      "For a third-party report, confirm the paid benefits are presented separately from the gross loss",
      "Confirm the post-injury wage assumption matches the work-capacity opinion in the record; where that opinion was coordinated with a vocational specialist, confirm the economist priced it rather than formed it",
      "Assemble the reliance file and the opposing report",
    ],
    questionsToAsk: [
      "What schedule and payment history did you rely on, and how did you treat benefits already paid?",
      "Which mortality table and discount rate did you apply to the benefit stream, and why?",
      "How did you set the post-injury wage, and what supports it?",
      "How do the compensation measure and the civil measure differ in your report, and why are both stated?",
    ],
    timeline: "One preparation session in the week before the deposition for a benefit-stream valuation; one to two sessions in the two weeks before for a third-party damages report.",
    requiredDocuments: [
      "The final report and the schedule or payment history it relies on",
      "Employer wage records and tax returns",
      "The work-capacity opinions in the record and post-injury earnings records",
      "The opposing report",
    ],
    pitfalls: [
      "Mixing the compensation system's measure of loss with the civil measure in one figure",
      "Netting paid benefits into the loss before counsel has decided how liens and offsets will be presented",
      "Applying a discount rate to the benefit stream without stating its source",
    ],
    faqs: [
      {
        question: "Will the economist be asked about the medical treatment projection?",
        answer:
          "Only about how it was valued. The items, frequencies, and costs come from the providers or from a projection prepared by others; the economist applies cost growth and discounts the stream. The economist should identify the source of the projection and confine the testimony to the valuation.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "TREASURY_YIELD", "CDC_LIFE_TABLES"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "employment-discrimination",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in an employment discrimination matter concentrates on the but-for compensation path, the front pay period, and mitigation. Opposing counsel will test whether the raises, bonuses, and promotions in the but-for path are supported by the employer's practices and comparator data, whether the front pay period rests on evidence about the employee's age, occupation, and job market, and whether replacement earnings were measured from the actual job search rather than assumed. The economist should be able to show the back pay, front pay, and benefit components separately and the result under alternative front pay periods and mitigation assumptions.",
    checklist: [
      "Confirm each element of the but-for path is tied to a policy, a comparator, or the employee's own history",
      "Review the front pay period and its evidentiary basis",
      "Verify the replacement earnings against the job search record and the replacement employer's records",
      "Confirm the benefit and equity components are valued from plan documents",
      "Assemble the reliance file and compare assumptions with the opposing report",
    ],
    questionsToAsk: [
      "What supports each raise and promotion in the but-for path?",
      "How did you set the front pay period, and how does the total change under a shorter one?",
      "How did you treat periods when the employee was not searching for work?",
      "How did you value the equity awards the employee would have received?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the employer's compensation records are final.",
    requiredDocuments: [
      "The final report with back pay, front pay, and benefits shown separately",
      "The employer's compensation policies and comparator data relied on",
      "The job search record and replacement employment records",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Building the but-for path on promotions the record does not support",
      "Presenting a front pay period with no stated basis",
      "Ignoring gaps in the job search, which the opposing economist will use to impute replacement earnings",
    ],
    faqs: [
      {
        question: "How does the economist address a claim that the employee failed to mitigate?",
        answer:
          "By presenting the job search record and the replacement earnings actually received, and by showing the result under the alternative that the opposing side proposes. Whether the search was reasonable is a question for the fact finder; the economist's role is to make the effect of each position visible.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "FRCP_26"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "wrongful-termination",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a wrongful termination matter covers the compensation the employee lost, the benefit accruals that stopped, the front pay period, and the replacement earnings. Opposing counsel will press on the expected tenure behind the front pay period, on whether pension and retiree health losses were valued from the plan terms rather than estimated, and on the job search. The economist should be able to show each component separately, explain the tenure and job market evidence behind the front pay period, and present the result under the alternatives the opposing side is likely to propose.",
    checklist: [
      "Confirm the pension and retiree health losses are valued from the plan documents",
      "Review the front pay period against the employee's age, occupation, tenure, and job market evidence",
      "Verify the replacement earnings against the job search record",
      "Confirm the but-for raises and bonuses are supported by the employer's practices",
      "Assemble the reliance file and the opposing report",
    ],
    questionsToAsk: [
      "How did you value the pension loss, and what plan terms did you rely on?",
      "What evidence supports the front pay period, and what is the result under a shorter one?",
      "How did you treat replacement work with lower pay or fewer benefits?",
      "How did you handle the period before the employee found work?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the plan records are final.",
    requiredDocuments: [
      "The final report with each component shown separately",
      "Pension, retiree health, and equity plan documents",
      "Employer pay records and the job search and replacement employment records",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Estimating pension losses without the plan's benefit formula and vesting terms",
      "Asserting a long front pay period for an employee whose occupation has a ready job market",
      "Leaving the replacement job's benefits out of the comparison",
    ],
    faqs: [
      {
        question: "Why is the front pay period the most contested assumption in a termination case?",
        answer:
          "Because it sets how long the loss continues and there is no record of the future to check it against. The economist supports the period with the employee's age, occupation, tenure, and the time comparable work reasonably takes to find, and shows the total under alternative periods so the fact finder can see what the assumption moves.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "TREASURY_YIELD"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "commercial-contract-dispute",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a commercial contract dispute focuses on the but-for revenue, the incremental cost treatment, the damages period, and the discount rate. Opposing counsel will test whether the revenue projection rests on the contract terms and the business's history or on the business's hopes, whether costs treated as fixed would in fact have been avoided, whether replaced revenue was credited, and whether the discount rate reflects the risk of the lost profits. The economist should be able to trace every figure to the ledger, the contract, or the pre-dispute projections and to show the result under alternative cost and period assumptions.",
    checklist: [
      "Confirm the but-for revenue ties to the contract terms, historical results, and pre-dispute projections",
      "Review the incremental cost treatment account by account against the ledger",
      "Verify that post-breach replacement revenue was credited",
      "Confirm the damages period matches the claim and the contract's remaining term",
      "Prepare the economist to explain the discount rate and the risk it reflects",
    ],
    questionsToAsk: [
      "What supports the but-for revenue, and how does the result change under the historical growth rate alone?",
      "Which costs did you treat as incremental, and what in the ledger supports each?",
      "How did you account for revenue the business replaced after the breach?",
      "Why did you select this discount rate for the lost profits?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the financial records are final.",
    requiredDocuments: [
      "The final report with the revenue, cost, and present value schedules",
      "The contract, pre-dispute projections, and the general ledger detail relied on",
      "Post-breach financial results",
      "The opposing expert's report",
    ],
    pitfalls: [
      "Projecting but-for revenue from a growth rate the business never achieved",
      "Treating costs as fixed that the ledger shows varying with volume",
      "Applying a risk-free discount rate to profits that carried business risk without explaining why",
    ],
    faqs: [
      {
        question: "How does the economist defend the incremental cost treatment?",
        answer:
          "By showing, account by account, how each cost behaved with volume in the business's own records before the breach. Costs that moved with revenue are treated as incremental and deducted; costs that did not are not. The ledger analysis is the support, and the report shows the margin under alternative treatments.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "TREASURY_YIELD", "GE_JOINER"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "partnership-and-shareholder-dispute",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a partnership or shareholder dispute covers the valuation report from the standard of value through the reconciliation of approaches. Opposing counsel will test the normalization adjustments, the capitalization or discount rate, the selection and adjustment of market comparables, the weighting of approaches, and any discounts for lack of control or marketability. The economist should be able to explain why the standard of value applied fits the claim, support each normalization adjustment from the records, and show the value under the alternative assumptions the opposing valuation adopts.",
    checklist: [
      "Confirm the standard of value, valuation date, and premise in the report match the claim and the agreements",
      "Review each normalization adjustment and its support in the compensation and related-party records",
      "Prepare the economist to explain the capitalization or discount rate and the market comparables",
      "Review the discounts applied or excluded and the basis for each under the standard",
      "Compare the opposing valuation's inputs and prepare a reconciliation",
    ],
    questionsToAsk: [
      "Why is this the correct standard of value for the claim, and what changes under the other standard?",
      "What supports each normalization adjustment?",
      "How did you select the comparables and adjust them for size and growth?",
      "How does the conclusion change if the opposing valuation's rate is applied?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the valuation report and the opposing valuation are served.",
    requiredDocuments: [
      "The valuation report with its schedules and reconciliation",
      "The normalized financial statements and the records supporting each adjustment",
      "The governing agreements and prior transactions in the equity",
      "The opposing valuation report",
    ],
    pitfalls: [
      "Applying discounts the standard of value for the claim excludes, or omitting ones it permits",
      "Normalizing owner compensation without market data for the replacement cost of the owner's services",
      "Weighting the approaches without a stated reason",
    ],
    faqs: [
      {
        question: "What is the most common point of disagreement between opposing valuations?",
        answer:
          "The rate applied to the earnings stream and the normalization of owner compensation, because small changes in either move the value materially. The economist supports the rate from market data and the adjustments from the company's records, and the reconciliation shows how much of the gap between the two valuations each disagreement explains.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "FRE_702"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "divorce-and-marital-dissolution",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a divorce or marital dissolution matter covers the business valuation, the income determination, and any tracing or lifestyle analysis. Opposing counsel will test the valuation date, the goodwill treatment, the normalization of owner compensation and personal expenses, the income figure for support, and the documents relied on for tracing separate property. The economist should be able to show how the personal expenses run through the business affected both the valuation and the income figure, and how each tracing step ties to an account statement.",
    checklist: [
      "Confirm the valuation date and goodwill treatment match the framework the court applies",
      "Review the normalization adjustments for owner compensation and personal expenses against the ledger",
      "Confirm the income for support reconciles to the business's cash flow and the tax returns",
      "Verify each tracing step against account statements",
      "Compare the opposing report's inputs and prepare a reconciliation",
    ],
    questionsToAsk: [
      "How did you separate personal goodwill from enterprise goodwill, and what supports the split?",
      "Which personal expenses did you add back, and how did you identify them?",
      "How does the income for support differ from the reported compensation, and why?",
      "What documents support each step of the tracing?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the opposing report are served.",
    requiredDocuments: [
      "The valuation and income report with its schedules",
      "The general ledger detail and the personal expense analysis",
      "Account statements supporting the tracing",
      "The opposing expert's report",
    ],
    pitfalls: [
      "Valuing as of a date the framework does not use",
      "Adding back personal expenses without ledger support for each",
      "Presenting a tracing that skips steps where statements are missing, rather than stating the gap",
    ],
    faqs: [
      {
        question: "How does the economist explain a difference between the owner's tax return income and the income for support?",
        answer:
          "By showing the cash flow the business generated for the owner beyond salary: distributions, personal expenses paid by the business, and retained earnings available to the owner. Each item is tied to the ledger or the tax return so the fact finder can see where the difference comes from.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "FRCP_26"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "fraud-and-embezzlement",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a fraud or embezzlement matter focuses on the reconstruction: how each transaction was identified as part of the scheme, how the amounts were confirmed against external records, how periods with missing records were handled, and how the traced funds were followed forward. Opposing counsel will test whether transactions were included on assumption rather than evidence, whether the consequential losses were caused by the diversion, and whether the chain of custody for the records is intact. The economist should be able to walk through the method transaction type by transaction type and separate what was proven from what was estimated.",
    checklist: [
      "Confirm each transaction in the loss schedule ties to a bank record or third-party document",
      "Review the treatment of periods with missing records and the basis for any estimate",
      "Verify the causal link between the diversion and each consequential loss claimed",
      "Confirm the chain of custody for every record the expert received",
      "Prepare the economist to distinguish the direct loss, consequential losses, and traced assets",
    ],
    questionsToAsk: [
      "How did you decide which transactions belonged to the scheme?",
      "What did you rely on to confirm amounts outside the internal books?",
      "How did you handle periods with no bank records, and how much of the total rests on estimate?",
      "How did you establish that each consequential loss was caused by the diversion?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the reconstruction and the opposing report are final.",
    requiredDocuments: [
      "The loss schedule with each transaction tied to its source document",
      "Bank statements, cancelled checks, and wire records for the period",
      "The chain of custody log",
      "The opposing expert's report",
    ],
    pitfalls: [
      "Including transactions in the loss on pattern alone without a supporting record",
      "Blending estimated amounts for missing periods into the proven total without labeling them",
      "Claiming consequential losses the business would have incurred regardless",
    ],
    faqs: [
      {
        question: "What is the most effective way to present a loss reconstruction at deposition?",
        answer:
          "As a schedule where every line carries its source document and its transaction type, with proven and estimated amounts labeled separately. When opposing counsel can trace any line to a bank record, the argument shifts from whether the loss occurred to how much of the estimated portion should count.",
      },
    ],
    sources: refsToSources(["ACFE", "FRE_702", "DAUBERT"]),
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "product-liability",
    dateModified: MODIFIED,
    intro:
      "Deposition preparation in a product liability matter follows the injury or death pattern with added attention to the claimant's but-for path. For a child or student, opposing counsel will test the educational attainment assumption and the occupational data used to price it; for a homemaker or retiree, the household services hours and wage rates; for a worker, the same earnings, benefits, and care assumptions as any injury claim. The economist should be able to support the attainment assumption from the family and school record, tie the household services to time-use data and the claimant's documented role, and show the result under alternatives.",
    checklist: [
      "Review the educational attainment assumption and its support for a child or student claimant",
      "Verify the household services hours and wage rates for a homemaker or retiree claimant",
      "Confirm the life expectancy and worklife applied and their basis",
      "Confirm the future care valued ties to the plan or the treating recommendations",
      "Assemble the reliance file and the opposing report",
    ],
    questionsToAsk: [
      "What supports the educational attainment assumption, and what is the result under a lower attainment level?",
      "How did you set the household services hours and rates?",
      "What life expectancy did you apply, and what changes under the opposing side's figure?",
      "Which inputs came from other experts?",
    ],
    timeline: "One to two preparation sessions in the two weeks before the deposition, after the report and the reliance materials are final.",
    requiredDocuments: [
      "The final report and the sources behind attainment, hours, and rates",
      "School records, family history, or the household documentation relied on",
      "The medical opinions on work restrictions and life expectancy",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Assuming the highest plausible attainment for a child without record support",
      "Applying adult worklife assumptions to a claimant who was retired or not in the workforce",
      "Using national wage rates for household services where local rates are available",
    ],
    faqs: [
      {
        question: "How does the economist support a lost earning capacity figure for a young child?",
        answer:
          "By stating the attainment assumption and its basis in the family and school record, pricing it with earnings data by educational level, applying a worklife expectancy, and showing the result under alternative attainment levels. The sensitivity table lets the fact finder choose the path the evidence supports.",
      },
    ],
    sources: refsToSources(["CENSUS_ACS", "BLS_ATUS", "SKOOG_CIECKA_KRUEGER_2011"]),
  },
  // ── Trial Testimony ───────────────────────────────────────────
  {
    stage: "trial",
    caseTypeSlug: "personal-injury",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a personal injury matter has three jobs: to show the jury what the loss consists of, component by component; to explain present value in plain terms so the jury understands why a future loss is stated as a smaller number today; and to answer the opposing economist's report point by point. Demonstratives should follow the report's structure, from the earnings base to the post-injury path to the present value of each component, and every figure on a board should be traceable to a table in the report. Counsel should plan the direct examination so the assumptions the opposing side will attack are explained before cross rather than after.",
    checklist: [
      "Prepare demonstratives showing the but-for path, the post-injury path, and the gap between them by year",
      "Prepare a plain-language present value explanation with a simple example the jury can follow",
      "Prepare a side-by-side of the two economists' assumptions and the effect of each difference",
      "Rehearse direct examination on the assumptions most likely to be attacked on cross",
      "Confirm every number on a demonstrative ties to a table in the report",
    ],
    questionsToAsk: [
      "How will you explain present value to a jury in one or two minutes?",
      "Which of the opposing economist's assumptions account for most of the difference between the two reports?",
      "How will you handle a cross-examination question about an assumption you could have set differently?",
      "Can you present the loss under the jury's choice of assumptions if the court permits it?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the demonstratives are drafted and the opposing report has been analyzed.",
    requiredDocuments: [
      "The final report and its tables",
      "Draft demonstratives and the sensitivity tables behind them",
      "The opposing economist's report and deposition transcript",
      "The economist's own deposition transcript",
    ],
    pitfalls: [
      "Presenting a single total with no visible components, which leaves the jury nothing to reason with",
      "Explaining present value with jargon rather than a concrete example",
      "Ignoring the opposing report until cross, so the differences are framed by the other side",
    ],
    faqs: [
      {
        question: "How does the economist explain present value to a jury?",
        answer:
          "As the amount that, invested today at a stated rate, would grow to cover each year's loss as it comes due. A short example with a single future payment shows the idea, and the report's year-by-year table shows how the same arithmetic produces the total. The explanation is the same whether the number is large or small.",
      },
    ],
    sources: refsToSources(["JONES_LAUGHLIN_PFEIFER", "TREASURY_YIELD", "FRE_702"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "wrongful-death",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a wrongful death matter asks the economist to translate a household's loss into a number the jury can follow: what the decedent earned and would have earned, what the decedent would have spent personally, what the decedent did in the home, and what each of those streams is worth today. Demonstratives should show the components separately and, where the framework requires it, by survivor. The opposing economist will usually differ on consumption, worklife, and household services, and the direct examination should explain those choices before cross so the jury hears the reasoning first.",
    checklist: [
      "Prepare demonstratives for the earnings stream, the consumption deduction, household services, and support by survivor",
      "Prepare a plain-language explanation of consumption and why it is deducted",
      "Prepare a comparison of the two economists' consumption, worklife, and household services assumptions",
      "Rehearse direct examination on how the survivors' account of household services was documented",
      "Confirm the present value explanation and the discount rate source",
    ],
    questionsToAsk: [
      "How will you explain the consumption deduction without making it sound like the decedent's worth is being reduced?",
      "How will you show household services in a way the jury can picture?",
      "Where do you and the opposing economist differ, and what does each difference move?",
      "How will you present the loss by survivor if the framework requires it?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the demonstratives are drafted and the opposing report has been analyzed.",
    requiredDocuments: [
      "The final report with the consumption, worklife, and household services tables",
      "Draft demonstratives",
      "The survivor documentation relied on for household services",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting the consumption deduction as a technicality rather than explaining what it measures",
      "Showing household services as a lump sum instead of hours, tasks, and rates the jury can evaluate",
      "Leaving the discount rate source unexplained, which the opposing side uses to suggest the total is arbitrary",
    ],
    faqs: [
      {
        question: "How is the household services loss made concrete for a jury?",
        answer:
          "By showing the tasks the decedent performed, the hours they took in a typical week based on the survivors' account and time-use data, the cost of hiring someone to do each, and how long the need continues. Presented that way the figure is a replacement cost the jury can check against its own experience.",
      },
    ],
    sources: refsToSources(["BLS_CEX", "BLS_ATUS", "JONES_LAUGHLIN_PFEIFER"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "medical-malpractice",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a medical malpractice matter requires the economist to present the two paths clearly: what the patient would have earned and needed with proper care, what the patient will earn and need now, and the difference between them as a present value. Demonstratives should show both paths on the same chart so the jury sees that the loss is incremental, and the direct examination should identify which medical opinions each path relies on. The opposing economist will usually differ on apportionment and life expectancy, and the sensitivity tables let the jury see what each position moves.",
    checklist: [
      "Prepare a demonstrative showing the but-for path and the injured path on one chart",
      "Prepare demonstratives for the incremental care and its present value by category",
      "Identify on the record which medical opinion supports each input",
      "Prepare a comparison of the two economists' apportionment and life expectancy assumptions",
      "Rehearse the present value explanation",
    ],
    questionsToAsk: [
      "How will you show the jury that the loss is the difference between two paths rather than the whole injured path?",
      "How will you handle a cross question that assumes the underlying condition would have caused the same loss?",
      "What does the total look like under the opposing side's life expectancy?",
      "Which inputs did you take from the medical experts, and how will you say so on direct?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the medical testimony order is set and the demonstratives are drafted.",
    requiredDocuments: [
      "The final report with the two-path tables",
      "The causation and treating opinions relied on",
      "Draft demonstratives",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting the injured path alone, which the opposing side reframes as a claim for the underlying condition",
      "Testifying before the medical experts establish the but-for outcome the report relies on",
      "Failing to state which medical opinion supports each input, so the economist appears to have chosen sides on causation",
    ],
    faqs: [
      {
        question: "What if the jury rejects the causation opinion the report relies on?",
        answer:
          "The sensitivity tables show the loss under the alternative outcome, so the jury can apply the medical conclusion it reaches to the economic figures. The economist presents both so the report remains useful whichever way the causation question is decided.",
      },
    ],
    sources: refsToSources(["CDC_LIFE_TABLES", "FRE_702", "KUMHO_TIRE"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a motor vehicle accident matter scales with the claim. For a bounded loss the economist may need only a short direct examination on the past wages and a modest future period. For a catastrophic crash the testimony covers every component and the present value of each, with demonstratives showing the earnings gap by year, the household services replacement cost, and the life care plan's present value by category. In either case the jury needs to see where the numbers came from, and the opposing economist's differences should be explained on direct rather than discovered on cross.",
    checklist: [
      "Scale the demonstratives to the claim: a single timeline for a bounded loss, component boards for a catastrophic one",
      "Prepare the earnings gap by year and the present value explanation",
      "Identify the source of the post-injury path on direct; where that opinion was coordinated with a vocational specialist, say so plainly",
      "Prepare a comparison of the two economists' assumptions and what each difference moves",
      "Confirm every board figure ties to a report table",
    ],
    questionsToAsk: [
      "How will you present a continuing loss for a person who has returned to work?",
      "How will you explain the growth and discount rates so the jury sees them as a pair?",
      "Which of the opposing economist's differences matter most, and how will you address them on direct?",
      "How will you handle cross on an unusual earnings year?",
    ],
    timeline: "One preparation session in the week before testimony for a bounded loss; one to two sessions for a catastrophic claim.",
    requiredDocuments: [
      "The final report and its tables",
      "Draft demonstratives",
      "The employer records and the work-capacity opinions relied on",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Overbuilding demonstratives for a modest claim, which suggests the loss is being inflated",
      "Presenting the return to work as irrelevant rather than explaining why the reduced earnings continue the loss",
      "Leaving the growth and discount rates unpaired, so the jury hears only one and doubts the other",
    ],
    faqs: [
      {
        question: "How should the economist address a return to work on direct examination?",
        answer:
          "Directly: the person is working, the work pays less or offers less than the prior path, and the loss is the difference over the remaining worklife. Showing the two paths on one chart makes the point without overstatement and takes the issue away from cross.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "TREASURY_YIELD", "JONES_LAUGHLIN_PFEIFER"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a traumatic brain injury matter asks the economist to present a large claim built from other experts' inputs without appearing to vouch for those inputs. The direct examination should state plainly which findings the economist relied on for work capacity, supervision, and care, and then show the jury how each was priced: the earnings gap by year, the supervision and attendant care hours and rates, and the present value of the plan by category. Demonstratives that separate the components and show the sensitivity to the largest items give the jury a way to adjust the number if it accepts only part of the plan.",
    checklist: [
      "Prepare demonstratives for the earnings gap, supervision and care hours, and the plan's present value by category",
      "State on direct which expert supplied each input and what the economist did with it",
      "Prepare a sensitivity board showing the total under the largest alternative assumptions",
      "Prepare a comparison of the two economists' growth, discount, and worklife assumptions",
      "Rehearse the present value explanation using a care item the jury can picture",
    ],
    questionsToAsk: [
      "How will you make clear that you priced the work capacity finding rather than formed it?",
      "How will you show the jury the total under a reduced plan if it does not accept every item?",
      "How will you explain the growth rate for care against the discount rate?",
      "Which of the opposing economist's differences move the total most?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, sequenced after the medical and plan testimony so the economist's inputs are already in evidence.",
    requiredDocuments: [
      "The final report with item-level present value tables",
      "The work-capacity, neuropsychological, and plan testimony or reports",
      "Draft demonstratives and sensitivity tables",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Testifying before the plan and work-capacity evidence is in, so the economist's inputs have no foundation",
      "Presenting the plan's present value as one number, which forces the jury to accept or reject it whole",
      "Appearing to defend the plan's medical content instead of its pricing",
    ],
    faqs: [
      {
        question: "How does the economist respond when the opposing economist uses a much shorter worklife?",
        answer:
          "By explaining the worklife tables relied on, the age and education inputs, and what the shorter figure assumes about the person's but-for path. The side-by-side board shows the effect of the difference so the jury can weigh which assumption fits the evidence.",
      },
    ],
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_CPI_MEDICAL", "FRE_702"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a spinal cord injury matter centers on the present value of lifetime care and the earnings loss, both of which the jury needs to see built up from parts. Demonstratives should show attendant care hours and rates by year, equipment replacement cycles, and the growth and discount pair applied to each category, so that the total is the visible result of arithmetic the jury has watched. The opposing economist typically differs on life expectancy, growth rates, and the discount rate; the direct examination should present those choices and their sources before cross, and the sensitivity board should show the total under the alternatives.",
    checklist: [
      "Prepare demonstratives showing attendant care, equipment, supplies, and modifications by category and year",
      "Prepare a board pairing the growth rate and discount rate for each category with its source",
      "Prepare the life expectancy explanation and the total under the alternative figure",
      "Prepare a comparison of the two economists' assumptions and what each difference moves",
      "Confirm every board figure ties to a plan line and a report table",
    ],
    questionsToAsk: [
      "How will you explain why care costs grow at one rate and the discount rate is another?",
      "How will you present life expectancy without appearing to give a medical opinion?",
      "What does the total look like under the opposing economist's rates?",
      "How will you show the jury what happens to the number if a large plan item is removed?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, sequenced after the medical and plan testimony.",
    requiredDocuments: [
      "The final report with item-level present value tables",
      "The life care plan and the medical opinions on life expectancy",
      "Draft demonstratives and sensitivity tables",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting a single lifetime total with no visible build-up",
      "Explaining the discount rate without its growth rate partner, which makes the reduction look arbitrary",
      "Defending the plan's medical choices instead of confining the testimony to their valuation",
    ],
    faqs: [
      {
        question: "How does the economist handle a cross-examination about the discount rate?",
        answer:
          "By stating its source, explaining that it is paired with a growth rate for each category, and showing the total under the opposing rate. When the jury sees that the economist has already computed the alternative, the question loses its force.",
      },
    ],
    sources: refsToSources(["TREASURY_YIELD", "BLS_CPI_MEDICAL", "JONES_LAUGHLIN_PFEIFER"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "workers-compensation",
    dateModified: MODIFIED,
    intro:
      "Testimony in a workers' compensation matter is more often before a hearing officer or in a third-party trial than before a jury on the compensation claim itself. For a benefit determination or settlement hearing the economist presents the wage base, the post-injury wage, and the present value of the benefit stream with its assumptions stated. For a third-party trial the testimony resembles any personal injury case, with the added need to present the benefits already paid separately so the court can apply the lien and offset rules. Demonstratives should keep the compensation measure and the civil measure on separate boards.",
    checklist: [
      "Prepare a board for the wage base, the post-injury wage, and the resulting loss of earning capacity where that is the measure",
      "Prepare the benefit-stream present value with mortality and discount assumptions stated",
      "For a third-party trial, prepare separate boards for the gross loss and the benefits paid",
      "Prepare the present value explanation for the fact finder",
      "Prepare a comparison of the opposing economist's assumptions",
    ],
    questionsToAsk: [
      "How will you present the compensation measure and the civil measure without confusing them?",
      "How will you explain the mortality and discount assumptions behind the benefit stream?",
      "How will you handle cross about benefits already paid?",
      "What does the loss look like under the opposing post-injury wage?",
    ],
    timeline: "One preparation session in the week before a hearing; one to two sessions before a third-party trial.",
    requiredDocuments: [
      "The final report and its tables",
      "The benefit schedule and the carrier's payment history",
      "The work-capacity opinions and post-injury earnings records",
      "The opposing economist's report",
    ],
    pitfalls: [
      "Combining the compensation and civil measures on one board",
      "Netting paid benefits into the loss before the court has ruled on how they are treated",
      "Testifying about the treatment projection's content rather than its valuation",
    ],
    faqs: [
      {
        question: "Does the economist's testimony differ before a hearing officer and before a jury?",
        answer:
          "In presentation more than substance. Before a hearing officer the testimony can go directly to the schedule, the assumptions, and the present value. Before a jury in a third-party trial the economist explains the components and present value in plain terms and keeps the compensation system's figures separate for the court.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "TREASURY_YIELD", "NAFE"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "employment-discrimination",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in an employment discrimination matter asks the economist to show the jury two compensation paths year by year: what the employee would have earned and accrued, and what the employee actually earned and can reasonably expect to earn. Demonstratives should separate back pay, front pay, and benefits, show the mitigation earnings credited, and make the front pay period visible as a choice with a stated basis. The opposing economist typically differs on the but-for raises, the front pay period, and mitigation, and the direct examination should present those choices and the evidence behind them before cross.",
    checklist: [
      "Prepare a year-by-year board of the but-for path and the actual path with the gap",
      "Prepare separate boards for back pay, front pay, and benefits",
      "Prepare the mitigation board showing replacement earnings credited and the job search record",
      "Prepare a comparison of the two economists' front pay periods and but-for assumptions",
      "Rehearse the present value explanation for the front pay component",
    ],
    questionsToAsk: [
      "How will you explain the front pay period as a reasoned choice rather than a guess?",
      "How will you show mitigation in a way that does not concede the opposing side's position?",
      "What does the total look like under the opposing economist's front pay period?",
      "How will you explain the value of lost equity or bonus components?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, with the back pay figure updated to the trial date.",
    requiredDocuments: [
      "The final report updated to the trial date",
      "Draft demonstratives",
      "The employer's compensation records and comparator data relied on",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting a total without separating back pay, front pay, and benefits, which the court may need to treat differently",
      "Failing to update the back pay to the trial date",
      "Leaving the front pay period unexplained on direct",
    ],
    faqs: [
      {
        question: "Why does the economist separate back pay, front pay, and benefits at trial?",
        answer:
          "Because the court may decide them differently: back pay is a record-based figure to a date, front pay is a projection that may be decided by the court rather than the jury in some settings, and benefits have their own plan-based valuation. Separate boards let the fact finder apply its findings to each without recomputing the whole.",
      },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECI", "FRE_702"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "wrongful-termination",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a wrongful termination matter presents the compensation the employee lost, the benefit accruals that ended, the front pay period, and the replacement earnings, with each component on its own board. For a long-tenured employee the pension and retiree health losses need a plain-language explanation of what the employee was accruing and how the termination cut it off. The opposing economist typically argues for a shorter front pay period and higher replacement earnings; the direct examination should present the tenure and job market evidence behind the economist's period and show the total under the alternative.",
    checklist: [
      "Prepare boards for back pay, front pay, benefits, and pension losses",
      "Prepare a plain-language explanation of the pension and retiree health losses",
      "Prepare the mitigation board with the job search record and replacement earnings",
      "Prepare a comparison of the two economists' front pay periods and replacement earnings assumptions",
      "Rehearse the present value explanation",
    ],
    questionsToAsk: [
      "How will you explain a pension loss to a jury that has never seen a plan formula?",
      "What evidence supports the front pay period, and how will you present it?",
      "What does the total look like under the opposing economist's period?",
      "How will you handle cross on a replacement job that pays less?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, with the back pay figure updated to the trial date.",
    requiredDocuments: [
      "The final report updated to the trial date",
      "The pension and retiree health plan documents relied on",
      "Draft demonstratives",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting the pension loss as a number without explaining what was accruing",
      "Failing to show the replacement earnings credited, which lets the opposing side suggest they were ignored",
      "Leaving the front pay period to be characterized by cross",
    ],
    faqs: [
      {
        question: "How is a pension loss explained at trial?",
        answer:
          "By showing what the employee would have received at retirement under the plan's formula with continued service, what the employee will receive with service ending at termination, and the present value of the difference. A simple year-by-year board of the two benefit streams makes the loss concrete.",
      },
    ],
    sources: refsToSources(["BLS_ECEC", "TREASURY_YIELD", "JONES_LAUGHLIN_PFEIFER"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "commercial-contract-dispute",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a commercial contract dispute asks the economist to show the fact finder the but-for revenue, the incremental costs, the resulting lost margin, and the present value of the future portion, each traceable to the contract, the ledger, or the pre-dispute projections. Demonstratives should show revenue and margin by period, with replaced revenue credited, and a board should pair the discount rate with the risk it reflects. The opposing expert typically differs on but-for revenue, cost treatment, and the discount rate; the direct examination should explain each of those choices from the business's own records before cross.",
    checklist: [
      "Prepare boards for but-for revenue, incremental costs, and lost margin by period",
      "Prepare a board showing replaced revenue and its credit against the loss",
      "Prepare the discount rate explanation and the total under the opposing rate",
      "Prepare a comparison of the two experts' assumptions and what each difference moves",
      "Confirm every board figure ties to a report schedule and a source document",
    ],
    questionsToAsk: [
      "How will you show that the but-for revenue rests on the business's records rather than its projections alone?",
      "How will you explain incremental costs to a fact finder without an accounting background?",
      "What does the total look like under the opposing expert's cost treatment?",
      "How will you present the discount rate and the risk it reflects?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the demonstratives are drafted and the opposing report has been analyzed.",
    requiredDocuments: [
      "The final report with revenue, cost, and present value schedules",
      "The contract, pre-dispute projections, and ledger detail relied on",
      "Draft demonstratives",
      "The opposing expert's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting lost revenue as if it were lost profit",
      "Showing a margin without the cost analysis that supports it",
      "Explaining the discount rate as a formula rather than as the risk that the profits would have carried",
    ],
    faqs: [
      {
        question: "How does the economist rebut an opposing expert who says the business would have failed anyway?",
        answer:
          "With the business's own pre-dispute record: its revenue trend, its margins, its customer base, and any projections it made before the dispute arose. The economist shows the but-for path under those facts and the total under the opposing expert's assumption, so the fact finder can decide which the evidence supports.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "TREASURY_YIELD", "AAEFE_JLE"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "partnership-and-shareholder-dispute",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a partnership or shareholder dispute presents a valuation to a fact finder who may not have seen one before. The economist explains the standard of value and why it fits the claim, walks through the normalization adjustments from the company's records, presents the approaches applied and their reconciliation, and addresses any discounts. Demonstratives should show the normalized earnings, the rate applied, and the resulting value, plus a reconciliation of the two valuations that shows how much of the gap each disagreement explains. The rebuttal of the opposing valuation should be organized by input, not by conclusion.",
    checklist: [
      "Prepare a plain-language explanation of the standard of value and why it applies",
      "Prepare boards for the normalization adjustments, the rate applied, and the value under each approach",
      "Prepare a reconciliation board showing the gap between the two valuations by input",
      "Rehearse the explanation of discounts applied or excluded under the standard",
      "Confirm every board figure ties to a report schedule",
    ],
    questionsToAsk: [
      "How will you explain fair value versus fair market value to a fact finder?",
      "How will you present the normalization adjustments so each looks like a correction rather than an opinion?",
      "How much of the gap between the two valuations does the rate explain, and how will you show it?",
      "How will you address a discount the opposing valuation applied and yours excluded?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the reconciliation of the two valuations is complete.",
    requiredDocuments: [
      "The valuation report with its schedules and reconciliation",
      "The normalized financial statements and supporting records",
      "Draft demonstratives",
      "The opposing valuation report and deposition transcript",
    ],
    pitfalls: [
      "Presenting the conclusion first and the method afterward, which invites the fact finder to see the number as advocacy",
      "Rebutting the opposing valuation by its conclusion rather than by its inputs",
      "Leaving the standard of value unexplained, so the discount dispute has no frame",
    ],
    faqs: [
      {
        question: "What is the most useful demonstrative in a valuation trial?",
        answer:
          "A reconciliation board that starts from one valuation, changes one input at a time to the other valuation's assumption, and shows the value after each change. It tells the fact finder which disagreements matter and lets it decide each on the evidence rather than choosing between two totals.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "FRE_702"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "divorce-and-marital-dissolution",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a divorce or marital dissolution matter is usually before a judge, and the economist's presentation should be organized so the court can adopt findings directly from it: the business value under the framework's date and goodwill treatment, the income available for support with each adjustment shown, the tracing of separate property step by step, and any lifestyle analysis by category. Demonstratives should let the court see each adjustment and its source, and the rebuttal of the opposing expert should be organized by input so the court can rule on each disagreement.",
    checklist: [
      "Prepare a board for the valuation with the date, standard, goodwill treatment, and approaches applied",
      "Prepare the income for support schedule with each adjustment and its ledger source",
      "Prepare the tracing schedule with each step tied to an account statement",
      "Prepare a reconciliation of the two experts' valuations and income figures by input",
      "Rehearse the explanation of personal versus enterprise goodwill",
    ],
    questionsToAsk: [
      "How will you present the income for support so the court can adopt it with findings?",
      "How will you explain the goodwill split?",
      "How much of the gap between the two valuations does each disagreement explain?",
      "How will you present a tracing with a gap in the statements?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the opposing report has been reconciled.",
    requiredDocuments: [
      "The valuation and income report with its schedules",
      "The ledger detail, personal expense analysis, and account statements relied on",
      "Draft demonstratives",
      "The opposing expert's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting the valuation and the income figure as if they were independent when both rest on the same normalization",
      "Skipping steps in the tracing rather than stating the gap and its effect",
      "Rebutting the opposing expert by conclusion rather than by input",
    ],
    faqs: [
      {
        question: "How should the economist present findings a court can adopt?",
        answer:
          "As schedules where each line states the item, the adjustment, the source document, and the effect, followed by a conclusion that sums them. A court can adopt, modify, or reject each line with a finding, which is more useful than a single number the court must accept or reject whole.",
      },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_OES"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "fraud-and-embezzlement",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a fraud or embezzlement matter presents the reconstruction as a chain from mechanism to record to amount. The economist explains how the scheme worked, shows representative transactions with their bank and third-party records, presents the loss schedule with proven and estimated portions labeled, and follows the traced funds forward. Demonstratives should let the fact finder see one transaction end to end before seeing the totals, and the consequential losses should be presented separately with the causal link explained. The rebuttal of the opposing expert should address inclusion criteria and the estimated portion, where the disagreement usually lies.",
    checklist: [
      "Prepare a demonstrative that walks one representative transaction from the mechanism to the bank record",
      "Prepare the loss schedule with proven and estimated amounts labeled by period",
      "Prepare the tracing board following diverted funds to accounts and assets",
      "Prepare a separate board for consequential losses with the causal link",
      "Prepare a comparison of the two experts' inclusion criteria and estimated portions",
    ],
    questionsToAsk: [
      "How will you show the fact finder that the amounts rest on bank records rather than the internal books?",
      "How will you present the estimated portion so it is credible without overstating it?",
      "How will you explain the tracing to a fact finder without a banking background?",
      "Where does the opposing expert differ, and what does each difference move?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, after the demonstratives are drafted and the records are admitted or stipulated.",
    requiredDocuments: [
      "The loss schedule with source documents for each line",
      "The bank and third-party records to be shown",
      "Draft demonstratives",
      "The opposing expert's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting totals before the fact finder has seen how a single transaction was proven",
      "Blending estimated amounts into the proven total on the demonstratives",
      "Presenting consequential losses without the causal link the fact finder needs",
    ],
    faqs: [
      {
        question: "How does the economist handle the portion of the loss that rests on estimate?",
        answer:
          "By labeling it, explaining the basis for the estimate, and showing the proven amount separately so the fact finder can award the proven portion with confidence and decide the estimated portion on its stated basis. Blending the two invites the argument that none of the total is proven.",
      },
    ],
    sources: refsToSources(["ACFE", "FRE_702", "DAUBERT"]),
  },
  {
    stage: "trial",
    caseTypeSlug: "product-liability",
    dateModified: MODIFIED,
    intro:
      "Trial testimony in a product liability matter presents the loss for a claimant whose circumstances the jury must understand before the numbers make sense: a child whose earning capacity rests on an educational path, a homemaker whose loss is the work in the home, a retiree whose loss is support and services, or a worker with the full set of components. Demonstratives should begin with the claimant's but-for path and then show each component's build-up and present value. The opposing economist typically differs on the attainment assumption, the household services hours, or life expectancy, and the direct examination should present those choices with their evidence before cross.",
    checklist: [
      "Prepare a board showing the claimant's but-for path and the evidence supporting it",
      "Prepare component boards for earning capacity, household services, benefits, and future care as claimed",
      "Prepare the present value explanation using a component the jury can picture",
      "Prepare a sensitivity board under alternative attainment, hours, or life expectancy assumptions",
      "Prepare a comparison of the two economists' assumptions",
    ],
    questionsToAsk: [
      "How will you present a child's earning capacity without appearing to speculate?",
      "How will you make a homemaker's household services concrete for the jury?",
      "What does the total look like under the opposing economist's life expectancy?",
      "Which inputs came from other experts, and how will you say so?",
    ],
    timeline: "One to two preparation sessions in the week before testimony, sequenced after the medical and, if any, plan testimony.",
    requiredDocuments: [
      "The final report and its tables",
      "The school, family, or household documentation relied on for the but-for path",
      "Draft demonstratives and sensitivity tables",
      "The opposing economist's report and deposition transcript",
    ],
    pitfalls: [
      "Presenting a child's earning capacity as a single number without the attainment assumption visible",
      "Showing household services as a total rather than as tasks, hours, and rates",
      "Leaving the life expectancy source unexplained when the medical opinions address it",
    ],
    faqs: [
      {
        question: "How does the economist present a child's lost earning capacity without speculating?",
        answer:
          "By stating the attainment assumption and its basis in the family and school record, pricing it with earnings data by educational level, and showing the result under alternative attainment levels on the same board. The jury sees the assumption, its support, and its effect, and can choose the path the evidence supports.",
      },
    ],
    sources: refsToSources(["CENSUS_ACS", "BLS_ATUS", "JONES_LAUGHLIN_PFEIFER"]),
  },
];

export function getJourney(stage: string, caseTypeSlug: string): JourneyStage | undefined {
  return journeys.find((j) => j.stage === stage && j.caseTypeSlug === caseTypeSlug);
}
