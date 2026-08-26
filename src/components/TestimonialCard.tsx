import type { Testimonial } from "@/data/testimonials";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="kw-lift bg-white rounded-xl border border-neutral-200 p-6 flex flex-col h-full relative hover:shadow-lg hover:border-neutral-300">
      {/* Placeholder label */}
      {testimonial.isPlaceholder && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber/10 text-amber-dark border border-amber/20">
            Sample - Replace
          </span>
        </div>
      )}

      {/* Opening quote mark */}
      <div className="text-teal text-6xl font-serif leading-none mb-2 select-none" aria-hidden="true">
        &ldquo;
      </div>

      {/* Quote */}
      <blockquote className="italic text-neutral-700 leading-relaxed flex-1 mb-6">
        {testimonial.quote}
      </blockquote>

      {/* Case type badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal/10 text-teal">
          {testimonial.caseType}
        </span>
      </div>

      {/* Author */}
      <div className="border-t border-neutral-100 pt-4">
        <p className="font-semibold text-navy text-sm">{testimonial.author}</p>
        {(testimonial.title || testimonial.firm) && (
          <p className="text-neutral-500 text-xs mt-0.5">
            {[testimonial.title, testimonial.firm].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
