import type { TeamMember } from "@/types";

export const team: TeamMember[] = [
  // ── In Memoriam ────────────────────────────────────────────────
  // Memoriam members keep their real role for the record but are excluded
  // from every active listing via activeTeam; they render only in the team
  // page's In Memoriam section and their own tribute profile.
  {
    slug: "charles-kincaid",
    name: "Charles A. Kincaid, Ph.D.",
    title: "Founding Principal and Director Emeritus",
    credentials: ["Ph.D.", "LRC", "CRC", "ATP", "CVE", "CLCP", "ABVE/F"],
    role: "leadership",
    memoriam: true,
    bio: "Dr. Charles Kincaid was the founding principal of Kincaid Wolstein Vocational and Rehabilitation Services. He held a doctor of philosophy degree in rehabilitation counseling and a master of science degree in criminal justice, and was licensed and certified as a Licensed Rehabilitation Counselor, Certified Rehabilitation Counselor, Assistive Technology Professional, Certified Vocational Evaluator, Certified Life Care Planner, and Fellow of the American Board of Vocational Experts.",
    specialties: ["Vocational Evaluation", "Life Care Planning", "Assistive Technology"],
    statesServed: [],
    imageUrl: "/team/charles-kincaid.jpg",
  },

  // ── Leadership ─────────────────────────────────────────────────
  {
    slug: "daniel-wolstein",
    name: "Daniel Wolstein, Ph.D.",
    title: "CEO & President",
    credentials: ["Ph.D.", "CRC", "CLCP", "IPEC", "ABVE/D", "LRC", "FVE", "CVE"],
    role: "leadership",
    expertTier: "senior",
    bio: "Dr. Wolstein leads KWVRS with doctoral-level expertise in rehabilitation counseling from East Carolina University. He served as President of the American Board of Vocational Experts (2023-2025) and brings decades of experience in vocational evaluation and forensic rehabilitation.",
    specialties: ["Vocational Evaluation", "Earning Capacity Analysis", "Life Care Planning", "Expert Testimony"],
    statesServed: ["NJ", "NY", "MA", "VA", "RI", "CT", "PA"],
    imageUrl: "/team/daniel-wolstein.jpg",
  },
  {
    slug: "jesse-wolstein",
    name: "Jesse Wolstein, M.D., M.A.",
    title: "Chief Medical Director",
    credentials: ["M.D.", "M.A.", "CLCP"],
    role: "leadership",
    expertTier: "fellow",
    bio: "Dr. Jesse Wolstein is a board-certified emergency medicine physician. He holds a Master's in Rehabilitation Counseling and specializes in medical-legal consulting and standard of care analysis.",
    specialties: ["Standard of Care Analysis", "Medical-Legal Consulting", "Life Care Planning"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/jesse-wolstein.jpg",
  },
  {
    slug: "sharon-hirsh",
    name: "Sharon Hirsh, M.S.",
    title: "Chief Operating Officer",
    credentials: ["M.S.", "CRC"],
    role: "leadership",
    expertTier: "fellow",
    bio: "Sharon Hirsh previously served as Supervisory Vocational Rehabilitation Counselor at the VA Central Office and as Director of Human Resources for a major PR firm. She oversees all operations at KWVRS.",
    specialties: ["Vocational Rehabilitation", "Operations Management"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/sharon-hirsh.jpg",
  },
  {
    slug: "paul-bourgeois",
    name: "Paul Bourgeois, Ph.D.",
    title: "Chief of Life Care Planning",
    credentials: ["Ph.D.", "CRC", "CVE", "CLCP", "NCC"],
    role: "leadership",
    expertTier: "fellow",
    bio: "Dr. Bourgeois leads all life care planning services at KWVRS. With doctoral-level training and multiple certifications, he develops comprehensive, evidence-based life care plans for individuals with catastrophic injuries and chronic conditions.",
    specialties: ["Life Care Planning", "Vocational Evaluation", "Rehabilitation Counseling"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/paul-bourgeois.jpg",
  },
  {
    slug: "annie-cerone",
    name: "Annie Cerone",
    title: "Chief Administrative Officer",
    credentials: [],
    role: "leadership",
    bio: "Annie Cerone oversees administrative operations across all KWVRS departments, ensuring efficient case management and organizational coordination.",
    specialties: ["Administrative Operations", "Case Management"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/annie-cerone.jpg",
  },
  {
    slug: "matthew-putts",
    name: "Matthew R. Putts, Ph.D.",
    title: "Chief of Vocational Services",
    credentials: ["Ph.D.", "LPC", "LRC", "NCC", "CRC", "CLCP", "IPEC", "CVE"],
    role: "leadership",
    expertTier: "senior",
    bio: "Dr. Putts is a licensed professional counselor and certified rehabilitation counselor with experience as CEO of a nonprofit community rehabilitation program. He leads all vocational services at KWVRS.",
    specialties: ["Vocational Evaluation", "Life Care Planning", "Rehabilitation Counseling"],
    statesServed: ["NJ", "NY", "VA"],
    imageUrl: "/team/matthew-putts.jpg",
  },
  {
    slug: "christopher-skerritt",
    name: "Christopher Skerritt, M.Ed., MBA",
    title: "Chief of Economic Services",
    credentials: ["M.Ed.", "MBA", "CRC", "LRC", "IPEC", "CVE", "ABVE/F", "REAS", "CEAS I", "CLCP", "MSCC", "CPRW", "QRC"],
    role: "leadership",
    expertTier: "fellow",
    bio: "Christopher Skerritt serves as Chief of Economic Services, overseeing all forensic economic evaluations and analyses. He brings extensive credentials in vocational rehabilitation and economic consulting to complex litigation matters.",
    specialties: ["Forensic Economics", "Vocational Evaluation", "Earning Capacity Analysis", "Economic Damages"],
    statesServed: ["NJ", "NY", "MA", "VA", "RI", "CT", "PA"],
    imageUrl: "/team/christopher-skerritt.jpg",
  },

  // ── Expert Team ────────────────────────────────────────────────
  {
    slug: "john-halpin",
    name: "John J. Halpin, M.A.",
    title: "Vocational Rehabilitation Expert",
    credentials: ["M.A.", "CRC", "ABVE/F", "CRP"],
    role: "expert",
    expertTier: "fellow",
    bio: "John Halpin is an experienced vocational rehabilitation expert providing earning capacity evaluations and vocational assessments for litigation in multiple jurisdictions.",
    specialties: ["Vocational Evaluation", "Earning Capacity Analysis", "Expert Testimony"],
    statesServed: ["VA", "NJ", "NY"],
    imageUrl: "/team/john-halpin.jpg",
  },
  {
    slug: "kristina-fredericksen",
    name: "Kristina Fredericksen-Koleck",
    title: "Vocational Rehabilitation Expert",
    credentials: ["CRC", "CVE", "LPC", "IPEC"],
    role: "expert",
    expertTier: "fellow",
    bio: "Kristina Fredericksen-Koleck is a certified vocational evaluator and licensed professional counselor providing vocational rehabilitation expertise for litigation matters.",
    specialties: ["Vocational Evaluation", "Rehabilitation Counseling", "Expert Testimony"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/kristina-fredericksen.jpg",
  },
  {
    slug: "john-may",
    name: "John May, M.A.",
    title: "Vocational Rehabilitation Expert",
    credentials: ["M.A.", "CRC", "ABVE/F", "IPEC"],
    role: "expert",
    expertTier: "fellow",
    bio: "John May is a Fellow of the American Board of Vocational Experts providing vocational assessments, earning capacity evaluations, and expert testimony in state and federal courts.",
    specialties: ["Vocational Evaluation", "Earning Capacity Analysis", "Expert Testimony"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/john-may.jpg",
  },
  {
    slug: "bob-pare",
    name: "Bob Pare",
    title: "Vocational Rehabilitation Counselor",
    credentials: ["LRC", "CRC", "FVE"],
    role: "expert",
    memoriam: true,
    bio: "Bob Pare was a licensed rehabilitation counselor and Fellow of Vocational Experts who provided vocational rehabilitation counseling and assessment services throughout his years with KWVRS.",
    specialties: ["Vocational Rehabilitation", "Counseling"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/bob-pare.jpg",
  },
  {
    slug: "christina-rivera",
    name: "Christina Rivera, R.N., B.S.N.",
    title: "Life Care Planner",
    credentials: ["R.N.", "B.S.N.", "BLS", "ACLS", "PALS"],
    role: "expert",
    expertTier: "fellow",
    bio: "Christina Rivera is a registered nurse providing life care planning services, drawing on clinical nursing experience to develop comprehensive care cost projections.",
    specialties: ["Life Care Planning", "Medical Chronology", "Clinical Nursing"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/christina-rivera.jpg",
  },
  // ── Medical Chronology ─────────────────────────────────────────
  {
    slug: "danielle-vallone",
    name: "Danielle Vallone",
    title: "Senior Medical Chronologist",
    credentials: [],
    role: "support",
    bio: "Danielle Vallone leads the medical chronology team, producing detailed medical record summaries that support vocational and life care planning evaluations.",
    specialties: ["Medical Chronology", "Medical Record Analysis"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/danielle-vallone.jpg",
  },
  {
    slug: "abigail-wolstein",
    name: "Abigail Wolstein",
    title: "Medical Chronologist",
    credentials: [],
    role: "support",
    bio: "Abigail Wolstein provides medical chronology services, preparing comprehensive medical record summaries for use in litigation.",
    specialties: ["Medical Chronology"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/abigail-wolstein.jpg",
  },
  {
    slug: "rebecca-wolstein",
    name: "Rebecca Wolstein",
    title: "Medical Chronologist",
    credentials: [],
    role: "support",
    bio: "Rebecca Wolstein provides medical chronology services, preparing detailed medical record reviews and summaries.",
    specialties: ["Medical Chronology"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/rebecca-wolstein.jpg",
  },

  // ── Administration & Liaisons ──────────────────────────────────
  {
    slug: "zachary-sperling",
    name: "Zachary Sperling",
    title: "Economics Associate / Expert Liaison",
    credentials: [],
    role: "support",
    bio: "Zachary Sperling serves as Economics Associate and Expert Liaison, supporting forensic economic analyses and coordinating between the economics team and retaining counsel.",
    specialties: ["Forensic Economics", "Expert Liaison", "Economic Analysis"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/zachary-sperling.jpg",
  },
  {
    slug: "lizette-mendoza",
    name: "Lizette Mendoza",
    title: "Life Care Plan Administrator",
    credentials: [],
    role: "support",
    bio: "Lizette Mendoza provides administrative support for the life care planning department, coordinating case materials and scheduling.",
    specialties: ["Life Care Plan Administration"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/lizette-mendoza.jpg",
  },
  {
    slug: "cara-creighton",
    name: "Cara Creighton",
    title: "Life Care Plan Administrator",
    credentials: [],
    role: "support",
    bio: "Cara Creighton supports the life care planning team with case administration, documentation, and coordination.",
    specialties: ["Life Care Plan Administration"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/cara-creighton.jpg",
  },
  {
    slug: "jacqueline-zhinin",
    name: "Jacqueline Zhinin",
    title: "Expert Liaison",
    credentials: [],
    role: "support",
    bio: "Jacqueline Zhinin serves as an expert liaison, coordinating between KWVRS experts and retaining counsel throughout the engagement process.",
    specialties: ["Expert Liaison", "Case Coordination"],
    statesServed: ["NJ", "NY"],
  },
  {
    slug: "jordana-nicholas",
    name: "Jordana Nicholas",
    title: "Expert Liaison",
    credentials: [],
    role: "support",
    bio: "Jordana Nicholas coordinates expert engagements, managing communications between retaining attorneys and KWVRS specialists.",
    specialties: ["Expert Liaison", "Case Coordination"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/jordana-nicholas.jpg",
  },
  {
    slug: "shania-llontop",
    name: "Shania Llontop",
    title: "Expert Liaison",
    credentials: [],
    role: "support",
    bio: "Shania Llontop supports expert engagement coordination, assisting with case intake and attorney communications.",
    specialties: ["Expert Liaison"],
    statesServed: ["NJ", "NY"],
  },
  {
    slug: "alex-petgrave",
    name: "Alex Petgrave",
    title: "Liaison Support Specialist",
    credentials: [],
    role: "support",
    bio: "Alex Petgrave provides liaison support, assisting with case coordination and communications.",
    specialties: ["Liaison Support"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/alex-petgrave.jpg",
  },
  {
    slug: "pam-gentry",
    name: "Pam Gentry",
    title: "Accounting Representative",
    credentials: [],
    role: "support",
    bio: "Pam Gentry manages accounting operations at KWVRS.",
    specialties: ["Accounting"],
    statesServed: ["NJ"],
  },
  {
    slug: "nimfa-wilkerson",
    name: "Nimfa Wilkerson",
    title: "Administrative Assistant",
    credentials: [],
    role: "support",
    bio: "Nimfa Wilkerson provides administrative support across KWVRS departments.",
    specialties: ["Administrative Support"],
    statesServed: ["NJ"],
  },
  {
    slug: "nicholas-mui",
    name: "Nicholas Mui",
    title: "Assistant Researcher",
    credentials: [],
    role: "support",
    bio: "Nicholas Mui provides research support for vocational evaluations and economic analyses.",
    specialties: ["Research"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/nicholas-mui.jpg",
  },
  {
    slug: "logan-patterson",
    name: "Logan Patterson, M.A.",
    title: "Vocational Rehabilitation Expert",
    credentials: ["M.A.", "CRC", "CVE", "CCM", "CEAS I"],
    role: "expert",
    expertTier: "fellow",
    bio: "Logan Patterson is a certified rehabilitation counselor and certified vocational evaluator providing vocational evaluations, transferable skills analysis, and labor market research for litigation matters.",
    fullBio:
      "Logan Patterson is a certified rehabilitation counselor and certified vocational evaluator providing vocational evaluations, transferable skills analysis, labor market research, and earning capacity assessments. His background includes vocational case management with Genex Services in Denver, workers' compensation field case management, and rehabilitation counseling with the Colorado Division of Vocational Rehabilitation and Iowa Vocational Rehabilitation Services. His consulting experience includes interpretation of functional capacity evaluations and independent medical evaluations, labor market surveys, job analyses, and vocational assessments supporting veterans' claims for total disability based on individual unemployability (TDIU). He holds a Master of Arts in Rehabilitation Counseling from the University of Iowa.",
    specialties: ["Vocational Evaluation", "Earning Capacity Analysis", "Expert Testimony"],
    statesServed: ["CO"],
    education: [
      { degree: "M.A., Rehabilitation Counseling", institution: "University of Iowa", year: 2023 },
      { degree: "B.A., Psychology", institution: "University of Iowa", year: 2021 },
    ],
    imageUrl: "/team/logan-patterson.jpg",
  },
  {
    slug: "jake-mariani",
    name: "Jake Mariani",
    title: "Assistant Researcher",
    credentials: [],
    role: "support",
    bio: "Jake Mariani provides research support for expert evaluations and case analyses.",
    specialties: ["Research"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/jake-mariani.jpg",
  },
  {
    slug: "madeleine-cerone",
    name: "Madeleine Cerone",
    title: "Medical Summary Intern",
    credentials: [],
    role: "intern",
    bio: "Madeleine Cerone supports the medical chronology team.",
    specialties: ["Medical Chronology"],
    statesServed: ["NJ"],
    imageUrl: "/team/madeleine-cerone.jpg",
  },
  {
    slug: "sam-cerone",
    name: "Sam Cerone",
    title: "Strategy Intern",
    credentials: [],
    role: "intern",
    bio: "Sam Cerone supports business strategy and development initiatives.",
    specialties: ["Strategy"],
    statesServed: ["NJ"],
    imageUrl: "/team/sam-cerone.jpg",
  },
];

/** Team members excluding those honored in memoriam - use for any "current expert" listing. */
export const activeTeam: TeamMember[] = team.filter((t) => !t.memoriam);

/** Badge text for each retention tier. Rendered by the intake expert picker. */
export const EXPERT_TIER_LABELS: Record<"senior" | "fellow", string> = {
  senior: "Senior Expert",
  fellow: "Fellow Expert",
};

/**
 * Experts an attorney may ask for by name on the intake forms, senior first.
 * Derived from activeTeam, so a member honored in memoriam can never be offered
 * for retention even if an expertTier is set on them by mistake. Within a tier
 * the declaration order above is preserved (Array.prototype.sort is stable), so
 * the picker's order is editorial and lives in ONE place. Adding or removing an
 * expert is a one-field edit here plus the matching line in the schema snapshot
 * (lib/intake-schema.mjs RETAINED_EXPERTS), which a parity test enforces.
 */
export function retainableExperts(): TeamMember[] {
  const rank = (m: TeamMember) => (m.expertTier === "senior" ? 0 : 1);
  return activeTeam.filter((t) => t.expertTier).sort((a, b) => rank(a) - rank(b));
}

export function getTeamByRole(role: string): TeamMember[] {
  return activeTeam.filter((t) => t.role === role);
}

export function getTeamByState(stateAbbreviation: string): TeamMember[] {
  return activeTeam.filter((t) => t.statesServed.includes(stateAbbreviation));
}

export function getMemoriamTeam(): TeamMember[] {
  return team.filter((t) => t.memoriam);
}
