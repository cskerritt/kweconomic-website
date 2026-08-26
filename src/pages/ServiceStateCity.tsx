import { useParams, Navigate, Link } from "react-router-dom";
import { getServiceBySlug } from "@/data/services";
import { getStateBySlug } from "@/data/states";
import { useStateCities } from "@/hooks/use-state-cities";
import Loading from "@/components/Loading";
import { usePageMeta } from "@/hooks/use-page-meta";
import { truncateAtWord } from "@/lib/text";
import SchemaOrg from "@/components/SchemaOrg";
import {
  graphSchema,
  organizationSchema,
  serviceSchema,
  breadcrumbSchema,
  faqPageSchema,
  ORG_URL,
} from "@/lib/schema";
import { ORG_NAME } from "@/lib/brand";
import { getCityNarrative } from "@/data/narratives";
import { serviceCityGeographicFaqs } from "@/data/geographicFaqs";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import ContactCTA from "@/components/ContactCTA";
import FAQBlock from "@/components/FAQBlock";
import Reveal from "@/components/Reveal";
import ServiceCityCrossLinks from "@/components/ServiceCityCrossLinks";
import { serviceMotion } from "@/lib/service-motion";
import { useMagnetic } from "@/hooks/use-pointer-fx";
import { ArrowRight, Briefcase } from "lucide-react";
import { ICONS } from "@/lib/icons";

export default function ServiceStateCity() {
  const { serviceSlug, stateSlug, citySlug } = useParams<{
    serviceSlug: string;
    stateSlug: string;
    citySlug: string;
  }>();

  const service = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  const state = stateSlug ? getStateBySlug(stateSlug) : undefined;
  const { cities, loading } = useStateCities(stateSlug);
  const city = citySlug ? cities.find((c) => c.slug === citySlug) : undefined;

  const url =
    service && state && city
      ? `${ORG_URL}/services/${service.slug}/${state.slug}/${city.slug}`
      : "";
  const narrativeForMeta =
    service && state && city
      ? getCityNarrative(state, city.name, city.slug, city.county, { msaName: city.msaName })
      : null;
  const directAnswerForMeta =
    service && state && city && narrativeForMeta
      ? `${service.shortName} from ${ORG_NAME} for cases venued in ${city.name}, ${state.name}. ${narrativeForMeta.blurb}`
      : "";

  usePageMeta(
    service && state && city
      ? {
          title: `${service.shortName} in ${city.name}, ${state.abbreviation} | ${ORG_NAME}`,
          description: truncateAtWord(directAnswerForMeta),
          canonical: url,
        }
      : null,
  );

  const magnet = useMagnetic<HTMLAnchorElement>(0.25);

  // Redirect up the chain if any segment is unresolvable
  if (!service) return <Navigate to="/services" replace />;
  if (!service.pillar) return <Navigate to={`/services/${service.slug}`} replace />;
  if (!state) return <Navigate to={`/services/${service.slug}`} replace />;
  if (loading) return <Loading />;
  if (!city) return <Navigate to={`/services/${service.slug}/${state.slug}`} replace />;

  const narrative = getCityNarrative(state, city.name, city.slug, city.county, { msaName: city.msaName });
  const faqs = serviceCityGeographicFaqs(service.name, state.name, city.name);
  const directAnswer = `${service.shortName} from ${ORG_NAME} for cases venued in ${city.name}, ${state.name}. ${narrative.blurb}`;
  const ServiceIcon = ICONS[service.icon] ?? Briefcase;
  const motion = serviceMotion(service.slug);

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-clip">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            slug: `${service.slug}-${state.slug}-${city.slug}`,
            name: `${service.name} in ${city.name}, ${state.abbreviation}`,
            description: directAnswer,
            areaServed: { "@type": "City", name: `${city.name}, ${state.abbreviation}` },
          }),
          faqPageSchema(faqs, url),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Services", url: `${ORG_URL}/services` },
            { name: service.name, url: `${ORG_URL}/services/${service.slug}` },
            { name: state.name, url: `${ORG_URL}/services/${service.slug}/${state.slug}` },
            { name: city.name, url },
          ]),
        ])}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Services", href: "/services" },
            { label: service.name, href: `/services/${service.slug}` },
            { label: state.name, href: `/services/${service.slug}/${state.slug}` },
            { label: city.name },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white border-b border-navy-dark">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="kw-enter inline-flex items-center gap-2 text-amber-light text-xs font-semibold mb-5 uppercase tracking-[0.18em]">
            {city.name} &middot; {state.abbreviation}
          </p>
          <div className="flex items-start gap-5">
            <div className="kw-enter kw-enter-1 kw-float hidden sm:flex shrink-0 w-16 h-16 rounded-2xl bg-amber/15 border border-amber/30 items-center justify-center text-amber shadow-lg shadow-amber/10">
              <ServiceIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="kw-enter kw-enter-1 font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-4">
                <span className="kw-gradient-text">{service.shortName}</span> in {city.name}, {state.abbreviation}
              </h1>
              <p className="kw-enter kw-enter-2 text-lg text-neutral-300 max-w-3xl mb-3">
                {directAnswer}
              </p>
              <p className="kw-enter kw-enter-2 text-base text-neutral-500 max-w-3xl mb-7">
                {narrative.directAnswer}
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
                  to={`/services/${service.slug}/${state.slug}`}
                  className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  {service.shortName} in {state.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Main - 2/3 */}
          <main className="lg:col-span-2 space-y-10">

            {/* Service description in city context */}
            <Reveal as="section" variant={motion.reveal} className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8">
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                {service.shortName} in {city.name}
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {service.description}
              </p>
              <p className="text-neutral-700 leading-relaxed">
                {ORG_NAME} serves counsel throughout {city.name} and the surrounding{" "}
                {city.county ? city.county : state.name} area. Our planners price attendant care, home
                health, equipment, and specialist follow-up from providers serving {city.name}, and are
                familiar with the court system and disclosure requirements that affect{" "}
                {service.name.toLowerCase()} engagements in {state.name}.
              </p>
            </Reveal>

            {/* Case types */}
            <Reveal as="section" variant={motion.reveal}>
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">Case Types</h2>
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

            {/* Cross-links: sibling services in this city + this service in
                the state's other service-city pages */}
            <ServiceCityCrossLinks service={service} state={state} city={city} cities={cities} />

            <Reveal variant={motion.reveal}>
              <FAQBlock faqs={faqs} title={`Frequently asked: ${service.shortName} in ${city.name}`} />
            </Reveal>

            <Reveal variant={motion.reveal}>
              <ContactCTA context={`${service.shortName} in ${city.name}`} />
            </Reveal>
          </main>

          {/* Sidebar - 1/3 */}
          <aside className="mt-10 lg:mt-0 space-y-6">

            {/* Credentials */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">Expert Credentials</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Our {service.shortName.toLowerCase()} experts hold recognized certifications,
                including:
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

            {/* Navigation links */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-navy mb-1">Related Pages</h3>
              <Link
                to={`/services/${service.slug}/${state.slug}`}
                className="flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {service.shortName} in {state.name}
              </Link>
              <Link
                to={`/locations/${state.slug}/${city.slug}`}
                className="flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {city.name} Location Page
              </Link>
              <Link
                to={`/locations/${state.slug}`}
                className="flex items-center gap-2 text-teal hover:text-teal-dark font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {state.name} Locations
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
