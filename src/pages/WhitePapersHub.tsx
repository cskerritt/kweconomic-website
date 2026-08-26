import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";
import { ICONS } from "@/lib/icons";
import { whitePapers } from "@/data/whitePapers";
import { usePageMeta } from "@/hooks/use-page-meta";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import Reveal from "@/components/Reveal";
import { useTilt } from "@/hooks/use-pointer-fx";

function PaperCard({ slug, title, subtitle, discipline, icon, readingTime }: typeof whitePapers[number]) {
  const tiltRef = useTilt<HTMLAnchorElement>();
  const Icon = ICONS[icon] ?? FileText;
  return (
    <Link
      ref={tiltRef}
      to={`/white-papers/${slug}`}
      className="kw-tilt group relative block h-full rounded-xl border border-neutral-200 bg-white p-6 hover:border-amber hover:shadow-xl transition-shadow"
    >
      <span className="kw-tilt-glow" aria-hidden="true" />
      <div className="relative z-[2]">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex w-12 h-12 rounded-lg bg-navy/5 items-center justify-center text-navy transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <Icon className="w-6 h-6" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-dark">
            {discipline}
          </span>
        </div>
        <h3 className="font-serif text-xl font-bold text-navy mb-2 group-hover:text-amber-dark transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{subtitle}</p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-dark">
          Read white paper <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
        <span className="block text-xs text-neutral-500 mt-2">{readingTime}</span>
      </div>
    </Link>
  );
}

export default function WhitePapersHub() {
  usePageMeta({
    title: "White Papers | Forensic Methodology | KWVRS",
    description:
      "In-depth white papers on the methodology behind defensible vocational, economic, and life care expert opinions. From Kincaid Wolstein Vocational and Rehabilitation Services.",
    canonical: `${ORG_URL}/white-papers`,
  });

  return (
    <div className="min-h-screen bg-neutral-50 overflow-x-clip">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "White Papers", url: `${ORG_URL}/white-papers` },
          ]),
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "White Papers" }]} />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white border-b border-navy-dark">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="kw-enter text-amber-light text-xs font-semibold uppercase tracking-[0.18em] mb-5">
            Methodology &middot; Research
          </p>
          <h1 className="kw-enter kw-enter-1 font-serif text-4xl lg:text-5xl font-bold leading-[1.05] mb-4 max-w-3xl">
            <span className="kw-gradient-text">White papers</span> on defensible expert methodology
          </h1>
          <p className="kw-enter kw-enter-2 text-lg text-neutral-300 max-w-2xl">
            Detailed, objective treatments of how KWVRS builds vocational, economic, and life care
            opinions that can be examined and tested. Written for attorneys who want to understand the
            method, not just the conclusion.
          </p>
        </div>
      </section>

      {/* Papers grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {whitePapers.map((wp, i) => (
            <Reveal key={wp.slug} delay={i * 70}>
              <PaperCard {...wp} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
