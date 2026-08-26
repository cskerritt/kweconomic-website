import type { RevealVariant } from "@/components/Reveal";

/**
 * Deterministic per-service motion "signature" so each service's location pages
 * animate with their own character (same service always resolves the same way,
 * which keeps prerender and client render identical). Stays within the brand:
 * only the choreography varies, not the palette.
 */
export interface ServiceMotion {
  /** Reveal direction used for the page's body sections. */
  reveal: RevealVariant;
}

const REVEALS: RevealVariant[] = ["up", "left", "right", "scale"];

function hash(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export function serviceMotion(slug: string): ServiceMotion {
  return { reveal: REVEALS[hash(slug) % REVEALS.length] };
}
