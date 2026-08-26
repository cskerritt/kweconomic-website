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
  /** Team member slug for the AuthorByline. Falls back to the "<ORG_NAME> Editorial Team" byline when unset. */
  authorSlug?: string;
}

export const knowledgeGuides: KnowledgeGuide[] = [
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

The plan is not aspirational - it is grounded in the individual's actual diagnosis, functional limitations, and documented needs. A properly prepared life care plan references the specific recommendations of treating and evaluating physicians, summarizes the research basis for any recurring care items, and provides sufficient detail to allow a forensic economist to calculate the present value of the projected costs.`,
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

Life care planners typically come from one of several clinical backgrounds. Nurses who have specialized in rehabilitation or critical care often develop expertise in life care planning. Rehabilitation counselors with a clinical focus on catastrophic injury also practice in this field. Physical and occupational therapists who transition into a consulting role may similarly obtain CLCP credentials. The clinical background of the planner is relevant when evaluating the plan, since it affects which sections of the plan the planner can independently assess versus areas that require reliance on physician recommendations.

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

Life care planners, physicians, and forensic economists all occupy the expert witness role in injury litigation. Their function is to assist the trier of fact - the judge or jury - in understanding complex technical, scientific, or economic questions that lie beyond ordinary experience. The expert does not decide the case; the expert provides a framework for the factfinder to evaluate the evidence.

Expert witnesses owe their primary duty to the court and the truthful application of their methodology, not to the retaining party. This distinction matters both ethically and practically: an expert who simply advocates for the position of the retaining attorney, rather than providing an objective analysis, is less credible, more vulnerable on cross-examination, and at risk of professional sanction.`,
      },
      {
        heading: "Reliability and General-Acceptance Admissibility Frameworks",
        content: `Whether a given expert's methodology is admissible depends on the jurisdiction. Federal courts and a majority of state courts apply a [[/guides/federal-vs-state-court-daubert|reliability-based gatekeeping framework]]. Under that framework, the trial judge acts as a gatekeeper, evaluating whether the expert's methodology is reliable and reliably applied to the facts at issue. Non-exclusive reliability factors include whether the theory has been tested, whether it has been subjected to peer review and publication, the known or potential rate of error, the existence and maintenance of controlling standards, and general acceptance in the relevant scientific community. Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993).

A minority of states retain a narrower general-acceptance framework, which focuses solely on whether the expert's methodology is generally accepted in the relevant scientific community. Frye v. United States, 293 F. 1013 (D.C. Cir. 1923). The general-acceptance framework is generally considered more permissive of established methodologies but can be more restrictive toward novel scientific approaches.

In life care planning testimony, methodology challenges most often focus on whether each item in the plan has a medical foundation, whether frequency and duration are supported, whether the cost sources are documented and geographically appropriate, and whether the planner has adequate clinical qualifications for the opinions offered. Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999). Attorneys are responsible for confirming the governing framework against primary sources for the specific case.`,
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
        content: `[[/services/life-care-planning|Selecting the right expert]] is one of the most important decisions counsel makes in a damages case. An expert who is credentialed but not credible on cross-examination, or credible but not credentialed enough to withstand a methodology challenge, provides little value. Several criteria should guide the selection process.

First, credentials: does the expert hold recognized professional certifications in their field? For life care planners, the CLCP or CNLCP on top of a clinical license such as RN, CRC, OT, PT, or MD; for physicians supplying the medical foundation, board certification in the relevant specialty. Second, testimony experience: how many times has the expert testified? In what jurisdictions? For both plaintiff and defense? An expert with substantial, balanced experience is more credible to a fact-finder than one with limited or heavily one-sided experience.

Third, methodological rigor: does the expert follow published practice standards? Do they document the medical foundation for each item, cite published clinical guidance and life tables, and record the source of every cost? Can they explain why they made the methodological choices they made? Fourth, communication: an expert who cannot explain complex concepts in plain language that jurors understand is not serving the case. Observing a prospective expert's prior testimony - either in deposition transcripts or at trial - is the most reliable way to assess this quality before committing to the retainer.`,
      },
    ],
  },
];

export function getGuideBySlug(slug: string): KnowledgeGuide | undefined {
  return knowledgeGuides.find((g) => g.slug === slug);
}
