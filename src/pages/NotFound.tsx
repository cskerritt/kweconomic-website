import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function NotFound() {
  usePageMeta({
    title: "Page Not Found | KWVRS",
    description: "The page you are looking for could not be found.",
    canonical: "https://kwvrs.com/404",
    robots: "noindex,follow",
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="font-serif text-6xl text-navy mb-4">404</h1>
      <p className="text-neutral-600 text-lg mb-8">Page not found</p>
      <Link
        to="/"
        className="bg-amber-dark text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-dark transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
