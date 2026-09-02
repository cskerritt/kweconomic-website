import { Link } from "react-router-dom";
import { comparisons } from "@/data/comparisons";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import { truncateAtWord } from "@/lib/text";

// Lead definition: the extractable answer to "how do I choose between two
// experts or two damages measures". Rendered in the hero and reused as the
// CollectionPage description.
const LEAD =
  "Choosing the right expert and the right damages measure is the first decision in an economic damages case, because each measure rests on different records and answers a different question. Each comparison below sets the two side by side, states what each one measures and from which records, and identifies when one applies, when the other does, and where they overlap.";

// Mirrors the private stripLinkMarkers in src/lib/schema.ts: the card is
// already a <Link>, so the [[/route|anchor]] markers in the comparison copy
// collapse to their anchor text rather than rendering as nested anchors.
const stripLinkMarkers = (text: string) => text.replace(/\[\[\/[^|\]]*\|([^\]]+)\]\]/g, "$1");

// Sibling editorial hubs, minus this page.
const LIBRARY_LINKS = [
  { href: "/guides", label: "Practitioner guides" },
  { href: "/compare", label: "Side-by-side comparisons" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/white-papers", label: "White papers" },
  { href: "/knowledge", label: "Knowledge center" },
  { href: "/insights", label: "Insights" },
];

export default function ComparisonsHubPage() {
  const url = `${ORG_URL}/compare`;
  usePageMeta({
    title: `Economic Damages Comparisons for Attorneys | ${ORG_NAME}`,
    description:
      "Side-by-side comparisons: economist vs. forensic accountant, lost earnings vs. earning capacity, lost profits vs. business value, net vs. gross discount rate.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Compare", url: "/compare" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Decision Guides
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Economic Damages Comparisons
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
        </div>
      </div>

      <section aria-labelledby="comparisons-heading">
        <h2 id="comparisons-heading" className="font-serif text-2xl text-navy mb-4">All comparisons</h2>
        {comparisons.length === 0 ? (
          <p className="text-neutral-500">Comparisons coming soon.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link to={`/compare/${c.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
                  <div className="font-semibold text-navy">{c.title}</div>
                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                    {truncateAtWord(stripLinkMarkers(c.overlap), 160)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav aria-label="More from the library" className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="font-serif text-xl text-navy mb-3">More from the library</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LIBRARY_LINKS.filter((l) => l.href !== "/compare").map((l) => (
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
          comparison pages, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "Economic Damages Comparisons",
          description: LEAD,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            "@id": `${url}#list`,
            numberOfItems: comparisons.length,
            itemListElement: comparisons.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.title,
              url: `${url}/${c.slug}`,
            })),
          },
        },
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Compare", url }]),
      ])} />
    </div>
  );
}
