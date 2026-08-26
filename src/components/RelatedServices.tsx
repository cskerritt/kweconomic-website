import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { pillarServices } from "@/data/services";

interface RelatedServicesProps {
  /** Case types relevant to the current page - used to find matching services */
  caseTypes: string[];
  /** State slug for linking to service-state pages */
  stateSlug: string;
}

// Testimony is a mode of every engagement, not a sibling "related" service.
const EXCLUDED = new Set(["expert-witness-testimony"]);

export default function RelatedServices({ caseTypes, stateSlug }: RelatedServicesProps) {
  // Find services that share at least one case type with the provided list
  const caseTypeSet = new Set(caseTypes);
  const matched = pillarServices()
    .filter((s) => !EXCLUDED.has(s.slug))
    .filter((s) => s.caseTypes.some((ct) => caseTypeSet.has(ct)))
    .slice(0, 4);

  if (matched.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-bold text-navy mb-4">Related Services</h2>
      <p className="text-neutral-600 text-sm mb-6">
        Kincaid Wolstein Vocational and Rehabilitation Services provides the following services for
        cases in this area. Select a service to learn more.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {matched.map((service) => (
          <Link
            key={service.slug}
            to={`/services/${service.slug}/${stateSlug}`}
            className="group flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-5 py-4 hover:border-teal hover:shadow-md transition-all"
          >
            <div>
              <span className="font-semibold text-navy text-sm group-hover:text-teal transition-colors">
                {service.shortName ?? service.name}
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {service.caseTypes
                  .filter((ct) => caseTypeSet.has(ct))
                  .slice(0, 2)
                  .map((ct) => (
                    <span
                      key={ct}
                      className="text-xs text-teal bg-teal/10 px-2 py-0.5 rounded-full"
                    >
                      {ct}
                    </span>
                  ))}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-teal transition-colors shrink-0 ml-3" />
          </Link>
        ))}
      </div>
    </section>
  );
}
