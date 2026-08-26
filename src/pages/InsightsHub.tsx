import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { insightPosts, insightCategories } from "@/data/insights";
import Reveal from "@/components/Reveal";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  Vocational: "bg-teal/10 text-teal",
  Legal: "bg-navy/10 text-navy",
  "Life Care Planning": "bg-forest/10 text-forest",
  Economics: "bg-amber/10 text-amber-dark",
};

export default function InsightsHub() {
  usePageMeta({
    title: "Insights | KWVRS",
    description:
      "Articles on vocational rehabilitation, forensic economics, life care planning, and expert witness standards - from the practitioners at Kincaid Wolstein Vocational and Rehabilitation Services.",
    canonical: "https://kwvrs.com/insights",
  });

  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? insightPosts
      : insightPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Articles &amp; Analysis
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Insights
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Practical articles on vocational rehabilitation, forensic economics, life care
              planning, and the legal standards that govern expert testimony - written for
              attorneys and legal professionals navigating damages issues.
            </p>
          </div>
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {insightCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-navy text-white"
                    : "bg-white text-neutral-600 border border-neutral-300 hover:border-navy hover:text-navy"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Post grid */}
          <Reveal as="div" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                to={`/insights/${post.slug}`}
                className="group bg-white rounded-xl border border-neutral-200 hover:border-teal hover:shadow-md transition-all flex flex-col"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        categoryColors[post.category] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">
                      {formatDate(post.publishedDate)}
                    </span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-navy group-hover:text-teal transition-colors leading-snug mb-3 flex-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <span className="text-sm text-teal font-medium flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </Reveal>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-neutral-500">
              No posts in this category yet.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
