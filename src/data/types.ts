export type SourceType = "peer-reviewed" | "gov" | "case-law" | "org";

export interface Source {
  title: string;
  url: string;
  type: SourceType;
  /**
   * Optional full APA 7 reference string (Bluebook for legal materials). When
   * present, SourcesBlock renders this as a hanging-indent bibliography entry
   * with `url` as a trailing link. Sources without `apa` render as before, so
   * existing hand-authored source lists keep working unchanged. Registry-backed
   * sources (src/data/references.ts) always carry `apa`.
   */
  apa?: string;
}

export interface Faq {
  question: string;
  answer: string;
  /** Optional registry-backed references for this answer (see refsToSources). */
  sources?: Source[];
}
