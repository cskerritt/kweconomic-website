import { team } from "@/data/team";

// Experts whose most-recent CV is hosted (as a PDF under public/cv/<slug>.pdf)
// on the unlisted /cv page (noindex, slug-only). The roster is curated and the
// array order is the display order. Name/title/credentials are pulled from
// team.ts so they never drift from the rest of the site.
const CV_SLUGS = [
  "daniel-wolstein",
  "matthew-putts",
  "paul-bourgeois",
  "sharon-hirsh",
  "christopher-skerritt",
  "john-halpin",
  "john-may",
  "kristina-fredericksen",
  "jesse-wolstein",
  "christina-rivera",
  "logan-patterson",
] as const;

export interface ExpertCV {
  slug: string;
  name: string;
  title: string;
  credentials: string[];
  /** Public path to the PDF under /public. */
  file: string;
}

const bySlug = new Map(team.map((m) => [m.slug, m]));

export const EXPERT_CVS: ExpertCV[] = CV_SLUGS.flatMap((slug) => {
  const m = bySlug.get(slug);
  if (!m) return [];
  return [
    {
      slug,
      name: m.name,
      title: m.title,
      credentials: m.credentials ?? [],
      file: `/cv/${slug}.pdf`,
    },
  ];
});
