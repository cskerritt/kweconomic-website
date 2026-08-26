// Sidebar panel for the geo pages: the care context a life care planner
// prices against (population, metro area, the major medical centers that
// anchor specialist care) and the state's compensation / oversight forum.
// Replaces the former labor-market widget: no wages, unemployment, or
// employer lists appear anywhere on geo pages.

interface CareContextWidgetProps {
  areaName: string;
  population?: number;
  msaName?: string;
  /** Health systems / hospitals serving the area (metro pages only). */
  medicalCenters?: string[];
  /** State workers' compensation or health oversight agency. */
  oversightAgency?: string;
}

export default function CareContextWidget({
  areaName,
  population,
  msaName,
  medicalCenters = [],
  oversightAgency,
}: CareContextWidgetProps) {
  const hasPopulation = typeof population === "number" && population > 0;
  if (!hasPopulation && !msaName && medicalCenters.length === 0 && !oversightAgency) return null;
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <h3 className="font-serif text-lg font-semibold text-navy mb-4">{areaName} Care Context</h3>
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
        {oversightAgency && (
          <div>
            <dt className="text-neutral-500">Compensation / oversight forum</dt>
            <dd className="font-medium text-navy mt-0.5">{oversightAgency}</dd>
          </div>
        )}
      </dl>
      {medicalCenters.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-neutral-700 mb-2">Major medical centers</h4>
          <ul className="space-y-1.5 text-sm text-neutral-600">
            {medicalCenters.slice(0, 5).map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-neutral-500 mt-4">
        Plan items are priced from providers serving {areaName}; the provider behind each rate is documented in the plan.
      </p>
    </div>
  );
}
