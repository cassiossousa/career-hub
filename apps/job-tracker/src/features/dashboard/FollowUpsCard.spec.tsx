import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { server } from '../../mocks/server';
import type { Application } from '../../services/types/application';
import { renderWithProviders } from '../../test/TestUtils';
import { FollowUpsCard } from './FollowUpsCard';

const DUE_APPLICATION: Application = {
  id: 42,
  jobId: 1,
  portfolioId: 1,
  status: 'applied',
  notes: null,
  appliedAt: '2025-01-01T00:00:00.000Z',
  statusChangedAt: '2025-01-01T00:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
  followUpAt: '2020-01-01T00:00:00.000Z',
  tags: [],
};

function mockFollowUps(applications: Application[], total?: number) {
  server.use(
    http.get('/api/applications', ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('followUp') !== 'due') {
        return HttpResponse.json({ applications: [], total: 0 });
      }
      return HttpResponse.json({
        applications,
        total: total ?? applications.length,
      });
    }),
  );
}

describe('FollowUpsCard', () => {
  it('shows the empty state when nothing is due', async () => {
    mockFollowUps([]);
    renderWithProviders(<FollowUpsCard />);
    expect(
      await screen.findByText('No follow-ups due. Nice and quiet.'),
    ).toBeInTheDocument();
  });

  it('lists due applications with job title, company, and detail link', async () => {
    mockFollowUps([DUE_APPLICATION], 7);
    renderWithProviders(<FollowUpsCard />);
    const link = await screen.findByRole('link', {
      name: 'Frontend Developer',
    });
    expect(link).toHaveAttribute('href', '/applications/42');
    expect(await screen.findByText('Vetta Bank')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'View all applications' }),
      ).toHaveAttribute('href', '/applications');
    });
  });
});
