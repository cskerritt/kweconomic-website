import type { Faq, Source } from "./types";
import { refsToSources } from "./references";

export interface KnowledgeSection {
  heading: string;
  content: string;
}

export interface KnowledgeGuide {
  slug: string;
  title: string;
  /** Shorter or query-bearing <title> form; the H1, hub card, and breadcrumb keep `title`. */
  metaTitle?: string;
  /** Hero lead paragraph and hub card copy (not the meta description). */
  description: string;
  /** Written meta description (110-160 chars, a complete sentence). */
  metaDescription: string;
  /** Lift-able summary rendered as a list under the byline. */
  keyPoints?: string[];
  sections: KnowledgeSection[];
  /** Rendered by FAQBlock and emitted as FAQPage JSON-LD. Plain text, no link markers. */
  faqs?: Faq[];
  /** Registry-backed references, rendered by SourcesBlock at the foot of the guide. */
  sources?: Source[];
  /** ISO date the guide was first published. */
  datePublished?: string;
  /** ISO date the guide was last reviewed/updated. Defaults to current date when unset. */
  dateModified?: string;
  /** Team member slug for the AuthorByline. Falls back to the "<ORG_NAME> Editorial Team" byline when unset. */
  authorSlug?: string;
}

// Long-form knowledge guides. Each entry starts with `slug` (scripts/prerender.mjs
// splits entries on that line) and carries `title` once; section prose uses
// the inline-link marker syntax from src/lib/richtext.tsx and is citation-free.
// FAQ pairs must not restate a guide or method FAQ (src/data/editorial.test.ts
// caps the token overlap).
export const knowledgeGuides: KnowledgeGuide[] = [
  {
    slug: "guide-to-economic-damages",
    sources: refsToSources(["BLS_CPS", "BLS_ATUS", "BLS_CEX", "SKOOG_CIECKA_KRUEGER_2011", "JONES_LAUGHLIN_PFEIFER", "AAEFE_JLE", "NAFE_JFE"]),
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    title: "Guide to Economic Damages",
    metaTitle: "Guide to Economic Damages for Attorneys",
    metaDescription: "What economic damages consist of and how each component is measured: lost earnings, survivor support, household services, future care, and commercial losses.",
    keyPoints: [
      "Economic damages are measured from records and published data; non-economic damages are valued by the trier of fact without an economic calculation.",
      "Every calculation projects a but-for stream and a post-event stream, takes the difference year by year, and reduces the future portion to present value.",
      "Earnings run over worklife expectancy; household services and care costs run over life expectancy; support to a child runs over the period of dependency.",
      "Most disagreements between opposing economists reduce to a handful of inputs: the earnings base, growth rate, horizon, post-event earnings, consumption, and discount rate.",
    ],
    description:
      "What economic damages consist of, how lost earnings, wrongful death losses, household services, future care costs, and commercial losses are measured, and how to read a damages report critically.",
    sections: [
      {
        heading: "What Economic Damages Are",
        content: `Economic damages are the financial losses that can be measured in dollars from records and data: the earnings a person did not receive and will not receive, the benefits that came with those earnings, the value of work at home that the person can no longer do, the support a decedent would have provided to a family, the cost of future care, and the profits or value a business lost. They are distinguished from non-economic damages, such as pain and loss of enjoyment of life, which a jury values without an economic calculation. A forensic economist addresses the economic side only.

The work begins with the records. Tax returns, W-2 and 1099 forms, pay stubs, benefit statements, and employer records establish what the person earned and received. Medical and vocational evidence bears on what the person can do now. For a business, financial statements, tax returns, general ledgers, and contracts establish what the company earned and what it lost. Published government data supply what the records cannot: wage growth, labor force participation, the hours people spend on household work, the share of income households spend on each member, and the yields at which an award can be invested.

Every damages calculation has the same structure. The economist projects what would have happened but for the event, projects what will happen given the event, takes the difference year by year, and reduces the future portion to present value. What changes from case to case is which streams are in the comparison and what evidence supports each input. The [[/services|services]] pages describe each type of engagement; this guide explains the calculation that runs through all of them.`,
      },
      {
        heading: "Lost Earnings and Earning Capacity",
        content: `The earnings claim compares two streams: the earnings and benefits the person would have received over a working life but for the injury, and the earnings and benefits the person can now expect. The but-for stream starts from the documented earnings base, usually several years of tax returns and pay records, and carries it forward with a [[/methods/wage-growth-and-earnings-projection|wage growth rate]] over a [[/methods/worklife-expectancy|worklife expectancy]] drawn from published tables for the person's age, sex, education, and labor force status. [[/methods/fringe-benefits-valuation|Fringe benefits]] are added from the person's own plan documents or, where those are unavailable, from published employer cost data.

The post-event stream depends on the medical and vocational evidence. Where the person has returned to work, pay records fix the figure. Where the person has not, the report uses the earnings the record supports, and where capacity is contested it may present the loss under more than one scenario. The difference between the two streams, year by year, is the loss, and the future portion is discounted.

Lost earnings and lost earning capacity are related but distinct measures. Lost earnings project the person's own history; lost earning capacity measures the reduction in the ability to earn, which matters when the history understates the capacity, as for a student, a parent who had left the labor force, or a worker between jobs. The [[/compare/lost-earnings-vs-lost-earning-capacity|comparison page]] explains when each applies, and the [[/guides/how-lost-earnings-are-calculated|lost earnings guide]] walks through the calculation input by input.`,
      },
      {
        heading: "Wrongful Death: Support, Consumption, and Household Services",
        content: `In a [[/services/wrongful-death-economic-loss|wrongful death]] matter the economic loss belongs to the survivors, and the question is what the decedent would have contributed to the household over the rest of an expected life. The analysis projects the decedent's earnings and benefits over a worklife expectancy, as in an injury case, then subtracts the share of income the decedent would have spent on personal needs. This personal consumption deduction is derived from published household expenditure data adjusted to the household's size and income, and it is the single assumption most likely to be contested because it scales the whole earnings figure.

To the net earnings the economist adds the replacement value of the household services the decedent performed, measured from the household's own account and time-use data and valued at local replacement wage rates, and where the governing framework allows, the value of other forms of support such as guidance and care to minor children. Each survivor's loss is measured over that survivor's period of dependency, which for a spouse may run through the decedent's expected life and for a child through majority or the completion of education.

States differ on which components are recoverable, by whom, and whether the claim belongs to the estate, the survivors, or both. The report presents each component separately so that counsel can include or exclude it as the governing framework requires. The [[/guides/wrongful-death-damages-explained|wrongful death damages guide]] describes the components in more detail.`,
      },
      {
        heading: "Household Services and Other Non-Wage Losses",
        content: `Unpaid work at home has economic value because replacing it costs money. When an injury reduces a person's capacity to cook, clean, maintain the home and yard, manage the household, drive, or care for children or other family members, the loss is measured as the hours no longer performed multiplied by the cost of hiring the work out in the local market. The [[/methods/household-services-methodology|household services method]] page explains how hours are established from the household's account and time-use survey data, how post-event capacity is determined task by task from the functional evidence, and how replacement wage rates are drawn from occupational wage data for the area.

Household services are often the largest component for a person who was not working for pay, and they are rarely zero for a person who was. The projection reflects the household's composition and how it changes over time, and it runs over life expectancy rather than worklife because household work does not end at retirement. The [[/guides/household-services-in-personal-injury|household services guide]] describes the records that support each input.

Where the injury requires future care, the economist values the cost stream set out in a life care plan prepared by a qualified clinician: each item's frequency, duration, and unit cost is carried forward with a growth rate appropriate to its category and discounted to present value over the applicable life expectancy. The [[/services/life-care-plan-cost-projection|life care plan cost projection]] service describes that hand-off; the economist values the plan and does not author it.`,
      },
      {
        heading: "Present Value and the Horizon",
        content: `An award is paid once, in present dollars, while the losses it replaces would have occurred over many years. [[/methods/present-value-and-discounting|Present value]] is the step that makes the two comparable: it asks what sum, invested today at a stated rate, would fund the projected future losses as they come due. The discount rate is tied to yields on low-risk instruments whose maturities match the horizon, because the award is meant to be invested safely rather than speculatively, and the growth rate applied to each loss stream is drawn from a published series appropriate to that stream.

The relationship between the growth and discount rates matters more than either rate alone. Some reports present the two as a single net rate applied to a constant-dollar stream; others show growth and discounting as separate steps. The two presentations are equivalent when the assumptions are consistent, and the [[/compare/net-vs-gross-discount-rate|net versus gross discount rate]] comparison explains the choice. Some jurisdictions fix the approach by case law, and the report follows the venue's rule.

The horizon is the other driver. Earnings run over worklife expectancy; household services and care costs run over life expectancy; support to a child runs over the child's dependency. A report states each horizon, its source, and its effect, and shows the sensitivity of the total to the most consequential assumptions. The [[/guides/present-value-explained-for-attorneys|present value guide]] covers these concepts in plain terms.`,
      },
      {
        heading: "Commercial Damages and Business Value",
        content: `When the injured party is a business, the loss is measured in profits or in value. [[/methods/lost-profits-but-for-analysis|Lost profits]] compare the profits the business would have earned but for the wrongful act with the profits it actually earned, over a loss period that ends when the business recovered or would have recovered. The but-for revenue is established from the company's own history, from a comparison with similar businesses or markets unaffected by the act, or from the projections the parties relied on before the dispute; the costs avoided by not earning that revenue are deducted; mitigation is netted; and causation is tested against the other events of the period.

Where the business was destroyed or the owner's interest was taken, the measure shifts to [[/methods/business-valuation-approaches|business value]]: what the interest was worth on a valuation date under the standard of value the governing framework requires, developed through the income, market, and asset approaches and reconciled into a conclusion. The two measures rest on the same cash flows, so claiming both for the same period counts the loss twice; the [[/guides/lost-profits-vs-lost-business-value|lost profits versus lost business value]] guide works through the boundary.

Business questions also arise inside personal claims. A self-employed claimant's tax returns mix labor income with the return on the business, and the economist separates the two before projecting earnings. In a divorce, a business interest is valued for division and the owner's true income is determined for support, as the [[/guides/income-determination-in-divorce|income determination guide]] explains.`,
      },
      {
        heading: "Reading and Testing a Damages Report",
        content: `A damages report can be read in an hour if the reader knows where to look. Start with the schedules rather than the narrative: the earnings base and its source, the growth rate and its series, the worklife and life expectancy and their tables, the post-event earnings and what supports them, the fringe benefit rate and whether it came from plan documents or a published average, the consumption percentage in a death claim, the household hours and wage rates, and the discount rate with its instruments and period. Each input should have a stated source, and each source should be one the other side can check.

Then look for consistency. Growth and discount rates should come from the same basis and period. The horizon used for earnings should match the worklife table, and the horizon used for household services should match the life table. Post-event earnings should be projected with the same growth assumptions as but-for earnings. A life care plan valuation should reconcile item by item to the plan and use the plan's life expectancy. Most disagreements between opposing economists come down to a handful of inputs, and a report that makes every input visible narrows the dispute to those.

Finally, look for what is missing. Undocumented promotions, benefits added on top of wages that already included them, a consumption deduction omitted from a death claim, mitigation ignored, or a discount rate chosen from an unrepresentative window are the usual gaps. The [[/guides/how-to-rebut-an-economic-damages-report|rebuttal guide]] sets out the review in order, and the [[/services/expert-rebuttal-and-report-review|rebuttal service]] applies it to an opposing report.`,
      },
    ],
    faqs: [
      {
        question: "What is the difference between economic and non-economic damages?",
        answer:
          "Economic damages are financial losses that can be measured in dollars from records and data: earnings, benefits, household services, support to survivors, care costs, profits, and business value. Non-economic damages, such as pain and loss of enjoyment of life, are valued by the trier of fact without an economic calculation, and the economist does not address them.",
      },
      {
        question: "What records does an economist need to calculate lost earnings?",
        answer:
          "Several years of tax returns, W-2 and 1099 forms, pay stubs, and employer benefit statements establish the earnings base; the medical and vocational evidence bears on what the person can earn now. For a business, financial statements, general ledgers, and contracts establish what the company earned and what it lost.",
      },
      {
        question: "How is a damages report tested for reliability?",
        answer:
          "By tracing each input to its source. The earnings base should match the returns, the growth and discount rates should come from the same basis and period, each horizon should match a published table, and the post-event assumptions should rest on the medical and vocational record. A sensitivity table then shows how much of the total each contested input explains.",
      },
      {
        question: "Does the economist value a life care plan?",
        answer:
          "The economist values the cost stream a qualified clinician sets out in the plan, carrying each item forward with a growth rate appropriate to its category and discounting over the applicable life expectancy. The economist does not author the plan and does not add or remove care items.",
      },
    ],
  },
  {
    slug: "expert-witness-testimony-guide",
    sources: refsToSources(["FRE_702", "DAUBERT", "KUMHO_TIRE", "GE_JOINER", "FRYE", "FRCP_26", "NAFE_ETHICS"]),
    authorSlug: "christopher-skerritt",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    title: "Expert Witness Testimony Guide",
    metaTitle: "Economic Expert Witness Testimony Guide",
    metaDescription: "What an economic expert does in litigation, how Daubert and Frye courts test the testimony, what gets challenged, and how deposition and disclosure work.",
    keyPoints: [
      "The economist translates the record and the other experts' opinions into a projected loss and a present value, and does not opine on liability, causation, or medical questions.",
      "Challenges to economic testimony rarely attack the discipline; they attack inputs the record does not support.",
      "Most expert testimony is given at deposition, and the transcript is used at trial to impeach any departure from it.",
      "In federal court the written report is the disclosure: every opinion, its basis, the facts considered, qualifications, prior testimony, and compensation.",
    ],
    description:
      "What an economic expert does in litigation, the reliability and general-acceptance admissibility frameworks, what gets challenged in economic testimony, deposition versus trial, disclosure, and how to select an economist.",
    sections: [
      {
        heading: "The Role of the Economic Expert",
        content: `An expert witness is permitted to offer opinion testimony because the subject requires specialized knowledge that the trier of fact does not have. The governing frameworks generally require that the witness be qualified by knowledge, skill, experience, training, or education; that the testimony rest on sufficient facts or data; that it be the product of reliable principles and methods; and that those principles be reliably applied to the facts of the case. A forensic economist meets those requirements by building the [[/knowledge/guide-to-economic-damages|damages calculation]] from the records and published data and by documenting every step.

The economist's function is to help the judge or jury understand what a loss is worth, not to decide the case. The economist does not opine on liability, on causation of the injury, or on medical or vocational questions, and a report that strays into those areas invites exclusion. What the economist does is translate the facts the record establishes and the opinions other experts supply into a projected loss and a present value, and explain the assumptions so the trier of fact can weigh them.

The economist's obligation runs to the accuracy of the method, not to the retaining party. The professional associations in the field publish ethics statements that call for the same method regardless of who retains the economist and for disclosure of the assumptions and their sources. An economist who advocates rather than analyzes is less credible, more vulnerable on cross-examination, and a liability to the case.`,
      },
      {
        heading: "Reliability and General-Acceptance Frameworks",
        content: `Whether an economist's opinion is admissible depends on the jurisdiction's framework. Federal courts and most state courts apply a [[/guides/federal-vs-state-court-daubert|reliability-based gatekeeping framework]] under which the trial judge decides whether the method is reliable and reliably applied, considering factors such as whether the method has been tested, whether it has been published and peer reviewed, its known or potential rate of error, the existence of controlling standards, and its general acceptance in the field. The factors are not exclusive, and the inquiry extends to technical and other specialized knowledge, including economics, not only to laboratory science.

A minority of states retain a general-acceptance framework, which asks whether the method is generally accepted in the relevant professional community and does not separately weigh testability or error rates. Under either framework the mainstream methods of forensic economics, projection from documented earnings, published worklife and life tables, replacement cost valuation of household services, and discounting at low-risk yields, are well accepted. The [[/insights/daubert-vs-frye-expert-testimony-standards|admissibility frameworks post]] compares the two in more detail, and counsel confirms the governing framework for the case against primary sources.

In economic testimony, challenges rarely attack the discipline. They attack inputs: an earnings base that ignores the tax returns, a growth rate inconsistent with the discount rate, a worklife horizon with no table behind it, post-event earnings that ignore a documented return to work, a consumption deduction omitted from a death claim, or a projection for a business with no history. Courts have excluded opinions where the gap between the data and the conclusion was too wide to bridge with the expert's say-so. A report built on stated sources with each input visible is positioned to survive that review.`,
      },
      {
        heading: "Deposition Versus Trial Testimony",
        content: `Most expert testimony is given at deposition, not at trial. Opposing counsel examines the economist under oath on qualifications, the records reviewed, the method, each input and its source, and the opinions reached, and the transcript will be used at trial to impeach any departure. Preparation is the same as for trial: the economist should be able to defend every schedule in the report from memory, identify the source of every figure, and explain why each alternative the other side proposes was or was not adopted.

Retaining counsel should schedule a preparation session before the deposition to review the opinions, identify the inputs most likely to be contested, and confirm that the economist has everything produced since the report was written, including new pay records, updated medical opinions, and the opposing economist's report. A supplemental schedule prepared before the deposition is far better than a concession during it.

At trial the audience changes. The jury must understand the calculation and credit it. Direct examination walks through the records, the method, and the schedules in order, using the report's own tables as demonstratives. Cross-examination will press on the contested inputs and try to draw concessions that the number could be smaller. An economist who has presented the sensitivity of the result in the report, rather than a single figure, can agree that a different input gives a different result without conceding that the report is wrong.`,
      },
      {
        heading: "Reports and Disclosure",
        content: `In federal court a retained expert's written report must contain a complete statement of all opinions and the basis and reasons for them, the facts or data considered in forming them, any exhibits used to summarize or support them, the witness's qualifications and publications, a list of prior testimony for the preceding years, and a statement of compensation. Most state courts require a subset of these elements, sometimes through interrogatory answers rather than a report, and the timing is set by the scheduling order. The [[/guides/expert-witness-disclosure-rules|disclosure guide]] outlines the elements and the traps.

For the economist the practical points are three. First, the report should be complete: an opinion that is not in the report may be excluded at trial. Second, the facts or data considered include everything reviewed, not only what was relied upon, and the work file should be organized so it can be produced. Third, the duty to supplement continues, so new records that change an input call for a supplemental schedule rather than a surprise at deposition.

The prior testimony list is discoverable and will be read. An economist with a balanced history of plaintiff and defense work, and with a method that does not change between them, is more credible than one whose results always favor the retaining side. Published writings are also fair game, and an economist should not testify to a method the economist has criticized in print without explaining the difference.`,
      },
      {
        heading: "Selecting an Economist",
        content: `Four questions identify the right economist for a damages case. First, training: graduate education in economics or a closely related field, and familiarity with the forensic economics literature and the published standards the associations in the field maintain. Second, testimony experience: depositions and trials in the relevant jurisdictions, for both plaintiff and defense, with a record that shows the method holding constant across engagements. Third, method: does the economist build from the records and published data, state every assumption, and show sensitivity, or deliver a single number with a narrative? Reviewing a redacted prior report answers this quickly.

Fourth, communication. The economist must be able to explain present value, worklife expectancy, and personal consumption to a jury in plain language and to hold that explanation under cross-examination. Reading a deposition transcript or watching prior trial testimony is the most reliable way to judge this before retention.

Timing matters as much as selection. An economist retained early can identify the records the calculation will need, coordinate with the medical and vocational witnesses on the assumptions the economic analysis will adopt, and inform discovery on the other side's damages theory. The [[/guides/when-do-you-need-an-economic-expert|when to retain]] guide describes the signals, and the [[/team|team]] page describes the economists here.`,
      },
    ],
    faqs: [
      {
        question: "What must a forensic economist show to be admitted as an expert?",
        answer:
          "That the economist is qualified by training and experience, that the opinion rests on sufficient facts or data, that it applies reliable methods, and that those methods were reliably applied to the case. For economic testimony the method is rarely the issue; the inputs are.",
      },
      {
        question: "Why is deposition preparation as important as trial preparation?",
        answer:
          "Because most expert testimony is given at deposition, and the transcript will be used at trial to impeach any departure from it. The economist should be able to defend every schedule from memory, identify the source of every figure, and have reviewed everything produced since the report was written.",
      },
      {
        question: "What happens if an opinion is not in the written report?",
        answer:
          "In federal court and many state courts it may be excluded at trial. New records that change an input call for a supplemental schedule served under the duty to supplement, not a new opinion offered for the first time at deposition or trial.",
      },
      {
        question: "How should counsel select an economist for a damages case?",
        answer:
          "By training in economics or a closely related field, testimony experience for both plaintiff and defense in the relevant jurisdictions, a method that builds from records and published data with stated assumptions and sensitivity, and the ability to explain present value and worklife expectancy to a jury in plain language.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): KnowledgeGuide | undefined {
  return knowledgeGuides.find((g) => g.slug === slug);
}
