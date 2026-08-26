import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { isEmail, isPhone } from "@/lib/validation";
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
} from "@/lib/schema";

// "How did you hear about us?" options (inlined from the retired kwvrs intake schema).
const HOW_HEARD = [
  { value: "google", label: "Google search" },
  { value: "other-search", label: "Other search engine (Bing, DuckDuckGo...)" },
  { value: "ai-assistant", label: "AI assistant (ChatGPT, Claude, Gemini...)" },
  { value: "attorney-referral", label: "Referral from another attorney" },
  { value: "colleague-referral", label: "Referral from a colleague or paralegal" },
  { value: "past-client", label: "Worked with us before" },
  { value: "expert-directory", label: "Expert witness directory (SEAK, JurisPro...)" },
  { value: "bar-cle", label: "Bar association / CLE program" },
  { value: "conference", label: "Conference or seminar" },
  { value: "prior-testimony", label: "Saw prior testimony or a court opinion" },
  { value: "publication", label: "Legal publication or article" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "social", label: "Other social media" },
  { value: "email-newsletter", label: "Email or newsletter" },
  { value: "other", label: "Other" },
] as const;

export default function Contact() {
  const [searchParams] = useSearchParams();
  const [rush, setRush] = useState(searchParams.get("priority") === "rush");
  const [howHeard, setHowHeard] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // When arriving from the home "Rush / Priority Matter" button
  // (/contact?priority=rush#contact-form), scroll straight to the form + rush
  // toggle. The app's ScrollToTop backs off because the URL carries a hash.
  useEffect(() => {
    if (searchParams.get("priority") !== "rush") return;
    const id = requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
    return () => cancelAnimationFrame(id);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = new FormData(form);
    const firstName = raw.get("first-name") as string;
    const lastName = raw.get("last-name") as string;
    const data = {
      name: `${firstName} ${lastName}`.trim(),
      email: raw.get("email"),
      phone: raw.get("phone"),
      caseType: raw.get("case-type"),
      language: raw.get("language") || "English",
      message: raw.get("message"),
      ...(howHeard ? { howHeard } : {}),
      ...(howHeard === "other" && raw.get("how-heard-other")
        ? { howHeardOther: raw.get("how-heard-other") }
        : {}),
      ...(rush ? { priority: "rush" as const } : {}),
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
    title: "Contact Us | KWVRS",
    description:
      "Contact KWVRS to discuss vocational expert services, life care planning, forensic economics, or expert witness testimony for your case. Offices in NJ and VA.",
    canonical: "https://kwvrs.com/contact",
  });

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          ...officeSchemas(),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Contact", url: `${ORG_URL}/contact` },
          ]),
        ])}
      />
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Get in Touch
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Contact KWVRS
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Ready to discuss your case? Our team responds quickly to inquiries from attorneys,
              insurers, and claimants seeking vocational and rehabilitation expert services.
            </p>
          </div>
        </div>
      </section>

      {/* Visual break */}
      <section className="py-10 md:py-14 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Picture
            src="/images/legal-contract.jpg"
            alt="Attorney reviewing legal contract and case documents"
            width={1200}
            height={400}
            className="rounded-2xl shadow-xl w-full object-cover max-h-72"
            loading="lazy"
          />
        </div>
      </section>

      {/* Retain / consultation shortcut (intake forms + PSAs stay on kwvrs.com) */}
      <section className="py-12 md:py-16 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">
            Ready to retain a life care planner?
          </h2>
          <p className="text-neutral-700 mb-6 max-w-3xl">
            Book a no-cost consultation to discuss the injury, the records you have, and your
            deadlines. We will confirm scope, timeline, and fee before any work begins.
          </p>
          <Link
            to="/schedule-consultation"
            className="inline-flex items-center gap-2 bg-amber-dark hover:bg-amber text-white font-medium px-5 py-3 rounded-lg transition-colors"
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
                    <span>Hackensack, New Jersey</span>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700">
                    <Phone className="w-5 h-5 text-teal shrink-0" />
                    <a href="tel:+12013430700" className="hover:text-teal transition-colors font-medium">
                      (201) 343-0700
                    </a>
                  </li>
                  <li className="flex items-center gap-3 text-neutral-700">
                    <Mail className="w-5 h-5 text-teal shrink-0" />
                    <a href="mailto:info@kwvrs.com" className="hover:text-teal transition-colors">
                      info@kwvrs.com
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
                    <a href="tel:+18042824199" className="hover:text-teal transition-colors font-medium">
                      (804) 282-4199
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
              <h2 className="font-serif text-2xl font-bold text-navy mb-3">Request a Consultation</h2>
              <a
                href="tel:+12013430700"
                className="flex items-center gap-3 mb-5 rounded-lg border border-amber-dark/40 bg-amber-dark/5 px-4 py-3 text-sm text-navy hover:bg-amber-dark/10 transition-colors"
              >
                <Phone className="w-5 h-5 text-amber-dark shrink-0" />
                <span>
                  <strong className="text-amber-dark">Tap to call</strong> (201) 343-0700
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
                    <span><strong className="text-navy">Fee quote</strong> sized to the engagement.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">3</span>
                    <span><strong className="text-navy">Engagement letter</strong> and records-request checklist.</span>
                  </li>
                </ol>
                <p className="text-xs text-neutral-500 mt-3 italic">
                  Communications with KWVRS prior to retention are treated as confidential consulting-expert work product.
                </p>
              </div>

              <form
                ref={formRef}
                id="contact-form"
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 space-y-5 scroll-mt-24"
              >
                {status === "sent" && (
                  <div className="rounded-lg bg-teal/10 border border-teal/30 text-teal px-4 py-3 text-sm font-medium">
                    {rush
                      ? "Received - your rush matter went directly to our senior team. Expect a prompt response. To reach us immediately, call (201) 343-0700 or email info@kwvrs.com."
                      : "Thank you - your request has been received. We will follow up within one business day."}
                  </div>
                )}
                {status === "error" && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
                    Something went wrong. Please try again or contact us directly at info@kwvrs.com.
                  </div>
                )}
                {status === "invalid" && <p className="text-sm text-red-600">Please enter a valid email and phone number.</p>}

                <div className="rounded-lg border border-amber/40 bg-amber-50 p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="priority-rush"
                      checked={rush}
                      onChange={(e) => setRush(e.target.checked)}
                      className="mt-1 accent-amber-dark"
                    />
                    <span className="text-sm text-neutral-800">
                      <span className="font-semibold text-navy">This is a rush / expedited matter.</span>{" "}
                      Your inquiry goes straight to our senior team.
                    </span>
                  </label>
                  {rush && (
                    <p className="mt-2 text-sm text-neutral-700">
                      Priority lane. For an immediate response, call{" "}
                      <a href="tel:+12013430700" className="font-semibold text-navy underline">(201) 343-0700</a>{" "}
                      or email{" "}
                      <a href="mailto:info@kwvrs.com" className="font-semibold text-navy underline">info@kwvrs.com</a>.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      First Name <span className="text-amber-dark">*</span>
                    </label>
                    <input
                      id="first-name"
                      name="first-name"
                      type="text"
                      required
                      autoComplete="given-name"
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Last Name <span className="text-amber-dark">*</span>
                    </label>
                    <input
                      id="last-name"
                      name="last-name"
                      type="text"
                      required
                      autoComplete="family-name"
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email Address <span className="text-amber-dark">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    placeholder="jane@lawfirm.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Phone Number <span className="text-amber-dark">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    placeholder="(201) 555-0100"
                  />
                </div>

                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-neutral-700 mb-2">
                      Preferred Language <span className="text-amber-dark">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-5">
                      {["English", "Spanish"].map((lang, i) => (
                        <label key={lang} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                          <input
                            type="radio"
                            name="language"
                            value={lang}
                            defaultChecked={i === 0}
                            className="accent-teal"
                          />
                          {lang}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div>
                  <label htmlFor="case-type" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Case Type <span className="text-amber-dark">*</span>
                  </label>
                  <select
                    id="case-type"
                    name="case-type"
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a case type</option>
                    <option>Personal Injury</option>
                    <option>Workers' Compensation</option>
                    <option>Medical Malpractice</option>
                    <option>Wrongful Death</option>
                    <option>Wrongful Termination</option>
                    <option>Matrimonial / Family Law</option>
                    <option>Long-Term Disability</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="how-heard" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    How did you hear about us?
                  </label>
                  <select
                    id="how-heard"
                    name="how-heard"
                    value={howHeard}
                    onChange={(e) => setHowHeard(e.target.value)}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                  >
                    <option value="">Select one (optional)</option>
                    {HOW_HEARD.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {howHeard === "other" && (
                  <div>
                    <label htmlFor="how-heard-other" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Tell us how you heard about us
                    </label>
                    <input
                      id="how-heard-other"
                      name="how-heard-other"
                      type="text"
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Message <span className="text-amber-dark">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
                    placeholder="Briefly describe the matter and the services you need..."
                  />
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 border border-neutral-200 rounded-md p-3">
                  <strong>Response within 1 business day.</strong> Your information is
                  used to perform a conflict check and prepare a fee quote. We do
                  not share inquiries with third parties.
                </p>

                <Turnstile onToken={setTurnstileToken} />
                <HoneypotField onChange={setCompanyWebsite} />

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-amber-dark hover:bg-amber-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Sending..." : "Send Request - Reply in 1 Business Day"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
