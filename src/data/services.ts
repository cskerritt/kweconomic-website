import type { Service } from "@/types";

/**
 * KW Life Care Planning service taxonomy.
 *
 * Ten `pillar: true` entries are the site's indexable service lines: every
 * service page, service x state, service x city, cost/process/timeline page,
 * hub card, cross-link, sitemap entry, and prerendered route enumerates from
 * `pillarServices()`. The single `pillar: false` entry (forensic economics) is
 * a cross-sell to the firm's economics practice: it resolves at
 * /services/forensic-economics as a short noindex card that links out, and is
 * excluded from every enumeration.
 *
 * Build scripts (scripts/lib/service-slugs.mjs) read this file as text and
 * split it on top-level `\n  {\n` object boundaries, dropping any block that
 * contains `pillar: false`. Keep each entry as its own two-space-indented
 * object literal with `slug:` as the first field.
 */
export const services: Service[] = [
  {
    slug: "life-care-planning",
    name: "Life Care Planning",
    shortName: "Life Care Plan",
    pillar: true,
    description: "Individualized, evidence-based life care plans projecting the future medical, rehabilitation, and non-medical needs of individuals living with catastrophic injuries or chronic conditions. Each plan documents the items of care recommended across the patient's remaining life expectancy, with cost research grounded in geographic-specific provider data.",
    icon: "HeartPulse",
    keywords: ["life care plan", "certified life care planner", "future medical costs", "catastrophic injury", "long term care assessment", "life care planner"],
    caseTypes: ["Personal Injury", "Medical Malpractice", "Traumatic Brain Injury", "Spinal Cord Injury", "Workers' Compensation"],
    relevantCredentials: ["CLCP", "CNLCP", "CRC", "RN"],
    cost: {
      range: "Life care plan fees reflect the complexity of the injury, the breadth of future care needs, and the number of treating providers and records involved. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Severity and complexity of the injury or chronic condition",
        "Number of treating physicians and the volume of medical records",
        "Whether a clinical interview, home assessment, or physician collaboration is required",
        "Scope of future care projected, including medical, surgical, therapy, equipment, home modification, and attendant care",
        "Cost research required to price each item by geographic region",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Life care planning is billed at an hourly rate for records review, clinical interview, provider collaboration, cost research, plan preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and records collection", description: "We confirm scope and conflicts, establish the retainer, and gather medical records, imaging, and provider information." },
      { step: "Medical records review and chronology", description: "We review the medical record in detail and build a chronology of diagnoses, treatment, and current clinical status." },
      { step: "Clinical interview and assessment", description: "When appropriate, we interview the evaluee and family and coordinate with treating providers to document functional status and ongoing needs." },
      { step: "Future care planning", description: "We project future medical, rehabilitative, equipment, medication, and support needs across the remaining life expectancy, consistent with published life care planning standards." },
      { step: "Cost research and plan preparation", description: "We price each item using geographically specific cost data and document the basis for every recommendation in a written plan." },
      { step: "Testimony", description: "We provide deposition and trial testimony and update the plan as the clinical picture or records change." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 3 weeks" },
      { phase: "Records review and chronology", duration: "2 to 4 weeks, depending on record volume" },
      { phase: "Clinical interview and provider collaboration", duration: "Scheduled within the review period" },
      { phase: "Cost research and draft plan", duration: "3 to 6 weeks after the assessment" },
      { phase: "Deposition and trial testimony", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "pediatric-life-care-planning",
    name: "Pediatric Life Care Planning",
    shortName: "Pediatric LCP",
    pillar: true,
    description: "Life care plans for minors with birth-related injuries, congenital conditions, or pediatric trauma. Plans address developmental considerations, transitions to adulthood, and lifetime care needs from current age through projected life expectancy.",
    icon: "Baby",
    keywords: ["pediatric life care plan", "birth injury life care plan", "cerebral palsy life care plan", "minor catastrophic injury", "pediatric life care planner"],
    caseTypes: ["Birth Injury", "Cerebral Palsy", "Medical Malpractice", "Traumatic Brain Injury", "Personal Injury"],
    relevantCredentials: ["CLCP", "CNLCP", "RN", "MD"],
    cost: {
      range: "Pediatric plans span the longest projection horizons in life care planning, and fees reflect the number of developmental stages the plan must address, the breadth of therapies and equipment involved, and the depth of the pediatric record. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Complexity of the diagnosis and the number of body systems affected",
        "Volume of neonatal, pediatric, therapy, and school records to review",
        "Whether a home visit, caregiver interview, or school-based observation is required",
        "Number of developmental stages projected, from early childhood through adult transition and adult care",
        "Equipment replacement cycles and growth-related re-sizing to be priced across childhood",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Pediatric life care planning is billed at an hourly rate for records review, caregiver and provider interviews, developmental care projection, cost research, plan preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and records collection", description: "We confirm scope and conflicts, establish the retainer, and gather neonatal, pediatric, therapy, educational, and early intervention records." },
      { step: "Records review and developmental chronology", description: "We build a chronology of the diagnosis, interventions to date, developmental milestones, and the child's current functional status." },
      { step: "Caregiver interview and clinical assessment", description: "We interview parents or guardians, observe the child when appropriate, and coordinate with treating pediatric specialists and therapists." },
      { step: "Stage-based care projection", description: "We project medical, therapy, equipment, educational support, attendant care, and housing needs by developmental stage, through adult transition and the remaining life expectancy." },
      { step: "Cost research and plan preparation", description: "We price each item using geographically specific pediatric and adult provider data, with replacement cycles that account for growth, and document the basis for every recommendation." },
      { step: "Testimony", description: "We provide deposition and trial testimony and update the plan as the child's condition, treatment, or records change." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 3 weeks" },
      { phase: "Records review and developmental chronology", duration: "2 to 4 weeks, depending on record volume" },
      { phase: "Caregiver interview and provider collaboration", duration: "Scheduled within the review period" },
      { phase: "Cost research and draft plan", duration: "4 to 6 weeks after the assessment" },
      { phase: "Deposition and trial testimony", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "catastrophic-injury-planning",
    name: "Catastrophic Injury Life Care Plans",
    shortName: "Catastrophic Injury",
    pillar: true,
    description: "Life care plans for adults with traumatic brain injury, spinal cord injury, severe burns, amputations, and other catastrophic injuries. Plans coordinate medical, attendant care, equipment, home modification, and transportation needs over the life span.",
    icon: "Activity",
    keywords: ["traumatic brain injury life care plan", "spinal cord injury life care plan", "catastrophic injury cost projection", "amputation life care plan", "burn injury life care plan"],
    caseTypes: ["Traumatic Brain Injury", "Spinal Cord Injury", "Burn Injury", "Amputation", "Motor Vehicle Accident", "Personal Injury"],
    relevantCredentials: ["CLCP", "CNLCP", "CRC", "RN"],
    cost: {
      range: "Catastrophic injury plans carry the widest scope of any life care plan, and fees reflect the level of attendant care, the equipment and home modification program, and the number of specialists involved. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Level of injury and the resulting attendant care hours, skill level, and supervision needs",
        "Number of treating specialists and the volume of acute, rehabilitation, and outpatient records",
        "Whether a home assessment is required to specify accessibility modifications and equipment",
        "Scope of durable medical equipment, prosthetics, mobility, and technology, with replacement cycles",
        "Complication and secondary-condition surveillance to be projected over the life span",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Catastrophic injury planning is billed at an hourly rate for records review, clinical interview, home assessment, provider collaboration, cost research, plan preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and records collection", description: "We confirm scope and conflicts, establish the retainer, and gather acute care, rehabilitation, outpatient, and equipment records." },
      { step: "Records review and clinical chronology", description: "We build a chronology from the injury through rehabilitation to current status, documenting the level of injury, complications, and functional outcomes." },
      { step: "Clinical interview and home assessment", description: "We interview the individual and caregivers, assess the home environment when appropriate, and coordinate with treating physicians, therapists, and equipment vendors." },
      { step: "Lifetime care projection", description: "We project attendant care, medical follow-up, therapies, equipment and prosthetics, home modification, transportation, and secondary-condition surveillance across the remaining life expectancy." },
      { step: "Cost research and plan preparation", description: "We price each item using geographically specific provider, agency, and vendor data and document the basis for every recommendation in a written plan." },
      { step: "Testimony", description: "We provide deposition and trial testimony and update the plan as the clinical picture or records change." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 3 weeks" },
      { phase: "Records review and chronology", duration: "3 to 5 weeks, depending on record volume" },
      { phase: "Clinical interview and home assessment", duration: "Scheduled within the review period" },
      { phase: "Cost research and draft plan", duration: "4 to 8 weeks after the assessment" },
      { phase: "Deposition and trial testimony", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "medical-cost-projection",
    name: "Medical Cost Projections",
    shortName: "Medical Cost Projection",
    pillar: true,
    description: "Future medical care cost projections for cases that do not require a full life care plan. Useful for settlement valuation, mediation, and matters where a focused future-medical analysis is appropriate.",
    icon: "Calculator",
    keywords: ["medical cost projection", "future medical costs", "future medical care", "cost of care analysis", "future medical expense report"],
    caseTypes: ["Personal Injury", "Workers' Compensation", "Medical Malpractice", "Motor Vehicle Accident"],
    relevantCredentials: ["CLCP", "CNLCP", "RN", "MD"],
    cost: {
      range: "Medical cost projections are scoped narrower than a full life care plan and are typically completed from the records alone. Fees reflect the number of treatment recommendations to price and the projection horizon. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of treatment recommendations, procedures, and medications to be projected",
        "Volume of medical records and the number of treating providers to reconcile",
        "Whether the projection covers a defined period or the remaining life expectancy",
        "Cost research required to price each item by geographic region",
        "Whether an interview with the individual or treating provider is requested",
        "Deposition and trial testimony, if the projection is used beyond settlement",
      ],
      billingStructure: "Medical cost projections are billed at an hourly rate for records review, treatment plan confirmation, cost research, report preparation, and any testimony. Many projections are completed within a fixed initial retainer because the scope is defined at engagement. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and records collection", description: "We confirm scope and conflicts, establish the retainer, and gather the medical records and treatment recommendations that define the projection." },
      { step: "Records review and treatment summary", description: "We identify each recommended treatment, its source in the record, and its expected frequency and duration." },
      { step: "Provider confirmation", description: "When the record is unclear, we confirm the treatment plan with the treating provider so every projected item has a documented clinical basis." },
      { step: "Cost research and projection", description: "We price each item using geographically specific cost data and project the totals over the defined period or the remaining life expectancy." },
      { step: "Report and support", description: "We deliver a written projection suitable for settlement, mediation, or litigation and provide testimony when required." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 2 weeks" },
      { phase: "Records review and treatment summary", duration: "1 to 3 weeks, depending on record volume" },
      { phase: "Cost research and draft projection", duration: "1 to 3 weeks after the review" },
      { phase: "Testimony", duration: "As scheduled by counsel, if required" },
    ],
  },
  {
    slug: "workers-compensation-lcp",
    name: "Workers' Compensation Life Care Plans",
    shortName: "Workers' Comp LCP",
    pillar: true,
    description: "Life care plans built for workers' compensation matters, including return-to-work and transferable skills considerations alongside future medical care, attendant care, and rehabilitation needs.",
    icon: "HardHat",
    keywords: ["workers compensation life care plan", "wc life care plan", "occupational injury life care plan", "workers comp future medical", "industrial injury life care plan"],
    caseTypes: ["Workers' Compensation", "Traumatic Brain Injury", "Spinal Cord Injury", "Amputation", "Burn Injury"],
    relevantCredentials: ["CLCP", "CRC", "CDMS", "MSCC"],
    cost: {
      range: "Workers' compensation plans are shaped by the compensable injury, the fee schedule that governs medical pricing in the jurisdiction, and whether return-to-work and Medicare considerations are in scope. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Severity of the compensable injury and the number of accepted body parts or conditions",
        "Volume of claim, medical, and independent examination records to review",
        "Whether medical pricing follows the jurisdiction's fee schedule, usual and customary rates, or both",
        "Return-to-work, transferable skills, and vocational rehabilitation considerations in scope",
        "Coordination with a Medicare set-aside allocation when settlement is contemplated",
        "Deposition and hearing testimony, including preparation and travel time",
      ],
      billingStructure: "Workers' compensation life care planning is billed at an hourly rate for records review, clinical interview, provider collaboration, fee-schedule and cost research, plan preparation, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and records collection", description: "We confirm scope and conflicts, establish the retainer, and gather the claim file, medical records, and any independent or agreed examination reports." },
      { step: "Records review and chronology", description: "We build a chronology of the work injury, treatment, work status, and current clinical picture, identifying which conditions are accepted as compensable." },
      { step: "Clinical interview and provider collaboration", description: "We interview the injured worker when appropriate and coordinate with treating providers to document ongoing restrictions and care needs." },
      { step: "Future care and return-to-work projection", description: "We project future medical, rehabilitation, equipment, and attendant care needs and address return-to-work and transferable skills considerations relevant to the claim." },
      { step: "Cost research and plan preparation", description: "We price each item using the applicable fee schedule or geographically specific provider data and document the basis for every recommendation in a written plan." },
      { step: "Testimony and settlement support", description: "We provide deposition and hearing testimony and coordinate with the Medicare set-aside allocation when the claim moves toward settlement." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 3 weeks" },
      { phase: "Records review and chronology", duration: "2 to 4 weeks, depending on record volume" },
      { phase: "Clinical interview and provider collaboration", duration: "Scheduled within the review period" },
      { phase: "Cost research and draft plan", duration: "3 to 5 weeks after the assessment" },
      { phase: "Deposition and hearing testimony", duration: "As scheduled by counsel and the tribunal" },
    ],
  },
  {
    slug: "plan-update-and-review",
    name: "Life Care Plan Updates",
    shortName: "Plan Update / Review",
    pillar: true,
    description: "Updates of prior life care plans to reflect current medical condition, costs, and life expectancy data. Includes re-pricing of existing plans, incorporation of new treatment recommendations, and refresh of a plan prepared for an earlier stage of the case.",
    icon: "RefreshCcw",
    keywords: ["life care plan update", "life care plan review", "updated life care plan", "life care plan re-pricing", "lcp update before trial"],
    caseTypes: ["Personal Injury", "Medical Malpractice", "Workers' Compensation", "Traumatic Brain Injury", "Spinal Cord Injury"],
    relevantCredentials: ["CLCP", "CNLCP", "RN"],
    cost: {
      range: "Plan update fees depend on how much has changed since the original plan: the volume of new records, whether the individual's condition or treatment plan has shifted, and whether a new interview is warranted. A re-pricing with no clinical change is the narrowest scope. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Volume of new medical records generated since the original plan",
        "Whether the diagnosis, treatment plan, or functional status has materially changed",
        "Whether a follow-up interview or provider collaboration is required",
        "Number of plan items to re-price and the age of the original cost data",
        "Whether the original plan was prepared by KW Life Care Planning or by another planner",
        "Deposition and trial testimony on the updated plan",
      ],
      billingStructure: "Plan updates are billed at an hourly rate for review of the original plan and new records, follow-up interview, cost research, preparation of the updated plan, and testimony. Updates of plans originally prepared by KW Life Care Planning may be scoped more narrowly, which is reflected in the estimate. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and update scope", description: "We confirm scope and conflicts, establish the retainer, and identify what has changed since the original plan: new records, new treatment, new life expectancy data, or the passage of time alone." },
      { step: "Original plan and new records review", description: "We review the original plan item by item against the new medical record and document which recommendations remain supported, which have changed, and which are new." },
      { step: "Follow-up interview and provider collaboration", description: "When the clinical picture has changed, we re-interview the individual and coordinate with treating providers to confirm current needs." },
      { step: "Re-pricing and revision", description: "We refresh every cost using current geographically specific data, revise frequencies and durations where the record supports it, and reconcile the updated plan to the original." },
      { step: "Updated plan and testimony", description: "We deliver the updated plan with a summary of changes and provide deposition and trial testimony as required." },
    ],
    timeline: [
      { phase: "Engagement and update scope", duration: "1 week" },
      { phase: "Original plan and new records review", duration: "1 to 3 weeks, depending on new record volume" },
      { phase: "Re-pricing and revised draft", duration: "2 to 4 weeks after the review" },
      { phase: "Deposition and trial testimony", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "life-care-plan-rebuttal",
    name: "Life Care Plan Rebuttal and Critique",
    shortName: "Plan Rebuttal",
    pillar: true,
    description: "Independent review of an opposing party's life care plan for plaintiff or defense counsel. We examine each recommendation for foundation in the medical record, duplication, support for frequency and duration, pricing methodology, and life expectancy basis, and deliver a written critique with an optional alternative plan.",
    icon: "Scale",
    keywords: ["life care plan rebuttal", "life care plan critique", "opposing life care plan review", "rebuttal life care planner", "defense life care plan review"],
    caseTypes: ["Personal Injury", "Medical Malpractice", "Traumatic Brain Injury", "Spinal Cord Injury", "Workers' Compensation", "Birth Injury"],
    relevantCredentials: ["CLCP", "CNLCP", "CRC", "MD"],
    cost: {
      range: "Rebuttal fees reflect the length and complexity of the plan under review, the size of the underlying medical record, and whether counsel requests a critique only or an alternative plan as well. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Length of the opposing plan and the number of recommendations and cost tables to examine",
        "Volume of medical records against which each recommendation must be checked",
        "Whether the deliverable is a written critique alone or a critique with an alternative plan",
        "Whether an independent interview or provider collaboration is warranted",
        "Cost research required to test the opposing plan's pricing sources and geographic basis",
        "Deposition and trial testimony, including preparation and travel time",
      ],
      billingStructure: "Rebuttal work is billed at an hourly rate for review of the opposing plan and the medical record, methodology and pricing analysis, preparation of the written critique or alternative plan, and testimony. A retainer is established at the outset and applied against time incurred. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and materials collection", description: "We confirm scope and conflicts, establish the retainer, and gather the opposing plan, its cost tables and sources, the planner's file when produced, and the complete medical record." },
      { step: "Foundation review", description: "We trace each recommendation in the opposing plan to the medical record and treating provider recommendations, flagging items that lack documented clinical support." },
      { step: "Duplication, frequency, and duration analysis", description: "We identify overlapping or duplicated items and test whether the stated frequency and duration of each item are supported by the record and accepted planning practice." },
      { step: "Pricing and life expectancy review", description: "We examine the pricing sources, geographic basis, and replacement cycles used, and evaluate the life expectancy assumption that drives the plan's total." },
      { step: "Written critique and alternative plan", description: "We deliver a written critique organized by finding and, when requested, an alternative plan that reflects the care the record supports." },
      { step: "Testimony", description: "We provide deposition and trial testimony on the critique and any alternative plan." },
    ],
    timeline: [
      { phase: "Engagement and materials collection", duration: "1 to 2 weeks" },
      { phase: "Foundation, frequency, and pricing review", duration: "2 to 4 weeks, depending on plan length and record volume" },
      { phase: "Written critique and optional alternative plan", duration: "2 to 4 weeks after the review" },
      { phase: "Deposition and trial testimony", duration: "As scheduled by counsel and the court" },
    ],
  },
  {
    slug: "medicare-set-aside",
    name: "Medicare Set-Aside Allocations",
    shortName: "Medicare Set-Aside",
    pillar: true,
    description: "Workers' compensation and liability Medicare set-aside allocation reports prepared by a certified Medicare set-aside consultant. Each allocation projects the future injury-related care that Medicare would otherwise cover and prices it using the accepted allocation methodology, in coordination with counsel regarding CMS review thresholds and submission strategy.",
    icon: "ShieldCheck",
    keywords: ["medicare set-aside", "WCMSA allocation", "liability medicare set-aside", "MSA report", "medicare set-aside consultant"],
    caseTypes: ["Workers' Compensation", "Personal Injury", "Motor Vehicle Accident", "Medical Malpractice"],
    relevantCredentials: ["MSCC", "CLCP", "RN", "CDMS"],
    cost: {
      range: "Allocation fees depend on the number of injury-related conditions, the volume of medical and pharmacy records, whether a rated age is obtained, and whether submission support is requested. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins.",
      drivers: [
        "Number of accepted or claimed injury-related conditions to be allocated",
        "Volume of medical, pharmacy, and payment records to review",
        "Whether a rated age is obtained to adjust the projection period",
        "Whether the allocation uses the workers' compensation fee schedule, usual and customary pricing, or both",
        "Whether counsel requests submission support and response to review correspondence",
        "Coordination with an existing life care plan so the two documents reconcile",
      ],
      billingStructure: "Medicare set-aside allocations are billed at an hourly rate for Medicare entitlement review, records review, allocation preparation, rated-age coordination, and submission support. Many allocations are completed within a fixed initial retainer because the scope is defined at engagement. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and entitlement review", description: "We confirm scope and conflicts, establish the retainer, and review the individual's Medicare status and reasonable expectation of entitlement with counsel." },
      { step: "Records collection and review", description: "We gather medical, pharmacy, and payment records and identify the injury-related conditions and treatments that Medicare would otherwise cover." },
      { step: "Rated age and projection period", description: "When appropriate, we coordinate a rated age and establish the projection period that governs the allocation." },
      { step: "Allocation by accepted methodology", description: "We project future injury-related medical and prescription costs using the accepted allocation methodology and the pricing basis appropriate to the claim." },
      { step: "Report and submission support", description: "We deliver the allocation report and, when requested, support submission and respond to review correspondence in coordination with counsel." },
    ],
    timeline: [
      { phase: "Engagement and entitlement review", duration: "1 week" },
      { phase: "Records collection and review", duration: "2 to 4 weeks, depending on record volume" },
      { phase: "Allocation report", duration: "1 to 3 weeks after the review" },
      { phase: "Submission support", duration: "As the review process requires, when requested" },
    ],
  },
  {
    slug: "elder-and-long-term-care-planning",
    name: "Elder and Long-Term Care Planning",
    shortName: "Elder Care Planning",
    pillar: true,
    description: "Non-litigation life care plans for families, guardians, trustees, and special-needs trusts. Plans document current care needs, project future care levels and costs, and give families and fiduciaries a defensible basis for budgeting, placement, and trust administration decisions.",
    icon: "Home",
    keywords: ["elder care plan", "long-term care planning", "special needs trust care plan", "guardianship care plan", "aging in place assessment"],
    caseTypes: ["Personal Injury", "Traumatic Brain Injury", "Spinal Cord Injury", "Cerebral Palsy"],
    relevantCredentials: ["CLCP", "CNLCP", "RN", "CDMS"],
    cost: {
      range: "Elder and long-term care plan fees reflect the complexity of the individual's conditions, whether an in-home assessment is performed, and the range of care settings and providers to be researched. KW Life Care Planning provides a written fee schedule and a cost estimate before work begins, and offers a reduced-scope annual update.",
      drivers: [
        "Number and complexity of medical conditions and the level of assistance currently required",
        "Whether an in-home assessment and family or caregiver interview are performed",
        "Range of care settings to evaluate, from in-home support through assisted living and skilled nursing",
        "Provider, agency, and facility cost research required in the individual's geographic area",
        "Whether the plan supports a trust, guardianship, or benefits decision with specific documentation needs",
        "Whether annual updates are engaged to track changes in condition and cost",
      ],
      billingStructure: "Elder and long-term care planning is billed at an hourly rate for records review, in-home assessment, care-level determination, provider and facility cost research, and plan preparation. A retainer is established at the outset and applied against time incurred. Annual updates are offered at a reduced scope. The current rate schedule and retainer terms are provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and goals", description: "We confirm scope, establish the retainer, and identify who the plan serves and what decisions it must support, whether family budgeting, guardianship, or trust administration." },
      { step: "Records review and in-home assessment", description: "We review the medical record and visit the individual at home when appropriate, documenting current function, safety, caregiver involvement, and the home environment." },
      { step: "Care-level determination", description: "We determine the level of care required now and project how it is likely to change, identifying the settings and services appropriate at each stage." },
      { step: "Provider and facility cost research", description: "We research in-home agencies, adult day programs, assisted living, and skilled nursing costs in the individual's geographic area and price equipment, home modification, and supplies." },
      { step: "Written plan and annual update", description: "We deliver a written plan organized by care category and time period and offer an annual update to reflect changes in condition, setting, and cost." },
    ],
    timeline: [
      { phase: "Engagement and records collection", duration: "1 to 2 weeks" },
      { phase: "In-home assessment", duration: "Scheduled within 2 to 3 weeks of engagement" },
      { phase: "Cost research and written plan", duration: "3 to 5 weeks after the assessment" },
      { phase: "Annual update", duration: "Yearly, when engaged" },
    ],
  },
  {
    slug: "expert-witness-testimony",
    name: "Expert Witness Testimony",
    shortName: "Expert Testimony",
    pillar: true,
    description: "Qualified expert witness testimony for depositions and trial on life care planning, future medical costs, and standards of practice in the field. Experience in state and federal courts across jurisdictions, for plaintiff and defense counsel.",
    icon: "Gavel",
    keywords: ["life care planner expert witness", "lcp expert testimony", "life care planning deposition", "future medical cost testimony", "life care planner trial testimony"],
    caseTypes: ["Personal Injury", "Medical Malpractice", "Workers' Compensation", "Wrongful Death", "Traumatic Brain Injury", "Birth Injury"],
    relevantCredentials: ["CLCP", "CNLCP", "CRC", "MD", "PhD"],
    cost: {
      range: "Testimony engagements are billed for preparation, deposition, and trial time, with rates that depend on the format and location of the proceeding. KW Life Care Planning provides a written fee schedule, including deposition and trial rates, before work begins.",
      drivers: [
        "Preparation time required to review the plan, the file, and any opposing reports",
        "Length and format of the deposition, whether in person or remote",
        "Trial testimony, including standby and travel time",
        "Whether rebuttal of an opposing life care planner is required",
        "Travel to the deposition or trial location",
        "Volume of exhibits and demonstratives to prepare",
      ],
      billingStructure: "Testimony is billed at an hourly rate for preparation and at the applicable rate for deposition and trial time. A retainer is established at the outset and applied against time incurred. The current rate schedule, including deposition and trial rates, is provided on request and confirmed in a written engagement agreement.",
    },
    process: [
      { step: "Engagement and file review", description: "We confirm scope and conflicts, establish the retainer, and review the life care plan, the file, and any opposing expert opinions." },
      { step: "Preparation with counsel", description: "We prepare with retaining counsel, identify the key opinions and their bases in the record, and anticipate cross-examination." },
      { step: "Deposition", description: "We provide deposition testimony on the methodology, data sources, and opinions in the plan." },
      { step: "Trial preparation", description: "We prepare exhibits and demonstratives and coordinate with counsel on the order and scope of direct examination." },
      { step: "Trial testimony", description: "We provide trial testimony and respond to rebuttal and cross-examination." },
    ],
    timeline: [
      { phase: "Engagement and file review", duration: "1 to 2 weeks before the deposition" },
      { phase: "Preparation with counsel", duration: "As scheduled before testimony" },
      { phase: "Deposition", duration: "As noticed by the parties" },
      { phase: "Trial testimony", duration: "As scheduled by the court" },
    ],
  },
  {
    slug: "forensic-economics",
    name: "Forensic Economic Support",
    shortName: "Forensic Economics",
    pillar: false,
    description: "Present-value economic analysis of life care plan costs, performed by the firm's forensic economists. Plans translate directly into damages calculations using accepted growth, discount, and life-expectancy assumptions.",
    icon: "TrendingUp",
    keywords: ["lcp present value", "future medical present value", "life care plan economist"],
    caseTypes: ["Personal Injury", "Wrongful Death", "Medical Malpractice"],
    relevantCredentials: ["PhD"],
    externalUrl: "https://kwvrs.com/services/forensic-economics",
    cost: {
      range: "Economic analysis is engaged through the firm's economics practice; a written estimate is provided once the life care plan scope is known and the matter's damages framework is confirmed.",
      drivers: [
        "Number of plan scenarios to value",
        "Jurisdiction-specific discounting conventions",
        "Whether testimony is required",
        "Coordination with the life care planner on updates",
      ],
      billingStructure: "Economic work is billed hourly under the economics practice's engagement agreement, separately from the life care plan retainer, with the two experts coordinating on assumptions so the plan and the valuation reconcile.",
    },
    process: [
      { step: "Plan hand-off", description: "The completed life care plan and its item-level cost tables are transmitted to the economist." },
      { step: "Assumption alignment", description: "Growth rates, discount rates, and life expectancy are confirmed against the plan's basis." },
      { step: "Present-value analysis", description: "Each care category is valued to present value under the jurisdiction's accepted method." },
      { step: "Report and testimony", description: "A written economic report is issued and testimony coordinated with the life care planner." },
    ],
    timeline: [
      { phase: "Plan hand-off", duration: "On plan completion" },
      { phase: "Present-value analysis", duration: "1 to 2 weeks" },
      { phase: "Testimony", duration: "As scheduled by counsel" },
    ],
  },
];

/** The indexable service lines. Every enumerator (pages, components, scripts) uses this. */
export function pillarServices(): Service[] {
  return services.filter((s) => s.pillar);
}

/** Direct lookup by slug; resolves non-pillar cross-sells too (ServicePillar renders them as a card). */
export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

/** Pillar slugs only - the set of /services/:slug routes that are prerendered and in the sitemap. */
export function getAllServiceSlugs(): string[] {
  return pillarServices().map((s) => s.slug);
}
