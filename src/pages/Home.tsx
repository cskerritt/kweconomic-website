import { Link } from "react-router-dom";
import { ArrowRight, Shield, Phone, FileCheck, Scale, MapPin, Check } from "lucide-react";
import { pillarServices } from "@/data/services";
import { states } from "@/data/states";
import { homepageFaqs } from "@/data/home-faqs.mjs";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, ORG_SHORT, ORG_PHONE, ORG_PHONE_DISPLAY, SITE_URL, telHref } from "@/lib/brand";
import ServiceCard from "@/components/ServiceCard";
import Reveal from "@/components/Reveal";
import ContactCTA from "@/components/ContactCTA";
import CrossSell from "@/components/CrossSell";
import SchemaOrg from "@/components/SchemaOrg";
import {
  graphSchema,
  organizationSchema,
  websiteSchema,
  faqPageSchema,
  ORG_URL,
} from "@/lib/schema";

const HOMEPAGE_FAQS = homepageFaqs(ORG_NAME, ORG_SHORT);

const HOW_WE_WORK = [
  { icon: Shield, title: "Objective Analysis", text: "Plaintiff and defense engagements accepted. The analysis follows the records and the published data." },
  { icon: FileCheck, title: "Transparent Assumptions", text: "Every report states its earnings base, growth rate, worklife horizon, discount rate, and data sources so the other side can recompute the figure." },
  { icon: Scale, title: "Established Methods", text: "Present value, worklife expectancy, and valuation methods drawn from the forensic economics literature and applied the same way in every venue." },
  { icon: MapPin, title: "Nationwide Practice", text: "Engagements in all 50 states, the District of Columbia, and U.S. territories, with state and metro wage, cost of living, and damages-rule context." },
];

const CASE_TYPE_ENTRIES = [
  { label: "Schedule a Consultation", href: "/schedule-consultation", blurb: "Lost earnings, wrongful death, household services, employment, and commercial damages matters" },
  { label: "Rebut an Opposing Report", href: "/services/expert-rebuttal-and-report-review", blurb: "Review of an opposing economist's inputs, methods, and arithmetic against the record" },
  { label: "Browse Case Types", href: "/case-types", blurb: "Personal injury, wrongful death, employment, commercial, and family law matters, with the loss components each one raises" },
  { label: "General Inquiry", href: "/contact", blurb: "Anything else - we respond in 1 business day" },
];

const REGION_ORDER: { key: string; label: string }[] = [
  { key: "northeast", label: "Northeast" },
  { key: "midwest", label: "Midwest" },
  { key: "southeast", label: "South" },
  { key: "west", label: "West" },
];

const KNOWLEDGE_RESOURCES = [
  { label: "What Is a Forensic Economist?", href: "/guides/what-is-a-forensic-economist" },
  { label: "How Lost Earnings Are Calculated", href: "/guides/how-lost-earnings-are-calculated" },
  { label: "Present Value, Explained for Attorneys", href: "/guides/present-value-explained-for-attorneys" },
  { label: "How to Rebut an Economic Damages Report", href: "/guides/how-to-rebut-an-economic-damages-report" },
  { label: "Lost Earnings vs. Lost Earning Capacity", href: "/compare/lost-earnings-vs-lost-earning-capacity" },
  { label: "Forensic Economist vs. Forensic Accountant", href: "/compare/forensic-economist-vs-forensic-accountant" },
];

// The hero card: the four inputs every KW Economics report sets out on its own
// schedule. It stands in the slot a pull-quote would occupy; attorney feedback
// is not shown on the site (see src/pages/no-testimonials.render.test.tsx).
const REPORT_STATES = [
  { label: "Question asked", text: "The loss claim the analysis answers and the records it relies on." },
  { label: "Earnings base", text: "Documented pre-injury or but-for earnings and fringe benefits." },
  { label: "Growth and worklife", text: "Wage growth and the worklife horizon, each on its own schedule." },
  { label: "Discount rate", text: "The rate that reduces future losses to present value, and its source." },
];

// Rendered once: compact below the hero copy on small screens, full size in
// the right-hand column at lg+. One render keeps a single H2 in the outline
// (the static shell carries no duplicate either).
function ReportContentsCard() {
  return (
    <div className="bg-white text-navy rounded-lg shadow-2xl relative p-5 lg:p-8">
      <p className="text-amber-dark text-xs font-semibold uppercase tracking-[0.18em] mb-2">Built to be examined</p>
      <h2 className="font-serif font-bold leading-snug mb-4 text-xl lg:text-2xl">
        What Every Report States
      </h2>
      <ul className="space-y-3 text-sm lg:text-base">
        {REPORT_STATES.map((item) => (
          <li key={item.label} className="flex gap-3">
            <Check className="w-5 h-5 text-amber shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              <span className="font-semibold">{item.label}.</span>{" "}
              <span className="text-neutral-600">{item.text}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="border-t border-neutral-200 mt-5 pt-4 flex items-center justify-between text-xs">
        <span className="text-neutral-500">Same schedules in every venue, plaintiff or defense.</span>
        <Link to="/methods" className="text-amber-dark font-semibold uppercase tracking-wider hover:underline">
          See the methods
        </Link>
      </div>
    </div>
  );
}

export default function Home() {
  usePageMeta({
    title: `Forensic Economics and Economic Damages Experts | ${ORG_NAME}`,
    description:
      "Independent lost earnings, wrongful death, household services, employment, and business damages analyses for plaintiff and defense attorneys in all 50 states.",
    canonical: `${SITE_URL}/`,
  });

  // Damages lines only; rebuttal is a mode of every engagement, not a card.
  const coreServices = pillarServices().filter((s) => s.slug !== "expert-rebuttal-and-report-review");

  const allStates = states.filter((s) => s.type === "state");

  return (
    <>
      {/* No BreadcrumbList on the root: a one-item trail claims navigation
          the page does not show. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
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
                Forensic Economists and Damages Experts
              </p>
              <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-6">
                Economic Damages Analysis Built on <span className="kw-gradient-text">Transparent Methods</span>
              </h1>
              <p className="kw-enter kw-enter-2 text-lg md:text-xl text-neutral-300 mb-8 leading-relaxed max-w-xl">
                {ORG_NAME} delivers independent lost earnings, wrongful death, household services,
                employment, business valuation, and forensic accounting analyses for plaintiff and
                defense counsel in all 50 states, the District of Columbia, and U.S. territories.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors shadow-lg shadow-amber/20"
                >
                  Request a Consultation <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 border border-white/30 hover:bg-white/10 text-white font-semibold px-7 py-4 rounded-lg text-base transition-colors"
                >
                  Explore Services
                </Link>
              </div>

              <a
                href={telHref(ORG_PHONE)}
                className="kw-enter kw-enter-4 inline-flex items-center gap-2 text-neutral-300 hover:text-white text-sm font-medium"
              >
                <Phone className="w-4 h-4" />
                Or call {ORG_PHONE_DISPLAY}
              </a>
            </div>

            {/* Report contents card: follows the hero copy on small screens,
                fills the right column at lg+. */}
            <div className="kw-enter kw-enter-2">
              <ReportContentsCard />
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
          <span className="text-neutral-600">All 50 states + DC + U.S. territories</span>
          <span className="text-neutral-600">Reports built for deposition and trial</span>
          <span className="text-neutral-600">Hackensack, NJ - Richmond, VA</span>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              How We Work
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              The same method on every engagement, whichever side retains us.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_WE_WORK.map((item, i) => (
              <Reveal key={item.title} delay={i * 60} className="text-center">
                <div className="w-14 h-14 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-amber" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-navy text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10 text-center">
            <p className="text-neutral-600 max-w-3xl mx-auto">
              Read about{" "}
              <Link to="/about" className="text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                the practice and how each analysis is built
              </Link>
              , meet{" "}
              <Link to="/team" className="text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                the economics team
              </Link>
              , and see{" "}
              <Link to="/credentials" className="text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                what qualifies a forensic economist to testify
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* Entry grid */}
      <section className="py-16 md:py-20 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Start where your case is
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              Tell us about the loss claim, the records you have, and your deadlines. We confirm
              scope, timeline, and fee before any work begins.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CASE_TYPE_ENTRIES.map((entry, i) => (
              <Reveal key={entry.href} delay={i * 60}>
                <Link
                  to={entry.href}
                  className="kw-lift group block h-full rounded-lg border border-neutral-200 hover:border-amber hover:shadow-lg bg-white p-5"
                >
                  <h3 className="font-serif text-lg font-bold text-navy mb-1 group-hover:text-amber-dark transition-colors">
                    {entry.label}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">{entry.blurb}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-amber-dark">
                    Get started <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
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
              Services
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              Lost earnings and earning capacity, wrongful death economic loss, personal injury
              damages, household services, life care plan costing, employment and wage-loss
              damages, business valuation, lost profits, fraud and asset tracing, and marital
              financial analysis.
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

      {/* Sister practices */}
      <CrossSell />

      {/* Geographic coverage */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Nationwide coverage
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              {ORG_NAME} serves clients in all 50 states, the District of Columbia, and U.S.
              territories. Select a state for wage, cost of living, and damages-rule context.
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
                        className="group bg-white rounded-lg border border-neutral-200 px-4 py-3 text-center hover:border-amber hover:-translate-y-0.5 hover:shadow-md transition-all"
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

      {/* FAQ - schema-marked-up answer block for AEO. Rendered inline rather
          than through FAQBlock so the section carries ONE heading ("Common
          questions", the same text the static shell prints) with its intro
          sentence under it; the <details> markup matches FAQBlock's. */}
      <section aria-labelledby="home-faq-heading" className="py-16 md:py-20 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-8">
            <h2 id="home-faq-heading" className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Common questions
            </h2>
            <p className="text-neutral-600">
              Direct answers for attorneys evaluating an economic damages engagement.
            </p>
          </Reveal>
          <Reveal>
            <div className="space-y-4">
              {HOMEPAGE_FAQS.map((f) => (
                <details key={f.question} className="border border-neutral-200 rounded-lg bg-white p-4">
                  <summary className="cursor-pointer font-semibold text-navy">{f.question}</summary>
                  <p className="mt-2 text-neutral-700">{f.answer}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Knowledge resources strip */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-8">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
              Background reading
            </h2>
            <p className="text-neutral-600 max-w-2xl">
              In-depth guides and side-by-side comparisons on the questions that come up in
              economic damages, valuation, and expert testimony matters.
            </p>
          </Reveal>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {KNOWLEDGE_RESOURCES.map((r, i) => (
              <Reveal as="li" key={r.href} delay={i * 60}>
                <Link
                  to={r.href}
                  className="kw-lift block h-full rounded-lg border border-neutral-200 bg-white px-5 py-4 hover:border-amber hover:shadow-md"
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
            <Link to="/resources/faq" className="text-navy font-semibold hover:text-amber-dark">
              Attorney FAQ <ArrowRight className="w-3 h-3 inline" />
            </Link>
            <Link to="/case-studies" className="text-navy font-semibold hover:text-amber-dark">
              Illustrative engagements <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
