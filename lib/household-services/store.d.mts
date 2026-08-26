// Type surface for the browser-safe household-services store (store.mjs). Mirrors
// the runtime shapes so the React pages and report builders are fully typed.

export interface HsvActivityDef {
  key: string;
  label: string;
  codes?: string[];
}
export interface HsvHours {
  mean: number;
  se: number;
}
export interface HsvCell {
  n: number;
  thin: boolean;
  hours: Record<string, HsvHours>;
}
export type HsvAreaType = "national" | "state" | "msa";
export interface HsvArea {
  code: string;
  name: string;
  type: HsvAreaType;
  state?: string;
}
export interface HsvAtusMeta {
  source?: string;
  years: number[];
  weight?: string;
  sample_floor?: number;
  generated?: string;
  citation?: string;
}
export interface HsvOewsMeta {
  source?: string;
  vintage: string;
  generated?: string;
}
export interface HsvAtusDoc {
  meta: HsvAtusMeta;
  activities: HsvActivityDef[];
  dimensions: Record<string, string[]>;
  cells: Record<string, HsvCell>;
  rollups: Record<string, HsvCell>;
}
export interface HsvOewsDoc {
  meta: HsvOewsMeta;
  occupations: Record<string, { title: string }>;
  areas: HsvArea[];
  wages: Record<string, Record<string, { mean: number | null; median: number | null }>>;
}
export interface HsvCrosswalkActivity {
  soc: string[];
  rationale?: string;
}
export interface HsvCrosswalkDoc {
  generalist: string;
  activities: Record<string, HsvCrosswalkActivity>;
}

export type WageStat = "mean" | "median";
export type RollupKind = null | "child" | "child_marital";

export interface PerActivity {
  key: string;
  label: string;
  hoursDay: number;
  se: number;
  soc: string;
  socTitle: string;
  wage: number | null;
  wageArea: string | null;
  wageFallback: string | null;
  daily: number | null;
  weekly: number | null;
  annual: number | null;
}
export interface MethodTotal {
  daily: number;
  weekly: number;
  annual: number;
}
export interface Totals {
  hoursDay: number;
  occupation: MethodTotal;
  generalist: MethodTotal & { rate: number };
  composite: MethodTotal & { rate: number };
}
export interface Valuation {
  perActivity: PerActivity[];
  totals: Totals;
}
export interface LookupParams {
  sex: string;
  age_band: string;
  employment: string;
  married: string;
  youngest_child: string;
  area: string;
  wageStat: WageStat;
  allowThin?: boolean;
  age?: number | string;
  state?: string;
  metro?: string;
}
export interface ValuationResult {
  inputs: LookupParams;
  cell: { key: string; n: number; thin: boolean; rollup: RollupKind };
  valuation: Valuation;
  meta: { atus: HsvAtusMeta; oews: HsvOewsMeta; area: HsvArea };
}
export interface FindCellResult {
  entry: HsvCell;
  cellKey: string;
  rollup: RollupKind;
  thin: boolean;
}
export interface ResolvedWage {
  value: number;
  area: string;
  areaName: string;
  fallback: string | null;
  title: string;
}
export interface HsvStore {
  atusMeta: HsvAtusMeta;
  oewsMeta: HsvOewsMeta;
  activities: HsvActivityDef[];
  dimensions: Record<string, string[]>;
  crosswalk: HsvCrosswalkDoc;
  areas(): HsvArea[];
  ageToBand(age: number | string): string | null;
  findCell(d: Partial<LookupParams>, opts?: { allowThin?: boolean }): FindCellResult;
  resolveWages(areaCode: string, wageStat: WageStat): Record<string, ResolvedWage>;
  lookup(p: LookupParams): ValuationResult;
}

export declare function createStore(
  atusDoc: HsvAtusDoc,
  oewsDoc: HsvOewsDoc,
  crosswalkDoc: HsvCrosswalkDoc,
): HsvStore;
export declare function ageToBand(age: number | string): string | null;
