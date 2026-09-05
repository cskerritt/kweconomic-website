// Sidebar panel for the geo pages: the economic context a forensic economist
// measures a loss against (population, metropolitan area, and, on metro pages,
// the employers that shape local earnings histories) plus the state's workers'
// compensation forum. Never unemployment rates or wage figures; employer names
// are context for the local earnings picture, not a statement about any party.
//
// On a service x state page the panel is captioned for the pillar's own work
// through the shared geo prose (economicContextCaption): a valuation reads
// the local market only through normalization and comparables, a tracing not
// at all, a matrimonial analysis through actual income. The workers'
// compensation forum, a wage-loss venue, is shown only where a wage loss can
// be the subject (the personal-loss pillars, rebuttal, and the hub pages).

import { economicContextCaption, serviceGeoCategory } from "@/data/geo-prose.mjs";

interface EconomicContextWidgetProps {
  areaName: string;
  population?: number;
  msaName?: string;
  /** Median household income for the area, when the underlying data carries
   * it. The metro data on the site does not, so callers omit it today. */
  medianHouseholdIncome?: number;
  /** Major employers in the area (metro pages only), shown as context. */
  employers?: string[];
  /** The state's workers' compensation forum. */
  compensationForum?: string;
  /** Service.shortName of the pillar the surrounding page describes (the
   * service x state pages). Selects the caption that says how, if at all,
   * local data enters that pillar's number, and drops the workers'
   * compensation forum on the commercial and family-financial pillars, where
   * a wage-loss forum has no bearing. The hub pages omit it and keep the
   * shared personal-loss framing. */
  serviceShortName?: string;
}

export default function EconomicContextWidget({
  areaName,
  population,
  msaName,
  medianHouseholdIncome,
  employers = [],
  compensationForum,
  serviceShortName,
}: EconomicContextWidgetProps) {
  const hasPopulation = typeof population === "number" && population > 0;
  const hasIncome = typeof medianHouseholdIncome === "number" && medianHouseholdIncome > 0;
  const category = serviceGeoCategory(serviceShortName);
  const forum = category === "personal-loss" || category === "rebuttal" ? compensationForum : undefined;
  if (!hasPopulation && !msaName && !hasIncome && employers.length === 0 && !forum) return null;
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-navy mb-4">{areaName} Economic Context</h3>
      <dl className="space-y-3 text-sm">
        {hasPopulation && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Population</dt>
            <dd className="font-mono font-medium text-navy">{population.toLocaleString("en-US")}</dd>
          </div>
        )}
        {msaName && (
          <div>
            <dt className="text-neutral-500">Metropolitan area</dt>
            <dd className="font-medium text-navy mt-0.5">{msaName}</dd>
          </div>
        )}
        {hasIncome && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Median household income</dt>
            <dd className="font-mono font-medium text-navy">
              {medianHouseholdIncome.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
            </dd>
          </div>
        )}
        {forum && (
          <div>
            <dt className="text-neutral-500">Workers' compensation forum</dt>
            <dd className="font-medium text-navy mt-0.5">{forum}</dd>
          </div>
        )}
      </dl>
      {employers.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">Major employers</h4>
          <ul className="space-y-1.5 text-sm text-neutral-600">
            {employers.slice(0, 5).map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <p className="text-xs text-neutral-500 mt-2">
            Context for the earnings histories common to {areaName}; not a statement about any party.
          </p>
        </div>
      )}
      <p className="text-xs text-neutral-500 mt-4">{economicContextCaption(serviceShortName, areaName)}</p>
    </div>
  );
}
