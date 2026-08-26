import { Link } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import { credentials } from "@/data/credentials";
import { methods } from "@/data/methods";
import { guides } from "@/data/guides";
import { comparisons } from "@/data/comparisons";
import { journeys } from "@/data/journeys";
import { services } from "@/data/services";
import { team } from "@/data/team";
import { states } from "@/data/states";

interface ReviewItem {
  label: string;
  subtitle?: string;
  href: string;
  status: "populated" | "scaffold" | "empty";
}

interface ReviewSection {
  title: string;
  description: string;
  items: ReviewItem[];
}

function isPopulatedCaseType(slug: string) {
  const c = caseTypes.find((x) => x.slug === slug);
  return Boolean(c && c.summary && c.summary.length > 50);
}
function isPopulatedCredential(slug: string) {
  const c = credentials.find((x) => x.slug === slug);
  return Boolean(c && c.scope && c.scope.length > 50);
}
function isPopulatedMethod(slug: string) {
  const m = methods.find((x) => x.slug === slug);
  return Boolean(m && m.summary && m.summary.length > 50);
}

const STAGES: { slug: string; label: string }[] = [
  { slug: "considering", label: "Considering" },
  { slug: "retaining", label: "Retaining" },
  { slug: "preparing-deposition", label: "Preparing Deposition" },
  { slug: "trial", label: "Trial" },
];

const SECTIONS: ReviewSection[] = [
  {
    title: "Case Types (12)",
    description: "Populated in caseTypes.ts with summary, vocational impact, economic exposure, FAQs, sources.",
    items: caseTypes.map((c) => ({
      label: c.name,
      subtitle: c.category,
      href: `/case-types/${c.slug}`,
      status: isPopulatedCaseType(c.slug) ? "populated" : "scaffold",
    })),
  },
  {
    title: "Credentials (12)",
    description: "Populated in credentials.ts with scope, requirements, admissibility notes, FAQs, sources.",
    items: credentials.map((c) => ({
      label: `${c.name} (${c.abbreviation})`,
      subtitle: c.issuer,
      href: `/credentials/${c.slug}`,
      status: isPopulatedCredential(c.slug) ? "populated" : "scaffold",
    })),
  },
  {
    title: "Methodologies (10)",
    description: "Populated in methods.ts with summary, steps, data sources, limitations, admissibility notes, FAQs, sources.",
    items: methods.map((m) => ({
      label: m.name,
      href: `/methods/${m.slug}`,
      status: isPopulatedMethod(m.slug) ? "populated" : "scaffold",
    })),
  },
  {
    title: `Pillar Guides (${guides.length})`,
    description: "Populated in guides.ts with TL;DR, sections, FAQs, sources, related links.",
    items: guides.map((g) => ({
      label: g.title,
      subtitle: g.tldr.slice(0, 120),
      href: `/guides/${g.slug}`,
      status: "populated",
    })),
  },
  {
    title: `Comparisons (${comparisons.length})`,
    description: "Populated in comparisons.ts with comparison table, when-to-use, FAQs, sources.",
    items: comparisons.map((c) => ({
      label: c.title,
      subtitle: `${c.a.label} vs ${c.b.label}`,
      href: `/compare/${c.slug}`,
      status: "populated",
    })),
  },
  {
    title: `Attorney Journey Stages (${journeys.length} / 48)`,
    description: "Populated in journeys.ts with intro, checklist, questions, timeline, required documents, pitfalls, FAQs, sources.",
    items: journeys.map((j) => {
      const ct = caseTypes.find((c) => c.slug === j.caseTypeSlug);
      const stage = STAGES.find((s) => s.slug === j.stage);
      return {
        label: `${stage?.label ?? j.stage} - ${ct?.name ?? j.caseTypeSlug}`,
        subtitle: j.intro.slice(0, 140),
        href: `/attorneys/${j.stage}/${j.caseTypeSlug}`,
        status: "populated" as const,
      };
    }),
  },
  {
    title: "Hubs (7 new)",
    description: "New top-level hubs registered in App.tsx and prerendered.",
    items: [
      { label: "/case-types", href: "/case-types", status: "populated" },
      { label: "/credentials", href: "/credentials", status: "populated" },
      { label: "/guides", href: "/guides", status: "populated" },
      { label: "/compare", href: "/compare", status: "populated" },
      { label: "/methods", href: "/methods", status: "populated" },
      { label: "/jurisdictions", href: "/jurisdictions", status: "populated" },
      { label: "/attorneys", href: "/attorneys", status: "populated" },
    ],
  },
  {
    title: `Expert Profiles (${team.length}) - scaffolded, awaiting full bio data`,
    description: "Per-expert routes render from team.ts. Full bios/education/publications/cvUrl are still empty.",
    items: team.map((m) => ({
      label: m.name,
      subtitle: m.title,
      href: `/team/${m.slug}`,
      status: m.fullBio ? "populated" : "scaffold",
    })),
  },
  {
    title: `Service cost / process / timeline (${services.length * 3}) - scaffolded, awaiting pricing data`,
    description: "Routes render from services.ts. cost, process, and timeline fields are empty.",
    items: services.flatMap((s) =>
      (["cost", "process", "timeline"] as const).map((variant) => ({
        label: `${s.name} - ${variant}`,
        href: `/services/${s.slug}/${variant}`,
        status: (s[variant] ? "populated" : "scaffold") as ReviewItem["status"],
      }))
    ),
  },
  {
    title: `Programmatic (case-type × state) - ${caseTypes.length * states.length} pages, powered by hub content`,
    description:
      "Generated from caseTypes and states data. Shows a small sample below; replace state slug to spot-check others.",
    items: caseTypes.slice(0, 3).flatMap((c) =>
      states.slice(0, 3).map((s) => ({
        label: `${c.name} in ${s.name}`,
        href: `/case-types/${c.slug}/${s.slug}`,
        status: "populated" as const,
      }))
    ),
  },
  {
    title: `Programmatic (credential × state) - ${credentials.length * states.length} pages, powered by hub content`,
    description:
      "Generated from credentials and states data. Shows a small sample below; replace state slug to spot-check others.",
    items: credentials.slice(0, 3).flatMap((c) =>
      states.slice(0, 3).map((s) => ({
        label: `${c.abbreviation} in ${s.name}`,
        href: `/credentials/${c.slug}/${s.slug}`,
        status: "populated" as const,
      }))
    ),
  },
  {
    title: `Programmatic (service × case-type) - ${services.length * caseTypes.length} pages`,
    description:
      "Generated from services and caseTypes data. Shows a small sample.",
    items: services.slice(0, 3).flatMap((s) =>
      caseTypes.slice(0, 3).map((c) => ({
        label: `${s.name} for ${c.name}`,
        href: `/services/${s.slug}/case/${c.slug}`,
        status: "populated" as const,
      }))
    ),
  },
];

const STATUS_STYLE: Record<ReviewItem["status"], string> = {
  populated: "bg-forest/10 text-forest",
  scaffold: "bg-amber/10 text-amber-dark",
  empty: "bg-neutral-100 text-neutral-500",
};

const STATUS_LABEL: Record<ReviewItem["status"], string> = {
  populated: "Populated",
  scaffold: "Scaffold",
  empty: "Empty",
};

export default function Review() {
  const totalPopulated = SECTIONS.reduce(
    (sum, s) => sum + s.items.filter((i) => i.status === "populated").length,
    0
  );
  const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-navy mb-3">Landing-Page Content Review</h1>
        <p className="text-neutral-700">
          Click any entry below to open it in the dev browser. Each content page renders the
          full template with the real data file contents.
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          {totalPopulated} of {totalItems} tracked items populated.
        </p>
      </div>

      <div className="mb-8 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <h2 className="font-semibold text-navy mb-2">How to review</h2>
        <ol className="list-decimal ml-5 text-sm text-neutral-700 space-y-1">
          <li>Click any entry to open the rendered page in a new tab (cmd/ctrl-click).</li>
          <li>Read the content. If it is acceptable, move on.</li>
          <li>If something needs changing, copy the page URL and note the change back here.</li>
          <li>When you finish a section, tell me which items to revise.</li>
        </ol>
      </div>

      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-10">
          <h2 className="font-serif text-2xl text-navy mb-2">{section.title}</h2>
          <p className="text-sm text-neutral-600 mb-4">{section.description}</p>
          <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden">
            {section.items.map((item) => (
              <li key={item.href} className="flex items-start justify-between gap-4 p-4 hover:bg-neutral-50">
                <div className="flex-1 min-w-0">
                  <Link to={item.href} className="font-medium text-navy hover:underline block truncate">
                    {item.label}
                  </Link>
                  {item.subtitle && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{item.subtitle}</p>
                  )}
                  <code className="text-xs text-neutral-500 mt-1 block truncate">{item.href}</code>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_STYLE[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                  <Link
                    to={item.href}
                    target="_blank"
                    className="text-sm text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark whitespace-nowrap"
                  >
                    Open &rarr;
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
