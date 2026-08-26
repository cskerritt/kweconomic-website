import type { StateLaborData, MetroLaborData } from "@/types";
import { LABOR_SOURCES } from "@/data/labor/labor-sources";

interface LaborDataWidgetProps { data: StateLaborData | MetroLaborData; areaName: string; }

export default function LaborDataWidget({ data, areaName }: LaborDataWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-navy mb-4">{areaName} Labor Market</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-neutral-50 rounded-lg p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">Unemployment Rate</span>
          <span className="block font-mono text-2xl font-bold text-navy mt-1">{data.unemploymentRate}%</span>
        </div>
        <div className="bg-neutral-50 rounded-lg p-4">
          <span className="text-xs text-neutral-500 uppercase tracking-wider">Median Hourly Wage</span>
          <span className="block font-mono text-2xl font-bold text-navy mt-1">${data.medianHourlyWage.toFixed(2)}</span>
        </div>
        {"medianHouseholdIncome" in data && (
          <div className="bg-neutral-50 rounded-lg p-4 col-span-2">
            <span className="text-xs text-neutral-500 uppercase tracking-wider">Median Household Income</span>
            <span className="block font-mono text-2xl font-bold text-navy mt-1">${data.medianHouseholdIncome.toLocaleString("en-US")}</span>
          </div>
        )}
      </div>
      {data.topIndustries.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">Top Industries</h4>
          <ul className="space-y-2">
            {data.topIndustries.slice(0, 5).map((ind) => (
              <li key={ind.name} className="flex justify-between text-sm text-neutral-600">
                <span>{ind.name}</span>
                <span className="font-mono text-neutral-500">{ind.employment.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="text-xs text-neutral-500 mt-4 space-y-1">
        <p>
          Unemployment, median hourly wage, and industry employment: {LABOR_SOURCES.bls.agency}{" "}
          ({LABOR_SOURCES.bls.programs.unemployment}; {LABOR_SOURCES.bls.programs.wages};{" "}
          {LABOR_SOURCES.bls.programs.industries}), {LABOR_SOURCES.bls.year}.
        </p>
        {"medianHouseholdIncome" in data && (
          <p>
            Median household income: {LABOR_SOURCES.householdIncome.agency},{" "}
            {LABOR_SOURCES.householdIncome.program}, {LABOR_SOURCES.householdIncome.vintage}.
          </p>
        )}
      </div>
    </div>
  );
}
