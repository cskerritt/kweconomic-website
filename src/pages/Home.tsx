import { Link } from "react-router-dom";
import { ArrowRight, Shield, Phone } from "lucide-react";
import { pillarServices } from "@/data/services";
import { states } from "@/data/states";
import { testimonials } from "@/data/testimonials";
import { usePageMeta } from "@/hooks/use-page-meta";
import ServiceCard from "@/components/ServiceCard";
import Reveal from "@/components/Reveal";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import TestimonialSection from "@/components/TestimonialSection";
import FAQBlock from "@/components/FAQBlock";
import {
  graphSchema,
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
  faqPageSchema,
  ORG_URL,
} from "@/lib/schema";

const HOMEPAGE_FAQS = [
  {
    question: "What is a vocational expert?",
    answer:
      "A vocational expert is a qualified rehabilitation professional who evaluates an individual's ability to work, earn wages, and sustain employment given their education, training, experience, and medical restrictions. In litigation, vocational experts produce earning-capacity opinions and provide testimony on employability and labor-market access.",
  },
  {
    question: "Does KWVRS work for plaintiff and defense?",
    answer:
      "Yes. KWVRS accepts retentions from both plaintiff and defense counsel. The methodology is identical regardless of which side commissions the work. This is the foundation of being treated as a credible expert under any standard of admissibility.",
  },
  {
    question: "How much does an expert engagement cost?",
    answer:
      "Full retained-expert engagements are billed hourly across review, evaluation, report, and (if needed) testimony phases. Specific cost depends on case complexity, the disciplines involved, and the expert's docket.",
  },
  {
    question: "How long does a vocational, economic, or life care evaluation take?",
    answer:
      "Full retained-expert reports typically take 30 to 90 days from records receipt depending on case complexity and the expert's docket. Rush turnarounds are accommodated case-by-case.",
  },
  {
    question: "Where does KWVRS provide services?",
    answer:
      "KWVRS accepts engagements in all 50 states, the District of Columbia, and US territories. State-specific framing is available on every state and city page. Headquarters is in Hackensack, New Jersey, with a Richmond, Virginia office.",
  },
  {
    question: "What credentials should I look for in a vocational expert?",
    answer:
      "Common credentials are CRC (Certified Rehabilitation Counselor), CVE (Certified Vocational Evaluator), CLCP (Certified Life Care Planner), ABVE/D (Diplomate of the American Board of Vocational Experts), and FVE (Forensic Vocational Examiner). KWVRS practitioners hold combinations of these plus Ph.D., M.D., and CPA-level credentials.",
  },
];

const CASE_TYPE_ENTRIES = [
  { label: "Schedule a Consultation", href: "/schedule-consultation", blurb: "Catastrophic injury, medical malpractice, workers' compensation, and pediatric matters" },
  { label: "General Inquiry", href: "/contact", blurb: "Anything else - we respond in 1 business day" },
];

const REGION_ORDER: { key: string; label: string }[] = [
  { key: "northeast", label: "Northeast" },
  { key: "midwest", label: "Midwest" },
  { key: "southeast", label: "South" },
  { key: "west", label: "West" },
];

const KNOWLEDGE_RESOURCES = [
  { label: "What Is a Life Care Plan?", href: "/guides/what-is-life-care-plan" },
  { label: "How a Life Care Plan Is Priced", href: "/guides/how-a-life-care-plan-is-priced" },
  { label: "Life Care Plan vs Medicare Set-Aside", href: "/guides/life-care-plan-vs-medicare-set-aside" },
  { label: "How to Rebut a Life Care Plan", href: "/guides/how-to-rebut-a-life-care-plan" },
  { label: "CLCP vs CNLCP", href: "/compare/clcp-vs-cnlcp" },
];

export default function Home() {
  usePageMeta({
    title: "Vocational, Economic & Life Care Expert Witness Services | KWVRS",
    description:
      "Independent vocational evaluations, life care plans, and forensic economic analyses for plaintiff and defense attorneys nationwide. Response in 1 business day.",
    canonical: "https://kwvrs.com/",
  });

  // Planning lines only; testimony is a mode of every engagement, not a card.
  const coreServices = pillarServices().filter((s) => s.slug !== "expert-witness-testimony");

  // Anonymous retaining-attorney quote (owner-attested set). Index 0 = the
  // expert-report quote; the settlement-outcome quotes are not in this site's
  // testimonial set (per Chris, 2026-07-20).
  const heroQuote = testimonials[0];
  const allStates = states.filter((s) => s.type === "state");

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          breadcrumbSchema([{ name: "Home", url: `${ORG_URL}/` }]),
          faqPageSchema(HOMEPAGE_FAQS, `${ORG_URL}/`),
        ])}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <p className="kw-enter text-amber-light text-xs font-semibold uppercase tracking-[0.18em] mb-5">
                Vocational · Economic · Life Care Expert Witness Services
              </p>
              <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
                <span className="kw-gradient-text">Defensible</span> expert opinions for plaintiff and defense counsel, nationwide.
              </h1>
              <p className="kw-enter kw-enter-2 text-lg md:text-xl text-neutral-300 mb-8 leading-relaxed max-w-xl">
                In plain terms: what an injured person can still earn, the lifetime
                cost of their care, and the present-day value of those losses -
                analyzed objectively for plaintiff and defense counsel nationwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 bg-amber-dark hover:bg-amber-dark text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors shadow-lg shadow-amber/20"
                >
                  Get a Quote - Response in 1 Business Day <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
                >
                  Explore Services
                </Link>
              </div>

              <a
                href="tel:+12013430700"
                className="kw-enter kw-enter-4 inline-flex items-center gap-2 text-neutral-300 hover:text-white text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                Or call (201) 343-0700
              </a>

              {/* Compact pull-quote for mobile/tablet (full card shows at lg+ in the right column) */}
              <figure className="kw-enter kw-enter-4 lg:hidden mt-8 bg-white/95 text-navy rounded-lg p-5 shadow-xl relative">
                <span
                  aria-hidden="true"
                  className="absolute top-2 left-4 font-serif text-5xl text-amber leading-none select-none"
                >
                  &ldquo;
                </span>
                <blockquote className="font-serif text-base leading-snug mb-3 mt-4 relative z-10">
                  {heroQuote.quote}
                </blockquote>
                <figcaption className="border-t border-neutral-200 pt-3 text-xs">
                  <span className="block font-semibold">{heroQuote.author}</span>
                  <span className="block text-neutral-500 mt-0.5">
                    {heroQuote.title} - {heroQuote.caseType}
                  </span>
                </figcaption>
              </figure>
            </div>

            {/* Right column: hero pull-quote (replaces stock office image) */}
            <div className="hidden lg:block kw-enter kw-enter-2">
              <figure className="bg-white text-navy rounded-lg p-8 shadow-2xl relative">
                <span
                  aria-hidden="true"
                  className="absolute top-4 left-6 font-serif text-7xl text-amber leading-none select-none"
                >
                  &ldquo;
                </span>
                <blockquote className="font-serif text-xl md:text-2xl leading-snug mb-6 mt-6 relative z-10">
                  {heroQuote.quote}
                </blockquote>
                <figcaption className="border-t border-neutral-200 pt-4 flex items-center justify-between">
                  <span>
                    <span className="block font-semibold text-sm">{heroQuote.author}</span>
                    <span className="block text-xs text-neutral-500 mt-0.5">
                      {heroQuote.title} - {heroQuote.caseType}
                    </span>
                  </span>
                  <Link
                    to="/case-types"
                    className="text-xs text-amber-dark font-semibold uppercase tracking-wider hover:underline"
                  >
                    See cases
                  </Link>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Plaintiff + defense reassurance band */}
      <section className="bg-neutral-100 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-navy">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Shield className="w-4 h-4 text-amber" />
            Plaintiff <span className="text-neutral-500">·</span> Defense
          </span>
          <span className="text-neutral-600">All 50 states + DC + US territories</span>
          <span className="text-neutral-600">Ph.D., M.D., CRC, CLCP, CVE, ABVE/D credentialed</span>
          <span className="text-neutral-600">Hackensack, NJ - Richmond, VA</span>
        </div>
      </section>

      {/* Case-type entry grid (replaces generic 4-icon "How it works") */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Start where your case is
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              Pick the path that matches your matter. Each intake routes to a
              dedicated form sized to the engagement and the governing PSA.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CASE_TYPE_ENTRIES.map((entry, i) => (
              <Reveal key={entry.href} delay={i * 60}>
                <Link
                  to={entry.href}
                  className="kw-lift group block h-full rounded-lg border border-neutral-200 hover:border-navy hover:shadow-lg bg-white p-5"
                >
                  <h3 className="font-serif text-lg font-bold text-navy mb-1 group-hover:text-amber-dark transition-colors">
                    {entry.label}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">{entry.blurb}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-amber-dark">
                    Open intake <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Practice areas
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              A complete economic-damages workup under one roof - vocational,
              life care, and forensic economic analysis with cross-discipline
              continuity.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreServices.map((service, i) => (
              <Reveal key={service.slug} delay={i * 70}>
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
          <div className="mt-10">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-navy font-semibold hover:text-amber-dark transition-colors"
            >
              View all services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Geographic coverage */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Nationwide coverage
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              KWVRS serves clients in all 50 states, the District of Columbia,
              and US territories. Select a state for venue-specific framing.
            </p>
          </Reveal>
          <div className="space-y-8">
            {REGION_ORDER.map((region, ri) => {
              const regionStates = allStates.filter((s) => s.region === region.key);
              if (regionStates.length === 0) return null;
              return (
                <Reveal key={region.key} delay={ri * 80}>
                  <h3 className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-dark mb-4">
                    {region.label}
                    <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {regionStates.map((state) => (
                      <Link
                        key={state.slug}
                        to={`/locations/${state.slug}`}
                        className="group bg-white rounded-lg border border-neutral-200 px-4 py-3 text-center hover:border-navy hover:-translate-y-0.5 hover:shadow-md transition-all"
                      >
                        <span className="block text-sm font-semibold text-navy group-hover:text-amber-dark transition-colors">
                          {state.abbreviation}
                        </span>
                        <span className="block text-[11px] text-neutral-500 mt-0.5 truncate">
                          {state.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-8">
            <Link
              to="/locations"
              className="inline-flex items-center gap-2 text-navy font-semibold hover:text-amber-dark transition-colors"
            >
              View all locations <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ - schema-marked-up answer block for AEO */}
      <section className="py-16 md:py-20 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Common questions
            </h2>
            <p className="text-neutral-600">
              Direct answers for attorneys evaluating an engagement.
            </p>
          </Reveal>
          <Reveal>
            <FAQBlock faqs={HOMEPAGE_FAQS} />
          </Reveal>
        </div>
      </section>

      {/* Knowledge resources strip (surface orphaned guides/comparisons) */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Background reading
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              In-depth guides and side-by-side comparisons on the issues that
              show up in vocational, economic, and life-care matters.
            </p>
          </Reveal>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {KNOWLEDGE_RESOURCES.map((r, i) => (
              <Reveal as="li" key={r.href} delay={i * 60}>
                <Link
                  to={r.href}
                  className="kw-lift block h-full rounded-lg border border-neutral-200 bg-white px-5 py-4 hover:border-navy hover:shadow-md"
                >
                  <span className="block font-medium text-navy text-sm leading-snug">
                    {r.label}
                  </span>
                  <span className="text-xs text-amber-dark font-semibold uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/guides" className="text-navy font-semibold hover:text-amber-dark">
              All guides <ArrowRight className="w-3 h-3 inline" />
            </Link>
            <Link to="/compare" className="text-navy font-semibold hover:text-amber-dark">
              All comparisons <ArrowRight className="w-3 h-3 inline" />
            </Link>
            <Link to="/knowledge" className="text-navy font-semibold hover:text-amber-dark">
              Knowledge center <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {/* Indices skip 0 (settlement-outcome quote, removed from home per Chris
          2026-07-20) and 2 (already the hero pull-quote above). */}
      <TestimonialSection indices={[3, 4, 1]} />

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
