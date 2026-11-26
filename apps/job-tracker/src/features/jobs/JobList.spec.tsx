import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, HttpResponse, http } from 'msw';
import { server } from '../../mocks/server';
import { useFilterStore } from '../../store/filterStore';
import {
  expectErrorWithRetry,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { JobList } from './JobList';

async function renderJobListLoaded() {
  renderWithProviders(<JobList />);
  await waitFor(() => {
    expect(screen.getByText(/Job openings \(\d+\)/)).toBeInTheDocument();
  });
}

describe('JobList', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

  it('renders jobs from the API', async () => {
    await renderJobListLoaded();
    expect(screen.getAllByText(/Frontend|Backend/).length).toBeGreaterThan(0);
  });

  it('shows filtered empty state with clear-filters action', async () => {
    useFilterStore.getState().setLevel('intern');
    const user = userEvent.setup();
    renderWithProviders(<JobList />);
    // intern jobs exist in seed, so force an impossible combo instead
    useFilterStore.getState().setLocation('Atlantis');
    await waitFor(() => {
      expect(screen.getByText(/No jobs match/i)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    await waitFor(() => {
      expect(screen.getByText(/Job openings \(\d+\)/)).toBeInTheDocument();
    });
  });

  it('filters the list when a job card chip is clicked', async () => {
    const user = userEvent.setup();
    await renderJobListLoaded();
    const before = screen.getByText(/Job openings \(\d+\)/).textContent;

    const seniorChip = screen.getAllByRole('button', { name: 'Senior' })[0];
    if (!seniorChip) throw new Error('expected a senior level chip');
    await user.click(seniorChip);

    await waitFor(() => {
      expect(useFilterStore.getState().level).toBe('senior');
    });
    await waitFor(() => {
      expect(screen.getByText(/Job openings \(\d+\)/).textContent).not.toBe(
        before,
      );
    });
  }, 30000);

  it('navigates to job detail when a card is clicked', async () => {
    const user = userEvent.setup();
    await renderJobListLoaded();
    const cards = screen.getAllByRole('button');
    const jobCard = cards.find((el) => el.textContent.includes('Frontend'));
    if (!jobCard) throw new Error('expected a job card button');
    await user.click(jobCard);
  }, 30000);

  it('shows an error state when the request fails', async () => {
    mockApiJson(
      'get',
      '/api/jobs',
      { error: { code: 'UPSTREAM', message: 'Jobs unavailable' } },
      500,
    );
    renderWithProviders(<JobList />);
    await expectErrorWithRetry('Jobs unavailable');
  });

  it('shows the API error message on rate-limit (429) responses', async () => {
    mockApiJson(
      'get',
      '/api/jobs',
      { error: { code: 'rate_limited', message: 'Too many requests' } },
      429,
    );
    renderWithProviders(<JobList />);
    await expectErrorWithRetry('Too many requests');
  });

  it('shows the unreachable error state on network failure', async () => {
    server.use(http.get('/api/jobs', () => HttpResponse.error()));
    renderWithProviders(<JobList />);
    expect(
      await screen.findByText(/Could not reach the API server/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows a loading state while the request is in flight', async () => {
    server.use(
      http.get('/api/jobs', async () => {
        await delay(300);
        return HttpResponse.json({ jobs: [], total: 0 });
      }),
    );
    renderWithProviders(<JobList />);
    expect(await screen.findByLabelText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('No jobs found.')).toBeInTheDocument();
    });
  });

  it('surfaces an error state when the API returns malformed JSON', async () => {
    server.use(
      http.get(
        '/api/jobs',
        () =>
          new HttpResponse('{not valid json', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    );
    renderWithProviders(<JobList />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
