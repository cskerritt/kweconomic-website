import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";

const sections = [
  {
    heading: "Information We Collect",
    content: `When you visit the KWVRS website, we may collect certain information automatically through standard web server logs and analytics tools. This information may include your IP address, browser type, operating system, referring URL, pages visited, and the date and time of your visit. This data is collected in aggregate and is used solely to understand how visitors interact with the site.

When you voluntarily submit information through our contact form or consultation request form, we collect the information you provide - which may include your name, email address, phone number, firm or organization name, and details about the matter you wish to discuss. We use this information to respond to your inquiry and, if you become a client, to manage the engagement.

We do not collect payment information through this website. We do not purchase or use third-party data to supplement the information you provide directly.`,
  },
  {
    heading: "How We Use Your Information",
    content: `Information collected through contact and inquiry forms is used to respond to your request and evaluate whether KWVRS can assist with your matter. We do not use contact form submissions for marketing purposes without your separate consent. We do not sell, rent, or trade your personal information to third parties.

Aggregate, non-identifying website analytics data is used internally to improve site performance and content. This data does not identify individual visitors and is not shared outside of our organization.

If you engage KWVRS as an expert or consulting firm, information relevant to the engagement will be used in connection with that professional relationship in accordance with applicable professional obligations.`,
  },
  {
    heading: "Information Sharing",
    content: `Kincaid Wolstein Vocational and Rehabilitation Services does not sell, rent, or disclose your personal information to third parties for marketing or commercial purposes. We may share information with service providers who assist in operating our website or communications (such as email hosting or analytics providers), subject to appropriate confidentiality agreements.

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

If you have reason to believe that your interaction with us has been compromised, please contact us at info@kwvrs.com so we can investigate.`,
  },
  {
    heading: "Third-Party Links",
    content: `This website may contain links to third-party websites, including the website of our affiliated firm Kincaid Wolstein Economics (kweconomics.com). We are not responsible for the privacy practices or content of those sites. This Privacy Policy applies only to kwvrs.com. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    heading: "Children's Privacy",
    content: `This website is intended for use by legal professionals and adults with litigation-related inquiries. We do not knowingly collect personal information from children under the age of 13. If we learn that we have inadvertently collected personal information from a child under 13, we will delete that information promptly. If you believe we have collected information from a child, please contact us at info@kwvrs.com.`,
  },
  {
    heading: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. When we make material changes, we will update the effective date shown at the top of this page. We encourage you to review this page periodically. Your continued use of the website after changes are posted constitutes acceptance of the revised policy.`,
  },
  {
    heading: "Contact Us",
    content: `If you have questions or concerns about this Privacy Policy or our information practices, please contact us at:

Kincaid Wolstein Vocational and Rehabilitation Services
Hackensack, New Jersey
Phone: (201) 343-0700
Email: info@kwvrs.com`,
  },
];

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy | KWVRS",
    description:
      "Privacy Policy for kwvrs.com - how Kincaid Wolstein Vocational and Rehabilitation Services collects, uses, and protects information on this website.",
    canonical: "https://kwvrs.com/privacy",
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
            <p className="text-sm text-neutral-500 font-mono">Effective Date: January 1, 2025</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-neutral-700 leading-relaxed mb-10 text-base md:text-lg">
            Kincaid Wolstein Vocational and Rehabilitation Services ("KWVRS," "we," "us," or "our")
            operates the website located at kwvrs.com. This Privacy Policy explains how we collect,
            use, and protect information in connection with your use of this website.
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
