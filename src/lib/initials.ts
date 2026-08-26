/**
 * Derive display initials from a person's name, ignoring trailing credentials
 * and middle initials. Examples:
 *   "John J. Halpin, M.A."        -> "JH"
 *   "Christopher Skerritt, M.Ed." -> "CS"
 *   "Annie Cerone"                -> "AC"
 *   "Cher"                        -> "C"
 * Used by the team directory cards and the expert profile hero for the
 * no-photo fallback. Keep this the single source of truth.
 */
export function initialsOf(name: string): string {
  // Drop anything after the first comma (credentials like ", M.A., CRC").
  const base = (name.split(",")[0] || name).trim();
  const words = base.split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  // Prefer "real" name words, dropping single-letter middle initials ("J.").
  const meaningful = words.filter((w) => w.replace(/\./g, "").length > 1);
  const pick = meaningful.length ? meaningful : words;
  const chosen = pick.length >= 2 ? [pick[0], pick[pick.length - 1]] : pick.slice(0, 1);
  return chosen.map((w) => w[0].toUpperCase()).join("");
}
