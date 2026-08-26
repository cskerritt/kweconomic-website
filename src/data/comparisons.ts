import type { Faq, Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";

export interface ComparisonRow {
  dimension: string;
  a: string;
  b: string;
}

export interface Comparison {
  slug: string;
  title: string;
  a: { label: string; summary: string; url?: string };
  b: { label: string; summary: string; url?: string };
  rows: ComparisonRow[];
  whenUseA: string;
  whenUseB: string;
  overlap: string;
  faqs: Faq[];
  sources: Source[];
  dateModified?: string;
  authorSlug?: string;
  related?: RelatedItem[];
}

export const comparisons: Comparison[] = [
  {
    slug: "life-care-plan-vs-future-cost-projection",
    title: "Life Care Plan vs. Future Cost Projection",
    dateModified: "2026-04-21",
    a: {
      label: "Life Care Plan",
      summary: "Comprehensive itemized care plan following [[/methods/life-care-plan-development|IALCP/IARP standards]] with frequencies, durations, and costs across the lifespan (International Academy of Life Care Planners, 2022).",
      url: "/services/life-care-planning",
    },
    b: {
      label: "Future Medical Cost Projection",
      summary: "A narrower, [[/services/medical-cost-projection|scoped projection of future medical costs]] for a defined set of needs, prepared without the full life care planning process.",
      url: "/services/medical-cost-projection",
    },
    rows: [
      { dimension: "Methodology", a: "IALCP/IARP standards, treating-team grounded", b: "Variable; often summary of treating-physician testimony" },
      { dimension: "Scope", a: "Medical + non-medical categories across lifespan", b: "Typically medical categories only" },
      { dimension: "Preparer", a: "CLCP", b: "Sometimes physician or economist" },
      { dimension: "Defensibility", a: "Methodology-driven; grounded in published life-care-planning standards", b: "Variable, depends on author and method" },
    ],
    whenUseA:
      "Prefer a full life care plan when damages include long-term care across multiple categories.",
    whenUseB:
      "A simpler projection may suffice when the scope is limited to a single medical category or short horizon.",
    overlap:
      "Both project future costs. The life care plan provides comprehensive, methodology-grounded coverage across the full scope of needs (Weed & Berens, 2018).",
    faqs: [
      {
        question: "Is a future cost projection admissible without a CLCP?",
        answer:
          "In some cases, where a physician can quantify projected care costs. Broader projections typically require a CLCP.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS"]),
    related: [
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development", description: "How a life care plan is researched and costed." },
      { title: "Certified Life Care Planner (CLCP)", href: "/credentials/clcp", description: "Life care planner certification." },
      { title: "Future Medical Costs in Personal Injury", href: "/guides/future-medical-costs-in-personal-injury", description: "How future care costs are projected and reduced to present value." },
    ],
  },
  {
    slug: "in-person-evaluation-vs-file-review",
    title: "In-Person Evaluation vs. File Review",
    dateModified: "2026-04-21",
    a: {
      label: "In-Person Evaluation",
      summary: "The life care planner meets with the evaluee, typically in the home, to interview, observe function and the care environment, and confirm what the records describe.",
      url: "/services/life-care-planning",
    },
    b: {
      label: "File Review",
      summary: "The planner works from the medical record, deposition testimony, and provider input alone, typically for a [[/services/life-care-plan-rebuttal|rebuttal]] or when access to the evaluee is not available.",
    },
    rows: [
      { dimension: "Data source", a: "Records + interview + home and functional observation", b: "Records, depositions, and provider correspondence only" },
      { dimension: "Depth", a: "Confirms current function, equipment in use, caregiver burden, home barriers", b: "Limited to what the record documents" },
      { dimension: "Cost and time", a: "Higher; requires scheduling and travel", b: "Lower; faster" },
      { dimension: "Typical use", a: "Plaintiff-retained plans, catastrophic and pediatric cases", b: "Defense rebuttal, records-only file review, plan updates when the evaluee is unavailable" },
    ],
    whenUseA:
      "Prefer in-person evaluation in catastrophic cases, where cognitive or behavioral factors matter, or where the defense has raised consistency concerns.",
    whenUseB:
      "File review is appropriate when the record is complete, when the engagement is a rebuttal of an opposing plan, or when direct access to the evaluee is not available (International Association of Rehabilitation Professionals, n.d.).",
    overlap:
      "The underlying [[/methods/life-care-plan-development|methodology]] is the same: records review, treating-team input, published clinical guidance, and [[/methods/cost-research-methodology|documented cost research]]. The in-person evaluation adds direct observation of function, the home, and the care actually being provided, which is often where a records-only plan and the lived situation diverge.",
    faqs: [
      {
        question: "Will courts give less weight to a file-review opinion?",
        answer:
          "Depends on the case. Comprehensive file-review opinions are frequently admitted when the record is complete and the methodology is documented (Fed. R. Evid. 702; Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993).",
      },
    ],
    sources: refsToSources(["FRE_702", "DAUBERT", "IARP"]),
    related: [
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development", description: "How a life care plan is researched and costed." },
      { title: "Life Care Plan Rebuttal", href: "/services/life-care-plan-rebuttal", description: "Records-based review of an opposing life care plan." },
      { title: "How to Rebut a Life Care Plan", href: "/guides/how-to-rebut-a-life-care-plan", description: "What a rebuttal reviewer tests in an opposing plan." },
    ],
  },
  {
    slug: "fce-vs-ime",
    title: "Functional Capacity Evaluation (FCE) vs. Independent Medical Examination (IME)",
    dateModified: "2026-04-21",
    a: {
      label: "Functional Capacity Evaluation (FCE)",
      summary: "A standardized assessment of physical work capacity conducted by an OT or PT using validated protocols over 4-8 hours (Genovese & Galper, 2009).",
      url: "/methods/functional-capacity-evaluation",
    },
    b: {
      label: "Independent Medical Examination (IME)",
      summary: "A physician-led examination and records review that provides diagnostic and causation opinions, typically in a single session (American Medical Association, 2023).",
    },
    rows: [
      { dimension: "Examiner", a: "OT or PT", b: "Physician" },
      { dimension: "Duration", a: "4-8 hours, sometimes 2 days", b: "30-90 minutes, typically single session" },
      { dimension: "Primary output", a: "Safe maximum demonstrated physical capacities", b: "Diagnostic and causation opinion" },
      { dimension: "Methodology", a: "Standardized physical tests with effort/consistency measures", b: "History, examination, record review" },
      { dimension: "Typical use", a: "Establish work capacity restrictions", b: "Establish diagnosis, causation, prognosis" },
    ],
    whenUseA:
      "Use an FCE when physical capacity must be quantified to support items in a [[/services/life-care-planning|life care plan]] such as attendant care hours, home modifications, or the need for adaptive equipment, or to document restrictions in a [[/case-types/workers-compensation|workers' compensation]] matter.",
    whenUseB:
      "Use an IME when diagnostic, causation, or prognosis questions need physician-level opinion, often on behalf of the defense.",
    overlap:
      "Both examine the claimant. They answer different questions: FCE quantifies physical capacity; IME addresses medical questions. In catastrophic cases, both are often performed, and the life care planner may rely on either as part of the medical foundation for the plan.",
    faqs: [
      {
        question: "Can an IME include functional testing?",
        answer:
          "Some IME physicians perform or order functional testing, though dedicated FCEs by OTs and PTs produce more detailed and standardized physical capacity data.",
      },
    ],
    sources: refsToSources(["GENOVESE_GALPER_2009", "AMA_GUIDES_IMPAIRMENT"]),
    related: [
      { title: "Functional Capacity Evaluation", href: "/methods/functional-capacity-evaluation", description: "How an FCE is administered and reported." },
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Workers' Compensation Life Care Plans", href: "/services/workers-compensation-lcp", description: "Plans prepared for workers' compensation settlement and reserving." },
    ],
  },
  {
    slug: "plaintiff-expert-vs-defense-expert",
    title: "Plaintiff Expert vs. Defense Expert: Is the Methodology Different?",
    dateModified: "2026-04-21",
    a: {
      label: "Plaintiff Expert",
      summary: "A [[/services/life-care-planning|life care planner]] or other damages expert retained by the injured party.",
    },
    b: {
      label: "Defense Expert",
      summary: "A life care planner or other damages expert retained by the defendant or carrier, often to prepare a [[/services/life-care-plan-rebuttal|rebuttal plan]].",
    },
    rows: [
      { dimension: "Methodology", a: "Same accepted methodology", b: "Same accepted methodology" },
      { dimension: "Credentials", a: "CLCP, CNLCP, RN, MD, PhD as applicable", b: "Same" },
      { dimension: "Standards", a: "IALCP Standards of Practice; AANLCP scope for nurse planners", b: "Same" },
      { dimension: "Typical disagreement source", a: "Medical foundation, frequency and duration, unit cost source, life expectancy", b: "Same" },
    ],
    whenUseA:
      "Retain when representing an injured claimant or a plaintiff in litigation.",
    whenUseB:
      "Retain when representing a defendant or insurer.",
    overlap:
      "The methodology, standards, and credentials are the same on both sides (International Academy of Life Care Planners, 2022). KW Life Care Planning accepts engagements from both plaintiff and defense and applies the same methodology regardless of retaining party: every item traces to a medical foundation, a stated frequency and duration, and a documented cost source.",
    faqs: [
      {
        question: "Should I avoid an expert who has primarily worked for the other side?",
        answer:
          "Not categorically. An expert with balanced experience on both sides is often more credible under cross-examination. KW Life Care Planning maintains a balanced plaintiff and defense caseload by policy.",
      },
      {
        question: "Do plaintiff and defense experts always disagree?",
        answer:
          "No. Opposing life care planners frequently agree on the diagnosis and most categories of need and disagree on specific inputs: whether a given item has a physician recommendation, how often it is needed, which cost source applies, and what life expectancy governs. Transparency on those inputs is the standard of practice.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "FRE_702", "IARP"]),
    related: [
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Life Care Plan Rebuttal", href: "/services/life-care-plan-rebuttal", description: "Review and rebuttal of an opposing life care plan." },
      { title: "Life Expectancy in Life Care Planning", href: "/methods/life-expectancy-in-life-care-planning", description: "How the plan horizon is set and presented." },
      { title: "Present Value Analysis", href: "/methods/present-value-analysis", description: "Discounting future losses to present value." },
    ],
  },
  {
    slug: "life-care-plan-vs-medical-chronology",
    title: "Life Care Plan vs. Medical Chronology",
    dateModified: "2026-04-20",
    a: {
      label: "Life Care Plan",
      summary: "Forward-looking projection of future medical and non-medical care costs across the claimant's [[/tools/life-expectancy|expected lifespan]] (Arias et al., 2025).",
      url: "/methods/life-care-plan-development",
    },
    b: {
      label: "Medical Chronology",
      summary: "Backward-looking organized summary of the claimant's medical history drawn from treatment records.",
    },
    rows: [
      { dimension: "Direction in time", a: "Future (prospective projection)", b: "Past (historical summary)" },
      { dimension: "Primary output", a: "Itemized plan with costs and frequencies", b: "Date-organized narrative summary" },
      { dimension: "Prepared by", a: "CLCP with clinical background", b: "Medical chronologist, often RN" },
      { dimension: "Typical use", a: "Damages quantification", b: "Case understanding, deposition prep, expert support" },
    ],
    whenUseA:
      "Use a life care plan to quantify future care costs for trial, settlement, or mediation in catastrophic injury or chronic disease cases (International Academy of Life Care Planners, 2022).",
    whenUseB:
      "Use a medical chronology to summarize the record for internal review, deposition preparation, or to support other experts preparing opinions.",
    overlap:
      "Both rely on careful record review, and the same clinical record is often the primary source. The life care plan and chronology are complementary: the chronology informs the plan by establishing the clinical trajectory.",
    faqs: [
      {
        question: "Should every catastrophic case have both?",
        answer:
          "Not categorically, but many benefit from both. The chronology is often assembled first and provides the clinical foundation for the life care plan.",
      },
    ],
    sources: refsToSources(["NCHS_LIFE_TABLES", "IARP_IALCP_STANDARDS"]),
    related: [
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Life Expectancy Lookup", href: "/tools/life-expectancy", description: "Look up life expectancy by age." },
      { title: "Certified Life Care Planner (CLCP)", href: "/credentials/clcp", description: "Life care planner certification." },
    ],
  },
  {
    slug: "clcp-vs-case-manager",
    title: "Certified Life Care Planner (CLCP) vs. Case Manager",
    dateModified: "2026-04-20",
    a: {
      label: "Certified Life Care Planner (CLCP)",
      summary: "A credentialed life care planner who [[/methods/life-care-plan-development|projects future medical and non-medical care needs and costs across the lifespan]] for litigation or settlement (International Commission on Health Care Certification, n.d.).",
      url: "/credentials/clcp",
    },
    b: {
      label: "Case Manager",
      summary: "A healthcare professional who coordinates ongoing services, providers, and insurance authorizations to support day-to-day care (Case Management Society of America, 2022; Commission for Case Manager Certification, n.d.).",
    },
    rows: [
      { dimension: "Primary purpose", a: "Forensic projection of future needs", b: "Coordination of current care" },
      { dimension: "Time horizon", a: "Lifetime (expected life expectancy)", b: "Active case period" },
      { dimension: "Output", a: "Written plan with itemized costs", b: "Ongoing service coordination notes" },
      { dimension: "Certification", a: "CLCP via ICHCC, with prior clinical credential", b: "CCM (Commission for Case Manager Certification) or similar" },
      { dimension: "Litigation role", a: "Expert witness", b: "Fact witness (sometimes)" },
      { dimension: "Methodology source", a: "IALCP / IARP standards", b: "Case management standards (CMSA, etc.)" },
    ],
    whenUseA:
      "Retain a CLCP when projecting [[/services/life-care-planning|lifetime care costs for a catastrophic injury]] or chronic condition, typically for trial, mediation, or settlement purposes.",
    whenUseB:
      "Engage a case manager when coordinating active medical care, provider access, or insurance authorizations during the active treatment period.",
    overlap:
      "Both professionals may hold nursing or rehabilitation backgrounds, and CLCPs often have prior case management experience. The distinction is scope and purpose: forensic lifetime projection (CLCP) versus active care coordination (case manager).",
    faqs: [
      {
        question: "Can one person serve as both?",
        answer:
          "The same professional sometimes performs both functions at different times, though it is uncommon within the same case - the treating case manager typically does not serve as the forensic life care planner to preserve independence.",
      },
      {
        question: "Do case managers testify in litigation?",
        answer:
          "Sometimes as fact witnesses regarding coordination they performed. Expert testimony on future needs is generally the life care planner's role.",
      },
    ],
    sources: refsToSources(["ICHCC_CLCP", "CMSA_STANDARDS_2022", "CCMC"]),
    related: [
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development", description: "How a life care plan is researched and costed." },
      { title: "Life Care Planning", href: "/services/life-care-planning", description: "Itemized projection of future care needs and costs." },
      { title: "Life Expectancy Lookup", href: "/tools/life-expectancy", description: "Look up life expectancy by age." },
    ],
  },
  {
    slug: "clcp-vs-cnlcp",
    title: "CLCP vs. CNLCP: Which Life Care Planning Credential?",
    dateModified: "2026-08-26",
    a: {
      label: "Certified Life Care Planner (CLCP)",
      summary: "A multidisciplinary credential open to nurses, rehabilitation counselors, therapists, physicians, and other qualifying clinicians who complete approved training and pass the certification examination (International Commission on Health Care Certification, n.d.).",
      url: "/credentials/clcp",
    },
    b: {
      label: "Certified Nurse Life Care Planner (CNLCP)",
      summary: "A nursing-specific credential for registered nurses who practice life care planning through the nursing process, administered by the CNLCP Certification Board and affiliated with the American Association of Nurse Life Care Planners (American Association of Nurse Life Care Planners, n.d.).",
      url: "/credentials/cnlcp",
    },
    rows: [
      { dimension: "Eligible base license", a: "RN, CRC, OT, PT, MD, and other qualifying clinical credentials", b: "Registered nurse only" },
      { dimension: "Issuing body", a: "ICHCC", b: "CNLCP Certification Board (affiliated with AANLCP)" },
      { dimension: "Practice framework", a: "IALCP Standards of Practice", b: "Nursing process plus AANLCP scope and standards; IALCP standards are also widely followed" },
      { dimension: "Methodology", a: "Same: records, treating-team foundation, frequency and duration, documented cost research", b: "Same" },
      { dimension: "Typical strength", a: "Breadth of clinical backgrounds on a planning team", b: "Nursing assessment, medication and skilled-care detail" },
      { dimension: "Litigation role", a: "Expert witness", b: "Expert witness" },
    ],
    whenUseA:
      "Either credential is appropriate for a [[/services/life-care-planning|life care plan]]. A CLCP with a rehabilitation or therapy background may be a natural fit where equipment, mobility, and community reintegration dominate the plan.",
    whenUseB:
      "A CNLCP may be a natural fit where skilled nursing, medication management, wound or ventilator care, and complex medical oversight dominate, as in many [[/case-types/spinal-cord-injury|high-level spinal cord injury]] or [[/case-types/birth-injury|birth injury]] plans.",
    overlap:
      "Both credentials require a clinical license, approved coursework, and an examination, and both planners follow the same core [[/methods/life-care-plan-development|methodology]]. Many planners hold both. Courts qualify experts on training and experience rather than on which of the two letters follows the name, so the better question is whether the planner's clinical background matches the evaluee's needs.",
    faqs: [
      {
        question: "Is one credential more admissible than the other?",
        answer:
          "No. Admissibility turns on the planner's qualifications, methodology, and foundation, not on which certifying body issued the credential. Both are recognized in the field.",
      },
      {
        question: "Can a physician be a life care planner?",
        answer:
          "Yes. Physicians are eligible for the CLCP, and a physician planner can supply parts of the medical foundation directly. KW Life Care Planning pairs physician review with nurse and rehabilitation planners on complex cases.",
      },
      {
        question: "Does the credential change how the plan is priced?",
        answer:
          "No. Cost research follows the same standards regardless of credential: geographically matched sources, documented quotes, and a stated basis for each unit cost.",
      },
    ],
    sources: refsToSources(["ICHCC_CLCP", "AANLCP_SCOPE", "IARP_IALCP_STANDARDS"]),
    related: [
      { title: "CLCP Certification", href: "/credentials/clcp", description: "Eligibility and scope of the Certified Life Care Planner credential." },
      { title: "CNLCP Certification", href: "/credentials/cnlcp", description: "The nurse life care planner credential." },
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development", description: "How a life care plan is researched and costed." },
    ],
  },
  {
    slug: "life-care-plan-vs-msa",
    title: "Life Care Plan vs. Medicare Set-Aside Allocation",
    dateModified: "2026-08-26",
    a: {
      label: "Life Care Plan",
      summary: "A comprehensive projection of all injury-related future medical and non-medical needs and their cost across the [[/methods/life-expectancy-in-life-care-planning|expected lifespan]], prepared for litigation, mediation, or settlement (International Academy of Life Care Planners, 2022).",
      url: "/services/life-care-planning",
    },
    b: {
      label: "Medicare Set-Aside (MSA) Allocation",
      summary: "An estimate of the portion of a settlement to reserve for future injury-related care that Medicare would otherwise pay, prepared under [[/methods/msa-allocation-methodology|Medicare's review guidance]] (Centers for Medicare & Medicaid Services, 2026).",
      url: "/services/medicare-set-aside",
    },
    rows: [
      { dimension: "Purpose", a: "Quantify the full cost of future care as damages", b: "Protect Medicare's interest when a settlement closes future medical" },
      { dimension: "Audience", a: "Trier of fact, mediator, adjuster", b: "Settling parties, CMS reviewer, professional administrator" },
      { dimension: "Scope", a: "All injury-related needs, medical and non-medical", b: "Medicare-covered, injury-related items only" },
      { dimension: "Pricing basis", a: "Cost of care in the evaluee's market, documented per item", b: "Fee schedule or usual-and-customary per Medicare guidance" },
      { dimension: "Horizon", a: "Population life expectancy unless a physician adjusts it", b: "Life expectancy or an underwriter's rated age" },
      { dimension: "Typical size", a: "Larger", b: "Smaller; a subset of the plan" },
    ],
    whenUseA:
      "Prepare a life care plan whenever future care is a significant component of damages in a [[/case-types/personal-injury|personal injury]], malpractice, or catastrophic injury matter, whether the case is headed to trial or settlement.",
    whenUseB:
      "Prepare an MSA allocation when a [[/case-types/workers-compensation|workers' compensation]] or liability settlement involves a Medicare beneficiary or someone with a reasonable expectation of enrollment and the settlement releases future medical care.",
    overlap:
      "Both start from the same medical record and the same treating-team recommendations, and the same planner can prepare both. The allocation is best understood as a carve-out from the plan: the subset of items Medicare would cover, priced the way Medicare's guidance expects. Many catastrophic workers' compensation cases need both, and preparing them from a single record review keeps the two documents consistent.",
    faqs: [
      {
        question: "Can the MSA simply be the life care plan total?",
        answer:
          "No. The plan includes care Medicare does not cover and prices items at market cost rather than fee schedule. Using the plan total as the set-aside overstates the reserve and does not follow Medicare's guidance.",
      },
      {
        question: "Does every settlement with a Medicare beneficiary need an MSA?",
        answer:
          "Medicare's interests must be considered whenever future medical care is released. Whether a formal allocation is prepared, and whether it is submitted for review, depends on the settlement amount, the beneficiary's status, and counsel's judgment.",
      },
      {
        question: "Which comes first?",
        answer:
          "Usually the life care plan, because it establishes the complete inventory of future needs. The allocation is then derived from that inventory by removing non-covered and unrelated items and re-pricing what remains.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "CMS_WCMSA_GUIDE", "CMS_WCMSA"]),
    related: [
      { title: "Medicare Set-Aside Allocations", href: "/services/medicare-set-aside", description: "MSA allocation service for settling parties." },
      { title: "MSA Allocation Methodology", href: "/methods/msa-allocation-methodology", description: "How an allocation is built and priced." },
      { title: "Life Care Plan vs. Medicare Set-Aside (guide)", href: "/guides/life-care-plan-vs-medicare-set-aside", description: "Longer treatment of purpose, audience, and when both are needed." },
    ],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}
