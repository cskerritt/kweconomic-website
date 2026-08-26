import { Link } from "react-router-dom";
import { methods } from "@/data/methods";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function MethodsHubPage() {
  const url = `${ORG_URL}/methods`;
  usePageMeta({
    title: "Expert Methodologies | TSA, LMS, Worklife Expectancy | KWVRS",
    description:
      "Vocational and forensic-economic methodologies used by KWVRS experts: transferable skills analysis, labor market survey, worklife expectancy, present value, and more.",
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
            Methods
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Methodologies KWVRS experts use in vocational, life care planning, and forensic economic analysis.
          </p>
        </div>
      </div>
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

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Methods", description: "KWVRS methodologies.", url }),
        breadcrumbSchema([{ name: "Home", url: "https://kwvrs.com/" }, { name: "Methods", url }]),
      ])} />
    </div>
  );
}
