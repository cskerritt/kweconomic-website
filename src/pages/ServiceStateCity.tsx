import { useParams, Navigate, Link } from "react-router-dom";
import { getServiceBySlug } from "@/data/services";
import { getCaseType } from "@/data/caseTypes";
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
import { serviceCityTitle } from "@/lib/page-titles.mjs";
// The H1 label: the pillar's fullest geo label where it sets one (page-titles.mjs).
import { serviceGeoHeadingLabel } from "@/lib/page-titles.mjs";
import { cityAttr, placeName } from "@/data/geo-prose.mjs";
import { proseName } from "@/lib/service-prose.mjs";
import {
  credentialPagePath,
  geoSources,
  getCityNarrative,
  serviceCityContextParagraph,
  serviceCityDirectAnswer,
  serviceCityPlaceParagraph,
} from "@/data/narratives";
import ResponsibilityLine from "@/components/ResponsibilityLine";
import { capFirst, workPhrase } from "@/lib/service-prose.mjs";
import { serviceCityGeographicFaqs } from "@/data/geographicFaqs";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import ContactCTA from "@/components/ContactCTA";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import Reveal from "@/components/Reveal";
import ServiceCityCrossLinks from "@/components/ServiceCityCrossLinks";
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
      ? serviceCityDirectAnswer(ORG_NAME, service.shortName, state.name, city.name, narrativeForMeta)
      : "";

  usePageMeta(
    service && state && city
      ? {
          // Shared with scripts/prerender.mjs: the heading label with the
          // city and its state abbreviation, then the pillar's titleShortName
          // beside both, and the abbreviation dropped only where no label
          // fits beside it in the 60-character tag. Headings keep shortName.
          title: serviceCityTitle(service, city, state, ORG_NAME),
          description: truncateAtWord(directAnswerForMeta),
          canonical: url,
        }
      : null,
  );

  // Redirect up the chain if any segment is unresolvable
  if (!service) return <Navigate to="/services" replace />;
  if (!service.pillar) return <Navigate to={`/services/${service.slug}`} replace />;
  if (!state) return <Navigate to={`/services/${service.slug}`} replace />;
  if (loading) return <Loading />;
  if (!city) return <Navigate to={`/services/${service.slug}/${state.slug}`} replace />;

  const narrative = getCityNarrative(state, city.name, city.slug, city.county, { msaName: city.msaName });
  const faqs = serviceCityGeographicFaqs(service, state.name, city.name);
  // "the District of Columbia" after "in"; states as-is. "The Bronx" drops
  // its own article in the attributive slot ("wage data for the Bronx area")
  // and keeps it everywhere else ("throughout The Bronx", "in The Bronx, NY").
  const place = placeName(state.name);
  const cityA = cityAttr(city.name);
  const directAnswer = serviceCityDirectAnswer(ORG_NAME, service.shortName, state.name, city.name, narrative);
  const ServiceIcon = ICONS[service.icon] ?? Briefcase;

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-clip">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            url,
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
          <p className="kw-eyebrow text-amber-light inline-flex items-center gap-2">
            {city.name} &middot; {state.abbreviation}
          </p>
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex shrink-0 w-16 h-16 rounded-2xl bg-amber/15 border border-amber/30 items-center justify-center text-amber shadow-lg shadow-amber/10">
              <ServiceIcon className="w-8 h-8" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-4">
                {serviceGeoHeadingLabel(service)} in {city.name}, {state.abbreviation}
              </h1>
              <p className="text-lg text-neutral-300 max-w-3xl mb-3">
                {directAnswer}
              </p>
              {/* The place paragraph: which area's data an analysis uses where
                  it uses local data at all. The hero above already names the
                  pillar's work, so the hub's "prepares economic damages
                  analyses" opener never prints here (F09). */}
              <p className="text-base text-neutral-300 max-w-3xl mb-7">
                {serviceCityPlaceParagraph(service.shortName, narrative)}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                 
                  to="/contact"
                  className="kw-press min-h-11 group inline-flex items-center gap-2 bg-amber-dark hover:bg-amber-darker active:bg-amber-darker text-white font-semibold px-6 py-3 rounded-lg"
                >
                  Request a Consultation <ArrowRight className="w-4 h-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                </Link>
                <Link
                  to={`/services/${service.slug}/${state.slug}`}
                  className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  {service.shortName} in {place}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-10">

          {/* Main - 2/3. A div, not a main: the layout already provides the
              page's single main landmark. */}
          <div className="lg:col-span-2 space-y-10">

            {/* Service description in city context. The H2 states what the
                section explains rather than repeating the H1; the paragraph
                names what this pillar measures and against what. */}
            <Reveal as="section" className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8">
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                How {service.shortName} Work Is Built for {cityA} Cases
              </h2>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {service.description}
              </p>
              <p className="text-neutral-700 leading-relaxed mb-4">
                {serviceCityContextParagraph(service, state, city)}
              </p>
              {/* The professional responsible for this work, linked to the
                  profile that carries the CV (C02). */}
              <ResponsibilityLine subject={`${capFirst(workPhrase(service.shortName))} for ${cityA} matters`} plural={false} />
            </Reveal>

            {/* Case types */}
            <Reveal as="section">
              <h2 className="font-serif text-2xl font-bold text-navy mb-4">Case Types</h2>
              <div className="flex flex-wrap gap-2">
                {service.caseTypes.map((ct) => (
                  <Link
                    key={ct}
                    to={`/case-types/${ct}/${state.slug}`}
                    className="inline-block bg-navy/10 text-navy font-medium text-sm px-4 py-1.5 rounded-full border border-navy/20 hover:bg-navy/15"
                  >
                    {getCaseType(ct)?.name ?? ct}
                  </Link>
                ))}
              </div>
            </Reveal>

            {/* Cross-links: sibling services in this city + this service in
                the state's other service-city pages */}
            <ServiceCityCrossLinks service={service} state={state} city={city} cities={cities} />

            <Reveal>
              <FAQBlock faqs={faqs} title={`Frequently asked: ${service.shortName} in ${city.name}`} />
            </Reveal>

            {/* The pillar's data and standards, through the registry. */}
            <Reveal>
              <SourcesBlock sources={geoSources(service)} />
            </Reveal>

            <Reveal>
              <ContactCTA context={`${service.shortName} in ${city.name}`} />
            </Reveal>
          </div>

          {/* Sidebar - 1/3 */}
          <aside className="mt-10 lg:mt-0 space-y-6">

            {/* Credentials */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-bold text-navy mb-4">Expert Credentials</h3>
              <p className="text-sm text-neutral-600 mb-3">
                Qualifications and standards that bear on {proseName(service.shortName)} testimony in {city.name}:
              </p>
              {/* Each chip links the credential x state page that explains
                  the qualification; the chips assert nothing about who holds it. */}
              <div className="flex flex-wrap gap-2">
                {service.relevantCredentials.map((cred) => {
                  const href = credentialPagePath(cred, state.slug);
                  const chip =
                    "inline-block bg-navy/10 text-navy font-medium text-sm px-3 py-1 rounded-full border border-navy/20";
                  return href ? (
                    <Link key={cred} to={href} className={`${chip} hover:bg-navy/20 transition-colors`}>
                      {cred}
                    </Link>
                  ) : (
                    <span key={cred} className={chip}>
                      {cred}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Navigation links */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-3">
              <h3 className="font-serif text-lg font-bold text-navy mb-1">Related Pages</h3>
              <Link
                to={`/services/${service.slug}/${state.slug}`}
                className="flex items-center gap-2 text-amber-dark hover:text-amber-darker font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {service.shortName} in {place}
              </Link>
              <Link
                to={`/locations/${state.slug}/${city.slug}`}
                className="flex items-center gap-2 text-amber-dark hover:text-amber-darker font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {city.name} Location Page
              </Link>
              <Link
                to={`/locations/${state.slug}`}
                className="flex items-center gap-2 text-amber-dark hover:text-amber-darker font-medium text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" /> {state.name} Locations
              </Link>
              <Link
                to="/services"
                className="flex items-center gap-2 text-amber-dark hover:text-amber-darker font-medium text-sm transition-colors"
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
