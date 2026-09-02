import { useParams, Link } from "react-router-dom";
import { journeys, getJourney } from "@/data/journeys";
import { getCaseType } from "@/data/caseTypes";
import { pillarServices } from "@/data/services";
import { guides } from "@/data/guides";
import {
  ATTORNEY_STAGES,
  STAGE_LABELS,
  STAGE_GUIDES,
  journeyHeading,
  journeyTitle,
  journeyDescription,
} from "@/lib/attorney-stages";
import PaginateNav from "@/components/PaginateNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import NextSteps from "@/components/NextSteps";
import SchemaOrg from "@/components/SchemaOrg";
import {
  graphSchema,
  organizationSchema,
  articleSchema,
  faqPageSchema,
  breadcrumbSchema,
  ORG_URL,
} from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

const LINK_CLASS =
  "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

export default function JourneyStage() {
  const { stage = "", caseTypeSlug = "" } = useParams();
  const j = getJourney(stage, caseTypeSlug);
  const caseType = getCaseType(caseTypeSlug);

  const stageLabel = STAGE_LABELS[stage] ?? stage;
  // One string feeds the H1, the <title>, and the Article headline.
  const heading = caseType ? journeyHeading(stage, caseType) : "";
  const description = caseType ? journeyDescription(stage, caseType) : "";
  const url = `${ORG_URL}/attorneys/${stage}/${caseTypeSlug}`;
  usePageMeta(
    j && caseType
      ? {
          title: journeyTitle(stage, caseType),
          description,
          canonical: url,
        }
      : null,
  );

  if (!j || !caseType) return <NotFound />;

  const idx = journeys.findIndex((x) => x.stage === stage && x.caseTypeSlug === caseTypeSlug);
  const neighbour = (k: number) => {
    const n = journeys[k];
    const ct = getCaseType(n.caseTypeSlug);
    return ct ? { label: journeyHeading(n.stage, ct), href: `/attorneys/${n.stage}/${n.caseTypeSlug}` } : undefined;
  };
  const prev = idx > 0 ? neighbour(idx - 1) : undefined;
  const next = idx < journeys.length - 1 ? neighbour(idx + 1) : undefined;

  // Contextual links beyond the family: the first three pillar services the
  // case type declares (the pillar:false cross-sells never resolve here) and
  // the guide that maps onto this stage, with anchor text from the data.
  const pillars = pillarServices();
  const relatedServices = caseType.relevantServices
    .flatMap((slug) => {
      const s = pillars.find((p) => p.slug === slug);
      return s ? [s] : [];
    })
    .slice(0, 3);
  const stageGuide = guides.find((g) => g.slug === STAGE_GUIDES[stage]);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Attorneys", url: "/attorneys" },
        { name: stageLabel, url: `/attorneys/${stage}` },
        { name: caseType.name, url: `/attorneys/${stage}/${caseTypeSlug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{heading}</h1>
      <AuthorByline slug={j.authorSlug} datePublished={j.datePublished} dateModified={j.dateModified} />
      <p className="text-lg text-neutral-700 mb-8">{j.intro}</p>

      <section id="checklist" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Checklist</h2>
        <ol className="list-decimal ml-5 text-neutral-700 space-y-1">
          {j.checklist.map((c, i) => <li key={i}>{c}</li>)}
        </ol>
      </section>
      <section id="questions" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Questions to ask the economist</h2>
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
              <Link to={`/attorneys/${s.slug}/${caseTypeSlug}`} className={LINK_CLASS}>
                {journeyHeading(s.slug, caseType)}
              </Link>
            </li>
          ))}
          <li>
            <Link to={`/case-types/${caseTypeSlug}`} className={LINK_CLASS}>
              {caseType.name} expert services overview
            </Link>
          </li>
        </ul>
      </section>

      <section id="related-services" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Related services and reading</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {relatedServices.map((s) => (
            <li key={s.slug}>
              <Link to={`/services/${s.slug}`} className={LINK_CLASS}>
                {s.name}
              </Link>
            </li>
          ))}
          {stageGuide && (
            <li>
              <Link to={`/guides/${stageGuide.slug}`} className={LINK_CLASS}>
                {stageGuide.title}
              </Link>
            </li>
          )}
        </ul>
      </section>

      <FAQBlock faqs={j.faqs} />
      <SourcesBlock sources={j.sources} />
      <div className="mt-12">
        <NextSteps context={caseType.name} />
      </div>
      <PaginateNav prev={prev} next={next} backHref="/attorneys" backLabel="Attorney resources" />

      <SchemaOrg data={graphSchema([
        organizationSchema(),
        articleSchema({
          title: heading,
          description,
          url,
          datePublished: j.datePublished,
          dateModified: j.dateModified,
          authorSlug: j.authorSlug,
        }),
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
