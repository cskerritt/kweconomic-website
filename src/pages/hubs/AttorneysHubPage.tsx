import { Link } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

// Lead definition: the extractable answer to "what does an attorney need from a
// forensic economist at each stage". Rendered in the hero and reused as the
// CollectionPage description.
const LEAD =
  "Stage-by-stage guides for retaining, preparing, and using a forensic economist across each major case type: what the loss claim consists of, which records drive it, and how the number is defended. Pick the stage the matter is at, or start from the case type; each guide lists the actions to take, the records to gather, the pitfalls to avoid, and the questions counsel most often ask at that stage.";

const RELATED_RESOURCES = [
  { href: "/case-types", label: "Case types for economic damages analysis" },
  { href: "/services", label: "Forensic economics and damages services" },
  { href: "/credentials", label: "Credentials of a forensic economist" },
];

export default function AttorneysHubPage() {
  const url = `${ORG_URL}/attorneys`;
  usePageMeta({
    title: `Attorney Resources by Litigation Stage | ${ORG_NAME}`,
    description:
      "Stage-by-stage attorney resources for retaining, preparing, and using a forensic economist: considering, retaining, deposition, and trial, for each case type.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Attorneys", url: "/attorneys" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            For Counsel
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Attorney Resources by Litigation Stage
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
        </div>
      </div>

      {/* Each stage heading links its own index (/attorneys/:stage); the cards
          carry the stage in an aria-label because the visible anchor text (the
          case-type name) repeats under all four headings. */}
      {ATTORNEY_STAGES.map((stage) => (
        <section key={stage.slug} className="mb-8" aria-labelledby={`stage-${stage.slug}`}>
          <h2 id={`stage-${stage.slug}`} className="font-serif text-2xl text-navy mb-4">
            <Link to={`/attorneys/${stage.slug}`} className="hover:text-amber-dark hover:underline underline-offset-4">
              {stage.label}
            </Link>
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {caseTypes.map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/attorneys/${stage.slug}/${c.slug}`}
                  aria-label={`${stage.label}: ${c.name}`}
                  className="block rounded-lg border border-neutral-200 p-3 hover:border-navy hover:shadow transition"
                >
                  <div className="font-semibold text-navy">{c.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

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

      {/* Index-page structured data: CollectionPage (own @id) + ItemList of the
          four stage indexes (this hub's immediate children), with the
          Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "Attorney Resources by Litigation Stage",
          description: LEAD,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            "@id": `${url}#list`,
            numberOfItems: ATTORNEY_STAGES.length,
            itemListElement: ATTORNEY_STAGES.map((stage, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: stage.label,
              url: `${url}/${stage.slug}`,
            })),
          },
        },
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Attorneys", url }]),
      ])} />
    </div>
  );
}
