import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Server-render helpers shared by the page render tests. usePageMeta and the
// data-loading effects do not run under renderToStaticMarkup, so a render is
// the synchronous body plus any JSON-LD.

/** Render `Page` mounted at `routePath` for the URL `path`. */
export function renderRoute(path: string, routePath: string, Page: ComponentType): string {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element: createElement(Page) })),
    ),
  );
}

// Visible text only: attribute values (Tailwind's "flex flex-col") would trip
// a doubled-word check, so scripts and tags are stripped first. Each tag
// becomes a " | " delimiter so neighboring elements (an H1 "Business
// Valuation" beside a paragraph starting "Valuation of...", two keyword chips)
// are never read as one run of prose; only a seam inside a single text node,
// which is what a template produces, can match.
export function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " | ")
    .replace(/<[^>]+>/g, " | ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
}

/** Every JSON-LD script body on the page, joined. */
export function jsonLdBlocks(html: string): string {
  return [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join("\n");
}

/** The FAQ prose as the visitor reads it: every <details> block, tags stripped. */
export function faqText(html: string): string {
  return [...html.matchAll(/<details[\s\S]*?<\/details>/g)]
    .map((m) => visibleText(m[0]))
    .join(" | ");
}

// Question and answer strings from the FAQPage node of each JSON-LD graph.
// Scoped to that node because the organization node legitimately carries "&"
// inside its map URLs.
interface FaqQuestion { name: string; acceptedAnswer: { text: string } }
interface LdNode { "@type"?: string; mainEntity?: FaqQuestion[] }
export function faqLdStrings(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]) as LdNode & { "@graph"?: LdNode[] };
    for (const node of data["@graph"] ?? [data]) {
      if (node["@type"] !== "FAQPage") continue;
      for (const q of node.mainEntity ?? []) out.push(q.name, q.acceptedAnswer.text);
    }
  }
  return out;
}

// A word immediately repeated ("analysis analysis") is a template seam, never
// intended copy.
export const DOUBLED_WORD = /\b([a-z]{3,}) \1\b/i;

// "a" in front of a vowel-initial word ("a employment damages engagement") is
// the seam a fixed article produces when the slot it precedes can start with
// a vowel.
export const MIS_ARTICLE = /\ba [aeiou]/i;

/** The match with its surroundings, so a failure names the seam. */
export function excerpt(text: string, re: RegExp): string | undefined {
  const hit = re.exec(text);
  if (!hit) return undefined;
  return text.slice(Math.max(0, hit.index - 60), hit.index + hit[0].length + 60);
}
