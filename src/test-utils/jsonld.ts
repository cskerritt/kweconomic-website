import { expect } from "vitest";
import { states } from "@/data/states";
import { jsonLdBlocks } from "./markup";

// JSON-LD helpers shared by the page render tests: the nodes of every graph on
// a page, the Service nodes among them, and the one assertion every template
// that carries a Service node makes after the 2026-09-05 audit (T03): the node
// identifies the page itself. The Service builder (src/lib/schema.ts) takes
// the page's canonical URL and derives nothing from a slug, so the synthetic
// /services aliases that answered 404 (state-*, city-*, cred-*, or a pillar
// slug hyphen-joined to a place) cannot be emitted by any template.

export interface LdNode {
  "@type"?: string;
  "@id"?: string;
  url?: string;
  name?: string;
  [key: string]: unknown;
}

/** Every node of every JSON-LD graph on the page (a bare node counts as a one-node graph). */
export function ldNodes(html: string): LdNode[] {
  const out: LdNode[] = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]) as LdNode & { "@graph"?: LdNode[] };
    out.push(...(data["@graph"] ?? [data]));
  }
  return out;
}

/** The Service nodes on the page. */
export function serviceNodes(html: string): LdNode[] {
  return ldNodes(html).filter((n) => n["@type"] === "Service");
}

// The aliases the builder used to derive from a composite slug: a state-, city-,
// or cred- prefix, or a pillar slug joined to a state slug by a hyphen where a
// real route has a slash (/services/<pillar>-<state> vs /services/<pillar>/<state>).
const GEO_ALIAS = `/services/[a-z0-9-]+-(${states.map((s) => s.slug).join("|")})(?=[-"#/]|$)`;
export const SYNTHETIC_SERVICE_ALIAS = new RegExp(`/services/(state-|city-|cred-)|${GEO_ALIAS}`);

/**
 * Every Service node on the page has `url` equal to the page canonical and
 * `@id` equal to `${canonical}#service`, and no JSON-LD on the page names a
 * synthetic /services alias.
 */
export function expectServiceIdentity(html: string, canonical: string): void {
  const nodes = serviceNodes(html);
  expect(nodes.length, `${canonical}: Service node present`).toBeGreaterThan(0);
  for (const node of nodes) {
    expect(node.url, `${canonical}: Service url`).toBe(canonical);
    expect(node["@id"], `${canonical}: Service @id`).toBe(`${canonical}#service`);
  }
  expect(jsonLdBlocks(html), `${canonical}: synthetic /services alias`).not.toMatch(SYNTHETIC_SERVICE_ALIAS);
}
