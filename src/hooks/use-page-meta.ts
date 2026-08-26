import { useEffect } from "react";
import type { PageMeta } from "@/types";

const DEFAULT_OG_IMAGE = "https://kwvrs.com/images/hero-office-meeting.jpg";
const DEFAULT_ROBOTS =
  "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1";

export function usePageMeta(meta: PageMeta | null) {
  const title = meta?.title;
  const description = meta?.description;
  const canonicalInput = meta?.canonical;
  const ogImageInput = meta?.ogImage;
  const robotsInput = meta?.robots;
  const noindexInput = meta?.noindex;
  useEffect(() => {
    if (!meta) return;
    document.title = meta.title;

    // Normalize canonical - strip trailing slash except for root
    const canonical =
      meta.canonical.endsWith("/") && meta.canonical !== "https://kwvrs.com/"
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

    const ogImage = meta.ogImage || DEFAULT_OG_IMAGE;

    setMeta("description", meta.description);
    const robots = meta.robots ?? (meta.noindex ? "noindex, follow" : DEFAULT_ROBOTS);
    setMeta("robots", robots);

    setOg("og:title", meta.title);
    setOg("og:description", meta.description);
    setOg("og:url", canonical);
    setOg("og:type", "website");
    setOg("og:image", ogImage);

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

    // hreflang: en (default), en-US (specific), x-default
    const ensureAlternate = (hreflang: string) => {
      let el = document.querySelector(
        `link[rel="alternate"][hreflang="${hreflang}"]`,
      ) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "alternate");
        el.setAttribute("hreflang", hreflang);
        document.head.appendChild(el);
      }
      el.setAttribute("href", canonical);
    };
    ensureAlternate("en");
    ensureAlternate("en-US");
    ensureAlternate("x-default");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonicalInput, ogImageInput, robotsInput, noindexInput]);
}
