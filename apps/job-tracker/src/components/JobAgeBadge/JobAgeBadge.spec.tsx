import { screen } from '@testing-library/react';
import { seedJobs } from '../../mocks/data';
import type { Job } from '../../services/types/job';
import { renderWithProviders } from '../../test/TestUtils';
import { JobAgeBadge } from './JobAgeBadge';

function jobWithPostedAt(postedAt: string | null): Job {
  const base = seedJobs[0];
  if (!base) throw new Error('missing seed job');
  return { ...base, postedAt };
}

describe('JobAgeBadge', () => {
  it('renders nothing when postedAt is missing', () => {
    const { container } = renderWithProviders(
      <JobAgeBadge job={jobWithPostedAt(null)} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows Today for a job posted today', () => {
    renderWithProviders(
      <JobAgeBadge job={jobWithPostedAt(new Date().toISOString())} />,
    );
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('shows days ago for recent jobs', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    renderWithProviders(<JobAgeBadge job={jobWithPostedAt(threeDaysAgo)} />);
    expect(screen.getByText('3d ago')).toBeInTheDocument();
  });

  it('shows weeks ago for jobs older than a week', () => {
    const twentyDaysAgo = new Date(Date.now() - 20 * 86400000).toISOString();
    renderWithProviders(<JobAgeBadge job={jobWithPostedAt(twentyDaysAgo)} />);
    expect(screen.getByText('2w ago')).toBeInTheDocument();
  });
});
