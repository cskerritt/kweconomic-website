import { useParams, Navigate, Link } from "react-router-dom";
import { truncateAtWord } from "@/lib/text";
import { ArrowRight, Check, FileText } from "lucide-react";
import { ICONS } from "@/lib/icons";
import { getWhitePaperBySlug } from "@/data/whitePapers";
import { getServiceBySlug } from "@/data/services";
import { usePageMeta } from "@/hooks/use-page-meta";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import WhitePaperGate from "@/components/WhitePaperGate";
import SourcesBlock from "@/components/SourcesBlock";
import NextSteps from "@/components/NextSteps";

export default function WhitePaper() {
  const { slug } = useParams<{ slug: string }>();
  const paper = slug ? getWhitePaperBySlug(slug) : undefined;

  usePageMeta(
    paper
      ? {
          title: `${paper.title} | White Paper | KWVRS`,
          description: truncateAtWord(paper.summary),
          canonical: `${ORG_URL}/white-papers/${paper.slug}`,
        }
      : null,
  );

  if (!paper) return <Navigate to="/white-papers" replace />;

  const Icon = ICONS[paper.icon] ?? FileText;
  const service = getServiceBySlug(paper.serviceSlug);
  const url = `${ORG_URL}/white-papers/${paper.slug}`;

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-clip">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          articleSchema({
            title: paper.title,
            description: paper.summary,
            url,
            dateModified: paper.dateModified,
            authorSlug: paper.authorSlug,
          }),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "White Papers", url: `${ORG_URL}/white-papers` },
            { name: paper.title, url },
          ]),
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav
          items={[
            { label: "White Papers", href: "/white-papers" },
            { label: paper.title },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white border-b border-navy-dark">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="flex items-center gap-3 mb-5">
            <span className="kw-enter kw-float inline-flex w-14 h-14 rounded-2xl bg-amber/15 border border-amber/30 items-center justify-center text-amber shadow-lg shadow-amber/10">
              <Icon className="w-7 h-7" />
            </span>
            <span className="kw-enter text-amber-light text-xs font-semibold uppercase tracking-[0.18em]">
              {paper.discipline} &middot; {paper.readingTime}
            </span>
          </div>
          <h1 className="kw-enter kw-enter-1 font-serif text-4xl lg:text-5xl font-bold leading-[1.08] mb-4">
            {paper.title}
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300">{paper.subtitle}</p>
        </div>
      </section>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Abstract */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 lg:p-8 mb-10">
          <h2 className="font-serif text-lg font-bold text-navy mb-2">Abstract</h2>
          <p className="text-neutral-700 leading-relaxed">{paper.summary}</p>
        </div>

        {/* Key takeaways */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-navy mb-4">Key takeaways</h2>
          <ul className="space-y-3">
            {paper.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-3 text-neutral-700">
                <Check className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What's inside (outline) */}
        <div className="mb-10 rounded-xl border border-neutral-200 bg-neutral-100/60 p-6">
          <h2 className="font-serif text-lg font-bold text-navy mb-3">What is inside</h2>
          <ol className="space-y-1.5 text-sm text-neutral-700 list-decimal list-inside">
            {paper.sections.map((s, i) => (
              <li key={i}>{s.heading}</li>
            ))}
          </ol>
        </div>

        {/* Gated reader */}
        <WhitePaperGate paper={paper} />

        {/* Sources */}
        <SourcesBlock sources={paper.sources ?? []} />

        {/* Cross-link to the related service */}
        {service && (
          <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-6">
            <p className="text-sm text-neutral-600 mb-1">Related practice area</p>
            <Link
              to={`/services/${service.slug}`}
              className="group inline-flex items-center gap-2 font-serif text-xl font-bold text-navy hover:text-amber-dark transition-colors"
            >
              {service.shortName}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}

        <div className="mt-10">
          <NextSteps context={paper.discipline} />
        </div>
      </article>
    </div>
  );
}
