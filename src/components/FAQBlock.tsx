import type { Faq } from "@/data/types";
import { renderTextWithLinks } from "@/lib/richtext";

// Answers go through the allow-listed inline-link pass, so an answer that
// carries a [[/route|anchor]] marker renders it as a link instead of printing
// the marker; plain answers pass through unchanged.
export default function FAQBlock({ faqs, title = "Frequently Asked Questions" }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="font-serif text-2xl text-navy mb-4">{title}</h2>
      <div className="space-y-4">
        {faqs.map((f) => (
          <details key={f.question} className="border border-neutral-200 rounded-lg p-4">
            <summary className="cursor-pointer font-semibold text-navy">{f.question}</summary>
            <p className="mt-2 text-neutral-700">{renderTextWithLinks(f.answer)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
