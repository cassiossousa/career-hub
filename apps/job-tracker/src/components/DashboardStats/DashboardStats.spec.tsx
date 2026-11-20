import { fireEvent, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/TestUtils';
import { DashboardStats } from './DashboardStats';

describe('DashboardStats', () => {
  it('renders stat cards from the API', async () => {
    renderWithProviders(<DashboardStats />);
    await waitFor(() => {
      expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    });
    expect(screen.getByText('Jobs This Month')).toBeInTheDocument();
    expect(screen.getByText('Jobs Today')).toBeInTheDocument();
    expect(screen.getByText('Jobs This Week')).toBeInTheDocument();
  });

  it('shows an error state with retry when the request fails', async () => {
    server.use(
      http.get('/api/jobs/stats', () =>
        HttpResponse.json(
          { error: { code: 'UPSTREAM', message: 'Stats unavailable' } },
          { status: 500 },
        ),
      ),
    );
    renderWithProviders(<DashboardStats />);
    expect(await screen.findByText('Stats unavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
  });
});
