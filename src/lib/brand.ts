// Single source of truth for KW Life Care Planning (kwlcp.com) brand identity.
// Everything that renders the org name, domain, contact details, or office NAP
// should import from here so a rebrand is a one-file change.
export const ORG_NAME = "KW Life Care Planning";
export const ORG_SHORT = "KW LCP";
export const ORG_LEGAL = "Kincaid Wolstein Vocational and Rehabilitation Services";
export const SITE_URL = "https://kwlcp.com";
export const ORG_EMAIL = "info@kwvrs.com"; // facts-to-confirm: kwlcp.com mailbox
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_VA = "+1-804-282-4199";
export const ORG_CITY = "Hackensack";
export const ORG_STATE = "NJ";
export const ORG_COUNTRY = "US";
// Raster (PNG) logo for Organization/Article structured data - Google's
// rich-results guidelines prefer PNG/JPG over SVG for the logo/image fields.
export const ORG_LOGO = `${SITE_URL}/images/logo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-office-meeting.jpg`;
export const SAME_AS = ["https://kwvrs.com", "https://kweconomics.com"] as const;
export const KNOWS_ABOUT = [
  "Life Care Planning",
  "Pediatric Life Care Planning",
  "Catastrophic Injury Cost Projection",
  "Medical Cost Projection",
  "Future Medical Care",
  "Medicare Set-Aside Allocation",
  "Life Care Plan Rebuttal",
  "Expert Witness Testimony",
] as const;

// Office NAP records. Used to emit one LocalBusiness per office under the
// parent ProfessionalService Organization. Geo coords are MSA-centroid level
// (not specific to building) - acceptable for LocalBusiness disambiguation.
export const OFFICES = [
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
    streetAddress: "Richmond, Virginia",
    addressLocality: "Richmond",
    addressRegion: "VA",
    postalCode: "23219",
    addressCountry: "US",
    telephone: ORG_PHONE_VA,
    latitude: 37.5407,
    longitude: -77.436,
    hasMap: "https://www.google.com/maps/search/?api=1&query=Richmond+VA+23219",
  },
] as const;
