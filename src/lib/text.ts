/**
 * Truncate `text` to at most `max` characters on a WORD boundary, so a meta
 * description never ends mid-word (e.g. "...Entertainment & Recreatio"). Adds a
 * single ellipsis when the text was actually cut. Returns the input unchanged
 * when it already fits.
 */
export function truncateAtWord(text: string | undefined | null, max = 160): string {
  const s = (text ?? "").trim();
  if (s.length <= max) return s;
  // Reserve room for the ellipsis, then back up to the last word boundary.
  const slice = s.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s.,;:!?\-&]+$/, "") + "…";
}
