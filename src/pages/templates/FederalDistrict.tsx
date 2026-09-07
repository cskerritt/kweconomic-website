import { useParams, Link } from "react-router-dom";
import { placeName, placeAttr } from "@/data/geo-prose.mjs";
import { getFederalDistrict, siblingDistricts, federalCourtName, FEDERAL_SERVICE_SLUGS } from "@/data/courts/federal-districts";
import { states } from "@/data/states";
import { pillarServices } from "@/data/services";
import { caseTypes } from "@/data/caseTypes";
import { retainableExperts } from "@/data/team";
import { getRegulationsByState } from "@/data/regulations/state-regs";
import { refsToSources } from "@/data/references";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQBlock from "@/components/FAQBlock";
import SourcesBlock from "@/components/SourcesBlock";
import AuthorByline from "@/components/AuthorByline";
import SchemaOrg from "@/components/SchemaOrg";
import ContactCTA from "@/components/ContactCTA";
import { graphSchema, serviceSchema, faqPageSchema, breadcrumbSchema, ORG_URL } from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME } from "@/lib/brand";
import NotFound from "@/pages/NotFound";

const LINK = "text-navy underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

/**
 * /jurisdictions/federal/<district>: one page per federal district court
 * (src/data/courts/federal-districts.ts). The title, description, H1, lead,
 * section order, FAQs, and JSON-LD are mirrored by the shell block in
 * scripts/prerender.mjs; scripts/prerender-meta.test.mjs pins the meta pair.
 */
export default function FederalDistrict() {
  const { districtSlug = "" } = useParams();
  const district = getFederalDistrict(districtSlug);
  const state = district ? states.find((s) => s.slug === district.stateSlug) : undefined;
  const url = district ? `${ORG_URL}/jurisdictions/federal/${district.slug}` : "";

  usePageMeta(
    district && state
      ? {
          title: `Economic Damages Expert, ${district.abbreviation} | ${ORG_NAME}`,
          description: `Forensic economist for the ${district.abbreviation}: how the damages report, expert disclosure, and deposition are prepared for federal practice. Plaintiff and defense.`,
          canonical: url,
        }
      : null,
  );
  if (!district || !state) return <NotFound />;

  const place = placeName(state.name);
  // "the District of Columbia courts" would print "the the"; the attributive form drops the article.
  const attr = placeAttr(state.name);
  const regulation = getRegulationsByState(state.slug);
  const siblings = siblingDistricts(district);
  const federalPillars = pillarServices().filter((s) => (FEDERAL_SERVICE_SLUGS as readonly string[]).includes(s.slug));
  const author = retainableExperts()[0];
  const h1 = `Economic Damages Expert for the ${district.name}`;
  const lead = `${ORG_NAME} prepares economic damages reports and testimony for civil matters in ${federalCourtName(district.name)} (${district.abbreviation}), a federal trial court in the ${district.circuit} Circuit covering ${place}. The economist's method does not change with the venue; what changes is the form and timing of the written disclosure, and the report is built to meet it.`;

  const faqs = [
    {
      question: `What does an economic damages report for the ${district.name} contain?`,
      answer: `A complete statement of every opinion and the basis for it, the facts and data considered, the exhibits that support the figures, the economist's qualifications and publications, a list of prior testimony, and the compensation arrangement, in the form federal practice requires of a retained expert. ${ORG_NAME} writes every report to that standard whatever the venue, so the same document serves in the ${district.abbreviation} and in the ${attr} courts.`,
    },
    {
      question: `Does ${ORG_NAME} accept engagements in the ${district.name}?`,
      answer: `Yes. Engagements are accepted in every federal district, including the ${district.name}. The economist prepares the report to the disclosure deadline in the scheduling order, sits for deposition, and testifies at trial where the case requires it, for plaintiff or defense counsel.`,
    },
    {
      question: `How does a report for the ${district.abbreviation} differ from one for the ${attr} courts?`,
      answer: `The economic method is the same. Federal practice fixes the content of the written disclosure and the timing of the expert exchange, and reliability challenges are decided by the court before trial, so the report states every assumption and its source in a form that can be examined on the papers. In a diversity matter the measure of damages still follows ${place} law.`,
    },
  ];

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      <Breadcrumbs items={[
        { name: "Home", url: "/" },
        { name: "Jurisdictions", url: "/jurisdictions" },
        { name: district.name, url: `/jurisdictions/federal/${district.slug}` },
      ]} />
      <h1 className="font-serif text-4xl text-navy mb-4">{h1}</h1>
      <AuthorByline slug={author?.slug} />
      <p className="text-lg text-neutral-700 mb-8">{lead}</p>

      <section id="federal-practice" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">How the report is prepared for federal practice</h2>
        <p className="text-neutral-700 mb-3">
          A retained economist&#x27;s written report in federal court sets out every opinion and the basis for it, lists the records and data considered, attaches the exhibits that support the figures, and states the economist&#x27;s qualifications, publications, prior testimony, and compensation. The court decides reliability challenges before trial, so the report states its earnings base, growth rate, worklife horizon, and discount rate with sources so that each input can be examined on the papers.
        </p>
        <p className="text-neutral-700">
          Expert disclosures are exchanged on the schedule the court&#x27;s scheduling order sets, with rebuttal reports on a shorter clock, so the retention date decides whether the economist has the tax returns, pay records, and the other experts&#x27; opinions in hand before the report is due. A deposition of the economist follows the report and tests it line by line, which is why the report is written to stand on its own.
        </p>
      </section>

      {regulation && (
        <section id="state-framework" className="mb-6">
          <h2 className="font-serif text-2xl text-navy mb-2">{state.name} damages framework in diversity matters</h2>
          <p className="text-neutral-700 mb-3">
            In a diversity matter the court applies {attr} substantive law to the measure of damages, while the admissibility of the economist&#x27;s testimony is decided under the federal rules of evidence.
          </p>
          <p className="text-neutral-700">{regulation.damagesContext}</p>
        </section>
      )}

      <section id="services" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Work most often retained in federal matters</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {federalPillars.map((s) => (
            <li key={s.slug}><Link to={`/services/${s.slug}`} className={LINK}>{s.name}</Link></li>
          ))}
        </ul>
      </section>

      <section id="case-types" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">{state.name} case types</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {caseTypes.map((c) => (
            <li key={c.slug}><Link to={`/case-types/${c.slug}/${state.slug}`} className="text-navy hover:text-amber-dark hover:underline">{c.name}</Link></li>
          ))}
        </ul>
      </section>

      <section id="related" className="mb-6">
        <h2 className="font-serif text-2xl text-navy mb-2">Related venues</h2>
        <ul className="list-disc ml-5 text-neutral-700 space-y-1">
          <li><Link to={`/locations/${state.slug}`} className={LINK}>{state.name} state courts and economists</Link></li>
          {siblings.map((d) => (
            <li key={d.slug}><Link to={`/jurisdictions/federal/${d.slug}`} className={LINK}>{d.name}</Link></li>
          ))}
          <li><Link to="/jurisdictions" className={LINK}>All jurisdictions</Link></li>
        </ul>
      </section>

      <FAQBlock faqs={faqs} title={`Frequently asked: economic damages in the ${district.abbreviation}`} />
      <SourcesBlock sources={refsToSources(["FRCP_26", "FRE_702"])} />
      <div className="mt-10"><ContactCTA /></div>

      <SchemaOrg data={graphSchema([
        // The page canonical is the Service entity's @id and url.
        serviceSchema({
          url,
          name: h1,
          description: `${ORG_NAME} prepares economic damages reports and testimony for civil matters in the ${district.name}, covering ${place}.`,
          areaServed: { "@type": state.type === "state" ? "State" : "AdministrativeArea", name: state.name },
        }),
        faqPageSchema(faqs, url),
        breadcrumbSchema([
          { name: "Home", url: `${ORG_URL}/` },
          { name: "Jurisdictions", url: `${ORG_URL}/jurisdictions` },
          { name: district.name, url },
        ]),
      ])} />
    </article>
  );
}
