// Single source of truth for KW Economics (kweconomics.com) brand identity.
// Everything that renders the org name, domain, contact details, or office NAP
// should import from here so a rebrand is a one-file change.
export const ORG_NAME = "KW Economics";
export const ORG_SHORT = "KW Economics";
export const ORG_LEGAL = "Kincaid Wolstein Economics";
export const SITE_URL = "https://kweconomics.com";
export const ORG_EMAIL = "info@kwvrs.com"; // facts-to-confirm: kweconomics.com mailbox
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_VA = "+1-804-282-4199";
export const ORG_CITY = "Hackensack";
export const ORG_STATE = "NJ";
export const ORG_COUNTRY = "US";
// Raster (PNG) logo for Organization/Article structured data - Google's
// rich-results guidelines prefer PNG/JPG over SVG for the logo/image fields.
export const ORG_LOGO = `${SITE_URL}/images/logo.png`;
// Site-wide share image: a 1200x630 (1.91:1) crop of the office photograph,
// the size Open Graph and Twitter cards display without cropping (the full
// 1200x800 file stays at /images/hero-office-meeting.jpg; final artwork is a
// facts-to-confirm item). The dimensions are published as og:image:width and
// og:image:height by index.html, use-page-meta, and the prerender shells so
// previewers never have to fetch the file to size it.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT = `${ORG_NAME} forensic economics and economic damages experts`;
// Sister practices in the KW family. These are the ONLY places their domains
// are spelled: everything else (Footer, CrossSell, data hrefs, sameAs) reads
// these constants. Scripts that need them load this module through vite or
// read the Node-side mirror in scripts/lib/site.mjs.
export const VOC_SITE_URL = "https://kwvrs.com";
export const LCP_SITE_URL = "https://kwlcp.com";
export const SAME_AS = [VOC_SITE_URL, LCP_SITE_URL] as const;

/** Human-readable phone, e.g. "+1-201-343-0700" -> "(201) 343-0700". */
export function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, "").replace(/^1/, "");
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
/** tel: href for an E.164-ish "+1-201-343-0700" string -> "tel:+12013430700". */
export const telHref = (e164: string): string => `tel:${e164.replace(/-/g, "")}`;
export const ORG_PHONE_DISPLAY = formatPhone(ORG_PHONE);
export const ORG_PHONE_VA_DISPLAY = formatPhone(ORG_PHONE_VA);

/**
 * Sister-brand forms that must not leak into this site's copy. Guard tests
 * import this so no test file needs to spell the sister names itself
 * (src/brand-strings.test.mjs walks every file). "Life care plan" as the
 * subject of a cost projection is fine; the capitalized brand form is not.
 */
export const LEGACY_BRAND_PATTERN = /KWVRS|kwvrs\.com|KW LCP|kwlcp|Kincaid Wolstein Vocational|Life Care Planning/;
export const KNOWS_ABOUT = [
  "Forensic Economics",
  "Economic Damages",
  "Lost Earnings Analysis",
  "Earning Capacity",
  "Wrongful Death Economic Loss",
  "Household Services Valuation",
  "Present Value Analysis",
  "Business Valuation",
  "Lost Profits",
  "Forensic Accounting",
  "Expert Witness Testimony",
] as const;

// Office NAP records. Used to emit one LocalBusiness per office under the
// parent ProfessionalService Organization. Geo coords are MSA-centroid level
// (not specific to building) - acceptable for LocalBusiness disambiguation.
// The Richmond record carries no streetAddress or hasMap until the street
// address is confirmed (README, facts to confirm): a placeholder such as the
// city name is not a PostalAddress and a map search query is not a place URL.
// officeSchemas() omits the undefined keys.
export interface OfficeRecord {
  id: string;
  name: string;
  streetAddress?: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
  telephone: string;
  latitude: number;
  longitude: number;
  hasMap?: string;
}
export const OFFICES: readonly OfficeRecord[] = [
  {
    id: `${SITE_URL}/#office-nj`,
    name: `${ORG_NAME} - New Jersey`,
    streetAddress: "1 University Plaza, Suite 302",
    addressLocality: "Hackensack",
    addressRegion: "NJ",
    postalCode: "07601",
    addressCountry: "US",
    telephone: ORG_PHONE,
    latitude: 40.8859,
    longitude: -74.0435,
    hasMap: "https://www.google.com/maps/search/?api=1&query=1+University+Plaza+Hackensack+NJ+07601",
  },
  {
    id: `${SITE_URL}/#office-va`,
    name: `${ORG_NAME} - Virginia`,
    addressLocality: "Richmond",
    addressRegion: "VA",
    postalCode: "23219",
    addressCountry: "US",
    telephone: ORG_PHONE_VA,
    latitude: 37.5407,
    longitude: -77.436,
  },
];
