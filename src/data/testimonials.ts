// Client testimonials sourced from the parent firm's public site.
// Attribution is limited on the public source (most are "Client Comment").
// Only quotes that are compatible with a life-care-planning engagement are
// kept; outcome-focused or insurance-specific quotes were dropped for this site.
// Set isPlaceholder: true and use bracketed placeholder text to flag any
// entries that still need replacement.

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  title: string;
  firm: string;
  caseType: string;
  isPlaceholder: boolean;
}

export const testimonials: Testimonial[] = [
  {
    id: "4",
    quote:
      "Thank you for your assistance in this matter. The expert report you provided was a very helpful tool in resolving this matter.",
    author: "Retaining Attorney",
    title: "Client Comment",
    firm: "",
    caseType: "Life Care Plan Report",
    isPlaceholder: false,
  },
  {
    id: "5",
    quote:
      "I enjoyed working with you very much, and thank you for your consistent availability as well as your insight.",
    author: "Retaining Attorney",
    title: "Client Comment",
    firm: "",
    caseType: "Expert Engagement",
    isPlaceholder: false,
  },
  {
    id: "6",
    quote:
      "The matter was resolved with a favorable disposition. Thank you for your help in this matter.",
    author: "Retaining Attorney",
    title: "Client Comment",
    firm: "",
    caseType: "Case Resolution",
    isPlaceholder: false,
  },
];
