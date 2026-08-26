import type { Faq, Source } from "./types";

export type JourneyStageSlug = "considering" | "retaining" | "preparing-deposition" | "trial";

export interface JourneyStage {
  stage: JourneyStageSlug;
  caseTypeSlug: string;
  intro: string;
  checklist: string[];
  questionsToAsk: string[];
  timeline: string;
  requiredDocuments: string[];
  pitfalls: string[];
  faqs: Faq[];
  sources: Source[];
  dateModified?: string;
}

export const journeys: JourneyStage[] = [
  // ── Considering stage ─────────────────────────────────────────
  {
    stage: "considering",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-08-26",
    intro:
      "Before retaining a life care planner in a TBI matter, confirm that the severity classification and the cognitive, behavioral, and physical sequelae are documented well enough for the treating team to describe long-term needs. A completed or scheduled neuropsychological evaluation is usually the gate: it supplies the functional basis for supervision, therapy, and support recommendations in the plan.",
    checklist: [
      "Confirm TBI severity from the acute records: Glasgow Coma Scale, loss of consciousness, post-traumatic amnesia, and imaging",
      "Determine whether a neuropsychological evaluation is complete or scheduled",
      "Identify the current level of supervision, therapy, and medication management",
      "Estimate plan scope from the functional picture before committing to the full expert complement",
    ],
    questionsToAsk: [
      "Do you have life care planning experience at this severity level?",
      "How do you translate neuropsychological findings into supervision and support recommendations?",
      "How do you coordinate with the neuropsychologist and treating physiatrist?",
    ],
    timeline: "2-4 weeks between initial consideration and retention, sooner if the neuropsychological evaluation is already complete.",
    requiredDocuments: [
      "Acute care and rehabilitation records",
      "Neuropsychological evaluation or screening results if available",
      "Current medication, therapy, and supervision arrangements",
    ],
    pitfalls: [
      "Retaining before neuropsychological data is in, so the plan has no functional basis for supervision hours",
      "Underestimating mild TBI where persistent symptoms drive ongoing therapy and medication management",
    ],
    faqs: [
      {
        question: "Does every TBI case need a life care plan?",
        answer: "Moderate-to-severe TBI almost always does. Mild TBI warrants a plan when symptoms persist and the treating team projects ongoing therapy, medication management, or supervision.",
      },
    ],
    sources: [{ title: "CDC TBI", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-08-26",
    intro:
      "SCI matters nearly always warrant a life care plan. Before retention, confirm the ASIA Impairment Scale classification and neurological level, because they drive attendant care hours, equipment, and medical surveillance and anchor every projection in the plan.",
    checklist: [
      "Confirm ASIA Impairment Scale and neurological level from the rehabilitation records",
      "Inventory current durable medical equipment, supplies, and care arrangements",
      "Identify the treating physiatrist for coordination",
      "Estimate plan scope and the resulting expert fees from the level of injury",
    ],
    questionsToAsk: [
      "Do you have prior SCI plan experience at this neurological level?",
      "How do you project attendant care hours?",
      "What is your approach to home and vehicle modifications?",
    ],
    timeline: "2-3 weeks typical between consideration and retention.",
    requiredDocuments: ["ASIA examination", "Rehabilitation records", "Current equipment and supply inventory"],
    pitfalls: ["Retaining a planner without SCI experience", "Missing attendant care scope at the outset"],
    faqs: [
      { question: "Which parts of an SCI plan carry the most cost?", answer: "Attendant care, followed by equipment replacement, supplies, and the medical surveillance needed to manage skin, bladder, bowel, and respiratory complications." },
    ],
    sources: [{ title: "NSCISC", url: "https://www.nscisc.uab.edu/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "amputation",
    dateModified: "2026-08-26",
    intro:
      "Amputation matters benefit from a life care plan that projects prosthetic acquisition and replacement, residual limb care, therapy, and the secondary conditions that follow limb loss. Confirm the treating prosthetist's recommendation before retention so the plan prices the right technology.",
    checklist: [
      "Confirm level of amputation, side, and the prosthetic recommendation",
      "Review treating prosthetist notes and the current device specification",
      "Identify residual limb, skin, and pain management needs",
      "Estimate prosthetic replacement cost over life expectancy",
    ],
    questionsToAsk: [
      "How do you cost prosthetic component replacement intervals?",
      "Do you account for advanced prosthetic technology such as microprocessor knees or osseointegration?",
      "How do you project residual limb care and therapy over time?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Surgical records", "Prosthetist notes and device specification", "Therapy records"],
    pitfalls: ["Underestimating residual limb care costs", "Omitting socket replacements and liners"],
    faqs: [
      { question: "Is a life care plan needed for a single-limb amputation?", answer: "Usually, because prosthetic replacement, supplies, and residual limb care recur for life and are the bulk of future medical cost." },
    ],
    sources: [{ title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-08-26",
    intro:
      "Burn injury damages typically require a life care plan addressing staged reconstructive surgery, compression garments, scar management, and mental health services. Confirm the burn team's reconstruction outlook before retention so the plan scope is realistic.",
    checklist: [
      "Document total body surface area, depth, location, and the reconstruction outlook",
      "Review mental health, scar management, and pain management needs",
      "Identify current garment, dressing, and therapy regimens",
      "Estimate long-horizon reconstructive and scar management costs",
    ],
    questionsToAsk: [
      "Do you have burn-specific life care planning experience?",
      "How do you project staged reconstructive surgery costs?",
      "How do you address PTSD and body image in the plan?",
    ],
    timeline: "2-3 weeks before retention.",
    requiredDocuments: ["Burn center records", "Mental health records", "Photographs if appropriate"],
    pitfalls: ["Ignoring compression garment recurring costs", "Under-scoping mental health services"],
    faqs: [
      { question: "Are burn life care plans typically lengthy?", answer: "Yes, given lifetime compression garment, reconstructive surgery, scar management, and mental health components." },
    ],
    sources: [{ title: "American Burn Association", url: "https://ameriburn.org/", type: "org" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "wrongful-death",
    dateModified: "2026-08-26",
    intro:
      "A life care planner contributes to a wrongful death matter in two situations: when the decedent survived for a period during which substantial care was delivered, and when the decedent was the caregiver for a dependent whose needs now have to be met by paid services. Identify which applies before retention.",
    checklist: [
      "Determine whether there was a survival period and gather the care and billing records for it",
      "Identify any dependent whose daily care the decedent provided",
      "Document the household composition and the care arrangements in place before death",
      "Confirm how the jurisdiction treats survival-period care and family-provided care",
    ],
    questionsToAsk: [
      "How do you reconstruct the care delivered between injury and death?",
      "How do you document and value care that family members provided?",
      "How do you project replacement care for a dependent the decedent looked after?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Hospital, hospice, and home health records for any survival period", "Billing records", "Records describing the dependent's condition and care"],
    pitfalls: ["Overlooking family-provided care during the survival period", "Failing to identify a dependent who lost a caregiver"],
    faqs: [
      { question: "Is a life care planner needed when death was immediate?", answer: "Only when the decedent was caring for a dependent with ongoing needs. Otherwise the damages case is handled by counsel's economic expert without a plan." },
    ],
    sources: [{ title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-08-26",
    intro:
      "Workers' compensation matters call for a life care plan when future medical exposure drives settlement value, when a Medicare set-aside is anticipated, or when the reasonableness of projected treatment is disputed. Confirm the accepted body parts, the governing fee schedule, and whether the claimant is or will be a Medicare beneficiary before retention.",
    checklist: [
      "Review the claim file and identify the accepted injuries and conditions",
      "Obtain the treating physician's current treatment plan and projected future care",
      "Confirm the state fee schedule that governs medical pricing",
      "Determine Medicare status and whether a set-aside allocation will be needed at settlement",
    ],
    questionsToAsk: [
      "Do you have experience pricing plans under this state's fee schedule?",
      "How do you separate injury-related care from treatment for unrelated conditions?",
      "Can the same clinical foundation support a Medicare set-aside allocation?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Claim file", "Treating physician records and treatment plan", "Independent or agreed medical examination reports"],
    pitfalls: ["Pricing at usual and customary rates where the fee schedule governs", "Overlooking Medicare status until settlement is imminent"],
    faqs: [
      { question: "Does a workers' compensation plan address return to work?", answer: "The plan addresses future medical care. Where return to work is contested, we coordinate with a vocational specialist or forensic economist through our sister practice." },
    ],
    sources: [{ title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-08-26",
    intro:
      "MVA considerations scale to severity. Soft-tissue and minor injury cases may need only a medical cost projection, or no planning expert at all; polytrauma, spinal, and brain injury cases warrant a full life care plan.",
    checklist: [
      "Quantify the likely magnitude of future medical need from the treating records",
      "Decide whether a medical cost projection or a full life care plan fits the injury",
      "Identify the treating specialists whose recommendations the plan will rest on",
      "Check the case calendar against planner availability",
    ],
    questionsToAsk: [
      "How do you distinguish accident-related care from treatment for pre-existing conditions?",
      "When do you recommend a medical cost projection instead of a full plan?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Medical records and imaging", "Current medication and therapy regimen", "Accident records"],
    pitfalls: ["Overscoping minor cases", "Underscoping catastrophic cases"],
    faqs: [
      { question: "Does chronic pain alone warrant a life care plan?", answer: "It can, when the treating team projects ongoing pain management, injections, medication, and therapy. A medical cost projection is often the right scope for pain-only cases." },
    ],
    sources: [{ title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" }],
  },

  // ── Retaining stage ───────────────────────────────────────────
  {
    stage: "retaining",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-08-26",
    intro:
      "Burn injury retention centers on a life care plan that addresses staged reconstructive surgery, compression garments, scar management, pain management, and psychological services. The planner needs the burn team's reconstruction outlook and the current garment and therapy regimen to project needs over the survivor's lifetime.",
    checklist: [
      "Document total body surface area burned, depth, and location",
      "Retain a planner with burn-specific experience",
      "Coordinate with the treating burn team on the projected reconstruction schedule",
      "Arrange planner contact with the treating plastic surgeon and mental health providers",
      "Plan for mental health services in the life care plan",
    ],
    questionsToAsk: [
      "How do you project compression garment replacement costs?",
      "How do you account for staged reconstructive surgery?",
      "How do you address heat intolerance and skin protection in daily living?",
      "How do you incorporate mental health treatment?",
    ],
    timeline:
      "60-90 days from retention to report given the complexity of staged reconstruction.",
    requiredDocuments: [
      "Burn center and reconstructive surgery records",
      "Current photographs documenting scarring (when appropriate)",
      "Garment, dressing, and therapy records",
      "Psychology and psychiatry records if applicable",
    ],
    pitfalls: [
      "Omitting compression garment recurring costs",
      "Underprojecting mental health services",
      "Ignoring heat intolerance and skin protection needs",
    ],
    faqs: [
      {
        question: "Why are mental health services so important in burn cases?",
        answer:
          "Peer-reviewed literature documents a high incidence of PTSD, depression, and body image concerns in burn survivors. Plans routinely include individual therapy, group therapy, and psychiatric medication management.",
      },
    ],
    sources: [
      { title: "American Burn Association", url: "https://ameriburn.org/", type: "org" },
      { title: "Phoenix Society for Burn Survivors", url: "https://www.phoenix-society.org/", type: "org" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-08-26",
    intro:
      "MVA planning retention scales to injury severity. Non-catastrophic cases may be served by a medical cost projection; catastrophic cases call for a full life care plan coordinated with the treating specialists and, for present value, counsel's economic expert.",
    checklist: [
      "Assess injury severity and the likely magnitude of future care",
      "Match the deliverable to severity (medical cost projection for limited injuries, full plan for catastrophic)",
      "Obtain complete medical records, imaging, and any functional capacity evaluation",
      "Coordinate with orthopedic, neurological, or rehabilitation treating providers as relevant",
    ],
    questionsToAsk: [
      "How does the injury mix affect your methodology?",
      "How do you handle chronic pain in the plan?",
      "When do you recommend a full life care plan for MVA cases?",
    ],
    timeline:
      "30-60 days for non-catastrophic cases; 60-90 days for catastrophic.",
    requiredDocuments: [
      "Medical records, imaging, and any functional capacity evaluation",
      "Current medication, therapy, and equipment documentation",
      "Accident report and records",
    ],
    pitfalls: [
      "Overscoping smaller cases with a full plan where a projection would do",
      "Underscoping catastrophic cases by omitting attendant care and home modification",
    ],
    faqs: [
      {
        question: "Are MVA life care plans different?",
        answer:
          "Methodology is the same. The injury mix often blends orthopedic, neurological, and chronic pain elements, which the plan addresses in coordination with each treating specialist.",
      },
    ],
    sources: [
      { title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-08-26",
    intro:
      "Retaining a life care planner in a TBI case typically runs alongside a neuropsychologist and, for present value, an economist. Early coordination ensures the neuropsychological battery addresses the domains the plan depends on: supervision needs, safety, medication management, and the capacity to direct one's own care.",
    checklist: [
      "Identify severity (mild, moderate, severe) from the clinical records",
      "Confirm the neuropsychological evaluation has been ordered or completed",
      "Retain the planner early enough to inform the neuropsychological referral questions",
      "Provide all neurological and neuropsychological records, imaging, and rehabilitation discharge summaries",
      "Coordinate the planner and economist on scenarios such as home-based versus supported-living care",
    ],
    questionsToAsk: [
      "How do you incorporate neuropsychological findings into supervision and support recommendations?",
      "What peer-reviewed literature do you rely on for TBI complications and long-term care?",
      "How do you distinguish pre-existing from TBI-attributable needs?",
      "Have you testified in moderate-to-severe TBI cases?",
    ],
    timeline:
      "45-90 days from retention to report, longer when the neuropsychological evaluation is pending.",
    requiredDocuments: [
      "Neurological and neuropsychological evaluations",
      "Imaging (CT, MRI, DTI when available)",
      "Acute care and rehabilitation records",
      "Current medication, therapy, and supervision arrangements",
      "Family description of daily function and safety concerns",
    ],
    pitfalls: [
      "Retaining before the neuropsychological evaluation is complete, leaving supervision hours unsupported",
      "Overlooking mild TBI with persistent symptoms and ongoing treatment",
      "Leaving the residential setting assumption undocumented",
    ],
    faqs: [
      {
        question: "Is a neuropsychological evaluation required?",
        answer:
          "It is strongly recommended in moderate-to-severe TBI because it supplies the functional basis for supervision and support in the plan. Mild TBI cases often benefit but may proceed without one, depending on symptom persistence.",
      },
      {
        question: "Does TBI affect life expectancy in the plan?",
        answer:
          "Peer-reviewed literature supports reduced life expectancy after severe TBI in some populations. Any adjustment is stated with its basis and tied to severity and function, and the plan is presented so the effect of a different life expectancy is transparent.",
      },
    ],
    sources: [
      { title: "CDC Traumatic Brain Injury", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" },
      { title: "NIH NINDS TBI Information", url: "https://www.ninds.nih.gov/health-information/disorders/traumatic-brain-injury-tbi", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-08-26",
    intro:
      "SCI cases require coordination between the treating physiatrist, the life care planner, and the economist. The life care plan typically anchors the damages case given the extent of attendant care, equipment, supplies, and medical surveillance over a lifetime.",
    checklist: [
      "Confirm ASIA Impairment Scale classification and neurological level",
      "Retain a planner with SCI-specific experience",
      "Coordinate with the treating physiatrist on future care recommendations",
      "Arrange an in-person or video evaluation to document function, equipment, and the daily care routine",
      "Plan for periodic plan updates if settlement is distant",
    ],
    questionsToAsk: [
      "How does neurological level shape your attendant care recommendation?",
      "How do you cost equipment replacement intervals?",
      "What is your attendant care methodology and rate source?",
      "How do you address life expectancy for this level of injury?",
    ],
    timeline:
      "60-90 days from retention to a comprehensive life care plan. The economic report follows once the plan is final.",
    requiredDocuments: [
      "Acute care, rehabilitation, and outpatient records",
      "ASIA examinations and imaging",
      "Durable medical equipment history and current supply usage",
      "Home and vehicle configuration details",
      "Description of the current daily care routine and who provides it",
    ],
    pitfalls: [
      "Underestimating attendant care needs by skipping a functional assessment",
      "Omitting periodic equipment replacements",
      "Inadequate home modification planning",
    ],
    faqs: [
      {
        question: "Do all SCI cases need a life care plan?",
        answer:
          "Nearly all SCI cases with residual neurological deficit benefit from a life care plan. Very minor incomplete injuries may be served by a medical cost projection.",
      },
    ],
    sources: [
      { title: "National Spinal Cord Injury Statistical Center", url: "https://www.nscisc.uab.edu/", type: "gov" },
      { title: "Christopher & Dana Reeve Foundation", url: "https://www.christopherreeve.org/", type: "org" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "amputation",
    dateModified: "2026-08-26",
    intro:
      "Amputation cases require prosthetic cost projections tailored to the level of amputation, the technology the treating prosthetist recommends, and the activity level the claimant is expected to sustain. The plan also carries residual limb care, therapy, and the secondary conditions that follow limb loss.",
    checklist: [
      "Document level of amputation and dominant versus non-dominant side",
      "Identify the prosthetic technology being used or recommended",
      "Retain a planner familiar with prosthetic cost projection",
      "Arrange planner contact with the treating prosthetist and physiatrist",
      "Plan replacements for prosthetic components per manufacturer and prosthetist intervals",
    ],
    questionsToAsk: [
      "How do you project prosthetic replacement intervals?",
      "Do you account for advanced technology (microprocessor, myoelectric, osseointegration)?",
      "How do you address residual limb care, skin breakdown, and therapy?",
      "How do you handle secondary conditions such as overuse of the contralateral limb and back pain?",
    ],
    timeline:
      "45-75 days depending on prosthetic complexity and cost-quote collection time.",
    requiredDocuments: [
      "Surgical and prosthetist records",
      "Current prosthetic device specifications and quotes",
      "Therapy and pain management records",
      "Any functional capacity evaluation",
    ],
    pitfalls: [
      "Omitting socket replacements, liners, or skin care supplies",
      "Using national averages where local cost data is available",
      "Failing to scope bilateral extremity amputations appropriately",
    ],
    faqs: [
      {
        question: "Do myoelectric or microprocessor prosthetics materially change damages?",
        answer:
          "Yes, because of higher acquisition cost and shorter component service life. Documentation of the treating prosthetist's recommendation is required.",
      },
    ],
    sources: [
      { title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" },
      { title: "American Academy of Orthotists & Prosthetists", url: "https://www.oandp.org/", type: "org" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "wrongful-death",
    dateModified: "2026-08-26",
    intro:
      "Life care planning retention in a wrongful death matter is scoped to the survival period, the dependent who lost a caregiver, or both. The planner reconstructs and values the care actually delivered between injury and death and, where applicable, projects replacement care for the dependent in the same format as any other life care plan. Counsel's economic expert carries the earnings and present-value work.",
    checklist: [
      "Confirm whether the engagement covers survival-period care, dependent replacement care, or both",
      "Gather hospital, hospice, home health, pharmacy, and billing records for the survival period",
      "Document the care family members provided and the hours involved",
      "Identify the dependent's diagnoses, treating providers, and current care arrangements",
      "Coordinate with the economist on how the plan feeds the present-value calculation",
    ],
    questionsToAsk: [
      "How do you confirm that survival-period care was related to the injury and medically appropriate?",
      "How do you value care that family members provided?",
      "How do you project replacement care for a dependent with a disability?",
      "How do you present the plan so the economist can discount it?",
    ],
    timeline:
      "30-60 days from retention to report when the care and billing records are complete.",
    requiredDocuments: [
      "Death certificate and the records surrounding the survival period",
      "Hospital, hospice, and home health records",
      "Billing and pharmacy records",
      "Records describing the dependent's condition and care needs",
      "Family caregiving log or description of daily care",
    ],
    pitfalls: [
      "Omitting family-provided care from the survival-period reconstruction",
      "Including treatment for conditions unrelated to the injury",
      "Leaving the dependent's projected life expectancy undocumented",
    ],
    faqs: [
      {
        question: "Who handles lost earnings in a wrongful death case?",
        answer:
          "Counsel's economic expert. The life care planner documents care delivered and care needed, and the plan is one input to the economist's calculation.",
      },
    ],
    sources: [
      { title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-08-26",
    intro:
      "Workers' compensation life care planning engagements focus on the injury-related care the treating physician projects, priced under the governing state fee schedule, and on the Medicare set-aside allocation that often accompanies settlement. The plan separates injury-related care from treatment for unrelated conditions so the carrier's exposure is stated accurately.",
    checklist: [
      "Identify the jurisdiction's fee schedule and the accepted body parts or conditions",
      "Obtain the treating physician's records, restrictions, and projected future treatment",
      "Confirm Medicare status and whether a set-aside allocation is part of the engagement",
      "Provide independent and agreed medical examination reports",
      "Confirm whether the carrier or counsel wants usual and customary pricing shown for comparison",
    ],
    questionsToAsk: [
      "Do you price under this state's fee schedule, and how do you document the source?",
      "How do you handle disputed or denied body parts?",
      "Can you prepare the Medicare set-aside allocation from the same clinical foundation?",
    ],
    timeline:
      "30-45 days for most workers' compensation plans; add time if a set-aside allocation is prepared together with the plan.",
    requiredDocuments: [
      "Claim file and accepted-condition determinations",
      "Treating physician records, restrictions, and treatment plan",
      "Independent or agreed medical examination reports",
      "Pharmacy history and equipment records",
    ],
    pitfalls: [
      "Ignoring the fee schedule and pricing at usual and customary rates",
      "Including care for conditions the carrier has not accepted without flagging it",
      "Discovering Medicare status late and having to rework the settlement figures",
    ],
    faqs: [
      {
        question: "How does a workers' compensation plan differ from a civil litigation plan?",
        answer:
          "The clinical method is the same. The difference is pricing under the state fee schedule, the limit to accepted injury-related care, and the need to reconcile the plan with a Medicare set-aside allocation at settlement.",
      },
    ],
    sources: [
      { title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" },
    ],
  },
  {
    stage: "considering",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-08-26",
    intro:
      "Before retaining a life care planner in a medical malpractice case, confirm the standard-of-care and causation positions and identify what care the patient would have needed anyway. The plan must separate the care attributable to the alleged breach from the baseline, and that separation depends on the causation opinion.",
    checklist: [
      "Confirm the standard-of-care expert opinion",
      "Confirm the causation expert opinion and the injury it attributes to the breach",
      "Identify the baseline care the patient would have needed without the breach",
      "Identify whether an incremental-harm plan is required",
      "Budget for planner fees across records review, evaluation, report, and testimony",
    ],
    questionsToAsk: [
      "How do you separate breach-related care from baseline care in the plan?",
      "How will you coordinate with the causation physician?",
      "What is the expected timeline from retention to report?",
    ],
    timeline:
      "Typically 2-4 weeks between first considering retention and executing the engagement letter, depending on planner availability.",
    requiredDocuments: [
      "Preliminary medical records summary",
      "Standard-of-care and causation expert draft opinions",
      "Current treatment, medication, and equipment documentation",
    ],
    pitfalls: [
      "Retaining before causation is clear, wasting fees on speculative scope",
      "Leaving the baseline undefined so the incremental plan cannot be built",
      "Underestimating the complexity of an incremental-harm analysis",
    ],
    faqs: [
      {
        question: "How early should I start considering planner retention?",
        answer:
          "As soon as the standard-of-care and causation theories are articulated. Early consideration lets the planner shape the causation physician's description of the incremental injury.",
      },
    ],
    sources: [
      { title: "AHRQ - Patient Safety Resources", url: "https://www.ahrq.gov/", type: "gov" },
    ],
  },
  {
    stage: "considering",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-08-26",
    intro:
      "Before retaining a life care planner in a personal injury case, evaluate whether future medical care is meaningfully contested and at what magnitude. Where future care is modest, a medical cost projection may suffice; where it includes attendant care, equipment, surgery, or long-term therapy, a full plan is warranted.",
    checklist: [
      "Quantify the likely magnitude of future care from the treating records",
      "Identify which future care items are actually disputed",
      "Decide between a medical cost projection and a full life care plan",
      "Confirm planner availability against the case calendar",
    ],
    questionsToAsk: [
      "Is future care contested, or will the treating physician's projection suffice?",
      "Is the future care need significant enough to warrant a full plan?",
      "What is the planner's admissibility history in this injury type?",
    ],
    timeline:
      "1-3 weeks between first consideration and engagement.",
    requiredDocuments: [
      "Injury severity summary",
      "Treating physician's current treatment plan",
      "Planner CVs for candidates under consideration",
    ],
    pitfalls: [
      "Retaining a planner prematurely on soft-tissue cases where future care is small",
      "Delaying retention past the point where records are complete and the treating team is available",
    ],
    faqs: [
      {
        question: "Do all personal injury cases need a life care plan?",
        answer:
          "No. The test is whether future care is meaningfully contested and whether its magnitude warrants a plan rather than a shorter medical cost projection.",
      },
    ],
    sources: [
      { title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-08-26",
    intro:
      "Retaining a life care planner in a medical malpractice matter requires early coordination with the standard-of-care and causation experts. The planner should be briefed on the alleged breach, the but-for baseline, and the incremental injury attributed to the breach so the plan is scoped to the care the breach caused.",
    checklist: [
      "Confirm the case theory (alleged breach and causation) before planner retention",
      "Send the engagement letter outlining scope, hourly rate, retainer, and deliverables",
      "Provide all medical records, imaging, and prior expert reports",
      "Coordinate with the standard-of-care and causation experts to align the incremental injury",
      "Schedule an initial conference to discuss methodology and the deliverable timeline",
      "Confirm deposition and trial dates early to preserve planner availability",
    ],
    questionsToAsk: [
      "What is your credentialing and prior testimony history in medical malpractice cases?",
      "How will you isolate breach-related care from baseline medical needs?",
      "What peer-reviewed literature supports your methodology for this injury?",
      "How do you coordinate with physician experts on causation-dependent items?",
      "What is your admissibility history and have you ever been excluded?",
    ],
    timeline:
      "Typical engagement from retention to report: 45-90 days depending on records volume and whether an in-person evaluation is needed. Plan for deposition 30-60 days after the report, and trial testimony on the court's calendar.",
    requiredDocuments: [
      "Complete certified medical records (pre- and post-event)",
      "Imaging, pathology, and lab results",
      "Treating provider depositions (if available)",
      "Standard-of-care expert reports",
      "Causation expert reports",
      "Current treatment, medication, equipment, and care arrangements",
    ],
    pitfalls: [
      "Retaining too late and truncating the records review period",
      "Scope ambiguity between the planner and the causation physician",
      "Failing to isolate incremental care from baseline care",
      "Overlapping or conflicting opinions among retained experts",
    ],
    faqs: [
      {
        question: "Do I need a full plan on every med mal case?",
        answer:
          "Not always. Catastrophic outcomes call for a full plan; less severe injuries may be served by a medical cost projection limited to the breach-related care.",
      },
      {
        question: "Who coordinates between the retained experts?",
        answer:
          "Retaining counsel coordinates, though the life care planner can set up communication with the causation physician and the economist when several experts are retained on the same case.",
      },
    ],
    sources: [
      { title: "AHRQ - Patient Safety Resources", url: "https://www.ahrq.gov/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-08-26",
    intro:
      "Retaining a life care planner in a personal injury case should follow a decision that future care is meaningfully contested. Early retention lets the planner inform the treating-provider conference, the referral for any functional evaluation, and medical records collection.",
    checklist: [
      "Confirm the contested future care items",
      "Send the engagement letter and retainer",
      "Provide medical records, imaging, and the current treatment regimen",
      "Schedule any needed functional capacity or neuropsychological evaluation",
      "Set an initial call to align on methodology and the deliverable timeline",
      "Preserve planner availability for deposition and trial",
    ],
    questionsToAsk: [
      "What is your experience in cases involving this injury type?",
      "How will you obtain and document treating-provider recommendations?",
      "What cost sources do you use for this geographic area?",
      "How will you coordinate with my economist?",
      "How do you handle a treating physician who has not projected future care in writing?",
    ],
    timeline:
      "Typical engagement from retention to report: 30-60 days. Rush timelines can be accommodated when records are complete and an evaluation is not required.",
    requiredDocuments: [
      "Complete medical records",
      "Functional capacity evaluation (if performed)",
      "Current medication, therapy, and equipment documentation",
      "Pharmacy and billing history",
      "Deposition transcripts of the claimant and treating providers",
    ],
    pitfalls: [
      "Late retention compressing the evaluation window",
      "Incomplete records leaving future care items without a physician source",
      "Missing functional evaluation data needed to support attendant care or therapy",
      "Scope ambiguity when an economist is also retained",
    ],
    faqs: [
      {
        question: "How early should I retain a life care planner?",
        answer:
          "As soon as it becomes clear future care is contested. Early retention lets the planner inform discovery and avoid gaps in the treating-provider record.",
      },
      {
        question: "What if the treating physician has not written down a future care plan?",
        answer:
          "The planner conferences with the physician and documents the recommendations in writing, or, where that is not possible, relies on published clinical practice guidelines and states the basis clearly.",
      },
    ],
    sources: [
      { title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" },
    ],
  },

  // ── Preparing for Deposition ──────────────────────────────────
  {
    stage: "preparing-deposition",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-08-26",
    intro:
      "Preparing a life care planner for deposition in a TBI case focuses on the neuropsychological foundation for supervision and support, the severity classification, and the method used to translate cognitive and behavioral findings into care recommendations, frequencies, and costs.",
    checklist: [
      "Review the plan end-to-end against the treating-team and neuropsychological recommendations",
      "Confirm all source citations, cost quotes, and file materials",
      "Prepare the expert on the contested severity classification",
      "Review the opposing plan or critique for anticipated lines",
      "Rehearse the explanation of how neuropsychological findings become supervision hours",
    ],
    questionsToAsk: [
      "What severity classifications did you consider and why?",
      "How did you apply the neuropsychological findings to supervision and support?",
      "How did you address pre-existing conditions?",
    ],
    timeline: "2-3 preparation sessions recommended prior to deposition.",
    requiredDocuments: ["Expert's full file", "Neuropsychological reports", "Opposing plan or critique"],
    pitfalls: ["Overreaching on severity", "Supervision hours without a documented functional basis"],
    faqs: [
      { question: "Should the expert bring the full file to deposition?", answer: "Yes, consistent with jurisdictional subpoena requirements." },
    ],
    sources: [{ title: "Federal Rule of Civil Procedure 30", url: "https://www.law.cornell.edu/rules/frcp/rule_30", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-08-26",
    intro:
      "Deposition preparation in SCI cases centers on equipment cost defenses, attendant care methodology, and the neurological-level basis for the life care plan.",
    checklist: [
      "Reconfirm equipment replacement interval sources",
      "Review attendant care methodology and rate data",
      "Prepare on ASIA classification specifics",
      "Review the opposing planner or physician critique",
    ],
    questionsToAsk: [
      "How did you determine replacement intervals?",
      "What rate sources did you use for attendant care?",
      "How did you coordinate with the treating physiatrist?",
    ],
    timeline: "2 preparation sessions.",
    requiredDocuments: ["Life care plan with source citations", "Physiatrist communications", "Cost documentation"],
    pitfalls: ["Rate source substitutions without documentation", "Skipping peer-reviewed duration references"],
    faqs: [
      { question: "Can attendant care hour opinions be challenged?", answer: "They commonly are; defend them with the functional assessment and documented hours by service type." },
    ],
    sources: [{ title: "NSCISC", url: "https://www.nscisc.uab.edu/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "amputation",
    dateModified: "2026-08-26",
    intro:
      "Deposition preparation in amputation cases focuses on prosthetic cost quotations, replacement intervals, and the clinical basis for the technology level in the plan.",
    checklist: [
      "Verify all prosthetic cost quotations are current",
      "Confirm replacement intervals match manufacturer and prosthetist specifications",
      "Review the residual limb care and therapy items step-by-step",
      "Prepare on advanced-technology cost disputes",
    ],
    questionsToAsk: [
      "How did you source component costs?",
      "What intervals did you apply and why?",
      "How did you evaluate the microprocessor, myoelectric, or osseointegration recommendation?",
    ],
    timeline: "2 preparation sessions.",
    requiredDocuments: ["Prosthetist quotes", "Replacement interval documentation", "Life care plan"],
    pitfalls: ["Stale cost data", "Over-reliance on national averages"],
    faqs: [
      { question: "How are advanced prosthetic technologies defended in deposition?", answer: "With the treating prosthetist's recommendation and a documented cost rationale." },
    ],
    sources: [{ title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-08-26",
    intro:
      "Burn injury deposition prep addresses staged reconstruction scheduling, compression garment cost recurrence, and the mental health component of the plan.",
    checklist: [
      "Review staged reconstruction timing with the treating plastic surgeon",
      "Confirm compression garment replacement frequency",
      "Prepare on the mental health justification",
      "Review heat intolerance and skin protection items",
    ],
    questionsToAsk: [
      "How did you plan reconstruction timing?",
      "What supports the mental health frequency?",
      "How did you account for heat intolerance and skin protection?",
    ],
    timeline: "2 preparation sessions.",
    requiredDocuments: ["Treating plastic surgeon notes", "Mental health records", "Burn center records"],
    pitfalls: ["Under-scoping mental health", "Skipping compression garment recurring costs"],
    faqs: [
      { question: "Is staged reconstruction defensible as a projection?", answer: "Yes, when the treating team supports a staged plan in writing." },
    ],
    sources: [{ title: "American Burn Association", url: "https://ameriburn.org/", type: "org" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "wrongful-death",
    dateModified: "2026-08-26",
    intro:
      "Wrongful death deposition prep for the life care planner focuses on the survival-period care reconstruction, the relatedness of each item to the injury, the valuation of family-provided care, and the basis for any dependent replacement-care projection.",
    checklist: [
      "Review the survival-period reconstruction against the billing and clinical records",
      "Confirm the relatedness of each item to the injury",
      "Document the rate sources used for family-provided care",
      "Prepare the dependent replacement-care basis and life expectancy assumption",
    ],
    questionsToAsk: [
      "How did you confirm each survival-period item was related to the injury?",
      "What rate sources did you use for family-provided care?",
      "What supports the dependent's projected needs and life expectancy?",
    ],
    timeline: "1-2 preparation sessions.",
    requiredDocuments: ["Survival-period care reconstruction", "Billing and clinical records", "Dependent care records"],
    pitfalls: ["Including unrelated treatment in the reconstruction", "Family-care hours without a documented source"],
    faqs: [
      { question: "Is family-provided care commonly contested?", answer: "Yes. Defend it with the caregiving log, the clinical record of what care was needed, and a stated market rate source." },
    ],
    sources: [{ title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-08-26",
    intro:
      "Med mal deposition prep centers on isolating breach-related care from baseline care, coordinating with the causation expert, and defending the but-for baseline assumptions.",
    checklist: [
      "Confirm the causation opinion the plan relied upon",
      "Document the but-for baseline assumptions",
      "Review the incremental-care isolation methodology",
      "Prepare on pre-existing condition analysis",
    ],
    questionsToAsk: [
      "How did you isolate breach-related care from baseline?",
      "Which causation opinion did you rely on?",
      "How did you handle pre-existing conditions?",
    ],
    timeline: "2-3 preparation sessions given complexity.",
    requiredDocuments: ["Causation expert report", "Standard-of-care expert report", "Life care plan"],
    pitfalls: ["Inconsistency with the causation opinion", "Weak documentation of the but-for baseline"],
    faqs: [
      { question: "Are life care planners cross-examined on causation?", answer: "Not directly, but on whether the plan is consistent with the causation opinion it relied on." },
    ],
    sources: [{ title: "AHRQ", url: "https://www.ahrq.gov/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-08-26",
    intro:
      "PI deposition prep addresses methodology defense, the treating-provider foundation for each item, and the cost sources used for the claimant's geographic area.",
    checklist: [
      "Review the plan methodology step-by-step",
      "Confirm the treating-provider source for each recommendation",
      "Review the peer-reviewed references and clinical guidelines relied upon",
      "Prepare on pre-existing conditions",
    ],
    questionsToAsk: [
      "Walk us through how each item entered the plan",
      "How did you apply the functional evaluation results?",
      "What cost sources did you use and why?",
    ],
    timeline: "2 preparation sessions.",
    requiredDocuments: ["Life care plan", "Functional evaluation", "Cost research documentation"],
    pitfalls: ["Cost sources without documentation", "Overgeneralization of functional evaluation results"],
    faqs: [
      { question: "How specific should the cost research be?", answer: "Specific to the geographic area where care will be delivered, with named sources, dates, and the method used to select the figure." },
    ],
    sources: [{ title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-08-26",
    intro:
      "Workers' compensation deposition prep focuses on fee-schedule pricing, the limit to accepted injury-related care, and the reconciliation of the plan with any Medicare set-aside allocation.",
    checklist: [
      "Confirm the fee schedule version and how each item was priced",
      "Review the relatedness of each item to the accepted injury",
      "Prepare on any disputed or denied body parts",
      "Reconcile the plan with the set-aside allocation if one was prepared",
    ],
    questionsToAsk: [
      "How did you price each item under the fee schedule?",
      "How did you decide which care was injury-related?",
      "How does the plan reconcile with the Medicare set-aside allocation?",
    ],
    timeline: "1-2 preparation sessions.",
    requiredDocuments: ["Life care plan", "Treating physician treatment plan", "Set-aside allocation if prepared"],
    pitfalls: ["Pricing at usual and customary rates without explanation", "Inconsistency between the plan and the set-aside allocation"],
    faqs: [
      { question: "Is a workers' compensation plan deposed like a civil plan?", answer: "The format varies by state, but the substance is the same: the clinical basis for each item and the pricing source." },
    ],
    sources: [{ title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-08-26",
    intro:
      "MVA deposition prep addresses the treating-provider foundation for each item, pre-existing condition analysis, and the handling of chronic pain management in the plan.",
    checklist: [
      "Review the treating-provider recommendations behind each item",
      "Confirm the pre-existing condition analysis",
      "Prepare on the pain management items and their frequencies",
      "Review the cost research for the claimant's area",
    ],
    questionsToAsk: [
      "How did you distinguish accident-related care from care for pre-existing conditions?",
      "What supports the pain management frequencies in the plan?",
      "What cost sources did you rely on?",
    ],
    timeline: "1-2 preparation sessions.",
    requiredDocuments: ["Medical records", "Life care plan", "Cost research documentation"],
    pitfalls: ["Failing to address pre-existing conditions", "Pain management items without a physician source"],
    faqs: [
      { question: "How are chronic pain items defended?", answer: "With the treating physician's recommendation, published clinical practice guidelines, and any objective testing in the record." },
    ],
    sources: [{ title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" }],
  },

  // ── Trial Testimony ───────────────────────────────────────────
  {
    stage: "trial",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in TBI cases requires translating neuropsychological findings into jury-accessible explanations of what the person needs each day, why supervision and support are necessary, and what each item in the plan costs.",
    checklist: [
      "Prepare jury-accessible visual aids showing care categories and a typical day",
      "Rehearse the direct testimony chronology from evaluation to plan",
      "Prepare on likely cross-examination themes: severity, supervision hours, and life expectancy",
      "Coordinate with the neuropsychologist and economist",
    ],
    questionsToAsk: [
      "Can you explain the TBI and its effects in lay terms?",
      "What does this person need each day, and who provides it?",
      "Why is each item in the plan necessary and what supports it?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Final plan", "Demonstratives", "Prior deposition transcripts"],
    pitfalls: ["Overly technical testimony", "Inconsistency with prior deposition"],
    faqs: [
      { question: "How are demonstratives used?", answer: "To show the brain regions affected, a daily care schedule, and care timelines by category." },
    ],
    sources: [{ title: "CDC TBI", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in SCI cases emphasizes the life care plan structure, attendant care justification, and the durable medical equipment requirements.",
    checklist: [
      "Prepare a visual representation of the life care plan",
      "Rehearse the attendant care justification",
      "Prepare on equipment replacement intervals",
      "Coordinate with the economist on present value",
    ],
    questionsToAsk: [
      "Walk the jury through the plan categories",
      "Why is attendant care needed at this level?",
      "How did you cost replacements?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Life care plan", "Demonstratives", "Deposition transcript"],
    pitfalls: ["Losing the jury in detail", "Missing references to treating providers"],
    faqs: [
      { question: "Is it common to show equipment in court?", answer: "Demonstratives with photos or diagrams are common; physical equipment rarely." },
    ],
    sources: [{ title: "NSCISC", url: "https://www.nscisc.uab.edu/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "amputation",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in amputation cases focuses on prosthetic function, replacement costs, and the residual limb care and secondary conditions that follow limb loss.",
    checklist: [
      "Prepare prosthetic demonstratives",
      "Rehearse the cost projection narrative",
      "Prepare on residual limb care and secondary-condition items",
      "Coordinate with the treating prosthetist if available",
    ],
    questionsToAsk: [
      "Explain the prosthetic components and their costs",
      "What care does the residual limb need over time?",
      "Why is replacement needed at these intervals?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Prosthetic device details", "Cost documentation", "Life care plan"],
    pitfalls: ["Over-technical prosthetic jargon", "Missing local cost context"],
    faqs: [
      { question: "Can a prosthetist testify alongside the life care planner?", answer: "Yes; coordinated testimony is common." },
    ],
    sources: [{ title: "O&P", url: "https://www.oandp.org/", type: "org" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in burn injury cases requires sensitive presentation of staged reconstruction needs, mental health components, and lifetime garment and care costs.",
    checklist: [
      "Prepare demonstratives on reconstruction staging",
      "Coordinate sensitive presentation of the claimant's condition",
      "Rehearse the mental health justification",
      "Prepare on heat intolerance, skin protection, and daily-living items",
    ],
    questionsToAsk: [
      "Walk the jury through the reconstruction schedule",
      "Why is ongoing mental health support needed?",
      "How does the injury change daily life and what does the plan provide for it?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Life care plan", "Mental health records (with claimant consent)", "Reconstruction schedule"],
    pitfalls: ["Overexposing the claimant in demonstratives", "Under-supporting mental health components"],
    faqs: [
      { question: "How are photographs handled?", answer: "Judiciously, with careful weighing of probative value against undue prejudice." },
    ],
    sources: [{ title: "Phoenix Society", url: "https://www.phoenix-society.org/", type: "org" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "wrongful-death",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony by the life care planner in a wrongful death case centers on a clear account of the care delivered during the survival period, the care the family provided, and, where applicable, what the dependent who lost a caregiver will need going forward.",
    checklist: [
      "Prepare a timeline demonstrative of the survival-period care",
      "Rehearse the explanation of family-provided care and its valuation",
      "Prepare the dependent replacement-care presentation",
      "Coordinate with the economist on how the plan feeds the present-value figures",
    ],
    questionsToAsk: [
      "Walk the jury through the care delivered between the injury and death",
      "How did you value the care the family provided?",
      "What will the dependent need now that the caregiver is gone?",
    ],
    timeline: "1 day-of-trial prep session.",
    requiredDocuments: ["Life care plan", "Demonstratives"],
    pitfalls: ["Losing the jury in billing detail", "Leaving the family-care valuation unexplained"],
    faqs: [
      { question: "How is family-provided care visualized?", answer: "Commonly by task category with hours per day and the local market rate for that level of care." },
    ],
    sources: [{ title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in med mal cases requires clear separation of baseline from breach-related care, coordination with causation testimony, and disciplined presentation of the plan.",
    checklist: [
      "Align testimony with the causation expert's trial testimony",
      "Prepare a clear incremental-care narrative",
      "Rehearse the but-for baseline articulation",
      "Prepare demonstratives on the care differential",
    ],
    questionsToAsk: [
      "How do you separate baseline care from breach-related care?",
      "What does the but-for baseline look like?",
      "How did you coordinate with the causation expert?",
    ],
    timeline: "2 day-of-trial prep sessions given complexity.",
    requiredDocuments: ["Causation expert transcript", "Life care plan", "Demonstratives"],
    pitfalls: ["Inconsistency with causation testimony", "Blurring baseline and breach-related care"],
    faqs: [
      { question: "Can the life care planner attend causation testimony?", answer: "Yes, subject to sequestration rulings; it is often useful for coordination." },
    ],
    sources: [],
  },
  {
    stage: "trial",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in personal injury cases requires a clear explanation of methodology, an accessible presentation of the plan categories and costs, and confident handling of pre-existing condition questions.",
    checklist: [
      "Prepare an accessible explanation of how the plan was built",
      "Rehearse the plan category and cost presentation",
      "Prepare on pre-existing condition questions",
      "Coordinate demonstratives with the economist",
    ],
    questionsToAsk: [
      "Explain how a life care plan is built",
      "What does this person need and for how long?",
      "How do you address pre-existing conditions?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Life care plan", "Demonstratives", "Cost summary by category"],
    pitfalls: ["Over-reliance on clinical jargon", "Insufficient visuals"],
    faqs: [
      { question: "How are life care plan demonstratives typically structured?", answer: "By care category with frequency, duration, unit cost, and the treating-provider source, often alongside a typical-day schedule." },
    ],
    sources: [{ title: "CDC - National Center for Injury Prevention and Control", url: "https://www.cdc.gov/injury/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-08-26",
    intro:
      "Workers' compensation hearing testimony addresses the injury-related care the treating physician projects, the fee-schedule pricing behind each item, and the reconciliation of the plan with any Medicare set-aside allocation.",
    checklist: [
      "Prepare for administrative tribunal procedure",
      "Rehearse the fee-schedule pricing explanation",
      "Prepare on disputed or denied body parts",
      "Coordinate with the nurse case manager if one is involved",
    ],
    questionsToAsk: [
      "What future medical care does the treating physician project?",
      "How was each item priced under the fee schedule?",
      "How does the plan relate to the Medicare set-aside allocation?",
    ],
    timeline: "1 day-of-hearing prep session.",
    requiredDocuments: ["Life care plan", "Fee-schedule documentation", "Set-aside allocation if prepared"],
    pitfalls: ["Applying civil-litigation tone to workers' compensation hearings", "Missing state-specific terminology"],
    faqs: [
      { question: "Is testimony at workers' compensation hearings cross-examined?", answer: "Yes, with procedural rules varying by state." },
    ],
    sources: [{ title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-08-26",
    intro:
      "MVA trial testimony emphasizes an accessible explanation of the injuries, the daily needs they create, and the scope of the life care plan.",
    checklist: [
      "Prepare an accessible injury explanation",
      "Rehearse the presentation of daily needs and plan categories",
      "Prepare on pre-existing condition questions",
      "Coordinate with the economist on present value",
    ],
    questionsToAsk: [
      "What does the injury mean for this person's daily life?",
      "How did you account for pre-existing conditions?",
      "What does the life care plan cover?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Medical records", "Life care plan", "Demonstratives"],
    pitfalls: ["Over-technical medical language", "Insufficient jury visuals"],
    faqs: [
      { question: "How do juries respond to chronic pain testimony?", answer: "Best received when supported by objective testing, the treating physician's recommendations, and published clinical practice guidelines." },
    ],
    sources: [{ title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" }],
  },
  // ── Pediatric case types (birth injury, cerebral palsy) ───────
  {
    stage: "considering",
    caseTypeSlug: "birth-injury",
    dateModified: "2026-08-26",
    intro:
      "Before retaining a life care planner in a birth injury matter, confirm that the child's neurological injury has been characterized well enough for the treating team to describe long-term needs. The plan will usually be the largest damages component, so early documentation of baseline function matters.",
    checklist: [
      "Confirm the diagnosis and mechanism from the delivery and NICU records",
      "Determine whether a neurodevelopmental evaluation has been completed or scheduled",
      "Identify current therapies, equipment, feeding method, and seizure control",
      "Estimate the scope of the plan from the child's functional profile before committing to the full expert complement",
    ],
    questionsToAsk: [
      "Do you have pediatric life care planning experience with this type of injury?",
      "How do you handle life expectancy for a child with this functional profile?",
      "How do you coordinate with the developmental pediatrician and neurologist?",
    ],
    timeline: "2-4 weeks between initial consideration and retention, sooner if an early neurodevelopmental evaluation is scheduled.",
    requiredDocuments: [
      "Labor and delivery, NICU, and pediatric records",
      "Neurodevelopmental, therapy, and early intervention evaluations",
      "Current equipment, medication, and feeding documentation",
    ],
    pitfalls: [
      "Retaining a planner without pediatric experience",
      "Waiting until the child is older and losing the baseline picture",
    ],
    faqs: [
      {
        question: "Is a pediatric life care plan different from an adult plan?",
        answer: "Yes. It projects needs by developmental stage, replaces equipment with growth, and addresses the transition to adult services, and it must explain its life expectancy basis carefully.",
      },
    ],
    sources: [{ title: "NIH/NINDS - Neonatal Hypoxic-Ischemic Encephalopathy", url: "https://www.ninds.nih.gov/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "cerebral-palsy",
    dateModified: "2026-08-26",
    intro:
      "Before retaining a life care planner in a cerebral palsy matter, establish the child's Gross Motor Function Classification level and current care regimen. The level drives attendant care, equipment, and medical follow-up, and it anchors every projection in the plan.",
    checklist: [
      "Confirm the cerebral palsy diagnosis, type, and functional classification from the records",
      "Identify current spasticity management, orthotics, seating, and therapies",
      "Determine whether communication, feeding, or seizure needs are present",
      "Estimate plan scope from functional level before committing to the full expert complement",
    ],
    questionsToAsk: [
      "How does functional classification shape your projections?",
      "How do you handle equipment replacement as the child grows?",
      "How do you address educational services and public program offsets?",
    ],
    timeline: "2-4 weeks between initial consideration and retention.",
    requiredDocuments: [
      "Pediatric neurology, physiatry, and orthopedic records",
      "Therapy evaluations and individualized education plans",
      "Equipment, orthotic, and medication documentation",
    ],
    pitfalls: [
      "Treating the current care regimen as static rather than projecting developmental transitions",
      "Overlooking adult residential and supported-living needs",
    ],
    faqs: [
      {
        question: "Does a cerebral palsy plan cover adulthood?",
        answer: "Yes. It projects the transition from pediatric to adult providers, day programs or vocational services, and long-term residential or in-home care through the projected life expectancy.",
      },
    ],
    sources: [{ title: "CDC - Cerebral Palsy", url: "https://www.cdc.gov/cerebral-palsy/", type: "gov" }],
  },
  {
    stage: "retaining",
    caseTypeSlug: "birth-injury",
    dateModified: "2026-08-26",
    intro:
      "Retaining experts in a birth injury matter typically involves a pediatric neurologist or neonatologist on causation, a pediatric life care planner, and an economist. Early coordination ensures the planner documents baseline function and obtains treating-team recommendations before growth changes the picture.",
    checklist: [
      "Confirm the injury characterization from delivery, NICU, and follow-up records",
      "Retain a life care planner with pediatric experience once liability review supports proceeding",
      "Provide neurodevelopmental, therapy, early intervention, and school records",
      "Arrange planner contact with the treating neurologist and developmental pediatrician",
      "Coordinate the planner and economist on life expectancy scenarios and care settings",
    ],
    questionsToAsk: [
      "How do you project needs across developmental stages?",
      "How do you document the basis for attendant care hours and equipment replacement?",
      "How do you present life expectancy when the literature supports a range?",
      "Have you testified in birth injury cases?",
    ],
    timeline:
      "60-120 days from retention to report, longer when a neurodevelopmental evaluation or physician conference is pending.",
    requiredDocuments: [
      "Labor and delivery, NICU, and pediatric records",
      "Neurodevelopmental and therapy evaluations",
      "Early intervention and individualized education plan records",
      "Equipment, medication, feeding, and seizure documentation",
      "Family caregiving log or description of daily care",
    ],
    pitfalls: [
      "Retaining a planner without pediatric experience",
      "Failing to present home-based and facility-based scenarios",
      "Leaving life expectancy assumptions undocumented",
    ],
    faqs: [
      {
        question: "Should the planner meet the child?",
        answer: "An in-person or video evaluation is standard practice and lets the planner document function, equipment, and daily care directly rather than relying on records alone.",
      },
      {
        question: "How is family-provided care handled?",
        answer: "The plan documents the hours and level of care the family provides and values them at market rates where the jurisdiction allows, distinguishing them from paid services already in place.",
      },
    ],
    sources: [
      { title: "NIH/NINDS - Neonatal Hypoxic-Ischemic Encephalopathy", url: "https://www.ninds.nih.gov/", type: "gov" },
      { title: "CDC - Developmental Disabilities", url: "https://www.cdc.gov/child-development/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "cerebral-palsy",
    dateModified: "2026-08-26",
    intro:
      "Retaining experts in a cerebral palsy matter typically involves the causation physician, a pediatric life care planner, and an economist. The planner needs the functional classification, the current care regimen, and access to the physiatrist, orthopedist, and therapy team to project needs through each developmental transition.",
    checklist: [
      "Confirm diagnosis, type, and functional classification from the records",
      "Retain a life care planner with pediatric and cerebral palsy experience",
      "Provide neurology, physiatry, orthopedic, therapy, and school records",
      "Arrange planner contact with the treating physiatrist and therapy team",
      "Coordinate the planner and economist on scenarios and public program offsets",
    ],
    questionsToAsk: [
      "How do you tie frequencies and replacement cycles to functional level and growth?",
      "How do you address spasticity management such as botulinum toxin or baclofen pump care?",
      "How do you distinguish publicly funded educational services from privately funded care?",
      "Have you testified in cerebral palsy cases?",
    ],
    timeline:
      "60-120 days from retention to report, depending on physician conference scheduling.",
    requiredDocuments: [
      "Pediatric neurology, physiatry, and orthopedic records",
      "Therapy evaluations and individualized education plans",
      "Orthotic, seating, and equipment records",
      "Medication and spasticity management records",
      "Description of daily care and family caregiving",
    ],
    pitfalls: [
      "Projecting today's regimen unchanged into adulthood",
      "Omitting orthopedic surgery and equipment replacement cycles",
      "Failing to address collateral-source rules for public services",
    ],
    faqs: [
      {
        question: "Is an orthopedic surgery sequence part of the plan?",
        answer: "Where the treating orthopedist anticipates procedures such as tendon lengthening or hip surveillance and surgery, the plan lists them with timing, hospitalization, and post-operative therapy.",
      },
      {
        question: "How are communication devices handled?",
        answer: "Augmentative communication devices are projected with the speech-language pathologist's recommendation, including replacement cycles, software, and training.",
      },
    ],
    sources: [
      { title: "CDC - Cerebral Palsy", url: "https://www.cdc.gov/cerebral-palsy/", type: "gov" },
    ],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "birth-injury",
    dateModified: "2026-08-26",
    intro:
      "Preparing a life care planner for deposition in a birth injury case focuses on the clinical foundation for each recommendation, the basis for attendant care hours and equipment replacement cycles, and the treatment of life expectancy and care setting scenarios.",
    checklist: [
      "Review the plan end-to-end against the treating-team recommendations",
      "Confirm every cost source and replacement cycle citation",
      "Prepare the expert on the life expectancy basis and any range presented",
      "Review the opposing plan or critique for anticipated lines",
      "Rehearse explanation of home-based versus facility-based scenarios",
    ],
    questionsToAsk: [
      "Which treating provider supports each recommendation?",
      "How did you determine attendant care hours?",
      "What is the basis for the life expectancy used and what changes if it differs?",
    ],
    timeline: "2-3 preparation sessions recommended prior to deposition.",
    requiredDocuments: ["Expert's full file", "Treating-team recommendation records", "Opposing plan or critique"],
    pitfalls: ["Unsupported items without a physician source", "Undocumented life expectancy assumptions"],
    faqs: [
      { question: "Should the expert bring the full file to deposition?", answer: "Yes, consistent with jurisdictional subpoena requirements." },
    ],
    sources: [{ title: "Federal Rule of Civil Procedure 30", url: "https://www.law.cornell.edu/rules/frcp/rule_30", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "cerebral-palsy",
    dateModified: "2026-08-26",
    intro:
      "Preparing a life care planner for deposition in a cerebral palsy case focuses on the link between functional classification and projected needs, the clinical basis for each frequency and replacement cycle, and the treatment of educational services and public program offsets.",
    checklist: [
      "Review the plan end-to-end against the treating-team recommendations",
      "Confirm the functional classification and its source in the record",
      "Prepare the expert on equipment replacement cycles and growth assumptions",
      "Review the opposing plan or critique for anticipated lines",
      "Rehearse explanation of public versus privately funded services",
    ],
    questionsToAsk: [
      "How does the child's functional level support each recommendation?",
      "What is the basis for each replacement cycle?",
      "How did you treat services provided through the school system?",
    ],
    timeline: "2-3 preparation sessions recommended prior to deposition.",
    requiredDocuments: ["Expert's full file", "Therapy and school records", "Opposing plan or critique"],
    pitfalls: ["Replacement cycles without a stated basis", "Confusing public program services with privately funded care"],
    faqs: [
      { question: "Should the expert bring the full file to deposition?", answer: "Yes, consistent with jurisdictional subpoena requirements." },
    ],
    sources: [{ title: "Federal Rule of Civil Procedure 30", url: "https://www.law.cornell.edu/rules/frcp/rule_30", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "birth-injury",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in a birth injury case requires the life care planner to explain, in plain terms, what the child needs each day, how those needs change with growth, and why each item, frequency, and cost in the plan is what it is.",
    checklist: [
      "Prepare jury-accessible visual aids showing care by developmental stage",
      "Rehearse direct testimony chronology from evaluation to plan",
      "Prepare on likely cross-examination themes: life expectancy, family care, and public programs",
      "Coordinate with the causation physician and economist",
    ],
    questionsToAsk: [
      "Can you describe a typical day of care for this child?",
      "How will the child's needs change at each stage of life?",
      "Why is each item in the plan necessary and what supports it?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Final plan", "Demonstratives", "Prior deposition transcripts"],
    pitfalls: ["Overly technical testimony", "Inconsistency with prior deposition"],
    faqs: [
      { question: "How are demonstratives used?", answer: "To show care categories by developmental stage, daily care schedules, and the difference between home-based and facility-based scenarios." },
    ],
    sources: [{ title: "NIH/NINDS - Neonatal Hypoxic-Ischemic Encephalopathy", url: "https://www.ninds.nih.gov/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "cerebral-palsy",
    dateModified: "2026-08-26",
    intro:
      "Trial testimony in a cerebral palsy case requires the life care planner to connect the child's functional level to concrete daily needs and to explain how equipment, therapy, and attendant care change through growth and into adulthood.",
    checklist: [
      "Prepare jury-accessible visual aids showing needs by functional level and age",
      "Rehearse direct testimony chronology from evaluation to plan",
      "Prepare on likely cross-examination themes: replacement cycles, school services, and adult care",
      "Coordinate with the causation physician and economist",
    ],
    questionsToAsk: [
      "Can you explain the child's functional level in lay terms?",
      "What equipment and care will the child need as an adult?",
      "What supports each frequency and replacement cycle in the plan?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Final plan", "Demonstratives", "Prior deposition transcripts"],
    pitfalls: ["Overly technical testimony", "Inconsistency with prior deposition"],
    faqs: [
      { question: "How are demonstratives used?", answer: "To show care categories by age, equipment replacement timelines, and the transition from pediatric to adult services." },
    ],
    sources: [{ title: "CDC - Cerebral Palsy", url: "https://www.cdc.gov/cerebral-palsy/", type: "gov" }],
  },
];

export function getJourney(stage: string, caseTypeSlug: string): JourneyStage | undefined {
  return journeys.find((j) => j.stage === stage && j.caseTypeSlug === caseTypeSlug);
}
