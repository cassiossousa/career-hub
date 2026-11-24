import type { JobFilterResult } from './types/job';

export function isFilteredResult(
  result: JobFilterResult,
): result is Exclude<JobFilterResult, 'unevaluated' | 'passed'> {
  return result !== 'unevaluated' && result !== 'passed';
}
