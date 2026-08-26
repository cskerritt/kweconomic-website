import { useParams, Link } from "react-router-dom";
import { caseTypes, getCaseType } from "@/data/caseTypes";
import { pillarServices } from "@/data/services";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import { credentials as allCredentials } from "@/data/credentials";
import { activeTeam } from "@/data/team";
import { states } from "@/data/states";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import RelatedContent from "@/components/RelatedContent";
import PaginateNav from "@/components/PaginateNav";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

export default function CaseTypeHub() {
  const { slug = "" } = useParams();
  const caseType = getCaseType(slug);
  const url = caseType ? `${ORG_URL}/case-types/${caseType.slug}` : "";
  usePageMeta(
    caseType
      ? {
          title: `${caseType.name} Expert Witness Services | ${ORG_NAME}`,
          description: `Life care planning and medical cost projection for ${caseType.name.toLowerCase()} cases. Methodology, credentials, and experienced planners. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );
  if (!caseType) return <NotFound />;
  const idx = caseTypes.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? { label: caseTypes[idx - 1].name, href: `/case-types/${caseTypes[idx - 1].slug}` } : undefined;
  const next = idx < caseTypes.length - 1 ? { label: caseTypes[idx + 1].name, href: `/case-types/${caseTypes[idx + 1].slug}` } : undefined;

  const linkedServices = pillarServices().filter((s) => caseType.relevantServices.includes(s.slug));
  const linkedCredentials = allCredentials.filter((c) => caseType.relevantCredentials.includes(c.slug));
  const relevantExperts = activeTeam.filter((m) => m.specialties.some((sp) => sp.toLowerCase().includes(caseType.name.toLowerCase())));

  const related = linkedServices.slice(0, 3).map((s) => ({
    title: `${s.name} for ${caseType.name}`,
    href: `/services/${s.slug}/case/${caseType.slug}`,
    description: s.shortName,
  }));

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Case Types", url: "/case-types" },
        { name: caseType.name, url: `/case-types/${caseType.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{caseType.name}</h1>
      <AuthorByline />
      <p className="text-lg text-neutral-700 mb-8">{caseType.summary}</p>

      <section id="care-needs" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Care needs</h2>
        <p className="text-neutral-700">{caseType.careNeeds}</p>
      </section>
      <section id="cost-exposure" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Cost exposure</h2>
        <p className="text-neutral-700">{caseType.costExposure}</p>
      </section>
      {caseType.lifeCareImpact && (
        <section id="life-care" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Life care planning considerations</h2>
          <p className="text-neutral-700">{caseType.lifeCareImpact}</p>
        </section>
      )}

      {linkedCredentials.length > 0 && (
        <section id="credentials" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Relevant credentials</h2>
          <ul className="list-disc ml-5 text-neutral-700">
            {linkedCredentials.map((c) => (
              <li key={c.slug}>
                <Link to={`/credentials/${c.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                  {c.name} ({c.abbreviation})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relevantExperts.length > 0 && (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Our life care planners</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relevantExperts.map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">{m.name}</Link>
                <span className="text-neutral-600"> - {m.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="by-state" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">{caseType.name} services by state</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {states.map((s) => (
            <li key={s.slug}>
              <Link to={`/case-types/${caseType.slug}/${s.slug}`} className="text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark">
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="attorney-guides" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Attorney guides for {caseType.name.toLowerCase()} cases</h2>
        <p className="text-neutral-700 mb-3">
          Stage-by-stage guidance on working with a life care planner in {caseType.name.toLowerCase()} litigation.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {ATTORNEY_STAGES.map((stage) => (
            <li key={stage.slug}>
              <Link
                to={`/attorneys/${stage.slug}/${caseType.slug}`}
                className="block rounded-lg border border-neutral-200 p-3 hover:border-navy hover:shadow transition"
              >
                <div className="font-semibold text-navy">{stage.label}</div>
                <div className="text-sm text-neutral-600 mt-1">{caseType.name} cases</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <FAQBlock faqs={caseType.faqs} />
      <RelatedContent items={related} heading="Related services" />
      <SourcesBlock sources={caseType.sources} />
      <PaginateNav prev={prev} next={next} backHref="/case-types" backLabel="All case types" />

      <SchemaOrg data={graphSchema([
        articleSchema({ title: caseType.name, description: caseType.summary, url }),
        faqPageSchema(caseType.faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Case Types", url: `${ORG_URL}/case-types` },
          { name: caseType.name, url },
        ]),
      ])} />
    </article>
  );
}
