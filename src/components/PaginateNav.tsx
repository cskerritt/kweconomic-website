import { Link } from "react-router-dom";

export interface PaginateItem {
  label: string;
  href: string;
}

interface Props {
  prev?: PaginateItem;
  next?: PaginateItem;
  backLabel?: string;
  backHref?: string;
}

export default function PaginateNav({ prev, next, backLabel = "Home", backHref = "/" }: Props) {
  return (
    <nav
      aria-label="Pagination"
      className="mt-12 border-t border-neutral-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm"
    >
      <Link to={backHref} className="text-neutral-600 hover:text-navy underline-offset-2 hover:underline">
        &larr; {backLabel}
      </Link>
      <div className="flex gap-4">
        {prev ? (
          <Link to={prev.href} className="kw-link">
            &larr; Prev: {prev.label}
          </Link>
        ) : (
          <span className="text-neutral-600">No previous</span>
        )}
        {next ? (
          <Link to={next.href} className="kw-link">
            Next: {next.label} &rarr;
          </Link>
        ) : (
          <span className="text-neutral-600">No next</span>
        )}
      </div>
    </nav>
  );
}
