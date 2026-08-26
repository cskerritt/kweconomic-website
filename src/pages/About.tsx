import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, ORG_SHORT, ORG_LEGAL, SITE_URL } from "@/lib/brand";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import TestimonialSection from "@/components/TestimonialSection";
import { Picture } from "@/components/Picture";
import { organizationSchema } from "@/lib/schema";

const VALUES = [
  { title: "Objectivity", text: "Plaintiff and defense engagements accepted. The plan follows the medical evidence, not the retaining party." },
  { title: "Rigor", text: "Published standards of practice, clinical practice guidelines, and documented cost research behind every line item." },
  { title: "Responsiveness", text: "Scope, timeline, and fee confirmed in writing before work begins; clear communication through delivery and testimony." },
  { title: "Integrity", text: `${ORG_SHORT} documents future care needs. It does not advocate for a number.` },
];

export default function About() {
  usePageMeta({
    title: `About ${ORG_NAME} - Independent, Physician-Informed Life Care Planning`,
    description:
      `${ORG_NAME} prepares independent, physician-informed life care plans and medical cost projections for plaintiff and defense attorneys in all 50 states.`,
    canonical: `${SITE_URL}/about`,
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
            <p className="kw-enter text-teal-light text-sm font-semibold uppercase tracking-wider mb-4">
              Who We Are
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              About {ORG_NAME}
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {ORG_NAME} is a life care planning practice. We prepare independent, evidence-based
              life care plans, medical cost projections, and plan rebuttals for attorneys and their
              clients across all U.S. jurisdictions, and we testify to that work when the case
              requires it.
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
                The Practice
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  {ORG_NAME} is the life care planning practice of {ORG_LEGAL}, a rehabilitation
                  and expert-services firm headquartered in Hackensack, New Jersey. The life care
                  planning group grew out of the firm's catastrophic-injury work and now operates
                  under its own name so that attorneys, adjusters, and courts can find a dedicated
                  planning practice.
                </p>
                <p>
                  Plans are developed by certified life care planners with a board-certified
                  physician life care planner on the team, supported by planners with
                  doctoral-level rehabilitation training. Every recommendation is traced to
                  the medical record, treating-provider input, and published clinical practice
                  guidelines, and every cost is sourced to the geographic market where care will
                  be delivered.
                </p>
                <p>
                  {ORG_SHORT} accepts plaintiff and defense engagements equally. Opinions follow the
                  evidence, not the retaining party.
                </p>
                <p>
                  With offices in Hackensack, NJ and Richmond, VA, {ORG_SHORT} accepts engagements
                  in all 50 states, the District of Columbia, and U.S. territories.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 space-y-6">
              {/* Photo */}
              <Picture
                src="/images/mentor-trainee.jpg"
                alt="Life care planner reviewing a plan with a colleague"
                width={800}
                height={533}
                className="rounded-xl shadow-lg w-full object-cover"
                loading="lazy"
              />
              {/* Mission */}
              <div className="bg-navy-dark text-white rounded-xl p-8">
                <h3 className="font-serif text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Independent, physician-informed life care planning that gives courts and parties a
                  documented, defensible picture of what an injured person will need and what it
                  will cost.
                </p>
              </div>
              {/* Values */}
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h3 className="font-serif text-xl font-bold text-navy mb-4">Core Values</h3>
                <ul className="space-y-3">
                  {VALUES.map((v) => (
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
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">Our Planners</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
            The team includes a board-certified physician who is a Certified Life Care Planner
            and doctoral-level rehabilitation professionals who hold the CLCP credential. Read the credentials and background of each planner.
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
      <TestimonialSection indices={[0, 1, 2]} />

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
