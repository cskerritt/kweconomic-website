import { useParams, Link, Navigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import { getGuideBySlug } from "@/data/knowledge";
import NextSteps from "@/components/NextSteps";
import AuthorByline from "@/components/AuthorByline";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import { renderTextWithLinks } from "@/lib/richtext";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, articleSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";

// The H1 and the lead paragraph (.kw-lead) are the units an answer engine
// should read aloud or quote; every editorial template marks the same pair.
const SPEAKABLE = { speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".kw-lead"] } };

export default function KnowledgeArticle() {
  const { slug } = useParams<{ slug: string }>();
  const guide = slug ? getGuideBySlug(slug) : undefined;

  usePageMeta(
    guide
      ? {
          // metaTitle carries the primary query where the short H1 leaves room.
          title: `${guide.metaTitle ?? guide.title} | ${ORG_NAME}`,
          description: guide.metaDescription,
          canonical: `${ORG_URL}/knowledge/${guide.slug}`,
        }
      : { title: `Knowledge Center | ${ORG_NAME}`, description: `Educational resources from ${ORG_NAME}`, canonical: `${ORG_URL}/knowledge` }
  );

  if (!guide) {
    return <Navigate to="/knowledge" replace />;
  }

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const guideUrl = `${ORG_URL}/knowledge/${guide.slug}`;
  const reviewedDate = guide.dateModified ?? "2026-05-03";
  const publishedDate = guide.datePublished ?? reviewedDate;
  const faqs = guide.faqs ?? [];
  const keyPoints = guide.keyPoints ?? [];

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          {
            ...articleSchema({
              title: guide.title,
              description: guide.description,
              url: guideUrl,
              dateModified: reviewedDate,
              datePublished: publishedDate,
              authorSlug: guide.authorSlug,
            }),
            ...SPEAKABLE,
          },
          ...(faqs.length ? [faqPageSchema(faqs, guideUrl)] : []),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Knowledge", url: `${ORG_URL}/knowledge` },
            { name: guide.title, url: guideUrl },
          ]),
        ])}
      />
      {/* Breadcrumbs */}
      <nav className="bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
            <li>
              <Link to="/" className="hover:text-teal transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li>
              <Link to="/knowledge" className="hover:text-teal transition-colors">
                Knowledge
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li className="text-navy font-medium truncate max-w-xs">{guide.title}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Knowledge Center
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-4">
              {guide.title}
            </h1>
            <p className="kw-lead text-lg text-neutral-300 leading-relaxed">{guide.description}</p>
          </div>
        </div>
      </section>

      {/* Article + Sidebar */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12 items-start">
            {/* Article content */}
            <article className="prose prose-lg max-w-none">
              <AuthorByline slug={guide.authorSlug} datePublished={publishedDate} dateModified={reviewedDate} />

              {keyPoints.length > 0 && (
                <section aria-labelledby="key-points-heading" className="not-prose mb-12 rounded-xl border border-neutral-200 bg-neutral-50 p-6">
                  <h2 id="key-points-heading" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                    Key points
                  </h2>
                  <ul className="list-disc ml-5 space-y-2 text-neutral-700 text-base">
                    {keyPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </section>
              )}

              {guide.sections.map((section, idx) => {
                const sectionId = `section-${idx}`;
                return (
                  <div key={idx} id={sectionId} className="mb-12 scroll-mt-24">
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-4 leading-snug">
                      {section.heading}
                    </h2>
                    <div className="space-y-4">
                      {section.content.split("\n\n").map((para, pIdx) => (
                        <p key={pIdx} className="text-neutral-700 leading-relaxed text-base md:text-lg">
                          {renderTextWithLinks(para.trim())}
                        </p>
                      ))}
                    </div>
                    {idx < guide.sections.length - 1 && (
                      <hr className="mt-12 border-neutral-200" />
                    )}
                  </div>
                );
              })}

              <FAQBlock faqs={faqs} />

              <SourcesBlock sources={guide.sources ?? []} />

              <div className="mt-10">
                <NextSteps context={guide.title} />
              </div>
            </article>

            {/* Sidebar - Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                  In This Guide
                </h3>
                <nav aria-label="Guide sections" className="space-y-1">
                  {guide.sections.map((section, idx) => {
                    const sectionId = `section-${idx}`;
                    return (
                      // Fragment links so the sections are addressable without
                      // JavaScript; the click handler only smooths the scroll.
                      <a
                        key={idx}
                        href={`#${sectionId}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleScrollTo(sectionId);
                          window.history.replaceState(null, "", `#${sectionId}`);
                        }}
                        className="block w-full text-left text-sm text-neutral-600 hover:text-teal px-2 py-1.5 rounded hover:bg-teal/5 transition-colors leading-snug"
                      >
                        {section.heading}
                      </a>
                    );
                  })}
                </nav>

                <div className="mt-6 pt-6 border-t border-neutral-200">
                  <Link
                    to="/knowledge"
                    className="text-sm text-teal hover:text-teal-dark font-medium transition-colors"
                  >
                    &larr; All Guides
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
