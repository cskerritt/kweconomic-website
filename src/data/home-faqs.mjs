// Homepage FAQ copy shared by the React page (src/pages/Home.tsx) and the
// static shell (scripts/prerender.mjs) so the FAQPage JSON-LD and the visible
// <details> block carry exactly the copy the hydrated page renders. Plain ESM
// (like geo-prose.mjs) because prerender.mjs runs under node, not vite.

/** @returns {{ question: string; answer: string }[]} */
export function homepageFaqs(orgName, orgShort) {
  return [
    {
      question: "What is a life care plan?",
      answer:
        "A life care plan is a dynamic document, based on published standards of practice, comprehensive assessment, data analysis, and research, that identifies the current and future medical, rehabilitative, and support needs of an individual with a catastrophic injury or chronic health condition and the cost of meeting those needs over the person's life expectancy.",
    },
    {
      question: `Does ${orgShort} work for plaintiff and defense?`,
      answer: `Yes. ${orgName} accepts retentions from both plaintiff and defense counsel. The methodology is identical regardless of which side commissions the plan. That is the foundation of being treated as a credible, independent expert under any admissibility standard.`,
    },
    {
      question: "Who prepares the plan?",
      answer:
        "Plans are developed by certified life care planners with a board-certified physician life care planner on the team. Every recommendation is tied to the medical record, treating-provider input, and published clinical practice guidelines.",
    },
    {
      question: "How long does a life care plan take?",
      answer:
        "Most life care plans and medical cost projections are delivered 30 to 90 days after records are received, depending on the complexity of the injury, the volume of records, and whether an in-person or remote evaluation is required. Expedited timelines are considered case by case.",
    },
    {
      question: "How much does a life care plan cost?",
      answer:
        "Engagements are billed hourly across records review, evaluation, plan development, and, if needed, deposition or trial testimony. The fee depends on the injury, the record volume, and the scope of the plan. We confirm scope and fee in writing before any work begins.",
    },
    {
      question: `Where does ${orgShort} provide services?`,
      answer: `${orgName} accepts engagements in all 50 states, the District of Columbia, and U.S. territories, with state-specific cost research on every state and city page. Offices are in Hackensack, New Jersey, and Richmond, Virginia.`,
    },
  ];
}
