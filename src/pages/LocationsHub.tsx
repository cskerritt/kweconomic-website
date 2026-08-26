import { Link } from "react-router-dom";
import { states } from "@/data/states";
import { usePageMeta } from "@/hooks/use-page-meta";
import LocationCard from "@/components/LocationCard";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";

const REGION_LABELS: Record<string, string> = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest: "Midwest",
  west: "West",
  territory: "Territories & DC",
};

const REGION_ORDER = ["northeast", "southeast", "midwest", "west", "territory"];

export default function LocationsHub() {
  usePageMeta({
    title: "Locations | KWVRS - Serving All 50 States",
    description:
      "KWVRS provides vocational expert services, life care planning, and forensic economics in all 50 states, DC, and U.S. territories. Find your state to learn more.",
    canonical: "https://kwvrs.com/locations",
  });

  const stateOnly = states.filter((s) => s.type === "state");

  const byRegion = REGION_ORDER.map((region) => ({
    region,
    label: REGION_LABELS[region],
    items: states.filter((s) => s.region === region),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Where We Work
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Nationwide Coverage
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              KWVRS accepts cases in all 50 states, the District of Columbia, and U.S. territories.
              Our experts understand jurisdiction-specific rules, labor markets, and court standards
              wherever your case is filed.
            </p>
          </div>
        </div>
      </section>

      {/* State Abbreviation Quick Grid */}
      <section className="py-12 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-bold text-navy mb-6 text-center">
            Select a State
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {stateOnly.map((state) => (
              <Link
                key={state.slug}
                to={`/locations/${state.slug}`}
                className="bg-white rounded-lg border border-neutral-200 px-3 py-4 text-center text-sm font-semibold text-navy hover:border-teal hover:text-teal hover:shadow-sm transition-all"
              >
                {state.abbreviation}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* States by Region */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {byRegion.map(({ region, label, items }, ri) => (
            <Reveal key={region} delay={ri * 80}>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mb-6 pb-2 border-b border-neutral-200">
                {label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((state) => (
                  <LocationCard
                    key={state.slug}
                    name={state.name}
                    href={`/locations/${state.slug}`}
                    subtitle={`${state.abbreviation} - Capital: ${state.capital}`}
                  />
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
