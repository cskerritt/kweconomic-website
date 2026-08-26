import { FileText } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_URL } from "@/lib/schema";
import { SAMPLE_CATEGORIES, SAMPLE_REPORTS } from "@/data/sampleReports";

// Unlisted sample-report library. noindex + slug-only: not in the nav, not in
// the sitemap, and served with X-Robots-Tag: noindex (server CLIENT_ONLY_ROUTES).
export default function SampleReports() {
  usePageMeta({
    title: "Sample Reports | KWVRS",
    description:
      "Representative KWVRS sample reports across vocational, life care planning, forensic economics, and matrimonial disciplines.",
    canonical: `${ORG_URL}/samples`,
    noindex: true,
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-navy mb-3">Sample Reports</h1>
        <p className="text-neutral-700">
          Representative sample reports across our core disciplines, shared for evaluation. Each
          opens as a PDF.
        </p>
      </header>

      {SAMPLE_CATEGORIES.map((category) => {
        const items = SAMPLE_REPORTS.filter((r) => r.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="mb-10">
            <h2 className="font-serif text-2xl text-navy mb-4 border-b border-neutral-200 pb-2">
              {category}
            </h2>
            <ul className="grid gap-3">
              {items.map((r) => (
                <li key={r.slug}>
                  <a
                    href={r.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                  >
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block font-semibold text-navy">{r.title}</span>
                      <span className="block text-sm text-neutral-600">{r.summary}</span>
                      <span className="mt-1 block text-xs font-medium text-teal">Open PDF &rarr;</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}
