import type { ValuationResult } from "./store.mjs";

export declare function buildDocxDocument(result: ValuationResult): unknown;
export declare function buildDocxBlob(result: ValuationResult): Promise<Blob>;
export declare function buildDocxBuffer(result: ValuationResult): Promise<unknown>;
