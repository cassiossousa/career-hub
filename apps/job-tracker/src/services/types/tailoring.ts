import type { Schemas, Wire } from './contract';

export const TAILORING_GUIDANCE = [
  'emphasize_matched_terms',
  'address_missing_terms',
  'strengthen_summary',
  'tag_bullets_with_skills',
  'keep_facts_unchanged',
  'review_before_submit',
] as const satisfies readonly Schemas['TailoringGuidance'][];

export type TailoringGuidance = Schemas['TailoringGuidance'];

export type TailoringSuggestions = Wire<
  Schemas['TailoringSuggestionsResponse']
>;

/** Backend ``guard_report`` shape: pass/fail plus violation codes. */
export interface TailoringGuard {
  passed: boolean;
  violations: string[];
}

/** Contract is ``dict[str, object]``; the service always emits the guard shape. */
export type TailoredResume = Omit<
  Wire<Schemas['TailoredResumeResponse']>,
  'guard'
> & { guard: TailoringGuard };

export type RankedMatch = Wire<Schemas['RankedMatchSchema']>;

export type MatchRankResponse = Wire<Schemas['MatchRankResponse']>;

export type DuplicateGroup = Wire<Schemas['DuplicateGroupSchema']>;

export type DuplicateGroupList = Wire<Schemas['DuplicateGroupListResponse']>;
