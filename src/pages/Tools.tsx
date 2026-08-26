import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, ExternalLink } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import ContactCTA from "@/components/ContactCTA";
import CrossSell from "@/components/CrossSell";
import { ORG_SHORT } from "@/lib/brand";

/**
 * /tools hub - the one attorney-facing interactive tool on kwlcp.com: the
 * public, indexed life expectancy lookup. The economic-damages estimator and
 * household-services valuator live on kwvrs.com and are cross-linked below.
 */
export default function Tools() {
  usePageMeta({
    title: `Attorney Tools | ${ORG_SHORT}`,
    description:
      "Free life expectancy lookup for attorneys and life care planners from the CDC United States Life Tables, plus links to our sister practices' economic damages calculators.",
    canonical: "/tools",
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-navy text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-teal-light uppercase tracking-[0.18em] text-xs font-semibold mb-3">Attorney tools</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Planning tools for counsel</h1>
          <p className="text-neutral-200 max-w-2xl text-lg">
            Free, planning-level tools for case evaluation - built by the same team that prepares
            court-ready life care plans and medical cost projections for plaintiff and defense counsel.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 md:grid-cols-3">
          <Link
            to="/tools/life-expectancy"
            className="kw-lift group rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm hover:shadow-lg hover:border-teal/40 transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/10 text-teal mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy mb-2">Life expectancy calculator</h2>
            <p className="text-neutral-600 mb-4">
              Look up remaining life expectancy by age, sex, and population group from the CDC United
              States Life Tables, 2023. Results are population averages, not a prediction for any individual.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
              Look up life expectancy <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-4">
          <p className="text-neutral-700 max-w-3xl">
            Looking for the economic damages estimator or the household services valuator? Those
            calculators are hosted by our sister vocational and economics practice at{" "}
            <a
              href="https://kwvrs.com/tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal font-medium hover:underline"
            >
              kwvrs.com/tools <ExternalLink className="w-3.5 h-3.5" />
            </a>
            .
          </p>
          <p className="text-xs text-neutral-500 max-w-3xl">
            This tool produces planning-level estimates only. It is not an expert opinion, report,
            or testimony, and assumptions vary by case facts and jurisdiction.
          </p>
        </div>
      </section>

      <ContactCTA />
      <CrossSell />
    </div>
  );
}
