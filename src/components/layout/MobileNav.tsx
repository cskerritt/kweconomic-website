import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

interface MobileNavProps {
  serviceLinks: { name: string; href: string }[];
  resourceLinks: { name: string; href: string }[];
  phoneHref: string;
  phoneDisplay: string;
  onClose: () => void;
}

// One 44px row of 16px text, its ring drawn inside: the menu scrolls and would clip an outset one.
const ROW = "kw-ring-inset flex min-h-11 items-center -mx-3 px-3 rounded-lg text-base";

export default function MobileNav({ serviceLinks, resourceLinks, phoneHref, phoneDisplay, onClose }: MobileNavProps) {
  const row = (href: string, name: string, color: string) => (
    <Link key={href} to={href} onClick={onClose} className={`${ROW} ${color}`}>{name}</Link>
  );
  // Services and Resources are closed groups, so the first screen holds every row, the number and the button.
  const group = (label: string, links: { name: string; href: string }[]) => (
    <details className="kw-disclosure">
      <summary className={`${ROW} font-semibold text-white`}>{label}</summary>
      <div className="pl-4">{links.map((link) => row(link.href, link.name, "text-neutral-300 hover:text-white"))}</div>
    </details>
  );
  return (
    <nav
      id="mobile-nav"
      aria-label="Mobile"
      className="kw-pop lg:hidden bg-navy-dark border-t border-white/10 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain"
    >
      {/* pb clears the fixed bottom CTA bar so the last items stay reachable */}
      <div className="px-4 py-4 pb-24">
        {row("/about", "About", "text-white")}
        {group("Services", serviceLinks)}
        {row("/case-types", "Case Types", "text-white")}
        {row("/locations", "Locations", "text-white")}
        {row("/team", "Team", "text-white")}
        {group("Resources", resourceLinks)}
        {row("/contact", "Contact", "text-white")}
        <div className="mt-2 pt-4 border-t border-white/10 flex flex-col gap-3">
          <a href={phoneHref} className="flex min-h-11 items-center gap-2 text-base text-neutral-300"><Phone className="w-4 h-4" />{phoneDisplay}</a>
          <Link to="/schedule-consultation" onClick={onClose} className="kw-press rounded-lg min-h-11 bg-amber-dark text-white font-semibold hover:bg-amber-darker active:bg-amber-darker inline-flex items-center justify-center px-4 py-2 text-base text-center">Schedule Consultation</Link>
        </div>
      </div>
    </nav>
  );
}
