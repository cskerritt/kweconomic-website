import { Link } from "react-router-dom";
import { ArrowRight, Briefcase } from "lucide-react";
import { ICONS } from "@/lib/icons";
import { useTilt } from "@/hooks/use-pointer-fx";

interface ServiceCardProps {
  name: string;
  shortName: string;
  description: string;
  icon: string;
  href: string;
}

export default function ServiceCard({ name, shortName, description, icon, href }: ServiceCardProps) {
  const IconComponent = ICONS[icon] ?? Briefcase;
  const tiltRef = useTilt<HTMLAnchorElement>();
  return (
    <Link
      ref={tiltRef}
      to={href}
      className="kw-tilt group relative block bg-white rounded-xl border border-neutral-200 p-6 hover:border-teal hover:shadow-xl transition-shadow"
    >
      <span className="kw-tilt-glow" aria-hidden="true" />
      <div className="relative z-[2] flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-teal/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
          <IconComponent className="w-6 h-6 text-teal" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-semibold text-navy group-hover:text-teal transition-colors">{shortName}</h3>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{description}</p>
          {/* The visible tail stays short; the full service name is part of
              the link text for assistive technology and crawlers, so the
              anchor is never a bare "Learn More". */}
          <span className="inline-flex items-center gap-1 text-sm text-teal font-medium mt-3 group-hover:gap-2 transition-all">
            Learn more<span className="sr-only"> about {name}</span> <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
