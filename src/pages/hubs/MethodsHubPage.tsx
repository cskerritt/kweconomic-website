import { Link } from "react-router-dom";
import { methods } from "@/data/methods";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

// Lead definition: the extractable answer to "what methods does a forensic
// economist use". Rendered in the hero and reused as the CollectionPage
// description so the visible and structured-data summaries agree.
const LEAD =
  "A forensic economics method is the documented procedure that turns a person's or a business's records into a damages figure: the base earnings or cash flow, the projection period, the growth and discount rates, and the offsets that reduce the loss. Each method page below states what the method answers, the published data it draws on, its limits, and how it has fared when challenged, so counsel on either side can test the figure line by line.";

// Sibling editorial hubs, minus this page. The same list sits in each
// editorial hub so a reader on any index can reach the other five.
const LIBRARY_LINKS = [
  { href: "/guides", label: "Practitioner guides" },
  { href: "/compare", label: "Side-by-side comparisons" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/white-papers", label: "White papers" },
  { href: "/knowledge", label: "Knowledge center" },
  { href: "/insights", label: "Insights" },
];

export default function MethodsHubPage() {
  const url = `${ORG_URL}/methods`;
  usePageMeta({
    title: `Forensic Economics Methods and Damages Models | ${ORG_NAME}`,
    description:
      "The methods behind our economic damages reports: present value, worklife expectancy, wage growth, fringe benefits, household services, valuation, and offsets.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Methods", url: "/methods" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Methodology
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Forensic Economics Methods
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
        </div>
      </div>

      <section aria-labelledby="methods-heading">
        <h2 id="methods-heading" className="font-serif text-2xl text-navy mb-4">All methods</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((m) => (
            <li key={m.slug}>
              <Link to={`/methods/${m.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
                <div className="font-semibold text-navy">{m.name}</div>
                {m.summary && <div className="text-sm text-neutral-600 mt-1 line-clamp-2">{m.summary}</div>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="More from the library" className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="font-serif text-xl text-navy mb-3">More from the library</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LIBRARY_LINKS.filter((l) => l.href !== "/methods").map((l) => (
            <li key={l.href}>
              <Link to={l.href} className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12">
        <ContactCTA />
      </div>

      {/* Index-page structured data: CollectionPage (own @id) + ItemList of the
          method pages, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "Forensic Economics Methods",
          description: LEAD,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            "@id": `${url}#list`,
            numberOfItems: methods.length,
            itemListElement: methods.map((m, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: m.name,
              url: `${url}/${m.slug}`,
            })),
          },
        },
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Methods", url }]),
      ])} />
    </div>
  );
}
