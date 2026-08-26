import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import TestimonialSection from "@/components/TestimonialSection";
import { Picture } from "@/components/Picture";
import { organizationSchema } from "@/lib/schema";

export default function About() {
  usePageMeta({
    title: "About KWVRS - Vocational and Rehabilitation Experts",
    description:
      "Kincaid Wolstein Vocational and Rehabilitation Services provides vocational evaluations, life care planning, and forensic economic analysis for attorneys nationwide.",
    canonical: "https://kwvrs.com/about",
  });

  return (
    <>
      <SchemaOrg data={organizationSchema()} />
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Who We Are
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              About KWVRS
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Kincaid Wolstein Vocational and Rehabilitation Services provides vocational
              evaluations, life care planning, forensic economic analysis, and expert witness
              testimony for attorneys and their clients across all U.S. jurisdictions.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">
                The Firm
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  KWVRS is a multidisciplinary firm of vocational evaluators, certified life care
                  planners, and forensic economists, supported by a board-certified physician.
                  Opinions are grounded in accepted methodology, peer-reviewed sources, and
                  documented labor market data.
                </p>
                <p>
                  KWVRS accepts plaintiff and defense engagements equally. Opinions follow the
                  evidence, not the retaining party.
                </p>
                <p>
                  Headquartered in Hackensack, NJ with offices in Richmond, VA, KWVRS provides
                  expert services in all 50 states, the District of Columbia, and U.S. territories.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 space-y-6">
              {/* Photo */}
              <Picture
                src="/images/mentor-trainee.jpg"
                alt="KWVRS professional mentorship and expert guidance"
                width={800}
                height={533}
                className="rounded-xl shadow-lg w-full object-cover"
                loading="lazy"
              />
              {/* Mission */}
              <div className="bg-navy-dark text-white rounded-xl p-8">
                <h3 className="font-serif text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-neutral-300 leading-relaxed">
                  To provide objective, evidence-based vocational and rehabilitation analysis that
                  supports courts and parties in reaching informed outcomes.
                </p>
              </div>
              {/* Values */}
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h3 className="font-serif text-xl font-bold text-navy mb-4">Core Values</h3>
                <ul className="space-y-3">
                  {[
                    { title: "Objectivity", text: "KWVRS accepts plaintiff and defense engagements. Analysis follows the data." },
                    { title: "Rigor", text: "Accepted methodology, peer-reviewed sources, and methodology-grounded opinions." },
                    { title: "Responsiveness", text: "Documented timelines and clear communication with retaining counsel." },
                    { title: "Integrity", text: "KWVRS evaluates positions. It does not advocate for them." },
                  ].map((v) => (
                    <li key={v.title} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-teal mt-2 shrink-0" />
                      <div>
                        <span className="font-semibold text-navy">{v.title}: </span>
                        <span className="text-neutral-600">{v.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Teaser */}
      <section className="py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">Leadership</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
            KWVRS is led by doctoral-level rehabilitation professionals. Dan Wolstein, Ph.D., CRC,
            ABVE/D served as President of the American Board of Vocational Experts (2023-2025) and
            leads a team that includes a Chief Medical Director, Chief Operating Officer, and
            Chief of Vocational Services.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Meet the Team
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection indices={[3, 4, 5]} />

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
