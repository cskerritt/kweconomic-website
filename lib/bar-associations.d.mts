export interface BarAssociationOption {
  value: string;
  label: string;
}
export type BarAssociationSide = "plaintiff" | "defense" | "both" | "none";
export type BarAssociationScope = "national" | "state" | "other";
export interface BarAssociationGroup {
  label: string;
  scope: BarAssociationScope;
  side: BarAssociationSide;
  options: BarAssociationOption[];
}
export interface BarAssociationMeta extends BarAssociationOption {
  group: string;
  scope: BarAssociationScope;
  side: BarAssociationSide;
}
export interface BarAssociationRow extends BarAssociationOption {
  scope: BarAssociationScope;
  side: BarAssociationSide;
  count: number;
}
export interface BarAssociationRollups {
  plaintiff: number;
  defense: number;
  both: number;
  national: number;
  state: number;
  other: number;
  none: number;
  unrecorded: number;
}
export interface BarAssociationSummary {
  total: number;
  rows: BarAssociationRow[];
  rollups: BarAssociationRollups;
  otherTexts: { text: string; count: number }[];
}
export interface BarAssociationEntry {
  barAssociation?: string;
  barAssociationOther?: string;
}
export const BAR_ASSOCIATION_GROUPS: BarAssociationGroup[];
export const BAR_ASSOCIATION_VALUES: string[];
export const BAR_ASSOCIATION_OTHER: string;
export const BAR_ASSOCIATION_NONE: string;
export const BAR_ASSOCIATION_UNRECORDED: string;
export const BAR_ASSOCIATION_OTHER_MAX_LENGTH: number;
export function isBarAssociation(value: unknown): boolean;
export function normalizeBarAssociation(raw: unknown): string;
export function sanitizeBarAssociationOther(raw: unknown): string;
export function barAssociationMeta(value: unknown): BarAssociationMeta | null;
export function barAssociationValue(entry: BarAssociationEntry): string;
export function barAssociationDisplay(entry: BarAssociationEntry): string;
export function summarizeBarAssociations(entries: BarAssociationEntry[]): BarAssociationSummary;
