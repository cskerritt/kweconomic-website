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
  /** Team member slug for the AuthorByline. Falls back to the "<ORG_NAME> Editorial Team" byline when unset. */
  authorSlug?: string;
}

export const insightPosts: InsightPost[] = [
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
    content: `The admissibility of expert testimony in U.S. courts is governed by one of two broad framework families, depending on the jurisdiction. Federal courts and a substantial majority of state courts apply a [[/guides/federal-vs-state-court-daubert|reliability-based gatekeeping framework]]. A smaller number of states continue to apply an older general-acceptance framework. Knowing which framework applies - and what it requires - is essential to the preparation, retention, and challenge of expert witnesses. Attorneys are responsible for confirming the governing framework against primary sources.

Under the reliability framework, the trial judge serves as a gatekeeper with an affirmative obligation to ensure that expert testimony meets threshold requirements of reliability and relevance before it is presented to the jury. Non-exclusive reliability factors include whether the expert's theory or technique has been tested; whether it has been subjected to peer review and publication; the known or potential rate of error; the existence and maintenance of controlling standards; and whether the methodology is generally accepted in the relevant scientific or professional community. Fed. R. Evid. 702; Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993). Note that general acceptance is one factor among several - it is not the sole criterion.

The general-acceptance framework, by contrast, asks only whether the expert's methodology is generally accepted by the relevant scientific community. Frye v. United States, 293 F. 1013 (D.C. Cir. 1923). Courts applying this framework do not separately evaluate testability, peer review status, or error rates; acceptance by practitioners in the field is the dispositive question. The general-acceptance framework is sometimes described as more conservative toward novel methodologies but more permissive toward well-established (if not always rigorously validated) techniques that have achieved broad professional acceptance.

For life care planners, methodology challenges most commonly target specifics rather than the discipline itself. Kumho Tire Co. v. Carmichael, 526 U.S. 137 (1999). Defense challenges to a [[/services/life-care-planning|life care plan]] often attack items that lack a treating or evaluating physician's recommendation, frequencies and durations that exceed what the clinical literature supports, cost figures drawn from the wrong geographic market or an undocumented source, and a [[/methods/life-expectancy-in-life-care-planning|life expectancy]] the planner adopted without medical support. Plaintiff challenges to a defense [[/services/life-care-plan-rebuttal|rebuttal plan]] may focus on whether the reviewer actually examined the evaluee's current function or simply deleted items from the plaintiff's plan without a stated basis.

Courts have generally upheld a range of methodological choices as long as the planner can identify the published standards followed, the foundation for each item, and the reason the approach fits the specific case. General Electric Co. v. Joiner, 522 U.S. 136 (1997). A conclusory assertion that an item is "customary" for the diagnosis, without a record foundation or a citation to clinical guidance, is more vulnerable to exclusion.

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

In evaluating an opposing party's life care plan, counsel and defense experts should systematically examine each significant cost item. Key questions include: Is there a specific physician recommendation for this item? If yes, what is the source document? Was this recommendation made in the context of litigation or in the course of actual treatment? Are the costs based on current market rates in the relevant geography or outdated or inappropriate comparators? Are the frequency and duration assumptions consistent with the medical literature on the condition? Is [[/methods/life-expectancy-in-life-care-planning|the life expectancy assumption]] supported by a physician opinion, or did the life care planner deviate from standard tables (Arias et al., 2025) without adequate foundation?`,
  },
];

export function getPostBySlug(slug: string): InsightPost | undefined {
  return insightPosts.find((p) => p.slug === slug);
}

export function getRelatedPosts(slug: string, category: string): InsightPost[] {
  return insightPosts.filter((p) => p.slug !== slug && p.category === category);
}

export const insightCategories = ["All", "Legal", "Life Care Planning"];
