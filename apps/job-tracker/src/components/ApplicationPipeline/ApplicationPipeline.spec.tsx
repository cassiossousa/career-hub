import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { seedApplications } from '../../mocks/data';
import { APPLICATION_STATUS_ORDER } from '../../services/types/application';
import {
  expectErrorWithRetry,
  expectJobTitlesRendered,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { ApplicationPipeline } from './ApplicationPipeline';

describe('ApplicationPipeline', () => {
  it('renders a tab per status with application counts', async () => {
    renderWithProviders(<ApplicationPipeline />);
    await waitFor(() => {
      expect(screen.getByText('Application Pipeline')).toBeInTheDocument();
    });
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(APPLICATION_STATUS_ORDER.length);
    for (const label of [
      'Saved',
      'Applied',
      'Screening',
      'Interview',
      'Offer',
      'Rejected',
      'Withdrawn',
      'No response',
    ]) {
      expect(
        screen.getByRole('tab', { name: new RegExp(`^${label} \\(`) }),
      ).toBeInTheDocument();
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
    mockApiJson('get', '/api/applications', {
      applications: [],
      total: 0,
    });
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
    // Count before clicking: the mock PATCH mutates the shared seed objects.
    const expectedApplied =
      seedApplications.filter((a) => a.status === 'applied').length + 1;
    await user.click(firstAdvance);
    await waitFor(() => {
      expect(
        screen.getByRole('tab', { name: `Applied (${expectedApplied})` }),
      ).toBeInTheDocument();
    });
  });
});
