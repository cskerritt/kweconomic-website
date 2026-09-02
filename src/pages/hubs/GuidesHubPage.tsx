import { Link } from "react-router-dom";
import { guides } from "@/data/guides";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

// Lead definition: the extractable answer to "what is in a practitioner guide".
// Rendered in the hero and reused as the CollectionPage description.
const LEAD =
  "A practitioner guide walks through one damages question from the economist's standpoint: what the claim consists of, which records drive it, how the number is built, and where it is tested at deposition and trial. The guides below cover lost earnings, wrongful death, household services, present value, expert disclosure, business valuation, lost profits, and rebutting an opposing report, for attorneys on either side of the claim.";

// Sibling editorial hubs, minus this page.
const LIBRARY_LINKS = [
  { href: "/guides", label: "Practitioner guides" },
  { href: "/compare", label: "Side-by-side comparisons" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/white-papers", label: "White papers" },
  { href: "/knowledge", label: "Knowledge center" },
  { href: "/insights", label: "Insights" },
];

export default function GuidesHubPage() {
  const url = `${ORG_URL}/guides`;
  usePageMeta({
    title: `Forensic Economics Guides for Attorneys | ${ORG_NAME}`,
    description:
      "Practitioner guides on lost earnings, wrongful death damages, household services, present value, expert disclosure, valuation, and rebutting a damages report.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Guides", url: "/guides" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Practitioner Guides
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Guides for Attorneys
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
        </div>
      </div>

      <section aria-labelledby="guides-heading">
        <h2 id="guides-heading" className="font-serif text-2xl text-navy mb-4">All guides</h2>
        {guides.length === 0 ? (
          <p className="text-neutral-500">Guides coming soon.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link to={`/guides/${g.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
                  <div className="font-semibold text-navy">{g.title}</div>
                  <div className="text-sm text-neutral-600 mt-1 line-clamp-2">{g.tldr}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav aria-label="More from the library" className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="font-serif text-xl text-navy mb-3">More from the library</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LIBRARY_LINKS.filter((l) => l.href !== "/guides").map((l) => (
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
          guide pages, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "Guides for Attorneys",
          description: LEAD,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            "@id": `${url}#list`,
            numberOfItems: guides.length,
            itemListElement: guides.map((g, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: g.title,
              url: `${url}/${g.slug}`,
            })),
          },
        },
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Guides", url }]),
      ])} />
    </div>
  );
}
