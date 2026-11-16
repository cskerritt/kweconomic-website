import type { PageMeta } from "@/types";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_URL,
} from "@/lib/brand";

/**
 * The resolved <head> of a page. src/hooks/use-page-meta.ts writes these
 * values into the document on every route change and src/entry-server.tsx
 * returns them to scripts/prerender.mjs for the static HTML, so the static
 * head and the hydrated head are the same strings by construction. The site is
 * single-language: no hreflang alternates on either side.
 */
export const DEFAULT_ROBOTS =
  "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";

export interface ResolvedHead {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogImage: string;
  /** Only the default image has known dimensions/alt unless the page passes them; undefined = no tag. */
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  ogType: "website" | "article";
  /** Present only on article pages. */
  articlePublished?: string;
  articleModified?: string;
}

/**
 * Absolute canonical URL with no trailing slash, except the site root (which
 * keeps it). A site-relative canonical is resolved against the site origin.
 */
export function resolveCanonical(canonical: string): string {
  const absolute = new URL(canonical, `${SITE_URL}/`).href;
  if (absolute === `${SITE_URL}/`) return absolute;
  return absolute.endsWith("/") ? absolute.slice(0, -1) : absolute;
}

export function resolvePageHead(meta: PageMeta): ResolvedHead {
  const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
  const isDefaultImage = ogImage === DEFAULT_OG_IMAGE;
  const ogType = meta.ogType ?? "website";
  return {
    title: meta.title,
    description: meta.description,
    canonical: resolveCanonical(meta.canonical),
    robots: meta.robots ?? (meta.noindex ? "noindex, follow" : DEFAULT_ROBOTS),
    ogImage,
    ogImageWidth: meta.ogImageWidth ?? (isDefaultImage ? DEFAULT_OG_IMAGE_WIDTH : undefined),
    ogImageHeight: meta.ogImageHeight ?? (isDefaultImage ? DEFAULT_OG_IMAGE_HEIGHT : undefined),
    ogImageAlt: meta.ogImageAlt ?? (isDefaultImage ? DEFAULT_OG_IMAGE_ALT : undefined),
    ogType,
    articlePublished: ogType === "article" ? meta.articlePublished : undefined,
    articleModified: ogType === "article" ? meta.articleModified : undefined,
  };
}
