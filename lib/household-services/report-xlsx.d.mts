import type { ValuationResult } from "./store.mjs";

export declare function buildXlsxBuffer(result: ValuationResult): Promise<unknown>;
export declare function buildXlsxBlob(result: ValuationResult): Promise<Blob>;
