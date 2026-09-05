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
      // What the profile's two lists mean (site audit 2026-09-05, F08
      // /team/christopher-skerritt: a reader could not tell whether the
      // jurisdictions were experience, licensure, or availability, or which
      // credentials the economics work rests on).
      "The jurisdictions listed above are the states in which he has served retaining counsel; the list describes experience, not licensure, since no state licenses forensic economists, and the practice accepts engagements in all 50 states, the District of Columbia, and U.S. territories. The rehabilitation counseling, life care planning, and Medicare set-aside designations listed above are background credentials from related disciplines; the work the practice is retained for, and the work he testifies to, is forensic economics.",
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
    // The profile explains what the support role does for counsel and what
    // the jurisdictions list means (site audit 2026-09-05, T01). Written
    // around the role's function on this site: the associate does not author
    // opinions or testify (no expertTier; see retainableExperts), and the
    // engagement steps named here are the ones /schedule-consultation and the
    // service process pages describe.
    fullBio: [
      "Zachary Sperling serves as Economics Associate and Expert Liaison for the practice. The liaison role is the coordinating point of contact between retaining counsel and the economics team: scheduling, the records the analysis needs, and the status of an engagement run through him, so counsel has one person to reach while the analysis is under way. The associate role supports the forensic economic analyses the practice prepares for plaintiff and defense counsel, under the direction of the Chief of Economic Services.",
      "He does not author the practice's opinions and is not retained as a testifying expert. Every analysis is directed by the Chief of Economic Services, who is responsible for the report and is available to testify to it. Counsel retaining the practice therefore works with the economist on the substance of the analysis and with the liaison on the coordination around it: scheduling, records, and status.",
      "The jurisdictions listed above are the states in which he coordinates engagements between counsel and the economics team. The list describes where that coordination takes place; it is not a set of professional licenses or certifications, and the profile lists no credential of that kind.",
    ].join("\n\n"),
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

/**
 * The sentence the service, geo, and pillar templates print beside their
 * substantive copy to name the professional responsible for the work (site
 * audit 2026-09-05, C02: "Place the actual reviewing/providing professional
 * beside substantive claims and link their verified profile"). The fact is the
 * one /about and the associate's profile already state: the practice is led
 * by a Chief of Economic Services who directs every analysis and is available
 * to testify to it; here it is resolved to the senior retainable expert and
 * linked to the profile that carries the CV. `subject` is the noun phrase the
 * sentence is about ("Business valuation at KW Economics", "Analyses for
 * Texas matters"); `plural` picks the verb and the pronoun. Both render paths
 * (the ResponsibilityLine component and scripts/prerender.mjs) print
 * lead + linked name + tail. Undefined when no retainable expert exists, so
 * the templates print nothing rather than an unnamed claim.
 */
export interface ResponsibilityLine {
  lead: string;
  expert: TeamMember;
  tail: string;
}

export function analysisResponsibility(subject: string, plural = true): ResponsibilityLine | undefined {
  const expert = retainableExperts()[0];
  if (!expert) return undefined;
  return {
    lead: `${subject} ${plural ? "are" : "is"} directed by `,
    expert,
    tail: `, ${expert.title}, who is available to testify to ${plural ? "them" : "it"}.`,
  };
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
