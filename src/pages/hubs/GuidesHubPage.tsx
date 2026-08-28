import { Link } from "react-router-dom";
import { guides } from "@/data/guides";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

export default function GuidesHubPage() {
  const url = `${ORG_URL}/guides`;
  usePageMeta({
    title: `Forensic Economics Guides for Attorneys | ${ORG_NAME}`,
    description:
      "In-depth practitioner guides on lost earnings, wrongful death damages, household services, present value, expert disclosure and admissibility, business valuation, lost profits, and rebutting an economic report.",
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
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            In-depth guides on economic damages, business valuation, forensic accounting, and expert witness practice, written for the attorneys who retain and cross-examine economists.
          </p>
        </div>
      </div>
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

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Guides for Attorneys", description: `In-depth economic damages guides from ${ORG_NAME}.`, url }),
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Guides", url }]),
      ])} />
    </div>
  );
}
