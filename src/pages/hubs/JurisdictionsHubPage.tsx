import { Link } from "react-router-dom";
import { states } from "@/data/states";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

const FEDERAL_CIRCUITS = [
  "First Circuit", "Second Circuit", "Third Circuit", "Fourth Circuit",
  "Fifth Circuit", "Sixth Circuit", "Seventh Circuit", "Eighth Circuit",
  "Ninth Circuit", "Tenth Circuit", "Eleventh Circuit", "D.C. Circuit",
  "Federal Circuit",
];

// Lead definition. Engagements are accepted everywhere; the site does not
// claim testimony has occurred in every venue. Rendered in the hero and reused
// as the CollectionPage description.
const LEAD = `State and federal jurisdictions where ${ORG_NAME} accepts engagements. Venue determines which damages rules, admissibility standard, and collateral source treatment apply, so each state page sets out that context before the economics.`;

export default function JurisdictionsHubPage() {
  const url = `${ORG_URL}/jurisdictions`;
  usePageMeta({
    title: `State and Federal Jurisdictions Served | ${ORG_NAME}`,
    description:
      `${ORG_NAME} prepares economic damages analyses in all 50 states, DC, US territories, and federal courts. Browse by state or federal circuit for venue context.`,
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Jurisdictions", url: "/jurisdictions" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Nationwide Coverage
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            State and Federal Jurisdictions Served
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-serif text-2xl text-navy mb-4">Federal Circuits</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {FEDERAL_CIRCUITS.map((c) => (
            <li key={c} className="text-neutral-700">{c}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-navy mb-4">States & Territories</h2>
        <p className="text-neutral-700 mb-4">
          Each entry opens the state page with its venue context. The{" "}
          <Link to="/locations" className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
            directory of forensic economists by state
          </Link>{" "}
          lists the same states by region.
        </p>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {states.map((s) => (
            <li key={s.slug}>
              <Link to={`/locations/${s.slug}`} className="text-navy font-medium hover:text-amber-dark hover:underline underline-offset-2">{s.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <ContactCTA />
      </div>

      {/* Index-page structured data: CollectionPage (own @id) + ItemList of the
          state pages this hub links, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "State and Federal Jurisdictions Served",
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
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Jurisdictions", url }]),
      ])} />
    </div>
  );
}
