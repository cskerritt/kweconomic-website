import { useParams } from "react-router-dom";
import { truncateAtWord } from "@/lib/text";
import { guides } from "@/data/guides";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import TOCSidebar from "@/components/TOCSidebar";
import RelatedContent from "@/components/RelatedContent";
import NextSteps from "@/components/NextSteps";
import PaginateNav from "@/components/PaginateNav";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, faqPageSchema, breadcrumbSchema } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

export default function PillarGuide() {
  const { slug = "" } = useParams();
  const guide = guides.find((g) => g.slug === slug);

  const url = guide ? `https://kwvrs.com/guides/${guide.slug}` : "";
  usePageMeta(
    guide
      ? {
          title: `${guide.title} | KWVRS`,
          description: truncateAtWord(guide.tldr),
          canonical: url,
        }
      : null,
  );

  if (!guide) return <NotFound />;

  const tocItems = guide.sections?.map((s) => ({ id: s.id, label: s.heading })) ?? [];
  const idx = guides.findIndex((g) => g.slug === slug);
  const prev = idx > 0 ? { label: guides[idx - 1].title, href: `/guides/${guides[idx - 1].slug}` } : undefined;
  const next = idx < guides.length - 1 ? { label: guides[idx + 1].title, href: `/guides/${guides[idx + 1].slug}` } : undefined;

  return (
    <article className="max-w-6xl mx-auto px-4 py-8 lg:grid lg:grid-cols-[1fr_16rem] lg:gap-8">
      <div>
        <Breadcrumbs items={[
          { name: "Home", url: "/" },
          { name: "Guides", url: "/guides" },
          { name: guide.title, url: `/guides/${guide.slug}` },
        ]} />
        <h1 className="font-serif text-4xl text-navy mb-4">{guide.title}</h1>
        <AuthorByline slug={guide.authorSlug} dateModified={guide.dateModified} />
        <p className="text-lg text-neutral-700 mb-8">{guide.tldr}</p>

        {guide.sections?.map((s) => (
          <section key={s.id} id={s.id} className="mb-8">
            <h2 className="font-serif text-2xl text-navy mb-3">{s.heading}</h2>
            <div className="prose prose-neutral max-w-none" dangerouslySetInnerHTML={{ __html: s.bodyHtml }} />
          </section>
        ))}

        <FAQBlock faqs={guide.faqs ?? []} />
        <RelatedContent items={guide.related ?? []} />
        <SourcesBlock sources={guide.sources ?? []} />
        <div className="mt-10">
          <NextSteps />
        </div>
        <PaginateNav prev={prev} next={next} backHref="/guides" backLabel="All guides" />
      </div>
      <TOCSidebar items={tocItems} />

      <SchemaOrg data={graphSchema([
        articleSchema({
          title: guide.title,
          description: guide.tldr,
          url,
          dateModified: guide.dateModified,
          authorSlug: guide.authorSlug,
          image: guide.image,
        }),
        faqPageSchema(guide.faqs ?? [], url),
        breadcrumbSchema([
          { name: "Home", url: "https://kwvrs.com/" },
          { name: "Guides", url: "https://kwvrs.com/guides" },
          { name: guide.title, url },
        ]),
      ])} />
    </article>
  );
}
