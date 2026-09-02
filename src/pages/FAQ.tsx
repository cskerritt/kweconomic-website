import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ChevronDown, ChevronUp } from "lucide-react";
import AuthorByline from "@/components/AuthorByline";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SourcesBlock from "@/components/SourcesBlock";
import { renderTextWithLinks } from "@/lib/richtext";
import SchemaOrg from "@/components/SchemaOrg";
import {
  graphSchema,
  organizationSchema,
  faqPageSchema,
  breadcrumbSchema,
  ORG_URL,
  ORG_ID,
  WEBSITE_ID,
} from "@/lib/schema";
import { faqs, FAQ_DATE_MODIFIED } from "@/data/faqs";
import type { Source } from "@/data/types";
import { ORG_NAME, SITE_URL } from "@/lib/brand";

const PAGE_URL = `${ORG_URL}/resources/faq`;

// One consolidated reference list for the whole page: the de-duplicated union
// of every FAQ answer's registry-backed sources.
const faqReferences: Source[] = (() => {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const faq of faqs) {
    for (const s of faq.sources ?? []) {
      const key = s.apa ?? s.url;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(s);
      }
    }
  }
  return out;
})();

export default function FAQ() {
  usePageMeta({
    title: `Forensic Economist FAQ for Attorneys | ${ORG_NAME}`,
    description:
      "Answers for attorneys retaining a forensic economist: records, how the number is built, fees, timing, admissibility, and coverage in all 50 states.",
    canonical: `${SITE_URL}/resources/faq`,
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* The FAQPage node carries the revision date the byline prints; the
          breadcrumb matches the trail the page shows (there is no /resources
          hub, so the trail is Home > FAQ). */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          {
            ...faqPageSchema(faqs, PAGE_URL),
            url: PAGE_URL,
            dateModified: FAQ_DATE_MODIFIED,
            isPartOf: { "@id": WEBSITE_ID },
            about: { "@id": ORG_ID },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "FAQ", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "FAQ", url: "/resources/faq" }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-teal-light text-sm font-semibold uppercase tracking-wider mb-4">
              Common Questions
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Answers to common questions about economic damages analysis, our process, the
              records we need, fees, and geographic coverage. Don't see your question?{" "}
              <Link to="/contact" className="text-white underline underline-offset-2 decoration-white/40 hover:decoration-white">
                Contact us directly
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AuthorByline slug="christopher-skerritt" dateModified={FAQ_DATE_MODIFIED} />
          <h2 id="faq-list-heading" className="font-serif text-2xl md:text-3xl font-bold text-navy mb-6">
            Questions attorneys ask
          </h2>
          {/* WAI-ARIA accordion: each trigger is a heading-wrapped button so the
              question/answer unit is a real outline entry, not a styled span. */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.question}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
                >
                  <h3 className="m-0">
                    <button
                      onClick={() => toggle(index)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-navy leading-snug hover:bg-neutral-50 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-button-${index}`}
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-teal shrink-0" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-500 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  </h3>
                  {/* Always rendered (hidden when closed) so aria-controls resolves
                      and the answers stay in the DOM for crawlers. */}
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    hidden={!isOpen}
                    className="px-6 pb-6 text-neutral-700 leading-relaxed border-t border-neutral-100 pt-4"
                  >
                    {renderTextWithLinks(faq.answer)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Consolidated references - the union of every answer's registry sources */}
      {faqReferences.length > 0 && (
        <section className="pb-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <SourcesBlock sources={faqReferences} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
