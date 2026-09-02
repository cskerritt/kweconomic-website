import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, ORG_PHONE, ORG_PHONE_DISPLAY, SITE_URL, telHref } from "@/lib/brand";

// The routes a lost visitor most often wants. The dedicated 404 shell
// (scripts/prerender.mjs) prints the same list so the no-JS body is useful too.
const HELPFUL_LINKS = [
  { label: "Services", href: "/services", blurb: "Lost earnings, wrongful death, household services, and business damages analyses" },
  { label: "Case types", href: "/case-types", blurb: "Economic damages by case type, from personal injury to commercial disputes" },
  { label: "Contact", href: "/contact", blurb: "Reach the team; response within one business day" },
];

const LINK = "text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

export default function NotFound() {
  // PageMeta requires a canonical; /404 is the conventional self-reference for
  // an error page and the noindex directive keeps it out of the index.
  usePageMeta({
    title: `Page Not Found | ${ORG_NAME}`,
    description: "The page you are looking for could not be found.",
    canonical: `${SITE_URL}/404`,
    robots: "noindex,follow",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-amber-dark text-xs font-semibold uppercase tracking-[0.18em] mb-3">Error 404</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-navy mb-4">Page not found</h1>
      <p className="text-neutral-600 text-lg mb-8 max-w-xl">
        The address may have changed, or the page may never have existed. These pages cover
        most of what attorneys come here for.
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mb-8 text-left">
        {HELPFUL_LINKS.map((l) => (
          <li key={l.href}>
            <Link
              to={l.href}
              className="kw-lift group block h-full rounded-lg border border-neutral-200 bg-white p-5 hover:border-amber hover:shadow-md"
            >
              <span className="block font-serif text-lg font-bold text-navy group-hover:text-amber-dark transition-colors">
                {l.label}
              </span>
              <span className="block text-sm text-neutral-600 mt-1">{l.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-neutral-600 mb-8">
        Or call{" "}
        <a href={telHref(ORG_PHONE)} className={`inline-flex items-center gap-1 ${LINK}`}>
          <Phone className="w-4 h-4" aria-hidden="true" />
          {ORG_PHONE_DISPLAY}
        </a>
      </p>
      <Link
        to="/"
        className="bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
