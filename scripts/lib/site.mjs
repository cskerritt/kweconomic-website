// Node-side mirror of src/lib/brand.ts for build scripts (prerender, sitemaps,
// llms.txt). Keep in sync with the TS module.
export const SITE_URL = "https://kwlcp.com";
export const ORG_NAME = "KW Life Care Planning";
export const ORG_SHORT = "KW LCP";
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_DISPLAY = "(201) 343-0700";
// Sister-practice URLs deliberately live only in src/lib/brand.ts; scripts that
// need them load that module through vite (see generate-llms.mjs).
