import { Link } from "react-router-dom";
import { states } from "@/data/states";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

const FEDERAL_CIRCUITS = [
  "First Circuit", "Second Circuit", "Third Circuit", "Fourth Circuit",
  "Fifth Circuit", "Sixth Circuit", "Seventh Circuit", "Eighth Circuit",
  "Ninth Circuit", "Tenth Circuit", "Eleventh Circuit", "D.C. Circuit",
  "Federal Circuit",
];

export default function JurisdictionsHubPage() {
  const url = `${ORG_URL}/jurisdictions`;
  usePageMeta({
    title: "Jurisdictions | KWVRS Nationwide Expert Services",
    description:
      "KWVRS provides vocational, economic, and life-care expert services in all 50 states, DC, US territories, and across federal courts. Browse by state or federal circuit.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Jurisdictions", url: "/jurisdictions" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Nationwide Coverage
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Jurisdictions
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            State and federal jurisdictions where KWVRS experts practice.
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="font-serif text-2xl text-navy mb-4">Federal Circuits</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {FEDERAL_CIRCUITS.map((c) => (
            <li key={c} className="text-neutral-700">{c}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-navy mb-4">States & Territories</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {states.map((s) => (
            <li key={s.slug}>
              <Link to={`/locations/${s.slug}`} className="text-navy font-medium hover:text-amber-dark hover:underline underline-offset-2">{s.name}</Link>
            </li>
          ))}
        </ul>
      </section>

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Jurisdictions", description: "Federal and state jurisdictions KWVRS serves.", url }),
        breadcrumbSchema([{ name: "Home", url: "https://kwvrs.com/" }, { name: "Jurisdictions", url }]),
      ])} />
    </div>
  );
}
