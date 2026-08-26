import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const serviceLinks = [
  { name: "Vocational Expert", href: "/services/vocational-expert" },
  { name: "Life Care Planning", href: "/services/life-care-planning" },
  { name: "Forensic Economics", href: "/services/forensic-economics" },
  { name: "Household Services", href: "/services/loss-of-household-services" },
  { name: "Matrimonial", href: "/services/matrimonial" },
  { name: "Standard of Care", href: "/services/standard-of-care" },
  { name: "Expert Testimony", href: "/services/expert-witness-testimony" },
];

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
  { name: "Attorney Tools", href: "/tools", external: false },
  { name: "Jurisdictions", href: "/jurisdictions", external: false },
  { name: "FAQ", href: "/resources/faq", external: false },
  { name: "Forms", href: "/forms", external: false },
];

const companyLinks = [
  { name: "About", href: "/about", external: false },
  { name: "Team", href: "/team", external: false },
  { name: "Retain KWVRS", href: "/intake", external: false },
  { name: "Schedule Consultation", href: "/schedule-consultation", external: false },
  { name: "Contact", href: "/contact", external: false },
  { name: "Kincaid Wolstein Economics", href: "https://kweconomics.com", external: true },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Company Info */}
          <div>
            <Link to="/">
              <img src="/images/logo.svg" alt="Kincaid Wolstein" className="h-8 brightness-0 invert" />
            </Link>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              Kincaid Wolstein Vocational and Rehabilitation Services - providing expert forensic vocational and economic analysis.
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Hackensack, NJ (HQ)</span>
              </div>
              <a href="tel:+12013430700" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>(201) 343-0700</span>
              </a>
              <a href="tel:+18042824199" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>(804) 282-4199</span>
              </a>
              <a href="mailto:info@kwvrs.com" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span>info@kwvrs.com</span>
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
              {companyLinks.map((link) =>
                link.external ? (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xs text-neutral-400">
              &copy; {currentYear} Kincaid Wolstein Vocational and Rehabilitation Services. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/privacy" className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors">
                Terms of Service
              </Link>
              {/* Discreet internal entry point. A plain <a> (NOT react-router <Link>)
                  so the browser makes a real request to /admin, which the site server
                  302-redirects to the workflow admin dashboard; a <Link> would client-
                  route and hit the SPA 404. nofollow keeps crawlers out. */}
              <a
                href="/admin"
                target="_blank"
                rel="nofollow noopener"
                className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Staff Login
              </a>
              {/* Same plain-<a> mechanics as Staff Login: /training is a server
                  302 to the password-gated Clio Training Hub. */}
              <a
                href="/training"
                target="_blank"
                rel="nofollow noopener"
                className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Training
              </a>
              <p className="text-xs text-neutral-400">
                CRC &middot; CLCP &middot; ABVE &middot; CVE
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
