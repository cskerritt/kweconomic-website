// Node-side mirror of src/lib/brand.ts for build scripts (prerender, sitemaps,
// llms.txt). Keep in sync with the TS module: scripts/site-brand-parity.test.mjs
// pins the shared string literals so a rebrand edit to one file cannot silently
// leave prerender/sitemaps/llms.txt on the old identity.
export const SITE_URL = "https://kweconomics.com";
export const ORG_NAME = "KW Economics";
export const ORG_SHORT = "KW Economics";
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_DISPLAY = "(201) 343-0700";
// Sister practices in the KW family (same literals as src/lib/brand.ts). Scripts
// that need the whole brand module still load it through vite (generate-llms.mjs).
export const VOC_SITE_URL = "https://kwvrs.com";
export const LCP_SITE_URL = "https://kwlcp.com";
