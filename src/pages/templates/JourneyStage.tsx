import { useParams, Link } from "react-router-dom";
import { journeys, getJourney } from "@/data/journeys";
import { getCaseType } from "@/data/caseTypes";
import { ATTORNEY_STAGES, STAGE_LABELS } from "@/lib/attorney-stages";
import PaginateNav from "@/components/PaginateNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, howToSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

export default function JourneyStage() {
  const { stage = "", caseTypeSlug = "" } = useParams();
  const j = getJourney(stage, caseTypeSlug);
  const caseType = getCaseType(caseTypeSlug);

  const stageLabel = STAGE_LABELS[stage] ?? stage;
  const title = caseType ? `${stageLabel} for ${caseType.name} Cases` : "";
  const url = `${ORG_URL}/attorneys/${stage}/${caseTypeSlug}`;
  usePageMeta(
    j && caseType
      ? {
          title: `${title} | ${ORG_NAME}`,
          description: `Practical guide for attorneys: ${stageLabel.toLowerCase()} in ${caseType.name.toLowerCase()} cases. Step-by-step actions, required documents, common pitfalls, and FAQs.`,
          canonical: url,
        }
      : null,
  );

  if (!j || !caseType) return <NotFound />;

  const idx = journeys.findIndex((x) => x.stage === stage && x.caseTypeSlug === caseTypeSlug);
  const prev = idx > 0
    ? { label: `${STAGE_LABELS[journeys[idx - 1].stage] ?? journeys[idx - 1].stage} - ${journeys[idx - 1].caseTypeSlug}`, href: `/attorneys/${journeys[idx - 1].stage}/${journeys[idx - 1].caseTypeSlug}` }
    : undefined;
  const next = idx < journeys.length - 1
    ? { label: `${STAGE_LABELS[journeys[idx + 1].stage] ?? journeys[idx + 1].stage} - ${journeys[idx + 1].caseTypeSlug}`, href: `/attorneys/${journeys[idx + 1].stage}/${journeys[idx + 1].caseTypeSlug}` }
    : undefined;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Attorneys", url: "/attorneys" },
        { name: stageLabel, url: `/attorneys/${stage}` },
        { name: caseType.name, url: `/attorneys/${stage}/${caseTypeSlug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{title}</h1>
      <AuthorByline dateModified={j.dateModified} />
      <p className="text-lg text-neutral-700 mb-8">{j.intro}</p>

      <section id="checklist" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Checklist</h2>
        <ol className="list-decimal ml-5 text-neutral-700 space-y-1">
          {j.checklist.map((c, i) => <li key={i}>{c}</li>)}
        </ol>
      </section>
      <section id="questions" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Questions to ask the expert</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {j.questionsToAsk.map((q, i) => <li key={i}>{q}</li>)}
        </ul>
      </section>
      <section id="timeline" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Timeline</h2>
        <p className="text-neutral-700">{j.timeline}</p>
      </section>
      <section id="documents" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Required documents</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {j.requiredDocuments.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      </section>
      <section id="pitfalls" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Common pitfalls</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {j.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </section>

      <section id="related-guides" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">More {caseType.name.toLowerCase()} guides</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {ATTORNEY_STAGES.filter((s) => s.slug !== stage).map((s) => (
            <li key={s.slug}>
              <Link
                to={`/attorneys/${s.slug}/${caseTypeSlug}`}
                className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
              >
                {s.label} for {caseType.name} Cases
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={`/case-types/${caseTypeSlug}`}
              className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
            >
              {caseType.name} expert services overview
            </Link>
          </li>
        </ul>
      </section>

      <FAQBlock faqs={j.faqs} />
      <SourcesBlock sources={j.sources} />
      <PaginateNav prev={prev} next={next} backHref="/attorneys" backLabel="Attorney resources" />

      <SchemaOrg data={graphSchema([
        howToSchema({ name: title, description: j.intro, steps: j.checklist }),
        faqPageSchema(j.faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Attorneys", url: `${ORG_URL}/attorneys` },
          { name: stageLabel, url: `${ORG_URL}/attorneys/${stage}` },
          { name: caseType.name, url },
        ]),
      ])} />
    </article>
  );
}
