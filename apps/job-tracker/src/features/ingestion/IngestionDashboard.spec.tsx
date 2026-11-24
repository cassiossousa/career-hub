import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/TestUtils';
import { IngestionDashboard } from './IngestionDashboard';

async function renderWithRuns() {
  renderWithProviders(<IngestionDashboard />);
  await waitFor(() => {
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });
}

describe('IngestionDashboard', () => {
  it('renders jobs-by-source counts and recent runs', async () => {
    renderWithProviders(<IngestionDashboard />);
    expect(await screen.findByText('Jobs by source')).toBeInTheDocument();
    expect(
      await screen.findByText(/per-company career pages/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Sólides/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Succeeded').length).toBeGreaterThan(0);
  });

  it('runs all sources and lists the new runs', async () => {
    const user = userEvent.setup();
    await renderWithRuns();
    const rowsBefore = screen.getAllByRole('row').length;

    await user.click(screen.getByRole('button', { name: /run all sources/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(rowsBefore);
    });
  }, 30000);

  it('filters recent runs by source and clears the filter', async () => {
    const user = userEvent.setup();
    await renderWithRuns();

    await user.click(screen.getByRole('button', { name: /Remote:/ }));

    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(2);
    });
    expect(screen.getByRole('cell', { name: 'Remote' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Remote:/ }));

    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(2);
    });
  });

  it('shows a clearable empty state when a source has no recent runs', async () => {
    const user = userEvent.setup();
    await renderWithRuns();

    await user.click(screen.getByRole('button', { name: /Manual:/ }));

    expect(
      await screen.findByText('No recent runs for Manual.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show all sources' }));

    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });
  });
});
