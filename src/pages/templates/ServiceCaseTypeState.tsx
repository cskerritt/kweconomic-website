import { useParams, Link } from "react-router-dom";
import { placeName, placeAttr } from "@/data/geo-prose.mjs";
import { pillarServices, servicesForCaseType } from "@/data/services";
import {
  getCaseType,
  caseTypeStateFramework,
  caseTypeStateStepsIntro,
  caseTypeSectionHeadings,
  caseTypePairStateLead,
  caseTypeStateCourts,
  caseTypeExpertStandard,
  caseTypePairStateFrameworkTail,
  caseTypeCourtSelection,
  caseTypeVenuesHeading,
  caseTypePairStateExpertQuestion,
  caseTypePairStateFrameworkQuestion,
  caseTypeStateForums,
  caseTypeCourtsNameFederalCourts,
  type CaseTypeCategory,
} from "@/data/caseTypes";
import { states } from "@/data/states";
import { releasedStates, serviceCaseStatePath } from "@/data/serviceCaseTypeStates";
import { federalDistricts, circuitOfState } from "@/data/courts/federal-districts";
import { getCourtsByState, selectTrialCourts, courtSystemLabel } from "@/data/courts/state-courts";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import { serviceCaseStateTitle } from "@/lib/page-titles.mjs";
import { capFirst, withArticle, workPhrase, serviceCaseStateDescription } from "@/lib/service-prose.mjs";
import NotFound from "@/pages/NotFound";

const LINK = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

// The state modules are keyed on the case type's category, the same way
// CaseTypeState.tsx keys them: injury and death matters get the wrongful
// death / survival / collateral source paragraph (damagesContext) and the
// compensation forum; employment, commercial, family, and tax matters get the
// fault, interest, and cap paragraph (generalContext), which a framing entry
// replaces with its own framework paragraph. The trial courts listed follow
// the category (caseTypes.ts caseTypeCourtSelection: tax and intellectual
// property matters take the business selection, after the federal tax
// forums or the federal courts the entry lists).
const INJURY_CATEGORIES: ReadonlySet<CaseTypeCategory> = new Set(["personal-injury", "wrongful-death", "med-mal", "workers-comp"]);

const listNames = (names: string[]) => {
  if (names.length <= 1) return names.join("");
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

/**
 * /services/<pillar>/case/<case-type>/<state> (plan Task 2, waves 2 to 5):
 * the declared service x case-type pair composed with the state's courts,
 * expert standard, and damages framework. The React route resolves every
 * declared pair in every state; the shells and the sitemap gate on the
 * released batches in src/data/serviceCaseTypeStates.ts, and the "By state"
 * grids link only those. The title, description, H1, lead, section order,
 * FAQs, and JSON-LD are mirrored by the shell block in scripts/prerender.mjs;
 * scripts/prerender-meta.test.mjs pins the meta pair.
 */
export default function ServiceCaseTypeState() {
  const { serviceSlug = "", typeSlug = "", stateSlug = "" } = useParams();
  const service = pillarServices().find((s) => s.slug === serviceSlug);
  const caseType = getCaseType(typeSlug);
  const state = states.find((s) => s.slug === stateSlug);
  const declared = Boolean(service && caseType && service.caseTypes.includes(caseType.slug));
  const ok = Boolean(service && caseType && state && declared);

  const path = serviceCaseStatePath(serviceSlug, typeSlug, stateSlug);
  const url = ok ? `${ORG_URL}${path}` : "";
  usePageMeta(
    service && caseType && state && declared
      ? {
          // Shared with scripts/prerender.mjs (wrapped in template literals so
          // the parity guard can slot them): the pair label beside the place
          // from src/lib/page-titles.mjs, and the description from the shared
          // prose helper.
          title: `${serviceCaseStateTitle(service, caseType, state, ORG_NAME)}`,
          description: `${serviceCaseStateDescription(service, caseType, placeName(state.name))}`,
          canonical: url,
        }
      : null,
  );

  if (!service || !caseType || !state || !declared) return <NotFound />;

  const place = placeName(state.name);
  const attr = placeAttr(state.name);
  const work = workPhrase(service.shortName);
  const lower = caseType.name.toLowerCase();
  const isInjury = INJURY_CATEGORIES.has(caseType.category);
  const note = service.caseTypeNotes[caseType.slug];
  const courts = getCourtsByState(state.slug);
  const regulations = getRegulationsByState(state.slug);
  const selection = caseTypeCourtSelection(caseType);
  const trialCourts = courts ? selectTrialCourts(courts, selection.kind, selection.limit) : [];
  const districts = federalDistricts.filter((d) => d.stateSlug === state.slug);
  const circuit = circuitOfState(state.slug);
  // A matter heard outside the state's courts lists its own forums first
  // (the federal tax forums and the state's tax appeal process; the federal
  // district courts serving the state and the courts of appeals for an
  // intellectual property claim).
  const venues = [...caseTypeStateForums(caseType, place, attr, { federalDistricts: districts.map((d) => d.name), circuit }), ...trialCourts];
  const headings = caseTypeSectionHeadings(caseType);
  const frameworkText = regulations
    ? caseTypeStateFramework(caseType, place, isInjury ? regulations.damagesContext : regulations.generalContext, circuit)
    : "";
  // The state's expert standard closes on how an economic damages report
  // meets it; a framing entry prints the state's inquiry with its own close.
  const expertStandard = regulations ? caseTypeExpertStandard(caseType, place, regulations) : "";
  const finalStep = service.process?.at(-1);
  const h1 = `${service.name} for ${caseType.name} Cases in ${place}`;
  // The entry's framing block supplies the lead for a matter that is not a
  // damages claim (caseTypes.ts caseTypePairStateLead; the prerender reads
  // the same helper).
  const lead = caseTypePairStateLead(caseType, ORG_NAME, work, place, attr);
  const courtList = listNames(trialCourts.map((c) => `the ${c.name} (${c.description})`));
  const federalList = listNames(districts.map((d) => d.name));

  // The other pillars that declare this case type, linked to their own state
  // page where the state has shipped and to the pair page otherwise.
  const released = new Set(releasedStates());
  const siblings = servicesForCaseType(caseType.slug).filter((s) => s.slug !== service.slug);
  const otherStates = releasedStates()
    .filter((slug) => slug !== state.slug)
    .map((slug) => states.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  // Three FAQs that exist only for this pair in this state: how the analysis
  // is built, what the state's courts ask of it, and how the state framework
  // shapes it. The pair's own FAQs stay on the pair page.
  const faqs = [
    {
      question: `How is ${work} built for ${withArticle(lower)} case in ${place}?`,
      answer: `${caseTypeStateStepsIntro(caseType, place)} ${caseType.steps.join(" ")}`,
    },
    ...(regulations && courts
      ? [
          {
            question: caseTypePairStateExpertQuestion(caseType, attr, place, work),
            answer: [
              expertStandard,
              caseType.category === "workers-comp"
                ? `${caseType.name} claims in ${place} proceed before the ${regulations.compensationForum}, and third-party actions arising from the same injury are heard in ${courtList}, with final appeals to the ${courts.supremeCourt}.`
                : caseTypeStateCourts(
                    caseType,
                    { place, courtList, supremeCourt: courts.supremeCourt, stateSlug: state.slug, federalDistricts: districts.map((d) => d.name), circuit },
                    "clause",
                  ),
              // An answer that already names the federal district courts
              // (intellectual property) takes no second federal sentence.
              districts.length > 0 && !caseTypeCourtsNameFederalCourts(caseType) ? `Matters within federal jurisdiction proceed in the ${federalList}.` : "",
            ]
              .filter(Boolean)
              .join(" "),
          },
        ]
      : []),
    ...(regulations
      ? [
          {
            // "How does the <attr> damages framework shape ...?", or the
            // entry's own question where federal statutes set the measures.
            question: caseTypePairStateFrameworkQuestion(caseType, attr, place, work),
            answer: `${frameworkText} ${caseTypePairStateFrameworkTail(caseType, attr)}`,
          },
        ]
      : []),
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: service.name, url: `/services/${service.slug}` },
        { name: caseType.name, url: `/services/${service.slug}/case/${caseType.slug}` },
        { name: state.name, url: path },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{h1}</h1>
      <AuthorByline dateModified={service.dateModified} />
      <p className="kw-lead text-lg text-neutral-700 mb-8">{lead}</p>

      <section id="application" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">How {work} applies to {caseType.name} in {place}</h2>
        {note && <p className="text-neutral-700 mb-3">{note.summary}</p>}
        <p className="text-neutral-700">{service.description}</p>
      </section>

      <section id="exposure" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">{headings.concentration}</h2>
        <p className="text-neutral-700">{caseType.damagesExposure}</p>
      </section>

      {(courts || regulations) && (
        <section id="jurisdictional-notes" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{caseTypeVenuesHeading(caseType, state.name)}</h2>
          {regulations && <p className="text-neutral-700 mb-3">{expertStandard}</p>}
          {courts && (
            <div className="mb-3">
              <h3 className="font-semibold text-navy mb-1">Where these cases are heard</h3>
              <ul className="list-disc ml-5 text-neutral-700 space-y-1">
                {venues.map((c) => (
                  <li key={c.name}><strong>{c.name}</strong> - {c.description}</li>
                ))}
              </ul>
              <p className="text-sm text-neutral-600 mt-2">
                Highest court: {courts.supremeCourt}.
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
              {districts.length > 0 && (
                <p className="text-sm text-neutral-600 mt-1">
                  Federal venues:{" "}
                  {districts.map((d, i) => (
                    <span key={d.slug}>
                      {i > 0 && ", "}
                      <Link to={`/jurisdictions/federal/${d.slug}`} className={LINK}>{d.name}</Link>
                    </span>
                  ))}
                  .
                </p>
              )}
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

      {finalStep && (
        <section id="deliverables" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Typical deliverables</h2>
          <p className="text-neutral-700">{finalStep.description}</p>
        </section>
      )}

      <section id="related-pages" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Related pages</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li>
            <Link to={`/services/${service.slug}/case/${caseType.slug}`} className={LINK}>
              {service.name} for {caseType.name} cases: the pair page for every state
            </Link>
          </li>
          <li>
            <Link to={`/case-types/${caseType.slug}/${state.slug}`} className={LINK}>
              {caseType.name} cases in {place}: courts, framework, and the analysis
            </Link>
          </li>
          <li>
            <Link to={`/services/${service.slug}/${state.slug}`} className={LINK}>
              {service.shortName} in {place}
            </Link>
          </li>
          <li>
            <Link to={`/services/${service.slug}`} className={LINK}>
              {service.name}: the full service page
            </Link>
          </li>
          <li>
            <Link to={`/locations/${state.slug}`} className={LINK}>
              Forensic economists in {place}
            </Link>
          </li>
          {siblings.map((s) => (
            <li key={s.slug}>
              <Link
                to={released.has(state.slug) ? serviceCaseStatePath(s.slug, caseType.slug, state.slug) : `/services/${s.slug}/case/${caseType.slug}`}
                className={LINK}
              >
                {s.shortName} for {caseType.name} in {place}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {otherStates.length > 0 && (
        <section id="other-states" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{service.shortName} for {caseType.name} in other states</h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {otherStates.map((s) => (
              <li key={s.slug}>
                <Link to={serviceCaseStatePath(service.slug, caseType.slug, s.slug)} className="text-navy hover:text-amber-dark hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContactCTA context={service.shortName} />

      <FAQBlock faqs={faqs} title={`Frequently asked: ${capFirst(work)} in ${place} ${lower} matters`} />
      <SourcesBlock sources={service.sources.slice(0, 5)} />

      <SchemaOrg data={graphSchema([
        // The page canonical is the Service entity's @id and url.
        serviceSchema({
          url,
          name: h1,
          description: serviceCaseStateDescription(service, caseType, place),
          areaServed: { "@type": state.type === "state" ? "State" : "AdministrativeArea", name: state.name },
          dateModified: service.dateModified,
        }),
        faqPageSchema(faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Services", url: `${ORG_URL}/services` },
          { name: service.name, url: `${ORG_URL}/services/${service.slug}` },
          { name: caseType.name, url: `${ORG_URL}/services/${service.slug}/case/${caseType.slug}` },
          { name: state.name, url },
        ]),
      ])} />
    </article>
  );
}
