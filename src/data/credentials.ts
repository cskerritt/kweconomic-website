import type { Faq, Source } from "./types";
import { refsToSources } from "./references";
import { states } from "./states";
import { placeName, placeAttr } from "./geo-prose.mjs";
import { ORG_NAME } from "@/lib/brand";
import { placeTitle } from "@/lib/page-titles.mjs";

/**
 * KW Economics credentials.
 *
 * One family of four pages, membership- and education-based rather than
 * certification-based, because no state licenses forensic economists and no
 * single certification defines the field. Each page explains what the
 * credential establishes about a damages expert, what it does not establish,
 * and how courts weigh it. Copy is written from the economist's standpoint.
 *
 * Copy rules: citation-free prose (no statute, rule, or case cites), hyphens
 * only, no invented statistics, no LCP or vocational vocabulary, and NEVER a
 * claim that the firm or a named person holds an association membership.
 * Whether the team's economists currently hold NAFE or AAEFE membership is a
 * facts-to-confirm item (README); until confirmed, the membership pages carry
 * `expertSlugs: []` and describe the association, not the roster.
 * `expertSlugs` is the only roster switch: the credential templates list named
 * economists from it and from nowhere else (never from a team.ts label match),
 * so an empty list guarantees that no person is attached to the credential
 * anywhere on the site. `sources` come from the registry in references.ts only.
 *
 * `category` is the schema.org credentialCategory. Nothing here is a
 * certification or a license: the forensic-economist page describes a
 * professional qualification, the association pages describe memberships, and
 * the degree page describes academic degrees.
 *
 * Build scripts (scripts/prerender.mjs, scripts/generate-sitemap.mjs,
 * scripts/generate-extra-sitemaps.mjs) read this file as text and pair
 * `slug:` with `name:` and `abbreviation:` in file order, so keep those as the
 * first three fields of every entry and never spell `slug:`/`name:` elsewhere.
 *
 * `stateReciprocity` is "na" for every state: these are national credentials
 * and no state licensure applies. Templates render "na" as
 * "Recognized nationally; no state licensure applies".
 *
 * The state tier (credentialStateHeadings, credentialStateAngle) is keyed on
 * `category`, so the qualification, membership, and degree pages each carry
 * their own title, H1, and credential x state paragraph.
 */
export type CredentialCategory = "Professional Qualification" | "Professional Membership" | "Academic Degree";

export interface Credential {
  slug: string;
  name: string;
  abbreviation: string;
  /** Schema.org credentialCategory (see credentialSchema in src/lib/schema.ts). */
  category: CredentialCategory;
  /** Hub <title> (with the brand) and meta description, written to fit the
   * SERP and to end with an answer rather than a cut-off sentence. The hub
   * template wraps both in a template literal so the prerender parity guard
   * can slot them. */
  metaTitle: string;
  metaDescription: string;
  /** Verb phrase for the state-tier description: "What {whatItEstablishes},
   * how {State} courts weigh it, ...". Names the qualification, membership,
   * or degree by what it is, never by a role. */
  whatItEstablishes: string;
  /** ISO dates for the byline. `dateModified` moves when the copy changes. */
  datePublished: string;
  dateModified: string;
  /** One sentence on what the credential adds to a state's qualification
   * inquiry; rendered after the state's expertStandard in the state lead. */
  stateLead: string;
  /** The credential x state paragraph. `{place}` renders as placeName(state)
   * ("the District of Columbia") and `{placeAttr}` as placeAttr(state)
   * ("District of Columbia matter"); see credentialStateAngle(). For the
   * membership credentials this describes verification and the ethics
   * statement only, never the roster. */
  stateAngle: string;
  issuer?: string;
  issuerUrl?: string;
  scope: string;
  requirements: string[];
  admissibilityHistory: string;
  stateReciprocity: Record<string, "full" | "limited" | "none" | "na">;
  expertSlugs: string[];
  faqs: Faq[];
  sources: Source[];
}

/** Every state, district, and territory slug mapped to "na" (no state licensure). */
function nationalOnly(): Record<string, "na"> {
  return Object.fromEntries(states.map((s) => [s.slug, "na" as const]));
}

export const credentials: Credential[] = [
  {
    slug: "forensic-economist",
    name: "Forensic Economics Expert Witness",
    abbreviation: "Forensic Economist",
    category: "Professional Qualification",
    metaTitle: "Forensic Economist Qualifications | KW Economics",
    metaDescription:
      "What a forensic economist measures, the training and published methods the role rests on, and how courts decide who may testify on damages. No license applies.",
    whatItEstablishes: "the forensic economist qualification establishes",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    stateLead:
      "The forensic economist qualification is what that inquiry examines: graduate training in economics, finance, or business, a published damages method applied to the record, and a record of reports and testimony.",
    stateAngle:
      "For a matter venued in {place}, counsel verify the qualification the same way in every venue, because no state licenses forensic economists and there is no {placeAttr} register to check. The elements are the economist's graduate training, the published method behind each component of the report, and the testimony record, and each can be examined directly: the CV, the report's stated sources, and the transcripts of prior depositions. In {place}, the same elements are what the court weighs when the opinion is challenged, so a report that ties every input to the record and names its data sources answers the qualification question before it is asked.",
    scope:
      "A forensic economist measures economic loss for litigation: the earnings, benefits, household services, business income, or asset value that a person or company lost because of an injury, a death, a wrongful employment action, a breach of contract, or a fraud, reduced to present value as of the date of trial or settlement. The role is defined by training and method rather than by a license. Its foundation is graduate study in economics, finance, or business, applied through a damages methodology that the profession has published and tested in peer-reviewed journals, and proven through reports that hold up at deposition and under cross-examination. The economist does not diagnose an injury, rate an impairment, or decide what work a person can still do; those opinions come from physicians and other retained experts, and the economist converts them into dollars with stated assumptions and identified data sources.",
    requirements: [
      "Graduate training in economics, finance, or business - an MBA, a master's degree, or a doctorate with coursework in microeconomic theory, statistics or econometrics, and financial mathematics",
      "Command of the applied damages methodology: worklife expectancy, wage growth, fringe benefit valuation, household services, present value discounting, and mitigation and offsets",
      "Working knowledge of the published literature and professional standards, including the peer-reviewed journals of the forensic economics associations",
      "Experience preparing damages reports and testifying at deposition and trial for both plaintiff and defense",
      "Adherence to a professional ethics statement that requires the same methods regardless of which side retains the economist",
    ],
    admissibilityHistory:
      "Economic damages testimony is evaluated under the reliability standards that federal courts and most state courts apply to expert opinion: the court asks whether the witness is qualified by education and experience, whether the method is one the profession recognizes and has tested, and whether it was applied to the facts of the case rather than to assumptions the record does not support. Forensic economists have a long history of admission on lost earnings, wrongful death, household services, and present value questions. When an opinion is limited or excluded, the reason is typically an input without record support, such as an unsupported work-capacity or life expectancy assumption, rather than any doubt about the discipline itself.",
    stateReciprocity: nationalOnly(),
    expertSlugs: ["christopher-skerritt"],
    faqs: [
      {
        question: "Is forensic economist a licensed title?",
        answer:
          "No. No state licenses forensic economists and no single certification defines the field. Qualification is established in each case from the witness's education, training, published methods, and testimony history, which is why these pages document those elements rather than a license number.",
      },
      {
        question: "What education does a forensic economist need?",
        answer:
          "Graduate training in economics, finance, or business is the norm. The specific degree matters less than whether the coursework covered the tools that damages work relies on: the microeconomics of wages and labor supply, statistics, financial mathematics, and the interpretation of government data series on earnings, benefits, and time use.",
      },
      {
        question: "How does a forensic economist differ from a forensic accountant?",
        answer:
          "The two overlap in commercial damages. A forensic economist projects what would have happened absent the wrongful act, using economic theory, wage and market data, and discounting. A forensic accountant reconstructs what did happen from books, records, and transactions. Lost earnings and wrongful death work is economic; fraud tracing is accounting; lost profits and business valuation draw on both, and one practice can offer both when it has the training for each.",
      },
      {
        question: "Can a forensic economist testify about what work an injured person can do?",
        answer:
          "No. The economist takes the work-capacity opinion from the treating physicians and the retained rehabilitation expert and prices its consequences: the wage difference, the lost benefits, the shortened worklife. Keeping that boundary clear is one of the first things opposing counsel tests at deposition, and a report that respects it is far harder to challenge.",
      },
    ],
    sources: refsToSources(["NAFE_ETHICS", "NAFE_JFE", "BLS_CPS"]),
  },
  {
    slug: "nafe-member",
    name: "National Association of Forensic Economics Member",
    abbreviation: "NAFE",
    category: "Professional Membership",
    metaTitle: "What NAFE Membership Establishes | KW Economics",
    metaDescription:
      "What NAFE membership establishes about a damages expert: a peer-reviewed literature and an ethics statement, not a certification. How to verify it.",
    whatItEstablishes: "NAFE membership establishes",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    stateLead:
      "NAFE membership adds a published ethics statement and a peer-reviewed literature that counsel can hold any report against; it does not replace that inquiry, and it is not a certification.",
    stateAngle:
      "NAFE membership means the same thing in {place} as anywhere else, because the association is national and no state recognizes or requires it: the economist has joined the field's professional body and agreed to its ethics statement. What that gives counsel in a matter venued in {place} is a written standard to test a report against, including an opposing report: disclosed data and assumptions, a method the economist would apply the same way for either side, and fees that do not depend on the outcome. Membership is verified with the association for the year in question rather than from a CV line, and the affiliations of the economist assigned to a matter venued in {place} are confirmed at engagement.",
    issuer: "National Association of Forensic Economics",
    issuerUrl: "https://nafe.net/",
    scope:
      "The National Association of Forensic Economics is the principal professional association for economists who work in litigation. It publishes the Journal of Forensic Economics, the peer-reviewed journal in which the methods used for lost earnings, worklife expectancy, discounting, and household services were developed and debated, and it maintains a Statement of Ethical Principles and Principles of Professional Practice that addresses engagement, compensation, diligence, disclosure of data and methods, and consistency of method regardless of which party retains the economist. Membership signals that an economist participates in that professional discourse and has agreed to its ethics statement. It is not a certification: the association does not examine members, review their reports, or attest to their competence, and a membership line on a CV should be read alongside the education and testimony record that actually qualifies the witness.",
    requirements: [
      "Professional work in forensic economics or a related field - the association is open to economists, accountants, and other practitioners who prepare or review economic damages analyses",
      "Agreement to the association's Statement of Ethical Principles and Principles of Professional Practice",
      "Current dues and good standing with the association, confirmed with the association rather than from a CV line",
      "No examination or peer review of work product is involved, so membership documents affiliation rather than tested competence",
    ],
    admissibilityHistory:
      "Courts do not require association membership to admit economic testimony, and membership alone does not establish that an opinion is reliable. What the association contributes to admissibility is indirect. The methods published in its peer-reviewed journal are the kind of tested, criticized, and refined approaches a court looks for when it asks whether a technique has been vetted by the profession, and an economist whose report follows the ethics statement - disclosing data, assumptions, and method, and applying the same approach for plaintiff and defense - has already answered most of the questions a reliability challenge raises.",
    stateReciprocity: nationalOnly(),
    expertSlugs: [],
    faqs: [
      {
        question: "Does NAFE membership mean an economist is certified?",
        answer:
          "No. NAFE is a membership association, not a certifying body. It does not examine applicants or audit reports. Membership shows that the economist has joined the field's professional community and agreed to its ethics statement; it does not test or attest to competence.",
      },
      {
        question: "Why does the NAFE ethics statement matter in a damages case?",
        answer:
          "Because it sets out, in the profession's own words, what a reliable damages analysis looks like: disclosed data and assumptions, methods the economist would apply the same way for either side, fees that do not depend on the outcome, and opinions offered only within the economist's competence. Counsel can hold any report, including an opposing one, up against those principles directly.",
      },
      {
        question: "How do I verify that an expert is a NAFE member?",
        answer:
          "Ask the expert for the membership year and confirm it with the association. A CV line is a representation, not a record, and membership can lapse. This site does not represent that any particular person is a current member; ask us directly about the affiliations of the economist assigned to your matter and we will answer specifically.",
      },
      {
        question: "What is the Journal of Forensic Economics?",
        answer:
          "The association's peer-reviewed journal. It is where much of the worklife expectancy, discounting, wage growth, and household services literature that damages reports rely on was published, refined, and criticized, which is why reports cite it when they explain their method and why courts treat those methods as tested.",
      },
    ],
    sources: refsToSources(["NAFE", "NAFE_ETHICS", "NAFE_JFE"]),
  },
  {
    slug: "aaefe-member",
    name: "American Academy of Economic and Financial Experts Member",
    abbreviation: "AAEFE",
    category: "Professional Membership",
    metaTitle: "What AAEFE Membership Establishes | KW Economics",
    metaDescription:
      "What AAEFE membership establishes about a damages expert: participation in the academy's journal and meetings, not a certification. How to verify it.",
    whatItEstablishes: "AAEFE membership establishes",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    stateLead:
      "AAEFE membership adds a curated damages literature, the academy's peer-reviewed journal, that a report's method can be measured against; it does not replace that inquiry, and it is not a certification.",
    stateAngle:
      "AAEFE membership carries no {placeAttr} recognition and needs none: the academy is a national association of economists, finance academics, and accountants who serve as experts, and membership signals participation in its journal and meetings rather than a tested qualification. Its value in a matter venued in {place} runs through the literature. When a discount rate approach, a valuation method, or a lost profits framework in a report can be traced to the academy's journal, the method has a published, criticized, and refined basis, and an opposing report that departs from that literature can be measured against it. Membership is confirmed with the academy directly, and the affiliations of the economist assigned to a matter venued in {place} are stated at engagement.",
    issuer: "American Academy of Economic and Financial Experts",
    issuerUrl: "https://aaefe.org/",
    scope:
      "The American Academy of Economic and Financial Experts is a professional association of economists, finance academics, and accountants who serve as experts in litigation. It publishes the Journal of Legal Economics, a peer-reviewed journal on the measurement of damages in personal injury, wrongful death, employment, and commercial matters, including the discount rate, valuation, and lost profits questions that arise in business disputes, and it holds meetings at which practitioners present and critique methods. Like NAFE membership, academy membership signals participation in the field's professional discourse and is not a certification or an examination. Its value to counsel is the literature it curates: an economist who can point to the academy's journal for the method in a report has a published basis for it, and an opposing report that departs from that literature can be measured against it.",
    requirements: [
      "Professional or academic work in economics, finance, or accounting applied to litigation - the academy draws members from practice and from universities",
      "Application to the academy and payment of dues under the terms the academy sets; confirm the current criteria with the academy directly",
      "Engagement with the academy's meetings and journal, which is where members present, publish, and review damages methods",
      "No examination, so membership documents affiliation and access to the literature rather than a tested qualification",
    ],
    admissibilityHistory:
      "Academy membership is not a prerequisite for admission and does not by itself establish the reliability of an opinion. Its relevance to admissibility runs through the literature: an economist who can show that a discount rate approach, a valuation method, or a lost profits framework has been published, criticized, and refined in the academy's journal has a ready answer to whether the method has been tested and accepted by peers. The qualification inquiry still turns on the individual witness's training and experience and on the fit between the method and the facts of the case.",
    stateReciprocity: nationalOnly(),
    expertSlugs: [],
    faqs: [
      {
        question: "How does AAEFE differ from NAFE?",
        answer:
          "Both are membership associations for economists and financial experts in litigation, and many practitioners belong to both. NAFE publishes the Journal of Forensic Economics and maintains a formal ethics statement; the academy publishes the Journal of Legal Economics and convenes practitioners and academics around damages and valuation questions. Neither examines or certifies its members.",
      },
      {
        question: "Is AAEFE membership a certification?",
        answer:
          "No. The academy does not test applicants or review their reports. Membership shows participation in the field; it does not attest to competence, and it should be weighed with the expert's education, methods, and testimony history.",
      },
      {
        question: "Are your economists AAEFE members?",
        answer:
          "Membership is an individual affiliation, and we confirm it per economist at engagement rather than advertising it. Our analyses follow the published standards of the forensic economics associations regardless of any individual membership, and we will tell you exactly which affiliations the economist assigned to your matter holds.",
      },
    ],
    sources: refsToSources(["AAEFE", "NAFE_ETHICS"]),
  },
  {
    slug: "graduate-economics-degree",
    name: "Graduate Economics and Business Degrees",
    abbreviation: "MBA / M.A. / Ph.D.",
    category: "Academic Degree",
    metaTitle: "Graduate Degrees of a Forensic Economist | KW Economics",
    metaDescription:
      "What graduate economics, finance, and MBA degrees establish about a damages expert, which methods each covers, and how courts weigh education with experience.",
    whatItEstablishes: "graduate economics and MBA degrees establish",
    datePublished: "2026-08-27",
    dateModified: "2026-09-02",
    stateLead:
      "A graduate degree in economics, finance, or business is the first element of that inquiry: it establishes training in the methods the opinion uses, and experience and the testimony record establish that the economist applies them reliably.",
    stateAngle:
      "Education is examined the same way in {place} as in any other venue: the question is whether the degree covered the tools the opinion actually uses. A master's or doctorate in economics supplies the theory of wages, labor supply, and market behavior behind a lost earnings or lost profits analysis, and an MBA or a master's in finance supplies the financial mathematics, valuation, and financial statement analysis behind a business valuation or a divorce financial analysis. For a matter venued in {place}, counsel can read the degree against the report: an opinion on present value, worklife, or household services sits squarely inside an economics degree, while a valuation opinion should be backed by valuation training or recognized valuation credentials as well. The degree is confirmed from the transcript or the institution, and it is weighed together with the economist's testimony record rather than on its own.",
    issuer: "Accredited Colleges and Universities",
    scope:
      "Graduate degrees in economics, finance, and business are the educational foundation of damages work. A master's or doctorate in economics supplies the theory of wages, labor supply, and market behavior that lost earnings and lost profits analyses rest on, together with the statistics and econometrics needed to use government data series correctly. An MBA or a master's in finance supplies financial mathematics, valuation, and the reading of financial statements that business valuation, lost profits, and divorce financial analyses require. Courts weigh education together with experience rather than in isolation: a doctorate does not qualify a witness to testify outside the methods they actually practice, and a master's-level economist with a record of applied damages work and testimony is routinely accepted. What matters is that the degree covered the tools the opinion uses and that the economist can explain them from first principles under cross-examination.",
    requirements: [
      "A master's or doctoral degree in economics, finance, business administration, or a closely related quantitative field from an accredited institution",
      "Graduate coursework in microeconomic theory, statistics or econometrics, and financial mathematics - the tools that worklife, growth, discounting, and valuation methods draw on",
      "For business valuation and lost profits work, training in financial statement analysis and valuation methods, whether through the degree or through recognized valuation credentials",
      "Continuing study of the peer-reviewed damages literature after the degree, since applied damages methods are learned largely from the literature and from practice rather than from degree coursework",
    ],
    admissibilityHistory:
      "Education is the first element courts examine when an economic expert is challenged, and the inquiry is practical: does the witness's training cover the method offered? A graduate degree in economics, finance, or business ordinarily settles that question for lost earnings, present value, and household services opinions. Where challenges succeed, it is usually because the opinion strayed into a field the degree does not reach, such as medical prognosis, work capacity, or accounting reconstruction, or because the witness could not explain the mechanics of the method from the underlying theory. Experience testifying and a record of reports that have survived scrutiny weigh alongside the degree.",
    stateReciprocity: nationalOnly(),
    expertSlugs: ["christopher-skerritt"],
    faqs: [
      {
        question: "Does a forensic economist need a Ph.D.?",
        answer:
          "No. A doctorate is common among academic forensic economists and helps where the dispute turns on theory or econometrics, but master's-level economists and MBA-trained analysts with applied damages experience are routinely qualified. Courts look at whether the education covers the methods actually used in the report.",
      },
      {
        question: "How does an MBA support damages work?",
        answer:
          "An MBA covers financial mathematics, valuation, financial statement analysis, and the economics of firms and markets. Those are the tools of business valuation, lost profits, and commercial damages, and they also underpin the present value and fringe benefit calculations in injury and death cases.",
      },
      {
        question: "Do courts weigh education or experience more heavily?",
        answer:
          "Both, and together. The degree establishes that the witness was trained in the discipline; testimony history and prior reports establish that the witness applies it reliably. An expert who is strong on one and weak on the other is more exposed to challenge than one with a balanced record.",
      },
      {
        question: "Can an economist with an economics degree testify on business valuation?",
        answer:
          "Only with training in valuation methods. Valuation has its own standards and its own body of methods, the income, market, and asset approaches, and an economist offering a valuation opinion should be able to show coursework or recognized valuation credentials that cover them, not general economic training alone.",
      },
    ],
    sources: refsToSources(["NAFE_JFE", "AICPA_SSVS1", "BLS_OES"]),
  },
];

export function getCredential(slug: string): Credential | undefined {
  return credentials.find((c) => c.slug === slug);
}

/** The credential x state paragraph with the place tokens resolved. */
export function credentialStateAngle(cred: Credential, stateName: string): string {
  return cred.stateAngle
    .replace(/\{place\}/g, placeName(stateName))
    .replace(/\{placeAttr\}/g, placeAttr(stateName));
}

/**
 * Title, H1, and meta description of a credential x state page, keyed on the
 * credential's category so a role is never called a credential and a
 * membership page can be read as an affiliation even out of context. The
 * attributive slots ("District of Columbia Damages Cases") take placeAttr;
 * the place slots ("in the District of Columbia") take placeName. The title
 * goes through the shared placeTitle builder (src/lib/page-titles.mjs), which
 * keeps the full place name wherever it fits the 60-character tag and falls
 * back to the state abbreviation only where it cannot; the membership titles
 * describe what the affiliation means and never that anyone holds it.
 */
export function credentialStateHeadings(cred: Credential, stateName: string): { title: string; h1: string; description: string } {
  const attr = placeAttr(stateName);
  const state = states.find((s) => s.name === stateName) ?? { name: stateName, abbreviation: attr };
  const description = `What ${cred.whatItEstablishes}, how ${attr} courts weigh it, and how to retain a forensic economist there.`;
  switch (cred.category) {
    case "Professional Membership":
      return {
        title: placeTitle(`What ${cred.abbreviation} Membership Means`, state, ORG_NAME),
        h1: `${cred.abbreviation} Membership and ${attr} Damages Testimony`,
        description,
      };
    case "Academic Degree":
      return {
        title: placeTitle("Forensic Economist Degrees", state, ORG_NAME),
        h1: `Graduate Economics Credentials for ${attr} Damages Cases`,
        description,
      };
    default:
      return {
        title: placeTitle("Vetting a Forensic Economist", state, ORG_NAME),
        h1: `Forensic Economist Qualifications for ${attr} Damages Cases`,
        description,
      };
  }
}
