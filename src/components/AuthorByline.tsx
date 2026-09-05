import { Link } from "react-router-dom";
import { team } from "@/data/team";
import { ORG_NAME } from "@/lib/brand";

interface AuthorBylineProps {
  /** Team member slug. Unset renders the "<ORG_NAME> Editorial Team" byline (schema author = the organization). */
  slug?: string;
  /** ISO date first published. */
  datePublished?: string;
  /** ISO date last reviewed or updated; shown only when it differs from datePublished. */
  dateModified?: string;
}

/**
 * "By <name>, <title> · Published <date> · Reviewed <date>".
 *
 * The visible role ("By") matches the structured data, which names the same
 * person as the Article `author`. The display name is the member's name, which
 * already carries the academic credentials that belong on an economics byline
 * ("Christopher Skerritt, M.Ed., MBA"), plus the job title. The
 * rehabilitation-counseling, life-care-plan, and set-aside designations listed
 * under `credentials` in team.ts stay on the /team profile (hasCredential,
 * credential list) and are never appended here. renderBylineHtml in
 * scripts/prerender.mjs must mirror this markup for the static shells.
 *
 * "Reviewed" is a claim about a named person, so only a named byline carries
 * it; the editorial-team byline labels the same date "Updated", the date of
 * the last copy revision (site audit 2026-09-05, C02: only reviewed work
 * receives a review date).
 */
export default function AuthorByline({ slug, datePublished, dateModified }: AuthorBylineProps) {
  const member = slug ? team.find((m) => m.slug === slug) : undefined;
  const displayName = member ? `${member.name}, ${member.title}` : `${ORG_NAME} Editorial Team`;
  const linkTo = member ? `/team/${member.slug}` : "/team";
  const reviewed = dateModified && dateModified !== datePublished ? dateModified : undefined;
  const dateLabel = member ? "Reviewed" : "Updated";
  return (
    <div className="text-sm text-neutral-600 mb-6">
      <span>By </span>
      <Link to={linkTo} className="text-navy hover:underline">
        {displayName}
      </Link>
      {datePublished && (
        <>
          <span> · Published </span>
          <time dateTime={datePublished}>{datePublished}</time>
        </>
      )}
      {reviewed && (
        <>
          <span> · {dateLabel} </span>
          <time dateTime={reviewed}>{reviewed}</time>
        </>
      )}
    </div>
  );
}
