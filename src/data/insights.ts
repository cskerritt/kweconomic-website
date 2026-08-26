import type { Source } from "./types";
import { refsToSources } from "./references";

export interface InsightPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content: string;
  /** Registry-backed references, rendered by SourcesBlock at the foot of the post. */
  sources?: Source[];
  publishedDate: string;
  /** Defaults to publishedDate for E-E-A-T signaling; override when content is materially updated. */
  dateModified?: string;
  /** Team member slug for the AuthorByline. Falls back to "KWVRS Editorial Team" when unset. */
  authorSlug?: string;
}

export const insightPosts: InsightPost[] = [
  {
    slug: "what-is-earning-capacity-evaluation",
    sources: refsToSources(["DOT", "ONET", "BLS_OEWS", "RESTATEMENT_TORTS_924"]),
    authorSlug: "daniel-wolstein",
    dateModified: "2026-05-03",
    title: "What Is an Earning Capacity Evaluation?",
    excerpt:
      "Earning capacity evaluations are central to damages calculations in personal injury, workers' compensation, and matrimonial cases. This post explains what the evaluation involves, how opinions are formed, and why earning capacity differs from actual earnings.",
    category: "Vocational",
    publishedDate: "2025-03-10",
    content: `An earning capacity evaluation is a [[/services/vocational-expert|structured vocational assessment]] designed to determine what a person is capable of earning in the competitive labor market, given their education, work history, functional limitations, and the available jobs in the relevant economy. It is a distinct concept from actual earnings - what a person happens to be earning at any given time - and from disability status as determined by a government agency or insurance carrier.

The distinction between earning capacity and actual earnings is a central issue in litigation. A person who was unemployed at the time of their injury still had an earning capacity grounded in their skills, credentials, and the labor market. A person who took a lower-paying job after an injury may have diminished earning capacity for reasons unrelated to their vocational choices. Courts have consistently held that plaintiffs are entitled to recover for losses to their capacity to earn, not merely for the specific wages reflected on their most recent pay stub. Restatement (Second) of Torts sec. 924 (Am. L. Inst. 1979).

Conducting an earning capacity evaluation involves multiple steps. The evaluator reviews all available medical records and any [[/methods/functional-capacity-evaluation|functional capacity evaluation (FCE)]] results that document physical or cognitive restrictions. A clinical interview explores the individual's work history, job duties, educational background, and current functional status. Vocational testing may be used to assess cognitive aptitude and academic skill levels. The evaluator then analyzes the [[/methods/dictionary-of-occupational-titles|Dictionary of Occupational Titles]] (U.S. Department of Labor, Employment and Training Administration, 1991), [[/methods/onet-analysis|O*NET occupational database]] (National Center for O*NET Development, n.d.), and Bureau of Labor Statistics wage data (U.S. Bureau of Labor Statistics, n.d.) to identify occupations the individual can perform within their limitations, and establishes the wage range for those occupations.

[[/services/matrimonial|In matrimonial proceedings]], earning capacity analysis takes on a specific character. When a party is voluntarily unemployed or underemployed, the court may impute income based on what that person could earn if making full use of their education and vocational assets. The vocational evaluator is called upon to assess what the party could realistically earn in the current labor market. This requires the evaluator to identify not just theoretical occupational options, but to address whether actual job openings exist, whether the party's skills require retraining, and what a realistic timeline to employment might look like.

Earning capacity opinions are subject to challenge on multiple grounds. Defense experts in plaintiff cases may argue that the plaintiff's restrictions are overstated or that their identified occupations pay more than the plaintiff's analysis acknowledges. Plaintiff experts in defense-initiated evaluations may identify that the available occupational options are more limited or lower-paying than the defense analysis suggests. The quality of the final opinion depends heavily on the rigor of the underlying records review, the extent of testing performed, and the expert's familiarity with the relevant labor market data.`,
  },
  {
    slug: "daubert-vs-frye-expert-testimony-standards",
    sources: refsToSources(["DAUBERT", "FRYE", "FRE_702", "KUMHO_TIRE", "GE_JOINER"]),
    authorSlug: "daniel-wolstein",
    dateModified: "2026-05-03",
    title: "Expert Testimony Admissibility: Reliability and General-Acceptance Frameworks",
    excerpt:
      "Two broad framework families govern the admissibility of expert testimony in U.S. courts: a reliability-based gatekeeping framework used in federal courts and a majority of state courts, and a narrower general-acceptance framework retained in a smaller number of states. Understanding which framework applies in your jurisdiction is essential to retaining experts and challenging opposing opinions.",
    category: "Legal",
    publishedDate: "2025-02-18",
    content: `The admissibility of expert testimony in U.S. courts is governed by one of two broad framework families, depending on the jurisdiction. Federal courts and a substantial majority of state courts apply a [[/guides/daubert-standard-vocational-experts|reliability-based gatekeeping framework]]. A smaller number of states continue to apply an older general-acceptance framework. Knowing which framework applies - and what it requires - is essential to the preparation, retention, and challenge of expert witnesses. Attorneys are responsible for confirming the governing framework against primary sources.

Under the reliability framework, the trial judge serves as a gatekeeper with an affirmative obligation to ensure that expert testimony meets threshold requirements of reliability and relevance before it is presented to the jury. Non-exclusive reliability factors include whether the expert's theory or technique has been tested; whether it has been subjected to peer review and publication; the known or potential rate of error; the existence and maintenance of controlling standards; and whether the methodology is generally accepted in the relevant scientific or professional community. Fed. R. Evid. 702; Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993). Note that general acceptance is one factor among several - it is not the sole criterion.

The general-acceptance framework, by contrast, asks only whether the expert's methodology is generally accepted by the relevant scientific community. Frye v. United States, 293 F. 1013 (D.C. Cir. 1923). Courts applying this framework do not separately evaluate testability, peer review status, or error rates; acceptance by practitioners in the field is the dispositive question. The general-acceptance framework is sometimes described as more conservative toward novel methodologies but more permissive toward well-established (if not always rigorously validated) techniques that have achieved broad professional acceptance.

For vocational rehabilitation and forensic economics experts, methodology challenges most commonly target methodological specifics. Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999). Defense challenges to [[/services/vocational-expert|vocational opinions]] often attack the classification systems used (DOT vs. O*NET), the validity of any psychological testing instruments administered, and whether the expert's labor market analysis reflects current economic conditions in the relevant geography. Plaintiff challenges to defense vocational opinions may focus on whether the expert's conclusion that the claimant can perform certain occupations is grounded in an actual analysis of the physical and cognitive demands of those jobs.

[[/services/forensic-economics|Forensic economics experts]] face methodology challenges most commonly over discount rate selection, [[/methods/worklife-expectancy|worklife expectancy methodology]], and the treatment of fringe benefits. Courts have generally upheld a range of methodological choices as long as the expert can identify the peer-reviewed basis for the approach and explain why it is appropriate for the specific case. General Electric Co. v. Joiner, 522 U.S. 136 (1997). A conclusory assertion that a particular discount rate is appropriate, without engagement with the academic literature, is more vulnerable to exclusion.

Practitioners should be aware that several states have adopted modified or hybrid versions of these frameworks, and a handful have codified their admissibility rules in evidence statutes. Counsel preparing for expert witness litigation in an unfamiliar jurisdiction should research the applicable framework against primary sources and the relevant case law interpreting that framework in the specific expert discipline involved.`,
  },
  {
    slug: "life-care-plan-components-and-methodology",
    sources: refsToSources(["FAIR_HEALTH", "CMS_PFS", "NCHS_LIFE_TABLES", "WEED_BERENS"]),
    authorSlug: "paul-bourgeois",
    dateModified: "2026-05-03",
    title: "Life Care Plan Components and Methodology",
    excerpt:
      "A properly prepared life care plan is the foundation of future damages in catastrophic injury cases. This post explains what goes into a life care plan, how costs are researched, and how to evaluate the quality of a plan in litigation.",
    category: "Life Care Planning",
    publishedDate: "2025-01-22",
    content: `A [[/services/life-care-planning|life care plan]] is a detailed, itemized projection of the future medical, rehabilitative, and support needs of an individual who has sustained a catastrophic or significantly disabling injury or illness. In litigation, it serves as the evidentiary foundation for a [[/methods/present-value-analysis|forensic economist's present-value damages calculation]] and as a primary exhibit for communicating the scope and cost of the plaintiff's future care needs to a jury. The quality of the life care plan - the rigor with which it is researched and the defensibility of each recommendation - is one of the most important factors determining the strength of a future damages claim.

Life care plans are organized into discrete cost categories. Typical categories include: recurring medical evaluations and specialist visits; diagnostic imaging and procedures; medications; surgical interventions and projected revisions (such as hardware replacement in orthopedic cases or pump revisions in pain management); physical, occupational, and speech therapy; psychological and psychiatric services; case management; attendant care and home health services; home modifications; [[/methods/life-care-plan-development|durable medical equipment and supplies]]; wheelchairs and mobility aids; orthotics and prosthetics; vehicle modifications; and, in severe cases, residential care or supported living expenses.

Each line item in a well-prepared plan is supported by an identified medical or clinical foundation. The [[/guides/what-is-life-care-plan|certified life care planner]] is not independently recommending medical care; they are systematically organizing and costing out the recommendations made by treating and evaluating physicians, surgeons, and therapists (Weed & Berens, 2018). A plan that includes services without a documented medical recommendation from a qualified provider is vulnerable to challenge on foundation grounds.

Cost research is a critical component of plan quality. Costs should reflect what services actually cost in the relevant geographic market, not national averages or catalog list prices that no one actually pays. Life care planners commonly use medical cost databases (such as those from FAIR Health or comparable regional sources), direct calls to suppliers and providers, and Medicare or Medicaid fee schedules (adjusted for private-pay rates) to establish defensible unit costs (FAIR Health, n.d.; Centers for Medicare & Medicaid Services, n.d.). The plan should identify the source of each cost estimate so that opposing experts and counsel can verify or challenge the figures.

In evaluating an opposing party's life care plan, counsel and defense experts should systematically examine each significant cost item. Key questions include: Is there a specific physician recommendation for this item? If yes, what is the source document? Was this recommendation made in the context of litigation or in the course of actual treatment? Are the costs based on current market rates in the relevant geography or outdated or inappropriate comparators? Are the frequency and duration assumptions consistent with the medical literature on the condition? Is [[/tools/life-expectancy|the life expectancy assumption]] supported by a physician opinion, or did the life care planner deviate from standard tables (Arias et al., 2025) without adequate foundation?`,
  },
  {
    slug: "role-of-vocational-expert-personal-injury",
    sources: refsToSources(["DOT", "ONET", "BLS_OEWS"]),
    authorSlug: "daniel-wolstein",
    dateModified: "2026-05-03",
    title: "The Role of the Vocational Expert in Personal Injury Cases",
    excerpt:
      "Vocational experts play a central but often misunderstood role in personal injury litigation. This post explains what a vocational expert does, when their involvement is necessary, and how their testimony interacts with medical and economic evidence.",
    category: "Vocational",
    publishedDate: "2024-12-15",
    content: `In a personal injury case where the plaintiff's ability to work has been compromised, the [[/services/vocational-expert|vocational expert]] is the professional who bridges the gap between the treating physician's medical opinion and the [[/services/forensic-economics|forensic economist's damages calculation]]. The physician can describe the physical limitations the plaintiff carries. The forensic economist can calculate the present value of future earnings losses. But neither is positioned to translate those physical limitations into specific occupational restrictions, assess the plaintiff's transferable skills, or identify what jobs the plaintiff can or cannot perform in the national economy (U.S. Department of Labor, Employment and Training Administration, 1991; National Center for O*NET Development, n.d.). That is the vocational expert's domain.

The vocational expert's analysis typically proceeds in two phases. First, the evaluator establishes the plaintiff's vocational profile: their educational attainment, work history, acquired skills, and functional limitations. Work history is analyzed not just in terms of job titles, but in terms of the specific physical and cognitive demands the plaintiff performed, because it is the underlying skill set - not the job title - that determines [[/methods/transferable-skills-analysis|transferability to other occupations]]. Second, the evaluator analyzes [[/methods/labor-market-survey|the relevant labor market]] to identify occupations the plaintiff can perform within their medically established restrictions and determines the wage range for those occupations (U.S. Bureau of Labor Statistics, n.d.).

The interaction between the vocational expert and the treating or evaluating physician is critical. Vocational experts are not qualified to independently determine what physical or cognitive restrictions a plaintiff has - that determination is the physician's province. The vocational expert must rely on the physician's functional assessment and should clearly identify the medical sources that underlie their opinions. When the medical record is internally inconsistent - for example, when the treating physician has described limitations in general terms but a formal FCE documents more specific restrictions - the vocational expert must explain how they resolved any ambiguity.

In some personal injury cases, the plaintiff's damages theory involves both a claim that they cannot return to their specific pre-injury occupation and a claim that their [[/guides/earning-capacity-vs-lost-earnings|earning capacity more broadly has been diminished]]. These are related but distinct analyses. A construction worker who can no longer perform heavy labor may be able to perform light or sedentary work, but at wages significantly below their pre-injury earnings. The vocational expert quantifies both the occupational displacement and the wage differential, providing the forensic economist with the inputs needed to calculate lost earning capacity.

Defense vocational experts are retained for the same reasons as plaintiff experts: to apply the same methodology and evaluate whether the damages claimed are consistent with the evidence. Defense vocational opinions commonly take the position that (1) the plaintiff's restrictions are less limiting than described, or (2) there are more occupational alternatives available within the plaintiff's restrictions than the plaintiff's expert identified, or (3) the wage differential between pre-injury and post-injury occupations is smaller than claimed. Effective cross-examination of any opposing vocational expert, whether plaintiff- or defense-retained, requires a thorough understanding of the occupational databases, wage data sources, and classification systems the expert used and any methodological choices they made that are inconsistent with industry standards.`,
  },
  {
    slug: "understanding-loss-of-household-services",
    sources: refsToSources(["BLS_ATUS", "BLS_OEWS", "EXPECTANCY_DATA_DVOD"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-05-03",
    title: "Understanding Loss of Household Services as an Economic Damage",
    excerpt:
      "Loss of household services is a compensable economic damage whose valuation requires individualized, market-based analysis. This post explains the methodology for valuing unpaid household labor and how it fits into a comprehensive damages analysis.",
    category: "Economics",
    publishedDate: "2024-11-08",
    content: `[[/services/loss-of-household-services|Household services]] - the unpaid domestic labor individuals perform to maintain their homes and care for family members - have real economic value even though no wage is paid for them. When an injury reduces or eliminates a person's ability to perform household tasks, the cost of replacing that labor through paid services is a compensable economic loss. Similarly, [[/services/forensic-economics|in wrongful death cases]], the services the decedent would have provided to surviving family members over their projected lifetime represent a concrete economic contribution that survivors have lost.

Household services typically include meal preparation and cleanup, house cleaning and maintenance, laundry and clothing care, grocery shopping, childcare and supervision, lawn care and yard maintenance, vehicle maintenance, and routine household management tasks. Not every plaintiff performs every category of service; the analysis must be individualized based on what the specific individual was actually doing before the injury or death. Generic tables that assume equal household labor contributions across all cases are less defensible than analyses grounded in the facts of the specific claimant's household.

Forensic economists typically value household services using replacement cost methodology: what would it cost to hire qualified workers to perform the tasks the plaintiff can no longer perform? This requires data on two things: (1) the time the individual spent on each category of household service before the injury, and (2) the wage rate for workers who perform those services in the relevant labor market. The primary empirical source for time-use data is the Bureau of Labor Statistics' American Time Use Survey (ATUS), which publishes detailed data on the time American households spend on various activities, broken down by demographic variables including gender, age, employment status, and presence and age of children (U.S. Bureau of Labor Statistics, n.d.).

Wage rates for replacement services are drawn from BLS Occupational Employment and Wage Statistics data (U.S. Bureau of Labor Statistics, n.d.; Expectancy Data, 2023). Different household services correspond to different occupational categories: childcare corresponds to childcare workers, cooking corresponds to food preparation workers, cleaning corresponds to maids and housekeeping cleaners, and so forth. Using the appropriate occupational wage rate for each category of service - rather than a single generic "homemaker" rate - produces a more accurate and more defensible valuation.

One methodological question that arises frequently is whether the value of household services should be reduced to reflect only the portion of services the plaintiff can no longer perform, rather than all services performed before the injury. This is correct as a matter of methodology: the economic loss is the reduction in services, not the total pre-injury service level. If a plaintiff can still perform some household tasks but cannot perform others due to their restrictions, the analysis should be specific about which tasks are within the plaintiff's capacity and which are not. This granularity makes the opinion more reliable and less vulnerable to the objection that the plaintiff is being compensated for services they can still perform.`,
  },
  {
    slug: "how-forensic-economists-calculate-damages",
    sources: refsToSources(["SKOOG_CIECKA_KRUEGER_2011", "BLS_EMP_PROJECTIONS", "BLS_ECEC", "TREASURY_YIELD"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-05-03",
    title: "How Forensic Economists Calculate Economic Damages",
    excerpt:
      "Forensic economists apply structured methodology to translate injury or death into specific dollar amounts. This post explains the analytical framework, the data sources used, and the key variables that most affect the final damages figure.",
    category: "Economics",
    publishedDate: "2024-10-03",
    content: `[[/services/forensic-economics|Forensic economists]] are retained to quantify the economic consequences of injury, death, wrongful termination, or other legally actionable events. Their work is structured around a relatively standard analytical framework, though the application of that framework requires numerous methodological choices that can significantly affect the final damages figure. Understanding how that framework operates - and where the most significant levers are - helps counsel evaluate damages reports and prepare for deposition and trial.

The core structure of a lost earnings calculation is a comparison between two scenarios: the "but for" scenario (what the plaintiff would have earned absent the harmful event) and the "with injury" or "as is" scenario (what the plaintiff will earn given their current condition). The difference between these two projected streams of income, discounted to present value, is the economic loss. In wrongful death cases, the analysis projects the decedent's earnings and [[/services/loss-of-household-services|household services contributions]] over a projected working life, applies a personal consumption deduction, and discounts the net contribution to present value.

The "but for" earnings projection requires assumptions about several variables. What was the plaintiff's earnings trajectory before the injury? Were they on track for wage growth above or below their occupational average? What is the Bureau of Labor Statistics' projected wage growth for their occupation and industry (U.S. Bureau of Labor Statistics, n.d.)? How long would the plaintiff have continued working? [[/methods/worklife-expectancy|Worklife expectancy data]] - published by academic researchers using Census Bureau and BLS data - provides the statistical foundation for this last question. The most widely cited worklife expectancy tables are the Skoog, Ciecka, and Krueger worklife expectancy tables (Skoog et al., 2011), though other researchers have published competing estimates that are also used in practice.

Fringe benefits are a component of compensation that forensic economists add to base wages because they represent real economic value the employer provides in addition to salary. Employer-paid health insurance, retirement contributions (401(k) matches, pension contributions), and the employer's share of payroll taxes (Social Security and Medicare) are the primary components. The Bureau of Labor Statistics' Employer Costs for Employee Compensation survey provides data on fringe benefits as a percentage of wages across industries and occupations (U.S. Bureau of Labor Statistics, n.d.).

[[/methods/present-value-analysis|Present value discounting]] is the final step in the calculation. Because the damages award is paid today as a lump sum, but the losses extend over future years, the future losses must be discounted to reflect the time value of money - the principle that a dollar today is worth more than a dollar in the future because today's dollar can be invested. The discount rate is the assumed rate at which the lump sum could be invested. The selection of an appropriate discount rate is one of the most actively debated methodological questions in forensic economics. Common approaches include the use of U.S. Treasury yields (representing a risk-free rate; U.S. Department of the Treasury, n.d.), corporate bond yields, or the "offset" method in which wage growth and discount rates are assumed to be equal, eliminating the need for explicit discounting.`,
  },
];

export function getPostBySlug(slug: string): InsightPost | undefined {
  return insightPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, category: string): InsightPost[] {
  return insightPosts.filter((p) => p.slug !== slug && p.category === category);
}

export const insightCategories = ["All", "Vocational", "Legal", "Life Care Planning", "Economics"];
