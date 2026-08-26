import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

interface MobileNavProps {
  serviceLinks: { name: string; href: string }[];
  resourceLinks: { name: string; href: string }[];
  phoneHref: string;
  phoneDisplay: string;
  onClose: () => void;
}

export default function MobileNav({ serviceLinks, resourceLinks, phoneHref, phoneDisplay, onClose }: MobileNavProps) {
  return (
    <nav
      id="mobile-nav"
      aria-label="Mobile"
      className="lg:hidden bg-navy-dark border-t border-white/10 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain"
    >
      {/* pb clears the fixed bottom CTA bar so the last items stay reachable */}
      <div className="px-4 py-4 pb-24 space-y-2">
        <Link to="/about" onClick={onClose} className="block py-2 text-sm text-neutral-300 hover:text-white">About</Link>
        <div className="py-2">
          <Link to="/services" onClick={onClose} className="block text-sm font-medium text-white mb-2">Services</Link>
          <div className="pl-4 space-y-1">
            {serviceLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={onClose} className="block py-2 text-sm text-neutral-400 hover:text-white">{link.name}</Link>
            ))}
          </div>
        </div>
        <Link to="/locations" onClick={onClose} className="block py-2 text-sm text-neutral-300 hover:text-white">Locations</Link>
        <Link to="/team" onClick={onClose} className="block py-2 text-sm text-neutral-300 hover:text-white">Team</Link>
        <div className="py-2">
          <p className="block text-sm font-medium text-white mb-2">Resources</p>
          <div className="pl-4 space-y-1">
            {resourceLinks.map((link) => (
              <Link key={link.href} to={link.href} onClick={onClose} className="block py-2 text-sm text-neutral-400 hover:text-white">{link.name}</Link>
            ))}
          </div>
        </div>
        <Link to="/contact" onClick={onClose} className="block py-2 text-sm text-neutral-300 hover:text-white">Contact</Link>
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
          <a href={phoneHref} className="flex items-center gap-2 text-sm text-neutral-300"><Phone className="w-4 h-4" />{phoneDisplay}</a>
          <Link to="/schedule-consultation" onClick={onClose} className="bg-amber-dark text-white text-sm font-medium px-4 py-2 rounded-lg text-center">Schedule Consultation</Link>
        </div>
      </div>
    </nav>
  );
}
