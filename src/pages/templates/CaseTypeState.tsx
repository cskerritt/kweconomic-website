import { placeName } from "@/data/geo-prose.mjs";
import { useParams, Link } from "react-router-dom";
import {
  caseTypes,
  getCaseType,
  caseTypeStateHeading,
  caseTypeStateDescription,
  caseTypeStateLead,
  caseTypeStateStepsIntro,
  caseTypeStateFramework,
  caseTypeStateFrameworkQuestion,
  caseTypeStateServiceDescription,
  caseTypeSectionHeadings,
  type CaseTypeCategory,
} from "@/data/caseTypes";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import { retainableExperts } from "@/data/team";
import { getCourtsByState, selectTrialCourts, courtSystemLabel, type CourtSelection } from "@/data/courts/state-courts";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import NextSteps from "@/components/NextSteps";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import { caseTypeStateTitle } from "@/lib/page-titles.mjs";
import NotFound from "@/pages/NotFound";

const LINK = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

// The state modules are keyed on the case type's category: injury and death
// matters get the wrongful death / survival / collateral source paragraph
// (damagesContext) and the compensation forum; employment, commercial, and
// family matters get the fault, interest, and cap paragraph (generalContext).
const INJURY_CATEGORIES: ReadonlySet<CaseTypeCategory> = new Set(["personal-injury", "wrongful-death", "med-mal", "workers-comp"]);
const COURT_SELECTION: Partial<Record<CaseTypeCategory, CourtSelection>> = { family: "family", commercial: "commercial" };

const listNames = (names: string[]) => {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

// "the United States District Court for the District of New Jersey". The
// territorial districts are named "District Court of Guam" and "District Court
// for the Northern Mariana Islands", so the prefix is not repeated for them.
const federalCourts = (names: string[]) => {
  if (names.length === 1) {
    return /^District Court\b/.test(names[0])
      ? `the United States ${names[0]}`
      : `the United States District Court for the ${names[0]}`;
  }
  return `the United States District Courts for the ${listNames(names)}`;
};

export default function CaseTypeState() {
  const { typeSlug = "", stateSlug = "" } = useParams();
  const caseType = getCaseType(typeSlug);
  const state = states.find((s) => s.slug === stateSlug);

  const url =
    caseType && state ? `${ORG_URL}/case-types/${caseType.slug}/${state.slug}` : "";
  usePageMeta(
    caseType && state
      ? {
          // Shared with scripts/prerender.mjs (wrapped in a template literal
          // so the prerender parity guard can slot it): the titleBase plus
          // the place, then "<shortName> Economist" where the full stem
          // cannot fit beside the place, and the state abbreviation only
          // where no stem fits beside the full place name in the tag.
          // The description helper reads the entry's `framing` block where it
          // carries one (the family-law matter) and the shared
          // economic-damages sentence otherwise.
          title: `${caseTypeStateTitle(caseType, state, ORG_NAME)}`,
          description: `${caseTypeStateDescription(caseType, placeName(state.name))}`,
          canonical: url,
        }
      : null,
  );

  if (!caseType || !state) return <NotFound />;

  const place = placeName(state.name);
  const lower = caseType.name.toLowerCase();
  const isInjury = INJURY_CATEGORIES.has(caseType.category);
  // Only the economists counsel may retain by name (team.ts retention rule).
  const expertsInState = retainableExperts().filter((m) => m.statesServed.includes(state.abbreviation));
  const author = retainableExperts()[0];
  const courts = getCourtsByState(state.slug);
  const regulations = getRegulationsByState(state.slug);
  const trialCourts = courts ? selectTrialCourts(courts, COURT_SELECTION[caseType.category] ?? "general") : [];
  const federalVenues = courts?.federalDistricts ?? [];
  // The framework paragraph: the state module's damages text (tort for the
  // injury and death categories, fault-interest-caps otherwise), or the
  // entry's own framing paragraph for a matter that is not a damages claim.
  const frameworkText = regulations
    ? caseTypeStateFramework(caseType, place, isInjury ? regulations.damagesContext : regulations.generalContext)
    : "";
  // The H1, lead, headings, and framework question read the entry's `framing`
  // block where it carries one; scripts/prerender.mjs reads the same helpers.
  const h1 = caseTypeStateHeading(caseType, place);
  const headings = caseTypeSectionHeadings(caseType);
  const courtList = listNames(trialCourts.map((c) => `the ${c.name} (${c.description})`));

  // Two FAQs that exist only for this case type in this state; the hub's own
  // FAQs are linked, not repeated, so the FAQPage node is not a duplicate.
  // A workers' compensation claim is decided by the compensation forum, so
  // its courts answer names the forum first and the civil courts only for
  // the third-party action.
  const localFaqs = [
    ...(courts
      ? [
          {
            question: `Which ${state.name} courts hear ${lower} cases?`,
            answer: [
              caseType.category === "workers-comp" && regulations
                ? `${caseType.name} claims in ${place} proceed before the ${regulations.compensationForum}, and third-party actions arising from the same injury are heard in ${courtList}.`
                : `${caseType.name} cases venued in ${place} are heard in ${courtList}.`,
              `Final appeals run to the ${courts.supremeCourt}.`,
              federalVenues.length > 0 ? `Matters within federal jurisdiction proceed in ${federalCourts(federalVenues.map((d) => d.name))}.` : "",
              courts.venueNote ?? "",
            ]
              .filter(Boolean)
              .join(" "),
          },
        ]
      : []),
    ...(regulations
      ? [
          {
            question: caseTypeStateFrameworkQuestion(caseType, place),
            answer: `${frameworkText} ${regulations.expertStandard}`,
          },
        ]
      : []),
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Case Types", url: "/case-types" },
        { name: caseType.name, url: `/case-types/${caseType.slug}` },
        { name: state.name, url: `/case-types/${caseType.slug}/${state.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{h1}</h1>
      <AuthorByline slug={author?.slug} datePublished={caseType.datePublished} dateModified={caseType.dateModified} />
      <p className="text-lg text-neutral-700 mb-6">{caseTypeStateLead(caseType, ORG_NAME, place)}</p>

      <section id="definition" className="mb-8">
        <p className="text-neutral-700">
          {caseType.summaryShort}{" "}
          <Link to={`/case-types/${caseType.slug}`} className={LINK}>
            Read the full {lower} analysis guide
          </Link>
          .
        </p>
      </section>

      {(courts || regulations) && (
        <section id="jurisdictional-notes" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} courts and expert standards</h2>
          {regulations && <p className="text-neutral-700 mb-3">{regulations.expertStandard}</p>}
          {courts && (
            <div className="mb-3">
              <h3 className="font-semibold text-navy mb-1">Where these cases are heard</h3>
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
              {regulations && caseType.category === "workers-comp" && (
                <p className="text-neutral-700 mt-2">
                  <strong className="text-navy">Compensation forum:</strong> {regulations.compensationForum}. Third-party actions arising from the same injury proceed in the civil courts listed above, and the report separates what the compensation system pays from what the civil claim adds.
                </p>
              )}
              {regulations && isInjury && caseType.category !== "workers-comp" && (
                <p className="text-neutral-700 mt-2">
                  Outside the civil courts, wage-loss disputes in workers&#x27; compensation matters proceed before the <strong>{regulations.compensationForum}</strong>.
                </p>
              )}
            </div>
          )}
          {regulations && (
            <div>
              <h3 className="font-semibold text-navy mb-1">{headings.framework}</h3>
              <p className="text-neutral-700">{frameworkText}</p>
            </div>
          )}
        </section>
      )}

      <section id="analysis" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">{headings.method}</h2>
        <p className="text-neutral-700 mb-2">{caseTypeStateStepsIntro(caseType, place)}</p>
        <ol className="list-decimal ml-5 text-neutral-700 space-y-1">
          {caseType.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {expertsInState.length > 0 && (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Experts serving {place}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expertsInState.slice(0, 6).map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className={LINK}>{m.name}</Link>
                <span className="text-neutral-600"> - {m.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="attorney-guides" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Attorney guides for {lower} cases</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {ATTORNEY_STAGES.map((stage) => (
            <li key={stage.slug}>
              <Link to={`/attorneys/${stage.slug}/${caseType.slug}`} className={LINK}>
                {stage.label} for {caseType.name} Cases
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="related-state-pages" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">More {state.name} resources</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li>
            <Link to={`/locations/${state.slug}`} className={LINK}>
              Forensic economists in {place}
            </Link>
          </li>
          {pillarServices()
            .filter((s) => caseType.relevantServices.includes(s.slug))
            .map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}/${state.slug}`} className={LINK}>
                  {s.shortName} in {place}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <section id="other-case-types" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Other case types in {place}</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {caseTypes
            .filter((ct) => ct.slug !== caseType.slug)
            .map((ct) => (
              <li key={ct.slug}>
                <Link to={`/case-types/${ct.slug}/${state.slug}`} className={LINK}>
                  {ct.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <FAQBlock faqs={localFaqs} title={`Frequently asked: ${lower} cases in ${place}`} />
      <section id="more-questions" aria-labelledby="more-questions-heading" className="mt-8">
        <h2 id="more-questions-heading" className="font-serif text-2xl text-navy mb-2">More questions about {lower} analysis</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {caseType.faqs.map((f) => (
            <li key={f.question}>
              <Link to={`/case-types/${caseType.slug}#faq-heading`} className={LINK}>{f.question}</Link>
            </li>
          ))}
        </ul>
      </section>
      <SourcesBlock sources={caseType.sources.slice(0, 5)} />
      <div className="mt-12">
        <NextSteps context={`${lower} cases in ${place}`} />
      </div>

      <SchemaOrg data={graphSchema([
        // The page canonical is the Service entity's @id and url (no
        // /services/<case-type>/<state> route exists).
        serviceSchema({
          url,
          name: h1,
          description: caseTypeStateServiceDescription(caseType, place),
          areaServed: { "@type": state.type === "state" ? "State" : "AdministrativeArea", name: state.name },
          dateModified: caseType.dateModified,
        }),
        faqPageSchema(localFaqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Case Types", url: `${ORG_URL}/case-types` },
          { name: caseType.name, url: `${ORG_URL}/case-types/${caseType.slug}` },
          { name: state.name, url },
        ]),
      ])} />
    </article>
  );
}
