import { testimonials } from "@/data/testimonials";
import TestimonialCard from "@/components/TestimonialCard";
import { ORG_NAME } from "@/lib/brand";

interface TestimonialSectionProps {
  /** Indices of testimonials to display. Defaults to [0, 1, 2]. */
  indices?: [number, number, number];
}

export default function TestimonialSection({ indices = [0, 1, 2] }: TestimonialSectionProps) {
  const displayed = indices.map((i) => testimonials[i]).filter(Boolean);

  return (
    <section className="py-16 md:py-24 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-4">
            What Attorneys Say
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {ORG_NAME} works with plaintiff and defense attorneys. Our economists deliver independent, objective analysis grounded in accepted
            methods and published data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayed.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
