import {
  ORG_NAME,
  SITE_URL,
  ORG_PHONE,
  ORG_CITY,
  ORG_STATE,
  ORG_COUNTRY,
  ORG_LOGO,
  OFFICES,
  SAME_AS,
  KNOWS_ABOUT,
} from "./brand";
export { ORG_NAME, ORG_PHONE, ORG_CITY, ORG_STATE, ORG_COUNTRY, ORG_LOGO, OFFICES };
export const ORG_URL = SITE_URL;
export const ORG_ID = `${ORG_URL}/#org`;
export const WEBSITE_ID = `${ORG_URL}/#website`;

const DEFAULT_OPENING_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "17:00",
  },
];

type JsonLd = Record<string, unknown>;

export function organizationSchema(): JsonLd {
  return {
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    additionalType: "https://schema.org/MedicalBusiness",
    name: ORG_NAME,
    url: ORG_URL,
    telephone: ORG_PHONE,
    logo: ORG_LOGO,
    image: ORG_LOGO,
    address: {
      "@type": "PostalAddress",
      addressLocality: ORG_CITY,
      addressRegion: ORG_STATE,
      addressCountry: ORG_COUNTRY,
    },
    areaServed: { "@type": "Country", name: "United States" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: ORG_PHONE,
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "en",
    },
    sameAs: [...SAME_AS],
    knowsAbout: [...KNOWS_ABOUT],
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: ORG_URL,
    name: ORG_NAME,
    publisher: { "@id": ORG_ID },
    // No SearchAction: the site has no /?q= search endpoint, so advertising one
    // only made Googlebot crawl the literal "/?q={search_term_string}" template
    // (it showed up in Search Console as a non-canonical alternate of "/").
  };
}

export function serviceSchema(args: {
  slug: string;
  name: string;
  description: string;
  areaServed?: JsonLd | string;
  offers?: JsonLd;
  dateModified?: string;
}): JsonLd {
  return {
    "@type": "Service",
    "@id": `${ORG_URL}/services/${args.slug}#service`,
    name: args.name,
    description: args.description,
    provider: { "@id": ORG_ID },
    areaServed: args.areaServed ?? { "@type": "Country", name: "United States" },
    url: `${ORG_URL}/services/${args.slug}`,
    ...(args.offers ? { offers: args.offers } : {}),
    ...(args.dateModified ? { dateModified: args.dateModified } : {}),
  };
}

/**
 * One LocalBusiness node per physical KWVRS office (Hackensack NJ + Richmond VA).
 * Use this on Home, Contact, About, and any page describing the firm.
 *
 * Do NOT use this on state/city pages where KWVRS has no physical presence.
 * For those, use {@link serviceSchema} with `areaServed` instead.
 */
export function officeSchemas(): JsonLd[] {
  return OFFICES.map((o) => ({
    "@type": "ProfessionalService",
    "@id": o.id,
    name: o.name,
    parentOrganization: { "@id": ORG_ID },
    url: ORG_URL,
    telephone: o.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: o.streetAddress,
      addressLocality: o.addressLocality,
      addressRegion: o.addressRegion,
      postalCode: o.postalCode,
      addressCountry: o.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: o.latitude,
      longitude: o.longitude,
    },
    hasMap: o.hasMap,
    openingHoursSpecification: DEFAULT_OPENING_HOURS,
    priceRange: "$$$",
    image: ORG_LOGO,
    areaServed: { "@type": "Country", name: "United States" },
  }));
}

/**
 * Single-office LocalBusiness emitter. Defaults to the NJ HQ. Pass the office
 * id (e.g. `${ORG_URL}/#office-va`) to emit the Richmond office instead.
 *
 * Prefer {@link officeSchemas} when emitting both offices on a page.
 */
export function localBusinessSchema(officeId?: string): JsonLd {
  const office =
    OFFICES.find((o) => o.id === officeId) ?? OFFICES[0];
  return officeSchemas().find((s) => s["@id"] === office.id) as JsonLd;
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Strip the [[/route|anchor]] inline-link markers (see src/lib/richtext.tsx) down
// to their anchor text, so structured-data answer text stays clean prose and no
// marker syntax leaks into the FAQPage JSON-LD.
function stripLinkMarkers(text: string): string {
  return text.replace(/\[\[\/[^|\]]*\|([^\]]+)\]\]/g, "$1");
}

export function faqPageSchema(faqs: { question: string; answer: string }[], pageUrl: string): JsonLd {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: stripLinkMarkers(f.answer) },
    })),
  };
}

export function articleSchema(args: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorSlug?: string;
  image?: string;
}): JsonLd {
  return {
    "@type": "Article",
    "@id": `${args.url}#article`,
    headline: args.title,
    description: args.description,
    url: args.url,
    mainEntityOfPage: args.url,
    image: args.image ?? ORG_LOGO,
    ...(args.datePublished ? { datePublished: args.datePublished } : {}),
    ...(args.dateModified ? { dateModified: args.dateModified } : {}),
    author: args.authorSlug
      ? { "@id": `${ORG_URL}/team/${args.authorSlug}#person` }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function blogPostingSchema(args: {
  title: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  authorSlug?: string;
  image?: string;
  wordCount?: number;
}): JsonLd {
  return {
    ...articleSchema(args),
    "@type": "BlogPosting",
    ...(args.wordCount ? { wordCount: args.wordCount } : {}),
  };
}

export function personSchema(args: {
  slug: string;
  name: string;
  jobTitle: string;
  credentials: string[];
  specialties: string[];
  imageUrl?: string;
  bio: string;
  sameAs?: string[];
}): JsonLd {
  return {
    "@type": "Person",
    "@id": `${ORG_URL}/team/${args.slug}#person`,
    name: args.name,
    jobTitle: args.jobTitle,
    description: args.bio,
    worksFor: { "@id": ORG_ID },
    hasCredential: args.credentials.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c,
    })),
    knowsAbout: args.specialties,
    ...(args.imageUrl
      ? { image: args.imageUrl.startsWith("http") ? args.imageUrl : `${ORG_URL}${args.imageUrl}` }
      : {}),
    ...(args.sameAs && args.sameAs.length ? { sameAs: args.sameAs } : {}),
  };
}

export function credentialSchema(args: {
  slug: string;
  name: string;
  abbreviation: string;
  issuer?: string;
  issuerUrl?: string;
  scope: string;
}): JsonLd {
  return {
    "@type": "EducationalOccupationalCredential",
    "@id": `${ORG_URL}/credentials/${args.slug}#credential`,
    name: args.name,
    alternateName: args.abbreviation,
    description: args.scope,
    credentialCategory: "Professional Certification",
    ...(args.issuer
      ? {
          recognizedBy: {
            "@type": "Organization",
            name: args.issuer,
            ...(args.issuerUrl ? { url: args.issuerUrl } : {}),
          },
        }
      : {}),
  };
}

export function howToSchema(args: {
  name: string;
  description: string;
  steps: string[];
}): JsonLd {
  return {
    "@type": "HowTo",
    name: args.name,
    description: args.description,
    step: args.steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}

export function graphSchema(entities: JsonLd[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@graph": entities,
  };
}
