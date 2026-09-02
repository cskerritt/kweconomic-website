import { useParams, Link, Navigate } from "react-router-dom";
import { ChevronRight, ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import { getPostBySlug, getRelatedPosts, formatPublishedDate, insightBlocks, insightHeadings } from "@/data/insights";
import NextSteps from "@/components/NextSteps";
import AuthorByline from "@/components/AuthorByline";
import RelatedContent from "@/components/RelatedContent";
import SourcesBlock from "@/components/SourcesBlock";
import { renderTextWithLinks } from "@/lib/richtext";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, blogPostingSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";

// The H1 and the lead paragraph (.kw-lead) are the units an answer engine
// should read aloud or quote; every editorial template marks the same pair.
const SPEAKABLE = { speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".kw-lead"] } };

const categoryColors: Record<string, string> = {
  Legal: "bg-navy/10 text-navy",
  Economics: "bg-amber/10 text-amber-dark",
  Valuation: "bg-forest/10 text-forest",
};

export default function InsightPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const related = post ? getRelatedPosts(post.slug, post.category) : [];

  usePageMeta(
    post
      ? {
          // metaTitle keeps the <title> under 60 chars where the descriptive H1 runs long.
          title: `${post.metaTitle ?? post.title} | ${ORG_NAME}`,
          description: post.metaDescription,
          canonical: `${ORG_URL}/insights/${post.slug}`,
        }
      : { title: `Insights | ${ORG_NAME}`, description: `Insights and articles from ${ORG_NAME}`, canonical: `${ORG_URL}/insights` }
  );

  if (!post) {
    return <Navigate to="/insights" replace />;
  }

  const postUrl = `${ORG_URL}/insights/${post.slug}`;
  const blocks = insightBlocks(post.content);
  const headings = insightHeadings(post.content);

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          {
            ...blogPostingSchema({
              title: post.title,
              description: post.excerpt,
              url: postUrl,
              datePublished: post.publishedDate,
              dateModified: post.dateModified ?? post.publishedDate,
              authorSlug: post.authorSlug,
            }),
            ...SPEAKABLE,
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Insights", url: `${ORG_URL}/insights` },
            { name: post.title, url: postUrl },
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
              <Link to="/insights" className="hover:text-teal transition-colors">
                Insights
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li className="text-navy font-medium truncate max-w-xs">{post.title}</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  categoryColors[post.category] ?? "bg-white/10 text-white"
                }`}
              >
                {post.category}
              </span>
              <time dateTime={post.publishedDate} className="text-sm text-neutral-500 font-mono">
                {formatPublishedDate(post.publishedDate)}
              </time>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
              {post.title}
            </h1>
            <p className="kw-lead text-lg text-neutral-300 leading-relaxed">{post.excerpt}</p>
          </div>
        </div>
      </section>

      {/* Article + Sidebar */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-12 items-start">
            {/* Article body */}
            <article>
              <AuthorByline slug={post.authorSlug} datePublished={post.publishedDate} dateModified={post.dateModified ?? post.publishedDate} />
              <div className="space-y-5">
                {blocks.map((block, idx) =>
                  block.type === "heading" ? (
                    <h2
                      key={block.id}
                      id={block.id}
                      className="font-serif text-2xl md:text-3xl font-bold text-navy pt-4 leading-snug scroll-mt-24"
                    >
                      {block.text}
                    </h2>
                  ) : (
                    <p key={idx} className="text-neutral-700 leading-relaxed text-base md:text-lg">
                      {renderTextWithLinks(block.text)}
                    </p>
                  ),
                )}
              </div>

              <RelatedContent heading="Related reading" items={post.related ?? []} />

              <SourcesBlock sources={post.sources ?? []} />

              <div className="mt-12">
                <NextSteps context={post.category} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="mt-12 lg:mt-0">
              <div className="sticky top-24 space-y-6">
                {/* In-page contents */}
                {headings.length > 0 && (
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                      In This Article
                    </h3>
                    <nav aria-label="Article sections" className="space-y-1">
                      {headings.map((h) => (
                        <a
                          key={h.id}
                          href={`#${h.id}`}
                          className="block text-sm text-neutral-600 hover:text-teal px-2 py-1.5 rounded hover:bg-teal/5 transition-colors leading-snug"
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  </div>
                )}

                {/* Related posts */}
                {related.length > 0 && (
                  <div className="bg-white rounded-xl border border-neutral-200 p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                      Related Articles
                    </h3>
                    <div className="space-y-4">
                      {related.map((rp) => (
                        <Link
                          key={rp.slug}
                          to={`/insights/${rp.slug}`}
                          className="block group"
                        >
                          <p className="text-sm font-medium text-navy group-hover:text-teal transition-colors leading-snug mb-1">
                            {rp.title}
                          </p>
                          <time dateTime={rp.publishedDate} className="block text-xs text-neutral-500 font-mono">
                            {formatPublishedDate(rp.publishedDate)}
                          </time>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to all */}
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-5">
                  <Link
                    to="/insights"
                    className="text-sm text-teal hover:text-teal-dark font-medium transition-colors flex items-center gap-1"
                  >
                    &larr; All Insights
                  </Link>
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <Link
                      to="/knowledge"
                      className="text-sm text-navy hover:text-teal font-medium transition-colors flex items-center gap-1"
                    >
                      Knowledge Center <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <p className="text-xs text-neutral-500 mt-1">
                      In-depth guides on economic damages, expert testimony, and the
                      methods behind a defensible damages figure.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
