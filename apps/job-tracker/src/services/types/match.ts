export type MatchAlgorithm = 'keyword' | 'tfidf' | 'hybrid';

type MatchBaselineKind = 'resume' | 'portfolio';

interface MatchBaseline {
  kind: MatchBaselineKind;
  locale: string | null;
  applicationId: number | null;
}

interface RequirementMatch {
  text: string;
  weight: number;
  matched: boolean;
  score: number;
}

export interface MatchResult {
  score: number; // 0-100
  algorithm: MatchAlgorithm;
  baseline: MatchBaseline;
  components: Record<string, number>;
  matchedTerms: string[];
  missingTerms: string[];
  requirements: RequirementMatch[];
}
