// Browser-safe port of the KW-Household-Services-Valuator datastore
// (server/datastore.js). The Node original read data/*.json off disk with
// node:fs; here the three already-parsed JSON documents are passed in, so this
// module has ZERO Node dependencies and bundles cleanly for the client. Cell
// lookup (with rollup fallback), wage geo-resolution (msa -> state -> US), and a
// full lookup() that composes cell + wages + valuation are unchanged in
// semantics from the server version.
import { computeValuation } from "./valuation.mjs";

// Age bands must match the pipeline's hsv_config.AGE_BANDS. 75+ absorbs any age
// >= 75; ages < 18 are outside the adult-respondent frame and return null.
const AGE_BANDS = [
  ["18-24", 18, 24],
  ["25-34", 25, 34],
  ["35-44", 35, 44],
  ["45-54", 45, 54],
  ["55-64", 55, 64],
  ["65-74", 65, 74],
  ["75+", 75, 200],
];

export function ageToBand(age) {
  const n = Number(age);
  if (!Number.isFinite(n)) return null;
  for (const [label, lo, hi] of AGE_BANDS) if (n >= lo && n <= hi) return label;
  return null;
}

export function createStore(atusDoc, oewsDoc, crosswalkDoc) {
  const atus = atusDoc,
    oews = oewsDoc,
    crosswalk = crosswalkDoc;
  const areaByCode = new Map(oews.areas.map((a) => [a.code, a]));

  function findCell(d, { allowThin = false } = {}) {
    const key = [d.sex, d.age_band, d.employment, d.married, d.youngest_child].join("|");
    const exact = atus.cells[key];
    if (exact && (!exact.thin || allowThin))
      return { entry: exact, cellKey: key, rollup: null, thin: exact.thin };
    const r1 = atus.rollups[[d.sex, d.age_band, d.employment, d.married, "*"].join("|")];
    if (r1 && !r1.thin) return { entry: r1, cellKey: key, rollup: "child", thin: false };
    const r2 = atus.rollups[[d.sex, d.age_band, d.employment, "*", "*"].join("|")];
    if (r2) return { entry: r2, cellKey: key, rollup: "child_marital", thin: r2.thin };
    if (exact) return { entry: exact, cellKey: key, rollup: null, thin: exact.thin };
    throw new Error(`no data for cell ${key}`);
  }

  function chain(code) {
    const a = areaByCode.get(code);
    if (!a) throw new Error(`unknown area ${code}`);
    if (a.type === "msa") return [[code, null], [`S:${a.state}`, "msa→state"], ["US", "msa→national"]];
    if (a.type === "state") return [[code, null], ["US", "state→national"]];
    return [["US", null]];
  }

  function resolveWages(areaCode, wageStat) {
    const socs = new Set([
      crosswalk.generalist,
      ...Object.values(crosswalk.activities).flatMap((a) => a.soc),
    ]);
    const out = {};
    for (const soc of socs) {
      for (const [code, fb] of chain(areaCode)) {
        const v = oews.wages[code]?.[soc]?.[wageStat];
        if (v != null) {
          out[soc] = {
            value: v,
            area: code,
            areaName: areaByCode.get(code).name,
            fallback: fb,
            title: oews.occupations[soc]?.title ?? soc,
          };
          break;
        }
      }
    }
    return out;
  }

  function lookup(p) {
    for (const dim of ["sex", "age_band", "employment", "married", "youngest_child"])
      if (!atus.dimensions[dim].includes(p[dim])) throw new Error(`invalid ${dim}`);
    if (!["mean", "median"].includes(p.wageStat)) throw new Error("invalid wageStat");
    const cell = findCell(p, { allowThin: p.allowThin === true });
    const wagesForArea = resolveWages(p.area, p.wageStat);
    const valuation = computeValuation({
      cellEntry: cell.entry,
      activities: atus.activities,
      crosswalk,
      wagesForArea,
      wageStat: p.wageStat,
    });
    return {
      inputs: p,
      cell: { key: cell.cellKey, n: cell.entry.n, thin: cell.thin, rollup: cell.rollup },
      valuation,
      meta: { atus: atus.meta, oews: oews.meta, area: areaByCode.get(p.area) },
    };
  }

  return {
    atusMeta: atus.meta,
    oewsMeta: oews.meta,
    activities: atus.activities,
    dimensions: atus.dimensions,
    crosswalk,
    areas: () => oews.areas,
    ageToBand,
    findCell,
    resolveWages,
    lookup,
  };
}
