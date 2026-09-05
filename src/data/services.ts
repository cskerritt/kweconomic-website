import type { Service } from "@/types";
import type { Faq, Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";
import { VOC_SERVICE_URL, LCP_SERVICE_URL } from "@/lib/brand";

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
 * Every pillar also carries the page-level content the service templates
 * render (`PillarContent`): the meta description the pillar page publishes,
 * the last-updated date, hand-authored FAQs, the guides, methods, and
 * comparisons that support the service, registry sources, and one note per
 * declared service x case-type pair (`caseTypeNotes`, keyed by case-type
 * slug; every key must appear in `caseTypes`). Pairs that a pillar does not
 * declare have no note and render without a FAQ block.
 *
 * Build scripts (scripts/lib/service-slugs.mjs) read this file as text and
 * split it on top-level `\n  {\n` object boundaries, dropping any block that
 * contains `pillar: false`, and pair the FIRST `slug:` and `name:` in each
 * block. Keep each entry as its own two-space-indented object literal with
 * `slug:` as the first field, and never use `slug:` or `name:` as a key in
 * the nested content (related items use `title`/`href`).
 */

/** One service x case-type pair: how the pillar's work is shaped by the matter, plus two pair-specific FAQs. */
export interface ServiceCaseTypeNote {
  summary: string;
  faqs: Faq[];
}

/**
 * The explained hand-off a pillar page prints under its lead where the work
 * depends on, or borders, a sister practice's discipline (site audit
 * 2026-09-05, F08 and G01: "the vocational input is described without a
 * direct, explained handoff"). `text` says which question belongs to the
 * other practice and what the economist does with its answer; `href` is the
 * verified sister-site service page (src/lib/brand.ts VOC_SERVICE_URL,
 * LCP_SERVICE_URL); `linkLabel` names the practice by discipline, never by
 * brand. Rendered by ServicePillar.tsx and the pillar shell in
 * scripts/prerender.mjs. Keys here are `text`, `linkLabel`, and `href` on
 * purpose: the build scripts pair the first `slug:` and `name:` of each entry.
 */
export interface ServiceHandoff {
  text: string;
  linkLabel: string;
  href: string;
}

/** Page-level content every pillar carries (see the file comment). */
export interface PillarContent {
  /** Meta description of the pillar page (140-160 characters, states the offer and the audience). */
  metaDescription: string;
  /** ISO date of the last copy revision; rendered in the byline and the Service JSON-LD. */
  dateModified: string;
  /** Hand-authored, service-specific questions attorneys ask (never templated from the short name). */
  faqs: Faq[];
  /** Guides, methods, and comparisons that support the service (hrefs must resolve to existing slugs). */
  related: RelatedItem[];
  /** Registry-backed references rendered by SourcesBlock. */
  sources: Source[];
  /** Pair notes keyed by case-type slug; keys are a subset of `caseTypes`. */
  caseTypeNotes: Record<string, ServiceCaseTypeNote>;
  /** The explained hand-off to a sister practice, where the work depends on or borders its discipline. */
  handoff?: ServiceHandoff;
}

/** A pillar service with its page content. */
export type PillarService = Service & PillarContent;

/** Any entry in the taxonomy: pillars carry the page content, cross-sells do not. */
export type ServiceEntry = Service & Partial<PillarContent>;

export const services: ServiceEntry[] = [
  {
    slug: "lost-earnings-and-earning-capacity",
    name: "Lost Earnings and Earning Capacity Analysis",
    shortName: "Lost Earnings",
    titleName: "Lost Earnings and Earning Capacity",
    pillar: true,
    description: "Past and future lost earnings and fringe benefits for a person whose injury has removed them from work or reduced what they can earn. The analysis builds from the earnings history, projects the but-for path over the person's expected worklife with wage growth, and discounts the future stream to present value. When the person can still work in a reduced capacity, the loss is framed as diminished earning capacity, with the post-injury path drawn from a vocational opinion or the treating record and offset against the but-for projection.",
    icon: "TrendingUp",
    keywords: ["lost earnings", "loss of earning capacity", "lost wages expert", "worklife expectancy", "fringe benefits loss", "present value of lost earnings"],
    caseTypes: ["personal-injury", "motor-vehicle-accident", "traumatic-brain-injury", "spinal-cord-injury", "medical-malpractice", "workers-compensation", "product-liability", "wrongful-death"],
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
    metaDescription: "Lost earnings and earning capacity analysis for plaintiff and defense counsel nationwide: earnings base, worklife, wage growth, and present value, each stated.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "What records does a lost earnings analysis need?",
        answer: "Several years of tax returns and W-2s or 1099s, recent pay stubs, the employer's personnel file and benefit summaries, union or pension records, and the medical or work-capacity opinions that describe what the person can do now. For a self-employed claimant, business returns and financial statements replace the wage records. The analysis can begin before every record is in hand and is updated as the file fills.",
      },
      {
        question: "How is worklife expectancy chosen?",
        answer: "From published worklife tables by age, sex, and education, adjusted for facts in the record such as a stated retirement plan or a health condition that predates the injury. The report names the table, states the years applied, and shows how the total changes under an earlier or later retirement so the choice can be examined rather than taken on faith.",
      },
      {
        question: "How is lost earning capacity measured when the person is still working?",
        answer: "As the gap between the but-for path and the post-injury path. The but-for path is projected from the earnings history with wage growth; the post-injury path is drawn from actual earnings after the injury and the work-capacity opinions in the record. Lost advancement, reduced hours, and lost benefits are part of the gap, and the difference is discounted to present value over the remaining worklife.",
      },
      {
        question: "How long does a lost earnings report take?",
        answer: "Retention and the records request take about a week, the analysis two to four weeks once the records arrive, and the draft and final report one to two weeks after that. Disclosure deadlines are set at retention, and the report can be supplemented when new records or a revised trial date arrive.",
      },
    ],
    related: [
      { title: "How Lost Earnings Are Calculated", href: "/guides/how-lost-earnings-are-calculated", description: "Guide" },
      { title: "Worklife Expectancy", href: "/methods/worklife-expectancy", description: "Method" },
      { title: "Wage Growth and Earnings Projection", href: "/methods/wage-growth-and-earnings-projection", description: "Method" },
      { title: "Lost Earnings vs. Lost Earning Capacity", href: "/compare/lost-earnings-vs-lost-earning-capacity", description: "Comparison" },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "SKOOG_CIECKA_KRUEGER_2011", "TREASURY_YIELD", "NAFE_ETHICS"]),
    handoff: {
      text: "When the post-injury earnings path turns on what the injured person can still do and earn, that opinion is a vocational one: the affiliated vocational practice prepares it, and the economist builds the lost earnings analysis on it so the two reports reconcile at deposition and trial.",
      linkLabel: "Vocational assessment at the affiliated practice",
      href: VOC_SERVICE_URL,
    },
    caseTypeNotes: {
      "personal-injury": {
        summary: "In a personal injury matter the lost earnings analysis is the core of the economic claim and often its largest component. The economist establishes the but-for earnings base from tax returns, wage statements, and personnel records, projects it over a worklife expectancy with wage growth, and compares it with the post-injury path drawn from actual earnings and the work-capacity opinions in the record. A short absence with a full return to the same job leaves a past loss that can be built from pay records; a permanent restriction that ends the prior occupation opens a future gap that runs across the remaining worklife and is discounted to present value with the rate stated.",
        faqs: [
          {
            question: "When does a personal injury lost earnings claim need an economist rather than the pay records?",
            answer: "When the loss runs past the date of analysis. Past lost pay for a documented absence can be presented from the records, but any future component, whether reduced hours, a lower-paying job, lost advancement, or a shortened worklife, requires a projection with growth and discounting, and the assumptions behind it should be stated by someone who can testify to them.",
          },
          {
            question: "How is the post-injury earnings path established?",
            answer: "From what the person has actually earned since returning to work and from the work-capacity opinions of the treating providers and any retained experts. The economist does not decide what work the person can do; the economist prices the consequences of the opinions in the record and shows the loss under each opinion when they differ.",
          },
        ],
      },
      "motor-vehicle-accident": {
        summary: "Motor vehicle accident claims span the full range of lost earnings work, from a documented period out of work after an orthopedic injury to a lifetime loss after a catastrophic crash. The economist documents the date the person left work, any return at full or reduced capacity, and the employer's records on accommodation, then builds the but-for and post-injury paths from those facts. Because policy limits often frame the practical range, counsel commonly ask for the past loss, the future loss, and the lost fringe benefits stated separately so the same report serves settlement evaluation and trial.",
        faqs: [
          {
            question: "Is a lost earnings report worthwhile when the injured person has returned to work?",
            answer: "It depends on the terms of the return. A full return to the same job at the same pay usually leaves only a past loss. A return at reduced hours, lower pay, or to work with fewer benefits or less advancement leaves an ongoing gap that should be measured over the remaining worklife.",
          },
          {
            question: "How is the earnings base set for a student or a young worker hurt in a crash?",
            answer: "The earnings base is projected from the educational path and occupational earnings data for the work the person was preparing for, rather than from a short earnings history. The report states the occupation and education level assumed and the source of the earnings data so the assumption can be tested.",
          },
        ],
      },
      "traumatic-brain-injury": {
        summary: "Brain injury claims often present a large lost earnings figure because cognitive and behavioral effects can end a career even when physical function returns, and a young claimant's worklife is long. The economist builds the but-for path from the earnings history or, for a young person, from occupational data for the path they were on, and compares it with a post-injury path that may be no competitive work, work only with supports, or work at a lower level. The neuropsychological and work-capacity opinions in the record define that path; the report shows the loss under each opinion when they differ and states how the total moves with residual capacity.",
        faqs: [
          {
            question: "Can lost earnings be measured when the person is still working after a brain injury?",
            answer: "Yes. Many people return to work at reduced hours, in a lower position, or with supports that may not last. The economist compares the but-for path with the actual post-injury path and measures the gap, including lost advancement and lost benefits, over the remaining worklife, and states the assumption about how long the current arrangement continues.",
          },
          {
            question: "How is the loss measured for a child or student with a brain injury?",
            answer: "From the educational path the record supports and occupational earnings data for that path, since there is no work history. The report states the education level assumed and the age at which earnings would have begun, and shows how the result changes if a different attainment level is used.",
          },
        ],
      },
      "spinal-cord-injury": {
        summary: "A spinal cord injury usually ends the prior occupation, so the lost earnings analysis turns on whether the record supports any post-injury earnings at all and, if so, at what level and after what delay. The economist projects the but-for path from the earnings history and occupational data over a worklife expectancy with wage growth, and sets against it a post-injury path of no earnings, reduced earnings, or earnings after retraining as the work-capacity opinions support. Lost fringe benefits are valued from plan documents or published employer cost data, and the full gap is discounted to present value over the remaining worklife.",
        faqs: [
          {
            question: "Does the analysis credit earnings after retraining?",
            answer: "Where the record supports it, yes. The post-injury path can include earnings from sedentary or remote work after a training period, with a delay for the training and a wage level drawn from occupational data. The remaining gap between that path and the but-for path is the loss, and the report shows the result with and without the retraining scenario.",
          },
          {
            question: "How does a shortened worklife or life expectancy affect the claim?",
            answer: "It sets the horizon. The economist applies the worklife and life expectancy the medical evidence supports and, where physicians disagree, presents the loss under each so the fact finder can attach the number to its finding rather than to a population average.",
          },
        ],
      },
      "medical-malpractice": {
        summary: "In a medical malpractice matter the lost earnings claim is measured against the outcome the patient would have had with proper care, not against perfect health. The economist takes the causation and prognosis opinions in the record as the baseline, states the but-for earnings path they support, and builds the injured path from actual post-injury earnings and the work-capacity opinions. The loss is the difference between the two paths, projected over the applicable worklife with growth and discounted to present value. Where the underlying condition would have limited work on its own, the apportionment between the injury and the condition is usually the assumption that most changes the total.",
        faqs: [
          {
            question: "How does the economist handle a pre-existing condition that affected work?",
            answer: "The economist does not decide what the condition would have done; the medical opinions do. The report takes those opinions as its baseline, builds the but-for path from them, and measures only the loss the injury added. When the opinions differ, the report shows the result under each.",
          },
          {
            question: "When should the economist be retained in a malpractice case?",
            answer: "Once causation and prognosis opinions are available and the disclosure schedule is known. The earnings analysis can begin from the financial records while the medical opinions are finalized, and the report is completed once the but-for path is defined.",
          },
        ],
      },
      "workers-compensation": {
        summary: "Workers' compensation matters ask the lost earnings question in more than one setting: the wage loss or reduced earning capacity that the benefit is meant to replace, the present value of future indemnity payments at issue in a settlement, and the full earnings loss in a third-party action arising from the same injury. The economist assembles the pre-injury wage base from the employer's records and tax documents, establishes the post-injury earnings path from actual earnings or the work-capacity opinions, and measures the loss over the applicable worklife with wage growth. The report separates what the compensation system pays from what a civil claim adds so the same facts support both.",
        faqs: [
          {
            question: "Can the analysis express loss of earning capacity the way the compensation system measures it?",
            answer: "Yes, where the jurisdiction measures the benefit that way. The economist compares the pre-injury wage with the earnings the person can achieve given the work-capacity opinions in the record and expresses the reduction as a percentage or a dollar amount as the system requires, with the assumptions stated.",
          },
          {
            question: "How are benefits already paid treated in the third-party claim?",
            answer: "The report identifies the indemnity payments made by the carrier and presents them separately from the gross loss so counsel can address lien, offset, and collateral source questions under the governing framework. Netting is done only when counsel asks for a net presentation.",
          },
        ],
      },
      "product-liability": {
        summary: "Product liability claims often involve an injured person whose exposure to the product bears no relation to their occupation, so the lost earnings analysis is built from that person's own path rather than from the circumstances of the injury. The economist establishes the but-for earnings base from the earnings history or, for a child, student, or homemaker, from the educational path and occupational earnings data, projects it over the applicable worklife with growth, and sets against it the post-injury path the work-capacity opinions support. In a mass tort setting the same documented method is applied to each claimant's own records so results are consistent in method and individual in result.",
        faqs: [
          {
            question: "How is lost earning capacity measured for a child injured by a product?",
            answer: "From the educational attainment the record supports and occupational earnings data for that level, starting at the age the child would have entered the workforce and projected over a full worklife. The report states the education assumption and shows how the result changes under alternatives.",
          },
          {
            question: "Can one lost earnings method serve many claimants?",
            answer: "Yes. The economist documents one method for the earnings base, growth, worklife, and discounting, then applies it to each claimant's own records. The approach supports settlement allocation and trial because every figure can be traced to its own record and the method is the same across the group.",
          },
        ],
      },
      "wrongful-death": {
        summary: "When the injured person has died, the lost earnings analysis becomes the earnings component of the wrongful death claim: the decedent's earnings and fringe benefits projected over a worklife expectancy with wage growth, reduced by the share the decedent would have consumed personally where the governing framework requires it, and discounted to present value. The economist builds the earnings base from the decedent's tax returns and wage records or, where a career was interrupted early, from occupational data for the path the decedent was on. The component is presented so it can be combined with household services and support to dependents in the full wrongful death analysis or stand alone where the framework measures the loss to the estate.",
        faqs: [
          {
            question: "How does the decedent's lost earnings figure differ from a living claimant's?",
            answer: "In two ways. There is no post-injury path to offset, so the loss is the full projected earnings stream, and a personal consumption deduction removes the share of income the decedent would have spent on personal needs where the framework requires it. The report shows the figure before and after the deduction.",
          },
          {
            question: "How is the earnings base built for a self-employed decedent?",
            answer: "The earnings base is reconstructed from business tax returns, financial statements, invoices, and bank records, separating the decedent's labor from the return on capital in the business. Where the history is short, occupational earnings data for comparable work supplements the record, and the reconstruction method is stated.",
          },
        ],
      },
    },
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
    metaDescription: "Wrongful death economic loss analysis for plaintiff and defense counsel nationwide: net lost earnings, personal consumption, household services, and support.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "Which losses does a wrongful death economic analysis measure?",
        answer: "The decedent's lost earnings and fringe benefits over a projected worklife, less the share the decedent would have consumed personally; the replacement value of the household services the decedent provided; and the financial support each dependent would have received over the period of dependency. Where the governing framework provides for it, the analysis also measures the accumulation the decedent would have left to the estate. Each component is presented separately so counsel can include or exclude it as the framework requires.",
      },
      {
        question: "How is the personal consumption deduction chosen?",
        answer: "From published household expenditure data adjusted to the size and income of the decedent's household, so the deduction reflects what a person in that household would have spent on personal needs rather than on the family. The report states the percentage applied and its source and shows the effect of a higher or lower figure.",
      },
      {
        question: "Can the loss be measured when the decedent was a homemaker or was not working?",
        answer: "Yes. The household services component stands on its own: the hours of housework, child care, and care of other household members the decedent provided are drawn from the household's account and time-use data for a person of similar circumstances, then valued at the cost of replacing them with paid help and projected over the period the survivors would have received them.",
      },
      {
        question: "Does the report have to follow the state's wrongful death framework?",
        answer: "The framework counsel identifies determines which components are recoverable and whether the loss is measured to the estate or to the survivors, and the report is organized to it. The underlying calculations do not change from state to state; what changes is which components are presented and to whom they are attributed, so the same analysis can be restructured if the venue or the pleading changes.",
      },
    ],
    related: [
      { title: "Wrongful Death Damages, Explained", href: "/guides/wrongful-death-damages-explained", description: "Guide" },
      { title: "Household Services Methodology", href: "/methods/household-services-methodology", description: "Method" },
      { title: "Present Value and Discounting", href: "/methods/present-value-and-discounting", description: "Method" },
    ],
    sources: refsToSources(["CDC_LIFE_TABLES", "BLS_CEX", "BLS_ATUS", "BLS_CPS", "TREASURY_YIELD"]),
    caseTypeNotes: {
      "wrongful-death": {
        summary: "The wrongful death economic analysis measures what the decedent would have contributed to the household over the rest of an expected life: net lost earnings and fringe benefits after the personal consumption deduction, the replacement value of the household services the decedent provided, and the financial support each dependent would have received over the period of dependency. The economist builds the earnings base from the decedent's records, derives personal consumption from household expenditure data adjusted to the household, values household services from time-use data and local replacement rates, and discounts each survivor's loss to present value. Because states differ on which components are recoverable and by whom, the report is organized to the framework counsel identifies.",
        faqs: [
          {
            question: "Over what period is each survivor's support measured?",
            answer: "Over the period each survivor would reasonably have depended on the decedent: for a spouse, typically through the decedent's expected life or worklife; for a child, through the age of majority or the completion of education, as the record and the governing framework support. The periods are presented separately so counsel can address them individually.",
          },
          {
            question: "Can the report serve both the estate's claim and the survivors' claims?",
            answer: "Yes. When the framework separates the two, the report presents the components applicable to each so the same underlying figures support both without double counting, and states which components belong to which claim.",
          },
        ],
      },
      "medical-malpractice": {
        summary: "A medical malpractice wrongful death analysis follows the same structure as any wrongful death claim, with earnings, personal consumption, household services, and support to dependents, and one added question: the decedent's life and worklife expectancy may already have been shortened by the condition being treated. The economist uses the expectancy the medical evidence supports rather than population averages alone, measures the loss against the outcome proper care would have produced, and, where the physicians disagree on how long the decedent would have lived with proper treatment, presents the loss under each opinion so the fact finder can attach the number to its finding.",
        faqs: [
          {
            question: "How does a shortened life expectancy change the wrongful death figure?",
            answer: "It shortens every stream: earnings, household services, and support to dependents all end at the expectancy the medical evidence supports. The economist states the expectancy applied and its source and shows the total under the alternatives in the record when the physicians disagree.",
          },
          {
            question: "Are the medical expenses of the negligent treatment part of the economist's work?",
            answer: "Past medical expenses are documented from billing records and usually presented by counsel. The economist's work concerns the economic loss to the survivors and the estate from the death itself, projected forward and discounted to present value.",
          },
        ],
      },
      "motor-vehicle-accident": {
        summary: "A fatal crash turns the motor vehicle accident claim into a wrongful death loss to the survivors. The economist documents the decedent's earnings and benefits from tax returns and employer records, projects them over a worklife expectancy with wage growth, deducts personal consumption where the framework requires it, values the household services the decedent provided, and measures the support each dependent would have received. Because policy limits often frame the practical range, the report presents each component and each survivor's loss separately so the same analysis serves settlement evaluation and trial, and it can be restructured if the venue or the pleading changes which components are recoverable.",
        faqs: [
          {
            question: "What records establish the decedent's earnings?",
            answer: "Several years of tax returns and W-2s, recent pay stubs, the employer's personnel and benefit records, and union or pension records. For a self-employed decedent, business returns and financial statements replace the wage records. The household's composition and the decedent's role at home come from family members' accounts.",
          },
          {
            question: "Is the analysis different when the decedent was retired or not working?",
            answer: "The earnings component may be small or absent, but the household services component stands on its own and can be substantial, and any pension or other income that would have supported dependents is measured over the period it would have continued. The report is built from the components the record supports.",
          },
        ],
      },
      "product-liability": {
        summary: "When a product causes a death, the economic claim follows the wrongful death structure with the personal consumption deduction as the key assumption. Because product cases often involve children, homemakers, and retirees, the household services and support components frequently carry more of the loss than the earnings component, and the economist builds the analysis from the household's account and time-use data where wage records do not exist. Earnings for a child or student are projected from the educational path and occupational data, personal consumption from household expenditure data adjusted to the household, and each survivor's loss is discounted to present value.",
        faqs: [
          {
            question: "How is the loss measured when the decedent was a child?",
            answer: "From the educational path the record supports and occupational earnings data for that level, starting at the age the child would have entered the workforce, with a personal consumption deduction appropriate to the household the child would have formed. The report states the assumptions and shows the result under alternatives.",
          },
          {
            question: "Can one wrongful death method serve many claimants in a mass tort?",
            answer: "Yes. The economist documents one method for earnings, consumption, household services, and support, then applies it to each decedent's own records so the figures are consistent in method and individual in result.",
          },
        ],
      },
    },
  },
  {
    slug: "personal-injury-economic-damages",
    name: "Personal Injury Economic Damages",
    shortName: "Personal Injury",
    pillar: true,
    description: "An integrated economic damages report for an injured person: lost earnings and fringe benefits, lost household services, and the present value of future medical and care costs supplied by treating providers or a life care plan. One report carries every economic component to a single present value with consistent growth, discount, and life expectancy assumptions, so counsel can present the damages as a whole and the jury sees one set of numbers.",
    icon: "Activity",
    keywords: ["economic damages expert", "personal injury economist", "future medical costs present value", "lost earnings and household services", "economic damages report"],
    caseTypes: ["personal-injury", "motor-vehicle-accident", "traumatic-brain-injury", "spinal-cord-injury", "medical-malpractice", "product-liability", "workers-compensation"],
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
    metaDescription: "Integrated personal injury economic damages reports for plaintiff and defense counsel nationwide: earnings, benefits, household services, and future care.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "What does an integrated economic damages report include?",
        answer: "Every economic component the record supports in one document: past and future lost earnings, lost fringe benefits, the replacement cost of household services, and the present value of future medical and care costs from a life care plan or treating recommendations. Each component is built from its own records and carried to a single present value with the same growth, discount, and life expectancy assumptions, so the pieces reconcile and the fact finder sees one set of numbers.",
      },
      {
        question: "Why put the components in one report instead of several?",
        answer: "Because the components share assumptions. A worklife expectancy, a life expectancy, and a discount rate applied inconsistently across separate reports invite cross-examination on the inconsistency rather than on the merits. One report states each assumption once, applies it everywhere it belongs, and lets counsel present the damages as a whole or by component.",
      },
      {
        question: "Who supplies the future medical costs?",
        answer: "The treating providers or a life care plan prepared by another professional. The economist does not decide what care is needed; the economist takes the items, frequencies, durations, and unit costs from that document, applies category-specific medical cost growth, and discounts the stream to present value over the applicable life expectancy.",
      },
      {
        question: "Can the report present alternative scenarios?",
        answer: "Yes, and it usually should. Where the return-to-work date, the post-injury capacity, or the level of care is disputed, the report shows the total under each scenario so the number tracks whatever the fact finder concludes, and counsel can evaluate settlement against the full range.",
      },
    ],
    related: [
      { title: "When Do You Need an Economic Expert?", href: "/guides/when-do-you-need-an-economic-expert", description: "Guide" },
      { title: "Household Services in Personal Injury Claims", href: "/guides/household-services-in-personal-injury", description: "Guide" },
      { title: "Fringe Benefits Valuation", href: "/methods/fringe-benefits-valuation", description: "Method" },
      { title: "Present Value and Discounting", href: "/methods/present-value-and-discounting", description: "Method" },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_ECEC", "BLS_ATUS", "BLS_CPI_MEDICAL", "CDC_LIFE_TABLES", "TREASURY_YIELD"]),
    caseTypeNotes: {
      "personal-injury": {
        summary: "The integrated economic damages report brings every component of a personal injury claim into one document: past and future lost earnings, lost fringe benefits, the replacement cost of household services, and the present value of future medical and care costs from a life care plan or treating recommendations. The economist builds each component from its own records, then carries all of them to a single present value with the same worklife, life expectancy, growth, and discount assumptions, so the pieces reconcile and counsel can present the damages as a whole or by component. Contested assumptions are shown as sensitivity ranges.",
        faqs: [
          {
            question: "When is an integrated report preferable to a stand-alone lost earnings analysis?",
            answer: "When the claim has more than one economic component. Household services, fringe benefits, and future care each rest on assumptions that also appear in the earnings analysis, and one report keeps those assumptions consistent. A claim limited to lost pay can be handled as a stand-alone lost earnings analysis.",
          },
          {
            question: "Which experts' opinions does the report depend on?",
            answer: "The treating providers' and retained experts' opinions on work capacity and on future care. The economist prices the consequences of those opinions and does not decide what the person can do or what care is needed, and the report states which opinion each component rests on.",
          },
        ],
      },
      "motor-vehicle-accident": {
        summary: "In a motor vehicle accident claim the integrated report scales to the injury. A moderate injury yields a bounded past earnings loss, household services during recovery, and the cost of future surgery or treatment; a catastrophic crash yields lifetime earnings and care losses in which the present value of attendant care and equipment can exceed the earnings loss. The economist builds each component from the record, applies consistent growth, discount, and life expectancy assumptions across all of them, and presents each component separately so the report supports settlement evaluation against policy limits as well as trial.",
        faqs: [
          {
            question: "Does the report cover household services during a temporary recovery?",
            answer: "Yes. Household work the person could not perform during recovery is valued at the cost of replacing it, and any permanent limitation on household work is projected over the person's expected life. The hours come from the household's account and time-use data for similar people.",
          },
          {
            question: "How are lost fringe benefits calculated in the report?",
            answer: "From the employer's benefit plan documents where available, covering retirement contributions, health insurance premiums, and paid leave. Where the documents are not available, published data on employer costs for employee compensation supply a benefit rate for the industry and occupation, and the report states which approach was used.",
          },
        ],
      },
      "traumatic-brain-injury": {
        summary: "Brain injury claims are where the integrated report earns its place: future lost earnings across a long worklife, the value of the supervision and management of daily affairs that family members now provide, and the present value of attendant care, therapy, medication, and case management in the life care plan all rest on the same life expectancy and discount assumptions. The economist values each component from its own record, prices the plan item by item with category-specific medical cost growth, and presents the total under alternative supervision and work-capacity scenarios so the fact finder can match the number to its findings.",
        faqs: [
          {
            question: "How is family-provided supervision valued in the report?",
            answer: "By the hours of supervision or assistance the record supports and the local market rate for the level of service a paid provider would charge, from companion care to skilled attendant care. The report states the hours, the rate, and the source, and reconciles them with any attendant care hours already in the life care plan.",
          },
          {
            question: "Why does the report show the total under more than one scenario?",
            answer: "Because residual work capacity and the level of supervision are matters of expert opinion, and the total is highly sensitive to both. Presenting the loss under each scenario lets counsel evaluate settlement against the full range and lets the fact finder attach the number to the finding it makes.",
          },
        ],
      },
      "spinal-cord-injury": {
        summary: "For a spinal cord injury the integrated report joins a lost earnings analysis that usually reflects the end of the prior occupation with a life care plan dominated by attendant care, equipment replacement cycles, supplies, home and vehicle modifications, and periodic hospitalization. The economist projects the but-for earnings path, sets against it the post-injury path the work-capacity opinions support, values household services across the person's life, and prices the plan item by item with the cost growth appropriate to each category and the replacement intervals the plan specifies. Home-based and facility-based care scenarios are presented when the plan offers both.",
        faqs: [
          {
            question: "How are equipment replacement cycles handled?",
            answer: "Each item is scheduled at the interval the life care plan specifies, priced at current cost, grown at the applicable rate to each replacement date, and discounted back to present value. The report lists the schedule so counsel can see how many replacements the horizon contains.",
          },
          {
            question: "Is attendant care provided by family members valued differently?",
            answer: "It is valued at the local market rate for the level of care involved, for the hours the plan and the record support, and shown separately from paid care so counsel can present it under the governing framework. The report checks that the same hours are not also counted as lost household services.",
          },
        ],
      },
      "medical-malpractice": {
        summary: "In a medical malpractice claim every component of the integrated report is measured as the difference between two paths: the outcome the patient would have had with proper care and the outcome the injury produced. The economist takes the causation and prognosis opinions as the baseline, builds the but-for earnings and care profile from them, and measures only the incremental earnings loss, household services loss, and care cost the injury added. Where physicians disagree on life expectancy or apportionment, the report presents the total under each scenario so the fact finder can attach the number to its finding.",
        faqs: [
          {
            question: "How does the report separate incremental care from care the condition would have required anyway?",
            answer: "From the life care plan or treating recommendations and the medical opinions that distinguish the two. The economist values the incremental items only, states which items were treated as incremental and why, and shows the effect of moving contested items from one category to the other.",
          },
          {
            question: "Can the report be prepared before the life care plan is final?",
            answer: "Yes. The earnings and household services components can be built from the financial and household records while the plan is being finalized, and the plan is integrated on the same assumptions when it is ready.",
          },
        ],
      },
      "product-liability": {
        summary: "Product liability injuries such as burns, amputations, and neurological injuries produce large future earnings and care losses, while the injured person is often a consumer, child, homemaker, or retiree whose earnings history does not fit the injury. The integrated report is built from the components the record supports: earnings projected from the person's own path or educational trajectory, household services from the household's account and time-use data, and future care from the life care plan with category-specific cost growth, all carried to one present value on consistent assumptions. In a mass tort setting the economist applies one documented method across the claimants so each figure traces to its own record.",
        faqs: [
          {
            question: "How is the report built for a homemaker or retiree with no wage records?",
            answer: "From the household services and care components. The hours of household work the person performed are drawn from the household's account and time-use data and valued at replacement cost over the person's expected life or the period of limitation, and future care is priced from the plan. The earnings component is included only where the record supports it.",
          },
          {
            question: "Can the report support a consistent damages model across many claimants?",
            answer: "Yes. One documented method for earnings, benefits, household services, and care is applied to each claimant's own records, so the figures are consistent in method and individual in result, which supports both settlement allocation and trial.",
          },
        ],
      },
      "workers-compensation": {
        summary: "When a work injury also gives rise to a third-party action, the integrated report measures the full economic loss the civil claim can reach: lost earnings and fringe benefits, household services, and the present value of future care, components the compensation system pays only in part or not at all. The economist builds each component from the wage records, the carrier's payment history, the work-capacity opinions, and the treatment projection, and presents the gross loss alongside the benefits already paid so lien, offset, and collateral source questions can be answered from the same numbers. The compensation measure and the civil measure are reconciled so the same facts support both.",
        faqs: [
          {
            question: "How does the report treat the indemnity and medical benefits the carrier has paid?",
            answer: "It identifies them and reports them separately from the gross loss rather than netting them, unless counsel asks for a net presentation. Counsel can then address lien, offset, and collateral source questions under the governing framework with the amounts in hand.",
          },
          {
            question: "Does the economist prepare the future medical projection?",
            answer: "No. The treatment projection comes from the treating providers or a medical cost projection prepared by others. The economist takes the items, frequencies, and costs from that document, applies cost growth, and calculates present value on the same assumptions as the other components.",
          },
        ],
      },
    },
  },
  {
    slug: "household-services-valuation",
    name: "Household Services Valuation",
    shortName: "Household Services",
    pillar: true,
    description: "Replacement-cost valuation of the household production an injured or deceased person can no longer provide: meal preparation, cleaning, home and vehicle maintenance, shopping, child care, and care of other household members. The hours are drawn from national time-use data adjusted to the person's household composition and pre-injury role, and each category is priced at the local wage for the occupation that would replace it, then projected and discounted over the period of loss.",
    icon: "Home",
    keywords: ["household services valuation", "loss of household services", "replacement cost of household services", "time-use data", "household production economist"],
    caseTypes: ["personal-injury", "wrongful-death", "traumatic-brain-injury", "spinal-cord-injury", "motor-vehicle-accident", "medical-malpractice", "workers-compensation", "product-liability"],
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
    metaDescription: "Household services valuation for plaintiff and defense counsel nationwide: replacement cost of the household work an injured or deceased person no longer does.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "How are the lost hours of household work determined?",
        answer: "From national time-use data for a person of the same age, sex, employment status, and household composition, adjusted to the household's own account of who did what before the injury. The report shows the hours by category, such as meal preparation, cleaning, maintenance, shopping, and child care, and states where the household's account and the published data differ.",
      },
      {
        question: "How is each hour valued?",
        answer: "At the local wage for the occupation that would replace it: a housekeeper for cleaning, a cook for meal preparation, a child care worker for child care, and so on, drawn from published occupational wage data for the household's area. The report states the wage source and date and projects the rates forward with growth before discounting to present value.",
      },
      {
        question: "What if the injured person can still do some household work?",
        answer: "The loss is apportioned by category. The medical restrictions and the household's account establish which tasks the person can no longer perform, which they can perform with limits, and which are unaffected, and only the lost or reduced hours are valued. The report shows the apportionment so it can be tested.",
      },
      {
        question: "Does a household services claim overlap with attendant care in a life care plan?",
        answer: "It can, and the report checks for it. Attendant care hours in a plan may already cover tasks that would otherwise be counted as lost household services. The valuation reconciles the two so the same hours are not claimed twice, and states which document controls each category.",
      },
    ],
    related: [
      { title: "Household Services in Personal Injury Claims", href: "/guides/household-services-in-personal-injury", description: "Guide" },
      { title: "Household Services Methodology", href: "/methods/household-services-methodology", description: "Method" },
      { title: "Wrongful Death Damages, Explained", href: "/guides/wrongful-death-damages-explained", description: "Guide" },
    ],
    sources: refsToSources(["BLS_ATUS", "BLS_OES", "CENSUS_ACS", "NAFE_JFE"]),
    // Assessment versus valuation: which tasks the person can no longer do is
    // a functional and vocational question; pricing the lost hours is the
    // economist's (audit F08: the two practices' household-services pages did
    // not allocate the responsibility).
    handoff: {
      text: "Which household tasks the injured person can no longer perform, and for how long, is a functional question answered from the medical record or by the affiliated vocational practice; the economist's work is the valuation that follows: the hours, the replacement wage for each task, and the present value of the loss.",
      linkLabel: "Vocational and functional assessment at the affiliated practice",
      href: VOC_SERVICE_URL,
    },
    caseTypeNotes: {
      "personal-injury": {
        summary: "In a personal injury claim the household services loss is measured from the difference between the household work the person did before the injury and what they can do now. The economist draws the pre-injury hours from national time-use data for a person of the same age, sex, employment status, and household composition, adjusted to the household's own account, apportions the loss by category using the medical restrictions in the record, and prices each category at the local wage for the occupation that would replace it. The loss is projected over the period of limitation, or over life expectancy where the limitation is permanent, and discounted to present value.",
        faqs: [
          {
            question: "Does a temporary injury support a household services claim?",
            answer: "Yes, for the period of limitation. The hours the person could not perform during recovery are valued at replacement cost, and the claim ends when the record shows the person resumed the work. A permanent restriction extends the claim over the person's expected life.",
          },
          {
            question: "How is a partial loss apportioned?",
            answer: "By category. The medical restrictions and the household's account establish which tasks the person can no longer do, which they can do with limits, and which are unaffected, and only the lost or reduced hours are valued. The report shows the apportionment so it can be tested.",
          },
        ],
      },
      "wrongful-death": {
        summary: "In a wrongful death claim the household services component measures the housework, child care, home and vehicle maintenance, shopping, and care of other household members the decedent provided and can no longer provide. The economist draws the hours from the household's account and time-use data for a person of similar circumstances, prices each category at the local replacement wage, and projects the loss over the period the survivors would have received the services, which changes as children age and the household changes. The component stands on its own and can approach or exceed the earnings loss when the decedent was a full-time homemaker or a caregiver.",
        faqs: [
          {
            question: "Is a homemaker's contribution valued when there were no wages?",
            answer: "Yes. The household services component does not depend on the decedent having earned wages. The hours of household work are drawn from the household's account and time-use data and valued at the cost of replacing them with paid services over the period the survivors would have received them.",
          },
          {
            question: "How does the projection account for children growing up?",
            answer: "The hours of child care and related work decline as children reach the ages at which the time-use data show parents providing less of it, and the projection steps down accordingly. The report shows the hours by year so the change is visible.",
          },
        ],
      },
      "traumatic-brain-injury": {
        summary: "After a brain injury the household services loss often extends beyond the physical tasks to the management of the household itself: bill paying, scheduling, supervising children, and the planning that family members now perform. The economist measures the hours lost by category from the household's account and time-use data, distinguishes the tasks the person can no longer do from those they can do with supervision, and prices each category at the local replacement wage. Where the life care plan also carries attendant care or supervision hours, the valuation reconciles the two so the same hours are not claimed twice.",
        faqs: [
          {
            question: "Is household management a compensable household service?",
            answer: "The planning, bill paying, and coordination of a household are household work and are counted when the record shows the person performed them and the injury has ended or limited that role. The hours are drawn from the household's account and time-use data and valued at the local rate for the service that would replace them.",
          },
          {
            question: "How does the valuation avoid double counting with the life care plan?",
            answer: "By checking the plan's attendant care and supervision hours against the household services categories. Where the plan already pays for hours that cover a household task, the valuation excludes those hours from the household services claim and states which document controls each category.",
          },
        ],
      },
      "spinal-cord-injury": {
        summary: "A spinal cord injury usually removes most or all of a person's household work permanently, so the household services loss runs across the person's expected life and is often a total loss in the physical categories. The economist draws the pre-injury hours from the household's account and time-use data, identifies any categories the person can still perform, prices each category at the local replacement wage, and projects the loss over the life expectancy the medical evidence supports with wage growth before discounting. Because the life care plan for spinal cord injury carries attendant care hours, the valuation reconciles the two so household tasks covered by attendant care are not counted twice.",
        faqs: [
          {
            question: "Which household categories are typically lost after a spinal cord injury?",
            answer: "The physical categories: cleaning, meal preparation, home and vehicle maintenance, yard work, shopping, and the physical care of children or other household members. Management tasks such as bill paying may remain, and the report values only the categories the record shows are lost or reduced.",
          },
          {
            question: "Does the household services claim depend on the life expectancy used for the care plan?",
            answer: "Yes. The same life expectancy sets the horizon for both, and the economist applies the expectancy the medical evidence supports to each. Where physicians disagree, the report presents the household services value under each so the two components stay consistent.",
          },
        ],
      },
      "motor-vehicle-accident": {
        summary: "Motor vehicle accident claims produce household services losses ranging from a few months of replaced tasks during recovery to a permanent reduction after a catastrophic injury. The economist measures the hours the person could not perform during recovery from the household's account and time-use data, values them at replacement cost, and, where the injury leaves a permanent limitation, apportions the ongoing loss by category and projects it over the person's expected life with growth and discounting. The report presents the recovery period and the permanent loss separately so the same analysis serves settlement evaluation and trial.",
        faqs: [
          {
            question: "How is the recovery period established?",
            answer: "From the medical record and the household's account: the date of injury, the restrictions in place during treatment, and the date the person resumed each category of household work. The hours are valued over that period at the local replacement wage.",
          },
          {
            question: "Are a spouse's extra hours part of the claim?",
            answer: "The claim measures the injured person's lost hours at the cost of replacing them with paid services, whoever actually performed the work. A spouse or family member taking on the tasks does not reduce the loss; it shows what was replaced and by whom.",
          },
        ],
      },
      "medical-malpractice": {
        summary: "In a medical malpractice claim the household services loss is measured against the outcome the patient would have had with proper care. The economist takes the causation and prognosis opinions as the baseline for what the patient could have done at home, measures the hours the injury removed by category from the household's account and time-use data, and values them at the local replacement wage over the period the medical evidence supports. Where the underlying condition would have limited household work on its own, only the incremental loss is valued, and the report shows the result under each apportionment opinion in the record.",
        faqs: [
          {
            question: "How is the incremental household services loss separated from the underlying condition?",
            answer: "From the medical opinions that describe what the patient could have done with proper care. The economist values only the hours the injury removed beyond that baseline and states the apportionment applied, showing the result under each opinion when the physicians disagree.",
          },
          {
            question: "Does the household services claim survive when the patient has died?",
            answer: "It becomes the household services component of the wrongful death analysis: the services the decedent would have provided to the household over the period the survivors would have received them, valued at replacement cost and discounted to present value.",
          },
        ],
      },
      "workers-compensation": {
        summary: "The compensation system does not pay for lost household services, but a third-party action arising from the same work injury can reach them. The economist measures the hours of household work the injury has removed by category from the household's account and time-use data, apportions the loss using the work-capacity and medical restrictions already in the compensation record, and prices each category at the local replacement wage over the period of limitation or life expectancy. The component is presented alongside the earnings loss so the third-party claim is complete and the compensation lien and offset questions can be addressed from one set of numbers.",
        faqs: [
          {
            question: "Can the compensation record support the household services claim?",
            answer: "Often. The medical restrictions, the functional capacity findings, and the treating opinions developed for the compensation claim describe what the person can and cannot do physically, and the economist applies them to the household categories. The household's own account supplies the pre-injury hours.",
          },
          {
            question: "Is a household services loss ever part of the compensation claim itself?",
            answer: "Generally no; the compensation system replaces wages and pays medical treatment. The component belongs to the civil claim, and the report presents it separately from the amounts the compensation system pays.",
          },
        ],
      },
      "product-liability": {
        summary: "Product liability claims often involve children, homemakers, and retirees whose economic loss is concentrated in household work rather than wages, so the household services valuation is frequently the largest component. The economist draws the pre-injury hours from the household's account and time-use data for a person of the same circumstances, apportions the loss by category using the medical restrictions in the record, prices each category at the local replacement wage, and projects the loss over the period of limitation or the person's expected life. In a mass tort setting the same documented method is applied to each claimant's own household so results are consistent in method and individual in result.",
        faqs: [
          {
            question: "How are household services valued for a retiree?",
            answer: "From the hours of household work the person performed, drawn from the household's account and time-use data for retired people of similar circumstances, valued at the cost of replacing those hours with paid services and projected over the person's expected life or the period the injury limits them.",
          },
          {
            question: "Can a child have a household services loss?",
            answer: "Where the record shows the child performed household work or would have as they grew, the lost hours are valued from the age they would have begun, using time-use data for children and young adults. More often the loss appears as the additional care the household must now provide, which is measured as attendant care rather than as the child's lost services.",
          },
        ],
      },
    },
  },
  {
    slug: "life-care-plan-cost-projection",
    name: "Life Care Plan Cost Projection and Present Value",
    shortName: "Life Care Plan Costing",
    titleName: "Life Care Plan Cost Projection",
    titleShortName: "Life Care Plan Cost",
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
    metaDescription: "Life care plan cost projection and present value for plaintiff and defense counsel nationwide: medical cost growth by category, discounting, life expectancy.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "What does the economist do with a life care plan?",
        answer: "Reduce it to a present value. Each item in the plan carries a frequency, a duration, and a current unit cost; the economist projects each item forward with the medical cost growth rate appropriate to its category, sums the stream year by year over the applicable life expectancy, and discounts it to present value with the rate stated. The plan's authorship and its clinical content stay with its author.",
      },
      {
        question: "Which growth rate is applied to future medical costs?",
        answer: "A category-specific rate drawn from published medical price indexes, so physician services, hospital care, prescription drugs, equipment, and attendant care each carry the growth history of their own category rather than one rate for the whole plan. The report states each rate and its source and shows the effect of a single blended rate for comparison.",
      },
      {
        question: "How does life expectancy enter the calculation?",
        answer: "It sets the horizon for every lifetime item. The economist applies the life expectancy the medical evidence supports, whether population tables or a physician's opinion of a reduced expectancy, and where the physicians disagree presents the present value under each so the fact finder can attach the number to the finding it makes.",
      },
      {
        question: "Can the valuation compare plaintiff and defense plans?",
        answer: "Yes. When two plans are in the record, the economist values each on the same growth, discount, and life expectancy assumptions and presents the difference item by item, so counsel can see which plan items, rather than which economic assumptions, account for the gap between the two totals.",
      },
    ],
    related: [
      { title: "Present Value and Discounting", href: "/methods/present-value-and-discounting", description: "Method" },
      { title: "Present Value, Explained for Attorneys", href: "/guides/present-value-explained-for-attorneys", description: "Guide" },
      { title: "Net vs. Gross Discount Rate", href: "/compare/net-vs-gross-discount-rate", description: "Comparison" },
      { title: "Forensic Economist vs. Life Care Planner", href: "/compare/economist-vs-life-care-planner", description: "Comparison" },
    ],
    sources: refsToSources(["BLS_CPI_MEDICAL", "CDC_LIFE_TABLES", "TREASURY_YIELD", "NAFE_JFE", "JONES_LAUGHLIN_PFEIFER"]),
    handoff: {
      text: "The life care plan itself is authored by the affiliated life care planning practice, which sets each item's frequency, duration, and unit cost from the medical record; the economist prices the finished plan to present value and does not alter its contents.",
      linkLabel: "Life care plan authorship at the affiliated practice",
      href: LCP_SERVICE_URL,
    },
    caseTypeNotes: {
      "traumatic-brain-injury": {
        summary: "A brain injury life care plan is dominated by attendant care and supervision, therapy, medication, and case management over a lifetime, and its present value is highly sensitive to the daily hours of paid help the plan specifies and the life expectancy applied. The economist carries each item forward with the medical cost growth appropriate to its category, discounts the stream over the life expectancy the medical evidence supports, and presents the total under alternative supervision levels when the plan or the record offers more than one. Every valued item ties back to the plan so counsel and the plan's author can confirm that the valuation reconciles.",
        faqs: [
          {
            question: "What does the economist need from a brain injury life care plan?",
            answer: "Each item's description, frequency, duration, start and end ages, and current unit cost, with the attendant care and supervision hours stated by level of service. Items with a range of frequencies are valued at each end of the range, and the report shows which items drive the total.",
          },
          {
            question: "How is the present value affected when physicians disagree on life expectancy?",
            answer: "The economist presents the present value under each expectancy in the record. Because attendant care runs for life, the total moves materially with the horizon, and showing each result lets the fact finder attach the number to the finding it makes.",
          },
        ],
      },
      "spinal-cord-injury": {
        summary: "A spinal cord injury life care plan carries attendant care, wheelchair and equipment replacement cycles, supplies, home and vehicle modifications, and periodic hospitalization for complications, each with its own frequency, replacement interval, and cost category. The economist schedules each replacement at the interval the plan specifies, grows each item at the rate appropriate to its category, discounts the stream over the life expectancy the medical evidence supports, and presents home-based and facility-based care scenarios when the plan offers both. The report lists the replacement schedule so counsel can see how many cycles the horizon contains.",
        faqs: [
          {
            question: "How are equipment replacement cycles valued?",
            answer: "Each item is priced at current cost, scheduled at the interval the plan specifies, grown at the applicable rate to each replacement date, and discounted back to present value. The report lists the schedule item by item so the number of replacements within the horizon is visible.",
          },
          {
            question: "Does the valuation compare home-based and facility-based care?",
            answer: "Yes, when the plan presents both. Each scenario is valued on the same growth, discount, and life expectancy assumptions and the difference is shown item by item, so counsel can see which care items account for the gap between the two totals.",
          },
        ],
      },
      "medical-malpractice": {
        summary: "In a medical malpractice matter the life care plan often distinguishes the incremental care the injury requires from the care the underlying condition would have required anyway, and the present value must respect that line. The economist values the incremental items only, applies category-specific medical cost growth, and discounts the stream over the life expectancy the medical evidence supports, which may already have been reduced by the condition being treated. Where the physicians disagree on life expectancy or on which items are incremental, the report presents the present value under each scenario so the fact finder can attach the number to its finding.",
        faqs: [
          {
            question: "How does the valuation handle items that the condition would have required regardless?",
            answer: "It excludes them, following the plan and the medical opinions that identify which care is incremental. The report states which items were treated as incremental and shows the effect of moving contested items from one category to the other.",
          },
          {
            question: "Which life expectancy applies when the condition itself shortened it?",
            answer: "The expectancy the medical evidence supports for the patient with proper care, which may be shorter than population tables. The economist applies that figure to the incremental care stream and shows the result under each opinion when the physicians disagree.",
          },
        ],
      },
      "personal-injury": {
        summary: "For a personal injury claim the life care plan supplies the future medical and care items, and the economist's role is the economic translation of those items into a present value that reconciles with the plan. Each item's frequency, duration, and unit cost is carried forward with the medical cost growth appropriate to its category, summed year by year over the applicable life expectancy, and discounted with the rate stated. The result can stand alone or enter an integrated damages report on the same growth, discount, and life expectancy assumptions as the earnings and household services components.",
        faqs: [
          {
            question: "Should the life care plan valuation be a separate report or part of the damages report?",
            answer: "Either works, and counsel decides. As a stand-alone valuation the report ties every figure to the plan; as a component of an integrated report it shares assumptions with the earnings and household services analyses so the whole claim reconciles.",
          },
          {
            question: "What happens when the plan is revised during the litigation?",
            answer: "The valuation is updated on the same assumptions. Because each valued item ties back to a plan line, a revised plan is revalued item by item and the report shows what changed and by how much.",
          },
        ],
      },
      "product-liability": {
        summary: "Product liability injuries such as burns, amputations, and neurological injuries produce life care plans with long horizons and heavy recurring items, and the injured person is often a child whose plan runs for a full life expectancy. The economist carries each item forward with category-specific medical cost growth, schedules replacements at the plan's intervals, and discounts the stream over the life expectancy the medical evidence supports. In a mass tort setting the same growth, discount, and life expectancy conventions are applied across the claimants' plans so the valuations are consistent in method and each traces to its own plan.",
        faqs: [
          {
            question: "How is a child's life care plan valued?",
            answer: "Over the full life expectancy the medical evidence supports, with items that begin or end at stated ages scheduled accordingly and growth applied from the valuation date to each year of care. The report shows the annual stream so counsel can see how the plan's phases contribute to the total.",
          },
          {
            question: "Can one set of economic assumptions serve many claimants' plans?",
            answer: "Yes. The economist documents the growth rates by category, the discount rate, and the life expectancy conventions once and applies them to each plan, so the valuations are comparable across claimants while each remains tied to its own plan.",
          },
        ],
      },
      "motor-vehicle-accident": {
        summary: "After a catastrophic crash the present value of the life care plan can exceed the earnings loss, and the attendant care, equipment, and future surgery items in the plan drive the total. The economist reduces the plan to present value with category-specific medical cost growth over the life expectancy the medical evidence supports, presents the total under alternative care scenarios where the plan offers them, and states every assumption so the valuation can be examined item by item. Because policy limits often frame the practical range, the report shows the plan's present value by category so counsel can evaluate settlement against the components that carry the most weight.",
        faqs: [
          {
            question: "Which items in a crash injury life care plan usually drive the present value?",
            answer: "Attendant care where the plan specifies daily hours, equipment on replacement cycles, and any future surgeries or hospitalizations with their associated therapy. The report shows the present value by category so the drivers are visible.",
          },
          {
            question: "How is the discount rate chosen for the plan?",
            answer: "From yields on low-risk instruments matched to the horizon of the care stream, applied consistently with the medical cost growth rates so the net relationship between growth and discounting is stated. Where the venue applies a convention, the report follows it and says so.",
          },
        ],
      },
    },
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
    metaDescription: "Employment and wage-loss damages for plaintiff and defense counsel nationwide: back pay, front pay, lost benefits, mitigation, and wage-and-hour reconstruction.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "What is the difference between back pay and front pay?",
        answer: "Back pay runs from the adverse action to the date of trial or analysis and is built from what the employee would have earned in the position, less what the employee actually earned elsewhere. Front pay runs from that date forward until the employee reaches, or would reasonably reach, comparable compensation, and is discounted to present value. The report states both separately with the benefits component shown on its own.",
      },
      {
        question: "How does the analysis treat mitigation?",
        answer: "Actual replacement earnings are taken from the employee's pay records and tax returns and netted against the but-for path year by year. Where the employee has not found comparable work, the report states a reasonable job-search duration and a replacement wage level drawn from local occupational data, and presents the loss with and without the offset so counsel can address whether the search was reasonable.",
      },
      {
        question: "Can the analysis handle bonuses, commissions, and equity?",
        answer: "Yes. Variable pay is projected from the employee's own history, the plan's formula, and the awards of comparable employees where available; equity is valued from the plan terms and the vesting schedule the employee would have followed. Each element is shown separately because these components can exceed base pay for senior employees.",
      },
      {
        question: "What does a wage-and-hour reconstruction involve?",
        answer: "Rebuilding the hours worked and the pay owed from timekeeping data, schedules, payroll records, and any other record of when work was performed, for an individual claimant or across a class. The report documents the method, the data gaps, and the assumptions used to fill them so the figure can be examined by pay period and by employee.",
      },
    ],
    related: [
      { title: "Mitigation and Offsets", href: "/methods/mitigation-and-offsets", description: "Method" },
      { title: "Wage Growth and Earnings Projection", href: "/methods/wage-growth-and-earnings-projection", description: "Method" },
      { title: "Fringe Benefits Valuation", href: "/methods/fringe-benefits-valuation", description: "Method" },
    ],
    sources: refsToSources(["BLS_CPS", "BLS_OES", "BLS_ECI", "BLS_ECEC", "TREASURY_YIELD"]),
    caseTypeNotes: {
      "employment-discrimination": {
        summary: "In an employment discrimination matter the analysis measures the gap between the compensation the employee would have received absent the adverse action and the compensation actually received, from the date of the action through a reasonable point in the future. The economist reconstructs the but-for path from the employer's payroll records and pay practices, including raises, bonuses, and benefit accruals, nets actual interim earnings year by year, evaluates mitigation, bounds the front pay period, and discounts future amounts to present value. In failure-to-promote and pay-disparity claims the analysis compares the employee's compensation with the position or comparators counsel identifies.",
        faqs: [
          {
            question: "How are comparators used in a pay-disparity analysis?",
            answer: "Counsel identifies the comparators; the economist compares the employee's compensation with theirs over the relevant period, documents the differences by pay element, and computes the shortfall with interest where applicable. The report states the effect of using each comparator set.",
          },
          {
            question: "What if the employee has not found comparable work?",
            answer: "The report states a reasonable job-search duration and a replacement wage level drawn from local occupational data and unemployment duration data, and presents the loss with and without the offset so counsel can address whether the search was reasonable.",
          },
        ],
      },
      "wrongful-termination": {
        summary: "A wrongful termination analysis asks what the employee lost when the employment ended and how much of that loss has been or should be replaced by other work. The economist builds the but-for compensation path from the employment agreement, pay history, and the employer's pay and promotion practices, including the benefit and pension accruals that would have continued, and compares it with the replacement earnings actually received. Front pay is projected over the period the record supports for reaching comparable employment, pension and deferred compensation losses are calculated from the plan terms, equity losses from the award schedule, and the future components are discounted to present value.",
        faqs: [
          {
            question: "How are pension losses calculated for a long-tenured employee?",
            answer: "By applying the plan's benefit formula to the service and pay the employee would have accrued through the but-for retirement date and comparing it with the benefit actually vested, then valuing the difference over the employee's expected retirement period. Plan documents and benefit statements are required.",
          },
          {
            question: "Which measure of lost health coverage does the report use?",
            answer: "The report can present either or both measures. The employer's contribution reflects what the package was worth; the employee's cost to replace coverage reflects what the loss costs the household. The economist states which is used and why.",
          },
        ],
      },
    },
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
    metaDescription: "Business valuation for litigation, plaintiff and defense, nationwide: income, market, and asset approaches under the governing standard of value, documented.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "Which standard of value applies?",
        answer: "The one the matter's governing framework or the parties' agreement identifies: fair market value in most tax and buy-sell contexts, fair value in many shareholder oppression and dissenting-shareholder claims, and the standard the domestic relations framework applies in divorce. The standard determines whether discounts for lack of control and marketability apply, and the report states the standard used and can show the result under an alternative.",
      },
      {
        question: "Which valuation approaches are used?",
        answer: "The income, market, and asset approaches as the facts support. An operating company with a track record is usually valued on its expected cash flows, with market multiples as a check; an asset-holding entity on the value of what it holds. The report explains which approaches were applied, how the indications were reconciled, and why any approach was not used.",
      },
      {
        question: "What records are needed to value a closely held business?",
        answer: "Several years of financial statements and tax returns, general ledger detail, the operating or shareholder agreement, ownership records, budgets and forecasts, compensation records for the owners, and any prior valuations or buy-sell offers. The records also support the normalizing adjustments for owner compensation, related-party transactions, and non-operating assets.",
      },
      {
        question: "How does the valuation hold up on cross-examination?",
        answer: "By documenting every input. The report ties each normalizing adjustment to a record, states the source and date of every market input, explains the discount rate and any valuation discounts from published data, and shows how the conclusion moves with the principal assumptions, so the opposing side can test the method rather than guess at it.",
      },
    ],
    related: [
      { title: "Business Valuation in Litigation", href: "/guides/business-valuation-in-litigation", description: "Guide" },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches", description: "Method" },
      { title: "Fair Market Value vs. Fair Value", href: "/compare/fair-market-value-vs-fair-value", description: "Comparison" },
      { title: "Lost Profits vs. Business Valuation", href: "/compare/lost-profits-vs-business-valuation", description: "Comparison" },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "TREASURY_YIELD"]),
    caseTypeNotes: {
      "partnership-and-shareholder-dispute": {
        summary: "In a partnership or shareholder dispute the valuation turns on the valuation date, the standard of value, and any buyout formula in the operating or shareholder agreement. The economist reviews the agreements to fix those terms, normalizes the financial statements for owner compensation, related-party transactions, and non-recurring items, and values the interest using the income, market, and asset approaches as the facts support. Because a fair value standard may exclude the minority and marketability discounts that fair market value applies, the report states the standard used and can show the result under the alternative so the difference is quantified rather than argued.",
        faqs: [
          {
            question: "Does the report apply the buyout formula in the agreement?",
            answer: "Where the agreement specifies a formula, the economist applies it to the financial records as of the relevant date and, if counsel asks, compares the formula result with the value under the applicable standard so the difference is quantified.",
          },
          {
            question: "How are excess compensation and related-party dealings treated?",
            answer: "As normalizing adjustments to earnings. The economist compares the compensation paid with market compensation for the role and treats the excess, along with personal expenses run through the business, as adjustments that restore the earnings the business would show under arm's-length management.",
          },
        ],
      },
      "divorce-and-marital-dissolution": {
        summary: "In a divorce the business valuation is usually the largest and most contested figure in the marital estate, and the valuation date, the treatment of personal goodwill, and the normalization of owner compensation move it materially. The economist normalizes the financial statements for owner compensation, personal expenses, and non-recurring items, values the business under the standard the domestic relations framework applies, and addresses personal and enterprise goodwill where the framework requires the distinction. The same normalized statements support the income determination for support, so the two analyses reconcile.",
        faqs: [
          {
            question: "How is personal goodwill separated from enterprise goodwill?",
            answer: "Enterprise goodwill is value that stays with the business regardless of who owns it; personal goodwill is value tied to the owner's reputation and relationships. Where the framework treats only enterprise goodwill as marital property, the economist quantifies each and explains the basis for the split.",
          },
          {
            question: "Can the valuation be prepared as a joint or court-appointed engagement?",
            answer: "Yes. The methods and reporting are the same whether the engagement is for one spouse, both, or the court, and the report is written so that either side can examine the assumptions.",
          },
        ],
      },
      "commercial-contract-dispute": {
        summary: "A contract breach can permanently impair a business or end it, and when it does the measure of loss shifts from lost profits over a period to the diminished value of the business itself. The economist values the business before and after the breach under a consistent standard and approach, isolates the change attributable to the conduct at issue from market conditions and other causes, and coordinates the valuation with any lost profits claim so the same loss is not counted twice. The report explains which measure applies to which period and why.",
        faqs: [
          {
            question: "When is lost business value the right measure instead of lost profits?",
            answer: "When the breach permanently impaired or ended the business. Lost profits measure earnings lost over a period while the business continues; lost business value measures the reduction in what the business is worth. The report uses one or the other, or both for different periods, and explains the choice.",
          },
          {
            question: "How is the value before the breach established?",
            answer: "From the financial statements, projections, and market conditions as they stood at the breach date, valued under the income, market, and asset approaches as the facts support. The after-breach value uses the same approaches with the effect of the conduct isolated from other causes.",
          },
        ],
      },
    },
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
    metaDescription: "Lost profits and commercial damages for plaintiff and defense counsel nationwide: but-for revenue and costs, causation, mitigation, and the period of loss.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "How are lost profits measured?",
        answer: "As the difference between the profits the business would have earned had the conduct at issue not occurred and the profits it actually earned or could have earned by mitigating. The but-for path is built from the company's own history, its pre-dispute projections, its market, and the terms of the disputed relationship, and only the incremental margin lost is claimed, not the gross revenue.",
      },
      {
        question: "What records support a lost profits claim?",
        answer: "Financial statements and tax returns for several years, sales and cost detail by product or customer, the contracts at issue, budgets and forecasts prepared before the dispute, and industry and market data for the loss period. Records prepared before the dispute carry the most weight because they were not written with the claim in mind.",
      },
      {
        question: "How is the period of loss determined?",
        answer: "From the contract term, the time the business would reasonably need to replace the lost volume, and the market conditions during the loss period. An open-ended period is scrutinized closely, so the report reasons through when the loss ends and shows how the total changes under a shorter or longer period.",
      },
      {
        question: "How does the analysis address causation and mitigation?",
        answer: "Each claimed loss is linked to the conduct at issue and separated from losses that market conditions or the company's own decisions would have caused anyway. Mitigation revenue and any costs avoided are credited against the loss, and future lost profits are discounted at a rate that reflects the risk of the earnings stream, with the rate stated and its effect shown.",
      },
    ],
    related: [
      { title: "Lost Profits and But-For Analysis", href: "/methods/lost-profits-but-for-analysis", description: "Method" },
      { title: "Lost Profits vs. Lost Business Value", href: "/guides/lost-profits-vs-lost-business-value", description: "Guide" },
      { title: "Lost Profits vs. Business Valuation", href: "/compare/lost-profits-vs-business-valuation", description: "Comparison" },
      { title: "Mitigation and Offsets", href: "/methods/mitigation-and-offsets", description: "Method" },
    ],
    sources: refsToSources(["AAEFE_JLE", "NAFE_JFE", "TREASURY_YIELD", "BLS_CPI"]),
    caseTypeNotes: {
      "commercial-contract-dispute": {
        summary: "In a commercial contract dispute the lost profits analysis reconstructs what the business would have earned had the other party performed: the revenue the contract would have produced less the incremental costs of earning it, over the contract's remaining term or the period the market supports. The economist builds the but-for path from the contract terms, the pre-dispute projections, and the company's history, separates incremental from fixed costs so only the lost margin is claimed, credits mitigation, and discounts future lost profits at a rate that reflects the risk of the earnings stream. Each element of the claim ties to a document so it can be tested independently.",
        faqs: [
          {
            question: "Why does incremental cost treatment matter so much?",
            answer: "Because whether a cost would have been avoided when the revenue disappeared changes the margin and therefore the loss. The economist classifies each cost from the general ledger and the company's cost behavior, states the classification, and shows the effect of treating contested costs the other way.",
          },
          {
            question: "Can lost profits be measured for a new venture?",
            answer: "It is harder, and the report says so. The projection is built from the business plan, comparable businesses, the market's size and growth, and any performance before the breach, and it is presented with the uncertainty made explicit rather than hidden in a single number.",
          },
        ],
      },
      "partnership-and-shareholder-dispute": {
        summary: "In a partnership or shareholder dispute a lost profits claim arises when one owner's conduct, such as diverting customers, competing with the business, or excluding a partner from its earnings, reduced the profits the business or the excluded owner would otherwise have received. The economist establishes the but-for profits from the company's history and market, links the shortfall to the conduct at issue, quantifies diverted revenue from the ledger and customer records, and presents the owner's share of the lost profits by year. The analysis is coordinated with any valuation of the interest so the same loss is not counted in both.",
        faqs: [
          {
            question: "How are diverted profits quantified?",
            answer: "From the ledger, bank records, and customer and pricing records: the economist identifies the revenue that moved to the competing entity or was taken through excess compensation and related-party payments, and summarizes the amounts by year and recipient with each figure tied to a document.",
          },
          {
            question: "Can the excluded owner claim lost profits and a valuation of the interest?",
            answer: "Both can be measured, but for different periods or different harms. The report explains which measure applies to which period so the claim does not count the same earnings twice.",
          },
        ],
      },
      "fraud-and-embezzlement": {
        summary: "Beyond the amounts taken, a fraud or embezzlement can starve a business of working capital, cause defaults, or interrupt operations, and those consequential losses can exceed the direct loss. The economist quantifies the lost profits from the business's financial records, links each element to the diversion with the causal chain explained, separates the effect of the fraud from market conditions and other causes, and presents the consequential loss alongside the amounts traced so the two are not confused. Interest, penalties, and the cost of replacement borrowing are included where the records support them.",
        faqs: [
          {
            question: "How is the consequential loss separated from the direct loss?",
            answer: "The direct loss is the amount diverted, established transaction by transaction. The consequential loss is what the business lost because those funds were unavailable, measured from the financial records with the causal link stated. The report presents the two separately so counsel can plead and prove each on its own record.",
          },
          {
            question: "What if the business would have struggled anyway?",
            answer: "The economist analyzes the business's results against its market and its own history to separate the effect of the fraud from other causes, and states what portion of the shortfall the records attribute to the diversion. Where the separation cannot be made cleanly, the report says so.",
          },
        ],
      },
    },
  },
  {
    slug: "fraud-and-asset-tracing",
    name: "Fraud Investigation and Asset Tracing",
    shortName: "Fraud & Tracing",
    titleName: "Fraud and Asset Tracing",
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
    metaDescription: "Fraud investigation and asset tracing for plaintiff and defense counsel nationwide: funds-flow reconstruction, tracing of diverted assets, and loss by scheme.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "How is an embezzlement loss quantified?",
        answer: "Transaction by transaction. The economist maps how the scheme worked from the records, identifies each transaction that fits it, confirms the amounts against bank statements, check images, and third-party documents rather than the internal books alone, and sums the loss by scheme, by year, and by account. Amounts established from records are separated from amounts estimated where records are missing.",
      },
      {
        question: "What does asset tracing add to the loss figure?",
        answer: "Where the money went. Diverted funds are followed through the accounts they passed through to the real estate, vehicles, investments, or other holdings they were used to acquire, with each step documented. Identifying those assets supports recovery from the assets themselves in addition to a damages claim against the person.",
      },
      {
        question: "What records does a fraud and tracing engagement need?",
        answer: "Bank statements with check images and deposit detail for every account involved, the general ledger and sub-ledgers, payroll records, vendor files and invoices, expense reports, corporate and personal tax returns, and the access and authorization records that show who controlled each account. Third-party records obtained by subpoena are often decisive.",
      },
      {
        question: "Does the report address intent?",
        answer: "No. The report establishes what happened to the money, how, in what amounts, and where it went. Whether the conduct was fraudulent is a question for the fact finder on the whole record, and the report is written so that it supports a civil claim, an insurance recovery, or a referral to authorities without reaching that question.",
      },
    ],
    related: [
      { title: "Forensic Economist vs. Forensic Accountant", href: "/compare/forensic-economist-vs-forensic-accountant", description: "Comparison" },
      { title: "Expert Witness Disclosure: A Practitioner Overview", href: "/guides/expert-witness-disclosure-rules", description: "Guide" },
      { title: "Expert Testimony Admissibility: Federal vs. State Court", href: "/guides/federal-vs-state-court-daubert", description: "Guide" },
    ],
    sources: refsToSources(["ACFE", "FRE_702", "FRCP_26"]),
    caseTypeNotes: {
      "fraud-and-embezzlement": {
        summary: "In a fraud or embezzlement matter the economist maps how the scheme worked from the records, identifies each transaction that fits it, and confirms the amounts against bank statements, check images, and third-party documents rather than the internal books alone. The diverted funds are traced forward through the accounts they passed through to the real estate, vehicles, investments, or other holdings they reached, and the loss is quantified by scheme, by year, and by account. The report separates amounts established from records, amounts estimated from patterns where records are missing, and amounts that could not be determined.",
        faqs: [
          {
            question: "What happens to the loss figure when the bank or ledger records have gaps?",
            answer: "The economist quantifies what the records support directly and, where a consistent pattern exists, estimates the missing periods with the method and its limitations stated. Documented amounts and estimated amounts are separated so counsel can decide how to present each.",
          },
          {
            question: "Can the analysis support a restitution figure and an insurance claim as well as a civil claim?",
            answer: "Yes. Each has different evidentiary needs, and the report is organized so the traced amounts, the supporting documents indexed to each transaction, and the loss by period can be presented in the form each forum requires.",
          },
        ],
      },
      "partnership-and-shareholder-dispute": {
        summary: "When a partner or shareholder suspects that distributions, related-party payments, or unrecorded revenue have moved value out of the business, the tracing analysis reconstructs the flow of funds through the ledger and bank records and quantifies the amounts by year and recipient. The economist identifies transactions that fall outside authorized activity, follows them to the entities and accounts they reached, and documents each step so the finding supports an accounting claim, a valuation adjustment, or a damages claim. The results feed the normalizing adjustments a valuation of the interest requires.",
        faqs: [
          {
            question: "How is money that left the business identified?",
            answer: "The financial records are reconstructed to trace distributions, related-party payments, and unusual transactions, and the amounts are summarized by year and recipient. Where records are incomplete, the report states what could and could not be determined.",
          },
          {
            question: "How does the tracing interact with a valuation of the interest?",
            answer: "Diverted amounts become normalizing adjustments to the earnings the business would show under arm's-length management, and the tracing schedules document them. The two analyses are coordinated so the diversion is counted once, as a damages item or as a valuation adjustment.",
          },
        ],
      },
      "divorce-and-marital-dissolution": {
        summary: "In a divorce the tracing work follows separate property contributions and marital funds through accounts and assets, and where one spouse controls a business, examines whether income has been diverted or understated. The economist follows each contribution from its source through every account and transaction to its current holding, documents each step, and identifies transfers to third parties, unusual withdrawals, and personal expenses run through a business. Where the records run out, the report states the point at which tracing stopped rather than assuming a result.",
        faqs: [
          {
            question: "How far back can a separate property contribution be followed?",
            answer: "As far as the account statements reach. The economist follows the separate contribution through each account and transaction and documents the path. Where the records end, the report identifies the point at which tracing could not continue rather than assuming a result.",
          },
          {
            question: "What signs of diverted income does the analysis look for?",
            answer: "Transfers to accounts or entities not disclosed, cash withdrawals without a matching use, personal expenses paid by a business, and revenue that appears in bank deposits but not in the books. Each finding is tied to the records that show it.",
          },
        ],
      },
      "commercial-contract-dispute": {
        summary: "A contract dispute can involve a forensic accounting question alongside the damages question: whether revenue was reported as the contract required, whether costs charged to a project were actually incurred, or whether payments went where the contract directed. The economist reconstructs the flow of funds from the ledger, bank records, and third-party documents, compares it with the contract's terms, and quantifies any shortfall or misapplication by period. The findings support the damages analysis and can stand on their own as an accounting of what was paid, received, and retained.",
        faqs: [
          {
            question: "What does a contract accounting reconstruction cover?",
            answer: "The revenue, costs, and payments the contract governs, rebuilt from the general ledger, invoices, bank records, and the counterparty's records where available, and compared with what the contract required. The report quantifies differences by period and ties each to a document.",
          },
          {
            question: "How does the reconstruction relate to a lost profits claim?",
            answer: "The reconstruction establishes what actually happened under the contract; the lost profits analysis projects what would have happened had it been performed. The two share the same records, and the report keeps the actual and the but-for figures separate so each can be examined.",
          },
        ],
      },
    },
  },
  {
    slug: "divorce-and-marital-financial-analysis",
    name: "Divorce and Marital Financial Analysis",
    shortName: "Divorce Financial Analysis",
    titleName: "Divorce Financial Analysis",
    titleShortName: "Divorce Analysis",
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
    metaDescription: "Divorce and marital financial analysis for either spouse or the court, nationwide: income for support, business valuation, lifestyle analysis, and tracing.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "How is income for support determined for a self-employed spouse?",
        answer: "From the business's books, bank records, and tax returns together rather than the return alone. The analysis identifies salary, distributions, personal expenses paid through the business, and cash flow retained in the business, and states the income available for support with each element shown so the other side can test it.",
      },
      {
        question: "What is a lifestyle analysis?",
        answer: "A reconstruction of the marital standard of living from actual spending: bank and credit card statements, mortgage and rent, tuition, travel, and the other categories of household expenditure over a period counsel identifies. The result documents what the household spent and on what, which bears on support and on whether the reported income is consistent with the spending.",
      },
      {
        question: "Can separate property be traced through commingled accounts?",
        answer: "Often, when the account statements are available. The separate contribution is followed from its source through each account and transaction to its current holding, and each step is documented. Where the records run out, the report states the point at which tracing stopped rather than assuming a result.",
      },
      {
        question: "Can the same economist value the business and determine income?",
        answer: "Yes, and it is usually efficient to do so because both analyses rest on the same normalized financial statements. The report presents the valuation and the income determination as separate sections so each can be examined and used on its own, and it can be prepared for one spouse, for both, or for the court.",
      },
      {
        question: "Who addresses what a spouse could earn in other work?",
        answer: "The economist measures the income the records show: pay, business cash flow, and perquisites paid through a business. What a spouse who is not working, or is working below prior earnings, could reasonably earn is a question of employability and attainable occupations, a vocational discipline. The affiliated vocational practice prepares that opinion under its own engagement, and the economist applies it to the support calculation together with published wage data, so the two reports reconcile.",
      },
    ],
    related: [
      { title: "Income Determination in Divorce", href: "/guides/income-determination-in-divorce", description: "Guide" },
      { title: "Business Valuation Approaches", href: "/methods/business-valuation-approaches", description: "Method" },
      { title: "Fair Market Value vs. Fair Value", href: "/compare/fair-market-value-vs-fair-value", description: "Comparison" },
    ],
    sources: refsToSources(["AICPA_SSVS1", "NACVA_STANDARDS", "BLS_CPS", "CENSUS_ACS"]),
    // The referral boundary the case-type entry draws (caseTypes.ts
    // divorce-and-marital-dissolution economicImpact), stated at the point of
    // referral (audit F08).
    handoff: {
      text: "Where the question is what a spouse who is not working, or is working below prior earnings, could reasonably earn, employability and attainable occupations are a vocational discipline: the affiliated vocational practice prepares that opinion, and the economist applies it to the support calculation together with published wage data.",
      linkLabel: "Vocational assessment at the affiliated practice",
      href: VOC_SERVICE_URL,
    },
    caseTypeNotes: {
      "divorce-and-marital-dissolution": {
        summary: "The divorce financial analysis addresses the matter's economic questions together: income available for support when a spouse is self-employed or compensated in ways that do not appear on a pay stub, the value of business interests in the marital estate, the marital standard of living documented from actual spending, and the tracing of separate versus marital funds. The economist builds each from the same set of tax returns, financial statements, and account records, presents each as its own section so it can be used independently, and writes the report so that either spouse or the court can examine the assumptions.",
        faqs: [
          {
            question: "Which questions should be engaged first?",
            answer: "The income determination and the business valuation rest on the same normalized financial statements, so they are usually engaged together; the lifestyle analysis and the tracing depend on the account records and can proceed as those arrive. The scope is set at retention and can be widened as the case develops.",
          },
          {
            question: "Does the analysis work for the support-paying and the support-receiving spouse alike?",
            answer: "Yes. The method is the same whichever spouse retains the economist, and the report states each element so the other side can test it. The same report can be prepared as a joint or court-appointed engagement.",
          },
        ],
      },
    },
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
    metaDescription: "Expert rebuttal and report review for plaintiff and defense counsel nationwide: the opposing economic report tested input by input and recalculated.",
    dateModified: "2026-09-02",
    faqs: [
      {
        question: "What does a rebuttal review test in an opposing report?",
        answer: "The inputs and the arithmetic: the earnings base, worklife and life expectancy, wage and medical cost growth, the discount rate, mitigation and offsets, the treatment of benefits and household services, and whether the data sources say what the report claims. Each finding is ranked by its effect on the conclusion so counsel can see which errors matter.",
      },
      {
        question: "Does the review produce a new damages number?",
        answer: "It can. Where counsel wants more than a critique, the opposing model is recalculated under corrected inputs to show what the conclusion becomes when each error is fixed, one at a time and together. The result supports cross-examination, a disclosed rebuttal report, or a motion directed at the reliability of the opinion.",
      },
      {
        question: "What is needed to review an opposing report?",
        answer: "The report with its schedules and exhibits, the expert's workpapers and data if produced, the expert's deposition if taken, and the underlying case records the report relies on. A review can begin from the report alone, but the workpapers usually reveal the assumptions the narrative does not state.",
      },
      {
        question: "Is the review consulting work or disclosed testimony?",
        answer: "Either, and counsel decides. The findings can remain consulting work product that shapes cross-examination, or they can be issued as a disclosed rebuttal report with testimony to support it. The scope and the form are set at retention and can be changed as the case develops.",
      },
    ],
    related: [
      { title: "How to Rebut an Economic Damages Report", href: "/guides/how-to-rebut-an-economic-damages-report", description: "Guide" },
      { title: "Expert Testimony Admissibility: Federal vs. State Court", href: "/guides/federal-vs-state-court-daubert", description: "Guide" },
      { title: "Plaintiff Economist vs. Defense Economist: Is the Method Different?", href: "/compare/plaintiff-economist-vs-defense-economist", description: "Comparison" },
      { title: "Net vs. Gross Discount Rate", href: "/compare/net-vs-gross-discount-rate", description: "Comparison" },
    ],
    sources: refsToSources(["NAFE_ETHICS", "DAUBERT", "KUMHO_TIRE", "FRE_702", "FRCP_26"]),
    caseTypeNotes: {
      "personal-injury": {
        summary: "In a personal injury matter the opposing economic report is tested on the inputs that move a lost earnings and damages figure: the earnings base and whether it matches the tax and wage records, the worklife expectancy and its source, the wage growth and discount rates and whether they were drawn on a consistent basis, the treatment of fringe benefits and household services, and whether the post-injury path reflects the work-capacity opinions in the record or an assumption. The economist ranks each finding by its effect on the total and, where counsel asks, recalculates the opposing model under corrected inputs to show what the number becomes.",
        faqs: [
          {
            question: "What are the most common errors in a personal injury damages report?",
            answer: "An earnings base that does not match the records, a worklife or retirement assumption without record support, growth and discount rates drawn on inconsistent bases, fringe benefits valued at a rate the plan documents do not support, and a post-injury path that ignores or overstates the work-capacity opinions. The review checks each and states its effect.",
          },
          {
            question: "Can the review produce an alternative damages figure for the defense or the plaintiff?",
            answer: "Yes. The opposing model is recalculated under corrected inputs, one at a time and together, so the fact finder can see what each correction does. The result can remain consulting work or be disclosed as a rebuttal report.",
          },
        ],
      },
      "wrongful-death": {
        summary: "A wrongful death report is tested on the assumptions that scale the whole figure: the personal consumption deduction and its source, the earnings base and worklife applied to the decedent, the household services hours and rates, the periods of dependency assigned to each survivor, and whether the components presented match the framework that governs the claim. The economist checks each input against the records and published data, identifies double counting between household services and support, and quantifies how the conclusion changes when the errors that matter are corrected.",
        faqs: [
          {
            question: "Why is the personal consumption deduction the first thing to check?",
            answer: "Because it scales the entire earnings figure. A deduction drawn from the wrong household size or income level, or omitted where the framework requires it, changes the total more than most other inputs. The review states the percentage the data support and shows the effect.",
          },
          {
            question: "Does the review address which components the framework allows?",
            answer: "It identifies which components the opposing report presents and to whom they are attributed, so counsel can address whether each is recoverable under the governing framework. The economist does not opine on the law; the report shows the figure with and without each component.",
          },
        ],
      },
      "medical-malpractice": {
        summary: "In a medical malpractice matter the opposing report is tested first on how it defined the but-for path: whether the earnings, care, and life expectancy assumptions reflect the outcome proper care would have produced or assume perfect health, and whether the apportionment between the injury and the underlying condition follows the medical opinions in the record. The economist then checks the earnings base, the life care plan pricing and growth rates, and the discounting, and quantifies the effect of each correction so counsel can see which assumptions carry the number.",
        faqs: [
          {
            question: "What is the most common flaw in a malpractice damages report?",
            answer: "Measuring the loss against perfect health rather than against the outcome the patient would have had with proper care, so that care and earnings losses the underlying condition would have caused anyway are attributed to the injury. The review identifies the items affected and states the incremental figure the medical opinions support.",
          },
          {
            question: "Does the review evaluate the medical opinions?",
            answer: "No. The economist takes the medical and causation opinions as given and tests whether the damages report applied them correctly. Where the report chose one opinion over another without saying so, the review shows the figure under each.",
          },
        ],
      },
      "motor-vehicle-accident": {
        summary: "Motor vehicle accident reports range from a short past-loss calculation to a lifetime projection, and the review scales with them. The economist checks the period out of work against the employer's records, the return-to-work date and post-injury earnings against the pay records and the work-capacity opinions, the fringe benefit rate against the plan documents, the household services hours against time-use data, and, where a life care plan is priced, the growth rates and life expectancy applied. Each finding is ranked by its effect so counsel can concentrate cross-examination where the number actually moves.",
        faqs: [
          {
            question: "What does the review look for in a return-to-work case?",
            answer: "Whether the report accounts for the actual post-injury earnings, whether the assumed duration of any ongoing gap is supported, and whether lost advancement or benefits are claimed on evidence or on assumption. The review shows the loss with the actual earnings credited.",
          },
          {
            question: "Can the review be done quickly for settlement evaluation?",
            answer: "Yes. A review of a single lost earnings report with a memo of findings is the narrowest rebuttal engagement, and it can be turned around inside a settlement timetable with the findings ranked by effect.",
          },
        ],
      },
      "traumatic-brain-injury": {
        summary: "Brain injury damages reports carry large figures that rest on two expert inputs, residual work capacity and the level of supervision, and the review tests whether the economic report applied those inputs faithfully or substituted its own. The economist checks the but-for earnings path for a young claimant against the educational and occupational evidence, the supervision hours and rates against the plan and the market, the life expectancy against the medical opinions, and the growth and discount rates for consistency, then shows the total under the alternative scenarios the record supports.",
        faqs: [
          {
            question: "How does the review treat the supervision hours in the opposing report?",
            answer: "It traces them to the life care plan and the record. Where the economic report assumed more or fewer hours than the plan specifies, or priced them at a level of service the plan does not call for, the review states the difference and its effect on the present value.",
          },
          {
            question: "What if the opposing report assumes no post-injury earnings?",
            answer: "The review checks that assumption against the work-capacity opinions and any actual post-injury earnings. Where the record supports some capacity, the review shows the loss with that capacity credited so the fact finder can see the effect of the assumption.",
          },
        ],
      },
      "spinal-cord-injury": {
        summary: "For a spinal cord injury the opposing report's total is usually driven by the present value of attendant care and equipment, so the review concentrates on the plan pricing: whether replacement cycles were scheduled as the plan specifies, whether each category carries an appropriate growth rate or a single blended rate, whether the life expectancy matches the medical opinions, and whether home-based and facility-based scenarios were valued consistently. The earnings component is checked for the post-injury path the work-capacity opinions support, and household services for overlap with attendant care hours already in the plan.",
        faqs: [
          {
            question: "What plan pricing errors does the review find most often?",
            answer: "Replacement cycles compressed or extended beyond the plan's intervals, a single growth rate applied to categories with different price histories, life expectancy taken from population tables when the medical opinions differ, and attendant care hours counted again as lost household services. Each is quantified.",
          },
          {
            question: "Does the review address the plan's clinical content?",
            answer: "No. The economist tests the economic translation of the plan, not the care it prescribes. Where the plan's items are contested, the review shows the present value with and without the contested items so the fact finder can attach the number to its finding.",
          },
        ],
      },
      "workers-compensation": {
        summary: "In a workers' compensation setting the opposing analysis may value future indemnity for a settlement, measure loss of earning capacity for the benefit determination, or present the full loss in a third-party action, and the review checks that the report answered the question the setting actually asks. The economist tests the pre-injury wage base against the employer's records, the post-injury earnings path against the work-capacity opinions, the mortality and discount assumptions behind any indemnity present value, and whether benefits already paid are identified so lien and offset questions can be addressed from the same numbers.",
        faqs: [
          {
            question: "What does the review check in a settlement present value?",
            answer: "The payment stream and its schedule, the mortality or life expectancy assumption, the discount rate and its source, and whether future medical was valued on a documented treatment projection. The review shows the value under the alternatives so both sides negotiate from a documented range.",
          },
          {
            question: "How does the review handle the difference between the compensation measure and the civil measure?",
            answer: "It identifies which measure the opposing report applied and whether the components presented belong to that measure, and it separates the amounts the compensation system pays from those a civil claim adds so the two are not mixed.",
          },
        ],
      },
      "employment-discrimination": {
        summary: "An employment discrimination damages report is tested on the but-for compensation path and on mitigation: whether raises, bonuses, and benefit accruals were projected from the employer's actual practices or assumed, whether interim earnings were netted from the records, whether the front pay period is supported by the employee's occupation and local market, and whether comparators in a pay-disparity claim were applied as counsel identified them. The economist quantifies the effect of each correction and shows the loss under alternative front pay durations and mitigation assumptions.",
        faqs: [
          {
            question: "What is the most common flaw in a front pay calculation?",
            answer: "A duration asserted without support from the employee's occupation, age, and local market, or a replacement wage that ignores the actual job search record. The review states the range the record supports and shows the loss at each duration.",
          },
          {
            question: "Can the review test a class-wide or comparator analysis?",
            answer: "Yes. The economist checks the comparator set, the pay elements compared, and the period, and shows how the shortfall changes under each set counsel identifies. In a class matter the review tests whether the method was applied consistently across the claimants.",
          },
        ],
      },
      "wrongful-termination": {
        summary: "A wrongful termination report is tested on the front pay period, the treatment of replacement earnings, and the valuation of benefits, pensions, and equity. The economist checks the but-for compensation path against the employment agreement and pay history, the replacement earnings against the employee's records and tax returns, the front pay duration against the employee's age, occupation, and local market, and the pension and equity losses against the plan terms and vesting schedules. Each finding is ranked by its effect on the total, and the loss is shown under the alternative durations the record supports.",
        faqs: [
          {
            question: "How does the review test a pension loss claim?",
            answer: "By applying the plan's benefit formula to the service and pay the employee would have accrued and comparing the result with the benefit actually vested, using the plan documents and benefit statements. Where the opposing report used a different formula or period, the review states the difference and its effect.",
          },
          {
            question: "What if the employee found comparable work quickly?",
            answer: "The review shows the loss with the replacement earnings credited from the date they began, which often reduces the claim to a documented back pay figure with small benefit differences, and states whether any ongoing gap the opposing report claims is supported.",
          },
        ],
      },
      "commercial-contract-dispute": {
        summary: "A lost profits report is tested on causation, incremental cost treatment, the period of loss, and the discount rate. The economist checks whether the but-for revenue rests on pre-dispute projections and the company's history or on assumptions made for the claim, whether the costs deducted are the incremental costs of earning that revenue or a fraction of fixed costs, whether the loss period is bounded by the contract and the market, whether mitigation was credited, and whether the discount rate reflects the risk of the earnings stream. Each correction is quantified so counsel can see which assumptions carry the number.",
        faqs: [
          {
            question: "What does the review look for in the cost treatment?",
            answer: "Whether each cost was classified from the general ledger and the company's actual cost behavior or assumed, and whether fixed costs were deducted or left out to inflate the margin. The review reclassifies contested costs and shows the effect on the lost margin.",
          },
          {
            question: "How is an unsupported loss period identified?",
            answer: "By comparing the period claimed with the contract's remaining term, the time the business would reasonably need to replace the volume, and the market conditions during the period. The review shows the loss under the period the record supports.",
          },
        ],
      },
      "partnership-and-shareholder-dispute": {
        summary: "A valuation report in an owner dispute is tested on the valuation date, the standard of value, the normalizing adjustments, the approaches applied and how they were reconciled, and any discounts or premiums. The economist checks whether the standard matches the claim and the agreement, whether owner compensation and related-party dealings were normalized on market evidence, whether the discount rate and market multiples are supported by their sources, and whether a minority or marketability discount is appropriate under the standard applied. The review quantifies the effect of each correction and shows the value under the alternative standard where the choice is disputed.",
        faqs: [
          {
            question: "What valuation errors move the number most in an owner dispute?",
            answer: "Applying discounts that a fair value standard excludes, normalizing owner compensation without market evidence, using a discount rate or multiples the sources do not support, and choosing a valuation date the agreement does not. The review quantifies each.",
          },
          {
            question: "Can the review also test a diverted profits claim?",
            answer: "Yes. The economist checks whether the diverted amounts were established from the ledger and bank records or estimated, whether the amounts also appear as valuation adjustments so the loss is counted twice, and whether the causal link to the conduct at issue is documented.",
          },
        ],
      },
      "divorce-and-marital-dissolution": {
        summary: "In a divorce the opposing financial analysis is tested on the business valuation, the income determination, and any tracing. The economist checks the valuation date and standard against the framework, the normalizing adjustments for owner compensation and personal expenses against the records, the treatment of personal and enterprise goodwill, whether the income available for support includes the cash flow the business records show beyond reported salary, and whether the tracing follows the funds through each account or assumes a result where the records end. Each finding is ranked by its effect so counsel can concentrate on the assumptions that carry the number.",
        faqs: [
          {
            question: "How does the review test an income determination?",
            answer: "By rebuilding it from the business's books and bank records: compensation, distributions, personal expenses paid by the business, and retained cash flow. Where the opposing analysis relied on the tax return alone or added items the records do not support, the review states the difference.",
          },
          {
            question: "Can the same review address the valuation and the income figure together?",
            answer: "Yes, and it should, because both rest on the same normalized financial statements. The review checks that the opposing analysis treated owner compensation consistently in the two, since a compensation figure that lowers the valuation and also lowers the income for support cannot both be right.",
          },
        ],
      },
      "fraud-and-embezzlement": {
        summary: "An opposing loss quantification in a fraud matter is tested on whether each amount was confirmed against bank statements and third-party documents or taken from the internal books, whether estimated periods are separated from documented ones, whether the tracing follows the funds step by step or assumes a destination, and whether consequential losses are linked to the diversion or include losses that other causes produced. The economist checks the transaction schedules against the records, recalculates the loss by scheme and period under corrected inputs, and states what the records support and what they do not.",
        faqs: [
          {
            question: "What does the review look for in the transaction schedules?",
            answer: "Whether each transaction ties to a bank record or third-party document, whether the scheme definition captures only unauthorized activity, whether the same transaction appears in more than one schedule, and whether the estimated portions are identified as estimates with the method stated.",
          },
          {
            question: "Does the review address intent?",
            answer: "No. The economist tests what the records show about the money and the amounts. Whether the conduct was fraudulent is a question for the fact finder, and the review is written so it supports that inquiry without reaching it.",
          },
        ],
      },
      "product-liability": {
        summary: "Product liability damages reports often concern claimants without a conventional earnings history, and the review tests how the opposing report built the earnings base for a child, student, homemaker, or retiree, whether the household services and care components rest on the record or on assumptions, and, in a mass tort, whether one method was applied consistently across claimants or adjusted case by case. The economist checks the educational and occupational assumptions, the time-use and replacement wage sources, the life care plan pricing and growth rates, and the discounting, and quantifies the effect of each correction.",
        faqs: [
          {
            question: "How does the review test an earnings projection for a child?",
            answer: "By checking the educational attainment assumed against the record, the occupational earnings data against its source, the age at which earnings were assumed to begin, and the worklife applied, and by showing the result under the alternative attainment levels the record supports.",
          },
          {
            question: "Can the review test a common damages model applied across many claimants?",
            answer: "Yes. The economist checks whether the method is documented, whether it was applied to each claimant's own records, and whether individual results deviate from the method without explanation, and states the effect of correcting the deviations.",
          },
        ],
      },
    },
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
    externalUrl: VOC_SERVICE_URL,
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
    externalUrl: LCP_SERVICE_URL,
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

/** Type guard: `pillar: true` entries carry the full PillarContent (pinned by services.test.ts). */
export function isPillarService(s: ServiceEntry): s is PillarService {
  return s.pillar;
}

/** The indexable service lines. Every enumerator (pages, components, scripts) uses this. */
export function pillarServices(): PillarService[] {
  return services.filter(isPillarService);
}

/** Direct lookup by slug; resolves non-pillar cross-sells too (ServicePillar renders them as a card). */
export function getServiceBySlug(slug: string): ServiceEntry | undefined {
  return services.find((s) => s.slug === slug);
}

/**
 * The pillars that declare a case type (`service.caseTypes`), in canonical
 * order. This is the declared side of the service x case-type relationship:
 * the pair pages, the pillar's "by Case Type" links, and the pair-page
 * sibling links all enumerate from it, so no page ever links a pair the
 * pillar does not offer.
 */
export function servicesForCaseType(caseTypeSlug: string): PillarService[] {
  return pillarServices().filter((s) => s.caseTypes.includes(caseTypeSlug));
}

/** One declared service x case-type pair: the pillar, the case-type slug it declares, and the pair page's path. */
export interface ServiceCaseTypePair {
  service: PillarService;
  caseTypeSlug: string;
  path: string;
}

/**
 * Every declared service x case-type pair, in canonical order (pillar order,
 * then each pillar's own `caseTypes` order). This is the route set for
 * /services/<service>/case/<case-type>: scripts/prerender.mjs writes a shell
 * and scripts/generate-sitemap.mjs advertises a URL for exactly these pairs,
 * and ServiceCaseType.tsx resolves only these. A pair a pillar does not
 * declare is not a page; its address redirects to the pillar (server.js).
 */
export function serviceCaseTypePairs(): ServiceCaseTypePair[] {
  return pillarServices().flatMap((service) =>
    service.caseTypes.map((caseTypeSlug) => ({
      service,
      caseTypeSlug,
      path: `/services/${service.slug}/case/${caseTypeSlug}`,
    })),
  );
}

/** Pillar slugs only - the set of /services/:slug routes that are prerendered and in the sitemap. */
export function getAllServiceSlugs(): string[] {
  return pillarServices().map((s) => s.slug);
}
