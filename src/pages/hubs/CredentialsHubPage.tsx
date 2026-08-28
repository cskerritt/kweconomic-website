import { Link } from "react-router-dom";
import { credentials } from "@/data/credentials";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

export default function CredentialsHubPage() {
  const url = `${ORG_URL}/credentials`;
  usePageMeta({
    title: `Credentials of a Forensic Economist | ${ORG_NAME}`,
    description:
      "What qualifies a forensic economist to testify on damages: graduate training in economics and finance, the professional standards of NAFE and AAEFE, and a record of reports and testimony. No state license applies.",
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
            Credentials of a Forensic Economist
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">
            Economic damages testimony does not rest on a state license. It rests on graduate training in
            economics and finance, on the published standards of the profession's associations, and on a
            record of reports and testimony that have held up under cross-examination. These pages set out
            each of those foundations, what it does and does not establish, and how courts weigh it.
          </p>
        </div>
      </div>
      <div className="mb-8 rounded-lg border border-navy/15 bg-navy/[0.03] p-5">
        <p className="text-sm text-neutral-700 leading-relaxed">
          <strong className="text-navy">New to retaining an economist?</strong> No state licenses
          forensic economists, so there is no license number to look up. Ask three questions instead:
          what graduate training the economist has, whether the report follows the disclosure and
          ethics standards of the forensic economics associations, and how the economist has fared at
          deposition and trial. Membership in an association is an affiliation, not a certification, and
          a degree matters only as far as it covers the{" "}
          <strong className="text-navy">methods the report actually uses</strong>. Not sure what to ask?{" "}
          <Link to="/contact" className="text-navy font-medium underline underline-offset-2 hover:text-amber-dark">Ask us and we will walk you through it</Link>.
        </p>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {credentials.map((c) => (
          <li key={c.slug}>
            <Link to={`/credentials/${c.slug}`} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
              <div className="font-semibold text-navy">{c.name}</div>
              {c.abbreviation !== c.name && (
                <div className="text-sm text-neutral-600 mt-1">{c.abbreviation}</div>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <SchemaOrg data={graphSchema([
        articleSchema({ title: "Credentials of a Forensic Economist", description: "What qualifies a forensic economist to testify on damages: graduate training, professional standards, and testimony history.", url }),
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Credentials", url }]),
      ])} />
    </div>
  );
}
