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
    question: "What is a vocational expert and what do they do?",
    sources: refsToSources(["BLS_OOH", "ONET", "CRCC", "CVE_STATUS", "ABVE"]),
    answer:
      "A [[/services/vocational-expert|vocational expert (VE)]] is a credentialed professional who evaluates an individual's ability to work, earn wages, and sustain employment given their education, training, experience, and any medical restrictions. In litigation, VEs provide opinions on employability, [[/insights/what-is-earning-capacity-evaluation|earning capacity]], and [[/guides/what-is-transferable-skills-analysis|labor market conditions]]. KWVRS vocational experts hold [[/credentials|credentials such as CRC, CVE, and ABVE/D]].",
  },
  {
    question: "What types of cases does KWVRS accept?",
    answer:
      "KWVRS accepts cases across a wide range of practice areas, including [[/insights/role-of-vocational-expert-personal-injury|personal injury]], workers' compensation, [[/services/standard-of-care|medical malpractice]], wrongful death, wrongful termination, [[/guides/ssa-disability-and-vocational-evidence|long-term disability]], and [[/services/matrimonial|matrimonial/family law]]. KWVRS accepts engagements from both plaintiff and defense counsel, and opinions are based solely on the evidence.",
  },
  {
    question: "What is a life care plan?",
    sources: refsToSources(["IARP_IALCP_STANDARDS", "ICHCC_CLCP", "NCHS_LIFE_TABLES"]),
    answer:
      "A [[/services/life-care-planning|life care plan]] is an individualized, evidence-based document that projects the future medical and non-medical care needs of a person with a catastrophic injury or chronic condition. It details the cost of all recommended care across the claimant's [[/tools/life-expectancy|remaining life expectancy]] and is typically used to calculate future damages in litigation. KWVRS's [[/knowledge/guide-to-life-care-planning|certified life care planners (CLCPs)]] prepare plans that comply with IARP and IALCP standards.",
  },
  {
    question: "What is forensic economic analysis?",
    sources: refsToSources(["TINARI_2016", "BLS_ATUS"]),
    answer:
      "[[/services/forensic-economics|Forensic economic analysis]] quantifies the economic damages resulting from injury or death. This includes lost earnings, [[/insights/what-is-earning-capacity-evaluation|lost earning capacity]], [[/services/loss-of-household-services|lost household services]], and fringe benefits - all calculated in [[/insights/how-forensic-economists-calculate-damages|present value]]. KWVRS's affiliated forensic economists at kweconomics.com provide these analyses for personal injury, wrongful death, and wrongful termination cases.",
  },
  {
    question: "How is an earning capacity evaluation different from a wage loss calculation?",
    sources: refsToSources(["ONET", "BLS_OEWS", "TRUTHAN_KARMAN_2003"]),
    answer:
      "[[/guides/earning-capacity-vs-lost-earnings|Wage loss]] is a forensic economic calculation - the difference between what someone earned pre-injury and what they now earn or are expected to earn. [[/insights/what-is-earning-capacity-evaluation|Earning capacity evaluation]] is a vocational determination - it establishes what an injured person is vocationally capable of earning, given their [[/guides/what-is-transferable-skills-analysis|transferable skills]], labor market conditions, and medical restrictions. Both are typically needed in [[/insights/life-care-plan-components-and-methodology|catastrophic injury cases]].",
  },
  {
    question: "Are KWVRS experts qualified to testify in federal court?",
    sources: refsToSources(["DAUBERT", "FRE_702", "FRYE"]),
    answer:
      "Yes. KWVRS experts hold nationally recognized certifications and have provided [[/services/expert-witness-testimony|testimony]] in state and federal courts throughout the country. KWVRS reports are prepared to meet the [[/guides/daubert-standard-vocational-experts|admissibility standards]] applied in state and federal courts, and to withstand cross-examination on [[/knowledge/expert-witness-testimony-guide|methodology, data sources, and professional standards]].",
  },
  {
    question: "Does KWVRS work in all 50 states?",
    sources: refsToSources(["RSA_ED"]),
    answer:
      "Yes. KWVRS accepts cases in [[/locations|all 50 states, the District of Columbia, and U.S. territories]]. Our experts are familiar with jurisdiction-specific [[/guides/vocational-rehabilitation-services-explained|vocational rehabilitation agency frameworks]], [[/guides/expert-witness-disclosure-rules|court rules regarding expert testimony]], and [[/services/vocational-expert|local labor market conditions]].",
  },
  {
    question: "How long does it take to receive a vocational evaluation report?",
    answer:
      "[[/guides/how-long-does-vocational-evaluation-take|Report turnaround time]] depends on the complexity of the case, availability of medical records, and whether an in-person evaluation is required. In most cases, we can deliver an initial [[/services/vocational-expert|evaluation report]] within 30-45 days of receiving complete case materials. Rush timelines may be available - [[/contact|contact us]] to discuss your deadline.",
  },
  {
    question: "What credentials should I look for in a vocational expert?",
    sources: refsToSources(["CRCC", "CVE_STATUS", "ABVE"]),
    answer:
      "[[/guides/how-to-hire-vocational-expert|For litigation purposes]], look for a [[/credentials|Certified Rehabilitation Counselor (CRC)]], Certified Vocational Evaluator (CVE), or Diplomate of the American Board of Vocational Experts (ABVE/D). These credentials require a graduate degree, supervised experience, and passing a national examination. KWVRS's lead experts hold multiple credentials, including Ph.D.-level academic qualifications.",
  },
  {
    question: "Can KWVRS provide a life care plan and vocational evaluation for the same case?",
    answer:
      "Yes, and this can be an efficient approach for catastrophic injury matters. KWVRS's [[/team|multidisciplinary team]] can coordinate a [[/services/vocational-expert|vocational evaluation]], [[/services/life-care-planning|life care plan]], and [[/services/forensic-economics|forensic economic analysis]] for the same case, ensuring consistency across opinions and reducing the burden on the retaining attorney.",
  },
  {
    question: "What is the difference between a vocational expert and an occupational therapist?",
    sources: refsToSources(["AOTA_OTPF_2020", "BLS_OOH"]),
    answer:
      "A [[/services/vocational-expert|vocational expert]] evaluates [[/guides/what-is-transferable-skills-analysis|labor market factors]] - what jobs someone can perform, what those jobs pay, and whether the person is [[/insights/what-is-earning-capacity-evaluation|competitively employable]]. An occupational therapist (OT) evaluates functional capacity - what physical and cognitive tasks a person can actually perform. In [[/insights/role-of-vocational-expert-personal-injury|complex injury cases]], both are often needed: the OT establishes functional limits, and the vocational expert translates those limits into labor market consequences.",
  },
  {
    question: "How do I retain KWVRS for a case?",
    answer:
      "Contact our office by phone at (201) 343-0700 or via the [[/contact|contact form on this website]]. A member of our [[/schedule-consultation|intake team]] will follow up within one business day to discuss case details, required documentation, and [[/team|expert availability]]. We accept cases from plaintiff counsel, defense counsel, insurance carriers, and self-represented claimants.",
  },
];
