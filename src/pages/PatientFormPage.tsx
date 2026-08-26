import { usePageMeta } from "@/hooks/use-page-meta";
import { FileText, Download } from "lucide-react";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { PATIENT_FORMS } from "@/data/forms";

export default function PatientFormPage({ formId }: { formId: string }) {
  const form = PATIENT_FORMS.find((f) => f.id === formId);

  usePageMeta({
    title: form ? `${form.title} | KWVRS` : "Form | KWVRS",
    description: form
      ? `Download the ${form.title} for Kincaid Wolstein Vocational and Rehabilitation Services, complete and sign it, and return it via the secure upload link provided by your KWVRS contact.`
      : "KWVRS intake form.",
    canonical: form ? `https://kwvrs.com${form.slug}` : "https://kwvrs.com/forms",
  });

  if (!form) {
    return (
      <section className="py-24 text-center">
        <p className="text-neutral-600">Form not found. See all <a href="/forms" className="text-teal underline">forms</a>.</p>
      </section>
    );
  }

  return (
    <>
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Forms", url: `${ORG_URL}/forms` },
            { name: form.title, url: `${ORG_URL}${form.slug}` },
          ]),
        ])}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-20">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              {form.type === "phq" ? "Personal History Questionnaire" : "HIPAA Authorization"} · {form.language}
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-3xl md:text-4xl font-bold leading-tight mb-5">
              {form.title}
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">{form.description}</p>
          </div>
        </div>
      </section>

      {/* Instructions + download */}
      <section className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 lg:p-8">
            <h2 className="font-serif text-xl font-bold text-navy mb-2">How to complete this form</h2>
            <ol className="space-y-3 text-sm text-neutral-700 mb-7">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">1</span>
                <span><strong className="text-navy">Download the PDF</strong> using the button below.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">2</span>
                <span><strong className="text-navy">Complete and sign</strong> every required field. You may print and sign by hand, or use any PDF application that supports signature fields.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">3</span>
                <span><strong className="text-navy">Return the completed form</strong> via the secure upload link provided in your intake email from KWVRS. Do not send the completed form by unencrypted email.</span>
              </li>
            </ol>

            <a
              href={form.pdf}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-amber-dark text-white px-5 py-3 text-sm font-semibold hover:opacity-90 transition"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>

            <hr className="my-7 border-neutral-200" />

            <p className="text-sm text-neutral-600">
              Questions about this form? Call (201) 343-0700 or email{" "}
              <a href="mailto:info@kwvrs.com" className="text-teal font-medium hover:underline">info@kwvrs.com</a>.
            </p>
          </div>

          <p className="text-sm text-neutral-600 mt-6 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal" />
            See all <a href="/forms" className="text-teal font-medium hover:underline">intake forms</a>, or call (201) 343-0700 with questions.
          </p>
        </div>
      </section>
    </>
  );
}
