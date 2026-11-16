import type { Faq } from "@/data/types";
import { renderTextWithLinks } from "@/lib/richtext";

// Answers go through the allow-listed inline-link pass, so an answer that
// carries a [[/route|anchor]] marker renders it as a link instead of printing
// the marker; plain answers pass through unchanged.
export default function FAQBlock({ faqs, title = "Frequently Asked Questions" }: { faqs: Faq[]; title?: string }) {
  if (!faqs.length) return null;
  return (
    <section aria-labelledby="faq-heading" className="mt-12">
      <h2 id="faq-heading" className="font-serif text-2xl font-semibold text-navy mb-4">{title}</h2>
      <div className="space-y-4">
        {faqs.map((f) => (
          <details key={f.question} className="kw-disclosure rounded-xl border border-neutral-200 bg-white">
            <summary className="kw-ring-inset rounded-[11px] px-4 py-4 font-semibold text-navy">{f.question}</summary>
            <p className="px-4 pt-1 pb-4 text-neutral-700 max-w-[52ch]">{renderTextWithLinks(f.answer)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
