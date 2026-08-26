import { Link } from "react-router-dom";
import { Calculator, ArrowRight, House, HeartPulse } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import ContactCTA from "@/components/ContactCTA";

/**
 * /tools hub - attorney-facing interactive tools. All three tools (economic
 * damages estimator, household-services valuator, and life expectancy
 * calculator) are public: prerendered and listed in the sitemap.
 */
export default function Tools() {
  usePageMeta({
    title: "Attorney Tools | KWVRS",
    description:
      "Free planning tools for attorneys from KWVRS: run a preliminary economic loss estimate and get the full breakdown by email.",
    canonical: "/tools",
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-navy text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-amber uppercase tracking-[0.18em] text-xs font-semibold mb-3">Attorney tools</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Planning tools for counsel</h1>
          <p className="text-neutral-200 max-w-2xl text-lg">
            Free, planning-level tools for case evaluation - built by the same team that prepares
            court-ready vocational, life care, and economic analyses for plaintiff and defense counsel.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-6 md:grid-cols-3">
          <Link
            to="/tools/economic-damages-estimator"
            className="kw-lift group rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm hover:shadow-lg hover:border-teal/40 transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/10 text-teal mb-4">
              <Calculator className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy mb-2">Economic damages estimator</h2>
            <p className="text-neutral-600 mb-4">
              Enter case basics - income, ages, injury period, future care - and see a preliminary
              economic loss range instantly. Get the full line-item breakdown by email.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
              Run an estimate <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/tools/household-services"
            className="kw-lift group rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm hover:shadow-lg hover:border-teal/40 transition-all"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/10 text-teal mb-4">
              <House className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy mb-2">Household services valuator</h2>
            <p className="text-neutral-600 mb-4">
              Estimate the annual replacement value of a person's unpaid household work from public ATUS
              time-use data and BLS OEWS wages. Download a Word exhibit, an Excel workbook, or a CSV.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
              Value household services <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
          <p className="text-xs text-neutral-500 max-w-3xl">
            These tools produce planning-level estimates only. They are not expert opinions, reports,
            or testimony, and assumptions vary by case facts and jurisdiction.
          </p>
        </div>
      </section>

      <ContactCTA />
    </div>
  );
}
