import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ChevronDown, ChevronUp } from "lucide-react";
import ContactCTA from "@/components/ContactCTA";
import SourcesBlock from "@/components/SourcesBlock";
import { renderTextWithLinks } from "@/lib/richtext";
import SchemaOrg from "@/components/SchemaOrg";
import { faqPageSchema } from "@/lib/schema";
import { faqs } from "@/data/faqs";
import type { Source } from "@/data/types";

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
    title: "Frequently Asked Questions | KWVRS",
    description:
      "Answers to common questions about KWVRS's vocational expert services, life care planning, forensic economics, expert credentials, and nationwide coverage.",
    canonical: "https://kwvrs.com/resources/faq",
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <SchemaOrg data={faqPageSchema(faqs, "https://kwvrs.com/resources/faq")} />
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Common Questions
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Answers to common questions about our services, process, credentials, and geographic
              coverage. Don't see your question? Contact us directly.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-neutral-50 transition-colors"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-button-${index}`}
                  >
                    <span className="font-semibold text-navy leading-snug">{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-teal shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-500 shrink-0" />
                    )}
                  </button>
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
