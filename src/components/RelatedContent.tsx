import { Link } from "react-router-dom";

export interface RelatedItem {
  title: string;
  href: string;
  description?: string;
}

export default function RelatedContent({ items, heading = "Related" }: { items: RelatedItem[]; heading?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-12">
      <h2 id="related-heading" className="font-serif text-2xl text-navy mb-4">{heading}</h2>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((it) => (
          <li key={it.href}>
            <Link to={it.href} className="block rounded-lg border border-neutral-200 p-4 hover:border-navy hover:shadow transition">
              <div className="font-semibold text-navy">{it.title}</div>
              {it.description && <div className="text-sm text-neutral-600 mt-1">{it.description}</div>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
