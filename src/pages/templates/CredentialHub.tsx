import { useParams, Link } from "react-router-dom";
import { truncateAtWord } from "@/lib/text";
import { credentials, getCredential } from "@/data/credentials";
import PaginateNav from "@/components/PaginateNav";
import { activeTeam } from "@/data/team";
import { states } from "@/data/states";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, credentialSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

export default function CredentialHub() {
  const { slug = "" } = useParams();
  const cred = getCredential(slug);
  const url = cred ? `${ORG_URL}/credentials/${cred.slug}` : "";
  usePageMeta(
    cred
      ? {
          title: `${cred.abbreviation} Credential | ${cred.name} | ${ORG_NAME}`,
          description: truncateAtWord(cred.scope ?? cred.name),
          canonical: url,
        }
      : null,
  );
  if (!cred) return <NotFound />;
  const idx = credentials.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? { label: credentials[idx - 1].abbreviation, href: `/credentials/${credentials[idx - 1].slug}` } : undefined;
  const next = idx < credentials.length - 1 ? { label: credentials[idx + 1].abbreviation, href: `/credentials/${credentials[idx + 1].slug}` } : undefined;
  const experts = activeTeam.filter((m) => m.credentials.some((c) => c.toLowerCase() === cred.abbreviation.toLowerCase()));

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Credentials", url: "/credentials" },
        { name: cred.abbreviation, url: `/credentials/${cred.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{cred.name} ({cred.abbreviation})</h1>
      <AuthorByline />
      <p className="text-lg text-neutral-700 mb-8">{cred.scope}</p>

      {cred.issuer && (
        <section id="issuer" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Issued by</h2>
          <p className="text-neutral-700">
            {cred.issuerUrl ? (
              <a href={cred.issuerUrl} target="_blank" rel="noopener" className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                {cred.issuer}
              </a>
            ) : cred.issuer}
          </p>
        </section>
      )}

      {cred.requirements.length > 0 && (
        <section id="requirements" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Requirements</h2>
          <ul className="list-disc ml-5 text-neutral-700">
            {cred.requirements.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>
      )}

      {cred.admissibilityHistory && (
        <section id="daubert" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Admissibility</h2>
          <p className="text-neutral-700">{cred.admissibilityHistory}</p>
        </section>
      )}

      {experts.length > 0 && (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Our planners holding {cred.abbreviation}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experts.map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">{m.name}</Link>
                <span className="text-neutral-600"> - {m.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="by-state" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">{cred.abbreviation} by state</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {states.map((s) => (
            <li key={s.slug}>
              <Link to={`/credentials/${cred.slug}/${s.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                {cred.abbreviation} in {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FAQBlock faqs={cred.faqs} />
      <SourcesBlock sources={cred.sources} />
      <PaginateNav prev={prev} next={next} backHref="/credentials" backLabel="All credentials" />

      <SchemaOrg data={graphSchema([
        credentialSchema({
          slug: cred.slug, name: cred.name, abbreviation: cred.abbreviation,
          issuer: cred.issuer, issuerUrl: cred.issuerUrl, scope: cred.scope,
        }),
        faqPageSchema(cred.faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Credentials", url: `${ORG_URL}/credentials` },
          { name: cred.abbreviation, url },
        ]),
      ])} />
    </article>
  );
}
