import { placeName, placeAttr } from "@/data/geo-prose.mjs";
import { useParams, Link } from "react-router-dom";
import {
  credentials,
  getCredential,
  credentialStateAngle,
  credentialStateHeadings,
  type Credential,
} from "@/data/credentials";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { activeTeam } from "@/data/team";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { getCourtsByState, selectTrialCourts, courtSystemLabel } from "@/data/courts/state-courts";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import NextSteps from "@/components/NextSteps";
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

const LINK = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

export default function CredentialState() {
  const { credSlug = "", stateSlug = "" } = useParams();
  const cred = getCredential(credSlug);
  const state = states.find((s) => s.slug === stateSlug);

  const url =
    cred && state ? `${ORG_URL}/credentials/${cred.slug}/${state.slug}` : "";
  // Title, H1, and description are keyed on the credential's category
  // (credentials.ts) and wrapped in template literals so the prerender parity
  // guard can slot them.
  const headings = cred && state ? credentialStateHeadings(cred, state.name) : undefined;
  usePageMeta(
    headings
      ? {
          title: `${headings.title}`,
          description: `${headings.description}`,
          canonical: url,
        }
      : null,
  );

  if (!cred || !state || !headings) return <NotFound />;

  const place = placeName(state.name);
  const attr = placeAttr(state.name);
  // Named holders come from the credential's own expertSlugs list and from
  // nowhere else: the membership pages carry an empty list until membership is
  // confirmed (spec 4.3), so no person is ever attached to NAFE or AAEFE here.
  // The same switch decides the byline: a named reviewer only where the
  // credential names him, the editorial byline on the membership pages.
  const experts = activeTeam.filter(
    (m) => cred.expertSlugs.includes(m.slug) && m.statesServed.includes(state.abbreviation)
  );
  const reviewer = activeTeam.find((m) => cred.expertSlugs.includes(m.slug));
  const regulations = getRegulationsByState(state.slug);
  const courts = getCourtsByState(state.slug);
  const trialCourts = courts ? selectTrialCourts(courts, "general") : [];
  const federalVenues = courts?.federalDistricts ?? [];
  const recognition = RECOGNITION_LABEL[cred.stateReciprocity[state.slug] ?? "na"](state.name);
  const expertStandard =
    regulations?.expertStandard ??
    `Qualification to testify on economic damages in ${place} is decided case by case on education, method, and experience.`;
  const verification = "There is no state license for forensic economists to check, so counsel verify the credential with its issuer and review the economist's testimony record directly.";

  // One FAQ that exists only for this state; the hub's own FAQs are linked,
  // not repeated, so the FAQPage node is not a duplicate of the hub's.
  const localFaqs = [
    {
      question: `How do ${attr} courts qualify a forensic economist?`,
      answer: `${expertStandard} ${recognition}. ${verification}`,
    },
  ];

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Credentials", url: "/credentials" },
        { name: cred.abbreviation, url: `/credentials/${cred.slug}` },
        { name: state.name, url: `/credentials/${cred.slug}/${state.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{headings.h1}</h1>
      <AuthorByline slug={reviewer?.slug} datePublished={cred.datePublished} dateModified={cred.dateModified} />
      <p className="text-lg text-neutral-700 mb-8">
        {expertStandard} {cred.stateLead}
      </p>

      <section id="recognition" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Recognition and qualification in {place}</h2>
        <p className="text-neutral-700 mb-3">
          <strong className="text-navy">State recognition:</strong> {recognition}. {verification}
        </p>
        <p className="text-neutral-700 mb-3">{credentialStateAngle(cred, state.name)}</p>
        <p className="text-neutral-700">
          {ORG_NAME} economists apply nationally recognized methods while accounting for {place}&#x27;s wage levels, venue, and damages rules.
        </p>
      </section>

      {courts && (
        <section id="courts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} courts and venues</h2>
          <p className="text-neutral-700 mb-2">
            Economic damages experts testify in {place}&#x27;s courts, where qualification is decided case by case on education, method, and experience rather than on any single credential.
          </p>
          <ul className="list-disc ml-5 text-neutral-700 space-y-1">
            {trialCourts.map((c) => (
              <li key={c.name}><strong>{c.name}</strong> - {c.description}</li>
            ))}
          </ul>
          <p className="text-sm text-neutral-600 mt-2">
            Highest court: {courts.supremeCourt}.
            {federalVenues.length > 0 && ` Federal venues: ${federalVenues.map((d) => d.abbreviation).join(", ").replace(/\.$/, "")}.`}
            {courts.filingPortalUrl && (
              <>
                {" "}Court system:{" "}
                <a href={courts.filingPortalUrl} rel="noopener" target="_blank" className={LINK}>
                  {courtSystemLabel(courts.filingPortalUrl)}
                </a>
                .
              </>
            )}
          </p>
          {courts.venueNote && <p className="text-sm text-neutral-600 mt-1">{courts.venueNote}</p>}
        </section>
      )}

      {experts.length > 0 ? (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Our economists with this credential who serve {place}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experts.map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className={LINK}>{m.name}</Link>
                <span className="text-neutral-600"> - {m.title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Forensic economists for {state.name} matters</h2>
          <p className="text-neutral-700">
            {ORG_NAME} provides forensic economists for {state.name} damages matters, including remote consultation, report preparation, and deposition or trial testimony where the case is venued. <Link to="/contact" className={LINK}>Contact us</Link> to discuss availability for your matter.
          </p>
        </section>
      )}

      <section id="related-state-pages" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">More {state.name} resources</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li>
            <Link to={`/locations/${state.slug}`} className={LINK}>
              Forensic economists in {place}
            </Link>
          </li>
          {pillarServices()
            .filter((s) => holdsCredential(s.relevantCredentials, cred))
            .map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}/${state.slug}`} className={LINK}>
                  {s.shortName} in {place}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section id="other-credentials" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Other credentials in {place}</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {credentials
            .filter((c) => c.slug !== cred.slug)
            .map((c) => (
              <li key={c.slug}>
                <Link to={`/credentials/${c.slug}/${state.slug}`} className={LINK}>
                  {c.abbreviation} in {place}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <FAQBlock faqs={localFaqs} title={`Frequently asked: qualifying a forensic economist in ${place}`} />
      <section id="more-questions" aria-labelledby="more-questions-heading" className="mt-8">
        <h2 id="more-questions-heading" className="font-serif text-2xl text-navy mb-2">More questions about this credential</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {cred.faqs.map((f) => (
            <li key={f.question}>
              <Link to={`/credentials/${cred.slug}#faq-heading`} className={LINK}>{f.question}</Link>
            </li>
          ))}
        </ul>
      </section>
      <SourcesBlock sources={cred.sources.slice(0, 5)} />
      <div className="mt-12">
        <NextSteps />
      </div>

      <SchemaOrg data={graphSchema([
        credentialSchema({ slug: cred.slug, name: cred.name, abbreviation: cred.abbreviation, category: cred.category, issuer: cred.issuer, issuerUrl: cred.issuerUrl, scope: cred.scope }),
        // Membership-neutral on purpose: the service is the firm's forensic
        // economics work in the state, not a claim that its economists hold
        // the credential (spec 4.3 for the association pages). The page
        // canonical is the entity's @id and url (no /services/cred-* route).
        serviceSchema({
          url,
          name: `Forensic Economists for ${state.name} Damages Matters (${cred.abbreviation})`,
          description: `${ORG_NAME} provides forensic economists for ${state.name} damages matters. This page explains ${cred.name} (${cred.abbreviation}) and how ${attr} courts weigh it.`,
          areaServed: { "@type": state.type === "state" ? "State" : "AdministrativeArea", name: state.name },
          dateModified: cred.dateModified,
        }),
        faqPageSchema(localFaqs, url),
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
