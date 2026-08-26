import { Link } from "react-router-dom";
import { disclosureRules } from "@/data/disclosureRules";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import {
  breadcrumbSchema,
  faqPageSchema,
  graphSchema,
  organizationSchema,
  websiteSchema,
  ORG_URL,
} from "@/lib/schema";
import { expertDisclosurePillarSchema } from "@/lib/expertDisclosureSchema";
import { usePageMeta } from "@/hooks/use-page-meta";

const PILLAR_FAQS = [
  {
    question: "What is a pre-trial expert disclosure?",
    answer:
      "A pre-trial expert disclosure is a written statement, required by the governing civil procedure framework, identifying the expert who will testify, the substance of the expert's opinions, and (depending on the jurisdiction) the bases for those opinions. The required content varies by state. KWVRS provides compliance-grade disclosure deliverables and the attorney is responsible for confirming the governing rule and timing for the specific case.",
  },
  {
    question: "Why does each state have a different framework?",
    answer:
      "State courts adopt their own civil procedure frameworks. Some states track a federal-style approach with a comprehensive written report; others use an interrogatory-driven disclosure that supplies identity, subject matter, opinions, and grounds; a few states use distinctive frameworks of their own. Timing and supplementation duties also vary. KWVRS maintains state-by-state pages so attorneys have a consistent service surface across jurisdictions; the attorney verifies the governing rule for the specific case.",
  },
];

export default function ExpertDisclosurePillar() {
  const url = `${ORG_URL}/services/expert-disclosure`;
  usePageMeta({
    title: "Expert Disclosure Services | All 50 States | KWVRS",
    description:
      "Pre-trial expert disclosure services for attorneys nationwide. State-by-state pages with practice notes for vocational, economic, and life care expert disclosures. Plaintiff and defense.",
    canonical: url,
  });

  // Group jurisdictions alphabetically for display
  const sortedRules = [...disclosureRules].sort((a, b) => a.stateName.localeCompare(b.stateName));

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          expertDisclosurePillarSchema({
            jurisdictionCount: disclosureRules.length,
            dateModified: "2026-05-03",
          }),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Services", url: `${ORG_URL}/services` },
            { name: "Expert Disclosure", url },
          ]),
          faqPageSchema(PILLAR_FAQS, url),
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "Expert Disclosure", url: "/services/expert-disclosure" },
        ]}
      />

      <header className="mb-10">
        <h1 className="font-serif text-4xl lg:text-5xl text-navy mb-4">Expert Disclosure</h1>
        <p className="text-lg text-neutral-700 max-w-3xl">
          Pre-trial expert disclosure services for attorneys nationwide. KWVRS prepares vocational, economic, and life care expert disclosures sized to the governing framework. Select your jurisdiction below for state-specific practice notes.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="font-serif text-3xl text-navy mb-6">Select your jurisdiction ({sortedRules.length})</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sortedRules.map((rule) => (
            <Link
              key={rule.stateSlug}
              to={`/services/expert-disclosure/${rule.stateSlug}`}
              className="rounded-lg border border-neutral-200 p-4 hover:border-teal hover:shadow-sm transition-colors"
            >
              <h3 className="font-medium text-navy">{rule.stateName}</h3>
              <p className="text-sm text-neutral-600 mt-1">Practice notes</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-serif text-3xl text-navy mb-6">Common questions</h2>
        <div className="space-y-3">
          {PILLAR_FAQS.map((f, i) => (
            <details key={i} className="rounded-lg border border-neutral-200 p-4">
              <summary className="font-medium text-navy cursor-pointer">{f.question}</summary>
              <p className="mt-3 text-neutral-700">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-lg border border-amber/40 bg-amber/5 p-5">
        <p className="text-sm text-neutral-700">
          The state pages on this site describe KWVRS services and provide general practice notes; they do not provide legal advice and do not cite primary-source rules or case law. Attorneys are responsible for confirming the governing rule, timing, and content requirements for their specific case against primary sources.
        </p>
      </section>

      <section className="rounded-lg bg-navy text-white p-8 text-center">
        <h2 className="font-serif text-2xl mb-3">Discuss disclosure for your matter</h2>
        <p className="mb-6 text-white/85">KWVRS provides vocational, economic, and life care expert opinions for plaintiff and defense counsel nationwide. Tell us about your case and we will scope the appropriate deliverable.</p>
        <Link to="/contact" className="inline-block bg-amber text-navy font-medium px-8 py-3 rounded-lg hover:bg-amber-dark transition-colors">
          Get a Quote
        </Link>
      </section>
    </article>
  );
}
