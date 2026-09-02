import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import MobileNav from "./MobileNav";
import { ORG_NAME, ORG_PHONE, ORG_PHONE_DISPLAY, ORG_SHORT, telHref } from "@/lib/brand";

// Static list of the 11 pillar service links. Kept static for render speed;
// src/components/layout/nav.pillars.test.mjs pins the hrefs to pillarServices() order.
const serviceLinks = [
  { name: "All Services", href: "/services" },
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

// Resources dropdown (spec section 5). Case Types is a top-level nav item;
// credentials, attorney stages, and jurisdictions stay reachable from the footer.
const resourceLinks = [
  { name: "Guides", href: "/guides" },
  { name: "Compare", href: "/compare" },
  { name: "Methods", href: "/methods" },
  { name: "Knowledge Center", href: "/knowledge" },
  { name: "Insights", href: "/insights" },
  { name: "White Papers", href: "/white-papers" },
  { name: "FAQ", href: "/resources/faq" },
];

const PHONE_HREF = telHref(ORG_PHONE);
const PHONE_DISPLAY = ORG_PHONE_DISPLAY;

function Dropdown({
  label,
  links,
}: {
  label: string;
  links: { name: string; href: string }[];
}) {
  const location = useLocation();
  // Track pathname with the open state so a route change resets `open` during
  // render (not in an effect). See react.dev "Adjusting some state when a
  // prop changes" - replaces the old useEffect/setState route-change pattern.
  const [tracker, setTracker] = useState<{ open: boolean; path: string }>({
    open: false,
    path: location.pathname,
  });
  if (tracker.path !== location.pathname) {
    setTracker({ open: false, path: location.pathname });
  }
  const open = tracker.open;
  const setOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setTracker((cur) => ({
      open: typeof next === "function" ? next(cur.open) : next,
      path: location.pathname,
    }));
  };
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const menuId = `nav-dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`;

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setTracker((cur) => ({ open: false, path: cur.path }));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    // Longer delay so diagonal mouse movement doesn't kill the dropdown
    timeoutRef.current = setTimeout(() => setOpen(false), 300);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm hover:text-amber transition-colors flex items-center gap-1 py-4"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
      >
        {label} <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          {/* Invisible bridge between button and dropdown - prevents close on diagonal mouse */}
          <div className="absolute top-full left-0 w-64 h-3" />
          <div id={menuId} className="absolute top-full left-0 mt-3 w-64 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-amber-dark transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const location = useLocation();
  // Same pattern as Dropdown: track pathname with state so route change resets
  // mobileOpen during render rather than in an effect.
  const [tracker, setTracker] = useState<{ open: boolean; path: string }>({
    open: false,
    path: location.pathname,
  });
  if (tracker.path !== location.pathname) {
    setTracker({ open: false, path: location.pathname });
  }
  const mobileOpen = tracker.open;
  const setMobileOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    setTracker((cur) => ({
      open: typeof next === "function" ? next(cur.open) : next,
      path: location.pathname,
    }));
  };

  // Elevate the sticky header with a shadow once the page is scrolled.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile drawer is open so the (scrollable) menu
  // doesn't scroll the page underneath it.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 bg-navy text-white transition-shadow duration-300 ${
        scrolled ? "shadow-lg shadow-navy-dark/30" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            {/* Intrinsic 600x257 so the header reserves the wordmark's box before
                the file arrives (no layout shift on first paint); w-auto keeps
                the CSS height in charge of the rendered size. */}
            <img
              src="/images/logo.svg"
              alt={ORG_NAME}
              width={600}
              height={257}
              fetchPriority="high"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/about" className="text-sm hover:text-amber transition-colors">
              About
            </Link>
            <Dropdown label="Services" links={serviceLinks} />
            <Link to="/case-types" className="text-sm hover:text-amber transition-colors">
              Case Types
            </Link>
            <Link to="/locations" className="text-sm hover:text-amber transition-colors">
              Locations
            </Link>
            <Link to="/team" className="text-sm hover:text-amber transition-colors">
              Team
            </Link>
            <Dropdown label="Resources" links={resourceLinks} />
            <Link to="/contact" className="text-sm hover:text-amber transition-colors">
              Contact
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <a
              href={PHONE_HREF}
              className="hidden xl:flex items-center gap-2 text-sm text-neutral-300 hover:text-white"
            >
              <Phone className="w-4 h-4" />
              {PHONE_DISPLAY}
            </a>
            <Link
              to="/schedule-consultation"
              className="bg-amber hover:bg-amber-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Schedule Consultation
            </Link>
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <a
              href={PHONE_HREF}
              aria-label={`Call ${ORG_SHORT} at ${PHONE_DISPLAY}`}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-white/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              className="p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <MobileNav
          serviceLinks={serviceLinks}
          resourceLinks={resourceLinks}
          phoneHref={PHONE_HREF}
          phoneDisplay={PHONE_DISPLAY}
          onClose={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sticky bottom CTA - persistent phone + consultation button on
          small screens. Same label and destination as the desktop CTA: the
          practice confirms scope and fee after a conflict check, so the action
          is a consultation request everywhere, never a quote. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-2 border-t border-navy-dark bg-navy text-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <a
          href={PHONE_HREF}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-navy-light transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <Link
          to="/schedule-consultation"
          className="flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-amber text-white hover:bg-amber-dark transition-colors"
        >
          Request a Consultation
        </Link>
      </div>
    </header>
  );
}
