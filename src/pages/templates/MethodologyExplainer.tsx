import { useParams } from "react-router-dom";
import { truncateAtWord } from "@/lib/text";
import { renderTextWithLinks } from "@/lib/richtext";
import { methods, getMethod } from "@/data/methods";
import { getServiceBySlug } from "@/data/services";
import type { Service } from "@/types";
import PaginateNav from "@/components/PaginateNav";
import Breadcrumbs from "@/components/Breadcrumbs";
import NextSteps from "@/components/NextSteps";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import RelatedContent from "@/components/RelatedContent";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, howToSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

// The H1 and the lead paragraph (.kw-lead) are the units an answer engine
// should read aloud or quote; every editorial template marks the same pair.
const SPEAKABLE = { speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".kw-lead"] } };

export default function MethodologyExplainer() {
  const { slug = "" } = useParams();
  const m = getMethod(slug);
  const url = m ? `${ORG_URL}/methods/${m.slug}` : "";
  usePageMeta(
    m
      ? {
          // "<name> Method | <brand>" (or the bare name when it already ends in
          // "Methodology"); scripts/prerender.mjs must mirror this for the shells.
          title: `${m.name.endsWith("Methodology") ? m.name : `${m.name} Method`} | ${ORG_NAME}`,
          description: m.metaDescription,
          canonical: url,
        }
      : null,
  );
  if (!m) return <NotFound />;
  const idx = methods.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? { label: methods[idx - 1].name, href: `/methods/${methods[idx - 1].slug}` } : undefined;
  const next = idx < methods.length - 1 ? { label: methods[idx + 1].name, href: `/methods/${methods[idx + 1].slug}` } : undefined;

  // The pillar services this method feeds, in the entry's curated order, with
  // a descriptive anchor and the service's own opening lines.
  const relatedServices = m.relevantServices
    .map((s) => getServiceBySlug(s))
    .filter((s): s is Service => Boolean(s && s.pillar))
    .map((s) => ({ title: s.name, href: `/services/${s.slug}`, description: truncateAtWord(s.description, 120) }));

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Methods", url: "/methods" },
        { name: m.name, url: `/methods/${m.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{m.name}</h1>
      <AuthorByline slug={m.authorSlug} datePublished={m.datePublished} dateModified={m.dateModified} />
      <p className="kw-lead text-lg text-neutral-700 mb-8">{m.summary}</p>

      <section id="when-used" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">When it is used</h2>
        <p className="text-neutral-700">{renderTextWithLinks(m.whenUsed)}</p>
      </section>
      {m.steps.length > 0 && (
        <section id="steps" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Step-by-step</h2>
          <ol className="list-decimal ml-5 text-neutral-700 space-y-2">
            {m.steps.map((s, i) => <li key={i}>{renderTextWithLinks(s)}</li>)}
          </ol>
        </section>
      )}
      {m.dataSources.length > 0 && (
        <section id="data-sources" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Data sources</h2>
          <ul className="list-disc ml-5 text-neutral-700 space-y-1">
            {m.dataSources.map((d, i) => <li key={i}>{renderTextWithLinks(d)}</li>)}
          </ul>
        </section>
      )}
      <section id="limitations" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Limitations</h2>
        <p className="text-neutral-700">{renderTextWithLinks(m.limitations)}</p>
      </section>
      <section id="daubert" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Admissibility</h2>
        <p className="text-neutral-700">{renderTextWithLinks(m.admissibilityHistory)}</p>
      </section>

      <FAQBlock faqs={m.faqs} />
      <RelatedContent heading="Services that use this method" items={relatedServices} />
      <SourcesBlock sources={m.sources} />
      <div className="mt-10">
        <NextSteps />
      </div>
      <PaginateNav prev={prev} next={next} backHref="/methods" backLabel="All methods" />

      <SchemaOrg data={graphSchema([
        {
          ...articleSchema({
            title: m.name,
            description: m.summary,
            url,
            datePublished: m.datePublished,
            dateModified: m.dateModified,
            authorSlug: m.authorSlug,
          }),
          ...SPEAKABLE,
        },
        howToSchema({ name: m.name, description: m.summary, steps: m.steps }),
        faqPageSchema(m.faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Methods", url: `${ORG_URL}/methods` },
          { name: m.name, url },
        ]),
      ])} />
    </article>
  );
}
