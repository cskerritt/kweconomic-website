type JsonLd = Record<string, unknown>;

const ORG_URL = "https://kwvrs.com";
const ORG_ID = `${ORG_URL}/#org`;
const PILLAR_URL = `${ORG_URL}/services/expert-disclosure`;
const PILLAR_ID = `${PILLAR_URL}#service`;

export function expertDisclosurePillarSchema(args: {
  jurisdictionCount: number;
  dateModified?: string;
}): JsonLd {
  return {
    "@type": "Service",
    "@id": PILLAR_ID,
    name: "Expert Disclosure - Pre-Trial Compliance",
    serviceType: "Expert Disclosure - State Pre-Trial Rule Compliance",
    url: PILLAR_URL,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "United States" },
    description: `Pre-trial expert disclosure deliverables for state-specific compliance rules across ${args.jurisdictionCount} US jurisdictions.`,
    ...(args.dateModified ? { dateModified: args.dateModified } : {}),
  };
}

export function disclosureStateSchema(args: {
  stateSlug: string;
  stateName: string;
  dateModified?: string;
}): JsonLd {
  const url = `${PILLAR_URL}/${args.stateSlug}`;
  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: `${args.stateName} Pre-Trial Expert Disclosure`,
    serviceType: "Pre-Trial Expert Disclosure",
    url,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "AdministrativeArea", name: args.stateName },
    isPartOf: { "@id": PILLAR_ID },
    ...(args.dateModified ? { dateModified: args.dateModified } : {}),
  };
}
