// Type declarations for the committed CDC life-table data asset
// (lib/life-tables-2023.mjs). See that file's header for provenance.

export type LifeTableGroup = "all" | "hispanic" | "aian" | "asian" | "black" | "white";
export type LifeTableSex = "total" | "male" | "female";

export interface LifeTableLeaf {
  /** CDC NVSR 74-06 table number (1 through 18). */
  table: number;
  /** Expectation of life at exact age x; index 0..100 (index 100 = "100 and older"). */
  ex: number[];
  /** Survivors to exact age x per 100,000 born alive; index 0..100. */
  lx: number[];
}

export interface LifeTableEdition {
  title: string;
  series: string;
  year: number;
  publisher: string;
  url: string;
}

export declare const LIFE_TABLES: Record<LifeTableGroup, Record<LifeTableSex, LifeTableLeaf>>;
export declare const EDITION: LifeTableEdition;
