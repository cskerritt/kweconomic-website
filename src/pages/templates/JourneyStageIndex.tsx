import { Link, useParams } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import { stageReviewer, stageSources } from "@/data/journeys";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorByline from "@/components/AuthorByline";
import NextSteps from "@/components/NextSteps";
import SchemaOrg from "@/components/SchemaOrg";
import SourcesBlock from "@/components/SourcesBlock";
import {
  graphSchema,
  organizationSchema,
  websiteSchema,
  collectionPageSchema,
  breadcrumbSchema,
  ORG_URL,
} from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";
import {
  ATTORNEY_STAGES,
  STAGE_LABELS,
  journeyHeading,
  stageIndexHeading,
  stageIndexTitle,
  stageIndexDescription,
  stageIndexIntro,
} from "@/lib/attorney-stages";

// Per-stage index page (/attorneys/:stage). Fills the level between the
// /attorneys hub and the 56 stage x case-type journey guides - the journey
// pages' breadcrumbs (visible + schema.org) link to /attorneys/:stage. The
// heading, title, description, and intro all come from src/lib/attorney-stages
// so the static shell in scripts/prerender.mjs can print the same strings.
// Each card prints the target page's heading (journeyHeading), which is also
// the ListItem name in the CollectionPage schema below, so the structured data
// names nothing the page does not show. The schema uses the shared
// collectionPageSchema() builder (the shape the /attorneys hub emits) with the
// WebSite node on the page so its isPartOf reference resolves.

export default function JourneyStageIndex() {
  const { stage = "" } = useParams();
  const stageLabel = STAGE_LABELS[stage];
  const url = `${ORG_URL}/attorneys/${stage}`;

  usePageMeta(
    stageLabel
      ? {
          title: stageIndexTitle(stage),
          description: stageIndexDescription(stage),
          canonical: url,
        }
      : null,
  );

  if (!stageLabel) return <NotFound />;

  const heading = stageIndexHeading(stage);
  const items = caseTypes.map((c) => ({
    name: journeyHeading(stage, c),
    url: `${ORG_URL}/attorneys/${stage}/${c.slug}`,
  }));
  // The reviewer the stage's fourteen guides share (journeys.ts authorSlug),
  // with the family's first publication date and latest revision, and the
  // union of the guides' registry sources, so the index names the responsible
  // professional and links the evidence its guides rest on (site audit
  // 2026-09-05, C02 and C04). Mirrored by the stage shell in
  // scripts/prerender.mjs.
  const reviewer = stageReviewer(stage);
  const sources = stageSources(stage);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Attorneys", url: "/attorneys" },
          { name: stageLabel, url: `/attorneys/${stage}` },
        ]}
      />
      <p className="text-amber-dark text-sm font-semibold uppercase tracking-wider mb-2">{stageLabel}</p>
      <h1 className="font-serif text-4xl text-navy mb-4">{heading}</h1>
      {reviewer && <AuthorByline slug={reviewer.authorSlug} datePublished={reviewer.datePublished} dateModified={reviewer.dateModified} />}
      <p className="text-lg text-neutral-700 mb-8 max-w-3xl">{stageIndexIntro(stage)}</p>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        {caseTypes.map((c) => (
          <li key={c.slug}>
            <Link
              to={`/attorneys/${stage}/${c.slug}`}
              className="block rounded-lg border border-neutral-200 p-3 hover:border-navy hover:shadow transition"
            >
              <div className="font-semibold text-navy">{journeyHeading(stage, c)}</div>
            </Link>
          </li>
        ))}
      </ul>

      <section id="other-stages" className="mb-10">
        <h2 className="font-serif text-2xl text-navy mb-2">Other stages</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {ATTORNEY_STAGES.filter((s) => s.slug !== stage).map((s) => (
            <li key={s.slug}>
              <Link
                to={`/attorneys/${s.slug}`}
                className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark"
              >
                {stageIndexHeading(s.slug)}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/attorneys" className="text-teal font-medium hover:underline">
              Browse all attorney resources
            </Link>
          </li>
        </ul>
      </section>

      <NextSteps />
      <SourcesBlock sources={sources} />

      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          collectionPageSchema({ url, name: heading, description: stageIndexDescription(stage), items }),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Attorneys", url: `${ORG_URL}/attorneys` },
            { name: stageLabel, url },
          ]),
        ])}
      />
    </div>
  );
}
