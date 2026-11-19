import type { Translation } from '../types/i18n';
import type { JobFilterResult } from './types/job';

export type FilterResultLabelKey = keyof Translation['jobs']['filterResult'];

export const filterResultLabelKey: Record<
  JobFilterResult,
  FilterResultLabelKey
> = {
  unevaluated: 'unevaluated',
  passed: 'passed',
  filtered_level: 'filteredLevel',
  filtered_location: 'filteredLocation',
  filtered_area: 'filteredArea',
  filtered_remote: 'filteredRemote',
  filtered_age: 'filteredAge',
};

export function isFilteredResult(
  result: JobFilterResult,
): result is Exclude<JobFilterResult, 'unevaluated' | 'passed'> {
  return result !== 'unevaluated' && result !== 'passed';
}
