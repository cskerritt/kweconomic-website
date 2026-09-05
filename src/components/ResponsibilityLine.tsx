import { Link } from "react-router-dom";
import { analysisResponsibility } from "@/data/team";

interface ResponsibilityLineProps {
  /** The noun phrase the sentence is about ("Business valuation at KW Economics", "Analyses for Texas matters"). */
  subject: string;
  /** Whether the subject is plural (picks "are ... them" over "is ... it"). */
  plural?: boolean;
  className?: string;
}

/**
 * "<subject> is directed by <name>, <title>, who is available to testify to
 * it." The professional responsible for the page's work, linked to the
 * profile that carries the CV (site audit 2026-09-05, C02). The sentence comes
 * from src/data/team.ts analysisResponsibility(), which scripts/prerender.mjs
 * prints the same way for the static shells. Renders nothing when the roster
 * has no retainable expert.
 */
export default function ResponsibilityLine({ subject, plural = true, className = "text-neutral-700 leading-relaxed" }: ResponsibilityLineProps) {
  const line = analysisResponsibility(subject, plural);
  if (!line) return null;
  return (
    <p className={className}>
      {line.lead}
      <Link
        to={`/team/${line.expert.slug}`}
        className="text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
      >
        {line.expert.name}
      </Link>
      {line.tail}
    </p>
  );
}
