import { Link } from "react-router-dom";
import { ArrowRight, Scale, FileCheck, Lock } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, SITE_URL } from "@/lib/brand";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";

// Illustrative, anonymized narratives. Each is a composite drawn from the
// kinds of engagements a life care planner handles; none describes a specific
// client, matter, venue, or outcome. Dollar figures are deliberately omitted.
const caseStudies = [
  {
    title: "Adult Traumatic Brain Injury",
    caseTypeSlug: "traumatic-brain-injury",
    context:
      "A working-age adult sustained a severe traumatic brain injury in a motor vehicle collision. After inpatient rehabilitation the person returned home with persistent deficits in memory, executive function, and behavioral regulation, and a spouse had left the workforce to provide supervision.",
    approach: [
      "Records review across acute care, inpatient rehabilitation, neuropsychology, and outpatient therapy, followed by an in-home interview and observation of daily routine",
      "Written recommendations obtained from the treating physiatrist and neuropsychologist for follow-up care, therapy courses, medications, and the level of supervision required",
      "Attendant care specified by level (supervision versus hands-on assistance) and by hours across the day, with agency and private-hire rates researched in the person's own market",
      "Cognitive and behavioral supports, case management, and a periodic re-evaluation schedule carried across life expectancy from the published tables, with no adjustment because no physician had opined that expectancy was reduced",
    ],
    result:
      "The plan gave counsel an itemized, sourced schedule in which every attendant care hour traced to a physician statement of need, and it separated injury-related items from a pre-existing orthopedic condition documented in the record. The economist reduced the schedule to present value without needing to re-derive any item.",
  },
  {
    title: "Birth Injury with Cerebral Palsy",
    caseTypeSlug: "birth-injury",
    context:
      "A young child was diagnosed with spastic quadriplegic cerebral palsy following a complicated delivery. The child was non-ambulatory, fed partly by gastrostomy, and enrolled in early intervention services. The family lived in a two-story home with no accessible entrance.",
    approach: [
      "Plan organized by developmental stage: early childhood, school age, adolescence, and adulthood, with items that start, stop, or change at each transition",
      "Pediatric equipment costed on growth-driven replacement cycles, with adult-sized equipment substituted at the appropriate age",
      "Home accessibility assessed and modification costs researched for the current home, with vehicle modification tied to the age at which transport needs change",
      "Attendant care projected at family-provided levels during childhood and at the adult level after the age at which school-based services end, with residential and supported-living options priced as alternatives",
    ],
    result:
      "Because the plan showed the cost consequence of each transition, counsel could explain to the mediator why lifetime care for a child differs from an adult plan scaled for age. The staged structure also gave the defense a clear basis on which to contest specific items rather than the plan as a whole.",
  },
  {
    title: "Spinal Cord Injury in a Workers' Compensation Settlement",
    caseTypeSlug: "spinal-cord-injury",
    context:
      "An injured worker in a mid-career trade sustained a complete thoracic spinal cord injury in a workplace fall. The carrier and the worker sought to settle future medical care, and the worker was expected to become Medicare-eligible within the settlement period.",
    approach: [
      "Full life care plan prepared from the record and an in-person evaluation, covering skin, bladder, and bowel management, wheelchair and seating with replacement schedules, home and vehicle modification, and attendant care",
      "Medicare set-aside allocation derived from the same record review by removing non-covered and unrelated items and re-pricing the remainder on a fee-schedule basis under Medicare's review guidance",
      "Rated age obtained by the settling parties applied to the allocation only; the life care plan carried population life expectancy with a physician-supported note on the condition",
      "Both documents delivered with a reconciliation showing which plan items fed the allocation and which fell outside it",
    ],
    result:
      "The parties had one consistent inventory of future needs to negotiate from, and the allocation was documented for submission. Preparing both from a single review avoided the inconsistencies that arise when the plan and the set-aside are built by different vendors from different records.",
  },
];

export default function CaseStudies() {
  // This overview complements the richer /case-types hub; canonicalize to it so
  // the two "Case Types" pages don't compete in search. /case-types is the one
  // surfaced in the nav.
  usePageMeta({
    title: `Illustrative Life Care Planning Engagements | ${ORG_NAME}`,
    description:
      `${ORG_NAME} prepares life care plans, medical cost projections, and Medicare set-aside allocations for plaintiff and defense counsel. Three anonymized, illustrative engagements show how a plan is built.`,
    canonical: `${SITE_URL}/case-types`,
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
              Illustrative Engagements
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              How a Life Care Plan Is Built
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {ORG_NAME} supports both plaintiff and defense counsel. The three narratives below
              are anonymized composites that show how a plan is grounded, structured, and priced
              in three common injury contexts. They describe method, not specific cases or outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Intro note */}
      <section className="py-10 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-neutral-700 leading-relaxed">
              Our work is retained by plaintiff attorneys, defense attorneys, and insurance
              carriers. We do not advocate for either side - our role is to apply the published
              standards of practice and produce a plan that can be examined item by item. The
              narratives below are illustrative and contain no client-identifying details; any
              resemblance to a particular matter is coincidental.
            </p>
          </div>
        </div>
      </section>

      {/* Objectivity & defensibility - methodology substance */}
      <section className="py-14 md:py-20 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 max-w-2xl">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-3">
              Built to be defensible
            </h2>
            <p className="text-neutral-700">
              Whatever the injury, the plan is held to the same standard -
              so each item holds up under examination, not just on paper.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <Scale className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Same method, either side</h3>
                <p className="text-sm text-neutral-600">
                  The methodology is identical whether plaintiff or defense commissions
                  the work. A plan that only holds up for the retaining party does
                  not survive cross-examination.
                </p>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <FileCheck className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Foundation, frequency, cost</h3>
                <p className="text-sm text-neutral-600">
                  Every item traces to a physician recommendation or published clinical
                  guidance, states its frequency and duration, and carries a documented,
                  geographically matched cost source that can be re-priced later.
                </p>
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <Lock className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Conflict-checked and confidential</h3>
                <p className="text-sm text-neutral-600">
                  Every matter opens with a conflict check, and pre-retention
                  communications are treated as confidential consulting-expert work
                  product until an engagement is in place.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Case narratives */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal as="div" className="grid grid-cols-1 gap-8">
            {caseStudies.map((cs) => (
              <article
                key={cs.title}
                className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 hover:border-teal hover:shadow-sm transition-all"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Illustrative engagement
                </p>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-navy mb-3">{cs.title}</h2>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  Context
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-5">{cs.context}</p>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Approach
                </h3>
                <ul className="space-y-1.5 mb-5">
                  {cs.approach.map((step) => (
                    <li key={step} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  What the plan delivered
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-5">{cs.result}</p>
                <Link
                  to={`/case-types/${cs.caseTypeSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:text-teal-dark"
                >
                  About this case type <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Services link */}
      <section className="pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-navy">
                Looking for a specific service?
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                Review our full service descriptions for detailed methodology and credential
                information.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm whitespace-nowrap"
            >
              View All Services <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
