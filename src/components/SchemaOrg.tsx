interface SchemaOrgProps {
  data: Record<string, unknown>;
}

// Every page's JSON-LD. A pure render: the build's server render
// (src/entry-server.tsx) writes it into the page body and hydrateRoot adopts
// it, so each URL carries exactly one graph. A bare node without "@context" is
// wrapped so it is still read as schema.org data. "<" is escaped as the JSON
// escape <, which keeps "</script>" and "<!--" out of the markup and is
// the same JSON value.
export default function SchemaOrg({ data }: SchemaOrgProps) {
  const payload = data["@context"] ? data : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/</g, "\\u003c") }}
    />
  );
}
