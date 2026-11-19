import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { seedJobs } from '../../mocks/data';
import { renderWithProviders } from '../../test/TestUtils';
import { JobCard } from './JobCard';

function seedJob(index: number) {
  const job = seedJobs[index];
  if (!job) throw new Error(`missing seed job at index ${index}`);
  return job;
}

describe('JobCard', () => {
  it('renders job title, company and chips', () => {
    renderWithProviders(<JobCard job={seedJob(0)} />);
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Nubank')).toBeInTheDocument();
    expect(screen.getAllByText('Remote').length).toBeGreaterThan(0);
    expect(screen.getByText(/92%/)).toBeInTheDocument();
  });

  it('is keyboard-activatable when clickable', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(<JobCard job={seedJob(0)} onClick={onClick} />);
    const action = screen.getByRole('button');
    action.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders without action area when not clickable', () => {
    renderWithProviders(<JobCard job={seedJob(1)} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
