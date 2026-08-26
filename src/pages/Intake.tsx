import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import IntakeChooser from "@/components/IntakeChooser";
import {
  ORG_URL,
  breadcrumbSchema,
  graphSchema,
  organizationSchema,
} from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

// Standalone landing page (kwvrs.com/intake) presenting BOTH public intake
// forms. Reuses IntakeChooser so the cards stay identical to the Contact page's
// "Retain KWVRS" section (same copy, same equal-height borders).
export default function Intake() {
  const url = `${ORG_URL}/intake`;
  usePageMeta({
    title: "Retain KWVRS - Intake Forms | KWVRS",
    description:
      "Start a KWVRS engagement. Choose the digital intake form that matches your matter - personal injury or matrimonial - each mirroring its Professional Services Agreement.",
    canonical: url,
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Intake", url },
          ]),
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Intake", url: "/intake" },
        ]}
      />

      <header className="mb-8">
        <h1 className="font-serif text-4xl text-navy mb-3">Retain KWVRS</h1>
        <p className="text-lg text-neutral-700 mb-3">
          Choose the digital intake form that matches your matter.
        </p>
        <p className="text-sm text-neutral-600">
          For each Professional Services Agreement we have a dedicated digital intake form that
          mirrors the PDF. Pick the one that applies, and we will follow up to confirm scope, send
          the agreement for electronic signature, and schedule the interview.
        </p>
      </header>

      <IntakeChooser />

      <p className="mt-8 text-sm text-neutral-600">
        Not sure which applies, or need a different agreement?{" "}
        <a href="/contact" className="text-teal font-medium hover:underline">
          Contact us
        </a>{" "}
        and we will point you to the right one.
      </p>
    </article>
  );
}
