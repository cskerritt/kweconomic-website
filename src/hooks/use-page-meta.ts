import { useContext, useEffect } from "react";
import type { PageMeta } from "@/types";
import { PageMetaContext } from "@/lib/page-meta-context";
import { resolvePageHead } from "@/lib/page-head";

/**
 * Publishes a page's <head>. In the browser this runs in an effect on every
 * route change. In the build's server render (src/entry-server.tsx) there is no
 * document: the same PageMeta goes to the collector in PageMetaContext during
 * render and scripts/prerender.mjs writes the head from resolvePageHead(meta),
 * the function the effect below uses too, so the static head and the hydrated
 * head publish the same tag set by construction. The site is single-language,
 * so no hreflang alternates are emitted on either side.
 */
export function usePageMeta(meta: PageMeta | null) {
  const collect = useContext(PageMetaContext);
  if (collect && meta) collect(meta);

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
    const head = resolvePageHead(meta);
    document.title = head.title;
    const canonical = head.canonical;

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

    setMeta("description", head.description);
    setMeta("robots", head.robots);

    setOg("og:title", head.title);
    setOg("og:description", head.description);
    setOg("og:url", canonical);
    setOg("og:type", head.ogType);
    setOg("og:image", head.ogImage);
    setOrRemoveOg("og:image:width", head.ogImageWidth);
    setOrRemoveOg("og:image:height", head.ogImageHeight);
    setOrRemoveOg("og:image:alt", head.ogImageAlt);
    setOrRemoveOg("article:published_time", head.articlePublished);
    setOrRemoveOg("article:modified_time", head.articleModified);

    setMeta("twitter:title", head.title);
    setMeta("twitter:description", head.description);
    setMeta("twitter:image", head.ogImage);

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
