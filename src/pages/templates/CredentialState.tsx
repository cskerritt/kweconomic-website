import { useParams, Link } from "react-router-dom";
import { credentials, getCredential, type Credential } from "@/data/credentials";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
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
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

// services.ts names credentials as a label set ("Forensic Economist", "NAFE",
// "MBA", "PhD"); credentials.ts keys them by a punctuated, sometimes
// slash-separated abbreviation ("MBA / M.A. / Ph.D."). Compare on letters and
// digits only, and let any part of a slash-separated abbreviation match (same
// rule as CaseTypeHub.tsx). Used for the service x state list only; named
// economists never come from a label match (see `experts` below).
const normalizeCredential = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
const abbreviationParts = (cred: Credential) => cred.abbreviation.split("/").map(normalizeCredential);
const holdsCredential = (labels: string[], cred: Credential) => {
  const parts = abbreviationParts(cred);
  return labels.some((label) => parts.includes(normalizeCredential(label)));
};

// stateReciprocity values are "na" for every credential on this site (no
// state licenses forensic economists); the other labels keep the type honest.
const RECOGNITION_LABEL: Record<Credential["stateReciprocity"][string], (stateName: string) => string> = {
  na: () => "Recognized nationally; no state licensure applies",
  full: (stateName) => `Recognized in ${stateName} by reciprocity`,
  limited: (stateName) => `Recognized in ${stateName} with conditions`,
  none: (stateName) => `Not recognized in ${stateName}`,
};

export default function CredentialState() {
  const { credSlug = "", stateSlug = "" } = useParams();
  const cred = getCredential(credSlug);
  const state = states.find((s) => s.slug === stateSlug);

  const url =
    cred && state ? `${ORG_URL}/credentials/${cred.slug}/${state.slug}` : "";
  usePageMeta(
    cred && state
      ? {
          title: `${cred.abbreviation} Credential in ${state.name} | ${ORG_NAME}`,
          description: `${cred.name} (${cred.abbreviation}): what the credential covers, how it is recognized in ${state.name}, and the forensic economists available for ${state.name} damages matters. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );

  if (!cred || !state) return <NotFound />;

  // Named holders come from the credential's own expertSlugs list and from
  // nowhere else: the membership pages carry an empty list until membership is
  // confirmed (spec 4.3), so no person is ever attached to NAFE or AAEFE here.
  const experts = activeTeam.filter(
    (m) => cred.expertSlugs.includes(m.slug) && m.statesServed.includes(state.abbreviation)
  );
  const regulations = getRegulationsByState(state.slug);
  const courts = getCourtsByState(state.slug);
  const recognition = RECOGNITION_LABEL[cred.stateReciprocity[state.slug] ?? "na"](state.name);

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
        {cred.abbreviation} in {state.name}: what the credential establishes about a damages expert, how {state.name} courts treat it, and how to retain a forensic economist for {state.name} matters.
      </p>

      <section id="recognition" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Recognition and qualification in {state.name}</h2>
        <p className="text-neutral-700 mb-3">{cred.scope}</p>
        <p className="text-neutral-700 mb-3">
          <strong className="text-navy">State recognition:</strong> {recognition}. Qualification to testify on economic damages in {state.name} is decided case by case on education, method, and experience. There is no state license for forensic economists to check, so counsel verify the credential with its issuer and review the economist's testimony record directly.
        </p>
        {regulations && (
          <>
            <p className="text-neutral-700 mb-3">{regulations.practiceContext}</p>
            <p className="text-neutral-700">
              {ORG_NAME} economists apply nationally recognized methods while accounting for {state.name}'s wage levels, venue, and damages rules.
            </p>
          </>
        )}
      </section>

      {courts && (
        <section id="courts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} courts and venues</h2>
          <p className="text-neutral-700 mb-2">
            Economic damages experts testify in {state.name}'s courts, where qualification is decided case by case on education, method, and experience rather than on any single credential.
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
          <h2 className="font-serif text-2xl text-navy mb-2">Our economists with this credential who serve {state.name}</h2>
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
          <h2 className="font-serif text-2xl text-navy mb-2">Forensic economists for {state.name} matters</h2>
          <p className="text-neutral-700">
            {ORG_NAME} provides forensic economists for {state.name} damages matters, including remote consultation, report preparation, and deposition or trial testimony where the case is venued. <Link to="/contact" className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">Contact us</Link> to discuss availability for your matter.
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
              Forensic economists in {state.name}
            </Link>
          </li>
          {pillarServices()
            .filter((s) => holdsCredential(s.relevantCredentials, cred))
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
        credentialSchema({ slug: cred.slug, name: cred.name, abbreviation: cred.abbreviation, category: cred.category, issuer: cred.issuer, issuerUrl: cred.issuerUrl, scope: cred.scope }),
        // Membership-neutral on purpose: the service is the firm's forensic
        // economics work in the state, not a claim that its economists hold
        // the credential (spec 4.3 for the association pages).
        serviceSchema({
          slug: `cred-${cred.slug}-${state.slug}`,
          name: `Forensic Economists for ${state.name} Damages Matters (${cred.abbreviation})`,
          description: `${ORG_NAME} provides forensic economists for ${state.name} damages matters. This page explains ${cred.name} (${cred.abbreviation}) and how ${state.name} courts weigh it.`,
          areaServed: { "@type": "AdministrativeArea", name: state.name },
        }),
        faqPageSchema(cred.faqs.slice(0, 4), url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Credentials", url: `${ORG_URL}/credentials` },
          { name: cred.abbreviation, url: `${ORG_URL}/credentials/${cred.slug}` },
          { name: state.name, url },
        ]),
      ])} />
    </article>
  );
}
