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
  "Transfer Pricing": "transfer-pricing-expert-witness",
  "Divorce Financial Analysis": "divorce-and-marital-financial-analysis",
  "Expert Testimony": "expert-rebuttal-and-report-review",
  "Economic Analysis": "lost-earnings-and-earning-capacity",
  "Expert Liaison": "",
};

/** A service name that names the role rather than the work ("Transfer Pricing Expert Witness"). */
const ROLE_NOUN_NAME = /\bExpert(?: Witness)?$/;

/**
 * Anchor text of a profile's "Areas of Practice" link: the service name, or,
 * on the profile of a member counsel cannot retain by name (no expertTier),
 * the short name wherever the service name is a role noun, so a support
 * profile never reads as "<Name> ... Transfer Pricing Expert Witness".
 * scripts/prerender.mjs applies the same rule to the profile shells.
 */
export function practiceAreaLabel(member: Pick<TeamMember, "expertTier">, service: Pick<Service, "name" | "shortName">): string {
  return !member.expertTier && ROLE_NOUN_NAME.test(service.name) ? service.shortName : service.name;
}

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
