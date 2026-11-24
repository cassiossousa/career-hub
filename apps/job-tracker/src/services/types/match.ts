import type { Schemas, Wire } from './contract';

export const MATCH_ALGORITHMS = [
  'keyword',
  'tfidf',
  'hybrid',
] as const satisfies readonly Schemas['MatchAlgorithm'][];

export type MatchAlgorithm = Schemas['MatchAlgorithm'];

export const MATCH_BASELINE_KINDS = [
  'resume',
  'portfolio',
] as const satisfies readonly Schemas['MatchBaselineKind'][];

export type MatchBaselineKind = Schemas['MatchBaselineKind'];

export type MatchBaseline = Wire<Schemas['MatchBaselineSchema']>;

export type RequirementMatch = Wire<Schemas['RequirementMatchSchema']>;

export type MatchResult = Wire<Schemas['MatchResponse']>;
