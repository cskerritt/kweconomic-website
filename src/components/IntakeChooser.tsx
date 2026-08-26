// The retain-KWVRS intake chooser: the two public PSA-backed intake forms as
// equal-height cards. Shared by the Contact page's "Retain KWVRS" section and
// the standalone /intake page so the cards (and their borders) stay identical.
//
// Equal height is the point: the grid stretches each <li> to the tallest row,
// and `h-full` + `flex-col` makes each card fill its cell so the borders line
// up no matter how long the blurb is (the PI blurb wraps to several lines; the
// matrimonial one does not).

interface IntakeCard {
  href: string;
  label: string;
  blurb: string;
}

const INTAKE_CARDS: IntakeCard[] = [
  {
    href: "/contact/intake",
    label: "Start an intake",
    blurb:
      "Personal injury, medical malpractice, wrongful death, workers' compensation, matrimonial, and more - one form, adapted to your matter",
  },
];

export default function IntakeChooser({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid sm:grid-cols-2 gap-4 items-stretch ${className}`.trim()}>
      {INTAKE_CARDS.map((card) => (
        <li key={card.href} className="h-full">
          <a
            href={card.href}
            className="flex h-full flex-col rounded-lg border border-neutral-200 p-4 transition-colors hover:border-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <span className="block font-semibold text-navy">{card.label}</span>
            <span className="mt-1 block text-sm text-neutral-600">{card.blurb}</span>
            <span className="mt-auto pt-3 text-sm font-medium text-teal">Open intake form &rarr;</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
