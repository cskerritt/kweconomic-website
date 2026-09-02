import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { activeTeam, getTeamByRole, getMemoriam } from "@/data/team";
import { ORG_NAME, SITE_URL } from "@/lib/brand";
import { initialsOf } from "@/lib/initials";
import { usePageMeta } from "@/hooks/use-page-meta";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import { Picture } from "@/components/Picture";
import Reveal from "@/components/Reveal";
import SchemaOrg from "@/components/SchemaOrg";
import { organizationSchema, personSchema, breadcrumbSchema, graphSchema, ORG_URL } from "@/lib/schema";
import type { TeamMember } from "@/types";

function TeamCard({ member }: { member: TeamMember }) {
  const initials = initialsOf(member.name);

  return (
    <Link
      to={`/team/${member.slug}`}
      aria-label={`View ${member.name}'s profile`}
      className="group flex flex-col h-full bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-amber/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2"
    >
      {/* Photo or initials */}
      <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden">
        {member.imageUrl ? (
          <Picture
            src={member.imageUrl}
            alt={member.name}
            width={400}
            height={533}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy/5">
            <span className="text-5xl font-bold text-navy/20">{initials}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-bold text-navy leading-tight group-hover:text-amber-dark transition-colors">
          {member.name}
        </h3>
        <p className="text-amber-dark font-medium text-sm mt-1">{member.title}</p>

        {/* Credentials - all of them */}
        {member.credentials.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {member.credentials.map((cred) => (
              <span
                key={cred}
                className="inline-block bg-forest/10 text-forest text-xs font-semibold px-2 py-0.5 rounded"
              >
                {cred}
              </span>
            ))}
          </div>
        )}

        {/* Specialties */}
        {member.specialties.length > 0 && (
          <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
            {member.specialties.join(" · ")}
          </p>
        )}

        {/* View profile affordance */}
        <span className="inline-flex items-center gap-1 mt-auto pt-4 text-sm font-semibold text-navy group-hover:gap-2 group-hover:text-amber-dark transition-all">
          View profile
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

function MemoriamCard({ member }: { member: TeamMember }) {
  const initials = initialsOf(member.name);

  return (
    <Link
      to={`/team/${member.slug}`}
      aria-label={`Remember ${member.name}`}
      className="group flex flex-col h-full bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
    >
      <div className="aspect-[3/4] bg-neutral-100 relative overflow-hidden">
        {member.imageUrl ? (
          <Picture
            src={member.imageUrl}
            alt={member.name}
            width={400}
            height={533}
            className="w-full h-full object-cover object-top grayscale-[0.6] transition-all duration-500 group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy/5">
            <span className="text-5xl font-bold text-navy/20">{initials}</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">In Memoriam</p>
        <h3 className="font-serif text-lg font-bold text-navy leading-tight">{member.name}</h3>
        <p className="text-neutral-600 font-medium text-sm mt-1">{member.title}</p>

        {member.credentials.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {member.credentials.map((cred) => (
              <span
                key={cred}
                className="inline-block bg-neutral-200/70 text-neutral-600 text-xs font-semibold px-2 py-0.5 rounded"
              >
                {cred}
              </span>
            ))}
          </div>
        )}

        <span className="inline-flex items-center gap-1 mt-auto pt-4 text-sm font-medium text-neutral-500 group-hover:text-navy transition-colors">
          Remember {member.name.split(" ")[0]}
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

function TeamSection({
  title,
  description,
  members,
  columns = "lg:grid-cols-4",
}: {
  title: string;
  description: string;
  members: TeamMember[];
  columns?: string;
}) {
  if (members.length === 0) return null;
  return (
    <div className="mb-16">
      <div className="mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy">{title}</h2>
        <p className="text-neutral-600 mt-2">{description}</p>
      </div>
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${columns} gap-6`}>
        {members.map((member, i) => (
          <Reveal key={member.slug} delay={i * 50} className="h-full">
            <TeamCard member={member} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export default function Team() {
  usePageMeta({
    title: `Forensic Economics Team | ${ORG_NAME}`,
    description:
      `The ${ORG_NAME} team: a Chief of Economic Services who directs each damages analysis and can testify to it, and an associate who coordinates every engagement.`,
    canonical: `${SITE_URL}/team`,
  });

  const leadership = getTeamByRole("leadership");
  // Everyone who is not leadership renders under one "Economics Team" heading:
  // economists (role "expert") first, then associates and support staff.
  const economicsTeam = [...getTeamByRole("expert"), ...getTeamByRole("support")];
  const memoriam = getMemoriam();

  return (
    <>
      {/* Person schema from activeTeam only: worksFor/jobTitle are present-tense
          employment claims that must not be published for memoriam members. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        ...activeTeam.map((m) => personSchema({
          slug: m.slug,
          name: m.name,
          jobTitle: m.title,
          credentials: m.credentials,
          specialties: m.specialties,
          imageUrl: m.imageUrl,
          bio: m.bio,
          sameAs: m.sameAs,
        })),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Team", url: `${ORG_URL}/team` },
        ]),
      ])} />

      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Team", url: "/team" }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Our People
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              The {ORG_NAME} Team
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {ORG_NAME} is a focused practice: a Chief of Economic Services who
              directs every forensic economic analysis and is available to testify
              to it, and an economics associate who coordinates each engagement
              between the economics team and retaining counsel. Our analyses are
              prepared for plaintiff and defense attorneys and are built to be
              examined in the report, at deposition, and at trial.
            </p>
          </div>
        </div>
      </section>

      {/* Team Sections */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TeamSection
            title="Leadership"
            description="The Chief of Economic Services who directs the practice's damages analyses and is available for deposition and trial testimony."
            members={leadership}
            columns="lg:grid-cols-4"
          />

          <TeamSection
            title="Economics Team"
            description="The team that supports each analysis and coordinates the engagement between the economics practice and retaining counsel."
            members={economicsTeam}
            columns="lg:grid-cols-4"
          />

          {/* The In Memoriam section renders only when the roster honors someone;
              with getMemoriam() empty nothing is emitted. */}
          {memoriam.length > 0 && (
            <div className="mt-4 pt-12 border-t border-neutral-200">
              <div className="mb-8 max-w-2xl">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy">In Memoriam</h2>
                <p className="text-neutral-600 mt-2">
                  Honoring colleagues we have lost. Their dedication to the clients and
                  attorneys they served remains part of who we are.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {memoriam.map((member, i) => (
                  <Reveal key={member.slug} delay={i * 50} className="h-full">
                    <MemoriamCard member={member} />
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
