// Attorney feedback shown on the home page and service pages.
//
// FACTS TO CONFIRM (tracked in README): the parent firm's public site carries
// client comments, but none of them refers to economic damages work, and the
// content plan drops every quote that does not. The entries below are
// therefore REPRESENTATIVE FEEDBACK - illustrative of the feedback the
// practice receives, written in the attorney's voice, attributed only by role,
// and labeled as representative on the card (title) and with the placeholder
// badge (isPlaceholder). Replace them with verified client quotes, attributed
// by role, before launch. Never add a client name, firm, or case identifier.

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
    id: "r1",
    quote:
      "The lost earnings report set out the earnings base, the growth rate, the worklife horizon, and the discount rate on separate schedules. We could walk the mediator through the number line by line, and the other side's economist ended up disputing one input rather than the whole analysis.",
    author: "Retaining attorney, personal injury",
    title: "Representative feedback",
    firm: "",
    caseType: "Lost Earnings",
    isPlaceholder: true,
  },
  {
    id: "r2",
    quote:
      "In a wrongful death matter the personal consumption deduction and the household services value were the two figures we expected to fight over. The report showed each one under the alternative assumptions, with the sources named, which is exactly what we needed for the deposition.",
    author: "Retaining attorney, wrongful death",
    title: "Representative feedback",
    firm: "",
    caseType: "Wrongful Death",
    isPlaceholder: true,
  },
  {
    id: "r3",
    quote:
      "The lost profits analysis was tied to our client's own financial statements and contracts, deducted the avoided costs, and addressed causation directly. It read like an analysis, not an advocacy piece, and it held up at trial.",
    author: "Retaining attorney, commercial litigation",
    title: "Representative feedback",
    firm: "",
    caseType: "Lost Profits",
    isPlaceholder: true,
  },
];
