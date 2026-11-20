import { screen } from '@testing-library/react';
import { mockApiJson, renderWithProviders } from '../../test/TestUtils';
import { NeedsAttention } from './NeedsAttention';

const OLD_SAVED_APP = {
  id: 9,
  jobId: 1,
  portfolioId: 1,
  status: 'saved',
  notes: null,
  appliedAt: null,
  statusChangedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
};

describe('NeedsAttention', () => {
  it('shows the empty state when nothing needs attention', async () => {
    renderWithProviders(<NeedsAttention />);
    expect(
      await screen.findByText('Nothing needs your attention right now.'),
    ).toBeInTheDocument();
  }, 30000);

  it('lists stale and long-saved applications', async () => {
    mockApiJson(
      'get',
      '/api/applications',
      { applications: [OLD_SAVED_APP], total: 1 },
      200,
    );
    renderWithProviders(<NeedsAttention />);
    expect(await screen.findByText(/Saved \d+ days ago/)).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  }, 30000);
});
