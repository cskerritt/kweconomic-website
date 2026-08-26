export type FormType = "personal-injury-intake" | "marital-intake" | "consulting-intake" | "nonmetro-intake" | "consultation" | "contact";
export interface FieldDescriptor {
  key: string;
  section: "party" | "evaluee" | "matter" | "opposing" | "billing";
  label: string;
  help: string;
  type: "text" | "email" | "tel" | "date" | "select" | "multiselect" | "radio" | "checkbox" | "textarea" | "zip";
  format?: "email" | "phone" | "zip" | "dateNotFuture" | "dateNotPast" | "enum";
  options?: string[] | { value: string; label: string }[] | ((ft: string) => string[] | { value: string; label: string }[]);
  required?: boolean | ((ft: string) => boolean);
}
export interface ResolvedField extends FieldDescriptor {
  resolvedOptions?: string[] | { value: string; label: string }[];
  resolvedRequired: boolean;
}
export interface FormOptions {
  sides: { value: string; label: string }[];
  caseTypes: string[];
  workProducts: string[];
  payments: { value: string; label: string }[];
}
export const SECTIONS: string[];
export const FIELDS: FieldDescriptor[];
export const STATE_VALUES: string[];
export const PI_SIDES: { value: string; label: string }[];
export const NONMETRO_SIDES: { value: string; label: string }[];
export const PI_PAYMENTS: { value: string; label: string }[];
export const MARITAL_PAYMENTS: { value: string; label: string }[];
export const NONMETRO_PAYMENTS: { value: string; label: string }[];
export const PI_CASE_TYPES: string[];
export const CONSULTING_CASE_TYPES: string[];
export const NONMETRO_CASE_TYPES: string[];
export const MARITAL_CASE_TYPES: string[];
export const PI_WORK_PRODUCTS: string[];
export const CONSULTING_WORK_PRODUCTS: string[];
export const NONMETRO_WORK_PRODUCTS: string[];
export const MARITAL_WORK_PRODUCTS: string[];
export const EDUCATION: string[];
export const HOW_HEARD: { value: string; label: string }[];
export type ExpertTier = "senior" | "fellow";
export const EXPERT_TIER_LABELS: Record<ExpertTier, string>;
export const RETAINED_EXPERTS: { value: string; label: string; tier: ExpertTier }[];
export function retainedExpertMeta(slug: unknown): { value: string; label: string; tier: ExpertTier } | null;
export function deriveRetainedExpertKeys(data?: Record<string, unknown>): Record<string, string>;
export function formOptions(formType: string): FormOptions;
export function workProductsFor(formType: string, data?: Record<string, unknown>): string[];
export function getFields(formType: string, data?: Record<string, unknown>): ResolvedField[];
export function validateFields(formType: string, data: Record<string, unknown>, now?: number): Record<string, string>;
export interface MissingField {
  key: string;
  label: string;
  message: string;
  type: FieldDescriptor["type"];
  options: string[] | { value: string; label: string }[];
}
export function missingRequiredFields(formType: string, data?: Record<string, unknown>): MissingField[];
export function deriveLegacyKeys(data?: Record<string, unknown>): Record<string, string>;
export function isEmail(v: unknown): boolean;
export function isPhone(v: unknown): boolean;
export function isZip(v: unknown): boolean;
export function isValidDate(v: unknown): boolean;
export function isNonFutureDate(v: unknown, now?: number): boolean;
export function isNonPastDate(v: unknown, now?: number): boolean;
