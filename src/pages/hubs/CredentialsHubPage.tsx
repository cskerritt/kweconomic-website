import { Link } from "react-router-dom";
import { credentials } from "@/data/credentials";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function CredentialsHubPage() {
  const url = `${ORG_URL}/credentials`;
  usePageMeta({
    title: "Expert Credentials | CRC, CLCP, CVE, ABVE | KWVRS",
    description:
      "Professional credentials held by KWVRS vocational, economic, and life-care experts: CRC, CLCP, CVE, ABVE Diplomate and Fellow, and more. Scope, requirements, admissibility.",
    canonical: url,
  });
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Credentials", url: "/credentials" }]} />
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8 md:p-10 mb-10">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="relative z-10">
          <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Qualifications
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
            Credentials
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Professional credentials held by KWVRS experts, with details on scope, requirements, and admissibility.
          </p>
        </div>
      </div>
      <div className="mb-8 rounded-lg border border-navy/15 bg-navy/[0.03] p-5">
        <p className="text-sm text-neutral-700 leading-relaxed">
          <strong className="text-navy">New to retaining an expert?</strong> These
          certifications signal that an expert is formally qualified to evaluate things
          like earning capacity, future care needs, or economic loss - and to hold up
          to scrutiny on the stand. More letters after a name isn't automatically
          "better"; what matters is the <strong className="text-navy">right credential
          for your case type</strong>. Not sure which applies?{" "}
          <Link to="/contact" className="text-navy font-medium underline underline-offset-2 hover:text-amber-dark">Ask us and we'll point you to the right discipline</Link>.
        </p>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {credentials.map((c) => (
          <li key={c.slug}>
            <Link to={`/credentials/${c.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
              <div className="font-semibold text-navy">{c.abbreviation}</div>
              <div className="text-sm text-neutral-600 mt-1">{c.name}</div>
            </Link>
          </li>
        ))}
      </ul>

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Credentials", description: "Professional credentials held by KWVRS experts.", url }),
        breadcrumbSchema([{ name: "Home", url: "https://kwvrs.com/" }, { name: "Credentials", url }]),
      ])} />
    </div>
  );
}
