import { useParams, Link } from "react-router-dom";
import { pillarServices, type PillarService } from "@/data/services";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorByline from "@/components/AuthorByline";
import ContactCTA from "@/components/ContactCTA";
import RelatedContent from "@/components/RelatedContent";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, organizationSchema, serviceSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
// Service.shortName is a heading label ("Fraud & Tracing"); every sentence
// that names the work goes through the shared prose helpers.
import { capFirst, proseName, withArticle, workPhrase } from "@/lib/service-prose.mjs";
import NotFound from "@/pages/NotFound";

export type Variant = "cost" | "process" | "timeline";

const VARIANTS: Variant[] = ["cost", "process", "timeline"];

const LABEL: Record<Variant, string> = {
  cost: "Cost",
  process: "Process",
  timeline: "Timeline",
};

// Link labels for the sibling-variant list (same wording as the pillar's
// "Engagement Details" card).
const LINK_LABEL: Record<Variant, string> = {
  cost: "Cost and fee structure",
  process: "Engagement process",
  timeline: "Typical timeline",
};

const LINK_CLASS = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

/** "2 to 4 weeks after records are received" -> "2 to 4 weeks"; "About 1 week" -> "about 1 week". */
function span(duration: string, fallback: string): string {
  const m = duration.match(/^(About \d+ weeks?|\d+ to \d+ weeks)/i);
  return m ? m[1].toLowerCase() : fallback;
}

/** Append the first closing sentence that keeps the description within 160 characters. */
function fit(base: string, ...tails: string[]): string {
  const tail = tails.find((t) => base.length + t.length <= 160);
  return tail ? base + tail : base;
}

/**
 * The meta description each variant page publishes: a direct answer to the
 * question the page is for (what it costs, how the engagement runs, how long
 * it takes), 140-160 characters for every pillar. The work phrase varies from
 * 17 to 41 characters, so a closing sentence is added only while it fits,
 * with a shorter fallback (the personal injury pillar drops it). The render
 * test pins the resulting strings; scripts/prerender.mjs must print the same.
 */
function variantDescription(s: PillarService, variant: Variant): string {
  const work = workPhrase(s.shortName);
  const name = proseName(s.shortName);
  switch (variant) {
    case "cost":
      return fit(
        `What ${work} costs: hourly billing against a retainer, the factors that set the scope, and a written estimate up front.`,
        " Either side.",
      );
    case "process":
      return fit(
        `How ${withArticle(name)} engagement runs: conflict check and retention, records request, analysis, draft review with counsel, then the final report.`,
        " Testimony follows.",
      );
    case "timeline": {
      const t = s.timeline ?? [];
      const intake = span(t[0]?.duration ?? "", "about a week");
      const analysis = span(t[1]?.duration ?? "", "several weeks");
      const report = span(t[2]?.duration ?? "", "1 to 2 weeks");
      return fit(
        `How long ${work} takes: ${intake} for intake, ${analysis} of analysis, ${report} to the report, then testimony.`,
        " Plaintiff and defense.",
        " Either side.",
      );
    }
  }
}

export default function ServiceTransactional({ variant }: { variant: Variant }) {
  const { serviceSlug = "" } = useParams();
  const s = pillarServices().find((x) => x.slug === serviceSlug);
  const url = s ? `${ORG_URL}/services/${s.slug}/${variant}` : "";
  const title = s ? `${s.name} ${LABEL[variant]}` : "";
  usePageMeta(
    s
      ? {
          title: `${title} | ${ORG_NAME}`,
          description: variantDescription(s, variant),
          canonical: url,
        }
      : null,
  );

  if (!s) return <NotFound />;

  const work = workPhrase(s.shortName);
  const name = proseName(s.shortName);
  const siblings = VARIANTS.filter((v) => v !== variant);
  const finalStep = s.process?.at(-1);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: s.name, url: `/services/${s.slug}` },
        { name: LABEL[variant], url: `/services/${s.slug}/${variant}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{title}</h1>
      <AuthorByline dateModified={s.dateModified} />

      {variant === "cost" && s.cost && (
        <>
          {/* Direct answer first: how the work is billed, then what sets the
              scope, then the drivers. */}
          <p className="text-lg text-neutral-700 mb-8">
            {capFirst(work)} is billed at an hourly rate against a retainer established at the outset, with a written fee schedule and a cost estimate before work begins. The scope of the engagement, and so its cost, depends on the factors below.
          </p>
          <section id="billing" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">How {name} is billed</h2>
            <p className="text-neutral-700">{s.cost.billingStructure}</p>
          </section>
          <section id="range" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">What sets the scope</h2>
            <p className="text-neutral-700">{s.cost.range}</p>
          </section>
          <section id="drivers" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">What drives cost</h2>
            <ul className="list-disc ml-5 text-neutral-700 space-y-1">
              {s.cost.drivers.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </section>
        </>
      )}

      {variant === "process" && s.process && (
        <>
          <p className="text-lg text-neutral-700 mb-8">
            {capFirst(withArticle(name))} engagement moves through {s.process.length} steps, from the conflict check to testimony. Each step ends in something counsel can review, and the{" "}
            <Link to={`/services/${s.slug}/timeline`} className={LINK_CLASS}>typical timeline</Link>{" "}
            shows how long each phase runs.
          </p>
          <section id="process" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">Engagement process</h2>
            <ol className="list-decimal ml-5 text-neutral-700 space-y-2">
              {s.process.map((step) => (
                <li key={step.step}>
                  <strong>{step.step}:</strong> {step.description}
                </li>
              ))}
            </ol>
          </section>
        </>
      )}

      {variant === "timeline" && s.timeline && (
        <>
          <p className="text-lg text-neutral-700 mb-8">
            The phases below run in sequence. The analysis starts when the records arrive, so the records request in the{" "}
            <Link to={`/services/${s.slug}/process`} className={LINK_CLASS}>engagement process</Link>{" "}
            sets the pace, and disclosure deadlines are agreed at retention.
          </p>
          <section id="timeline" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">Typical timeline</h2>
            <ul className="divide-y divide-neutral-200">
              {s.timeline.map((p) => (
                <li key={p.phase} className="py-3">
                  <strong>{p.phase}</strong>
                  <span className="text-neutral-500 ml-2">{p.duration}</span>
                </li>
              ))}
            </ul>
          </section>
          {finalStep && (
            <section id="deliverable" className="mb-6">
              <h2 className="font-serif text-2xl text-navy mb-2">What the engagement delivers</h2>
              <p className="text-neutral-700">{finalStep.description}</p>
            </section>
          )}
        </>
      )}

      {/* Crawl path: the two sibling variants and the pillar. */}
      <section id="also-for-this-service" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Also for this service</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li>
            <Link to={`/services/${s.slug}`} className={LINK_CLASS}>{s.name}</Link>
          </li>
          {siblings.map((v) => (
            <li key={v}>
              <Link to={`/services/${s.slug}/${v}`} className={LINK_CLASS}>
                {LINK_LABEL[v]} for {name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 space-y-4">
        <ContactCTA context={s.shortName} />
        <p className="text-sm text-neutral-600">
          <Link to="/schedule-consultation" className={LINK_CLASS}>Schedule a consultation</Link>
        </p>
      </div>

      <RelatedContent items={s.related.slice(0, 3)} heading="Guides and methods" />

      <SchemaOrg data={graphSchema([
        organizationSchema(),
        serviceSchema({
          slug: `${s.slug}/${variant}`,
          name: title,
          description: variantDescription(s, variant),
          dateModified: s.dateModified,
        }),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Services", url: `${ORG_URL}/services` },
          { name: s.name, url: `${ORG_URL}/services/${s.slug}` },
          { name: LABEL[variant], url },
        ]),
      ])} />
    </article>
  );
}
