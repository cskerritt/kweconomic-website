import { pillarServices } from "@/data/services";
import { usePageMeta } from "@/hooks/use-page-meta";
import ServiceCard from "@/components/ServiceCard";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";
import { Picture } from "@/components/Picture";

export default function ServicesHub() {
  usePageMeta({
    title: "Expert Services | KWVRS - Vocational and Rehabilitation Experts",
    description:
      "KWVRS offers expert services including vocational evaluation, life care planning, forensic economics, and expert witness testimony - serving all states.",
    canonical: "https://kwvrs.com/services",
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
              What We Do
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Our Expert Services
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              KWVRS provides vocational, rehabilitation, and forensic expert services to
              attorneys, insurers, and claimants in every U.S. jurisdiction. Each service is
              delivered by credentialed professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Team image break */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Picture
            src="/images/legal-team-discussion.jpg"
            alt="KWVRS legal team reviewing case strategy"
            width={1200}
            height={400}
            className="rounded-2xl shadow-xl w-full object-cover max-h-80"
            loading="lazy"
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">
              All Expert Services
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              From initial assessment through expert testimony, our team supports every stage of
              litigation with objective, evidence-based analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillarServices().map((service, i) => (
              <Reveal key={service.slug} delay={i * 60}>
                <ServiceCard
                  name={service.name}
                  shortName={service.shortName}
                  description={service.description}
                  icon={service.icon}
                  href={`/services/${service.slug}`}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
