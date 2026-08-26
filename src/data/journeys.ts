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
    dateModified: "2026-04-21",
    intro:
      "Before retaining experts in a TBI matter, confirm that severity and cognitive sequelae will support damages claims for earning capacity and future care. Neuropsychological evaluation is typically a prerequisite.",
    checklist: [
      "Confirm TBI severity using clinical records",
      "Determine if neuropsychological evaluation is complete or scheduled",
      "Identify whether cognitive sequelae meaningfully affect prior occupation",
      "Estimate damages magnitude before committing to full expert complement",
    ],
    questionsToAsk: [
      "What expert credentials are needed for this severity level?",
      "Will vocational and life care planning both be required?",
      "How do you coordinate with the neuropsychologist?",
    ],
    timeline: "2-4 weeks between initial consideration and retention.",
    requiredDocuments: [
      "Acute care and rehabilitation records",
      "Neuropsychological screening results if available",
      "Employment history summary",
    ],
    pitfalls: [
      "Retaining before neuropsychological data is in",
      "Underestimating mild TBI in cognitively demanding work",
    ],
    faqs: [
      {
        question: "Do I need a vocational expert and a life care planner?",
        answer: "Severity dictates. Moderate-to-severe TBI typically warrants both.",
      },
    ],
    sources: [{ title: "CDC TBI", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-04-21",
    intro:
      "SCI matters nearly always warrant a life care plan. Before retention, confirm ASIA classification and scope of future care needs to match the expert complement.",
    checklist: [
      "Confirm ASIA Impairment Scale and neurological level",
      "Inventory current durable medical equipment and care arrangements",
      "Identify treating physiatrist for coordination",
      "Estimate life care plan scope and resulting expert fees",
    ],
    questionsToAsk: [
      "Do you have prior SCI case experience at this neurological level?",
      "How do you project attendant care needs?",
      "What is your approach to vehicle and home modifications?",
    ],
    timeline: "2-3 weeks typical between consideration and retention.",
    requiredDocuments: ["ASIA exam", "Rehab records", "Current DME inventory"],
    pitfalls: ["Retaining a non-SCI-experienced CLCP", "Missing attendant care scope"],
    faqs: [
      { question: "Is a vocational expert needed for high-level SCI?", answer: "Often, for earning capacity when residual work capacity remains debated." },
    ],
    sources: [{ title: "NSCISC", url: "https://www.nscisc.uab.edu/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "amputation",
    dateModified: "2026-04-21",
    intro:
      "Amputation matters frequently benefit from a life care plan for prosthetic projections and a vocational expert for earning capacity. Confirm prosthetic recommendations before retention.",
    checklist: [
      "Confirm level of amputation and prosthetic recommendation",
      "Review treating prosthetist notes",
      "Identify vocational impact given prior occupation",
      "Estimate prosthetic replacement cost over life expectancy",
    ],
    questionsToAsk: [
      "How do you cost prosthetic component replacement intervals?",
      "Do you account for advanced prosthetic technology?",
      "How do you opine on vocational options after amputation?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Surgical records", "Prosthetist notes", "Employment history"],
    pitfalls: ["Underestimating residual limb care costs", "Omitting socket replacements"],
    faqs: [
      { question: "Is a vocational expert necessary post-amputation?", answer: "When earning capacity or return-to-work is contested, yes." },
    ],
    sources: [{ title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-04-21",
    intro:
      "Burn injury damages typically require a life care plan addressing reconstructive surgery, compression garments, and mental health services. Confirm scope before retention.",
    checklist: [
      "Document total body surface area and reconstruction plan",
      "Review mental health and scar management needs",
      "Identify vocational impact for the prior occupation",
      "Estimate long-horizon reconstructive and scar management costs",
    ],
    questionsToAsk: [
      "Do you have burn-specific life care planning experience?",
      "How do you project staged reconstructive surgery costs?",
      "How do you address PTSD and body image in the plan?",
    ],
    timeline: "2-3 weeks before retention.",
    requiredDocuments: ["Burn center records", "Mental health records", "Photos if appropriate"],
    pitfalls: ["Ignoring compression garment recurring costs", "Under-scoping mental health"],
    faqs: [
      { question: "Are burn life care plans typically lengthy?", answer: "Yes, given lifetime compression garment, surgery, and mental health components." },
    ],
    sources: [{ title: "American Burn Association", url: "https://ameriburn.org/", type: "org" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "wrongful-death",
    dateModified: "2026-04-21",
    intro:
      "Wrongful death matters typically require a forensic economist and, in complex cases, a vocational expert. Identify earnings documentation and household composition before retention.",
    checklist: [
      "Gather decedent's tax returns, W-2s, and employment records",
      "Document household composition and dependents",
      "Identify household services the decedent performed",
      "Confirm jurisdictional personal consumption rule",
    ],
    questionsToAsk: [
      "How do you reconstruct earning capacity for decedents with limited records?",
      "What personal consumption percentage applies?",
      "How do you project household services?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Tax returns", "W-2s", "Household and dependents documentation"],
    pitfalls: ["Missing fringe benefits", "Generic personal consumption percentages"],
    faqs: [
      { question: "When is a vocational expert added to the economist?", answer: "When earning capacity reconstruction is complex (episodic work history, career change)." },
    ],
    sources: [{ title: "BLS ATUS", url: "https://www.bls.gov/tus/", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-04-21",
    intro:
      "Workers' compensation matters often require a vocational expert to evaluate return-to-work, alternative placement, or permanent disability. Confirm jurisdictional statutory framework before retention.",
    checklist: [
      "Review claim file and pre-injury job description",
      "Obtain treating provider restrictions",
      "Identify whether retraining is under consideration",
      "Confirm carrier expectations for expert involvement",
    ],
    questionsToAsk: [
      "Do you have experience in this state's workers' compensation system?",
      "Do you perform job analyses on-site?",
      "How do you document labor market surveys for workers' compensation purposes?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Claim file", "Job description", "Medical restrictions"],
    pitfalls: ["Applying civil-litigation methodology unchanged", "Missing state-specific rules"],
    faqs: [
      { question: "Is the same vocational expert useful in a companion civil suit?", answer: "Often yes, though the analyses differ." },
    ],
    sources: [{ title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" }],
  },
  {
    stage: "considering",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-04-21",
    intro:
      "MVA considerations scale to severity. Soft-tissue and minor injury cases may not warrant full expert involvement; catastrophic cases do.",
    checklist: [
      "Quantify likely damages magnitude",
      "Identify which experts are actually needed",
      "Match expert mix to severity",
      "Check calendar against expert availability",
    ],
    questionsToAsk: [
      "How do you distinguish accident-related from pre-existing limitations?",
      "When do you recommend a life care plan?",
    ],
    timeline: "1-3 weeks before retention.",
    requiredDocuments: ["Medical records", "Employment history", "Accident records"],
    pitfalls: ["Overscoping minor cases", "Underscoping catastrophic cases"],
    faqs: [
      { question: "Is chronic pain alone enough to warrant a vocational expert?", answer: "When it limits sustained work tolerance in cognitively or physically demanding occupations." },
    ],
    sources: [{ title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" }],
  },

  // ── Retaining stage ───────────────────────────────────────────
  {
    stage: "retaining",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-04-21",
    intro:
      "Burn injury expert retention centers on a life care plan that addresses staged reconstructive surgery, compression garments, scar management, and psychological services. Vocational analysis accounts for heat and sun tolerance and public-facing work considerations.",
    checklist: [
      "Document total body surface area burned, depth, and location",
      "Retain CLCP with burn-specific experience",
      "Coordinate with treating burn team on projected reconstruction schedule",
      "Retain vocational expert when return-to-work is contested",
      "Plan for mental health services in the life care plan",
    ],
    questionsToAsk: [
      "How do you project compression garment replacement costs?",
      "How do you account for staged reconstructive surgery?",
      "What vocational factors apply to burn survivors in this occupation?",
      "How do you incorporate mental health treatment?",
    ],
    timeline:
      "60-90 days from retention to report given complexity of staged reconstruction.",
    requiredDocuments: [
      "Burn center and reconstructive surgery records",
      "Current photos documenting scarring (when appropriate)",
      "Employment history",
      "Psychology/psychiatry records if applicable",
    ],
    pitfalls: [
      "Omitting compression garment recurring costs",
      "Underprojecting mental health services",
      "Ignoring occupational heat and sun exposure factors",
    ],
    faqs: [
      {
        question: "Why are mental health services so important in burn cases?",
        answer:
          "Peer-reviewed literature documents high incidence of PTSD, depression, and body image concerns in burn survivors. Plans routinely include individual therapy, group therapy, and psychiatric medication management.",
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
    dateModified: "2026-04-21",
    intro:
      "MVA expert retention scales to injury severity. Soft-tissue cases may use a vocational expert alone; catastrophic cases typically use vocational, life care planning, and economic experts together.",
    checklist: [
      "Assess injury severity and damages magnitude",
      "Match expert mix to severity (vocational only for minor, full complement for catastrophic)",
      "Obtain complete medical records and any FCE",
      "Coordinate with orthopedic, neurological, or rehabilitation treating providers as relevant",
    ],
    questionsToAsk: [
      "How does the injury mix affect your methodology?",
      "How do you handle chronic pain in vocational analysis?",
      "When do you recommend a life care plan for MVA cases?",
    ],
    timeline:
      "30-60 days for non-catastrophic cases; 60-90 days for catastrophic.",
    requiredDocuments: [
      "Medical records, imaging, FCE",
      "Employment history",
      "Accident report and records",
    ],
    pitfalls: [
      "Overscoping smaller cases with unnecessary experts",
      "Underscoping catastrophic cases by omitting life care planning",
    ],
    faqs: [
      {
        question: "Are MVA life care plans different?",
        answer:
          "Methodology is the same. Injury mix often blends orthopedic, neurological, and chronic pain elements, which the plan addresses in coordination with treating specialists.",
      },
    ],
    sources: [
      { title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-04-21",
    intro:
      "Retaining experts in TBI cases typically involves a neuropsychologist, vocational expert, life care planner, and forensic economist. Early coordination ensures the neuropsychological battery addresses the vocationally relevant domains.",
    checklist: [
      "Identify severity (mild, moderate, severe) from clinical records",
      "Confirm neuropsychological evaluation has been ordered or completed",
      "Retain vocational expert, life care planner, and economist together when possible",
      "Provide all neurological and neuropsych records, imaging, and prior FCEs",
      "Coordinate between experts on the injury profile and damages scope",
    ],
    questionsToAsk: [
      "How do you incorporate neuropsychological findings into your vocational opinion?",
      "What peer-reviewed literature do you use on TBI severity and worklife?",
      "How do you distinguish pre-existing from TBI-attributable limitations?",
      "Have you testified in moderate-to-severe TBI cases?",
    ],
    timeline:
      "45-90 days from retention to report, extending longer when neuropsychological evaluation is pending.",
    requiredDocuments: [
      "Neurological and neuropsychological evaluations",
      "Imaging (CT, MRI, DTI when available)",
      "Acute care and rehabilitation records",
      "Employment history, W-2s, tax returns",
      "Prior cognitive or vocational testing",
    ],
    pitfalls: [
      "Retaining before neuropsychological evaluation is complete, leading to incomplete opinion",
      "Overlooking mild TBI in cognitively demanding occupations",
      "Scope overlap between neuropsychologist and vocational expert",
    ],
    faqs: [
      {
        question: "Is a neuropsychological evaluation required?",
        answer:
          "Neuropsychological evaluation is strongly recommended in moderate-to-severe TBI. Mild TBI cases often benefit but may proceed without, depending on symptom persistence.",
      },
      {
        question: "Can TBI shorten worklife expectancy?",
        answer:
          "Peer-reviewed literature supports reduced worklife expectancy in moderate-to-severe TBI. Adjustments should be documented and tied to severity.",
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
    dateModified: "2026-04-21",
    intro:
      "SCI cases require coordination between treating physiatrist, life care planner, vocational expert, and economist. The life care plan typically anchors the damages case given the extensive future care.",
    checklist: [
      "Confirm ASIA Impairment Scale classification and neurological level",
      "Retain CLCP with SCI-specific experience",
      "Coordinate with treating physiatrist on future care recommendations",
      "Retain vocational expert and economist for earning capacity and present value",
      "Plan for periodic life care plan updates if settlement is distant",
    ],
    questionsToAsk: [
      "How does neurological level affect your vocational opinion?",
      "How do you cost equipment replacement intervals?",
      "What attendant care methodology do you use?",
      "How do you address reduced worklife expectancy for this level of injury?",
    ],
    timeline:
      "60-90 days from retention to a comprehensive life care plan. Vocational and economic reports can run in parallel.",
    requiredDocuments: [
      "Acute care, rehabilitation, and outpatient records",
      "ASIA examinations and imaging",
      "Durable medical equipment history",
      "Home and vehicle configuration details",
      "Employment history and earnings records",
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
          "Nearly all SCI cases with residual neurological deficit benefit from a life care plan. Very minor incomplete injuries may not require one.",
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
    dateModified: "2026-04-21",
    intro:
      "Amputation cases require prosthetic cost projections and vocational analysis tailored to the level of amputation and the physical demands of the claimant's pre-injury occupation.",
    checklist: [
      "Document level of amputation and dominant versus non-dominant side",
      "Identify prosthetic technology being used or recommended",
      "Retain CLCP familiar with prosthetic cost projection",
      "Retain vocational expert for earning capacity opinion",
      "Plan replacements for prosthetic components per manufacturer intervals",
    ],
    questionsToAsk: [
      "How do you project prosthetic replacement intervals?",
      "Do you account for advanced technology (myoelectric, osseointegration)?",
      "How do you address residual limb care and therapy?",
      "What vocational options remain given the claimant's work history?",
    ],
    timeline:
      "45-75 days depending on prosthetic complexity and cost-quote collection time.",
    requiredDocuments: [
      "Surgical and prosthetist records",
      "Current prosthetic device specifications",
      "Employment history and physical job demands",
      "Any FCE or return-to-work assessments",
    ],
    pitfalls: [
      "Omitting socket replacements or skin care supplies",
      "Using national averages where local cost data is available",
      "Failing to scope bilateral extremity amputations appropriately",
    ],
    faqs: [
      {
        question: "Do myoelectric prosthetics materially change damages?",
        answer:
          "Yes, because of higher acquisition cost and shorter component service life. Documentation of treating prosthetist recommendation is required.",
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
    dateModified: "2026-04-21",
    intro:
      "Wrongful death engagements typically involve a forensic economist (primary) and a vocational expert (when earning capacity reconstruction is complex). The economist projects and discounts lost earnings net of personal consumption.",
    checklist: [
      "Gather decedent's employment history, tax returns, W-2s",
      "Confirm jurisdictional rules on personal consumption and collateral sources",
      "Retain forensic economist; consider vocational expert for complex cases",
      "Document household services performed by the decedent",
      "Identify surviving dependents and applicable jurisdictional damages",
    ],
    questionsToAsk: [
      "How do you apply personal consumption?",
      "What worklife tables and discount rates will you use?",
      "Can you project for a decedent with limited earnings history?",
      "How do you quantify lost household services?",
    ],
    timeline:
      "30-60 days from retention to report when records are complete.",
    requiredDocuments: [
      "Birth certificate, death certificate",
      "Tax returns (3-5 years)",
      "W-2s and pay stubs",
      "Employer benefits summary",
      "Household composition and dependents information",
    ],
    pitfalls: [
      "Overlooking fringe benefits in the projection",
      "Applying a generic personal consumption percentage without household-specific adjustment",
      "Missing jurisdictional collateral source rules",
    ],
    faqs: [
      {
        question: "Do we always need both a vocational expert and an economist?",
        answer:
          "Economist is typically required. Vocational expert is added when earning capacity reconstruction requires vocational opinion (e.g., episodic employment history).",
      },
    ],
    sources: [
      { title: "BLS American Time Use Survey", url: "https://www.bls.gov/tus/", type: "gov" },
      { title: "U.S. Treasury Yield Curves", url: "https://home.treasury.gov/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-04-21",
    intro:
      "Workers' compensation vocational engagements focus on return-to-work planning, job analysis, and, where applicable, permanent partial or total disability analysis within the state's statutory framework.",
    checklist: [
      "Identify the jurisdiction's workers' compensation statute and process",
      "Obtain treating physician restrictions and any FCE",
      "Perform job analysis of pre-injury position",
      "Identify alternative work within restrictions",
      "Consider retraining or vocational rehabilitation if return to prior occupation is not feasible",
    ],
    questionsToAsk: [
      "Are you familiar with this state's workers' compensation vocational rules?",
      "Do you coordinate with the insurer's nurse case manager?",
      "How do you document job search efforts for mitigation purposes?",
    ],
    timeline:
      "30-45 days for most workers' compensation vocational engagements.",
    requiredDocuments: [
      "Claim file and wage statements",
      "Treating physician records and restrictions",
      "FCE if performed",
      "Pre-injury job description",
    ],
    pitfalls: [
      "Ignoring state-specific statutory procedure",
      "Overlooking the claimant's transferable skills",
      "Insufficient documentation of the labor market survey",
    ],
    faqs: [
      {
        question: "Does workers' compensation vocational work overlap with civil litigation?",
        answer:
          "Some overlap in methodology. Civil litigation tends to be more evaluative; workers' compensation tends to be more rehabilitation-oriented.",
      },
    ],
    sources: [
      { title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" },
    ],
  },
  {
    stage: "considering",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-04-21",
    intro:
      "Before retaining vocational, life care planning, or economic experts in a medical malpractice case, confirm standard-of-care and causation positions and identify the damages categories likely to require quantification.",
    checklist: [
      "Confirm standard-of-care expert opinion",
      "Confirm causation expert opinion",
      "Identify damages categories (earning capacity, future care, household services)",
      "Identify whether incremental-harm analysis is required",
      "Budget for expert fees across records review, reports, and testimony",
    ],
    questionsToAsk: [
      "What vocational or life care planning expertise is needed for this injury profile?",
      "Will incremental-harm analysis require coordination across multiple experts?",
      "What is the expected timeline from retention to report?",
    ],
    timeline:
      "Typically 2-4 weeks between first considering retention and executing engagement letters, depending on expert availability.",
    requiredDocuments: [
      "Preliminary medical records summary",
      "Standard-of-care and causation expert draft opinions",
      "Claimant's employment and educational background",
    ],
    pitfalls: [
      "Retaining before causation is clear, wasting expert fees on speculative scope",
      "Missing the FCE or neuropsychological evaluation window",
      "Underestimating the incremental-harm analysis complexity",
    ],
    faqs: [
      {
        question: "How early should I start considering expert retention?",
        answer:
          "As soon as standard-of-care and causation theories are articulated. Early consideration preserves flexibility in expert selection.",
      },
    ],
    sources: [
      { title: "Federal Rule of Evidence 702", url: "https://www.law.cornell.edu/rules/fre/rule_702", type: "gov" },
    ],
  },
  {
    stage: "considering",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-04-21",
    intro:
      "Before retaining a vocational, life care planning, or economic expert in a personal injury case, evaluate whether earning capacity, future care, or household services losses are meaningfully contested and at what magnitude.",
    checklist: [
      "Quantify the likely magnitude of future losses",
      "Identify which damages categories are actually disputed",
      "Budget for expert engagement",
      "Confirm expert availability against case calendar",
    ],
    questionsToAsk: [
      "Is earning capacity contested, or will stipulated figures suffice?",
      "Is the future care need significant enough to warrant a life care plan?",
      "What is the expert's admissibility history in this injury type?",
    ],
    timeline:
      "1-3 weeks between first consideration and engagement.",
    requiredDocuments: [
      "Injury severity summary",
      "Preliminary damages estimate",
      "Expert CVs for candidates under consideration",
    ],
    pitfalls: [
      "Retaining experts prematurely on soft-tissue cases where damages are small",
      "Delaying retention past the records completion point",
    ],
    faqs: [
      {
        question: "Do all personal injury cases need a vocational expert?",
        answer:
          "No. The test is whether earning capacity is meaningfully contested and whether the magnitude warrants expert involvement.",
      },
    ],
    sources: [
      { title: "Federal Rule of Evidence 702", url: "https://www.law.cornell.edu/rules/fre/rule_702", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-04-20",
    intro:
      "Retaining a vocational, life care planning, or forensic economic expert in a medical malpractice matter requires early coordination with standard-of-care and causation experts. The retained expert should be briefed on the alleged breach, the but-for baseline, and the incremental injury attributable to the breach so that vocational, life-care, and economic opinions are properly scoped.",
    checklist: [
      "Confirm the case theory (alleged breach and causation) before expert retention",
      "Send the engagement letter outlining scope, hourly rate, retainer, and deliverables",
      "Provide all medical records, imaging, and prior expert reports",
      "Coordinate with standard-of-care and causation experts to align scope",
      "Schedule an initial conference to discuss methodology and deliverable timeline",
      "Confirm deposition and trial dates as early as possible to preserve expert availability",
    ],
    questionsToAsk: [
      "What is your credentialing and prior testimony history in medical malpractice cases?",
      "How will you isolate incremental harm from baseline medical needs?",
      "What peer-reviewed literature supports your methodology in this case type?",
      "How do you coordinate with physician experts on causation-dependent conclusions?",
      "What is your admissibility history and have you ever been excluded?",
    ],
    timeline:
      "Typical engagement from retention to report: 45-90 days depending on records volume and whether in-person evaluation is needed. Plan for deposition 30-60 days after report, and trial testimony based on the court's calendar.",
    requiredDocuments: [
      "Complete certified medical records (pre- and post-event)",
      "Imaging, pathology, and lab results",
      "Treating provider depositions (if available)",
      "Standard-of-care expert reports",
      "Causation expert reports",
      "Claimant's employment history, tax returns, W-2s",
      "Prior vocational testing (if any)",
    ],
    pitfalls: [
      "Retaining too late and truncating the records review period",
      "Scope ambiguity between the vocational expert, life care planner, and economist",
      "Failing to isolate incremental harm from baseline care",
      "Overlapping or conflicting opinions among retained experts",
    ],
    faqs: [
      {
        question: "Do I need all three (vocational, life care planner, economist) on a med mal case?",
        answer:
          "Not always. Catastrophic outcomes typically benefit from the full combination; less severe injuries may only require one or two.",
      },
      {
        question: "Who coordinates between the retained experts?",
        answer:
          "Retaining counsel coordinates, though the life care planner can set up inter-expert communication protocols when several experts are retained on the same case.",
      },
    ],
    sources: [
      { title: "Federal Rule of Evidence 702", url: "https://www.law.cornell.edu/rules/fre/rule_702", type: "gov" },
      { title: "AHRQ - Patient Safety Resources", url: "https://www.ahrq.gov/", type: "gov" },
    ],
  },
  {
    stage: "retaining",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-04-20",
    intro:
      "Retaining an expert in a personal injury case should follow a decision that earning capacity, employability, or future care is meaningfully contested. Early retention allows the expert to inform FCE referrals, deposition questions, and medical records collection.",
    checklist: [
      "Confirm the contested damages issue (earning capacity, future care, household services)",
      "Send the engagement letter and retainer",
      "Provide medical records, employment history, educational records",
      "Schedule any needed FCE and neuropsychological evaluation",
      "Set an initial call to align on methodology and deliverable timeline",
      "Preserve expert availability for deposition and trial",
    ],
    questionsToAsk: [
      "What is your experience in cases involving this injury type?",
      "How will you apply the claimant's medical restrictions to labor market options?",
      "What labor market data do you use for this geographic area?",
      "How will you coordinate with my life care planner or forensic economist?",
      "How do you handle a pre-injury earning history that is not fully documented?",
    ],
    timeline:
      "Typical engagement from retention to report: 30-60 days. Rush timelines can be accommodated when records are complete and evaluation is not required.",
    requiredDocuments: [
      "Complete medical records",
      "Functional capacity evaluation (if performed)",
      "Employment records, W-2s, tax returns",
      "Educational records",
      "Prior vocational testing (if any)",
      "Deposition transcripts of the claimant and treating providers",
    ],
    pitfalls: [
      "Late retention compressing the evaluation window",
      "Incomplete employment history reducing the earning capacity base",
      "Missing FCE or neuropsychological data required to set restrictions",
      "Scope ambiguity when life care planner or economist are also retained",
    ],
    faqs: [
      {
        question: "How early should I retain a vocational expert?",
        answer:
          "As soon as it becomes clear earning capacity is contested. Early retention lets the expert inform discovery and avoid gaps in the record.",
      },
      {
        question: "What if pre-injury income was not fully reported?",
        answer:
          "Experts can use labor market data and education-based earnings tables to establish a reasonable pre-injury base, with clear documentation of the approach.",
      },
    ],
    sources: [
      { title: "BLS Occupational Employment Statistics", url: "https://www.bls.gov/oes/", type: "gov" },
      { title: "O*NET OnLine", url: "https://www.onetonline.org/", type: "gov" },
    ],
  },

  // ── Preparing for Deposition ──────────────────────────────────
  {
    stage: "preparing-deposition",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-04-21",
    intro:
      "Preparing a vocational or life care planning expert for deposition in a TBI case focuses on the neuropsychological integration, severity classification, and the methodology used to translate cognitive findings into vocational or care projections.",
    checklist: [
      "Review the expert report end-to-end",
      "Confirm all source citations and file materials",
      "Prepare the expert on contested severity classification",
      "Review opposing expert's report for anticipated lines",
      "Rehearse explanation of neuropsychological-to-vocational translation",
    ],
    questionsToAsk: [
      "What severity classifications did you consider and why?",
      "How did you apply neuropsychological findings to earning capacity?",
      "How did you address pre-existing conditions?",
    ],
    timeline: "2-3 preparation sessions recommended prior to deposition.",
    requiredDocuments: ["Expert's full file", "Neuropsychological reports", "Opposing expert's report"],
    pitfalls: ["Overreaching on severity", "Weak documentation of peer-reviewed worklife adjustments"],
    faqs: [
      { question: "Should the expert bring the full file to deposition?", answer: "Yes, consistent with jurisdictional subpoena requirements." },
    ],
    sources: [{ title: "Federal Rule of Civil Procedure 30", url: "https://www.law.cornell.edu/rules/frcp/rule_30", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-04-21",
    intro:
      "Deposition preparation in SCI cases centers on equipment cost defenses, attendant care methodology, and the neurological-level basis for the life care plan.",
    checklist: [
      "Reconfirm equipment replacement interval sources",
      "Review attendant care methodology and rate data",
      "Prepare on ASIA classification specifics",
      "Review opposing CLCP or physician critiques",
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
      { question: "Can attendant care hour opinions be challenged?", answer: "They commonly are; defend with functional assessment and documented hours by service type." },
    ],
    sources: [{ title: "NSCISC", url: "https://www.nscisc.uab.edu/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "amputation",
    dateModified: "2026-04-21",
    intro:
      "Deposition preparation in amputation cases focuses on prosthetic cost quotations, replacement intervals, and the vocational analysis supporting residual earning capacity.",
    checklist: [
      "Verify all prosthetic cost quotations are current",
      "Confirm replacement intervals match manufacturer specifications",
      "Review vocational opinion step-by-step",
      "Prepare on advanced-technology cost disputes",
    ],
    questionsToAsk: [
      "How did you source component costs?",
      "What intervals did you apply and why?",
      "How did you evaluate myoelectric or osseointegration recommendations?",
    ],
    timeline: "2 preparation sessions.",
    requiredDocuments: ["Prosthetist quotes", "Replacement interval documentation", "Vocational report"],
    pitfalls: ["Stale cost data", "Over-reliance on national averages"],
    faqs: [
      { question: "How are advanced prosthetic technologies defended in deposition?", answer: "With treating prosthetist recommendation and documented cost rationale." },
    ],
    sources: [{ title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-04-21",
    intro:
      "Burn injury deposition prep addresses staged reconstruction scheduling, compression garment cost recurrence, and the mental health component of the plan.",
    checklist: [
      "Review staged reconstruction timing with treating plastic surgeon",
      "Confirm compression garment replacement frequency",
      "Prepare on mental health justification",
      "Review vocational heat/sun tolerance considerations",
    ],
    questionsToAsk: [
      "How did you plan reconstruction timing?",
      "What supports the mental health frequency?",
      "How did you account for occupational exposure to heat?",
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
    dateModified: "2026-04-21",
    intro:
      "Wrongful death deposition prep focuses on personal consumption, worklife assumptions, fringe benefit calculations, and household services valuation.",
    checklist: [
      "Review personal consumption percentage and its basis",
      "Confirm worklife table selection and rationale",
      "Document fringe benefits sources",
      "Prepare household services valuation defense",
    ],
    questionsToAsk: [
      "How did you derive the personal consumption percentage?",
      "Which worklife table did you use and why?",
      "How did you value household services?",
    ],
    timeline: "1-2 preparation sessions.",
    requiredDocuments: ["Personal consumption analysis", "Worklife references", "Fringe benefit documentation"],
    pitfalls: ["Generic personal consumption without household-specific adjustment", "Stale fringe benefit data"],
    faqs: [
      { question: "Can personal consumption be contested?", answer: "It is frequently the primary dispute; documentation of methodology is essential." },
    ],
    sources: [{ title: "BLS ATUS", url: "https://www.bls.gov/tus/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-04-21",
    intro:
      "Med mal deposition prep centers on isolating incremental harm, coordinating with causation experts, and defending the but-for baseline assumptions.",
    checklist: [
      "Confirm the causation opinion the damages experts relied upon",
      "Document the but-for baseline assumptions",
      "Review incremental harm isolation methodology",
      "Prepare on pre-existing condition analysis",
    ],
    questionsToAsk: [
      "How did you isolate incremental harm from baseline?",
      "Which causation opinion did you rely on?",
      "How did you handle pre-existing conditions?",
    ],
    timeline: "2-3 preparation sessions given complexity.",
    requiredDocuments: ["Causation expert report", "Standard-of-care expert report", "Damages expert report"],
    pitfalls: ["Inconsistency with causation opinion", "Weak documentation of but-for baseline"],
    faqs: [
      { question: "Are damages experts cross-examined on causation?", answer: "Not directly, but on whether the damages opinion is consistent with the relied-upon causation opinion." },
    ],
    sources: [{ title: "AHRQ", url: "https://www.ahrq.gov/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-04-21",
    intro:
      "PI deposition prep addresses methodology defense, functional capacity application, and labor market data sources.",
    checklist: [
      "Review TSA and LMS methodology step-by-step",
      "Confirm FCE results application to occupations",
      "Review peer-reviewed references relied upon",
      "Prepare on pre-existing conditions",
    ],
    questionsToAsk: [
      "Walk us through your transferable skills analysis",
      "How did you apply the FCE results?",
      "What labor market data did you use?",
    ],
    timeline: "2 preparation sessions.",
    requiredDocuments: ["Expert report", "FCE", "Labor market survey documentation"],
    pitfalls: ["Weak documentation of labor market survey", "Overgeneralization of FCE results"],
    faqs: [
      { question: "How specific should the labor market survey be?", answer: "Specific to the claimant's geographic area, with employer names and dates." },
    ],
    sources: [{ title: "BLS OES", url: "https://www.bls.gov/oes/", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-04-21",
    intro:
      "Workers' compensation deposition prep focuses on state-specific procedure, job analysis documentation, and the return-to-work framework.",
    checklist: [
      "Confirm familiarity with the state's WC rules",
      "Review job analysis documentation",
      "Prepare on suitable alternative work identification",
      "Document any retraining recommendations",
    ],
    questionsToAsk: [
      "Are you familiar with this state's WC vocational rules?",
      "How did you perform the job analysis?",
      "What alternative occupations did you identify and why?",
    ],
    timeline: "1-2 preparation sessions.",
    requiredDocuments: ["Job analysis", "Medical restrictions", "Alternative occupation analysis"],
    pitfalls: ["Importing civil-litigation methodology into WC", "Missing state-specific procedural requirements"],
    faqs: [
      { question: "Is on-site job analysis required?", answer: "Preferred when feasible; otherwise thorough documentation of position demands." },
    ],
    sources: [{ title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" }],
  },
  {
    stage: "preparing-deposition",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-04-21",
    intro:
      "MVA deposition prep addresses injury-related limitation documentation, pre-existing condition analysis, and the vocational translation of chronic pain.",
    checklist: [
      "Review medical restrictions documentation",
      "Confirm pre-existing condition analysis",
      "Prepare on chronic pain vocational impact",
      "Review labor market survey if applicable",
    ],
    questionsToAsk: [
      "How did you distinguish accident-related from pre-existing limitations?",
      "How did you handle chronic pain in the vocational opinion?",
      "What labor market data did you rely on?",
    ],
    timeline: "1-2 preparation sessions.",
    requiredDocuments: ["Medical records", "Employment history", "Labor market survey"],
    pitfalls: ["Failing to address pre-existing conditions", "Overreliance on subjective pain reporting"],
    faqs: [
      { question: "How is chronic pain's vocational impact defended?", answer: "With peer-reviewed literature on chronic pain in occupational settings and FCE findings." },
    ],
    sources: [{ title: "NHTSA", url: "https://www.nhtsa.gov/", type: "gov" }],
  },

  // ── Trial Testimony ───────────────────────────────────────────
  {
    stage: "trial",
    caseTypeSlug: "traumatic-brain-injury",
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in TBI cases requires translating neuropsychological and vocational findings into jury-accessible explanations of how cognitive deficits affect earning capacity and life care needs.",
    checklist: [
      "Prepare jury-accessible visual aids",
      "Rehearse direct testimony chronology",
      "Prepare on likely cross-examination themes",
      "Coordinate with neuropsychologist and economist",
    ],
    questionsToAsk: [
      "Can you explain the TBI and its effects in lay terms?",
      "What occupations can the claimant still perform?",
      "What is the economic effect of the cognitive deficits?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Final expert report", "Demonstratives", "Prior deposition transcripts"],
    pitfalls: ["Overly technical testimony", "Inconsistency with prior deposition"],
    faqs: [
      { question: "How are demonstratives used?", answer: "To visualize brain regions affected, occupational demand comparisons, and care timelines." },
    ],
    sources: [{ title: "CDC TBI", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "spinal-cord-injury",
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in SCI cases emphasizes the life care plan structure, attendant care justification, and the durable medical equipment requirements.",
    checklist: [
      "Prepare visual representation of the life care plan",
      "Rehearse attendant care justification",
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
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in amputation cases focuses on prosthetic functionality, replacement costs, and the vocational implications of the level of amputation.",
    checklist: [
      "Prepare prosthetic demonstratives",
      "Rehearse cost projection narrative",
      "Prepare on vocational option comparisons",
      "Coordinate with treating prosthetist if available",
    ],
    questionsToAsk: [
      "Explain the prosthetic components and their costs",
      "What occupations remain given this level of amputation?",
      "Why is replacement needed at these intervals?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Prosthetic device details", "Cost documentation", "Vocational report"],
    pitfalls: ["Over-technical prosthetic jargon", "Missing local cost context"],
    faqs: [
      { question: "Can a prosthetist testify alongside the life care planner?", answer: "Yes; joint testimony coordination is common." },
    ],
    sources: [{ title: "O&P", url: "https://www.oandp.org/", type: "org" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "burn-injury",
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in burn injury cases requires sensitive presentation of staged reconstruction needs, mental health components, and lifetime garment and care costs.",
    checklist: [
      "Prepare demonstratives on reconstruction staging",
      "Coordinate sensitive presentation of claimant's condition",
      "Rehearse mental health justification",
      "Prepare on labor market impact of visible scarring",
    ],
    questionsToAsk: [
      "Walk the jury through the reconstruction schedule",
      "Why is ongoing mental health support needed?",
      "How does visible scarring affect public-facing occupations?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Life care plan", "Mental health records (with claimant consent)", "Reconstruction schedule"],
    pitfalls: ["Overexposing claimant in demonstratives", "Under-supporting mental health components"],
    faqs: [
      { question: "How are photos handled?", answer: "Judiciously, with careful weighing of probative value against undue prejudice." },
    ],
    sources: [{ title: "Phoenix Society", url: "https://www.phoenix-society.org/", type: "org" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "wrongful-death",
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in wrongful death cases centers on clear presentation of lost earnings, fringe benefits, personal consumption adjustments, and household services.",
    checklist: [
      "Prepare present-value demonstratives",
      "Rehearse personal consumption explanation",
      "Prepare household services visualization",
      "Coordinate with any vocational expert",
    ],
    questionsToAsk: [
      "Walk the jury through the earnings projection",
      "Why is personal consumption deducted?",
      "How did you value household services?",
    ],
    timeline: "1 day-of-trial prep session.",
    requiredDocuments: ["Economic report", "Demonstratives"],
    pitfalls: ["Losing the jury in economic terminology", "Missing fringe benefits"],
    faqs: [
      { question: "How are household services visualized?", answer: "Commonly by task category with hourly data and local rates." },
    ],
    sources: [{ title: "BLS ATUS", url: "https://www.bls.gov/tus/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "medical-malpractice",
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in med mal cases requires clear separation of baseline from incremental harm, coordination with causation testimony, and disciplined presentation of damages.",
    checklist: [
      "Align testimony with causation expert's trial testimony",
      "Prepare clear incremental-harm narrative",
      "Rehearse but-for baseline articulation",
      "Prepare demonstratives on harm differential",
    ],
    questionsToAsk: [
      "How do you separate baseline from incremental harm?",
      "What does the but-for baseline look like?",
      "How did you coordinate with the causation expert?",
    ],
    timeline: "2 day-of-trial prep sessions given complexity.",
    requiredDocuments: ["Causation expert transcript", "Damages report", "Demonstratives"],
    pitfalls: ["Inconsistency with causation testimony", "Blurring baseline and incremental harm"],
    faqs: [
      { question: "Can damages experts attend causation testimony?", answer: "Yes, subject to sequestration rulings; often useful for coordination." },
    ],
    sources: [],
  },
  {
    stage: "trial",
    caseTypeSlug: "personal-injury",
    dateModified: "2026-04-21",
    intro:
      "Trial testimony in personal injury cases requires clear explanation of methodology, accessible presentation of labor market data, and confident handling of pre-existing condition questions.",
    checklist: [
      "Prepare accessible TSA explanation",
      "Rehearse labor market survey presentation",
      "Prepare on pre-existing condition questions",
      "Coordinate demonstratives with economist",
    ],
    questionsToAsk: [
      "Explain how transferable skills analysis works",
      "What occupations remain?",
      "How do you address pre-existing conditions?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Expert report", "Demonstratives", "Labor market data summary"],
    pitfalls: ["Over-reliance on DOT jargon", "Insufficient visuals"],
    faqs: [
      { question: "How are vocational demonstratives typically structured?", answer: "Side-by-side pre- and post-injury occupational comparisons with wage data." },
    ],
    sources: [{ title: "O*NET", url: "https://www.onetonline.org/", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "workers-compensation",
    dateModified: "2026-04-21",
    intro:
      "WC trial or hearing testimony addresses return-to-work feasibility, permanent disability analysis, and vocational rehabilitation services where applicable.",
    checklist: [
      "Prepare for administrative tribunal procedure",
      "Rehearse job analysis presentation",
      "Prepare on retraining recommendations",
      "Coordinate with nurse case manager if retained",
    ],
    questionsToAsk: [
      "What are the physical demands of the pre-injury job?",
      "What alternative work is available?",
      "Is retraining warranted?",
    ],
    timeline: "1 day-of-hearing prep session.",
    requiredDocuments: ["Job analysis", "Labor market documentation", "Retraining proposals"],
    pitfalls: ["Applying civil-litigation tone to WC hearings", "Missing statutory terminology"],
    faqs: [
      { question: "Is testimony at WC hearings cross-examined?", answer: "Yes, with procedural rules varying by state." },
    ],
    sources: [{ title: "U.S. DOL OWCP", url: "https://www.dol.gov/agencies/owcp", type: "gov" }],
  },
  {
    stage: "trial",
    caseTypeSlug: "motor-vehicle-accident",
    dateModified: "2026-04-21",
    intro:
      "MVA trial testimony emphasizes accessible explanation of injury-related limitations, vocational impact, and the scope of any life care plan.",
    checklist: [
      "Prepare accessible injury explanation",
      "Rehearse vocational impact presentation",
      "Prepare on pre-existing condition questions",
      "Coordinate with life care planner if retained",
    ],
    questionsToAsk: [
      "What limitations does the injury impose on work?",
      "How did you account for pre-existing conditions?",
      "What does the life care plan cover?",
    ],
    timeline: "1-2 day-of-trial prep sessions.",
    requiredDocuments: ["Medical records", "Expert report", "Demonstratives"],
    pitfalls: ["Over-technical medical language", "Insufficient jury visuals"],
    faqs: [
      { question: "How do juries respond to chronic pain testimony?", answer: "Best received when supported by objective testing and peer-reviewed literature." },
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
