export const isNonEmpty = (v: string): boolean => v.trim() !== "";
export const isEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v.trim());
export const isPhone = (v: string): boolean => v.replace(/\D/g, "").length >= 10;
export const isZip = (v: string): boolean => /^\d{5}(-\d{4})?$/.test(v.trim());

export type Validator = (v: string) => boolean;

/**
 * Validate field values against { field: { test, message } } rules. Returns a
 * map of field -> error message containing only the fields that failed.
 */
export function validateFields(
  values: Record<string, string>,
  rules: Record<string, { test: Validator; message: string }>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, { test, message }] of Object.entries(rules)) {
    if (!test(values[field] ?? "")) errors[field] = message;
  }
  return errors;
}
