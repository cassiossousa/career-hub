import { routePaths } from './routePaths';

describe('routePaths', () => {
  it('builds the job detail path', () => {
    expect(routePaths.jobDetail('42')).toBe('/jobs/42');
    expect(routePaths.applicationDetail('7')).toBe('/applications/7');
  });
});
