import { ORG_NAME, ORG_SHORT, ORG_LEGAL, ORG_EMAIL, ORG_PHONE_DISPLAY, SITE_URL } from "@/lib/brand";
import { isAnalyticsConfigured } from "@/lib/analytics";
import { isTurnstileConfigured } from "@/components/Turnstile";
import { INTAKE_ROUTING } from "./intake";

/**
 * Copy of the two legal pages, shared with scripts/prerender.mjs so the static
 * shells for /privacy and /terms carry the same sections a reader sees after
 * hydration (site audit 2026-09-05, task T01: both shells delivered an H1 and
 * one paragraph before JavaScript).
 *
 * The section arrays below are the ones src/pages/Privacy.tsx and
 * src/pages/Terms.tsx render: same headings, same paragraphs, paragraphs
 * within a section separated by a blank line exactly as the pages split them.
 * Privacy.tsx imports its sections from here; Terms.tsx still holds a local
 * copy of its text, and scripts/prerender-shells.test.mjs pins the copies
 * together by rendering each page and checking every heading and paragraph
 * against this module.
 *
 * Contact details resolve from src/lib/brand.ts, as they do on the pages.
 */

export interface LegalSection {
  heading: string;
  /** Plain text; paragraphs separated by a blank line. No markup, no em dashes. */
  content: string;
}

export interface EffectiveDate {
  /** ISO date for the <time datetime> attribute. */
  iso: string;
  /** The date as printed. */
  label: string;
}

const DOMAIN = SITE_URL.replace(/^https?:\/\//, "");
const PHONE_DISPLAY = ORG_PHONE_DISPLAY;

// The effective dates are Chris's call (README "Facts to confirm"); the pages
// print them as machine-readable <time> so a crawler can read them either way.
export const PRIVACY_EFFECTIVE_DATE: EffectiveDate = { iso: "2025-01-01", label: "January 1, 2025" };
/** When the privacy policy text last changed (printed under the effective date). */
export const PRIVACY_LAST_REVISED: EffectiveDate = { iso: "2026-09-18", label: "September 18, 2026" };
export const TERMS_EFFECTIVE_DATE: EffectiveDate = { iso: "2025-01-01", label: "January 1, 2025" };

/** The paragraph /privacy opens with, before the sections. */
export const privacyIntro = `${ORG_LEGAL}, doing business as ${ORG_NAME} ("${ORG_SHORT}," "we," "us," or "our"), operates the website located at ${DOMAIN}. This Privacy Policy explains how we collect, use, and protect information in connection with your use of this website.`;

// ---------------------------------------------------------------------------
// Privacy policy (rewritten 2026-09-18, DRAFT FOR COUNSEL). Every statement
// below describes what the code in this repository does. The two statements
// that vary with the build - Google Analytics and Cloudflare Turnstile - are
// rendered from the real build flags (isAnalyticsConfigured in
// src/lib/analytics.ts, isTurnstileConfigured in src/components/Turnstile.tsx),
// so the page cannot drift from behaviour: a build with no GA id says the site
// uses no analytics cookies, and setting the id changes the text with it. The
// prerender loads this module under the same build env, so the static shell
// agrees with the hydrated page.
// ---------------------------------------------------------------------------

/** The build switches the policy text depends on. */
export interface PrivacyFlags {
  /** Google Analytics 4 is compiled in (a valid VITE_GA_MEASUREMENT_ID). */
  analytics: boolean;
  /** Cloudflare Turnstile is compiled in (VITE_TURNSTILE_SITE_KEY set). */
  turnstile: boolean;
}

/** The section that carries the on-page analytics opt-out control (src/components/AnalyticsOptOut.tsx). */
export const PRIVACY_CHOICES_HEADING = "Your Choices: Global Privacy Control, Do Not Track, and Opt-Out";
/** The section that states where an inquiry goes (src/data/intake.ts) and who else handles it. */
export const PRIVACY_SHARING_HEADING = "Service Providers and Information Sharing";

/** The policy sections for a given build. Pure, so both branches of each flag are testable. */
export function buildPrivacySections(flags: PrivacyFlags): LegalSection[] {
  const cookiesAnalytics = flags.analytics
    ? `This site uses Google Analytics 4 to measure which pages are visited. Google Analytics sets first-party cookies on your browser (named _ga and _ga_ followed by our property identifier, lasting up to two years) that hold a random browser identifier. Google processes this information as our service provider. Advertising features, Google signals, and ad personalization are switched off. Analytics is not loaded for browsers that send a Global Privacy Control or Do Not Track signal, or after you use the opt-out control below.`
    : `This site does not currently use analytics or advertising cookies.`;
  const cookiesTurnstile = flags.turnstile
    ? `Cloudflare Turnstile loads on pages with forms to block automated spam. Cloudflare receives your IP address and browser signals to tell people from automated traffic, and it may set its own strictly necessary cookies or browser storage to do so.`
    : null;
  const choices = flags.analytics
    ? `We do not load analytics for browsers that send a Global Privacy Control (GPC) or Do Not Track (DNT) signal. No action is needed beyond turning the signal on in your browser.

You can also turn analytics off for this browser with the control below. The choice is stored in your browser, so it applies to this browser only and is forgotten if you clear the site's storage.

You can configure your browser to refuse or delete cookies. This site works the same without them.`
    : `We do not track visitors across sites, so Global Privacy Control (GPC) and Do Not Track (DNT) signals do not change how the site behaves; if analytics is later enabled it is not loaded for browsers sending them.

You can configure your browser to refuse or delete cookies. This site works the same without them.`;
  // Providers are named only when they are live. The optional Supabase copy of
  // each submission (lib/raw-submissions.server.mjs) is OFF in production
  // (/healthz durableCapture:false): a Supabase line must be added to the
  // provider list below BEFORE that store is enabled.
  const providerExtras = [
    flags.turnstile ? "spam protection (Cloudflare)" : null,
    flags.analytics ? "website analytics (Google)" : null,
  ].filter((x): x is string => x !== null);

  return [
    {
      heading: "Information You Give Us",
      content: `This site has three forms. The contact form collects your name, email address, phone number, firm, case type, and your message. The consultation request form collects your name, email address, phone number, firm, case type, jurisdiction, preferred language, preferred contact method, and a description of the matter. The white paper form collects your name and email address and records which paper you unlocked.

The message and description fields are free text, and what is written there can include information about other people - typically the person whose losses are being evaluated - including injury, medical, employment, and financial details supplied by the retaining attorney or firm. We use that information only for conflict checks, scoping, and performing the engagement.

We do not collect payment information through this website, and we do not purchase third-party data to supplement what you provide.`,
    },
    {
      heading: "Information Collected Automatically",
      content: `Our web server and hosting provider keep standard request logs, which include IP address, the page requested, and the date and time of the request.

When you submit a form, we store the IP address and browser user-agent with that submission for spam and abuse prevention. The server also keeps a short-lived, in-memory count of form submissions per IP address to limit automated abuse; it is not written to disk.`,
    },
    {
      heading: "Cookies and Similar Technologies",
      content: [
        `The site itself sets no cookies.`,
        cookiesAnalytics,
        `The site uses your browser's local storage for two things: a flag remembering that you unlocked a white paper, which holds no identifier, and your analytics opt-out preference if you set one.`,
        cookiesTurnstile,
        `This site has no advertising pixels, no session recording, and no cross-site tracking.`,
      ]
        .filter((x): x is string => x !== null)
        .join("\n\n"),
    },
    {
      heading: PRIVACY_CHOICES_HEADING,
      content: choices,
    },
    {
      heading: "How We Use Information",
      content: `We use the information described above to respond to inquiries, run conflict checks, scope and perform engagements, bill for our work, keep the site secure and free of spam, and measure how the site is used.

If you request a white paper or otherwise ask to hear from us, we may contact you about our services. You can tell us to stop at any time by replying to the message or emailing ${ORG_EMAIL}. We do not use case details for marketing.

We do not sell personal information, and we do not share it for cross-context behavioral advertising.

If you engage ${ORG_SHORT} as an expert or consulting firm, information relevant to the engagement will be used in connection with that professional relationship in accordance with applicable professional obligations.`,
    },
    {
      heading: PRIVACY_SHARING_HEADING,
      content: `We disclose information to vendors that operate this site and our practice systems on our behalf: website hosting, including storage of form submissions (Railway), email delivery (Resend), and our business email provider${providerExtras.length ? `, ${providerExtras.join(", ")}` : ""}. These providers are permitted to use the information only to provide services to us.

${INTAKE_ROUTING} Inquiry details may be shared with one of those affiliated practices when a matter calls for its discipline, under the same confidentiality, and each practice that takes part in an engagement is retained under its own engagement agreement.

We may disclose information when required to do so by law, in response to a lawful court order or subpoena, or in connection with a legal proceeding to which we are a party. We may also disclose information where we believe in good faith that disclosure is necessary to protect the safety of any person or to address fraud, security, or technical issues.

Case-related information submitted through our forms or provided in connection with a potential engagement is treated as confidential and will not be disclosed to adverse parties or unrelated third parties.`,
    },
    {
      heading: "Retention",
      content: `We keep inquiry and engagement records for as long as needed for the purposes described above, including conflict checking, professional and legal record-keeping obligations, and resolving disputes. You can ask us to delete an inquiry that did not become an engagement.`,
    },
    {
      heading: "Privacy Rights and Requests",
      content: `Anyone may email ${ORG_EMAIL} to ask what information we hold about them, to correct it, or to delete it. We respond within 45 days, and we will not discriminate against you for making a request. Some records must be kept, for example where they relate to active litigation or where the law requires us to retain them.

Where information about a person being evaluated was supplied by a retaining attorney in a legal matter, we may need to direct the request through that attorney.`,
    },
    {
      heading: "Health Information",
      content: `${ORG_SHORT} is not a health-care provider. Injury and medical information we receive arrives as part of a legal matter, and it is handled under the confidentiality terms of the engagement.`,
    },
    {
      heading: "Visitors Outside the United States",
      content: `This site is operated in, and directed to, the United States. Information you submit is processed in the United States.`,
    },
    {
      heading: "Data Security",
      content: `We implement reasonable technical and organizational measures to protect the information you provide from unauthorized access, disclosure, alteration, or destruction. Our website uses HTTPS encryption for all data transmission.

No method of transmission over the internet is completely secure. While we take reasonable precautions, we cannot guarantee that information transmitted to or stored on our systems is immune from unauthorized access. You assume some risk when submitting information via any online form.

If you have reason to believe that your interaction with us has been compromised, please contact us at ${ORG_EMAIL} so we can investigate.`,
    },
    {
      heading: "Third-Party Links",
      content: `This website may contain links to third-party websites, including the websites of our affiliated vocational and life care planning practices. We are not responsible for the privacy practices or content of those sites. This Privacy Policy applies only to ${DOMAIN}. We encourage you to review the privacy policies of any third-party sites you visit.`,
    },
    {
      heading: "Children's Privacy",
      content: `This website is intended for use by legal professionals and adults with litigation-related inquiries. We do not knowingly collect personal information from children under the age of 13. If we learn that we have inadvertently collected personal information from a child under 13, we will delete that information promptly. If you believe we have collected information from a child, please contact us at ${ORG_EMAIL}.`,
    },
    {
      heading: "Changes to This Policy",
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make material changes, we will update the last revised date shown at the top of this page. We encourage you to review this page periodically. Your continued use of the website after changes are posted constitutes acceptance of the revised policy.`,
    },
    {
      heading: "Contact Us",
      content: `If you have questions or concerns about this Privacy Policy or our information practices, please contact us at:

${ORG_NAME}
Hackensack, New Jersey
Phone: ${PHONE_DISPLAY}
Email: ${ORG_EMAIL}`,
    },
  ];
}

/** The flags of this build (read once; Vite inlines both values at build time). */
export const PRIVACY_BUILD_FLAGS: PrivacyFlags = {
  analytics: isAnalyticsConfigured(),
  turnstile: isTurnstileConfigured(),
};

/** The policy as this build renders it: what Privacy.tsx shows by default and what the prerendered shell prints. */
export const privacySections: LegalSection[] = buildPrivacySections(PRIVACY_BUILD_FLAGS);

export const termsIntro = `Please read these Terms of Service carefully before using ${DOMAIN}. By accessing or using this Site, you agree to be bound by these Terms.`;

export const termsSections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    content: `By accessing or using the ${DOMAIN} website ("Site"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Site. These Terms apply to all visitors, users, and others who access or use the Site.

${ORG_LEGAL}, doing business as ${ORG_NAME} ("${ORG_SHORT}"), reserves the right to update or modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Site after changes are posted constitutes acceptance of the revised Terms.`,
  },
  {
    heading: "Use of the Site",
    content: `This Site is intended to provide general information about the services offered by ${ORG_NAME}. The Site is intended for use by legal professionals, their clients, insurers, and others with a legitimate interest in forensic economics, economic damages analysis, business valuation, forensic accounting, and related expert witness services.

You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to use the Site: (a) in any way that violates applicable federal, state, or local laws or regulations; (b) to transmit any unsolicited commercial communications; (c) to impersonate any person or entity or misrepresent your affiliation with any person or entity; (d) to engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site; or (e) to attempt to gain unauthorized access to any portion of the Site or any connected system.`,
  },
  {
    heading: "No Attorney-Client or Expert Relationship",
    content: `Nothing on this Site creates an attorney-client relationship, an expert-client relationship, or any other professional relationship between you and ${ORG_SHORT}. The information on this Site is provided for general educational and informational purposes only. It does not constitute professional advice and should not be relied upon as the basis for any legal, medical, financial, or other professional decision.

A professional relationship with ${ORG_SHORT} is established only through a signed engagement letter or retainer agreement. Until such time as ${ORG_SHORT} has confirmed in writing that it has accepted an engagement, no professional obligations arise from your use of this Site or from the submission of information through any form on this Site.`,
  },
  {
    heading: "Intellectual Property",
    content: `All content on this Site - including text, graphics, logos, data compilations, and the arrangement of content - is the property of ${ORG_NAME} or its content suppliers and is protected by applicable copyright and intellectual property laws. ${ORG_SHORT} grants you a limited, non-exclusive, non-transferable license to access and view the Site for your personal, non-commercial use.

You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any content from this Site without the prior written consent of ${ORG_SHORT}, except that you may print or download a reasonable number of pages of the Site for your own informational use, provided that you do not modify the content and that you retain any copyright or other proprietary notices.`,
  },
  {
    heading: "Disclaimer of Warranties",
    content: `THE SITE AND ALL CONTENT PROVIDED ON IT ARE OFFERED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. ${ORG_SHORT} DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

${ORG_SHORT} does not warrant that the Site will be uninterrupted or error-free, that defects will be corrected, or that the Site or the servers that host it are free of viruses or other harmful components. ${ORG_SHORT} makes no representations regarding the accuracy, completeness, or timeliness of any information on the Site. The educational content provided is general in nature and may not reflect current law, regulations, or professional standards in every jurisdiction.`,
  },
  {
    heading: "Limitation of Liability",
    content: `TO THE FULLEST EXTENT PERMITTED BY LAW, ${ORG_SHORT} AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SITE, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS INTERRUPTION, EVEN IF ${ORG_SHORT} HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

${ORG_SHORT}'s total liability for any claims arising under these Terms or in connection with the Site shall not exceed the amount you paid, if any, for access to the Site. Some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages; in such jurisdictions, ${ORG_SHORT}'s liability is limited to the greatest extent permitted by law.`,
  },
  {
    heading: "Third-Party Links",
    content: `The Site may contain links to third-party websites, including the websites of our affiliated vocational and life care planning practices and other external resources. These links are provided for convenience only and do not constitute an endorsement by ${ORG_SHORT} of any third-party site or its content. ${ORG_SHORT} has no control over and assumes no responsibility for the content, privacy practices, or availability of any linked third-party site. Your use of linked sites is subject to the terms and policies of those sites.`,
  },
  {
    heading: "Indemnification",
    content: `You agree to defend, indemnify, and hold harmless ${ORG_SHORT} and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Site, including any use of the Site's content other than as expressly authorized in these Terms.`,
  },
  {
    heading: "Governing Law and Jurisdiction",
    content: `These Terms and any dispute arising from them or from your use of the Site shall be governed by and construed in accordance with the laws of the State of New Jersey, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the state or federal courts located in Bergen County, New Jersey, and you consent to personal jurisdiction and venue in those courts.`,
  },
  {
    heading: "Contact",
    content: `Questions about these Terms may be directed to:

${ORG_NAME}
Hackensack, New Jersey
Phone: ${PHONE_DISPLAY}
Email: ${ORG_EMAIL}`,
  },
];
