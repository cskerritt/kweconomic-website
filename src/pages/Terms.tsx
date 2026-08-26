import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";

const sections = [
  {
    heading: "Acceptance of Terms",
    content: `By accessing or using the kwvrs.com website ("Site"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Site. These Terms apply to all visitors, users, and others who access or use the Site.

Kincaid Wolstein Vocational and Rehabilitation Services ("KWVRS") reserves the right to update or modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Site after changes are posted constitutes acceptance of the revised Terms.`,
  },
  {
    heading: "Use of the Site",
    content: `This Site is intended to provide general information about the services offered by Kincaid Wolstein Vocational and Rehabilitation Services. The Site is intended for use by legal professionals, their clients, insurers, and others with a legitimate interest in vocational rehabilitation, life care planning, forensic economics, and related expert witness services.

You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to use the Site: (a) in any way that violates applicable federal, state, or local laws or regulations; (b) to transmit any unsolicited commercial communications; (c) to impersonate any person or entity or misrepresent your affiliation with any person or entity; (d) to engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Site; or (e) to attempt to gain unauthorized access to any portion of the Site or any connected system.`,
  },
  {
    heading: "No Attorney-Client or Expert Relationship",
    content: `Nothing on this Site creates an attorney-client relationship, an expert-client relationship, or any other professional relationship between you and KWVRS. The information on this Site is provided for general educational and informational purposes only. It does not constitute professional advice and should not be relied upon as the basis for any legal, medical, financial, or other professional decision.

A professional relationship with KWVRS is established only through a signed engagement letter or retainer agreement. Until such time as KWVRS has confirmed in writing that it has accepted an engagement, no professional obligations arise from your use of this Site or from the submission of information through any form on this Site.`,
  },
  {
    heading: "Intellectual Property",
    content: `All content on this Site - including text, graphics, logos, data compilations, and the arrangement of content - is the property of Kincaid Wolstein Vocational and Rehabilitation Services or its content suppliers and is protected by applicable copyright and intellectual property laws. KWVRS grants you a limited, non-exclusive, non-transferable license to access and view the Site for your personal, non-commercial use.

You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any content from this Site without the prior written consent of KWVRS, except that you may print or download a reasonable number of pages of the Site for your own informational use, provided that you do not modify the content and that you retain any copyright or other proprietary notices.`,
  },
  {
    heading: "Disclaimer of Warranties",
    content: `THE SITE AND ALL CONTENT PROVIDED ON IT ARE OFFERED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. KWVRS DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

KWVRS does not warrant that the Site will be uninterrupted or error-free, that defects will be corrected, or that the Site or the servers that host it are free of viruses or other harmful components. KWVRS makes no representations regarding the accuracy, completeness, or timeliness of any information on the Site. The educational content provided is general in nature and may not reflect current law, regulations, or professional standards in every jurisdiction.`,
  },
  {
    heading: "Limitation of Liability",
    content: `TO THE FULLEST EXTENT PERMITTED BY LAW, KWVRS AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SITE, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS INTERRUPTION, EVEN IF KWVRS HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

KWVRS's total liability for any claims arising under these Terms or in connection with the Site shall not exceed the amount you paid, if any, for access to the Site. Some jurisdictions do not allow the exclusion or limitation of liability for consequential or incidental damages; in such jurisdictions, KWVRS's liability is limited to the greatest extent permitted by law.`,
  },
  {
    heading: "Third-Party Links",
    content: `The Site may contain links to third-party websites, including the website of Kincaid Wolstein Economics (kweconomics.com) and other external resources. These links are provided for convenience only and do not constitute an endorsement by KWVRS of any third-party site or its content. KWVRS has no control over and assumes no responsibility for the content, privacy practices, or availability of any linked third-party site. Your use of linked sites is subject to the terms and policies of those sites.`,
  },
  {
    heading: "Indemnification",
    content: `You agree to defend, indemnify, and hold harmless KWVRS and its officers, directors, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Site, including any use of the Site's content other than as expressly authorized in these Terms.`,
  },
  {
    heading: "Governing Law and Jurisdiction",
    content: `These Terms and any dispute arising from them or from your use of the Site shall be governed by and construed in accordance with the laws of the State of New Jersey, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms shall be brought exclusively in the state or federal courts located in Bergen County, New Jersey, and you consent to personal jurisdiction and venue in those courts.`,
  },
  {
    heading: "Contact",
    content: `Questions about these Terms may be directed to:

Kincaid Wolstein Vocational and Rehabilitation Services
Hackensack, New Jersey
Phone: (201) 343-0700
Email: info@kwvrs.com`,
  },
];

export default function Terms() {
  usePageMeta({
    title: "Terms of Service | KWVRS",
    description:
      "Terms of Service for kwvrs.com - governing your use of the Kincaid Wolstein Vocational and Rehabilitation Services website.",
    canonical: "https://kwvrs.com/terms",
  });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-sm text-neutral-500 font-mono">Effective Date: January 1, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-neutral-700 leading-relaxed mb-10 text-base md:text-lg">
            Please read these Terms of Service carefully before using kwvrs.com. By accessing or
            using this Site, you agree to be bound by these Terms.
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
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-wrap gap-4 text-sm text-neutral-500">
            <Link to="/privacy" className="hover:text-teal transition-colors">
              Privacy Policy
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
