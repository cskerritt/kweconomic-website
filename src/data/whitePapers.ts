import type { Source } from "./types";
import { refsToSources } from "./references";

export interface WhitePaperSection {
  heading: string;
  /** HTML body. Keep to <p>, <ul>/<li>, <strong>, <em>, inline <a>. No em dashes. */
  bodyHtml: string;
}

export interface WhitePaper {
  slug: string;
  title: string;
  subtitle: string;
  /** One of the core practice areas, used for the icon + cross-link. */
  discipline: "Vocational" | "Economic" | "Life Care";
  /** Lucide icon name for the hero motif. */
  icon: string;
  /** Service slug this paper cross-links to. */
  serviceSlug: string;
  /** Abstract shown above the gate (always visible for SEO). */
  summary: string;
  keyTakeaways: string[];
  readingTime: string;
  datePublished: string;
  dateModified: string;
  authorSlug?: string;
  /** First section is shown as a teaser; later sections sit behind the gate. */
  sections: WhitePaperSection[];
  /** Registry-backed references, rendered by SourcesBlock (see refsToSources). */
  sources?: Source[];
}

export const whitePapers: WhitePaper[] = [
  {
    slug: "daubert-ready-life-care-plan",
    title: "Building a Daubert-Ready Life Care Plan",
    subtitle:
      "Foundations, costing, and documentation for a future-care projection that withstands admissibility review.",
    discipline: "Life Care",
    icon: "HeartPulse",
    serviceSlug: "life-care-planning",
    summary:
      "A life care plan is an itemized projection of the future medical, rehabilitative, and support needs of an individual with a catastrophic injury or chronic condition, together with the cost and frequency of each item. It is the evidentiary foundation for the economist's present-value calculation of future care damages. This paper describes how a plan is built on the medical record, costed from defensible sources, and documented so that each recommendation can be traced and tested.",
    keyTakeaways: [
      "Each item in a life care plan should trace to a medical foundation in the record, not to unsupported assumption.",
      "Frequency, duration, and unit cost are stated for every item so the projection can be reproduced.",
      "Costs are drawn from defensible, geographically appropriate sources and documented.",
      "A plan that distinguishes injury-related needs from pre-existing or unrelated needs is more defensible.",
    ],
    readingTime: "11 min read",
    datePublished: "2026-06-03",
    dateModified: "2026-06-03",
    sections: [
      {
        heading: "What a life care plan is for",
        bodyHtml:
          "<p>A <a href=\"/guides/what-is-life-care-plan\">life care plan</a> translates a person's future care needs into a structured, costed projection that a jury can understand and an economist can value (Weed &amp; Berens, 2018; Reavis, 2002). It addresses the medical and non-medical needs that flow from the injury or condition over the relevant horizon, including physician and therapy services, medications, equipment, supplies, attendant care, and home or transportation modifications where supported.</p><p>The plan does not decide the medicine. It organizes and projects care that the medical record and treating or evaluating providers support, and it makes the basis for each item explicit.</p>",
      },
      {
        heading: "Grounding the plan in the medical record",
        bodyHtml:
          "<p>Every recommendation should rest on a medical foundation: a treating provider's recommendation, an evaluating specialist's opinion, published clinical guidance appropriate to the diagnosis (Agency for Healthcare Research and Quality, n.d.), or a combination of these. The planner documents which source supports each item. Where the foundation is a provider opinion, the plan identifies the provider; where it is clinical guidance, the plan identifies the guidance.</p><p>This sourcing is what separates a defensible plan from a list of plausible services. It allows opposing experts to test each item against the same record rather than against the planner's unexplained judgment.</p>",
      },
      {
        heading: "Specifying frequency, duration, and quantity",
        bodyHtml:
          "<p>For each item, the plan states how often it is needed, for how long, and in what quantity. A therapy is not simply listed; it is specified as a number of sessions over a defined period. Equipment is specified with a replacement interval. Attendant care is specified in hours at a defined level of skill. These parameters are what make the projection reproducible and what allow the economist to build a year-by-year stream.</p>",
      },
      {
        heading: "Costing from defensible sources",
        bodyHtml:
          "<p>Unit costs are drawn from sources appropriate to the item and the geography in which care will be delivered, such as provider quotes, recognized cost databases, and published fee information (Centers for Medicare &amp; Medicaid Services, n.d.). The plan documents the source of each cost and the date it was obtained. Where a cost varies by setting or region, the plan states the basis for the figure used.</p><p>Geographic appropriateness matters: the cost of care in the relevant community is the relevant figure, not a national average applied without explanation.</p>",
      },
      {
        heading: "Separating related from unrelated needs",
        bodyHtml:
          "<p>A defensible plan distinguishes needs arising from the injury or condition at issue from needs the person would have had regardless. Pre-existing conditions and unrelated care are identified and, where appropriate, excluded or apportioned. Addressing this directly, rather than leaving it for cross-examination to expose, strengthens the plan and reflects the objective stance expected of an expert.</p>",
      },
      {
        heading: "Documentation and admissibility",
        bodyHtml:
          "<p>Admissibility frameworks generally ask whether an opinion rests on a reliable foundation and a sound method applied to the facts of the case (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Fed. R. Evid. 702). A life care plan answers those questions when it shows its work: the records reviewed, the foundation for each item, the parameters and costs with their sources, and any limitations. The attorney is responsible for confirming <a href=\"/guides/federal-vs-state-court-daubert\">the governing admissibility standard</a> for the jurisdiction, but a plan built and documented this way is positioned to be examined on the merits.</p>",
      },
      {
        heading: "Handing off to the economist",
        bodyHtml:
          "<p>The completed plan provides <a href=\"https://kwvrs.com/services/forensic-economics\">the economist</a> with a clean, itemized stream of future costs, each with frequency, duration, quantity, and unit cost. Keeping the life care plan and the economic analysis methodologically aligned, while each remains the work of its own expert, produces a future-care damages figure that is consistent end to end and easier to defend as a whole.</p>",
      },
    ],
    sources: refsToSources([
      "AHRQ_GUIDELINES",
      "CMS_PFS",
      "DAUBERT",
      "FRE_702",
      "IARP_IALCP_STANDARDS",
      "WEED_BERENS",
    ]),
  },
];

export function getWhitePaperBySlug(slug: string): WhitePaper | undefined {
  return whitePapers.find((w) => w.slug === slug);
}

export function getAllWhitePaperSlugs(): string[] {
  return whitePapers.map((w) => w.slug);
}
