import { useMemo, useState } from "react";
import { Mail, Check, Calculator, AlertCircle } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import ContactCTA from "@/components/ContactCTA";
// Shared engine (lib/ ships in the production image; same pattern as intake-schema)
import { calculateEconomicDamages } from "../../lib/damages-estimate.mjs";

type Report = ReturnType<typeof calculateEconomicDamages>;

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

interface FieldDef {
  key: string;
  label: string;
  hint?: string;
  /** percent fields are ENTERED as whole percents (25 = 25%) and converted to decimals */
  kind: "money" | "percent" | "years" | "age";
  min: number;
  max: number;
  step?: string;
  defaultValue: string;
  optional?: boolean;
}

const SECTIONS: { heading: string; fields: FieldDef[] }[] = [
  {
    heading: "Earnings",
    fields: [
      { key: "annualIncome", label: "Annual income", kind: "money", min: 0, max: 100_000_000, defaultValue: "75000", hint: "Pre-injury base earning level, in dollars" },
      { key: "annualFringeRate", label: "Fringe benefits (%)", kind: "percent", min: 0, max: 100, step: "0.5", defaultValue: "25", hint: "Employer benefits as a percent of wages, e.g. 25" },
      { key: "currentAge", label: "Current age", kind: "age", min: 0, max: 120, defaultValue: "40" },
      { key: "retirementAge", label: "Expected retirement age", kind: "age", min: 0, max: 120, defaultValue: "67" },
    ],
  },
  {
    heading: "Loss period",
    fields: [
      { key: "lossBeforeFileInjuryYears", label: "Past loss period (years)", kind: "years", min: 0, max: 80, step: "0.25", defaultValue: "1", hint: "From the injury date to today" },
      { key: "pastWageMultiplier", label: "Past earnings lost (%)", kind: "percent", min: 0, max: 100, step: "5", defaultValue: "100", hint: "100 = could not work at all; 50 = earnings cut in half" },
      { key: "worklifeLossYears", label: "Future worklife loss (years)", kind: "years", min: 0, max: 80, defaultValue: "", optional: true, hint: "Leave blank to infer from the ages above" },
    ],
  },
  {
    heading: "Rates",
    fields: [
      { key: "growthRate", label: "Wage growth (%/yr)", kind: "percent", min: 0, max: 100, step: "0.1", defaultValue: "2.8" },
      { key: "discountRate", label: "Discount rate (%/yr)", kind: "percent", min: 0, max: 100, step: "0.1", defaultValue: "2" },
      { key: "inflationRateFuture", label: "Medical/care inflation (%/yr)", kind: "percent", min: 0, max: 100, step: "0.1", defaultValue: "2" },
    ],
  },
  {
    heading: "Medical and other expenses",
    fields: [
      { key: "medicalsPast", label: "Past medical ($ to date)", kind: "money", min: 0, max: 100_000_000, defaultValue: "0" },
      { key: "medicalsFuture", label: "Future medical ($ per year)", kind: "money", min: 0, max: 100_000_000, defaultValue: "0" },
      { key: "attendantCarePast", label: "Past attendant care ($ to date)", kind: "money", min: 0, max: 100_000_000, defaultValue: "0" },
      { key: "attendantCareFuture", label: "Future attendant care ($ per year)", kind: "money", min: 0, max: 100_000_000, defaultValue: "0" },
      { key: "otherPast", label: "Other past losses ($ to date)", kind: "money", min: 0, max: 100_000_000, defaultValue: "0" },
      { key: "otherFuture", label: "Other future losses ($ per year)", kind: "money", min: 0, max: 100_000_000, defaultValue: "0" },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields);

/** Per-field validation message, or null. Empty optional fields are fine. */
function fieldError(f: FieldDef, raw: string): string | null {
  if (raw === "") return f.optional ? null : `${f.label} is required`;
  const n = Number(raw);
  if (!Number.isFinite(n)) return `${f.label} must be a number`;
  if (n < f.min || n > f.max) return `${f.label} must be between ${f.min} and ${f.max}`;
  return null;
}

export default function DamagesEstimator() {
  usePageMeta({
    title: "Economic Damages Estimator | KWVRS",
    description:
      "Free preliminary economic loss estimator for attorneys: past and future lost earnings, future medical and attendant care in present value, with a planning range.",
    canonical: "/tools/economic-damages-estimator",
  });

  const [inputs, setInputs] = useState<Record<string, string>>(() =>
    Object.fromEntries(ALL_FIELDS.map((f) => [f.key, f.defaultValue])),
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [gateStatus, setGateStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  const errors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of ALL_FIELDS) {
      const err = fieldError(f, inputs[f.key] ?? "");
      if (err) out[f.key] = err;
    }
    // Cross-field: when worklife is blank it is inferred from the ages, so the
    // ages must make sense together.
    if (!out.currentAge && !out.retirementAge && (inputs.worklifeLossYears ?? "") === "") {
      if (Number(inputs.retirementAge) <= Number(inputs.currentAge)) {
        out.retirementAge = "Expected retirement age must be greater than current age (or enter future worklife loss directly)";
      }
    }
    return out;
  }, [inputs]);

  const valid = Object.keys(errors).length === 0;

  /** Scenario in ENGINE units: percent fields divided by 100. */
  const scenario = useMemo(() => {
    const s: Record<string, number> = {};
    for (const f of ALL_FIELDS) {
      const raw = inputs[f.key];
      if (raw === "" || raw === undefined) continue;
      const n = Number(raw);
      if (!Number.isFinite(n)) continue;
      s[f.key] = f.kind === "percent" ? n / 100 : n;
    }
    return s;
  }, [inputs]);

  const result: { report: Report | null } = useMemo(() => {
    if (!valid) return { report: null };
    try {
      return { report: calculateEconomicDamages(scenario) };
    } catch {
      return { report: null };
    }
  }, [scenario, valid]);

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !firm.trim() || !result.report) return;
    setGateStatus("submitting");
    try {
      const res = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, firm, email, ...scenario, turnstileToken, company_website: companyWebsite }),
      });
      if (!res.ok) throw new Error("request failed");
      setGateStatus("sent");
    } catch {
      setGateStatus("error");
    }
  }

  const totals = result.report?.lineItems.totals;
  const band = totals?.uncertaintyBand;
  const pastMedicalAndOther = result.report?.lineItems.past.pastMedicalAndOther ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-navy text-white py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-amber uppercase tracking-[0.18em] text-xs font-semibold mb-3">Attorney tools</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Economic damages estimator</h1>
          <p className="text-neutral-200 max-w-2xl">
            A planning-level estimate of economic loss for either side of a matter - past and future
            lost earnings plus future medical and care costs in present value. Adjust the
            assumptions; the range updates instantly.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Inputs */}
          <div className="space-y-7">
            {SECTIONS.map((section) => (
              <fieldset key={section.heading} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <legend className="px-2 font-serif text-lg font-bold text-navy">{section.heading}</legend>
                <div className="grid gap-4 sm:grid-cols-2 mt-2">
                  {section.fields.map((f) => {
                    const showError = touched[f.key] && errors[f.key];
                    return (
                      <label key={f.key} className="block">
                        <span className="block text-sm font-medium text-navy mb-1">{f.label}</span>
                        <div className="relative">
                          <input
                            type="number"
                            inputMode="decimal"
                            min={f.min}
                            max={f.max}
                            step={f.step || "1"}
                            value={inputs[f.key]}
                            aria-invalid={!!showError}
                            onBlur={() => setTouched((prev) => ({ ...prev, [f.key]: true }))}
                            onChange={(e) => setInputs((prev) => ({ ...prev, [f.key]: e.target.value }))}
                            className={`w-full rounded-lg border px-3.5 py-2 text-sm font-mono focus:ring-2 outline-none ${
                              showError
                                ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                                : "border-neutral-300 focus:border-teal focus:ring-teal/20"
                            } ${f.kind === "percent" ? "pr-8" : ""}`}
                          />
                          {f.kind === "percent" && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 pointer-events-none">%</span>
                          )}
                        </div>
                        {showError ? (
                          <span className="block text-xs text-red-600 mt-1">{errors[f.key]}</span>
                        ) : (
                          f.hint && <span className="block text-xs text-neutral-500 mt-1">{f.hint}</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {/* Results rail */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="rounded-2xl border border-navy/15 bg-white p-6 shadow-md">
              <div className="flex items-center gap-2 text-teal mb-3">
                <Calculator className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">Preliminary estimate</span>
              </div>
              {result.report && totals && band ? (
                <>
                  <p className="text-sm text-neutral-500 mb-1">Planning range</p>
                  <p className="font-mono text-2xl font-bold text-navy leading-tight">
                    {usd(band.low)} - {usd(band.high)}
                  </p>
                  <p className="text-sm text-neutral-600 mt-2 mb-4">
                    Midpoint <span className="font-mono font-semibold text-navy">{usd(band.mid)}</span>
                  </p>
                  <div className="border-t border-neutral-200 pt-4 space-y-2.5 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">What the midpoint includes</p>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-neutral-600">Lost earnings (past + future, present value)</span>
                      <span className="font-mono font-semibold text-navy whitespace-nowrap">{usd(totals.lostEarnings)}</span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-neutral-600">Future medical, care &amp; other (present value)</span>
                      <span className="font-mono font-semibold text-navy whitespace-nowrap">{usd(totals.futureSpecials)}</span>
                    </div>
                    {pastMedicalAndOther > 0 && (
                      <div className="flex items-baseline justify-between gap-3 text-neutral-500">
                        <span>Past medical &amp; other - documented from bills, shown separately and not added into the total</span>
                        <span className="font-mono whitespace-nowrap">{usd(pastMedicalAndOther)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600 mt-4">
                    The range reflects normal estimation uncertainty (about -15% to +20% around the
                    midpoint). It is not a prediction of any outcome.
                  </p>
                </>
              ) : (
                <div className="flex items-start gap-2 text-sm text-neutral-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-dark shrink-0" />
                  <p>Fix the highlighted inputs to see the estimate. Every field needs a valid number in the range shown.</p>
                </div>
              )}
              <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                Planning tool only - not an expert opinion, report, or testimony. Methods and
                assumptions vary by case facts and jurisdiction; a retained analysis prepared for
                either plaintiff or defense may differ materially.
              </p>
            </div>

            {/* Email gate */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
              {gateStatus === "sent" ? (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-forest/10 text-forest shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy mb-1">Breakdown on its way</h3>
                    <p className="text-sm text-neutral-600">
                      The full line-item breakdown is headed to your inbox. Our team will follow up
                      to see how we can help with this matter.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-dark mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Full breakdown</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy mb-2">Email me the line items</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Get every line item and assumption from this estimate in a printable email. We
                    will only use your details to follow up about this matter.
                  </p>
                  <form onSubmit={handleGateSubmit} className="space-y-3">
                    <input
                      type="text" required aria-label="Full name" placeholder="Full name"
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber focus:ring-2 focus:ring-amber/30 outline-none"
                    />
                    <input
                      type="text" required aria-label="Firm" placeholder="Firm"
                      value={firm} onChange={(e) => setFirm(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber focus:ring-2 focus:ring-amber/30 outline-none"
                    />
                    <input
                      type="email" required aria-label="Work email" placeholder="Work email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-amber focus:ring-2 focus:ring-amber/30 outline-none"
                    />
                    <Turnstile onToken={setTurnstileToken} />
                    <HoneypotField onChange={setCompanyWebsite} />
                    <button
                      type="submit"
                      disabled={gateStatus === "submitting" || !result.report}
                      className="kw-magnetic w-full inline-flex items-center justify-center gap-2 bg-amber-dark hover:bg-amber disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      {gateStatus === "submitting" ? "Sending..." : "Send my breakdown"}
                    </button>
                    {!result.report && (
                      <p className="text-xs text-neutral-500">Fix the highlighted inputs above to enable the breakdown email.</p>
                    )}
                    {gateStatus === "error" && (
                      <p className="text-sm text-red-600">
                        Something went wrong. Please try again or call (201) 343-0700.
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      <ContactCTA />
    </div>
  );
}
