import { useParams, Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { team } from "@/data/team";
import { states } from "@/data/states";
import { practiceAreasFor } from "@/lib/practice-areas";
import { initialsOf } from "@/lib/initials";
import { truncateAtWord } from "@/lib/text";
import { ORG_NAME } from "@/lib/brand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Picture } from "@/components/Picture";
import Reveal from "@/components/Reveal";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, personSchema, organizationSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

const STATE_NAMES: Record<string, string> = Object.fromEntries(
  states.map((s) => [s.abbreviation, s.name]),
);

export default function ExpertProfile() {
  const { slug = "" } = useParams();
  const m = team.find((t) => t.slug === slug);
  const url = m ? `${ORG_URL}/team/${m.slug}` : "";
  // Some display names already carry their degree post-nominals (e.g. "Jane Roe,
  // Ph.D."). Drop those from the appended credential list so the title doesn't
  // read "Jane Roe, Ph.D., Ph.D., ...". Match on the comma-delimited tokens in the
  // name rather than a substring so credentials aren't dropped by accident.
  const nameCreds = new Set(
    m ? m.name.split(",").slice(1).map((s) => s.trim()) : [],
  );
  const extraCredentials = (m?.credentials ?? []).filter((c) => !nameCreds.has(c));
  const credentialList = extraCredentials.length
    ? `, ${extraCredentials.slice(0, 4).join(", ")}`
    : "";
  usePageMeta(
    m
      ? {
          title: m.memoriam
            ? `${m.name} | In Memoriam | ${ORG_NAME}`
            : `${m.name}${credentialList} | ${ORG_NAME}`,
          description: m.bio
            ? truncateAtWord(m.bio)
            : `${m.name}${credentialList} - ${m.title} at ${ORG_NAME}.`,
          canonical: url,
        }
      : null,
  );
  if (!m) return <NotFound />;

  const practiceAreas = practiceAreasFor(m);
  const jurisdictions = m.statesServed.map((a) => STATE_NAMES[a] ?? a);

  return (
    <>
      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Team", url: "/team" },
              { name: m.name, url: `/team/${m.slug}` },
            ]}
          />
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="shrink-0 mx-auto sm:mx-0">
              {m.imageUrl ? (
                <Picture
                  src={m.imageUrl}
                  alt={m.name}
                  width={224}
                  height={298}
                  className="w-48 sm:w-56 aspect-[3/4] object-cover object-top rounded-xl ring-1 ring-white/20 shadow-2xl shadow-black/30"
                />
              ) : (
                <div className="w-48 sm:w-56 aspect-[3/4] rounded-xl ring-1 ring-white/20 bg-white/5 flex items-center justify-center">
                  <span className="text-6xl font-bold text-white/30">{initialsOf(m.name)}</span>
                </div>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1">
              {m.memoriam && (
                <p className="text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
                  In Memoriam
                </p>
              )}
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">{m.name}</h1>
              <p className="text-amber-light text-lg font-medium mt-2">{m.title}</p>

              {m.credentials.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-5">
                  {m.credentials.map((cred) => (
                    <span
                      key={cred}
                      className="inline-block bg-white/10 text-white text-xs font-semibold px-2.5 py-1 rounded ring-1 ring-white/15"
                    >
                      {cred}
                    </span>
                  ))}
                </div>
              )}

              {!m.memoriam && jurisdictions.length > 0 && (
                <p className="flex items-center gap-2 text-sm text-neutral-300 mt-5">
                  <MapPin className="w-4 h-4 shrink-0 text-amber-light" aria-hidden="true" />
                  <span>
                    <span className="sr-only">Jurisdictions served: </span>
                    {jurisdictions.join(", ")}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <section id="bio" className="mb-10">
              <h2 className="font-serif text-2xl font-bold text-navy mb-3">Biography</h2>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">
                {m.fullBio || m.bio}
              </p>
            </section>
          </Reveal>

          {m.specialties.length > 0 && (
            <Reveal>
              <section id="expertise" className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-navy mb-4">Areas of Expertise</h2>
                <ul className="flex flex-wrap gap-2">
                  {m.specialties.map((s) => (
                    <li
                      key={s}
                      className="inline-block bg-teal/10 text-teal text-sm font-medium px-3 py-1.5 rounded-lg"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {!m.memoriam && practiceAreas.length > 0 && (
            <Reveal>
              <section id="practice" className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-navy mb-2">Areas of Practice</h2>
                <p className="text-neutral-600 text-sm mb-4">
                  {m.name.split(" ")[0]} works within these service lines.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {practiceAreas.map((svc) => (
                    <Link
                      key={svc.slug}
                      to={`/services/${svc.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 hover:border-amber/50 hover:shadow-md transition-all"
                    >
                      <span className="font-medium text-navy group-hover:text-amber-dark transition-colors">
                        {svc.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-dark transition-all group-hover:translate-x-0.5 shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {m.education && m.education.length > 0 && (
            <Reveal>
              <section id="education" className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-navy mb-3">Education</h2>
                <ul className="list-disc ml-5 text-neutral-700 space-y-1">
                  {m.education.map((e) => (
                    <li key={`${e.degree}-${e.institution}`}>
                      {e.degree}, {e.institution}
                      {e.year ? ` (${e.year})` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {m.publications && m.publications.length > 0 && (
            <Reveal>
              <section id="publications" className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-navy mb-3">Publications</h2>
                <ul className="list-disc ml-5 text-neutral-700 space-y-1">
                  {m.publications.map((p) => (
                    <li key={p.title}>
                      {p.url ? (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener"
                          className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
                        >
                          {p.title}
                        </a>
                      ) : (
                        p.title
                      )}
                      <span className="text-neutral-500">
                        {" "}
                        - {p.venue} ({p.year})
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {m.priorTestimony && (
            <Reveal>
              <section id="testimony" className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-navy mb-3">Prior Testimony</h2>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{m.priorTestimony}</p>
              </section>
            </Reveal>
          )}

          {m.cvUrl && (
            <p className="mb-10">
              <a
                href={m.cvUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
              >
                Download CV (PDF) <ArrowRight className="w-4 h-4" />
              </a>
            </p>
          )}

          {m.memoriam ? (
            <Reveal>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-6 py-8 text-center">
                <p className="text-neutral-700 leading-relaxed max-w-xl mx-auto">
                  The {ORG_NAME} team remembers {m.name.split(" ")[0]} with gratitude, as a
                  dedicated professional and a valued colleague and friend.
                </p>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <ContactCTA />
            </Reveal>
          )}

          <p className="mt-8 text-sm">
            <Link
              to="/team"
              className="inline-flex items-center gap-1 text-navy hover:text-amber-dark transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to the team
            </Link>
          </p>
        </div>
      </section>

      {/* No Person schema for memoriam profiles: personSchema asserts worksFor +
          a present-tense jobTitle, which must not be published for a deceased
          colleague. The tribute page keeps Organization + breadcrumbs only. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          ...(m.memoriam ? [] : [personSchema({
            slug: m.slug,
            name: m.name,
            jobTitle: m.title,
            credentials: m.credentials,
            specialties: m.specialties,
            imageUrl: m.imageUrl,
            bio: m.bio,
            sameAs: m.sameAs,
          })]),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Team", url: `${ORG_URL}/team` },
            { name: m.name, url },
          ]),
        ])}
      />
    </>
  );
}
