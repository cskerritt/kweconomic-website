// Runtime brand literals for the production server (server.js and lib/*).
// The runtime image copies server.js + lib/ only (see Dockerfile), never
// scripts/ or src/, so these cannot be imported from scripts/lib/site.mjs or
// src/lib/brand.ts. scripts/site-brand-parity.test.mjs pins every literal here
// to those files so a rebrand cannot leave the lead email or the server log on
// the old identity. Sister-practice names and domains are never spelled here.
export const ORG_NAME = "KW Economics";
export const SITE_URL = "https://kweconomics.com";
export const ORG_PHONE = "+1-201-343-0700";
export const ORG_PHONE_DISPLAY = "(201) 343-0700";
