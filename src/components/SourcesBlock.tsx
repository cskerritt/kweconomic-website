import type { Source } from "@/data/types";

const TYPE_LABEL: Record<Source["type"], string> = {
  "peer-reviewed": "Peer-Reviewed",
  gov: "Government",
  "case-law": "Case Law",
  org: "Organization",
};

/** Short, readable label for a trailing reference link (e.g. "doi.org", "bls.gov"). */
function linkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Link";
  }
}

export default function SourcesBlock({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;

  // A block reads as an APA bibliography only when every entry carries an APA
  // string. Otherwise (existing hand-authored lists) render exactly as before so
  // the pre-existing templates stay unchanged.
  const allApa = sources.every((s) => s.apa);

  return (
    <section aria-labelledby="sources-heading" className="mt-12 border-t border-neutral-200 pt-8">
      <h2 id="sources-heading" className="font-serif text-2xl text-navy mb-4">References</h2>
      {allApa ? (
        <ul className="space-y-3 text-neutral-700 text-sm md:text-base">
          {sources.map((s) => (
            <li
              key={s.apa}
              // Hanging indent: wrapped lines align under the first, APA-style.
              style={{ paddingLeft: "1.5em", textIndent: "-1.5em" }}
            >
              <span>{s.apa}</span>{" "}
              <a
                href={s.url}
                target="_blank"
                rel="noopener"
                className="whitespace-nowrap text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
              >
                {linkLabel(s.url)}
              </a>
              <span className="ml-2 text-xs uppercase text-neutral-500">{TYPE_LABEL[s.type]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ol className="list-decimal ml-5 space-y-2 text-neutral-700">
          {sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener" className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">{s.title}</a>
              <span className="ml-2 text-xs uppercase text-neutral-500">{TYPE_LABEL[s.type]}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
