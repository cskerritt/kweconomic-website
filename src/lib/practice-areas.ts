import { pillarServices } from "@/data/services";
import type { Service, TeamMember } from "@/types";

/**
 * Map an existing specialty phrase (from team.ts) to a KW LCP service line.
 * This is a deterministic lookup over data the member already has - it makes
 * no new claim about a person, it only links their stated specialties to the
 * matching practice area pages. Specialties with no service equivalent
 * (e.g. "Medical Chronology", "Research", "Administrative Support") simply
 * map to nothing, so support staff show no practice areas.
 */
const SPECIALTY_TO_SERVICE: Record<string, string> = {
  "Life Care Planning": "life-care-planning",
  "Pediatric Life Care Planning": "pediatric-life-care-planning",
  "Catastrophic Injury": "catastrophic-injury-planning",
  "Medical Cost Projection": "medical-cost-projection",
  "Medicare Set-Aside": "medicare-set-aside",
  "Life Care Plan Review": "life-care-plan-rebuttal",
  "Elder Care Planning": "elder-and-long-term-care-planning",
  "Expert Testimony": "expert-witness-testimony",
  "Medical-Legal Consulting": "expert-witness-testimony",
  "Functional Capacity Evaluation": "life-care-planning",
};

/**
 * Returns the pillar service lines a team member practices in, derived from
 * their specialties. Order follows the canonical services.ts order.
 */
export function practiceAreasFor(member: TeamMember): Service[] {
  const slugs = new Set<string>();
  for (const specialty of member.specialties) {
    const slug = SPECIALTY_TO_SERVICE[specialty];
    if (slug) slugs.add(slug);
  }
  return pillarServices().filter((svc) => slugs.has(svc.slug));
}
