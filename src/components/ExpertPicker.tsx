import { retainableExperts, EXPERT_TIER_LABELS } from "@/data/team";

/**
 * "Which KWVRS expert would you like to retain?" - the visual picker shared by
 * BOTH retainer surfaces (RetainerIntakeForm at /contact/*-intake and the
 * composite /agreements/:slug form). Optional by design: "No preference" is the
 * first option and the default, and the schema field is not required, so an
 * attorney who has no view submits exactly as before.
 *
 * Interaction rules: it is a real radio group (keyboard navigable, one name), the
 * bio sits behind a collapsed <details> rather than a hover card (hover does not
 * exist on touch), and the profile link opens in a new tab so a half-filled form
 * is never lost. The roster and its order come from src/data/team.ts, so this
 * file carries no list of people.
 */
interface Props {
  value: string;
  onChange: (slug: string) => void;
}

const TIER_BADGE: Record<string, string> = {
  senior: "bg-amber/15 text-amber-dark border-amber/40",
  fellow: "bg-teal/10 text-teal border-teal/40",
};

export default function ExpertPicker({ value, onChange }: Props) {
  const experts = retainableExperts();
  return (
    <fieldset id="retainedExpert" tabIndex={-1} className="scroll-mt-24 focus:outline-none">
      <legend className="block text-sm font-semibold text-navy mb-1">Requested KWVRS expert</legend>
      <p className="text-xs text-neutral-600 mb-3">
        Optional. Leave this on "No preference" and KWVRS assigns the expert best matched to the matter.
      </p>

      <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 mb-3 cursor-pointer hover:border-teal">
        <input
          type="radio"
          name="retainedExpert"
          value=""
          checked={value === ""}
          onChange={() => onChange("")}
        />
        <span className="text-sm text-neutral-700">No preference - let KWVRS assign</span>
      </label>

      <div className="grid sm:grid-cols-2 gap-3">
        {experts.map((m) => {
          const tier = m.expertTier as "senior" | "fellow";
          const selected = value === m.slug;
          return (
            <div
              key={m.slug}
              className={`rounded-lg border p-3 ${selected ? "border-teal bg-teal/5" : "border-neutral-200"}`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  className="mt-1"
                  name="retainedExpert"
                  value={m.slug}
                  checked={selected}
                  onChange={() => onChange(m.slug)}
                />
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    // Decorative: the name is the very next thing in the label,
                    // so an alt of the name makes a screen reader say it twice.
                    alt=""
                    loading="lazy"
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-navy">{m.name}</span>
                  <span
                    className={`inline-block mt-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TIER_BADGE[tier]}`}
                  >
                    {EXPERT_TIER_LABELS[tier]}
                  </span>
                  {m.credentials.length > 0 && (
                    <span className="block mt-1 text-xs text-neutral-600">{m.credentials.join(", ")}</span>
                  )}
                  <span className="block mt-1 text-xs text-neutral-700">{m.specialties.join(", ")}</span>
                </span>
              </label>
              <div className="mt-2 flex items-center gap-3">
                <a
                  href={`/team/${m.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-teal underline-offset-2 hover:underline"
                >
                  View profile
                </a>
                <details className="text-xs text-neutral-700">
                  <summary className="cursor-pointer font-semibold text-navy">Background</summary>
                  <p className="mt-1 leading-relaxed">{m.bio}</p>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
