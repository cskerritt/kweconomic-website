import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/**
 * Allow-listed inline-link pass for plain-text editorial bodies.
 *
 * Converts ONLY the exact marker syntax `[[/route|anchor text]]` into an
 * internal <Link> (which renders an <a href="/route">). Everything else is left
 * as literal text. Output is an array of React nodes (strings + elements) - it
 * never uses dangerouslySetInnerHTML, so authored copy cannot inject markup.
 *
 * A route is accepted only if it matches ^/[a-z0-9/-]*$ (leading slash;
 * lowercase alphanumerics, slashes and hyphens). That rejects protocol-relative
 * targets (`//evil.com` has a dot), schemes (`javascript:` has a colon), and
 * uppercase/underscore/space, so no external or unsafe destination can slip
 * through. A marker whose route fails validation is emitted as its literal text.
 */

// Marker: [[ /route | anchor ]] - route has no '|' or ']'; anchor has no ']'.
const MARKER = /\[\[(\/[^|\]]*)\|([^\]]+)\]\]/g;
const ALLOWED_ROUTE = /^\/[a-z0-9/-]*$/;

export function isAllowedRoute(route: string): boolean {
  return ALLOWED_ROUTE.test(route);
}

export function renderTextWithLinks(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  MARKER.lastIndex = 0;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = MARKER.exec(text)) !== null) {
    const [full, route, anchor] = m;
    if (m.index > last) out.push(text.slice(last, m.index));
    if (isAllowedRoute(route)) {
      out.push(
        <Link
          key={`kw-link-${key++}`}
          to={route}
          className="text-teal underline underline-offset-2 decoration-teal/40 hover:decoration-teal"
        >
          {anchor}
        </Link>,
      );
    } else {
      // Rejected route: keep the literal marker text, never a link.
      out.push(full);
    }
    last = m.index + full.length;
  }

  if (last < text.length) out.push(text.slice(last));
  if (out.length === 0) out.push(text); // empty string -> passthrough
  return out;
}
