import { usePageMeta } from "@/hooks/use-page-meta";
import { FileText } from "lucide-react";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { PATIENT_FORMS, PSA_FORMS } from "@/data/forms";

export default function Forms() {
  usePageMeta({
    title: "Forms | KWVRS",
    description:
      "Download KWVRS forms - the Professional Services Agreements (retainer PDFs) and the patient intake forms (personal history questionnaire and HIPAA authorization, in English and Spanish).",
    canonical: "https://kwvrs.com/forms",
  });

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Forms", url: `${ORG_URL}/forms` },
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
              Intake Forms
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Forms
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Professional Services Agreements and patient intake forms in one place - download the PDF you need.
              Patient forms are completed, signed, and returned via the secure upload link provided by your KWVRS contact.
            </p>
          </div>
        </div>
      </section>

      {/* Form list */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">Professional Services Agreements</h2>
          <p className="text-neutral-600 mb-6">
            The retainer agreement PDFs - each matches its dedicated digital intake form.
          </p>
          <ul className="grid sm:grid-cols-2 gap-5">
            {PSA_FORMS.map((form) => (
              <li key={form.id}>
                <a
                  href={form.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-4 rounded-xl border border-neutral-200 bg-white p-6 hover:border-teal hover:shadow-sm transition"
                >
                  <FileText className="w-6 h-6 text-teal shrink-0 mt-0.5" />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      Retainer agreement
                    </span>
                    <span className="block font-semibold text-navy mb-1">{form.title}</span>
                    <span className="block text-sm text-neutral-600 mb-3">{form.description}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                      Open PDF &rarr;
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <h2 className="font-serif text-2xl font-bold text-navy mb-2 mt-14">Patient intake forms</h2>
          <p className="text-neutral-600 mb-6">
            Download, complete and sign, then return via the secure upload link your KWVRS contact provides.
          </p>
          <ul className="grid sm:grid-cols-2 gap-5">
            {PATIENT_FORMS.map((form) => (
              <li key={form.id}>
                <a
                  href={form.slug}
                  className="group flex h-full items-start gap-4 rounded-xl border border-neutral-200 bg-white p-6 hover:border-teal hover:shadow-sm transition"
                >
                  <FileText className="w-6 h-6 text-teal shrink-0 mt-0.5" />
                  <span className="flex-1">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">
                      {form.language}
                    </span>
                    <span className="block font-semibold text-navy mb-1">{form.title}</span>
                    <span className="block text-sm text-neutral-600 mb-3">{form.description}</span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                      Download &rarr;
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="text-sm text-neutral-600 mt-8 bg-neutral-50 border border-neutral-200 rounded-lg p-4">
            Not sure which forms apply to your matter? Visit the{" "}
            <a href="/contact" className="text-teal font-medium hover:underline">contact page</a>{" "}
            or call (201) 343-0700.
          </p>
        </div>
      </section>
    </>
  );
}
