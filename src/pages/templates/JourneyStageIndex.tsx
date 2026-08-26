import { Link, useParams } from "react-router-dom";
import { caseTypes } from "@/data/caseTypes";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";
import { STAGE_LABELS } from "@/lib/attorney-stages";

// Per-stage index page (/attorneys/:stage). Fills the level between the
// /attorneys hub and the 48 stage x case-type journey guides - the journey
// pages' breadcrumbs (visible + schema.org) link to /attorneys/:stage, which
// 404'd before this page existed.
const STAGE_INTROS: Record<string, string> = {
  considering:
    "Deciding whether a vocational, economic, or life care expert adds value to the case. Pick your case type for the evaluation criteria, timing considerations, and questions to ask before retaining.",
  retaining:
    "Engaging the expert: scope, documents to send, and scheduling. Pick your case type for a step-by-step retention checklist.",
  "preparing-deposition":
    "Getting the expert and the record ready for deposition. Pick your case type for preparation steps, document checklists, and common pitfalls.",
  trial:
    "Presenting expert testimony at trial. Pick your case type for direct-examination structure, exhibit preparation, and cross-examination considerations.",
};

export default function JourneyStageIndex() {
  const { stage = "" } = useParams();
  const stageLabel = STAGE_LABELS[stage];
  const url = `${ORG_URL}/attorneys/${stage}`;

  usePageMeta(
    stageLabel
      ? {
          title: `${stageLabel}: Attorney Guides by Case Type | ${ORG_NAME}`,
          description: `${stageLabel} guides for attorneys, by case type: step-by-step actions, required documents, common pitfalls, and FAQs.`,
          canonical: url,
        }
      : null,
  );

  if (!stageLabel) return <NotFound />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Attorneys", url: "/attorneys" },
          { name: stageLabel, url: `/attorneys/${stage}` },
        ]}
      />
      <h1 className="font-serif text-4xl text-navy mb-4">{stageLabel}</h1>
      <p className="text-lg text-neutral-700 mb-8 max-w-3xl">{STAGE_INTROS[stage]}</p>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
        {caseTypes.map((c) => (
          <li key={c.slug}>
            <Link
              to={`/attorneys/${stage}/${c.slug}`}
              className="block rounded-lg border border-neutral-200 p-3 hover:border-navy hover:shadow transition"
            >
              <div className="font-semibold text-navy">{c.name}</div>
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-neutral-700">
        Looking for a different stage?{" "}
        <Link to="/attorneys" className="text-teal font-medium hover:underline">
          Browse all attorney resources
        </Link>
        .
      </p>

      <SchemaOrg
        data={graphSchema([
          articleSchema({
            title: `${stageLabel}: Attorney Guides by Case Type`,
            description: `${stageLabel} guides for attorneys, organized by case type.`,
            url,
          }),
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
