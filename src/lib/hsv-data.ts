// Loads the three Household Services Valuator data documents from /data/hsv/
// exactly once (module-level promise cache) and builds the browser store. The
// ATUS hours file is still being produced by the offline pipeline, so its 404 is
// an expected, non-fatal state: oews + crosswalk still load and `atusMissing` is
// surfaced so the UI can show a "data being updated" notice instead of the
// calculator.
import { createStore } from "../../lib/household-services/store.mjs";
import type {
  HsvStore,
  HsvOewsDoc,
  HsvCrosswalkDoc,
  HsvAtusDoc,
} from "../../lib/household-services/store.mjs";

export interface HsvData {
  oews: HsvOewsDoc;
  crosswalk: HsvCrosswalkDoc;
  atus: HsvAtusDoc | null;
  atusMissing: boolean;
  store: HsvStore | null;
}

let cache: Promise<HsvData> | null = null;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`Failed to load ${url} (${res.status})`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

export function loadHsvData(): Promise<HsvData> {
  if (!cache) {
    cache = (async (): Promise<HsvData> => {
      const [oews, crosswalk] = await Promise.all([
        fetchJson<HsvOewsDoc>("/data/hsv/oews_wages.json"),
        fetchJson<HsvCrosswalkDoc>("/data/hsv/crosswalk.json"),
      ]);
      let atus: HsvAtusDoc | null = null;
      let atusMissing = false;
      try {
        atus = await fetchJson<HsvAtusDoc>("/data/hsv/atus_hours.json");
      } catch (e) {
        const status = (e as { status?: number }).status;
        if (status === 404) atusMissing = true;
        else throw e;
      }
      const store = atus ? createStore(atus, oews, crosswalk) : null;
      return { oews, crosswalk, atus, atusMissing, store };
    })();
    // A rejected cache would wedge the page on a transient network blip; drop it
    // so the next mount retries. (A 404 on ATUS resolves, so it stays cached.)
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}
