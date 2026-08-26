// Geographic prose templates - the ONE source of truth for the state/city
// narratives and geo FAQ blocks. Written as plain ESM so that both the React
// runtime (src/data/narratives.ts, src/data/geographicFaqs.ts) and the
// prerenderer (scripts/prerender.mjs, which cannot import TypeScript) render
// byte-identical copy. Inputs are plain data; the callers do the data joins.
//
// Content rules (see task 9 brief): life-care-planning framing only. Never
// print unemployment rates, wages, employer lists, or labor-force numbers.
// Population and MSA name are allowed. Citation-free: no statutes, rule
// numbers, damage caps, or case law.

/** Employer-list entries that are health systems / hospitals. */
export const HEALTH_SYSTEM_RE =
  /health|hospital|medical|medicine|cancer center|kaiser permanente|mass general/i;

/** Filter a metro's topEmployers list down to its medical centers. */
export function careMedicalCenters(topEmployers) {
  return (topEmployers ?? []).filter((name) => HEALTH_SYSTEM_RE.test(name));
}

const fmtPopulation = (n) => {
  if (typeof n !== "number" || !(n > 0)) return "";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1)} million`;
  }
  // Below a million, round to the nearest thousand so "about" is honest.
  return (Math.round(n / 1000) * 1000).toLocaleString("en-US");
};

/** "New Jersey's Superior Court" but "the Superior Court of Guam" (no doubled possessive). */
const forumPhrase = (stateName, court) =>
  court.includes(stateName) ? `The ${court}` : `${stateName}'s ${court}`;

const listNames = (names) => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

/** Territories where specialist care may require off-island travel. The
 * District of Columbia carries region "territory" in states.ts but is not an
 * island; it takes the northeast sentence. */
export const ISLAND_SLUGS = new Set([
  "puerto-rico",
  "us-virgin-islands",
  "guam",
  "american-samoa",
  "northern-mariana-islands",
]);

/** "the District of Columbia" reads as a place name; every state name does as-is. */
export const placeName = (stateName) =>
  stateName === "District of Columbia" ? "the District of Columbia" : stateName;

/** Regional cost-of-care framing. General, defensible, no figures. */
const REGION_COST = {
  northeast: (s) =>
    `Attendant-care and skilled-nursing rates in ${s} tend to run above national averages, so the plan prices those items at the rates providers in ${s} actually charge rather than at a national figure.`,
  southeast: (s) =>
    `Cost of care in ${s} varies widely between its metropolitan and rural counties, so the plan prices attendant care, home health, and specialist follow-up where the evaluee actually lives rather than at a statewide average.`,
  midwest: (s) =>
    `Cost of care in ${s} differs between its metropolitan and rural counties, and rural evaluees often travel farther for specialist care, so the plan prices each item for the evaluee's own community.`,
  west: (s) =>
    `Cost of care in ${s} varies sharply between its metropolitan areas and its rural counties, where provider availability drives the price of the same item of care, so the plan is priced for the evaluee's own community.`,
  territory: (s) =>
    `Provider availability in ${s} is narrower than on the mainland, and some specialist care must be priced for off-island travel, so the plan documents where each service can realistically be obtained.`,
};

const isCompForum = (agency) =>
  /workers|compensation|industrial|labor|insurance|workforce|fondo/i.test(agency ?? "");

/**
 * State narrative.
 * @param {{ orgName: string, stateName: string, stateSlug?: string, region?: string, population?: number,
 *   trialCourtName?: string, supremeCourt?: string, federalDistrictCount?: number,
 *   careOversightAgency?: string }} input
 * @returns {{ directAnswer: string, careContext: string, legalContext: string }}
 */
export function buildStateNarrative(input) {
  const {
    orgName,
    stateName,
    stateSlug,
    region,
    population,
    trialCourtName,
    supremeCourt,
    federalDistrictCount = 0,
    careOversightAgency,
  } = input;

  const place = placeName(stateName);
  const isIsland = ISLAND_SLUGS.has(stateSlug ?? "");
  const regionKey = region === "territory" && !isIsland ? "northeast" : region;
  const regionCost = REGION_COST[regionKey] ?? REGION_COST.southeast;
  const directAnswer = [
    `${orgName} prepares life care plans and future medical cost projections for matters venued in ${place}.`,
    regionCost(place),
    "Plaintiff and defense.",
  ].join(" ");

  const pop = fmtPopulation(population);
  const level = isIsland ? "community" : "county";
  const careParts = [];
  careParts.push(
    pop
      ? `With about ${pop} residents, ${place} is priced at the ${level} level: attendant-care, home health, and skilled-nursing rates are surveyed from providers serving the evaluee's own community, and physician and therapy follow-up is priced where the evaluee can realistically obtain it.`
      : `${place} is priced at the ${level} level: attendant-care, home health, and skilled-nursing rates are surveyed from providers serving the evaluee's own community, and physician and therapy follow-up is priced where the evaluee can realistically obtain it.`,
  );
  careParts.push(
    `Where a needed specialty or rehabilitation facility is not available locally, the plan budgets travel to the nearest center that offers it and documents the provider behind every rate.`,
  );
  const careContext = careParts.join(" ");

  const legalParts = [];
  const forum = trialCourtName ?? "general-jurisdiction trial court";
  legalParts.push(
    `${forumPhrase(stateName, forum)} is the primary trial-level forum for the personal injury and medical malpractice claims these plans support.`,
  );
  if (careOversightAgency) {
    legalParts.push(
      isCompForum(careOversightAgency)
        ? `Workers' compensation claims, where the plan is offered on future medical exposure, are administered by the ${careOversightAgency}.`
        : `The ${careOversightAgency} oversees the licensed providers and facilities whose rates the plan relies on.`,
    );
  }
  if (supremeCourt) legalParts.push(`Final state-court appeals run to the ${supremeCourt}.`);
  if (federalDistrictCount > 0) {
    legalParts.push(
      `${place} is served by ${federalDistrictCount} federal district court${federalDistrictCount === 1 ? "" : "s"}.`,
    );
  }
  const legalContext = legalParts.join(" ");

  return { directAnswer, careContext, legalContext };
}

/**
 * City narrative.
 * @param {{ orgName: string, stateName: string, cityName: string, county?: string,
 *   msaName?: string, medicalCenters?: string[], hasMetroData?: boolean,
 *   trialCourtName?: string }} input
 * @returns {{ directAnswer: string, blurb: string }}
 */
export function buildCityNarrative(input) {
  const {
    orgName,
    stateName,
    cityName,
    county,
    msaName,
    medicalCenters = [],
    hasMetroData = false,
    trialCourtName,
  } = input;

  const centers = medicalCenters.slice(0, 3);
  let anchor;
  if (centers.length > 0) {
    anchor = `Care in ${cityName} is anchored by ${listNames(centers)}, and the plan prices specialist follow-up, therapy, and attendant care at ${cityName}-area provider rates.`;
  } else if (msaName) {
    anchor = `${cityName} sits in the ${msaName} metropolitan area, and the plan prices attendant care, home health, and specialist follow-up at rates surveyed from providers serving that market.`;
  } else {
    anchor = `${cityName} is priced at the local level: attendant care, home health, and specialist follow-up are surveyed from providers serving ${county ?? cityName} rather than from statewide averages.`;
  }
  const directAnswer = [
    `${orgName} prepares life care plans and future medical cost projections for cases venued in ${cityName}, ${stateName}.`,
    anchor,
    "Plaintiff and defense.",
  ].join(" ");

  const blurbParts = [];
  if (county) {
    blurbParts.push(
      trialCourtName
        ? `Civil claims arising in ${cityName} are typically heard in the ${trialCourtName} sitting in ${county}.`
        : `Civil claims arising in ${cityName} are typically heard in the trial court sitting in ${county}.`,
    );
  }
  blurbParts.push(
    hasMetroData || centers.length > 0 || msaName
      ? `The plan documents the provider behind every rate so counsel can trace attendant-care, equipment, and medication costs to a ${cityName}-area source.`
      : `Where a specialty or rehabilitation facility is not available near ${cityName}, the plan budgets travel to the nearest center that offers it and documents the provider behind every rate.`,
  );
  blurbParts.push(
    `In-home assessments are available for ${cityName} evaluees when the plan needs a first-hand look at the home and the existing care arrangement.`,
  );
  const blurb = blurbParts.join(" ");

  return { directAnswer, blurb };
}

/** Service x State hero sentence (ServiceState.tsx + prerender). */
export function serviceStateDirectAnswer(orgName, serviceShortName, stateName, stateNarrative) {
  return `${serviceShortName} from ${orgName} for matters venued in ${stateName}. ${stateNarrative.careContext} Plaintiff and defense.`;
}

/** Service x City hero sentence (ServiceStateCity.tsx + prerender). */
export function serviceCityDirectAnswer(orgName, serviceShortName, stateName, cityName, cityNarrative) {
  return `${serviceShortName} from ${orgName} for cases venued in ${cityName}, ${stateName}. ${cityNarrative.blurb}`;
}

// ---------------------------------------------------------------------------
// Geo FAQ blocks. 3-4 Q&A pairs per template, LCP framing, citation-free.
// ---------------------------------------------------------------------------

export function stateGeographicFaqs(orgName, stateName) {
  const place = placeName(stateName);
  return [
    {
      question: `Does ${orgName} prepare life care plans for ${place} cases?`,
      answer: `Yes. ${orgName} prepares life care plans, future medical cost projections, and plan rebuttals for attorneys handling matters venued in ${place}, for plaintiff and defense counsel alike. Plans support personal injury, medical malpractice, workers' compensation, and catastrophic injury claims, and every item is priced for the community where the evaluee lives.`,
    },
    {
      question: `How is the cost of care priced for a ${place} life care plan?`,
      answer: `Each item in the plan - attendant care, home health, therapies, equipment, medication, and physician follow-up - is priced from providers that serve the evaluee's own area of ${place}, not from a national average. The provider behind every rate is documented so the figure can be traced and defended at deposition.`,
    },
    {
      question: `Which courts in ${place} hear the cases your plans support?`,
      answer: `Personal injury and medical malpractice claims are heard in ${place}'s general-jurisdiction trial courts and, where jurisdiction allows, in the federal district courts serving the state. Workers' compensation claims proceed before the state's compensation forum. Attorneys are responsible for confirming the venue and governing rule for their specific case.`,
    },
    {
      question: `When is expert disclosure due in ${place}?`,
      answer: `Disclosure timing is typically set by the case's scheduling order or case management order. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. ${orgName} calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

export function cityGeographicFaqs(orgName, stateName, cityName) {
  const place = placeName(stateName);
  return [
    {
      question: `Does ${orgName} prepare life care plans for ${cityName}, ${place} cases?`,
      answer: `Yes. ${orgName} prepares life care plans and future medical cost projections for attorneys handling matters venued in ${cityName}, ${place}, for plaintiff and defense counsel alike. Each plan is priced for the ${cityName} area rather than from statewide or national averages.`,
    },
    {
      question: `How does a life care planner price attendant care in ${cityName}?`,
      answer: `Attendant-care and home health rates are surveyed from agencies and providers that actually serve ${cityName} evaluees, at the level of care the medical record supports. The hours, the rate, and the provider behind the rate are all documented in the plan so the cost of care can be traced and defended.`,
    },
    {
      question: `Do you conduct in-home assessments in ${cityName}, ${place}?`,
      answer: `Yes. When the plan needs a first-hand look at the home, the existing care arrangement, and accessibility needs, ${orgName} conducts in-home assessments for ${cityName} evaluees. Record-based plans and file reviews are available where an in-person visit is not required.`,
    },
  ];
}

export function serviceStateGeographicFaqs(orgName, serviceName, stateName) {
  const place = placeName(stateName);
  const svc = serviceName;
  return [
    {
      question: `Does ${orgName} provide ${svc} in ${place}?`,
      answer: `Yes. ${orgName} provides ${svc} for attorneys handling matters venued in ${place}, for plaintiff and defense counsel, with deliverables sized to the engagement scope and priced for the evaluee's own community.`,
    },
    {
      question: `What does a ${svc} engagement look like for a ${place} case?`,
      answer: `A complete engagement typically includes review of the medical record, an evaluee interview and in-home assessment where appropriate, consultation with treating providers, local cost research for attendant care, home health, equipment, and follow-up care, a written plan or report, and deposition and trial testimony when required. Scope and turnaround are calibrated to the case posture and the governing disclosure framework.`,
    },
    {
      question: `When is expert disclosure due in ${place}?`,
      answer: `Disclosure timing is typically set by the scheduling order in the case. Attorneys are responsible for confirming the specific deadlines for their case against primary sources. ${orgName} calibrates engagement scope and turnaround to the disclosure window.`,
    },
  ];
}

export function serviceCityGeographicFaqs(orgName, serviceName, stateName, cityName) {
  const place = placeName(stateName);
  const svc = serviceName;
  return [
    {
      question: `Does ${orgName} provide ${svc} in ${cityName}, ${place}?`,
      answer: `Yes. ${orgName} provides ${svc} for attorneys handling matters venued in ${cityName}, ${place}, for plaintiff and defense counsel across the case mix common to ${cityName} matters.`,
    },
    {
      question: `How is the cost of care in ${cityName} handled in the plan?`,
      answer: `Attendant care, home health, therapies, equipment, medication, and physician follow-up are priced from providers serving the ${cityName} area, with ${place} statewide data used only where a local rate is unavailable. The provider behind every rate is documented so the cost of care can be traced and defended.`,
    },
    {
      question: `What deliverables are available for a ${cityName} case?`,
      answer: `${orgName} provides full life care plans, future medical cost projections, plan reviews and rebuttals, and Medicare set-aside allocations, sized to both trial-track and settlement matters. The appropriate deliverable depends on case posture.`,
    },
  ];
}
