import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  AlertCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Download,
  ArrowRight,
  Info,
} from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_URL } from "@/lib/schema";
import ContactCTA from "@/components/ContactCTA";
import { loadHsvData, type HsvData } from "@/lib/hsv-data";
import {
  usd,
  usd0,
  num,
  vintageLine,
  fallbackLabel,
  sampleNote,
  METHOD_LABELS,
} from "../../lib/household-services/report-shared.mjs";
import { buildCsv } from "../../lib/household-services/report-csv.mjs";
import type { ValuationResult, HsvArea, MethodTotal } from "../../lib/household-services/store.mjs";

// Concise dropdown labels (the exports carry longer prose for the reports).
const DIM_LABELS: Record<string, Record<string, string>> = {
  sex: { male: "Male", female: "Female" },
  employment: { full_time: "Employed full time", part_time: "Employed part time", not_employed: "Not employed" },
  married: { married: "Married or partnered", single: "Single" },
  youngest_child: { none: "No child under 18", under_6: "Youngest child under 6", "6-17": "Youngest child 6 to 17" },
};

interface FormState {
  sex: string;
  age: string;
  employment: string;
  married: string;
  youngest_child: string;
  state: string;
  metro: string;
  wageStat: string;
}

const DEFAULTS: FormState = {
  sex: "female",
  age: "40",
  employment: "full_time",
  married: "married",
  youngest_child: "under_6",
  state: "US",
  metro: "",
  wageStat: "mean",
};

function readForm(): FormState {
  if (typeof window === "undefined") return DEFAULTS;
  const p = new URLSearchParams(window.location.search);
  const out = { ...DEFAULTS };
  (Object.keys(DEFAULTS) as (keyof FormState)[]).forEach((k) => {
    const v = p.get(k);
    if (v !== null) out[k] = v;
  });
  return out;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function HouseholdServicesValuator() {
  usePageMeta({
    title: "Household Services Valuator | KWVRS",
    description:
      "Estimate the annual replacement value of a person's unpaid household services from public ATUS time-use data and BLS OEWS wages, with Word, Excel, and CSV exhibits.",
    canonical: `${ORG_URL}/tools/household-services`,
  });

  const [data, setData] = useState<HsvData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState<FormState>(readForm);
  const [busy, setBusy] = useState<"" | "docx" | "xlsx" | "csv">("");
  const [downloadError, setDownloadError] = useState(false);

  useEffect(() => {
    let alive = true;
    loadHsvData()
      .then((d) => alive && setData(d))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

  // Mirror every input into the URL query string (replaceState = no history spam).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams();
    (Object.keys(form) as (keyof FormState)[]).forEach((k) => {
      if (form[k] !== "") p.set(k, form[k]);
    });
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [form]);

  const store = data?.store ?? null;
  const set = (k: keyof FormState, v: string) =>
    setForm((f) => (k === "state" ? { ...f, state: v, metro: "" } : { ...f, [k]: v }));

  const areaData = useMemo(() => {
    const states: HsvArea[] = [];
    const metrosByPostal = new Map<string, HsvArea[]>();
    if (store) {
      for (const a of store.areas()) {
        if (a.type === "state") states.push(a);
        else if (a.type === "msa" && a.state) {
          const list = metrosByPostal.get(a.state) ?? [];
          list.push(a);
          metrosByPostal.set(a.state, list);
        }
      }
    }
    return { states, metrosByPostal };
  }, [store]);

  const postal = form.state.startsWith("S:") ? form.state.slice(2) : null;
  const metros = postal ? areaData.metrosByPostal.get(postal) ?? [] : [];
  const ageBand = store ? store.ageToBand(form.age) : null;
  const ageInvalid = store !== null && ageBand === null;

  const result = useMemo<ValuationResult | null>(() => {
    if (!store) return null;
    const band = store.ageToBand(form.age);
    if (!band) return null;
    try {
      return store.lookup({
        sex: form.sex,
        age: form.age,
        age_band: band,
        employment: form.employment,
        married: form.married,
        youngest_child: form.youngest_child,
        state: form.state,
        metro: form.metro,
        area: form.metro || form.state,
        wageStat: form.wageStat === "median" ? "median" : "mean",
      });
    } catch {
      return null;
    }
  }, [store, form]);

  async function handleDownload(kind: "docx" | "xlsx" | "csv") {
    if (!result) return;
    setBusy(kind);
    setDownloadError(false);
    try {
      const slug = result.cell.key.replace(/\|/g, "_");
      if (kind === "csv") {
        triggerDownload(new Blob([buildCsv(result)], { type: "text/csv;charset=utf-8" }), `household-services-${slug}.csv`);
      } else if (kind === "docx") {
        const { buildDocxBlob } = await import("../../lib/household-services/report-docx.mjs");
        triggerDownload(await buildDocxBlob(result), "household-services-valuation.docx");
      } else {
        const { buildXlsxBlob } = await import("../../lib/household-services/report-xlsx.mjs");
        triggerDownload(await buildXlsxBlob(result), "household-services-valuation.xlsx");
      }
    } catch {
      setDownloadError(true);
    } finally {
      setBusy("");
    }
  }

  const note = result ? sampleNote(result) : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-navy text-white py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-amber uppercase tracking-[0.18em] text-xs font-semibold mb-3">Attorney tools</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Household services valuator</h1>
          <p className="text-neutral-200 max-w-2xl">
            A planning-level estimate of the annual replacement value of a person's unpaid household
            services, built from public American Time Use Survey (ATUS) hours and BLS Occupational
            Employment and Wage Statistics (OEWS) wages. Adjust the profile and the figures update instantly.
          </p>
          <Link
            to="/tools/household-services/methodology"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-light mt-4 hover:text-amber"
          >
            How this is calculated <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          {loadError ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <h2 className="font-serif text-xl font-bold text-navy mb-1">Data did not load</h2>
                <p className="text-sm text-neutral-600">
                  We could not load the wage and time-use data. Please refresh the page to try again.
                </p>
              </div>
            </div>
          ) : !data ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-sm text-neutral-500">
              Loading wage and time-use data...
            </div>
          ) : data.atusMissing || !store ? (
            <div className="rounded-2xl border border-amber/40 bg-white p-8 shadow-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-dark mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-navy mb-1">Time-use data is being updated</h2>
                  <p className="text-sm text-neutral-600 mb-3">
                    Check back shortly. The BLS OEWS wage tables ({data.oews.meta.vintage}) are loaded, but the
                    ATUS time-use hours are still being refreshed, so the calculator is paused.
                  </p>
                  <Link
                    to="/tools/household-services/methodology"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-amber-dark"
                  >
                    Read the methodology <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ------- Inputs ------- */}
              <div className="grid gap-6 lg:grid-cols-2">
                <fieldset className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <legend className="px-2 font-serif text-lg font-bold text-navy">Individual profile</legend>
                  <div className="grid gap-4 sm:grid-cols-2 mt-2">
                    <Select label="Sex" value={form.sex} onChange={(v) => set("sex", v)} options={store.dimensions.sex} labels={DIM_LABELS.sex} />
                    <label className="block">
                      <span className="block text-sm font-medium text-navy mb-1">Age</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={18}
                        max={110}
                        value={form.age}
                        aria-invalid={ageInvalid}
                        onChange={(e) => set("age", e.target.value)}
                        className={`w-full rounded-lg border px-3.5 py-2 text-sm font-mono outline-none focus:ring-2 ${
                          ageInvalid
                            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border-neutral-300 focus:border-amber focus:ring-amber/30"
                        }`}
                      />
                      <span className="block text-xs mt-1 text-neutral-500">
                        {ageInvalid ? "Enter an age of 18 or older." : ageBand ? `Age band ${ageBand}` : " "}
                      </span>
                    </label>
                    <Select label="Employment" value={form.employment} onChange={(v) => set("employment", v)} options={store.dimensions.employment} labels={DIM_LABELS.employment} />
                    <Select label="Marital status" value={form.married} onChange={(v) => set("married", v)} options={store.dimensions.married} labels={DIM_LABELS.married} />
                    <Select label="Youngest child" value={form.youngest_child} onChange={(v) => set("youngest_child", v)} options={store.dimensions.youngest_child} labels={DIM_LABELS.youngest_child} className="sm:col-span-2" />
                  </div>
                </fieldset>

                <fieldset className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <legend className="px-2 font-serif text-lg font-bold text-navy">Geography and wage</legend>
                  <div className="grid gap-4 sm:grid-cols-2 mt-2">
                    <label className="block">
                      <span className="block text-sm font-medium text-navy mb-1">State</span>
                      <select
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-amber focus:ring-2 focus:ring-amber/30"
                      >
                        <option value="US">United States (national)</option>
                        {areaData.states.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-sm font-medium text-navy mb-1">Metro area (optional)</span>
                      <select
                        value={form.metro}
                        disabled={metros.length === 0}
                        onChange={(e) => set("metro", e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-amber focus:ring-2 focus:ring-amber/30 disabled:bg-neutral-100 disabled:text-neutral-400"
                      >
                        <option value="">{metros.length === 0 ? "No metro areas" : "Entire state"}</option>
                        {metros.map((m) => (
                          <option key={m.code} value={m.code}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="sm:col-span-2">
                      <span className="block text-sm font-medium text-navy mb-1">Wage statistic</span>
                      <div className="inline-flex rounded-lg border border-neutral-300 overflow-hidden">
                        {(["mean", "median"] as const).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => set("wageStat", w)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                              form.wageStat === w ? "bg-navy text-white" : "bg-white text-navy hover:bg-neutral-50"
                            }`}
                          >
                            {w === "mean" ? "Mean" : "Median"}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-neutral-500 mt-2">
                        Mean is the average hourly wage; median is the 50th-percentile wage. Where a wage is
                        suppressed for the chosen area, the tool falls back from metro to state to national.
                      </p>
                    </div>
                  </div>
                </fieldset>
              </div>

              {/* ------- Results ------- */}
              {result ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-500">
                    <Calculator className="w-4 h-4 text-navy" />
                    <span className="font-medium text-navy">{vintageLine(result)}</span>
                  </div>

                  {/* Hours + wages table */}
                  <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <table className="w-full border-collapse text-sm">
                      <caption className="sr-only">Hours per day and replacement wages by household activity</caption>
                      <thead>
                        <tr className="bg-navy text-white">
                          <th className="text-left font-semibold px-3 py-2.5">Activity</th>
                          <th className="text-right font-semibold px-3 py-2.5">Hrs/day</th>
                          <th className="text-right font-semibold px-3 py-2.5">SE</th>
                          <th className="text-left font-semibold px-3 py-2.5">Matched occupation (SOC)</th>
                          <th className="text-right font-semibold px-3 py-2.5">Hourly wage</th>
                          <th className="text-right font-semibold px-3 py-2.5">Daily</th>
                          <th className="text-right font-semibold px-3 py-2.5">Annual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.valuation.perActivity.map((a) => (
                          <tr key={a.key} className="border-t border-neutral-200 align-top">
                            <td className="px-3 py-2 text-navy">{a.label}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums">{num(a.hoursDay)}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-neutral-500">{num(a.se)}</td>
                            <td className="px-3 py-2 text-neutral-700">
                              {a.socTitle} <span className="text-neutral-400">({a.soc})</span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              {a.wage == null ? (
                                <span className="text-neutral-400">suppressed</span>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className="font-mono tabular-nums text-navy">{usd(a.wage)}</span>
                                  <span className="text-xs text-neutral-500">{a.wageArea}</span>
                                  {a.wageFallback && (
                                    <span className="mt-0.5 inline-block text-[11px] font-semibold text-amber-dark bg-amber/10 px-1.5 py-0.5 rounded">
                                      fallback: {fallbackLabel(a.wageFallback)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-navy">{usd(a.daily)}</td>
                            <td className="px-3 py-2 text-right font-mono tabular-nums text-navy">{usd(a.annual)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-navy/30 bg-neutral-50 font-semibold text-navy">
                          <td className="px-3 py-2.5">Occupation-specific total</td>
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums">{num(result.valuation.totals.hoursDay)}</td>
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums">{usd(result.valuation.totals.occupation.daily)}</td>
                          <td className="px-3 py-2.5 text-right font-mono tabular-nums">{usd(result.valuation.totals.occupation.annual)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Totals - three methods */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <TotalCard
                      title={METHOD_LABELS.occupation}
                      total={result.valuation.totals.occupation}
                      description="Each activity priced at its own matched occupation wage."
                    />
                    <TotalCard
                      title={METHOD_LABELS.generalist}
                      total={result.valuation.totals.generalist}
                      rate={result.valuation.totals.generalist.rate}
                      description="All hours priced at the single generalist housekeeping wage."
                    />
                    <TotalCard
                      title={METHOD_LABELS.composite}
                      total={result.valuation.totals.composite}
                      rate={result.valuation.totals.composite.rate}
                      description="Hours-weighted blended rate applied across all activities."
                    />
                  </div>

                  {/* Sample size + rollup/thin warning */}
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600">
                      {note?.base} (total {num(result.valuation.totals.hoursDay)} hours per day across household
                      activities).
                    </p>
                    {note?.warning && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber-dark">
                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{note.warning}</span>
                      </div>
                    )}
                  </div>

                  {/* Downloads */}
                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <h2 className="font-serif text-lg font-bold text-navy mb-1">Download this valuation</h2>
                    <p className="text-sm text-neutral-600 mb-4">
                      Generated in your browser - nothing is uploaded. Word and Excel exhibits carry the full
                      inputs, hours, wages, methodology, and citations; the Excel workbook keeps live formulas.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleDownload("docx")}
                        disabled={busy !== ""}
                        className="inline-flex items-center gap-2 bg-amber-dark hover:bg-amber disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-4 h-4" /> {busy === "docx" ? "Preparing..." : "Word exhibit (.docx)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload("xlsx")}
                        disabled={busy !== ""}
                        className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <FileSpreadsheet className="w-4 h-4" /> {busy === "xlsx" ? "Preparing..." : "Excel workbook (.xlsx)"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload("csv")}
                        disabled={busy !== ""}
                        className="inline-flex items-center gap-2 border border-neutral-300 hover:border-navy text-navy font-semibold px-4 py-2.5 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" /> {busy === "csv" ? "Preparing..." : "CSV"}
                      </button>
                    </div>
                    {downloadError && (
                      <p className="text-sm text-red-600 mt-3">
                        The download could not be generated. Please try again.
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Informational planning tool only - not an expert opinion, report, or testimony. Estimates
                    apply the replacement-cost method to average time-use hours; a retained analysis prepared for
                    either plaintiff or defense may differ materially with case facts and jurisdiction.
                  </p>
                </div>
              ) : ageInvalid ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex items-start gap-2 text-sm text-neutral-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-dark shrink-0" />
                  <p>Enter an age of 18 or older to see the valuation.</p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <ContactCTA />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labels: Record<string, string>;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-sm font-medium text-navy mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-amber focus:ring-2 focus:ring-amber/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TotalCard({
  title,
  total,
  rate,
  description,
}: {
  title: string;
  total: MethodTotal;
  rate?: number;
  description: string;
}) {
  return (
    <div className="kw-lift rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-dark mb-2">{title}</p>
      <p className="font-mono text-2xl font-bold text-navy leading-tight">{usd0(total.annual)}<span className="text-sm font-normal text-neutral-500"> / yr</span></p>
      <div className="mt-3 space-y-1 text-sm text-neutral-600">
        <div className="flex justify-between gap-3">
          <span>Daily</span>
          <span className="font-mono tabular-nums text-navy">{usd(total.daily)}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span>Weekly</span>
          <span className="font-mono tabular-nums text-navy">{usd(total.weekly)}</span>
        </div>
        {rate !== undefined && (
          <div className="flex justify-between gap-3">
            <span>Rate</span>
            <span className="font-mono tabular-nums text-navy">{usd(rate)}/hr</span>
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-500 mt-3">{description}</p>
    </div>
  );
}
