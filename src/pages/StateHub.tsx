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
import { ORG_NAME } from "@/lib/brand";
import { placeName } from "@/data/geo-prose.mjs";
import FAQBlock from "@/components/FAQBlock";
import { getStateNarrative } from "@/data/narratives";
import { stateGeographicFaqs } from "@/data/geographicFaqs";
import { getStateBySlug } from "@/data/states";
import { pillarServices } from "@/data/services";
import { caseTypes } from "@/data/caseTypes";
import { credentials } from "@/data/credentials";
import { useStateCities } from "@/hooks/use-state-cities";
import { getCourtsByState } from "@/data/courts/state-courts";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { getLocalContent } from "@/data/local-content";
import { usePageMeta } from "@/hooks/use-page-meta";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import ServiceCard from "@/components/ServiceCard";
import LocationCard from "@/components/LocationCard";
import EconomicContextWidget from "@/components/EconomicContextWidget";
import CourtInfoPanel from "@/components/CourtInfoPanel";
import ContactCTA from "@/components/ContactCTA";
import { Award, Users } from "lucide-react";
import type { State } from "@/types";

// Hero eyebrow. The District of Columbia is a federal district (type
// "district"); it carries region "territory" in states.ts only so that the
// directory groups it with the territories, so the label branches on type
// before the region fallback. Every state reads its region name.
function jurisdictionLabel(state: State): string {
  if (state.type === "district") return "Federal District";
  if (state.region === "territory") return "U.S. Territory";
  return state.region.charAt(0).toUpperCase() + state.region.slice(1);
}

export default function StateHub() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const state = stateSlug ? getStateBySlug(stateSlug) : undefined;

  usePageMeta(
    state
      ? {
          title: `Forensic Economists in ${placeName(state.name)} | ${ORG_NAME}`,
          description: `${ORG_NAME} prepares lost earnings, wrongful death, household services, employment, and business damages analyses and expert testimony throughout ${placeName(state.name)}. Projections anchored to ${state.name} wage data; reports written for ${state.name} courts.`,
          canonical: `${ORG_URL}/locations/${state.slug}`,
        }
      : null,
  );

  // Lazy-loaded per-state cities (secondary directory list; fills in on load).
  const { cities } = useStateCities(stateSlug);

  if (!state) {
    return <Navigate to="/locations" replace />;
  }

  // Every pillar has a service x state page; testimony is a mode of each
  // engagement rather than a card of its own.
  const coreServices = pillarServices();

  const courts = getCourtsByState(state.slug);
  const regulations = getRegulationsByState(state.slug);
  const localContent = getLocalContent(state.slug);
  const narrative = getStateNarrative(state);
  const faqs = stateGeographicFaqs(state.name);
  const stateUrl = `${ORG_URL}/locations/${state.slug}`;
  // "the District of Columbia" after in/across and as a possessive; states
  // as-is. Attributive slots ("District of Columbia courts") keep state.name.
  const place = placeName(state.name);


  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          serviceSchema({
            slug: `state-${state.slug}`,
            name: `Economic Damages Services in ${place}`,
            description: narrative.directAnswer,
            areaServed: { "@type": "AdministrativeArea", name: state.name },
          }),
          faqPageSchema(faqs, stateUrl),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Locations", url: `${ORG_URL}/locations` },
            { name: state.name, url: stateUrl },
          ]),
        ])}
      />
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <BreadcrumbNav
              items={[
                { label: "Locations", href: "/locations" },
                { label: state.name },
              ]}
            />
          </div>
          <div className="max-w-3xl">
            <p className="text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
              {jurisdictionLabel(state)} &middot; {state.abbreviation}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
              Forensic Economists in {place}
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed mb-3">
              {narrative.directAnswer}
            </p>
            <p className="text-base text-neutral-300 leading-relaxed">
              {narrative.economicContext}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Column (2/3) */}
          <main className="lg:col-span-2 space-y-12">

            {/* Services Grid */}
            <section>
              <div className="mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-2">
                  Expert Services in {place}
                </h2>
                <p className="text-neutral-600">
                  Our forensic economists prepare lost earnings, wrongful death, household services, employment, and business damages analyses and rebuttals for {state.name} litigation. Each projection is anchored to the plaintiff's own records and to {state.name} wage data, and written to the jurisdiction's expert evidence standards.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {coreServices.map((service) => (
                  <ServiceCard
                    key={service.slug}
                    name={service.name}
                    shortName={service.shortName}
                    description={service.description}
                    icon={service.icon}
                    href={`/services/${service.slug}/${state.slug}`}
                  />
                ))}
              </div>
            </section>

            {/* Cities / Locations */}
            {cities.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-2">
                    Cities We Serve in {place}
                  </h2>
                  <p className="text-neutral-600">
                    {ORG_NAME} accepts cases from attorneys across {place}. Select a city for local wage-market and venue context.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cities.map((city) => (
                    <LocationCard
                      key={city.slug}
                      name={city.name}
                      href={`/locations/${state.slug}/${city.slug}`}
                      subtitle={city.county}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Venue / oversight section */}
            {regulations && (
              <section>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-2">
                    Where {state.name} Damages Claims Are Litigated
                  </h2>
                  <p className="text-neutral-600">
                    An economic damages report is written for the forum that will examine it and around the damages rules that forum applies. Our economists are familiar with {place}'s civil and compensation forums, its expert evidence standards, and the disclosure practice that governs how reports are exchanged.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Damages framework */}
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Users className="w-5 h-5 text-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Damages Framework</h3>
                        <p className="text-neutral-700 text-sm leading-relaxed">{regulations.damagesContext}</p>
                      </div>
                    </div>
                  </div>

                  {/* Workers' compensation forum */}
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-5 h-5 text-teal" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-navy mb-1">Workers' Compensation Forum</h3>
                        <p className="text-neutral-700 text-sm leading-relaxed">{regulations.compensationForum}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* Case-type pages for this state */}
            <section>
              <div className="mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-2">
                  Case Types We Support in {place}
                </h2>
                <p className="text-neutral-600">
                  Case-specific guidance on what the economic loss claim consists of and how the analysis is built for {state.name} matters.
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {caseTypes.map((ct) => (
                  <li key={ct.slug}>
                    <Link
                      to={`/case-types/${ct.slug}/${state.slug}`}
                      className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
                    >
                      {ct.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Credential pages for this state */}
            <section>
              <div className="mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-2">
                  Expert Credentials in {place}
                </h2>
                <p className="text-neutral-600">
                  How each credential is recognized in {state.name} courts and how it bears on economic damages testimony there.
                </p>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {credentials.map((cred) => (
                  <li key={cred.slug}>
                    <Link
                      to={`/credentials/${cred.slug}/${state.slug}`}
                      className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
                    >
                      {cred.abbreviation} ({cred.name})
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Local Market Content */}
            {localContent && (
              <section>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-4">
                  {localContent.headline}
                </h2>
                <div className="prose prose-neutral max-w-none space-y-4">
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

            {/* Frequently asked */}
            <section>
              <div className="mb-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-2">
                  Frequently asked: {state.name} expert services
                </h2>
                <p className="text-neutral-600">
                  {narrative.legalContext}
                </p>
              </div>
              <FAQBlock faqs={faqs} />
            </section>

            {/* Contact CTA */}
            <ContactCTA context={`${state.name} cases`} />
          </main>

          {/* Sidebar (1/3) */}
          <aside className="lg:col-span-1 space-y-6">

            {/* Economic context */}
            <EconomicContextWidget
              areaName={state.name}
              population={state.population}
              compensationForum={regulations?.compensationForum}
            />

            {/* Court Info Panel */}
            {courts && (
              <CourtInfoPanel courts={courts} stateName={state.name} />
            )}

            {/* State Quick Facts */}
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
              <h3 className="font-serif text-lg font-semibold text-navy mb-4">{state.name} Quick Facts</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Abbreviation</dt>
                  <dd className="font-medium text-navy">{state.abbreviation}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Capital</dt>
                  <dd className="font-medium text-navy">{state.capital}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Largest City</dt>
                  <dd className="font-medium text-navy">{state.largestCity}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
