// Client testimonials sourced from kwvrs.com.
// Attribution is limited on the public source (most are "Client Comment").
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
    id: "1",
    quote:
      "With your assistance as our expert, we were able to reach a favorable settlement in this case.",
    author: "Retaining Attorney",
    title: "Client Comment",
    firm: "",
    caseType: "Settlement",
    isPlaceholder: false,
  },
  {
    id: "3",
    quote:
      "The matter was settled on a minimally compromised basis, to the satisfaction of the insurance company.",
    author: "Retaining Counsel",
    title: "Client Comment",
    firm: "",
    caseType: "Insurance Matter",
    isPlaceholder: false,
  },
  {
    id: "4",
    quote:
      "Thank you for your assistance in this matter. The expert report you provided was a very helpful tool in resolving this matter.",
    author: "Retaining Attorney",
    title: "Client Comment",
    firm: "",
    caseType: "Expert Report",
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
