import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeModeToggle } from './ThemeModeToggle';

describe('ThemeModeToggle', () => {
  it('reflects the dark mode in aria-pressed', () => {
    render(
      <ThemeModeToggle
        mode="dark"
        onToggle={() => {}}
        ariaLabel="Toggle theme"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Toggle theme' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('reflects the light mode in aria-pressed', () => {
    render(
      <ThemeModeToggle
        mode="light"
        onToggle={() => {}}
        ariaLabel="Toggle theme"
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Toggle theme' }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(
      <ThemeModeToggle
        mode="light"
        onToggle={onToggle}
        ariaLabel="Toggle theme"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
