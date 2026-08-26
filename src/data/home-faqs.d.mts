// Type declarations for src/data/home-faqs.mjs (shared by Home.tsx + prerender).
export interface HomepageFaq {
  question: string;
  answer: string;
}
export function homepageFaqs(orgName: string, orgShort: string): HomepageFaq[];
