import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { seedJobs } from '../../mocks/data';
import { server } from '../../mocks/server';
import { useFilterStore } from '../../store/filterStore';
import {
  expectErrorWithRetry,
  expectJobTitlesRendered,
  mockApiJson,
  renderWithProviders,
} from '../../test/TestUtils';
import { Recommendations } from './Recommendations';

describe('Recommendations', () => {
  beforeEach(() => {
    useFilterStore.getState().resetFilters();
  });

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

  it('sends active store filters to the jobs request', async () => {
    const requestedUrls: string[] = [];
    server.use(
      http.get('/api/jobs', ({ request }) => {
        requestedUrls.push(request.url);
        return HttpResponse.json({
          jobs: seedJobs.slice(0, 5),
          total: seedJobs.length,
        });
      }),
    );
    useFilterStore.getState().setLevel('senior');
    renderWithProviders(<Recommendations />);
    await waitFor(() => {
      expect(requestedUrls.some((url) => url.includes('level=senior'))).toBe(
        true,
      );
    });
  });

  it('shows the empty state when search filters out every recommendation', async () => {
    useFilterStore.getState().setSearch('no-such-job-xyz');
    renderWithProviders(<Recommendations />);
    expect(
      await screen.findByText('No recommended jobs at the moment.'),
    ).toBeInTheDocument();
  });

  it('shows an empty state when there are no matches', async () => {
    mockApiJson('get', '/api/jobs', { jobs: [], total: 0 });
    renderWithProviders(<Recommendations />);
    expect(
      await screen.findByText('No recommended jobs at the moment.'),
    ).toBeInTheDocument();
  });
});
