import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { storageRemoveItem } from '../../app/storage';
import { seedJobs } from '../../mocks/data';
import { useFilterStore } from '../../store/filterStore';
import { renderWithProviders } from '../../test/TestUtils';
import { JobCard } from './JobCard';

function seedJob(index: number) {
  const job = seedJobs[index];
  if (!job) throw new Error(`missing seed job at index ${index}`);
  return job;
}

describe('JobCard', () => {
  beforeEach(() => {
    storageRemoveItem('job-tracker-filters');
    useFilterStore.setState({
      level: undefined,
      area: undefined,
      remoteOnly: false,
    });
  });

  it('renders job title, company and chips', () => {
    renderWithProviders(<JobCard job={seedJob(0)} />);
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Nubank')).toBeInTheDocument();
    expect(screen.getAllByText('Remote').length).toBeGreaterThan(0);
    expect(screen.getByText(/92%/)).toBeInTheDocument();
  });

  it('never renders duplicate chip labels', () => {
    // seedJob(0): location "Remote" collides with the remote toggle.
    // seedJob(2): source "remote" also maps to the "Remote" label.
    for (const index of [0, 2]) {
      const { unmount } = renderWithProviders(<JobCard job={seedJob(index)} />);
      expect(screen.getAllByText('Remote')).toHaveLength(1);
      unmount();
    }
  });

  it('keeps the location chip when it adds information', () => {
    renderWithProviders(<JobCard job={seedJob(1)} />);
    expect(screen.getByText('São Paulo')).toBeInTheDocument();
  });

  it('does not render a remote chip for non-remote jobs', () => {
    renderWithProviders(<JobCard job={seedJob(1)} />);
    expect(screen.queryByText('Remote')).not.toBeInTheDocument();
  });

  it('is keyboard-activatable when clickable', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    renderWithProviders(<JobCard job={seedJob(0)} onClick={onClick} />);
    const action = document.querySelector('.MuiCardActionArea-root');
    if (!(action instanceof HTMLElement)) {
      throw new Error('expected card action area');
    }
    action.focus();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders without action area when not clickable', () => {
    renderWithProviders(<JobCard job={seedJob(1)} />);
    expect(
      document.querySelector('.MuiCardActionArea-root'),
    ).not.toBeInTheDocument();
  });

  it('toggles the level filter from the level chip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobCard job={seedJob(1)} />);

    const chip = screen.getByRole('button', { name: 'Senior' });
    await user.click(chip);
    expect(useFilterStore.getState().level).toBe('senior');

    await user.click(chip);
    expect(useFilterStore.getState().level).toBeUndefined();
  });

  it('toggles the area filter from the area chip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobCard job={seedJob(1)} />);

    await user.click(screen.getByRole('button', { name: 'Fullstack' }));
    expect(useFilterStore.getState().area).toBe('fullstack');
  });

  it('toggles the remote-only filter from the remote chip', async () => {
    const user = userEvent.setup();
    renderWithProviders(<JobCard job={seedJob(0)} />);

    await user.click(screen.getByRole('button', { name: 'Remote' }));
    expect(useFilterStore.getState().remoteOnly).toBe(true);
  });
});
