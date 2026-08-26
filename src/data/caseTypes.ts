import type { Faq, Source } from "./types";

export type CaseTypeCategory =
  | "personal-injury"
  | "workers-comp"
  | "med-mal"
  | "matrimonial"
  | "employment"
  | "wrongful-death";

export interface CaseType {
  slug: string;
  name: string;
  category: CaseTypeCategory;
  summary: string;
  vocationalImpact: string;
  economicExposure: string;
  lifeCareImpact?: string;
  relevantServices: string[];
  relevantCredentials: string[];
  icdCodes?: string[];
  faqs: Faq[];
  sources: Source[];
}

export const caseTypes: CaseType[] = [
  {
    slug: "traumatic-brain-injury",
    name: "Traumatic Brain Injury",
    category: "personal-injury",
    summary:
      "Traumatic brain injury (TBI) cases involve a bump, blow, or jolt to the head, or a penetrating head injury, that disrupts normal brain function. Vocational and economic damages in TBI matters are often complex because cognitive, behavioral, and emotional sequelae may coexist with physical limitations, and the injured person's pre-injury earning capacity must be reconstructed from education, training, work history, and transferable skills.",
    vocationalImpact:
      "TBI can reduce sustained attention, executive function, processing speed, short-term memory, and emotional regulation. These limitations often prevent an individual from returning to skilled or high-demand occupations, and in moderate-to-severe cases may preclude competitive employment entirely. A vocational evaluation establishes residual work capacity, employability, and placeability in the relevant labor market, integrating neuropsychological test results with medical restrictions and transferable skills analysis.",
    economicExposure:
      "Economic damages in TBI matters commonly include lost earnings, lost earning capacity, lost household services, lost fringe benefits, and the present value of future wage loss across the claimant's worklife expectancy. In catastrophic cases damages can extend into lost retirement contributions and reduced worklife expectancy.",
    lifeCareImpact:
      "Life care plans for TBI routinely address cognitive rehabilitation, neuropsychological follow-up, medications, assistive technology, case management, home modifications, attendant care, and in severe cases 24-hour supervised care. Plans are typically built in coordination with the treating physiatrist, neurologist, and neuropsychologist.",
    relevantServices: ["vocational-expert", "life-care-planning", "forensic-economics", "standard-of-care"],
    relevantCredentials: ["crc", "clcp", "cve", "abve-d", "md", "phd"],
    icdCodes: ["S06", "S06.2", "S06.3", "S06.9"],
    faqs: [
      {
        question: "What is a traumatic brain injury for litigation purposes?",
        answer:
          "For litigation, TBI is typically defined using clinical criteria such as the Glasgow Coma Scale, loss of consciousness, post-traumatic amnesia, and imaging findings, consistent with CDC and American Congress of Rehabilitation Medicine guidance. Severity is generally classified as mild, moderate, or severe, which correlates with expected functional outcomes.",
      },
      {
        question: "How is earning capacity evaluated after a TBI?",
        answer:
          "Earning capacity is evaluated by integrating the pre-injury vocational profile (education, training, skills, work history, earnings) with post-injury medical and neuropsychological findings, applying transferable skills analysis and labor market data to determine what occupations remain within the person's residual functional capacity and what those occupations pay in the relevant geographic labor market.",
      },
      {
        question: "Do mild TBI cases require vocational experts?",
        answer:
          "Mild TBI cases can require vocational experts when persistent post-concussive symptoms affect occupational performance, particularly in cognitively demanding roles. Not every mild TBI results in vocational loss, which is precisely why an objective evaluation is useful in litigation.",
      },
      {
        question: "How does a life care planner coordinate with treating physicians in TBI cases?",
        answer:
          "A certified life care planner obtains recommendations from the treating team (physiatrist, neurologist, neuropsychologist, therapists) and translates those recommendations into a comprehensive, itemized plan of care with projected costs over the life expectancy of the evaluee.",
      },
      {
        question: "What economic damages categories apply to TBI cases?",
        answer:
          "Common categories include past and future lost earnings, loss of earning capacity, lost household services, lost fringe benefits, and the present value of future medical and non-medical care set out in a life care plan. Reduced worklife expectancy may also apply in severe cases.",
      },
      {
        question: "Can a TBI shorten worklife expectancy?",
        answer:
          "Peer-reviewed literature indicates that moderate and severe TBI can reduce worklife expectancy due to earlier labor force withdrawal, reduced employment probability, and increased mortality risk. A forensic economist applies published worklife tables and, where appropriate, adjusts for severity.",
      },
      {
        question: "Are TBI vocational opinions admissible under the governing framework?",
        answer:
          "Vocational opinions grounded in accepted methodology (transferable skills analysis, labor market survey, standardized assessments, DOT and O*NET data) and delivered by appropriately credentialed experts have a long history of admissibility in both state and federal courts.",
      },
    ],
    sources: [
      { title: "CDC: Traumatic Brain Injury and Concussion", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" },
      { title: "NIH/NINDS: Traumatic Brain Injury Information Page", url: "https://www.ninds.nih.gov/health-information/disorders/traumatic-brain-injury-tbi", type: "gov" },
      { title: "BLS Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/", type: "gov" },
      { title: "O*NET OnLine", url: "https://www.onetonline.org/", type: "gov" },
      { title: "Commission on Rehabilitation Counselor Certification - CRC Scope of Practice", url: "https://crccertification.com/", type: "org" },
    ],
  },
  {
    slug: "spinal-cord-injury",
    name: "Spinal Cord Injury",
    category: "personal-injury",
    summary:
      "Spinal cord injury (SCI) cases address the vocational, economic, and life-care consequences of partial or complete loss of motor or sensory function below the level of injury. Outcomes vary substantially with neurological level and ASIA Impairment Scale classification, which drives the scope of both vocational opinion and life care plan.",
    vocationalImpact:
      "Depending on neurological level, individuals with SCI may retain capacity for seated, sedentary, or technology-assisted work, or may require substantial workplace accommodation. Vocational evaluation establishes residual functional capacity, ergonomic requirements, and realistic occupational options within the relevant labor market, including assistive technology considerations.",
    economicExposure:
      "Damages typically include past and future lost earnings, loss of earning capacity, lost household services, lost fringe benefits, and the present value of a comprehensive life care plan. Household services losses can be particularly significant in SCI cases.",
    lifeCareImpact:
      "Life care plans for SCI commonly address routine medical care, rehabilitation therapies, durable medical equipment (wheelchairs, transfer aids, pressure-relief surfaces), home modifications, vehicle modifications, attendant care or personal care attendants, bowel and bladder supplies, and periodic replacements of equipment over the lifespan.",
    relevantServices: ["life-care-planning", "vocational-expert", "forensic-economics"],
    relevantCredentials: ["clcp", "crc", "cve", "md", "phd"],
    icdCodes: ["S14", "S24", "S34"],
    faqs: [
      {
        question: "How does neurological level affect vocational opinion in SCI cases?",
        answer:
          "Neurological level and ASIA Impairment Scale classification determine residual motor and sensory function. Higher-level cervical injuries typically impose more extensive functional limitations, while lower thoracic or lumbar injuries may permit return to sedentary or seated work with accommodation.",
      },
      {
        question: "What equipment is commonly included in an SCI life care plan?",
        answer:
          "Plans commonly include manual or power wheelchairs, cushions and positioning devices, transfer equipment, shower/commode chairs, hospital beds, pressure-relief mattresses, standing frames, and vehicle lifts. Replacement intervals follow manufacturer specifications and peer-reviewed guidance.",
      },
      {
        question: "Are home modifications included in SCI damages?",
        answer:
          "Home modifications are commonly projected in a life care plan and include doorway widening, ramps, accessible bathrooms, roll-in showers, lowered counters, and lift systems. Life care planners coordinate with occupational therapists and accessibility consultants as needed.",
      },
      {
        question: "How are attendant care needs quantified?",
        answer:
          "Attendant care needs are determined by functional assessment, typically expressed in hours per day by service type (personal care, homemaking, supervision). Projected costs use published home care rate data for the relevant geographic area.",
      },
      {
        question: "What services does KWVRS typically provide in SCI matters?",
        answer:
          "KWVRS typically provides a vocational evaluation, a certified life care plan, and forensic economic analysis quantifying lost earnings, lost earning capacity, and present value of future care and wage loss.",
      },
      {
        question: "Does SCI affect worklife expectancy?",
        answer:
          "Peer-reviewed literature suggests that SCI can reduce worklife expectancy, with magnitude varying by neurological level, age at injury, and secondary health conditions. Forensic economists apply published worklife tables and adjust where supported by the record.",
      },
    ],
    sources: [
      { title: "Christopher & Dana Reeve Foundation - Paralysis Resource Guide", url: "https://www.christopherreeve.org/", type: "org" },
      { title: "National Spinal Cord Injury Statistical Center", url: "https://www.nscisc.uab.edu/", type: "gov" },
      { title: "ASIA Impairment Scale", url: "https://asia-spinalinjury.org/", type: "org" },
      { title: "BLS Occupational Employment Statistics", url: "https://www.bls.gov/oes/", type: "gov" },
    ],
  },
  {
    slug: "amputation",
    name: "Amputation",
    category: "personal-injury",
    summary:
      "Amputation cases involve the loss of a limb or part of a limb, with vocational, economic, and life-care implications driven by level of amputation, dominant versus non-dominant side, and the physical demands of the claimant's prior occupation. Prosthetic technology, replacement intervals, and ongoing rehabilitation are central to life care planning.",
    vocationalImpact:
      "Upper extremity amputations typically affect fine motor tasks, bilateral coordination, and lifting capacity. Lower extremity amputations affect standing, walking, and ambulation tolerance. A vocational evaluation integrates medical restrictions, prosthetic function, and transferable skills to determine residual employment options.",
    economicExposure:
      "Damages commonly include past and future lost earnings, loss of earning capacity, lost household services, prosthetic costs with projected replacements, and the present value of the full life care plan.",
    lifeCareImpact:
      "Life care plans for amputation routinely include prosthetic devices and components with documented replacement intervals, socket replacements, gait training, occupational therapy, skin care supplies, residual limb care, and when appropriate osseointegration follow-up or advanced myoelectric technology.",
    relevantServices: ["life-care-planning", "vocational-expert", "forensic-economics"],
    relevantCredentials: ["clcp", "crc", "cve", "md"],
    icdCodes: ["S68", "S78", "S88", "S98"],
    faqs: [
      {
        question: "How is prosthetic replacement projected in a life care plan?",
        answer:
          "Prosthetic components have documented average service lives published by manufacturers and prosthetics literature. Life care planners project replacements at those intervals across the remaining life expectancy, with costs sourced from prosthetic providers in the claimant's geographic area.",
      },
      {
        question: "Do upper and lower extremity amputations have different vocational implications?",
        answer:
          "Yes. Upper extremity amputations primarily affect fine motor tasks, grip strength, and bilateral coordination; lower extremity amputations primarily affect ambulation tolerance, standing, and stair climbing. Each profile pairs with different occupational options in the labor market.",
      },
      {
        question: "Are myoelectric or osseointegrated prosthetics included in plans?",
        answer:
          "They can be, when medically indicated and supported by the treating prosthetist and physiatrist. Advanced technology often has higher acquisition cost and shorter service life for electronic components, which is reflected in projected plan costs.",
      },
      {
        question: "How is residual earning capacity determined post-amputation?",
        answer:
          "A vocational expert integrates pre-injury work history, transferable skills, post-injury medical restrictions, functional capacity, and labor market data to identify alternative occupations and their wage ranges in the claimant's geographic labor market.",
      },
      {
        question: "What household services losses are typical in amputation cases?",
        answer:
          "Household services losses typically include tasks requiring bilateral strength or prolonged standing, such as lawn care, heavy housework, home repair, and certain cooking activities. Loss is quantified using time-use surveys and local wage rates for equivalent services.",
      },
    ],
    sources: [
      { title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" },
      { title: "American Academy of Orthotists & Prosthetists", url: "https://www.oandp.org/", type: "org" },
      { title: "VA Amputation System of Care", url: "https://www.va.gov/rehab/amputation.asp", type: "gov" },
      { title: "BLS Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/", type: "gov" },
    ],
  },
  {
    slug: "wrongful-death",
    name: "Wrongful Death",
    category: "wrongful-death",
    summary:
      "Wrongful death cases quantify the economic loss to survivors and the estate resulting from a decedent's death, most commonly as lost earnings, lost fringe benefits, lost household services, and lost personal services or guidance. The vocational component reconstructs the decedent's pre-death earning capacity; the economic component reduces projected losses to present value net of personal consumption.",
    vocationalImpact:
      "For a decedent, the vocational component reconstructs earning capacity at the time of death using education, training, work history, industry trajectories, and labor market data. In some jurisdictions, a claimant spouse's earning capacity is also evaluated where household services or income contributions are at issue.",
    economicExposure:
      "Damages typically include lost earnings and earning capacity across the decedent's worklife, lost fringe benefits, lost household services, and in some jurisdictions loss of personal consortium, care, guidance, and advice. Projections are reduced to present value using appropriate discount rates and net of personal consumption.",
    relevantServices: ["forensic-economics", "vocational-expert"],
    relevantCredentials: ["abve-d", "abve-f", "crc", "phd"],
    faqs: [
      {
        question: "What is personal consumption and why is it deducted?",
        answer:
          "Personal consumption is the portion of the decedent's earnings that would have been spent on the decedent's own maintenance rather than provided to survivors. It is deducted so that damages reflect the net economic loss to the survivors, consistent with standard forensic economic practice.",
      },
      {
        question: "How is lost earning capacity projected for a decedent who had not yet entered the workforce?",
        answer:
          "For young decedents or those with limited earnings history, economists use education-based and demographic-based earnings tables from Census/CPS data, applied to an expected career path consistent with the decedent's documented abilities and plans.",
      },
      {
        question: "Are lost household services compensable in wrongful death cases?",
        answer:
          "In most jurisdictions, yes. Lost household services are valued using time-use survey data and local market wage rates for equivalent services such as childcare, home maintenance, meal preparation, and transportation.",
      },
      {
        question: "What discount rate is applied to wrongful death damages?",
        answer:
          "Forensic economists apply discount rates drawn from Treasury yields matched to the projection horizon, often in a net discount rate framework that also accounts for expected wage growth. Jurisdiction-specific rules may apply.",
      },
      {
        question: "Do defense and plaintiff economists typically disagree on the same case?",
        answer:
          "They often disagree on worklife assumptions, growth rates, discount rates, and personal consumption percentages. Retaining an economist credentialed by a recognized forensic body helps ensure the methodology is defensible.",
      },
    ],
    sources: [
      { title: "BLS Occupational Employment Statistics", url: "https://www.bls.gov/oes/", type: "gov" },
      { title: "Census Bureau - Current Population Survey", url: "https://www.census.gov/programs-surveys/cps.html", type: "gov" },
      { title: "BLS American Time Use Survey", url: "https://www.bls.gov/tus/", type: "gov" },
      { title: "National Center for Health Statistics - Life Expectancy", url: "https://www.cdc.gov/nchs/", type: "gov" },
    ],
  },
  {
    slug: "medical-malpractice",
    name: "Medical Malpractice",
    category: "med-mal",
    summary:
      "Medical malpractice cases address injury allegedly caused by a deviation from the accepted standard of care. Vocational, economic, and life-care analyses typically accompany standard-of-care and causation opinions, quantifying the incremental harm attributable to the alleged breach.",
    vocationalImpact:
      "Vocational opinions in medical malpractice focus on the post-injury loss relative to the but-for baseline, integrating the claimant's pre-event vocational profile with medical restrictions attributable to the alleged breach. Where pre-existing conditions are present, apportionment is a key consideration.",
    economicExposure:
      "Damages typically include past and future lost earnings, loss of earning capacity, lost household services, and present value of a life care plan focused on incremental care attributable to the alleged breach rather than unrelated baseline care.",
    lifeCareImpact:
      "Medical malpractice life care plans generally isolate incremental future medical and non-medical needs attributable to the alleged breach, separating baseline care the claimant would have required absent the event.",
    relevantServices: ["standard-of-care", "life-care-planning", "vocational-expert", "forensic-economics"],
    relevantCredentials: ["md", "clcp", "crc", "abve-d"],
    faqs: [
      {
        question: "How is incremental harm isolated in medical malpractice damages?",
        answer:
          "Life care planners and economists separate care and losses attributable to the alleged breach from those the claimant would have experienced in the but-for scenario, informed by medical causation opinions from treating and retained physicians.",
      },
      {
        question: "What role does a standard of care expert play alongside vocational and economic experts?",
        answer:
          "The standard of care expert establishes whether a breach occurred. Vocational, life care planning, and economic experts quantify the consequences of the breach, provided causation is supported.",
      },
      {
        question: "Can birth injury cases use the same damages framework?",
        answer:
          "Birth injury cases use a similar framework, with special attention to life expectancy, long-term care needs, worklife projected from demographic norms, and pediatric-specific life care planning methodology.",
      },
      {
        question: "How are pre-existing conditions handled in damages analysis?",
        answer:
          "Pre-existing conditions are accounted for by establishing a but-for baseline of expected medical needs and earning capacity absent the breach, with damages limited to the incremental loss.",
      },
    ],
    sources: [
      { title: "Agency for Healthcare Research and Quality", url: "https://www.ahrq.gov/", type: "gov" },
      { title: "National Practitioner Data Bank", url: "https://www.npdb.hrsa.gov/", type: "gov" },
      { title: "CMS Physician Fee Schedule", url: "https://www.cms.gov/medicare/physician-fee-schedule", type: "gov" },
      { title: "BLS Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/", type: "gov" },
    ],
  },
  {
    slug: "burn-injury",
    name: "Burn Injury",
    category: "personal-injury",
    summary:
      "Burn injury cases involve thermal, chemical, electrical, or radiation burns with vocational and life-care consequences driven by total body surface area, depth, location, and complications such as contractures, scarring, and psychological sequelae.",
    vocationalImpact:
      "Burn survivors may face limitations in heat tolerance, sun exposure, manual dexterity, and public-facing work due to visible scarring. A vocational evaluation integrates reconstructive surgical plans, medical restrictions, and psychological factors when identifying suitable occupational options.",
    economicExposure:
      "Damages include lost earnings, lost earning capacity, lost household services, and present value of future reconstructive surgeries, skin care, compression garments, and psychological treatment.",
    lifeCareImpact:
      "Plans commonly include staged reconstructive surgery, compression garments with replacement intervals, specialized wound care supplies, scar management, physical and occupational therapy, and mental health services addressing PTSD and body image concerns.",
    relevantServices: ["life-care-planning", "vocational-expert", "forensic-economics"],
    relevantCredentials: ["clcp", "crc", "md"],
    icdCodes: ["T20", "T21", "T22", "T23", "T24", "T25"],
    faqs: [
      {
        question: "How do compression garments factor into a life care plan?",
        answer:
          "Compression garments are typically worn daily for extended periods and replaced multiple times per year per manufacturer specifications. Life care planners project annual replacement costs across the wear period recommended by the treating team.",
      },
      {
        question: "Are psychological services commonly included in burn life care plans?",
        answer:
          "Yes, reflecting the high incidence of PTSD, depression, and body image concerns in burn survivors. Plans often include individual therapy, group therapy, and periodic psychiatric medication management.",
      },
      {
        question: "What vocational considerations apply to burn survivors?",
        answer:
          "Considerations include heat and sun exposure tolerance, grip strength, fine motor function, and the social dimensions of public-facing roles when visible scarring is present. These factors inform the accommodation analysis.",
      },
    ],
    sources: [
      { title: "American Burn Association", url: "https://ameriburn.org/", type: "org" },
      { title: "Phoenix Society for Burn Survivors", url: "https://www.phoenix-society.org/", type: "org" },
      { title: "CDC: Burn Prevention", url: "https://www.cdc.gov/masstrauma/factsheets/public/burns.pdf", type: "gov" },
    ],
  },
  {
    slug: "personal-injury",
    name: "Personal Injury",
    category: "personal-injury",
    summary:
      "Personal injury cases encompass a broad range of physical and psychological harms arising from negligence. Vocational, economic, and life-care experts quantify the functional, earnings, and care consequences of the injury.",
    vocationalImpact:
      "A vocational evaluation establishes residual functional capacity, transferable skills, and labor market options consistent with post-injury medical restrictions. The analysis supports earning capacity opinion and accommodation planning.",
    economicExposure:
      "Damages may include past and future lost earnings, loss of earning capacity, lost household services, lost fringe benefits, and present value of any needed life care plan.",
    relevantServices: ["vocational-expert", "life-care-planning", "forensic-economics"],
    relevantCredentials: ["crc", "cve", "abve-d", "clcp"],
    faqs: [
      {
        question: "When is a vocational evaluation warranted in a personal injury case?",
        answer:
          "A vocational evaluation is typically warranted when the injury is alleged to have reduced the claimant's earning capacity or ability to sustain competitive employment, or when future employability is contested.",
      },
      {
        question: "What is the difference between lost earnings and loss of earning capacity?",
        answer:
          "Lost earnings reflect actual wages the claimant did not receive. Loss of earning capacity is a broader vocational concept reflecting the difference between pre-injury and post-injury capacity to earn, regardless of whether that capacity was being fully realized prior to injury.",
      },
      {
        question: "Are household services losses always included in personal injury damages?",
        answer:
          "Household services losses are considered when the claimant performed unpaid services (childcare, home maintenance, meal preparation) that the injury now prevents. Valuation uses time-use data and local replacement service rates.",
      },
    ],
    sources: [
      { title: "BLS Occupational Employment Statistics", url: "https://www.bls.gov/oes/", type: "gov" },
      { title: "BLS American Time Use Survey", url: "https://www.bls.gov/tus/", type: "gov" },
      { title: "O*NET OnLine", url: "https://www.onetonline.org/", type: "gov" },
    ],
  },
  {
    slug: "workers-compensation",
    name: "Workers' Compensation",
    category: "workers-comp",
    summary:
      "Workers' compensation matters involve work-related injury or illness with vocational rehabilitation, return-to-work analysis, and earning capacity components governed by state-specific statutes.",
    vocationalImpact:
      "Vocational analysis in workers' compensation focuses on return-to-work planning, job analysis of the pre-injury position, identification of alternative work within medical restrictions, and when applicable retraining or vocational rehabilitation services.",
    economicExposure:
      "Economic exposure varies by jurisdiction and commonly includes temporary total disability, permanent partial or total disability, vocational rehabilitation services, and in some cases lump-sum settlements calculated against earning capacity.",
    relevantServices: ["vocational-expert", "forensic-economics"],
    relevantCredentials: ["crc", "cve", "lrc"],
    faqs: [
      {
        question: "How does workers' compensation vocational rehabilitation differ from civil vocational evaluation?",
        answer:
          "Workers' compensation rehabilitation is typically forward-looking and service-oriented, aimed at returning the worker to suitable employment. Civil vocational evaluation is typically evaluative, establishing earning capacity and employability for litigation purposes.",
      },
      {
        question: "What is a job analysis in workers' compensation?",
        answer:
          "A job analysis documents the physical, cognitive, and environmental demands of the pre-injury position so that medical restrictions can be mapped to specific job requirements and modifications or alternative placement considered.",
      },
      {
        question: "Are permanent partial disability ratings the same as earning capacity opinions?",
        answer:
          "No. PPD ratings are impairment-based and typically derive from the AMA Guides to the Evaluation of Permanent Impairment. Earning capacity opinions are vocational and labor-market-based.",
      },
    ],
    sources: [
      { title: "U.S. DOL Office of Workers' Compensation Programs", url: "https://www.dol.gov/agencies/owcp", type: "gov" },
      { title: "AMA Guides to the Evaluation of Permanent Impairment", url: "https://www.ama-assn.org/", type: "org" },
      { title: "International Association of Rehabilitation Professionals", url: "https://rehabpro.org/", type: "org" },
    ],
  },
  {
    slug: "long-term-disability",
    name: "Long Term Disability",
    category: "employment",
    summary:
      "Long-term disability (LTD) matters assess whether a claimant is capable of performing their own or any occupation under the applicable policy definition, drawing on medical records, functional capacity evaluations, and labor market analysis.",
    vocationalImpact:
      "LTD vocational analysis applies the relevant policy definition (own occupation, any occupation, reasonable occupation) to the claimant's documented functional capacity and transferable skills, identifying whether suitable occupations exist within medical restrictions.",
    economicExposure:
      "Exposure is defined by the policy - monthly benefit amount, offsets, cost-of-living adjustments, and benefit duration to the policy maximum age.",
    relevantServices: ["vocational-expert"],
    relevantCredentials: ["crc", "cve", "abve-d"],
    faqs: [
      {
        question: "What is the 'own occupation' versus 'any occupation' distinction?",
        answer:
          "Own-occupation policies assess disability based on inability to perform the claimant's pre-disability occupation. Any-occupation policies assess inability to perform any occupation for which the claimant is reasonably suited by education, training, and experience.",
      },
      {
        question: "How is a transferable skills analysis used in LTD matters?",
        answer:
          "Transferable skills analysis identifies occupations the claimant could theoretically perform based on pre-disability skills, applied to the residual functional capacity to determine whether suitable alternative occupations exist within the policy's definition.",
      },
      {
        question: "Do LTD cases often involve ERISA?",
        answer:
          "Employer-sponsored group LTD plans are typically governed by ERISA, which constrains procedural issues and review standards. Individual disability policies are generally governed by state insurance law.",
      },
    ],
    sources: [
      { title: "U.S. Department of Labor - ERISA", url: "https://www.dol.gov/general/topic/retirement/erisa", type: "gov" },
      { title: "Social Security Administration - Disability Evaluation", url: "https://www.ssa.gov/disability/", type: "gov" },
      { title: "O*NET OnLine", url: "https://www.onetonline.org/", type: "gov" },
    ],
  },
  {
    slug: "wrongful-termination",
    name: "Wrongful Termination",
    category: "employment",
    summary:
      "Wrongful termination cases quantify back pay, front pay, and mitigation efforts, often requiring a vocational evaluation of the claimant's post-termination job search, marketable skills, and comparable-occupation wage data.",
    vocationalImpact:
      "Vocational analysis addresses the claimant's reasonable job search, the availability of comparable positions in the relevant labor market, and the time required to secure comparable or alternative employment.",
    economicExposure:
      "Damages typically include back pay (from termination to trial), front pay (from trial to expected re-employment), lost benefits, and loss of earning capacity where applicable. Mitigation offsets apply.",
    relevantServices: ["vocational-expert", "forensic-economics"],
    relevantCredentials: ["crc", "cve", "cprw"],
    faqs: [
      {
        question: "What does 'mitigation' mean in wrongful termination cases?",
        answer:
          "Mitigation refers to the claimant's obligation to make reasonable efforts to obtain comparable alternative employment. A vocational expert can opine on the reasonableness of the job search and the expected time to secure comparable work.",
      },
      {
        question: "How is front pay calculated?",
        answer:
          "Front pay projects expected future losses from the date of trial to a reasonable end point - often the expected date of comparable re-employment or a jurisdictionally accepted cutoff. Present value reduction applies.",
      },
      {
        question: "Are lost retirement contributions compensable?",
        answer:
          "In many cases, yes. Employer retirement contributions (401(k) match, pension accruals) and projected interest are quantified as part of lost benefits.",
      },
    ],
    sources: [
      { title: "EEOC Enforcement Guidance", url: "https://www.eeoc.gov/", type: "gov" },
      { title: "BLS Occupational Employment Statistics", url: "https://www.bls.gov/oes/", type: "gov" },
      { title: "BLS Current Employment Statistics", url: "https://www.bls.gov/ces/", type: "gov" },
    ],
  },
  {
    slug: "matrimonial",
    name: "Matrimonial",
    category: "matrimonial",
    summary:
      "Matrimonial vocational evaluations quantify earning capacity for support and maintenance determinations, often where one spouse has been out of the workforce or is imputed an earning capacity different from actual income.",
    vocationalImpact:
      "A vocational evaluation reconstructs the spouse's earning capacity based on education, training, work history, and local labor market conditions, addressing any re-entry timeline and retraining needs.",
    economicExposure:
      "Exposure is defined by jurisdictional support formulas applied to imputed or actual income. Vocational opinions can significantly affect temporary and permanent support determinations.",
    relevantServices: ["vocational-expert"],
    relevantCredentials: ["crc", "cve", "abve-d"],
    faqs: [
      {
        question: "What is earning capacity imputation in divorce?",
        answer:
          "When a court finds that a spouse is voluntarily underemployed or unemployed, it may impute earning capacity based on education, training, and labor market data, applying that figure rather than actual income to support calculations.",
      },
      {
        question: "How does a vocational expert address re-entry after a career interruption?",
        answer:
          "The expert evaluates skill currency, retraining needs, expected re-entry wage trajectory, and a realistic timeline to reach full earning capacity, supported by labor market data.",
      },
      {
        question: "Are matrimonial vocational reports different from personal injury reports?",
        answer:
          "Yes. Matrimonial reports focus on prospective earning capacity for support purposes, while personal injury reports focus on the effect of an injury on capacity to earn. Methodology and labor market data are similar; application differs.",
      },
    ],
    sources: [
      { title: "BLS Occupational Employment Statistics", url: "https://www.bls.gov/oes/", type: "gov" },
      { title: "O*NET OnLine", url: "https://www.onetonline.org/", type: "gov" },
      { title: "Census Bureau - Educational Attainment & Earnings", url: "https://www.census.gov/topics/education/educational-attainment.html", type: "gov" },
    ],
  },
  {
    slug: "motor-vehicle-accident",
    name: "Motor Vehicle Accident",
    category: "personal-injury",
    summary:
      "Motor vehicle accident (MVA) cases cover a spectrum of injury severity, from soft tissue to catastrophic. Vocational, economic, and life care planning analyses scale to the functional consequences of the crash.",
    vocationalImpact:
      "Vocational analysis translates MVA-related injuries (orthopedic, TBI, SCI, chronic pain) into residual functional capacity and occupational options within the relevant labor market.",
    economicExposure:
      "Damages commonly include lost earnings, lost earning capacity, lost household services, and present value of future care in moderate-to-catastrophic cases.",
    lifeCareImpact:
      "Life care plans are indicated in catastrophic MVA cases and address ongoing orthopedic, neurological, and rehabilitative care, along with durable medical equipment and attendant care where needed.",
    relevantServices: ["vocational-expert", "life-care-planning", "forensic-economics"],
    relevantCredentials: ["crc", "clcp", "abve-d"],
    faqs: [
      {
        question: "Are soft tissue MVA cases appropriate for vocational evaluation?",
        answer:
          "They can be, particularly where chronic pain affects sustained work tolerance. Not every soft tissue case warrants vocational evaluation - the test is whether earning capacity or employability is meaningfully contested.",
      },
      {
        question: "How are MVA life care plans different from other life care plans?",
        answer:
          "The methodology is the same; what differs is the injury mix. MVA plans frequently blend orthopedic, neurological, and chronic pain management care, coordinated with the relevant treating specialists.",
      },
      {
        question: "Is a forensic economist needed even in smaller MVA cases?",
        answer:
          "A forensic economist is most useful where future loss or present-value calculations are at issue. Smaller cases may rely on stipulated values rather than a full forensic economic report.",
      },
    ],
    sources: [
      { title: "NHTSA - Traffic Safety Facts", url: "https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars", type: "gov" },
      { title: "CDC - Motor Vehicle Safety", url: "https://www.cdc.gov/motorvehiclesafety/", type: "gov" },
      { title: "BLS Occupational Outlook Handbook", url: "https://www.bls.gov/ooh/", type: "gov" },
    ],
  },
];

export function getCaseType(slug: string): CaseType | undefined {
  return caseTypes.find((c) => c.slug === slug);
}
