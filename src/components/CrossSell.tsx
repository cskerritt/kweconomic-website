import { Briefcase, TrendingUp } from "lucide-react";

// The only component on kwlcp.com allowed to name kwvrs.com and the parent
// firm by name: it hands off vocational and economic work to the sister
// practices. Links are plain follow links (no nofollow) - same ownership group.
const SISTER = [
  { name: "Vocational Expert Services", href: "https://kwvrs.com/services/vocational-expert", blurb: "Earning capacity, employability, and vocational rehabilitation opinions from Kincaid Wolstein Vocational and Rehabilitation Services.", Icon: Briefcase },
  { name: "Forensic Economics", href: "https://kwvrs.com/services/forensic-economics", blurb: "Present-value analysis of life care plan costs and lost earnings by the group's forensic economists.", Icon: TrendingUp },
];

export default function CrossSell() {
  return (
    <section aria-labelledby="cross-sell-heading" className="bg-neutral-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="cross-sell-heading" className="font-serif text-2xl text-navy">Part of the Kincaid Wolstein family of expert practices</h2>
        <p className="mt-2 max-w-2xl text-neutral-600">Life care plans rarely stand alone. When a matter also needs vocational or economic opinions, our sister practices coordinate directly with the life care planner.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {SISTER.map(({ name, href, blurb, Icon }) => (
            <a key={href} href={href} rel="noopener" className="group rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-teal">
              <Icon className="h-6 w-6 text-teal" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-navy group-hover:text-teal">{name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{blurb}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
