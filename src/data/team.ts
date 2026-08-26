import type { TeamMember } from "@/types";

// KW Life Care Planning roster. Specialties use the keys in
// src/lib/practice-areas.ts (SPECIALTY_TO_SERVICE) so each profile renders its
// practice areas; credentials stay consistent with src/data/credentials.ts
// expertSlugs (CLCP, MSCC, M.D., R.N., Ph.D., CRC).
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
    bio: "Dr. Charles Kincaid was the founding principal of the Kincaid Wolstein group and a Certified Life Care Planner. He held a doctor of philosophy degree in rehabilitation counseling and a master of science degree in criminal justice, and was licensed and certified as a Licensed Rehabilitation Counselor, Certified Rehabilitation Counselor, Assistive Technology Professional, Certified Vocational Evaluator, Certified Life Care Planner, and Fellow of the American Board of Vocational Experts.",
    specialties: ["Life Care Planning", "Expert Testimony"],
    statesServed: [],
    imageUrl: "/team/charles-kincaid.jpg",
  },

  // ── Life Care Planning Leadership ──────────────────────────────
  {
    slug: "jesse-wolstein",
    name: "Jesse Wolstein, M.D., M.A.",
    title: "Chief Medical Director & Life Care Planner",
    credentials: ["M.D.", "M.A.", "CLCP"],
    role: "leadership",
    expertTier: "senior",
    bio: "Dr. Jesse Wolstein is a board-certified emergency medicine physician with 10 years of clinical experience, a Certified Life Care Planner (CLCP), and holder of a Master's in Rehabilitation Counseling. He develops comprehensive, evidence-based life care plans drawing on direct clinical experience and provides medical foundation reviews, life expectancy analyses, and expert witness testimony.",
    specialties: ["Life Care Planning", "Catastrophic Injury", "Medical Cost Projection", "Life Care Plan Review", "Expert Testimony", "Medical-Legal Consulting"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/jesse-wolstein.jpg",
  },
  {
    slug: "paul-bourgeois",
    name: "Paul Bourgeois, Ph.D.",
    title: "Chief of Life Care Planning",
    credentials: ["Ph.D.", "CRC", "CVE", "CLCP", "NCC"],
    role: "leadership",
    expertTier: "senior",
    bio: "Dr. Bourgeois leads the life care planning practice. A Certified Life Care Planner with doctoral-level training in rehabilitation counseling, he develops comprehensive, evidence-based life care plans for individuals with catastrophic injuries and chronic conditions, reviews opposing plans, and testifies to his findings.",
    specialties: ["Life Care Planning", "Catastrophic Injury", "Life Care Plan Review", "Expert Testimony"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/paul-bourgeois.jpg",
  },
  {
    slug: "daniel-wolstein",
    name: "Daniel Wolstein, Ph.D.",
    title: "Chief Executive Officer",
    credentials: ["Ph.D.", "CRC", "CLCP", "IPEC", "ABVE/D", "LRC", "FVE", "CVE"],
    role: "leadership",
    expertTier: "senior",
    bio: "Dr. Wolstein is Chief Executive Officer and a Certified Life Care Planner with a doctorate in rehabilitation counseling from East Carolina University. He served as President of the American Board of Vocational Experts (2023-2025) and brings decades of forensic rehabilitation experience to life care plans and expert testimony in catastrophic injury matters.",
    specialties: ["Life Care Planning", "Catastrophic Injury", "Expert Testimony"],
    statesServed: ["NJ", "NY", "MA", "VA", "RI", "CT", "PA"],
    imageUrl: "/team/daniel-wolstein.jpg",
  },
  {
    slug: "christopher-skerritt",
    name: "Christopher Skerritt, M.Ed., MBA",
    title: "Chief of Economic Services & Medicare Set-Aside Consultant",
    credentials: ["M.Ed.", "MBA", "CRC", "LRC", "IPEC", "CVE", "ABVE/F", "REAS", "CEAS I", "CLCP", "MSCC", "CPRW", "QRC"],
    role: "leadership",
    expertTier: "fellow",
    bio: "Christopher Skerritt is a Medicare Set-Aside Certified Consultant (MSCC) and Certified Life Care Planner who leads the Medicare Set-Aside practice and the economic side of life care planning, projecting the present value of future medical costs and preparing the MSA allocations that settlements require.",
    specialties: ["Medicare Set-Aside", "Medical Cost Projection", "Life Care Planning", "Expert Testimony"],
    statesServed: ["NJ", "NY", "MA", "VA", "RI", "CT", "PA"],
    imageUrl: "/team/christopher-skerritt.jpg",
  },

  // ── Life Care Planners ─────────────────────────────────────────
  {
    slug: "matthew-putts",
    name: "Matthew R. Putts, Ph.D.",
    title: "Senior Life Care Planner",
    credentials: ["Ph.D.", "LPC", "LRC", "NCC", "CRC", "CLCP", "IPEC", "CVE"],
    role: "expert",
    expertTier: "fellow",
    bio: "Dr. Putts is a Certified Life Care Planner, licensed professional counselor, and certified rehabilitation counselor with experience as CEO of a nonprofit community rehabilitation program. He prepares life care plans and provides expert testimony.",
    specialties: ["Life Care Planning", "Expert Testimony"],
    statesServed: ["NJ", "NY", "VA"],
    imageUrl: "/team/matthew-putts.jpg",
  },
  {
    slug: "christina-rivera",
    name: "Christina Rivera, R.N., B.S.N.",
    title: "Life Care Planner",
    credentials: ["R.N.", "B.S.N.", "BLS", "ACLS", "PALS"],
    role: "expert",
    expertTier: "fellow",
    bio: "Christina Rivera is a registered nurse life care planner who draws on clinical nursing experience to develop comprehensive care cost projections and the medical chronologies that ground each plan.",
    specialties: ["Life Care Planning", "Medical Cost Projection"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/christina-rivera.jpg",
  },

  // ── Plan Administration & Medical Chronology ───────────────────
  {
    slug: "danielle-vallone",
    name: "Danielle Vallone",
    title: "Senior Medical Chronologist",
    credentials: [],
    role: "support",
    bio: "Danielle Vallone leads the medical chronology team, producing detailed medical record summaries that form the clinical foundation of each life care plan.",
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
    bio: "Abigail Wolstein prepares comprehensive medical record summaries that support life care plan development and litigation.",
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
    bio: "Rebecca Wolstein prepares detailed medical record reviews and summaries for the life care planning team.",
    specialties: ["Medical Chronology"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/rebecca-wolstein.jpg",
  },
  {
    slug: "cara-creighton",
    name: "Cara Creighton",
    title: "Life Care Plan Administrator",
    credentials: [],
    role: "support",
    bio: "Cara Creighton supports the life care planning practice with case administration, documentation, and coordination from intake through plan delivery.",
    specialties: ["Life Care Plan Administration", "Case Coordination"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/cara-creighton.jpg",
  },
  {
    slug: "lizette-mendoza",
    name: "Lizette Mendoza",
    title: "Life Care Plan Administrator",
    credentials: [],
    role: "support",
    bio: "Lizette Mendoza provides administrative support for the life care planning practice, coordinating case materials, scheduling, and attorney communications.",
    specialties: ["Life Care Plan Administration", "Case Coordination"],
    statesServed: ["NJ", "NY"],
    imageUrl: "/team/lizette-mendoza.jpg",
  },
];

/** Team members excluding those honored in memoriam - use for any "current expert" listing. */
export const activeTeam: TeamMember[] = team.filter((t) => !t.memoriam);

/** Badge text for each retention tier. */
export const EXPERT_TIER_LABELS: Record<"senior" | "fellow", string> = {
  senior: "Senior Expert",
  fellow: "Fellow Expert",
};

/**
 * Experts an attorney may retain by name, senior first. Derived from
 * activeTeam, so a member honored in memoriam can never be offered even if an
 * expertTier is set on them by mistake. Within a tier the declaration order
 * above is preserved (Array.prototype.sort is stable), so the order is
 * editorial and lives in ONE place.
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

export function getTeamBySlug(slug: string): TeamMember | undefined {
  return team.find((t) => t.slug === slug);
}

export function getMemoriam(): TeamMember[] {
  return team.filter((t) => t.memoriam);
}

/** @deprecated alias kept for existing callers; prefer getMemoriam. */
export const getMemoriamTeam = getMemoriam;
