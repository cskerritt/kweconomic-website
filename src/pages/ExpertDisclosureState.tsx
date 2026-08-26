import { Link, Navigate, useParams } from "react-router-dom";
import { states } from "@/data/states";
import { getDisclosureRule } from "@/data/disclosureRules";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import {
  breadcrumbSchema,
  faqPageSchema,
  graphSchema,
  organizationSchema,
  ORG_URL,
} from "@/lib/schema";
import { disclosureStateSchema } from "@/lib/expertDisclosureSchema";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function ExpertDisclosureState() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const state = states.find((s) => s.slug === stateSlug);
  const rule = stateSlug ? getDisclosureRule(stateSlug) : undefined;

  const url = state ? `${ORG_URL}/services/expert-disclosure/${state.slug}` : "";

  usePageMeta(
    state
      ? {
          title: `${state.name} Pre-Trial Expert Disclosure Services | KWVRS`,
          description: rule
            ? `${state.name} pre-trial expert disclosure services for attorneys. ${rule.plainSummary.slice(0, 140)}`
            : `Pre-trial expert disclosure services for attorneys in ${state.name}.`,
          canonical: url,
        }
      : null,
  );

  if (!state) return <Navigate to="/services/expert-disclosure" replace />;

  if (!rule) {
    return (
      <article className="max-w-3xl mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { name: "Home", url: "/" },
            { name: "Services", url: "/services" },
            { name: "Expert Disclosure", url: "/services/expert-disclosure" },
            { name: state.name, url: `/services/expert-disclosure/${state.slug}` },
          ]}
        />
        <h1 className="font-serif text-4xl text-navy mb-4">
          {state.name} Pre-Trial Expert Disclosure
        </h1>
        <p className="text-neutral-700">
          KWVRS provides pre-trial expert disclosure deliverables for attorneys in {state.name}; contact us for case-specific scope.
        </p>
        <Link to="/contact" className="inline-block mt-6 bg-teal hover:bg-teal-dark text-white font-medium px-6 py-3 rounded-lg">
          Request consultation
        </Link>
      </article>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          disclosureStateSchema({
            stateSlug: state.slug,
            stateName: state.name,
            dateModified: rule.dateModified,
          }),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Services", url: `${ORG_URL}/services` },
            { name: "Expert Disclosure", url: `${ORG_URL}/services/expert-disclosure` },
            { name: state.name, url },
          ]),
          faqPageSchema(rule.faqs, url),
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Expert Disclosure", url: "/services/expert-disclosure" },
          { name: state.name, url: `/services/expert-disclosure/${state.slug}` },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-serif text-4xl text-navy mb-3">
          {state.name} Pre-Trial Expert Disclosure
        </h1>
        <p className="text-lg text-neutral-700">
          KWVRS provides pre-trial expert disclosure services for attorneys handling matters venued in {state.name}.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-serif text-2xl text-navy mb-3">Overview</h2>
        <p className="text-neutral-700">{rule.plainSummary}</p>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-2xl text-navy mb-3">{state.name} practice notes</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-2">
          {rule.practiceNotes.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-serif text-2xl text-navy mb-3">Frequently asked</h2>
        <div className="space-y-3">
          {rule.faqs.map((f, i) => (
            <details key={i} className="rounded-lg border border-neutral-200 p-4">
              <summary className="font-medium text-navy cursor-pointer">{f.question}</summary>
              <p className="mt-3 text-neutral-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-amber/40 bg-amber/5 p-5">
        <p className="text-sm text-neutral-700">
          This page describes KWVRS services for attorneys handling matters in {state.name} and does not provide legal advice. Attorneys are responsible for confirming the governing rule and timing for their specific case against primary sources.
        </p>
      </section>

      <section className="rounded-lg bg-navy text-white p-8 text-center">
        <h2 className="font-serif text-2xl mb-3">Request a {state.name} Pre-Trial Expert Disclosure</h2>
        <p className="mb-6 text-white/85">Compliance-grade deliverable. Plaintiff and defense.</p>
        <Link
          to={`/contact?service=expert-disclosure&state=${state.slug}`}
          className="inline-block bg-amber text-navy font-medium px-8 py-3 rounded-lg hover:bg-amber-dark transition-colors"
        >
          Start intake
        </Link>
      </section>

      <p className="mt-6 text-xs text-neutral-500">
        Last updated: {rule.dateModified}.
      </p>
    </article>
  );
}
