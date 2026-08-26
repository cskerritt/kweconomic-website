import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_URL } from "@/lib/schema";
import { loadHsvData, type HsvData } from "@/lib/hsv-data";
import { yearsLabel } from "../../lib/household-services/report-shared.mjs";
import type { HsvAtusDoc } from "../../lib/household-services/store.mjs";

function prettify(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function activityLabel(key: string, atus: HsvAtusDoc | null): string {
  return atus?.activities.find((a) => a.key === key)?.label ?? prettify(key);
}

const POOLED_YEARS_FALLBACK = [2019, 2021, 2022, 2023, 2024];

export default function HouseholdServicesMethodology() {
  usePageMeta({
    title: "Household Services Valuator - Methodology | KWVRS",
    description:
      "How the KW Household Services Valuator estimates the replacement value of unpaid household work from public ATUS time-use data and BLS OEWS wages.",
    canonical: `${ORG_URL}/tools/household-services/methodology`,
  });

  const [data, setData] = useState<HsvData | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let alive = true;
    loadHsvData()
      .then((d) => alive && setData(d))
      .catch(() => alive && setLoadError(true));
    return () => {
      alive = false;
    };
  }, []);

  const atus = data?.atus ?? null;
  const oews = data?.oews ?? null;
  const crosswalk = data?.crosswalk ?? null;
  const years = yearsLabel(atus?.meta.years ?? POOLED_YEARS_FALLBACK);
  const floor = atus?.meta.sample_floor ?? 50;
  const vintage = oews?.meta.vintage ?? "the current release";
  const activityKeys = crosswalk ? Object.keys(crosswalk.activities) : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      <section className="bg-navy text-white py-14 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-amber uppercase tracking-[0.18em] text-xs font-semibold mb-3">Methodology</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">How the household services valuator works</h1>
          <p className="text-neutral-200 max-w-2xl">
            The tool applies the replacement-cost method to two public data sources: the American Time
            Use Survey (ATUS) for how much time people spend on unpaid household work, and the BLS
            Occupational Employment and Wage Statistics (OEWS) program for what that work would cost to
            hire out.
          </p>
          <Link
            to="/tools/household-services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-light mt-4 hover:text-amber"
          >
            <ArrowLeft className="w-4 h-4" /> Back to the valuator
          </Link>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {loadError && (
          <p className="text-sm text-neutral-600">
            The underlying data could not be loaded, so the code and occupation tables below may be
            incomplete. The methodology narrative still applies.
          </p>
        )}

        {/* 1. Overview */}
        <Section title="Overview">
          <p>
            Household services are the unpaid tasks a person performs to run a household: cooking,
            cleaning, laundry, home and vehicle upkeep, yard work, household management, shopping, child
            and adult care, pet care, and related travel. The <em>replacement-cost</em> method values that
            work at what it would cost to pay someone else to do it.
          </p>
          <p>
            For a demographic group matching the individual, the tool multiplies average hours per day on
            each activity by the corresponding occupation's hourly wage, then annualizes. It reports three
            valuation methods side by side and shows the sample size, geography, and any wage fallback used.
            It is a planning tool that summarizes public averages; it is not a substitute for an
            individualized expert opinion, and it does not model household-specific facts, secondary
            activities, or lost-productivity (opportunity-cost) framings.
          </p>
        </Section>

        {/* 2. Time-use data */}
        <Section title="Time-use data (ATUS)">
          <p>
            Hours come from the American Time Use Survey, accessed through IPUMS. Estimates pool multiple
            survey years ({years}) to stabilize the demographic cells and are weighted with the ATUS final
            person weight (WT06) so they represent the U.S. adult population rather than the raw sample.
          </p>
          <p>
            The year 2020 is excluded because ATUS field collection was suspended for part of that year,
            leaving it unrepresentative of a normal year. The frame is adults age 18 and older.
          </p>
          <p className="text-sm text-neutral-500">
            {atus?.meta.citation
              ? `Citation: ${atus.meta.citation}`
              : "Citation: American Time Use Survey Data Extract Builder. IPUMS, University of Minnesota. https://doi.org/10.18128/D060.V3.2"}
          </p>
        </Section>

        {/* 3. Activity categories (data-driven; pending until ATUS lands) */}
        <Section title="Activity categories and ATUS codes">
          {atus ? (
            <>
              <p>
                Each activity category aggregates a fixed set of six-digit ATUS activity codes. Only primary
                (main) activity time is counted.
              </p>
              <Table
                head={["Activity", "ATUS activity codes"]}
                rows={atus.activities.map((a) => [a.label, (a.codes ?? []).join(", ") || "-"])}
                firstColClass="font-medium text-navy align-top"
                mono={[false, true]}
              />
            </>
          ) : (
            <PendingNote>
              The detailed six-digit ATUS activity-code mappings appear here once the time-use dataset
              finishes processing. Until then, the wage and occupation tables below reflect the committed
              OEWS data.
            </PendingNote>
          )}
        </Section>

        {/* 4. Demographic cells */}
        <Section title="Demographic cells, floors, and roll-ups">
          <p>
            Hours are estimated for cells defined by five dimensions: sex, age band (18-24, 25-34, 35-44,
            45-54, 55-64, 65-74, 75+), employment status (full time, part time, not employed), marital
            status (married or partnered vs. single), and the age of the youngest own household child (none,
            under 6, or 6 to 17).
          </p>
          <p>
            A cell is flagged as <em>thin</em> when its unweighted sample is below the floor of {floor} time
            diaries. When the exact cell is thin, the tool rolls up to a broader group: first collapsing the
            youngest-child dimension, then, if still thin, collapsing marital status as well. Every result
            discloses the sample size and whether a roll-up was applied.
          </p>
          <p>
            For each activity the cell carries a weighted mean and a weighted standard error, approximated as
            the square root of [ sum of w<sub>i</sub><sup>2</sup> (x<sub>i</sub> - mean)<sup>2</sup> ] divided
            by [ sum of w<sub>i</sub> ]<sup>2</sup>. This is a documented approximation; using the ATUS
            successive-difference replicate weights for design-consistent standard errors is a planned
            refinement.
          </p>
        </Section>

        {/* 5. Replacement wages */}
        <Section title="Replacement wages (OEWS)">
          <p>
            Wages come from the BLS Occupational Employment and Wage Statistics program ({vintage}). The tool
            offers the hourly mean or the hourly median (50th percentile). Wages are available at three
            geography levels: national, state, and metropolitan area.
          </p>
          <p>
            OEWS suppresses some cells for confidentiality or reliability. When the wage for the selected
            geography and occupation is suppressed, the tool falls back along a documented chain - metro to
            state to national - and labels every fallback it uses, so the reader can see exactly which
            geography priced each activity.
          </p>
        </Section>

        {/* 6. Occupation matching (data-driven from crosswalk) */}
        <Section title="Occupation matching">
          <p>
            Each activity is priced with one or more Standard Occupational Classification (SOC) codes. Where an
            activity lists several SOCs, the first with an available (non-suppressed) wage for the chosen
            geography is used. The generalist method prices all hours at a single housekeeping wage
            {crosswalk ? ` (SOC ${crosswalk.generalist})` : ""}.
          </p>
          {crosswalk && (
            <Table
              head={["Activity", "SOC code(s)", "Occupation", "Rationale"]}
              rows={activityKeys.map((key) => {
                const a = crosswalk.activities[key];
                const titles = a.soc
                  .map((s) => oews?.occupations[s]?.title)
                  .filter(Boolean)
                  .join("; ");
                return [activityLabel(key, atus), a.soc.join(", "), titles || "-", a.rationale ?? "-"];
              })}
              firstColClass="font-medium text-navy align-top"
              mono={[false, true, false, false]}
            />
          )}
        </Section>

        {/* 7. Valuation methods */}
        <Section title="Valuation methods">
          <p>Daily figures are annualized as daily times 365.25, and weekly figures as daily times 7. The tool reports three methods:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Occupation-specific:</strong> for each activity, hours times that activity's matched
              occupation wage; the daily total is the sum across activities.
            </li>
            <li>
              <strong>Generalist:</strong> total household hours times a single generalist housekeeping wage.
            </li>
            <li>
              <strong>Composite:</strong> a blended hourly rate equal to the occupation-specific daily total
              divided by total hours, applied to total hours. By construction this equals the occupation-
              specific total; it is shown to make the effective blended rate explicit.
            </li>
          </ol>
        </Section>

        {/* 8. Limitations */}
        <Section title="Limitations">
          <ul className="list-disc pl-5 space-y-2">
            <li>
              This is a replacement-cost estimate (what it would cost to hire the work out), not an
              opportunity-cost estimate (the person's own foregone earnings). The two can differ substantially.
            </li>
            <li>
              Only primary-activity time is counted. Secondary activities - most importantly childcare that
              happens while doing something else - are not included in this version, so care time is
              conservative.
            </li>
            <li>ATUS time diaries are self-reported for a single day, and hours reflect group averages rather than any one household.</li>
            <li>Standard errors use a weighted approximation rather than design-based replicate weights (see above).</li>
            <li>Wages are area averages for an occupation, not the price of any specific hire.</li>
          </ul>
        </Section>

        {/* 9. Citations & reproducibility */}
        <Section title="Citations and reproducibility">
          <p>
            Every figure derives from public data: ATUS {years} (via IPUMS) for hours and BLS OEWS ({vintage})
            for wages. The category definitions, demographic cells, occupation crosswalk, and valuation
            formulas are fixed for a given data vintage, so a result is reproducible from the inputs shown on
            each valuation. The Word and Excel exhibits restate the inputs, hours, wages, methods, and these
            citations; the Excel workbook exposes the arithmetic as live formulas.
          </p>
        </Section>

        <div className="border-t border-neutral-200 pt-6">
          <Link
            to="/tools/household-services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-amber-dark"
          >
            <ArrowLeft className="w-4 h-4" /> Back to the valuator
          </Link>
        </div>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl font-bold text-navy border-b border-neutral-200 pb-2">{title}</h2>
      <div className="space-y-3 text-neutral-700 leading-relaxed">{children}</div>
    </section>
  );
}

function PendingNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-amber-dark">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Table({
  head,
  rows,
  firstColClass,
  mono,
}: {
  head: string[];
  rows: string[][];
  firstColClass?: string;
  mono?: boolean[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-navy text-white">
            {head.map((h) => (
              <th key={h} className="text-left font-semibold px-3 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-neutral-200 align-top">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 ${j === 0 ? firstColClass ?? "" : "text-neutral-700"} ${
                    mono?.[j] ? "font-mono text-xs tabular-nums" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
