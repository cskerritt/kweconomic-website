import { useParams } from "react-router-dom";
import { services } from "@/data/services";
import { getCaseType } from "@/data/caseTypes";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import NotFound from "@/pages/NotFound";

export default function ServiceCaseType() {
  const { serviceSlug = "", typeSlug = "" } = useParams();
  const service = services.find((s) => s.slug === serviceSlug);
  const caseType = getCaseType(typeSlug);

  const url =
    service && caseType
      ? `${ORG_URL}/services/${service.slug}/case/${caseType.slug}`
      : "";
  const title =
    service && caseType ? `${service.name} for ${caseType.name} Cases` : "";
  usePageMeta(
    service && caseType
      ? {
          title: `${title} | KWVRS`,
          description: `${service.shortName} services tailored to ${caseType.name.toLowerCase()} cases. Methodology, deliverables, and KWVRS-experienced experts. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );

  if (!service || !caseType) return <NotFound />;

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Services", url: "/services" },
        { name: service.name, url: `/services/${service.slug}` },
        { name: caseType.name, url: `/services/${service.slug}/case/${caseType.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{title}</h1>
      <AuthorByline />
      <p className="text-lg text-neutral-700 mb-8">
        {service.shortName} applied to {caseType.name.toLowerCase()} litigation: methodology, deliverables, and case-specific considerations.
      </p>

      <section id="application" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">How {service.name} applies to {caseType.name}</h2>
        <p className="text-neutral-700">{caseType.vocationalImpact || service.description}</p>
      </section>
      <section id="deliverables" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Typical deliverables</h2>
        <p className="text-neutral-700">
          A written expert report, supporting data appendices, and, when retained, deposition and trial testimony.
        </p>
      </section>

      <FAQBlock faqs={caseType.faqs.slice(0, 4)} />
      <SourcesBlock sources={caseType.sources.slice(0, 5)} />

      <SchemaOrg data={graphSchema([
        serviceSchema({
          slug: `${service.slug}/case/${caseType.slug}`,
          name: title,
          description: `${service.name} methodology applied to ${caseType.name.toLowerCase()} cases.`,
        }),
        faqPageSchema(caseType.faqs.slice(0, 4), url),
        breadcrumbSchema([
          { name: "Home", url: "https://kwvrs.com/" },
          { name: "Services", url: "https://kwvrs.com/services" },
          { name: service.name, url: `https://kwvrs.com/services/${service.slug}` },
          { name: caseType.name, url },
        ]),
      ])} />
    </article>
  );
}
