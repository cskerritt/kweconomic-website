import { Link } from "react-router-dom";
import { ArrowRight, Scale, FileCheck, Lock } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, SITE_URL } from "@/lib/brand";
import AuthorByline from "@/components/AuthorByline";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";

const PAGE_URL = `${ORG_URL}/case-studies`;
// Date the narratives were last revised; printed in the byline and stamped on
// the CollectionPage node. The static shell prints the same value.
export const CASE_STUDIES_DATE_MODIFIED = "2026-08-28";

// Illustrative, anonymized narratives. Each is a composite drawn from the
// kinds of engagements a forensic economist handles; none describes a specific
// client, matter, venue, party, or outcome. Dollar figures are deliberately
// omitted.
const caseStudies = [
  {
    title: "Lost Earnings in a Traumatic Brain Injury Matter",
    caseTypeSlug: "traumatic-brain-injury",
    context:
      "A skilled tradesperson in mid-career sustained a traumatic brain injury in a motor vehicle collision. After rehabilitation the person returned to part-time work in a lower-paid position, and the treating record and a vocational opinion agreed that a return to the prior trade was not expected.",
    approach: [
      "Earnings base established from several years of tax returns, W-2 forms, and union wage and benefit records, with overtime and shift differentials examined separately rather than averaged in",
      "But-for earnings projected over the person's statistical worklife with wage growth drawn from published government series for the occupation and region, and employer-paid benefits valued as a share of wages",
      "Post-injury earnings path built from the actual part-time wage and the vocational opinion on the person's remaining capacity, then offset against the but-for stream year by year",
      "Future net losses discounted to present value under the discount rate convention that applies in the venue, with a sensitivity table showing the effect of alternative worklife and growth assumptions",
    ],
    result:
      "The report gave counsel a schedule in which every year's loss traced to a stated earnings base, growth rate, and post-injury wage, so a mediator could see exactly what moved the number. Because the sensitivity table had already bracketed the worklife and growth assumptions, a critique of the report has to engage a specific input rather than the method.",
  },
  {
    title: "Lost Profits in a Commercial Contract Dispute",
    caseTypeSlug: "commercial-contract-dispute",
    context:
      "A regional distributor claimed that a supplier's early termination of an exclusive supply agreement caused lost profits over the remaining contract term. The distributor had several years of financial statements before the termination and a partial recovery from substitute suppliers afterward.",
    approach: [
      "But-for revenue projected from the distributor's own pre-termination sales history and the volume commitments in the agreement, tested against the growth of the market over the same period",
      "Avoided costs identified from the general ledger so that only the incremental costs the distributor no longer incurred were deducted, leaving lost profit rather than lost revenue",
      "Mitigation credited from the actual substitute-supplier results, with the transition costs of establishing those relationships treated as part of the loss",
      "Losses over the remaining term discounted to the date of breach and reconciled to the financial statements the parties had exchanged in discovery",
    ],
    result:
      "The analysis tied every figure to the distributor's own records and the contract, addressed causation and mitigation directly, and separated lost profit from lost revenue. Counsel could present a number whose foundation was visible on the face of the report, and any challenge had to be directed at a stated assumption, such as the growth rate, rather than at an undisclosed method.",
  },
  {
    title: "Business Valuation in a Shareholder Dispute",
    caseTypeSlug: "partnership-and-shareholder-dispute",
    context:
      "A minority shareholder in a closely held professional services company sought a buyout after a dispute with the majority owners. The company had stable revenue, an owner-heavy cost structure, and no prior transactions in its shares.",
    approach: [
      "Financial statements normalized for owner compensation above market, personal expenses run through the business, and non-recurring items, so that the earnings stream reflected what a buyer would expect to receive",
      "Income approach applied to the normalized cash flow with a capitalization rate built up from published risk data, cross-checked against a market approach using transactions in comparable private companies",
      "The standard of value that applies to a buyout under the state's law identified with counsel before the analysis, so that discounts for lack of control and marketability were addressed under that standard rather than assumed",
      "Value reported as of the date the parties agreed on, with a reconciliation of the approaches and a sensitivity analysis on the capitalization rate and the owner compensation adjustment",
    ],
    result:
      "The report gave the parties a documented value with each normalization adjustment explained and the discount question framed under the governing standard of value rather than left to argument. Both sides had a common basis from which to negotiate, and the reconciliation showed how much of the range came from each approach.",
  },
];

export default function CaseStudies() {
  // /case-studies is self-canonical and indexable (it is listed in
  // sitemap-core.xml). It complements the /case-types hub, which is the page
  // surfaced in the nav: that hub catalogs the case types, this page walks
  // through how a damages figure is built in three of them.
  usePageMeta({
    title: `Illustrative Economic Damages Engagements | ${ORG_NAME}`,
    description:
      `Three anonymized engagements show how ${ORG_NAME} builds a lost earnings, lost profits, or business valuation figure for plaintiff and defense counsel.`,
    canonical: `${SITE_URL}/case-studies`,
  });

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          {
            "@type": "CollectionPage",
            "@id": `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: "Illustrative Economic Damages Engagements",
            dateModified: CASE_STUDIES_DATE_MODIFIED,
            isPartOf: { "@id": WEBSITE_ID },
            about: { "@id": ORG_ID },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Case Studies", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Case Studies", url: "/case-studies" }]} />
        </div>
      </div>

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
              How an Economic Damages Analysis Is Built
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {ORG_NAME} supports both plaintiff and defense counsel. The three narratives below
              are anonymized composites that show how a damages figure is grounded, structured,
              and tested in three common contexts. They describe method, not specific cases or
              outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Intro note */}
      <section className="py-10 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <AuthorByline slug="christopher-skerritt" dateModified={CASE_STUDIES_DATE_MODIFIED} />
            <p className="text-neutral-700 leading-relaxed">
              Our work is retained by plaintiff attorneys, defense attorneys, insurers, and
              businesses. We do not advocate for either side - our role is to apply accepted
              economic methods to the records in the case and produce an analysis that can be
              examined figure by figure. The narratives below are illustrative and contain no
              client-identifying details; any resemblance to a particular matter is coincidental.
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
              Whatever the loss, the analysis is held to the same standard -
              so each figure holds up under examination, not just on paper.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <Scale className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Same method, either side</h3>
                <p className="text-sm text-neutral-600">
                  The methodology is identical whether plaintiff or defense commissions
                  the work. An analysis that only holds up for the retaining party does
                  not survive cross-examination.
                </p>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <FileCheck className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Records, assumptions, arithmetic</h3>
                <p className="text-sm text-neutral-600">
                  Every figure traces to a record in the case or a published data source,
                  states the assumption behind it, and can be recomputed by the other side
                  from the report alone.
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
                className="bg-white rounded-xl border border-neutral-200 p-6 md:p-8 hover:border-amber hover:shadow-sm transition-all"
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
                      <span className="w-1.5 h-1.5 rounded-full bg-amber mt-2 shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                  What the analysis delivered
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-5">{cs.result}</p>
                <Link
                  to={`/case-types/${cs.caseTypeSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-dark hover:text-navy"
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
                Review our full service descriptions for detailed methodology, cost, process, and
                timeline information.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm whitespace-nowrap"
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
