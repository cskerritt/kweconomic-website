import type { Faq } from "./types";
import { refsToSources } from "./references";

// Single source of truth for the site FAQ. Imported by the FAQ page
// (src/pages/FAQ.tsx) and by the llms.txt generator (scripts/generate-llms.mjs),
// so the live page and the published AI-readable summary stay in sync.
//
// Answers may carry inline-link markers (see src/lib/richtext.tsx for the marker
// format): FAQ.tsx renders them as internal links, and both scripts/generate-llms.mjs
// and src/lib/schema.ts strip them back to anchor text so no marker syntax leaks
// into the llms.txt summary or the FAQPage JSON-LD. Registry-backed per-answer
// sources (refsToSources) are surfaced as a consolidated References block on the page.
export const faqs: Faq[] = [
  {
    question: "What is a life care plan?",
    sources: refsToSources(["IARP_IALCP_STANDARDS", "ICHCC_CLCP", "NCHS_LIFE_TABLES"]),
    answer:
      "A [[/services/life-care-planning|life care plan]] is an individualized, evidence-based document that projects the future medical and non-medical care needs of a person with a catastrophic injury or chronic condition. It itemizes each need with its frequency, duration, and cost across the person's [[/tools/life-expectancy|remaining life expectancy]] and is typically used to establish future damages in litigation or to fund a settlement. KW Life Care Planning's [[/knowledge/guide-to-life-care-planning|certified life care planners]] prepare plans that follow the published standards of practice.",
  },
  {
    question: "Who prepares a life care plan?",
    sources: refsToSources(["ICHCC_CLCP", "AANLCP_SCOPE"]),
    answer:
      "Life care plans are prepared by credentialed planners with a clinical background. The two principal credentials are the [[/credentials/clcp|Certified Life Care Planner (CLCP)]] and the [[/credentials/cnlcp|Certified Nurse Life Care Planner (CNLCP)]], held by nurses, rehabilitation counselors, therapists, and physicians. Every plan rests on a medical foundation: the treating or evaluating physicians recommend the care, and the planner organizes, projects, and prices it. See [[/compare/clcp-vs-cnlcp|CLCP vs. CNLCP]] for how the credentials differ.",
  },
  {
    question: "What types of cases does KW Life Care Planning accept?",
    answer:
      "Plans and cost projections are prepared for [[/case-types/personal-injury|personal injury]], [[/case-types/medical-malpractice|medical malpractice]], [[/case-types/birth-injury|birth injury]], [[/case-types/workers-compensation|workers' compensation]], and other matters involving [[/case-types/traumatic-brain-injury|traumatic brain injury]], [[/case-types/spinal-cord-injury|spinal cord injury]], [[/case-types/amputation|amputation]], [[/case-types/burn-injury|burns]], and [[/case-types/cerebral-palsy|cerebral palsy]]. Engagements are accepted from both plaintiff and defense counsel and from carriers, and opinions are based solely on the record.",
  },
  {
    question: "What is the difference between a life care plan and a medical cost projection?",
    sources: refsToSources(["IARP_IALCP_STANDARDS", "WEED_BERENS"]),
    answer:
      "A life care plan covers the full scope of injury-related needs, medical and non-medical, across the lifespan, and typically includes an interview and evaluation of the person. A [[/services/medical-cost-projection|medical cost projection]] is a narrower, records-based estimate of a defined set of future medical costs, often for a shorter horizon or a single treatment pathway. The [[/compare/life-care-plan-vs-future-cost-projection|comparison page]] explains when each is appropriate.",
  },
  {
    question: "What is a Medicare set-aside, and is it the same as a life care plan?",
    sources: refsToSources(["CMS_WCMSA_GUIDE", "CMS_MSP"]),
    answer:
      "A [[/services/medicare-set-aside|Medicare set-aside allocation]] estimates the portion of a settlement to reserve for future injury-related care that Medicare would otherwise pay. It is narrower than a life care plan: it includes only Medicare-covered items and prices them on a fee-schedule basis under Medicare's review guidance. Many catastrophic workers' compensation settlements need both, and the same record review can support each. See [[/guides/life-care-plan-vs-medicare-set-aside|life care plan vs. Medicare set-aside]].",
  },
  {
    question: "How are the costs in a life care plan researched?",
    sources: refsToSources(["CMS_PFS", "FAIR_HEALTH"]),
    answer:
      "Each item is priced for the geographic market where the person lives, using provider and vendor quotes, recognized usual-and-customary charge data, published fee schedules, and manufacturer pricing as appropriate. The source and date of every cost are recorded so the figure can be traced and re-priced at a later update. The [[/methods/cost-research-methodology|cost research methodology]] page describes the process, and [[/guides/how-a-life-care-plan-is-priced|how a life care plan is priced]] explains what drives the fee for the engagement itself.",
  },
  {
    question: "How is life expectancy handled?",
    sources: refsToSources(["NCHS_LIFE_TABLES", "CDC_LIFE_TABLES"]),
    answer:
      "The plan horizon starts from the current published United States life tables for the person's age and sex. The planner departs from the population figure only when a qualified physician has opined that the condition changes it, and documents that basis. Where the parties dispute expectancy, the plan can be presented at each proposed horizon. See [[/methods/life-expectancy-in-life-care-planning|life expectancy in life care planning]].",
  },
  {
    question: "Are life care plans admissible in state and federal court?",
    sources: refsToSources(["DAUBERT", "FRE_702", "FRYE"]),
    answer:
      "Yes, when prepared by a qualified planner following accepted methodology and grounded in physician recommendations and documented cost research. KW Life Care Planning's planners have provided [[/services/expert-witness-testimony|deposition and trial testimony]] in state and federal courts, and reports are prepared to meet the [[/guides/federal-vs-state-court-daubert|admissibility frameworks]] applied in each. Attorneys confirm the governing framework for the specific case.",
  },
  {
    question: "Can KW Life Care Planning review an opposing party's life care plan?",
    answer:
      "Yes. A [[/services/life-care-plan-rebuttal|life care plan rebuttal]] tests each item in the opposing plan for medical foundation, duplication, supported frequency and duration, documented and geographically appropriate pricing, and the life expectancy basis. The review may be records-only or may include an evaluation of the person, depending on access and the needs of the case. [[/guides/how-to-rebut-a-life-care-plan|How to rebut a life care plan]] outlines the approach.",
  },
  {
    question: "Does KW Life Care Planning work in all 50 states?",
    answer:
      "Yes. Plans are prepared for matters in [[/locations|all 50 states, the District of Columbia, and U.S. territories]]. Cost research is performed in the person's own market, and the planners are familiar with jurisdiction-specific [[/guides/expert-witness-disclosure-rules|expert disclosure rules]] and admissibility frameworks.",
  },
  {
    question: "How long does it take to receive a life care plan?",
    answer:
      "Turnaround depends on the complexity of the injury, the completeness of the medical records, whether an in-person evaluation is required, and how quickly treating providers respond to requests for recommendations. Most plans are delivered within several weeks of receiving complete records and completing the evaluation; a records-based [[/services/medical-cost-projection|medical cost projection]] is typically faster. Shorter timelines may be available - [[/contact|contact us]] to discuss your deadline.",
  },
  {
    question: "Should a life care plan be updated before trial?",
    sources: refsToSources(["IARP_IALCP_STANDARDS"]),
    answer:
      "Often, yes. A life care plan is a dynamic document. When the person's condition, treatment plan, or living situation has changed, or when significant time has passed since the costs were researched, a [[/services/plan-update-and-review|plan update]] refreshes the medical foundation and re-prices each item so the plan reflects current care and current costs.",
  },
  {
    question: "How do I retain KW Life Care Planning for a case?",
    answer:
      "Contact our office by phone at (201) 343-0700 or via the [[/contact|contact form on this website]]. A member of our [[/schedule-consultation|intake team]] will follow up within one business day to discuss the case, the records needed, and [[/team|planner availability]]. We accept cases from plaintiff counsel, defense counsel, and insurance carriers.",
  },
];
