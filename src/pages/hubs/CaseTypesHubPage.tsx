import { Link } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

// Lead definition: the extractable answer to "which case types call for a
// forensic economist". Rendered in the hero and reused as the CollectionPage
// description so the visible and structured-data summaries agree.
const LEAD = `The case type fixes what an economic damages claim consists of: in an injury or death matter, the earnings, benefits, and household services a person would have provided; in an employment, commercial, or family matter, the wages, profits, cash flows, or business value at issue. ${ORG_NAME} prepares the analysis for plaintiff and defense counsel alike, and each page below sets out the components of the claim, the records that drive it, and how the number is built.`;

const RELATED_RESOURCES = [
  { href: "/attorneys", label: "Attorney resources by litigation stage" },
  { href: "/credentials", label: "Credentials of a forensic economist" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/compare", label: "Expert and method comparisons" },
];

export default function CaseTypesHubPage() {
  const url = `${ORG_URL}/case-types`;
  usePageMeta({
    title: `Case Types for Economic Damages Analysis | ${ORG_NAME}`,
    description:
      "Economic damages analysis for personal injury, wrongful death, employment, commercial, divorce, and fraud cases: what the loss claim is and how it is built.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Case Types", url: "/case-types" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Practice Areas
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Case Types We Analyze
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
        </div>
      </div>

      <section aria-labelledby="case-types-heading">
        <h2 id="case-types-heading" className="font-serif text-2xl text-navy mb-4">Browse case types</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseTypes.map((c) => (
            <li key={c.slug}>
              <Link to={`/case-types/${c.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
                <div className="font-semibold text-navy">{c.name}</div>
                {c.summary && <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{c.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Related resources" className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="font-serif text-xl text-navy mb-3">Related resources</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {RELATED_RESOURCES.map((r) => (
            <li key={r.href}>
              <Link to={r.href} className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12">
        <ContactCTA />
      </div>

      {/* Index-page structured data: a CollectionPage with its own @id (so it
          does not collide with the prerender shell's un-id'd WebPage node)
          whose mainEntity is the ItemList of child pages, plus the Organization
          and WebSite nodes that the publisher / isPartOf references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "Case Types We Analyze",
          description: LEAD,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            "@id": `${url}#list`,
            numberOfItems: caseTypes.length,
            itemListElement: caseTypes.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.name,
              url: `${url}/${c.slug}`,
            })),
          },
        },
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Case Types", url },
        ]),
      ])} />
    </div>
  );
}
