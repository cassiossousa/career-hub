import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/TestUtils';
import { IngestionDashboard } from './IngestionDashboard';

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
    renderWithProviders(<IngestionDashboard />);
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });
    const rowsBefore = screen.getAllByRole('row').length;

    await user.click(screen.getByRole('button', { name: /run all sources/i }));

    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(rowsBefore);
    });
  }, 30000);
});
