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
  expertSlugs: string[];
  faqs: Faq[];
  sources: Source[];
}

export const credentials: Credential[] = [
  {
    slug: "clcp",
    name: "Certified Life Care Planner",
    abbreviation: "CLCP",
    issuer: "International Commission on Health Care Certification",
    issuerUrl: "https://www.ichcc.org/",
    scope:
      "The CLCP is the most widely held certification for life care planners. Scope includes the development of comprehensive, individualized life care plans for people with catastrophic injury or chronic illness, documenting every category of future care with its frequency, duration, and cost, and defending that plan through report, deposition, and trial testimony.",
    requirements: [
      "Qualifying healthcare or rehabilitation credential (for example RN, OT, PT, CRC, or physician)",
      "Completion of a 120-hour post-graduate life care planning training program",
      "Documented case experience under supervision",
      "Passing score on the CLCP examination",
      "Continuing education and renewal every five years",
    ],
    admissibilityHistory:
      "CLCP-authored plans are routinely accepted in state and federal courts when they follow published life care planning standards, rest on treating-team recommendations, and document frequency, duration, and cost sources for each item. Challenges typically target the clinical foundation for specific items rather than the credential itself.",
    stateReciprocity: {},
    expertSlugs: ["jesse-wolstein", "paul-bourgeois", "daniel-wolstein", "christopher-skerritt", "matthew-putts"],
    faqs: [
      {
        question: "Does a CLCP require a prior clinical credential?",
        answer:
          "Yes. CLCP candidates must hold a qualifying healthcare or rehabilitation credential, such as RN, OT, PT, CRC, or physician, before completing the training and examination.",
      },
      {
        question: "How is life care planning methodology standardized?",
        answer:
          "Practice standards published by the profession's organizations call for a consistent process: record review, evaluee interview, consultation with treating providers, itemized recommendations with frequency and duration, and cost research from identified sources. A CLCP plan should be traceable at every line.",
      },
      {
        question: "Can a CLCP testify on causation?",
        answer:
          "Causation opinions come from physicians. The CLCP projects care consistent with physician-supported recommendations and testifies to the needs, frequencies, durations, and costs in the plan.",
      },
      {
        question: "How does a CLCP differ from a nurse or physician who prepares plans?",
        answer:
          "The CLCP is a specialty certification layered on a clinical or rehabilitation background. Nurses, physicians, and rehabilitation counselors can all hold it; the certification documents training and examination in life care planning methodology specifically.",
      },
    ],
    sources: [
      { title: "ICHCC - CLCP Certification", url: "https://www.ichcc.org/the-clcp", type: "org" },
      { title: "IARP Life Care Planning Section", url: "https://rehabpro.org/sections/lcp", type: "org" },
    ],
  },
  {
    slug: "cnlcp",
    name: "Certified Nurse Life Care Planner",
    abbreviation: "CNLCP",
    issuer: "American Association of Nurse Life Care Planners",
    issuerUrl: "https://www.aanlcp.org/",
    scope:
      "The CNLCP certifies registered nurses in life care planning grounded in the nursing process: assessment, nursing diagnosis, planning, implementation, and evaluation. Nurse life care planners bring hands-on clinical knowledge of medications, supplies, skilled care, and daily care routines to the documentation of future needs, frequencies, and costs.",
    requirements: [
      "Active, unrestricted registered nurse license",
      "Completion of required life care planning education hours",
      "Documented nursing and life care planning experience",
      "Passing score on the CNLCP examination",
      "Continuing education and periodic recertification",
    ],
    admissibilityHistory:
      "CNLCP-authored plans are routinely accepted where the nurse planner documents methodology and the clinical foundation for each recommendation. The nursing license and the certification together establish qualification to describe care needs; physician recommendations remain the source for medical items.",
    stateReciprocity: {},
    expertSlugs: [],
    faqs: [
      {
        question: "How does the CNLCP differ from the CLCP?",
        answer:
          "Both certify life care planning competence. The CNLCP is open only to registered nurses and frames the plan around the nursing process; the CLCP is open to several clinical and rehabilitation disciplines. Many nurse planners hold both.",
      },
      {
        question: "What does a nurse life care planner add to a catastrophic injury case?",
        answer:
          "Practical knowledge of skilled nursing tasks, supply quantities, medication administration, and the daily routines of bowel, bladder, skin, and respiratory care, which makes the attendant care and supply sections of a plan concrete and defensible.",
      },
      {
        question: "Can a CNLCP testify to future medical costs?",
        answer:
          "Yes, to the projected cost of the care documented in the plan, using stated cost sources. Opinions on the medical necessity of a treatment come from the treating or examining physician.",
      },
    ],
    sources: [
      { title: "AANLCP - Certification", url: "https://www.aanlcp.org/", type: "org" },
    ],
  },
  {
    slug: "mscc",
    name: "Medicare Set-Aside Certified Consultant",
    abbreviation: "MSCC",
    issuer: "International Commission on Health Care Certification",
    issuerUrl: "https://www.ichcc.org/",
    scope:
      "The MSCC certifies professionals in the preparation of Medicare Set-Aside allocations for workers' compensation and liability settlements. Scope includes identifying injury-related, Medicare-covered future care, pricing it under the applicable fee schedule, and documenting the allocation in a form that satisfies Medicare's review process and protects the parties' interests.",
    requirements: [
      "Qualifying professional credential in a health care, rehabilitation, legal, or insurance discipline",
      "Completion of an approved Medicare Set-Aside training program",
      "Passing score on the MSCC examination",
      "Continuing education and periodic renewal",
    ],
    admissibilityHistory:
      "Medicare Set-Aside reports are primarily settlement and compliance documents rather than trial exhibits. Testimony arises when the allocation methodology is disputed, for example over which future care is injury-related or Medicare-covered, and in that setting the MSCC's documented methodology and pricing sources are what is examined.",
    stateReciprocity: {},
    expertSlugs: ["christopher-skerritt"],
    faqs: [
      {
        question: "When is a Medicare Set-Aside required?",
        answer:
          "When a settlement closes future medical benefits and the claimant is a Medicare beneficiary or has a reasonable expectation of enrollment within the period Medicare's guidance addresses. Counsel and the MSCC confirm the review thresholds and current guidance for the specific settlement.",
      },
      {
        question: "How does a Medicare Set-Aside relate to a life care plan?",
        answer:
          "Both project future injury-related care from the same records and physician recommendations. The set-aside is limited to Medicare-covered items priced under the fee schedule; the life care plan covers all reasonable future care at the pricing appropriate to the case.",
      },
      {
        question: "Can an MSCC prepare allocations for liability settlements as well as workers' compensation?",
        answer:
          "Yes. The methodology is similar, though liability allocations involve additional judgment about apportionment and the absence of a formal review program comparable to the workers' compensation process.",
      },
    ],
    sources: [
      { title: "ICHCC - MSCC Certification", url: "https://www.ichcc.org/", type: "org" },
      { title: "CMS - Workers' Compensation Medicare Set-Aside Arrangements", url: "https://www.cms.gov/medicare/coordination-benefits-recovery/workers-compensation-medicare-set-aside-arrangements", type: "gov" },
    ],
  },
  {
    slug: "cdms",
    name: "Certified Disability Management Specialist",
    abbreviation: "CDMS",
    issuer: "Commission on Rehabilitation Counselor Certification",
    issuerUrl: "https://www.crccertification.com/",
    scope:
      "The CDMS certifies professionals in disability management: coordinating medical care, benefits, and return-to-work planning for injured workers within workers' compensation and disability systems. In life care planning the credential is relevant to workers' compensation plans, where the planner must understand fee schedules, claims administration, and how future care interacts with the benefit system.",
    requirements: [
      "Qualifying degree or professional credential with disability management experience",
      "Documented employment in disability management roles",
      "Passing score on the CDMS examination",
      "Continuing education and renewal every five years",
    ],
    admissibilityHistory:
      "CDMS holders most often contribute to workers' compensation matters, where opinions are presented before administrative tribunals and in settlement negotiation rather than jury trial. The credential documents familiarity with the benefit system in which the life care plan or set-aside will be used.",
    stateReciprocity: {},
    expertSlugs: [],
    faqs: [
      {
        question: "How does the CDMS relate to life care planning?",
        answer:
          "It documents expertise in the workers' compensation and disability benefit environment. A planner who holds it understands how the plan's items will be paid, disputed, and settled within that system.",
      },
      {
        question: "Is the CDMS a counseling credential?",
        answer:
          "No. It certifies disability management practice, which is a coordination and planning role. Counseling credentials such as the CRC are separate, though some professionals hold both.",
      },
    ],
    sources: [
      { title: "CRCC - CDMS Certification", url: "https://www.crccertification.com/", type: "org" },
    ],
  },
  {
    slug: "crc",
    name: "Certified Rehabilitation Counselor",
    abbreviation: "CRC",
    issuer: "Commission on Rehabilitation Counselor Certification",
    issuerUrl: "https://crccertification.com/",
    scope:
      "The CRC is the national certification for rehabilitation counselors. In life care planning it is one of the qualifying credentials for CLCP certification and supports the plan's coverage of rehabilitation services, assistive technology, community reintegration, supported living, and the day-program and vocational services that adults with disabilities use across the life span.",
    requirements: [
      "Master's degree in rehabilitation counseling or a closely related field",
      "Supervised clinical experience per CRCC criteria",
      "Passing score on the national CRC examination",
      "Continuing education and renewal every five years",
      "Adherence to the CRCC Code of Professional Ethics",
    ],
    admissibilityHistory:
      "CRC-credentialed life care planners have a long history of acceptance in state and federal courts when the plan is grounded in treating-team recommendations, documented methodology, and stated cost sources. The credential establishes the rehabilitation foundation of the plan; medical items are supported by physician recommendation.",
    stateReciprocity: {},
    expertSlugs: ["paul-bourgeois", "daniel-wolstein", "matthew-putts"],
    faqs: [
      {
        question: "Is the CRC a license or a certification?",
        answer:
          "The CRC is a national certification administered by CRCC. It is distinct from state licensure, though many states also license professional or rehabilitation counselors separately.",
      },
      {
        question: "Why does a life care planner hold a CRC?",
        answer:
          "The CRC is one of the recognized entry credentials to CLCP certification, and its training in disability, rehabilitation services, and community resources supports the non-medical sections of a life care plan such as supported living, day programs, and assistive technology.",
      },
      {
        question: "Do courts require a specific credential to testify on a life care plan?",
        answer:
          "No single credential is mandated. Qualification is assessed case by case on education, training, and experience, and the CRC combined with life care planning certification is widely accepted.",
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
    slug: "md",
    name: "Doctor of Medicine",
    abbreviation: "M.D.",
    issuer: "Accredited Medical Schools and State Medical Boards",
    scope:
      "The M.D. degree with state licensure authorizes the practice of medicine. In life care planning, physicians supply the medical foundation of the plan: diagnosis, prognosis, life expectancy considerations, and the treatment, medication, surgical, and follow-up recommendations that the planner itemizes and prices. A physician life care planner can both make and document those recommendations.",
    requirements: [
      "Graduation from an accredited medical school",
      "Completion of residency training in the relevant specialty",
      "Active state medical license",
      "Board certification in the relevant specialty where applicable",
      "Continuing medical education for license renewal",
    ],
    admissibilityHistory:
      "Physician testimony on future medical needs and prognosis is routinely admitted when the opinion is within the physician's specialty and grounded in the record. A physician-authored life care plan carries the medical recommendations and their basis in a single document, which limits disputes over whether each item has physician support.",
    stateReciprocity: {},
    expertSlugs: ["jesse-wolstein"],
    faqs: [
      {
        question: "Does a physician life care planner still consult the treating physicians?",
        answer:
          "Yes. The plan documents the treating providers' recommendations and the physician planner's own review of the record. Where the two differ, the plan states the basis for the recommendation adopted.",
      },
      {
        question: "Do forensic physicians need board certification?",
        answer:
          "Courts do not categorically require it, but board certification in the specialty relevant to the injury is frequently persuasive on qualification.",
      },
      {
        question: "Can a physician planner address life expectancy?",
        answer:
          "A physician can present a medical opinion on life expectancy based on the evaluee's condition, function, and the relevant literature. The plan shows the sources relied on and, where appropriate, the cost of the plan across a range of life expectancies.",
      },
    ],
    sources: [{ title: "American Board of Medical Specialties", url: "https://www.abms.org/", type: "org" }],
  },
  {
    slug: "rn",
    name: "Registered Nurse",
    abbreviation: "R.N.",
    issuer: "State Boards of Nursing",
    scope:
      "Registered nurse licensure authorizes the practice of professional nursing. In life care planning, the RN is a qualifying clinical credential for both CLCP and CNLCP certification and grounds the plan in direct knowledge of skilled nursing care, medication administration, wound and skin care, supplies, and the daily routines that determine attendant care hours.",
    requirements: [
      "Graduation from an accredited nursing program (associate, bachelor's, or higher)",
      "Passing score on the NCLEX-RN examination",
      "Active, unrestricted state nursing license",
      "Continuing education as required by the licensing state",
    ],
    admissibilityHistory:
      "Nurse life care planners are routinely accepted to testify on care needs, frequencies, durations, and costs when the plan documents its methodology and the physician recommendations behind medical items. Nursing licensure is generally treated as the clinical foundation for describing care rather than a basis for medical causation opinions.",
    stateReciprocity: {},
    expertSlugs: ["christina-rivera"],
    faqs: [
      {
        question: "What does a nurse contribute to a life care plan?",
        answer:
          "Clinical familiarity with the hands-on care a condition requires: skilled nursing tasks, medication and supply quantities, equipment use, and the practical hours of attendant care a person needs at each level of function.",
      },
      {
        question: "Does an RN need life care planning certification to prepare plans?",
        answer:
          "Certification is not legally required, but the CLCP or CNLCP documents specific training and examination in life care planning methodology and is widely expected in litigation.",
      },
      {
        question: "Can a nurse life care planner testify to medical necessity?",
        answer:
          "The nurse planner testifies to the needs documented in the plan and their cost. Opinions that a specific treatment is medically necessary or causally related come from the treating or examining physician.",
      },
    ],
    sources: [
      { title: "National Council of State Boards of Nursing", url: "https://www.ncsbn.org/", type: "org" },
    ],
  },
  {
    slug: "phd",
    name: "Doctor of Philosophy",
    abbreviation: "Ph.D.",
    issuer: "Accredited Universities",
    scope:
      "Doctoral preparation in rehabilitation counseling, rehabilitation science, psychology, or a related field supports research fluency and advanced assessment in life care planning. Ph.D.-level planners are often called on to explain the literature behind frequency, duration, and life expectancy recommendations and to review the methodology of opposing plans.",
    requirements: [
      "Completion of an accredited doctoral program in a relevant discipline",
      "Dissertation research in a relevant area",
      "Applicable professional licensure or certification for the planner's clinical or rehabilitation practice",
    ],
    admissibilityHistory:
      "Ph.D.-credentialed life care planners are accepted on the basis of doctoral preparation combined with applied credentials such as the CLCP or CRC. The degree is most persuasive where the dispute turns on research literature, methodology, or the reliability of the opposing plan.",
    stateReciprocity: {},
    expertSlugs: ["paul-bourgeois"],
    faqs: [
      {
        question: "Is a Ph.D. required to prepare or defend a life care plan?",
        answer:
          "No. Master's-level and nursing professionals with life care planning certification are routinely accepted. Doctoral preparation adds research and methodological depth that is useful in contested or complex matters.",
      },
      {
        question: "When is a Ph.D. planner most useful?",
        answer:
          "In rebuttal work, in cases where life expectancy or long-term outcome literature is contested, and in matters involving cognitive or psychological disability where assessment interpretation is central to the plan.",
      },
    ],
    sources: [{ title: "U.S. Department of Education - Accreditation", url: "https://www.ed.gov/about/offices/list/ope/accred", type: "gov" }],
  },
];

export function getCredential(slug: string): Credential | undefined {
  return credentials.find((c) => c.slug === slug);
}
