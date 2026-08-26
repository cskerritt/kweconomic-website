import { useMemo, useState } from "react";
import { HeartPulse, AlertCircle, Mail, Check } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import Turnstile from "@/components/Turnstile";
import HoneypotField from "@/components/HoneypotField";
import ContactCTA from "@/components/ContactCTA";
// Shared engine (lib/ ships in the production image; same pattern as the
// economic-damages estimator - the CDC tables bundle client-side, no fetch).
import {
  computeLifeExpectancy,
  exactAge,
  parseISODate,
  GROUPS,
  SEXES,
  EDITION,
} from "../../lib/life-expectancy.mjs";
import type { LifeTableGroup, LifeTableSex } from "../../lib/life-expectancy.mjs";

type AgeMode = "exact" | "dob";

function todayISO(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const groupLabel = (v: string) => GROUPS.find((g) => g.value === v)?.label ?? v;
/** Neutral noun for the result sentence: total reads as "person". */
const SEX_NOUN: Record<string, string> = { total: "person", female: "female", male: "male" };

/** Format a decimal age for prose: whole numbers plain, otherwise one decimal. */
function ageText(age: number, capped: boolean): string {
  if (capped) return "100 or older";
  return Number.isInteger(age) ? String(age) : age.toFixed(1);
}

export default function LifeExpectancy() {
  usePageMeta({
    title: "Life Expectancy Calculator | KWVRS",
    description:
      "Look up remaining life expectancy by age, sex, and population group using the CDC United States Life Tables, 2023. Population averages for education, not a prediction for any individual.",
    canonical: "/tools/life-expectancy",
  });

  const [ageMode, setAgeMode] = useState<AgeMode>("exact");
  const [ageStr, setAgeStr] = useState("40");
  const [dob, setDob] = useState("");
  const [asof, setAsof] = useState(todayISO);
  const [group, setGroup] = useState<LifeTableGroup>("all");
  const [sex, setSex] = useState<LifeTableSex>("total");

  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [gateStatus, setGateStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  // Resolve a decimal age from whichever entry mode is active. Returns an error
  // string for the UI when the inputs are incomplete or impossible.
  const ageResolution = useMemo<{ age: number | null; error: string | null }>(() => {
    if (ageMode === "exact") {
      if (ageStr.trim() === "") return { age: null, error: "Enter an age to see the estimate." };
      const n = Number(ageStr);
      if (!Number.isFinite(n)) return { age: null, error: "Age must be a number." };
      if (n < 0 || n > 120) return { age: null, error: "Age must be between 0 and 120." };
      return { age: n, error: null };
    }
    const birth = parseISODate(dob);
    if (!birth) return { age: null, error: "Enter a valid date of birth." };
    const on = parseISODate(asof);
    if (!on) return { age: null, error: "Enter a valid as-of date." };
    const exact = exactAge(birth, on);
    if (!exact) return { age: null, error: "The as-of date must be on or after the date of birth." };
    return { age: exact.decimal, error: null };
  }, [ageMode, ageStr, dob, asof]);

  const result = useMemo(() => {
    if (ageResolution.age === null) return null;
    return computeLifeExpectancy({ group, sex, ageDecimal: ageResolution.age });
  }, [ageResolution.age, group, sex]);

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !firm.trim()) return;
    setGateStatus("submitting");
    try {
      const res = await fetch("/api/life-expectancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, firm, email, group, sex, age: ageResolution.age, turnstileToken, company_website: companyWebsite }),
      });
      if (!res.ok) throw new Error("request failed");
      setGateStatus("sent");
    } catch {
      setGateStatus("error");
    }
  }

  const displayAge = result ? ageText(ageResolution.age ?? 0, result.capped) : "";
  const groupClause = group === "all" ? "" : ` in the ${groupLabel(group)} population`;

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-navy text-white py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-amber uppercase tracking-[0.18em] text-xs font-semibold mb-3">Attorney tools</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Life expectancy calculator</h1>
          <p className="text-neutral-200 max-w-2xl">
            Look up remaining life expectancy by age, sex, and population group from the CDC United
            States Life Tables, 2023 (National Vital Statistics Reports, Vol. 74, No. 6). Built for
            either side of a matter; the figures are period-life-table population averages, not a
            prediction for any individual.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Inputs */}
          <div className="space-y-7">
            <fieldset className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <legend className="px-2 font-serif text-lg font-bold text-navy">Individual profile</legend>

              {/* Age entry mode */}
              <div className="mt-2">
                <span className="block text-sm font-medium text-navy mb-1">Age entry</span>
                <div className="inline-flex rounded-lg border border-neutral-300 overflow-hidden">
                  {(["exact", "dob"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAgeMode(m)}
                      aria-pressed={ageMode === m}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        ageMode === m ? "bg-navy text-white" : "bg-white text-navy hover:bg-neutral-50"
                      }`}
                    >
                      {m === "exact" ? "Exact age" : "Date of birth"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                {ageMode === "exact" ? (
                  <label className="block sm:col-span-2">
                    <span className="block text-sm font-medium text-navy mb-1">Age (years)</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={120}
                      step="0.1"
                      value={ageStr}
                      aria-invalid={ageMode === "exact" && !!ageResolution.error}
                      onChange={(e) => setAgeStr(e.target.value)}
                      className={`w-full rounded-lg border px-3.5 py-2 text-sm font-mono outline-none focus:ring-2 ${
                        ageMode === "exact" && ageResolution.error
                          ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                          : "border-neutral-300 focus:border-teal focus:ring-teal/20"
                      }`}
                    />
                    <span className="block text-xs text-neutral-500 mt-1">
                      Decimals are allowed (for example 65.5). Ages of 100 or more use the highest
                      published row.
                    </span>
                  </label>
                ) : (
                  <>
                    <label className="block">
                      <span className="block text-sm font-medium text-navy mb-1">Date of birth</span>
                      <input
                        type="date"
                        value={dob}
                        max={asof || undefined}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm font-mono outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-medium text-navy mb-1">As-of date</span>
                      <input
                        type="date"
                        value={asof}
                        onChange={(e) => setAsof(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm font-mono outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                      />
                    </label>
                  </>
                )}

                <label className="block">
                  <span className="block text-sm font-medium text-navy mb-1">Sex</span>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as LifeTableSex)}
                    className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                  >
                    {SEXES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-sm font-medium text-navy mb-1">Population group</span>
                  <select
                    value={group}
                    onChange={(e) => setGroup(e.target.value as LifeTableGroup)}
                    className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                  >
                    {GROUPS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                Sex and population group select the matching CDC source table. The 2023 period life
                tables cover the total population and five race and Hispanic-origin groups; they are one input to a
                case-specific analysis, not a substitute for one.
              </p>
            </fieldset>
          </div>

          {/* Results rail */}
          <aside className="lg:sticky lg:top-24 h-fit space-y-5">
            <div className="rounded-2xl border border-navy/15 bg-white p-6 shadow-md" aria-live="polite">
              <div className="flex items-center gap-2 text-teal mb-3">
                <HeartPulse className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em]">Remaining life expectancy</span>
              </div>
              {result ? (
                <>
                  <p className="font-mono text-3xl font-bold text-navy leading-tight">
                    {result.remainingLE.toFixed(1)} <span className="text-lg font-normal text-neutral-500">years</span>
                  </p>
                  {/* Beyond the table's final row (100+) an "expected age" from
                      input + capped LE would be misleading, so it is omitted. */}
                  {!result.capped && (
                    <p className="text-sm text-neutral-600 mt-2 mb-4">
                      Expected age reached{" "}
                      <span className="font-mono font-semibold text-navy">{result.expectedAgeAtEnd.toFixed(1)}</span>
                    </p>
                  )}
                  <div className={`border-t border-neutral-200 pt-4${result.capped ? " mt-4" : ""}`}>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      Under the 2023 period life table, a {SEX_NOUN[sex]} at age {displayAge}
                      {groupClause} has, on average, about {result.remainingLE.toFixed(1)} more years of
                      life{result.capped
                        ? ""
                        : `, reaching about age ${result.expectedAgeAtEnd.toFixed(1)}`}. This is a
                      statistical average across the population, not a prediction for any individual.
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500 mt-4">
                    Source: CDC/NCHS, {EDITION.title} ({EDITION.series}), Table {result.table}.
                  </p>
                </>
              ) : (
                <div className="flex items-start gap-2 text-sm text-neutral-600" role="alert">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-dark shrink-0" />
                  <p>{ageResolution.error ?? "Enter an age to see the estimate."}</p>
                </div>
              )}
              <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                Educational tool only - not an expert opinion, report, or testimony. Life
                expectancies are period-life-table population averages from CDC data and are not a
                prediction for any individual; a case-specific analysis prepared for either plaintiff
                or defense may differ materially.
              </p>
            </div>

            {/* Lead capture - soft CTA (no emailed report; see the /api/life-expectancy note) */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md">
              {gateStatus === "sent" ? (
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-forest/10 text-forest shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-navy mb-1">Thanks - we have your details</h3>
                    <p className="text-sm text-neutral-600">Our team will follow up.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-amber-dark mb-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em]">Have a matter</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-navy mb-2">Working a case where this is a factor?</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Send your details and our team will follow up about how KWVRS can support the
                    vocational, life care, or economic analysis.
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
                      disabled={gateStatus === "submitting"}
                      className="kw-magnetic w-full inline-flex items-center justify-center gap-2 bg-amber-dark hover:bg-amber disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      {gateStatus === "submitting" ? "Sending..." : "Send my details"}
                    </button>
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
