import type { TeamMember } from "@/types";

// KW Economics roster. Specialties use the keys in
// src/lib/practice-areas.ts (SPECIALTY_TO_SERVICE) so each profile renders its
// practice areas; credentials stay consistent with src/data/credentials.ts
// expertSlugs. Only members with an expertTier are offered to counsel by name
// (see retainableExperts). Rehabilitation-counseling and life-care-plan
// credentials are listed as background; the work the roster is retained for
// is forensic economics.
export const team: TeamMember[] = [
  // --- Leadership ---------------------------------------------------------
  {
    slug: "christopher-skerritt",
    name: "Christopher Skerritt, M.Ed., MBA",
    title: "Chief of Economic Services",
    credentials: ["M.Ed.", "MBA", "CRC", "CLCP", "MSCC"],
    role: "leadership",
    expertTier: "senior",
    bio: "Christopher Skerritt leads the economics practice, directing lost earnings, wrongful death, household services, employment, and commercial damages analyses for plaintiff and defense counsel. His graduate training in business and rehabilitation gives his damages work a grounded view of how injury, loss of employment, and disability translate into measurable economic loss.",
    fullBio: [
      "Christopher Skerritt is Chief of Economic Services and directs the practice's forensic economic work for plaintiff and defense counsel. He oversees the lost earnings, wrongful death, household services, employment, and commercial damages analyses the practice prepares, from the first review of the retaining attorney's file through the final report and any testimony that follows. His standard for every figure the practice puts in front of a court is the same: it must trace to a stated assumption and a named source that opposing counsel can check.",
      "His analyses follow the sequence forensic economists use in injury and death cases. The pre-injury or but-for earnings base is established from tax returns, payroll records, and employment history. That base is projected over a worklife expectancy drawn from published tables, with a stated growth rate for wages and employer-paid benefits. The residual earnings the person can reasonably be expected to earn after the injury or loss are subtracted, so the loss claimed is the net difference rather than the gross pre-injury figure. The net loss is then discounted to present value at a documented rate. Household services and, where a life care plan exists, the future cost of care are treated the same way, each with its own source and each shown as a separate line so counsel can see how much of the total rests on any one assumption.",
      "Reports are written for attorneys, adjusters, mediators, and jurors rather than for other economists. Each one states the question asked, lists the records relied on, sets out the assumptions in plain language, and presents the loss under alternative scenarios where the record supports more than one reading of the facts. He is available for deposition and trial testimony on his own reports and prepares rebuttal reviews of opposing economic reports, focusing on whether the opposing expert's inputs are supported by the record and whether the arithmetic follows from those inputs.",
      "He holds a Master of Business Administration in healthcare leadership from Bryant University and a Master of Education in rehabilitation counseling from Springfield College, and he is a Certified Rehabilitation Counselor, a Certified Life Care Planner, and a Medicare Set-Aside Certified Consultant. That background shapes his damages work. The earnings question in an injury case turns on what the person could earn before the injury and what the person can earn now, and his analyses are built to connect the medical and functional record to the earnings figures that follow from it.",
    ].join("\n\n"),
    specialties: ["Forensic Economics", "Economic Damages", "Earning Capacity Analysis", "Wrongful Death Analysis", "Household Services", "Employment Damages", "Business Valuation", "Expert Testimony"],
    statesServed: ["NJ", "NY", "MA", "VA", "RI", "CT", "PA"],
    imageUrl: "/team/christopher-skerritt.jpg",
    education: [
      { degree: "Master of Business Administration - Healthcare Leadership", institution: "Bryant University", year: 2024 },
      { degree: "Master of Education in Rehabilitation Counseling", institution: "Springfield College", year: 2016 },
    ],
  },

  // --- Economics Team -----------------------------------------------------
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
