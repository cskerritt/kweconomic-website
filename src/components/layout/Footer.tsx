import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import {
  ORG_NAME,
  ORG_EMAIL,
  OFFICES,
  formatPhone,
  VOC_SITE_URL,
  VOC_SITE_NAME,
  LCP_SITE_URL,
  LCP_SITE_NAME,
  telHref,
} from "@/lib/brand";

// Static list of the 13 pillar service links. Kept static for render speed;
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
  { name: "Transfer Pricing Expert Witness", href: "/services/transfer-pricing-expert-witness" },
  { name: "Intellectual Property Damages", href: "/services/intellectual-property-damages" },
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
  { name: "About", href: "/about", external: false },
  { name: "Team", href: "/team", external: false },
  { name: "Contact", href: "/contact", external: false },
  { name: "Schedule Consultation", href: "/schedule-consultation", external: false },
  { name: "Privacy", href: "/privacy", external: false },
  { name: "Terms", href: "/terms", external: false },
  // Sister practices: named links at the end of Company, opening in a new tab -
  // the same placement and label style the vocational site uses (Chris, 2026-11-17).
  { name: VOC_SITE_NAME, href: VOC_SITE_URL, external: true },
  { name: LCP_SITE_NAME, href: LCP_SITE_URL, external: true },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-dark text-white max-lg:pb-13">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-10">
          {/* Column 1: Company Info */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/">
              <img src="/images/logo.svg" alt={ORG_NAME} width={600} height={257} className="h-8 w-auto brightness-0 invert" />
            </Link>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              {ORG_NAME} - forensic economists preparing court-ready lost earnings, wrongful
              death, household services, business valuation, and forensic accounting analyses
              for plaintiff and defense counsel.
            </p>
            <div className="mt-5 space-y-2">
              {/* Each office's city before its number; cities come from OFFICES in lib/brand. */}
              {OFFICES.map((office, i) => (
                <a key={office.id} href={telHref(office.telephone)} className="group flex items-start gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <span className="block text-neutral-300 group-hover:text-white">
                      {office.addressLocality}, {office.addressRegion}{i === 0 ? " (HQ)" : ""}
                    </span>
                    {formatPhone(office.telephone)}
                  </span>
                </a>
              ))}
              <a href={`mailto:${ORG_EMAIL}`} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{ORG_EMAIL}</span>
              </a>
            </div>
            {/* LinkedIn as a labeled outline-on-navy button under the contact details (2026-11-16): the same placement
                and recipe on all three Kincaid Wolstein sites, each linking the firm's one company page. */}
            <a
              href="https://www.linkedin.com/company/kwvrs"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Kincaid Wolstein on LinkedIn (opens in a new tab)"
              className="kw-press mt-6 inline-flex min-h-11 items-center gap-2.5 rounded-lg border border-white/30 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {/* LinkedIn's "in" mark (Simple Icons, CC0); lucide-react 1.x ships no brand icons. */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 text-amber-light" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Follow us on LinkedIn
            </a>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="kw-label text-white">Services</h3>
            <ul className="mt-4 space-y-2 pointer-coarse:space-y-0">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors pointer-coarse:block pointer-coarse:py-3">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/services" className="text-sm text-neutral-400 hover:text-white transition-colors pointer-coarse:block pointer-coarse:py-3">
                  All services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Locations */}
          <div>
            <h3 className="kw-label text-white">Locations</h3>
            <ul className="mt-4 space-y-2 pointer-coarse:space-y-0">
              {locationLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors pointer-coarse:block pointer-coarse:py-3">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/locations" className="text-sm text-amber-light hover:text-white transition-colors font-medium pointer-coarse:block pointer-coarse:py-3">
                  View All Locations &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div>
            <h3 className="kw-label text-white">Resources</h3>
            <ul className="mt-4 space-y-2 pointer-coarse:space-y-0">
              {resourceLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors pointer-coarse:block pointer-coarse:py-3">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Company */}
          <div>
            <h3 className="kw-label text-white">Company</h3>
            <ul className="mt-4 space-y-2 pointer-coarse:space-y-0">
              {companyLinks.map((link) =>
                link.external ? (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 hover:text-white transition-colors pointer-coarse:block pointer-coarse:py-3"
                    >
                      {link.name}
                    </a>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-neutral-400 hover:text-white transition-colors pointer-coarse:block pointer-coarse:py-3">
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
              &copy; <span suppressHydrationWarning>{currentYear}</span> {ORG_NAME}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/privacy" className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors pointer-coarse:py-3.5">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors pointer-coarse:py-3.5">
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
