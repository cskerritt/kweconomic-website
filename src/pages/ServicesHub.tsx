import { Link } from "react-router-dom";
import { pillarServices } from "@/data/services";
import { usePageMeta } from "@/hooks/use-page-meta";
import ServiceCard from "@/components/ServiceCard";
import ContactCTA from "@/components/ContactCTA";
import Reveal from "@/components/Reveal";
import { Picture } from "@/components/Picture";
import CrossSell from "@/components/CrossSell";
import SchemaOrg from "@/components/SchemaOrg";
import BreadcrumbNav from "@/components/layout/BreadcrumbNav";
import { graphSchema, organizationSchema, websiteSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";
import { ORG_NAME, ORG_SHORT, SITE_URL } from "@/lib/brand";

// The hero already leads with the definition; it doubles as the
// CollectionPage description so the visible and structured-data summaries agree.
const LEAD = `${ORG_SHORT} prepares independent economic damages analyses, business valuations, and forensic accounting work for attorneys, insurers, and businesses in every U.S. jurisdiction. Each report states its records, data sources, and assumptions so it can be examined line by line.`;

const RELATED_RESOURCES = [
  { href: "/attorneys", label: "Attorney resources by litigation stage" },
  { href: "/credentials", label: "Credentials of a forensic economist" },
  { href: "/methods", label: "Forensic economics methods" },
  { href: "/compare", label: "Expert and method comparisons" },
];

export default function ServicesHub() {
  const url = `${SITE_URL}/services`;
  usePageMeta({
    title: `Forensic Economics and Damages Services | ${ORG_NAME}`,
    description:
      "Lost earnings, wrongful death, household services, employment, business valuation, lost profits, and fraud analyses for plaintiff and defense attorneys.",
    canonical: url,
  });

  const pillars = pillarServices();

  return (
    <>
      {/* Index-page structured data: CollectionPage (own @id, so it does not
          collide with the prerender shell's Service node) + ItemList of the
          service pages, with the Organization and WebSite nodes the references resolve to. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage",
            "@id": `${url}#webpage`,
            url,
            name: "Forensic Economics and Damages Services",
            description: LEAD,
            isPartOf: { "@id": WEBSITE_ID },
            publisher: { "@id": ORG_ID },
            mainEntity: {
              "@type": "ItemList",
              "@id": `${url}#list`,
              numberOfItems: pillars.length,
              itemListElement: pillars.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.name,
                url: `${ORG_URL}/services/${s.slug}`,
              })),
            },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Services", url },
          ]),
        ])}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BreadcrumbNav items={[{ label: "Services" }]} />
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-teal-light text-sm font-semibold uppercase tracking-wider mb-4">
              What We Do
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              Forensic Economics and Damages Services
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">{LEAD}</p>
          </div>
        </div>
      </section>

      {/* Team image break */}
      <section className="py-12 md:py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Picture
            src="/images/legal-team-discussion.jpg"
            alt="Legal team reviewing an economic damages report"
            width={1200}
            height={400}
            className="rounded-2xl shadow-xl w-full object-cover max-h-80"
            loading="lazy"
          />
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">
              All Services
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              From records review through deposition and trial testimony, our economists support
              every stage of litigation with objective, data-driven analysis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((service, i) => (
              <Reveal key={service.slug} delay={i * 60}>
                <ServiceCard
                  name={service.name}
                  shortName={service.shortName}
                  description={service.description}
                  icon={service.icon}
                  href={`/services/${service.slug}`}
                />
              </Reveal>
            ))}
          </div>

          <nav aria-label="Related resources" className="mt-14 border-t border-neutral-200 pt-6">
            <h2 className="font-serif text-xl font-bold text-navy mb-3">Related resources</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {RELATED_RESOURCES.map((r) => (
                <li key={r.href}>
                  <Link to={r.href} className="text-navy font-medium underline underline-offset-2 decoration-neutral-300 hover:decoration-teal hover:text-teal">
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>

      {/* Sister practices */}
      <CrossSell />
    </>
  );
}
