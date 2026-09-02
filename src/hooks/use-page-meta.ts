import { useEffect } from "react";
import type { PageMeta } from "@/types";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_URL,
} from "@/lib/brand";

const DEFAULT_ROBOTS =
  "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";

// The head is written by scripts/prerender.mjs first (static shell) and by this
// hook after hydration; both publish the same tag set so the two views of a
// route never disagree. The site is single-language, so no hreflang alternates
// are emitted on either side.
export function usePageMeta(meta: PageMeta | null) {
  const title = meta?.title;
  const description = meta?.description;
  const canonicalInput = meta?.canonical;
  const ogImageInput = meta?.ogImage;
  const ogImageWidthInput = meta?.ogImageWidth;
  const ogImageHeightInput = meta?.ogImageHeight;
  const ogImageAltInput = meta?.ogImageAlt;
  const ogTypeInput = meta?.ogType;
  const articlePublishedInput = meta?.articlePublished;
  const articleModifiedInput = meta?.articleModified;
  const robotsInput = meta?.robots;
  const noindexInput = meta?.noindex;
  useEffect(() => {
    if (!meta) return;
    document.title = meta.title;

    // Normalize canonical - strip trailing slash except for root
    const canonical =
      meta.canonical.endsWith("/") && meta.canonical !== `${SITE_URL}/`
        ? meta.canonical.slice(0, -1)
        : meta.canonical;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Set when a value exists, otherwise remove the tag so a stale value from
    // the previous route (or the shell) never survives a client-side navigation.
    const setOrRemoveOg = (property: string, content: string | number | undefined) => {
      if (content === undefined || content === "") {
        document.querySelectorAll(`meta[property="${property}"]`).forEach((el) => el.remove());
      } else {
        setOg(property, String(content));
      }
    };

    const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;
    const isDefaultImage = ogImage === DEFAULT_OG_IMAGE;
    const ogImageWidth = meta.ogImageWidth ?? (isDefaultImage ? DEFAULT_OG_IMAGE_WIDTH : undefined);
    const ogImageHeight = meta.ogImageHeight ?? (isDefaultImage ? DEFAULT_OG_IMAGE_HEIGHT : undefined);
    const ogImageAlt = meta.ogImageAlt ?? (isDefaultImage ? DEFAULT_OG_IMAGE_ALT : undefined);
    const ogType = meta.ogType ?? "website";

    setMeta("description", meta.description);
    const robots = meta.robots ?? (meta.noindex ? "noindex, follow" : DEFAULT_ROBOTS);
    setMeta("robots", robots);

    setOg("og:title", meta.title);
    setOg("og:description", meta.description);
    setOg("og:url", canonical);
    setOg("og:type", ogType);
    setOg("og:image", ogImage);
    setOrRemoveOg("og:image:width", ogImageWidth);
    setOrRemoveOg("og:image:height", ogImageHeight);
    setOrRemoveOg("og:image:alt", ogImageAlt);
    setOrRemoveOg("article:published_time", ogType === "article" ? meta.articlePublished : undefined);
    setOrRemoveOg("article:modified_time", ogType === "article" ? meta.articleModified : undefined);

    setMeta("twitter:title", meta.title);
    setMeta("twitter:description", meta.description);
    setMeta("twitter:image", ogImage);

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    description,
    canonicalInput,
    ogImageInput,
    ogImageWidthInput,
    ogImageHeightInput,
    ogImageAltInput,
    ogTypeInput,
    articlePublishedInput,
    articleModifiedInput,
    robotsInput,
    noindexInput,
  ]);
}
