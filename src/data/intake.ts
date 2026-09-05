import { ORG_NAME, ORG_SHORT } from "@/lib/brand";

/**
 * Copy about where an inquiry goes, shared by every page that describes it
 * and by scripts/prerender.mjs so the shells print the same words (site audit
 * 2026-09-05, F06 and F08 /contact: the contact form said "We do not share
 * inquiries with third parties" while the inbox it reaches (src/lib/brand.ts
 * ORG_EMAIL, lib/lead-mailer.server.mjs DEFAULT_LEAD_RECIPIENTS) is the one
 * the affiliated vocational and life care planning practices share; /about
 * then described that shared intake).
 *
 * Every sentence here states only what the repository documents: the shared
 * intake inbox (brand.ts, the lead mailer) and the fact that each practice is
 * retained under its own engagement agreement and bills its own work
 * (src/data/services.ts, the two pillar: false entries). Whether the wording
 * satisfies counsel is a README "Facts to confirm" item; the code keeps the
 * contact form, the consultation form, /about, and the privacy policy saying
 * one thing until it is decided.
 *
 * The sister practices are named by discipline only; their domains reach the
 * page through the brand constants (About.tsx, the shell) and their brand
 * names through CrossSell.tsx, the one component allowed to spell them.
 */

/** The note under the contact and consultation forms, and in the privacy policy's "Information Sharing" section. */
export const INTAKE_DISCLOSURE =
  "Inquiries are received at an intake inbox shared with our affiliated vocational and life care planning practices and are used to run the conflict check and scope the engagement; they are not shared outside that family of practices.";

/** The /about section on the sister practices and the combined engagement. Slots are marked by the array breaks: intro[0] <voc host link> intro[1] <lcp host link> intro[2]; intake[0] <contact form link> intake[1] <email link> intake[2]. */
export const FAMILY_SECTION = {
  heading: "Sister Practices and How a Combined Engagement Works",
  intro: [
    `${ORG_NAME} is the economics and valuation practice of the Kincaid Wolstein family of expert practices. Two sister practices handle the disciplines that most often sit beside an economic analysis. Vocational assessment, meaning employability, work capacity, and post-injury earning capacity opinions, is the work of the vocational practice at `,
    `. Life care plan authorship, the plan of future care that the economist later reduces to present value, is the work of the life care planning practice at `,
    `.`,
  ],
  bullets: [
    {
      lead: "Retain the economics practice",
      text: " for lost earnings, wrongful death, household services, employment, and commercial damages, for business valuation, fraud and asset tracing, and marital financial analysis, and to reduce an authored life care plan to present value.",
    },
    {
      lead: "Retain the vocational practice",
      text: " when the case needs an opinion on what an injured or displaced person can still do and earn; the economist then builds the lost earnings analysis on that opinion.",
    },
    {
      lead: "Retain the life care planning practice",
      text: " when a plan of future medical care has to be written rather than valued; the economist prices the finished plan.",
    },
  ],
  intake: [
    `Each practice is retained under its own engagement agreement and bills its own work. A combined engagement still starts with one intake: an inquiry to ${ORG_SHORT}, through the `,
    ` or the `,
    ` inbox, reaches an intake inbox shared with the sister practices, so counsel describes the matter once and each practice that takes part is engaged under its own agreement. The practices then coordinate on the shared assumptions so that the vocational opinion, the life care plan, and the economic analysis reconcile with one another and can be examined together at deposition and trial.`,
  ],
  /** The anchor text of the two in-sentence links in `intake`. */
  contactFormLabel: "contact form",
} as const;

/** Every text run of the section, for parity tests (a bullet's lead and text
 * are separate runs: the page wraps the lead in its own element). */
export const FAMILY_SECTION_TEXT: readonly string[] = [
  ...FAMILY_SECTION.intro,
  ...FAMILY_SECTION.bullets.flatMap((b) => [b.lead, b.text]),
  ...FAMILY_SECTION.intake,
].filter((s) => s.trim().length > 1);
