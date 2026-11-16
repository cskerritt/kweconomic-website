import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";

interface LocationCardProps {
  name: string;
  href: string;
  subtitle?: string;
  stat?: { label: string; value: string };
}

export default function LocationCard({ name, href, subtitle, stat }: LocationCardProps) {
  return (
    <Link to={href} className="kw-lift group flex items-center justify-between bg-white rounded-xl border border-neutral-300 px-5 py-4 hover:shadow-raised">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-amber shrink-0" />
        <div>
          <span className="font-medium text-navy group-hover:text-amber-dark transition-colors">{name}</span>
          {subtitle && <span className="block text-xs text-neutral-500">{subtitle}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {stat && (
          <div className="text-right hidden sm:block">
            <span className="text-xs text-neutral-500">{stat.label}</span>
            <span className="block text-sm font-mono font-medium text-navy">{stat.value}</span>
          </div>
        )}
        <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-amber-dark transition-colors" />
      </div>
    </Link>
  );
}
