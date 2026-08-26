interface SchemaOrgProps {
  data: Record<string, unknown>;
}

export default function SchemaOrg({ data }: SchemaOrgProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
