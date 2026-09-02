import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Phone } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { knowledgeGuides } from "@/data/knowledge";
import Reveal from "@/components/Reveal";
import SchemaOrg from "@/components/SchemaOrg";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { ORG_NAME, ORG_PHONE, ORG_PHONE_DISPLAY, SITE_URL, telHref } from "@/lib/brand";

// Lead definition: the extractable answer to "what is in the Knowledge Center".
// Rendered in the hero and reused as the CollectionPage description.
const LEAD =
  "The Knowledge Center holds the long-form guides behind an economic damages report: what a loss claim consists of, which records drive it, and how a defensible figure is built and tested. Each guide is written for attorneys who retain or cross-examine economists and covers the methodology, the governing standards, and the practical considerations for litigation.";

// Sibling editorial hubs, minus this page.
const LIBRARY_LINKS = [
  { href: "/guides", label: "Practitioner guides" },
  { href: "/compare", label: "Side-by-side comparisons" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/white-papers", label: "White papers" },
  { href: "/knowledge", label: "Knowledge center" },
  { href: "/insights", label: "Insights" },
];

export default function KnowledgeHub() {
  const url = `${SITE_URL}/knowledge`;
  usePageMeta({
    title: `Knowledge Center: Economic Damages Guides | ${ORG_NAME}`,
    description:
      "In-depth guides on economic damages, expert witness testimony, and the methods behind a defensible damages figure, written for attorneys who retain economists.",
    canonical: url,
  });

  return (
    <>
      {/* Index-page structured data: CollectionPage (own @id) + ItemList of the
          knowledge guides, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage",
            "@id": `${url}#webpage`,
            url,
            name: "Knowledge Center: Economic Damages Guides for Attorneys",
            description: LEAD,
            isPartOf: { "@id": WEBSITE_ID },
            publisher: { "@id": ORG_ID },
            mainEntity: {
              "@type": "ItemList",
              "@id": `${url}#list`,
              numberOfItems: knowledgeGuides.length,
              itemListElement: knowledgeGuides.map((g, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: g.title,
                url: `${ORG_URL}/knowledge/${g.slug}`,
              })),
            },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Knowledge Center", url },
          ]),
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Knowledge Center" }]} />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Educational Resources
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Knowledge Center: Economic Damages Guides for Attorneys
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">{LEAD}</p>
          </div>
        </div>
      </section>

      {/* Guide grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-serif text-2xl font-bold text-navy">Pillar Guides</h2>
            <p className="mt-2 text-neutral-600">
              Each guide covers a core topic in depth, with sections on methodology, standards,
              and practical considerations for litigation.
            </p>
          </div>

          <Reveal as="div" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {knowledgeGuides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/knowledge/${guide.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 p-6 hover:border-teal hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl font-bold text-navy group-hover:text-teal transition-colors leading-snug mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 font-mono">
                        {guide.sections.length} sections
                      </span>
                      <span className="text-sm text-teal font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read guide <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>

          <nav aria-label="More from the library" className="mt-14 border-t border-neutral-200 pt-6">
            <h2 className="font-serif text-xl font-bold text-navy mb-3">More from the library</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {LIBRARY_LINKS.filter((l) => l.href !== "/knowledge").map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-teal hover:text-teal">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-xl p-8 text-white">
            <h3 className="font-serif text-2xl font-bold mb-2">Questions About Your Case?</h3>
            <p className="text-neutral-300 mb-6">
              The guides here provide general educational background. For analysis specific to your
              matter, contact our team to discuss how {ORG_NAME} can assist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/schedule-consultation"
                className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Schedule a Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={telHref(ORG_PHONE)}
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                {ORG_PHONE_DISPLAY}
              </a>
              <Link
                to="/insights"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Browse Insights
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
