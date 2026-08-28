import { pillarServices } from "@/data/services";
import type { Service, TeamMember } from "@/types";

/**
 * Map an existing specialty phrase (from team.ts) to an economics service
 * line. This is a deterministic lookup over data the member already has - it
 * makes no new claim about a person, it only links their stated specialties
 * to the matching practice area pages. Specialties with no service equivalent
 * (e.g. "Expert Liaison", "Research", "Administrative Support") map to
 * nothing, so support staff show no practice areas.
 */
const SPECIALTY_TO_SERVICE: Record<string, string> = {
  "Forensic Economics": "lost-earnings-and-earning-capacity",
  "Economic Damages": "personal-injury-economic-damages",
  "Earning Capacity Analysis": "lost-earnings-and-earning-capacity",
  "Wrongful Death Analysis": "wrongful-death-economic-loss",
  "Household Services": "household-services-valuation",
  "Present Value Analysis": "life-care-plan-cost-projection",
  "Employment Damages": "employment-and-wage-loss-damages",
  "Business Valuation": "business-valuation",
  "Lost Profits": "lost-profits-and-commercial-damages",
  "Forensic Accounting": "fraud-and-asset-tracing",
  "Divorce Financial Analysis": "divorce-and-marital-financial-analysis",
  "Expert Testimony": "expert-rebuttal-and-report-review",
  "Economic Analysis": "lost-earnings-and-earning-capacity",
  "Expert Liaison": "",
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
