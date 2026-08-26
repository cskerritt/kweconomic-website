// Type declarations for the life-expectancy engine (lib/life-expectancy.mjs).
// Self-contained (no cross-module type import) to match the repo's d.mts
// convention (see lib/life-tables-2023.d.mts).

export type LifeTableGroup = "all" | "hispanic" | "aian" | "asian" | "black" | "white";
export type LifeTableSex = "total" | "male" | "female";

export interface LifeTableEdition {
  title: string;
  series: string;
  year: number;
  publisher: string;
  url: string;
}

export declare const EDITION: LifeTableEdition;
export declare const MAX_TABLE_AGE: 100;

export interface GroupOption {
  value: LifeTableGroup;
  label: string;
}
export interface SexOption {
  value: LifeTableSex;
  label: string;
}
export declare const GROUPS: GroupOption[];
export declare const SEXES: SexOption[];

export interface ExactAgeResult {
  years: number;
  months: number;
  days: number;
  decimal: number;
}

export declare function parseISODate(s: string): Date | null;
export declare function daysBetween(a: Date, b: Date): number;
export declare function anniversary(dob: Date, year: number): Date;
export declare function exactAge(dob: Date, asof: Date): ExactAgeResult | null;

export interface LifeExpectancyResult {
  le: number;
  loAge: number;
  hiAge: number | null;
  loEx: number;
  hiEx: number | null;
  capped: boolean;
  interpolated: boolean;
}
export declare function lifeExpectancy(exArr: number[], ageDecimal: number): LifeExpectancyResult | null;

export interface ComputeLifeExpectancyInput {
  group: LifeTableGroup;
  sex: LifeTableSex;
  ageDecimal: number;
}
export interface ComputeLifeExpectancyResult {
  remainingLE: number;
  expectedAgeAtEnd: number;
  group: LifeTableGroup;
  sex: LifeTableSex;
  table: number;
  edition: LifeTableEdition;
  capped: boolean;
  interpolated: boolean;
}
export declare function computeLifeExpectancy(
  input: ComputeLifeExpectancyInput,
): ComputeLifeExpectancyResult | null;
