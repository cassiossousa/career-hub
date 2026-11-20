import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../test/TestUtils';
import { WeeklyGoal } from './WeeklyGoal';

describe('WeeklyGoal', () => {
  it('renders the goal and weekly progress', async () => {
    renderWithProviders(<WeeklyGoal />);
    expect(await screen.findByText('Weekly goal')).toBeInTheDocument();
    expect(screen.getByText(/applications this week/)).toBeInTheDocument();
  }, 30000);

  it('updates the goal when a valid number is entered', async () => {
    renderWithProviders(<WeeklyGoal />);
    const input = await screen.findByLabelText('Edit goal');
    fireEvent.change(input, { target: { value: '5' } });
    expect(
      await screen.findByText(/of 5 applications this week/),
    ).toBeInTheDocument();
  }, 30000);

  it('ignores out-of-range goal values', async () => {
    renderWithProviders(<WeeklyGoal />);
    const input = await screen.findByLabelText('Edit goal');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.change(input, { target: { value: '500' } });
    expect(screen.queryByText(/of 0 applications/)).not.toBeInTheDocument();
    expect(screen.queryByText(/of 500 applications/)).not.toBeInTheDocument();
  }, 30000);
});
