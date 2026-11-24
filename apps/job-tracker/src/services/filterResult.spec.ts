import { isFilteredResult } from './filterResult';
import { JOB_FILTER_RESULTS } from './types/job';

describe('filterResult', () => {
  it('isFilteredResult is true exactly for the filtered_* results', () => {
    for (const result of JOB_FILTER_RESULTS) {
      expect(isFilteredResult(result)).toBe(result.startsWith('filtered_'));
    }
  });
});
