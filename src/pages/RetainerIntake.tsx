import { useParams, Navigate } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import SchemaOrg from "@/components/SchemaOrg";
import RetainerIntakeForm from "@/components/RetainerIntakeForm";
import { getIntakeForm, type IntakeFormSlug } from "@/data/intakeForms";
import {
  ORG_URL,
  breadcrumbSchema,
  graphSchema,
  organizationSchema,
} from "@/lib/schema";
import { usePageMeta } from "@/hooks/use-page-meta";

interface Props {
  /** Optional override; otherwise read from `:intakeSlug` route param. */
  slug?: IntakeFormSlug;
}

export default function RetainerIntake({ slug: slugProp }: Props) {
  const params = useParams<{ intakeSlug?: string }>();
  const slug = (slugProp ?? params.intakeSlug ?? "") as IntakeFormSlug;
  const spec = getIntakeForm(slug);

  const url = spec ? `${ORG_URL}/contact/${spec.slug}-intake` : "";
  usePageMeta(
    spec
      ? {
          title: `${spec.title} | KWVRS`,
          description: spec.subtitle,
          canonical: url,
        }
      : null,
  );

  if (!spec) {
    return <Navigate to="/contact" replace />;
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <SchemaOrg
        data={graphSchema([
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", url: `${ORG_URL}/` },
            { name: "Contact", url: `${ORG_URL}/contact` },
            { name: spec.title, url },
          ]),
        ])}
      />
      <Breadcrumbs
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
          { name: spec.title, url: `/contact/${spec.slug}-intake` },
        ]}
      />

      <header className="mb-8">
        <h1 className="font-serif text-4xl text-navy mb-3">{spec.title}</h1>
        <p className="text-lg text-neutral-700 mb-3">{spec.subtitle}</p>
        <p className="text-sm text-neutral-600 mb-4">{spec.description}</p>
        <p className="mb-4 text-sm text-neutral-600">
          Submit the form below. After we review your request, we will send the
          agreement to you for electronic signature.
        </p>
      </header>

      <RetainerIntakeForm spec={spec} />
    </article>
  );
}
