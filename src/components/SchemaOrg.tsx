import { useEffect } from "react";

interface SchemaOrgProps {
  data: Record<string, unknown>;
}

// Every page's JSON-LD. The static shell (scripts/prerender.mjs) writes its own
// graph into <head> tagged data-prerender="ld"; React renders into #root, so
// the shell block would otherwise sit beside this one and a rendering crawler
// would see two graphs for one URL. On mount the shell block is removed and
// only the hydrated graph remains (the two are built from the same schema.ts
// builders and share @ids, so a non-JS fetch and a rendered fetch describe the
// same entities). A bare node without "@context" is wrapped so it is still
// read as schema.org data.
export default function SchemaOrg({ data }: SchemaOrgProps) {
  useEffect(() => {
    document
      .querySelectorAll('script[type="application/ld+json"][data-prerender]')
      .forEach((s) => s.remove());
  }, []);
  const payload = data["@context"] ? data : { "@context": "https://schema.org", ...data };
  return (
    <script
      type="application/ld+json"
      // "</" inside a string would end the script element early; "<\/" is the
      // same JSON value.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload).replace(/<\//g, "<\\/") }}
    />
  );
}
