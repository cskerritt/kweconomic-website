import { Link } from "react-router-dom";
import { ArrowRight, Scale, FileCheck, Lock } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";

const caseTypes = [
  {
    title: "Personal Injury",
    description:
      "In personal injury cases, KWVRS provides vocational evaluation, earning capacity analysis, life care planning, and forensic economics testimony. Our evaluators assess the full vocational impact of the injured person's injuries - what occupations they can no longer perform, what occupations remain available, and the wage differential between pre-injury and post-injury earning capacity - whether the analysis supports a claim or tests one.",
    serviceLines: [
      "Vocational evaluation and earning capacity analysis",
      "Life care plan development for catastrophic injuries",
      "Lost earnings and household services calculations",
      "Deposition and trial testimony",
    ],
  },
  {
    title: "Medical Malpractice",
    description:
      "Medical malpractice cases often involve complex, long-term damages. KWVRS works with plaintiff and defense counsel to evaluate the vocational and economic consequences of alleged malpractice - including life care planning for ongoing medical needs, assessment of lost earning capacity resulting from the alleged negligence, and forensic economics analysis to project and present-value those costs and losses.",
    serviceLines: [
      "Life care planning for ongoing and future medical needs",
      "Vocational evaluation where the malpractice affected work capacity",
      "Forensic economics - present value of future care costs",
      "Coordination with treating and evaluating physicians",
    ],
  },
  {
    title: "Workers' Compensation",
    description:
      "Workers' compensation matters frequently require vocational evaluation to determine whether an injured worker can return to their prior job, perform modified duty, or transition to alternative occupations. KWVRS provides transferable skills analysis, labor market surveys, and earning capacity opinions that comply with the standards applicable in the relevant jurisdiction's workers' compensation system.",
    serviceLines: [
      "Return-to-work assessment and transferable skills analysis",
      "Labor market surveys for alternative occupations",
      "Earning capacity evaluation post-injury",
      "Coordination with vocational rehabilitation counselors",
    ],
  },
  {
    title: "Wrongful Death",
    description:
      "Wrongful death damages analysis requires projecting the decedent's economic contributions to surviving family members over a projected working lifetime. KWVRS provides complete forensic economics analysis including lost earnings projections, household services valuation, personal consumption deductions, fringe benefits analysis, and present-value calculations - together with vocational background analysis establishing the decedent's pre-death earning trajectory.",
    serviceLines: [
      "Lost earnings projections based on decedent's work history and prospects",
      "Household services valuation",
      "Personal consumption deduction analysis",
      "Present-value damages summary for trial or mediation",
    ],
  },
  {
    title: "Matrimonial",
    description:
      "In divorce and family law proceedings, KWVRS provides vocational evaluation of parties who are unemployed or allegedly underemployed, earning capacity opinions for income imputation purposes, and forensic economics analysis relevant to equitable distribution or support calculations. Evaluations address the party's educational background, work history, functional capacity, and current labor market conditions.",
    serviceLines: [
      "Earning capacity evaluation for voluntary unemployment or underemployment",
      "Income imputation analysis for support proceedings",
      "Assessment of retraining needs and timeline to employment",
      "Written reports suitable for submission in family court",
    ],
  },
  {
    title: "Wrongful Termination",
    description:
      "Wrongful termination and employment discrimination cases require analysis of the terminated employee's lost earnings from the date of termination forward, as well as an assessment of their mitigation efforts and remaining earning capacity. KWVRS evaluates the employee's vocational assets, the labor market for their occupational profile, and the realistic trajectory of re-employment, providing a grounded economic damages analysis.",
    serviceLines: [
      "Lost wages and benefits analysis from date of termination",
      "Mitigation analysis - what the employee could and did earn afterward",
      "Earning capacity evaluation given current labor market conditions",
      "Forensic economics calculations for back pay and front pay damages",
    ],
  },
];

export default function CaseStudies() {
  // This overview duplicates the richer /case-types hub; canonicalize to it so
  // the two "Case Types" pages don't compete in search. /case-types is the one
  // surfaced in the nav.
  usePageMeta({
    title: "Common Case Types | KWVRS",
    description:
      "Kincaid Wolstein Vocational and Rehabilitation Services provides vocational, life care planning, and forensic economics expertise across a broad range of litigation matters.",
    canonical: "https://kwvrs.com/case-types",
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
              Practice Areas
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Case Types
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Kincaid Wolstein Vocational and Rehabilitation Services supports both plaintiff and
              defense counsel across a wide range of litigation matters. Below is an overview of
              the primary case types we handle and the specific services we provide in each context.
            </p>
          </div>
        </div>
      </section>

      {/* Intro note */}
      <section className="py-10 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-neutral-700 leading-relaxed">
              Our work is retained by plaintiff attorneys, defense attorneys, insurance carriers,
              and courts. We do not advocate for either side - our role is to apply established
              methodology and provide objective analysis that withstands challenge. The case type
              descriptions below reflect the analytical services we provide in each litigation
              context, not specific cases or outcomes.
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
              Whatever the matter type, the analysis is held to the same standard -
              so the opinion holds up under examination, not just on paper.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <Scale className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Same method, either side</h3>
                <p className="text-sm text-neutral-600">
                  The methodology is identical whether plaintiff or defense commissions
                  the work. An opinion that only holds up for the retaining party does
                  not survive cross-examination.
                </p>
              </div>
            </Reveal>
            <Reveal delay={70}>
              <div className="h-full rounded-xl border border-neutral-200 bg-white p-6">
                <FileCheck className="w-6 h-6 text-amber-dark mb-3" />
                <h3 className="font-serif text-lg font-bold text-navy mb-2">Accepted methods, documented reasoning</h3>
                <p className="text-sm text-neutral-600">
                  Opinions rest on established methods - transferable skills analysis,
                  labor-market survey, worklife expectancy, present-value calculation -
                  grounded in recognized data sources, with the reasoning documented so
                  it can be examined.
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

      {/* Case type grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal as="div" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {caseTypes.map((ct) => (
              <div
                key={ct.title}
                className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-teal hover:shadow-sm transition-all"
              >
                <h2 className="font-serif text-xl font-bold text-navy mb-3">{ct.title}</h2>
                <p className="text-sm text-neutral-700 leading-relaxed mb-5">{ct.description}</p>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  Services Provided
                </h3>
                <ul className="space-y-1.5">
                  {ct.serviceLines.map((svc) => (
                    <li key={svc} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal mt-2 shrink-0" />
                      {svc}
                    </li>
                  ))}
                </ul>
              </div>
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
