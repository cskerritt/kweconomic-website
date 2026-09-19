import { useState } from "react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { isEmail, isPhone } from "@/lib/validation";
import { caseTypes } from "@/data/caseTypes";
import IntakeDisclosure from "@/components/IntakeDisclosure";
import PrivacyNotice from "@/components/PrivacyNotice";
import {
  ORG_NAME,
  ORG_SHORT,
  ORG_EMAIL,
  OFFICES,
  ORG_PHONE,
  ORG_PHONE_VA,
  ORG_PHONE_DISPLAY,
  ORG_PHONE_VA_DISPLAY,
  SITE_URL,
  telHref,
} from "@/lib/brand";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import { Picture } from "@/components/Picture";
import {
  graphSchema,
  organizationSchema,
  officeSchemas,
  breadcrumbSchema,
  ORG_URL,
  ORG_ID,
  WEBSITE_ID,
} from "@/lib/schema";

const PAGE_URL = `${ORG_URL}/contact`;

const INPUT =
  "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = new FormData(form);
    // server.js /api/contact requires name, email, phone, message.
    const data = {
      name: String(raw.get("name") ?? "").trim(),
      email: raw.get("email"),
      phone: raw.get("phone"),
      firm: raw.get("firm"),
      caseType: raw.get("case-type"),
      message: raw.get("message"),
      turnstileToken,
      company_website: companyWebsite,
    };
    if (!isEmail(String(data.email ?? "")) || !isPhone(String(data.phone ?? ""))) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  usePageMeta({
    title: `Contact a Forensic Economist | ${ORG_NAME}`,
    description:
      `Contact ${ORG_NAME} about a lost earnings, wrongful death, household services, or business damages analysis. Offices in NJ and VA; reply in 1 business day.`,
    canonical: `${SITE_URL}/contact`,
  });

  return (
    <>
      {/* Contact is the page that prints the office NAP block, so the office
          LocalBusiness nodes belong here; the ContactPage node ties the page
          to the Organization and WebSite ids the rest of the graph uses. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          ...officeSchemas(),
          {
            "@type": "ContactPage",
            "@id": `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: "Contact a Forensic Economist",
            isPartOf: { "@id": WEBSITE_ID },
            about: { "@id": ORG_ID },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Contact", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "Contact", url: "/contact" }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-teal-light text-sm font-semibold uppercase tracking-wider mb-4">
              Get in Touch
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Contact {ORG_NAME}
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Ready to discuss your case? Tell us about the loss claim, the records you have, and
              your deadlines. A member of the team responds within one business day.
            </p>
          </div>
        </div>
      </section>

      {/* Visual break */}
      <section className="py-10 md:py-14 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Picture
            src="/images/legal-contract.jpg"
            alt="Attorney reviewing case documents"
            width={1200}
            height={400}
            className="rounded-2xl shadow-xl w-full object-cover max-h-72"
            loading="lazy"
          />
        </div>
      </section>

      {/* Consultation shortcut */}
      <section className="py-12 md:py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">
            Ready to retain a forensic economist?
          </h2>
          <p className="text-neutral-700 mb-6 max-w-3xl">
            Book a no-cost consultation to discuss the loss claim, the records you have, and your
            deadlines. We will confirm scope, timeline, and fee before any work begins.
          </p>
          <Link
            to="/schedule-consultation"
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white font-medium px-5 py-3 rounded-lg transition-colors"
          >
            Schedule a consultation
          </Link>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-16 items-start">

            {/* Left: Office Info (drops below the form on mobile so the form is first) */}
            <div className="order-2 lg:order-1 mt-10 lg:mt-0">
              <h2 className="font-serif text-2xl font-bold text-navy mb-8">Our Offices</h2>

              {/* NJ Office */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
                <h3 className="font-serif text-lg font-bold text-navy mb-4">
                  New Jersey - Headquarters
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-neutral-700">
                    <MapPin className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <span>
                      {OFFICES[0].streetAddress}
                      <br />
                      Hackensack, NJ {OFFICES[0].postalCode}
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700">
                    <Phone className="w-5 h-5 text-teal shrink-0" />
                    <a href={telHref(ORG_PHONE)} className="hover:text-teal transition-colors font-medium">
                      {ORG_PHONE_DISPLAY}
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700">
                    <Mail className="w-5 h-5 text-teal shrink-0" />
                    <a href={`mailto:${ORG_EMAIL}`} className="hover:text-teal transition-colors">
                      {ORG_EMAIL}
                    </a>
                  </li>
                </ul>
              </div>

              {/* VA Office */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
                <h3 className="font-serif text-lg font-bold text-navy mb-4">
                  Virginia - Richmond Office
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-neutral-700">
                    <MapPin className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                    <span>Richmond, Virginia</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700">
                    <Phone className="w-5 h-5 text-teal shrink-0" />
                    <a href={telHref(ORG_PHONE_VA)} className="hover:text-teal transition-colors font-medium">
                      {ORG_PHONE_VA_DISPLAY}
                    </a>
                  </li>
                </ul>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-teal" />
                  <h3 className="font-serif text-lg font-bold text-navy">Office Hours</h3>
                </div>
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 5:00 PM ET</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday - Sunday</span>
                    <span className="font-medium text-neutral-500">Closed</span>
                  </li>
                </ul>
                <p className="text-xs text-neutral-500 mt-4">
                  After-hours inquiries are accepted via email and will be responded to the next business day.
                </p>
              </div>
            </div>

            {/* Right: Contact Form (first on mobile) */}
            <div className="order-1 lg:order-2">
              <h2 className="font-serif text-2xl font-bold text-navy mb-3">Send Us a Message</h2>
              <a
                href={telHref(ORG_PHONE)}
                className="flex items-center gap-3 mb-5 rounded-lg border border-teal/40 bg-teal/5 px-4 py-3 text-sm text-navy hover:bg-teal/10 transition-colors"
              >
                <Phone className="w-5 h-5 text-teal shrink-0" />
                <span>
                  <strong className="text-teal-dark">Tap to call</strong> {ORG_PHONE_DISPLAY}
                </span>
              </a>

              {/* What happens next - 3-step process explainer */}
              <div className="bg-navy/5 border border-navy/15 rounded-lg p-5 mb-6">
                <p className="text-xs uppercase tracking-[0.14em] text-navy font-semibold mb-3">
                  What happens next
                </p>
                <ol className="space-y-2 text-sm text-neutral-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">1</span>
                    <span><strong className="text-navy">Conflict check</strong> within 1 business day.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">2</span>
                    <span><strong className="text-navy">Scope and fee</strong> confirmed in writing for the analysis you need.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">3</span>
                    <span><strong className="text-navy">Engagement letter</strong> and records-request checklist.</span>
                  </li>
                </ol>
                <p className="text-xs text-neutral-500 mt-3 italic">
                  Communications with {ORG_SHORT} prior to retention are handled confidentially; work-product
                  protection depends on the terms of the retention and the rules of the forum.
                </p>
              </div>

              <form
                id="contact-form"
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 space-y-5 scroll-mt-24"
              >
                {status === "sent" && (
                  <div className="rounded-lg bg-teal/10 border border-teal/30 text-teal-dark px-4 py-3 text-sm font-medium">
                    Thank you - your message has been received. We will follow up within one business day.
                  </div>
                )}
                {status === "error" && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
                    Something went wrong. Please try again or contact us directly at {ORG_EMAIL}.
                  </div>
                )}
                {status === "invalid" && <p className="text-sm text-red-600">Please enter a valid email and phone number.</p>}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Name <span className="text-teal">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    className={INPUT}
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email Address <span className="text-teal">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={INPUT}
                      placeholder="jane@lawfirm.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Phone Number <span className="text-teal">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      className={INPUT}
                      placeholder="(201) 555-0100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="firm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Firm / Organization
                  </label>
                  <input
                    id="firm"
                    name="firm"
                    type="text"
                    autoComplete="organization"
                    className={INPUT}
                    placeholder="Smith &amp; Associates, LLP"
                  />
                </div>

                <div>
                  <label htmlFor="case-type" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Case Type <span className="text-teal">*</span>
                  </label>
                  <select
                    id="case-type"
                    name="case-type"
                    required
                    className={`${INPUT} bg-white`}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a case type</option>
                    {caseTypes.map((ct) => (
                      <option key={ct.slug} value={ct.name}>{ct.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Message <span className="text-teal">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className={`${INPUT} resize-none`}
                    placeholder="Briefly describe the loss claim, the records you have, and any deadlines..."
                  />
                </div>

                {/* Where the inquiry goes (src/data/intake.ts, shared with
                    /schedule-consultation, /about, the privacy policy, and the
                    static shell), so the form agrees with the actual routing
                    to the shared intake inbox (audit F06, F08 /contact). */}
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 border border-neutral-200 rounded-md p-3">
                  <strong>Response within 1 business day.</strong> <IntakeDisclosure />
                </p>

                <Turnstile onToken={setTurnstileToken} />
                <HoneypotField onChange={setCompanyWebsite} />

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-teal hover:bg-teal-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending..." : "Send Message - Reply in 1 Business Day"}
                </button>
                <PrivacyNotice className="text-center" />
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
