import { Link } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

export default function CaseTypesHubPage() {
  const url = `${ORG_URL}/case-types`;
  usePageMeta({
    title: `Case Types | ${ORG_NAME}`,
    description:
      "Economic damages analysis across the most common civil and commercial case types: personal injury, wrongful death, employment, commercial disputes, divorce, fraud, and more.",
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
            Case Types
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            {ORG_NAME} prepares economic damages analyses across the most common case types in civil and commercial litigation.
          </p>
        </div>
      </div>
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

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Case Types", description: "Directory of case types our forensic economists support.", url }),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Case Types", url },
        ]),
      ])} />
    </div>
  );
}
