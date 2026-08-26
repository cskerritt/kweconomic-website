import type { ValuationResult } from "./store.mjs";

export declare const HSV_TITLE: string;
export declare const HSV_PREPARED_BY: string;
export declare const METHOD_LABELS: { occupation: string; generalist: string; composite: string };

export declare function usd(n: number | null): string;
export declare function usd0(n: number | null): string;
export declare function num(n: number | null, d?: number): string;
export declare function yearsLabel(years: number[]): string;
export declare function vintageLine(result: ValuationResult): string;
export declare function fallbackLabel(fb: string | null): string;
export declare function inputRows(result: ValuationResult): Array<[string, string]>;
export declare function sampleNote(result: ValuationResult): {
  count: number;
  base: string;
  warning: string | null;
};
export declare function methodologySummary(result: ValuationResult): string;
export declare function citations(result: ValuationResult): string[];
