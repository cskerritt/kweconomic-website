import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import MobileNav from "./MobileNav";
import { ORG_NAME, ORG_PHONE, ORG_SHORT } from "@/lib/brand";

// Static list of the 10 LCP pillar slugs (Task 5 replaces this with pillarServices()).
const serviceLinks = [
  { name: "All Services", href: "/services" },
  { name: "Life Care Planning", href: "/services/life-care-planning" },
  { name: "Pediatric Life Care Planning", href: "/services/pediatric-life-care-planning" },
  { name: "Catastrophic Injury LCPs", href: "/services/catastrophic-injury-planning" },
  { name: "Medical Cost Projections", href: "/services/medical-cost-projection" },
  { name: "Workers' Comp Life Care Plans", href: "/services/workers-compensation-lcp" },
  { name: "Plan Updates", href: "/services/plan-update-and-review" },
  { name: "Plan Rebuttal & Critique", href: "/services/life-care-plan-rebuttal" },
  { name: "Medicare Set-Asides", href: "/services/medicare-set-aside" },
  { name: "Elder & Long-Term Care Planning", href: "/services/elder-and-long-term-care-planning" },
  { name: "Expert Testimony", href: "/services/expert-witness-testimony" },
];

const resourceLinks = [
  { name: "Knowledge Center", href: "/knowledge" },
  { name: "Guides", href: "/guides" },
  { name: "White Papers", href: "/white-papers" },
  { name: "Insights", href: "/insights" },
  { name: "Case Types", href: "/case-types" },
  { name: "Credentials", href: "/credentials" },
  { name: "Methods", href: "/methods" },
  { name: "Comparisons", href: "/compare" },
  { name: "Attorney Resources", href: "/attorneys" },
  { name: "Life Expectancy Tool", href: "/tools/life-expectancy" },
  { name: "Jurisdictions", href: "/jurisdictions" },
  { name: "FAQ", href: "/resources/faq" },
];

/** Human-readable phone, e.g. "+1-201-343-0700" -> "(201) 343-0700". */
function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, "").replace(/^1/, "");
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
const PHONE_HREF = `tel:${ORG_PHONE.replace(/-/g, "")}`;
const PHONE_DISPLAY = formatPhone(ORG_PHONE);

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
                className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-teal transition-colors"
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
            <img src="/images/logo.svg" alt={ORG_NAME} className="h-10 brightness-0 invert" />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/about" className="text-sm hover:text-amber transition-colors">
              About
            </Link>
            <Dropdown label="Services" links={serviceLinks} />
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
              className="bg-teal hover:bg-teal-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
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

      {/* Mobile sticky bottom CTA - persistent phone + quote button on small screens */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-2 border-t border-navy-dark bg-navy text-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <a
          href={PHONE_HREF}
          className="flex items-center justify-center gap-2 py-3 text-sm font-medium hover:bg-navy-light transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call
        </a>
        <Link
          to="/contact"
          className="flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-teal text-white hover:bg-teal-dark transition-colors"
        >
          Get a Quote
        </Link>
      </div>
    </header>
  );
}
