import { useParams, Navigate, Link } from "react-router-dom";
import { getServiceBySlug, pillarServices } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { useStateCities } from "@/hooks/use-state-cities";
import { SERVICE_CITY_TOP, serviceCityCities } from "@/lib/geo-links";
import { getCourtsByState } from "@/data/courts/state-courts";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { usePageMeta } from "@/hooks/use-page-meta";
import SchemaOrg from "@/components/SchemaOrg";
import {
  graphSchema,
  organizationSchema,
  serviceSchema,
  breadcrumbSchema,
  faqPageSchema,
  ORG_URL,
} from "@/lib/schema";
import { placeAttr, placeName } from "@/data/geo-prose.mjs";
import { ORG_NAME } from "@/lib/brand";
// Service.shortName is a heading label; every sentence that names the work
// goes through the shared helpers (workPhrase: "wrongful death analysis").
// Slots after in/across/throughout take placeName ("the District of
// Columbia"); attributive slots ("Texas wage data") take placeAttr.
import { proseName, workPhrase } from "@/lib/service-prose.mjs";
import { getStateNarrative, serviceStateDirectAnswer } from "@/data/narratives";
import { serviceStateGeographicFaqs } from "@/data/geographicFaqs";
import { getCaseType } from "@/data/caseTypes";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import EconomicContextWidget from "@/components/EconomicContextWidget";
import CourtInfoPanel from "@/components/CourtInfoPanel";
import ContactCTA from "@/components/ContactCTA";
import LocationCard from "@/components/LocationCard";
import FAQBlock from "@/components/FAQBlock";
import Reveal from "@/components/Reveal";
import { serviceMotion } from "@/lib/service-motion";
import { useMagnetic } from "@/hooks/use-pointer-fx";
import { ArrowRight, Briefcase } from "lucide-react";
import { ICONS } from "@/lib/icons";

// Rebuttal is engaged in reaction to an opposing report, not by matter type, so
// it is not offered as a related-service card (the pillar page still links its
// state directory). Mirrors the home-page service grid.
const EXCLUDED_SERVICES = new Set(["expert-rebuttal-and-report-review"]);

export default function ServiceState() {
  const { serviceSlug, stateSlug } = useParams<{ serviceSlug: string; stateSlug: string }>();

  const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  const state = stateSlug ? getStateBySlug(stateSlug) : undefined;

  usePageMeta({
    title: service && state
      ? `${service.shortName} in ${placeName(state.name)} | ${ORG_NAME}`
      : `Service | ${ORG_NAME}`,
    description:
      service && state
        ? `${ORG_NAME} provides ${workPhrase(service.shortName)} for matters venued in ${placeName(state.name)}. Forensic economists measuring lost earnings, household services, and business damages against ${placeAttr(state.name)} wage data and the jurisdiction's damages rules, for plaintiff and defense counsel across ${placeName(state.name)}.`
        : "",
    canonical: `${ORG_URL}/services/${serviceSlug ?? ""}/${stateSlug ?? ""}`,
  });

  const magnet = useMagnetic<HTMLAnchorElement>(0.25);
  // Secondary "cities we serve" list; lazy-loaded per state (fills in on load).
  const { cities: stateCities } = useStateCities(stateSlug);

  if (!service || !state) {
    return <Navigate to="/services" replace />;
  }
  // Non-pillar cross-sells have no geographic tier; send hand-typed URLs to the card.
  if (!service.pillar) {
    return <Navigate to={`/services/${service.slug}`} replace />;
  }

  const ServiceIcon = ICONS[service.icon] ?? Briefcase;
  const motion = serviceMotion(service.slug);

  const courts = getCourtsByState(state.slug);
  const regulations = getRegulationsByState(state.slug);
  // Every city that has a /services/<service>/<state>/<city> page (the full
  // service-city window, kept in sync with the sitemap via geo-links).
  const cities = serviceCityCities(stateCities);
  const narrative = getStateNarrative(state);
  const faqs = serviceStateGeographicFaqs(service, state.name);
  // "the District of Columbia" after in/across/throughout; states as-is.
  const place = placeName(state.name);

  const relatedServices = pillarServices().filter(
    (s) => s.slug !== service.slug && !EXCLUDED_SERVICES.has(s.slug)
  );

  const url = `${ORG_URL}/services/${service.slug}/${state.slug}`;
  const directAnswer = serviceStateDirectAnswer(ORG_NAME, service.shortName, state.name, narrative);

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-clip">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            slug: `${service.slug}-${state.slug}`,
            name: `${service.name} in ${place}`,
            description: directAnswer,
            areaServed: { "@type": "AdministrativeArea", name: state.name },
          }),
          faqPageSchema(faqs, url),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Services", url: `${ORG_URL}/services` },
            { name: service.name, url: `${ORG_URL}/services/${service.slug}` },
            { name: state.name, url },
          ]),
        ])}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Services", href: "/services" },
            { label: service.name, href: `/services/${service.slug}` },
            { label: state.name },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white border-b border-navy-dark">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="kw-enter inline-flex items-center gap-2 text-amber-light text-xs font-semibold mb-5 uppercase tracking-[0.18em]">
            {state.name} &middot; {state.abbreviation}
          </p>
          <div className="flex items-start gap-5">
            <div className="kw-enter kw-enter-1 kw-float hidden sm:flex shrink-0 w-16 h-16 rounded-2xl bg-amber/15 border border-amber/30 items-center justify-center text-amber shadow-lg shadow-amber/10">
              <ServiceIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="kw-enter kw-enter-1 font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-4">
                <span className="kw-gradient-text">{service.shortName}</span> in {place}
              </h1>
              <p className="kw-enter kw-enter-2 text-lg text-neutral-300 max-w-3xl mb-3">
                {directAnswer}
              </p>
              <p className="kw-enter kw-enter-2 text-base text-neutral-500 max-w-3xl mb-7">
                {narrative.legalContext}
              </p>
              <div className="kw-enter kw-enter-3 flex flex-wrap gap-3">
                <Link
                  ref={magnet}
                  to="/contact"
                  className="kw-magnetic group inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-teal/20"
                >
                  Request a Consultation <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to={`/services/${service.slug}`}
                  className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  All {service.shortName} Locations
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main two-column layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Main content - 2/3 */}
          <main className="lg:col-span-2 space-y-10">

            {/* Service description + state-specific regulation context */}
            <Reveal as="section" variant={motion.reveal} className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8">
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                {service.shortName} in {place}
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {service.description}
              </p>
              {regulations && (
                <p className="text-neutral-700 leading-relaxed mb-4">
                  {regulations.damagesContext} Outside the civil courts, wage-loss disputes in workers'
                  compensation matters proceed before the <strong>{regulations.compensationForum}</strong>.
                </p>
              )}
            </Reveal>

            {/* Case type badges */}
            <Reveal as="section" variant={motion.reveal}>
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                Case Types
              </h2>
              <div className="flex flex-wrap gap-2">
                {service.caseTypes.map((ct) => (
                  <span
                    key={ct}
                    className="inline-block bg-teal/10 text-teal font-medium text-sm px-4 py-1.5 rounded-full border border-teal/20"
                  >
                    {getCaseType(ct)?.name ?? ct}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Cities */}
            {cities.length > 0 && (
              <Reveal as="section" variant={motion.reveal}>
                <h2 className="font-serif text-2xl font-bold text-navy mb-2">
                  {service.shortName} Across {place}
                </h2>
                <p className="text-neutral-600 mb-5">
                  Our experts serve clients throughout {place}, including the following communities.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cities.map((city) => (
                    <LocationCard
                      key={city.slug}
                      name={`${service.shortName} in ${city.name}`}
                      href={`/services/${service.slug}/${state.slug}/${city.slug}`}
                      subtitle={city.county}
                    />
                  ))}
                </div>
                {stateCities.length > SERVICE_CITY_TOP && (
                  <div className="mt-4">
                    <Link
                      to={`/locations/${state.slug}`}
                      className="inline-flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
                    >
                      View all {state.name} locations <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </Reveal>
            )}

            {/* Related services in this state */}
            {relatedServices.length > 0 && (
              <Reveal as="section" variant={motion.reveal}>
                <h2 className="font-serif text-2xl font-bold text-navy mb-2">
                  Related Services in {place}
                </h2>
                <p className="text-neutral-600 mb-5">
                  {ORG_NAME} offers complementary services to support your {state.name} cases.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {relatedServices.map((s) => (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}/${state.slug}`}
                      className="kw-lift group flex items-center justify-between bg-white rounded-lg border border-neutral-200 px-5 py-4 hover:border-teal hover:shadow-md"
                    >
                      <span className="font-medium text-navy group-hover:text-teal transition-colors">
                        {s.shortName}
                      </span>
                      <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-teal group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {/* Contact CTA */}
            <Reveal variant={motion.reveal}>
              <FAQBlock faqs={faqs} title={`Frequently asked: ${service.shortName} in ${place}`} />
            </Reveal>

            <Reveal variant={motion.reveal}>
              <ContactCTA context={`${service.shortName} in ${place}`} />
            </Reveal>
          </main>

          {/* Sidebar - 1/3 */}
          <aside className="mt-10 lg:mt-0 space-y-6">

            {/* Economic context */}
            <Reveal variant="up">
              <EconomicContextWidget
                areaName={state.name}
                population={state.population}
                compensationForum={regulations?.compensationForum}
              />
            </Reveal>

            {/* Court Info Panel */}
            {courts && (
              <Reveal variant="up" delay={80}>
                <CourtInfoPanel courts={courts} stateName={state.name} />
              </Reveal>
            )}

            {/* Credentials */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">
                Expert Credentials
              </h3>
              <p className="text-sm text-neutral-600 mb-3">
                Qualifications and standards that bear on {proseName(service.shortName)} testimony in {place}:
              </p>
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

            {/* Quick links */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-navy mb-1">Quick Links</h3>
              <Link
                to={`/services/${service.slug}`}
                className="flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> All {service.shortName} Locations
              </Link>
              <Link
                to={`/locations/${state.slug}`}
                className="flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {state.name} Locations Hub
              </Link>
              <Link
                to="/services"
                className="flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> All Services
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
