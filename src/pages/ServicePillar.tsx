import { useParams, Navigate, Link } from "react-router-dom";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, serviceSchema, breadcrumbSchema, faqPageSchema, ORG_URL } from "@/lib/schema";
import { getServiceBySlug } from "@/data/services";
import { caseTypes } from "@/data/caseTypes";
import { states } from "@/data/states";
import { ORG_NAME, ORG_SHORT } from "@/lib/brand";
import { usePageMeta } from "@/hooks/use-page-meta";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import ContactCTA from "@/components/ContactCTA";
import LocationCard from "@/components/LocationCard";
import FAQBlock from "@/components/FAQBlock";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Service } from "@/types";

const REGIONS: { key: "northeast" | "southeast" | "midwest" | "west"; label: string }[] = [
  { key: "northeast", label: "Northeast" },
  { key: "southeast", label: "Southeast" },
  { key: "midwest", label: "Midwest" },
  { key: "west", label: "West" },
];

// Case-type chip targets are derived from the case-type data itself so the
// pillar's "by Case Type" links can never point at a /case-types/<slug> or
// /services/<svc>/case/<slug> page that is not prerendered.
const CASE_TYPE_SLUGS: Record<string, string> = Object.fromEntries(
  caseTypes.map((c) => [c.name, c.slug]),
);

/** Public /tools relevant to a given service pillar, surfaced in the sidebar. */
const RELATED_TOOLS: Record<string, { to: string; label: string; blurb: string }[]> = {
  "life-care-planning": [
    {
      to: "/tools/life-expectancy",
      label: "Life expectancy calculator",
      blurb: "Look up remaining life expectancy from the CDC United States Life Tables, 2023.",
    },
  ],
};

export default function ServicePillar() {
  const { serviceSlug } = useParams<{ serviceSlug: string }>();
  const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;

  usePageMeta({
    title: service
      ? `${service.name} - Nationwide Expert Witness | ${ORG_NAME}`
      : `Service | ${ORG_NAME}`,
    description: service?.description ?? "",
    canonical: `${ORG_URL}/services/${serviceSlug ?? ""}`,
    // Non-pillar cross-sells are reachable but never indexed, prerendered, or
    // listed in the sitemap; the card below hands the visitor to the practice
    // that actually performs the work.
    noindex: service ? !service.pillar : false,
  });

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  if (!service.pillar) {
    return <NonPillarCard service={service} />;
  }

  const stateOnly = states.filter((s) => s.type === "state");
  const serviceUrl = `${ORG_URL}/services/${service.slug}`;
  const pillarFaqs = [
    {
      question: `What does a ${service.shortName.toLowerCase()} engagement cost?`,
      answer: `Full retained-expert engagements are billed hourly across review, evaluation, report, and (if needed) testimony phases. Specific cost depends on case complexity and engagement scope.`,
    },
    {
      question: `Does ${ORG_SHORT} work plaintiff and defense?`,
      answer: `Yes. ${ORG_NAME} provides independent, objective ${service.shortName.toLowerCase()} for plaintiff and defense counsel. The methodology is the same regardless of which side commissions the work; every plan is grounded in published standards of practice.`,
    },
    {
      question: `Where does ${ORG_SHORT} provide ${service.shortName.toLowerCase()}?`,
      answer: `${ORG_NAME} accepts ${service.shortName.toLowerCase()} engagements in all 50 states, the District of Columbia, and US territories. State-specific framing is available on the per-state pages linked below.`,
    },
    {
      question: `What is the typical turnaround for a full ${service.shortName.toLowerCase()} report?`,
      answer: `Full retained-expert reports typically take 30 to 90 days from records receipt depending on case complexity. Rush turnarounds are accommodated case-by-case.`,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({ slug: service.slug, name: service.name, description: service.description }),
          faqPageSchema(pillarFaqs, serviceUrl),
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
          <p className="text-lg text-neutral-600 max-w-3xl mb-6">
            {service.description}
          </p>
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

          {/* Main content - 2/3 */}
          <main className="lg:col-span-2 space-y-10">

            {/* Case Types */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                Case Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.caseTypes.map((ct) => {
                  const slug = CASE_TYPE_SLUGS[ct];
                  const className =
                    "inline-block bg-navy/5 text-navy font-medium text-sm px-4 py-1.5 rounded-full border border-navy/15 hover:bg-navy hover:text-white transition-colors";
                  return slug ? (
                    <Link key={ct} to={`/case-types/${slug}`} className={className}>
                      {ct}
                    </Link>
                  ) : (
                    <span key={ct} className={className.replace(" hover:bg-navy hover:text-white transition-colors", "")}>
                      {ct}
                    </span>
                  );
                })}
              </div>
            </section>

            {/* Service x Case-Type deep dives. These pages exist for every
                case type (prerendered + in the sitemap) but had no inbound
                internal links before this section - sitemap-only orphans. */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                {service.shortName} by Case Type
              </h2>
              <p className="text-neutral-700 mb-4">
                How {service.shortName.toLowerCase()} applies to the specific demands of each case
                type: methodology, deliverables, and what counsel should expect.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(CASE_TYPE_SLUGS).map(([ct, slug]) => (
                  <Link
                    key={slug}
                    to={`/services/${service.slug}/case/${slug}`}
                    className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:border-navy hover:shadow transition"
                  >
                    {ct} <ArrowRight className="w-4 h-4 text-teal" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>

            {/* State Directory */}
            <section>
              <h2 className="font-serif text-2xl font-bold text-navy mb-6">
                {service.shortName} by State
              </h2>
              <div className="space-y-8">
                {REGIONS.map(({ key, label }) => {
                  const regionStates = stateOnly.filter((s) => s.region === key);
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

            {/* Contact CTA */}
            <FAQBlock faqs={pillarFaqs} title={`Frequently asked: ${service.shortName}`} />

            <ContactCTA context={service.shortName} />
          </main>

          {/* Sidebar - 1/3 */}
          <aside className="mt-10 lg:mt-0 space-y-8">

            {/* Relevant Credentials */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
                Relevant Credentials
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.relevantCredentials.map((cred) => (
                  <span
                    key={cred}
                    className="inline-block bg-forest/10 text-forest font-medium text-sm px-3 py-1 rounded-full border border-forest/20"
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
                Related Terms
              </h3>
              <div className="flex flex-wrap gap-2">
                {service.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-block bg-neutral-100 text-neutral-600 text-sm px-3 py-1 rounded-full border border-neutral-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Related tool - only for services with a matching public /tools page */}
            {RELATED_TOOLS[service.slug] && (
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="font-serif text-lg font-bold text-navy mb-4">
                  Related tool
                </h3>
                <ul className="space-y-4">
                  {RELATED_TOOLS[service.slug].map((tool) => (
                    <li key={tool.to}>
                      <Link
                        to={tool.to}
                        className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
                      >
                        {tool.label} <ArrowRight className="w-4 h-4" />
                      </Link>
                      <p className="text-sm text-neutral-600 mt-1">{tool.blurb}</p>
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
            Offered through the firm&apos;s economics practice
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl text-navy font-bold mb-4">
            {service.name}
          </h1>
          <p className="text-lg text-neutral-600 mb-6">{service.description}</p>
          <p className="text-neutral-600 mb-8">
            {ORG_NAME} prepares the life care plan; the present-value analysis of its
            costs is performed by the firm&apos;s forensic economists, who coordinate
            with the planner so the plan and the valuation reconcile.
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
              to="/services/life-care-planning"
              className="inline-flex items-center gap-2 border border-teal text-teal hover:bg-teal/10 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Life care planning <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
