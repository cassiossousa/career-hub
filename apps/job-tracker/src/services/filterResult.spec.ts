import { filterResultLabelKey, isFilteredResult } from './filterResult';
import type { JobFilterResult } from './types/job';

describe('filterResult', () => {
  it('maps every JobFilterResult to a dictionary label key', () => {
    const results: JobFilterResult[] = [
      'unevaluated',
      'passed',
      'filtered_level',
      'filtered_location',
      'filtered_area',
      'filtered_remote',
      'filtered_age',
    ];
    for (const result of results) {
      expect(filterResultLabelKey[result]).toBeTruthy();
    }
  });

  it('isFilteredResult excludes unevaluated and passed', () => {
    expect(isFilteredResult('filtered_level')).toBe(true);
    expect(isFilteredResult('unevaluated')).toBe(false);
    expect(isFilteredResult('passed')).toBe(false);
  });
});
