import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import {
  ORG_NAME,
  ORG_EMAIL,
  ORG_PHONE,
  ORG_PHONE_VA,
  ORG_PHONE_DISPLAY,
  ORG_PHONE_VA_DISPLAY,
  ORG_CITY,
  ORG_STATE,
  VOC_SITE_URL,
  LCP_SITE_URL,
  telHref,
} from "@/lib/brand";

// Static list of the 11 pillar service links. Kept static for render speed;
// src/components/layout/nav.pillars.test.mjs pins the hrefs to pillarServices() order.
const serviceLinks = [
  { name: "Lost Earnings & Earning Capacity", href: "/services/lost-earnings-and-earning-capacity" },
  { name: "Wrongful Death Economic Loss", href: "/services/wrongful-death-economic-loss" },
  { name: "Personal Injury Economic Damages", href: "/services/personal-injury-economic-damages" },
  { name: "Household Services Valuation", href: "/services/household-services-valuation" },
  { name: "Life Care Plan Costing", href: "/services/life-care-plan-cost-projection" },
  { name: "Employment & Wage-Loss Damages", href: "/services/employment-and-wage-loss-damages" },
  { name: "Business Valuation", href: "/services/business-valuation" },
  { name: "Lost Profits & Commercial Damages", href: "/services/lost-profits-and-commercial-damages" },
  { name: "Fraud & Asset Tracing", href: "/services/fraud-and-asset-tracing" },
  { name: "Divorce & Marital Financial Analysis", href: "/services/divorce-and-marital-financial-analysis" },
  { name: "Expert Rebuttal & Report Review", href: "/services/expert-rebuttal-and-report-review" },
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

// Sister practices in the Kincaid Wolstein family (external, new tab). The
// visible label is the host of the link so the domains are never spelled here.
const hostOf = (url: string) => new URL(url).host;
const familyLinks = [
  { name: hostOf(VOC_SITE_URL), blurb: "Vocational practice", href: VOC_SITE_URL },
  { name: hostOf(LCP_SITE_URL), blurb: "Life care plans", href: LCP_SITE_URL },
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
              <img src="/images/logo.svg" alt={ORG_NAME} width={600} height={257} className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              {ORG_NAME} - forensic economists preparing court-ready lost earnings, wrongful
              death, household services, business valuation, and forensic accounting analyses
              for plaintiff and defense counsel.
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{ORG_CITY}, {ORG_STATE} (HQ)</span>
              </div>
              <a href={telHref(ORG_PHONE)} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{ORG_PHONE_DISPLAY}</span>
              </a>
              <a href={telHref(ORG_PHONE_VA)} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4 shrink-0" />
                <span>{ORG_PHONE_VA_DISPLAY}</span>
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

          {/* Column 6: KW family (sister sites) */}
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
                Forensic Economics &middot; Business Valuation &middot; Forensic Accounting
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
