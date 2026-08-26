import { FileText } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_URL } from "@/lib/schema";
import { EXPERT_CVS } from "@/data/expertCVs";

// Unlisted expert-CV library. noindex + slug-only: not in the nav, not in the
// sitemap, and served with X-Robots-Tag: noindex (server CLIENT_ONLY_ROUTES).
export default function ExpertCVs() {
  usePageMeta({
    title: "Expert CVs | KWVRS",
    description:
      "Current curricula vitae for KWVRS vocational, life care planning, and forensic economic experts.",
    canonical: `${ORG_URL}/cv`,
    noindex: true,
  });

  return (
    <article className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl text-navy mb-3">Expert Curricula Vitae</h1>
        <p className="text-neutral-700">
          Current CVs for our experts, shared for evaluation and disclosure. Each opens as a PDF.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {EXPERT_CVS.map((cv) => (
          <li key={cv.slug}>
            <a
              href={cv.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block font-semibold text-navy">{cv.name}</span>
                <span className="block text-sm text-neutral-600">{cv.title}</span>
                {cv.credentials.length > 0 && (
                  <span className="mt-1 block text-xs text-neutral-500">
                    {cv.credentials.join(", ")}
                  </span>
                )}
                <span className="mt-1 block text-xs font-medium text-teal">Open CV (PDF) &rarr;</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
