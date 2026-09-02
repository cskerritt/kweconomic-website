import { Link } from "react-router-dom";
import { states } from "@/data/states";
import { usePageMeta } from "@/hooks/use-page-meta";
import LocationCard from "@/components/LocationCard";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";
import SchemaOrg from "@/components/SchemaOrg";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { ORG_NAME, SITE_URL } from "@/lib/brand";

const REGION_LABELS: Record<string, string> = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest: "Midwest",
  west: "West",
  territory: "Territories & DC",
};

const REGION_ORDER = ["northeast", "southeast", "midwest", "west", "territory"];

// The hero already leads with the definition; it doubles as the
// CollectionPage description so the visible and structured-data summaries agree.
const LEAD = `${ORG_NAME} accepts cases in all 50 states, the District of Columbia, and U.S. territories. Our economists understand each jurisdiction's damages rules, local wage levels and cost of living, and court standards wherever your case is filed.`;

const RELATED_RESOURCES = [
  { href: "/jurisdictions", label: "State and federal jurisdictions served" },
  { href: "/services", label: "Forensic economics and damages services" },
];

export default function LocationsHub() {
  const url = `${SITE_URL}/locations`;
  usePageMeta({
    title: `Forensic Economist by State: All 50 States | ${ORG_NAME}`,
    description:
      "Lost earnings, wrongful death, household services, and business damages analyses in all 50 states, DC, and U.S. territories. Pick a state for venue context.",
    canonical: url,
  });

  const stateOnly = states.filter((s) => s.type === "state");

  const byRegion = REGION_ORDER.map((region) => ({
    region,
    label: REGION_LABELS[region],
    items: states.filter((s) => s.region === region),
  }));

  return (
    <>
      {/* Index-page structured data: CollectionPage (own @id) + ItemList of the
          state pages, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage",
            "@id": `${url}#webpage`,
            url,
            name: "Forensic Economists in All 50 States, DC, and U.S. Territories",
            description: LEAD,
            isPartOf: { "@id": WEBSITE_ID },
            publisher: { "@id": ORG_ID },
            mainEntity: {
              "@type": "ItemList",
              "@id": `${url}#list`,
              numberOfItems: states.length,
              itemListElement: states.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.name,
                url: `${ORG_URL}/locations/${s.slug}`,
              })),
            },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Locations", url },
          ]),
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Locations" }]} />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Where We Work
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Forensic Economists in All 50 States, DC, and U.S. Territories
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">{LEAD}</p>
          </div>
        </div>
      </section>

      {/* State Abbreviation Quick Grid */}
      <section className="py-12 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-navy mb-6 text-center">
            Select a State
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {stateOnly.map((state) => (
              <Link
                key={state.slug}
                to={`/locations/${state.slug}`}
                className="bg-white rounded-lg border border-neutral-200 px-3 py-4 text-center text-sm font-semibold text-navy hover:border-teal hover:text-teal hover:shadow-sm transition-all"
              >
                {state.abbreviation}
                {/* The visible label stays the abbreviation; the hidden span puts
                    the state name in the anchor text for readers and crawlers. */}
                <span className="sr-only">, {state.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* States by Region */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {byRegion.map(({ region, label, items }, ri) => (
            <Reveal key={region} delay={ri * 80}>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-6 pb-2 border-b border-neutral-200">
                {label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((state) => (
                  <LocationCard
                    key={state.slug}
                    name={state.name}
                    href={`/locations/${state.slug}`}
                    subtitle={`${state.abbreviation} - Capital: ${state.capital}`}
                  />
                ))}
              </div>
            </Reveal>
          ))}

          <nav aria-label="Related resources" className="border-t border-neutral-200 pt-6">
            <h2 className="font-serif text-xl font-bold text-navy mb-3">Related resources</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {RELATED_RESOURCES.map((r) => (
                <li key={r.href}>
                  <Link to={r.href} className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-teal hover:text-teal">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
