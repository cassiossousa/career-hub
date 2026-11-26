import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../test/TestUtils';
import { ApplyQueue } from './ApplyQueue';

describe('ApplyQueue', () => {
  it('lists seeded apply runs', async () => {
    renderWithProviders(<ApplyQueue />);
    expect(
      await screen.findByRole('columnheader', { name: 'Job' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'ATS' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Greenhouse').length).toBeGreaterThan(0);
    expect(screen.getByText('Ready for review')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Needs human')).toBeInTheDocument();
  });

  it('filters runs by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ApplyQueue />);
    await screen.findByText('Submitted');

    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: 'Submitted' }));

    expect(await screen.findAllByText('Submitted')).not.toHaveLength(0);
    expect(screen.queryByText('Ready for review')).not.toBeInTheDocument();
    expect(screen.queryByText('Needs human')).not.toBeInTheDocument();
  });

  it('links each run to its review screen', async () => {
    renderWithProviders(<ApplyQueue />);
    const links = await screen.findAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/apply/1')).toBe(true);
  });
});
