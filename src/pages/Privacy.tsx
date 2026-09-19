import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, SITE_URL } from "@/lib/brand";
import AnalyticsOptOut from "@/components/AnalyticsOptOut";
import {
  PRIVACY_BUILD_FLAGS,
  PRIVACY_CHOICES_HEADING,
  PRIVACY_EFFECTIVE_DATE,
  PRIVACY_LAST_REVISED,
  buildPrivacySections,
  privacyIntro,
  type PrivacyFlags,
} from "@/data/legal-policies";

// The policy text lives in src/data/legal-policies.ts (shared with the
// prerendered shell). The effective date of the policy is Chris's call (README
// "Facts to confirm"); it is printed as machine-readable <time> so a crawler can
// read it either way. The sections that depend on the build - Google Analytics,
// Cloudflare Turnstile - follow the real build flags; `flags` exists so the
// tests can render both branches.
const EFFECTIVE_DATE = PRIVACY_EFFECTIVE_DATE;

export default function Privacy({ flags = PRIVACY_BUILD_FLAGS }: { flags?: PrivacyFlags }) {
  const sections = buildPrivacySections(flags);
  usePageMeta({
    title: `Privacy Policy | ${ORG_NAME}`,
    description:
      `How ${ORG_NAME} handles information submitted through this site: contact and consultation forms, cookies, service providers, your choices, and data security.`,
    canonical: `${SITE_URL}/privacy`,
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-neutral-500 font-mono">
              Effective Date: <time dateTime={EFFECTIVE_DATE.iso}>{EFFECTIVE_DATE.label}</time>
            </p>
            <p className="text-sm text-neutral-500 font-mono mt-1">
              Last revised: <time dateTime={PRIVACY_LAST_REVISED.iso}>{PRIVACY_LAST_REVISED.label}</time>
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-neutral-700 leading-relaxed mb-10 text-base md:text-lg">
            {privacyIntro}
          </p>

          <div className="space-y-10">
            {sections.map((sec) => (
              <div key={sec.heading}>
                <h2 className="font-serif text-xl font-bold text-navy mb-4">{sec.heading}</h2>
                <div className="space-y-4">
                  {sec.content.split("\n\n").map((para, idx) => (
                    <p key={idx} className="text-neutral-700 leading-relaxed">
                      {para.trim()}
                    </p>
                  ))}
                  {/* The opt-out control exists only in a build that loads analytics. */}
                  {sec.heading === PRIVACY_CHOICES_HEADING && flags.analytics && <AnalyticsOptOut />}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-wrap gap-4 text-sm text-neutral-500">
            <Link to="/terms" className="hover:text-teal transition-colors">
              Terms of Service
            </Link>
            <span>&middot;</span>
            <Link to="/contact" className="hover:text-teal transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
