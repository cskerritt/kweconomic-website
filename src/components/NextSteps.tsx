import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { ORG_NAME, ORG_PHONE, ORG_PHONE_DISPLAY, telHref } from "@/lib/brand";

const CORE_SERVICES = [
  { label: "Lost Earnings Analysis", slug: "lost-earnings-and-earning-capacity" },
  { label: "Wrongful Death Economic Loss", slug: "wrongful-death-economic-loss" },
  { label: "Business Valuation", slug: "business-valuation" },
];

interface NextStepsProps {
  /** Optional context appended to the heading, e.g. a topic or case type. */
  context?: string;
}

/**
 * Standard end-of-content funnel block. Bridges informational pages to a
 * conversion path: relevant service pillars -> consultation. Used on every
 * content template so no page is a dead end.
 */
export default function NextSteps({ context }: NextStepsProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-br from-navy via-navy to-navy-dark text-white p-8">
      <div className="kw-aurora opacity-60" aria-hidden="true" />
      <div className="relative z-10">
        <p className="kw-eyebrow text-amber-light">
          Recommended next step
        </p>
        <h2 className="font-serif text-2xl font-bold mb-3">
          Discuss how this applies to your case{context ? ` (${context})` : ""}
        </h2>
        <p className="text-neutral-300 mb-6 max-w-2xl">
          {ORG_NAME} provides independent, objective economic damages analysis for
          plaintiff and defense counsel nationwide. Tell us about the matter and we will scope the
          appropriate deliverable, or explore the relevant service line below.
        </p>

        <div className="flex flex-wrap gap-2 mb-7">
          {CORE_SERVICES.map((s) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="kw-lift inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 text-sm font-medium"
            >
              {s.label} <ArrowRight className="w-3.5 h-3.5 text-amber" />
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
           
            to="/contact"
            className="kw-press min-h-11 group inline-flex items-center justify-center gap-2 bg-amber-dark hover:bg-amber-darker active:bg-amber-darker text-white font-semibold px-6 py-3 rounded-lg"
          >
            Request a Consultation <ArrowRight className="w-4 h-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
          </Link>
          <a
            href={telHref(ORG_PHONE)}
            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            <Phone className="w-4 h-4" /> {ORG_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </section>
  );
}
