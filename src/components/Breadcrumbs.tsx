import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-600 mb-6">
      <ol className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <li key={item.url} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-neutral-900">{item.name}</span>
            ) : (
              <Link to={item.url} className="hover:text-navy underline-offset-2 hover:underline">{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
