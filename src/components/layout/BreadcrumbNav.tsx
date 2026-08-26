import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1 text-sm text-neutral-500">
        <li><Link to="/" className="hover:text-teal">Home</Link></li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {item.href ? (
              <Link to={item.href} className="hover:text-teal">{item.label}</Link>
            ) : (
              <span className="text-neutral-900 font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
