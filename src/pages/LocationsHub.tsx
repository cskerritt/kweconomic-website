import { Link } from "react-router-dom";
import { states } from "@/data/states";
import { usePageMeta } from "@/hooks/use-page-meta";
import ContactCTA from "@/components/ContactCTA";
import UsStateMap from "@/components/UsStateMap";
import LocationSearch from "@/components/LocationSearch";
import OfficeCards from "@/components/OfficeCards";
import SchemaOrg from "@/components/SchemaOrg";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { ORG_NAME, SITE_URL } from "@/lib/brand";

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
            <p className="kw-eyebrow text-amber-light">
              Where We Work
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Forensic Economists in All 50 States, DC, and U.S. Territories
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">{LEAD}</p>
          </div>
        </div>
      </section>

      <OfficeCards />

      {/* Find a location (Chris, 2026-11-25): the three offices above stay in view; every other state, DC and
          territory is one step away on the map or through the ZIP / city search, in place of the state grid and the
          region lists, which together offered too many choices. The map's own list keeps a plain link to every hub. */}
      <section aria-labelledby="find-location-heading" className="py-12 md:py-16 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="find-location-heading" className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3 text-center">
            Find a location
          </h2>
          <p className="text-neutral-600 max-w-[52ch] mx-auto text-center mb-10">
            Search by ZIP code or city, or select a state, DC or a territory on the map.
          </p>
          <LocationSearch />
          <div className="kw-map-area mt-6">
            <UsStateMap />
          </div>

          <nav aria-label="Related resources" className="mt-10 border-t border-neutral-200 pt-6">
            <h2 className="font-serif text-xl font-bold text-navy mb-3">Related resources</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {RELATED_RESOURCES.map((r) => (
                <li key={r.href}>
                  <Link to={r.href} className="font-medium kw-link">
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
