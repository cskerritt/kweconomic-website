import { Briefcase, HeartPulse } from "lucide-react";
import { VOC_SERVICE_URL, LCP_SERVICE_URL } from "@/lib/brand";

// The only component allowed to name the sister practices and their domains:
// it hands vocational and life care planning work to the practices that
// perform it. Links are plain follow links (no nofollow) - same ownership
// group. The hrefs are the verified sister-site service pages (brand.ts).
const SISTER = [
  {
    name: "Vocational Evaluation",
    href: VOC_SERVICE_URL,
    blurb: "Employability, earning capacity foundations, and vocational rehabilitation opinions from Kincaid Wolstein Vocational and Rehabilitation Services (KWVRS).",
    Icon: Briefcase,
  },
  {
    name: "Life Care Planning",
    href: LCP_SERVICE_URL,
    blurb: "Physician-informed life care plans and medical cost projections from KW Life Care Planning, priced to present value by our economists.",
    Icon: HeartPulse,
  },
];

export default function CrossSell() {
  return (
    <section aria-labelledby="cross-sell-heading" className="bg-neutral-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 id="cross-sell-heading" className="font-serif text-2xl text-navy">Part of the Kincaid Wolstein family of expert practices</h2>
        <p className="mt-2 max-w-2xl text-neutral-600">Economic damages rarely stand alone. When a matter also needs a vocational opinion on post-injury work capacity or a life care plan to be authored, our sister practices coordinate directly with the economist so the opinions reconcile.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {SISTER.map(({ name, href, blurb, Icon }) => (
            <a key={href} href={href} rel="noopener" className="group rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-amber">
              <Icon className="h-6 w-6 text-amber" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-navy group-hover:text-amber">{name}</h3>
              <p className="mt-1 text-sm text-neutral-600">{blurb}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
