import type { Source } from "./types";
import { refsToSources } from "./references";

export interface KnowledgeSection {
  heading: string;
  content: string;
}

export interface KnowledgeGuide {
  slug: string;
  title: string;
  description: string;
  sections: KnowledgeSection[];
  /** Registry-backed references, rendered by SourcesBlock at the foot of the guide. */
  sources?: Source[];
  /** ISO date the guide was last reviewed/updated. Defaults to current date when unset. */
  dateModified?: string;
  /** Team member slug for the AuthorByline. Falls back to "KWVRS Editorial Team" when unset. */
  authorSlug?: string;
}

export const knowledgeGuides: KnowledgeGuide[] = [
  {
    slug: "understanding-vocational-rehabilitation",
    sources: refsToSources(["BLS_OEWS", "ONET", "REHAB_ACT_1973", "CRCC", "ABVE"]),
    authorSlug: "daniel-wolstein",
    dateModified: "2026-05-03",
    title: "Understanding Vocational Rehabilitation",
    description:
      "A comprehensive overview of vocational rehabilitation - what it is, who needs it, how evaluations are conducted, and what credentials practitioners hold.",
    sections: [
      {
        heading: "What Is Vocational Rehabilitation?",
        content: `Vocational rehabilitation is a process by which individuals who have sustained injuries, illnesses, or disabilities are evaluated for their capacity to engage in competitive employment. The goal is to assess what an individual can do - not merely what they cannot - in light of their physical, cognitive, and psychological limitations relative to the demands of work in the national or regional economy.

In a legal context, vocational rehabilitation analysis serves a different purpose than clinical rehabilitation. Rather than treating a patient, the vocational expert is tasked with forming an objective opinion about a person's residual functional capacity, [[/methods/transferable-skills-analysis|transferable skills]], and earning potential. These opinions are presented in written reports and, frequently, through deposition or trial testimony.

Vocational rehabilitation evaluation draws on multiple disciplines, including occupational medicine, labor economics, counseling psychology, and industrial classification systems (National Center for O*NET Development, n.d.). The evaluator must synthesize medical records, functional capacity assessments, employment history, educational background, and labor market data into a coherent analysis of the individual's vocational standing.`,
      },
      {
        heading: "Who Requires a Vocational Rehabilitation Evaluation?",
        content: `Vocational rehabilitation evaluations are most commonly requested in personal injury litigation, workers' compensation claims, long-term disability disputes, wrongful termination matters, and matrimonial proceedings. In each context, the central question varies slightly but ultimately concerns a person's capacity to earn income.

In personal injury and workers' compensation cases, the evaluation focuses on whether the claimant can return to their pre-injury occupation and, if not, what alternative occupations they can perform given their restrictions. In wrongful termination and employment discrimination cases, the evaluator may be asked to assess what a terminated employee could have earned had the injury to their career not occurred, and what they are likely to earn going forward.

[[/services/life-care-planning|In matrimonial proceedings]] - particularly equitable distribution or spousal support disputes - a vocational evaluator may be asked to assess a non-working or underemployed spouse's [[/guides/earning-capacity-vs-lost-earnings|earning capacity]]: that is, what the person could earn if making full use of their vocational assets. This is a distinct inquiry from actual current earnings and requires careful attention to the spouse's education, work history, and current labor market conditions.`,
      },
      {
        heading: "How a Vocational Evaluation Is Conducted",
        content: `A thorough vocational evaluation typically involves several components. The evaluator begins by reviewing all available records: medical records, treatment summaries, functional capacity evaluation results, psychological assessments, employment records, tax returns, and any prior vocational or rehabilitation reports. This [[/guides/what-records-does-vocational-expert-need|records review]] provides the foundation for understanding the individual's functional limitations and vocational history.

A clinical interview - conducted in person, by video, or telephonically - allows the evaluator to gather information directly from the evaluee. Topics covered include the individual's educational background, work history and job duties performed, current daily activities, symptom reporting, and vocational goals. The interview is documented and becomes part of the foundation for any subsequent opinion.

Vocational testing may be administered to assess cognitive functioning, academic achievement levels, aptitude, and interest patterns. The results of formal testing help inform the evaluator's conclusions about what kinds of work the evaluee can realistically pursue. A labor market analysis is then performed to identify jobs that exist in significant numbers in the national or regional economy that the evaluee can perform within their restrictions, and to assess the wage range for those positions (U.S. Bureau of Labor Statistics, n.d.).`,
      },
      {
        heading: "Credentials and Qualifications to Look For",
        content: `The field of vocational rehabilitation does not have a single universal licensing requirement, but several professional certifications are widely recognized in litigation. The Certified Rehabilitation Counselor (CRC) designation is awarded by the Commission on Rehabilitation Counselor Certification and requires a master's degree in rehabilitation counseling or a closely related field, supervised clinical experience, and a passing score on the national examination (Commission on Rehabilitation Counselor Certification, n.d.).

The Certified Vocational Evaluator (CVE) credential, historically issued through the Commission on Certification of Work Adjustment and Vocational Evaluation Specialists (an organization that has since ceased operations), focuses specifically on vocational assessment competencies. The Diplomate in Forensic Vocational Consulting, awarded by the American Board of Vocational Experts (ABVE), represents a higher-level credential specifically focused on forensic testimony (American Board of Vocational Experts, n.d.).

When selecting a [[/services/life-care-planning|vocational expert]] for litigation purposes, counsel should look for practitioners who hold one or more of these credentials, who have substantial experience testifying in the relevant jurisdiction, and who demonstrate familiarity with the specific vocational and medical issues in the case. A well-credentialed expert who has not testified in a given state's courts or who lacks experience with the specific type of claim may be less effective than a somewhat less credentialed expert with deep relevant experience.`,
      },
      {
        heading: "Vocational Rehabilitation in Federal and State Systems",
        content: `There are two parallel frameworks for vocational rehabilitation that practitioners must understand: the publicly funded state-federal VR system and the private forensic vocational evaluation market. The state-federal VR system, authorized under the Rehabilitation Act of 1973 and its subsequent amendments (29 U.S.C. sec. 701-796l), provides funded vocational rehabilitation services to individuals with disabilities. Eligibility, available services, and waiting lists vary by state.

Private forensic vocational evaluation, by contrast, operates outside this system entirely. When an attorney retains a vocational expert to evaluate a claimant in litigation, the expert is not providing state-funded services and is not bound by the eligibility or service limitations of the public system. The two systems are independent and the expert's opinion should not be conflated with a state VR determination.

Understanding this distinction matters in litigation because defense counsel sometimes argues that a claimant's failure to engage with the public VR system indicates that the disability is not severe. Conversely, plaintiffs' counsel may point to a state VR agency's determination of disability as corroborating the claimant's position. In either case, the forensic evaluator should address the state VR record as one data point within the broader analysis, rather than treating it as dispositive.`,
      },
    ],
  },
  {
    slug: "guide-to-life-care-planning",
    sources: refsToSources(["NCHS_LIFE_TABLES", "BLS_CPI_MEDICAL", "ICHCC_CLCP", "JONES_LAUGHLIN_PFEIFER"]),
    authorSlug: "paul-bourgeois",
    dateModified: "2026-05-03",
    title: "Guide to Life Care Planning",
    description:
      "What a life care plan is, how it is developed, what cost categories it includes, and the role it plays in personal injury and medical malpractice litigation.",
    sections: [
      {
        heading: "What Is a Life Care Plan?",
        content: `A [[/services/life-care-planning|life care plan]] is a dynamic document that sets forth the anticipated future medical, rehabilitative, and related needs of an individual who has sustained a catastrophic or significant injury or illness. It translates physician recommendations, therapist assessments, and medical literature into a projected schedule of care needs with associated costs over the individual's expected lifetime.

Life care plans are most commonly developed in cases involving traumatic brain injury, spinal cord injury, severe orthopedic trauma, burn injuries, birth-related neurological injuries, and significant medical malpractice. The document is typically prepared by a [[/insights/life-care-plan-components-and-methodology|certified life care planner]], often in conjunction with a physiatrist, neurologist, or other treating or evaluating physician who provides the medical foundation for the care recommendations.

The plan is not aspirational - it is grounded in the individual's actual diagnosis, functional limitations, and documented needs. A properly prepared life care plan references the specific recommendations of treating and evaluating physicians, summarizes the research basis for any recurring care items, and provides sufficient detail to allow a [[/services/forensic-economics|forensic economist]] to calculate the present value of the projected costs.`,
      },
      {
        heading: "Components of a Life Care Plan",
        content: `Life care plans are organized by category of need. Common categories include: projected medical evaluations and treatments; medications (prescription and over-the-counter); diagnostic procedures; surgical interventions and revisions; physical, occupational, and speech therapy; psychological and psychiatric services; home health and attendant care; home modifications; durable medical equipment; orthoses and prostheses; wheelchairs and mobility aids; transportation modifications; educational and vocational services; and institutional or residential care.

For each item, the plan specifies the frequency of need (how often the service or item will be needed), the duration (through what age or for what period), the unit cost (based on actual pricing research in the relevant geographic area), and any escalation assumptions. Cost data is typically obtained from medical billing databases, supplier catalogs, and direct market research.

A well-prepared plan distinguishes between items that have already been provided and future needs that have not yet been addressed. It also identifies items that may vary depending on the course of the individual's condition - for example, a plan for a spinal cord injury patient may include a contingency analysis for potential surgeries depending on whether the individual develops certain complications.`,
      },
      {
        heading: "How Future Costs Are Projected",
        content: `Projecting future costs in a life care plan involves methodological choices that can significantly affect the total cost figure presented to a jury or mediator. The planner must determine base costs, frequency and duration of each care item, life expectancy, and whether costs should be adjusted for medical cost inflation.

Life expectancy is typically based on standard actuarial tables (such as those published by the National Center for Health Statistics) adjusted for any evidence that the individual's condition reduces their [[/tools/life-expectancy|life expectancy]] below the general population norm (Arias et al., 2025). Physicians specializing in the relevant condition (e.g., spinal cord injury medicine) are the appropriate source for modified life expectancy opinions; the life care planner is not qualified to independently deviate from standard tables without a supporting medical opinion.

Medical cost inflation is a contested area. Some experts apply the historical rate of medical consumer price index increases (U.S. Bureau of Labor Statistics, n.d.) to project future costs, while others argue that present-value discounting applied to nominal costs adequately accounts for this factor. The interaction between medical cost inflation and the discount rate used by the forensic economist is a critical area of analysis in large damages cases, and counsel should ensure that the life care planner and forensic economist coordinate their methodological assumptions.`,
      },
      {
        heading: "Credentials of a Life Care Planner",
        content: `The primary credential in the field is the Certified Life Care Planner (CLCP), issued by the International Commission on Health Care Certification (ICHCC). Candidates must hold a qualifying clinical background (typically nursing, rehabilitation counseling, physical therapy, occupational therapy, or a related field), complete required coursework, accumulate supervised case hours, and pass a certification examination (International Commission on Health Care Certification, n.d.). The credential is renewed on a continuing education basis.

Life care planners typically come from one of several clinical backgrounds. Nurses who have specialized in rehabilitation or critical care often develop expertise in life care planning. Vocational rehabilitation counselors with a clinical focus on catastrophic injury also practice in this field. Physical and occupational therapists who transition into a consulting role may similarly obtain CLCP credentials. The clinical background of the planner is relevant when evaluating the plan, since it affects which sections of the plan the planner can independently assess versus areas that require reliance on physician recommendations.

A well-qualified life care planner can defend each line item in their plan, identify the source of every recommendation, explain how costs were researched, and address alternatives presented by opposing experts. In deposition, counsel should be prepared to probe the foundation of each significant cost item - particularly high-cost areas such as attendant care, specialized equipment, and residential placement.`,
      },
      {
        heading: "Role of the Life Care Plan in Litigation",
        content: `In litigation, the life care plan serves multiple functions. It provides the jury with a concrete, itemized representation of the injured person's future needs, translating abstract medical testimony into tangible dollar amounts. It also provides the framework for the forensic economist's present value analysis, which converts the projected annual costs into a single lump-sum figure representing the cost of care in today's dollars. Jones & Laughlin Steel Corp. v. Pfeifer, 462 U.S. 523 (1983).

Life care plans are typically introduced through the testimony of the certified life care planner, who explains the methodology and defends the individual recommendations. The forensic economist then uses the plan as the basis for the damages calculation. In some cases, a physiatrist or treating physician is called as a separate witness to establish the medical foundation for the care needs described in the plan.

Defense experts commonly challenge life care plans on several grounds: (1) lack of foundation for specific recommendations - i.e., the treating physicians did not recommend the item; (2) inflated cost figures not reflecting what care actually costs in the relevant market; (3) inclusion of items the plaintiff has not historically used; and (4) life expectancy assumptions. A robust plan anticipates these challenges by thoroughly documenting the basis for each recommendation and the source of cost data.`,
      },
    ],
  },
  {
    slug: "forensic-economics-explained",
    sources: refsToSources(["BLS_OEWS", "BLS_ATUS", "SKOOG_CIECKA_KRUEGER_2011", "BEAULIEU_V_ELLIOTT", "JONES_LAUGHLIN_PFEIFER", "BLS_CEX", "PATTON_NELSON_1991"]),
    authorSlug: "christopher-skerritt",
    dateModified: "2026-05-03",
    title: "Forensic Economics Explained",
    description:
      "An overview of forensic economics - what it covers, how lost earnings and earning capacity are calculated, present value methodology, and household services valuation.",
    sections: [
      {
        heading: "What Is Forensic Economics?",
        content: `Forensic economics is the application of economic analysis to legal disputes. Forensic economists are retained to quantify economic damages - the financial losses a person has suffered or will suffer as a result of an injury, death, wrongful termination, or other actionable event. Their work translates the facts of a case into a structured, defensible damages calculation that can be presented in litigation.

Forensic economics is distinct from vocational rehabilitation and life care planning, though the disciplines often work together. The vocational expert identifies what jobs the injured person can perform and what wages those jobs pay. The life care planner identifies what future medical care will cost. The forensic economist takes those inputs, applies economic methodology, and calculates a present value of total losses. In wrongful death cases, the forensic economist calculates the economic contribution the decedent would have made to surviving family members over the course of a projected working life.

A forensic economist is not a general-purpose economist. The work requires specific knowledge of wage data sources (primarily Bureau of Labor Statistics publications), actuarial tables, discount rate methodology, personal consumption deductions in wrongful death cases, and the worklife expectancy literature. Practitioners typically hold doctoral degrees in economics, applied economics, or finance, and many belong to the National Association of Forensic Economics (NAFE) or the American Academy of Economic and Financial Experts (AAEFE).`,
      },
      {
        heading: "Lost Earnings and Earning Capacity",
        content: `Lost earnings calculations cover the income a plaintiff has already lost from the time of injury through the date of trial or settlement (the "past" damages component) and the income they will lose in the future (the "future" component). Past lost earnings are typically straightforward: they reflect actual wages not earned during a period of disability, with adjustments for any income actually earned during the period.

Future lost earnings - or more precisely, lost [[/guides/earning-capacity-vs-lost-earnings|earning capacity]] - require projections. The economist must project what the plaintiff would have earned absent the injury (the "but for" scenario) and what the plaintiff will earn given their current condition (the "with injury" scenario). The difference is the economic loss. Each side of this calculation involves assumptions about wage growth, worklife expectancy, and fringe benefits that must be grounded in peer-reviewed data sources (Skoog et al., 2011).

Earning capacity is distinct from actual earnings. A person who was unemployed at the time of injury had an earning capacity based on their skills, education, and the labor market - even if their actual earnings were zero. Courts and economists recognize that individuals are entitled to recover for the loss of their capacity to earn, not merely for the specific wages they were receiving at a particular moment. This distinction is particularly important in cases involving young plaintiffs, homemakers, students, and self-employed individuals whose tax returns may not accurately reflect their economic contribution.`,
      },
      {
        heading: "Present Value Methodology",
        content: `A dollar received in the future is worth less than a dollar received today because money available now can be invested and earn a return. Present value methodology is the technique by which a stream of future losses is converted into a single lump-sum equivalent in today's dollars. This conversion is necessary because litigation produces a one-time payment, not an annuity.

The [[/insights/how-forensic-economists-calculate-damages|present value]] calculation requires a discount rate - the assumed rate at which money will grow over time. Forensic economists disagree on the appropriate discount rate, with some using U.S. Treasury bill or bond rates (representing a risk-free investment), others using a "total offset" method that assumes the discount rate equals the wage growth rate (producing a result equal to simple undiscounted future losses), and others using more sophisticated models. Jones & Laughlin Steel Corp. v. Pfeifer, 462 U.S. 523 (1983). The choice of discount rate can materially affect the final damages figure in large, long-duration cases.

Some jurisdictions have rules or preferences regarding present value methodology. Courts in certain states have adopted the "Alaska Rule" or variations of it, requiring the total offset method (a discount rate assumed equal to wage growth, which eliminates net discounting), while others leave the methodology entirely to the expert. Beaulieu v. Elliott, 434 P.2d 665 (Alaska 1967). Counsel should be aware of the applicable jurisdiction's law and judicial preferences before selecting an expert or reviewing an opposing report.`,
      },
      {
        heading: "Household Services Valuation",
        content: `[[/services/life-care-planning|Household services]] - the unpaid labor individuals perform in maintaining their home and caring for family members - are an economic contribution that has real value even though no paycheck is issued for it. When an injury prevents a person from performing household tasks they previously performed, the cost of replacing that labor is a compensable economic loss.

Household services typically include meal preparation, house cleaning and maintenance, laundry, childcare, lawn care, and routine home repair. The forensic economist values these services using replacement cost methodology: what would it cost to hire others to perform the tasks the plaintiff can no longer perform? This requires data on both the time the plaintiff spent on household tasks and the wage rates of workers in the relevant occupations (U.S. Bureau of Labor Statistics, n.d.).

Time-use data from the Bureau of Labor Statistics' American Time Use Survey provides the primary empirical foundation for household services analysis (U.S. Bureau of Labor Statistics, n.d.). The economist computes a base number of hours devoted to household services, adjusts for the plaintiff's specific household circumstances (presence and ages of children, for example), and multiplies by the appropriate wage rate. In wrongful death cases, household services analysis quantifies the value of the services the decedent would have performed for the surviving family members over a projected lifetime.`,
      },
      {
        heading: "Personal Consumption Deductions and Other Adjustments",
        content: `In wrongful death cases, a forensic economist must account for the fact that some portion of the decedent's earnings would have been spent on the decedent's own personal consumption rather than benefiting the surviving dependents. The "personal consumption deduction" removes the decedent's self-directed spending from the gross earnings projection to arrive at the net economic contribution to survivors.

The magnitude of the personal consumption deduction is determined empirically from consumer expenditure data (U.S. Bureau of Labor Statistics, n.d.; Patton & Nelson, 1991) and depends primarily on family size and income level. In general, smaller families have higher personal consumption percentages (because fixed household expenses are divided among fewer people), while larger families have lower percentages. The deduction is a point of frequent contention between plaintiff and defense economists, and its calculation involves methodological choices about which expenditure categories to include.

Other adjustments that arise in forensic economics calculations include fringe benefit valuation (employment-related benefits such as health insurance, retirement contributions, and payroll taxes have real economic value that must be added to base wages); taxes (some jurisdictions allow the defense to introduce evidence of income taxes as a mitigation of gross damages, while others prohibit it); and [[/guides/worklife-expectancy-explained|worklife expectancy]] (how many of the plaintiff's remaining years would have been spent working, as distinct from years of life expectancy).`,
      },
    ],
  },
  {
    slug: "expert-witness-testimony-guide",
    sources: refsToSources(["FRE_702", "DAUBERT", "KUMHO_TIRE", "FRYE", "FRCP_26"]),
    authorSlug: "daniel-wolstein",
    dateModified: "2026-05-03",
    title: "Expert Witness Testimony Guide",
    description:
      "What expert witnesses do in litigation, the reliability and general-acceptance admissibility frameworks, deposition versus trial testimony, and how to select a qualified expert.",
    sections: [
      {
        heading: "The Role of the Expert Witness",
        content: `An [[/services/expert-witness-testimony|expert witness]] is a person permitted by a court to offer opinion testimony - testimony that goes beyond describing observed facts to providing analysis, conclusions, and opinions in areas requiring specialized knowledge. The governing admissibility framework typically requires that opinion testimony come from a witness qualified by knowledge, skill, experience, training, or education, that the testimony be based on sufficient facts or data, that it be the product of reliable principles and methods, and that it reflect a reliable application of those principles to the facts of the case. Fed. R. Evid. 702.

Vocational experts, life care planners, and [[/services/forensic-economics|forensic economists]] all occupy the expert witness role in litigation. Their function is to assist the trier of fact - the judge or jury - in understanding complex technical, scientific, or economic questions that lie beyond ordinary experience. The expert does not decide the case; the expert provides a framework for the factfinder to evaluate the evidence.

Expert witnesses owe their primary duty to the court and the truthful application of their methodology, not to the retaining party. This distinction matters both ethically and practically: an expert who simply advocates for the position of the retaining attorney, rather than providing an objective analysis, is less credible, more vulnerable on cross-examination, and at risk of professional sanction.`,
      },
      {
        heading: "Reliability and General-Acceptance Admissibility Frameworks",
        content: `Whether a given expert's methodology is admissible depends on the jurisdiction. Federal courts and a majority of state courts apply a [[/guides/daubert-standard-vocational-experts|reliability-based gatekeeping framework]]. Under that framework, the trial judge acts as a gatekeeper, evaluating whether the expert's methodology is reliable and reliably applied to the facts at issue. Non-exclusive reliability factors include whether the theory has been tested, whether it has been subjected to peer review and publication, the known or potential rate of error, the existence and maintenance of controlling standards, and general acceptance in the relevant scientific community. Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993).

A minority of states retain a narrower general-acceptance framework, which focuses solely on whether the expert's methodology is generally accepted in the relevant scientific community. Frye v. United States, 293 F. 1013 (D.C. Cir. 1923). The general-acceptance framework is generally considered more permissive of established methodologies but can be more restrictive toward novel scientific approaches.

In vocational and forensic economics testimony, methodology challenges most often focus on the reliability of the expert's methodology (particularly the specific tools or classification systems used), the reliability of the expert's application of that methodology to the specific facts of the case, and whether the expert has adequate qualifications. Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999). Attorneys are responsible for confirming the governing framework against primary sources for the specific case.`,
      },
      {
        heading: "Deposition vs. Trial Testimony",
        content: `Most expert testimony in litigation occurs at deposition, not trial. A deposition is an out-of-court examination under oath in which opposing counsel questions the expert about their qualifications, methodology, the facts and records reviewed, and the opinions reached. Depositions are transcribed and can be used at trial to challenge the expert if trial testimony deviates from prior sworn statements.

Deposition preparation is as important as trial preparation. An expert who has not thoroughly reviewed all records, who cannot defend the methodological basis for each component of their opinion, or who cannot calmly respond to aggressive questioning will produce a transcript that opposing counsel will use to significant effect at trial. Counsel retaining an expert should schedule a pre-deposition preparation session to review the opinions, identify areas of likely challenge, and ensure the expert is comfortable explaining the methodology in accessible terms.

Trial testimony differs from deposition in audience: at trial, the jury or judge must understand and credit the expert's opinion. This requires clear, organized presentation. Direct examination should walk the jury through the expert's credentials, the information reviewed, the methodology applied, and the conclusions reached - in that order. Cross-examination will typically challenge qualifications, attack specific methodological choices, and attempt to elicit concessions inconsistent with the expert's report. An experienced forensic expert will have testified enough times to anticipate common cross-examination techniques and respond composedly.`,
      },
      {
        heading: "Expert Reports and Disclosure Requirements",
        content: `In trial-track federal court engagements, retained expert witnesses typically must provide a detailed written report containing: a complete statement of all opinions to be expressed and the basis and reasons for them; the facts or data considered by the witness in forming them; any exhibits to be used to summarize or support them; the witness's qualifications, including a list of publications authored in the prior years; a list of cases in which the witness has testified as an expert at trial or deposition during the prior years; and a statement of the compensation to be paid for the study and testimony. Fed. R. Civ. P. 26(a)(2)(B).

These disclosure requirements have significant strategic implications. An expert's full case list is discoverable and will be reviewed by opposing counsel. An expert who has testified almost exclusively for one side of the bar is more vulnerable to bias challenges than one with a demonstrably balanced practice. Similarly, published writings by an expert may contain statements that, taken out of context, can be used to challenge their opinion at trial.

State courts have varying expert disclosure requirements - some more stringent and some less stringent than the federal framework. Counsel practicing in state courts should verify the applicable disclosure timeline and content requirements against primary sources, as failure to comply with [[/guides/expert-witness-disclosure-rules|expert disclosure rules]] can result in exclusion of the expert's testimony.`,
      },
      {
        heading: "Selecting a Qualified Expert",
        content: `[[/guides/how-to-hire-vocational-expert|Selecting the right expert]] is one of the most important decisions counsel makes in a damages case. An expert who is credentialed but not credible on cross-examination, or credible but not credentialed enough to withstand a methodology challenge, provides little value. Several criteria should guide the selection process.

First, credentials: does the expert hold recognized professional certifications in their field? For vocational experts: CRC, CVE, ABVE Diplomate. For life care planners: CLCP, CNLCP. For forensic economists: membership in NAFE or AAEFE, doctoral-level academic credentials. Second, testimony experience: how many times has the expert testified? In what jurisdictions? For both plaintiff and defense? An expert with substantial, balanced experience is more credible to a fact-finder than one with limited or heavily one-sided experience.

Third, methodological rigor: does the expert rely on peer-reviewed sources? Do they cite BLS data, recognized classification systems (O*NET, DOT, SOC), and published research? Can they explain why they made the methodological choices they made? Fourth, communication: an expert who cannot explain complex concepts in plain language that jurors understand is not serving the case. Observing a prospective expert's prior testimony - either in deposition transcripts or at trial - is the most reliable way to assess this quality before committing to the retainer.`,
      },
    ],
  },
];

export function getGuideBySlug(slug: string): KnowledgeGuide | undefined {
  return knowledgeGuides.find((g) => g.slug === slug);
}
