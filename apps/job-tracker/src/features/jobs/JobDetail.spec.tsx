import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/TestUtils';
import { JobDetail } from './JobDetail';

function renderDetail(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/jobs/:id" element={<JobDetail />} />
    </Routes>,
    { route },
  );
}

describe('JobDetail', () => {
  it('renders job details for a valid id', async () => {
    renderDetail('/jobs/1');
    await waitFor(() => {
      expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('shows not-found for an invalid id', () => {
    renderDetail('/jobs/abc');
    expect(screen.getByText('Job not found.')).toBeInTheDocument();
  });

  it('shows the existing application status for tracked jobs', async () => {
    renderDetail('/jobs/1');
    expect(
      await screen.findByText('Applied', {}, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /edit resume/i }),
    ).toBeInTheDocument();
  });

  it('shows an error state when the job request fails', async () => {
    server.use(
      http.get('/api/jobs/:id', () =>
        HttpResponse.json(
          { error: { code: 'UPSTREAM', message: 'Job unavailable' } },
          { status: 500 },
        ),
      ),
    );
    renderDetail('/jobs/1');
    expect(await screen.findByText('Job unavailable')).toBeInTheDocument();
  });

  it('creates an application via mark-as-applied', async () => {
    const user = userEvent.setup();
    // job 4 has no seeded application, so the action buttons are shown
    renderDetail('/jobs/4');
    const button = await screen.findByRole('button', {
      name: 'Mark as applied',
    });
    await user.click(button);
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Mark as applied' }),
    );
    await waitFor(
      () => {
        expect(screen.getByText('Applied')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
