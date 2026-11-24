import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleChip } from './ToggleChip';

describe('ToggleChip', () => {
  it('renders as a pressed-state button and calls onToggle', async () => {
    const onToggle = jest.fn();
    const user = userEvent.setup();
    render(<ToggleChip label="Remote" active={false} onToggle={onToggle} />);

    const chip = screen.getByRole('button', { name: 'Remote' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');

    await user.click(chip);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('marks the active state', () => {
    render(<ToggleChip label="Remote" active onToggle={() => undefined} />);

    expect(screen.getByRole('button', { name: 'Remote' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
