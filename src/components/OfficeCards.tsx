import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { OFFICES, formatPhone, telHref } from "@/lib/brand";
import { states } from "@/data/states";

// Each office's page on this site: the city page where the site has one, the state page otherwise.
const OFFICE_PAGES: Record<string, { path: string; label: string }> = {
  NJ: { path: "/locations/new-jersey/hackensack", label: "Hackensack page" },
  VA: { path: "/locations/virginia/richmond", label: "Richmond page" },
  RI: { path: "/locations/rhode-island", label: "Rhode Island page" },
};

/**
 * The three offices at the top of /locations (Chris, 2026-11-25: keep the three offices in view, the rest of the
 * country on the map), one card each from the OFFICES records in lib/brand, so the cards, the footer and the
 * LocalBusiness nodes never disagree. Every number is a tel: link.
 */
export default function OfficeCards() {
  return (
    <section aria-labelledby="offices-heading" className="py-12 md:py-16 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="offices-heading" className="font-serif text-3xl md:text-4xl font-bold text-navy mb-8">
          Offices
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {OFFICES.map((office, i) => {
            const stateLabel = states.find((s) => s.abbreviation === office.addressRegion)?.name ?? office.addressRegion;
            const page = OFFICE_PAGES[office.addressRegion];
            // A street line only when it is one (a record may hold a city name or nothing there).
            const street = office.streetAddress && /\d/.test(office.streetAddress) ? office.streetAddress : undefined;
            return (
              <div key={office.id} className="rounded-xl border border-neutral-200 p-6">
                <h3 className="font-serif text-lg font-bold leading-snug text-navy mb-3">
                  {office.addressLocality}, {stateLabel} {i === 0 ? "headquarters" : "office"}
                </h3>
                <p className="flex items-start gap-2 text-neutral-700">
                  <MapPin className="w-5 h-5 text-amber shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    {street ? `${street}, ` : ""}
                    {office.addressLocality}, {office.addressRegion}
                    {street ? ` ${office.postalCode}` : ""}
                  </span>
                </p>
                <a href={telHref(office.telephone)} className="mt-2 flex items-center gap-2 font-medium text-neutral-700 hover:text-amber-dark">
                  <Phone className="w-5 h-5 text-amber shrink-0" aria-hidden="true" />
                  {formatPhone(office.telephone)}
                </a>
                {page && (
                  <Link to={page.path} className="kw-link mt-3 inline-block">
                    {page.label}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
