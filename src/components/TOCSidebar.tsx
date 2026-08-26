export interface TOCItem {
  id: string;
  label: string;
}

export default function TOCSidebar({ items }: { items: TOCItem[] }) {
  if (!items.length) return null;
  return (
    <aside aria-labelledby="toc-heading" className="hidden lg:block sticky top-24 self-start w-64">
      <h2 id="toc-heading" className="text-sm font-semibold uppercase text-neutral-500 mb-3">On this page</h2>
      <ul className="space-y-2 text-sm">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-neutral-700 hover:text-navy">{it.label}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
