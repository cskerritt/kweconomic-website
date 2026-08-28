import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { pillarServices } from "@/data/services";
import { ORG_NAME } from "@/lib/brand";
// The "we also provide" sentence names the work, not the heading label
// ("wrongful death analysis", "fraud and tracing analysis").
import { workPhrase } from "@/lib/service-prose.mjs";
import {
  hasServiceCityPages,
  nearestCities,
  serviceCityCities,
  serviceCityServices,
  serviceHasCityPages,
} from "@/lib/geo-links";
import LocationCard from "@/components/LocationCard";
import Reveal from "@/components/Reveal";
import { serviceMotion } from "@/lib/service-motion";
import type { City, Service, State } from "@/types";

/**
 * Cross-links for /services/:service/:state/:city pages: the sibling services
 * available in the same city, and the same service in the state's other
 * service-city pages (ordered by distance). Renders nothing for cities outside
 * the service-city window, where those sibling pages do not exist.
 */
export default function ServiceCityCrossLinks({
  service,
  state,
  city,
  cities,
}: {
  service: Service;
  state: State;
  city: City;
  cities: City[];
}) {
  if (!hasServiceCityPages(cities, city.slug)) return null;

  const motion = serviceMotion(service.slug);
  const siblingServices = serviceCityServices(pillarServices()).filter(
    (s) => s.slug !== service.slug,
  );
  // Guard against a service with no city tier (a non-pillar cross-sell): the
  // route still mounts ServiceStateCity for a hand-typed URL, and linking
  // /services/<service>/<state>/<other-city> would target pages that are
  // neither prerendered nor in the sitemap.
  const otherCities = serviceHasCityPages(service.slug)
    ? nearestCities(
        serviceCityCities(cities),
        city.slug,
        serviceCityCities(cities).length,
      )
    : [];

  return (
    <>
      {siblingServices.length > 0 && (
        <Reveal as="section" variant={motion.reveal}>
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">
            Other Services in {city.name}
          </h2>
          <p className="text-neutral-600 mb-5">
            {ORG_NAME} offers complementary economic damages services for {city.name} cases.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {siblingServices.map((s) => (
              <Link
                key={s.slug}
                to={`/services/${s.slug}/${state.slug}/${city.slug}`}
                className="kw-lift group flex items-center justify-between bg-white rounded-lg border border-neutral-200 px-5 py-4 hover:border-teal hover:shadow-md"
              >
                <span className="font-medium text-navy group-hover:text-teal transition-colors">
                  {s.shortName} in {city.name}
                </span>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-teal group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {otherCities.length > 0 && (
        <Reveal as="section" variant={motion.reveal}>
          <h2 className="font-serif text-2xl font-bold text-navy mb-2">
            {service.shortName} in Nearby {state.name} Cities
          </h2>
          <p className="text-neutral-600 mb-5">
            We also provide {workPhrase(service.shortName)} in these {state.name} communities.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {otherCities.map((c) => (
              <LocationCard
                key={c.slug}
                name={`${service.shortName} in ${c.name}`}
                href={`/services/${service.slug}/${state.slug}/${c.slug}`}
                subtitle={c.county}
              />
            ))}
          </div>
        </Reveal>
      )}
    </>
  );
}
