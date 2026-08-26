// The United States plaintiff-bar and defense-bar association roster behind the
// /raffle form's "Bar association membership" select, plus the pure aggregation
// the metrics surfaces run on. Imported by BOTH the React page
// (src/pages/Raffle.tsx) and the server (validation.server.mjs, lib/raffle.mjs,
// lib/raffle-metrics.mjs), so it MUST stay in lib/: the Dockerfile copies lib/
// into the runtime image and never copies src/. Pure - no I/O, no env, no fetch.
//
// VERIFICATION (2026-07-29). Two anchor directories, then EVERY entry confirmed
// against the organization's own live site (title tag, header, footer copyright,
// or bylaws text) - no name here rests on a directory listing alone. Plaintiff
// anchor: AAJ's state trial-lawyer-association affiliate roster. Defense anchor:
// DRI's State, Local and National Defense Organizations (SLDO) directory. Many
// association sites run a shared .cfm CMS that answers automated fetchers with
// 403, so those were read from live page markup via a browser user agent rather
// than trusted third-party copies. Do NOT re-research or "correct" these names
// without the same per-organization confirmation. Points a later editor will be
// tempted to get wrong:
//   - ABOTA is deliberately BALANCED (plaintiff counsel, defense counsel and
//     judges), so it sits in its own mixed group, not on the plaintiff side.
//   - DRI's current brand line is "Association of Lawyers Defending Business".
//     The older "Voice of the Defense Bar" tagline is retired.
//   - These did NOT convert to "Association for Justice" after 2007 and are
//     current as written: Arkansas, Colorado, Connecticut, Delaware, Georgia,
//     Idaho, Illinois, Indiana, Maine, Montana, New Mexico, New York State,
//     Oregon, South Dakota, Texas, Virginia and Wyoming Trial Lawyers
//     Associations, plus Massachusetts Academy of Trial Attorneys, Missouri
//     Association of Trial Attorneys and Nebraska Association of Trial Attorneys.
//   - Kansas renamed to "Association for Justice" in 2007 and renamed BACK to
//     Kansas Trial Lawyers Association by board action in December 2016.
//     Tennessee likewise reverted; its June 2025 bylaws read "Tennessee Trial
//     Lawyers Association". Any source dated inside those windows is stale.
//   - Illinois' defense bar is now "Illinois Defense Counsel"; the old
//     "Illinois Association of Defense Trial Counsel" name is retired.
//   - Maine, New Hampshire and Vermont share ONE regional defense bar, the
//     Tri-State Defense Lawyers Association. DRI lists it on all three state
//     pages; there is no ME-only, NH-only or VT-only civil defense bar. It is
//     one option value here, labelled with all three jurisdictions.
//   - California has no single statewide defense bar; the two with broad
//     regional reach are both listed. Nevada has none either - Las Vegas
//     Defense Lawyers is county-scoped and is listed under the name it uses.
//   - Alaska and Hawaii have no statewide civil defense bar. DRI's pages for
//     both are stubs with no website and blank officers, and the only bodies
//     found are criminal-defense associations, which are not counterparts. The
//     defense list simply has no entry for either; the Other option covers a
//     member who belongs to something not listed.
//   - DELIBERATE EXCLUSIONS (the Other option is their home; do not add them
//     without deciding the policy question first): the New York State Academy
//     of Trial Lawyers (statewide and large, but NOT the AAJ affiliate - the
//     roster lists one org per side per state, and NYSTLA is the affiliate;
//     expect some NY plaintiff entrants to land in Other because of this);
//     the entity trading as "Vermont Trial Lawyers Association" (explicitly
//     disclaims affiliation with the listed Vermont Association for Justice);
//     city/metro-scoped defense bars (San Diego Defense Lawyers, Philadelphia
//     ADC, ADTC Detroit) and the five AAJ-recognized regional California
//     plaintiff orgs, all below the state-level granularity used here.
//   - PERIODIC RECHECK (sites showed stale footers at verification time and
//     may have gone dormant): Hawaii Association for Justice (2017 footer),
//     Oklahoma Association for Justice (2020), Georgia Defense Lawyers
//     Association (2016 carousel).
//   - Trailing ", Inc." is dropped for display consistency on several legal
//     entity names (Maryland Defense Counsel, Michigan Defense Trial Counsel,
//     Defense Association of New York, Kentucky Defense Counsel, Maryland
//     Association for Justice). South Carolina's defense bar keeps its
//     apostrophe.
// Spec: docs/superpowers/specs/2026-07-29-raffle-bar-association-design.md

// The two escape options. They are ordinary roster values (storable, countable),
// which is what keeps the field required without it ever blocking an entrant.
export const BAR_ASSOCIATION_OTHER = "Other association / not listed";
export const BAR_ASSOCIATION_NONE = "No association membership";

// The bucket every entry recorded BEFORE this field existed folds into, so an
// old ledger still reports cleanly instead of showing a blank row.
export const BAR_ASSOCIATION_UNRECORDED = "(not recorded)";

// The Other option's free-text companion. Short on purpose: it is a label for a
// report, not a note field.
export const BAR_ASSOCIATION_OTHER_MAX_LENGTH = 120;

const NATIONAL_PLAINTIFF = [
  "American Association for Justice (AAJ)",
  "The National Trial Lawyers (NTL)",
  "Public Justice",
];

// Mixed membership by design, so it gets its own group rather than a side.
const NATIONAL_MIXED = ["American Board of Trial Advocates (ABOTA)"];

const NATIONAL_DEFENSE = [
  "DRI (Association of Lawyers Defending Business)",
  "International Association of Defense Counsel (IADC)",
  "Federation of Defense & Corporate Counsel (FDCC)",
  "Association of Defense Trial Attorneys (ADTA)",
  "Product Liability Advisory Council (PLAC)",
];

// One row per jurisdiction, ordered by postal code. The AAJ affiliate network.
const STATE_PLAINTIFF = [
  { state: "AK", name: "Alaska Association for Justice" },
  { state: "AL", name: "Alabama Association for Justice" },
  { state: "AR", name: "Arkansas Trial Lawyers Association" },
  { state: "AZ", name: "Arizona Association for Justice" },
  { state: "CA", name: "Consumer Attorneys of California" },
  { state: "CO", name: "Colorado Trial Lawyers Association" },
  { state: "CT", name: "Connecticut Trial Lawyers Association" },
  { state: "DC", name: "Trial Lawyers Association of Metropolitan Washington, D.C." },
  { state: "DE", name: "Delaware Trial Lawyers Association" },
  { state: "FL", name: "Florida Justice Association" },
  { state: "GA", name: "Georgia Trial Lawyers Association" },
  { state: "HI", name: "Hawaii Association for Justice" },
  { state: "IA", name: "Iowa Association for Justice" },
  { state: "ID", name: "Idaho Trial Lawyers Association" },
  { state: "IL", name: "Illinois Trial Lawyers Association" },
  { state: "IN", name: "Indiana Trial Lawyers Association" },
  { state: "KS", name: "Kansas Trial Lawyers Association" },
  { state: "KY", name: "Kentucky Justice Association" },
  { state: "LA", name: "Louisiana Association for Justice" },
  { state: "MA", name: "Massachusetts Academy of Trial Attorneys" },
  { state: "MD", name: "Maryland Association for Justice" },
  { state: "ME", name: "Maine Trial Lawyers Association" },
  { state: "MI", name: "Michigan Association for Justice" },
  { state: "MN", name: "Minnesota Association for Justice" },
  { state: "MO", name: "Missouri Association of Trial Attorneys" },
  { state: "MS", name: "Mississippi Association for Justice" },
  { state: "MT", name: "Montana Trial Lawyers Association" },
  { state: "NC", name: "North Carolina Advocates for Justice" },
  { state: "ND", name: "North Dakota Association for Justice" },
  { state: "NE", name: "Nebraska Association of Trial Attorneys" },
  { state: "NH", name: "New Hampshire Association for Justice" },
  { state: "NJ", name: "New Jersey Association for Justice" },
  { state: "NM", name: "New Mexico Trial Lawyers Association" },
  { state: "NV", name: "Nevada Justice Association" },
  { state: "NY", name: "New York State Trial Lawyers Association" },
  { state: "OH", name: "Ohio Association for Justice" },
  { state: "OK", name: "Oklahoma Association for Justice" },
  { state: "OR", name: "Oregon Trial Lawyers Association" },
  { state: "PA", name: "Pennsylvania Association for Justice" },
  { state: "RI", name: "Rhode Island Association for Justice" },
  { state: "SC", name: "South Carolina Association for Justice" },
  { state: "SD", name: "South Dakota Trial Lawyers Association" },
  { state: "TN", name: "Tennessee Trial Lawyers Association" },
  { state: "TX", name: "Texas Trial Lawyers Association" },
  { state: "UT", name: "Utah Association for Justice" },
  { state: "VA", name: "Virginia Trial Lawyers Association" },
  { state: "VT", name: "Vermont Association for Justice" },
  { state: "WA", name: "Washington State Association for Justice" },
  { state: "WI", name: "Wisconsin Association for Justice" },
  { state: "WV", name: "West Virginia Association for Justice" },
  { state: "WY", name: "Wyoming Trial Lawyers Association" },
];

// DRI's state and local defense organization network. Alaska and Hawaii are
// absent (see the header). California appears twice - two regional bodies, no
// statewide one - and the Tri-State entry repeats across ME/NH/VT on purpose:
// stateOptions() below collapses a repeated NAME into one option carrying every
// jurisdiction in its label, so the value list stays free of duplicates while
// the select still shows all three.
const STATE_DEFENSE = [
  { state: "AL", name: "Alabama Defense Lawyers Association" },
  { state: "AR", name: "Arkansas Association of Defense Counsel" },
  { state: "AZ", name: "Arizona Association of Defense Counsel" },
  { state: "CA", name: "Association of Defense Counsel of Northern California and Nevada" },
  { state: "CA", name: "Association of Southern California Defense Counsel" },
  { state: "CO", name: "Colorado Defense Lawyers Association" },
  { state: "CT", name: "Connecticut Defense Lawyers Association" },
  { state: "DC", name: "District of Columbia Defense Lawyers' Association" },
  { state: "DE", name: "Defense Counsel of Delaware" },
  { state: "FL", name: "Florida Defense Lawyers Association" },
  { state: "GA", name: "Georgia Defense Lawyers Association" },
  { state: "IA", name: "Iowa Defense Counsel Association" },
  { state: "ID", name: "Idaho Association of Defense Counsel" },
  { state: "IL", name: "Illinois Defense Counsel" },
  { state: "IN", name: "Defense Trial Counsel of Indiana" },
  { state: "KS", name: "Kansas Association of Defense Counsel" },
  { state: "KY", name: "Kentucky Defense Counsel" },
  { state: "LA", name: "Louisiana Association of Defense Counsel" },
  { state: "MA", name: "Massachusetts Defense Lawyers Association" },
  { state: "MD", name: "Maryland Defense Counsel" },
  { state: "ME", name: "Tri-State Defense Lawyers Association" },
  { state: "MI", name: "Michigan Defense Trial Counsel" },
  { state: "MN", name: "Minnesota Defense Lawyers Association" },
  { state: "MO", name: "Missouri Organization of Defense Lawyers" },
  { state: "MS", name: "Mississippi Defense Lawyers Association" },
  { state: "MT", name: "Montana Defense Trial Lawyers" },
  { state: "NC", name: "North Carolina Association of Defense Attorneys" },
  { state: "ND", name: "North Dakota Defense Lawyers Association" },
  { state: "NE", name: "Nebraska Defense Counsel Association" },
  { state: "NH", name: "Tri-State Defense Lawyers Association" },
  { state: "NJ", name: "New Jersey Defense Association" },
  { state: "NM", name: "New Mexico Defense Lawyers Association" },
  { state: "NV", name: "Las Vegas Defense Lawyers" },
  { state: "NY", name: "Defense Association of New York" },
  { state: "OH", name: "Ohio Association of Civil Trial Attorneys" },
  { state: "OK", name: "Oklahoma Association of Defense Counsel" },
  { state: "OR", name: "Oregon Association of Defense Counsel" },
  { state: "PA", name: "Pennsylvania Defense Institute" },
  { state: "RI", name: "Defense Counsel of Rhode Island" },
  { state: "SC", name: "South Carolina Defense Trial Attorneys' Association" },
  { state: "SD", name: "South Dakota Defense Lawyers Association" },
  { state: "TN", name: "Tennessee Defense Lawyers Association" },
  { state: "TX", name: "Texas Association of Defense Counsel" },
  { state: "UT", name: "Utah Defense Lawyers Association" },
  { state: "VA", name: "Virginia Association of Defense Attorneys" },
  { state: "VT", name: "Tri-State Defense Lawyers Association" },
  { state: "WA", name: "Washington Defense Trial Lawyers" },
  { state: "WI", name: "Wisconsin Defense Counsel" },
  { state: "WV", name: "Defense Trial Counsel of West Virginia" },
  { state: "WY", name: "Defense Lawyers Association of Wyoming" },
];

/** National option: the name is both the stored value and the visible label. */
const nationalOptions = (names) => names.map((name) => ({ value: name, label: name }));

/**
 * State options. The VALUE is the bare organization name (stable, human
 * readable, and what every stored row and report carries); the LABEL is
 * prefixed with the jurisdictions it serves, because a list ordered by postal
 * code is otherwise hard to scan on a phone at a booth. A name appearing under
 * more than one jurisdiction collapses to ONE option whose label names them all
 * (the Tri-State defense bar), so the value list can never carry a duplicate.
 */
function stateOptions(rows) {
  const byName = new Map();
  for (const { state, name } of rows) {
    const existing = byName.get(name);
    if (existing) existing.states.push(state);
    else byName.set(name, { name, states: [state] });
  }
  return [...byName.values()].map(({ name, states }) => ({ value: name, label: `${states.join(" / ")} - ${name}` }));
}

/**
 * The LOGICAL grouping: side + scope per value, the axes every metrics rollup
 * runs on. This is NOT the select's display order anymore (Chris 2026-07-31:
 * the page groups by STATE, below) - it is the single source of truth for
 * META, BAR_ASSOCIATION_VALUES, and the "NJ / NY - Name" report labels, which
 * all keep their side/scope semantics regardless of how the page arranges the
 * options.
 */
const LOGICAL_GROUPS = Object.freeze([
  { label: "National - Plaintiff", scope: "national", side: "plaintiff", options: nationalOptions(NATIONAL_PLAINTIFF) },
  { label: "National - Plaintiff and Defense", scope: "national", side: "both", options: nationalOptions(NATIONAL_MIXED) },
  { label: "National - Defense", scope: "national", side: "defense", options: nationalOptions(NATIONAL_DEFENSE) },
  { label: "State - Plaintiff", scope: "state", side: "plaintiff", options: stateOptions(STATE_PLAINTIFF) },
  { label: "State - Defense", scope: "state", side: "defense", options: stateOptions(STATE_DEFENSE) },
  {
    label: "Other",
    scope: "other",
    side: "none",
    options: [
      { value: BAR_ASSOCIATION_OTHER, label: BAR_ASSOCIATION_OTHER },
      { value: BAR_ASSOCIATION_NONE, label: BAR_ASSOCIATION_NONE },
    ],
  },
]);

const META = new Map();
for (const group of LOGICAL_GROUPS) {
  for (const option of group.options) {
    META.set(option.value, {
      value: option.value,
      label: option.label,
      group: group.label,
      scope: group.scope,
      side: group.side,
    });
  }
}

// Full jurisdiction names for the display optgroups. Only the codes the roster
// actually uses; postal order is unreadable on a phone at a booth, full names
// alphabetize the way an attendee scans for their own state.
const STATE_NAMES = Object.freeze({
  AK: "Alaska", AL: "Alabama", AR: "Arkansas", AZ: "Arizona", CA: "California",
  CO: "Colorado", CT: "Connecticut", DC: "District of Columbia", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", IA: "Iowa", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  MA: "Massachusetts", MD: "Maryland", ME: "Maine", MI: "Michigan",
  MN: "Minnesota", MO: "Missouri", MS: "Mississippi", MT: "Montana",
  NC: "North Carolina", ND: "North Dakota", NE: "Nebraska", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NV: "Nevada", NY: "New York",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VA: "Virginia", VT: "Vermont",
  WA: "Washington", WI: "Wisconsin", WV: "West Virginia", WY: "Wyoming",
});

/**
 * The select's DISPLAY optgroups (Chris 2026-07-31): one "National" group,
 * then one group per state - each holding that state's plaintiff AND defense
 * organizations - then Other. Values are unchanged (still the bare
 * organization names the ledger and reports carry), so validation and metrics
 * are untouched. An organization serving several jurisdictions (the Tri-State
 * defense bar) appears under EACH of its states; duplicate values across
 * different optgroups are fine in a select (either pick posts the same value)
 * and BAR_ASSOCIATION_VALUES stays deduped because it derives from META, not
 * from these groups. Option labels are bare names - the optgroup already says
 * the state.
 */
function stateDisplayGroups() {
  const byState = new Map();
  for (const rows of [STATE_PLAINTIFF, STATE_DEFENSE]) {
    for (const { state, name } of rows) {
      if (!byState.has(state)) byState.set(state, []);
      byState.get(state).push({ value: name, label: name });
    }
  }
  return [...byState.entries()]
    .map(([code, options]) => ({ label: STATE_NAMES[code] || code, scope: "state", state: code, options }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const BAR_ASSOCIATION_GROUPS = Object.freeze([
  {
    label: "National",
    scope: "national",
    options: nationalOptions([...NATIONAL_PLAINTIFF, ...NATIONAL_MIXED, ...NATIONAL_DEFENSE]),
  },
  ...stateDisplayGroups(),
  {
    label: "Other",
    scope: "other",
    options: [
      { value: BAR_ASSOCIATION_OTHER, label: BAR_ASSOCIATION_OTHER },
      { value: BAR_ASSOCIATION_NONE, label: BAR_ASSOCIATION_NONE },
    ],
  },
]);

/** Every selectable value, deduped, in group order. The allow-list. */
export const BAR_ASSOCIATION_VALUES = Object.freeze([...META.keys()]);

// A select posts back exactly what it was given, so the whitespace fold is for
// direct API callers and for a value that survived a round trip through a form
// encoder - not for the page.
const canonical = (raw) => String(raw ?? "").trim().replace(/\s+/g, " ");

/** True only for a value on the roster (the two escape options included). */
export function isBarAssociation(value) {
  return META.has(canonical(value));
}

/** The roster value, or "" for anything off it. "" is what the validator rejects. */
export function normalizeBarAssociation(raw) {
  const value = canonical(raw);
  return META.has(value) ? value : "";
}

/** Group membership for a value: side + scope drive every rollup. */
export function barAssociationMeta(value) {
  return META.get(canonical(value)) || null;
}

/**
 * The Other option's free text: one line, bounded. Control characters become
 * spaces (it lands in HTML, a CSV and a log line), whitespace collapses, and the
 * result is capped. Never throws, never returns undefined.
 */
export function sanitizeBarAssociationOther(raw) {
  return String(raw ?? "")
    // Control chars, bidi overrides (which can visually reverse the text in
    // the entrant table and the Clio Grow inbox), and zero-width characters.
    .replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, BAR_ASSOCIATION_OTHER_MAX_LENGTH)
    .trim();
}

/**
 * The bucket an entry counts in. Missing and off-roster both fold to
 * "(not recorded)": entries stored before this field existed have no value at
 * all, and a junk value that somehow reached the ledger must not mint its own
 * row in the breakdown.
 */
export function barAssociationValue(entry = {}) {
  return normalizeBarAssociation(entry.barAssociation) || BAR_ASSOCIATION_UNRECORDED;
}

/**
 * The human string for an entry, or "" when nothing was recorded - callers
 * choose their own fallback (the Grow message omits the clause entirely, the
 * metrics rows print "(not recorded)"). Free text shows only under the Other
 * option; text riding alongside a real association is ignored, not printed.
 */
export function barAssociationDisplay(entry = {}) {
  const value = normalizeBarAssociation(entry.barAssociation);
  if (!value) return "";
  if (value !== BAR_ASSOCIATION_OTHER) return value;
  const text = sanitizeBarAssociationOther(entry.barAssociationOther);
  return text ? `Other - ${text}` : value;
}

/**
 * The breakdown behind /admin/raffle-leads and scripts/raffle-stats.mjs. Pure:
 * folded ledger entries in, counts out.
 *
 * `rollups` is deliberately non-overlapping on the side axis: the two escape
 * options and the unrecorded bucket get their OWN counters instead of being
 * folded into a side, so plaintiff + defense + both + other + none + unrecorded
 * always equals the total and nobody has to guess what a "plaintiff" number
 * includes. national + state covers exactly the sided entries.
 */
export function summarizeBarAssociations(entries = []) {
  const counts = new Map();
  const otherCounts = new Map();
  const rollups = { plaintiff: 0, defense: 0, both: 0, national: 0, state: 0, other: 0, none: 0, unrecorded: 0 };
  let total = 0;
  for (const entry of entries) {
    if (!entry) continue;
    total += 1;
    const value = barAssociationValue(entry);
    counts.set(value, (counts.get(value) || 0) + 1);
    if (value === BAR_ASSOCIATION_OTHER) {
      const text = sanitizeBarAssociationOther(entry.barAssociationOther);
      if (text) otherCounts.set(text, (otherCounts.get(text) || 0) + 1);
      rollups.other += 1;
      continue;
    }
    if (value === BAR_ASSOCIATION_NONE) {
      rollups.none += 1;
      continue;
    }
    const meta = barAssociationMeta(value);
    if (!meta) {
      rollups.unrecorded += 1;
      continue;
    }
    rollups[meta.side] += 1;
    rollups[meta.scope] += 1;
  }
  const rows = [...counts.entries()]
    .map(([value, count]) => {
      const meta = barAssociationMeta(value);
      return {
        value,
        label: meta ? meta.label : value,
        side: meta ? meta.side : "none",
        scope: meta ? meta.scope : "other",
        count,
      };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const otherTexts = [...otherCounts.entries()]
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));
  return { total, rows, rollups, otherTexts };
}
