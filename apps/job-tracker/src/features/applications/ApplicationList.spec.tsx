import { screen, waitFor } from '@testing-library/react';
import {
  expectErrorWithRetry,
  expectJobTitlesRendered,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { ApplicationList } from './ApplicationList';

describe('ApplicationList', () => {
  it('renders application cards with job titles', async () => {
    renderWithProviders(<ApplicationList />);
    await waitFor(
      () => {
        expect(screen.getByText(/Applications \(\d+\)/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expectJobTitlesRendered();
  });

  it('shows an error state when the request fails', async () => {
    mockApiJson(
      'get',
      '/api/applications',
      { error: { code: 'UPSTREAM', message: 'Applications unavailable' } },
      500,
    );
    renderWithProviders(<ApplicationList />);
    await expectErrorWithRetry('Applications unavailable');
  });

  it('shows an empty state when there are no applications', async () => {
    mockApiJson('get', '/api/applications', { applications: [] });
    renderWithProviders(<ApplicationList />);
    expect(
      await screen.findByText('No applications found.'),
    ).toBeInTheDocument();
  });
});
