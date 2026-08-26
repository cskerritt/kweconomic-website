import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { knowledgeGuides } from "@/data/knowledge";
import Reveal from "@/components/Reveal";
import { ORG_NAME, SITE_URL } from "@/lib/brand";

export default function KnowledgeHub() {
  usePageMeta({
    title: `Knowledge Center | ${ORG_NAME}`,
    description:
      "In-depth guides on life care planning, medical cost projection, Medicare set-asides, and expert witness testimony - written for attorneys and other legal professionals.",
    canonical: `${SITE_URL}/knowledge`,
  });

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Educational Resources
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Knowledge Center
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Authoritative guides on vocational rehabilitation, life care planning, forensic
              economics, and expert witness practice - written to help attorneys and legal
              professionals understand the methodologies behind damages analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Guide grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="font-serif text-2xl font-bold text-navy">Pillar Guides</h2>
            <p className="mt-2 text-neutral-600">
              Each guide covers a core topic in depth, with sections on methodology, standards,
              and practical considerations for litigation.
            </p>
          </div>

          <Reveal as="div" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {knowledgeGuides.map((guide) => (
              <Link
                key={guide.slug}
                to={`/knowledge/${guide.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 p-6 hover:border-teal hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl font-bold text-navy group-hover:text-teal transition-colors leading-snug mb-2">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500 font-mono">
                        {guide.sections.length} sections
                      </span>
                      <span className="text-sm text-teal font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read guide <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-navy-light rounded-xl p-8 text-white">
            <h3 className="font-serif text-2xl font-bold mb-2">Questions About Your Case?</h3>
            <p className="text-neutral-300 mb-6">
              The guides here provide general educational background. For analysis specific to your
              matter, contact our team to discuss how {ORG_NAME} can assist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/schedule-consultation"
                className="inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Schedule a Consultation <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/insights"
                className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Browse Insights
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
