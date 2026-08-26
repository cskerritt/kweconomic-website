// The four attorney journey stages behind /attorneys/<stage>/<case-type>.
// Single source for the stage slugs and labels used by the attorneys hub, the
// per-stage indexes, the journey pages, and the case-type cross-links. Slugs
// must match the `stage` values in src/data/journeys.ts.
export const ATTORNEY_STAGES: { slug: string; label: string }[] = [
  { slug: "considering", label: "Considering an Expert" },
  { slug: "retaining", label: "Retaining an Expert" },
  { slug: "preparing-deposition", label: "Preparing for Deposition" },
  { slug: "trial", label: "Trial Testimony" },
];

export const STAGE_LABELS: Record<string, string> = Object.fromEntries(
  ATTORNEY_STAGES.map((s) => [s.slug, s.label]),
);
