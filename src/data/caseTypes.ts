import type { Faq, Source } from "./types";

export type CaseTypeCategory =
  | "personal-injury"
  | "workers-comp"
  | "med-mal"
  | "wrongful-death"
  | "birth-injury";

export interface CaseType {
  slug: string;
  name: string;
  category: CaseTypeCategory;
  summary: string;
  careNeeds: string;
  costExposure: string;
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
      "Traumatic brain injury (TBI) matters involve a blow, jolt, or penetrating injury to the head that disrupts brain function. From a life care planning standpoint, TBI is distinctive because cognitive, behavioral, and emotional sequelae drive care needs as much as physical limitations do, and because the need for supervision and case management often persists long after acute rehabilitation ends. The life care plan documents every category of future care the injury makes necessary and the basis for each recommendation.",
    careNeeds:
      "TBI plans typically address physiatry and neurology follow-up, neuropsychological re-evaluation at defined intervals, cognitive rehabilitation, speech-language and occupational therapy, medications for seizures, headache, mood, and sleep, assistive technology for memory and organization, case management, home safety modifications, transportation, and attendant care or supervision. In moderate-to-severe injury the plan addresses 24-hour supervision, behavioral support, and residential or supported-living options when family caregiving is not sustainable.",
    costExposure:
      "Cost is driven first by the hours and level of supervision or attendant care the injury requires, then by the frequency and duration of therapies, medication, and physician follow-up across the projected life expectancy. Plans commonly present home-based and facility-based scenarios so that counsel and the economist can value each, and they identify which items are one-time, recurring, or replaced on a cycle.",
    lifeCareImpact:
      "The planner builds the plan from the treating physiatrist, neurologist, and neuropsychologist's recommendations, then documents frequency, duration, and cost for each item using local provider rates. Life expectancy is addressed from the evaluee's functional profile, with the sources stated so the plan can be examined and defended. Where severity is contested, the plan states the clinical basis for the level of care projected.",
    relevantServices: ["life-care-planning", "catastrophic-injury-planning", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn", "phd"],
    icdCodes: ["S06", "S06.2", "S06.3", "S06.9"],
    faqs: [
      {
        question: "When should a life care planner be retained in a TBI case?",
        answer:
          "Once the injury has stabilized enough for the treating team to describe long-term needs, typically after acute rehabilitation and an initial neuropsychological evaluation. Retaining before those data exist produces a plan that has to be substantially revised.",
      },
      {
        question: "Does a mild TBI warrant a life care plan?",
        answer:
          "Sometimes. Persistent post-concussive symptoms can require ongoing therapy, medication, and periodic specialist follow-up. The planner documents what the treating providers actually recommend rather than assuming a level of care from the diagnosis alone.",
      },
      {
        question: "How is supervision quantified in a TBI life care plan?",
        answer:
          "Supervision and attendant care are expressed in hours per day by level of service, based on functional assessment and the treating team's recommendations. The plan states who provides the care, at what rate, and whether family-provided care is valued at market rates in the jurisdiction.",
      },
      {
        question: "How does the life care planner coordinate with the neuropsychologist?",
        answer:
          "The neuropsychological evaluation identifies the cognitive and behavioral deficits; the planner translates those findings into specific services, frequencies, and durations, and confirms the recommendations with the treating providers before costing them.",
      },
      {
        question: "Does a TBI affect the life expectancy used in the plan?",
        answer:
          "It can, particularly in severe injury. The planner presents the basis for the life expectancy used, and where the evidence supports a range, shows the cost of the plan at each end of the range so counsel can decide how to present it.",
      },
    ],
    sources: [
      { title: "CDC: Traumatic Brain Injury and Concussion", url: "https://www.cdc.gov/traumaticbraininjury/", type: "gov" },
      { title: "NIH/NINDS: Traumatic Brain Injury Information Page", url: "https://www.ninds.nih.gov/health-information/disorders/traumatic-brain-injury-tbi", type: "gov" },
    ],
  },
  {
    slug: "spinal-cord-injury",
    name: "Spinal Cord Injury",
    category: "personal-injury",
    summary:
      "Spinal cord injury (SCI) matters address the lifelong care consequences of partial or complete loss of motor and sensory function below the level of injury. Neurological level and completeness determine the scope of the plan, from equipment and supplies to attendant care and the medical surveillance needed to prevent secondary complications.",
    careNeeds:
      "SCI plans address physiatry follow-up, urology and bowel programs with supplies, skin integrity and pressure-injury prevention, respiratory care in high cervical injury, spasticity management, physical and occupational therapy, manual and power wheelchairs with seating and replacement cycles, transfer and lift equipment, hospital beds and pressure-relief surfaces, home accessibility modifications, adapted vehicles, and personal care attendants at hours determined by functional level.",
    costExposure:
      "Attendant care and durable medical equipment replacement dominate SCI plan cost, followed by recurring supplies and the periodic hospitalizations associated with urinary tract infection, pressure injury, and other secondary conditions. Cost rises steeply with higher neurological levels, and plans generally show the difference between home-based care with attendants and facility-based care.",
    lifeCareImpact:
      "The planner documents the evaluee's neurological level and functional status, obtains recommendations from the physiatrist and rehabilitation team, and projects each item's frequency, duration, and replacement cycle with the basis stated. Life expectancy is addressed with attention to level, completeness, and age at injury, and the plan is written so each line can be traced to a clinical recommendation and a local cost source.",
    relevantServices: ["catastrophic-injury-planning", "life-care-planning", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["S14", "S24", "S34"],
    faqs: [
      {
        question: "How does neurological level shape the SCI life care plan?",
        answer:
          "Higher cervical injuries generally require ventilatory support, extensive attendant care, and power mobility; lower thoracic and lumbar injuries may permit independence in transfers and self-care with manual mobility. The plan states the level and completeness and ties each recommendation to them.",
      },
      {
        question: "What equipment is included and how often is it replaced?",
        answer:
          "Wheelchairs, cushions, transfer equipment, shower and commode chairs, beds, pressure-relief mattresses, standing frames, and vehicle adaptations are typical. Replacement intervals follow manufacturer guidance and clinical practice and are stated in the plan for each item.",
      },
      {
        question: "Are home modifications part of the plan?",
        answer:
          "Yes. Ramps, doorway widening, accessible bathrooms, roll-in showers, lowered work surfaces, and lift systems are projected, usually with input from an occupational therapist or accessibility consultant, and one-time costs are separated from recurring costs.",
      },
      {
        question: "How are attendant care hours determined?",
        answer:
          "By functional assessment and the treating team's recommendations, expressed in hours per day by level of service. The plan documents the rate source and addresses whether family-provided care is valued.",
      },
      {
        question: "Does the plan account for complications common after SCI?",
        answer:
          "It should. Urinary tract infections, pressure injuries, autonomic dysreflexia, and respiratory complications are addressed through preventive care, supplies, and a documented allowance for periodic hospitalization where the treating physician supports it.",
      },
    ],
    sources: [
      { title: "National Spinal Cord Injury Statistical Center", url: "https://www.nscisc.uab.edu/", type: "gov" },
      { title: "ASIA Impairment Scale", url: "https://asia-spinalinjury.org/", type: "org" },
      { title: "Christopher & Dana Reeve Foundation - Paralysis Resource Guide", url: "https://www.christopherreeve.org/", type: "org" },
    ],
  },
  {
    slug: "amputation",
    name: "Amputation",
    category: "personal-injury",
    summary:
      "Amputation matters involve the loss of all or part of a limb, with care needs driven by level of amputation, upper versus lower extremity, residual limb health, and prosthetic candidacy. Prosthetic technology and its replacement schedule are usually the central life care planning question, alongside the therapy, skin care, and follow-up that keep a prosthesis usable.",
    careNeeds:
      "Amputation plans address prosthetist and physiatrist follow-up, prosthetic devices and components with documented service lives, socket replacement as the residual limb changes, liners, sleeves, and supplies, gait and prosthetic training, physical and occupational therapy, residual limb and skin care, pain management including phantom limb pain, mobility aids for non-prosthetic use, and psychological support. Bilateral and upper-extremity amputations often add attendant care and home modification.",
    costExposure:
      "Prosthetic acquisition and replacement drive cost, and the choice between mechanical, microprocessor, or myoelectric technology changes both the purchase price and the replacement cycle. Recurring supplies, therapy after each new device, and long-term joint and spine care from altered gait add to the profile across the projected life expectancy.",
    lifeCareImpact:
      "The planner documents the evaluee's amputation level, prosthetic history, and functional level, then works with the treating prosthetist and physiatrist to project the device type, components, and replacement schedule. Each item carries a stated basis and a local cost, and the plan distinguishes what is medically indicated now from what may become appropriate as technology or the evaluee's function changes.",
    relevantServices: ["life-care-planning", "catastrophic-injury-planning", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["S68", "S78", "S88", "S98"],
    faqs: [
      {
        question: "How is prosthetic replacement projected?",
        answer:
          "Prosthetic components have manufacturer and clinical service-life expectations. The plan projects replacement at those intervals across the remaining life expectancy, with socket replacement more frequent in the early years as the residual limb matures, and costs drawn from prosthetic providers in the evaluee's area.",
      },
      {
        question: "Are advanced prosthetics such as microprocessor knees or myoelectric hands included?",
        answer:
          "When the treating prosthetist and physiatrist support them for the evaluee's functional level. Advanced devices carry higher acquisition costs and, for electronic components, shorter service lives, which the plan reflects.",
      },
      {
        question: "What ongoing medical care does an amputation plan include?",
        answer:
          "Prosthetist visits for adjustment and repair, physiatry follow-up, dermatology or wound care for residual limb skin problems, pain management, and orthopedic care for the contralateral limb and spine as gait changes take their toll over time.",
      },
      {
        question: "Does an amputation plan include attendant care or home modification?",
        answer:
          "For single lower-extremity amputations often not; for bilateral, upper-extremity, or high-level amputations, attendant care hours, bathroom and kitchen modifications, and adapted vehicles are frequently indicated and are documented against the evaluee's functional status.",
      },
    ],
    sources: [
      { title: "Amputee Coalition", url: "https://www.amputee-coalition.org/", type: "org" },
      { title: "American Academy of Orthotists & Prosthetists", url: "https://www.oandp.org/", type: "org" },
      { title: "VA Amputation System of Care", url: "https://www.va.gov/rehab/amputation.asp", type: "gov" },
    ],
  },
  {
    slug: "wrongful-death",
    name: "Wrongful Death",
    category: "wrongful-death",
    summary:
      "Wrongful death matters involve the death of an injured person, sometimes after a period of survival during which substantial care was delivered. Life care planning contributes in two ways: by documenting and valuing the care actually provided between injury and death, and, where a surviving dependent had care needs the decedent was meeting, by projecting the replacement cost of that care.",
    careNeeds:
      "In survival claims the planner reconstructs the care delivered from injury to death, including hospitalization, skilled nursing, home health, equipment, medications, and family-provided attendant care, and confirms that each item was medically appropriate. Where the decedent was the caregiver for a disabled spouse, child, or parent, the plan documents that dependent's ongoing needs and the paid services now required to replace the care the decedent provided.",
    costExposure:
      "Exposure in the survival component is the documented cost of care between injury and death, including care provided by family at market rates where the jurisdiction allows. Replacement-care exposure depends on the dependent's condition and projected life expectancy, and can be large where the decedent provided daily hands-on care to a person with a disability.",
    lifeCareImpact:
      "The life care planner audits the medical and billing record to establish what care was delivered and at what cost, and separates care attributable to the injury from unrelated treatment. For dependent replacement care, the planner evaluates the survivor's needs with the treating providers and projects services, frequencies, and costs in the same format as any other life care plan so the economist can reduce them to present value.",
    relevantServices: ["medical-cost-projection", "life-care-planning", "elder-and-long-term-care-planning", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "rn", "md"],
    faqs: [
      {
        question: "What does a life care planner do in a wrongful death case?",
        answer:
          "Two things, depending on the facts: document and value the care delivered between injury and death, and, where the decedent was caring for a dependent with a disability, project the cost of replacing that care through the dependent's life expectancy.",
      },
      {
        question: "Is family-provided care between injury and death compensable?",
        answer:
          "Many jurisdictions allow recovery of the reasonable value of care family members provided. The planner documents the hours and level of care and applies local market rates so counsel can present the value under the governing law.",
      },
      {
        question: "How is replacement care for a surviving dependent projected?",
        answer:
          "The planner evaluates the dependent's current needs with their treating providers, identifies which of those needs the decedent was meeting, and projects paid services at local rates through the dependent's projected life expectancy, noting any public benefits the jurisdiction treats as collateral.",
      },
      {
        question: "Does the life care planner opine on cause of death?",
        answer:
          "No. Causation is a physician question. The planner documents care needs and costs consistent with the medical record and the physicians' opinions.",
      },
    ],
    sources: [
      { title: "National Center for Health Statistics - Life Expectancy", url: "https://www.cdc.gov/nchs/", type: "gov" },
      { title: "CMS - Home Health Services", url: "https://www.medicare.gov/coverage/home-health-services", type: "gov" },
    ],
  },
  {
    slug: "medical-malpractice",
    name: "Medical Malpractice",
    category: "med-mal",
    summary:
      "Medical malpractice matters involve injury attributed to a departure from the accepted standard of care. The life care plan in these cases must isolate the incremental care the alleged breach made necessary from the baseline care the patient would have required anyway, which makes the causation opinions of the treating and retained physicians the foundation of the plan.",
    careNeeds:
      "Care categories depend on the injury: delayed-diagnosis cases may involve oncology follow-up, surgery, and palliative care; surgical and anesthesia injury may involve neurological rehabilitation, wound care, ostomy supplies, or chronic pain management; medication and hospital-acquired injury may involve dialysis, organ transplant follow-up, or long-term nursing. The plan is organized by the same categories as any life care plan, with each item flagged as incremental or baseline.",
    costExposure:
      "Exposure is the cost of the incremental care across the evaluee's projected life expectancy. Because baseline care is excluded, the plan's value is highly sensitive to the physician's causation and apportionment opinions and to how the pre-existing condition would have progressed absent the breach. Plans often present both the full care profile and the incremental profile so the distinction is transparent.",
    lifeCareImpact:
      "The planner obtains causation and apportionment opinions from the physicians, builds the but-for baseline of expected care, and then documents the additional services, frequencies, and durations attributable to the injury. Every item carries its clinical source and local cost, and the plan states its methodology so it can be tested against the opposing expert's apportionment.",
    relevantServices: ["life-care-planning", "medical-cost-projection", "life-care-plan-rebuttal", "expert-witness-testimony"],
    relevantCredentials: ["md", "clcp", "cnlcp", "rn"],
    faqs: [
      {
        question: "How does the plan separate incremental care from baseline care?",
        answer:
          "The planner documents what care the patient would have needed for the underlying condition absent the breach, based on physician opinion and the medical record, then lists separately the care made necessary by the injury. Items that fall in both are identified so counsel can address apportionment.",
      },
      {
        question: "Who provides the causation opinion the plan relies on?",
        answer:
          "Treating physicians and any retained standard-of-care and causation experts. The life care planner does not opine on causation; the plan states which physician recommendations support each care item.",
      },
      {
        question: "Can the same planner prepare a rebuttal to the opposing life care plan?",
        answer:
          "Yes. Rebuttal review examines the opposing plan's clinical foundation, frequencies, durations, cost sources, and treatment of baseline care, and identifies where it departs from the record or from accepted life care planning methodology.",
      },
      {
        question: "How are pre-existing conditions handled?",
        answer:
          "They define the baseline. The plan projects how the pre-existing condition would have progressed and what care it would have required, then limits the claimed items to the additional care caused by the injury.",
      },
    ],
    sources: [
      { title: "Agency for Healthcare Research and Quality", url: "https://www.ahrq.gov/", type: "gov" },
      { title: "CMS Physician Fee Schedule", url: "https://www.cms.gov/medicare/physician-fee-schedule", type: "gov" },
    ],
  },
  {
    slug: "burn-injury",
    name: "Burn Injury",
    category: "personal-injury",
    summary:
      "Burn injury matters involve thermal, chemical, electrical, or radiation burns whose care needs are driven by total body surface area, depth, location, inhalation injury, and complications such as contracture, hypertrophic scarring, and heat intolerance. Because reconstruction is staged over years and skin care is lifelong, the life care plan must project both a surgical sequence and a daily maintenance regimen.",
    careNeeds:
      "Burn plans address burn surgeon and plastic surgeon follow-up, staged reconstructive and contracture-release surgery, laser and scar management, compression garments replaced on a documented cycle, moisturizers, sun protection, and wound supplies, physical and occupational therapy for range of motion, splinting, pain management, pulmonary follow-up after inhalation injury, and mental health treatment for post-traumatic stress, depression, and body image concerns. Severe burns of the hands or face may add adaptive equipment and attendant care.",
    costExposure:
      "Cost concentrates in the surgical years immediately after injury and then settles into recurring garment, supply, therapy, and mental health costs across the projected life expectancy. Pediatric burns add reconstruction as the child grows. The plan identifies which surgeries the treating surgeon has scheduled, which are anticipated, and the maintenance items that continue for life.",
    lifeCareImpact:
      "The planner obtains the reconstructive sequence from the treating burn surgeon, documents garment and supply regimens with replacement frequencies, and confirms therapy and mental health recommendations with the treating team. Each item carries a stated basis and local cost, and the plan separates one-time surgical costs from lifelong maintenance so the economist can treat each correctly.",
    relevantServices: ["life-care-planning", "catastrophic-injury-planning", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["T20", "T21", "T22", "T23", "T24", "T25"],
    faqs: [
      {
        question: "How are compression garments projected in the plan?",
        answer:
          "Garments are worn most of the day during the scar maturation period and replaced several times a year as they lose elasticity. The plan states the wear period recommended by the treating surgeon or therapist and the replacement frequency, then applies local pricing.",
      },
      {
        question: "Are future reconstructive surgeries included?",
        answer:
          "Yes, where the treating surgeon anticipates them. The plan lists each anticipated procedure, its timing, and the associated hospitalization, therapy, and garment costs, distinguishing scheduled procedures from those that depend on how scars mature.",
      },
      {
        question: "Is mental health care part of a burn life care plan?",
        answer:
          "Usually. Post-traumatic stress, depression, and body image concerns are common after significant burns, and the plan projects individual therapy, medication management, and periodic psychiatric follow-up where the treating providers recommend them.",
      },
      {
        question: "How do pediatric burns differ in the plan?",
        answer:
          "Growing skin over scar tissue produces contractures that require repeated release surgery through adolescence, and garments and splints are resized with growth. Pediatric plans project these cycles and the therapy that follows each procedure.",
      },
    ],
    sources: [
      { title: "American Burn Association", url: "https://ameriburn.org/", type: "org" },
      { title: "Phoenix Society for Burn Survivors", url: "https://www.phoenix-society.org/", type: "org" },
    ],
  },
  {
    slug: "personal-injury",
    name: "Personal Injury",
    category: "personal-injury",
    summary:
      "Personal injury matters cover a broad range of physical and psychological harm arising from negligence, from orthopedic injury and chronic pain to complex regional pain syndrome and psychological trauma. Whenever an injury requires ongoing treatment, equipment, or assistance, a life care plan documents those future needs and their cost so future medical damages rest on an itemized foundation rather than an estimate.",
    careNeeds:
      "Common categories include orthopedic and pain management follow-up, injections and implanted devices with replacement cycles, future surgery such as joint replacement or spinal fusion, physical therapy at maintenance frequency, medications, bracing and mobility aids, diagnostic imaging, mental health treatment, and, in more serious injury, home modification and help with household tasks or personal care.",
    costExposure:
      "Exposure ranges widely with injury severity. In moderate injury the plan may consist of periodic physician visits, medication, therapy, and a future surgery; in serious injury it includes equipment, attendant care, and home modification across the projected life expectancy. The plan identifies one-time, recurring, and cyclically replaced items so each can be valued appropriately.",
    lifeCareImpact:
      "The planner reviews the records, interviews the evaluee, and confirms recommendations with the treating physicians before projecting frequency, duration, and cost for each item at local rates. The plan states its basis for every line, addresses the evaluee's life expectancy, and is written so that a medical cost projection or full life care plan can be presented depending on the scope counsel needs.",
    relevantServices: ["life-care-planning", "medical-cost-projection", "plan-update-and-review", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "rn", "md"],
    faqs: [
      {
        question: "When does a personal injury case need a life care plan rather than a medical cost projection?",
        answer:
          "A medical cost projection suits injuries with a defined, mostly medical course of future treatment. A full life care plan is indicated when the injury affects daily function and requires equipment, home modification, assistance, or coordinated care across multiple disciplines over a long horizon.",
      },
      {
        question: "What records does the planner need?",
        answer:
          "Complete treatment records, imaging reports, therapy notes, pharmacy records, any functional capacity or independent medical evaluation, and contact with the treating physicians to confirm future recommendations.",
      },
      {
        question: "Does the plan include care the evaluee is not currently receiving?",
        answer:
          "Yes, where a treating or examining physician recommends it. The plan documents the recommendation and its source; it does not project care that no provider supports.",
      },
      {
        question: "Can a plan be updated if the evaluee's condition changes before trial?",
        answer:
          "Yes. Plans are updated to reflect new surgery, changed recommendations, or a change in function, and the update documents what changed and why so the current plan is consistent with prior testimony.",
      },
    ],
    sources: [
      { title: "CMS Physician Fee Schedule", url: "https://www.cms.gov/medicare/physician-fee-schedule", type: "gov" },
      { title: "National Center for Health Statistics - Life Expectancy", url: "https://www.cdc.gov/nchs/", type: "gov" },
    ],
  },
  {
    slug: "workers-compensation",
    name: "Workers' Compensation",
    category: "workers-comp",
    summary:
      "Workers' compensation matters involve work-related injury or illness within a statutory system that pays medical benefits under a fee schedule and, in many settlements, closes future medical liability in exchange for a lump sum. Life care planning in this setting supports settlement valuation, Medicare Set-Aside allocation, and disputes over the reasonableness and necessity of future treatment.",
    careNeeds:
      "Plans address the injury-related care the treating physician projects: physician follow-up, medications, injections, future surgery, therapy, durable medical equipment and replacement, diagnostic testing, and, in catastrophic work injury, attendant care and home modification. Because state fee schedules govern payment, the plan typically prices items under the applicable schedule and, where useful, at usual and customary rates for comparison.",
    costExposure:
      "Exposure is defined by the projected cost of injury-related medical care over the claimant's life expectancy, priced under the governing fee schedule. Where the claimant is a Medicare beneficiary or reasonably expected to become one, the Medicare-covered portion must be allocated in a set-aside, and the difference between the plan and the set-aside is often the focus of settlement negotiation.",
    lifeCareImpact:
      "The planner documents the injury-related diagnoses, obtains the treating physician's projection of future care, and prices each item under the state fee schedule with stated sources. The same clinical foundation supports a Medicare Set-Aside allocation when one is required, and the plan distinguishes injury-related care from treatment for unrelated conditions so the carrier's obligation is stated accurately.",
    relevantServices: ["workers-compensation-lcp", "medicare-set-aside", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "mscc", "cdms", "crc", "rn"],
    faqs: [
      {
        question: "How does a workers' compensation life care plan differ from a civil life care plan?",
        answer:
          "The clinical methodology is the same, but pricing follows the state fee schedule, the scope is limited to injury-related care the carrier is responsible for, and the plan is often prepared with settlement and Medicare Set-Aside requirements in mind.",
      },
      {
        question: "When is a Medicare Set-Aside needed?",
        answer:
          "When a settlement closes future medical benefits and the claimant is a Medicare beneficiary or has a reasonable expectation of enrollment. The allocation projects Medicare-covered, injury-related care and is prepared from the same records and physician projections as the life care plan.",
      },
      {
        question: "Can the plan be used to dispute a utilization review denial?",
        answer:
          "The plan documents the treating physician's recommendations and their clinical basis, which counsel can use in disputes over the reasonableness and necessity of future treatment under the state's procedures.",
      },
      {
        question: "Does the plan price care at fee schedule or market rates?",
        answer:
          "Under the applicable fee schedule for the carrier's obligation, with market rates shown where the claimant may need to purchase care outside the system after settlement.",
      },
    ],
    sources: [
      { title: "U.S. DOL Office of Workers' Compensation Programs", url: "https://www.dol.gov/agencies/owcp", type: "gov" },
      { title: "CMS - Workers' Compensation Medicare Set-Aside Arrangements", url: "https://www.cms.gov/medicare/coordination-benefits-recovery/workers-compensation-medicare-set-aside-arrangements", type: "gov" },
    ],
  },
  {
    slug: "motor-vehicle-accident",
    name: "Motor Vehicle Accident",
    category: "personal-injury",
    summary:
      "Motor vehicle accident matters span the full range of injury severity, from soft tissue and orthopedic injury to traumatic brain injury, spinal cord injury, and polytrauma. The life care plan scales to the injury: a medical cost projection for a defined course of orthopedic treatment, or a full plan when the crash produces lasting functional loss that requires equipment, assistance, and coordinated long-term care.",
    careNeeds:
      "Typical categories include orthopedic and spine follow-up, pain management and injections, future surgery such as fusion or joint replacement, physical therapy, medications, bracing and mobility aids, imaging, and mental health treatment for post-traumatic stress and driving anxiety. Polytrauma cases add neurological rehabilitation, durable medical equipment, home modification, adapted transportation, and attendant care.",
    costExposure:
      "Exposure tracks the injury mix. Orthopedic and chronic pain cases are driven by future surgery, injections, and therapy; catastrophic cases are driven by attendant care and equipment across the projected life expectancy. Plans identify one-time, recurring, and replaced items and, where policy limits are at issue, present the plan in a form that supports both settlement evaluation and trial.",
    lifeCareImpact:
      "The planner reviews the trauma and follow-up records, confirms future recommendations with the treating physicians, and projects each item's frequency, duration, and local cost. In polytrauma the plan integrates recommendations from several specialists into one document with a stated basis for every line, and it addresses life expectancy where the injuries warrant it.",
    relevantServices: ["life-care-planning", "medical-cost-projection", "catastrophic-injury-planning", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "rn", "md"],
    faqs: [
      {
        question: "Does every motor vehicle case need a life care plan?",
        answer:
          "No. Where future treatment is defined and mostly medical, a medical cost projection is usually sufficient. A full life care plan is indicated when the injury produces lasting functional loss that requires equipment, modification, or assistance.",
      },
      {
        question: "How are motor vehicle plans different from other life care plans?",
        answer:
          "The methodology is identical; the injury mix differs. Motor vehicle plans frequently combine orthopedic, spine, neurological, and pain management care, so the planner coordinates recommendations across several treating specialists.",
      },
      {
        question: "How early in the case should the planner be involved?",
        answer:
          "After the treating physicians can describe the expected long-term course, often once surgical decisions have been made. In catastrophic injury, earlier involvement helps document the acute care and rehabilitation phase accurately.",
      },
      {
        question: "Can the plan address treatment the evaluee cannot currently afford?",
        answer:
          "Yes. The plan projects care that treating or examining physicians recommend regardless of whether the evaluee has been able to obtain it, and documents the recommendation and its source.",
      },
    ],
    sources: [
      { title: "NHTSA - Traffic Safety Facts", url: "https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars", type: "gov" },
      { title: "CDC - Motor Vehicle Safety", url: "https://www.cdc.gov/motorvehiclesafety/", type: "gov" },
    ],
  },
  {
    slug: "birth-injury",
    name: "Birth Injury",
    category: "birth-injury",
    summary: "Birth injury matters involve harm to an infant during labor and delivery, including hypoxic-ischemic encephalopathy, brachial plexus injury, and intracranial hemorrhage. Because the injured child has a full life ahead, the life care plan is usually the single largest component of damages and must address needs from infancy through adulthood.",
    careNeeds: "Pediatric plans address neurology and developmental pediatrics follow-up, physical, occupational, and speech therapy, durable medical equipment sized and replaced as the child grows, seizure management, feeding support, educational and behavioral services, respite and attendant care, and the transition to adult providers and residential options after age 21.",
    costExposure: "Costs are driven by attendant-care hours, equipment replacement cycles, therapy frequency by developmental stage, and the child's projected life expectancy. Plans commonly present alternative scenarios for home-based versus facility-based care so counsel and the economist can value each.",
    lifeCareImpact: "The plan is built with the treating neurologist and developmental pediatrician and updated at developmental milestones. Life expectancy is analyzed from the child's functional profile rather than population tables alone, and the plan documents the basis for each frequency and duration recommendation.",
    relevantServices: ["pediatric-life-care-planning", "life-care-planning", "medical-cost-projection", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["P10", "P11", "P14", "P91.6"],
    faqs: [
      { question: "When should a life care planner be retained in a birth injury case?", answer: "Early enough to attend or review the initial neurodevelopmental evaluations, typically once liability review confirms the case will proceed. Early retention lets the planner document baseline function before growth changes the picture." },
      { question: "How is a child's life expectancy handled in the plan?", answer: "The planner documents the child's functional status, feeding method, mobility, and seizure control, and presents the life expectancy analysis with its sources so counsel can decide how to present it. Where the medical literature supports a range, the plan shows the cost impact of each end of that range." },
      { question: "Does the plan cover care after the child turns 21?", answer: "Yes. Pediatric plans project the transition to adult providers, vocational or day-program services, and long-term residential or in-home care through the projected life expectancy." },
    ],
    sources: [],
  },
  {
    slug: "cerebral-palsy",
    name: "Cerebral Palsy",
    category: "birth-injury",
    summary: "Cerebral palsy matters, whether arising from birth injury or pediatric medical negligence, require a plan that scales with the child's Gross Motor Function Classification level and evolves through developmental stages into adulthood.",
    careNeeds: "Plans address orthopedic and neurology follow-up, spasticity management including botulinum toxin and baclofen pump care, orthotics and seating replaced with growth, therapies, communication devices, home accessibility, transportation, attendant care, and adult residential or supported-living options.",
    costExposure: "Attendant care and equipment dominate the cost profile. Frequency and replacement schedules are tied to the child's functional level and growth, and plans typically present home-based and facility-based scenarios.",
    lifeCareImpact: "The life care planner works with the physiatrist, orthopedist, and therapy team to document current needs, then projects changes at each developmental transition. The plan explains the basis for every frequency and replacement cycle so it can withstand cross-examination.",
    relevantServices: ["pediatric-life-care-planning", "catastrophic-injury-planning", "life-care-planning", "expert-witness-testimony"],
    relevantCredentials: ["clcp", "cnlcp", "md", "rn"],
    icdCodes: ["G80", "G80.0", "G80.1", "G80.9"],
    faqs: [
      { question: "How does functional classification affect the plan?", answer: "Higher classification levels generally mean more attendant care, more complex equipment, and more frequent medical follow-up. The plan states the child's current level and the clinical basis for projecting future needs." },
      { question: "Are educational services included in a cerebral palsy life care plan?", answer: "The plan documents educational supports the child needs and distinguishes services provided by public programs from those the family must fund privately, so counsel can address collateral-source questions in the jurisdiction." },
      { question: "How often should a pediatric plan be updated?", answer: "At major developmental transitions or at least every few years while the child is growing, and again before the transition to adult services." },
    ],
    sources: [],
  },
];

export function getCaseType(slug: string): CaseType | undefined {
  return caseTypes.find((c) => c.slug === slug);
}
