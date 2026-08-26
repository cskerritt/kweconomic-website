import { services } from "@/data/services";
import type { Service, TeamMember } from "@/types";

/**
 * Map an existing specialty phrase (from team.ts) to a KWVRS service line.
 * This is a deterministic lookup over data the member already has - it makes
 * no new claim about a person, it only links their stated specialties to the
 * matching practice area pages. Specialties with no service equivalent
 * (e.g. "Medical Chronology", "Research", "Administrative Support") simply
 * map to nothing, so support staff show no practice areas.
 */
const SPECIALTY_TO_SERVICE: Record<string, string> = {
  "Vocational Evaluation": "vocational-expert",
  "Earning Capacity Analysis": "vocational-expert",
  "Vocational Rehabilitation": "vocational-expert",
  "Rehabilitation Counseling": "vocational-expert",
  Counseling: "vocational-expert",
  "Life Care Planning": "life-care-planning",
  "Functional Capacity Evaluation": "life-care-planning",
  "Forensic Economics": "forensic-economics",
  "Economic Damages": "forensic-economics",
  "Economic Analysis": "forensic-economics",
  "Expert Testimony": "expert-witness-testimony",
  "Standard of Care Analysis": "standard-of-care",
  "Medical-Legal Consulting": "standard-of-care",
};

/**
 * Returns the KWVRS service lines a team member practices in, derived from
 * their specialties. Order follows the canonical services.ts order.
 */
export function practiceAreasFor(member: TeamMember): Service[] {
  const slugs = new Set<string>();
  for (const specialty of member.specialties) {
    const slug = SPECIALTY_TO_SERVICE[specialty];
    if (slug) slugs.add(slug);
  }
  return services.filter((svc) => slugs.has(svc.slug));
}
