import { Link } from "react-router-dom";
import { methods } from "@/data/methods";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

export default function MethodsHubPage() {
  const url = `${ORG_URL}/methods`;
  usePageMeta({
    title: `Forensic Economics Methods | Present Value, Worklife, Valuation | ${ORG_NAME}`,
    description:
      "The methods behind our economic damages reports: present value and discounting, worklife expectancy, wage growth, fringe benefits, household services, business valuation approaches, lost profits, and mitigation and offsets.",
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
            The methods our economists use to build, discount, and test a damages figure, each explained with its data sources and the questions it answers.
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
        articleSchema({ title: "Methods", description: `${ORG_NAME} economic damages methods.`, url }),
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Methods", url }]),
      ])} />
    </div>
  );
}
