import type { Faq, Source } from "./types";
import { refsToSources } from "./references";

export interface Methodology {
  slug: string;
  name: string;
  summary: string;
  whenUsed: string;
  steps: string[];
  dataSources: string[];
  limitations: string;
  admissibilityHistory: string;
  relevantServices: string[];
  faqs: Faq[];
  sources: Source[];
}

export const methods: Methodology[] = [
  {
    slug: "transferable-skills-analysis",
    name: "Transferable Skills Analysis",
    summary:
      "Transferable skills analysis (TSA) is a vocational methodology that identifies occupations a person could perform based on skills developed in past work, applied to current medical and functional restrictions and labor market conditions.",
    whenUsed:
      "TSA is used in [[/guides/earning-capacity-vs-lost-earnings|earning capacity analysis]], return-to-work planning, employability opinions in LTD matters, and [[/services/life-care-planning|post-injury vocational evaluation]].",
    steps: [
      "Document the individual's complete work history with DOT or O*NET job codes and SVP (specific vocational preparation) levels",
      "Identify skills, work fields, and Materials-Products-Subject Matter-Services (MPSMS) codes from prior occupations",
      "Apply current medical restrictions and functional capacity data",
      "Search DOT/O*NET for occupations matching retained skills within tolerated physical and cognitive demands",
      "Filter results for labor market viability in the relevant geographic area using BLS OEWS (Occupational Employment and Wage Statistics) wage and employment data",
      "Produce a list of occupations with SOC codes, wage data, and transferability logic",
    ],
    dataSources: [
      "Dictionary of Occupational Titles (DOT)",
      "O*NET OnLine",
      "BLS Occupational Employment and Wage Statistics",
      "Standard Occupational Classification (SOC) system",
      "Skills inventories from published vocational references",
    ],
    limitations:
      "[[/guides/what-is-transferable-skills-analysis|TSA]] reflects theoretical transferability at a moment in time. It does not guarantee placement; job availability, hiring practices, and regional demand still apply. Older DOT data has known age-of-information limitations that practitioners address by cross-referencing with [[/methods/onet-analysis|O*NET]].",
    admissibilityHistory:
      "TSA is a widely used vocational methodology in federal and state courts when properly documented and sourced (20 C.F.R. sec. 404.1568; Truthan & Karman, 2003).",
    relevantServices: ["life-care-planning"],
    faqs: [
      {
        question: "Is DOT data still valid given its age?",
        answer:
          "The DOT's physical demands and SVP ratings remain widely used, with O*NET data applied for updated occupational information. Best practice is to cross-reference both systems.",
      },
      {
        question: "How does a TSA differ from a labor market survey?",
        answer:
          "TSA identifies occupations for which the person's skills transfer. A labor market survey tests whether those occupations exist in hireable form within the relevant labor market.",
      },
      {
        question: "What is an SVP level?",
        answer:
          "SVP (specific vocational preparation) is a DOT-based measure of the time required to learn a job (U.S. Department of Labor, 1991), ranging from 1 (short demonstration) to 9 (over 10 years). SVP influences transferability between occupations.",
      },
    ],
    sources: refsToSources([
      "ONET",
      "CFR_404_1568",
      "TRUTHAN_KARMAN_2003",
      "BLS_OEWS",
      "DOT",
    ]),
  },
  {
    slug: "labor-market-survey",
    name: "Labor Market Survey",
    summary:
      "A labor market survey (LMS) documents the availability of specific occupations in the claimant's relevant labor market, typically including wage ranges, employer names, and openings.",
    whenUsed:
      "LMS is used to translate theoretical transferability into actual [[/services/life-care-planning|occupational availability]] in the claimant's geographic area.",
    steps: [
      "Define the relevant labor market geographically (commute radius, metro area)",
      "Select target occupations from the [[/methods/transferable-skills-analysis|TSA results]]",
      "Contact local employers, review job postings, and compile representative openings",
      "Document wage ranges, hiring requirements, and essential job functions",
      "Compare employer requirements with the claimant's documented restrictions and skills",
      "Produce a report with employer contacts, date of inquiry, and results",
    ],
    dataSources: [
      "Employer-direct inquiries",
      "BLS Occupational Employment and Wage Statistics",
      "State labor market information offices",
      "Online job boards (Indeed, LinkedIn, ZipRecruiter, etc.)",
      "Industry trade publications",
    ],
    limitations:
      "Survey results reflect market conditions at a point in time. Turnover, hiring freezes, and seasonal variation can affect later availability. Documentation of the survey date and geographic scope is therefore essential.",
    admissibilityHistory:
      "Well-documented LMS evidence has been widely accepted. Courts may exclude LMS that is anecdotal, stale, or not grounded in the relevant geographic labor market (Daubert v. Merrell Dow Pharmaceuticals, Inc., 509 U.S. 579 (1993)).",
    relevantServices: ["life-care-planning"],
    faqs: [
      {
        question: "How far does the 'relevant labor market' extend?",
        answer:
          "The labor market is typically defined by a reasonable commute from the claimant's residence, often the metropolitan statistical area. Specific standards vary by jurisdiction and case context.",
      },
      {
        question: "Is a labor market survey required for every vocational opinion?",
        answer:
          "Not always. LMS is particularly important when employability in the relevant market is contested or when TSA-identified occupations must be shown to exist locally.",
      },
    ],
    sources: refsToSources([
      "DAUBERT",
      "BLS_LAUS",
      "BLS_OEWS",
    ]),
  },
  {
    slug: "worklife-expectancy",
    name: "Worklife Expectancy",
    summary:
      "Worklife expectancy is the number of additional years a person of a given age, sex, education, and labor force status is expected to be economically active. Published tables are used to bound future earnings projections.",
    whenUsed:
      "Worklife expectancy is used in virtually every [[/services/forensic-economics|forensic economic analysis]] of lost earnings or earning capacity, and in [[/case-types/wrongful-death|wrongful death matters]] to project the decedent's expected work years.",
    steps: [
      "Identify the claimant's current age, sex, education, and labor force status",
      "Select an appropriate published worklife table (e.g., Skoog-Ciecka-Krueger)",
      "Apply the active-to-inactive transition probabilities to the projection horizon",
      "Where injury severity is documented, consider published adjustments for reduced worklife",
    ],
    dataSources: [
      "Skoog-Ciecka-Krueger worklife tables",
      "BLS Current Population Survey",
      "Markov-process worklife literature",
      "Severity-specific worklife literature (spinal cord injury (SCI), traumatic brain injury (TBI), etc.)",
    ],
    limitations:
      "[[/guides/worklife-expectancy-explained|Worklife tables]] reflect average transitions across the population and may not capture case-specific factors such as unusual health status, industry-specific retirement patterns, or late-career skill obsolescence.",
    admissibilityHistory:
      "The Skoog-Ciecka-Krueger tables and predecessors are widely accepted in forensic economics (Skoog et al., 2011).",
    relevantServices: ["forensic-economics"],
    faqs: [
      {
        question: "What is a Markov worklife model?",
        answer:
          "A Markov model projects transitions between active and inactive labor force states using probabilities derived from population data, yielding expected active and inactive years rather than a single retirement age.",
      },
      {
        question: "Are worklife tables specific to education?",
        answer:
          "Yes. Skoog-Ciecka-Krueger tables are stratified by education, sex, age, and labor force status, reflecting observed differences in worklife patterns.",
      },
    ],
    sources: refsToSources([
      "SKOOG_CIECKA_KRUEGER_2011",
      "BLS_CPS",
    ]),
  },
  {
    slug: "present-value-analysis",
    name: "Present Value Analysis",
    summary:
      "Present value analysis reduces a projected stream of future damages to a single lump sum equivalent in today's dollars, accounting for the time value of money and expected growth of the underlying cash flows.",
    whenUsed:
      "Present value analysis is used to express future lost earnings, [[/services/life-care-planning|lost household services]], and future medical/non-medical care in a [[/compare/lump-sum-vs-present-value|single lump sum]] for trial or settlement purposes.",
    steps: [
      "Project the nominal cash flow stream (wages, benefits, [[/services/life-care-planning|care costs]]) over the relevant horizon",
      "Select a discount rate (often Treasury-based) matched to the horizon",
      "Apply expected growth rates or a net discount rate to the projection",
      "Compute the [[/white-papers/present-value-future-losses|present value]] by discounting each period back to the valuation date",
      "Document all assumptions so alternative calculations can be performed",
    ],
    dataSources: [
      "U.S. Treasury yield curves",
      "BLS Employment Cost Index",
      "Historical wage growth series",
      "BLS Consumer Price Index, Medical Care component, for healthcare costs",
    ],
    limitations:
      "Results are sensitive to the discount rate, growth rate, and horizon assumptions. Sensitivity analysis is a standard practice in forensic economics.",
    admissibilityHistory:
      "Present value methodology is fundamental to [[/services/forensic-economics|forensic economics]] and well accepted (Jones & Laughlin Steel Corp. v. Pfeifer, 462 U.S. 523 (1983)). Disputes are typically over input choices rather than methodology.",
    relevantServices: ["forensic-economics"],
    faqs: [
      {
        question: "What is a net discount rate?",
        answer:
          "The net discount rate is the difference between the discount rate and the growth rate, often applied in a single step to simplify present value computation when the two rates move together.",
      },
      {
        question: "How does jurisdiction affect discount rate selection?",
        answer:
          "Some jurisdictions specify a discount rate by statute or case law (e.g., Pennsylvania's 'total offset' approach; Kaczkowski v. Bolubasz, 491 Pa. 561 (1980)). Jurisdictional rules should be identified early.",
      },
    ],
    sources: refsToSources([
      "JONES_LAUGHLIN_PFEIFER",
      "KACZKOWSKI_V_BOLUBASZ",
      "BLS_CPI_MEDICAL",
      "BLS_ECI",
      "TREASURY_YIELD",
    ]),
  },
  {
    slug: "hedonic-damages",
    name: "Hedonic Damages",
    summary:
      "Hedonic damages refer to the economic value of loss of enjoyment of life, distinct from economic earnings loss. Methodology and admissibility vary by jurisdiction.",
    whenUsed:
      "Hedonic damages analyses are offered in jurisdictions that permit them. Many jurisdictions permit generalized loss-of-enjoyment-of-life testimony but exclude dollar quantification.",
    steps: [
      "Identify jurisdiction-specific admissibility rules",
      "When permitted, apply value-of-statistical-life (VSL) literature (Viscusi & Aldy, 2003) with appropriate adjustments",
      "Document the methodology, base data, and case-specific adjustments",
    ],
    dataSources: [
      "VSL literature (EPA, DOT Federal guidance on VSL)",
      "Peer-reviewed labor market and contingent valuation studies",
    ],
    limitations:
      "[[/guides/hedonic-damages-explained|Hedonic damages]] are often excluded at the quantification stage. Even where permitted, the methodology is subject to [[/guides/federal-vs-state-court-daubert|substantial admissibility scrutiny]].",
    admissibilityHistory:
      "Admissibility is jurisdiction-dependent and often limited. Courts frequently exclude dollar quantification (Mercado v. Ahmed, 974 F.2d 863 (7th Cir. 1992)) while permitting qualitative testimony on loss of enjoyment of life.",
    relevantServices: ["forensic-economics"],
    faqs: [
      {
        question: "Are hedonic damages admissible in federal court?",
        answer:
          "Federal courts have varied substantially, and many exclude hedonic damages quantification. Jurisdiction-specific research is required before relying on this methodology.",
      },
    ],
    sources: refsToSources([
      "MERCADO_V_AHMED",
      "EPA_VSL",
      "VISCUSI_ALDY_2003",
    ]),
  },
  {
    slug: "collateral-source",
    name: "Collateral Source Analysis",
    summary:
      "Collateral source analysis addresses the effect of insurance, public benefits, or third-party payments on damages, depending on the jurisdiction's collateral source rule.",
    whenUsed:
      "[[/guides/collateral-source-rule-explained|Collateral source analysis]] is used where jurisdictional rules permit or require offsets for insurance or benefit payments related to the injury.",
    steps: [
      "Identify jurisdictional collateral source rules (traditional, modified, or statutory offset)",
      "Catalog relevant collateral payments (private health insurance, Medicare, Medicaid, [[/case-types/long-term-disability|LTD]], [[/case-types/workers-compensation|workers' compensation]])",
      "Compute [[/services/forensic-economics|net damages]] in compliance with jurisdictional rules",
    ],
    dataSources: [
      "Jurisdictional statutes and case law",
      "Actual insurance benefit records",
      "CMS Medicare Secondary Payer Act guidance (42 U.S.C. sec. 1395y(b)) where applicable",
    ],
    limitations:
      "Rules vary substantially by jurisdiction. Misapplication can lead to admissibility issues or reversal on appeal.",
    admissibilityHistory:
      "Collateral source admissibility is largely governed by jurisdictional rules rather than methodology disputes.",
    relevantServices: ["forensic-economics"],
    faqs: [
      {
        question: "What is the traditional collateral source rule?",
        answer:
          "The traditional rule prevents a tortfeasor from benefiting from compensation the plaintiff received from independent sources such as insurance (Restatement (Second) of Torts sec. 920A (1979)). Many jurisdictions have modified or abrogated this rule by statute.",
      },
    ],
    sources: refsToSources([
      "CMS_MSP",
      "MSP_1395Y",
      "RESTATEMENT_TORTS_920A",
    ]),
  },
  {
    slug: "dictionary-of-occupational-titles",
    name: "Dictionary of Occupational Titles",
    summary:
      "The Dictionary of Occupational Titles (DOT) is a U.S. Department of Labor reference that classifies over 12,000 occupations (U.S. Department of Labor, 1991) by title, code, physical demands, working conditions, and specific vocational preparation (SVP).",
    whenUsed:
      "DOT remains a core reference in [[/services/life-care-planning|vocational evaluation]], [[/guides/ssa-disability-and-vocational-evidence|Social Security disability determinations]], and transferable skills analysis.",
    steps: [
      "Identify the DOT code for the occupation at issue",
      "Review the strength rating, physical demands, environmental conditions, and SVP",
      "Cross-reference with [[/methods/onet-analysis|O*NET]] for updated occupational information",
      "Apply restrictions to determine suitability",
    ],
    dataSources: [
      "DOT (published 1991, selected supplements)",
      "SCODDOT (Selected Characteristics of Occupations Defined in the DOT)",
    ],
    limitations:
      "The DOT has not been comprehensively updated since 1991. Best practice is to cross-reference with O*NET, particularly for newer occupations.",
    admissibilityHistory:
      "DOT-grounded opinions are widely accepted, with courts often expecting cross-referencing with O*NET where appropriate.",
    relevantServices: ["life-care-planning"],
    faqs: [
      {
        question: "Why is the DOT still used if it is not current?",
        answer:
          "DOT remains the standard reference for SSA disability adjudication and retains detailed physical demand and SVP information not fully replicated in O*NET.",
      },
    ],
    sources: refsToSources([
      "ONET",
      "SSA_POMS",
      "DOT",
      "SCODDOT",
    ]),
  },
  {
    slug: "onet-analysis",
    name: "O*NET Analysis",
    summary:
      "O*NET OnLine is the U.S. Department of Labor's successor to the DOT (National Center for O*NET Development, n.d.), providing continuously updated information on occupational tasks, skills, knowledge, abilities, work activities, and labor market statistics.",
    whenUsed:
      "O*NET is used alongside [[/methods/dictionary-of-occupational-titles|the DOT]] for current occupational information, particularly for newer occupations or when task-level detail is required.",
    steps: [
      "Search O*NET for the SOC code or occupation title",
      "Review tasks, skills, work activities, work context, and job zone",
      "Apply to the individual's restrictions and background",
      "Supplement with BLS OEWS (Occupational Employment and Wage Statistics) data for wages",
    ],
    dataSources: [
      "O*NET database (regularly updated)",
      "BLS SOC-crosswalked wage data",
    ],
    limitations:
      "O*NET descriptors differ from DOT in granularity; cross-referencing is necessary when DOT-style physical demand detail is required.",
    admissibilityHistory:
      "O*NET-based [[/services/life-care-planning|vocational analyses]] are widely accepted.",
    relevantServices: ["life-care-planning"],
    faqs: [
      {
        question: "How does O*NET differ from DOT in practical use?",
        answer:
          "O*NET is task and skill oriented and updated regularly. DOT is position oriented with stronger physical demand detail. Combining both yields a complete occupational profile.",
      },
    ],
    sources: refsToSources([
      "ONET",
      "BLS_OEWS",
    ]),
  },
  {
    slug: "life-care-plan-development",
    name: "Life Care Plan Development",
    summary:
      "Life care plan development is a structured process that translates treating-team recommendations, peer-reviewed literature, and geographically matched cost data into a comprehensive projection of future medical and non-medical care needs.",
    whenUsed:
      "Life care planning is used in catastrophic injury, [[/case-types/medical-malpractice|medical malpractice]], and chronic disease cases to quantify [[/methods/present-value-analysis|future care costs]] for trial or settlement purposes.",
    steps: [
      "Review medical records and collaborate with treating team",
      "Interview and, where appropriate, examine the evaluee",
      "Identify [[/guides/what-is-life-care-plan|categories of care]] (routine medical, therapies, durable medical equipment (DME), home modifications, attendant care, etc.)",
      "Determine frequency and duration for each item based on physician recommendation and peer-reviewed literature (Weed & Berens, 2018)",
      "Obtain geographically matched costs from local providers and published rate schedules",
      "Compile the plan with itemized projections and total annualized cost",
    ],
    dataSources: [
      "Treating physician recommendations",
      "IALCP / IARP life care planning standards",
      "Peer-reviewed duration and frequency literature",
      "Local provider cost quotations",
      "Published rate databases (Medicare, usual-and-customary compilations)",
    ],
    limitations:
      "Life care plans reflect the best projection at a point in time. Costs, providers, and medical recommendations can change, which is why plans are typically updated periodically.",
    admissibilityHistory:
      "[[/services/life-care-planning|Life care planning]] methodology following IALCP / IARP standards (International Academy of Life Care Planners, 2022) is widely accepted when grounded in physician recommendations and documented cost data.",
    relevantServices: ["life-care-planning"],
    faqs: [
      {
        question: "Does every item in a life care plan require a physician recommendation?",
        answer:
          "Items within the scope of medical practice require physician support. Some non-medical items (e.g., home modifications) can be recommended by an appropriately credentialed planner or allied professional within scope.",
      },
      {
        question: "How often should life care plans be updated?",
        answer:
          "Plans should be updated when medical status materially changes or when significant time has elapsed. There is no fixed interval; updating is context-driven.",
      },
    ],
    sources: refsToSources([
      "CMS_PFS",
      "IARP_IALCP_STANDARDS",
      "WEED_BERENS",
    ]),
  },
  {
    slug: "functional-capacity-evaluation",
    name: "Functional Capacity Evaluation",
    summary:
      "A functional capacity evaluation (FCE) is a standardized assessment of a person's physical capacity to perform work-related activities, typically conducted by an occupational or physical therapist over one or two days.",
    whenUsed:
      "FCEs are used to establish [[/compare/work-capacity-evaluation-vs-fce|return-to-work capacity]], permanent restrictions, and as a foundation for [[/services/life-care-planning|vocational opinion on employability]].",
    steps: [
      "Obtain referral and medical records",
      "Perform intake interview, vital signs, pain and symptom baseline",
      "Administer standardized physical tests (lifting, carrying, reaching, sitting/standing tolerance, etc.)",
      "Document effort, consistency, and reliability measures",
      "Report safe maximum demonstrated capacities in [[/methods/dictionary-of-occupational-titles|DOT/SSA terminology]]",
    ],
    dataSources: [
      "Standardized FCE systems (ErgoScience, WorkWell, Isernhagen, Matheson, etc.)",
      "DOT physical demand terminology",
      "SSA evidentiary guidelines",
    ],
    limitations:
      "[[/compare/fce-vs-ime|FCE results]] depend on examinee effort and consistency; reliability measures are included to identify submaximal effort. Results reflect capacity on the day of testing.",
    admissibilityHistory:
      "Standardized FCEs are broadly accepted when administered by qualified evaluators using validated protocols (King et al., 1998).",
    relevantServices: ["life-care-planning"],
    faqs: [
      {
        question: "How long does an FCE take?",
        answer:
          "Most FCE protocols run 4-8 hours over one or two days, depending on the system and the referral question.",
      },
      {
        question: "How do effort and consistency measures work?",
        answer:
          "Protocols include heart rate response, coefficient of variation across repeated tests, and observed behavior consistency (Genovese & Galper, 2009). Submaximal effort is documented so the report makes clear what the evaluee demonstrated rather than what they may have been able to do.",
      },
    ],
    sources: refsToSources([
      "GENOVESE_GALPER_2009",
      "KING_ET_AL_1998",
      "SSA_POMS",
    ]),
  },
];

export function getMethod(slug: string): Methodology | undefined {
  return methods.find((m) => m.slug === slug);
}
