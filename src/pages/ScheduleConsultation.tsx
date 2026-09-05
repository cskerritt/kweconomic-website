import { useState } from "react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { Phone, Mail, MapPin, Clock, CheckCircle } from "lucide-react";
import { isEmail, isPhone } from "@/lib/validation";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Picture } from "@/components/Picture";
import SchemaOrg from "@/components/SchemaOrg";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import { caseTypes } from "@/data/caseTypes";
import { FORM_INTAKE_NOTE } from "@/data/consultation";
import {
  ORG_NAME,
  ORG_EMAIL,
  ORG_PHONE,
  ORG_PHONE_VA,
  ORG_PHONE_DISPLAY,
  ORG_PHONE_VA_DISPLAY,
  SITE_URL,
  telHref,
} from "@/lib/brand";
import { graphSchema, organizationSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";

const PAGE_URL = `${ORG_URL}/schedule-consultation`;
const CASE_TYPE_OPTIONS = [...caseTypes.map((ct) => ct.name), "Other"];

const statesAndTerritories = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
  "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
  "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
  "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
  "Puerto Rico", "U.S. Virgin Islands", "Guam", "American Samoa", "Northern Mariana Islands",
];

const whatToExpect = [
  {
    step: "1",
    heading: "Initial Contact",
    body: "After submitting the form, a member of our team will review your inquiry and reach out within one business day to confirm receipt and clarify any initial questions about the matter.",
  },
  {
    step: "2",
    heading: "Preliminary Review",
    body: "We will conduct a brief conflict check and assess whether our services align with your needs. For most matters, this takes only a few hours once we have the basic case information.",
  },
  {
    step: "3",
    heading: "Consultation Call",
    body: "We will schedule a telephone or video consultation to discuss the case in more detail - the loss claim, the earnings, benefit, or financial records available, the timeline, and whether a full damages report, a present value analysis, or a rebuttal of an opposing report fits the matter. This call is typically 30-45 minutes.",
  },
  {
    step: "4",
    heading: "Engagement and Records",
    body: "If we proceed, we will confirm scope, timeline, and fee in writing and send a records request list. Once the engagement letter is signed and materials received, the economist will begin the analysis.",
  },
];

const infoToHaveReady = [
  "Nature of the matter (case type and jurisdiction)",
  "Date of the injury, death, termination, breach, or other event at issue",
  "The claimant's age, occupation, and work history, or the business whose losses are at issue",
  "Earnings, tax, and benefit records or business financial statements, if available",
  "Any deadlines - trial date, discovery cutoff, or expert disclosure date",
  "Whether you need an affirmative damages report, a rebuttal of an opposing economist's report, or both",
];

export default function ScheduleConsultation() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "invalid">("idle");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = new FormData(form);
    const firstName = (raw.get("first-name") as string) || "";
    const lastName = (raw.get("last-name") as string) || "";
    // Posts to the server handler, which records the lead and forwards it to
    // the intake workflow (Supabase case + Asana task + team notification).
    const data = {
      name: `${firstName} ${lastName}`.trim(),
      email: raw.get("email"),
      phone: raw.get("phone"),
      firm: raw.get("firm-name"),
      caseType: raw.get("case-type"),
      state: raw.get("jurisdiction"),
      message: raw.get("description"),
      language: raw.get("language") || "English",
      contactMethod: raw.get("contact-method"),
      turnstileToken,
      company_website: companyWebsite,
    };
    if (!isEmail(String(data.email ?? "")) || !isPhone(String(data.phone ?? ""))) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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
    title: `Schedule a Forensic Economist Consultation | ${ORG_NAME}`,
    description:
      `Contact ${ORG_NAME} to discuss your case and schedule an economic damages consultation with a forensic economist. Response within one business day.`,
    canonical: `${SITE_URL}/schedule-consultation`,
  });

  return (
    <>
      {/* ContactPage node so the conversion page is typed and tied to the
          Organization and WebSite ids; the breadcrumb runs through /contact,
          the page that links here. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          {
            "@type": "ContactPage",
            "@id": `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: "Schedule a Forensic Economist Consultation",
            isPartOf: { "@id": WEBSITE_ID },
            about: { "@id": ORG_ID },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Contact", url: `${ORG_URL}/contact` },
            { name: "Schedule a Consultation", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs
            items={[
              { name: "Home", url: "/" },
              { name: "Contact", url: "/contact" },
              { name: "Schedule a Consultation", url: "/schedule-consultation" },
            ]}
          />
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
              Schedule a Consultation
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Use the form below to describe your matter and request a consultation. Our team
              will respond within one business day to confirm receipt and discuss next steps.
            </p>
          </div>
        </div>
      </section>

      {/* Visual break */}
      <section className="py-10 md:py-14 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Picture
            src="/images/mentor-trainee.jpg"
            alt="Economist walking an attorney through the consultation process"
            width={1200}
            height={400}
            className="rounded-2xl shadow-xl w-full object-cover max-h-72"
            loading="lazy"
          />
        </div>
      </section>

      {/* Two-column content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">

            {/* Left: Process + What to Prepare */}
            <div className="mb-12 lg:mb-0">
              <h2 className="font-serif text-2xl font-bold text-navy mb-6">What to Expect</h2>
              <div className="space-y-5 mb-10">
                {whatToExpect.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center text-sm font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy text-sm mb-1">{item.heading}</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="font-serif text-2xl font-bold text-navy mb-4">
                Information to Have Ready
              </h2>
              <p className="text-sm text-neutral-600 mb-4">
                The consultation will be most productive if you can provide the following at the
                outset. Exact records are not required at this stage - a general summary is
                sufficient to get started.
              </p>
              <ul className="space-y-2.5">
                {infoToHaveReady.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <CheckCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Form */}
            <div>
              <h2 className="font-serif text-2xl font-bold text-navy mb-6">Request a Consultation</h2>
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 space-y-5"
              >
                {status === "sent" && (
                  <div className="rounded-lg bg-teal/10 border border-teal/30 text-teal px-4 py-3 text-sm font-medium">
                    Thank you - your consultation request has been received. We will follow up within one business day.
                  </div>
                )}
                {status === "error" && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
                    Something went wrong. Please try again or contact us directly at {ORG_EMAIL}.
                  </div>
                )}
                {status === "invalid" && <p className="text-sm text-red-600">Please enter a valid email and phone number.</p>}

                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      First Name <span className="text-teal">*</span>
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
                      Last Name <span className="text-teal">*</span>
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

                {/* Email */}
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
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    placeholder="jane@lawfirm.com"
                  />
                </div>

                {/* Phone */}
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
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    placeholder="(201) 555-0100"
                  />
                </div>

                {/* Firm */}
                <div>
                  <label htmlFor="firm-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Firm / Organization Name <span className="text-teal">*</span>
                  </label>
                  <input
                    id="firm-name"
                    name="firm-name"
                    type="text"
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    placeholder="Smith &amp; Associates, LLP"
                  />
                </div>

                {/* Case type + Jurisdiction row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="case-type" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Case Type <span className="text-teal">*</span>
                    </label>
                    <select
                      id="case-type"
                      name="case-type"
                      required
                      defaultValue=""
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    >
                      <option value="" disabled>Select case type</option>
                      {CASE_TYPE_OPTIONS.map((ct) => (
                        <option key={ct}>{ct}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="jurisdiction" className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Jurisdiction / State <span className="text-teal">*</span>
                    </label>
                    <select
                      id="jurisdiction"
                      name="jurisdiction"
                      required
                      defaultValue=""
                      className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent"
                    >
                      <option value="" disabled>Select state</option>
                      {statesAndTerritories.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Brief Description of the Matter <span className="text-teal">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    required
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent resize-none"
                    placeholder="Describe the loss claim, the records you have, and the analysis you need..."
                  />
                </div>

                {/* Preferred language */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-neutral-700 mb-2">
                      Preferred Language
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

                {/* Preferred contact */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-neutral-700 mb-2">
                      Preferred Contact Method
                    </legend>
                    <div className="flex flex-wrap gap-5">
                      {["Email", "Phone", "Either"].map((method) => (
                        <label key={method} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                          <input
                            type="radio"
                            name="contact-method"
                            value={method.toLowerCase()}
                            defaultChecked={method === "Email"}
                            className="accent-teal"
                          />
                          {method}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <Turnstile onToken={setTurnstileToken} />
                <HoneypotField onChange={setCompanyWebsite} />

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-teal hover:bg-teal-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Submitting..." : "Submit Consultation Request"}
                </button>

                <p className="text-xs text-neutral-500 text-center">
                  All submissions are reviewed within one business day. No commitment is
                  required at this stage.
                </p>
                {/* Where the request goes (src/data/intake.ts, the same note
                    the contact form and the privacy policy carry). */}
                <p className="text-xs text-neutral-500 text-center">{FORM_INTAKE_NOTE}</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Office info strip */}
      <section className="py-12 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-xl font-bold text-navy mb-6">Our Offices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* NJ */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h3 className="font-semibold text-navy mb-3">New Jersey - Headquarters</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  Hackensack, New Jersey
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal shrink-0" />
                  <a href={telHref(ORG_PHONE)} className="hover:text-teal transition-colors font-medium">
                    {ORG_PHONE_DISPLAY}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal shrink-0" />
                  <a href={`mailto:${ORG_EMAIL}`} className="hover:text-teal transition-colors">
                    {ORG_EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            {/* VA */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h3 className="font-semibold text-navy mb-3">Virginia - Richmond Office</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  Richmond, Virginia
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-teal shrink-0" />
                  <a href={telHref(ORG_PHONE_VA)} className="hover:text-teal transition-colors font-medium">
                    {ORG_PHONE_VA_DISPLAY}
                  </a>
                </li>
              </ul>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5">
              <h3 className="font-semibold text-navy mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal" />
                Office Hours
              </h3>
              <ul className="space-y-1.5 text-sm text-neutral-700">
                <li className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 5:00 PM ET</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday - Sunday</span>
                  <span className="text-neutral-500">Closed</span>
                </li>
              </ul>
              <p className="text-xs text-neutral-500 mt-3">
                After-hours inquiries via email are responded to the next business day.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
