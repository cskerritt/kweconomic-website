import { useParams, Link } from "react-router-dom";
import { renderTextWithLinks } from "@/lib/richtext";
import { comparisons } from "@/data/comparisons";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import PaginateNav from "@/components/PaginateNav";
import RelatedContent from "@/components/RelatedContent";
import NextSteps from "@/components/NextSteps";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

// The H1 and the lead paragraph (.kw-lead) are the units an answer engine
// should read aloud or quote; every editorial template marks the same pair.
const SPEAKABLE = { speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".kw-lead"] } };

export default function Comparison() {
  const { slug = "" } = useParams();
  const c = comparisons.find((x) => x.slug === slug);
  const url = c ? `${ORG_URL}/compare/${c.slug}` : "";
  usePageMeta(
    c
      ? {
          // metaTitle keeps the <title> under 60 chars where the descriptive H1 runs long.
          title: `${c.metaTitle ?? c.title} | ${ORG_NAME}`,
          // The one-sentence answer is the meta description, the lead, and the
          // Article description (the /compare hub cards are to adopt it too).
          description: c.answer,
          canonical: url,
        }
      : null,
  );
  if (!c) return <NotFound />;
  const idx = comparisons.findIndex((x) => x.slug === slug);
  const prev = idx > 0 ? { label: comparisons[idx - 1].title, href: `/compare/${comparisons[idx - 1].slug}` } : undefined;
  const next = idx < comparisons.length - 1 ? { label: comparisons[idx + 1].title, href: `/compare/${comparisons[idx + 1].slug}` } : undefined;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Compare", url: "/compare" },
        { name: c.title, url: `/compare/${c.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{c.title}</h1>
      <AuthorByline slug={c.authorSlug} datePublished={c.datePublished} dateModified={c.dateModified} />
      {/* The answer block: the difference and the verdict, stated before the definition cards. */}
      <p className="kw-lead text-lg text-neutral-700 mb-8">{c.answer}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="font-semibold text-navy">{c.a.label}</h2>
          <p className="text-sm text-neutral-700 mt-2">{renderTextWithLinks(c.a.summary)}</p>
          {c.a.url && (
            <Link to={c.a.url} className="mt-3 inline-block text-sm font-medium text-teal hover:text-teal-dark">
              Learn more about {c.a.label} &rarr;
            </Link>
          )}
        </div>
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="font-semibold text-navy">{c.b.label}</h2>
          <p className="text-sm text-neutral-700 mt-2">{renderTextWithLinks(c.b.summary)}</p>
          {c.b.url && (
            <Link to={c.b.url} className="mt-3 inline-block text-sm font-medium text-teal hover:text-teal-dark">
              Learn more about {c.b.label} &rarr;
            </Link>
          )}
        </div>
      </div>

      <table className="w-full border border-neutral-200 mb-8">
        <caption className="sr-only">{c.a.label} compared with {c.b.label}, by dimension</caption>
        <thead className="bg-neutral-50">
          <tr>
            <th scope="col" className="text-left p-2">Dimension</th>
            <th scope="col" className="text-left p-2">{c.a.label}</th>
            <th scope="col" className="text-left p-2">{c.b.label}</th>
          </tr>
        </thead>
        <tbody>
          {c.rows.map((r) => (
            <tr key={r.dimension} className="border-t border-neutral-200">
              <th scope="row" className="text-left p-2 font-medium">{r.dimension}</th>
              <td className="p-2">{r.a}</td>
              <td className="p-2">{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section id="when-a" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">When to use {c.a.label}</h2>
        <p className="text-neutral-700">{renderTextWithLinks(c.whenUseA)}</p>
      </section>
      <section id="when-b" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">When to use {c.b.label}</h2>
        <p className="text-neutral-700">{renderTextWithLinks(c.whenUseB)}</p>
      </section>
      <section id="overlap" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Where they overlap</h2>
        <p className="text-neutral-700">{renderTextWithLinks(c.overlap)}</p>
      </section>

      <FAQBlock faqs={c.faqs} />
      <SourcesBlock sources={c.sources} />
      {c.related && c.related.length > 0 && (
        <RelatedContent items={c.related} />
      )}
      <div className="mt-10">
        <NextSteps />
      </div>
      <PaginateNav prev={prev} next={next} backHref="/compare" backLabel="All comparisons" />

      <SchemaOrg data={graphSchema([
        {
          ...articleSchema({
            title: c.title,
            description: c.answer,
            url,
            datePublished: c.datePublished,
            dateModified: c.dateModified,
            authorSlug: c.authorSlug,
          }),
          ...SPEAKABLE,
        },
        faqPageSchema(c.faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Compare", url: `${ORG_URL}/compare` },
          { name: c.title, url },
        ]),
      ])} />
    </article>
  );
}
