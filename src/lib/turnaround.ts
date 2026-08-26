// Single frontend source of truth for the requested-turnaround field.
// Label-only model: two options, no day numbers anywhere. Standard is listed
// first so the form's radio group defaults to it.
export type TurnaroundOption = "rush" | "standard";

export const TURNAROUND_OPTIONS: { value: TurnaroundOption; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "rush", label: "Rush" },
];

export const DEFAULT_TURNAROUND: TurnaroundOption = "standard";

const LABELS: Record<TurnaroundOption, string> = {
  rush: "Rush",
  standard: "Standard",
};

/** Display label for a turnaround option. No day numbers. */
export function turnaroundLabel(opt: TurnaroundOption): string {
  return LABELS[opt];
}
