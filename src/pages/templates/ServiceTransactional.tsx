import { useParams, Link } from "react-router-dom";
import { services } from "@/data/services";
import Breadcrumbs from "@/components/Breadcrumbs";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, serviceSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

type Variant = "cost" | "process" | "timeline";

const LABEL: Record<Variant, string> = {
  cost: "Cost",
  process: "Process",
  timeline: "Timeline",
};

export default function ServiceTransactional({ variant }: { variant: Variant }) {
  const { serviceSlug = "" } = useParams();
  const s = services.find((x) => x.slug === serviceSlug);
  const url = s ? `${ORG_URL}/services/${s.slug}/${variant}` : "";
  const title = s ? `${s.name} ${LABEL[variant]}` : "";
  const variantBlurb: Record<Variant, string> | null = s
    ? {
        cost: `${s.shortName} pricing, fee structure, and engagement cost considerations.`,
        process: `Step-by-step ${s.shortName.toLowerCase()} engagement process, from intake to deliverable.`,
        timeline: `Typical ${s.shortName.toLowerCase()} engagement timeline and turnaround expectations.`,
      }
    : null;
  usePageMeta(
    s && variantBlurb
      ? {
          title: `${title} | KWVRS`,
          description: variantBlurb[variant],
          canonical: url,
        }
      : null,
  );

  if (!s) return <NotFound />;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: s.name, url: `/services/${s.slug}` },
        { name: LABEL[variant], url: `/services/${s.slug}/${variant}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{title}</h1>
      <AuthorByline />

      {variant === "cost" && s.cost && (
        <>
          <section id="range" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">Typical range</h2>
            <p className="text-neutral-700">{s.cost.range}</p>
          </section>
          <section id="drivers" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">What drives cost</h2>
            <ul className="list-disc ml-5 text-neutral-700 space-y-1">
              {s.cost.drivers.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </section>
          <section id="billing" className="mb-6">
            <h2 className="font-serif text-2xl text-navy mb-2">Billing structure</h2>
            <p className="text-neutral-700">{s.cost.billingStructure}</p>
          </section>
        </>
      )}

      {variant === "process" && s.process && (
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
      )}

      {variant === "timeline" && s.timeline && (
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
      )}

      <div className="mt-8">
        <Link to="/schedule-consultation" className="inline-block px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy/90">
          Schedule a consultation
        </Link>
      </div>

      <SchemaOrg data={graphSchema([
        serviceSchema({
          slug: `${s.slug}/${variant}`,
          name: title,
          description: `${s.name} ${LABEL[variant].toLowerCase()} details.`,
        }),
        breadcrumbSchema([
          { name: "Home", url: "https://kwvrs.com/" },
          { name: "Services", url: "https://kwvrs.com/services" },
          { name: s.name, url: `https://kwvrs.com/services/${s.slug}` },
          { name: LABEL[variant], url },
        ]),
      ])} />
    </article>
  );
}
