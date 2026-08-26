import { Link } from "react-router-dom";
import { comparisons } from "@/data/comparisons";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function ComparisonsHubPage() {
  const url = `${ORG_URL}/compare`;
  usePageMeta({
    title: "Expert Witness Comparisons | KWVRS",
    description:
      "Side-by-side comparisons of expert services, methodologies, and credentials. FCE vs IME, vocational expert vs SSA VE, and more.",
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
            Comparisons
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Side-by-side comparisons of expert disciplines, credentials, and methodologies to help attorneys select the right resource.
          </p>
        </div>
      </div>
      {comparisons.length === 0 ? (
        <p className="text-neutral-500">Comparisons coming soon.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c) => (
            <li key={c.slug}>
              <Link to={`/compare/${c.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
                <div className="font-semibold text-navy">{c.title}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Comparisons", description: "KWVRS expert discipline comparisons.", url }),
        breadcrumbSchema([{ name: "Home", url: "https://kwvrs.com/" }, { name: "Compare", url }]),
      ])} />
    </div>
  );
}
