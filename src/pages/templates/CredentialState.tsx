import { useParams, Link } from "react-router-dom";
import { credentials, getCredential } from "@/data/credentials";
import { states } from "@/data/states";
import { services } from "@/data/services";
import { activeTeam } from "@/data/team";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { getCourtsByState } from "@/data/courts/state-courts";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, credentialSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

export default function CredentialState() {
  const { credSlug = "", stateSlug = "" } = useParams();
  const cred = getCredential(credSlug);
  const state = states.find((s) => s.slug === stateSlug);

  const url =
    cred && state ? `${ORG_URL}/credentials/${cred.slug}/${state.slug}` : "";
  usePageMeta(
    cred && state
      ? {
          title: `${cred.abbreviation} Experts in ${state.name} | KWVRS`,
          description: `${cred.name} (${cred.abbreviation}) credential scope, recognition, and experts available for ${state.name} matters. Vocational expert services for plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );

  if (!cred || !state) return <NotFound />;

  const experts = activeTeam.filter(
    (m) => m.statesServed.includes(state.abbreviation) && m.credentials.some((c) => c.toLowerCase() === cred.abbreviation.toLowerCase())
  );
  const regulations = getRegulationsByState(state.slug);
  const courts = getCourtsByState(state.slug);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Credentials", url: "/credentials" },
        { name: cred.abbreviation, url: `/credentials/${cred.slug}` },
        { name: state.name, url: `/credentials/${cred.slug}/${state.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{cred.abbreviation} in {state.name}</h1>
      <AuthorByline />
      <p className="text-lg text-neutral-700 mb-8">
        Licensing and practice information for {cred.name} in {state.name}, and KWVRS experts holding the credential who serve {state.name}.
      </p>

      <section id="recognition" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Recognition and qualification in {state.name}</h2>
        <p className="text-neutral-700 mb-3">{cred.scope}</p>
        {regulations && (
          <>
            <p className="text-neutral-700 mb-3">{regulations.licensingRequirements}</p>
            <p className="text-neutral-700">
              The {regulations.vocationalRehabAgency} administers public vocational rehabilitation in {state.name}. KWVRS {cred.abbreviation}-credentialed experts apply nationally recognized standards while accounting for {state.name}'s practice environment.
            </p>
          </>
        )}
      </section>

      {courts && (
        <section id="courts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} courts and venues</h2>
          <p className="text-neutral-700 mb-2">
            {cred.abbreviation}-credentialed experts provide testimony in {state.name}'s courts, where expert qualification is determined case by case.
          </p>
          <ul className="list-disc ml-5 text-neutral-700 space-y-1">
            {courts.trialCourts.slice(0, 3).map((c) => (
              <li key={c.name}><strong>{c.name}</strong> - {c.description}</li>
            ))}
          </ul>
          <p className="text-sm text-neutral-600 mt-2">
            Highest court: {courts.supremeCourt}.
            {courts.federalDistricts.length > 0 && ` Federal venues: ${courts.federalDistricts.map((d) => d.abbreviation).join(", ")}.`}
          </p>
        </section>
      )}

      {experts.length > 0 ? (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{cred.abbreviation} experts serving {state.name}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experts.map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">{m.name}</Link>
                <span className="text-neutral-600"> - {m.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{cred.abbreviation} experts for {state.name} matters</h2>
          <p className="text-neutral-700">
            KWVRS provides {cred.abbreviation}-credentialed experts for {state.name} cases, including remote consultation and on-site evaluation where required. <Link to="/contact" className="text-teal hover:underline">Contact us</Link> to discuss availability for your matter.
          </p>
        </section>
      )}

      <section id="related-state-pages" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">More {state.name} resources</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li>
            <Link
              to={`/locations/${state.slug}`}
              className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
            >
              Vocational and rehabilitation experts in {state.name}
            </Link>
          </li>
          {services
            .filter((s) => s.relevantCredentials.some((rc) => rc.toLowerCase() === cred.abbreviation.toLowerCase()))
            .map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/services/${s.slug}/${state.slug}`}
                  className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
                >
                  {s.shortName} in {state.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section id="other-credentials" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Other credentials in {state.name}</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {credentials
            .filter((c) => c.slug !== cred.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link
                  to={`/credentials/${c.slug}/${state.slug}`}
                  className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
                >
                  {c.abbreviation} in {state.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <FAQBlock faqs={cred.faqs.slice(0, 4)} />
      <SourcesBlock sources={cred.sources.slice(0, 5)} />

      <SchemaOrg data={graphSchema([
        credentialSchema({ slug: cred.slug, name: cred.name, abbreviation: cred.abbreviation, issuer: cred.issuer, issuerUrl: cred.issuerUrl, scope: cred.scope }),
        serviceSchema({
          slug: `cred-${cred.slug}-${state.slug}`,
          name: `${cred.abbreviation} Vocational Experts in ${state.name}`,
          description: `KWVRS ${cred.abbreviation}-credentialed experts available for ${state.name} matters.`,
          areaServed: { "@type": "AdministrativeArea", name: state.name },
        }),
        faqPageSchema(cred.faqs.slice(0, 4), url),
        breadcrumbSchema([
          { name: "Home", url: "https://kwvrs.com/" },
          { name: "Credentials", url: "https://kwvrs.com/credentials" },
          { name: cred.abbreviation, url: `https://kwvrs.com/credentials/${cred.slug}` },
          { name: state.name, url },
        ]),
      ])} />
    </article>
  );
}
