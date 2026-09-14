import { useParams, Link, Navigate } from "react-router-dom";
import { pillarServices, servicesForCaseType, type PillarService } from "@/data/services";
import { getCaseType, type CaseType } from "@/data/caseTypes";
import { states } from "@/data/states";
import { releasedStates, serviceCaseStatePath } from "@/data/serviceCaseTypeStates";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import FAQBlock from "@/components/FAQBlock";
import RelatedContent from "@/components/RelatedContent";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import { pairTitle } from "@/lib/page-titles.mjs";
// Service.shortName is a heading label ("Fraud & Tracing"); the meta
// description and the intro sentence render the work the pillar performs
// through the shared helper ("fraud and tracing analysis"). The H1 and the
// H2 keep the full service name as a proper noun; the <title> comes from the
// shared pairTitle builder (src/lib/page-titles.mjs, also used by
// scripts/prerender.mjs): the heading label plus the case type's short name,
// with "Expert" wherever it fits the 60-character tag, then without it, and
// the pillar's titleShortName only where neither form of the label fits.
import { capFirst, workPhrase } from "@/lib/service-prose.mjs";
import NotFound from "@/pages/NotFound";

const LINK_CLASS = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

/** Meta description: 126-158 characters on every declared pair (pinned by the render test). */
function pairDescription(service: PillarService, caseType: CaseType): string {
  const work = workPhrase(service.shortName);
  const base = `${capFirst(work)} for ${caseType.name.toLowerCase()} cases: how the loss is built, which records drive it, and testimony support.`;
  // The audience tag rides along only while the description stays inside the
  // 160-character SERP window.
  return base.length + " Either side.".length <= 160 ? `${base} Either side.` : base;
}

export default function ServiceCaseType() {
  const { serviceSlug = "", typeSlug = "" } = useParams();
  const service = pillarServices().find((s) => s.slug === serviceSlug);
  const caseType = getCaseType(typeSlug);
  // Only the pairs a pillar declares in services.ts are pages: the set
  // serviceCaseTypePairs() enumerates for the prerender and the sitemap, and
  // the set ServicePillar links. An undeclared pair is sent to the pillar, the
  // same 301 server.js answers for its address, so this route never renders a
  // page that nothing links to.
  const declared = Boolean(service && caseType && service.caseTypes.includes(caseType.slug));
  const work = service ? workPhrase(service.shortName) : "";

  const url =
    service && caseType && declared
      ? `${ORG_URL}/services/${service.slug}/case/${caseType.slug}`
      : "";
  const heading =
    service && caseType ? `${service.name} for ${caseType.name} Cases` : "";
  usePageMeta(
    service && caseType && declared
      ? {
          title: pairTitle(service, caseType, ORG_NAME),
          description: pairDescription(service, caseType),
          canonical: url,
        }
      : null,
  );

  if (!service || !caseType) return <NotFound />;
  if (!declared) return <Navigate to={`/services/${service.slug}`} replace />;

  // The pair note (services.ts caseTypeNotes, keyed by case-type slug) carries
  // the pair's summary and its two FAQs. Every declared pair has one; the
  // guard keeps a note-less pair rendering the shared sections with no FAQ
  // block or FAQPage markup, so the case-type hub stays the FAQ owner.
  const note = service.caseTypeNotes[caseType.slug];
  const siblings = servicesForCaseType(caseType.slug).filter((s) => s.slug !== service.slug);
  const finalStep = service.process?.at(-1);
  // The state tier of this pair (wave 2): only the states whose batch has
  // shipped are pages, so only those are linked.
  const stateTier = releasedStates()
    .map((slug) => states.find((s) => s.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: service.name, url: `/services/${service.slug}` },
        { name: caseType.name, url: `/services/${service.slug}/case/${caseType.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{heading}</h1>
      <AuthorByline dateModified={service.dateModified} />
      <p className="text-lg text-neutral-700 mb-8">
        {capFirst(work)} applied to {caseType.name.toLowerCase()} litigation: methodology, deliverables, and case-specific considerations.
      </p>

      <section id="application" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">How {service.name} applies to {caseType.name}</h2>
        {note && <p className="text-neutral-700 mb-3">{note.summary}</p>}
        <p className="text-neutral-700">{service.description}</p>
      </section>
      <section id="loss-components" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">What the economic claim consists of</h2>
        <p className="text-neutral-700">{caseType.lossComponents}</p>
      </section>
      {finalStep && (
        <section id="deliverables" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Typical deliverables</h2>
          <p className="text-neutral-700">{finalStep.description}</p>
        </section>
      )}

      {stateTier.length > 0 && (
        <section id="by-state" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{service.shortName} for {caseType.name} by state</h2>
          <p className="text-neutral-700 mb-2">
            Each state page adds the courts, the expert standard, and the damages framework the report is built around in that venue.
          </p>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {stateTier.map((s) => (
              <li key={s.slug}>
                <Link to={serviceCaseStatePath(service.slug, caseType.slug, s.slug)} className="text-navy hover:text-amber-dark hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Crawl path out of the pair page: the case-type hub, the other
          pillars that declare this case type (declared pairs only), the
          pillar's engagement details, and the attorney-stage guides. */}
      <section id="related-pages" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Related pages</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li>
            <Link to={`/case-types/${caseType.slug}`} className={LINK_CLASS}>
              {caseType.name}: the economic claim, where the damages concentrate, and how the analysis is built
            </Link>
          </li>
          {siblings.map((s) => (
            <li key={s.slug}>
              <Link to={`/services/${s.slug}/case/${caseType.slug}`} className={LINK_CLASS}>
                {s.shortName} for {caseType.name}
              </Link>
            </li>
          ))}
          {([
            ["cost", "Cost and fee structure"],
            ["process", "Engagement process"],
            ["timeline", "Typical timeline"],
          ] as const).map(([variant, label]) => (
            <li key={variant}>
              <Link to={`/services/${service.slug}/${variant}`} className={LINK_CLASS}>
                {label} for {service.shortName}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="attorney-guides" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Attorney guides for {caseType.name.toLowerCase()} cases</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ATTORNEY_STAGES.map((stage) => (
            <li key={stage.slug}>
              <Link
                to={`/attorneys/${stage.slug}/${caseType.slug}`}
                className="block rounded-lg border border-neutral-200 p-3 hover:border-navy hover:shadow transition"
              >
                <div className="font-semibold text-navy">{stage.label}</div>
                <div className="text-sm text-neutral-600 mt-1">{caseType.name} cases</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <ContactCTA context={service.shortName} />

      {note && <FAQBlock faqs={note.faqs} title={`Frequently asked: ${service.shortName} in ${caseType.name.toLowerCase()} matters`} />}
      <RelatedContent items={service.related.slice(0, 3)} heading="Guides and methods" />
      <SourcesBlock sources={service.sources.slice(0, 5)} />

      <SchemaOrg data={graphSchema([
        organizationSchema(),
        serviceSchema({
          url,
          name: heading,
          description: pairDescription(service, caseType),
          dateModified: service.dateModified,
        }),
        ...(note ? [faqPageSchema(note.faqs, url)] : []),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Services", url: `${ORG_URL}/services` },
          { name: service.name, url: `${ORG_URL}/services/${service.slug}` },
          { name: caseType.name, url },
        ]),
      ])} />
    </article>
  );
}
