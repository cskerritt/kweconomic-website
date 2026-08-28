import { Link } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

export default function AttorneysHubPage() {
  const url = `${ORG_URL}/attorneys`;
  usePageMeta({
    title: `Resources for Attorneys | ${ORG_NAME}`,
    description:
      "Stage-by-stage attorney resources for retaining, preparing, and using a forensic economist. Considering, retaining, deposition, and trial.",
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
            Resources for Attorneys
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Stage-by-stage guides for retaining, preparing, and using a forensic economist across each major case type: what the loss claim consists of, which records drive it, and how the number is defended.
          </p>
        </div>
      </div>

      {ATTORNEY_STAGES.map((stage) => (
        <section key={stage.slug} className="mb-8">
          <h2 className="font-serif text-2xl text-navy mb-4">{stage.label}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {caseTypes.map((c) => (
              <li key={c.slug}>
                <Link to={`/attorneys/${stage.slug}/${c.slug}`} className="block rounded-lg border border-neutral-200 p-3 hover:border-navy hover:shadow transition">
                  <div className="font-semibold text-navy">{c.name}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Resources for Attorneys", description: "Stage-by-stage guides for retaining, preparing, and using a forensic economist.", url }),
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Attorneys", url }]),
      ])} />
    </div>
  );
}
