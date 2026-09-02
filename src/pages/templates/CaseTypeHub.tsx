import { useParams, Link } from "react-router-dom";
import { placeName } from "@/data/geo-prose.mjs";
import { caseTypes, getCaseType } from "@/data/caseTypes";
import { pillarServices } from "@/data/services";
import { ATTORNEY_STAGES } from "@/lib/attorney-stages";
import { credentials as allCredentials, type Credential } from "@/data/credentials";
import { retainableExperts } from "@/data/team";
import { states } from "@/data/states";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import RelatedContent from "@/components/RelatedContent";
import PaginateNav from "@/components/PaginateNav";
import NextSteps from "@/components/NextSteps";
import SchemaOrg from "@/components/SchemaOrg";
import { graphSchema, articleSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

// Case types name credentials the way services.ts does (label set such as
// "Forensic Economist", "NAFE", "PhD"); credentials.ts keys them by slug and a
// punctuated abbreviation ("Ph.D.", "MBA / M.A. / Ph.D."). Match on either.
const normalizeCredential = (s: string) => s.replace(/[^a-z0-9]/gi, "").toLowerCase();
const credentialMatches = (cred: Credential, wanted: string[]) =>
  wanted.some(
    (w) =>
      w === cred.slug ||
      cred.abbreviation.split("/").some((part) => normalizeCredential(part) === normalizeCredential(w)),
  );

const LINK = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

export default function CaseTypeHub() {
  const { slug = "" } = useParams();
  const caseType = getCaseType(slug);
  const url = caseType ? `${ORG_URL}/case-types/${caseType.slug}` : "";
  usePageMeta(
    caseType
      ? {
          title: `${caseType.titleBase} | ${ORG_NAME}`,
          description: `${caseType.name} economic damages: loss components, the records that drive them, and how the present value is built. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );
  if (!caseType) return <NotFound />;
  const idx = caseTypes.findIndex((c) => c.slug === slug);
  const prev = idx > 0 ? { label: caseTypes[idx - 1].name, href: `/case-types/${caseTypes[idx - 1].slug}` } : undefined;
  const next = idx < caseTypes.length - 1 ? { label: caseTypes[idx + 1].name, href: `/case-types/${caseTypes[idx + 1].slug}` } : undefined;

  const linkedServices = pillarServices().filter((s) => caseType.relevantServices.includes(s.slug));
  const linkedCredentials = allCredentials.filter((c) => credentialMatches(c, caseType.relevantCredentials));
  // The economists counsel may retain by name (team.ts retention rule), senior
  // first; the same named economist signs the work on every case-type page.
  const experts = retainableExperts();
  const author = experts[0];
  const h1 = `${caseType.name} Economic Damages Analysis`;

  const related = linkedServices.slice(0, 3).map((s) => ({
    title: s.name,
    href: `/services/${s.slug}/case/${caseType.slug}`,
    description: `Applied to ${caseType.name.toLowerCase()} matters`,
  }));

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Case Types", url: "/case-types" },
        { name: caseType.name, url: `/case-types/${caseType.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{h1}</h1>
      <AuthorByline slug={author?.slug} datePublished={caseType.datePublished} dateModified={caseType.dateModified} />
      <p className="text-lg text-neutral-700 mb-6">{caseType.summary}</p>

      <section id="in-short" aria-label="In short" className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 mb-8">
        <p className="font-semibold text-navy mb-2">In short</p>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          {caseType.inShort.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section id="loss-components" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">What the economic claim consists of</h2>
        <p className="text-neutral-700">{caseType.lossComponents}</p>
      </section>
      <section id="damages-exposure" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Where the damages concentrate</h2>
        <p className="text-neutral-700">{caseType.damagesExposure}</p>
      </section>
      <section id="analysis" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">How the analysis is built</h2>
        <p className="text-neutral-700">{caseType.economicImpact}</p>
        <ol className="list-decimal ml-5 text-neutral-700 space-y-1 mt-3">
          {caseType.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {linkedCredentials.length > 0 && (
        <section id="credentials" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Relevant credentials</h2>
          <ul className="list-disc ml-5 text-neutral-700">
            {linkedCredentials.map((c) => (
              <li key={c.slug}>
                <Link to={`/credentials/${c.slug}`} className={LINK}>
                  {c.name} ({c.abbreviation})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {experts.length > 0 && (
        <section id="experts" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">Our economists</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {experts.map((m) => (
              <li key={m.slug}>
                <Link to={`/team/${m.slug}`} className={LINK}>{m.name}</Link>
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
              <Link to={`/case-types/${caseType.slug}/${s.slug}`} className={LINK}>
                {caseType.name} in {placeName(s.name)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="attorney-guides" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Attorney guides for {caseType.name.toLowerCase()} cases</h2>
        <p className="text-neutral-700 mb-3">
          Stage-by-stage guidance on working with a forensic economist in {caseType.name.toLowerCase()} litigation.
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
      {linkedServices.length > 0 && (
        <section id="service-pages" aria-labelledby="service-pages-heading" className="mt-6">
          <h2 id="service-pages-heading" className="font-serif text-2xl text-navy mb-2">Service pages</h2>
          <ul className="list-disc ml-5 text-neutral-700 space-y-1">
            {linkedServices.map((s) => (
              <li key={s.slug}>
                <Link to={`/services/${s.slug}`} className={LINK}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <SourcesBlock sources={caseType.sources} />
      <div className="mt-12">
        <NextSteps context={`${caseType.name.toLowerCase()} cases`} />
      </div>
      <PaginateNav prev={prev} next={next} backHref="/case-types" backLabel="All case types" />

      <SchemaOrg data={graphSchema([
        // articleSchema embeds the author as a compact Person node (name, job
        // title, profile URL), so the biography is not repeated on every hub.
        articleSchema({
          title: h1,
          description: caseType.summary,
          url,
          authorSlug: author?.slug,
          datePublished: caseType.datePublished,
          dateModified: caseType.dateModified,
        }),
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
