import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { insightPosts, insightCategories } from "@/data/insights";
import Reveal from "@/components/Reveal";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { ORG_NAME, SITE_URL } from "@/lib/brand";

// Format an ISO "YYYY-MM-DD" as a calendar date. `new Date("2026-08-27")`
// parses as UTC midnight, which toLocaleDateString renders as August 26 for
// every US visitor; the visible date must match the datePublished in the
// post's JSON-LD and the sitemap lastmod, so the parts are read as local
// calendar fields instead.
function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  Legal: "bg-navy/10 text-navy",
  Economics: "bg-amber/10 text-amber-dark",
  Valuation: "bg-forest/10 text-forest",
};

// Lead definition: the extractable answer to "what are the Insights articles".
// Rendered in the hero and reused as the CollectionPage description.
const LEAD = `Insights are shorter articles on the questions that recur in economic damages work: what a damages report contains, how expert testimony on damages is admitted, and how valuation and forensic accounting evidence is built and tested. They are written by the economists at ${ORG_NAME} for attorneys on both sides of a damages claim.`;

// Sibling editorial hubs, minus this page.
const LIBRARY_LINKS = [
  { href: "/guides", label: "Practitioner guides" },
  { href: "/compare", label: "Side-by-side comparisons" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/white-papers", label: "White papers" },
  { href: "/knowledge", label: "Knowledge center" },
  { href: "/insights", label: "Insights" },
];

export default function InsightsHub() {
  const url = `${SITE_URL}/insights`;
  usePageMeta({
    title: `Economic Damages Insights and Articles | ${ORG_NAME}`,
    description:
      `Articles on economic damages, business valuation, forensic accounting, and expert witness standards, written by the economists at ${ORG_NAME} for attorneys.`,
    canonical: url,
  });

  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? insightPosts
      : insightPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Index-page structured data: CollectionPage (own @id) + ItemList of
          every post (not just the filtered view), with the Organization and
          WebSite nodes the references resolve to. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage",
            "@id": `${url}#webpage`,
            url,
            name: "Insights on Economic Damages and Expert Testimony",
            description: LEAD,
            isPartOf: { "@id": WEBSITE_ID },
            publisher: { "@id": ORG_ID },
            mainEntity: {
              "@type": "ItemList",
              "@id": `${url}#list`,
              numberOfItems: insightPosts.length,
              itemListElement: insightPosts.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.title,
                url: `${ORG_URL}/insights/${p.slug}`,
              })),
            },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Insights", url },
          ]),
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Insights" }]} />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Articles &amp; Analysis
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Insights on Economic Damages and Expert Testimony
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">{LEAD}</p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {insightCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-navy text-white"
                    : "bg-white text-neutral-600 border border-neutral-300 hover:border-navy hover:text-navy"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Post grid */}
          <Reveal as="div" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                to={`/insights/${post.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 hover:border-teal hover:shadow-md transition-all flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        categoryColors[post.category] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {post.category}
                    </span>
                    <time dateTime={post.publishedDate} className="text-xs text-neutral-500 font-mono">
                      {formatIsoDate(post.publishedDate)}
                    </time>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-navy group-hover:text-teal transition-colors leading-snug mb-3 flex-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="text-sm text-teal font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </Reveal>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-neutral-500">
              No posts in this category yet.
            </div>
          )}

          <nav aria-label="More from the library" className="mt-14 border-t border-neutral-200 pt-6">
            <h2 className="font-serif text-xl font-bold text-navy mb-3">More from the library</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {LIBRARY_LINKS.filter((l) => l.href !== "/insights").map((l) => (
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
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
