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
    slug: "earning-capacity-assessment-methodology",
    title: "Earning Capacity Assessment: A Defensible Methodology",
    subtitle:
      "How a forensic vocational evaluation establishes pre- and post-event earning capacity in a way that withstands scrutiny.",
    discipline: "Vocational",
    icon: "Briefcase",
    serviceSlug: "vocational-expert",
    summary:
      "Earning capacity is a measure of what an individual is able to earn in the open labor market given education, training, work history, and any functional limitations. It is distinct from actual earnings at a point in time and from a government or insurer disability determination. This paper sets out a transparent, replicable methodology for assessing earning capacity before and after an injury or event, and explains how each step is documented so the resulting opinion can be examined and tested by opposing counsel.",
    keyTakeaways: [
      "Earning capacity reflects ability to earn, not the wage a person happens to receive at a given moment.",
      "A defensible evaluation separates the pre-event capacity baseline from the post-event capacity and explains every assumption between them.",
      "Transferable skills analysis and labor market data anchor the opinion to observable facts rather than conclusory judgment.",
      "Documentation of records reviewed, methods applied, and limitations acknowledged is what makes the opinion testable.",
    ],
    readingTime: "11 min read",
    datePublished: "2026-06-03",
    dateModified: "2026-06-03",
    sections: [
      {
        heading: "What earning capacity measures",
        bodyHtml:
          "<p><a href=\"/guides/earning-capacity-vs-lost-earnings\">Earning capacity</a> is a forward-looking estimate of what a person is able to earn in the competitive labor market. It is grounded in the individual's education, training, prior work, demonstrated abilities, and any medically supported functional limitations, read against the jobs that actually exist in the relevant economy. Because it measures ability rather than a single observed wage, earning capacity can differ from a person's earnings history, and it is a separate concept from the disability categories used by government programs or insurers (Social Security Administration, 2024).</p><p>In litigation, earning capacity matters because damages turn on the difference between what a person could have earned absent the event and what they can earn after it. A vocational evaluation supplies the foundation for that comparison so a <a href=\"/services/forensic-economics\">forensic economist</a> can reduce the resulting stream of losses to <a href=\"/tools/economic-damages-estimator\">present value</a>.</p>",
      },
      {
        heading: "Establishing the pre-event baseline",
        bodyHtml:
          "<p>The first task is to describe what the individual was capable of earning before the event. This baseline rests on documented education, certifications, and a detailed work history, including job titles, duties, exertional demands, and wage progression. Where the record allows, the evaluator characterizes the person's established occupation and any reasonable career trajectory supported by their history rather than by speculation.</p><p>The baseline is expressed in terms of occupations and wage ranges that the labor market data support, not a single number presented without context. Stating the baseline as a defensible range, with the basis for each endpoint, allows the opinion to be examined on its own terms.</p>",
      },
      {
        heading: "Assessing post-event capacity",
        bodyHtml:
          "<p>Post-event capacity is assessed by integrating the medical record, any functional capacity findings, and the individual's own report of activity tolerance with the requirements of work. The evaluator identifies which prior occupations remain accessible, which are foreclosed, and which alternative occupations are realistic given the residual functional profile.</p><p>This step is explicitly tied to restrictions that the medical evidence supports. An opinion that assumes limitations the record does not establish, or that ignores limitations the record does establish, is not defensible. The evaluator states which medical sources were relied upon and how each restriction was translated into a vocational consequence.</p>",
      },
      {
        heading: "Transferable skills analysis",
        bodyHtml:
          "<p><a href=\"/methods/transferable-skills-analysis\">Transferable skills analysis</a> is the structured method for determining which work-related skills acquired in prior jobs can carry over to other occupations within the person's residual capacity (Truthan &amp; Karman, 2003). It connects the documented work history to specific alternative occupations using recognized occupational classifications and their associated worker traits (National Center for O*NET Development, n.d.; U.S. Department of Labor, Employment and Training Administration, 1991).</p><p>Done well, the analysis is reproducible: another qualified evaluator working from the same record should be able to follow the path from prior jobs to identified alternatives. This is one of the points at which opinions are most often tested, so the basis for each transferable skill and each candidate occupation is documented rather than asserted.</p>",
      },
      {
        heading: "Anchoring to labor market data",
        bodyHtml:
          "<p>Identified occupations are tested against the labor market in the relevant geography. The evaluator considers wage levels, the presence of the occupation in the local and regional economy (U.S. Bureau of Labor Statistics, n.d.), and any access barriers such as licensure or typical hiring requirements. A <a href=\"/methods/labor-market-survey\">labor market survey</a> may be used to confirm that identified work exists and is realistically available, not merely theoretically possible.</p><p>Tying conclusions to observable wage and employment data, rather than to the evaluator's unaided judgment, is what allows the post-event capacity figure to be examined and, if appropriate, rebutted with competing data.</p>",
      },
      {
        heading: "Documentation and acknowledging limitations",
        bodyHtml:
          "<p>The credibility of an earning capacity opinion depends on the transparency of its record. A defensible report lists the records reviewed, the interview and any testing conducted, the occupational and wage sources consulted, and the assumptions made at each step. Where the record is incomplete or where reasonable professionals could reach different conclusions, the report says so.</p><p>Acknowledging limitations does not weaken an opinion. It signals that the methodology, not the desired result, drove the conclusion, and it gives the trier of fact an honest basis for weighing the evidence.</p>",
      },
      {
        heading: "How the opinion supports the damages model",
        bodyHtml:
          "<p>The vocational opinion produces the inputs a forensic economist needs: a pre-event earning capacity, a post-event earning capacity, and the vocational basis for any work-life or mitigation assumptions (Skoog et al., 2011). Keeping the vocational and economic analyses methodologically aligned, while each remains independent, produces a damages model that is internally consistent and easier to defend as a whole.</p>",
      },
    ],
    sources: refsToSources([
      "ONET",
      "SKOOG_CIECKA_KRUEGER_2011",
      "SSA_BLUEBOOK",
      "TRUTHAN_KARMAN_2003",
      "BLS_OEWS",
      "DOT",
    ]),
  },
  {
    slug: "present-value-future-losses",
    title: "Reducing Future Losses to Present Value",
    subtitle:
      "Methods, assumptions, and the documentation that makes a present-value calculation defensible.",
    discipline: "Economic",
    icon: "Calculator",
    serviceSlug: "forensic-economics",
    summary:
      "Future economic losses, whether lost earnings or the cost of future care, must be expressed as a single present value so they can be compared and awarded today. The present value depends on the projected stream of losses, the growth applied to that stream, and the discount rate used to bring it back to the present. This paper explains each component, the assumptions that drive the result, and the documentation that allows a present-value calculation to be examined and tested.",
    keyTakeaways: [
      "Present value converts a future stream of losses into a single equivalent amount payable today.",
      "The result is driven by three transparent inputs: the loss stream, its projected growth, and the discount rate.",
      "Every assumption should be sourced and stated so the calculation can be reproduced and challenged.",
      "Consistency between the growth and discount assumptions matters more than any single figure.",
    ],
    readingTime: "10 min read",
    datePublished: "2026-06-03",
    dateModified: "2026-06-03",
    sections: [
      {
        heading: "Why present value is required",
        bodyHtml:
          "<p>An award is paid today, but the losses it compensates occur over future years. Present value is the method for making those future amounts comparable to present dollars: it asks what sum, invested today on reasonable terms, would fund the projected future losses as they come due. Without this step, future losses would be either overstated, by ignoring the time value of money, or understated, by ignoring growth in wages or costs.</p>",
      },
      {
        heading: "Building the loss stream",
        bodyHtml:
          "<p>The first input is the year-by-year stream of losses. For lost earnings, this is the projected difference between pre-event and post-event earning capacity across the relevant work-life. For future care, it is the projected annual cost of the items in a <a href=\"/services/life-care-planning\">life care plan</a>. The stream is built on a stated foundation: the vocational opinion, the life care plan, and demographic assumptions such as <a href=\"/methods/worklife-expectancy\">work-life expectancy</a> (Skoog et al., 2011) or <a href=\"/tools/life-expectancy\">life expectancy</a> (Arias et al., 2025).</p><p>The economist does not generate the underlying vocational or medical inputs. Those come from the appropriate experts. The economist's role is to assemble them into a transparent stream and to apply growth and discounting consistently.</p>",
      },
      {
        heading: "Projecting growth",
        bodyHtml:
          "<p>Future earnings tend to grow with wage inflation and, in some occupations, with productivity and experience (U.S. Bureau of Labor Statistics, n.d.). Future medical and care costs tend to grow at rates that can differ from general inflation (U.S. Bureau of Labor Statistics, n.d.). The growth assumption should be tied to recognized data series appropriate to the category being projected, and the choice of series should be stated.</p><p>The point is not to find the highest or lowest plausible growth rate but to apply a defensible rate that is consistent with how the discount rate is chosen, as discussed below.</p>",
      },
      {
        heading: "Selecting the discount rate",
        bodyHtml:
          "<p>The discount rate reflects the return that could be earned on a safe investment of the award over the relevant horizon. It is commonly tied to yields on low-risk instruments rather than to speculative returns (U.S. Department of the Treasury, n.d.). The selected rate, and its source, should be disclosed so that opposing experts can test it.</p><p>A higher discount rate lowers present value; a lower rate raises it. Because the figure is so consequential, the basis for the chosen rate is one of the most important things to document and one of the most common points of cross-examination.</p>",
      },
      {
        heading: "Consistency between growth and discounting",
        bodyHtml:
          "<p>The relationship between the growth rate and the discount rate often matters more than either figure alone. Some analyses express this relationship directly as a net rate. Whatever the presentation, the assumptions must be internally consistent: it is not defensible to apply an optimistic growth rate alongside an unrelated discount rate chosen to maximize or minimize the result. Stating both inputs and their sources lets the trier of fact evaluate whether they were chosen coherently.</p>",
      },
      {
        heading: "Sensitivity and ranges",
        bodyHtml:
          "<p>Because reasonable professionals can differ on growth and discount assumptions, a transparent analysis often shows how the present value changes across a reasonable range of inputs. Presenting a sensitivity analysis does not concede uncertainty in a damaging way; it demonstrates that the opinion was tested against alternatives and that the conclusion is stable, or it honestly shows where the result is most sensitive.</p>",
      },
      {
        heading: "Documentation that makes the calculation testable",
        bodyHtml:
          "<p>A defensible present-value report discloses the loss stream year by year, the growth and discount rates with their sources, the demographic assumptions, and the arithmetic that connects them. Given the same inputs, another economist should be able to reproduce the result. Reproducibility, not the size of the number, is the measure of a sound calculation.</p>",
      },
    ],
    sources: refsToSources([
      "NCHS_LIFE_TABLES",
      "SKOOG_CIECKA_KRUEGER_2011",
      "BLS_CPI_MEDICAL",
      "BLS_ECI",
      "TREASURY_YIELD",
    ]),
  },
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
          "<p>A <a href=\"/guides/what-is-life-care-plan\">life care plan</a> translates a person's future care needs into a structured, costed projection that a jury can understand and an economist can value (Weed &amp; Berens, 2018; International Academy of Life Care Planners, 2022). It addresses the medical and non-medical needs that flow from the injury or condition over the relevant horizon, including physician and therapy services, medications, equipment, supplies, attendant care, and home or transportation modifications where supported.</p><p>The plan does not decide the medicine. It organizes and projects care that the medical record and treating or evaluating providers support, and it makes the basis for each item explicit.</p>",
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
          "<p>Admissibility frameworks generally ask whether an opinion rests on a reliable foundation and a sound method applied to the facts of the case (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Fed. R. Evid. 702). A life care plan answers those questions when it shows its work: the records reviewed, the foundation for each item, the parameters and costs with their sources, and any limitations. The attorney is responsible for confirming <a href=\"/guides/daubert-standard-vocational-experts\">the governing admissibility standard</a> for the jurisdiction, but a plan built and documented this way is positioned to be examined on the merits.</p>",
      },
      {
        heading: "Handing off to the economist",
        bodyHtml:
          "<p>The completed plan provides <a href=\"/services/forensic-economics\">the economist</a> with a clean, itemized stream of future costs, each with frequency, duration, quantity, and unit cost. Keeping the life care plan and the economic analysis methodologically aligned, while each remains the work of its own expert, produces a <a href=\"/tools/economic-damages-estimator\">future-care damages figure</a> that is consistent end to end and easier to defend as a whole.</p>",
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
