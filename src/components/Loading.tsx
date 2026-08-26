/** Shared route/data loading placeholder (Suspense fallback + async data guards). */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-live="polite">
      <div className="animate-pulse text-navy font-serif text-xl">Loading...</div>
    </div>
  );
}
