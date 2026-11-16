import { useState, useSyncExternalStore } from "react";
import { markFormReady } from "@/lib/form-ready";
import { Lock, Download, Check } from "lucide-react";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import PrivacyNotice from "@/components/PrivacyNotice";
import { ORG_PHONE, ORG_PHONE_DISPLAY, telHref } from "@/lib/brand";
import type { WhitePaper } from "@/data/whitePapers";

// localStorage key prefix for the per-paper unlock flag. Named for this site
// only: sister-brand tokens are spelled solely in src/lib/brand.ts.
const STORAGE_PREFIX = "kweconomics:wp:";

// The unlock flag lives in localStorage, which the build's server render does not have.
// It is read through useSyncExternalStore with a server snapshot of "locked", so the
// prerendered HTML and the first client render agree and React switches to the real
// value after hydrating. The gated sections are therefore never in the static HTML.
const listeners = new Set<() => void>();
const subscribeUnlock = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
function readUnlocked(slug: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + slug) === "1";
  } catch {
    return false; // localStorage unavailable - stay gated
  }
}

interface WhitePaperGateProps {
  paper: WhitePaper;
}

/**
 * Email-gated reader for a white paper. The abstract, key takeaways, outline,
 * and the first section render openly. The remaining sections are not rendered
 * (and so are not in the prerendered HTML) until the visitor submits an email
 * capture; the lead is then stored server-side and the full paper unlocks
 * (remembered locally for return visits).
 */
export default function WhitePaperGate({ paper }: WhitePaperGateProps) {
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const storedUnlocked = useSyncExternalStore(
    subscribeUnlock,
    () => readUnlocked(paper.slug),
    () => false,
  );
  const unlocked = storedUnlocked || sessionUnlocked;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");

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
      setSessionUnlocked(true);
      listeners.forEach((cb) => cb());
    } catch {
      setStatus("error");
    }
  }

  function renderSection(s: WhitePaper["sections"][number]) {
    return (
      <section key={s.heading} className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-navy mb-3">{s.heading}</h2>
        <div
          className="kw-prose"
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
            className="kw-lift inline-flex items-center gap-2 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-raised bg-white px-5 py-3 text-sm font-semibold text-navy print:hidden"
          >
            <Download className="w-4 h-4" /> Print / Save as PDF
          </button>
        </>
      ) : (
        <div className="relative">
          {/* The gated sections are not rendered until unlocked (they are not in the static HTML):
              a neutral placeholder holds the space behind the form. */}
          <div className="h-72 rounded-xl bg-neutral-100" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-neutral-50 via-neutral-50/90 to-transparent" />

          <div className="relative -mt-24 mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-7">
            <div className="flex items-center gap-2 text-amber-dark mb-2">
              <Lock className="w-4 h-4" />
              <span className="kw-label">Full white paper</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-navy mb-2">
              Read the complete paper
            </h3>
            <p className="text-sm text-neutral-600 mb-5">
              Enter your details to unlock the full {paper.readingTime.replace(" read", "")} paper and a
              print-ready version. We may follow up by email about this paper and our services. You
              can tell us to stop at any time.
            </p>
            <form method="post" ref={markFormReady} onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                aria-label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="kw-field"
              />
              <input
                type="email"
                required
                aria-label="Work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email"
                className="kw-field"
              />
              <Turnstile onToken={setTurnstileToken} />
              <HoneypotField onChange={setCompanyWebsite} />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="kw-press min-h-11 group w-full inline-flex items-center justify-center gap-2 bg-amber-dark hover:bg-amber-darker active:bg-amber-darker disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg"
              >
                {status === "submitting" ? "Unlocking..." : (
                  <>
                    <Check className="w-4 h-4" /> Unlock the full paper
                  </>
                )}
              </button>
              <PrivacyNotice />
              {status === "error" && (
                <p className="text-sm text-red-600">
                  Something went wrong. Please try again or call{" "}
                  <a href={telHref(ORG_PHONE)} className="kw-link">
                    {ORG_PHONE_DISPLAY}
                  </a>
                  .
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
