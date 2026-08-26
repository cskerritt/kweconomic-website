import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { ORG_NAME, ORG_EMAIL, ORG_PHONE, ORG_PHONE_VA, ORG_CITY, ORG_STATE } from "@/lib/brand";

// Static list of the 10 LCP pillar slugs (Task 5 replaces this with pillarServices()).
const serviceLinks = [
  { name: "Life Care Planning", href: "/services/life-care-planning" },
  { name: "Pediatric Life Care Planning", href: "/services/pediatric-life-care-planning" },
  { name: "Catastrophic Injury Plans", href: "/services/catastrophic-injury-planning" },
  { name: "Medical Cost Projections", href: "/services/medical-cost-projection" },
  { name: "Workers' Comp Life Care Plans", href: "/services/workers-compensation-lcp" },
  { name: "Plan Updates", href: "/services/plan-update-and-review" },
  { name: "Plan Rebuttal & Critique", href: "/services/life-care-plan-rebuttal" },
  { name: "Medicare Set-Asides", href: "/services/medicare-set-aside" },
  { name: "Elder & Long-Term Care Planning", href: "/services/elder-and-long-term-care-planning" },
  { name: "Expert Testimony", href: "/services/expert-witness-testimony" },
];

/** Human-readable phone, e.g. "+1-201-343-0700" -> "(201) 343-0700". */
function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, "").replace(/^1/, "");
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
const telHref = (e164: string) => `tel:${e164.replace(/-/g, "")}`;

// Top 8 + a "View all" link so the long-tail state hubs still get a crawl
// path from the footer. Without this, only 8 of 56 state hubs receive
// PageRank from the global footer.
const locationLinks = [
  { name: "New York", href: "/locations/new-york" },
  { name: "New Jersey", href: "/locations/new-jersey" },
  { name: "California", href: "/locations/california" },
  { name: "Texas", href: "/locations/texas" },
  { name: "Florida", href: "/locations/florida" },
  { name: "Pennsylvania", href: "/locations/pennsylvania" },
  { name: "Massachusetts", href: "/locations/massachusetts" },
  { name: "Virginia", href: "/locations/virginia" },
];

const resourceLinks = [
  { name: "Knowledge Center", href: "/knowledge", external: false },
  { name: "Guides", href: "/guides", external: false },
  { name: "White Papers", href: "/white-papers", external: false },
  { name: "Insights", href: "/insights", external: false },
  { name: "Case Types", href: "/case-types", external: false },
  { name: "Case Studies", href: "/case-studies", external: false },
  { name: "Credentials", href: "/credentials", external: false },
  { name: "Methods", href: "/methods", external: false },
  { name: "Comparisons", href: "/compare", external: false },
  { name: "Attorney Resources", href: "/attorneys", external: false },
  { name: "Life Expectancy Tool", href: "/tools/life-expectancy", external: false },
  { name: "Jurisdictions", href: "/jurisdictions", external: false },
  { name: "FAQ", href: "/resources/faq", external: false },
];

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "Team", href: "/team" },
  { name: "Contact", href: "/contact" },
  { name: "Schedule Consultation", href: "/schedule-consultation" },
  { name: "Privacy", href: "/privacy" },
  { name: "Terms", href: "/terms" },
];

// Sister companies in the Kincaid Wolstein family (external, new tab).
const familyLinks = [
  { name: "kwvrs.com", blurb: "Vocational & Economic Experts", href: "https://kwvrs.com" },
  { name: "kweconomics.com", blurb: "Kincaid Wolstein Economics", href: "https://kweconomics.com" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Column 1: Company Info */}
          <div>
            <Link to="/">
              <img src="/images/logo.svg" alt={ORG_NAME} className="h-8 brightness-0 invert" />
            </Link>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              {ORG_NAME} - certified life care planners preparing court-ready life care plans and
              medical cost projections for plaintiff and defense counsel.
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{ORG_CITY}, {ORG_STATE} (HQ)</span>
              </div>
              <a href={telHref(ORG_PHONE)} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{formatPhone(ORG_PHONE)}</span>
              </a>
              <a href={telHref(ORG_PHONE_VA)} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{formatPhone(ORG_PHONE_VA)}</span>
              </a>
              <a href={`mailto:${ORG_EMAIL}`} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{ORG_EMAIL}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Services</h3>
            <ul className="mt-4 space-y-2">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Locations */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Locations</h3>
            <ul className="mt-4 space-y-2">
              {locationLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/locations" className="text-sm text-amber-light hover:text-amber transition-colors font-medium">
                  View All Locations &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 6: Kincaid Wolstein family (sister sites) */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Kincaid Wolstein Family</h3>
            <ul className="mt-4 space-y-3">
              {familyLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    <span className="block font-medium text-neutral-300">{link.name}</span>
                    <span className="block text-xs">{link.blurb}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs text-neutral-400">
              &copy; {currentYear} {ORG_NAME}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/privacy" className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors">
                Terms of Service
              </Link>
              <p className="text-xs text-neutral-400">
                CLCP &middot; CRC
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
