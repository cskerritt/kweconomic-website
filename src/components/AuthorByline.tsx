import { Link } from "react-router-dom";
import { team } from "@/data/team";

export default function AuthorByline({ slug, dateModified }: { slug?: string; dateModified?: string }) {
  const member = slug ? team.find((m) => m.slug === slug) : undefined;
  const displayName = member?.name ?? "KWVRS Editorial Team";
  const linkTo = member ? `/team/${member.slug}` : "/team";
  // Show top 3 credentials inline for E-E-A-T signal (e.g. "Dan Wolstein, Ph.D., CRC, ABVE/D").
  // Filter credentials already present in the displayed name (the team data
  // names often already include the primary credential like "Ph.D." or "M.D.").
  const filtered = member?.credentials?.filter((c) => !displayName.includes(c)) ?? [];
  const credentialList = filtered.length ? `, ${filtered.slice(0, 3).join(", ")}` : "";
  return (
    <div className="text-sm text-neutral-600 mb-6">
      <span>Reviewed by </span>
      <Link to={linkTo} className="text-navy hover:underline">
        {displayName}
        {credentialList}
      </Link>
      {dateModified && (
        <>
          <span> · Last updated </span>
          <time dateTime={dateModified}>{dateModified}</time>
        </>
      )}
    </div>
  );
}
