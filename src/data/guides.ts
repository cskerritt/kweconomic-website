import type { Faq, Source } from "./types";
import type { RelatedItem } from "@/components/RelatedContent";
import { refsToSources } from "./references";

export interface GuideSection {
  id: string;
  heading: string;
  bodyHtml: string;
}

export interface Guide {
  slug: string;
  title: string;
  tldr: string;
  authorSlug?: string;
  dateModified?: string;
  image?: string;
  sections?: GuideSection[];
  faqs?: Faq[];
  sources?: Source[];
  related?: RelatedItem[];
}

export const guides: Guide[] = [
  {
    slug: "expert-witness-disclosure-rules",
    title: "Expert Witness Disclosure: A Practitioner Overview",
    tldr:
      "Pre-trial expert disclosure typically requires a written statement of the expert's identity, opinions, the bases for those opinions, qualifications, prior testimony, and compensation. Content and timing requirements vary by jurisdiction. Missing a disclosure requirement is a common basis for expert exclusion. Attorneys are responsible for confirming the governing framework against primary sources.",
    dateModified: "2026-05-03",
    sections: [
      {
        id: "what-is-disclosure",
        heading: "What is pre-trial expert disclosure?",
        bodyHtml:
          "<p><a href=\"/services/expert-witness-testimony\">Pre-trial expert disclosure</a> is the formal statement to the opposing party of the expert's expected testimony before trial. Depending on the jurisdiction, the disclosure may take the form of a written report, an interrogatory-style answer signed by the expert, or another format set by the governing framework. The point is to identify the expert, describe what the expert will say, and provide <a href=\"/guides/federal-vs-state-court-daubert\">the basis for the opinions</a> in time for the opposing party to prepare a response.</p>",
      },
      {
        id: "common-content",
        heading: "Common content elements",
        bodyHtml:
          "<p>Most disclosure frameworks call for the expert's identity, the subject matter, the substance of opinions, the bases for those opinions, qualifications, and (in many jurisdictions) prior testimony and <a href=\"/services/life-care-planning/cost\">compensation</a> (Fed. R. Civ. P. 26(a)(2)). The exact inventory varies by jurisdiction, and trial-track engagements in federal court typically call for a more comprehensive written report than settlement-stage state-court disclosure.</p>",
      },
      {
        id: "timing",
        heading: "Timing",
        bodyHtml:
          "<p>Disclosure timing is set by the case scheduling order or by the governing framework's default deadlines. Practitioners should pull the scheduling order at the outset of the case and calendar both the disclosure deadline and the close of expert discovery.</p>",
      },
      {
        id: "supplementation",
        heading: "Supplementation",
        bodyHtml:
          "<p>Most frameworks impose a continuing duty to supplement when the disclosing party learns the prior response is incomplete or incorrect (Fed. R. Civ. P. 26(e)). Failure to supplement can support a motion to preclude the expert testimony at trial.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing framework",
        bodyHtml:
          "<p>This page provides a general overview only and does not provide legal advice. Disclosure rules vary by jurisdiction and change over time. Always confirm the governing framework, the court's scheduling order, and any local rule requirements against primary sources for the specific case.</p>",
      },
    ],
    faqs: [
      {
        question: "Does every retained expert need to produce a written report?",
        answer:
          "It depends on the jurisdiction. Federal-court trial-track engagements typically require a comprehensive written report; many state frameworks accept a substance-of-opinions statement instead, sometimes via interrogatory. Confirm the governing framework for the specific case.",
      },
      {
        question: "What counts as 'facts or data considered'?",
        answer:
          "All materials the expert reviewed in forming the opinion, including those the expert chose not to rely upon. Most jurisdictions interpret this category broadly.",
      },
    ],
    sources: refsToSources(["FRCP_26"]),
    related: [
      { title: "Expert Witness Testimony", href: "/services/expert-witness-testimony" },
      { title: "Federal vs. State Court Admissibility", href: "/guides/federal-vs-state-court-daubert" },
      { title: "How to Rebut a Life Care Plan", href: "/guides/how-to-rebut-a-life-care-plan" },
    ],
  },
  {
    slug: "standard-of-care-analysis",
    title: "Standard of Care Analysis in Medical Litigation",
    tldr:
      "Standard of care analysis establishes whether a healthcare provider's conduct met the accepted standard of practice for the specialty at the time and place of treatment. It is the threshold opinion in medical malpractice litigation and requires a qualified physician expert.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "concept",
        heading: "The concept",
        bodyHtml:
          "<p>Standard of care is the degree of skill and care that a reasonable practitioner in the same specialty would apply in the same or similar circumstances. The analysis is jurisdiction-specific (some states use a national standard, others a locality rule) (Moffett & Moore, 2011).</p>",
      },
      {
        id: "who-provides",
        heading: "Who provides the opinion",
        bodyHtml:
          "<p>A physician expert, typically board-certified in the relevant specialty (American Board of Medical Specialties, n.d.), provides the standard of care opinion. Expert qualifications are often specified by state law, and many states require the expert to practice in the same specialty as the defendant provider.</p>",
      },
      {
        id: "coordination",
        heading: "Coordination with damages experts",
        bodyHtml:
          "<p>Standard of care and causation opinions set the framework for the damages experts who follow. Once a breach and its consequences are established, the <a href=\"/services/life-care-planning\">life care planner</a> projects the future care the injury will require, a <a href=\"/services/medical-cost-projection\">medical cost projection</a> may quantify a narrower set of needs, and an economist reduces those costs to present value. The life care planner does not opine on whether the standard of care was met; the plan takes the causation opinion as its starting point and documents the care that flows from the injury at issue.</p>",
      },
    ],
    faqs: [
      {
        question: "Can a physician expert address standard of care outside their specialty?",
        answer:
          "Generally no, and many states have statutes requiring same-specialty standard of care experts.",
      },
    ],
    sources: refsToSources(["MOFFETT_MOORE_2011", "ABMS"]),
    related: [
      { title: "Medical Malpractice Case Type", href: "/case-types/medical-malpractice" },
      { title: "Life Care Planning", href: "/services/life-care-planning" },
      { title: "Birth Injury Case Type", href: "/case-types/birth-injury" },
    ],
  },
  {
    slug: "collateral-source-rule-explained",
    title: "The Collateral Source Rule, Explained",
    tldr:
      "The collateral source rule governs whether insurance, Medicare, Medicaid, or other third-party payments offset a defendant's liability for damages. Some jurisdictions preserve the traditional rule (no offset); others have modified or abrogated it by statute.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "traditional-rule",
        heading: "The traditional rule",
        bodyHtml:
          "<p>Under the traditional rule, a tortfeasor does not benefit from payments the plaintiff received from collateral sources such as insurance (Restatement (Second) of Torts sec. 920A). Damages are calculated without offsetting those payments.</p>",
      },
      {
        id: "modifications",
        heading: "Modifications and exceptions",
        bodyHtml:
          "<p>Many jurisdictions have modified or abrogated the rule by statute, permitting or requiring offsets for specific types of collateral payments. The specifics vary widely by state and by category of payment.</p>",
      },
      {
        id: "medicare-medicaid",
        heading: "Medicare, Medicaid, and liens",
        bodyHtml:
          "<p>Federal and state programs have separate lien and reimbursement rules (the Medicare Secondary Payer framework, state Medicaid liens). These interact with, but are distinct from, the collateral source rule. For a life care plan the practical point is that the plan projects the cost of care regardless of who ultimately pays; whether public or private payments offset the award is a legal question for counsel. Where a settlement must protect Medicare's interests, a <a href=\"/services/medicare-set-aside\">Medicare set-aside allocation</a> is a separate analysis from the life care plan (see <a href=\"/guides/life-care-plan-vs-medicare-set-aside\">life care plan vs. Medicare set-aside</a>).</p>",
      },
    ],
    faqs: [
      {
        question: "Does the collateral source rule apply to future damages?",
        answer:
          "Generally yes, though offsets for anticipated collateral payments are imposed in some jurisdictions. Confirm state-specific rules.",
      },
    ],
    sources: refsToSources(["RESTATEMENT_TORTS_920A", "MSP_1395Y", "CMS_MSP"]),
    related: [
      { title: "Life Care Plan vs. Medicare Set-Aside", href: "/guides/life-care-plan-vs-medicare-set-aside" },
      { title: "Medicare Set-Aside Allocations", href: "/services/medicare-set-aside" },
    ],
  },
  {
    slug: "federal-vs-state-court-daubert",
    title: "Expert Testimony Admissibility: Federal vs. State Court",
    tldr:
      "Federal courts apply a reliability-based gatekeeping framework that considers the methodology's testability, peer review, error rate, controlling standards, and general acceptance. State courts vary: some apply a similar reliability framework, others apply a narrower general-acceptance test, and several use distinctive hybrid frameworks. Experts should prepare testimony that satisfies the most demanding of the potentially applicable standards. Attorneys are responsible for confirming the governing framework against primary sources.",
    dateModified: "2026-05-03",
    sections: [
      {
        id: "federal-framework",
        heading: "Federal-court framework",
        bodyHtml:
          "<p>Federal courts apply a <a href=\"/services/expert-witness-testimony\">reliability-based gatekeeping framework</a> (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Kumho Tire Co. v. Carmichael, 1999). The trial judge evaluates whether the expert's methodology is reliable and reliably applied to the case, considering factors such as testability, peer review and publication, known or potential rate of error, the existence of controlling standards, and general acceptance in the relevant field (Fed. R. Evid. 702). The factors are non-exclusive and the analysis is case specific.</p>",
      },
      {
        id: "state-frameworks",
        heading: "State-court frameworks",
        bodyHtml:
          "<p>Some states apply a similar reliability framework to the federal courts. Other states retain a <a href=\"/insights/daubert-vs-frye-expert-testimony-standards\">narrower general-acceptance framework</a> that focuses on whether the methodology is generally accepted in the relevant scientific community (Frye v. United States, 1923). Several states have <a href=\"/jurisdictions\">distinctive hybrid frameworks</a>, sometimes codified by statute or rule.</p>",
      },
      {
        id: "verify",
        heading: "Verify the governing framework",
        bodyHtml:
          "<p>Always confirm the governing admissibility framework for the specific case against primary sources before preparing expert testimony. The framework can vary by case type, by court within the same state, and over time as state law evolves.</p>",
      },
    ],
    faqs: [
      {
        question: "Do all federal courts apply the admissibility framework identically?",
        answer:
          "The framework is uniform across federal courts, but application varies by circuit and by trial judge. Prior decisions in the same district and circuit are informative for case preparation.",
      },
    ],
    sources: refsToSources(["DAUBERT", "KUMHO_TIRE", "FRYE", "FRE_702"]),
    related: [
      { title: "Expert Witness Testimony", href: "/services/expert-witness-testimony" },
      { title: "Admissibility Frameworks Compared", href: "/insights/daubert-vs-frye-expert-testimony-standards" },
      { title: "How to Rebut a Life Care Plan", href: "/guides/how-to-rebut-a-life-care-plan" },
    ],
  },
  {
    slug: "future-medical-costs-in-personal-injury",
    title: "Future Medical Costs in Personal Injury Cases",
    tldr:
      "Future medical costs are typically projected in a life care plan prepared by a CLCP, then reduced to present value by a forensic economist. Methodology combines treating-team recommendations, peer-reviewed duration literature, and geographically matched cost data.",
    dateModified: "2026-04-21",
    sections: [
      {
        id: "who-prepares",
        heading: "Who prepares the projection",
        bodyHtml:
          "<p><a href=\"/credentials/clcp\">Certified Life Care Planners (CLCPs)</a> prepare <a href=\"/services/life-care-planning\">the itemized plan</a>. A <a href=\"https://kwvrs.com/services/forensic-economics\">forensic economist</a> then reduces the plan to present value using appropriate discount and growth rates.</p>",
      },
      {
        id: "inputs",
        heading: "Inputs to the projection",
        bodyHtml:
          "<p>Core inputs include treating team recommendations, peer-reviewed duration literature, local provider cost quotations, and published rate data (Medicare, usual-and-customary compilations) (Centers for Medicare & Medicaid Services, n.d.).</p>",
      },
      {
        id: "categories",
        heading: "Typical categories",
        bodyHtml:
          "<p>Categories include routine and specialty medical care, diagnostic testing, therapies, medications, durable medical equipment with replacement intervals, home modifications, transportation, and attendant care.</p>",
      },
      {
        id: "discounting",
        heading: "Reducing to present value",
        bodyHtml:
          "<p>The plan's annual costs are <a href=\"/methods/present-value-analysis\">reduced to present value</a> using a discount rate matched to the projection horizon and a growth rate reflecting medical cost inflation (U.S. Bureau of Labor Statistics, n.d.). Methodology is documented with sensitivity analysis.</p>",
      },
    ],
    faqs: [
      {
        question: "How far into the future do projections extend?",
        answer:
          "Projections extend across the claimant's expected life expectancy, drawing on published life tables (Arias et al., 2025) and any adjustments supported by the record.",
      },
      {
        question: "Are collateral sources deducted?",
        answer:
          "Deduction depends on the jurisdiction's collateral source rule. Some jurisdictions require offset; others do not.",
      },
    ],
    sources: refsToSources(["CMS_PFS", "BLS_CPI_MEDICAL", "NCHS_LIFE_TABLES", "IARP_IALCP_STANDARDS"]),
    related: [
      { title: "Life Care Planning Service", href: "/services/life-care-planning" },
      { title: "Life Care Plan Development", href: "/methods/life-care-plan-development" },
      { title: "Present Value Analysis", href: "/methods/present-value-analysis" },
      { title: "How a Life Care Plan Is Priced", href: "/guides/how-a-life-care-plan-is-priced" },
    ],
  },
  {
    slug: "when-do-you-need-expert-witness",
    title: "When Do You Need an Expert Witness in Your Case?",
    tldr:
      "An expert witness is warranted when the case involves future medical and non-medical care needs, the cost of that care, causation, or medical standard of care. Courts admit expert testimony where specialized knowledge will help the trier of fact understand evidence or determine a fact in issue. Retain early so the expert can inform discovery and strategy.",
    dateModified: "2026-04-20",
    sections: [
      {
        id: "governing-rule",
        heading: "The governing rule",
        bodyHtml:
          "<p>The federal admissibility framework and analogous state frameworks permit expert testimony where specialized knowledge will help the trier of fact, the testimony is based on sufficient facts or data, it is the product of reliable principles and methods, and the expert has reliably applied those principles to the case (Daubert v. Merrell Dow Pharmaceuticals, Inc., 1993; Fed. R. Evid. 702).</p>",
      },
      {
        id: "common-categories",
        heading: "Common expert categories in civil litigation",
        bodyHtml:
          "<p>In an injury case with long-term care implications, several experts commonly address distinct questions that together establish damages. The <a href=\"/services/life-care-planning\">life care planner</a> projects future medical and non-medical needs and their cost. The treating physician or a physical medicine and rehabilitation specialist supplies the medical foundation for those needs. A standard of care expert addresses breach in medical malpractice matters. An occupational or physical therapist may quantify functional capacity or assess the home. A <a href=\"https://kwvrs.com/services/forensic-economics\">forensic economist</a> reduces the projected costs to present value. Where a settlement must account for Medicare, a <a href=\"/services/medicare-set-aside\">Medicare set-aside</a> allocator may be added.</p>",
      },
      {
        id: "timing",
        heading: "When to retain",
        bodyHtml:
          "<p>Retain as early as practical. Early retention allows the expert to inform records collection, suggest FCE referrals, evaluate the claimant's medical trajectory, and provide input on deposition questions. Late retention risks gaps in the record and shortened report timelines.</p>",
      },
      {
        id: "signals",
        heading: "Signals that expert testimony is warranted",
        bodyHtml:
          "<p>Consider expert retention when the case involves a <a href=\"/services/catastrophic-injury-planning\">catastrophic injury</a> with lifelong care implications, when the opposing party has served a life care plan that needs a <a href=\"/services/life-care-plan-rebuttal\">rebuttal</a>, when future medical costs are a significant component of damages, when medical causation is at issue, when standard of care is disputed, or when the defense has retained opposing experts.</p>",
      },
    ],
    faqs: [
      {
        question: "Is a treating physician the same as an expert witness?",
        answer:
          "A treating physician can testify as both a fact witness (regarding treatment) and, in some jurisdictions, as an expert witness (regarding opinion), but limits apply. Retained experts are typically engaged specifically for expert opinion.",
      },
      {
        question: "How many experts does a typical case need?",
        answer:
          "It varies. Many catastrophic injury cases use a life care planner, a physician who supplies the medical foundation, and a forensic economist together. Smaller cases may need only a medical cost projection and a physician.",
      },
      {
        question: "Can experts be designated and later withdrawn?",
        answer:
          "Yes, subject to jurisdictional disclosure rules. Early designation preserves flexibility; withdrawal procedures are governed by local rules.",
      },
    ],
    sources: refsToSources(["FRE_702", "DAUBERT"]),
    related: [
      { title: "How a Life Care Plan Is Priced", href: "/guides/how-a-life-care-plan-is-priced" },
      { title: "Life Care Plan vs. Future Cost Projection", href: "/compare/life-care-plan-vs-future-cost-projection" },
      { title: "Expert Witness Testimony", href: "/services/expert-witness-testimony" },
    ],
  },
  {
    slug: "what-is-life-care-plan",
    title: "What is a Life Care Plan?",
    tldr:
      "A life care plan is a dynamic document that projects the future medical and non-medical care needs of an individual with a catastrophic injury or chronic condition, with itemized frequencies and costs across the expected lifespan. Certified life care planners follow published standards (IALCP, IARP) and build plans from treating-team recommendations, peer-reviewed duration literature, and geographically matched cost data.",
    dateModified: "2026-08-23",
    sections: [
      {
        id: "definition",
        heading: "Definition",
        bodyHtml:
          "<p>A life care plan is a comprehensive, individualized roadmap of the future medical, rehabilitation, and non-medical care a person will need to manage a <a href=\"/case-types/spinal-cord-injury\">catastrophic injury or chronic condition</a>. It quantifies the frequency, duration, and cost of each recommended item and aggregates them into <a href=\"/methods/present-value-analysis\">annual and lifetime projections</a>.</p>",
      },
      {
        id: "components",
        heading: "Components of a plan",
        bodyHtml:
          "<p>Typical categories include routine medical and specialty follow-up, diagnostic testing, therapies (PT, OT, speech, cognitive, mental health), medications, <a href=\"/methods/life-care-plan-development\">durable medical equipment with replacement intervals</a>, home modifications, transportation or vehicle modifications, and attendant care.</p>",
      },
      {
        id: "who-writes-them",
        heading: "Who writes life care plans",
        bodyHtml:
          "<p>Life care plans are typically <a href=\"/services/life-care-planning\">prepared by Certified Life Care Planners</a> (<a href=\"/credentials/clcp\">CLCPs</a>) with qualifying clinical backgrounds (RN, OT, PT, CRC, physician). The CLCP credential is issued by ICHCC (International Commission on Health Care Certification, n.d.); practice standards are published by IALCP and IARP (Reavis, 2002).</p>",
      },
      {
        id: "methodology",
        heading: "Methodology",
        bodyHtml:
          "<p>Plans follow a standardized methodology: review records, collaborate with treating team, document treating team recommendations, identify needs across categories, apply peer-reviewed duration and frequency literature, collect geographically matched cost data, and compile the plan with documented sources.</p>",
      },
      {
        id: "after-catastrophic-injury",
        heading: "Life care planning after a catastrophic injury",
        bodyHtml:
          "<p>Catastrophic injuries such as <a href=\"/case-types/spinal-cord-injury\">spinal cord injury</a>, <a href=\"/case-types/traumatic-brain-injury\">traumatic brain injury</a>, <a href=\"/case-types/amputation\">amputation</a>, and severe burns create care needs that change over the lifespan rather than ending at discharge. A life care plan for these cases typically addresses acute and follow-up medical care, rehabilitation therapies, medications and supplies, durable medical equipment with replacement intervals, home and vehicle modifications, attendant or facility care, and the periodic re-evaluations that each of these items will require (Weed &amp; Berens, 2018). Because needs and costs differ by age, condition, and location, the plan is individualized to the person and the treating team's recommendations, not drawn from a template.</p>",
      },
      {
        id: "timing-and-updates",
        heading: "When the plan is prepared and how it changes",
        bodyHtml:
          "<p>A plan is usually prepared once the medical picture is stable enough to project, which may be before maximum medical improvement when the treating team can describe the expected course. The planner gathers records, interviews the individual and family, consults treating or evaluating providers, and documents each recommendation with its source. Because a life care plan is a dynamic document, it is updated when the condition, the treatment plan, or the care setting changes, and the cost figures are refreshed so the <a href=\"/methods/present-value-analysis\">economic analysis</a> reflects current pricing. In litigation the plan is typically paired with a <a href=\"https://kwvrs.com/services/forensic-economics\">forensic economic</a> projection that carries the itemized costs across the <a href=\"/methods/life-expectancy-in-life-care-planning\">expected lifespan</a> and discounts them to present value.</p>",
      },
    ],
    faqs: [
      {
        question: "How is a life care plan different from a case management plan?",
        answer:
          "A case management plan coordinates ongoing services. A life care plan projects the full scope of future needs for litigation or settlement purposes, with quantified costs across the lifespan.",
      },
      {
        question: "Who pays for the services in a life care plan?",
        answer:
          "The plan projects costs; funding is a separate question answered by settlement, judgment, insurance, or public benefits depending on the case.",
      },
      {
        question: "Are life care plans admissible?",
        answer:
          "Yes, when prepared by a qualified practitioner following accepted methodology and supported by physician recommendations.",
      },
      {
        question: "Is a life care plan only for catastrophic injuries?",
        answer:
          "No. Plans are most often prepared for catastrophic injury and chronic conditions, but the same methodology applies to any injury or illness with documented long-term care needs.",
      },
    ],
    sources: refsToSources(["ICHCC_CLCP", "IARP_IALCP_STANDARDS", "IARP", "WEED_BERENS"]),
    related: [
      { title: "CLCP Certification", href: "/credentials/clcp" },
      { title: "Life Care Plan Development Methodology", href: "/methods/life-care-plan-development" },
      { title: "Spinal Cord Injury Cases", href: "/case-types/spinal-cord-injury" },
    ],
  },
  {
    slug: "how-a-life-care-plan-is-priced",
    title: "How a Life Care Plan Is Priced",
    tldr:
      "A life care plan engagement is billed on the planner's time, typically against a retainer, and the fee is driven by the volume of records, the complexity of the injury, whether an in-person evaluation is required, and how many treating providers must be consulted. A scoped medical cost projection is the lower-cost alternative when the question is narrower than lifetime care.",
    dateModified: "2026-08-26",
    sections: [
      {
        id: "how-fees-are-structured",
        heading: "How the fee is structured",
        bodyHtml:
          "<p>Life care planning is professional time. The planner bills hourly for records review, the evaluation, provider correspondence, cost research, and report writing, and separately for deposition and trial testimony. Most engagements open with a retainer that is applied against hourly work, with the balance billed as the plan progresses. Rate schedules and retainer amounts are set out in the engagement letter, and <a href=\"/services/life-care-planning/cost\">the current terms for a life care plan engagement</a> are available on request before any work begins.</p><p>The retainer is not a flat fee for the plan. It is a deposit against the time the work actually takes. A straightforward plan may finish within the retainer; a catastrophic pediatric case with a decade of records will not. Counsel should expect an estimate at intake and updated estimates as the record is opened, and should treat any planner who quotes a fixed price for an unread record with caution.</p>",
      },
      {
        id: "what-drives-cost",
        heading: "What drives the cost of a plan",
        bodyHtml:
          "<p>Four inputs account for most of the variation between one engagement and the next.</p><p><strong>Volume and condition of the records.</strong> Reading the record is the largest single block of time. A recent injury with a few hundred pages reviews quickly. A <a href=\"/case-types/birth-injury\">birth injury</a> case with neonatal, pediatric, therapy, and school records spanning years does not, and disorganized or duplicated productions add hours before analysis begins.</p><p><strong>Complexity of the injury.</strong> The number of body systems involved, the number of specialties treating the person, and the number of categories of need all scale the plan. A single-limb <a href=\"/case-types/amputation\">amputation</a> with a stable prosthetic plan is simpler than a high-level <a href=\"/case-types/spinal-cord-injury\">spinal cord injury</a> with respiratory, skin, bladder, bowel, and attendant care needs that interact.</p><p><strong>Whether an evaluation is required.</strong> An in-person evaluation, usually in the home, adds travel and a day of interview and observation, and it is the norm for a plaintiff-retained plan. A <a href=\"/compare/in-person-evaluation-vs-file-review\">records-only review</a> is appropriate for many rebuttal engagements and some updates.</p><p><strong>Provider consultation.</strong> Every item in the plan needs a medical foundation. Where the record already contains the treating team's recommendations, the planner confirms them. Where it does not, the planner must correspond with each provider, wait for responses, and sometimes arrange an evaluation, all of which adds time.</p>",
      },
      {
        id: "what-inflates-cost",
        heading: "What inflates the cost unnecessarily",
        bodyHtml:
          "<p>Some cost is avoidable. Incomplete productions that arrive in waves force the planner to re-read and re-index. Late retention compresses the schedule and pushes work into rush time. Unclear scope leads to a plan that covers needs the case does not put at issue. Missing provider contacts mean the planner spends hours locating the right clinician for a recommendation the attorney could have obtained at a deposition.</p><p>The remedy is a clean intake: a single organized production, a clear statement of the questions the plan must answer, the names and contact details of the treating providers, and retention early enough that the plan can inform discovery rather than react to it. A planner retained after the close of fact discovery is often pricing care for which no physician has yet been asked to state a need.</p>",
      },
      {
        id: "what-you-receive",
        heading: "What the fee buys",
        bodyHtml:
          "<p>The deliverable is a written plan that lists each recommended item with its medical foundation, frequency, duration, unit cost, and cost source, organized by category and summarized by year. Behind the report sits a work file: the records index, provider correspondence, cost quotes with dates and contacts, and the life tables relied on. That file is what allows the plan to be defended at deposition, re-priced at a <a href=\"/services/plan-update-and-review\">later update</a>, and handed to an economist for present-value calculation without re-derivation. The <a href=\"/methods/cost-research-methodology\">cost research methodology</a> page describes how each figure is documented.</p>",
      },
      {
        id: "scoping-a-projection-instead",
        heading: "When to scope a medical cost projection instead",
        bodyHtml:
          "<p>Not every case needs a lifetime plan. Where the injury is significant but the future care question is narrow, a <a href=\"/services/medical-cost-projection\">medical cost projection</a> answers it at a fraction of the cost. A projection is records-based, covers a defined set of medical needs such as a planned surgery and its follow-up, and typically carries a shorter horizon. It does not include non-medical categories such as attendant care or home modification, and it does not usually include an in-person evaluation.</p><p>The choice is about the question, not the budget. If the case turns on whether a person will need a knee revision and what it will cost, a projection is the right tool. If the case involves care across multiple categories for the rest of the person's life, the plan is the right tool and a projection will leave damages on the table or, for the defense, leave the plaintiff's plan unanswered. The <a href=\"/compare/life-care-plan-vs-future-cost-projection\">comparison of the two</a> sets out the differences in more detail, and the <a href=\"/services/life-care-planning/process\">engagement process</a> page describes how scope is set at intake.</p>",
      },
      {
        id: "testimony-costs",
        heading: "Testimony and update costs",
        bodyHtml:
          "<p>Deposition and trial testimony are billed separately from the plan, usually at a different hourly rate with a minimum for the appearance and preparation time. Travel is billed at cost. An update to an existing plan is priced on the change: if the condition, the treatment plan, or the living situation has changed materially, the update approaches a new plan; if only the costs need refreshing, it is a fraction of that. Counsel should ask at intake how updates and testimony are billed so the total cost of carrying the plan through trial is understood from the start.</p>",
      },
    ],
    faqs: [
      {
        question: "Can you give a fixed quote for a life care plan?",
        answer:
          "Not responsibly before the record is reviewed. An estimate is provided at intake based on the volume of records, the injury, and whether an evaluation is required, and it is updated once the records are opened. The engagement letter sets out the rates and retainer.",
      },
      {
        question: "Does the plaintiff's or the defendant's side pay more?",
        answer:
          "The methodology and the rates are the same on both sides. A defense rebuttal is often less expensive because it may proceed on records alone, but a defense-retained full plan with an evaluation costs what a plaintiff-retained plan does.",
      },
      {
        question: "Is the retainer refundable?",
        answer:
          "The retainer is applied against hourly work. Any unused balance at the close of the engagement is handled as set out in the engagement letter.",
      },
      {
        question: "Does the plan fee include the economist?",
        answer:
          "No. The present-value calculation is a separate engagement with a forensic economist. The plan is prepared so the economist can use it directly, which keeps that second engagement efficient.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS"]),
    related: [
      { title: "Life Care Planning", href: "/services/life-care-planning" },
      { title: "Medical Cost Projection", href: "/services/medical-cost-projection" },
      { title: "Life Care Plan vs. Future Cost Projection", href: "/compare/life-care-plan-vs-future-cost-projection" },
      { title: "Cost Research Methodology", href: "/methods/cost-research-methodology" },
    ],
  },
  {
    slug: "life-care-plan-vs-medicare-set-aside",
    title: "Life Care Plan vs. Medicare Set-Aside: Purpose, Audience, and Method",
    tldr:
      "A life care plan projects the full cost of injury-related future care for damages. A Medicare set-aside allocation reserves the portion of a settlement that Medicare would otherwise pay for that care. They start from the same record but differ in purpose, audience, scope, pricing, and horizon, and many catastrophic settlements need both.",
    dateModified: "2026-08-26",
    sections: [
      {
        id: "two-documents",
        heading: "Two documents, two questions",
        bodyHtml:
          "<p>A <a href=\"/services/life-care-planning\">life care plan</a> answers the question: what will this person's injury-related care cost over the rest of their life? It is prepared for a trier of fact, a mediator, or an adjuster, and it supports a damages figure. A <a href=\"/services/medicare-set-aside\">Medicare set-aside allocation</a> answers a different question: of the money changing hands in a settlement that closes future medical care, how much should be reserved so that Medicare is not asked to pay for care the settlement was meant to cover? It is prepared for the settling parties and, when submitted, for Medicare's reviewer.</p><p>Because the questions differ, the documents differ, even when the same planner prepares both from the same record. Treating one as a substitute for the other is the most common error counsel make with them.</p>",
      },
      {
        id: "audience",
        heading: "Audience",
        bodyHtml:
          "<p>The plan is written to be understood by a jury and tested by an opposing expert. It explains the injury, describes the person's current function, sets out each need in plain terms, and shows the foundation for it. The allocation is written for a settlement file and a government review process. It is organized around Medicare coverage categories, cites the version of Medicare's guidance relied on, and is accompanied by the medical and payment records that support each line. The reader of an allocation is checking compliance; the reader of a plan is weighing evidence.</p>",
      },
      {
        id: "scope",
        heading: "What each includes and excludes",
        bodyHtml:
          "<p>The plan includes every injury-related need the treating team supports, medical and non-medical: physician follow-up, therapies, medications, supplies, equipment, home and vehicle modification, attendant care, case management, and where appropriate residential placement. It excludes care the person would have needed regardless of the injury.</p><p>The allocation includes only injury-related care that Medicare would cover. Most home modifications, vehicle modifications, non-skilled attendant care, case management, and many supplies fall outside it. Within covered categories, it includes only what the treating providers recommend. Prescription drugs are addressed as a separate component. An allocation is therefore always a subset of the plan, usually a substantially smaller one.</p>",
      },
      {
        id: "pricing",
        heading: "Pricing basis",
        bodyHtml:
          "<p>The plan prices each item at the cost of the care in the person's own market, using provider quotes, usual-and-customary data, and published schedules as appropriate, with the source recorded for each figure (see <a href=\"/methods/cost-research-methodology\">cost research methodology</a>). The allocation prices covered items on the basis Medicare's guidance expects, which in workers' compensation matters is generally the applicable state fee schedule or, where none applies, usual-and-customary charges for the jurisdiction. The same physician visit can carry two different prices in the two documents, and that is correct.</p>",
      },
      {
        id: "horizon",
        heading: "Horizon and life expectancy",
        bodyHtml:
          "<p>The plan carries items across the person's <a href=\"/methods/life-expectancy-in-life-care-planning\">life expectancy</a>, starting from the published population tables and departing from them only on a physician's opinion. The allocation may instead use a rated age obtained from a life insurance underwriter, which can shorten the allocation period when the person's health profile supports it. A rated age is a pricing device for annuities and set-asides; it is not a medical opinion, and a plan prepared for litigation does not rely on it.</p>",
      },
      {
        id: "when-both",
        heading: "When both are needed",
        bodyHtml:
          "<p>Both documents are needed when a catastrophic <a href=\"/case-types/workers-compensation\">workers' compensation</a> or liability matter is settling, the injured person is a Medicare beneficiary or reasonably expects to become one, and the settlement releases future medical care. The plan establishes the full scope of need so the settlement is adequate; the allocation establishes the Medicare-protected portion so the settlement is compliant. Preparing both from one record review keeps them consistent, and a reconciliation showing which plan items fed the allocation and which fell outside it answers the questions a reviewer or an opposing party will ask. The <a href=\"/methods/msa-allocation-methodology\">allocation methodology</a> page describes the steps, and <a href=\"/compare/life-care-plan-vs-msa\">the comparison page</a> summarizes the differences in a table.</p>",
      },
      {
        id: "who-prepares",
        heading: "Who prepares the allocation and how it is coordinated",
        bodyHtml:
          "<p>An allocation is prepared by a planner or allocator with training in Medicare's review guidance, often the same certified life care planner who prepared the plan. Coordination with counsel happens at three points. Before the work begins, counsel confirms the injured person's Medicare status, the settlement structure, and whether submission for review is intended, because each changes what the allocation must contain. During preparation, the planner flags items whose coverage status is unclear so counsel can decide how to treat them rather than discovering the question at review. At delivery, the planner supplies the allocation, the supporting records, and a reconciliation to the life care plan, and remains available to respond to reviewer questions or to revise the allocation if the settlement terms change.</p>",
      },
      {
        id: "common-errors",
        heading: "Common errors",
        bodyHtml:
          "<p>Three errors recur. The first is using the plan total as the set-aside, which overstates the reserve and ignores Medicare's pricing basis. The second is preparing only an allocation in a case that will be tried, which leaves the non-covered categories, often the largest, unquantified. The third is building the two documents from different records or different providers, so that the allocation lists care the plan does not, or the plan omits care the allocation reserves for. Each is avoided by treating the allocation as a carve-out from the plan rather than as an independent exercise.</p>",
      },
    ],
    faqs: [
      {
        question: "Does Medicare have to approve the set-aside?",
        answer:
          "Submission for review is voluntary and available only when the settlement meets published thresholds. Parties may settle without review, but the allocation should still be reasonable and documented so Medicare's interests are demonstrably considered.",
      },
      {
        question: "Can a life care plan be used in a settlement without an MSA?",
        answer:
          "Yes, when Medicare's interests are not implicated, for example where the person is not a beneficiary and has no reasonable expectation of enrollment, or where future medical care is not being released.",
      },
      {
        question: "Who administers the set-aside after settlement?",
        answer:
          "The funds may be self-administered by the injured person or placed with a professional administrator. Professional administration is often recommended for larger allocations because it documents that the funds were spent on covered, injury-related care.",
      },
      {
        question: "Is a rated age ever used in the life care plan?",
        answer:
          "Generally no. The plan's horizon rests on population life tables and physician opinion. The rated age belongs to the allocation and to structured settlement pricing.",
      },
    ],
    sources: refsToSources(["CMS_WCMSA_GUIDE", "CMS_WCMSA", "CMS_MSP", "IARP_IALCP_STANDARDS", "NCHS_LIFE_TABLES"]),
    related: [
      { title: "Medicare Set-Aside Allocations", href: "/services/medicare-set-aside" },
      { title: "MSA Allocation Methodology", href: "/methods/msa-allocation-methodology" },
      { title: "Life Care Plan vs. MSA (comparison)", href: "/compare/life-care-plan-vs-msa" },
      { title: "Workers' Compensation Life Care Plans", href: "/services/workers-compensation-lcp" },
    ],
  },
  {
    slug: "pediatric-life-care-plans-and-transition-to-adulthood",
    title: "Pediatric Life Care Plans and the Transition to Adulthood",
    tldr:
      "A pediatric life care plan is staged by development rather than written as a single lifetime schedule. Equipment is replaced on growth cycles, education and therapy shift when school-based services end, and the transition around age 21 changes who provides care, where the person lives, and what it costs. A plan that ignores these transitions understates or misstates lifetime care.",
    dateModified: "2026-08-26",
    sections: [
      {
        id: "why-pediatric-differs",
        heading: "Why a pediatric plan is different",
        bodyHtml:
          "<p>An adult with a stable catastrophic injury has needs that can be projected as a largely steady state with periodic replacements and re-evaluations. A child does not. The child grows, which changes equipment, medication dosing, and the physical demands of caregiving. The child develops, which changes what therapy is for and what independence is realistic. And the child ages out of the systems that provide much of early care, chiefly school-based services, at a fixed point. A <a href=\"/services/pediatric-life-care-planning\">pediatric life care plan</a> is built around those transitions.</p><p>The most common pediatric diagnoses in litigation are <a href=\"/case-types/cerebral-palsy\">cerebral palsy</a> and other <a href=\"/case-types/birth-injury\">birth-related neurological injuries</a>, pediatric <a href=\"/case-types/traumatic-brain-injury\">traumatic brain injury</a>, spinal cord injury, and severe burns. The staging described here applies to each, with the specifics driven by the diagnosis and the treating team.</p>",
      },
      {
        id: "developmental-staging",
        heading: "Developmental staging",
        bodyHtml:
          "<p>The plan is organized in stages, typically early childhood, school age, adolescence, and adulthood, with a further stage for older adulthood where expectancy supports it. Each item is assigned a start and stop point tied to a stage rather than a calendar year, so that when the plan is updated the structure survives. Early intervention therapies end when school begins; school-based therapy ends when school ends; adult outpatient therapy is frequently episodic rather than continuous. Specialist follow-up changes as pediatric providers hand off to adult specialists, and that hand-off is itself a period of increased visits and re-evaluation.</p><p>Staging also makes the plan easier to test. An opposing reviewer can ask whether a given item belongs in a given stage, and the planner can answer with the developmental basis. A single undifferentiated lifetime schedule invites the objection that a five-year-old's needs have been projected onto a forty-year-old.</p>",
      },
      {
        id: "equipment-growth-cycles",
        heading: "Equipment and growth cycles",
        bodyHtml:
          "<p>Pediatric durable equipment is replaced on growth, not on wear. Wheelchairs, seating systems, standers, gait trainers, bath and toileting equipment, and orthotics are outgrown on cycles that vary with age and the item, and the intervals are shorter in early childhood than in adolescence. The plan carries each item on its own growth-driven cycle until adult sizing, then shifts to the adult replacement interval. Orthotics may be replaced several times a year in a young child. A plan that applies a single adult replacement interval to a child understates equipment cost substantially in the early years. The <a href=\"/guides/home-modification-and-equipment-costing\">equipment costing guide</a> describes how replacement schedules are documented.</p>",
      },
      {
        id: "education-and-therapy",
        heading: "Education, therapy, and what the school provides",
        bodyHtml:
          "<p>During the school years, much therapy and some equipment are provided through the educational system under the child's education plan. The life care plan must decide how to treat those services. Services provided at school are directed at educational access, not medical need, and are frequently less frequent and less intensive than the treating team recommends. The planner documents what the school provides, what the treating team recommends, and projects the difference as a private need, together with the summer months and the periods when school services are unavailable. Educational consultation, advocacy, and tutoring may appear in the plan where the record supports them. When school services end, the full recommended therapy schedule becomes a private cost, and the plan shows that step change.</p>",
      },
      {
        id: "age-21-transition",
        heading: "The transition around age 21",
        bodyHtml:
          "<p>Between roughly ages 18 and 22 the plan changes character. School-based services end. Pediatric specialists hand off to adult medicine. The parents who have provided most of the care are aging, and the plan must state honestly whether family-provided care can continue and for how long. Guardianship or supported decision-making may be needed. Adult day programming, supported employment or vocational habilitation where appropriate, and community participation replace school as the structure of the day. Each of these has a cost, and several begin at the same time. The plan carries the transition as a distinct stage with its own items, and the attendant care projection moves from the family-supplemented childhood level to the full adult level described in the <a href=\"/guides/attendant-care-in-life-care-plans\">attendant care guide</a>.</p>",
      },
      {
        id: "residential-options",
        heading: "Residential options in adulthood",
        bodyHtml:
          "<p>The plan must address where the adult will live once family care is no longer realistic, and it should do so explicitly rather than assuming that parents will provide care indefinitely. The options are in-home care with attendants, a supported living arrangement with shared staffing, a group residence, or a skilled facility for those with medical complexity. Each has a different cost profile, and each has a different effect on the rest of the plan: a facility placement absorbs some items that in-home care lists separately, while in-home care requires home modification and full attendant staffing. The planner prices the option the treating team and the family consider appropriate and, where the record supports more than one path, presents the alternatives so the trier of fact can see the cost consequence of the choice.</p>",
      },
      {
        id: "life-expectancy-in-pediatric-plans",
        heading: "Life expectancy in pediatric plans",
        bodyHtml:
          "<p>Because the horizon is long, life expectancy drives the total more than in any adult plan, and it is frequently contested. The planner starts from the published population tables for the child's age and sex and departs from them only when a qualified physician has opined that the condition changes expectancy. Where the parties' physicians disagree, the plan is presented at each horizon. The <a href=\"/methods/life-expectancy-in-life-care-planning\">life expectancy method</a> page describes the approach. The plan should also be scheduled for <a href=\"/services/plan-update-and-review\">periodic update</a>, since a plan prepared for a toddler will be stale by adolescence regardless of how carefully it was staged.</p>",
      },
    ],
    faqs: [
      {
        question: "How often should a pediatric life care plan be updated?",
        answer:
          "There is no fixed interval, but a plan prepared in early childhood should be revisited at each major transition and whenever the treatment plan or living situation changes. In litigation, an update before trial is common when significant time has passed since the evaluation.",
      },
      {
        question: "Does the plan assume parents will provide care?",
        answer:
          "The plan documents what the family currently provides and states for how long that is realistic. It then projects paid care at the level the treating team supports, so the plan does not depend on unpaid family labor continuing indefinitely.",
      },
      {
        question: "Are school-provided services deducted from the plan?",
        answer:
          "The plan records what the school provides and projects the difference between that and the treating team's recommendation as a private need during the school years. When school services end, the full schedule becomes a private cost.",
      },
      {
        question: "Can a pediatric plan include vocational or day programming for adulthood?",
        answer:
          "Yes, where the record supports it. Adult day programming, supported employment, or habilitation services are common transition-stage items, priced in the person's own market.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS", "NCHS_LIFE_TABLES", "AANLCP_SCOPE"]),
    related: [
      { title: "Pediatric Life Care Planning", href: "/services/pediatric-life-care-planning" },
      { title: "Cerebral Palsy Cases", href: "/case-types/cerebral-palsy" },
      { title: "Birth Injury Cases", href: "/case-types/birth-injury" },
      { title: "Attendant Care in Life Care Plans", href: "/guides/attendant-care-in-life-care-plans" },
    ],
  },
  {
    slug: "how-to-rebut-a-life-care-plan",
    title: "How to Rebut a Life Care Plan",
    tldr:
      "A life care plan rebuttal tests the opposing plan item by item against the record: whether each item has a medical foundation, whether items duplicate one another, whether frequency and duration are supported, whether the cost sources are documented and geographically appropriate, and whether the life expectancy basis is sound. The findings organize both the rebuttal report and the deposition of the opposing planner.",
    dateModified: "2026-08-26",
    sections: [
      {
        id: "what-a-rebuttal-is",
        heading: "What a rebuttal is and is not",
        bodyHtml:
          "<p>A <a href=\"/services/life-care-plan-rebuttal\">life care plan rebuttal</a> is an independent review of an opposing plan by a qualified planner. It is not a list of deletions. A rebuttal that simply strikes items without a stated basis is as vulnerable as a plan that adds them without one. The reviewer applies the same <a href=\"/methods/life-care-plan-development\">standards of practice</a> the original planner was bound by, and where the record supports an item the rebuttal says so. Where the reviewer has access to the evaluee, an in-person evaluation strengthens the review; where not, the rebuttal proceeds on the record and says so plainly.</p><p>The output is usually a written report that addresses the opposing plan category by category, and often an alternative plan that shows what the record does support. The alternative plan gives the trier of fact a second number rather than only a critique of the first.</p>",
      },
      {
        id: "foundation-review",
        heading: "Foundation review",
        bodyHtml:
          "<p>The first test for every item is its medical foundation. The reviewer traces each recommendation to its source: a treating provider's record, an evaluating specialist's report, a provider's answer to the planner's questionnaire, or published clinical guidance for the diagnosis. Items with no identifiable source, items whose source is the planner's own judgment on a medical question outside the planner's license, and items recommended by a provider retained for litigation but never mentioned in treatment records are flagged. The reviewer also checks the date and context of each recommendation: a recommendation made once during acute care and never repeated may not support a lifetime item.</p>",
      },
      {
        id: "duplication",
        heading: "Duplication and overlap",
        bodyHtml:
          "<p>Plans that are built category by category can list the same service twice under different headings. Common examples are case management hours that overlap with attendant care supervision, therapy that appears both as an outpatient course and within a residential program's bundled rate, supplies that are included in a facility's per diem and also listed separately, and equipment maintenance listed alongside a replacement schedule that already assumes replacement rather than repair. The reviewer maps each item against the others and against any bundled rates to identify overlap.</p>",
      },
      {
        id: "frequency-and-duration",
        heading: "Frequency and duration support",
        bodyHtml:
          "<p>An item can have a sound foundation and still be overstated. The reviewer asks whether the stated frequency matches the recommendation and the clinical literature, whether the duration is lifetime when the provider described a course, and whether the item's start and stop points reflect the person's actual trajectory. Therapy carried at an acute-phase frequency for life, specialist visits at an annual frequency the specialist never recommended, and pediatric equipment replaced on an adult interval are recurring findings. For pediatric plans the reviewer also tests whether transitions are staged, as described in the <a href=\"/guides/pediatric-life-care-plans-and-transition-to-adulthood\">pediatric guide</a>.</p>",
      },
      {
        id: "pricing-audit",
        heading: "Pricing source audit",
        bodyHtml:
          "<p>Each unit cost is checked for its source, its date, and its geography. The reviewer asks whether the price reflects the market where the person lives, whether billed charges were used where the jurisdiction measures damages differently, whether a national average or a distant market was substituted for local research, and whether the plan explains any choice between divergent figures. Attendant care is examined most closely because it is usually the largest category: the level of care, the number of hours, the agency versus private-hire basis, and the rate source each affect the total, as set out in the <a href=\"/guides/attendant-care-in-life-care-plans\">attendant care guide</a>. Equipment and home modification are checked against the approach described in the <a href=\"/guides/home-modification-and-equipment-costing\">costing guide</a>. The reviewer re-prices significant items independently using the <a href=\"/methods/cost-research-methodology\">same documented method</a>.</p>",
      },
      {
        id: "life-expectancy-basis",
        heading: "Life expectancy basis",
        bodyHtml:
          "<p>The horizon multiplies everything. The reviewer identifies which life table the plan used and whether it is the current vintage, whether the planner departed from the population figure, and if so on whose opinion. A planner who shortened or lengthened expectancy without a physician's support has stepped outside the planner's role. Where the record contains competing physician opinions, the rebuttal presents the alternative horizon and its effect on the total. The <a href=\"/methods/life-expectancy-in-life-care-planning\">life expectancy method</a> page sets out the standard.</p>",
      },
      {
        id: "deposition-themes",
        heading: "Deposition themes",
        bodyHtml:
          "<p>The rebuttal findings organize the deposition of the opposing planner. Productive lines of questioning follow the review: which document supports each contested item and when it was written; whether the planner asked the provider the question or inferred the answer; how each frequency was chosen; where each price came from, when it was obtained, and whether the planner spoke to the source; which life table was used and who authorized any departure from it; whether the planner examined the evaluee and, if so, what was observed that the record does not show; and whether the plan distinguishes injury-related needs from pre-existing conditions. The goal is a transcript in which each contested item either has a foundation or does not, so the trier of fact is not left weighing two totals in the abstract. Counsel should confirm the <a href=\"/guides/federal-vs-state-court-daubert\">governing admissibility framework</a> before deciding whether the findings support a motion or are better used at trial.</p>",
      },
    ],
    faqs: [
      {
        question: "Does a rebuttal require examining the plaintiff?",
        answer:
          "No, but it helps. Many rebuttals proceed on the record alone, particularly where the defense has no access to the evaluee. Where an examination is available, direct observation of current function and the home often reveals differences from the plan that the record does not.",
      },
      {
        question: "Should the rebuttal include an alternative plan?",
        answer:
          "Usually. An alternative plan grounded in the same record gives the trier of fact a supported number rather than only a critique, and it demonstrates that the reviewer applied the standards rather than simply deleting items.",
      },
      {
        question: "Can the rebuttal address the economist's calculation?",
        answer:
          "The life care planner addresses the care schedule and its costs. Discount rates and growth assumptions belong to the economist. A rebuttal planner will, however, flag where the economist's inputs do not match the plan, for example a different horizon or item schedule.",
      },
      {
        question: "What if the opposing plan has no work file?",
        answer:
          "The absence of documented sources for costs and recommendations is itself a finding. The reviewer reports what could and could not be verified and re-prices significant items from documented sources.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS", "NCHS_LIFE_TABLES", "FRE_702", "DAUBERT"]),
    related: [
      { title: "Life Care Plan Rebuttal", href: "/services/life-care-plan-rebuttal" },
      { title: "Plaintiff Expert vs. Defense Expert", href: "/compare/plaintiff-expert-vs-defense-expert" },
      { title: "In-Person Evaluation vs. File Review", href: "/compare/in-person-evaluation-vs-file-review" },
      { title: "Expert Witness Testimony", href: "/services/expert-witness-testimony" },
    ],
  },
  {
    slug: "attendant-care-in-life-care-plans",
    title: "Attendant Care in Life Care Plans",
    tldr:
      "Attendant care is usually the largest category in a catastrophic life care plan. The planner specifies the level of care, the hours across the day and week, the basis for those hours, the agency or private-hire rate in the person's market, how family-provided care is treated, and respite for the caregivers. Each of those choices is tested in a rebuttal, so each is documented.",
    dateModified: "2026-08-26",
    sections: [
      {
        id: "why-attendant-care-matters",
        heading: "Why attendant care dominates the plan",
        bodyHtml:
          "<p>A wheelchair is replaced every few years. Attendant care recurs every day. For a person with a high-level <a href=\"/case-types/spinal-cord-injury\">spinal cord injury</a>, a severe <a href=\"/case-types/traumatic-brain-injury\">brain injury</a>, or <a href=\"/case-types/cerebral-palsy\">cerebral palsy</a> with significant motor involvement, the cost of the people who provide daily assistance and supervision typically exceeds every other category combined. Small differences in hours or rate compound over decades, which is why attendant care receives the closest scrutiny from opposing experts and why the planner's documentation must be complete.</p>",
      },
      {
        id: "levels-of-care",
        heading: "Levels of care",
        bodyHtml:
          "<p>The plan states the level of care required, because the level determines who can provide it and what it costs. The common levels are companion or supervisory care for a person who is physically able but cannot be left alone safely because of cognitive or behavioral impairment; personal care or home health aide assistance for hands-on help with bathing, dressing, transfers, toileting, and feeding; licensed practical or vocational nursing for delegated skilled tasks such as medication administration, tube feeding, and routine catheter or wound care; and registered nursing for ventilator management, complex assessment, and unstable medical conditions. Many plans specify more than one level across the day, for example aide-level care for morning and evening routines and supervisory care in between. The level is a medical determination: the planner documents the treating provider's statement of what the person needs and matches the level to it.</p>",
      },
      {
        id: "hours-methodology",
        heading: "How hours are determined",
        bodyHtml:
          "<p>Hours are built from the person's day, not assumed. The planner documents the person's function from the record and, where possible, from direct observation in the home: what assistance is needed to get up, bathe, dress, eat, toilet, transfer, and get to bed; whether the person can be left alone and for how long; what happens overnight; and what changes on days with appointments or therapy. From that the planner constructs a schedule across the 24-hour day and the 7-day week, distinguishing active hands-on hours from supervisory presence and identifying whether overnight care is awake or asleep. The treating physician or therapist confirms the level and the general scope of hours. For a person who cannot be left alone, the plan will often show continuous coverage, and the planner should say so directly rather than presenting a partial schedule and leaving the gap unexplained.</p>",
      },
      {
        id: "agency-vs-private-hire",
        heading: "Agency versus private-hire rates",
        bodyHtml:
          "<p>The same hour of aide care costs more through a licensed agency than through a directly employed caregiver, because the agency rate carries recruitment, supervision, training, insurance, payroll taxes, and coverage for absences. The plan states which basis it uses and why. Agency rates are appropriate when the family cannot realistically act as an employer, when skilled care is needed, or when reliable coverage for absences matters. Private-hire rates are appropriate when the family can manage employment and the plan accounts for the employer's costs, including payroll taxes, workers' compensation coverage, and backup coverage, rather than quoting a bare hourly wage. Rates are researched in the person's own market from agencies and, where applicable, state rate schedules, and the source and date of each are recorded as described in the <a href=\"/methods/cost-research-methodology\">cost research methodology</a>.</p>",
      },
      {
        id: "family-provided-care",
        heading: "Family-provided care",
        bodyHtml:
          "<p>Most catastrophically injured people receive substantial care from family members, and the plan must address it honestly. The planner documents what the family currently provides and at what cost to the family members' own health, employment, and sleep. The plan then projects care at the level and hours the treating team supports, priced as paid care, because family members age, become ill, and cannot be assumed to provide skilled or continuous care indefinitely. Whether family-provided care is compensable, and at what rate, is a legal question that varies by jurisdiction; the plan gives counsel the hours and the market rate so the legal question can be answered, and it identifies separately any period during which the plan assumes family care will continue.</p>",
      },
      {
        id: "respite",
        heading: "Respite care",
        bodyHtml:
          "<p>Where the plan relies on family care for any period, it includes respite: paid coverage that gives the family caregivers scheduled relief. Respite is specified as hours or days per period at the appropriate level of care and priced at the applicable rate. Its purpose is to keep the family-care assumption realistic. A plan that projects a parent providing care for years without relief is projecting a schedule no one can sustain, and an opposing reviewer will say so.</p>",
      },
      {
        id: "documentation-and-updates",
        heading: "Documentation and updates",
        bodyHtml:
          "<p>The work file for attendant care contains the functional basis for the hours, the provider statements supporting the level, the observed daily schedule where an evaluation was performed, the rate quotes with agency names and dates, and the reasoning for the agency or private-hire choice. Because needs change with age and condition and rates change with the labor market, attendant care is re-examined at every <a href=\"/services/plan-update-and-review\">plan update</a>. In pediatric plans it is restated at each developmental stage, as described in the <a href=\"/guides/pediatric-life-care-plans-and-transition-to-adulthood\">pediatric guide</a>. The <a href=\"/guides/how-to-rebut-a-life-care-plan\">rebuttal guide</a> lists the questions an opposing reviewer will ask of each of these elements.</p>",
      },
    ],
    faqs: [
      {
        question: "Who decides how many hours of attendant care a person needs?",
        answer:
          "The level of care is a medical determination documented by the treating provider. The hours are built by the planner from the person's documented function and daily routine, confirmed against the provider's statement of need.",
      },
      {
        question: "Should the plan use the agency rate or the private-hire rate?",
        answer:
          "It depends on the level of care, the family's ability to act as an employer, and the need for reliable coverage. The plan states the basis chosen and why, and prices private-hire care with employer costs included rather than as a bare wage.",
      },
      {
        question: "Does the plan include care the family provides for free?",
        answer:
          "The plan documents family-provided care and projects the same care at market rates for the period the treating team supports it, because family care cannot be assumed to continue indefinitely. Whether it is compensable is a legal question for counsel.",
      },
      {
        question: "Is overnight care always awake care?",
        answer:
          "No. The plan distinguishes awake overnight care, needed when the person requires turning, suctioning, or supervision during the night, from asleep or on-call presence. The two are priced differently.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS", "AANLCP_SCOPE"]),
    related: [
      { title: "Catastrophic Injury Planning", href: "/services/catastrophic-injury-planning" },
      { title: "Spinal Cord Injury Cases", href: "/case-types/spinal-cord-injury" },
      { title: "Home Modification and Equipment Costing", href: "/guides/home-modification-and-equipment-costing" },
      { title: "How to Rebut a Life Care Plan", href: "/guides/how-to-rebut-a-life-care-plan" },
    ],
  },
  {
    slug: "home-modification-and-equipment-costing",
    title: "Home Modification and Equipment Costing in Life Care Plans",
    tldr:
      "Home modification and durable equipment are costed differently from recurring care. The planner assesses the home for accessibility, separates one-time items from recurring and periodically replaced ones, documents a replacement schedule for each piece of equipment, and prices from vendor quotes and recognized databases with the source recorded. The result is a schedule the economist can carry year by year.",
    dateModified: "2026-08-26",
    sections: [
      {
        id: "accessibility-assessment",
        heading: "The accessibility assessment",
        bodyHtml:
          "<p>Home modification begins with the home. During the in-person evaluation the planner documents the entrance and any steps, door widths and thresholds, hallway and turning clearances, the bathroom layout and fixtures, the bedroom and its distance from the bathroom, kitchen access, flooring, and the parking and path to the vehicle. The planner records what the person can and cannot do in that environment now, what equipment is already in use, and where the caregivers are lifting, carrying, or improvising. Where the person is expected to move, the planner notes that and prices modifications for a typical accessible dwelling rather than for the current home. Where the home cannot practically be modified, the plan says so and addresses relocation or the differential cost of an accessible residence as the record supports.</p>",
      },
      {
        id: "one-time-vs-recurring",
        heading: "One-time, recurring, and periodically replaced items",
        bodyHtml:
          "<p>The plan distinguishes three kinds of cost. One-time items are incurred once: a ramp or lift at the entrance, widened doorways, a roll-in shower, an accessible kitchen, a ceiling track system, and the associated design and permitting. Recurring items are consumed continuously: incontinence supplies, catheters, wound care supplies, nutritional formula, and the maintenance contracts on lifts and power equipment. Periodically replaced items are bought, used, and replaced on an interval: wheelchairs and seating, hospital beds and mattresses, patient lifts, shower and commode chairs, communication devices, orthotics and prosthetics, and vehicle modifications. Each kind is carried differently in the schedule, and mixing them, for example listing a one-time ramp as an annual cost or a replaced wheelchair as a one-time purchase, is a common error a reviewer will find.</p><p>Supplies illustrate how the recurring category is built. For a person with a neurogenic bladder managed by intermittent catheterization, the plan states the catheter type the treating provider prescribes, the number of catheterizations per day, and the resulting monthly quantity, then prices that quantity from a supplier in the person's market. Gloves, lubricant, and skin-care products are listed alongside on the same basis. The same approach applies to incontinence products, tracheostomy and suction supplies, and enteral formula: quantity per day from the provider's order, price per unit from a documented source, carried monthly for the plan horizon and re-priced at each update.</p>",
      },
      {
        id: "replacement-schedules",
        heading: "Replacement schedules",
        bodyHtml:
          "<p>Every periodically replaced item carries a stated replacement interval and the basis for it. Manufacturer guidance, funding-source replacement criteria, the treating therapist's recommendation, and the item's actual history in the record all inform the interval. Power wheelchairs, manual wheelchairs, cushions, and batteries each have their own cycle; a child's equipment is replaced on growth rather than wear, as described in the <a href=\"/guides/pediatric-life-care-plans-and-transition-to-adulthood\">pediatric guide</a>; a prosthesis has a socket cycle shorter than its component cycle. The schedule then places each replacement in the year it falls within the plan's <a href=\"/methods/life-expectancy-in-life-care-planning\">life expectancy horizon</a>. Maintenance and repair between replacements are listed as a recurring item, and the plan avoids counting both a repair allowance that assumes the item is kept and a replacement schedule that assumes it is not.</p>",
      },
      {
        id: "vendor-quotes-vs-databases",
        heading: "Vendor quotes versus databases",
        bodyHtml:
          "<p>Equipment and modification are priced from two kinds of source. Vendor and contractor quotes are specific to the item, the configuration, and the market, and they are the preferred source for custom equipment such as seating systems, for vehicle modifications, and for construction work, where the price depends on the home. Recognized pricing databases and manufacturer list prices are appropriate for standardized items and as a check on quotes. The plan states for each item which source was used, records the vendor, contact, date, and any configuration assumptions, and explains any choice between divergent figures. For construction, the planner obtains a contractor's estimate based on the assessment or, where that is not possible, prices the modification from published cost data for the region and says so. The general approach is set out in the <a href=\"/methods/cost-research-methodology\">cost research methodology</a>.</p>",
      },
      {
        id: "vehicle-modification",
        heading: "Vehicle modification and transportation",
        bodyHtml:
          "<p>Transportation is costed as the modification, not the vehicle, unless the record supports a vehicle the person would not otherwise own. Lowered-floor conversions, ramps or lifts, hand controls, transfer seats, and securement systems are priced from mobility dealers, and the conversion is carried on a replacement interval tied to the vehicle's expected life. Where the person cannot drive and family transport is not realistic, the plan prices accessible transportation services instead of, or in addition to, vehicle modification, and it states which assumption it makes.</p>",
      },
      {
        id: "common-errors",
        heading: "Common errors and how a reviewer finds them",
        bodyHtml:
          "<p>The errors that recur in this category are pricing modifications for a home the person is unlikely to stay in without addressing the alternative; carrying a one-time modification as recurring; applying a single replacement interval to items with different cycles; listing maintenance and replacement so that both assume the same item; quoting list price for equipment that is routinely discounted, or a discounted price for custom equipment that is not; and omitting the design, permitting, and installation costs that accompany construction. Each is visible in a work file that records source, date, and basis, which is why the <a href=\"/guides/how-to-rebut-a-life-care-plan\">rebuttal reviewer</a> asks for that file first.</p>",
      },
    ],
    faqs: [
      {
        question: "Does the plan pay to modify a rented home?",
        answer:
          "The plan addresses the person's actual situation. Where the person rents, the plan may price portable equipment and modifications the landlord permits, the differential cost of an accessible unit, or relocation, as the record supports, and it states which assumption it makes.",
      },
      {
        question: "How is a replacement interval chosen?",
        answer:
          "From manufacturer guidance, funding-source replacement criteria, the treating therapist's recommendation, and the item's actual history in the record. The plan states the interval and its basis for each item.",
      },
      {
        question: "Should equipment be priced at list or at a discounted rate?",
        answer:
          "At the price the person will actually face in their market. For standardized items that is often below list; for custom-configured items a dealer quote is the reliable source. The plan records which was used.",
      },
      {
        question: "Is a home modification a medical item?",
        answer:
          "It is a non-medical category supported by a clinical assessment, usually from an occupational or physical therapist or the planner acting within scope. It is included in a life care plan but generally falls outside a Medicare set-aside allocation.",
      },
    ],
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS", "AOTA_OTPF_2020"]),
    related: [
      { title: "Life Care Planning", href: "/services/life-care-planning" },
      { title: "Cost Research Methodology", href: "/methods/cost-research-methodology" },
      { title: "Attendant Care in Life Care Plans", href: "/guides/attendant-care-in-life-care-plans" },
      { title: "Amputation Cases", href: "/case-types/amputation" },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
