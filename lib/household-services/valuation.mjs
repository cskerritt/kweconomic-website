// Pure valuation math for the Household Services Valuator. Runs unmodified in the
// browser (bundled by Vite) and in Node (tests, verification scripts) - no
// imports, no I/O. Ported verbatim from the KW-Household-Services-Valuator
// pipeline (shared/valuation.js); semantics are unchanged.
// annual = daily x 365.25; weekly = daily x 7.
export const round2 = (n) => Math.round(n * 100) / 100;

export function computeValuation({ cellEntry, activities, crosswalk, wagesForArea, wageStat }) {
  const perActivity = activities.map((a) => {
    const h = cellEntry.hours[a.key] || { mean: 0, se: 0 };
    const soc =
      crosswalk.activities[a.key].soc.find((s) => wagesForArea[s]) ??
      crosswalk.activities[a.key].soc[0];
    const w =
      wagesForArea[soc] || { value: null, area: null, areaName: null, fallback: "unavailable", title: soc };
    const daily = w.value == null ? null : round2(h.mean * w.value);
    return {
      key: a.key,
      label: a.label,
      hoursDay: h.mean,
      se: h.se,
      soc,
      socTitle: w.title,
      wage: w.value,
      wageArea: w.areaName,
      wageFallback: w.fallback,
      daily,
      weekly: daily == null ? null : round2(daily * 7),
      annual: daily == null ? null : round2(daily * 365.25),
    };
  });
  const hoursDay = round2(perActivity.reduce((s, a) => s + a.hoursDay, 0));
  const occDaily = round2(perActivity.reduce((s, a) => s + (a.daily ?? 0), 0));
  const gen = wagesForArea[crosswalk.generalist];
  const genDaily = round2(hoursDay * gen.value);
  const compRate = hoursDay === 0 ? 0 : round2(occDaily / hoursDay);
  const pack = (d) => ({ daily: round2(d), weekly: round2(d * 7), annual: round2(d * 365.25) });
  return {
    perActivity,
    totals: {
      hoursDay,
      occupation: pack(occDaily),
      generalist: { ...pack(genDaily), rate: gen.value },
      composite: { ...pack(hoursDay * compRate), rate: compRate },
    },
  };
}
