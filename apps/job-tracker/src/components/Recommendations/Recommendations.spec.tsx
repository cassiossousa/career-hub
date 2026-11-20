import { screen, waitFor } from '@testing-library/react';
import {
  expectErrorWithRetry,
  expectJobTitlesRendered,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { Recommendations } from './Recommendations';

describe('Recommendations', () => {
  it('renders recommended job cards', async () => {
    renderWithProviders(<Recommendations />);
    await waitFor(() => {
      expect(
        screen.getByText(/Recommended|recommendations/i),
      ).toBeInTheDocument();
    });
    expectJobTitlesRendered();
  });

  it('shows an error state when the request fails', async () => {
    mockApiJson(
      'get',
      '/api/jobs',
      { error: { code: 'UPSTREAM', message: 'Jobs unavailable' } },
      500,
    );
    renderWithProviders(<Recommendations />);
    await expectErrorWithRetry('Jobs unavailable');
  });

  it('shows an empty state when there are no matches', async () => {
    mockApiJson('get', '/api/jobs', { jobs: [], total: 0 });
    renderWithProviders(<Recommendations />);
    expect(
      await screen.findByText('No recommended jobs at the moment.'),
    ).toBeInTheDocument();
  });
});
