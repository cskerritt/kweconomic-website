import { useParams, Link } from "react-router-dom";
import { caseTypes, getCaseType } from "@/data/caseTypes";
import { states } from "@/data/states";
import { services } from "@/data/services";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import { activeTeam } from "@/data/team";
import { getCourtsByState } from "@/data/courts/state-courts";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

export default function CaseTypeState() {
  const { typeSlug = "", stateSlug = "" } = useParams();
  const caseType = getCaseType(typeSlug);
  const state = states.find((s) => s.slug === stateSlug);

  const url =
    caseType && state ? `${ORG_URL}/case-types/${caseType.slug}/${state.slug}` : "";
  usePageMeta(
    caseType && state
      ? {
          title: `${caseType.name} Expert Witness Services in ${state.name} | KWVRS`,
          description: `Vocational, economic, and life-care expert services for ${caseType.name.toLowerCase()} cases venued in ${state.name}. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );

  if (!caseType || !state) return <NotFound />;

  const expertsInState = activeTeam.filter((m) => m.statesServed.includes(state.abbreviation));
  const courts = getCourtsByState(state.slug);
  const regulations = getRegulationsByState(state.slug);

  const localizedFaqs = caseType.faqs.slice(0, 4).map((f) => ({
    question: f.question.replace(/in your state|nationwide/gi, `in ${state.name}`),
    answer: f.answer.replace(/in your state|nationwide/gi, `in ${state.name}`),
  }));

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Case Types", url: "/case-types" },
        { name: caseType.name, url: `/case-types/${caseType.slug}` },
        { name: state.name, url: `/case-types/${caseType.slug}/${state.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">
        {caseType.name} Expert Services in {state.name}
      </h1>
      <AuthorByline />
      <p className="text-lg text-neutral-700 mb-8">
        KWVRS provides {caseType.name.toLowerCase()} vocational, life care planning, and forensic economic analysis for attorneys handling cases in {state.name}.
      </p>

      <section id="overview" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Overview</h2>
        <p className="text-neutral-700">{caseType.summary}</p>
      </section>
      <section id="vocational-impact" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Vocational and economic impact</h2>
        <p className="text-neutral-700 mb-3">{caseType.vocationalImpact}</p>
        <p className="text-neutral-700">{caseType.economicExposure}</p>
        {caseType.lifeCareImpact && (
          <p className="text-neutral-700 mt-3">{caseType.lifeCareImpact}</p>
        )}
      </section>
      {(courts || regulations) && (
        <section id="jurisdictional-notes" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} courts and expert standards</h2>
          <p className="text-neutral-700 mb-3">
            {caseType.name} matters in {state.name} are litigated in the state's trial courts, with vocational, life care planning, and economic testimony evaluated under {state.name}'s expert evidence standard. KWVRS prepares reports and testimony that account for these requirements.
          </p>
          {courts && (
            <div className="mb-3">
              <h3 className="font-semibold text-navy mb-1">Where these cases are heard</h3>
              <ul className="list-disc ml-5 text-neutral-700 space-y-1">
                {courts.trialCourts.slice(0, 3).map((c) => (
                  <li key={c.name}><strong>{c.name}</strong> - {c.description}</li>
                ))}
              </ul>
              <p className="text-sm text-neutral-600 mt-2">
                Highest court: {courts.supremeCourt}.
                {courts.federalDistricts.length > 0 && ` Federal venues: ${courts.federalDistricts.map((d) => d.abbreviation).join(", ")}.`}
              </p>
            </div>
          )}
          {regulations && (
            <div>
              <h3 className="font-semibold text-navy mb-1">Credentialing and expert qualification</h3>
              <p className="text-neutral-700">{regulations.licensingRequirements}</p>
            </div>
          )}
        </section>
      )}

      {expertsInState.length > 0 && (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Experts serving {state.name}</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expertsInState.slice(0, 6).map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">{m.name}</Link>
                <span className="text-neutral-600"> - {m.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="attorney-guides" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Attorney guides for {caseType.name.toLowerCase()} cases</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {ATTORNEY_STAGES.map((stage) => (
            <li key={stage.slug}>
              <Link
                to={`/attorneys/${stage.slug}/${caseType.slug}`}
                className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
              >
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
            <Link
              to={`/locations/${state.slug}`}
              className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
            >
              Vocational and rehabilitation experts in {state.name}
            </Link>
          </li>
          {services
            .filter((s) => caseType.relevantServices.includes(s.slug))
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

      <section id="other-case-types" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Other case types in {state.name}</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {caseTypes
            .filter((ct) => ct.slug !== caseType.slug)
            .map((ct) => (
              <li key={ct.slug}>
                <Link
                  to={`/case-types/${ct.slug}/${state.slug}`}
                  className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
                >
                  {ct.name}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <FAQBlock faqs={localizedFaqs} />
      <SourcesBlock sources={caseType.sources.slice(0, 5)} />

      <SchemaOrg data={graphSchema([
        serviceSchema({
          slug: `${caseType.slug}/${state.slug}`,
          name: `${caseType.name} Expert Services in ${state.name}`,
          description: `Vocational, life care planning, and forensic economic services for ${caseType.name.toLowerCase()} cases in ${state.name}.`,
          areaServed: { "@type": "AdministrativeArea", name: state.name },
        }),
        faqPageSchema(localizedFaqs, url),
        breadcrumbSchema([
          { name: "Home", url: "https://kwvrs.com/" },
          { name: "Case Types", url: "https://kwvrs.com/case-types" },
          { name: caseType.name, url: `https://kwvrs.com/case-types/${caseType.slug}` },
          { name: state.name, url },
        ]),
      ])} />
    </article>
  );
}
