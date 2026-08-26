import { Link } from "react-router-dom";
import { Briefcase, HeartPulse, Calculator, ArrowRight, ShieldCheck, Clock, MapPin, Scale } from "lucide-react";
import Reveal from "@/components/Reveal";

/**
 * Plain-English "which discipline does my case need?" selector for attorneys
 * new to retaining vocational / life-care / economic experts. Maps a real-world
 * scenario to the right service, then answers the two follow-up anxieties every
 * first-time buyer has: what it costs and what happens next.
 */

const SCENARIOS = [
  {
    icon: Briefcase,
    when: "Can the injured person still work - and what can they realistically earn?",
    expert: "Vocational Expert",
    does: "Evaluates earning capacity, employability, and labor-market access from the records and vocational profile - to establish a claim or to test one.",
    href: "/services/vocational-expert",
  },
  {
    icon: HeartPulse,
    when: "What future medical and care will be needed - and what will it cost?",
    expert: "Life Care Planner",
    does: "Projects future medical, therapy, equipment, and care needs into defensible cost categories - or reviews a plan the other side has put forward.",
    href: "/services/life-care-planning",
  },
  {
    icon: Calculator,
    when: "What are the past and future losses worth in today's dollars?",
    expert: "Forensic Economist",
    does: "Values lost earnings, benefits, and household services at present value - or audits an opposing expert's calculation.",
    href: "/services/forensic-economics",
  },
];

const FACTS = [
  {
    icon: ShieldCheck,
    label: "No-obligation start",
    body: "Every matter opens with a conflict check and a fee quote sized to your case - usually within one business day.",
  },
  {
    icon: MapPin,
    label: "Nationwide coverage",
    body: "Cases accepted in all 50 states, DC, and US territories - interviews are conducted remotely or onsite as the case requires.",
  },
  {
    icon: Clock,
    label: "Full engagements",
    body: "Full retained-expert engagements are billed hourly across review, evaluation, report, and testimony - no surprises, scoped up front.",
  },
];

export default function WhichExpert() {
  return (
    <section className="py-16 md:py-20 bg-neutral-50 border-y border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <p className="text-amber-dark text-xs font-semibold uppercase tracking-[0.18em] mb-3">
            New to retaining an expert?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-3">
            Which expert does your case need?
          </h2>
          <p className="text-neutral-700">
            You don't have to know the terminology. Whether you are presenting a
            claim or testing one, start from the question in your case and we'll
            point you to the right discipline. The methodology is the same
            whichever side retains us - matters often need more than one expert,
            working together.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy">
            <Scale className="w-4 h-4 text-amber-dark" />
            Retained by plaintiff and defense counsel
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SCENARIOS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.href} delay={i * 70}>
                <Link
                  to={s.href}
                  className="kw-lift group flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-6 hover:border-navy hover:shadow-lg"
                >
                  <span className="inline-flex w-11 h-11 rounded-lg bg-navy/5 items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <Icon className="w-5 h-5 text-navy" />
                  </span>
                  <p className="text-sm font-semibold text-amber-dark mb-2">The question</p>
                  <p className="font-serif text-lg font-bold text-navy leading-snug mb-3">
                    {s.when}
                  </p>
                  <p className="text-sm text-neutral-600 mb-4 flex-1">{s.does}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-amber-dark transition-colors">
                    You likely need a {s.expert}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Not sure */}
        <Reveal delay={120}>
          <div className="mt-6 rounded-xl border border-navy/15 bg-navy/[0.03] p-5 sm:flex sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-neutral-700 mb-3 sm:mb-0">
              <strong className="text-navy">Not sure, or your case touches several of these?</strong>{" "}
              Tell us what happened - whether you're building the claim or
              challenging it - and we'll tell you honestly which discipline(s) the
              case actually needs.
            </p>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-navy hover:bg-navy-light text-white font-semibold px-5 py-3 rounded-lg text-sm transition-colors"
            >
              Ask us - reply in 1 business day <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        {/* Cost + process transparency */}
        <Reveal delay={150}>
          <dl className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {FACTS.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="rounded-lg border border-neutral-200 bg-white p-5">
                  <dt className="flex items-center gap-2 font-semibold text-navy mb-1.5">
                    <Icon className="w-4 h-4 text-amber-dark" />
                    {f.label}
                  </dt>
                  <dd className="text-sm text-neutral-600">{f.body}</dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
