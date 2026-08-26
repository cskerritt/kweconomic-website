import type { Faq, Source } from "./types";

export interface Credential {
  slug: string;
  name: string;
  abbreviation: string;
  issuer?: string;
  issuerUrl?: string;
  scope: string;
  requirements: string[];
  admissibilityHistory: string;
  stateReciprocity: Record<string, "full" | "limited" | "none" | "na">;
  kwvrsExpertsSlugs: string[];
  faqs: Faq[];
  sources: Source[];
}

export const credentials: Credential[] = [
  {
    slug: "crc",
    name: "Certified Rehabilitation Counselor",
    abbreviation: "CRC",
    issuer: "Commission on Rehabilitation Counselor Certification",
    issuerUrl: "https://crccertification.com/",
    scope:
      "The CRC is the recognized national certification for rehabilitation counselors. Scope of practice includes assessment, counseling, case management, job analysis, labor market survey, transferable skills analysis, and expert testimony related to earning capacity, employability, and vocational rehabilitation services.",
    requirements: [
      "Master's degree in rehabilitation counseling or a closely related field",
      "Supervised clinical experience per CRCC criteria",
      "Passing score on the national CRC examination",
      "Continuing education and renewal every five years",
      "Adherence to the CRCC Code of Professional Ethics",
    ],
    admissibilityHistory:
      "CRC-led vocational opinions have a long and well-established history of admissibility in state and federal courts when grounded in accepted methodology (transferable skills analysis, labor market survey, DOT and O*NET data) and supported by documented reasoning.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Is the CRC a license or a certification?",
        answer:
          "The CRC is a national certification administered by CRCC. It is distinct from state licensure, though many states also license professional counselors or rehabilitation counselors separately.",
      },
      {
        question: "What distinguishes a CRC from a vocational case manager?",
        answer:
          "The CRC is a credentialed counselor qualified to render expert opinion on earning capacity, employability, and vocational rehabilitation. Vocational case managers focus on coordinating services and returning claimants to work, without the same forensic training or opinion-giving scope.",
      },
      {
        question: "Do courts require a CRC specifically to testify on vocational issues?",
        answer:
          "Courts do not mandate a specific credential, but CRC is among the most widely accepted credentials for vocational expert testimony. The specific credential requirement, if any, depends on jurisdictional preferences and the nature of the opinion.",
      },
      {
        question: "How often must a CRC renew?",
        answer:
          "Every five years, with documented continuing education meeting CRCC's requirements.",
      },
    ],
    sources: [
      { title: "CRCC - Certification Overview", url: "https://crccertification.com/crc-certification/", type: "org" },
      { title: "CRCC Code of Professional Ethics", url: "https://crccertification.com/code-of-ethics-3/", type: "org" },
    ],
  },
  {
    slug: "clcp",
    name: "Certified Life Care Planner",
    abbreviation: "CLCP",
    issuer: "International Commission on Health Care Certification",
    issuerUrl: "https://www.ichcc.org/",
    scope:
      "The CLCP is the recognized certification for life care planners. Scope includes development of comprehensive, individualized life care plans for individuals with catastrophic injuries or chronic conditions, with projected cost and frequency of all recommended care.",
    requirements: [
      "Qualifying healthcare or rehabilitation credential (e.g., RN, OT, PT, CRC, physician)",
      "Completion of a 120-hour post-graduate life care planning training program",
      "Documented case experience under supervision",
      "Passing score on the CLCP examination",
      "Continuing education and renewal every five years",
    ],
    admissibilityHistory:
      "CLCP methodology follows published standards (IALCP, IARP Life Care Planning Section) and has been accepted in both state and federal courts when grounded in treating-team recommendations, local cost data, and peer-reviewed duration literature.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Does a CLCP require a prior clinical credential?",
        answer:
          "Yes. CLCP candidates must hold a qualifying healthcare or rehabilitation credential (such as RN, OT, PT, CRC, or physician) before pursuing the CLCP certification.",
      },
      {
        question: "How is the life care planning methodology standardized?",
        answer:
          "Practice standards are published by IALCP and IARP's Life Care Planning Section, with methodology following a consensus approach that integrates treating team recommendations, peer-reviewed duration literature, and geographically matched cost data.",
      },
      {
        question: "Can a CLCP testify on causation?",
        answer:
          "Causation opinions are generally provided by physicians. The CLCP projects the cost of care consistent with physician-supported recommendations and does not typically opine on causation.",
      },
    ],
    sources: [
      { title: "ICHCC - CLCP Certification", url: "https://www.ichcc.org/the-clcp", type: "org" },
      { title: "IALCP Standards of Practice", url: "https://connect.rehabpro.org/lcp/home", type: "org" },
      { title: "IARP Life Care Planning Section", url: "https://rehabpro.org/sections/lcp", type: "org" },
    ],
  },
  {
    slug: "cve",
    name: "Certified Vocational Evaluator",
    abbreviation: "CVE",
    issuer: "Commission on Rehabilitation Counselor Certification (CRCC)",
    issuerUrl: "https://crccertification.com/",
    scope:
      "The CVE credential indicates specialized expertise in vocational evaluation, including standardized testing, work sample assessment, situational assessment, and interpretation of aptitudes, interests, and work behaviors for vocational recommendation.",
    requirements: [
      "Master's degree in a relevant field",
      "Documented supervised experience in vocational evaluation",
      "Passing score on the CVE examination",
      "Continuing education for renewal",
    ],
    admissibilityHistory:
      "CVE-supported opinions are accepted when grounded in validated assessment instruments and accepted vocational methodology. The CVE was originally established by the Commission on Certification of Work Adjustment and Vocational Evaluation Specialists (CCWAVES) and has been maintained by the Commission on Rehabilitation Counselor Certification (CRCC) since 2009.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "How does the CVE differ from the CRC?",
        answer:
          "The CRC is broader rehabilitation counseling certification; the CVE is focused specifically on vocational evaluation, including standardized testing and work sample assessment. Many experts hold both credentials.",
      },
      {
        question: "Is the CVE recognized in federal court testimony?",
        answer:
          "Yes. CVE-supported vocational opinions, like CRC-supported opinions, have been accepted in federal court when grounded in accepted methodology.",
      },
    ],
    sources: [
      { title: "CRCC - CVE Certification", url: "https://crccertification.com/cve-certification/", type: "org" },
    ],
  },
  {
    slug: "abve-d",
    name: "American Board of Vocational Experts Diplomate",
    abbreviation: "ABVE/D",
    issuer: "American Board of Vocational Experts",
    issuerUrl: "https://abve.net/",
    scope:
      "The ABVE Diplomate is an advanced forensic credential recognizing expertise in vocational evaluation and expert testimony for litigation. Scope covers earning capacity, employability, vocational rehabilitation, and expert witness practice.",
    requirements: [
      "Graduate degree in a relevant field",
      "Documented forensic vocational experience",
      "Publication or equivalent professional contributions",
      "Passing score on the ABVE examination",
      "Peer review of work samples",
      "Continuing education for renewal",
    ],
    admissibilityHistory:
      "ABVE diplomates are frequently retained in complex litigation and have an extensive record of admissibility in state and federal courts.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "What is the difference between ABVE/D and ABVE/F?",
        answer:
          "ABVE/D is the Diplomate designation; ABVE/F is the Fellow designation, which recognizes senior practitioners with extended forensic experience. Both are advanced forensic vocational credentials.",
      },
      {
        question: "Does the ABVE credential substitute for state licensure?",
        answer:
          "No. ABVE is a forensic specialty credential and does not replace state licensure where required for practice.",
      },
    ],
    sources: [
      { title: "ABVE Certification Overview", url: "https://abve.net/certification/", type: "org" },
    ],
  },
  {
    slug: "abve-f",
    name: "American Board of Vocational Experts Fellow",
    abbreviation: "ABVE/F",
    issuer: "American Board of Vocational Experts",
    issuerUrl: "https://abve.net/",
    scope:
      "The ABVE Fellow designation recognizes senior forensic vocational experts with documented advanced experience in expert testimony, complex earning capacity cases, and contributions to the profession.",
    requirements: [
      "Prior ABVE Diplomate status or equivalent",
      "Extended forensic vocational experience",
      "Peer-reviewed contributions or publications",
      "Passing score on the Fellow-level examination",
      "Continuing education for renewal",
    ],
    admissibilityHistory:
      "ABVE Fellows have an extensive record of admissibility and are frequently retained in high-complexity cases.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "How does a Fellow differ from a Diplomate?",
        answer:
          "The Fellow designation requires additional experience and professional contributions beyond the Diplomate level and is intended for senior forensic practitioners.",
      },
    ],
    sources: [
      { title: "ABVE Fellow Information", url: "https://abve.net/certification/", type: "org" },
    ],
  },
  {
    slug: "lrc",
    name: "Licensed Rehabilitation Counselor",
    abbreviation: "LRC",
    issuer: "State Licensing Boards",
    scope:
      "LRC is a state-granted license authorizing independent practice as a rehabilitation counselor within the licensing state. Scope varies by jurisdiction and typically covers vocational counseling, case management, and rehabilitation services.",
    requirements: [
      "Master's degree in rehabilitation counseling or a closely related field",
      "Supervised post-graduate experience per state requirements",
      "Passing score on the state-accepted examination (often the NCE or CRC)",
      "State jurisprudence requirements where applicable",
      "Continuing education and license renewal per state rules",
    ],
    admissibilityHistory:
      "State licensure is often considered a baseline indicator of professional standing and is separately relevant to expert qualification in jurisdictions that require practice-state licensure.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Is state licensure required to testify in that state?",
        answer:
          "Requirements vary by jurisdiction. Some states require licensure for practice and testimony; others permit unlicensed out-of-state experts for limited forensic purposes. Check state-specific rules.",
      },
    ],
    sources: [
      { title: "CRCC - State Licensure Information", url: "https://crccertification.com/", type: "org" },
    ],
  },
  {
    slug: "fve",
    name: "Fellow of Vocational Experts",
    abbreviation: "FVE",
    issuer: "American Rehabilitation Economics Association (AREA)",
    issuerUrl: "https://americanrehabecon.com/",
    scope:
      "The FVE designation recognizes senior practitioners in forensic vocational evaluation and expert practice.",
    requirements: [
      "Senior practitioner status in vocational evaluation",
      "Documented professional contributions",
      "Active association membership",
    ],
    admissibilityHistory: "FVE-holding practitioners have testified in state and federal courts in vocational matters.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Is FVE a primary certification?",
        answer:
          "FVE is a professional designation rather than a primary credential. It is typically held alongside CRC or CVE certifications.",
      },
    ],
    sources: [],
  },
  {
    slug: "ipec",
    name: "International Psychometric Evaluation Certification",
    abbreviation: "IPEC",
    issuer: "American Board of Vocational Experts (ABVE)",
    issuerUrl: "https://abve.net/",
    scope:
      "IPEC recognizes specialized training in psychometric assessment for vocational evaluation, including administration and interpretation of standardized instruments.",
    requirements: [
      "Completion of approved psychometric training",
      "Supervised assessment experience",
      "Certification examination",
    ],
    admissibilityHistory:
      "Psychometrically grounded vocational opinions are generally well received when the instruments used are validated for the population and purpose at issue.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "What instruments does an IPEC-credentialed evaluator typically use?",
        answer:
          "Commonly used instruments include aptitude batteries, achievement tests, interest inventories, and work sample systems appropriate to the referral question.",
      },
    ],
    sources: [{ title: "ABVE - Certification", url: "https://www.abve.net/certification-main", type: "org" }],
  },
  {
    slug: "ceas",
    name: "Certified Ergonomic Assessment Specialist",
    abbreviation: "CEAS",
    issuer: "The Back School",
    issuerUrl: "https://thebackschool.net/",
    scope:
      "CEAS certifies practitioners in ergonomic assessment and job site analysis for injury prevention, return-to-work, and litigation support.",
    requirements: [
      "Completion of CEAS training course(s)",
      "Passing score on the CEAS examination",
      "Continuing education for renewal",
    ],
    admissibilityHistory:
      "Ergonomic assessment is routinely used in workers' compensation and personal injury matters to analyze job-site demands relative to functional capacity.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "How does an ergonomic assessment complement a vocational evaluation?",
        answer:
          "An ergonomic assessment characterizes job demands in detail (forces, postures, durations), which can then be compared to documented functional capacity in a vocational or return-to-work analysis.",
      },
    ],
    sources: [{ title: "CEAS - The Back School", url: "https://thebackschool.net/ceas/", type: "org" }],
  },
  {
    slug: "md",
    name: "Doctor of Medicine",
    abbreviation: "M.D.",
    issuer: "Accredited Medical Schools + State Boards",
    scope:
      "The M.D. degree and associated state licensure authorize the practice of medicine. In forensic contexts, physicians provide opinions on diagnosis, causation, standard of care, prognosis, and medical recommendations underlying life care plans.",
    requirements: [
      "Graduation from an accredited medical school",
      "Completion of residency training (specialty dependent)",
      "State medical license (DEA registration where applicable)",
      "Board certification in the relevant specialty (where applicable)",
      "Continuing medical education",
    ],
    admissibilityHistory:
      "Physician expert testimony is routinely admitted when the opinion is within the physician's specialty, supported by accepted methodology, and based on sufficient facts or data.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Do forensic physicians need board certification?",
        answer:
          "Courts do not categorically require board certification, but relevant specialty board certification is frequently persuasive on qualification.",
      },
    ],
    sources: [{ title: "American Board of Medical Specialties", url: "https://www.abms.org/", type: "org" }],
  },
  {
    slug: "phd",
    name: "Doctor of Philosophy",
    abbreviation: "Ph.D.",
    issuer: "Accredited Universities",
    scope:
      "Ph.D.-level preparation in rehabilitation counseling, psychology, economics, or related fields supports doctoral-level forensic expertise including research design, advanced assessment, and testimony on specialized topics.",
    requirements: [
      "Completion of an accredited doctoral program",
      "Dissertation research in a relevant area",
      "Applicable professional licensure or certification (specialty dependent)",
    ],
    admissibilityHistory:
      "Ph.D.-credentialed experts are frequently accepted on the basis of advanced academic preparation combined with applied professional credentialing.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Is a Ph.D. required to testify as a vocational expert?",
        answer:
          "No. Master's-level professionals with CRC, CVE, or ABVE credentials are routinely accepted. A Ph.D. adds breadth of academic preparation and research fluency, which can be persuasive in complex matters.",
      },
    ],
    sources: [{ title: "U.S. Department of Education - Accreditation", url: "https://www.ed.gov/about/offices/list/ope/accred", type: "gov" }],
  },
  {
    slug: "cprw",
    name: "Certified Professional Resume Writer",
    abbreviation: "CPRW",
    issuer: "Professional Association of Resume Writers & Career Coaches",
    issuerUrl: "https://www.parwcc.com/",
    scope:
      "The CPRW credential recognizes expertise in resume writing and career documentation, which in forensic settings supports placement analysis and mitigation evaluation in employment cases.",
    requirements: [
      "PARWCC membership",
      "Passing score on the CPRW examination",
      "Continuing education for renewal",
    ],
    admissibilityHistory:
      "Career documentation expertise is typically supportive rather than standalone in forensic matters.",
    stateReciprocity: {},
    kwvrsExpertsSlugs: [],
    faqs: [
      {
        question: "Why would a vocational firm hold a CPRW?",
        answer:
          "Career documentation expertise supports analysis of a claimant's job search quality in mitigation disputes and informs realistic placement projections.",
      },
    ],
    sources: [{ title: "PARWCC", url: "https://www.parwcc.com/", type: "org" }],
  },
];

export function getCredential(slug: string): Credential | undefined {
  return credentials.find((c) => c.slug === slug);
}
