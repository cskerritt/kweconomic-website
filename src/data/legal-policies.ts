import { ORG_NAME, ORG_SHORT, ORG_LEGAL, ORG_EMAIL, ORG_PHONE_DISPLAY, SITE_URL } from "@/lib/brand";
import { INTAKE_DISCLOSURE } from "./intake";

/**
 * Copy of the two legal pages, shared with scripts/prerender.mjs so the static
 * shells for /privacy and /terms carry the same sections a reader sees after
 * hydration (site audit 2026-09-05, task T01: both shells delivered an H1 and
 * one paragraph before JavaScript).
 *
 * The section arrays below are the ones src/pages/Privacy.tsx and
 * src/pages/Terms.tsx render: same headings, same paragraphs, paragraphs
 * within a section separated by a blank line exactly as the pages split them.
 * Until the pages import from here they hold a local copy of this text, and
 * scripts/prerender-shells.test.mjs pins the two copies together by rendering
 * each page and checking every heading and paragraph against this module.
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
export const TERMS_EFFECTIVE_DATE: EffectiveDate = { iso: "2025-01-01", label: "January 1, 2025" };

/** The paragraph /privacy opens with, before the sections. */
export const privacyIntro = `${ORG_LEGAL}, doing business as ${ORG_NAME} ("${ORG_SHORT}," "we," "us," or "our"), operates the website located at ${DOMAIN}. This Privacy Policy explains how we collect, use, and protect information in connection with your use of this website.`;

export const privacySections: LegalSection[] = [
  {
    heading: "Information We Collect",
    content: `When you visit the ${ORG_NAME} website, we may collect certain information automatically through standard web server logs and analytics tools. This information may include your IP address, browser type, operating system, referring URL, pages visited, and the date and time of your visit. This data is collected in aggregate and is used solely to understand how visitors interact with the site.

When you voluntarily submit information through our contact form or consultation request form, we collect the information you provide - which may include your name, email address, phone number, firm or organization name, and details about the matter you wish to discuss. We use this information to respond to your inquiry and, if you become a client, to manage the engagement.

We do not collect payment information through this website. We do not purchase or use third-party data to supplement the information you provide directly.`,
  },
  {
    heading: "How We Use Your Information",
    content: `Information collected through contact and inquiry forms is used to respond to your request and evaluate whether ${ORG_SHORT} can assist with your matter. We do not use contact form submissions for marketing purposes without your separate consent. We do not sell, rent, or trade your personal information to third parties.

Aggregate, non-identifying website analytics data is used internally to improve site performance and content. This data does not identify individual visitors and is not shared outside of our organization.

If you engage ${ORG_SHORT} as an expert or consulting firm, information relevant to the engagement will be used in connection with that professional relationship in accordance with applicable professional obligations.`,
  },
  {
    heading: "Information Sharing",
    content: `${ORG_NAME} does not sell, rent, or disclose your personal information to third parties for marketing or commercial purposes. We may share information with service providers who assist in operating our website or communications (such as email hosting or analytics providers), subject to appropriate confidentiality agreements.

${INTAKE_DISCLOSURE} Inquiry details may be shared with one of those affiliated practices when a matter calls for its discipline, under the same confidentiality, and each practice that takes part in an engagement is retained under its own engagement agreement.

We may disclose information when required to do so by law, in response to a lawful court order or subpoena, or in connection with a legal proceeding to which we are a party. We may also disclose information where we believe in good faith that disclosure is necessary to protect the safety of any person or to address fraud, security, or technical issues.

Case-related information submitted through our forms or provided in connection with a potential engagement is treated as confidential and will not be disclosed to adverse parties or unrelated third parties.`,
  },
  {
    heading: "Cookies and Tracking Technologies",
    content: `This website may use cookies - small data files placed on your browser - to support site functionality and analytics. Session cookies are used to enable basic site navigation and expire when you close your browser. Persistent cookies may be used by analytics services to track aggregate usage patterns over time.

You may configure your browser to refuse cookies or to alert you when cookies are being sent. If you disable cookies, some features of the site may not function as intended. We do not use cookies to track individual users across third-party websites.

We may use a third-party web analytics service (such as Google Analytics) to collect aggregate information about site usage. These services operate under their own privacy policies, which we encourage you to review. We configure analytics services to anonymize IP addresses where technically feasible.`,
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
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make material changes, we will update the effective date shown at the top of this page. We encourage you to review this page periodically. Your continued use of the website after changes are posted constitutes acceptance of the revised policy.`,
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

/** The paragraph /terms opens with, before the sections. */
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
