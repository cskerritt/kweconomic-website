import { Link } from "react-router-dom";
import { credentials } from "@/data/credentials";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";

// The hero already leads with the definition; it doubles as the
// CollectionPage description so the visible and structured-data summaries agree.
const LEAD =
  "Economic damages testimony does not rest on a state license. It rests on graduate training in economics and finance, on the published standards of the profession's associations, and on a record of reports and testimony that have held up under cross-examination. These pages set out each of those foundations, what it does and does not establish, and how courts weigh it.";

const RELATED_RESOURCES = [
  { href: "/case-types", label: "Case types for economic damages analysis" },
  { href: "/services", label: "Forensic economics and damages services" },
  { href: "/attorneys", label: "Attorney resources by litigation stage" },
];

export default function CredentialsHubPage() {
  const url = `${ORG_URL}/credentials`;
  usePageMeta({
    title: `Credentials of a Forensic Economist | ${ORG_NAME}`,
    description:
      "What qualifies a forensic economist to testify on damages: graduate training, the standards of the forensic economics associations, and a testimony record.",
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
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 leading-relaxed max-w-2xl">{LEAD}</p>
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

      <section aria-labelledby="credentials-heading">
        <h2 id="credentials-heading" className="font-serif text-2xl text-navy mb-4">The credentials</h2>
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
      </section>

      <nav aria-label="Related resources" className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="font-serif text-xl text-navy mb-3">Related resources</h2>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {RELATED_RESOURCES.map((r) => (
            <li key={r.href}>
              <Link to={r.href} className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-12">
        <ContactCTA />
      </div>

      {/* Index-page structured data: CollectionPage (own @id) + ItemList of the
          credential pages, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg data={graphSchema([
        organizationSchema(),
        websiteSchema(),
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          url,
          name: "Credentials of a Forensic Economist",
          description: LEAD,
          isPartOf: { "@id": WEBSITE_ID },
          publisher: { "@id": ORG_ID },
          mainEntity: {
            "@type": "ItemList",
            "@id": `${url}#list`,
            numberOfItems: credentials.length,
            itemListElement: credentials.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.name,
              url: `${url}/${c.slug}`,
            })),
          },
        },
        breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }, { name: "Credentials", url }]),
      ])} />
    </div>
  );
}
