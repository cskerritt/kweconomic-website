import { useParams, Navigate, Link } from "react-router-dom";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, serviceSchema, breadcrumbSchema, faqPageSchema, ORG_URL } from "@/lib/schema";
import { getServiceBySlug, isPillarService } from "@/data/services";
import { caseTypes, getCaseType } from "@/data/caseTypes";
import { credentials, type Credential } from "@/data/credentials";
import { states } from "@/data/states";
import { ORG_NAME } from "@/lib/brand";
import { pillarTitle } from "@/lib/page-titles.mjs";
// Service.shortName is a heading label ("Fraud & Tracing"); the hero lead,
// the credential sidebar, and the "by Case Type" intro render it as prose
// through the shared helpers. Headings and link labels keep the short name.
import { capFirst, proseName, workPhrase } from "@/lib/service-prose.mjs";
import { usePageMeta } from "@/hooks/use-page-meta";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import AuthorByline from "@/components/AuthorByline";
import ResponsibilityLine from "@/components/ResponsibilityLine";
import ContactCTA from "@/components/ContactCTA";
import LocationCard from "@/components/LocationCard";
import FAQBlock from "@/components/FAQBlock";
import RelatedContent from "@/components/RelatedContent";
import SourcesBlock from "@/components/SourcesBlock";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Service } from "@/types";

// Every entry in states.ts has a region; the fifth group carries the District
// of Columbia and the five territories (same grouping as LocationsHub), so all
// 56 service x state pages get a link from their parent pillar.
const REGIONS: { key: "northeast" | "southeast" | "midwest" | "west" | "territory"; label: string }[] = [
  { key: "northeast", label: "Northeast" },
  { key: "southeast", label: "Southeast" },
  { key: "midwest", label: "Midwest" },
  { key: "west", label: "West" },
  { key: "territory", label: "Territories and DC" },
];

// services.ts lists case types by slug; resolve to the case-type record (name
// lookup kept as a fallback) so the chips print names and link real pages.
const resolveCaseType = (ref: string) => getCaseType(ref) ?? caseTypes.find((c) => c.name === ref);

// services.ts names credentials as a label set ("Forensic Economist", "NAFE",
// "MBA", "PhD"); credentials.ts keys them by slug and a punctuated, sometimes
// slash-separated abbreviation ("MBA / M.A. / Ph.D."). Compare on letters and
// digits only and let any part of a slash-separated abbreviation match. This
// mirrors CaseTypeHub.tsx and CredentialState.tsx; the three copies should be
// consolidated into one shared helper (see the family notes). Filtering the
// credential list, rather than mapping the labels, dedupes by credential
// ("MBA" and "PhD" both resolve to the graduate degree page).
const normalizeCredential = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
const credentialMatches = (cred: Credential, labels: string[]) =>
  labels.some(
    (label) =>
      label === cred.slug ||
      cred.abbreviation.split("/").some((part) => normalizeCredential(part) === normalizeCredential(label)),
  );

// Non-pillar cross-sell cards point back at the economics line that consumes
// the sister practice's opinion.
const NON_PILLAR_RELATED: Record<string, { href: string; label: string }> = {
  "vocational-evaluation": { href: "/services/lost-earnings-and-earning-capacity", label: "Lost earnings analysis" },
  "life-care-planning": { href: "/services/life-care-plan-cost-projection", label: "Life care plan costing" },
};

const CREDENTIAL_LINK_CLASS =
  "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-teal hover:text-teal text-sm";

export default function ServicePillar() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const entry = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  // Pillars carry the page content (metaDescription, faqs, related, sources,
  // caseTypeNotes); cross-sells render as a short card instead.
  const service = entry && isPillarService(entry) ? entry : undefined;

  usePageMeta({
    // Shared with scripts/prerender.mjs: "<name> Expert" on the pillar's
    // titleName where the full name would overrun the 60-character tag.
    title: entry ? pillarTitle(entry, ORG_NAME) : `Service | ${ORG_NAME}`,
    // The pillar meta description is the hand-authored metaDescription field
    // (140-160 characters, states the offer), never the hero paragraph.
    description: service?.metaDescription ?? entry?.description ?? "",
    canonical: `${ORG_URL}/services/${serviceSlug ?? ""}`,
    // Non-pillar cross-sells are reachable but never indexed, prerendered, or
    // listed in the sitemap; the card below hands the visitor to the practice
    // that actually performs the work.
    noindex: entry ? !entry.pillar : false,
  });

  if (!entry) {
    return <Navigate to="/services" replace />;
  }

  if (!service) {
    return <NonPillarCard service={entry} />;
  }

  const serviceUrl = `${ORG_URL}/services/${service.slug}`;
  const work = workPhrase(service.shortName);
  const name = proseName(service.shortName);
  const declaredCaseTypes = service.caseTypes
    .map(resolveCaseType)
    .filter((type): type is NonNullable<typeof type> => Boolean(type));
  const linkedCredentials = credentials.filter((c) => credentialMatches(c, service.relevantCredentials));

  return (
    <div className="min-h-screen bg-neutral-50">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            url: serviceUrl,
            name: service.name,
            description: service.metaDescription,
            dateModified: service.dateModified,
          }),
          faqPageSchema(service.faqs, serviceUrl),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Services", url: `${ORG_URL}/services` },
            { name: service.name, url: serviceUrl },
          ]),
        ])}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Services", href: "/services" },
            { label: service.name },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="font-serif text-4xl lg:text-5xl text-navy font-bold mb-4">
            {service.name}
          </h1>
          <AuthorByline dateModified={service.dateModified} />
          <p className="text-lg text-neutral-600 max-w-3xl mb-4">
            {service.description}
          </p>
          <p className="text-neutral-600 max-w-3xl mb-4">
            {ORG_NAME} prepares {work} for plaintiff and defense counsel nationwide; the method is the same whichever side retains the economist.
          </p>
          {/* The professional responsible for the work, linked to the profile
              that carries the CV (C02), and, where the work depends on or
              borders a sister practice's discipline, the explained hand-off
              to the practice that performs it (F08, G01). */}
          <ResponsibilityLine subject={`${capFirst(work)} at ${ORG_NAME}`} plural={false} className="text-neutral-600 max-w-3xl mb-4" />
          {service.handoff && (
            <p className="text-neutral-600 max-w-3xl mb-6">
              {service.handoff.text}{" "}
              <a
                href={service.handoff.href}
                rel="noopener"
                className="text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
              >
                {service.handoff.linkLabel}
              </a>
              .
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Request a Consultation <ArrowRight className="w-4 h-4" />
            </Link>
            {service.externalUrl && (
              <a
                href={service.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-teal text-teal hover:bg-teal/10 font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Visit {new URL(service.externalUrl).hostname.replace(/^www\./, "")}
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Main content - 2/3. A div, not a nested main element: the
              layout's main landmark (id="main-content") is the page's one. */}
          <div className="lg:col-span-2 space-y-10">

            {/* Case Types */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                Case Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.caseTypes.map((ct) => {
                  const type = resolveCaseType(ct);
                  const className =
                    "inline-block bg-navy/5 text-navy font-medium text-sm px-4 py-1.5 rounded-full border border-navy/15 hover:bg-navy hover:text-white transition-colors";
                  return type ? (
                    <Link key={ct} to={`/case-types/${type.slug}`} className={className}>
                      {type.name}
                    </Link>
                  ) : (
                    <span key={ct} className={className.replace(" hover:bg-navy hover:text-white transition-colors", "")}>
                      {ct}
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Service x Case-Type deep dives. Only the pairs this pillar
                declares in services.ts are linked (the same set as the chips
                above), so the page never advertises an offering the data does
                not describe. The link label names the service so the anchor
                differs from the case-type hub chip pointing elsewhere. */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                {service.shortName} by Case Type
              </h2>
              <p className="text-neutral-700 mb-4">
                How {work} applies to the specific demands of each case
                type: methodology, deliverables, and what counsel should expect.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {declaredCaseTypes.map(({ slug, name: typeName }) => (
                  <Link
                    key={slug}
                    to={`/services/${service.slug}/case/${slug}`}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:border-navy hover:shadow transition"
                  >
                    {service.shortName} for {typeName} <ArrowRight className="w-4 h-4 text-teal" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            {/* Hand-authored, service-specific FAQ (services.ts `faqs`);
                the same sentences feed the FAQPage JSON-LD above. The FAQ and
                the guides come before the 56-entry state directory so the
                practical explanations are not buried under it (audit F08). */}
            <FAQBlock faqs={service.faqs} title={`Frequently asked: ${service.shortName}`} />

            <RelatedContent items={service.related} heading={`Guides and methods for ${name}`} />

            {/* State Directory: all 56 entries (50 states, DC, 5 territories). */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-navy mb-6">
                {service.shortName} by State
              </h2>
              <div className="space-y-8">
                {REGIONS.map(({ key, label }) => {
                  const regionStates = states.filter((s) => s.region === key);
                  if (regionStates.length === 0) return null;
                  return (
                    <div key={key}>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                        {label}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {regionStates.map((state) => (
                          <LocationCard
                            key={state.slug}
                            name={state.name}
                            href={`/services/${service.slug}/${state.slug}`}
                            subtitle={state.abbreviation}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <ContactCTA context={service.shortName} />

            <SourcesBlock sources={service.sources} />
          </div>

          {/* Sidebar - 1/3 */}
          <aside className="mt-10 lg:mt-0 space-y-8">

            {/* Credentials that bear on the work. Each label links to its
                credential page and prints the credential's full name; the
                bare tokens ("NAFE", "AAEFE", "PhD") never render here, and the
                lead sentence frames the list as qualification criteria, not
                as memberships or degrees the firm claims to hold. */}
            {linkedCredentials.length > 0 && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="font-serif text-lg font-bold text-navy mb-3">
                  How an expert on this work is qualified
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  No state licenses forensic economists. Qualification to testify on {work} is decided case by case on education, method, and testimony history; these pages explain what each credential establishes and what it does not.
                </p>
                <ul className="space-y-2">
                  {linkedCredentials.map((c) => (
                    <li key={c.slug}>
                      <Link to={`/credentials/${c.slug}`} className={CREDENTIAL_LINK_CLASS}>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Engagement details: cost / process / timeline variant pages
                (prerendered + in the sitemap; previously had no inbound links). */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
                Engagement Details
              </h3>
              <ul className="space-y-3">
                {([
                  ["cost", "Cost and fee structure"],
                  ["process", "Engagement process"],
                  ["timeline", "Typical timeline"],
                ] as const).map(([variant, label]) => (
                  <li key={variant}>
                    <Link
                      to={`/services/${service.slug}/${variant}`}
                      className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
                    >
                      {label} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
                Explore Services
              </h3>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/**
 * Short cross-sell card for a `pillar: false` service. No geographic
 * directory, case-type grid, or engagement-detail links: those tiers do not
 * exist for non-pillars (see pillarServices()).
 */
function NonPillarCard({ service }: { service: Service }) {
  const external = service.externalUrl;
  const host = external ? new URL(external).hostname.replace(/^www\./, "") : null;
  const related = NON_PILLAR_RELATED[service.slug] ?? { href: "/services", label: "All services" };
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Services", href: "/services" },
            { label: service.name },
          ]}
        />
      </div>
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="bg-white rounded-xl border border-neutral-200 p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            Offered through a sister practice
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl text-navy font-bold mb-4">
            {service.name}
          </h1>
          <p className="text-lg text-neutral-600 mb-6">{service.description}</p>
          <p className="text-neutral-600 mb-8">
            This work is performed by a sister practice in the same family of expert firms.
            {" "}{ORG_NAME} builds its economic analysis on that opinion and coordinates
            testimony so the two reports reconcile.
          </p>
          <div className="flex flex-wrap gap-3">
            {external && (
              <a
                href={external}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                {service.shortName} at {host} <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <Link
              to={related.href}
              className="inline-flex items-center gap-2 border border-teal text-teal hover:bg-teal/10 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              {related.label} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
