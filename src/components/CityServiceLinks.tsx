import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";
import { hasServiceCityPages, serviceCityServices } from "@/lib/geo-links";
import type { City, State } from "@/types";

const EXCLUDED_SERVICES = new Set(["standard-of-care", "expert-witness-testimony"]);

/**
 * "Services in {city}" link block for /locations/:state/:city pages.
 *
 * Cities inside the service-city window link every co-located
 * /services/<service>/<state>/<city> page (plus the state-level expert
 * disclosure page, which has no city tier). Other cities keep the core
 * state-level service links.
 */
export default function CityServiceLinks({
  state,
  city,
  cities,
}: {
  state: State;
  city: City;
  cities: City[];
}) {
  const hasCityServicePages = hasServiceCityPages(cities, city.slug);

  const links = hasCityServicePages
    ? [
        ...serviceCityServices(services).map((service) => ({
          service,
          href: `/services/${service.slug}/${state.slug}/${city.slug}`,
        })),
        ...services
          .filter((service) => service.slug === "expert-disclosure")
          .map((service) => ({
            service,
            href: `/services/${service.slug}/${state.slug}`,
          })),
      ]
    : services
        .filter((service) => !EXCLUDED_SERVICES.has(service.slug))
        .map((service) => ({
          service,
          href: `/services/${service.slug}/${state.slug}`,
        }));

  return (
    <section>
      <h2 className="font-serif text-2xl font-bold text-navy mb-6">
        Services in {city.name}
      </h2>
      <div className="space-y-3">
        {links.map(({ service, href }) => (
          <Link
            key={service.slug}
            to={href}
            className="group flex items-center justify-between bg-white rounded-xl border border-neutral-200 px-6 py-5 hover:border-teal hover:shadow-md transition-all"
          >
            <div>
              <span className="font-semibold text-navy group-hover:text-teal transition-colors">
                {service.name}
              </span>
              <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">
                {service.description}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-neutral-500 group-hover:text-teal transition-colors shrink-0 ml-4" />
          </Link>
        ))}
      </div>
    </section>
  );
}
