import { useParams, Navigate, Link } from "react-router-dom";
import { getServiceBySlug, services } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { useStateCities } from "@/hooks/use-state-cities";
import { SERVICE_CITY_TOP, serviceCityCities } from "@/lib/geo-links";
import { getLaborByState } from "@/data/labor/state-labor";
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
import { getStateNarrative } from "@/data/narratives";
import { serviceStateGeographicFaqs } from "@/data/geographicFaqs";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import LaborDataWidget from "@/components/LaborDataWidget";
import CourtInfoPanel from "@/components/CourtInfoPanel";
import ContactCTA from "@/components/ContactCTA";
import LocationCard from "@/components/LocationCard";
import FAQBlock from "@/components/FAQBlock";
import Reveal from "@/components/Reveal";
import { serviceMotion } from "@/lib/service-motion";
import { useMagnetic } from "@/hooks/use-pointer-fx";
import { ArrowRight, Briefcase } from "lucide-react";
import { ICONS } from "@/lib/icons";

const EXCLUDED_SERVICES = new Set(["standard-of-care", "expert-witness-testimony"]);

export default function ServiceState() {
  const { serviceSlug, stateSlug } = useParams<{ serviceSlug: string; stateSlug: string }>();

  const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  const state = stateSlug ? getStateBySlug(stateSlug) : undefined;

  usePageMeta({
    title: service && state
      ? `${service.shortName} in ${state.name} | KWVRS`
      : "Service | KWVRS",
    description:
      service && state
        ? `KWVRS provides ${service.name.toLowerCase()} in ${state.name}. Qualified vocational and rehabilitation expert services for attorneys and insurers across ${state.name}.`
        : "",
    canonical: `https://kwvrs.com/services/${serviceSlug ?? ""}/${stateSlug ?? ""}`,
  });

  const magnet = useMagnetic<HTMLAnchorElement>(0.25);
  // Secondary "cities we serve" list; lazy-loaded per state (fills in on load).
  const { cities: stateCities } = useStateCities(stateSlug);

  if (!service || !state) {
    return <Navigate to="/services" replace />;
  }

  const ServiceIcon = ICONS[service.icon] ?? Briefcase;
  const motion = serviceMotion(service.slug);

  const laborData = getLaborByState(state.slug);
  const courts = getCourtsByState(state.slug);
  const regulations = getRegulationsByState(state.slug);
  // Every city that has a /services/<service>/<state>/<city> page (the full
  // service-city window, kept in sync with the sitemap via geo-links).
  const cities = serviceCityCities(stateCities);
  const narrative = getStateNarrative(state);
  const faqs = serviceStateGeographicFaqs(service.name, state.name);

  const relatedServices = services.filter(
    (s) => s.slug !== service.slug && !EXCLUDED_SERVICES.has(s.slug)
  );

  const url = `${ORG_URL}/services/${service.slug}/${state.slug}`;
  const directAnswer = `${service.shortName} services from KWVRS for matters venued in ${state.name}. ${narrative.marketContext} Plaintiff and defense.`;

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-clip">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            slug: `${service.slug}-${state.slug}`,
            name: `${service.name} in ${state.name}`,
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
                <span className="kw-gradient-text">{service.shortName}</span> in {state.name}
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
                  className="kw-magnetic group inline-flex items-center gap-2 bg-amber-dark hover:bg-amber-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-amber/20"
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
                {service.shortName} in {state.name}
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {service.description}
              </p>
              {regulations && (
                <p className="text-neutral-700 leading-relaxed mb-4">
                  In {state.name}, vocational and rehabilitation experts operate within the framework
                  established by the <strong>{regulations.vocationalRehabAgency}</strong>.{" "}
                  {regulations.licensingRequirements}
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
                    {ct}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Cities */}
            {cities.length > 0 && (
              <Reveal as="section" variant={motion.reveal}>
                <h2 className="font-serif text-2xl font-bold text-navy mb-2">
                  {service.shortName} Across {state.name}
                </h2>
                <p className="text-neutral-600 mb-5">
                  Our experts serve clients throughout {state.name}, including the following communities.
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
                  Related Services in {state.name}
                </h2>
                <p className="text-neutral-600 mb-5">
                  KWVRS offers complementary services to support your {state.name} cases.
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
              <FAQBlock faqs={faqs} title={`Frequently asked: ${service.shortName} in ${state.name}`} />
            </Reveal>

            <Reveal variant={motion.reveal}>
              <ContactCTA context={`${service.shortName} in ${state.name}`} />
            </Reveal>
          </main>

          {/* Sidebar - 1/3 */}
          <aside className="mt-10 lg:mt-0 space-y-6">

            {/* Labor Data Widget */}
            {laborData && (
              <Reveal variant="up">
                <LaborDataWidget data={laborData} areaName={state.name} />
              </Reveal>
            )}

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
                Our {state.name} {service.shortName.toLowerCase()} experts hold recognized certifications, including:
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
