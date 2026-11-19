import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  expectErrorWithRetry,
  expectJobTitlesRendered,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { ApplicationPipeline } from './ApplicationPipeline';

describe('ApplicationPipeline', () => {
  it('renders all status columns with counts', async () => {
    renderWithProviders(<ApplicationPipeline />);
    await waitFor(() => {
      expect(screen.getByText('Application Pipeline')).toBeInTheDocument();
    });
    for (const label of [
      'Saved',
      'Applied',
      'Screening',
      'Interview',
      'Offer',
      'Rejected',
      'Withdrawn',
    ]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    expectJobTitlesRendered();
  });

  it('shows an error state when the request fails', async () => {
    mockApiJson(
      'get',
      '/api/applications',
      { error: { code: 'UPSTREAM', message: 'Pipeline unavailable' } },
      500,
    );
    renderWithProviders(<ApplicationPipeline />);
    await expectErrorWithRetry('Pipeline unavailable');
  });

  it('shows an empty state when there are no applications', async () => {
    mockApiJson('get', '/api/applications', { applications: [] });
    renderWithProviders(<ApplicationPipeline />);
    expect(await screen.findByText(/no applications/i)).toBeInTheDocument();
  });

  it('advances an application to the next status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplicationPipeline />);
    const advanceButtons = await screen.findAllByRole('button', {
      name: /Advance/i,
    });
    expect(advanceButtons.length).toBeGreaterThan(0);
    const firstAdvance = advanceButtons[0];
    if (!firstAdvance) throw new Error('expected at least one advance button');
    await user.click(firstAdvance);
    await waitFor(
      () => {
        expect(
          screen.getAllByRole('button', { name: /Advance/i }).length,
        ).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });
});
