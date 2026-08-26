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
    slug: "life-expectancy-in-life-care-planning",
    name: "Life Expectancy in Life Care Planning",
    summary:
      "Life expectancy sets the horizon of a life care plan: how many years each recurring item is carried and how many replacement cycles each piece of equipment gets. The planner starts from published population life tables and applies any condition-specific adjustment only when a qualified physician supports it.",
    whenUsed:
      "Every [[/services/life-care-planning|life care plan]] and [[/services/medical-cost-projection|medical cost projection]] states the horizon over which costs are projected. The question is contested most often in [[/case-types/spinal-cord-injury|spinal cord injury]], [[/case-types/traumatic-brain-injury|severe brain injury]], and [[/case-types/cerebral-palsy|cerebral palsy]] cases, where the defense may argue for a shortened expectancy and the plaintiff for population norms.",
    steps: [
      "Identify the evaluee's current age and sex and look up the remaining life expectancy in the current published United States life tables",
      "Review the record for any physician opinion that the condition, its severity, or its complications alter expectancy, and for any rated age issued for settlement purposes",
      "Where a reduced expectancy is supported, document the source, the reasoning, and the resulting horizon; where it is not, carry population expectancy and say so",
      "Apply the chosen horizon consistently to every recurring item and to each equipment replacement schedule",
      "Where the parties dispute expectancy, present the plan at each proposed horizon so the trier of fact can see the cost consequence of the medical dispute",
    ],
    dataSources: [
      "National Center for Health Statistics United States life tables (current vintage)",
      "Treating or evaluating physician opinion on condition-specific expectancy",
      "Peer-reviewed survival literature for the diagnosis (used to inform physician opinion, not to replace it)",
      "Rated-age determinations from life insurance underwriters when a settlement or set-aside requires one",
    ],
    limitations:
      "A life table is a population average. A life care planner is not qualified to shorten or lengthen the evaluee's expectancy on the planner's own authority; any departure from the published table must rest on a physician's opinion in the record. Expectancy also changes as the person ages and as treatment evolves, which is one reason a [[/services/plan-update-and-review|plan update]] restates the horizon.",
    admissibilityHistory:
      "Reliance on published government life tables is routine and rarely challenged. Disputes concern the adjustment: whether the physician who reduced expectancy had a sufficient basis, and whether the planner presented the [[/guides/how-to-rebut-a-life-care-plan|alternative horizons]] transparently.",
    relevantServices: ["life-care-planning", "catastrophic-injury-planning", "medical-cost-projection"],
    faqs: [
      {
        question: "Does a life care planner decide the evaluee's life expectancy?",
        answer:
          "No. The planner adopts the published population figure unless a qualified physician has opined that the condition changes it. The planner documents which basis was used and, where the record contains competing opinions, may present the plan at more than one horizon.",
      },
      {
        question: "What is a rated age?",
        answer:
          "A rated age is an underwriter's estimate of the age a person's health profile corresponds to for annuity pricing. It is used in structured settlements and Medicare set-aside allocations. It is a pricing device, not a medical opinion, and a life care plan for litigation does not rely on it for the plan horizon.",
      },
      {
        question: "How does the horizon interact with equipment replacement?",
        answer:
          "Each item with a replacement interval is carried for the number of cycles that fit within the horizon. A wheelchair replaced every five years over a forty-year horizon appears eight times; over a twenty-year horizon, four. The horizon therefore drives the total even for one-time and periodic items.",
      },
    ],
    sources: refsToSources([
      "NCHS_LIFE_TABLES",
      "CDC_LIFE_TABLES",
      "IARP_IALCP_STANDARDS",
    ]),
  },
  {
    slug: "present-value-analysis",
    name: "Present Value Analysis",
    summary:
      "Present value analysis reduces a projected stream of future damages to a single lump sum equivalent in today's dollars, accounting for the time value of money and expected growth of the underlying cash flows.",
    whenUsed:
      "Present value analysis is used to express the future medical and non-medical care in a [[/services/life-care-planning|life care plan]] or [[/services/medical-cost-projection|medical cost projection]] as a single lump sum for trial or settlement purposes. The life care planner produces the year-by-year cost stream; the economist discounts it.",
    steps: [
      "Take the itemized annual [[/services/life-care-planning|care costs]] from the plan over the plan's [[/methods/life-expectancy-in-life-care-planning|life expectancy horizon]]",
      "Select a discount rate (often Treasury-based) matched to the horizon",
      "Apply expected growth rates or a net discount rate to the projection",
      "Compute the present value by discounting each period back to the valuation date",
      "Document all assumptions so alternative calculations can be performed",
    ],
    dataSources: [
      "U.S. Treasury yield curves",
      "BLS Consumer Price Index, Medical Care component, for healthcare cost growth",
      "The life care plan's itemized cost schedule and stated horizon",
    ],
    limitations:
      "Results are sensitive to the discount rate, the medical cost growth rate, and the plan horizon. Sensitivity analysis is a standard practice. The planner and the economist should use the same horizon and the same item schedule so the two reports reconcile line by line.",
    admissibilityHistory:
      "Present value methodology is well accepted for future care damages (Jones & Laughlin Steel Corp. v. Pfeifer, 1983). Disputes are typically over input choices rather than methodology. KW Life Care Planning does not perform the discounting; the plan is handed to a forensic economist for that step.",
    relevantServices: ["life-care-planning", "medical-cost-projection"],
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
      "TREASURY_YIELD",
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
      "In life care planning, an FCE documents what the evaluee can physically do and sustain. The planner uses it to support attendant care hours, the need for adaptive equipment and [[/guides/home-modification-and-equipment-costing|home modification]], and restrictions relevant to [[/services/workers-compensation-lcp|workers' compensation]] plans. It is compared with an IME in [[/compare/fce-vs-ime|FCE vs. IME]].",
    steps: [
      "Obtain referral and medical records",
      "Perform intake interview, vital signs, pain and symptom baseline",
      "Administer standardized physical tests (lifting, carrying, reaching, sitting/standing tolerance, etc.)",
      "Document effort, consistency, and reliability measures",
      "Report safe maximum demonstrated capacities in standardized physical demand terms (lifting, carrying, sitting, standing, walking tolerances)",
    ],
    dataSources: [
      "Standardized FCE systems (ErgoScience, WorkWell, Isernhagen, Matheson, etc.)",
      "Standardized physical demand classifications",
      "Occupational therapy practice framework for activity and participation",
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
      "AOTA_OTPF_2020",
    ]),
  },
  {
    slug: "cost-research-methodology",
    name: "Cost Research Methodology",
    summary:
      "Cost research is the process by which each item in a life care plan receives a unit price that reflects what the care actually costs where the evaluee lives. It combines geographically matched pricing sources, direct provider and vendor quotes, and documentation sufficient for another planner to reproduce the figure.",
    whenUsed:
      "Every [[/services/life-care-planning|life care plan]] and [[/services/medical-cost-projection|medical cost projection]] rests on cost research. It is scrutinized most closely on high-dollar items: attendant care, residential placement, surgical revisions, and durable equipment with short replacement cycles. It is also the first place a [[/services/life-care-plan-rebuttal|rebuttal reviewer]] looks.",
    steps: [
      "Define each item precisely enough to price: the service or product, the setting, the level of provider, the quantity, and the frequency",
      "Identify the geographic market in which the care will be delivered, which is usually where the evaluee lives, not where the planner practices",
      "Select a pricing basis appropriate to the item: provider and vendor quotes, recognized usual-and-customary charge data, published fee schedules, or facility rate sheets",
      "Collect at least one quote or data point per item and, for significant items, more than one, recording the source, contact, date, and any assumptions",
      "Reconcile the sources into a stated unit cost, explaining any choice among divergent figures",
      "Record the research in the plan or its work file so that each cost can be traced and re-priced at a [[/services/plan-update-and-review|later update]]",
    ],
    dataSources: [
      "Direct quotes from local providers, home care agencies, vendors, and facilities",
      "Usual-and-customary charge compilations keyed to the evaluee's geographic area",
      "Published fee schedules, including the Medicare physician fee schedule as a reference point",
      "Manufacturer and supplier list pricing for equipment and supplies",
      "State rate schedules for attendant care and residential services where applicable",
    ],
    limitations:
      "Prices vary by payer, setting, and provider, and a quote is a snapshot. A plan that mixes charge data with paid-amount data without explanation, or that prices care in the wrong market, is vulnerable. Costs are refreshed at each plan update, which is why the [[/guides/how-a-life-care-plan-is-priced|plan states the research date]] for each item.",
    admissibilityHistory:
      "Documented, geographically matched cost research following the [[/methods/life-care-plan-development|IALCP standards]] is widely accepted (International Academy of Life Care Planners, 2022). Challenges succeed when the source of a price cannot be identified or when the planner cannot explain why one figure was chosen over another.",
    relevantServices: ["life-care-planning", "medical-cost-projection", "catastrophic-injury-planning"],
    faqs: [
      {
        question: "Should a life care plan use billed charges or amounts actually paid?",
        answer:
          "It depends on the jurisdiction's rules on the measure of medical damages and on what the evaluee will actually face. The planner should state which basis was used for each category and why, so counsel can align the plan with the governing rule.",
      },
      {
        question: "How many quotes does an item need?",
        answer:
          "There is no fixed number. One documented source may suffice for a low-cost, standardized item; significant or unusual items warrant several sources and a reconciliation. What matters is that the basis is recorded and reproducible.",
      },
      {
        question: "Why not use a national average?",
        answer:
          "A national average may bear no relationship to the price of care in the evaluee's community. The standard is the cost of care in the relevant geographic market, and a plan should say what market that is.",
      },
    ],
    sources: refsToSources([
      "IARP_IALCP_STANDARDS",
      "CMS_PFS",
      "FAIR_HEALTH",
      "WEED_BERENS",
    ]),
  },
  {
    slug: "msa-allocation-methodology",
    name: "Medicare Set-Aside Allocation Methodology",
    summary:
      "A Medicare set-aside allocation estimates the portion of a settlement that should be reserved for future injury-related care that Medicare would otherwise cover. The allocation is narrower than a life care plan in scope, priced on a fee-schedule basis, and prepared with Medicare's review process in mind.",
    whenUsed:
      "An allocation is prepared when a [[/case-types/workers-compensation|workers' compensation]] or liability settlement involves a Medicare beneficiary or a person with a reasonable expectation of enrollment and the settlement closes out future medical care. It is compared with a life care plan in [[/compare/life-care-plan-vs-msa|life care plan vs. MSA]].",
    steps: [
      "Confirm the evaluee's Medicare entitlement status or reasonable expectation of entitlement, and whether the settlement meets the thresholds for voluntary CMS review",
      "Review the medical and payment records to identify injury-related, Medicare-covered future care recommended by treating providers",
      "Separate covered from non-covered items and injury-related from unrelated care; non-covered items such as most home modifications fall outside the allocation",
      "Price each item on a fee-schedule or usual-and-customary basis appropriate to the jurisdiction and Medicare's review guidance",
      "Apply life expectancy, or a rated age where one has been obtained, to carry each item across the allocation period",
      "Address prescription drugs separately, and document the funding method (lump sum or structured annuity with seed money)",
      "Prepare the allocation report with the supporting records so it can be submitted for review or retained in the settlement file, and address professional administration where appropriate",
    ],
    dataSources: [
      "CMS Workers' Compensation Medicare Set-Aside Arrangement Reference Guide",
      "Treating provider records and recommendations",
      "State workers' compensation fee schedules or usual-and-customary charge data as applicable",
      "Medicare coverage rules for the identified items",
      "Rated-age determinations where obtained",
    ],
    limitations:
      "An allocation is not a life care plan. It excludes care Medicare does not cover and does not attempt to capture the full cost of the injury. CMS review is voluntary and threshold-based, and CMS guidance changes; the allocation should state the guidance version relied on.",
    admissibilityHistory:
      "Allocations are prepared for settlement rather than trial and are evaluated against Medicare's published review guidance rather than evidentiary standards. Where an allocator testifies, the questions concern entitlement, the covered-care inventory, and the pricing basis.",
    relevantServices: ["medicare-set-aside", "workers-compensation-lcp"],
    faqs: [
      {
        question: "Can the same professional prepare the life care plan and the MSA allocation?",
        answer:
          "Yes, and it is often efficient because the medical record review overlaps. The two documents serve different purposes and should be kept distinct: the plan captures the full scope of future care, the allocation captures only the Medicare-covered, injury-related portion.",
      },
      {
        question: "Does an MSA require CMS approval?",
        answer:
          "Submission for review is voluntary and available only when the settlement meets published thresholds. Parties may settle without review, but the allocation should still be reasonable and documented so Medicare's interests are demonstrably considered.",
      },
      {
        question: "Why does an MSA use a rated age?",
        answer:
          "A rated age from a life insurance underwriter can shorten the allocation period when the evaluee's health profile supports it, reducing the amount set aside. Life care plans for litigation generally do not use rated ages for their horizon.",
      },
    ],
    sources: refsToSources([
      "CMS_WCMSA_GUIDE",
      "CMS_WCMSA",
      "CMS_MSP",
      "MSP_1395Y",
    ]),
  },
];

export function getMethod(slug: string): Methodology | undefined {
  return methods.find((m) => m.slug === slug);
}
