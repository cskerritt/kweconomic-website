import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { CheckCircle, X } from "lucide-react";
import {
  getAgreement,
  CONDITIONS_OF_RETENTION,
  ACKNOWLEDGMENT,
  type DocumentsRequested,
} from "@/data/agreements";
import NotFound from "@/pages/NotFound";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import ExpertPicker from "@/components/ExpertPicker";
import MissingInfoModal, { type MissingFieldRow } from "@/components/ui/MissingInfoModal";
import {
  buildAgreementPayload,
  agreementModalRows,
  agreementControlValue,
  AGREEMENT_KEY_TO_NAME,
} from "@/lib/agreementPayload";

function field(name: string) {
  return name;
}

function DocumentsBlock({ doc }: { doc: DocumentsRequested }) {
  if (doc.kind === "list") {
    return (
      <div className="mb-8">
        {doc.intro && <h3 className="font-serif text-lg font-bold text-navy mb-3">{doc.intro}</h3>}
        <ul className="space-y-3">
          {doc.items.map((item) => (
            <li key={item.label} className="text-sm text-neutral-700">
              <span className="font-semibold text-navy">{item.label}</span>
              {item.sub && (
                <ul className="mt-1 ml-5 list-disc space-y-1 text-neutral-600">
                  {item.sub.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        {doc.note && <p className="mt-4 text-xs text-neutral-500 italic">{doc.note}</p>}
      </div>
    );
  }
  return (
    <div className="mb-8 overflow-x-auto">
      {doc.legend && <p className="text-sm text-neutral-600 mb-3 font-medium">{doc.legend}</p>}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-navy/5">
            {doc.columns.map((c, i) => (
              <th
                key={c}
                className={`border border-neutral-300 px-3 py-2 text-left font-semibold text-navy ${i > 0 ? "w-32 text-center" : ""}`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doc.rows.map((row) => (
            <tr key={row.label} className="align-top">
              <td className="border border-neutral-300 px-3 py-2 text-neutral-700">{row.label}</td>
              {row.marks.map((m, i) => (
                <td key={i} className="border border-neutral-300 px-3 py-2 text-center">
                  {m ? (
                    <CheckCircle className="w-4 h-4 text-teal inline" />
                  ) : (
                    <X className="w-4 h-4 text-neutral-500 inline" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {doc.note && <p className="mt-4 text-xs text-neutral-500 italic">{doc.note}</p>}
    </div>
  );
}

export default function Agreement() {
  const { slug } = useParams<{ slug: string }>();
  const agreement = slug ? getAgreement(slug) : undefined;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  // The picker is a controlled component; this form is otherwise uncontrolled
  // (FormData), so its radios also post under "retainedExpert" and
  // buildAgreementPayload re-derives from that entry.
  const [retainedExpert, setRetainedExpert] = useState("");
  // Submit-time mirror of the posted payload + the gaps it still has. The form
  // stays uncontrolled: the mirror only exists while the modal is open, and every
  // answer is written straight back into the real control (handleModalChange).
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<Record<string, unknown>>({});
  const formRef = useRef<HTMLFormElement | null>(null);

  usePageMeta({
    title: agreement
      ? `${agreement.title} | KWVRS`
      : "Professional Services Agreement | KWVRS",
    description:
      "Kincaid Wolstein Vocational and Rehabilitation Services Professional Services Agreement and retention intake form.",
    canonical: `https://kwvrs.com/agreements/${slug ?? ""}`,
    noindex: true,
  });

  // The whole submit, callable with any form element so the modal's Continue runs
  // the IDENTICAL path a direct submit runs. Native `required` has already gated
  // the plain text fields by the time this runs; the schema check below covers the
  // composite/group fields the browser cannot express (>= 1 work product, the
  // conditional represents row, the PSA boxes).
  const submitAgreement = useCallback(
    async (form: HTMLFormElement) => {
      if (!agreement || status === "sending") return;
      // A FRESH FormData every attempt: the modal writes its answers into these
      // uncontrolled controls, so re-reading the DOM is what carries them.
      // Normalizes label-keyed fields into the keys the server intake validator +
      // workflow read (workProducts, retainingSide, formType, name, firm, caseType).
      const payload = buildAgreementPayload(new FormData(form), agreement);

      const rows = agreementModalRows(payload, agreement);
      if (rows.length > 0) {
        setModalValues(payload);
        setModalOpen(true);
        setStatus("idle");
        return;
      }

      setModalOpen(false);
      setStatus("sending");
      // Posts to the server handler -> Supabase case + Asana task + notification.
      try {
        const res = await fetch("/api/consultation", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...payload, turnstileToken, company_website: companyWebsite }),
        });
        if (res.ok) {
          setStatus("sent");
          form.reset();
          setRetainedExpert("");
          setModalValues({});
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          // Surface the server's validation reason (e.g. "at least one work
          // product is required") instead of a generic message, so an incomplete
          // submission tells the attorney exactly what to fix.
          const body = await res.json().catch(() => null);
          setErrorMsg(typeof body?.error === "string" ? body.error : "");
          setStatus("error");
        }
      } catch {
        setErrorMsg("");
        setStatus("error");
      }
    },
    [agreement, status, turnstileToken, companyWebsite],
  );

  // Rows for the modal, recomputed from the mirror so answering one closes it.
  // Never sorted or mutated here - the array and its rows are the helper's to shape.
  const modalRows = useMemo<MissingFieldRow[]>(
    () => (agreement && modalOpen ? agreementModalRows(modalValues, agreement) : []),
    [agreement, modalOpen, modalValues],
  );

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleModalChange = useCallback(
    (key: string, value: unknown) => {
      setModalValues((prev) => ({ ...prev, [key]: value }));
      // The expert picker is the one CONTROLLED control on the page.
      if (key === "retainedExpert") {
        setRetainedExpert(String(value ?? ""));
        return;
      }
      // Everything else is uncontrolled: write the answer into the DOM so the
      // next FormData carries it (otherwise Continue reopens the same modal).
      const form = formRef.current;
      const target = AGREEMENT_KEY_TO_NAME[key];
      if (!form || !target || !agreement) return;
      // namedItem matches a control's name OR its id, and returns a RadioNodeList
      // only when several controls share the name (a one-option group returns the
      // element itself), so both shapes are normalized to a list here.
      const node = form.elements.namedItem(target);
      if (!node) return;
      const controls = ("tagName" in node ? [node] : Array.from(node)) as HTMLInputElement[];
      const domValue = agreementControlValue(agreement, key, value);
      for (const el of controls) {
        if (el.type === "checkbox" || el.type === "radio") {
          el.checked = Array.isArray(domValue)
            ? domValue.includes(el.value)
            : el.value === domValue;
        } else {
          el.value = Array.isArray(domValue) ? domValue.join(", ") : domValue;
        }
      }
    },
    [agreement],
  );

  // Continue is enabled only once no rows remain, so this closes and hands off to
  // the same submit path.
  const continueFromModal = useCallback(() => {
    setModalOpen(false);
    const form = formRef.current;
    if (form) void submitAgreement(form);
  }, [submitAgreement]);

  if (!agreement) return <NotFound />;

  const { intake } = agreement;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void submitAgreement(e.currentTarget);
  }

  const inputClass =
    "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal focus:border-transparent";

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-light text-sm font-semibold uppercase tracking-wider mb-3">
            Retention Agreement
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
            {agreement.title}
          </h1>
          <p className="text-neutral-300 leading-relaxed">{agreement.intro}</p>
          <p className="text-neutral-300 leading-relaxed mt-3 font-medium">
            {agreement.paymentNote}
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Exhibit B: Fee schedule */}
          <h2 className="font-serif text-2xl font-bold text-navy mb-5">
            {agreement.feeSchedule.title}
          </h2>
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-navy/5">
                  <th className="border border-neutral-300 px-3 py-2 text-left font-semibold text-navy">
                    {agreement.feeSchedule.columns[0]}
                  </th>
                  <th className="border border-neutral-300 px-3 py-2 text-right font-semibold text-navy w-40">
                    {agreement.feeSchedule.columns[1]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {agreement.feeSchedule.rows.map((r) => (
                  <tr key={r.service} className="align-top">
                    <td className="border border-neutral-300 px-3 py-2 text-neutral-700">
                      <span className="font-medium text-navy">{r.service}</span>
                      {r.detail && (
                        <span className="block text-xs text-neutral-500 mt-0.5">{r.detail}</span>
                      )}
                    </td>
                    <td className="border border-neutral-300 px-3 py-2 text-right font-mono text-neutral-800 whitespace-pre-line">
                      {r.fee}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {agreement.feeSchedule.footnotes?.map((f, i) => (
            <p key={i} className="text-xs text-neutral-500 mb-2">
              {f}
            </p>
          ))}

          {/* Exhibit A: Documents requested */}
          <h2 className="font-serif text-2xl font-bold text-navy mt-12 mb-5">
            Documents Requested
          </h2>
          {agreement.documentsRequested.map((doc, i) => (
            <DocumentsBlock key={i} doc={doc} />
          ))}

          {/* Exhibit C: Conditions of Retention */}
          <h2 className="font-serif text-2xl font-bold text-navy mt-12 mb-2">
            Conditions of Retention
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            These Conditions of Retention apply to all engagements between Kincaid Wolstein
            Vocational and Rehabilitation Services ("KWVRS" or "Company") and the Retaining
            Counsel ("Client"), regardless of case type, work product, or Professional Services
            Agreement ("PSA"). These Conditions govern the operational, administrative, and
            procedural requirements under which professional services are performed and apply in
            conjunction with the applicable PSA.
          </p>
          <div className="space-y-6">
            {CONDITIONS_OF_RETENTION.map((sec) => (
              <div key={sec.num}>
                <h3 className="font-semibold text-navy mb-2">
                  {sec.num}. {sec.title}
                </h3>
                {sec.paragraphs?.map((p, i) => (
                  <p key={i} className="text-sm text-neutral-700 mb-2">
                    {p}
                  </p>
                ))}
                {sec.subsections?.map((sub, i) => (
                  <div key={i} className="mb-2">
                    {sub.num && (
                      <p className="text-sm text-neutral-700">
                        <span className="font-medium text-navy">
                          {sub.num} {sub.title}
                        </span>{" "}
                        {sub.body}
                      </p>
                    )}
                    {sub.bullets && (
                      <ul className="ml-5 list-disc space-y-1 text-sm text-neutral-700">
                        {sub.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Intake form */}
          <h2 className="font-serif text-2xl font-bold text-navy mt-14 mb-2">
            Intake Information & Signature
          </h2>
          <p className="text-sm text-neutral-600 mb-6">
            Complete the intake form below and append your typed signature to retain KWVRS for
            the work products selected.
          </p>

          {status === "sent" && (
            <div className="rounded-lg bg-teal/10 border border-teal/30 text-teal px-4 py-3 text-sm font-medium mb-6">
              Thank you - your signed agreement has been received. A member of our team will
              follow up to confirm retention and next steps.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium mb-6">
              {errorMsg
                ? `Please review the form: ${errorMsg}.`
                : "Something went wrong submitting the form. Please try again or contact us at info@kwvrs.com."}
            </div>
          )}

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-neutral-200 p-6 lg:p-8 space-y-5"
          >
            <div>
              <label htmlFor="individual" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Individual To Be Evaluated <span className="text-amber-dark">*</span>
              </label>
              <input id="individual" name={field("Individual To Be Evaluated")} type="text" required className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="ret-atty" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Retaining Attorney Name <span className="text-amber-dark">*</span>
                </label>
                <input id="ret-atty" name={field("Retaining Attorney Name")} type="text" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="ret-atty-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Retaining Attorney Email <span className="text-amber-dark">*</span>
                </label>
                <input id="ret-atty-email" name="email" type="email" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="ret-atty-phone" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Retaining Attorney Phone <span className="text-amber-dark">*</span>
                </label>
                <input id="ret-atty-phone" name={field("Retaining Attorney Phone")} type="tel" required className={inputClass} />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-neutral-700 mb-1.5">
                <input type="checkbox" name={field("Reports can be emailed to paralegals")} value="Yes" className="accent-teal" />
                Reports can be emailed to paralegals
              </label>
              <label htmlFor="ret-para" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Retaining Paralegal / Email
              </label>
              <input id="ret-para" name={field("Retaining Paralegal / Email")} type="text" className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  {intake.firmLabel} <span className="text-amber-dark">*</span>
                </label>
                <input id="firm" name={field(intake.firmLabel)} type="text" required className={inputClass} />
              </div>
              <div>
                <label htmlFor="invoice-to" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Invoice should be sent to
                </label>
                <input id="invoice-to" name={field("Invoice should be sent to")} type="text" className={inputClass} />
              </div>
            </div>

            {intake.representsOptions && (
              <fieldset>
                <legend className="block text-sm font-medium text-neutral-700 mb-2">
                  Retaining Counsel Represents <span className="text-amber-dark">*</span>
                </legend>
                <div className="flex flex-wrap gap-5">
                  {intake.representsOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                      <input type="radio" name={field("Retaining Counsel Represents")} value={opt} className="accent-teal" />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="opp-name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Opposing Counsel Name
                </label>
                <input id="opp-name" name={field("Opposing Counsel Name")} type="text" className={inputClass} />
              </div>
              <div>
                <label htmlFor="opp-firm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Opposing Counsel Firm
                </label>
                <input id="opp-firm" name={field("Opposing Counsel Firm")} type="text" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="carrier" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  {intake.carrierClaimLabel}
                </label>
                <input id="carrier" name={field(intake.carrierClaimLabel)} type="text" className={inputClass} />
              </div>
              <div>
                <label htmlFor="adjuster" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  {intake.adjusterLabel}
                </label>
                <input id="adjuster" name={field(intake.adjusterLabel)} type="text" className={inputClass} />
              </div>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-neutral-700 mb-2">
                Type of Case
              </legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {intake.caseTypeOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" name={field("Type of Case")} value={opt} className="accent-teal" />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="block text-sm font-medium text-neutral-700 mb-2">
                Work Product(s) Authorized <span className="text-amber-dark">*</span>
              </legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {intake.workProductOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="checkbox" name={field("Work Product(s) Authorized")} value={opt} className="accent-teal" />
                    {/* Display-only annotation: the submitted value must stay the
                        schema token ("IME") for the label->token normalization,
                        but this form has no state field to hide the option by,
                        so the NY/NJ-only limit is stated inline instead. */}
                    {opt === "IME" ? "IME (New York & New Jersey matters only)" : opt}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="due-date" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Report(s) Needed By (Due Date)
                </label>
                <input id="due-date" name={field("Report(s) Needed By")} type="date" className={inputClass} />
              </div>
              <div>
                <label htmlFor="referral" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Referral Source
                </label>
                <input id="referral" name={field("Referral Source")} type="text" className={inputClass} />
              </div>
              <div>
                <label htmlFor="doi" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Date of Injury / Loss
                </label>
                <input id="doi" name={field("Date of Injury / Loss")} type="date" className={inputClass} />
              </div>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-neutral-700 mb-2">
                Payment Method
              </legend>
              <div className="flex flex-wrap gap-5">
                {intake.paymentOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input type="radio" name={field("Payment Method")} value={opt} className="accent-teal" />
                    {opt}
                  </label>
                ))}
              </div>
            </fieldset>

            <ExpertPicker value={retainedExpert} onChange={setRetainedExpert} />

            {/* Signature block */}
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">{ACKNOWLEDGMENT}</p>
              <label className="flex items-start gap-2 text-sm text-neutral-700 mb-4 cursor-pointer">
                <input type="checkbox" required name={field("Acknowledgment Accepted")} value="Yes" className="accent-teal mt-0.5" />
                <span>
                  I have read and agree to the Professional Services Agreement and Conditions of
                  Retention above. <span className="text-amber-dark">*</span>
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="sig" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Signature (type full name) <span className="text-amber-dark">*</span>
                  </label>
                  <input id="sig" name={field("Signature")} type="text" required className={`${inputClass} font-serif`} />
                </div>
                <div>
                  <label htmlFor="tin" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    TIN / EIN
                  </label>
                  <input id="tin" name={field("TIN/EIN")} type="text" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="sig-date" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Date <span className="text-amber-dark">*</span>
                  </label>
                  <input id="sig-date" name={field("Date")} type="date" required className={inputClass} />
                </div>
              </div>
            </div>

            <Turnstile onToken={setTurnstileToken} />
            <HoneypotField onChange={setCompanyWebsite} />

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full bg-amber-dark hover:bg-amber-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? "Submitting..." : "Submit Signed Agreement"}
            </button>
          </form>

          <MissingInfoModal
            open={modalOpen}
            rows={modalRows}
            values={modalValues}
            onChange={handleModalChange}
            onContinue={continueFromModal}
            onClose={closeModal}
          />

          <p className="mt-8 text-xs text-neutral-500 text-center border-t border-neutral-200 pt-6">
            {agreement.officeFooter}
          </p>
        </div>
      </section>
    </>
  );
}
