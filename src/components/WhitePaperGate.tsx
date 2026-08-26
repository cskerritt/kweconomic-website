import { useEffect, useState } from "react";
import { Lock, Download, Check } from "lucide-react";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import type { WhitePaper } from "@/data/whitePapers";

const STORAGE_PREFIX = "kwvrs:wp:";

interface WhitePaperGateProps {
  paper: WhitePaper;
}

/**
 * Email-gated reader for a white paper. The abstract, key takeaways, outline,
 * and the first section render openly (so the page stays useful and the content
 * remains in the DOM for crawlers). The remaining sections are visually gated
 * behind an email capture; once submitted the lead is stored server-side and
 * the full paper unlocks (remembered locally for return visits).
 */
export default function WhitePaperGate({ paper }: WhitePaperGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_PREFIX + paper.slug) === "1") setUnlocked(true);
    } catch {
      /* localStorage unavailable - stay gated */
    }
  }, [paper.slug]);

  const [teaser, ...gated] = paper.sections;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/whitepaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, slug: paper.slug, title: paper.title, turnstileToken, company_website: companyWebsite }),
      });
      if (!res.ok) throw new Error("request failed");
      try {
        localStorage.setItem(STORAGE_PREFIX + paper.slug, "1");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
    } catch {
      setStatus("error");
    }
  }

  function renderSection(s: WhitePaper["sections"][number]) {
    return (
      <section key={s.heading} className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-navy mb-3">{s.heading}</h2>
        <div
          className="prose prose-neutral max-w-none text-neutral-700"
          dangerouslySetInnerHTML={{ __html: s.bodyHtml }}
        />
      </section>
    );
  }

  return (
    <div>
      {/* Teaser section - always open */}
      {teaser && renderSection(teaser)}

      {unlocked ? (
        <>
          {gated.map((s) => renderSection(s))}
          <button
            onClick={() => window.print()}
            className="kw-lift inline-flex items-center gap-2 rounded-lg border border-navy/20 bg-white px-5 py-3 text-sm font-semibold text-navy hover:border-navy hover:shadow-md print:hidden"
          >
            <Download className="w-4 h-4" /> Print / Save as PDF
          </button>
        </>
      ) : (
        <div className="relative">
          {/* Remaining content stays in the DOM (crawlable) but is visually gated. */}
          <div
            className="pointer-events-none select-none blur-[6px] opacity-60 max-h-72 overflow-hidden"
            aria-hidden="true"
          >
            {gated.map((s) => renderSection(s))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-neutral-50 via-neutral-50/90 to-transparent" />

          <div className="relative -mt-24 mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-7 shadow-xl">
            <div className="flex items-center gap-2 text-amber-dark mb-2">
              <Lock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">Full white paper</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-navy mb-2">
              Read the complete paper
            </h3>
            <p className="text-sm text-neutral-600 mb-5">
              Enter your details to unlock the full {paper.readingTime.replace(" read", "")} paper and a
              print-ready version. We will only use this to follow up about your inquiry.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                aria-label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber focus:ring-2 focus:ring-amber/30 outline-none"
              />
              <input
                type="email"
                required
                aria-label="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber focus:ring-2 focus:ring-amber/30 outline-none"
              />
              <Turnstile onToken={setTurnstileToken} />
              <HoneypotField onChange={setCompanyWebsite} />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="kw-magnetic group w-full inline-flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                {status === "submitting" ? "Unlocking..." : (
                  <>
                    <Check className="w-4 h-4" /> Unlock the full paper
                  </>
                )}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600">
                  Something went wrong. Please try again or call (201) 343-0700.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
