// Server-side lead validation. Returns an error string or null.
export const isEmail = (v) => typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(v.trim());
export const isPhone = (v) => typeof v === "string" && v.replace(/\D/g, "").length >= 10;

export function validateRoute(type, data) {
  if (!isEmail(data.email)) return "a valid email is required";
  if (type === "contact" && !isPhone(data.phone)) return "a valid phone number is required";
  if (type === "consultation" && data.phone && !isPhone(data.phone)) return "a valid phone number is required";
  if (type === "whitepaper" && typeof data.slug !== "string") return "slug is required";
  return null;
}
