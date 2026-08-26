import { useParams, Navigate, Link } from "react-router-dom";
import SchemaOrg from "@/components/SchemaOrg";
import {
  graphSchema,
  organizationSchema,
  serviceSchema,
  breadcrumbSchema,
  faqPageSchema,
  ORG_URL,
} from "@/lib/schema";
import { getStateBySlug } from "@/data/states";
import { useStateCities } from "@/hooks/use-state-cities";
import Loading from "@/components/Loading";
import { truncateAtWord } from "@/lib/text";
import { nearestCities } from "@/lib/geo-links";
import { getMetroLabor } from "@/data/labor/metro-labor";
import { getLaborByState } from "@/data/labor/state-labor";
import { getCourtsByState } from "@/data/courts/state-courts";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { getLocalContent } from "@/data/local-content";
import { getCityNarrative } from "@/data/narratives";
import { cityGeographicFaqs } from "@/data/geographicFaqs";
import { usePageMeta } from "@/hooks/use-page-meta";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import LaborDataWidget from "@/components/LaborDataWidget";
import CourtInfoPanel from "@/components/CourtInfoPanel";
import ContactCTA from "@/components/ContactCTA";
import LocationCard from "@/components/LocationCard";
import CityServiceLinks from "@/components/CityServiceLinks";
import RelatedServices from "@/components/RelatedServices";
import FAQBlock from "@/components/FAQBlock";
import { ArrowRight } from "lucide-react";
import type { City, State } from "@/types";

// Builds a unique lead paragraph per city from its real attributes (county, MSA,
// capital/largest-city status), so each city page has differentiated lead content
// rather than an identical boilerplate sentence. No population figures (per the
// site content rules).
function buildCityIntro(city: City, state: State): string {
  const lead = `${city.name} is located in ${city.county}, ${state.name}.`;
  let role: string;
  if (city.isStateCapital) {
    role = `As the capital of ${state.name}, ${city.name} is home to the state's principal courts and administrative agencies and is a frequent venue for litigation requiring vocational and economic expert analysis.`;
  } else if (city.name === state.largestCity) {
    role = `As the largest city in ${state.name}, ${city.name} anchors one of the state's most active labor and litigation markets.`;
  } else if (city.msaName) {
    role = `It falls within the ${city.msaName} metropolitan area, whose wage levels and occupational mix inform earning capacity and transferable skills analysis in local cases.`;
  } else {
    role = `Counsel across ${city.county} retain KWVRS for objective vocational, life care planning, and forensic economic analysis.`;
  }
  const close = `KWVRS prepares court-admissible evaluations for ${city.name} attorneys and insurers, grounded in ${state.name}'s expert evidence standards and local labor market conditions.`;
  return `${lead} ${role} ${close}`;
}

export default function CityPage() {
  const { stateSlug, citySlug } = useParams<{ stateSlug: string; citySlug: string }>();

  const state = stateSlug ? getStateBySlug(stateSlug) : undefined;
  const { cities, loading } = useStateCities(stateSlug);
  const city = citySlug ? cities.find((c) => c.slug === citySlug) : undefined;

  const cityUrl = state && city ? `${ORG_URL}/locations/${state.slug}/${city.slug}` : "";
  const narrativeForMeta = state && city ? getCityNarrative(state, city.name, city.slug, city.county) : null;
  usePageMeta(
    state && city && narrativeForMeta
      ? {
          title: `Vocational and Rehabilitation Experts in ${city.name}, ${state.abbreviation} | KWVRS`,
          description: truncateAtWord(narrativeForMeta.directAnswer),
          canonical: cityUrl,
        }
      : null,
  );

  if (!state) return <Navigate to="/locations" replace />;
  if (loading) return <Loading />;
  if (!city) return <Navigate to={`/locations/${stateSlug}`} replace />;

  const metroLabor = getMetroLabor(stateSlug!, citySlug!);
  const stateLabor = getLaborByState(stateSlug!);
  const labor = metroLabor ?? stateLabor;
  const laborAreaName = metroLabor ? city.name : `${state.name} (statewide)`;
  const courts = getCourtsByState(stateSlug!);
  const regulations = getRegulationsByState(stateSlug!);
  const localContent = getLocalContent(stateSlug!, citySlug!);
  const narrative = getCityNarrative(state, city.name, city.slug, city.county);
  const faqs = cityGeographicFaqs(state.name, city.name);
  const cityIntro = buildCityIntro(city, state);

  // Closest cities by great-circle distance so each page links a distinct,
  // geographically meaningful set (rather than every page linking the same
  // head-of-file cities).
  const nearbyCities = nearestCities(cities, citySlug!, 6);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            slug: `city-${state.slug}-${city.slug}`,
            name: `Vocational and Rehabilitation Expert Services in ${city.name}, ${state.abbreviation}`,
            description: narrative.directAnswer,
            areaServed: { "@type": "City", name: `${city.name}, ${state.abbreviation}` },
          }),
          faqPageSchema(faqs, cityUrl),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Locations", url: `${ORG_URL}/locations` },
            { name: state.name, url: `${ORG_URL}/locations/${state.slug}` },
            { name: city.name, url: cityUrl },
          ]),
        ])}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "Locations", href: "/locations" },
            { label: state.name, href: `/locations/${state.slug}` },
            { label: city.name },
          ]}
        />
      </div>

      {/* Hero */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-teal text-sm font-medium uppercase tracking-widest mb-2">
            {state.name}
          </p>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-3">
            {city.name}, {state.abbreviation}
          </h1>
          <p className="text-neutral-200 text-lg max-w-3xl mb-3">
            {narrative.directAnswer}
          </p>
          <p className="text-neutral-300 text-base max-w-3xl">
            {narrative.blurb}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">

          {/* Main column (2/3) */}
          <div className="lg:col-span-2 space-y-12">

            {/* Intro */}
            <section>
              <p className="text-neutral-700 text-lg leading-relaxed">{cityIntro}</p>
            </section>

            {/* Services: city-level service pages where they exist, state-level otherwise */}
            <CityServiceLinks state={state} city={city} cities={cities} />

            {/* About */}
            <section className="bg-white rounded-xl border border-neutral-200 p-8">
              <h2 className="font-serif text-2xl font-bold text-navy mb-6">
                About {city.name}
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <dt className="text-xs text-neutral-500 uppercase tracking-wider mb-1">County</dt>
                  <dd className="font-semibold text-navy">{city.county}</dd>
                </div>
                {city.msaName && (
                  <div>
                    <dt className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Metropolitan Area</dt>
                    <dd className="font-semibold text-navy text-sm">{city.msaName}</dd>
                  </div>
                )}
              </dl>
              {city.isStateCapital && (
                <p className="mt-4 text-sm text-teal font-medium">
                  State capital of {state.name}
                </p>
              )}
            </section>

            {/* Vocational Rehabilitation regulatory context (state-level) */}
            {regulations && (
              <section className="bg-white rounded-xl border border-neutral-200 p-8">
                <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                  Vocational Rehabilitation in {state.name}
                </h2>
                <p className="text-neutral-600 mb-5 text-sm">
                  Vocational and life care opinions for {city.name} cases account for {state.name}'s regulatory framework and expert evidence standards.
                </p>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold text-navy mb-1">State VR Agency</h3>
                    <p className="text-neutral-700 leading-relaxed">{regulations.vocationalRehabAgency}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Credentialing &amp; Expert Qualification</h3>
                    <p className="text-neutral-700 leading-relaxed">{regulations.licensingRequirements}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Local Market Content */}
            {localContent && (
              <section>
                <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                  {localContent.headline}
                </h2>
                <div className="space-y-4">
                  {localContent.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-neutral-700 leading-relaxed">{para}</p>
                  ))}
                </div>
                {localContent.localCourts && (
                  <div className="mt-6 bg-neutral-50 rounded-xl border border-neutral-200 p-5">
                    <h3 className="font-semibold text-navy text-sm mb-2">Key Courts &amp; Venues</h3>
                    <p className="text-sm text-neutral-600">{localContent.localCourts}</p>
                  </div>
                )}
                {localContent.commonCaseTypes && localContent.commonCaseTypes.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {localContent.commonCaseTypes.map((ct) => (
                      <span key={ct} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/20">
                        {ct}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Related Services */}
            <RelatedServices
              caseTypes={localContent?.commonCaseTypes ?? ["Personal Injury", "Workers' Compensation", "Medical Malpractice"]}
              stateSlug={stateSlug!}
            />

            {/* Frequently asked */}
            <FAQBlock faqs={faqs} title={`Frequently asked: ${city.name} expert services`} />

            {/* Contact CTA */}
            <ContactCTA context={`${city.name}, ${state.abbreviation}`} />
          </div>

          {/* Sidebar (1/3) */}
          <aside className="mt-12 lg:mt-0 space-y-8">

            {/* Labor data: metro-level where available, statewide fallback otherwise */}
            {labor && (
              <LaborDataWidget data={labor} areaName={laborAreaName} />
            )}

            {/* State court system */}
            {courts && (
              <CourtInfoPanel courts={courts} stateName={state.name} />
            )}

            {/* Nearby cities */}
            {nearbyCities.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-navy mb-4">
                  Nearby Cities in {state.name}
                </h3>
                <div className="space-y-2">
                  {nearbyCities.map((nearbyCity) => (
                    <LocationCard
                      key={nearbyCity.slug}
                      name={nearbyCity.name}
                      href={`/locations/${stateSlug}/${nearbyCity.slug}`}
                      subtitle={nearbyCity.county}
                    />
                  ))}
                </div>
                <Link
                  to={`/locations/${stateSlug}`}
                  className="inline-flex items-center gap-1 mt-4 text-sm text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark font-medium"
                >
                  All {state.name} locations <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
