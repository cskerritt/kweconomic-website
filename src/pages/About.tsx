import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";
import { ORG_NAME, ORG_SHORT, ORG_LEGAL, SITE_URL } from "@/lib/brand";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContactCTA from "@/components/ContactCTA";
import SchemaOrg from "@/components/SchemaOrg";
import { Picture } from "@/components/Picture";
import { graphSchema, organizationSchema, breadcrumbSchema, ORG_URL, ORG_ID, WEBSITE_ID } from "@/lib/schema";

const VALUES = [
  { title: "Objectivity", text: "Plaintiff and defense engagements accepted. The analysis follows the records and the published data." },
  { title: "Rigor", text: "Government wage and price series, published worklife tables, market yield data, and accepted valuation methods behind every figure." },
  { title: "Responsiveness", text: "Scope, timeline, and fee confirmed in writing before work begins; clear communication through delivery and testimony." },
  { title: "Integrity", text: `${ORG_SHORT} measures the loss. It does not advocate for a number.` },
];

const PAGE_URL = `${ORG_URL}/about`;
const LINK = "text-navy font-semibold underline underline-offset-2 decoration-neutral-300 hover:decoration-amber-dark hover:text-amber-dark";

export default function About() {
  usePageMeta({
    title: `About ${ORG_NAME} - Independent Forensic Economics Practice`,
    description:
      `${ORG_NAME} is an independent forensic economics practice: economic damages, business valuation, and forensic accounting analyses for plaintiff and defense.`,
    canonical: `${SITE_URL}/about`,
  });

  return (
    <>
      {/* Entity page: the Organization node, an AboutPage node that points at
          it, and the breadcrumb the page shows. Office LocalBusiness nodes stay
          on /contact, the page that prints the office NAP block. */}
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          {
            "@type": "AboutPage",
            "@id": `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: `About ${ORG_NAME}`,
            isPartOf: { "@id": WEBSITE_ID },
            about: { "@id": ORG_ID },
            mainEntity: { "@id": ORG_ID },
          },
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "About", url: PAGE_URL },
          ]),
        ])}
      />

      {/* Breadcrumb bar */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Breadcrumbs items={[{ name: "Home", url: "/" }, { name: "About", url: "/about" }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-navy via-navy to-navy-dark text-white py-16 md:py-24">
        <div className="kw-aurora" aria-hidden="true" />
        <div className="kw-grid" aria-hidden="true" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="kw-enter text-amber-light text-sm font-semibold uppercase tracking-wider mb-4">
              Who We Are
            </p>
            <h1 className="kw-enter kw-enter-1 font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
              About {ORG_NAME}
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              {ORG_NAME} is a forensic economics practice. We measure economic losses for
              litigation - lost earnings, wrongful death losses, household services, the present
              value of future care, employment damages, lost profits, and the value of business
              interests - for attorneys and their clients across all U.S. jurisdictions, and we
              testify to that work when the case requires it.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-6">
                The Practice
              </h2>
              <div className="space-y-4 text-neutral-700 leading-relaxed">
                <p>
                  {ORG_NAME} is the trade name of {ORG_LEGAL}, the forensic economics, forensic
                  accounting, and business valuation practice of a family of expert firms
                  headquartered in Hackensack, New Jersey. The economics work grew out of the
                  group's injury and disability litigation practice, where the question after
                  the medical and vocational opinions was always the same: what is the loss
                  worth? The practice now operates under its own name so that attorneys,
                  insurers, and courts can find a dedicated economics resource.
                </p>
                <p>
                  Every analysis is built from the records in the case and from published data:
                  tax returns, wage and benefit records, and financial statements on one side,
                  and government wage, price, and worklife series, market yield data, and the
                  forensic economics literature on the other. The report states each assumption
                  in plain language and presents the loss under alternative scenarios where the
                  record supports more than one reading of the facts, so the other side can
                  recompute the figure from the report alone.
                </p>
                <p>
                  {ORG_SHORT} accepts plaintiff and defense engagements equally. Opinions follow the
                  evidence.
                </p>
                <p>
                  With offices in Hackensack, NJ and Richmond, VA, {ORG_SHORT} accepts engagements
                  in all 50 states, the District of Columbia, and U.S. territories.
                </p>
                <p>
                  The{" "}
                  <Link to="/services" className={LINK}>service descriptions</Link>
                  {" "}set out each analysis the practice prepares, the{" "}
                  <Link to="/case-studies" className={LINK}>illustrative engagements</Link>
                  {" "}show how a damages figure is built, the{" "}
                  <Link to="/resources/faq" className={LINK}>attorney FAQ</Link>
                  {" "}answers the questions that come up at retention, and the{" "}
                  <Link to="/credentials" className={LINK}>credentials</Link>
                  {" "}page describes what qualifies a forensic economist to testify.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 space-y-6">
              {/* Photo */}
              <Picture
                src="/images/mentor-trainee.jpg"
                alt="Economist reviewing a damages analysis with a colleague"
                width={800}
                height={533}
                className="rounded-xl shadow-lg w-full object-cover"
                loading="lazy"
              />
              {/* Mission */}
              <div className="bg-navy-dark text-white rounded-xl p-8">
                <h3 className="font-serif text-xl font-bold mb-3">Our Mission</h3>
                <p className="text-neutral-300 leading-relaxed">
                  Independent, transparent economic damages analysis that gives courts and parties
                  a documented, reproducible measure of what a loss is worth.
                </p>
              </div>
              {/* Values */}
              <div className="bg-white rounded-xl border border-neutral-200 p-8">
                <h3 className="font-serif text-xl font-bold text-navy mb-4">Core Values</h3>
                <ul className="space-y-3">
                  {VALUES.map((v) => (
                    <li key={v.title} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber mt-2 shrink-0" />
                      <div>
                        <span className="font-semibold text-navy">{v.title}: </span>
                        <span className="text-neutral-600">{v.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Teaser */}
      <section className="py-16 bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-navy mb-4">Our Economists</h2>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">
            The practice is led by a Chief of Economic Services who directs every analysis and
            is available to testify to it, supported by an economics associate who coordinates
            each engagement with counsel. Read the background and practice areas of each member
            of the team.
          </p>
          <Link
            to="/team"
            className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Meet the Team
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactCTA />
        </div>
      </section>
    </>
  );
}
