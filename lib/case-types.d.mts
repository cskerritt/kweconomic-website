export type CaseTypeRoute = "wpec" | "matrimonial" | "standard";
export interface CaseTypeEntry {
  value: string;
  group: string;
  route: CaseTypeRoute;
}
export interface CaseTypeGroup {
  group: string;
  options: { value: string; label: string }[];
}
export const CASE_TYPE_GROUPS: string[];
export const CASE_TYPES: CaseTypeEntry[];
export function routeForCaseType(caseType: string): CaseTypeRoute;
export function caseTypeGroups(): CaseTypeGroup[];
